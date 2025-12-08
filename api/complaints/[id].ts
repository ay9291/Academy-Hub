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
    return res.status(400).json({ message: "Invalid complaint ID" });
  }

  try {
    if (req.method === "GET") {
      const complaint = await storage.getComplaint(id);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      return res.json(complaint);
    }

    if (req.method === "PATCH") {
      const complaint = await storage.updateComplaint(id, req.body);
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
      return res.json(complaint);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Complaint error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
