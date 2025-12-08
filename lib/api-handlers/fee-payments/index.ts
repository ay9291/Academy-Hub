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
      const { studentId, feeStructureId } = req.query;
      const payments = await storage.getFeePayments({
        studentId: studentId as string,
        feeStructureId: feeStructureId as string,
      });
      return res.json(payments);
    }

    if (req.method === "POST") {
      const data = { ...req.body, recordedBy: user.userId };
      const payment = await storage.createFeePayment(data);
      return res.status(201).json(payment);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Fee payments error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
