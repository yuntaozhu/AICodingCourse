import crypto from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { emailOtpChallenges } from "../../db/schema.ts";
import { getOrCreateUser } from "../../db/users.ts";
import { findUserByEmail } from "../auth.ts";
import { getSessionSigningSecret, signToken } from "./tokenService.ts";

export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export function normalizeEmailAddress(raw: string): string {
  return raw.trim().toLowerCase();
}

export function hashEmailOtpCode(email: string, code: string, customSalt?: string): string {
  const normalizedEmail = normalizeEmailAddress(email);
  const salt = customSalt || crypto.randomBytes(16).toString("hex");
  const digest = crypto
    .createHmac("sha256", getSessionSigningSecret())
    .update(`${normalizedEmail}:${salt}:${code.trim()}`)
    .digest("hex");
  return `${salt}:${digest}`;
}

export function verifyEmailOtpHash(email: string, code: string, storedCodeHash: string): boolean {
  const sepIdx = storedCodeHash.indexOf(":");
  if (sepIdx <= 0) return false;
  const salt = storedCodeHash.slice(0, sepIdx);
  const expectedStored = hashEmailOtpCode(email, code, salt);
  const actualBuf = Buffer.from(storedCodeHash, "utf8");
  const expectedBuf = Buffer.from(expectedStored, "utf8");
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function isOtpCooldownActive(
  lastCreatedAt: Date,
  now = new Date(),
  cooldownSeconds = OTP_RESEND_COOLDOWN_SECONDS
): { active: boolean; retryAfterSeconds: number } {
  const elapsedMs = now.getTime() - lastCreatedAt.getTime();
  const cooldownMs = cooldownSeconds * 1000;
  if (elapsedMs < cooldownMs) {
    return {
      active: true,
      retryAfterSeconds: Math.max(1, Math.ceil((cooldownMs - elapsedMs) / 1000)),
    };
  }
  return { active: false, retryAfterSeconds: 0 };
}

function isDevPreviewAllowed(): boolean {
  if (process.env.ALLOW_DEV_OTP_PREVIEW === "true") return true;
  return process.env.NODE_ENV !== "production";
}

async function sendOtpEmailViaResend(email: string, code: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY 未配置" };
  }
  const fromAddress = process.env.EMAIL_FROM?.trim() || "AICodingCourse <onboarding@resend.dev>";
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: `【AICodingCourse】登录验证码：${code}`,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0b0f19;color:#e2e8f0;border-radius:12px;">
          <h2 style="margin:0 0 12px;color:#4cddec;">AICodingCourse 邮箱安全登录</h2>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">您正在登录 AI Coding 确定性研发学院工作台，6 位一次性验证码如下（10 分钟内有效，请勿泄露给他人）：</p>
          <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:14px 20px;background:#111827;border:1px solid #334155;border-radius:8px;text-align:center;color:#ffffff;">${code}</div>
          <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">如非本人操作，请直接忽略此邮件。</p>
        </div>`,
        text: `AICodingCourse 登录验证码：${code}（10 分钟内有效，请勿泄露）。如非本人操作请忽略。`,
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      console.error("[emailOtpService] Resend API failed:", resp.status, detail);
      return { ok: false, error: "邮件发送服务暂时不可用，请稍后重试。" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[emailOtpService] Resend fetch error:", err);
    return { ok: false, error: "邮件发送网络异常，请稍后重试。" };
  }
}

export async function requestEmailOtp(rawEmail: string) {
  const email = normalizeEmailAddress(rawEmail);
  const now = new Date();

  const [latest] = await db
    .select()
    .from(emailOtpChallenges)
    .where(and(eq(emailOtpChallenges.email, email), isNull(emailOtpChallenges.consumedAt)))
    .orderBy(desc(emailOtpChallenges.createdAt))
    .limit(1);

  if (latest) {
    const cooldown = isOtpCooldownActive(latest.createdAt, now);
    if (cooldown.active) {
      return {
        ok: false as const,
        status: 429,
        retryAfterSeconds: cooldown.retryAfterSeconds,
        error: `验证码发送过于频繁，请 ${cooldown.retryAfterSeconds} 秒后再试。`,
      };
    }
  }

  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  if (!hasResend && !isDevPreviewAllowed()) {
    return {
      ok: false as const,
      status: 503,
      error: "邮件验证码服务尚未配置（请管理员配置 RESEND_API_KEY 与 EMAIL_FROM 环境变量）。",
    };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = hashEmailOtpCode(email, code);
  const expiresAt = new Date(now.getTime() + OTP_TTL_SECONDS * 1000);

  const [challenge] = await db
    .insert(emailOtpChallenges)
    .values({
      email,
      codeHash,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
    })
    .returning();

  if (hasResend) {
    const sent = await sendOtpEmailViaResend(email, code);
    if (!sent.ok) {
      await db
        .update(emailOtpChallenges)
        .set({ consumedAt: new Date() })
        .where(eq(emailOtpChallenges.id, challenge.id));
      return {
        ok: false as const,
        status: 502,
        error: "error" in sent ? sent.error : "邮件发送失败，请稍后重试。",
      };
    }
    return {
      ok: true as const,
      deliveryMode: "email" as const,
      expiresInSeconds: OTP_TTL_SECONDS,
      cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  console.info(`[DEV OTP PREVIEW] email=${email} code=${code}`);
  return {
    ok: true as const,
    deliveryMode: "dev_preview" as const,
    expiresInSeconds: OTP_TTL_SECONDS,
    cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    devPreviewCode: code,
  };
}

export async function verifyEmailOtpAndLogin(rawEmail: string, rawCode: string) {
  const email = normalizeEmailAddress(rawEmail);
  const code = rawCode.trim();
  const now = new Date();

  const [challenge] = await db
    .select()
    .from(emailOtpChallenges)
    .where(and(eq(emailOtpChallenges.email, email), isNull(emailOtpChallenges.consumedAt)))
    .orderBy(desc(emailOtpChallenges.createdAt))
    .limit(1);

  if (!challenge) {
    return {
      ok: false as const,
      status: 400,
      error: "请先获取邮箱验证码后再登录。",
    };
  }

  if (challenge.expiresAt.getTime() <= now.getTime()) {
    return {
      ok: false as const,
      status: 400,
      error: "验证码已过期，请重新发送。",
    };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    return {
      ok: false as const,
      status: 429,
      error: "验证码错误次数过多，请等待冷却后重新获取验证码。",
    };
  }

  const matched = verifyEmailOtpHash(email, code, challenge.codeHash);
  if (!matched) {
    const nextAttempts = challenge.attempts + 1;
    await db
      .update(emailOtpChallenges)
      .set({ attempts: nextAttempts })
      .where(eq(emailOtpChallenges.id, challenge.id));
    const remaining = Math.max(0, challenge.maxAttempts - nextAttempts);
    return {
      ok: false as const,
      status: remaining === 0 ? 429 : 400,
      error:
        remaining > 0
          ? `验证码不正确，还可尝试 ${remaining} 次。`
          : "验证码错误次数过多，请重新获取验证码。",
    };
  }

  const consumed = await db
    .update(emailOtpChallenges)
    .set({ consumedAt: now })
    .where(and(eq(emailOtpChallenges.id, challenge.id), isNull(emailOtpChallenges.consumedAt)))
    .returning();

  if (consumed.length === 0) {
    return {
      ok: false as const,
      status: 400,
      error: "该验证码已被使用，请重新获取。",
    };
  }

  const existing = await findUserByEmail(email);
  const dbUser = await getOrCreateUser({
    uid: existing?.uid || `email-${email}`,
    email,
    displayName: existing?.displayName || email.split("@")[0] || "学员",
    avatarUrl: existing?.avatarUrl || "",
  });

  const token = signToken({ userId: dbUser.id, email: dbUser.email });
  return {
    ok: true as const,
    token,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      avatarUrl: dbUser.avatarUrl,
    },
  };
}
