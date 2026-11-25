import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  aiUsageLogs,
  evalRuns,
  examSessions,
  projectTemplates,
  projectWorkspaces,
  staticAuditRuns,
  submissionEvidences,
  submissionReviews,
  submissions,
} from "../../db/schema.ts";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore.ts";
import {
  EVAL_POLICY_VERSION,
  GEO_EVIDENCE_LAB_DISCLAIMER,
  ISOLATED_RUNNER_CONTRACT,
  STATIC_AUDIT_RULE_VERSION,
  VERIFICATION_MODES,
} from "../../data/projectTemplatesPublic.ts";
import { computePilotMetricsSummary } from "../../data/pilotMetrics.ts";
import type { AuthContext } from "../auth.ts";
import { checkAndRunGuardedAiCall } from "./aiService.ts";
import { ensureCatalogSeeded } from "./catalogSeed.ts";
import { CURRICULUM_VERSION } from "./curriculumService.ts";
import { runDeterministicStaticAudit } from "./staticAuditService.ts";

export async function getPublicProjectTemplates() {
  await ensureCatalogSeeded();
  return await db
    .select()
    .from(projectTemplates)
    .where(eq(projectTemplates.active, true))
    .orderBy(projectTemplates.id);
}

export async function getUserProjectWorkspaces(userId: number) {
  await ensureCatalogSeeded();
  const [templates, workspaces, audits, evals, userSubs] = await Promise.all([
    db.select().from(projectTemplates).where(eq(projectTemplates.active, true)),
    db
      .select()
      .from(projectWorkspaces)
      .where(eq(projectWorkspaces.userId, userId))
      .orderBy(desc(projectWorkspaces.updatedAt)),
    db
      .select()
      .from(staticAuditRuns)
      .where(eq(staticAuditRuns.userId, userId))
      .orderBy(desc(staticAuditRuns.createdAt))
      .limit(30),
    db
      .select()
      .from(evalRuns)
      .where(eq(evalRuns.userId, userId))
      .orderBy(desc(evalRuns.createdAt))
      .limit(30),
    db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.updatedAt)),
  ]);

  const subIds = userSubs.map((s) => s.id);
  const [evidenceRows, subAuditRows] =
    subIds.length > 0
      ? await Promise.all([
          db
            .select()
            .from(submissionEvidences)
            .where(inArray(submissionEvidences.submissionId, subIds)),
          db
            .select()
            .from(staticAuditRuns)
            .where(inArray(staticAuditRuns.submissionId, subIds))
            .orderBy(desc(staticAuditRuns.createdAt)),
        ])
      : [[], []];

  const submissionsHistory = userSubs.map((sub) => {
    const ev = evidenceRows.find((row) => row.submissionId === sub.id);
    const linkedAudit = subAuditRows.find((a) => a.submissionId === sub.id);
    const snapPassed =
      sub.staticAuditJson && typeof sub.staticAuditJson.passed === "boolean"
        ? sub.staticAuditJson.passed
        : null;
    const staticAuditPassed =
      linkedAudit !== undefined ? linkedAudit.passed : snapPassed;

    const aiPrereview = ev?.aiPrereviewJson ?? null;
    const hasAiPrereview = Boolean(aiPrereview);
    const aiPrereviewPassed =
      aiPrereview && typeof aiPrereview.staticPassed === "boolean"
        ? aiPrereview.staticPassed
        : null;

    return {
      id: sub.id,
      moduleId: sub.moduleId,
      artifactTitle: sub.artifactTitle,
      status: sub.status,
      curriculumVersion: sub.curriculumVersion,
      updatedAt: sub.updatedAt.toISOString(),
      workspaceId: ev?.workspaceId ?? null,
      staticAuditPassed,
      hasAiPrereview,
      aiPrereviewPassed,
    };
  });

  return {
    curriculumVersion: CURRICULUM_VERSION,
    staticAuditRuleVersion: STATIC_AUDIT_RULE_VERSION,
    evalPolicyVersion: EVAL_POLICY_VERSION,
    isolatedRunnerContract: ISOLATED_RUNNER_CONTRACT,
    templates,
    workspaces: workspaces.map((ws) => {
      const template = templates.find((t) => t.id === ws.templateId) ?? null;
      const wsAudits = audits.filter((a) => a.workspaceId === ws.id);
      const wsEvals = evals.filter((e) => e.workspaceId === ws.id);
      const wsEvidences = evidenceRows.filter((ev) => ev.workspaceId === ws.id);
      return {
        ...ws,
        template,
        latestAudit: wsAudits[0] ?? null,
        latestEval: wsEvals[0] ?? null,
        submissionCount: wsEvidences.length,
      };
    }),
    submissions: submissionsHistory,
    recentAudits: audits.slice(0, 10),
    recentEvals: evals.slice(0, 10),
  };
}

export async function createProjectWorkspace(input: {
  userId: number;
  templateSlug: string;
  title?: string;
  cohortId?: number | null;
  repoUrl?: string;
}) {
  await ensureCatalogSeeded();
  const tplRows = await db
    .select()
    .from(projectTemplates)
    .where(eq(projectTemplates.slug, input.templateSlug))
    .limit(1);
  const tpl = tplRows[0];
  if (!tpl) {
    return { ok: false as const, status: 404, error: "未找到对应项目 Starter Kit 模板。" };
  }

  const [created] = await db
    .insert(projectWorkspaces)
    .values({
      userId: input.userId,
      templateId: tpl.id,
      cohortId: input.cohortId ?? null,
      title: input.title?.trim() || tpl.title,
      repoUrl: input.repoUrl?.trim() || "",
      specMarkdown: tpl.starterSpecMarkdown,
      rulesMarkdown: tpl.starterRulesContent,
      handoffMarkdown: `# HANDOFF.md · ${tpl.title}\n\n- 允许修改目录：${tpl.allowedGlobsJson.join(", ")}\n- 禁止修改路径：${tpl.blockedPathsJson.join(", ")}\n- 运维与人工接管边界：${tpl.boundaryDisclaimer}`,
      firstHourCheckedJson: [],
      lifecycleState: "draft",
    })
    .returning();

  return { ok: true as const, workspace: created, template: tpl };
}

export async function updateProjectWorkspace(input: {
  userId: number;
  workspaceId: number;
  title?: string;
  repoUrl?: string;
  specMarkdown?: string;
  rulesMarkdown?: string;
  handoffMarkdown?: string;
  firstHourChecked?: string[];
  markArchived?: boolean;
}) {
  const rows = await db
    .select()
    .from(projectWorkspaces)
    .where(
      and(
        eq(projectWorkspaces.id, input.workspaceId),
        eq(projectWorkspaces.userId, input.userId)
      )
    )
    .limit(1);
  const ws = rows[0];
  if (!ws) {
    return { ok: false as const, status: 404, error: "未找到对应项目工作区。" };
  }

  let nextLifecycle = ws.lifecycleState;
  if (input.markArchived && ws.lifecycleState === "approved") {
    nextLifecycle = "archived";
  }

  const [updated] = await db
    .update(projectWorkspaces)
    .set({
      title: input.title !== undefined ? input.title.trim() : ws.title,
      repoUrl: input.repoUrl !== undefined ? input.repoUrl.trim() : ws.repoUrl,
      specMarkdown:
        input.specMarkdown !== undefined ? input.specMarkdown : ws.specMarkdown,
      rulesMarkdown:
        input.rulesMarkdown !== undefined ? input.rulesMarkdown : ws.rulesMarkdown,
      handoffMarkdown:
        input.handoffMarkdown !== undefined ? input.handoffMarkdown : ws.handoffMarkdown,
      firstHourCheckedJson:
        input.firstHourChecked !== undefined
          ? input.firstHourChecked
          : ws.firstHourCheckedJson,
      lifecycleState: nextLifecycle,
      updatedAt: new Date(),
    })
    .where(eq(projectWorkspaces.id, ws.id))
    .returning();

  return { ok: true as const, workspace: updated };
}

export async function buildProjectArchiveMarkdown(userId: number, workspaceId: number) {
  const wsRows = await db
    .select()
    .from(projectWorkspaces)
    .where(and(eq(projectWorkspaces.id, workspaceId), eq(projectWorkspaces.userId, userId)))
    .limit(1);
  const ws = wsRows[0];
  if (!ws) {
    return { ok: false as const, status: 404, error: "未找到对应项目工作区。" };
  }

  const [tplRows, audits, evals, evRows] = await Promise.all([
    db.select().from(projectTemplates).where(eq(projectTemplates.id, ws.templateId)).limit(1),
    db
      .select()
      .from(staticAuditRuns)
      .where(eq(staticAuditRuns.workspaceId, ws.id))
      .orderBy(desc(staticAuditRuns.createdAt))
      .limit(5),
    db
      .select()
      .from(evalRuns)
      .where(eq(evalRuns.workspaceId, ws.id))
      .orderBy(desc(evalRuns.createdAt))
      .limit(5),
    db
      .select()
      .from(submissionEvidences)
      .where(eq(submissionEvidences.workspaceId, ws.id))
      .orderBy(desc(submissionEvidences.createdAt))
      .limit(5),
  ]);

  const tpl = tplRows[0];
  const latestAudit = audits[0];
  const latestEval = evals[0];
  const latestEv = evRows[0];

  const evalDatasetVersion =
    latestEval?.reportJson &&
    typeof (latestEval.reportJson as { datasetVersion?: unknown }).datasetVersion === "string"
      ? (latestEval.reportJson as { datasetVersion: string }).datasetVersion
      : "v1.0";
  const evalPolicyVersion =
    latestEval?.reportJson &&
    typeof (latestEval.reportJson as { evalPolicyVersion?: unknown }).evalPolicyVersion === "string"
      ? (latestEval.reportJson as { evalPolicyVersion: string }).evalPolicyVersion
      : EVAL_POLICY_VERSION;

  const linkedSub = latestEv
    ? (
        await db
          .select()
          .from(submissions)
          .where(eq(submissions.id, latestEv.submissionId))
          .limit(1)
      )[0]
    : undefined;
  const rawNotes =
    linkedSub?.staticAuditJson &&
    typeof linkedSub.staticAuditJson.humanEvidenceNotes === "object" &&
    linkedSub.staticAuditJson.humanEvidenceNotes
      ? (linkedSub.staticAuditJson.humanEvidenceNotes as {
          decisionRationale?: string;
          knownLimitations?: string;
        })
      : null;

  const lines: string[] = [
    `# Coding Everything 项目学院 · 数字资产交付与 Handoff 归档`,
    ``,
    `- 项目名称：${ws.title}`,
    `- 模板类型：${tpl?.title || "Standard Starter Kit"} (${tpl?.trackType || "custom"})`,
    `- 课程版本 (curriculumVersion)：${linkedSub?.curriculumVersion || CURRICULUM_VERSION}`,
    `- 静态门禁规则版本：${STATIC_AUDIT_RULE_VERSION}`,
    `- Eval 策略版本：${evalPolicyVersion}`,
    `- 生命周期状态：${ws.lifecycleState}`,
    `- 仓库/PR 链接：${ws.repoUrl || "（未绑定外链）"}`,
    `- 首小时检查完成：${ws.firstHourCheckedJson.length} / ${tpl?.firstHourChecklistJson.length ?? 6}`,
    `- 导出时间：${new Date().toISOString()}`,
    ``,
    `> ${tpl?.boundaryDisclaimer || GEO_EVIDENCE_LAB_DISCLAIMER}`,
    ...(tpl?.targetModuleId === "m13-gov" ? [`> ${M13_GOV_SIMULATION_DISCLAIMER}`] : []),
    ``,
    `## 0. 验证边界说明与隔离 Runner 契约`,
    `- **${VERIFICATION_MODES.static_material_check.label}**：${VERIFICATION_MODES.static_material_check.boundaryNote}`,
    `- **${VERIFICATION_MODES.simulated_eval.label}**：${VERIFICATION_MODES.simulated_eval.boundaryNote}`,
    `- **${VERIFICATION_MODES.real_execution_pending_runner.label}**：${VERIFICATION_MODES.real_execution_pending_runner.boundaryNote}`,
    `- **${VERIFICATION_MODES.human_approval.label}**：${VERIFICATION_MODES.human_approval.boundaryNote}`,
    `- **隔离沙盒契约 (${ISOLATED_RUNNER_CONTRACT.executionStatus})**：禁止在 ${ISOLATED_RUNNER_CONTRACT.forbiddenRuntime} 运行；公网=${ISOLATED_RUNNER_CONTRACT.networkEgress}、密钥=${ISOLATED_RUNNER_CONTRACT.secretAccess}、超时=${ISOLATED_RUNNER_CONTRACT.maxRuntimeSeconds}s、内存=${ISOLATED_RUNNER_CONTRACT.maxMemoryMb}MB。`,
    ``,
    `## 1. SPEC.md（需求与系统边界）`,
    ``,
    ws.specMarkdown,
    ``,
    `## 2. 项目约束规则（.cursor/rules）`,
    ``,
    "```markdown",
    ws.rulesMarkdown,
    "```",
    ``,
    `## 3. ${VERIFICATION_MODES.static_material_check.label}证据（规则版本 ${STATIC_AUDIT_RULE_VERSION}）`,
    latestAudit
      ? `- Audit Run #${latestAudit.id} · 结果：${latestAudit.passed ? "PASSED" : "BLOCKED"}（阻塞项 ${latestAudit.blockingCount} · 警告项 ${latestAudit.warningCount}）\n- 变更文件：${latestAudit.changedFilesJson.join(", ") || "无"}\n- 审计时间：${latestAudit.createdAt.toISOString()}`
      : `- 尚未执行服务端静态审计记录`,
    ``,
    `## 4. ${VERIFICATION_MODES.simulated_eval.label}记录`,
    latestEval
      ? `- Eval Run #${latestEval.id} · 数据集：${latestEval.datasetSlug} @ ${evalDatasetVersion} · 策略：${evalPolicyVersion} · 结果：${latestEval.passed ? "PASSED" : "FAILED"}\n- Recall@K：${latestEval.recallAtK}% ｜ Citation Precision：${latestEval.citationPrecision}%\n- ACL 越权数：${latestEval.aclLeakCount} ｜ Tombstone 过期召回：${latestEval.staleRecallCount}\n- 拒答准确率：${latestEval.refusalAccuracy}% ｜ 步数熔断率：${latestEval.loopCircuitBreakRate}%`
      : `- 尚未运行标准化 Eval 评测`,
    ``,
    `## 5. 最近一次提交 Diff、架构取舍与${VERIFICATION_MODES.real_execution_pending_runner.shortLabel}`,
    latestEv
      ? `### Changed Files\n${latestEv.changedFilesJson.join(", ") || "无"}\n\n### 模式选择理由与备选方案\n${rawNotes?.decisionRationale || "（未单独填写）"}\n\n### 已知限制与风险边界\n${rawNotes?.knownLimitations || "（未单独填写）"}\n\n### Diff 摘要\n\`\`\`diff\n${latestEv.diffSummary || "无"}\n\`\`\`\n\n### 学员自贴命令验证输出\n\`\`\`text\n${latestEv.testCommandLog || "无"}\n\`\`\``
      : `- 尚未生成提交证据记录`,
    ``,
    `## 6. HANDOFF.md（运维、成本与人工接管说明）`,
    ``,
    ws.handoffMarkdown || "（待补充运维与接管说明）",
    ``,
  ];

  return {
    ok: true as const,
    filename: `${tpl?.slug || "project"}-handoff-${ws.id}.md`,
    markdown: lines.join("\n"),
  };
}

export async function generateInstructorAiPrereview(input: {
  authContext: AuthContext;
  submissionId: number;
  requestId?: string;
}) {
  const subRows = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, input.submissionId))
    .limit(1);
  const sub = subRows[0];
  if (!sub) {
    return { ok: false as const, status: 404, error: "未找到对应作业提交记录。" };
  }

  if (!input.authContext.isAdmin) {
    if (!sub.cohortId || !input.authContext.assignedCohortIds.includes(sub.cohortId)) {
      return {
        ok: false as const,
        status: 403,
        error: "越权拒绝：您只能对所带班级内的提交生成 AI 预审草稿。",
      };
    }
  }

  const [evRows, auditRows] = await Promise.all([
    db
      .select()
      .from(submissionEvidences)
      .where(eq(submissionEvidences.submissionId, sub.id))
      .limit(1),
    db
      .select()
      .from(staticAuditRuns)
      .where(eq(staticAuditRuns.submissionId, sub.id))
      .orderBy(desc(staticAuditRuns.createdAt))
      .limit(1),
  ]);

  const evidence = evRows[0];
  const audit = auditRows[0];

  // Run deterministic check summary first
  const localCheck = runDeterministicStaticAudit({
    moduleId: sub.moduleId,
    codeOrArtifactText: sub.artifactText,
    specText: evidence?.specSnapshot,
    rulesText: evidence?.rulesSnapshot,
    diffSummary: evidence?.diffSummary,
    testCommandLog: evidence?.testCommandLog,
    changedFiles: evidence?.changedFilesJson,
    requireProjectStructure: true,
  });

  let draftMarkdown = "";
  let usedModel = false;

  if (process.env.GEMINI_API_KEY) {
    const prompt = `作业标题：${sub.artifactTitle}
模块：${sub.moduleId}
静态审计状态：passed=${localCheck.passed}, blocking=${localCheck.blockingCount}, warnings=${localCheck.warningCount}
变更文件：${evidence?.changedFilesJson?.join(", ") || "未列出"}
SPEC 摘要：${(evidence?.specSnapshot || "").slice(0, 1200)}
测试日志：${(evidence?.testCommandLog || "").slice(0, 1000)}
提交正文：${sub.artifactText.slice(0, 3000)}`;

    const aiRes = await checkAndRunGuardedAiCall({
      userId: input.authContext.user.id,
      requestId: input.requestId,
      endpoint: "/api/instructor/prereview",
      prompt,
      systemInstruction: `你是 Coding Everything 项目学院的“教师审校预审助手”。
你的输出仅作为【人类导师的辅助初筛草稿】，严禁宣布“已通过”或直接授予技能。
请用简洁中文按以下 3 点给出初筛意见（总字数 ≤ 300 字）：
1. 规格与边界核对（SPEC / 权限 / 文件范围）
2. 测试证据与风险警示（是否存在只写过程无日志、或潜在越权/过分承诺风险）
3. 给导师的建议决断倾向（建议：人工复核通过 / 建议退回补充某项具体证据）`,
      onEmptyFallbackError: "",
    });

    if (aiRes.ok && aiRes.text.trim()) {
      draftMarkdown = aiRes.text.trim();
      usedModel = true;
    }
  }

  if (!draftMarkdown) {
    const missingItems: string[] = [];
    if (!evidence?.specSnapshot || evidence.specSnapshot.trim().length < 20) {
      missingItems.push("补充完整 SPEC.md 边界条件");
    }
    if (!evidence?.testCommandLog || evidence.testCommandLog.trim().length < 10) {
      missingItems.push("附带可复现的测试/Eval 命令日志");
    }
    if ((evidence?.changedFilesJson?.length ?? 0) === 0) {
      missingItems.push("列出具体变更文件清单 (changedFiles)");
    }

    draftMarkdown = [
      `[AI 预审初筛草稿 · 仅供教师参考，不代表人工通过]`,
      `1. 静态门禁核查：${audit?.passed ?? localCheck.passed ? "通过（0 个阻塞项）" : `存在 ${localCheck.blockingCount} 个阻塞项`}；警告项 ${localCheck.warningCount} 个。`,
      `2. 证据完整度：${missingItems.length === 0 ? "SPEC、变更清单与测试日志齐备。" : `建议核对以下缺口：${missingItems.join("；")}。`}`,
      `3. 建议导师人工复核重点：抽查核心鉴权/ACL 逻辑与边界免责声明是否落地，确认无误后再点击 Approve 决定是否授证。`,
    ].join("\n");
  }

  const prereviewPayload = {
    advisoryOnly: true,
    generatedAt: new Date().toISOString(),
    generatedByUserId: input.authContext.user.id,
    usedAiModel: usedModel,
    staticPassed: audit?.passed ?? localCheck.passed,
    warningCount: localCheck.warningCount,
    draftMarkdown,
  };

  if (evidence) {
    await db
      .update(submissionEvidences)
      .set({ aiPrereviewJson: prereviewPayload })
      .where(eq(submissionEvidences.id, evidence.id));

    if (evidence.workspaceId) {
      await db
        .update(projectWorkspaces)
        .set({ lifecycleState: "ai_prereviewed", updatedAt: new Date() })
        .where(
          and(
            eq(projectWorkspaces.id, evidence.workspaceId),
            eq(projectWorkspaces.lifecycleState, "submitted")
          )
        );
    }
  } else {
    await db.insert(submissionEvidences).values({
      submissionId: sub.id,
      aiPrereviewJson: prereviewPayload,
    });
  }

  return { ok: true as const, prereview: prereviewPayload };
}

export async function getAdminPilotMetrics() {
  await ensureCatalogSeeded();
  const [
    templates,
    workspaces,
    audits,
    allSubmissions,
    evidences,
    reviews,
    evals,
    [examStats],
    [aiStats],
  ] = await Promise.all([
    db.select().from(projectTemplates),
    db
      .select({
        id: projectWorkspaces.id,
        userId: projectWorkspaces.userId,
        templateId: projectWorkspaces.templateId,
        lifecycleState: projectWorkspaces.lifecycleState,
        createdAt: projectWorkspaces.createdAt,
      })
      .from(projectWorkspaces),
    db
      .select({
        id: staticAuditRuns.id,
        userId: staticAuditRuns.userId,
        workspaceId: staticAuditRuns.workspaceId,
        moduleId: staticAuditRuns.moduleId,
        passed: staticAuditRuns.passed,
        createdAt: staticAuditRuns.createdAt,
      })
      .from(staticAuditRuns),
    db
      .select({
        id: submissions.id,
        userId: submissions.userId,
        moduleId: submissions.moduleId,
        status: submissions.status,
        submittedAt: submissions.submittedAt,
        staticAuditJson: submissions.staticAuditJson,
      })
      .from(submissions),
    db
      .select({
        submissionId: submissionEvidences.submissionId,
        workspaceId: submissionEvidences.workspaceId,
        specSnapshot: submissionEvidences.specSnapshot,
        diffSummary: submissionEvidences.diffSummary,
        testCommandLog: submissionEvidences.testCommandLog,
        changedFilesJson: submissionEvidences.changedFilesJson,
        handoffSummary: submissionEvidences.handoffSummary,
        evalRunId: submissionEvidences.evalRunId,
      })
      .from(submissionEvidences),
    db
      .select({
        id: submissionReviews.id,
        submissionId: submissionReviews.submissionId,
        decision: submissionReviews.decision,
        createdAt: submissionReviews.createdAt,
      })
      .from(submissionReviews),
    db
      .select({
        id: evalRuns.id,
        userId: evalRuns.userId,
        workspaceId: evalRuns.workspaceId,
        moduleId: evalRuns.moduleId,
        datasetSlug: evalRuns.datasetSlug,
        passed: evalRuns.passed,
        createdAt: evalRuns.createdAt,
      })
      .from(evalRuns),
    db
      .select({
        completedExams: sql<number>`count(*) filter (where ${examSessions.status} = 'completed')::int`,
        passedExams: sql<number>`count(*) filter (where ${examSessions.passed} = true)::int`,
      })
      .from(examSessions),
    db
      .select({
        totalAiCalls: sql<number>`count(*) filter (where ${aiUsageLogs.status} = 'ok')::int`,
        prereviewCalls: sql<number>`count(*) filter (where ${aiUsageLogs.endpoint} = '/api/instructor/prereview' and ${aiUsageLogs.status} = 'ok')::int`,
        tutorCalls: sql<number>`count(*) filter (where ${aiUsageLogs.endpoint} = '/api/tutor/ask' and ${aiUsageLogs.status} = 'ok')::int`,
      })
      .from(aiUsageLogs),
  ]);

  const tplById = new Map(templates.map((t) => [t.id, t]));
  const evBySubId = new Map(evidences.map((ev) => [ev.submissionId, ev]));

  const totalWorkspaces = workspaces.length;
  const completedProjects = workspaces.filter(
    (w) => w.lifecycleState === "approved" || w.lifecycleState === "archived"
  ).length;

  const totalAudits = audits.length;
  const blockedAudits = audits.filter((a) => !a.passed).length;
  const staticBlockRatePct =
    totalAudits > 0 ? Math.round((blockedAudits / totalAudits) * 100) : 0;

  const totalSubmissions = allSubmissions.length;
  const approvedSubmissions = allSubmissions.filter((s) => s.status === "approved").length;
  const changesRequestedSubmissions = allSubmissions.filter(
    (s) => s.status === "changes_requested"
  ).length;
  const submissionPassRatePct =
    totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;

  const totalEvalRuns = evals.length;
  const passedEvalRuns = evals.filter((e) => e.passed).length;

  const stage4 = computePilotMetricsSummary({
    workspaces: workspaces.map((ws) => {
      const tpl = tplById.get(ws.templateId);
      return {
        id: ws.id,
        userId: ws.userId,
        templateSlug: tpl?.slug ?? null,
        trackType: tpl?.trackType ?? null,
        targetModuleId: tpl?.targetModuleId ?? null,
        lifecycleState: ws.lifecycleState,
        createdAt: ws.createdAt,
      };
    }),
    audits,
    evals,
    submissions: allSubmissions.map((sub) => {
      const ev = evBySubId.get(sub.id);
      return {
        id: sub.id,
        userId: sub.userId,
        moduleId: sub.moduleId,
        status: sub.status,
        submittedAt: sub.submittedAt,
        staticAuditJson: sub.staticAuditJson,
        workspaceId: ev?.workspaceId ?? null,
        specSnapshot: ev?.specSnapshot ?? null,
        diffSummary: ev?.diffSummary ?? null,
        testCommandLog: ev?.testCommandLog ?? null,
        changedFiles: ev?.changedFilesJson ?? null,
        handoffSummary: ev?.handoffSummary ?? null,
        linkedEvalRunId: ev?.evalRunId ?? null,
      };
    }),
    reviews,
  });

  return {
    totalWorkspaces,
    completedProjects,
    totalSubmissions,
    approvedSubmissions,
    changesRequestedSubmissions,
    submissionPassRatePct,
    totalAudits,
    blockedAudits,
    staticBlockRatePct,
    totalReviews: reviews.length,
    totalEvalRuns,
    passedEvalRuns,
    completedExams: examStats?.completedExams ?? 0,
    passedExams: examStats?.passedExams ?? 0,
    totalAiCalls: aiStats?.totalAiCalls ?? 0,
    prereviewCalls: aiStats?.prereviewCalls ?? 0,
    tutorCalls: aiStats?.tutorCalls ?? 0,
    stage4,
  };
}
