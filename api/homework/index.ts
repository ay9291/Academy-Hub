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
      const { batchId, teacherId } = req.query;
      const homework = await storage.getHomework({
        batchId: batchId as string,
        teacherId: teacherId as string,
      });
      return res.json(homework);
    }

    if (req.method === "POST") {
      const homework = await storage.createHomework(req.body);
      return res.status(201).json(homework);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Homework error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
