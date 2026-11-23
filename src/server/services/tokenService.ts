import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { users } from "../../db/schema.ts";

const SESSION_SECRET = process.env.SESSION_SECRET || "aicoding-course-vercel-secure-fallback-secret";

export function signToken(payload: { userId: number; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 3600; // 30 days
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;

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
