import type { NextApiRequest, NextApiResponse } from "next";

// Ovaj primer uzima token iz localStorage nije moguć iz server-side, ali možeš iz cookie-ja ili iz Authorization headera
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Najčešći način: token dolazi iz cookie-ja
  const token = req.cookies.wp_jwt || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Po želji: validacija tokena, provera sa WP serverom, itd.

  res.status(200).json({ accessToken: token });
}
