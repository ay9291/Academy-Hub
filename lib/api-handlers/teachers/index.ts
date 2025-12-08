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
      const teachers = await storage.getTeachers();
      return res.json(teachers);
    }

    if (req.method === "POST") {
      const teacher = await storage.createTeacher(req.body);
      return res.status(201).json(teacher);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Teachers error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
