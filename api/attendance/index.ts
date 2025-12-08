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
      const { batchId, studentId, date } = req.query;
      const attendance = await storage.getAttendance({
        batchId: batchId as string,
        studentId: studentId as string,
        date: date as string,
      });
      return res.json(attendance);
    }

    if (req.method === "POST") {
      const data = { ...req.body, markedBy: user.userId };
      const record = await storage.createAttendance(data);
      return res.status(201).json(record);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Attendance error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
