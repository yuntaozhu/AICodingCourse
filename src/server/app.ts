import path from "node:path";
import express, { type Request, type Response } from "express";
import { put } from "@vercel/blob";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import {
  cohortEnrollments,
  cohortInstructors,
  cohortMilestones,
  cohorts,
  customKbEntries,
  entitlements,
  leadInquiries,
  orders,
  prices,
  products,
  redeemCodes,
  unitProgress,
  userRoles,
  users,
} from "../db/schema.ts";
import { COURSE_SKILLS, type SkillId } from "../data/courseSkills.ts";
import { getOrCreateUser } from "../db/users.ts";
import {
  type AuthedRequest,
  claimFirstAdmin,
  findUserByEmail,
  getUserActiveEntitlements,
  hasActiveCourseEntitlement,
  hasAnyAdmin,
  optionalAuth,
  requireAdmin,
  requireAuth,
} from "./auth.ts";
import { AI_MODEL_ID, checkAndRunGuardedAiCall } from "./services/aiService.ts";
import { signToken } from "./services/tokenService.ts";
import {
  adminCreateRedeemCode,
  adminGrantEntitlement,
  adminRevokeEntitlement,
  createPendingOrder,
  formatBillingIntervalLabel,
  getPublicCatalogProducts,
  getUserBillingHistory,
  processPaymentWebhookEvent,
  redeemActivationCode,
  verifyWebhookSignature,
} from "./services/billingService.ts";
import { ensureCatalogSeeded } from "./services/catalogSeed.ts";
import {
  assignInstructorToCohort,
  createOrResubmitLearnerWork,
  getInstructorCockpitData,
  getLearnerCohortView,
  reviewCohortSubmission,
} from "./services/cohortService.ts";
import {
  CURRICULUM_VERSION,
  getAuthorizedModuleDetail,
  getPublicCurriculumOverview,
  getSanitizedModuleQuiz,
  getUserWorkspaceCloudState,
  gradeAndRecordQuizAttempt,
  gradeSkillDiagnosticAndGrant,
} from "./services/curriculumService.ts";

interface RawBodyRequest extends Request {
  rawBody?: string;
}

export const app = express();

app.use(
  express.json({
    limit: "6mb",
    verify: (req, _res, buf) => {
      (req as RawBodyRequest).rawBody = buf.toString("utf8");
    },
  })
);

function getBlobReadWriteToken(): string | undefined {
  return process.env.AICODING_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
}

app.get("/api/health", async (req: Request, res: Response) => {
  let dbOk: boolean | undefined;
  if (req.query.db === "1") {
    try {
      await db.execute(sql`select 1`);
      dbOk = true;
    } catch (err) {
      console.error("[/api/health] DB probe failed:", err);
      dbOk = false;
    }
  }
  res.json({
    ok: true,
    ...(dbOk !== undefined ? { dbOk } : {}),
    model: AI_MODEL_ID,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    blobUploadEnabled: Boolean(getBlobReadWriteToken()),
    curriculumVersion: CURRICULUM_VERSION,
  });
});

// Public catalog & pricing endpoint
app.get("/api/catalog", optionalAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const [catalog, hasPaidAccess] = await Promise.all([
      getPublicCatalogProducts(),
      hasActiveCourseEntitlement(req.authContext),
    ]);
    const overview = getPublicCurriculumOverview(hasPaidAccess);
    res.json({
      ...catalog,
      curriculum: overview,
      hasPaidAccess,
    });
  } catch (err) {
    console.error("[/api/catalog] error:", err);
    res.status(500).json({ error: "加载课程与商品目录失败。" });
  }
});

// Lead inquiry submission from Official Website
const inquirySchema = z.object({
  name: z.string().trim().min(1, "请填写姓名或称呼").max(80),
  contact: z.string().trim().min(3, "请填写有效邮箱或微信号").max(120),
  organization: z.string().trim().max(120).optional().default(""),
  inquiryType: z.enum(["cohort", "enterprise", "school"]),
  message: z.string().trim().min(5, "请简述您的学习或内训需求").max(1000),
});

app.post("/api/inquiries", async (req: Request, res: Response) => {
  const parsed = inquirySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "提交参数不合法。" });
    return;
  }
  try {
    const [created] = await db
      .insert(leadInquiries)
      .values({
        name: parsed.data.name,
        contact: parsed.data.contact,
        organization: parsed.data.organization,
        inquiryType: parsed.data.inquiryType,
        message: parsed.data.message,
      })
      .returning();
    res.status(201).json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[/api/inquiries] error:", err);
    res.status(500).json({ error: "提交咨询失败，请稍后重试。" });
  }
});

// Vercel standalone passwordless email login for regions where Google Auth is restricted
const emailLoginSchema = z.object({
  email: z.string().trim().email("请填写有效的电子邮箱地址").max(120),
});

app.post("/api/auth/login-email", async (req: Request, res: Response) => {
  const parsed = emailLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "邮箱格式不合法。" });
    return;
  }
  try {
    const email = parsed.data.email.trim().toLowerCase();
    const existing = await findUserByEmail(email);
    const dbUser = await getOrCreateUser({
      uid: existing?.uid || `email-${email}`,
      email,
      displayName: existing?.displayName || email.split("@")[0] || "学员",
      avatarUrl: existing?.avatarUrl || "",
    });

    const token = signToken({ userId: dbUser.id, email: dbUser.email });
    res.json({
      ok: true,
      token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        displayName: dbUser.displayName,
        avatarUrl: dbUser.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[/api/auth/login-email] error:", err);
    res.status(500).json({ error: "邮箱登录失败，请稍后重试。" });
  }
});

// Current authenticated user session, roles, entitlements & initial admin claim eligibility
app.get("/api/auth/me", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const ctx = req.authContext!;
    await ensureCatalogSeeded();
    const [userEntitlements, hasPaidAccess, adminExists, cohortView] = await Promise.all([
      getUserActiveEntitlements(ctx.user.id),
      hasActiveCourseEntitlement(ctx),
      hasAnyAdmin(),
      getLearnerCohortView(ctx.user.id),
    ]);
    res.json({
      user: ctx.user,
      roles: ctx.roles,
      isAdmin: ctx.isAdmin,
      isInstructorOrTa: ctx.isInstructorOrTa,
      assignedCohortIds: ctx.assignedCohortIds,
      canClaimInitialAdmin: !adminExists,
      hasPaidAccess,
      entitlements: userEntitlements,
      cohortEnrolled: cohortView.enrolled,
      cohorts: cohortView.cohorts,
    });
  } catch (err) {
    console.error("[/api/auth/me] error:", err);
    res.status(500).json({ error: "获取当前账号权益失败。" });
  }
});

// Atomic one-time first admin bootstrap when zero admins exist in DB
app.post("/api/auth/claim-admin", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const claimed = await claimFirstAdmin(req.authContext!.user.id);
    if (!claimed) {
      res.status(409).json({ error: "系统已存在管理员，无法重复认领初始管理员权限。" });
      return;
    }
    res.json({ ok: true, role: "admin" });
  } catch (err) {
    console.error("[/api/auth/claim-admin] error:", err);
    res.status(500).json({ error: "认领初始管理员失败。" });
  }
});

// Curriculum module detail with entitlement gating and teacher material stripping
app.get(
  "/api/curriculum/modules/:moduleId",
  optionalAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const moduleId = String(req.params.moduleId || "").trim();
      const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
      const detail = getAuthorizedModuleDetail(moduleId, req.authContext, hasPaidAccess);
      if (!detail.found) {
        res.status(404).json({ error: "未找到指定课程模块。" });
        return;
      }
      if (!detail.allowed) {
        res.status(403).json({
          error: "该课程模块需开通账号权益后解锁学习。",
          code: "ENTITLEMENT_REQUIRED",
          summary: detail.summary,
        });
        return;
      }
      res.json(detail);
    } catch (err) {
      console.error("[/api/curriculum/modules/:moduleId] error:", err);
      res.status(500).json({ error: "读取模块详情失败。" });
    }
  }
);

// Sanitized quiz questions (no correctIndex or explanation sent prior to submission)
app.get(
  "/api/quizzes/:moduleId",
  optionalAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const moduleId = String(req.params.moduleId || "").trim();
      const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
      const result = getSanitizedModuleQuiz(moduleId, hasPaidAccess);
      if (!result.found) {
        res.status(404).json({ error: "未找到对应模块测验。" });
        return;
      }
      if (!result.allowed) {
        res.status(403).json({
          error: "该模块测验需开通会员或班级权益后作答。",
          code: "ENTITLEMENT_REQUIRED",
        });
        return;
      }
      res.json(result);
    } catch (err) {
      console.error("[/api/quizzes/:moduleId] error:", err);
      res.status(500).json({ error: "加载测验题目失败。" });
    }
  }
);

const quizSubmitSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

app.post(
  "/api/quizzes/:moduleId/submit",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const parsed = quizSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "测验作答格式不正确。" });
      return;
    }
    try {
      const moduleId = String(req.params.moduleId || "").trim();
      const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
      const result = await gradeAndRecordQuizAttempt({
        userId: req.authContext!.user.id,
        moduleId,
        answers: parsed.data.answers,
        hasPaidAccess,
      });
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (err) {
      console.error("[/api/quizzes/:moduleId/submit] error:", err);
      res.status(500).json({ error: "服务端判分保存失败。" });
    }
  }
);

// Cloud workspace state hydration
app.get("/api/workspace/state", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const state = await getUserWorkspaceCloudState(req.authContext!.user.id);
    res.json(state);
  } catch (err) {
    console.error("[/api/workspace/state GET] error:", err);
    res.status(500).json({ error: "读取云端学习进度失败。" });
  }
});

const unitProgressSchema = z.object({
  moduleId: z.string().trim().min(1).max(40),
  unitId: z.string().trim().min(1).max(80),
  planId: z.string().trim().min(1).max(80),
  completed: z.boolean().optional(),
  dodChecked: z.array(z.string().max(300)).max(50).optional(),
  artifactDraft: z.string().max(20000).optional(),
  reflectionNote: z.string().max(10000).optional(),
  selectedTransferTier: z.string().max(120).nullable().optional(),
});

app.put("/api/workspace/progress", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = unitProgressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "进度保存参数不合法。" });
    return;
  }
  try {
    const userId = req.authContext!.user.id;
    const d = parsed.data;
    const existingRows = await db
      .select()
      .from(unitProgress)
      .where(and(eq(unitProgress.userId, userId), eq(unitProgress.unitId, d.unitId)))
      .limit(1);

    const existing = existingRows[0];
    const [saved] = await db
      .insert(unitProgress)
      .values({
        userId,
        moduleId: d.moduleId,
        unitId: d.unitId,
        planId: d.planId,
        curriculumVersion: CURRICULUM_VERSION,
        completed: d.completed ?? existing?.completed ?? false,
        dodCheckedJson: d.dodChecked ?? existing?.dodCheckedJson ?? [],
        artifactDraft: d.artifactDraft ?? existing?.artifactDraft ?? "",
        reflectionNote: d.reflectionNote ?? existing?.reflectionNote ?? "",
        selectedTransferTier:
          d.selectedTransferTier !== undefined
            ? d.selectedTransferTier
            : existing?.selectedTransferTier ?? null,
        untrustedLegacy: false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [unitProgress.userId, unitProgress.unitId],
        set: {
          planId: d.planId,
          curriculumVersion: CURRICULUM_VERSION,
          completed: d.completed ?? existing?.completed ?? false,
          dodCheckedJson: d.dodChecked ?? existing?.dodCheckedJson ?? [],
          artifactDraft: d.artifactDraft ?? existing?.artifactDraft ?? "",
          reflectionNote: d.reflectionNote ?? existing?.reflectionNote ?? "",
          selectedTransferTier:
            d.selectedTransferTier !== undefined
              ? d.selectedTransferTier
              : existing?.selectedTransferTier ?? null,
          untrustedLegacy: false,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json({ ok: true, progress: saved });
  } catch (err) {
    console.error("[/api/workspace/progress PUT] error:", err);
    res.status(500).json({ error: "保存学习进度失败。" });
  }
});

// One-time import of legacy localStorage notes/checklists (marked untrustedLegacy=true, never grants skills)
const legacyImportSchema = z.object({
  completedUnitIds: z.record(z.string(), z.boolean()).optional().default({}),
  dodCheckedByUnit: z.record(z.string(), z.array(z.string())).optional().default({}),
  practiceNotes: z
    .record(
      z.string(),
      z.object({
        artifactDraft: z.string().max(20000).optional().default(""),
        reflectionNote: z.string().max(10000).optional().default(""),
        selectedTransferTier: z.string().max(120).optional(),
      })
    )
    .optional()
    .default({}),
  customKbEntries: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(200),
        moduleCode: z.string().min(1).max(30),
        category: z.string().min(1).max(60),
        scope: z.string().max(200).optional().default(""),
        content: z.string().max(20000),
        cautionNote: z.string().max(2000).optional().default(""),
        updatedAt: z.string().max(40).optional().default(""),
      })
    )
    .max(100)
    .optional()
    .default([]),
});

app.post(
  "/api/workspace/import-legacy",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const parsed = legacyImportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "本地旧记录格式不合法。" });
      return;
    }
    try {
      const userId = req.authContext!.user.id;
      const d = parsed.data;
      const unitIds = Array.from(
        new Set([
          ...Object.keys(d.completedUnitIds),
          ...Object.keys(d.dodCheckedByUnit),
          ...Object.keys(d.practiceNotes),
        ])
      ).slice(0, 200);

      let importedUnits = 0;
      for (const unitId of unitIds) {
        const moduleIdMatch = unitId.match(/^(m(?:13-gov|13-eng|\d+))/);
        const moduleId = moduleIdMatch ? moduleIdMatch[1] : "m1";
        const note = d.practiceNotes[unitId];
        await db
          .insert(unitProgress)
          .values({
            userId,
            moduleId,
            unitId,
            planId: `${moduleId}-plan-double`,
            curriculumVersion: CURRICULUM_VERSION,
            completed: Boolean(d.completedUnitIds[unitId]),
            dodCheckedJson: d.dodCheckedByUnit[unitId] ?? [],
            artifactDraft: note?.artifactDraft ?? "",
            reflectionNote: note?.reflectionNote ?? "",
            selectedTransferTier: note?.selectedTransferTier ?? null,
            untrustedLegacy: true,
          })
          .onConflictDoNothing();
        importedUnits += 1;
      }

      let importedKb = 0;
      for (const entry of d.customKbEntries) {
        await db
          .insert(customKbEntries)
          .values({
            clientEntryId: entry.id,
            userId,
            title: entry.title,
            moduleCode: entry.moduleCode,
            category: entry.category,
            scope: entry.scope,
            content: entry.content,
            cautionNote: entry.cautionNote,
            updatedAt: entry.updatedAt || new Date().toISOString().slice(0, 10),
          })
          .onConflictDoNothing();
        importedKb += 1;
      }

      res.json({
        ok: true,
        importedUnits,
        importedKb,
        note: "历史浏览器笔记与进度已标记为本地导入草稿（不自动转换测验成绩或技能认证）。",
      });
    } catch (err) {
      console.error("[/api/workspace/import-legacy] error:", err);
      res.status(500).json({ error: "导入本地草稿失败。" });
    }
  }
);

const customKbSchema = z.object({
  clientEntryId: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  moduleCode: z.string().trim().min(1).max(30),
  category: z.string().trim().min(1).max(60),
  scope: z.string().trim().max(200).default(""),
  content: z.string().trim().min(1).max(20000),
  cautionNote: z.string().trim().max(2000).default(""),
});

app.post("/api/workspace/kb", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = customKbSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "知识条目字段不完整。" });
    return;
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [saved] = await db
      .insert(customKbEntries)
      .values({
        clientEntryId: parsed.data.clientEntryId,
        userId: req.authContext!.user.id,
        title: parsed.data.title,
        moduleCode: parsed.data.moduleCode,
        category: parsed.data.category,
        scope: parsed.data.scope,
        content: parsed.data.content,
        cautionNote: parsed.data.cautionNote,
        updatedAt: today,
      })
      .onConflictDoUpdate({
        target: [customKbEntries.userId, customKbEntries.clientEntryId],
        set: {
          title: parsed.data.title,
          moduleCode: parsed.data.moduleCode,
          category: parsed.data.category,
          scope: parsed.data.scope,
          content: parsed.data.content,
          cautionNote: parsed.data.cautionNote,
          updatedAt: today,
        },
      })
      .returning();
    res.status(201).json({ ok: true, entry: saved });
  } catch (err) {
    console.error("[/api/workspace/kb POST] error:", err);
    res.status(500).json({ error: "保存知识条目失败。" });
  }
});

app.delete(
  "/api/workspace/kb/:clientEntryId",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const clientEntryId = String(req.params.clientEntryId || "");
      await db
        .delete(customKbEntries)
        .where(
          and(
            eq(customKbEntries.userId, req.authContext!.user.id),
            eq(customKbEntries.clientEntryId, clientEntryId)
          )
        );
      res.json({ ok: true });
    } catch (err) {
      console.error("[/api/workspace/kb DELETE] error:", err);
      res.status(500).json({ error: "删除知识条目失败。" });
    }
  }
);

// Server-side skill diagnostic grading
const skillDiagSchema = z.object({
  skillId: z.string().trim().min(1),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

app.post(
  "/api/skills/diagnostic",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const parsed = skillDiagSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "诊断答卷格式不正确。" });
      return;
    }
    const validSkill = COURSE_SKILLS.find((s) => s.id === parsed.data.skillId);
    if (!validSkill) {
      res.status(404).json({ error: "技能 ID 不存在。" });
      return;
    }
    try {
      const result = await gradeSkillDiagnosticAndGrant({
        userId: req.authContext!.user.id,
        skillId: validSkill.id as SkillId,
        answers: parsed.data.answers,
      });
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (err) {
      console.error("[/api/skills/diagnostic] error:", err);
      res.status(500).json({ error: "服务端技能诊断评测失败。" });
    }
  }
);

// Billing: orders, redeem codes, history & signed webhooks
app.get("/api/billing/me", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const history = await getUserBillingHistory(req.authContext!.user.id);
    res.json(history);
  } catch (err) {
    console.error("[/api/billing/me] error:", err);
    res.status(500).json({ error: "获取订单与权益记录失败。" });
  }
});

const createOrderSchema = z.object({
  priceId: z.number().int().positive(),
  provider: z.enum(["stripe", "alipay", "wechat", "redeem_code"]).default("wechat"),
  cohortId: z.number().int().positive().optional(),
});

app.post("/api/billing/orders", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "订单创建参数无效。" });
    return;
  }
  try {
    const result = await createPendingOrder({
      userId: req.authContext!.user.id,
      priceId: parsed.data.priceId,
      provider: parsed.data.provider,
      cohortId: parsed.data.cohortId,
    });
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("[/api/billing/orders] error:", err);
    res.status(500).json({ error: "创建订单失败。" });
  }
});

const redeemSchema = z.object({
  code: z.string().trim().min(3).max(64),
});

app.post("/api/billing/redeem", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = redeemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "请输入有效的兑换码。" });
    return;
  }
  try {
    const result = await redeemActivationCode({
      userId: req.authContext!.user.id,
      rawCode: parsed.data.code,
    });
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("[/api/billing/redeem] error:", err);
    res.status(500).json({ error: "兑换权益失败，请稍后重试。" });
  }
});

const webhookSchema = z.object({
  provider: z.string().trim().min(1).max(40),
  externalEventId: z.string().trim().min(1).max(120),
  orderNo: z.string().trim().min(1).max(80),
  eventType: z.enum(["payment.succeeded", "payment.refunded", "subscription.cancelled"]),
  summaryJson: z.record(z.string(), z.unknown()).optional(),
});

app.post("/api/webhooks/payment", async (req: RawBodyRequest, res: Response) => {
  const signature = req.header("x-webhook-signature");
  if (!process.env.PAYMENT_WEBHOOK_SECRET) {
    res.status(503).json({
      error: "支付 Webhook 密钥尚未配置（PAYMENT_WEBHOOK_SECRET），当前请使用兑换码或管理员开通权益。",
    });
    return;
  }
  if (!verifyWebhookSignature(req.rawBody || "", signature)) {
    res.status(401).json({ error: "Webhook 签名校验失败。" });
    return;
  }
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Webhook 报文格式不合法。" });
    return;
  }
  try {
    const result = await processPaymentWebhookEvent(parsed.data);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json(result);
  } catch (err) {
    console.error("[/api/webhooks/payment] error:", err);
    res.status(500).json({ error: "处理支付回调失败。" });
  }
});

// Stage 2: Learner cohort schedule & artifact submission
app.get("/api/cohorts/my", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const view = await getLearnerCohortView(req.authContext!.user.id);
    res.json({
      ...view,
      blobUploadEnabled: Boolean(getBlobReadWriteToken()),
    });
  } catch (err) {
    console.error("[/api/cohorts/my] error:", err);
    res.status(500).json({ error: "获取班级与里程碑信息失败。" });
  }
});

const uploadAttachmentSchema = z.object({
  filename: z.string().trim().min(1).max(160),
  contentType: z.string().trim().min(1).max(120),
  contentBase64: z.string().min(4).max(4_500_000),
});

const ALLOWED_MIME_MAP: Record<string, string[]> = {
  ".md": ["text/markdown", "text/plain"],
  ".txt": ["text/plain"],
  ".pdf": ["application/pdf"],
  ".json": ["application/json", "text/plain"],
  ".zip": ["application/zip", "application/x-zip-compressed", "application/octet-stream"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".webp": ["image/webp"],
};

app.post(
  "/api/submissions/upload",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const token = getBlobReadWriteToken();
    if (!token) {
      res.status(503).json({
        error: "附件上传服务尚未配置（缺少 AICODING_READ_WRITE_TOKEN），请直接粘贴 GitHub PR 或文档链接。",
      });
      return;
    }
    const parsed = uploadAttachmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "附件参数不合法或文件过大（图片上限 2MB，其他附件上限 3MB）。" });
      return;
    }

    const ext = path.extname(parsed.data.filename).toLowerCase();
    const contentType = parsed.data.contentType.toLowerCase();
    const allowedMimes = ALLOWED_MIME_MAP[ext];

    if (!allowedMimes || (!allowedMimes.includes(contentType) && contentType !== "application/octet-stream")) {
      res.status(400).json({
        error: "文件扩展名与内容类型 (Content-Type) 不匹配或不在严格白名单内。符合 Vercel Blob 最优实践的格式支持：.png (image/png), .jpg/.jpeg (image/jpeg), .webp (image/webp), .pdf, .zip, .md, .txt, .json。",
      });
      return;
    }

    const buffer = Buffer.from(parsed.data.contentBase64, "base64");
    const isImage = [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
    const maxSizeBytes = isImage ? 2 * 1024 * 1024 : 3 * 1024 * 1024; // 2MB for images (Vercel Blob best practice for edge CDN loading), 3MB for others

    if (buffer.length === 0 || buffer.length > maxSizeBytes) {
      const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
      const limitLabel = isImage ? "2MB (Vercel Blob 最佳实践：建议高分辨率图片控制在 2MB 以内以优化 CDN 传输与首屏加载)" : "3MB";
      res.status(400).json({
        error: `附件大小超出限制。当前文件大小约 ${sizeMb}MB，格式大小需在 1B – ${limitLabel} 之间。`,
      });
      return;
    }

    const safeBase = path
      .basename(parsed.data.filename, ext)
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 60) || "artifact";

    try {
      const blob = await put(
        `submissions/${req.authContext!.user.id}/${Date.now()}-${safeBase}${ext}`,
        buffer,
        {
          access: "public",
          token,
          contentType: parsed.data.contentType,
        }
      );
      res.status(201).json({
        ok: true,
        url: blob.url,
        pathname: blob.pathname,
        size: buffer.length,
      });
    } catch (err) {
      console.error("[/api/submissions/upload] error:", err);
      res.status(500).json({ error: "上传附件到对象存储失败，请稍后重试。" });
    }
  }
);

const submissionSchema = z.object({
  cohortId: z.number().int().positive().nullable().optional(),
  milestoneId: z.number().int().positive().nullable().optional(),
  moduleId: z.string().trim().min(1).max(40),
  labId: z.string().trim().max(60).nullable().optional(),
  artifactTitle: z.string().trim().min(2, "请填写作业标题").max(200),
  artifactText: z.string().trim().min(10, "请填写产物内容或关键验证输出").max(30000),
  artifactUrl: z.string().trim().max(500).nullable().optional(),
  staticAuditJson: z.record(z.string(), z.unknown()).nullable().optional(),
});

app.post("/api/submissions", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "作业提交参数无效。" });
    return;
  }
  if (
    parsed.data.artifactUrl &&
    !/^https?:\/\//i.test(parsed.data.artifactUrl)
  ) {
    res.status(400).json({ error: "产物外链必须以 http:// 或 https:// 开头。" });
    return;
  }
  try {
    const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
    const result = await createOrResubmitLearnerWork({
      userId: req.authContext!.user.id,
      cohortId: parsed.data.cohortId,
      milestoneId: parsed.data.milestoneId,
      moduleId: parsed.data.moduleId,
      labId: parsed.data.labId,
      artifactTitle: parsed.data.artifactTitle,
      artifactText: parsed.data.artifactText,
      artifactUrl: parsed.data.artifactUrl,
      staticAuditJson: parsed.data.staticAuditJson,
      hasPaidAccess,
    });
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    console.error("[/api/submissions POST] error:", err);
    res.status(500).json({ error: "作业提交失败。" });
  }
});

// Stage 2: Strictly cohort-scoped Instructor Cockpit
app.get("/api/instructor/cockpit", requireAuth, async (req: AuthedRequest, res: Response) => {
  const ctx = req.authContext!;
  if (!ctx.isAdmin && !ctx.isInstructorOrTa) {
    res.status(403).json({ error: "仅指导老师、助教或教务管理员可访问批改工作台。" });
    return;
  }
  try {
    const data = await getInstructorCockpitData(ctx);
    res.json(data);
  } catch (err) {
    console.error("[/api/instructor/cockpit] error:", err);
    res.status(500).json({ error: "加载教师批改队列失败。" });
  }
});

const reviewSubmissionSchema = z.object({
  decision: z.enum(["changes_requested", "approved"]),
  feedbackMarkdown: z.string().trim().min(3, "请填写批改评语").max(5000),
  grantSkillId: z.string().trim().max(80).nullable().optional(),
});

app.post(
  "/api/instructor/submissions/:submissionId/review",
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const ctx = req.authContext!;
    if (!ctx.isAdmin && !ctx.isInstructorOrTa) {
      res.status(403).json({ error: "无权执行作业批改。" });
      return;
    }
    const submissionId = Number(req.params.submissionId);
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      res.status(400).json({ error: "提交记录 ID 无效。" });
      return;
    }
    const parsed = reviewSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || "批改表单不完整。" });
      return;
    }
    try {
      const result = await reviewCohortSubmission({
        authContext: ctx,
        submissionId,
        decision: parsed.data.decision,
        feedbackMarkdown: parsed.data.feedbackMarkdown,
        grantSkillId: parsed.data.grantSkillId,
      });
      if ("error" in result) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (err) {
      console.error("[/api/instructor/submissions/:id/review] error:", err);
      res.status(500).json({ error: "提交批改结果失败。" });
    }
  }
);

// Admin console endpoints
app.get(
  "/api/admin/overview",
  requireAuth,
  requireAdmin,
  async (_req: AuthedRequest, res: Response) => {
    try {
      await ensureCatalogSeeded();
      const [
        userList,
        roleList,
        productList,
        priceList,
        entitlementList,
        orderList,
        codeList,
        cohortList,
        milestoneList,
        instructorList,
        enrollmentList,
        inquiryList,
      ] = await Promise.all([
        db.select().from(users).orderBy(desc(users.createdAt)),
        db.select().from(userRoles),
        db.select().from(products),
        db.select().from(prices),
        db.select().from(entitlements).orderBy(desc(entitlements.createdAt)),
        db.select().from(orders).orderBy(desc(orders.createdAt)),
        db.select().from(redeemCodes).orderBy(desc(redeemCodes.createdAt)),
        db.select().from(cohorts).orderBy(desc(cohorts.createdAt)),
        db.select().from(cohortMilestones),
        db.select().from(cohortInstructors),
        db.select().from(cohortEnrollments),
        db.select().from(leadInquiries).orderBy(desc(leadInquiries.createdAt)),
      ]);

      res.json({
        users: userList.map((u) => ({
          ...u,
          roles: roleList.filter((r) => r.userId === u.id).map((r) => r.role),
        })),
        products: productList.map((p) => ({
          ...p,
          slug: p.skuCode,
          description: p.subtitle,
        })),
        prices: priceList.map((pr) => ({
          ...pr,
          label: formatBillingIntervalLabel(pr.billingInterval, pr.durationDays),
          billingCycle: pr.billingInterval,
        })),
        entitlements: entitlementList,
        orders: orderList,
        redeemCodes: codeList,
        cohorts: cohortList.map((c) => ({
          ...c,
          milestones: milestoneList.filter((m) => m.cohortId === c.id),
          instructors: instructorList.filter((i) => i.cohortId === c.id),
          enrollments: enrollmentList.filter((e) => e.cohortId === c.id),
        })),
        inquiries: inquiryList,
      });
    } catch (err) {
      console.error("[/api/admin/overview] error:", err);
      res.status(500).json({ error: "加载教务后台总览失败。" });
    }
  }
);

const roleGrantSchema = z.object({
  email: z.string().email(),
  role: z.enum(["learner", "ta", "instructor", "admin"]),
  action: z.enum(["add", "remove"]).default("add"),
});

app.post(
  "/api/admin/roles",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const parsed = roleGrantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "角色设置参数无效。" });
      return;
    }
    try {
      const targetUser = await findUserByEmail(parsed.data.email);
      if (!targetUser) {
        res.status(404).json({ error: "未找到该邮箱对应的注册用户（需先登录一次系统）。" });
        return;
      }
      if (parsed.data.action === "add") {
        await db
          .insert(userRoles)
          .values({
            userId: targetUser.id,
            role: parsed.data.role,
            grantedByUserId: req.authContext!.user.id,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(userRoles)
          .where(
            and(
              eq(userRoles.userId, targetUser.id),
              eq(userRoles.role, parsed.data.role)
            )
          );
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("[/api/admin/roles] error:", err);
      res.status(500).json({ error: "更新用户角色失败。" });
    }
  }
);

const adminGrantSchema = z.object({
  email: z.string().email(),
  productId: z.number().int().positive(),
  durationDays: z.number().int().min(1).max(1095).default(365),
  cohortId: z.number().int().positive().optional(),
});

app.post(
  "/api/admin/entitlements/grant",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const parsed = adminGrantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "开通权益参数无效。" });
      return;
    }
    try {
      const targetUser = await findUserByEmail(parsed.data.email);
      if (!targetUser) {
        res.status(404).json({ error: "未找到该邮箱对应的注册用户。" });
        return;
      }
      const result = await adminGrantEntitlement({
        targetUserId: targetUser.id,
        productId: parsed.data.productId,
        durationDays: parsed.data.durationDays,
        cohortId: parsed.data.cohortId,
      });
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(201).json(result);
    } catch (err) {
      console.error("[/api/admin/entitlements/grant] error:", err);
      res.status(500).json({ error: "开通权益失败。" });
    }
  }
);

const revokeSchema = z.object({
  status: z.enum(["refunded", "revoked"]),
});

app.post(
  "/api/admin/entitlements/:entitlementId/revoke",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const entitlementId = Number(req.params.entitlementId);
    const parsed = revokeSchema.safeParse(req.body);
    if (!Number.isInteger(entitlementId) || entitlementId <= 0 || !parsed.success) {
      res.status(400).json({ error: "退款/回收参数无效。" });
      return;
    }
    try {
      const result = await adminRevokeEntitlement(entitlementId, parsed.data.status);
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.json(result);
    } catch (err) {
      console.error("[/api/admin/entitlements/:id/revoke] error:", err);
      res.status(500).json({ error: "回收权益失败。" });
    }
  }
);

const createCodeSchema = z.object({
  productId: z.number().int().positive(),
  priceId: z.number().int().positive(),
  cohortId: z.number().int().positive().optional(),
  maxUses: z.number().int().min(1).max(500).default(1),
});

app.post(
  "/api/admin/redeem-codes",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const parsed = createCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "生成兑换码参数无效。" });
      return;
    }
    try {
      const code = await adminCreateRedeemCode({
        productId: parsed.data.productId,
        priceId: parsed.data.priceId,
        cohortId: parsed.data.cohortId,
        maxUses: parsed.data.maxUses,
        createdByUserId: req.authContext!.user.id,
      });
      res.status(201).json({ ok: true, redeemCode: code });
    } catch (err) {
      console.error("[/api/admin/redeem-codes] error:", err);
      res.status(500).json({ error: "生成兑换码失败。" });
    }
  }
);

const assignInstructorSchema = z.object({
  email: z.string().email(),
  staffRole: z.enum(["instructor", "ta"]).default("instructor"),
});

app.post(
  "/api/admin/cohorts/:cohortId/instructors",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const cohortId = Number(req.params.cohortId);
    const parsed = assignInstructorSchema.safeParse(req.body);
    if (!Number.isInteger(cohortId) || cohortId <= 0 || !parsed.success) {
      res.status(400).json({ error: "分配带班老师参数无效。" });
      return;
    }
    try {
      const targetUser = await findUserByEmail(parsed.data.email);
      if (!targetUser) {
        res.status(404).json({ error: "未找到该邮箱对应的注册用户。" });
        return;
      }
      await db
        .insert(userRoles)
        .values({
          userId: targetUser.id,
          role: parsed.data.staffRole,
          grantedByUserId: req.authContext!.user.id,
        })
        .onConflictDoNothing();
      const assigned = await assignInstructorToCohort({
        cohortId,
        userId: targetUser.id,
        staffRole: parsed.data.staffRole,
      });
      res.status(201).json({ ok: true, assigned });
    } catch (err) {
      console.error("[/api/admin/cohorts/:id/instructors] error:", err);
      res.status(500).json({ error: "分配带班老师失败。" });
    }
  }
);

const createCohortSchema = z.object({
  code: z.string().trim().min(2).max(40),
  title: z.string().trim().min(3).max(160),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxSeats: z.number().int().min(1).max(500).default(30),
});

app.post(
  "/api/admin/cohorts",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const parsed = createCohortSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "开班参数无效。" });
      return;
    }
    try {
      const [created] = await db
        .insert(cohorts)
        .values({
          code: parsed.data.code.toUpperCase(),
          title: parsed.data.title,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          maxSeats: parsed.data.maxSeats,
          status: "active",
        })
        .returning();
      res.status(201).json({ ok: true, cohort: created });
    } catch (err) {
      console.error("[/api/admin/cohorts] error:", err);
      res.status(500).json({ error: "创建班级失败（编号可能已存在）。" });
    }
  }
);

const enrollLearnerSchema = z.object({
  email: z.string().email(),
  targetPathId: z.enum(["non-tech", "indie-dev", "eng-team", "cs-student"]).default("indie-dev"),
});

app.post(
  "/api/admin/cohorts/:cohortId/enroll",
  requireAuth,
  requireAdmin,
  async (req: AuthedRequest, res: Response) => {
    const cohortId = Number(req.params.cohortId);
    const parsed = enrollLearnerSchema.safeParse(req.body);
    if (!Number.isInteger(cohortId) || cohortId <= 0 || !parsed.success) {
      res.status(400).json({ error: "入班参数无效。" });
      return;
    }
    try {
      const targetUser = await findUserByEmail(parsed.data.email);
      if (!targetUser) {
        res.status(404).json({ error: "未找到该邮箱对应的注册用户。" });
        return;
      }
      const [enrolled] = await db
        .insert(cohortEnrollments)
        .values({
          cohortId,
          userId: targetUser.id,
          targetPathId: parsed.data.targetPathId,
          status: "active",
        })
        .onConflictDoNothing()
        .returning();
      res.status(201).json({ ok: true, enrollment: enrolled ?? null });
    } catch (err) {
      console.error("[/api/admin/cohorts/:id/enroll] error:", err);
      res.status(500).json({ error: "学员分班失败。" });
    }
  }
);

// Guarded AI endpoints (requireAuth + active entitlement + daily quota + requestId idempotency)
const reviewBodySchema = z.object({
  requestId: z.string().max(120).optional(),
  code: z.string().trim().min(1, "请先提供需要审查的代码片段。").max(15000),
  rules: z.array(z.string().max(300)).max(20).optional().default([]),
  customRule: z.string().max(2000).optional().default(""),
  mode: z.enum(["bugbot", "architecture"]).optional().default("bugbot"),
});

app.post("/api/review", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = reviewBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "请求参数无效。" });
    return;
  }

  const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
  if (!hasPaidAccess) {
    res.status(403).json({
      error: "服务端 AI 评审需具备有效学习权益；您仍可免费使用「本地 Bugbot 静态规则自检」。",
      code: "ENTITLEMENT_REQUIRED",
    });
    return;
  }

  const { code, rules, customRule, mode, requestId } = parsed.data;
  const activeRulesSummary =
    rules.length > 0
      ? rules.map((r) => `- ${r}`).join("\n")
      : "- 默认遵循 TypeScript 严格模式与安全基线";

  const systemInstruction = `你是 Cursor Bugbot 首席代码审查官，专门服务于“从 0 到 1 上线产品的独立开发者与产品经理”。
请用清晰、紧凑的中文 Markdown 结构输出代码审查报告，严格对齐以下四个维度：
1. 🛡️ 安全与权限门禁（SQL 注入、密钥泄露、鉴权遗漏、XSS）
2. ⚡ 性能与状态陷阱（N+1 查询、React 竞态或无限渲染、阻塞逻辑）
3. 📜 .cursor/rules 规范遵循度（对照用户启用的规则逐条指出违背点）
4. ✅ 可执行 Fix in Cursor 建议（直接给出可直接让 Cursor Agent 修改的最小化修复方案与 DoD 验证命令）

输出控制在 450 字以内，条理分明，禁止空话。`;

  const prompt = `审查模式: ${mode === "architecture" ? "架构与 SDD 对齐审查" : "Cursor Bugbot PR 自动审查"}
已挂载的 .cursor/rules (.mdc):
${activeRulesSummary}
${customRule.trim() ? `\n补充自定义规则:\n${customRule.trim()}` : ""}

待审查代码:
\`\`\`
${code.slice(0, 12000)}
\`\`\``;

  const result = await checkAndRunGuardedAiCall({
    userId: req.authContext!.user.id,
    requestId,
    endpoint: "/api/review",
    prompt,
    systemInstruction,
    onEmptyFallbackError:
      "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），或直接使用「本地 Bugbot 静态规则自检」进行即时离线演练。",
  });

  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({
    feedback: result.text || "未生成审查结果。",
    model: result.model,
    remainingToday: result.remainingToday,
  });
});

const synthesisSchema = z.object({
  requestId: z.string().max(120).optional(),
  topic: z.string().max(300).optional().default("从原型到可上线独立产品"),
  targetModule: z.string().max(40).optional().default("M3"),
  outputMode: z.enum(["lesson_outline", "cursor_rule", "hands_on_lab"]).optional().default("lesson_outline"),
  selectedBooks: z
    .array(
      z.object({
        title: z.string(),
        authorOrSource: z.string(),
        category: z.string(),
        coreTakeaways: z.string(),
        courseApplication: z.string(),
      })
    )
    .min(1, "请至少选择 1 本知识库书籍或论文后再生成课程内容。")
    .max(6),
});

app.post("/api/kb/synthesize", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = synthesisSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "备课请求参数无效。" });
    return;
  }
  const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
  if (!hasPaidAccess) {
    res.status(403).json({
      error: "服务端知识库 AI 备课合成需具备有效学习或教师权益。",
      code: "ENTITLEMENT_REQUIRED",
    });
    return;
  }

  const { topic, targetModule, outputMode, selectedBooks, requestId } = parsed.data;
  const booksContext = selectedBooks
    .slice(0, 6)
    .map(
      (b, idx) =>
        `[${idx + 1}] 《${b.title}》 (${b.authorOrSource} · ${b.category})\n核心要点: ${b.coreTakeaways}\n课程应用: ${b.courseApplication}`
    )
    .join("\n\n");

  const modeLabelMap = {
    lesson_outline: "课程模块扩展讲义大纲（含 3 张 PPT 核心要点 + 教学案例 + 课堂提问）",
    cursor_rule: "可直接放入项目 .cursor/rules/ 的 .mdc 规则文件（含 YAML frontmatter 与 DoD 检查项）",
    hands_on_lab: "面向独立开发者与产品经理的 Cursor 动手实验题（含 Plan Mode 提示词 + 验收标准）",
  } as const;

  const systemInstruction = `你是 Cursor AI Coding 实战课程的首席课程架构师，擅长将经典 AI/软件工程专著与前沿论文转化为“独立开发者与产品经理”可直接上手的实战课程内容。
要求：
1. 必须显式引用传入书单中的真实书名或论文名称作为理论/工程依据，严禁虚构未提供的书目。
2. 紧密结合 Cursor 特性（Plan 模式、@Files/@Codebase、.cursor/rules (.mdc)、MCP、Background Agents、Bugbot）。
3. 输出紧凑、可直接复制进课件或 Cursor 项目中，控制在 500 字以内。`;

  const prompt = `目标课程模块: ${targetModule}
生成形态: ${modeLabelMap[outputMode]}
教学主题: ${topic.trim() || "基于选定知识库构建课程模块"}

已选知识库参考资料:
${booksContext}`;

  const result = await checkAndRunGuardedAiCall({
    userId: req.authContext!.user.id,
    requestId,
    endpoint: "/api/kb/synthesize",
    prompt,
    systemInstruction,
    onEmptyFallbackError:
      "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），可使用左侧「即刻离线备课合成」生成结构化方案。",
  });

  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({
    content: result.text || "未生成备课方案。",
    model: result.model,
    remainingToday: result.remainingToday,
  });
});

const craftRulesSchema = z.object({
  requestId: z.string().max(120).optional(),
  task: z.string().trim().min(1, "请先输入目标开发任务或产品场景描述。").max(2500),
  targetType: z.enum(["mdc", "agents_md"]).optional().default("mdc"),
  globs: z.string().max(300).optional().default("src/**/*.{ts,tsx}"),
  alwaysApply: z.boolean().optional().default(false),
  constraints: z.array(z.string().max(300)).max(20).optional().default([]),
});

app.post("/api/craft-rules", requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = craftRulesSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "规则生成参数无效。" });
    return;
  }
  const hasPaidAccess = await hasActiveCourseEntitlement(req.authContext);
  if (!hasPaidAccess) {
    res.status(403).json({
      error: "服务端 AI 规则生成需具备有效学习权益；您仍可使用离线规则模板装配。",
      code: "ENTITLEMENT_REQUIRED",
    });
    return;
  }

  const { task, targetType, globs, alwaysApply, constraints, requestId } = parsed.data;
  const constraintsText =
    constraints.length > 0
      ? constraints.map((c) => `- ${c}`).join("\n")
      : "- TypeScript 严格模式，零 any，显式边界错误处理";

  const systemInstruction =
    targetType === "mdc"
      ? `你是 Cursor 上下文治理架构师，负责把开发任务转化为高信噪比的 .cursor/rules/*.mdc 规则文件。
输出规范：
1. 必须直接输出纯 .mdc 文件内容（不要用 \`\`\`markdown 代码块包裹），第一行即以 --- 开始 YAML frontmatter（包含 description、globs、alwaysApply）。
2. 正文控制在 45 行以内，包含：核心架构红线、必须遵循的 DO 与严禁踩坑的 DON'T（含简短代码约束）、以及末端 DoD 验证命令（如 npx tsc --noEmit && npm run lint）。
3. 精准聚焦目标任务，拒绝空泛套话。`
      : `你是 AI-First 全栈工程架构师，负责编写根目录跨工具 AGENTS.md 协作规范（供 Cursor Agent / CLI Agent / Bugbot 共同读取）。
输出规范：
1. 必须直接输出纯 Markdown 内容（不要用 \`\`\` 代码块外框包裹），以 # AGENTS.md 开头。
2. 总行数控制在 55 行以内，包含：项目角色与目录边界、开发/类型/构建/测试核对命令、不可逾越的安全与质量红线（含 DO / DON'T）、以及最小化 Diff 协作准则。
3. 紧密围绕用户输入的目标任务定制，语言简洁精准。`;

  const prompt = `目标文件格式: ${targetType === "mdc" ? ".cursor/rules/*.mdc" : "AGENTS.md"}
${targetType === "mdc" ? `指定 globs: ${globs.trim() || "src/**/*.{ts,tsx}"}\nalwaysApply: ${alwaysApply}` : "适用范围: 仓库根目录全量 Agent 上下文"}
目标开发任务:
${task.trim().slice(0, 2000)}

必选工程约束:
${constraintsText}`;

  const result = await checkAndRunGuardedAiCall({
    userId: req.authContext!.user.id,
    requestId,
    endpoint: "/api/craft-rules",
    prompt,
    systemInstruction,
    onEmptyFallbackError:
      "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），可使用「离线规则模板装配」即时生成结构化配置。",
  });

  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json({
    content: result.text.trim() || "未生成配置内容。",
    model: result.model,
    remainingToday: result.remainingToday,
  });
});
