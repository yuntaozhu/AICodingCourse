import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { users } from "../../db/schema.ts";

const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString("hex");

export function getSessionSigningSecret(): string {
  const configured = process.env.SESSION_SECRET?.trim();
  return configured && configured.length >= 16 ? configured : EPHEMERAL_FALLBACK_SECRET;
}

export function signToken(payload: { userId: number; email: string }): string {
  const secret = getSessionSigningSecret();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const secret = getSessionSigningSecret();
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature, "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: number;
      email?: string;
      exp?: number;
    };
    if (!parsed.userId || !parsed.email || (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000))) {
      return null;
    }

    // Verify user exists
    const [dbUser] = await db.select().from(users).where(eq(users.id, parsed.userId)).limit(1);
    if (!dbUser) return null;

    return { userId: dbUser.id, email: dbUser.email };
  } catch {
    return null;
  }
}
