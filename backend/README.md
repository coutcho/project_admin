# Secure Vote Backend

## Setup
1. Install dependencies: `npm install`
2. Set environment variables in `.env`:
   - DB_USER=your_pg_user
   - DB_HOST=your_pg_host (primary for replication)
   - DB_NAME=your_db_name
   - DB_PASSWORD=your_pg_password
   - DB_PORT=5432
   - JWT_SECRET=your_jwt_secret
3. Run dev: `npm run dev`
4. Build and start: `npm run build && npm start`

## Database Schema
Run the following SQL in PostgreSQL:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  party VARCHAR(255),
  description TEXT
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL
);
```

## Database Replication Setup

On primary PostgreSQL server:
Edit postgresql.conf:
```text
wal_level = replica
max_wal_senders = 3
wal_keep_size = 64
```
Edit pg_hba.conf to allow replication:
```text
host replication repuser replica_host/32 md5
```
Create replication user:
```sql
CREATE USER repuser WITH REPLICATION ENCRYPTED PASSWORD 'rep_password';
```
Restart PostgreSQL.

On replica server:
Stop PostgreSQL if running.
Run: `pg_basebackup -h primary_host -D /var/lib/postgresql/data -U repuser -P -v -R`
Start PostgreSQL on replica.

Failover mechanism:
To promote replica: On replica, run `pg_ctl promote -D /var/lib/postgresql/data`
Update the DB_HOST in backend .env files to the new primary IP/hostname and restart backends.

Backend reconnect after failover:
The pg library's Pool automatically handles reconnection attempts if the connection is lost.
For high availability, consider using a PostgreSQL proxy like PgBouncer or HAProxy in front of the cluster to automatically route to the current primary.

## Load Balancer Setup (NGINX)
Install NGINX and use the following configuration in /etc/nginx/nginx.conf (or site config):
```text
http {
  upstream backend {
    server backend1:3000;
    server backend2:3000;
  }

  server {
    listen 80;

    location /api/ {
      proxy_pass http://backend;
      health_check uri=/health interval=5 fails=3 passes=2;
    }

    location / {
      root /path/to/frontend/build;  # Replace with actual path to React build
      index index.html;
      try_files $uri /index.html;
    }
  }
}
```

Reload NGINX: `nginx -s reload`
Health checks use `/health` endpoint to ensure backend instances are healthy.

## Production Deployment Instructions

Run 2 backend servers:
On backend1 host: Set .env, run `npm run build && npm start` (listens on port 3000).
On backend2 host: Same as above.
Use PM2 for process management: `pm2 start npm --name "backend" -- run start`

Connect to load balancer:
Set up NGINX on a separate host or one of the backends.
Update upstream servers in NGINX config to actual hostnames/IPs (e.g., backend1.example.com:3000).
Frontend build should be placed in the root path specified in NGINX.
Traffic to `/api/*` is proxied to backends; static frontend served from `/`.

Connect backend to replicated PostgreSQL cluster:
Set DB_HOST in .env to the primary server's hostname/IP.
After failover, update DB_HOST to the promoted replica and restart backend instances.
For automatic failover, use a floating IP/VIP managed by tools like Keepalived, or a proxy like PgPool-II.

Verify fault tolerance:
Load test with tools like Apache Benchmark: `ab -n 1000 -c 10 http://loadbalancer/api/options`
Kill one backend: Check if requests still succeed (NGINX health check removes failed node).
Simulate DB failover: Stop primary, promote replica, update DB_HOST, restart backends, verify API works.
Check logs for reconnection attempts in backend console.

Seed candidates initially:
Run on primary DB:
```sql
INSERT INTO candidates (name, party, description) VALUES
('John Doe', 'Progressive Alliance', 'Advocate for social justice and economic reform.'),
('Jane Smith', 'Green Future', 'Focused on environmental sustainability and green energy.'),
('Alex Johnson', 'Unity Party', 'Promoting unity and bipartisan solutions.'),
('Chris Lee', 'Conservative Coalition', 'Emphasizing traditional values and fiscal responsibility.');
```
