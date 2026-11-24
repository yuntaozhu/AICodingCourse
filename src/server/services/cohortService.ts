import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  cohortEnrollments,
  cohortInstructors,
  cohortMilestones,
  cohorts,
  projectTemplates,
  projectWorkspaces,
  quizAttempts,
  skillGrants,
  staticAuditRuns,
  submissionEvidences,
  submissionReviews,
  submissions,
  users,
} from "../../db/schema.ts";
import { COURSE_SKILLS } from "../../data/courseSkills.ts";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore.ts";
import type { AuthContext } from "../auth.ts";
import { CURRICULUM_VERSION } from "./curriculumService.ts";
import {
  recordStaticAuditRun,
  runDeterministicStaticAudit,
} from "./staticAuditService.ts";

export async function getLearnerCohortView(userId: number) {
  const [enrollmentRows, userSubmissions] = await Promise.all([
    db.select().from(cohortEnrollments).where(eq(cohortEnrollments.userId, userId)),
    db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.updatedAt)),
  ]);

  const submissionIds = userSubmissions.map((s) => s.id);
  const [reviewRows, evidenceRows, auditRows] = await Promise.all([
    submissionIds.length > 0
      ? db
          .select()
          .from(submissionReviews)
          .where(inArray(submissionReviews.submissionId, submissionIds))
          .orderBy(desc(submissionReviews.createdAt))
      : [],
    submissionIds.length > 0
      ? db
          .select()
          .from(submissionEvidences)
          .where(inArray(submissionEvidences.submissionId, submissionIds))
      : [],
    submissionIds.length > 0
      ? db
          .select()
          .from(staticAuditRuns)
          .where(inArray(staticAuditRuns.submissionId, submissionIds))
          .orderBy(desc(staticAuditRuns.createdAt))
      : [],
  ]);

  const reviewsBySubmissionId: Record<number, typeof reviewRows> = {};
  for (const r of reviewRows) {
    if (!reviewsBySubmissionId[r.submissionId]) {
      reviewsBySubmissionId[r.submissionId] = [];
    }
    reviewsBySubmissionId[r.submissionId].push(r);
  }

  const evidenceBySubmissionId: Record<number, (typeof evidenceRows)[number]> = {};
  for (const ev of evidenceRows) {
    evidenceBySubmissionId[ev.submissionId] = ev;
  }

  const auditBySubmissionId: Record<number, (typeof auditRows)[number]> = {};
  for (const a of auditRows) {
    if (a.submissionId && !auditBySubmissionId[a.submissionId]) {
      auditBySubmissionId[a.submissionId] = a;
    }
  }

  if (enrollmentRows.length === 0) {
    return {
      enrolled: false as const,
      cohorts: [],
      submissions: userSubmissions,
      reviewsBySubmissionId,
      evidenceBySubmissionId,
      auditBySubmissionId,
    };
  }

  const cohortIds = enrollmentRows.map((e) => e.cohortId);
  const [cohortRows, milestoneRows] = await Promise.all([
    db.select().from(cohorts).where(inArray(cohorts.id, cohortIds)),
    db
      .select()
      .from(cohortMilestones)
      .where(inArray(cohortMilestones.cohortId, cohortIds)),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  return {
    enrolled: true as const,
    cohorts: cohortRows.map((c) => {
      const enrollment = enrollmentRows.find((e) => e.cohortId === c.id);
      const milestones = milestoneRows
        .filter((m) => m.cohortId === c.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => {
          const latestSub = userSubmissions.find((s) => s.milestoneId === m.id);
          const isOverdue = !latestSub && m.dueDate < today;
          return {
            ...m,
            latestSubmissionStatus: latestSub?.status ?? null,
            isOverdue,
          };
        });
      return {
        ...c,
        enrollment,
        milestones,
      };
    }),
    submissions: userSubmissions,
    reviewsBySubmissionId,
    evidenceBySubmissionId,
    auditBySubmissionId,
  };
}

export async function createOrResubmitLearnerWork(input: {
  userId: number;
  cohortId?: number | null;
  milestoneId?: number | null;
  moduleId: string;
  labId?: string | null;
  artifactTitle: string;
  artifactText: string;
  artifactUrl?: string | null;
  workspaceId?: number | null;
  specSnapshot?: string;
  rulesSnapshot?: string;
  changedFiles?: string[];
  diffSummary?: string;
  testCommandLog?: string;
  handoffSummary?: string;
  evalRunId?: number | null;
  hasPaidAccess: boolean;
}) {
  if (!input.hasPaidAccess && input.moduleId !== "m1") {
    return { ok: false as const, status: 403, error: "提交付费模块作业需具备有效课程或班级权益。" };
  }

  if (input.cohortId) {
    const enrolled = await db
      .select()
      .from(cohortEnrollments)
      .where(
        and(
          eq(cohortEnrollments.cohortId, input.cohortId),
          eq(cohortEnrollments.userId, input.userId)
        )
      )
      .limit(1);
    if (enrolled.length === 0) {
      return { ok: false as const, status: 403, error: "您未加入该班级，无法向该班级提交作业。" };
    }
  }

  let allowedGlobs: string[] = [];
  let blockedPaths: string[] | undefined;
  let workspaceRow: typeof projectWorkspaces.$inferSelect | undefined;

  if (input.workspaceId) {
    const wsRows = await db
      .select()
      .from(projectWorkspaces)
      .where(
        and(
          eq(projectWorkspaces.id, input.workspaceId),
          eq(projectWorkspaces.userId, input.userId)
        )
      )
      .limit(1);
    workspaceRow = wsRows[0];
    if (!workspaceRow) {
      return { ok: false as const, status: 404, error: "未找到关联的个人项目工作区。" };
    }
    const tplRows = await db
      .select()
      .from(projectTemplates)
      .where(eq(projectTemplates.id, workspaceRow.templateId))
      .limit(1);
    if (tplRows[0]) {
      allowedGlobs = tplRows[0].allowedGlobsJson;
      blockedPaths = tplRows[0].blockedPathsJson;
    }
  }

  // Authoritative server-side static audit gate (never trust client staticAuditJson)
  const audit = runDeterministicStaticAudit({
    moduleId: input.moduleId,
    codeOrArtifactText: input.artifactText,
    specText: input.specSnapshot ?? workspaceRow?.specMarkdown,
    rulesText: input.rulesSnapshot ?? workspaceRow?.rulesMarkdown,
    diffSummary: input.diffSummary,
    testCommandLog: input.testCommandLog,
    changedFiles: input.changedFiles,
    allowedGlobs,
    blockedPaths,
    requireProjectStructure: Boolean(input.workspaceId),
  });

  if (!audit.passed) {
    await recordStaticAuditRun({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      submissionId: null,
      moduleId: input.moduleId,
      audit,
    });

    const firstBlocking = audit.findings.find((f) => f.severity === "blocking");
    return {
      ok: false as const,
      status: 422,
      error: `服务端静态门禁阻断提交（发现 ${audit.blockingCount} 项高危违规）：${firstBlocking?.title || "请修复安全或范围违规项"}`,
      audit,
    };
  }

  const serverAuditSnapshot: Record<string, unknown> = {
    source: "server_static_audit",
    auditedAt: audit.auditedAt,
    passed: audit.passed,
    blockingCount: audit.blockingCount,
    warningCount: audit.warningCount,
    findingsCount: audit.findings.length,
    findings: audit.findings,
    changedFiles: audit.changedFiles,
  };

  let submissionRecord: typeof submissions.$inferSelect;

  // If resubmitting for a milestone where a submission exists, update it
  if (input.milestoneId) {
    const existing = await db
      .select()
      .from(submissions)
      .where(
        and(
          eq(submissions.userId, input.userId),
          eq(submissions.milestoneId, input.milestoneId)
        )
      )
      .limit(1);

    if (existing[0]) {
      const [updated] = await db
        .update(submissions)
        .set({
          artifactTitle: input.artifactTitle.trim(),
          artifactText: input.artifactText.trim(),
          artifactUrl: input.artifactUrl?.trim() || null,
          staticAuditJson: serverAuditSnapshot,
          status: "submitted",
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existing[0].id))
        .returning();
      submissionRecord = updated;
    } else {
      const [created] = await db
        .insert(submissions)
        .values({
          userId: input.userId,
          cohortId: input.cohortId ?? null,
          milestoneId: input.milestoneId ?? null,
          moduleId: input.moduleId,
          labId: input.labId ?? null,
          curriculumVersion: CURRICULUM_VERSION,
          artifactTitle: input.artifactTitle.trim(),
          artifactText: input.artifactText.trim(),
          artifactUrl: input.artifactUrl?.trim() || null,
          staticAuditJson: serverAuditSnapshot,
          status: "submitted",
        })
        .returning();
      submissionRecord = created;
    }
  } else {
    const [created] = await db
      .insert(submissions)
      .values({
        userId: input.userId,
        cohortId: input.cohortId ?? null,
        milestoneId: null,
        moduleId: input.moduleId,
        labId: input.labId ?? null,
        curriculumVersion: CURRICULUM_VERSION,
        artifactTitle: input.artifactTitle.trim(),
        artifactText: input.artifactText.trim(),
        artifactUrl: input.artifactUrl?.trim() || null,
        staticAuditJson: serverAuditSnapshot,
        status: "submitted",
      })
      .returning();
    submissionRecord = created;
  }

  const savedAudit = await recordStaticAuditRun({
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    submissionId: submissionRecord.id,
    moduleId: input.moduleId,
    audit,
  });

  const existingEv = await db
    .select()
    .from(submissionEvidences)
    .where(eq(submissionEvidences.submissionId, submissionRecord.id))
    .limit(1);

  if (existingEv[0]) {
    await db
      .update(submissionEvidences)
      .set({
        workspaceId: input.workspaceId ?? existingEv[0].workspaceId,
        specSnapshot: input.specSnapshot ?? workspaceRow?.specMarkdown ?? "",
        rulesSnapshot: input.rulesSnapshot ?? workspaceRow?.rulesMarkdown ?? "",
        changedFilesJson: audit.changedFiles,
        diffSummary: input.diffSummary ?? "",
        testCommandLog: input.testCommandLog ?? "",
        handoffSummary: input.handoffSummary ?? workspaceRow?.handoffMarkdown ?? "",
        evalRunId: input.evalRunId ?? null,
        staticAuditRunId: savedAudit.id,
      })
      .where(eq(submissionEvidences.id, existingEv[0].id));
  } else {
    await db.insert(submissionEvidences).values({
      submissionId: submissionRecord.id,
      workspaceId: input.workspaceId ?? null,
      specSnapshot: input.specSnapshot ?? workspaceRow?.specMarkdown ?? "",
      rulesSnapshot: input.rulesSnapshot ?? workspaceRow?.rulesMarkdown ?? "",
      changedFilesJson: audit.changedFiles,
      diffSummary: input.diffSummary ?? "",
      testCommandLog: input.testCommandLog ?? "",
      handoffSummary: input.handoffSummary ?? workspaceRow?.handoffMarkdown ?? "",
      evalRunId: input.evalRunId ?? null,
      staticAuditRunId: savedAudit.id,
    });
  }

  if (workspaceRow) {
    await db
      .update(projectWorkspaces)
      .set({ lifecycleState: "submitted", updatedAt: new Date() })
      .where(eq(projectWorkspaces.id, workspaceRow.id));
  }

  return { ok: true as const, submission: submissionRecord, audit: savedAudit };
}

export async function getInstructorCockpitData(authContext: AuthContext) {
  // Strict cohort scoping: instructors only see cohorts assigned to them unless admin
  const cohortRows = authContext.isAdmin
    ? await db.select().from(cohorts)
    : authContext.assignedCohortIds.length > 0
    ? await db
        .select()
        .from(cohorts)
        .where(inArray(cohorts.id, authContext.assignedCohortIds))
    : [];

  if (cohortRows.length === 0) {
    return {
      scopedCohortCount: 0,
      cohorts: [],
      queues: {
        submitted: [],
        overdue: [],
        changes_requested: [],
        approved: [],
      },
      skills: COURSE_SKILLS.map((s) => ({ id: s.id, title: s.title, shortLabel: s.shortLabel })),
    };
  }

  const scopedCohortIds = cohortRows.map((c) => c.id);
  const [enrollmentRows, milestoneRows, subRows] = await Promise.all([
    db
      .select()
      .from(cohortEnrollments)
      .where(inArray(cohortEnrollments.cohortId, scopedCohortIds)),
    db
      .select()
      .from(cohortMilestones)
      .where(inArray(cohortMilestones.cohortId, scopedCohortIds)),
    db
      .select()
      .from(submissions)
      .where(inArray(submissions.cohortId, scopedCohortIds))
      .orderBy(desc(submissions.updatedAt)),
  ]);

  const learnerIds = Array.from(
    new Set([
      ...enrollmentRows.map((e) => e.userId),
      ...subRows.map((s) => s.userId),
    ])
  );
  const learnerRows =
    learnerIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, learnerIds))
      : [];
  const learnerMap = new Map(learnerRows.map((u) => [u.id, u]));

  const subIds = subRows.map((s) => s.id);
  const [reviewRows, evidenceRows, auditRows] = await Promise.all([
    subIds.length > 0
      ? db
          .select()
          .from(submissionReviews)
          .where(inArray(submissionReviews.submissionId, subIds))
          .orderBy(desc(submissionReviews.createdAt))
      : [],
    subIds.length > 0
      ? db
          .select()
          .from(submissionEvidences)
          .where(inArray(submissionEvidences.submissionId, subIds))
      : [],
    subIds.length > 0
      ? db
          .select()
          .from(staticAuditRuns)
          .where(inArray(staticAuditRuns.submissionId, subIds))
          .orderBy(desc(staticAuditRuns.createdAt))
      : [],
  ]);

  const enrichedSubs = subRows.map((s) => {
    const learner = learnerMap.get(s.userId);
    const cohort = cohortRows.find((c) => c.id === s.cohortId);
    const milestone = milestoneRows.find((m) => m.id === s.milestoneId);
    const evidence = evidenceRows.find((ev) => ev.submissionId === s.id) ?? null;
    const latestAudit = auditRows.find((a) => a.submissionId === s.id) ?? null;
    return {
      ...s,
      learnerEmail: learner?.email ?? "",
      learnerName: learner?.displayName || learner?.email || `Learner #${s.userId}`,
      cohortTitle: cohort?.title ?? "",
      milestoneTitle: milestone?.title ?? `${s.moduleId.toUpperCase()} 自由提交`,
      reviews: reviewRows.filter((r) => r.submissionId === s.id),
      evidence,
      latestAudit,
      simulationDisclaimer:
        s.moduleId === "m13-gov" ? M13_GOV_SIMULATION_DISCLAIMER : undefined,
    };
  });

  const today = new Date().toISOString().slice(0, 10);
  const overdueItems: Array<{
    cohortId: number;
    cohortTitle: string;
    milestoneId: number;
    milestoneTitle: string;
    moduleId: string;
    dueDate: string;
    userId: number;
    learnerName: string;
    learnerEmail: string;
  }> = [];

  for (const enr of enrollmentRows) {
    const cMilestones = milestoneRows.filter(
      (m) => m.cohortId === enr.cohortId && m.dueDate < today
    );
    const cohort = cohortRows.find((c) => c.id === enr.cohortId);
    const learner = learnerMap.get(enr.userId);
    for (const ms of cMilestones) {
      const hasSubmission = subRows.some(
        (s) => s.userId === enr.userId && s.milestoneId === ms.id
      );
      if (!hasSubmission) {
        overdueItems.push({
          cohortId: enr.cohortId,
          cohortTitle: cohort?.title ?? "",
          milestoneId: ms.id,
          milestoneTitle: ms.title,
          moduleId: ms.moduleId,
          dueDate: ms.dueDate,
          userId: enr.userId,
          learnerName: learner?.displayName || learner?.email || `Learner #${enr.userId}`,
          learnerEmail: learner?.email ?? "",
        });
      }
    }
  }

  return {
    scopedCohortCount: cohortRows.length,
    cohorts: cohortRows.map((c) => ({
      ...c,
      learnerCount: enrollmentRows.filter((e) => e.cohortId === c.id).length,
      milestones: milestoneRows.filter((m) => m.cohortId === c.id),
    })),
    queues: {
      submitted: enrichedSubs.filter((s) => s.status === "submitted"),
      overdue: overdueItems,
      changes_requested: enrichedSubs.filter((s) => s.status === "changes_requested"),
      approved: enrichedSubs.filter((s) => s.status === "approved"),
    },
    skills: COURSE_SKILLS.map((s) => ({ id: s.id, title: s.title, shortLabel: s.shortLabel })),
  };
}

export async function reviewCohortSubmission(input: {
  authContext: AuthContext;
  submissionId: number;
  decision: "changes_requested" | "approved";
  feedbackMarkdown: string;
  grantSkillId?: string | null;
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
    if (
      !sub.cohortId ||
      !input.authContext.assignedCohortIds.includes(sub.cohortId)
    ) {
      return {
        ok: false as const,
        status: 403,
        error: "越权拒绝：您只能批改自己负责班级（Cohort）内的学员提交。",
      };
    }
  }

  // Three-lock certification gate when approving & granting an advanced evidence-gated skill
  let verifiedSkillTarget: (typeof COURSE_SKILLS)[number] | null = null;
  if (input.decision === "approved" && input.grantSkillId) {
    const validSkill = COURSE_SKILLS.find((s) => s.id === input.grantSkillId);
    if (!validSkill) {
      return { ok: false as const, status: 400, error: "无效的目标认证技能 ID。" };
    }

    const [auditRows, evRows, passedQuizRows] = await Promise.all([
      db
        .select()
        .from(staticAuditRuns)
        .where(eq(staticAuditRuns.submissionId, sub.id))
        .orderBy(desc(staticAuditRuns.createdAt))
        .limit(1),
      db
        .select()
        .from(submissionEvidences)
        .where(eq(submissionEvidences.submissionId, sub.id))
        .limit(1),
      db
        .select()
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, sub.userId), eq(quizAttempts.passed, true)))
        .limit(1),
    ]);

    const latestAudit = auditRows[0];
    const evidence = evRows[0];

    // Verify server static audit passes (re-verify on artifactText if legacy row without staticAuditRuns)
    const staticPassed = latestAudit
      ? latestAudit.passed
      : runDeterministicStaticAudit({
          moduleId: sub.moduleId,
          codeOrArtifactText: sub.artifactText,
          specText: evidence?.specSnapshot,
          rulesText: evidence?.rulesSnapshot,
          testCommandLog: evidence?.testCommandLog,
          changedFiles: evidence?.changedFilesJson,
        }).passed;

    if (!staticPassed) {
      return {
        ok: false as const,
        status: 409,
        error: "三锁授证门禁拦截：该提交未通过服务端静态安全/规则审计，不能授予能力认证。",
      };
    }

    const hasPracticalEvidence =
      Boolean(evidence?.testCommandLog && evidence.testCommandLog.trim().length >= 8) ||
      Boolean(evidence?.evalRunId) ||
      sub.artifactText.trim().length >= 20;

    if (
      validSkill.acceptedMethods.includes("starter-repo-evidence") &&
      !hasPracticalEvidence &&
      passedQuizRows.length === 0
    ) {
      return {
        ok: false as const,
        status: 409,
        error:
          "三锁授证门禁拦截：高阶能力认证需同时具备通过服务端静态门禁的实操测试证据（或对应模块测验合格），方可人工授证。",
      };
    }

    verifiedSkillTarget = validSkill;
  }

  return await db.transaction(async (tx) => {
    const [updatedSub] = await tx
      .update(submissions)
      .set({
        status: input.decision,
        updatedAt: new Date(),
      })
      .where(eq(submissions.id, sub.id))
      .returning();

    const [review] = await tx
      .insert(submissionReviews)
      .values({
        submissionId: sub.id,
        reviewerUserId: input.authContext.user.id,
        decision: input.decision,
        feedbackMarkdown: input.feedbackMarkdown.trim(),
        grantedSkillId:
          input.decision === "approved" && verifiedSkillTarget
            ? verifiedSkillTarget.id
            : null,
      })
      .returning();

    const evRows = await tx
      .select()
      .from(submissionEvidences)
      .where(eq(submissionEvidences.submissionId, sub.id))
      .limit(1);
    if (evRows[0]?.workspaceId) {
      await tx
        .update(projectWorkspaces)
        .set({
          lifecycleState: input.decision === "approved" ? "approved" : "changes_requested",
          updatedAt: new Date(),
        })
        .where(eq(projectWorkspaces.id, evRows[0].workspaceId));
    }

    let grantedSkill = null;
    if (input.decision === "approved" && verifiedSkillTarget) {
      const [grant] = await tx
        .insert(skillGrants)
        .values({
          userId: sub.userId,
          skillId: verifiedSkillTarget.id,
          curriculumVersion: CURRICULUM_VERSION,
          method: "starter-repo-evidence",
          evidenceSummary: `三锁认证通过（静态门禁 + 实操证据 + 导师人工审核：${sub.artifactTitle}）`,
          evidenceSubmissionId: sub.id,
          grantedByUserId: input.authContext.user.id,
        })
        .returning();
      grantedSkill = grant;
    }

    return { ok: true as const, submission: updatedSub, review, grantedSkill };
  });
}

export async function assignInstructorToCohort(input: {
  cohortId: number;
  userId: number;
  staffRole: "instructor" | "ta";
}) {
  const [assigned] = await db
    .insert(cohortInstructors)
    .values({
      cohortId: input.cohortId,
      userId: input.userId,
      staffRole: input.staffRole,
    })
    .onConflictDoUpdate({
      target: [cohortInstructors.cohortId, cohortInstructors.userId],
      set: { staffRole: input.staffRole },
    })
    .returning();
  return assigned;
}

