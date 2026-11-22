import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  cohortEnrollments,
  cohortInstructors,
  cohortMilestones,
  cohorts,
  skillGrants,
  submissionReviews,
  submissions,
  users,
} from "../../db/schema.ts";
import { COURSE_SKILLS } from "../../data/courseSkills";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore";
import type { AuthContext } from "../auth.ts";
import { CURRICULUM_VERSION } from "./curriculumService.ts";

export async function getLearnerCohortView(userId: number) {
  const enrollmentRows = await db
    .select()
    .from(cohortEnrollments)
    .where(eq(cohortEnrollments.userId, userId));

  if (enrollmentRows.length === 0) {
    return {
      enrolled: false as const,
      cohorts: [],
      submissions: [],
      reviewsBySubmissionId: {},
    };
  }

  const cohortIds = enrollmentRows.map((e) => e.cohortId);
  const [cohortRows, milestoneRows, userSubmissions] = await Promise.all([
    db.select().from(cohorts).where(inArray(cohorts.id, cohortIds)),
    db
      .select()
      .from(cohortMilestones)
      .where(inArray(cohortMilestones.cohortId, cohortIds)),
    db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.updatedAt)),
  ]);

  const submissionIds = userSubmissions.map((s) => s.id);
  const reviewRows =
    submissionIds.length > 0
      ? await db
          .select()
          .from(submissionReviews)
          .where(inArray(submissionReviews.submissionId, submissionIds))
          .orderBy(desc(submissionReviews.createdAt))
      : [];

  const reviewsBySubmissionId: Record<number, typeof reviewRows> = {};
  for (const r of reviewRows) {
    if (!reviewsBySubmissionId[r.submissionId]) {
      reviewsBySubmissionId[r.submissionId] = [];
    }
    reviewsBySubmissionId[r.submissionId].push(r);
  }

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
  staticAuditJson?: Record<string, unknown> | null;
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
          staticAuditJson: input.staticAuditJson ?? null,
          status: "submitted",
          updatedAt: new Date(),
        })
        .where(eq(submissions.id, existing[0].id))
        .returning();
      return { ok: true as const, submission: updated };
    }
  }

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
      staticAuditJson: input.staticAuditJson ?? null,
      status: "submitted",
    })
    .returning();

  return { ok: true as const, submission: created };
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
  const reviewRows =
    subIds.length > 0
      ? await db
          .select()
          .from(submissionReviews)
          .where(inArray(submissionReviews.submissionId, subIds))
          .orderBy(desc(submissionReviews.createdAt))
      : [];

  const enrichedSubs = subRows.map((s) => {
    const learner = learnerMap.get(s.userId);
    const cohort = cohortRows.find((c) => c.id === s.cohortId);
    const milestone = milestoneRows.find((m) => m.id === s.milestoneId);
    return {
      ...s,
      learnerEmail: learner?.email ?? "",
      learnerName: learner?.displayName || learner?.email || `Learner #${s.userId}`,
      cohortTitle: cohort?.title ?? "",
      milestoneTitle: milestone?.title ?? `${s.moduleId.toUpperCase()} 自由提交`,
      reviews: reviewRows.filter((r) => r.submissionId === s.id),
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
          input.decision === "approved" && input.grantSkillId
            ? input.grantSkillId
            : null,
      })
      .returning();

    let grantedSkill = null;
    if (input.decision === "approved" && input.grantSkillId) {
      const validSkill = COURSE_SKILLS.find((s) => s.id === input.grantSkillId);
      if (validSkill) {
        const [grant] = await tx
          .insert(skillGrants)
          .values({
            userId: sub.userId,
            skillId: validSkill.id,
            curriculumVersion: CURRICULUM_VERSION,
            method: "starter-repo-evidence",
            evidenceSummary: `指导老师人工审核通过（${sub.artifactTitle}）`,
            evidenceSubmissionId: sub.id,
            grantedByUserId: input.authContext.user.id,
          })
          .returning();
        grantedSkill = grant;
      }
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
