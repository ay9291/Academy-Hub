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
      if (userData?.role === "parent") {
        const students = await storage.getStudentsByParent(userData.id);
        return res.json(students);
      }
      const students = await storage.getStudents();
      return res.json(students);
    }

    if (req.method === "POST") {
      const student = await storage.createStudent(req.body);
      return res.status(201).json(student);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Students error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
