import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';

export async function login(req: Request, res: Response) {
  const { email, password, action = 'login' } = req.body; // Default to 'login' for frontend compatibility

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    if (action === 'signup') {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES (uuid_generate_v4(), $1, $2, NOW()) RETURNING id, email',
        [email, hash]
      );
      const user = result.rows[0];
      const token = signToken(user.id);
      return res.json({ token, user });
    } else if (action === 'login') {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user.id);
      return res.json({ token, user: { id: user.id, email: user.email } });
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getUser(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
