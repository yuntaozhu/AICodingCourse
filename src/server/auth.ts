import type { NextFunction, Request, Response } from "express";
import { and, eq, gt, lte, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { cohortInstructors, entitlements, userRoles, users } from "../db/schema.ts";
import { getOrCreateUser, getUserRoles } from "../db/users.ts";
import { adminAuth } from "../lib/firebase-admin.ts";

export interface AuthContext {
  user: {
    id: number;
    uid: string;
    email: string;
    displayName: string;
    avatarUrl: string;
  };
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

  const decoded = await adminAuth.verifyIdToken(token);
  const email = decoded.email || `${decoded.uid}@firebase.local`;
  const dbUser = await getOrCreateUser({
    uid: decoded.uid,
    email,
    displayName: typeof decoded.name === "string" ? decoded.name : "",
    avatarUrl: typeof decoded.picture === "string" ? decoded.picture : "",
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
  authContext: AuthContext | undefined
): Promise<boolean> {
  if (!authContext) return false;
  if (authContext.isAdmin || authContext.isInstructorOrTa) return true;

  const now = new Date();
  const rows = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, authContext.user.id),
        eq(entitlements.status, "active"),
        lte(entitlements.validFrom, now),
        gt(entitlements.validUntil, now)
      )
    )
    .limit(1);

  return rows.length > 0;
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

export async function claimFirstAdmin(userId: number): Promise<boolean> {
  return await db.transaction(async (tx) => {
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
}

export async function findUserByEmail(email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}
