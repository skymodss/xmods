import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

const SECRET = "8CCA8C456C24EDF1"; // ili process.env.JWT_SECRET

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.wp_jwt;

  // 1. Prvo, probaj JWT login (Google)
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET) as any;
      const user = decoded?.data?.user;
      return res.status(200).json({ accessToken: token, user, mode: "google" });
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  }

  // 2. Ako nema JWT tokena, pokušaj WP classic sesiju (ako je moguće)
  // Napomena: možeš pozvati WP REST API /wp-json/wp/v2/users/me ako cookie postoji i imaš isti domen
  try {
    // Proxy request ka WP REST API users/me
    const wpRes = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
      headers: {
        cookie: req.headers.cookie || "",
      },
      credentials: "include",
    });
    if (wpRes.ok) {
      const user = await wpRes.json();
      return res.status(200).json({ user, mode: "classic" });
    }
  } catch (err) {
    // fallback
  }

  // 3. Ako ništa ne uspe, nije autentifikovan
  return res.status(401).json({ error: "No token or session" });
}
