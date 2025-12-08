import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { sendOtpEmail, generateOtp } from "../_lib/email";
import { corsHeaders } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { registrationNumber } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    let actualRegNumber = registrationNumber;
    if (registrationNumber.endsWith("p") || registrationNumber.endsWith("P")) {
      actualRegNumber = registrationNumber.slice(0, -1);
    }

    const user = await storage.getUserByRegistrationNumber(actualRegNumber);

    if (!user || !user.email) {
      return res.status(404).json({ message: "User not found or email not set" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await storage.createOtpCode({
      registrationNumber,
      code: otp,
      expiresAt,
    });

    await sendOtpEmail(user.email, user.firstName || "User", otp);

    return res.json({ message: "OTP sent to your registered email" });
  } catch (error) {
    console.error("OTP request error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
}
