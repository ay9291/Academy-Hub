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
      const { studentId } = req.query;
      const feeStructures = await storage.getFeeStructures(studentId as string);
      return res.json(feeStructures);
    }

    if (req.method === "POST") {
      const feeStructure = await storage.createFeeStructure(req.body);
      return res.status(201).json(feeStructure);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Fee structures error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
