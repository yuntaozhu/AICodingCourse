import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { cohortInstructors, entitlements, userRoles, users } from "../db/schema.ts";
import { getOrCreateUser, getUserRoles } from "../db/users.ts";
import { getAdminAuth } from "../lib/firebase-admin.ts";
import { resolveUserEntitlementSnapshot } from "./services/entitlementService.ts";
import { verifyToken } from "./services/tokenService.ts";

export type AuthMethod = "email_otp" | "firebase";

export interface AuthContext {
  user: {
    id: number;
    uid: string;
    email: string;
    displayName: string;
    avatarUrl: string;
  };
  authMethod: AuthMethod;
  roles: string[];
  isAdmin: boolean;
  isInstructorOrTa: boolean;
  assignedCohortIds: number[];
}

export interface AuthedRequest extends Request {
  authContext?: AuthContext;
}

export async function resolveAuthFromHeader(
  authHeader: string | undefined
): Promise<AuthContext | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  let email = "";
  let uid = "";
  let displayName = "";
  let avatarUrl = "";
  let authMethod: AuthMethod = "email_otp";

  // 1. Primary auth channel: Email OTP HMAC-SHA256 Bearer session token
  const jwtSession = await verifyToken(token);
  if (jwtSession) {
    const [dbUser] = await db.select().from(users).where(eq(users.id, jwtSession.userId)).limit(1);
    if (dbUser) {
      email = dbUser.email;
      uid = dbUser.uid;
      displayName = dbUser.displayName;
      avatarUrl = dbUser.avatarUrl;
      authMethod = "email_otp";
    }
  }

  // 2. Secondary auth channel: Firebase Auth ID Token verification
  if (!email) {
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return null;
    }
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      email = decoded.email || `${decoded.uid}@firebase.local`;
      uid = decoded.uid;
      displayName = typeof decoded.name === "string" ? decoded.name : "";
      avatarUrl = typeof decoded.picture === "string" ? decoded.picture : "";
      authMethod = "firebase";
    } catch {
      return null;
    }
  }

  if (!email) return null;

  const dbUser = await getOrCreateUser({
    uid: uid || `email-${email}`,
    email,
    displayName,
    avatarUrl,
  });

  const roles = await getUserRoles(dbUser.id);
  const assignedRows = await db
    .select({ cohortId: cohortInstructors.cohortId })
    .from(cohortInstructors)
    .where(eq(cohortInstructors.userId, dbUser.id));

  const assignedCohortIds = assignedRows.map((r) => r.cohortId);
  const isAdmin = roles.includes("admin");
  const isInstructorOrTa =
    roles.includes("instructor") || roles.includes("ta") || assignedCohortIds.length > 0;

  return {
    user: {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      displayName: dbUser.displayName,
      avatarUrl: dbUser.avatarUrl,
    },
    authMethod,
    roles,
    isAdmin,
    isInstructorOrTa,
    assignedCohortIds,
  };
}

export async function optionalAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }
  try {
    const ctx = await resolveAuthFromHeader(authHeader);
    if (ctx) {
      req.authContext = ctx;
    }
    next();
  } catch (err) {
    console.error("[optionalAuth] Token verification failed:", err);
    res.status(401).json({ error: "登录会话已失效，请重新登录。" });
  }
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ctx = await resolveAuthFromHeader(req.headers.authorization);
    if (!ctx) {
      res.status(401).json({ error: "请先登录账号后再继续操作。" });
      return;
    }
    req.authContext = ctx;
    next();
  } catch (err) {
    console.error("[requireAuth] Token verification failed:", err);
    res.status(401).json({ error: "身份验证失败，请重新登录。" });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.authContext) {
    res.status(401).json({ error: "请先登录账号。" });
    return;
  }
  if (!req.authContext.isAdmin) {
    res.status(403).json({ error: "仅教务管理员可执行此操作。" });
    return;
  }
  next();
}

export async function hasActiveCourseEntitlement(
  authContext: AuthContext | undefined,
  options?: { moduleId?: string; cohortId?: number | null }
): Promise<boolean> {
  if (!authContext) return false;
  if (authContext.isAdmin) return true;

  const snapshot = await resolveUserEntitlementSnapshot(authContext);
  if (options?.cohortId) {
    const cohortCheck = snapshot.canSubmitToCohort(options.cohortId);
    if (!cohortCheck.allowed) return false;
  }
  if (options?.moduleId) {
    return snapshot.hasModuleAccess(options.moduleId);
  }
  return snapshot.hasPaidAccess;
}

export async function getUserActiveEntitlements(userId: number) {
  const now = new Date();
  const rows = await db
    .select()
    .from(entitlements)
    .where(eq(entitlements.userId, userId));

  return rows.map((row) => ({
    ...row,
    isCurrentlyValid:
      row.status === "active" && row.validFrom <= now && row.validUntil > now,
  }));
}

export async function hasAnyAdmin(): Promise<boolean> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userRoles)
    .where(eq(userRoles.role, "admin"));
  return count > 0;
}

function timingSafeTokenMatch(expected: string, provided: string): boolean {
  const expectedDigest = crypto.createHash("sha256").update(expected, "utf8").digest();
  const providedDigest = crypto.createHash("sha256").update(provided, "utf8").digest();
  return crypto.timingSafeEqual(expectedDigest, providedDigest);
}

export function getAdminBootstrapUiState(
  userEmail?: string,
  env: Record<string, string | undefined> = process.env
): {
  requiresToken: boolean;
  configuredEmailWhitelist: boolean;
  canAttemptSelfClaim: boolean;
} {
  const bootstrapToken = env.ADMIN_BOOTSTRAP_TOKEN?.trim() || "";
  const adminEmails = (env.ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isProd = env.NODE_ENV === "production";

  if (bootstrapToken) {
    return {
      requiresToken: true,
      configuredEmailWhitelist: adminEmails.length > 0,
      canAttemptSelfClaim: true,
    };
  }

  if (adminEmails.length > 0) {
    const normalized = (userEmail || "").trim().toLowerCase();
    return {
      requiresToken: false,
      configuredEmailWhitelist: true,
      canAttemptSelfClaim: Boolean(normalized && adminEmails.includes(normalized)),
    };
  }

  return {
    requiresToken: false,
    configuredEmailWhitelist: false,
    canAttemptSelfClaim: !isProd,
  };
}

export function evaluateAdminBootstrapCheck(input: {
  userEmail: string;
  providedToken?: string;
  env?: Record<string, string | undefined>;
}): { allowed: true } | { allowed: false; status: number; error: string } {
  const env = input.env ?? process.env;
  const expectedToken = env.ADMIN_BOOTSTRAP_TOKEN?.trim() || "";
  const adminEmails = (env.ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const normalizedEmail = input.userEmail.trim().toLowerCase();
  const provided = (input.providedToken || "").trim();
  const isProd = env.NODE_ENV === "production";

  if (expectedToken) {
    if (!provided || !timingSafeTokenMatch(expectedToken, provided)) {
      return {
        allowed: false,
        status: 403,
        error: "初始化口令校验失败：请提供正确的 ADMIN_BOOTSTRAP_TOKEN。",
      };
    }
    if (adminEmails.length > 0 && !adminEmails.includes(normalizedEmail)) {
      return {
        allowed: false,
        status: 403,
        error: "当前账号邮箱不在 ADMIN_EMAIL 管理员白名单中。",
      };
    }
    return { allowed: true };
  }

  if (adminEmails.length > 0) {
    if (!adminEmails.includes(normalizedEmail)) {
      return {
        allowed: false,
        status: 403,
        error: "当前仅允许 ADMIN_EMAIL 白名单邮箱认领初始管理员权限。",
      };
    }
    return { allowed: true };
  }

  if (isProd) {
    return {
      allowed: false,
      status: 403,
      error:
        "生产环境未配置 ADMIN_BOOTSTRAP_TOKEN 或 ADMIN_EMAIL，已禁用开放式管理员认领。请在服务端环境变量中配置后重试。",
    };
  }

  return { allowed: true };
}

export async function claimFirstAdmin(
  userId: number,
  userEmail: string,
  providedToken?: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const policyCheck = evaluateAdminBootstrapCheck({
    userEmail,
    providedToken,
  });
  if ("error" in policyCheck) {
    return {
      ok: false,
      status: policyCheck.status,
      error: policyCheck.error,
    };
  }

  const claimed = await db.transaction(async (tx) => {
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(userRoles)
      .where(eq(userRoles.role, "admin"));

    if (count > 0) {
      return false;
    }

    await tx
      .insert(userRoles)
      .values({
        userId,
        role: "admin",
        grantedByUserId: userId,
      })
      .onConflictDoNothing();

    return true;
  });

  if (!claimed) {
    return {
      ok: false,
      status: 409,
      error: "系统已存在管理员，无法重复认领初始管理员权限。",
    };
  }

  return { ok: true };
}

export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}
