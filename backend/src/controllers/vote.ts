import { Request, Response } from 'express';
import pool from '../config/db';

export async function getOptions(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT id, name AS "name", party, description FROM candidates');
    res.json(result.rows);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function postVote(req: Request, res: Response) {
  const { candidateId } = req.body;
  const userId = req.user!.id;

  if (!candidateId) {
    return res.status(400).json({ message: 'Missing candidateId' });
  }

  try {
    await pool.query(
      'INSERT INTO votes (id, user_id, candidate_id, created_at) VALUES (uuid_generate_v4(), $1, $2, NOW())',
      [userId, candidateId]
    );
    res.json({ message: 'Vote submitted' });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'You have already voted' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid candidate' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getVote(req: Request, res: Response) {
  const userId = req.user!.id;
  try {
    const result = await pool.query('SELECT candidate_id AS "candidateId" FROM votes WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.json({ candidateId: null });
    }
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getResults(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT 
        c.id AS candidate_id,
        c.name AS candidate_name,
        c.party AS candidate_party,
        COUNT(v.id) AS vote_count
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id
      GROUP BY c.id
      ORDER BY vote_count DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
