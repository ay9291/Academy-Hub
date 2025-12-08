import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_lib/storage";
import { withAuth, corsHeaders, TokenPayload } from "../_lib/auth";

async function handler(req: VercelRequest, res: VercelResponse, user: TokenPayload) {
  corsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid item ID" });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const item = await storage.updateLostAndFoundItem(id, req.body);
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json(item);
  } catch (error) {
    console.error("Lost and found error:", error);
    return res.status(500).json({ message: "Operation failed" });
  }
}

export default withAuth(handler);
