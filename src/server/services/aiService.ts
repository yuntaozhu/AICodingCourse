import crypto from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { aiUsageLogs } from "../../db/schema.ts";

export const AI_MODEL_ID = "gemini-4-hydrogen";
const DAILY_QUOTA_LIMIT = 40;

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export async function checkAndRunGuardedAiCall(input: {
  userId: number;
  requestId?: string;
  endpoint:
    | "/api/review"
    | "/api/kb/synthesize"
    | "/api/craft-rules"
    | "/api/tutor/ask"
    | "/api/instructor/prereview";
  prompt: string;
  systemInstruction: string;
  onEmptyFallbackError: string;
}) {
  const requestId =
    input.requestId?.trim() ||
    `ai-${input.userId}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  // Idempotency check if client retries with same requestId
  const existing = await db
    .select()
    .from(aiUsageLogs)
    .where(eq(aiUsageLogs.requestId, requestId))
    .limit(1);
  if (existing.length > 0 && existing[0].status === "rate_limited") {
    return {
      ok: false as const,
      status: 429,
      error: "今日服务端 AI 辅助次数已达上限，请先使用左侧 0-Token 静态审计器练习。",
    };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ count: todayCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiUsageLogs)
    .where(
      and(
        eq(aiUsageLogs.userId, input.userId),
        eq(aiUsageLogs.status, "ok"),
        gte(aiUsageLogs.createdAt, startOfDay)
      )
    );

  if (todayCount >= DAILY_QUOTA_LIMIT) {
    await db
      .insert(aiUsageLogs)
      .values({
        requestId,
        userId: input.userId,
        endpoint: input.endpoint,
        modelId: AI_MODEL_ID,
        status: "rate_limited",
        latencyMs: 0,
        errorCode: "DAILY_LIMIT_REACHED",
      })
      .onConflictDoNothing();

    return {
      ok: false as const,
      status: 429,
      error: `今日服务端 AI 调用已达 ${DAILY_QUOTA_LIMIT} 次上限，请优先使用确定性本地规则自检。`,
    };
  }

  const ai = createGeminiClient();
  if (!ai) {
    return {
      ok: false as const,
      status: 503,
      error: input.onEmptyFallbackError,
    };
  }

  const startedAt = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL_ID,
      contents: input.prompt,
      config: {
        systemInstruction: input.systemInstruction,
      },
    });
    const latencyMs = Date.now() - startedAt;

    await db
      .insert(aiUsageLogs)
      .values({
        requestId,
        userId: input.userId,
        endpoint: input.endpoint,
        modelId: AI_MODEL_ID,
        status: "ok",
        latencyMs,
      })
      .onConflictDoNothing();

    return {
      ok: true as const,
      text: response.text ?? "",
      model: AI_MODEL_ID,
      remainingToday: Math.max(0, DAILY_QUOTA_LIMIT - todayCount - 1),
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : "AI service error";

    await db
      .insert(aiUsageLogs)
      .values({
        requestId,
        userId: input.userId,
        endpoint: input.endpoint,
        modelId: AI_MODEL_ID,
        status: "error",
        latencyMs,
        errorCode: message.slice(0, 80),
      })
      .onConflictDoNothing();

    return {
      ok: false as const,
      status: 500,
      error: `服务端 AI 调用失败：${message}`,
    };
  }
}
