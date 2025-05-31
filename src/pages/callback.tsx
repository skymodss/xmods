// pages/api/auth/jwt-login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { jwtDecode } from 'jwt-decode';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token not provided' });
  }

  try {
    const user = jwtDecode(token);
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
