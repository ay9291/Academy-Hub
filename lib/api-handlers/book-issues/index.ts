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
      const { bookId, studentId, status } = req.query;
      const issues = await storage.getBookIssues({
        bookId: bookId as string,
        studentId: studentId as string,
        status: status as string,
      });
      return res.json(issues);
    }

    if (req.method === "POST") {
      const issue = await storage.createBookIssue(req.body);
      return res.status(201).json(issue);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Book issues error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
