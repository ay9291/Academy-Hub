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
      const certificates = await storage.getCertificates(studentId as string);
      return res.json(certificates);
    }

    if (req.method === "POST") {
      const data = { ...req.body, generatedBy: user.userId };
      const certificate = await storage.createCertificate(data);
      return res.status(201).json(certificate);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Certificates error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
