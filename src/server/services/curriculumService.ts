import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  customKbEntries,
  quizAttempts,
  skillGrants,
  unitProgress,
} from "../../db/schema.ts";
import {
  COURSE_LABS,
  COURSE_MODULES,
  COURSE_TRACKS,
  LEARNER_PATHS,
} from "../../data/courseCurriculum.ts";
import { COURSE_SKILLS, type SkillId } from "../../data/courseSkills.ts";
import { getModuleRecordById } from "../../data/courseUnitsModel.ts";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore.ts";
import { MODULE_QUIZZES } from "../../data/moduleQuizzes.ts";
import { getModuleTeachingPackage } from "../../data/moduleTeachingPackages.ts";
import { getQuestionRemediation } from "../../data/quizRemediation.ts";
import type { AuthContext } from "../auth.ts";

export const CURRICULUM_VERSION = "2026.11";
export const QUIZ_VERSION = "2026.11";

export function isFreeTrialModule(moduleId: string): boolean {
  return moduleId === "m1";
}

export function canViewInstructorMaterials(authContext?: AuthContext): boolean {
  if (!authContext) return false;
  return (
    authContext.isAdmin ||
    (authContext.isInstructorOrTa &&
      (authContext.assignedCohortIds.length > 0 ||
        authContext.roles.includes("instructor") ||
        authContext.roles.includes("ta")))
  );
}

export function getPublicCurriculumOverview(hasPaidAccess: boolean) {
  return {
    curriculumVersion: CURRICULUM_VERSION,
    quizVersion: QUIZ_VERSION,
    tracks: COURSE_TRACKS,
    paths: LEARNER_PATHS,
    labs: COURSE_LABS.map((l) => ({
      id: l.id,
      code: l.code,
      title: l.title,
      moduleId: l.moduleId,
      isFreeTrial: l.moduleId === "m1",
    })),
    modules: COURSE_MODULES.map((m) => {
      const unlocked = isFreeTrialModule(m.id) || hasPaidAccess;
      return {
        id: m.id,
        code: m.code,
        order: m.order,
        trackId: m.trackId,
        title: m.title,
        audience: m.audience,
        prerequisites: m.prerequisites,
        prerequisiteModuleIds: m.prerequisiteModuleIds,
        prerequisiteSkillIds: m.prerequisiteSkillIds,
        grantsSkillIds: m.grantsSkillIds,
        learningObjectives: m.learningObjectives,
        estimatedMinutes: m.estimatedMinutes,
        slideCount: m.slideCount,
        labIds: m.labIds,
        deliverables: m.deliverables,
        boundaryNote: m.boundaryNote,
        isFreeTrial: isFreeTrialModule(m.id),
        unlocked,
      };
    }),
  };
}

export function getAuthorizedModuleDetail(
  moduleId: string,
  authContext: AuthContext | undefined,
  hasPaidAccess: boolean
) {
  const mod = getModuleRecordById(moduleId);
  if (!mod) {
    return { found: false as const };
  }

  const unlocked = isFreeTrialModule(moduleId) || hasPaidAccess;
  if (!unlocked) {
    return {
      found: true as const,
      allowed: false as const,
      summary: {
        id: mod.id,
        code: mod.code,
        title: mod.title,
        learningObjectives: mod.learningObjectives,
        estimatedMinutes: mod.units.reduce((sum, u) => sum + u.estimatedMinutes, 0),
        isFreeTrial: false,
      },
    };
  }

  const includeInstructor = canViewInstructorMaterials(authContext);
  const sanitizedUnits = mod.units.map((u) => ({
    ...u,
    teacherMaterials: includeInstructor
      ? u.teacherMaterials
      : {
          teachingTips: "",
          timeTrimNote: "",
          referenceAnswers: [],
          commonPitfalls: [],
        },
  }));

  const pkg = includeInstructor ? getModuleTeachingPackage(mod.id) ?? null : null;

  return {
    found: true as const,
    allowed: true as const,
    curriculumVersion: CURRICULUM_VERSION,
    instructorAuthorized: includeInstructor,
    simulationDisclaimer:
      moduleId === "m13-gov" ? M13_GOV_SIMULATION_DISCLAIMER : undefined,
    module: {
      ...mod,
      units: sanitizedUnits,
    },
    teachingPackage: pkg,
  };
}

export function getSanitizedModuleQuiz(
  moduleId: string,
  hasPaidAccess: boolean
) {
  const quiz = MODULE_QUIZZES[moduleId];
  if (!quiz) return { found: false as const };

  const unlocked = isFreeTrialModule(moduleId) || hasPaidAccess;
  if (!unlocked) {
    return { found: true as const, allowed: false as const };
  }

  return {
    found: true as const,
    allowed: true as const,
    quizVersion: QUIZ_VERSION,
    quiz: {
      moduleId: quiz.moduleId,
      moduleNumber: quiz.moduleNumber,
      moduleTitle: quiz.moduleTitle,
      subtitle: quiz.subtitle,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        topic: q.topic,
        question: q.question,
        options: q.options,
        reviewTarget: q.reviewTarget,
      })),
    },
  };
}

export async function gradeAndRecordQuizAttempt(input: {
  userId: number;
  moduleId: string;
  answers: Record<string, number>;
  hasPaidAccess: boolean;
}) {
  const quiz = MODULE_QUIZZES[input.moduleId];
  if (!quiz) {
    return { ok: false as const, status: 404, error: "未找到对应模块测验。" };
  }

  if (!isFreeTrialModule(input.moduleId) && !input.hasPaidAccess) {
    return {
      ok: false as const,
      status: 403,
      error: "该模块测验需开通会员或班级权益后提交判分。",
    };
  }

  let correctCount = 0;
  const weakTopicsSet = new Set<string>();
  const questionResults = quiz.questions.map((q) => {
    const chosen = input.answers[q.id];
    const isAnswered = typeof chosen === "number" && Number.isInteger(chosen);
    const isCorrect = isAnswered && chosen === q.correctIndex;
    if (isCorrect) {
      correctCount += 1;
    } else {
      weakTopicsSet.add(q.topic);
    }
    const remediation = getQuestionRemediation(q.id, quiz.moduleId);
    return {
      questionId: q.id,
      topic: q.topic,
      selectedIndex: isAnswered ? chosen : null,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
      reviewTarget: q.reviewTarget,
      remediationAction: remediation.reviewAction,
    };
  });

  const totalCount = quiz.questions.length;
  const scorePct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = scorePct >= 75;
  const weakTopics = Array.from(weakTopicsSet);

  const [saved] = await db
    .insert(quizAttempts)
    .values({
      userId: input.userId,
      moduleId: input.moduleId,
      quizVersion: QUIZ_VERSION,
      answersJson: input.answers,
      scorePct,
      correctCount,
      totalCount,
      weakTopicsJson: weakTopics,
      passed,
    })
    .returning();

  return {
    ok: true as const,
    attempt: saved,
    quizVersion: QUIZ_VERSION,
    scorePct,
    correctCount,
    totalCount,
    passed,
    weakTopics,
    questionResults,
  };
}

export async function gradeSkillDiagnosticAndGrant(input: {
  userId: number;
  skillId: SkillId;
  answers: Record<string, number>;
}) {
  const skill = COURSE_SKILLS.find((s) => s.id === input.skillId);
  if (!skill) {
    return { ok: false as const, status: 404, error: "未找到对应前置技能定义。" };
  }

  if (!skill.acceptedMethods.includes("diagnostic-check")) {
    return {
      ok: false as const,
      status: 400,
      error: "该技能不支持自动诊断授权。",
    };
  }

  const results = skill.diagnosticQuestions.map((dq) => {
    const selected = input.answers[dq.id];
    const isCorrect = typeof selected === "number" && selected === dq.correctIndex;
    return {
      id: dq.id,
      isCorrect,
      explanation: dq.explanation,
    };
  });

  const allPassed = results.every((r) => r.isCorrect);
  if (!allPassed) {
    return {
      ok: true as const,
      passed: false,
      results,
      grant: null,
    };
  }

  const existing = await db
    .select()
    .from(skillGrants)
    .where(
      and(
        eq(skillGrants.userId, input.userId),
        eq(skillGrants.skillId, skill.id),
        isNull(skillGrants.revokedAt)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return {
      ok: true as const,
      passed: true,
      results,
      grant: existing[0],
    };
  }

  const [grant] = await db
    .insert(skillGrants)
    .values({
      userId: input.userId,
      skillId: skill.id,
      curriculumVersion: CURRICULUM_VERSION,
      method: "diagnostic-check",
      evidenceSummary: `通过服务端能力诊断测评（${results.length}/${results.length} 题全对）`,
      grantedByUserId: input.userId,
    })
    .returning();

  return {
    ok: true as const,
    passed: true,
    results,
    grant,
  };
}

export async function getUserWorkspaceCloudState(userId: number) {
  const [progressRows, kbRows, attemptRows, grantRows] = await Promise.all([
    db.select().from(unitProgress).where(eq(unitProgress.userId, userId)),
    db.select().from(customKbEntries).where(eq(customKbEntries.userId, userId)),
    db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.createdAt)),
    db
      .select()
      .from(skillGrants)
      .where(and(eq(skillGrants.userId, userId), isNull(skillGrants.revokedAt))),
  ]);

  const completedUnitIds: Record<string, boolean> = {};
  const dodCheckedByUnit: Record<string, string[]> = {};
  const selectedPlanByModule: Record<string, string> = {};
  const practiceNotes: Record<
    string,
    {
      artifactDraft: string;
      reflectionNote: string;
      selectedTransferTier?: string;
      updatedAt: string;
      untrustedLegacy?: boolean;
    }
  > = {};

  for (const row of progressRows) {
    if (row.completed) {
      completedUnitIds[row.unitId] = true;
    }
    if (Array.isArray(row.dodCheckedJson) && row.dodCheckedJson.length > 0) {
      dodCheckedByUnit[row.unitId] = row.dodCheckedJson;
    }
    if (row.planId) {
      selectedPlanByModule[row.moduleId] = row.planId;
    }
    if (row.artifactDraft || row.reflectionNote || row.selectedTransferTier) {
      practiceNotes[row.unitId] = {
        artifactDraft: row.artifactDraft,
        reflectionNote: row.reflectionNote,
        selectedTransferTier: row.selectedTransferTier ?? undefined,
        updatedAt: row.updatedAt.toISOString().slice(0, 10),
        untrustedLegacy: row.untrustedLegacy,
      };
    }
  }

  // Keep latest quiz attempt per module for quick summary
  const latestQuizByModule: Record<
    string,
    {
      moduleId: string;
      quizVersion: string;
      scorePct: number;
      correctCount: number;
      totalCount: number;
      passed: boolean;
      weakTopics: string[];
      answers: Record<string, number>;
      createdAt: string;
    }
  > = {};
  for (const att of attemptRows) {
    if (!latestQuizByModule[att.moduleId]) {
      latestQuizByModule[att.moduleId] = {
        moduleId: att.moduleId,
        quizVersion: att.quizVersion,
        scorePct: att.scorePct,
        correctCount: att.correctCount,
        totalCount: att.totalCount,
        passed: att.passed,
        weakTopics: att.weakTopicsJson,
        answers: att.answersJson,
        createdAt: att.createdAt.toISOString(),
      };
    }
  }

  const verifiedSkills: Record<
    string,
    {
      skillId: string;
      method: string;
      evidenceSummary: string;
      curriculumVersion: string;
      verifiedAt: string;
    }
  > = {};
  for (const g of grantRows) {
    verifiedSkills[g.skillId] = {
      skillId: g.skillId,
      method: g.method,
      evidenceSummary: g.evidenceSummary,
      curriculumVersion: g.curriculumVersion,
      verifiedAt: g.grantedAt.toISOString().slice(0, 10),
    };
  }

  return {
    curriculumVersion: CURRICULUM_VERSION,
    completedUnitIds,
    dodCheckedByUnit,
    selectedPlanByModule,
    practiceNotes,
    customKbEntries: kbRows.map((k) => ({
      id: k.clientEntryId,
      title: k.title,
      moduleCode: k.moduleCode,
      category: k.category,
      scope: k.scope,
      content: k.content,
      cautionNote: k.cautionNote,
      updatedAt: k.updatedAt,
    })),
    latestQuizByModule,
    verifiedSkills,
  };
}
