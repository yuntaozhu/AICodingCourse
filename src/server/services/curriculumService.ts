import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  customKbEntries,
  quizAttempts,
  skillGrants,
  staticAuditRuns,
  submissionReviews,
  submissions,
  unitProgress,
} from "../../db/schema.ts";
import { type ModuleProgressStage } from "../../data/projectTemplatesPublic.ts";
import {
  COURSE_LABS,
  COURSE_MODULES,
  COURSE_TRACKS,
  LEARNER_PATHS,
} from "../../data/courseCurriculum.ts";
import {
  COURSE_SKILLS as PRIVATE_COURSE_SKILLS,
  type SkillId,
} from "../data/privateSkills.ts";
import {
  COURSE_MODULE_RECORDS as PRIVATE_COURSE_MODULE_RECORDS,
  getModuleRecordById,
  getUnitsForPlan,
} from "../data/privateCourseUnits.ts";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore.ts";
import { MODULE_QUIZZES } from "../data/privateQuizBank.ts";
import { getModuleTeachingPackage } from "../data/privateTeachingPackages.ts";
import { getQuestionRemediation } from "../../data/quizRemediation.ts";
import { getInstructorPatternScriptForModule } from "../data/privatePatternScripts.ts";
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

export function getPublicCurriculumOverview(
  hasPaidAccess: boolean | ((moduleId: string) => boolean)
) {
  const isModuleUnlocked =
    typeof hasPaidAccess === "function"
      ? (moduleId: string) => isFreeTrialModule(moduleId) || hasPaidAccess(moduleId)
      : (moduleId: string) => isFreeTrialModule(moduleId) || hasPaidAccess;

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
      const unlocked = isModuleUnlocked(m.id);
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
  const patternPilotScript = includeInstructor
    ? getInstructorPatternScriptForModule(mod.id)
    : null;

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
    patternPilotScript,
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

export function gradeSingleQuizQuestion(input: {
  moduleId: string;
  questionId: string;
  selectedIndex: number;
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
      error: "该模块测验需开通会员或班级权益后判分。",
    };
  }
  const q = quiz.questions.find((item) => item.id === input.questionId);
  if (!q) {
    return { ok: false as const, status: 404, error: "未找到对应测验题目。" };
  }
  const isCorrect = input.selectedIndex === q.correctIndex;
  const remediation = getQuestionRemediation(q.id, quiz.moduleId);
  return {
    ok: true as const,
    moduleId: input.moduleId,
    questionId: q.id,
    topic: q.topic,
    selectedIndex: input.selectedIndex,
    correctIndex: q.correctIndex,
    isCorrect,
    explanation: q.explanation,
    reviewTarget: q.reviewTarget,
    remediationAction: remediation.reviewAction,
  };
}

export function gradePreviewM1Quiz(answers: Record<string, number>) {
  const quiz = MODULE_QUIZZES.m1;
  const questionResults: Array<{
    questionId: string;
    topic: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
    reviewTarget?: { label: string; labId?: string; moduleId?: string };
    remediationAction: string;
  }> = [];

  let correctCount = 0;
  for (const q of quiz.questions) {
    const chosen = answers[q.id];
    if (typeof chosen !== "number" || !Number.isInteger(chosen) || chosen < 0 || chosen > 3) {
      continue;
    }
    const isCorrect = chosen === q.correctIndex;
    if (isCorrect) correctCount += 1;
    const remediation = getQuestionRemediation(q.id, "m1");
    questionResults.push({
      questionId: q.id,
      topic: q.topic,
      selectedIndex: chosen,
      correctIndex: q.correctIndex,
      isCorrect,
      explanation: q.explanation,
      reviewTarget: q.reviewTarget,
      remediationAction: remediation.reviewAction,
    });
  }

  const totalCount = quiz.questions.length;
  const answeredCount = questionResults.length;
  const scorePct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    ok: true as const,
    moduleId: "m1",
    answeredCount,
    correctCount,
    totalCount,
    scorePct,
    questionResults,
  };
}

export function gradePreviewSkillDiagnostic(input: {
  skillId: SkillId;
  answers: Record<string, number>;
}) {
  const skill = PRIVATE_COURSE_SKILLS.find((s) => s.id === input.skillId);
  if (!skill) {
    return { ok: false as const, status: 404, error: "未找到对应前置技能定义。" };
  }
  const results = skill.diagnosticQuestions.map((dq) => {
    const selected = input.answers[dq.id];
    const isAnswered = typeof selected === "number" && Number.isInteger(selected);
    const isCorrect = isAnswered && selected === dq.correctIndex;
    return {
      id: dq.id,
      isCorrect,
      explanation: isAnswered ? dq.explanation : "",
    };
  });
  const passed = results.length > 0 && results.every((r) => r.isCorrect);
  return {
    ok: true as const,
    passed,
    results,
  };
}

export function buildInstructorLessonPlanMarkdown(
  moduleId: string,
  planId?: string
): string | null {
  const moduleRecord = getModuleRecordById(moduleId);
  if (!moduleRecord) return null;
  const plan =
    moduleRecord.deliveryPlans.find((p) => p.id === planId) || moduleRecord.deliveryPlans[0];
  const units = getUnitsForPlan(moduleRecord, plan?.id);
  const totalMinutes = units.reduce((sum, u) => sum + u.estimatedMinutes, 0);

  const lines: string[] = [
    `# ${moduleRecord.code} 教师备课讲义 · ${moduleRecord.title}`,
    ``,
    `- 所选授课方案：${plan ? `${plan.name}（${plan.shortLabel}）` : "全部单元"}`,
    `- 适用对象：${plan?.targetAudience || moduleRecord.audience.join(" / ")}`,
    `- 预计授课总时长：约 ${totalMinutes} 分钟（共 ${units.length} 个教学单元）`,
    `- 先修要求：${moduleRecord.prerequisites.join("；")}`,
    `- 边界提示：${moduleRecord.boundaryNote}`,
    ``,
    `## 学习目标`,
    ...moduleRecord.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`),
    ``,
    `---`,
    ``,
    `## 分单元备课指南与参考答案`,
    ``,
  ];

  units.forEach((unit, idx) => {
    lines.push(
      `### ${String(idx + 1).padStart(2, "0")}. ${unit.title}（约 ${unit.estimatedMinutes} 分钟）`
    );
    lines.push(`- 单元目标：${unit.learningObjective}`);
    lines.push(`- 组织提示：${unit.teacherMaterials.teachingTips}`);
    lines.push(`- 时间裁剪建议：${unit.teacherMaterials.timeTrimNote}`);

    if (unit.demoSteps && unit.demoSteps.length > 0) {
      lines.push(`- 演示步骤：`);
      for (const st of unit.demoSteps) {
        lines.push(`  - **${st.phase}**：${st.action} ｜ 人类把关：${st.humanControl}`);
      }
    }

    if (unit.teacherMaterials.referenceAnswers.length > 0) {
      lines.push(`- 参考答案与可接受解法：`);
      for (const ans of unit.teacherMaterials.referenceAnswers) {
        lines.push(`  - ${ans}`);
      }
    }

    if (unit.teacherMaterials.commonPitfalls.length > 0) {
      lines.push(`- 课堂翻车预警：`);
      for (const pit of unit.teacherMaterials.commonPitfalls) {
        lines.push(`  - ${pit}`);
      }
    }

    lines.push(``);
  });

  const patternScript = getInstructorPatternScriptForModule(moduleId);
  if (patternScript) {
    lines.push(`---`);
    lines.push(``);
    lines.push(`## 90 分钟项目实战课教师带教脚本（Stage 1 设计模式试点）`);
    lines.push(`- 课程主题：${patternScript.lessonTitle}`);
    lines.push(`- 课前材料定位：${patternScript.preClassMaterialsNote}`);
    lines.push(``);
    for (const phase of patternScript.phases) {
      lines.push(
        `### 阶段 ${phase.phaseIndex}（${phase.durationMinutes} 分钟）· ${phase.title}`
      );
      lines.push(`- 阶段目标：${phase.goal}`);
      lines.push(`- 教师操作：${phase.instructorAction}`);
      lines.push(`- 现场仓库锚点：${phase.liveRepoCue}`);
      lines.push(`- 课堂追问话术：${phase.facilitationPrompt}`);
      lines.push(``);
    }
    lines.push(`### 课堂反过度抽象红线（Over-Abstraction Red Flags）`);
    for (const rf of patternScript.overAbstractionRedFlags) {
      lines.push(`- ${rf}`);
    }
    lines.push(``);
    lines.push(`### 口头答辩核验提问`);
    for (const q of patternScript.oralDefenseQuestions) {
      lines.push(`- ${q}`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}

export function buildFullCourseInstructorHandbookMarkdown(
  selectedPlanByModule: Record<string, string> = {}
): string {
  let totalCourseMinutes = 0;
  let totalCourseUnits = 0;

  const moduleSections: string[] = [];

  for (const mod of PRIVATE_COURSE_MODULE_RECORDS) {
    const planId = selectedPlanByModule[mod.id];
    const plan =
      mod.deliveryPlans.find((p) => p.id === planId) || mod.deliveryPlans[0];
    const units = getUnitsForPlan(mod, plan?.id);
    const mins = units.reduce((sum, u) => sum + u.estimatedMinutes, 0);
    totalCourseMinutes += mins;
    totalCourseUnits += units.length;

    moduleSections.push(
      [
        `## ${mod.code} · ${mod.title}`,
        `- 方案：${plan ? `${plan.name}（${plan.shortLabel}）` : "全部单元"} ｜ 单元数：${units.length} ｜ 预计：${mins} 分钟`,
        `- 先修：${mod.prerequisites.join("；")}`,
        `- 边界：${mod.boundaryNote}`,
        ``,
        ...units.map(
          (u, idx) =>
            `${idx + 1}. **${u.title}** (${u.estimatedMinutes}m) — 组织提示：${u.teacherMaterials.teachingTips} ｜ 裁剪：${u.teacherMaterials.timeTrimNote}`
        ),
        ``,
      ].join("\n")
    );
  }

  return [
    `# AICodingCourse 全课 ${PRIVATE_COURSE_MODULE_RECORDS.length} 模块教师备课总手册`,
    ``,
    `- 生成日期：${new Date().toISOString().slice(0, 10)}`,
    `- 覆盖模块：${PRIVATE_COURSE_MODULE_RECORDS.length} 个模块 ｜ 合计单元：${totalCourseUnits} 个 ｜ 总预计课时：约 ${totalCourseMinutes} 分钟`,
    ``,
    `---`,
    ``,
    ...moduleSections,
  ].join("\n");
}

export async function gradeSkillDiagnosticAndGrant(input: {
  userId: number;
  skillId: SkillId;
  answers: Record<string, number>;
}) {
  const skill = PRIVATE_COURSE_SKILLS.find((s) => s.id === input.skillId);
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
  const [progressRows, kbRows, attemptRows, grantRows, subRows, auditRows] =
    await Promise.all([
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
      db
        .select()
        .from(submissions)
        .where(eq(submissions.userId, userId))
        .orderBy(desc(submissions.updatedAt)),
      db
        .select()
        .from(staticAuditRuns)
        .where(eq(staticAuditRuns.userId, userId))
        .orderBy(desc(staticAuditRuns.createdAt)),
    ]);

  const subIds = subRows.map((s) => s.id);
  const reviewRows =
    subIds.length > 0
      ? await db
          .select()
          .from(submissionReviews)
          .where(inArray(submissionReviews.submissionId, subIds))
      : [];

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

  const moduleStageById: Record<string, ModuleProgressStage> = {};
  for (const mod of COURSE_MODULES) {
    const modProgress = progressRows.filter((p) => p.moduleId === mod.id);
    const modSubs = subRows.filter((s) => s.moduleId === mod.id);
    const modAudits = auditRows.filter((a) => a.moduleId === mod.id);
    const modQuiz = latestQuizByModule[mod.id];
    const hasSkillFromReview = modSubs.some((s) =>
      reviewRows.some((r) => r.submissionId === s.id && Boolean(r.grantedSkillId))
    );
    const hasModSkill =
      hasSkillFromReview ||
      mod.grantsSkillIds.some((sk) => Boolean(verifiedSkills[sk]));

    let stage: ModuleProgressStage = "not_started";
    if (modProgress.some((p) => p.completed)) {
      stage = "viewed";
    }
    if (
      modProgress.some(
        (p) =>
          p.artifactDraft.trim().length > 0 ||
          p.dodCheckedJson.length > 0
      ) ||
      Boolean(modQuiz)
    ) {
      stage = "practiced";
    }
    if (modSubs.length > 0) {
      stage = "submitted";
    }
    if (
      modAudits.some((a) => a.passed) ||
      Boolean(modQuiz?.passed)
    ) {
      stage = "auto_verified";
    }
    if (modSubs.some((s) => s.status === "approved")) {
      stage = "human_reviewed";
    }
    if (hasModSkill) {
      stage = "skill_granted";
    }
    moduleStageById[mod.id] = stage;
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
    moduleStageById,
  };
}
