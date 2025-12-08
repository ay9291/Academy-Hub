import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getRefreshTokenFromRequest,
  verifyToken,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  corsHeaders,
} from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const payload = verifyToken(refreshToken);

    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = createAccessToken(payload.userId, payload.userRole);
    const newRefreshToken = createRefreshToken(payload.userId, payload.userRole);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({ message: "Token refresh failed" });
  }
}
