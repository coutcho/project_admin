import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export function signToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: '1h' });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, SECRET) as { userId: string };
}
