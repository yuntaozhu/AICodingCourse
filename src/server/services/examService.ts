import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { examSessions, quizAttempts } from "../../db/schema.ts";
import { getQuestionRemediation } from "../../data/quizRemediation.ts";
import { MODULE_QUIZZES } from "../data/privateQuizBank.ts";
import { QUIZ_VERSION, isFreeTrialModule } from "./curriculumService.ts";

export async function startExamSession(input: {
  userId: number;
  moduleId: string;
  hasPaidAccess: boolean;
}) {
  const quiz = MODULE_QUIZZES[input.moduleId];
  if (!quiz) {
    return { ok: false as const, status: 404, error: "未找到对应模块 Exam 题库。" };
  }
  if (!isFreeTrialModule(input.moduleId) && !input.hasPaidAccess) {
    return {
      ok: false as const,
      status: 403,
      error: "该模块认证 Exam 需开通课程或训练营权益后开启。",
    };
  }

  const questionIds = quiz.questions.map((q) => q.id);
  const [created] = await db
    .insert(examSessions)
    .values({
      userId: input.userId,
      moduleId: input.moduleId,
      quizVersion: QUIZ_VERSION,
      questionIdsJson: questionIds,
      currentIndex: 0,
      answersJson: {},
      scorePct: 0,
      passed: false,
      weakTopicsJson: [],
      status: "in_progress",
    })
    .returning();

  const firstQ = quiz.questions[0];
  return {
    ok: true as const,
    session: created,
    moduleTitle: quiz.moduleTitle,
    totalCount: quiz.questions.length,
    currentQuestion: firstQ
      ? {
          id: firstQ.id,
          topic: firstQ.topic,
          question: firstQ.question,
          options: firstQ.options,
          index: 0,
        }
      : null,
  };
}

export async function submitExamStepAnswer(input: {
  userId: number;
  sessionId: number;
  questionId: string;
  selectedIndex: number;
  hasPaidAccess: boolean | ((moduleId: string) => boolean);
}) {
  const rows = await db
    .select()
    .from(examSessions)
    .where(and(eq(examSessions.id, input.sessionId), eq(examSessions.userId, input.userId)))
    .limit(1);

  const session = rows[0];
  if (!session) {
    return { ok: false as const, status: 404, error: "未找到对应的 Exam 会话。" };
  }
  const hasModuleAccess =
    typeof input.hasPaidAccess === "function"
      ? input.hasPaidAccess(session.moduleId)
      : input.hasPaidAccess;
  if (!isFreeTrialModule(session.moduleId) && !hasModuleAccess) {
    return { ok: false as const, status: 403, error: "无权访问该模块 Exam。" };
  }
  if (session.status === "completed") {
    return { ok: false as const, status: 409, error: "该次 Exam 已交卷完成，请重新开启新场次。" };
  }

  const quiz = MODULE_QUIZZES[session.moduleId];
  if (!quiz) {
    return { ok: false as const, status: 404, error: "题库定义不存在。" };
  }

  const expectedQuestionId = session.questionIdsJson[session.currentIndex];
  if (expectedQuestionId !== input.questionId) {
    return {
      ok: false as const,
      status: 400,
      error: `请按步骤顺序作答当前第 ${session.currentIndex + 1} 题（${expectedQuestionId}）。`,
    };
  }

  const question = quiz.questions.find((q) => q.id === input.questionId);
  if (!question) {
    return { ok: false as const, status: 404, error: "题目不存在。" };
  }

  const isCorrect = input.selectedIndex === question.correctIndex;
  const remediation = getQuestionRemediation(question.id, session.moduleId);

  const nextAnswers: Record<string, number> = {
    ...session.answersJson,
    [question.id]: input.selectedIndex,
  };
  const nextIndex = session.currentIndex + 1;
  const isCompleted = nextIndex >= session.questionIdsJson.length;

  let scorePct = session.scorePct;
  let passed = session.passed;
  let weakTopics: string[] = [];

  if (isCompleted) {
    let correctCount = 0;
    const weakSet = new Set<string>();
    for (const q of quiz.questions) {
      if (nextAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      } else {
        weakSet.add(q.topic);
      }
    }
    const total = quiz.questions.length;
    scorePct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    passed = scorePct >= 75;
    weakTopics = Array.from(weakSet);

    // Sync final scored attempt to quizAttempts so downstream prerequisite/skill checks see it
    await db.insert(quizAttempts).values({
      userId: input.userId,
      moduleId: session.moduleId,
      quizVersion: session.quizVersion,
      answersJson: nextAnswers,
      scorePct,
      correctCount,
      totalCount: total,
      weakTopicsJson: weakTopics,
      passed,
    });
  }

  const [updated] = await db
    .update(examSessions)
    .set({
      answersJson: nextAnswers,
      currentIndex: nextIndex,
      scorePct,
      passed,
      weakTopicsJson: weakTopics,
      status: isCompleted ? "completed" : "in_progress",
      completedAt: isCompleted ? new Date() : null,
    })
    .where(eq(examSessions.id, session.id))
    .returning();

  const nextRawQ = !isCompleted
    ? quiz.questions.find((q) => q.id === session.questionIdsJson[nextIndex])
    : undefined;

  return {
    ok: true as const,
    session: updated,
    stepFeedback: {
      questionId: question.id,
      topic: question.topic,
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      reviewTarget: question.reviewTarget,
      remediationAction: remediation.reviewAction,
    },
    nextQuestion: nextRawQ
      ? {
          id: nextRawQ.id,
          topic: nextRawQ.topic,
          question: nextRawQ.question,
          options: nextRawQ.options,
          index: nextIndex,
        }
      : null,
    remediationPlan: isCompleted
      ? weakTopics.map((topic) => ({
          topic,
          recommendation: `请回看 ${session.moduleId.toUpperCase()} 对应「${topic}」教学单元，并在配套沙盘中完成一次边界自检再重考。`,
        }))
      : [],
  };
}

export async function getUserExamSessions(userId: number) {
  return await db
    .select()
    .from(examSessions)
    .where(eq(examSessions.userId, userId))
    .orderBy(desc(examSessions.startedAt))
    .limit(20);
}
