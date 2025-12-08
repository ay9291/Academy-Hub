import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { createAccessToken, createRefreshToken, setAuthCookies, corsHeaders } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { registrationNumber, otp } = req.body;

    if (!registrationNumber || !otp) {
      return res.status(400).json({ message: "Registration number and OTP are required" });
    }

    let actualRegNumber = registrationNumber;
    let isParentLogin = false;

    if (registrationNumber.endsWith("p") || registrationNumber.endsWith("P")) {
      actualRegNumber = registrationNumber.slice(0, -1);
      isParentLogin = true;
    }

    const validOtp = await storage.getValidOtpCode(registrationNumber, otp);

    if (!validOtp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const user = await storage.getUserByRegistrationNumber(actualRegNumber);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (isParentLogin && user.role !== "student") {
      return res.status(401).json({ message: "Invalid parent login" });
    }

    await storage.markOtpAsUsed(validOtp.id);

    const userRole = isParentLogin ? "parent" : user.role || "student";
    const accessToken = createAccessToken(user.id, userRole);
    const refreshToken = createRefreshToken(user.id, userRole);

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: userRole,
      username: user.username,
      registrationNumber: isParentLogin ? registrationNumber : actualRegNumber,
      profileImageUrl: user.profileImageUrl,
      accessToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
}
