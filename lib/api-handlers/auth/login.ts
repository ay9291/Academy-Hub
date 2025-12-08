import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
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
    const { registrationNumber, password } = req.body;

    if (!registrationNumber || !password) {
      return res.status(400).json({ message: "Registration number and password are required" });
    }

    let actualRegNumber = registrationNumber;
    let isParentLogin = false;

    if (registrationNumber.endsWith("p") || registrationNumber.endsWith("P")) {
      actualRegNumber = registrationNumber.slice(0, -1);
      isParentLogin = true;
    }

    const user = await storage.getUserByRegistrationNumber(actualRegNumber);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (isParentLogin && user.role !== "student") {
      return res.status(401).json({ message: "Invalid parent login" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: "Password not set. Please use OTP login or contact admin." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}
