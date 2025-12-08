import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { storage } from "../_lib/storage";
import { sendPasswordResetEmail } from "../_lib/email";
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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.json({ message: "If your email is registered, you will receive a password reset link" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.createPasswordResetToken({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.REPL_SLUG
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : "http://localhost:5000";

    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email!, user.firstName || "User", resetLink);

    return res.json({ message: "If your email is registered, you will receive a password reset link" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Failed to process request" });
  }
}
