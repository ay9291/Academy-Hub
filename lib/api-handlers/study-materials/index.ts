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
      const { subjectId, academicCategory } = req.query;
      const materials = await storage.getStudyMaterials({
        subjectId: subjectId as string,
        academicCategory: academicCategory as string,
      });
      return res.json(materials);
    }

    if (req.method === "POST") {
      const data = { ...req.body, uploadedBy: user.userId };
      const material = await storage.createStudyMaterial(data);
      return res.status(201).json(material);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Study materials error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
