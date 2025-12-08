import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { withAuth, corsHeaders, TokenPayload } from "../_lib/auth";

async function handler(req: VercelRequest, res: VercelResponse, user: TokenPayload) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const submission = await storage.createHomeworkSubmission(req.body);
    return res.status(201).json(submission);
  } catch (error) {
    console.error("Homework submissions error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
