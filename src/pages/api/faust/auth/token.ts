import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

// OVDJE STAVI ISTI SECRET KAO NA WORDPRESS BACKENDU!
const SECRET = "OVDJE_TVOJ_WP_JWT_SECRET"; // ili process.env.JWT_SECRET

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.wp_jwt;
  if (!token) {
    return res.status(401).json({ error: "No token in cookie" });
  }

  try {
    // Dekodiraj token i izvuci korisničke podatke
    const decoded = jwt.verify(token, SECRET) as any;
    // Podaci o korisniku su obično u decoded.data.user
    const user = decoded?.data?.user;
    return res.status(200).json({ accessToken: token, user });
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
