import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { withAuth, corsHeaders, TokenPayload } from "../_lib/auth";

async function handler(req: VercelRequest, res: VercelResponse, user: TokenPayload) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid submission ID" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const submission = await storage.updateHomeworkSubmission(id, req.body);
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    return res.json(submission);
  } catch (error) {
    console.error("Homework submission error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
