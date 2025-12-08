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
    return res.status(400).json({ message: "Invalid subject ID" });
  }

  try {
    if (req.method === "GET") {
      const subject = await storage.getSubject(id);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      return res.json(subject);
    }

    if (req.method === "PATCH") {
      const subject = await storage.updateSubject(id, req.body);
      if (!subject) return res.status(404).json({ message: "Subject not found" });
      return res.json(subject);
    }

    if (req.method === "DELETE") {
      await storage.deleteSubject(id);
      return res.status(204).end();
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Subject error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
