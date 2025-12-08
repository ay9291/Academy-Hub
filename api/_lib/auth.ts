import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT authentication");
}
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface TokenPayload {
  userId: string;
  userRole: string;
  exp: number;
  iat: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString();
}

function createSignature(header: string, payload: string): string {
  const data = `${header}.${payload}`;
  return crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
}

export function createAccessToken(userId: string, userRole: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId,
      userRole,
      iat: Date.now(),
      exp: Date.now() + ACCESS_TOKEN_EXPIRY,
    })
  );
  const signature = createSignature(header, payload);
  return `${header}.${payload}.${signature}`;
}

export function createRefreshToken(userId: string, userRole: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId,
      userRole,
      type: "refresh",
      iat: Date.now(),
      exp: Date.now() + REFRESH_TOKEN_EXPIRY,
    })
  );
  const signature = createSignature(header, payload);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = createSignature(header, payload);

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(base64UrlDecode(payload)) as TokenPayload;

    if (decoded.exp < Date.now()) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookies = req.cookies;
  if (cookies?.access_token) {
    return cookies.access_token;
  }

  return null;
}

export function getRefreshTokenFromRequest(req: VercelRequest): string | null {
  const cookies = req.cookies;
  return cookies?.refresh_token || null;
}

export function setAuthCookies(
  res: VercelResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = `HttpOnly; ${isProduction ? "Secure; " : ""}SameSite=Lax; Path=/`;

  res.setHeader("Set-Cookie", [
    `access_token=${accessToken}; Max-Age=${ACCESS_TOKEN_EXPIRY / 1000}; ${cookieOptions}`,
    `refresh_token=${refreshToken}; Max-Age=${REFRESH_TOKEN_EXPIRY / 1000}; ${cookieOptions}`,
  ]);
}

export function clearAuthCookies(res: VercelResponse): void {
  res.setHeader("Set-Cookie", [
    `access_token=; Max-Age=0; Path=/; HttpOnly`,
    `refresh_token=; Max-Age=0; Path=/; HttpOnly`,
  ]);
}

export function withAuth(
  handler: (
    req: VercelRequest,
    res: VercelResponse,
    user: TokenPayload
  ) => Promise<void>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    return handler(req, res, payload);
  };
}

export function corsHeaders(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );
}
