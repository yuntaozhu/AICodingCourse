import { eq } from "drizzle-orm";
import { db } from "./index.ts";
import { userRoles, users } from "./schema.ts";

export async function getOrCreateUser(input: {
  uid: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}) {
  try {
    const normalizedEmail = input.email.trim().toLowerCase();
    const result = await db
      .insert(users)
      .values({
        uid: input.uid,
        email: normalizedEmail,
        displayName: input.displayName ?? "",
        avatarUrl: input.avatarUrl ?? "",
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
          displayName: input.displayName ?? "",
          avatarUrl: input.avatarUrl ?? "",
          updatedAt: new Date(),
        },
      })
      .returning();

    const user = result[0];

    // Ensure baseline 'learner' role exists
    await db
      .insert(userRoles)
      .values({
        userId: user.id,
        role: "learner",
      })
      .onConflictDoNothing();

    // Auto-elevate configured ADMIN_EMAIL if set in environment
    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes(input.email.toLowerCase())) {
      await db
        .insert(userRoles)
        .values({
          userId: user.id,
          role: "admin",
        })
        .onConflictDoNothing();
    }

    return user;
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Failed to resolve user account.", { cause: error });
  }
}

export async function getUserRoles(userId: number): Promise<string[]> {
  try {
    const rows = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => r.role);
  } catch (error) {
    console.error("Database role lookup failed:", error);
    throw new Error("Failed to read user roles.", { cause: error });
  }
}
