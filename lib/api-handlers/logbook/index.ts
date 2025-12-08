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
      const { batchId, teacherId, date } = req.query;
      const entries = await storage.getLogbookEntries({
        batchId: batchId as string,
        teacherId: teacherId as string,
        date: date as string,
      });
      return res.json(entries);
    }

    if (req.method === "POST") {
      const entry = await storage.createLogbookEntry(req.body);
      return res.status(201).json(entry);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Logbook error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
