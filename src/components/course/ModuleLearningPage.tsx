import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  FlaskConical,
  GraduationCap,
  Layers,
  Play,
  Presentation as PresentationIcon,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { COURSE_LABS } from "@/data/courseCurriculum";
import {
  COURSE_SKILLS,
  evaluateModuleReadiness,
  getSkillById,
  type SkillId,
} from "@/data/courseSkills";
import {
  getModuleTeachingPackage,
  type PublicModuleTeachingPackage,
} from "@/data/moduleTeachingPackages";
import { MODULE_QUIZZES } from "@/data/moduleQuizzes";
import {
  buildRetryWrongAnswersState,
  getQuestionRemediation,
} from "@/data/quizRemediation";
import {
  COURSE_MODULE_RECORDS,
  COURSE_UNIT_TYPE_LABELS,
  getDeliveryPlanMinutes,
  getResourcesByIds,
  getUnitsForPlan,
  type CourseModuleRecord,
  type CourseUnit,
} from "@/data/courseUnitsModel";
import {
  getModuleCompletionStats,
  M13_GOV_SIMULATION_DISCLAIMER,
  QUIZ_ANSWERS_STORAGE_KEY,
  type CourseWorkspaceState,
  type CustomKnowledgeDraft,
  type PracticeNoteRecord,
  type SkillVerificationRecord,
  type WorkspaceQuizScoreSummary,
} from "@/data/courseWorkspaceStore";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  TEAM_KNOWLEDGE_BASE,
  type KnowledgeBaseTrack,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
} from "@/data/teamKnowledgeBase";
import { RUNTIME_WORKSHOP_KNOWLEDGE_BASE } from "@/data/runtimeKnowledgeBase";

import {
  checkSingleQuizQuestionApi,
  fetchAuthorizedModuleDetail,
  fetchInstructorLessonPlanMarkdownApi,
  fetchSanitizedQuiz,
  previewM1QuizApi,
  previewSkillDiagnosticApi,
  submitQuizAnswers,
  submitSkillDiagnostic,
  type QuizGradeResponse,
  type SanitizedQuizQuestion,
  type SingleQuestionCheckResponse,
} from "@/lib/apiClient";

interface ModuleLearningPageProps {
  moduleRecord: CourseModuleRecord;
  initialUnitId?: string;
  workspaceState: CourseWorkspaceState;
  completedLabIds: string[];
  latestQuizSummary?: WorkspaceQuizScoreSummary;
  hasPaidAccess?: boolean;
  isInstructorAuthorized?: boolean;
  isSignedIn?: boolean;
  onOpenBilling?: () => void;
  onRefreshCloudState?: () => void;
  onBackToCatalog: () => void;
  onOpenModule: (moduleId: string) => void;
  onSelectPlan: (moduleId: string, planId: string) => void;
  onVisitUnit: (moduleId: string, unitId: string, planId: string) => void;
  onToggleUnitComplete: (unitId: string) => void;
  onToggleCriterion: (unitId: string, criterionText: string) => void;
  onSavePracticeNote: (unitId: string, note: Partial<PracticeNoteRecord>) => void;
  onAddCustomKb: (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => void;
  onVerifySkill: (record: SkillVerificationRecord) => void;
  onToggleViewMode: () => void;
  onOpenKnowledgeBase: (moduleCode?: string, track?: KnowledgeBaseTrack) => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string; slideOffset?: number }) => void;
  onScrollTop?: () => void;
}

function loadQuizAnswers(moduleId: string, moduleOrder: number): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, number>>;
    return parsed[moduleId] ?? (moduleOrder <= 10 ? parsed[String(moduleOrder)] : undefined) ?? {};
  } catch {
    return {};
  }
}

function saveQuizAnswers(
  moduleId: string,
  moduleOrder: number,
  answers: Record<string, number>
) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
    if (Object.keys(answers).length === 0) {
      delete parsed[moduleId];
    } else {
      parsed[moduleId] = answers;
    }
    delete parsed[String(moduleOrder)];
    window.localStorage.setItem(QUIZ_ANSWERS_STORAGE_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent("course:quiz-progress-updated"));
  } catch {
    // Ignore storage errors
  }
}

export default function ModuleLearningPage({
  moduleRecord,
  initialUnitId,
  workspaceState,
  completedLabIds,
  latestQuizSummary,
  hasPaidAccess = false,
  isInstructorAuthorized = false,
  isSignedIn = false,
  onOpenBilling,
  onRefreshCloudState,
  onBackToCatalog,
  onOpenModule,
  onSelectPlan,
  onVisitUnit,
  onToggleUnitComplete,
  onToggleCriterion,
  onSavePracticeNote,
  onAddCustomKb,
  onVerifySkill,
  onToggleViewMode,
  onOpenKnowledgeBase,
  onSwitchToReveal,
  onScrollTop,
}: ModuleLearningPageProps) {
  const isFreeTrial = moduleRecord.id === "m1";
  const isModuleUnlocked = isFreeTrial || hasPaidAccess;
  const [serverModuleAllowed, setServerModuleAllowed] = useState<boolean>(isModuleUnlocked);
  const [serverInstructorAllowed, setServerInstructorAllowed] = useState<boolean>(
    isInstructorAuthorized
  );
  const [authorizedUnits, setAuthorizedUnits] = useState<CourseUnit[] | null>(null);
  const [authorizedTeachingPkg, setAuthorizedTeachingPkg] =
    useState<PublicModuleTeachingPackage | null>(null);
  const [exportingPlan, setExportingPlan] = useState(false);

  useEffect(() => {
    setServerModuleAllowed(isModuleUnlocked);
    setServerInstructorAllowed(isInstructorAuthorized);
    setAuthorizedUnits(null);
    setAuthorizedTeachingPkg(null);
    let active = true;
    fetchAuthorizedModuleDetail(moduleRecord.id)
      .then((res) => {
        if (!active) return;
        setServerModuleAllowed(true);
        setServerInstructorAllowed(Boolean(res.instructorAuthorized));
        if (
          res.instructorAuthorized &&
          res.module &&
          Array.isArray((res.module as { units?: unknown }).units)
        ) {
          setAuthorizedUnits((res.module as unknown as CourseModuleRecord).units);
        }
        if (res.instructorAuthorized && res.teachingPackage) {
          setAuthorizedTeachingPkg(
            res.teachingPackage as unknown as PublicModuleTeachingPackage
          );
        }
      })
      .catch(() => {
        if (!active) return;
        if (!isFreeTrial && !hasPaidAccess) {
          setServerModuleAllowed(false);
        }
      });
    return () => {
      active = false;
    };
  }, [moduleRecord.id, hasPaidAccess, isInstructorAuthorized, isFreeTrial, isModuleUnlocked]);

  const effectiveModuleRecord = useMemo(
    () => (authorizedUnits ? { ...moduleRecord, units: authorizedUnits } : moduleRecord),
    [authorizedUnits, moduleRecord]
  );

  const activePlanId =
    workspaceState.selectedPlanByModule[moduleRecord.id] || effectiveModuleRecord.deliveryPlans[0]?.id;
  const activePlan =
    effectiveModuleRecord.deliveryPlans.find((p) => p.id === activePlanId) ||
    effectiveModuleRecord.deliveryPlans[0];

  const defaultPlanUnits = getUnitsForPlan(effectiveModuleRecord, activePlan?.id);
  const [showAllModuleUnits, setShowAllModuleUnits] = useState<boolean>(() =>
    Boolean(
      initialUnitId &&
        moduleRecord.units.some((u) => u.id === initialUnitId) &&
        !defaultPlanUnits.some((u) => u.id === initialUnitId)
    )
  );

  const visibleUnits = useMemo(() => {
    if (showAllModuleUnits) return effectiveModuleRecord.units;
    return getUnitsForPlan(effectiveModuleRecord, activePlan?.id);
  }, [effectiveModuleRecord, activePlan?.id, showAllModuleUnits]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (initialUnitId && moduleRecord.units.some((u) => u.id === initialUnitId)) {
      return initialUnitId;
    }
    return defaultPlanUnits[0]?.id || moduleRecord.units[0]?.id || "";
  });

  const [revealedFailureSolutionUnitId, setRevealedFailureSolutionUnitId] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quiz state synced with localStorage and server sanitized questions + grading
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() =>
    loadQuizAnswers(moduleRecord.id, moduleRecord.order)
  );
  const [sanitizedQuestions, setSanitizedQuestions] = useState<SanitizedQuizQuestion[] | null>(
    null
  );
  const [gradedByQuestionId, setGradedByQuestionId] = useState<
    Record<string, SingleQuestionCheckResponse>
  >({});
  const [serverQuizGrade, setServerQuizGrade] = useState<QuizGradeResponse | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModuleUnlocked) return;
    let active = true;
    fetchSanitizedQuiz(moduleRecord.id)
      .then((res) => {
        if (active) setSanitizedQuestions(res.quiz.questions);
      })
      .catch(() => {
        if (active) setSanitizedQuestions(null);
      });
    return () => {
      active = false;
    };
  }, [moduleRecord.id, isModuleUnlocked]);

  useEffect(() => {
    setGradedByQuestionId({});
    setServerQuizGrade(null);
    if (!isModuleUnlocked) return;
    const modQuiz = MODULE_QUIZZES[moduleRecord.id];
    if (!modQuiz) return;
    const storedEntries = modQuiz.questions
      .filter((q) => typeof quizAnswers[q.id] === "number")
      .map((q) => [q.id, quizAnswers[q.id]] as const);
    if (storedEntries.length === 0) return;

    let active = true;
    if (moduleRecord.id === "m1") {
      void previewM1QuizApi(Object.fromEntries(storedEntries))
        .then((res) => {
          if (!active) return;
          const next: Record<string, SingleQuestionCheckResponse> = {};
          for (const item of res.questionResults) {
            next[item.questionId] = { ok: true, moduleId: "m1", ...item };
          }
          setGradedByQuestionId(next);
        })
        .catch(() => {});
    } else if (isSignedIn) {
      void Promise.all(
        storedEntries.map(([qId, optIdx]) =>
          checkSingleQuizQuestionApi(moduleRecord.id, qId, optIdx).catch(() => null)
        )
      ).then((results) => {
        if (!active) return;
        const next: Record<string, SingleQuestionCheckResponse> = {};
        for (const item of results) {
          if (item) next[item.questionId] = item;
        }
        setGradedByQuestionId(next);
      });
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleRecord.id, isModuleUnlocked, isSignedIn]);

  // Skill verification interactive state
  const [activeDiagSkillId, setActiveDiagSkillId] = useState<SkillId | null>(null);
  const [diagAnswersBySkill, setDiagAnswersBySkill] = useState<
    Record<string, Record<string, number>>
  >({});
  const [diagFeedbackBySkill, setDiagFeedbackBySkill] = useState<Record<string, string>>({});
  const [evidenceDraftBySkill, setEvidenceDraftBySkill] = useState<Record<string, string>>({});

  // Quick KB draft inline form
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState<KnowledgeCategory>("starter-rule");
  const [kbScope, setKbScope] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [kbSavedNotice, setKbSavedNotice] = useState(false);

  const activeUnit: CourseUnit =
    visibleUnits.find((u) => u.id === selectedUnitId) ||
    effectiveModuleRecord.units.find((u) => u.id === selectedUnitId) ||
    visibleUnits[0] ||
    effectiveModuleRecord.units[0];

  const activeUnitId = activeUnit?.id;
  const activePlanResolvedId = activePlan?.id;

  useEffect(() => {
    if (activeUnitId && activePlanResolvedId && serverModuleAllowed) {
      onVisitUnit(moduleRecord.id, activeUnitId, activePlanResolvedId);
    }
  }, [moduleRecord.id, activeUnitId, activePlanResolvedId, onVisitUnit, serverModuleAllowed]);

  const activeIndex = visibleUnits.findIndex((u) => u.id === activeUnit?.id);
  const prevUnit = activeIndex > 0 ? visibleUnits[activeIndex - 1] : null;
  const nextUnit =
    activeIndex >= 0 && activeIndex < visibleUnits.length - 1
      ? visibleUnits[activeIndex + 1]
      : null;

  const isInstructorView =
    isInstructorAuthorized &&
    serverInstructorAllowed &&
    workspaceState.viewMode === "instructor";
  const stats = getModuleCompletionStats(
    effectiveModuleRecord,
    workspaceState,
    showAllModuleUnits ? undefined : activePlan?.id
  );
  const teachingPkg = authorizedTeachingPkg ?? getModuleTeachingPackage(moduleRecord.id);

  const unitPractice = activeUnit ? workspaceState.practiceNotes[activeUnit.id] : undefined;
  const unitDodChecked = activeUnit ? workspaceState.dodCheckedByUnit[activeUnit.id] || [] : [];
  const unitCompleted = activeUnit ? Boolean(workspaceState.completedUnitIds[activeUnit.id]) : false;

  const isRuntimeModule = moduleRecord.trackId === "agent-runtime";
  const kbTrackForModule: KnowledgeBaseTrack = isRuntimeModule ? "runtime-domain" : "engineering";
  const relatedResources = activeUnit ? getResourcesByIds(activeUnit.relatedResourceIds) : [];
  const relatedKbEntries = activeUnit
    ? (isRuntimeModule ? RUNTIME_WORKSHOP_KNOWLEDGE_BASE : TEAM_KNOWLEDGE_BASE).filter(
        (kb) =>
          activeUnit.knowledgeEntryIds.includes(kb.id) || kb.modules.includes(moduleRecord.code)
      )
    : [];
  const moduleCustomKbs = !isRuntimeModule
    ? workspaceState.customKbEntries.filter((entry) => entry.moduleCode === moduleRecord.code)
    : [];

  const moduleQuiz = MODULE_QUIZZES[moduleRecord.id];

  const completedModuleIdsSet = useMemo(() => {
    const done = new Set<string>();
    for (const mod of COURSE_MODULE_RECORDS) {
      const s = getModuleCompletionStats(mod, workspaceState);
      if (s.totalCount > 0 && s.completedCount === s.totalCount) {
        done.add(mod.id);
      }
    }
    return done;
  }, [workspaceState]);

  const verifiedSkillIdsSet = useMemo(() => {
    return new Set<SkillId>(
      COURSE_SKILLS.filter((s) => Boolean(workspaceState.verifiedSkills?.[s.id])).map((s) => s.id)
    );
  }, [workspaceState.verifiedSkills]);

  const readiness = useMemo(
    () =>
      evaluateModuleReadiness({
        module: moduleRecord,
        completedModuleIds: completedModuleIdsSet,
        verifiedSkillIds: verifiedSkillIdsSet,
      }),
    [moduleRecord, completedModuleIdsSet, verifiedSkillIdsSet]
  );

  const gateSkillIds = useMemo(() => {
    const ids = new Set<SkillId>(moduleRecord.prerequisiteSkillIds);
    for (const sk of COURSE_SKILLS) {
      if (sk.remediationModuleId === moduleRecord.id) {
        ids.add(sk.id);
      }
    }
    return Array.from(ids);
  }, [moduleRecord.id, moduleRecord.prerequisiteSkillIds]);

  const moduleIdx = COURSE_MODULE_RECORDS.findIndex((m) => m.id === moduleRecord.id);
  const prevModule = moduleIdx > 0 ? COURSE_MODULE_RECORDS[moduleIdx - 1] : null;
  const nextModule =
    moduleIdx >= 0 && moduleIdx < COURSE_MODULE_RECORDS.length - 1
      ? COURSE_MODULE_RECORDS[moduleIdx + 1]
      : null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  const handleExportInstructorPlan = async () => {
    setExportingPlan(true);
    try {
      const res = await fetchInstructorLessonPlanMarkdownApi(moduleRecord.id, activePlan?.id);
      try {
        const blob = new Blob([res.markdown], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || `${moduleRecord.code}-${activePlan?.shortLabel || "备课讲义"}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        await navigator.clipboard?.writeText(res.markdown);
      }
    } catch {
      // Non-fatal fallback notice avoided inside modal
    } finally {
      setExportingPlan(false);
    }
  };

  const selectUnitAndScroll = (unitId: string) => {
    setSelectedUnitId(unitId);
    onScrollTop?.();
  };

  const handleSelectPlan = (planId: string) => {
    setShowAllModuleUnits(false);
    onSelectPlan(moduleRecord.id, planId);
    const nextPlanUnits = getUnitsForPlan(effectiveModuleRecord, planId);
    if (nextPlanUnits.length > 0 && !nextPlanUnits.some((u) => u.id === activeUnit?.id)) {
      setSelectedUnitId(nextPlanUnits[0].id);
    }
  };

  const handleCompleteAndNext = () => {
    if (!activeUnit) return;
    if (!unitCompleted) {
      onToggleUnitComplete(activeUnit.id);
    }
    if (nextUnit) {
      selectUnitAndScroll(nextUnit.id);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionIdx: number) => {
    const next = { ...quizAnswers, [questionId]: optionIdx };
    setQuizAnswers(next);
    setQuizError(null);
    saveQuizAnswers(moduleRecord.id, moduleRecord.order, next);
    void checkSingleQuizQuestionApi(moduleRecord.id, questionId, optionIdx)
      .then((res) => {
        setGradedByQuestionId((prev) => ({ ...prev, [questionId]: res }));
      })
      .catch(() => {});
  };

  const handleServerQuizSubmit = async () => {
    if (!moduleQuiz) return;
    setQuizSubmitting(true);
    setQuizError(null);
    try {
      const result = await submitQuizAnswers(moduleRecord.id, quizAnswers);
      setServerQuizGrade(result);
      const nextGraded: Record<string, SingleQuestionCheckResponse> = {};
      for (const r of result.questionResults) {
        nextGraded[r.questionId] = {
          ok: true,
          moduleId: moduleRecord.id,
          questionId: r.questionId,
          topic: r.topic,
          selectedIndex: r.selectedIndex ?? quizAnswers[r.questionId] ?? 0,
          correctIndex: r.correctIndex,
          isCorrect: r.isCorrect,
          explanation: r.explanation,
          reviewTarget: r.reviewTarget,
          remediationAction: r.remediationAction,
        };
      }
      setGradedByQuestionId((prev) => ({ ...prev, ...nextGraded }));
      onRefreshCloudState?.();
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : "提交判分失败，请确认已登录。");
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleRetryWrongQuiz = () => {
    if (!moduleQuiz) return;
    const correctIds = new Set<string>();
    for (const q of moduleQuiz.questions) {
      const serverQ = serverQuizGrade?.questionResults.find((r) => r.questionId === q.id);
      const grade = serverQ ?? gradedByQuestionId[q.id];
      if (grade?.isCorrect) {
        correctIds.add(q.id);
      }
    }
    const retryState = buildRetryWrongAnswersState(moduleQuiz.questions, quizAnswers, correctIds);
    setQuizAnswers(retryState.keptAnswers);
    setGradedByQuestionId((prev) => {
      const next: Record<string, SingleQuestionCheckResponse> = {};
      for (const qId of Object.keys(retryState.keptAnswers)) {
        if (prev[qId]) next[qId] = prev[qId];
      }
      return next;
    });
    setServerQuizGrade(null);
    saveQuizAnswers(moduleRecord.id, moduleRecord.order, retryState.keptAnswers);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setGradedByQuestionId({});
    setServerQuizGrade(null);
    setQuizError(null);
    saveQuizAnswers(moduleRecord.id, moduleRecord.order, {});
  };

  const handleSubmitSkillDiagnostic = async (skillId: SkillId) => {
    const sk = getSkillById(skillId);
    if (!sk) return;
    const ans = diagAnswersBySkill[skillId] || {};
    const allAnswered = sk.diagnosticQuestions.every((q) => typeof ans[q.id] === "number");
    if (!allAnswered) {
      setDiagFeedbackBySkill((prev) => ({
        ...prev,
        [skillId]: "请先完成全部 2 道能力诊断题。",
      }));
      return;
    }

    if (isSignedIn) {
      try {
        const res = await submitSkillDiagnostic(skillId, ans);
        if (!res.passed) {
          const passedCount = res.results.filter((r) => r.isCorrect).length;
          setDiagFeedbackBySkill((prev) => ({
            ...prev,
            [skillId]: `服务端诊断得分 ${passedCount}/${res.results.length}，须全部答对才可通过；请重选后再提交。`,
          }));
          return;
        }
        onVerifySkill({
          skillId,
          method: "diagnostic-check",
          evidenceSummary:
            res.grant?.evidenceSummary || `通过服务端 ${res.results.length}/${res.results.length} 能力诊断测评`,
          verifiedAt: new Date().toISOString().slice(0, 10),
        });
        setDiagFeedbackBySkill((prev) => ({
          ...prev,
          [skillId]: "服务端诊断通过，已授予 SkillGrant 并同步云端档案！",
        }));
        onRefreshCloudState?.();
        setActiveDiagSkillId(null);
        return;
      } catch (err) {
        setDiagFeedbackBySkill((prev) => ({
          ...prev,
          [skillId]: err instanceof Error ? err.message : "服务端诊断提交失败。",
        }));
        return;
      }
    }

    try {
      const res = await previewSkillDiagnosticApi(skillId, ans);
      const correctCount = res.results.filter((r) => r.isCorrect).length;
      if (!res.passed) {
        setDiagFeedbackBySkill((prev) => ({
          ...prev,
          [skillId]: `诊断得分 ${correctCount}/${res.results.length}，须全部答对才可通过；请核对解析后重选。`,
        }));
        return;
      }
      onVerifySkill({
        skillId,
        method: "diagnostic-check",
        evidenceSummary: `通过 ${correctCount}/${res.results.length} 能力诊断测评（本地体验）`,
        verifiedAt: new Date().toISOString().slice(0, 10),
      });
      setDiagFeedbackBySkill((prev) => ({
        ...prev,
        [skillId]: "能力诊断通过，已暂存到本地（登录后可进行服务端认证同步）。",
      }));
      setActiveDiagSkillId(null);
    } catch (err) {
      setDiagFeedbackBySkill((prev) => ({
        ...prev,
        [skillId]: err instanceof Error ? err.message : "诊断验证失败，请稍后重试。",
      }));
    }
  };

  const handleSubmitStarterEvidence = (skillId: SkillId) => {
    const draft = (evidenceDraftBySkill[skillId] || "").trim();
    if (draft.length < 15) {
      setDiagFeedbackBySkill((prev) => ({
        ...prev,
        [skillId]: "请填写至少 15 字的可核验 Starter 仓库切片、路由鉴权说明或测试命令输出。",
      }));
      return;
    }
    onVerifySkill({
      skillId,
      method: "starter-repo-evidence",
      evidenceSummary: draft.slice(0, 140),
      verifiedAt: new Date().toISOString().slice(0, 10),
    });
    setDiagFeedbackBySkill((prev) => ({
      ...prev,
      [skillId]: isSignedIn
        ? "已记录本地草稿；如需正式服务端认证，请在「班级与作业」提交后由老师审校授予 SkillGrant。"
        : "Starter 证据草稿已暂存本地。",
    }));
  };

  const handleSubmitQuickKb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim()) return;
    onAddCustomKb({
      title: kbTitle.trim(),
      moduleCode: moduleRecord.code as KnowledgeModuleCode,
      category: kbCategory,
      scope: kbScope.trim() || `${moduleRecord.code} 实战项目试用`,
      content: kbContent.trim(),
      cautionNote: "",
    });
    setKbTitle("");
    setKbScope("");
    setKbContent("");
    setKbSavedNotice(true);
    window.setTimeout(() => setKbSavedNotice(false), 2200);
  };

  if (!serverModuleAllowed && !isFreeTrial) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回课程目录</span>
        </button>

        <div className="p-6 sm:p-8 rounded-2xl border border-gemini-purple/45 bg-[#0b0f19] space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-mono text-amber-300">
              ENTITLEMENT REQUIRED · {moduleRecord.code} 付费课程模块
            </div>
            <h1 className="text-2xl font-bold text-white">{moduleRecord.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              M1 模块为开放免费试学样板；M2–M13-Eng 完整教学单元、交互沙盘、服务端测验与云端同步需登录账号并具备有效订阅或班级权益。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
            <div className="font-semibold text-white">本模块核心学习目标（公开大纲）：</div>
            <ul className="space-y-1.5 text-slate-300">
              {moduleRecord.learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenBilling?.()}
              className="px-5 py-2.5 rounded-xl bg-gemini-purple text-white font-semibold text-xs hover:opacity-90 cursor-pointer"
            >
              登录 / 订阅或兑换激活码解锁
            </button>
            <button
              type="button"
              onClick={() => onOpenModule("m1")}
              className="px-4 py-2.5 rounded-xl border border-gemini-cyan/40 bg-gemini-cyan/10 text-gemini-cyan font-semibold text-xs hover:bg-gemini-cyan/20 cursor-pointer"
            >
              前往 M1 免费试学 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Top Breadcrumb + Module Overview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回课程目录</span>
            </button>
            <span className="font-mono text-slate-400">
              {moduleRecord.code} ·{" "}
              {moduleRecord.exemplarLevel === "complete-exemplar"
                ? "专项精修样板"
                : "全闭环教学包映射"}{" "}
              · 更新 {moduleRecord.updatedAt} ·{" "}
              <span
                className={
                  moduleRecord.status === "needs-review" ? "text-amber-300" : "text-emerald-300"
                }
              >
                {moduleRecord.status === "needs-review" ? "部分待复核" : "已核验"}
              </span>
            </span>
            <div className="flex items-center gap-1">
              {prevModule && (
                <button
                  type="button"
                  onClick={() => onOpenModule(prevModule.id)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 cursor-pointer"
                >
                  ← {prevModule.code}
                </button>
              )}
              {nextModule && (
                <button
                  type="button"
                  onClick={() => onOpenModule(nextModule.id)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 cursor-pointer"
                >
                  {nextModule.code} →
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isInstructorAuthorized && serverInstructorAllowed && (
              <button
                type="button"
                onClick={onToggleViewMode}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isInstructorView
                    ? "bg-gemini-purple text-white border-gemini-purple"
                    : "bg-white/5 text-slate-200 border-white/15 hover:bg-white/10"
                }`}
                title="切换学员视图与教师备课/参考答案视图"
              >
                {isInstructorView ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>当前：教师视图（已展示备课与参考答案）</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>当前：学员视图（参考答案默认隐藏）</span>
                  </>
                )}
              </button>
            )}

            {isInstructorView && (
              <button
                type="button"
                disabled={exportingPlan}
                onClick={() => void handleExportInstructorPlan()}
                className="px-3 py-1.5 rounded-lg bg-gemini-purple/20 hover:bg-gemini-purple/30 border border-gemini-purple/45 text-xs text-purple-100 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                title="按当前选定的授课方案导出本模块教师备课讲义（含教学提示、示范与参考答案）"
              >
                <Download className="w-3.5 h-3.5 text-gemini-purple" />
                <span>{exportingPlan ? "导出中..." : "导出备课讲义 (.md)"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSwitchToReveal({ moduleId: moduleRecord.id })}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <PresentationIcon className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>打开 Reveal 幻灯片演示</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {moduleRecord.title}
            </h1>
            <div className="text-xs text-slate-400">
              先修要求：{moduleRecord.prerequisites.join("；")}
            </div>
            <ul className="space-y-1 text-xs text-slate-200 pt-1">
              {moduleRecord.learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
            <div className="text-xs text-amber-300/90 pt-1">
              边界说明：{moduleRecord.boundaryNote}
            </div>
          </div>

          {/* Configurable Delivery Plan Picker */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-white inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>授课方案组合（同一批单元按需选排）</span>
              </span>
              <span className="font-mono text-[11px] text-gemini-cyan tabular-nums">
                进度 {stats.completedCount}/{stats.totalCount}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {moduleRecord.deliveryPlans.map((plan) => {
                const isSelected = !showAllModuleUnits && activePlan?.id === plan.id;
                const mins = getDeliveryPlanMinutes(moduleRecord, plan);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-gemini-cyan/15 border-gemini-cyan text-white"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{plan.shortLabel}</div>
                    <div className="text-[10px] font-mono text-slate-400 tabular-nums mt-0.5">
                      {plan.unitIds.length} 单元 · 约 {mins}m
                    </div>
                  </button>
                );
              })}
            </div>

            {activePlan && !showAllModuleUnits && (
              <div className="text-[11px] text-slate-300 leading-relaxed">
                {activePlan.description}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => setShowAllModuleUnits((v) => !v)}
                className="font-mono text-gemini-cyan hover:underline cursor-pointer"
              >
                {showAllModuleUnits
                  ? "切回当前授课方案排序"
                  : `查看模块全部 ${moduleRecord.units.length} 个教学单元`}
              </button>
              <button
                type="button"
                onClick={() => onOpenKnowledgeBase(moduleRecord.code, kbTrackForModule)}
                className="font-mono text-purple-200 hover:underline cursor-pointer"
              >
                打开 {moduleRecord.code} {isRuntimeModule ? "运行时工作坊" : "工程知识库"} →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* M13-Gov Verbatim Simulation Disclaimer */}
      {moduleRecord.id === "m13-gov" && (
        <div className="p-4 rounded-2xl bg-amber-500/12 border border-amber-400/50 flex items-start gap-3 text-xs text-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-mono text-amber-300 font-semibold">
              无代码治理 Capstone 边界声明
            </div>
            <p className="leading-relaxed font-medium">{M13_GOV_SIMULATION_DISCLAIMER}</p>
          </div>
        </div>
      )}

      {/* Dual-Layer Prerequisite & Skill Verification Gate */}
      {(moduleRecord.prerequisiteModuleIds.length > 0 || gateSkillIds.length > 0) && (
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/12 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck
                className={`w-4 h-4 ${
                  readiness.ready ? "text-emerald-400" : "text-amber-300"
                }`}
              />
              <span>
                {moduleRecord.id === "m3"
                  ? "M3 能力证据核验台（完成 M3 不会自动发放技能，须提交 Starter 证据或通过诊断）"
                  : readiness.ready
                  ? "双层先修门禁已就绪（模块先修与能力先修均已满足）"
                  : "双层先修与能力门禁检查（建议先补齐缺失项）"}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              前置模块 {moduleRecord.prerequisiteModuleIds.length - readiness.missingModuleIds.length}/
              {moduleRecord.prerequisiteModuleIds.length} ·{" "}
              {moduleRecord.prerequisiteSkillIds.length > 0
                ? `必备技能 ${moduleRecord.prerequisiteSkillIds.length - readiness.missingSkillIds.length}/${moduleRecord.prerequisiteSkillIds.length}`
                : `本节核验技能 ${gateSkillIds.filter((sid) => Boolean(workspaceState.verifiedSkills?.[sid])).length}/${gateSkillIds.length}`}
            </span>
          </div>

          {moduleRecord.prerequisiteModuleIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-mono">模块先修：</span>
              {moduleRecord.prerequisiteModuleIds.map((pid) => {
                const pMod = COURSE_MODULE_RECORDS.find((m) => m.id === pid);
                const done = completedModuleIdsSet.has(pid);
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => onOpenModule(pid)}
                    className={`px-2 py-0.5 rounded-lg border font-mono text-[11px] cursor-pointer transition-colors ${
                      done
                        ? "bg-emerald-500/12 border-emerald-400/40 text-emerald-200"
                        : "bg-amber-500/10 border-amber-400/35 text-amber-200 hover:bg-amber-500/20"
                    }`}
                  >
                    {pMod?.code || pid.toUpperCase()} {done ? "[✓]" : "[未完成 · 前往]"}
                  </button>
                );
              })}
            </div>
          )}

          {gateSkillIds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gateSkillIds.map((sid) => {
                const skill = getSkillById(sid);
                if (!skill) return null;
                const record = workspaceState.verifiedSkills?.[sid];
                const isDiagOpen = activeDiagSkillId === sid;
                const feedback = diagFeedbackBySkill[sid];

                return (
                  <div
                    key={sid}
                    className={`p-3 rounded-xl border space-y-2 ${
                      record
                        ? "bg-emerald-500/[0.06] border-emerald-400/35"
                        : "bg-white/[0.025] border-white/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="font-semibold text-white">{skill.title}</span>
                      <span
                        className={`font-mono text-[10px] ${
                          record ? "text-emerald-300" : "text-amber-300"
                        }`}
                      >
                        {record ? `已核验 (${record.method})` : "待核验"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {skill.evidencePrompt}
                    </p>

                    {record ? (
                      <div className="text-[11px] font-mono text-emerald-200 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                        核验记录 ({record.verifiedAt})：{record.evidenceSummary}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {skill.acceptedMethods.includes("starter-repo-evidence") && (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={evidenceDraftBySkill[sid] || ""}
                              onChange={(e) =>
                                setEvidenceDraftBySkill((prev) => ({
                                  ...prev,
                                  [sid]: e.target.value,
                                }))
                              }
                              placeholder="贴入 Starter 鉴权路由/Webhook 验签说明及测试退出码 (≥15字)..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-white placeholder:text-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleSubmitStarterEvidence(sid)}
                              className="px-2.5 py-1 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-[11px] cursor-pointer"
                            >
                              提交可核验 Starter 证据并登记技能
                            </button>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {skill.acceptedMethods.includes("diagnostic-check") && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDiagSkillId((prev) => (prev === sid ? null : sid))
                              }
                              className="px-2.5 py-1 rounded-lg bg-gemini-purple/20 hover:bg-gemini-purple/30 border border-gemini-purple/45 text-[11px] text-purple-100 cursor-pointer"
                            >
                              {isDiagOpen ? "收起 2 题诊断测评" : "开始 2 题能力诊断测评 (需 2/2)"}
                            </button>
                          )}
                          {skill.remediationModuleId && skill.remediationModuleId !== moduleRecord.id && (
                            <button
                              type="button"
                              onClick={() => onOpenModule(skill.remediationModuleId!)}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 cursor-pointer"
                            >
                              前往 {skill.remediationModuleId.toUpperCase()} 补修 →
                            </button>
                          )}
                        </div>

                        {isDiagOpen && (
                          <div className="p-2.5 rounded-lg bg-black/50 border border-white/15 space-y-2.5">
                            {skill.diagnosticQuestions.map((dq, dIdx) => {
                              const picked = diagAnswersBySkill[sid]?.[dq.id];
                              return (
                                <div key={dq.id} className="space-y-1">
                                  <div className="text-[11px] font-semibold text-white">
                                    D{dIdx + 1}. {dq.prompt}
                                  </div>
                                  <div className="grid grid-cols-1 gap-1">
                                    {dq.options.map((opt, oIdx) => (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        onClick={() =>
                                          setDiagAnswersBySkill((prev) => ({
                                            ...prev,
                                            [sid]: {
                                              ...(prev[sid] || {}),
                                              [dq.id]: oIdx,
                                            },
                                          }))
                                        }
                                        className={`px-2 py-1 rounded text-left text-[11px] border cursor-pointer ${
                                          picked === oIdx
                                            ? "bg-gemini-cyan/20 border-gemini-cyan text-white"
                                            : "bg-white/[0.03] border-white/10 text-slate-300"
                                        }`}
                                      >
                                        {["A", "B", "C", "D"][oIdx]}. {opt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => handleSubmitSkillDiagnostic(sid)}
                              className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-[11px] cursor-pointer"
                            >
                              提交诊断并验证
                            </button>
                          </div>
                        )}

                        {feedback && (
                          <div className="text-[11px] text-amber-300">{feedback}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Split: Left Unit Nav + Right Unit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Unit Navigation List */}
        <aside
          aria-label="教学单元列表"
          className="lg:col-span-4 p-3.5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2 lg:sticky lg:top-20"
        >
          <div className="flex items-center justify-between gap-2 px-1 pb-1 border-b border-white/10">
            <span className="text-xs font-semibold text-white">
              {showAllModuleUnits
                ? `全部单元 (${visibleUnits.length})`
                : `${activePlan?.shortLabel || "方案"}单元序列 (${visibleUnits.length})`}
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              约 {visibleUnits.reduce((s, u) => s + u.estimatedMinutes, 0)} 分钟
            </span>
          </div>

          <div className="space-y-1.5">
            {visibleUnits.map((unit, idx) => {
              const isSelected = activeUnit?.id === unit.id;
              const isDone = Boolean(workspaceState.completedUnitIds[unit.id]);
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => selectUnitAndScroll(unit.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-gemini-cyan/12 border-gemini-cyan text-white"
                      : isDone
                      ? "bg-emerald-500/[0.06] border-emerald-400/25 text-slate-200"
                      : "bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <span
                    className={`font-mono text-xs mt-0.5 shrink-0 ${
                      isDone ? "text-emerald-400" : isSelected ? "text-gemini-cyan" : "text-slate-500"
                    }`}
                  >
                    {isDone ? "[✓]" : `${String(idx + 1).padStart(2, "0")}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold leading-snug">{unit.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 tabular-nums">
                      {COURSE_UNIT_TYPE_LABELS[unit.type]} · {unit.estimatedMinutes}m
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isSelected ? "text-gemini-cyan" : "text-slate-600"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Active Unit Player */}
        {activeUnit && (
          <section className="lg:col-span-8 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/12 space-y-5">
              {/* Unit Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
                    <span className="text-gemini-cyan">
                      {COURSE_UNIT_TYPE_LABELS[activeUnit.type]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>预计 {activeUnit.estimatedMinutes} 分钟</span>
                    <span aria-hidden="true">·</span>
                    <span>更新 {activeUnit.updatedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        activeUnit.verificationStatus === "needs-review"
                          ? "text-amber-300"
                          : "text-emerald-300"
                      }
                    >
                      {activeUnit.verificationStatus === "needs-review" ? "待复核" : "已核验"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">
                    {activeUnit.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeUnit.revealJump && (
                    <button
                      type="button"
                      onClick={() =>
                        onSwitchToReveal({
                          moduleId: moduleRecord.id,
                          labId: activeUnit.revealJump?.labId,
                          slideOffset: activeUnit.revealJump?.slideOffset,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-gemini-cyan hover:text-slate-950 border border-white/15 text-xs font-mono text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {activeUnit.revealJump.label || "打开 Reveal 演示"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleUnitComplete(activeUnit.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      unitCompleted
                        ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                        : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{unitCompleted ? "已完成本单元" : "标记为已完成"}</span>
                  </button>
                </div>
              </div>

              {/* Objective + Summary */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-gemini-cyan/25 space-y-1.5">
                <div className="text-[11px] font-mono text-gemini-cyan">本单元学习目标</div>
                <div className="text-sm font-medium text-white leading-relaxed">
                  {activeUnit.learningObjective}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{activeUnit.summary}</p>
              </div>

              {/* Core Content Blocks */}
              {activeUnit.contentBlocks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    核心内容与适用说明
                  </h3>
                  <div className="space-y-2">
                    {activeUnit.contentBlocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/[0.025] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed"
                      >
                        {block}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Traditional vs AI Comparison Matrix */}
              {activeUnit.type === "ai-vs-trad" && teachingPkg && (
                <div className="p-4 rounded-xl bg-[#070b14] border border-gemini-cyan/30 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-gemini-cyan font-semibold">
                      结构化工程对照：传统编程 vs AI Coding 协作
                    </span>
                    <span className="text-[11px] text-amber-300">
                      瓶颈转移：{teachingPkg.traditionalVsAi.bottleneckShift}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/15 text-[11px] font-mono text-slate-400">
                          <th className="py-2 pr-3 font-medium">比较维度</th>
                          <th className="py-2 px-3 font-medium">传统编程做法</th>
                          <th className="py-2 pl-3 font-medium text-gemini-cyan">
                            AI Coding 协作做法
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {teachingPkg.traditionalVsAi.rows.map((row, idx) => (
                          <tr key={idx} className="align-top">
                            <td className="py-2.5 pr-3 font-semibold text-white whitespace-nowrap">
                              {row.dimension}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 leading-relaxed">
                              {row.traditionalWay}
                            </td>
                            <td className="py-2.5 pl-3 text-slate-200 leading-relaxed">
                              {row.aiCodingWay}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-500/[0.06] border border-rose-400/25 space-y-1">
                    <div className="font-mono text-[11px] text-rose-300 font-semibold">
                      不可委托给 AI 拍板的边界场景：
                    </div>
                    {teachingPkg.traditionalVsAi.nonDelegableCases.map((c, idx) => (
                      <div key={idx} className="text-slate-200 leading-relaxed">
                        · {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Demo Steps */}
              {activeUnit.demoSteps && activeUnit.demoSteps.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono text-gemini-cyan uppercase tracking-wider">
                    演示控制流（暴露缺陷 → 加约束 → 命令验真）
                  </h3>
                  <div className="space-y-2.5">
                    {activeUnit.demoSteps.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#070b14] border border-white/10 space-y-1.5 text-xs"
                      >
                        <div className="font-bold text-white">{st.phase}</div>
                        <div className="text-slate-300 leading-relaxed">
                          <span className="font-mono text-slate-400">操作：</span>
                          {st.action}
                        </div>
                        <div className="text-amber-200 leading-relaxed">
                          <span className="font-mono text-amber-300">AI 表现/证据：</span>
                          {st.aiBehaviorOrEvidence}
                        </div>
                        <div className="text-emerald-300 leading-relaxed">
                          <span className="font-mono">人类把关：</span>
                          {st.humanControl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failure Case Analysis (Hides direct answer unless revealed or in Teacher View) */}
              {activeUnit.failureAnalysis && (
                <div className="p-4 rounded-xl bg-rose-500/[0.05] border border-rose-400/30 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-rose-300 inline-flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>失败现场与“看起来对但实际错”排查</span>
                    </span>
                    {!isInstructorView && (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedFailureSolutionUnitId((prev) =>
                            prev === activeUnit.id ? null : activeUnit.id
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] cursor-pointer"
                      >
                        {revealedFailureSolutionUnitId === activeUnit.id
                          ? "收起参考剖析"
                          : "先自己思考，再查看参考剖析"}
                      </button>
                    )}
                  </div>

                  <p className="text-slate-200 leading-relaxed">
                    <span className="font-mono text-rose-300">事故场景：</span>
                    {activeUnit.failureAnalysis.mistakeScenario}
                  </p>

                  <div className="space-y-1">
                    <div className="font-mono text-amber-300">排查与反问问题：</div>
                    {activeUnit.failureAnalysis.analysisQuestions.map((q, i) => (
                      <div key={i} className="text-slate-200">
                        {i + 1}. {q}
                      </div>
                    ))}
                  </div>

                  {(isInstructorView || revealedFailureSolutionUnitId === activeUnit.id) && (
                    <div className="pt-2.5 border-t border-rose-400/20 space-y-1.5">
                      <div className="text-rose-200 leading-relaxed">
                        <span className="font-mono text-rose-300">深层根因：</span>
                        {activeUnit.failureAnalysis.rootCause}
                      </div>
                      <div className="text-emerald-300 leading-relaxed">
                        <span className="font-mono">纠偏与防复发做法：</span>
                        {activeUnit.failureAnalysis.fixGuidance}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Learner Task & Human vs AI Split */}
              {activeUnit.learnerTask && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs">
                    <div className="font-semibold text-white text-sm">
                      学员协同练习目标：{activeUnit.learnerTask.goal}
                    </div>
                    <ol className="space-y-1.5 text-slate-200 leading-relaxed">
                      {activeUnit.learnerTask.steps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-mono text-gemini-cyan shrink-0">0{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="text-slate-400">
                      所需材料：{activeUnit.learnerTask.requiredMaterials.join(" · ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-400/25 space-y-1.5">
                      <div className="font-mono text-emerald-300 font-semibold">
                        必须由人负责的决策与检查
                      </div>
                      {activeUnit.learnerTask.humanResponsibilities.map((h, i) => (
                        <div key={i} className="text-slate-200 leading-relaxed">
                          · {h}
                        </div>
                      ))}
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                      <div className="font-mono text-gemini-cyan font-semibold">
                        AI 可接手起草的工作
                      </div>
                      {activeUnit.learnerTask.aiResponsibilities.map((a, i) => (
                        <div key={i} className="text-slate-300 leading-relaxed">
                          · {a}
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeUnit.type === "collab-practice" && teachingPkg && (
                    <div className="p-3.5 rounded-xl bg-[#070b14] border border-gemini-purple/30 space-y-2 text-xs">
                      <div className="font-mono text-purple-200 font-semibold">
                        多维验收 Rubric（不以生成代码行数衡量）
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {teachingPkg.rubric.map((r, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 space-y-1"
                          >
                            <div className="font-semibold text-white">{r.dimension}</div>
                            <div className="text-emerald-300 leading-relaxed">
                              合格：{r.passCriteria}
                            </div>
                            <div className="text-slate-400 text-[11px]">证据：{r.evidence}</div>
                            <div className="text-rose-300 text-[11px]">红线：{r.redFlag}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Starter Artifact Template */}
              {activeUnit.learnerArtifact && (
                <div className="p-4 rounded-xl bg-[#070b14] border border-gemini-purple/35 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-mono text-purple-200">
                        产物模板 · {activeUnit.learnerArtifact.filename}
                      </div>
                      <div className="text-sm font-bold text-white">
                        {activeUnit.learnerArtifact.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onSavePracticeNote(activeUnit.id, {
                            artifactDraft: activeUnit.learnerArtifact!.templateContent,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-[11px] cursor-pointer whitespace-nowrap"
                      >
                        填入下方练习草稿
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(
                            activeUnit.id + "-tpl",
                            activeUnit.learnerArtifact!.templateContent
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        {copiedId === activeUnit.id + "-tpl" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gemini-cyan" />
                            <span>复制模板</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                    {activeUnit.learnerArtifact.templateContent}
                  </pre>
                </div>
              )}

              {/* Sandbox Status & Jump */}
              {activeUnit.type === "sandbox" && activeUnit.revealJump?.labId && (
                <div className="p-4 rounded-xl bg-[#070b14] border border-gemini-cyan/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {(() => {
                    const lab = COURSE_LABS.find((l) => l.id === activeUnit.revealJump?.labId);
                    const done = lab ? completedLabIds.includes(lab.id) : false;
                    return (
                      <>
                        <div className="space-y-1 text-xs">
                          <div className="font-mono text-gemini-cyan inline-flex items-center gap-1.5">
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>
                              沙盘本地状态：{done ? "已完成全量验收 [✓]" : "待完成沙盘内验收勾选"}
                            </span>
                          </div>
                          {lab && (
                            <div className="text-slate-300">
                              交付物：{lab.deliverables.join("；")}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onSwitchToReveal({
                              moduleId: moduleRecord.id,
                              labId: activeUnit.revealJump?.labId,
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>打开 Reveal 交互沙盘</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Inline Quiz Runner (Server-sanitized & server-graded) */}
              {activeUnit.type === "quiz" && moduleQuiz && (() => {
                const totalQ = moduleQuiz.questions.length;
                const answeredQ = moduleQuiz.questions.filter(
                  (q) => typeof quizAnswers[q.id] === "number"
                ).length;
                const gradedCorrectQ = moduleQuiz.questions.filter((q) => {
                  const sr = serverQuizGrade?.questionResults.find((r) => r.questionId === q.id);
                  return Boolean(sr ? sr.isCorrect : gradedByQuestionId[q.id]?.isCorrect);
                }).length;
                const gradedWrongQ = moduleQuiz.questions.filter((q) => {
                  const sr = serverQuizGrade?.questionResults.find((r) => r.questionId === q.id);
                  const g = sr ?? gradedByQuestionId[q.id];
                  return Boolean(g && !g.isCorrect);
                }).length;
                const gradedCount = moduleQuiz.questions.filter((q) =>
                  Boolean(
                    serverQuizGrade?.questionResults.find((r) => r.questionId === q.id) ??
                      gradedByQuestionId[q.id]
                  )
                ).length;
                const pct = totalQ > 0 ? Math.round((gradedCorrectQ / totalQ) * 100) : 0;

                return (
                <div className="p-4 rounded-xl bg-[#070b14] border border-white/15 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-white">
                      {moduleQuiz.moduleTitle} · {isSignedIn ? "服务端权威测验" : "M1 免费试学在线自测"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isSignedIn && serverQuizGrade ? (
                        <span className="text-xs font-mono text-emerald-300 tabular-nums">
                          服务端判分：{serverQuizGrade.correctCount}/{serverQuizGrade.totalCount} (
                          {serverQuizGrade.scorePct}%) ·{" "}
                          {serverQuizGrade.passed ? "通过" : "建议巩固错题"}
                        </span>
                      ) : isSignedIn && latestQuizSummary ? (
                        <span className="text-xs font-mono text-gemini-cyan tabular-nums">
                          云端记录：{latestQuizSummary.correctCount}/{latestQuizSummary.totalCount} (
                          {latestQuizSummary.scorePct}%)
                        </span>
                      ) : gradedCount > 0 ? (
                        <span className="text-xs font-mono text-gemini-cyan tabular-nums">
                          已答 {answeredQ}/{totalQ} · 正确 {gradedCorrectQ} ({pct}%)
                        </span>
                      ) : answeredQ > 0 ? (
                        <span className="text-xs font-mono text-gemini-cyan tabular-nums">
                          已答 {answeredQ}/{totalQ}
                        </span>
                      ) : null}

                      {gradedWrongQ > 0 && (
                        <button
                          type="button"
                          onClick={handleRetryWrongQuiz}
                          className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-[11px] font-mono text-amber-200 cursor-pointer"
                        >
                          只重做错题 ({gradedWrongQ})
                        </button>
                      )}
                      {Object.keys(quizAnswers).length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetQuiz}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-slate-300 cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>清空重测</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(sanitizedQuestions ??
                      moduleQuiz.questions.map((mq) => ({
                        id: mq.id,
                        topic: mq.topic,
                        question: mq.question,
                        options: mq.options,
                        reviewTarget: mq.reviewTarget,
                      }))
                    ).map((q, qIdx) => {
                      const picked = quizAnswers[q.id];
                      const serverQ = serverQuizGrade?.questionResults.find(
                        (r) => r.questionId === q.id
                      );
                      const singleQ = gradedByQuestionId[q.id];
                      const activeGrade = serverQ ?? singleQ;
                      const showGraded = Boolean(activeGrade);
                      const correctIdx = activeGrade?.correctIndex;
                      const isCorrect = Boolean(activeGrade?.isCorrect);
                      const explanation = activeGrade?.explanation ?? "";
                      const rem = getQuestionRemediation(q.id, moduleRecord.id);

                      return (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5 text-xs"
                        >
                          <div className="font-semibold text-white leading-relaxed">
                            <span className="font-mono text-gemini-cyan mr-1.5">
                              Q{qIdx + 1}.
                            </span>
                            {q.question}
                          </div>

                          <div className="grid grid-cols-1 gap-1.5">
                            {q.options.map((opt, oIdx) => {
                              const selected = picked === oIdx;
                              const isRightOpt =
                                showGraded && typeof correctIdx === "number" && oIdx === correctIdx;
                              let cls = selected
                                ? "bg-gemini-cyan/15 border-gemini-cyan text-white"
                                : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25";
                              if (showGraded) {
                                if (isRightOpt) {
                                  cls = "bg-emerald-500/15 border-emerald-400/50 text-emerald-200";
                                } else if (selected && !isRightOpt) {
                                  cls = "bg-rose-500/15 border-rose-400/50 text-rose-200";
                                }
                              }
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleSelectQuizOption(q.id, oIdx)}
                                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${cls}`}
                                >
                                  <span className="font-mono mr-2">
                                    {["A", "B", "C", "D"][oIdx]}.
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {showGraded && (
                            <div
                              className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                                isCorrect
                                  ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-200"
                                  : "bg-rose-500/10 border-rose-400/30 text-rose-200"
                              }`}
                            >
                              <div>
                                <span className="font-semibold">
                                  {isCorrect ? "回答正确：" : "思路纠正："}
                                </span>
                                {explanation}
                              </div>
                              {!isCorrect && (
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-slate-200">
                                  <span>
                                    补救建议：{activeGrade?.remediationAction ?? rem.reviewAction}
                                  </span>
                                  {rem.labId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onSwitchToReveal({
                                          moduleId: moduleRecord.id,
                                          labId: rem.labId,
                                        })
                                      }
                                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-[10px] cursor-pointer"
                                    >
                                      前往 {rem.labLabel || rem.labId} →
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isSignedIn && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                      <div className="text-[11px] text-slate-400">
                        {serverQuizGrade && serverQuizGrade.weakTopics.length > 0
                          ? `薄弱知识点：${serverQuizGrade.weakTopics.join("、")}`
                          : "作答完成后提交至服务端判分并写入云端档案。"}
                      </div>
                      <button
                        type="button"
                        disabled={
                          quizSubmitting ||
                          Object.keys(quizAnswers).length < moduleQuiz.questions.length
                        }
                        onClick={() => void handleServerQuizSubmit()}
                        className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {quizSubmitting ? "正在判分..." : "提交测验由服务端判分"}
                      </button>
                    </div>
                  )}

                  {quizError && <div className="text-xs text-rose-300">{quizError}</div>}
                </div>
                );
              })()}

              {/* 3-Tier Transfer Tasks Selector */}
              {(activeUnit.type === "transfer-task" || activeUnit.afterClassNote) && teachingPkg && (
                <div className="space-y-2.5">
                  <div className="text-xs font-mono text-emerald-300">
                    选择本周课后迁移任务档位（已选：
                    {unitPractice?.selectedTransferTier || "尚未选定"}）
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {teachingPkg.homeworkTiers.map((hw) => {
                      const picked = unitPractice?.selectedTransferTier === hw.label;
                      return (
                        <div
                          key={hw.tier}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 text-xs ${
                            picked
                              ? "bg-emerald-500/10 border-emerald-400/50"
                              : "bg-white/[0.025] border-white/10"
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="font-mono text-[10px] text-emerald-300">{hw.label}</div>
                            <div className="font-bold text-white leading-snug">{hw.title}</div>
                            <p className="text-slate-300 leading-relaxed">{hw.goal}</p>
                            <div className="text-[11px] text-slate-400">
                              交付：{hw.deliverable}
                            </div>
                            <div className="text-[11px] text-amber-300/90">
                              人工核查：{hw.humanReviewGate}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onSavePracticeNote(activeUnit.id, {
                                selectedTransferTier: hw.label,
                              })
                            }
                            className={`w-full py-1.5 rounded-lg font-mono text-[11px] cursor-pointer transition-colors ${
                              picked
                                ? "bg-emerald-400 text-slate-950 font-semibold"
                                : "bg-white/10 hover:bg-white/15 text-white"
                            }`}
                          >
                            {picked ? "已选定本档任务" : "选定此迁移任务"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completion Criteria Checklist (>=3 items) */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-emerald-400 font-semibold">
                    本单元可验证完成标准（DoD 自检）
                  </span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {unitDodChecked.length}/{activeUnit.completionCriteria.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {activeUnit.completionCriteria.map((criterion, idx) => {
                    const checked = unitDodChecked.includes(criterion);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onToggleCriterion(activeUnit.id, criterion)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                          checked
                            ? "bg-emerald-500/12 border-emerald-400/40 text-white"
                            : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        <span
                          className={`font-mono shrink-0 ${
                            checked ? "text-emerald-300" : "text-slate-500"
                          }`}
                        >
                          {checked ? "[✓]" : "[ ]"}
                        </span>
                        <span className="leading-relaxed">{criterion}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Learner Practice Artifact & Reflection Notebook */}
              <div className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono text-gemini-cyan inline-flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>学员产物草稿与复盘笔记（自动保存在本地浏览器）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unitPractice?.updatedAt && (
                      <span className="text-[11px] font-mono text-emerald-300/90">
                        已本地保存 · {unitPractice.updatedAt}
                      </span>
                    )}
                    {(unitPractice?.artifactDraft || unitPractice?.reflectionNote) && (
                      <button
                        type="button"
                        onClick={() =>
                          onSavePracticeNote(activeUnit.id, {
                            artifactDraft: "",
                            reflectionNote: "",
                          })
                        }
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-rose-200 cursor-pointer"
                      >
                        清空本单元草稿
                      </button>
                    )}
                  </div>
                </div>

                {(activeUnit.type === "collab-practice" ||
                  activeUnit.learnerArtifact ||
                  Boolean(unitPractice?.artifactDraft)) && (
                  <div className="space-y-1">
                    <label
                      htmlFor={`artifact-${activeUnit.id}`}
                      className="block text-[11px] text-slate-400"
                    >
                      产物草稿（可改写或粘贴你的 Plan / 规则 / 验证命令输出）
                    </label>
                    <textarea
                      id={`artifact-${activeUnit.id}`}
                      rows={5}
                      value={unitPractice?.artifactDraft || ""}
                      onChange={(e) =>
                        onSavePracticeNote(activeUnit.id, { artifactDraft: e.target.value })
                      }
                      placeholder="输入或点击上方「填入下方练习草稿」开始修改；切勿填写任何真实 API Key 或个人隐私。"
                      className="w-full p-2.5 rounded-lg bg-black/50 border border-white/15 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gemini-cyan"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label
                    htmlFor={`reflection-${activeUnit.id}`}
                    className="block text-[11px] text-slate-400"
                  >
                    学习复盘 / 人类裁决记录（记录 AI 哪里容易出错、你否决了什么、可沉淀什么规则）
                  </label>
                  <textarea
                    id={`reflection-${activeUnit.id}`}
                    rows={3}
                    value={unitPractice?.reflectionNote || ""}
                    onChange={(e) =>
                      onSavePracticeNote(activeUnit.id, { reflectionNote: e.target.value })
                    }
                    placeholder="写下 2~3 句复盘结论，导出学习成果时会汇总成 Markdown。"
                    className="w-full p-2.5 rounded-lg bg-black/50 border border-white/15 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-gemini-cyan"
                  />
                </div>
              </div>

              {/* Knowledge Sedimentation & Linked Team KB */}
              <div className="p-4 rounded-xl bg-white/[0.025] border border-gemini-purple/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-purple-200 inline-flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-gemini-purple" />
                    <span>
                      知识库关联条目与沉淀 ({relatedKbEntries.length + moduleCustomKbs.length})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenKnowledgeBase(moduleRecord.code, kbTrackForModule)}
                    className="text-xs font-mono text-gemini-cyan hover:underline cursor-pointer"
                  >
                    打开{isRuntimeModule ? "链路 B 运行时工作坊" : "链路 A 工程知识库"} →
                  </button>
                </div>

                <div className="text-xs text-slate-300">{activeUnit.knowledgeSedimentNote}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {relatedKbEntries.slice(0, 4).map((kb) => (
                    <div
                      key={kb.id}
                      className="p-3 rounded-lg bg-black/40 border border-white/10 text-xs space-y-1.5 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-white leading-snug">{kb.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          <span
                            className={
                              kb.kbTrack === "runtime-domain"
                                ? "text-emerald-300"
                                : "text-purple-200"
                            }
                          >
                            {kb.kbTrack === "runtime-domain" ? "运行时工作坊" : "研发工程 KB"}
                          </span>{" "}
                          · {KNOWLEDGE_CATEGORY_LABELS[kb.category]} ·{" "}
                          {KNOWLEDGE_STATUS_LABELS[kb.validationStatus]} · {kb.version}
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-2">{kb.summary}</div>
                        <div className="text-[10px] text-slate-400">
                          适用：{kb.scope}
                        </div>
                        <div className="text-[10px] text-amber-300/90 line-clamp-1">
                          注意：{kb.antiPatternOrWarning}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => void handleCopy(`kb-${kb.id}`, kb.copyableSnippet)}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `kb-${kb.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gemini-cyan" />
                              <span>复制模板</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {moduleCustomKbs.map((ckb) => (
                    <div
                      key={ckb.id}
                      className="p-3 rounded-lg bg-gemini-cyan/[0.06] border border-gemini-cyan/30 text-xs space-y-1 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-white leading-snug">{ckb.title}</div>
                        <div className="text-[10px] font-mono text-gemini-cyan">
                          个人/团队沉淀 · {KNOWLEDGE_CATEGORY_LABELS[ckb.category]} · {ckb.updatedAt}
                        </div>
                        <div className="text-[11px] text-slate-300">适用：{ckb.scope}</div>
                        <pre className="p-2 rounded bg-black/45 font-mono text-[10px] text-slate-200 whitespace-pre-wrap line-clamp-3">
                          {ckb.content}
                        </pre>
                      </div>
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => void handleCopy(`ckb-${ckb.id}`, ckb.content)}
                          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === `ckb-${ckb.id}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-gemini-cyan" />
                              <span>复制内容</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {activeUnit.type === "knowledge-base" && !isRuntimeModule && (
                  <form
                    onSubmit={handleSubmitQuickKb}
                    className="pt-3 border-t border-white/10 space-y-2"
                  >
                    <div className="text-xs font-semibold text-white">
                      快速沉淀 1 条到我的工程知识草稿（归入链路 A · 随成果导出 Markdown）
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={kbTitle}
                        onChange={(e) => setKbTitle(e.target.value)}
                        placeholder="条目标题"
                        required
                        className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                      <select
                        value={kbCategory}
                        onChange={(e) => setKbCategory(e.target.value as KnowledgeCategory)}
                        className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-slate-200"
                      >
                        {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map(
                          (cat) => (
                            <option key={cat} value={cat} className="bg-[#090d16]">
                              {KNOWLEDGE_CATEGORY_LABELS[cat]}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="text"
                        value={kbScope}
                        onChange={(e) => setKbScope(e.target.value)}
                        placeholder="适用范围（例：个人 React 项目）"
                        className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={kbContent}
                      onChange={(e) => setKbContent(e.target.value)}
                      placeholder="填写可直接复用的规则内容、检查清单或避坑模板..."
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 font-mono text-xs text-white"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-emerald-300">
                        {kbSavedNotice ? "已保存至本地知识库中心！" : ""}
                      </span>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-gemini-purple text-white text-xs font-semibold cursor-pointer"
                      >
                        存入知识库
                      </button>
                    </div>
                  </form>
                )}

                {activeUnit.type === "knowledge-base" && isRuntimeModule && (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">
                      当前模块属于「链路 B · Agent 运行时领域知识库工坊」，与链路 A 个人工程草稿彻底隔离；请前往运行时工坊检索契约与导出规范。
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenKnowledgeBase(moduleRecord.code, "runtime-domain")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-medium cursor-pointer whitespace-nowrap"
                    >
                      前往链路 B 运行时工作坊 →
                    </button>
                  </div>
                )}
              </div>

              {/* Related External Resources */}
              {relatedResources.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>关联一手参考来源（标注来源与核验态）</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {relatedResources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-200 inline-flex items-center gap-1.5"
                      >
                        <span>{res.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({res.organization} ·{" "}
                          {res.status === "needs-review" ? "待复核" : "已核对"})
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Teacher Materials Panel: STRICTLY GATED behind Instructor Authorization + Teacher View! */}
              {isInstructorView ? (
                <div className="p-4 rounded-xl bg-gemini-purple/[0.09] border border-gemini-purple/45 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-purple-200 font-semibold inline-flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-gemini-purple" />
                      <span>教师备课指南与参考答案（仅教师视图可见）</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      裁剪建议：{activeUnit.teacherMaterials.timeTrimNote}
                    </span>
                  </div>
                  <div className="text-slate-200 leading-relaxed">
                    <span className="font-mono text-purple-200">教学组织提示：</span>
                    {activeUnit.teacherMaterials.teachingTips}
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-emerald-300">参考答案与可接受解法：</div>
                    {activeUnit.teacherMaterials.referenceAnswers.map((ans, idx) => (
                      <div key={idx} className="text-slate-200 leading-relaxed">
                        · {ans}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="font-mono text-amber-300">课堂常见翻车点 / 引导预警：</div>
                    {activeUnit.teacherMaterials.commonPitfalls.map((pit, idx) => (
                      <div key={idx} className="text-amber-200/90 leading-relaxed">
                        · {pit}
                      </div>
                    ))}
                  </div>
                </div>
              ) : isInstructorAuthorized ? (
                <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>
                    当前处于「学员视图」：讲师备课话术、卡住提示与参考答案默认隐藏，避免课堂直接剧透。
                  </span>
                  <button
                    type="button"
                    onClick={onToggleViewMode}
                    className="font-mono text-purple-200 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    切换为教师视图 →
                  </button>
                </div>
              ) : null}

              {/* Unit Footer Navigation */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!prevUnit}
                  onClick={() => prevUnit && selectUnitAndScroll(prevUnit.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap ${
                    prevUnit
                      ? "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 cursor-pointer"
                      : "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{prevUnit ? `上一单元：${prevUnit.title}` : "已到首个单元"}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCompleteAndNext}
                    className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>
                      {nextUnit
                        ? "标记本单元完成并继续下一单元"
                        : unitCompleted
                        ? "已完成本方案全部单元"
                        : "标记完成本单元"}
                    </span>
                    {nextUnit && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                  {!nextUnit && nextModule && (
                    <button
                      type="button"
                      onClick={() => onOpenModule(nextModule.id)}
                      className="px-3.5 py-2 rounded-xl bg-gemini-purple text-white font-semibold text-xs hover:opacity-90 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>进入下一模块 ({nextModule.code})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
