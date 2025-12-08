import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { withAuth, corsHeaders, TokenPayload } from "../_lib/auth";

async function handler(req: VercelRequest, res: VercelResponse, user: TokenPayload) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const userData = await storage.getUser(user.userId);
      const { status } = req.query;
      let filters: { raisedBy?: string; status?: string } = {};

      if (userData?.role === "parent" || userData?.role === "student") {
        filters.raisedBy = userData.id;
      }
      if (status) filters.status = status as string;

      const complaints = await storage.getComplaints(filters);
      return res.json(complaints);
    }

    if (req.method === "POST") {
      const data = { ...req.body, raisedBy: user.userId };
      const complaint = await storage.createComplaint(data);
      return res.status(201).json(complaint);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Complaints error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
