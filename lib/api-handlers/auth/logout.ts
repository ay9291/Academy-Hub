import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearAuthCookies, corsHeaders } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  clearAuthCookies(res);
  return res.json({ message: "Logged out successfully" });
}
