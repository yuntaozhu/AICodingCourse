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
  Eye,
  EyeOff,
  FileCode2,
  FlaskConical,
  GraduationCap,
  Layers,
  Play,
  Presentation as PresentationIcon,
} from "lucide-react";
import { COURSE_LABS } from "@/data/courseCurriculum";
import { getModuleTeachingPackage } from "@/data/moduleTeachingPackages";
import { getQuizReviewSummary, MODULE_QUIZZES } from "@/data/moduleQuizzes";
import { getQuestionRemediation } from "@/data/quizRemediation";
import {
  COURSE_UNIT_TYPE_LABELS,
  getDeliveryPlanMinutes,
  getResourcesByIds,
  getUnitsForPlan,
  type CourseModuleRecord,
  type CourseUnit,
} from "@/data/courseUnitsModel";
import {
  getModuleCompletionStats,
  QUIZ_ANSWERS_STORAGE_KEY,
  type CourseWorkspaceState,
  type CustomKnowledgeDraft,
  type PracticeNoteRecord,
} from "@/data/courseWorkspaceStore";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  TEAM_KNOWLEDGE_BASE,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
} from "@/data/teamKnowledgeBase";

interface ModuleLearningPageProps {
  moduleRecord: CourseModuleRecord;
  initialUnitId?: string;
  workspaceState: CourseWorkspaceState;
  completedLabIds: string[];
  onBackToCatalog: () => void;
  onSelectPlan: (moduleId: string, planId: string) => void;
  onVisitUnit: (moduleId: string, unitId: string, planId: string) => void;
  onToggleUnitComplete: (unitId: string) => void;
  onToggleCriterion: (unitId: string, criterionText: string) => void;
  onSavePracticeNote: (unitId: string, note: Partial<PracticeNoteRecord>) => void;
  onAddCustomKb: (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => void;
  onToggleViewMode: () => void;
  onOpenKnowledgeBase: (moduleCode?: string) => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string; slideOffset?: number }) => void;
}

function loadQuizAnswers(moduleOrder: number): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, number>>;
    return parsed[String(moduleOrder)] || {};
  } catch {
    return {};
  }
}

function saveQuizAnswers(moduleOrder: number, answers: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
    parsed[String(moduleOrder)] = answers;
    window.localStorage.setItem(QUIZ_ANSWERS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore storage errors
  }
}

export default function ModuleLearningPage({
  moduleRecord,
  initialUnitId,
  workspaceState,
  completedLabIds,
  onBackToCatalog,
  onSelectPlan,
  onVisitUnit,
  onToggleUnitComplete,
  onToggleCriterion,
  onSavePracticeNote,
  onAddCustomKb,
  onToggleViewMode,
  onOpenKnowledgeBase,
  onSwitchToReveal,
}: ModuleLearningPageProps) {
  const activePlanId =
    workspaceState.selectedPlanByModule[moduleRecord.id] || moduleRecord.deliveryPlans[0]?.id;
  const activePlan =
    moduleRecord.deliveryPlans.find((p) => p.id === activePlanId) ||
    moduleRecord.deliveryPlans[0];

  const [showAllModuleUnits, setShowAllModuleUnits] = useState(false);

  const visibleUnits = useMemo(() => {
    if (showAllModuleUnits) return moduleRecord.units;
    return getUnitsForPlan(moduleRecord, activePlan?.id);
  }, [moduleRecord, activePlan?.id, showAllModuleUnits]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => {
    if (initialUnitId && visibleUnits.some((u) => u.id === initialUnitId)) {
      return initialUnitId;
    }
    return visibleUnits[0]?.id || moduleRecord.units[0]?.id || "";
  });

  const [revealedFailureSolutionUnitId, setRevealedFailureSolutionUnitId] = useState<string | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quiz state synced with localStorage
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>(() =>
    loadQuizAnswers(moduleRecord.order)
  );

  // Quick KB draft inline form
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState<KnowledgeCategory>("starter-rule");
  const [kbScope, setKbScope] = useState("");
  const [kbContent, setKbContent] = useState("");
  const [kbSavedNotice, setKbSavedNotice] = useState(false);

  const activeUnit: CourseUnit =
    visibleUnits.find((u) => u.id === selectedUnitId) ||
    moduleRecord.units.find((u) => u.id === selectedUnitId) ||
    visibleUnits[0] ||
    moduleRecord.units[0];

  const activeUnitId = activeUnit?.id;
  const activePlanResolvedId = activePlan?.id;

  useEffect(() => {
    if (activeUnitId && activePlanResolvedId) {
      onVisitUnit(moduleRecord.id, activeUnitId, activePlanResolvedId);
    }
  }, [moduleRecord.id, activeUnitId, activePlanResolvedId, onVisitUnit]);

  const activeIndex = visibleUnits.findIndex((u) => u.id === activeUnit?.id);
  const prevUnit = activeIndex > 0 ? visibleUnits[activeIndex - 1] : null;
  const nextUnit =
    activeIndex >= 0 && activeIndex < visibleUnits.length - 1
      ? visibleUnits[activeIndex + 1]
      : null;

  const isInstructorView = workspaceState.viewMode === "instructor";
  const stats = getModuleCompletionStats(
    moduleRecord,
    workspaceState,
    showAllModuleUnits ? undefined : activePlan?.id
  );
  const teachingPkg = getModuleTeachingPackage(moduleRecord.id);

  const unitPractice = activeUnit ? workspaceState.practiceNotes[activeUnit.id] : undefined;
  const unitDodChecked = activeUnit ? workspaceState.dodCheckedByUnit[activeUnit.id] || [] : [];
  const unitCompleted = activeUnit ? Boolean(workspaceState.completedUnitIds[activeUnit.id]) : false;

  const relatedResources = activeUnit ? getResourcesByIds(activeUnit.relatedResourceIds) : [];
  const relatedKbEntries = activeUnit
    ? TEAM_KNOWLEDGE_BASE.filter(
        (kb) =>
          activeUnit.knowledgeEntryIds.includes(kb.id) || kb.modules.includes(moduleRecord.code)
      )
    : [];

  const moduleQuiz = MODULE_QUIZZES[moduleRecord.order];
  const quizSummary = moduleQuiz ? getQuizReviewSummary(moduleQuiz, quizAnswers) : null;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setShowAllModuleUnits(false);
    onSelectPlan(moduleRecord.id, planId);
    const nextPlanUnits = getUnitsForPlan(moduleRecord, planId);
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
      setSelectedUnitId(nextUnit.id);
    }
  };

  const handleSelectQuizOption = (questionId: string, optionIdx: number) => {
    const next = { ...quizAnswers, [questionId]: optionIdx };
    setQuizAnswers(next);
    saveQuizAnswers(moduleRecord.order, next);
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
                ? "完整样板模块"
                : "兼容适配模块"}{" "}
              · 更新 {moduleRecord.updatedAt} ·{" "}
              <span
                className={
                  moduleRecord.status === "needs-review" ? "text-amber-300" : "text-emerald-300"
                }
              >
                {moduleRecord.status === "needs-review" ? "部分待复核" : "已核验"}
              </span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => onOpenKnowledgeBase(moduleRecord.code)}
                className="font-mono text-purple-200 hover:underline cursor-pointer"
              >
                打开 {moduleRecord.code} 知识库 →
              </button>
            </div>
          </div>
        </div>
      </div>

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
                  onClick={() => setSelectedUnitId(unit.id)}
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

              {/* Inline Quiz Runner (synced with localStorage & Reveal QuizSlide) */}
              {activeUnit.type === "quiz" && moduleQuiz && (
                <div className="p-4 rounded-xl bg-[#070b14] border border-white/15 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold text-white">
                      {moduleQuiz.moduleTitle} · 在线自测
                    </div>
                    {quizSummary && (
                      <div className="text-xs font-mono text-gemini-cyan tabular-nums">
                        已答 {quizSummary.answeredCount}/{moduleQuiz.questions.length} · 正确{" "}
                        {quizSummary.correctCount} ({quizSummary.accuracyPct}%)
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {moduleQuiz.questions.map((q, qIdx) => {
                      const picked = quizAnswers[q.id];
                      const answered = typeof picked === "number";
                      const isCorrect = picked === q.correctIndex;
                      const rem = getQuestionRemediation(q.id, moduleRecord.order);

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
                              const isRightOpt = oIdx === q.correctIndex;
                              let cls =
                                "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25";
                              if (answered) {
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

                          {answered && (
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
                                {q.explanation}
                              </div>
                              {!isCorrect && (
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-slate-200">
                                  <span>补救建议：{rem.reviewAction}</span>
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
                </div>
              )}

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
                  {unitPractice?.updatedAt && (
                    <span className="text-[11px] font-mono text-slate-500">
                      上次记录：{unitPractice.updatedAt}
                    </span>
                  )}
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
                    <span>知识库关联条目与沉淀 ({relatedKbEntries.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenKnowledgeBase(moduleRecord.code)}
                    className="text-xs font-mono text-gemini-cyan hover:underline cursor-pointer"
                  >
                    打开完整知识库中心 →
                  </button>
                </div>

                <div className="text-xs text-slate-300">{activeUnit.knowledgeSedimentNote}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {relatedKbEntries.slice(0, 4).map((kb) => (
                    <div
                      key={kb.id}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs space-y-1"
                    >
                      <div className="font-semibold text-white leading-snug">{kb.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {KNOWLEDGE_CATEGORY_LABELS[kb.category]} ·{" "}
                        {KNOWLEDGE_STATUS_LABELS[kb.validationStatus]} · {kb.version}
                      </div>
                      <div className="text-[11px] text-slate-300 line-clamp-2">{kb.summary}</div>
                    </div>
                  ))}
                </div>

                {activeUnit.type === "knowledge-base" && (
                  <form
                    onSubmit={handleSubmitQuickKb}
                    className="pt-3 border-t border-white/10 space-y-2"
                  >
                    <div className="text-xs font-semibold text-white">
                      快速沉淀 1 条到我的知识库（随成果导出 Markdown）
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

              {/* Teacher Materials Panel: STRICTLY GATED behind Teacher View! */}
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
              ) : (
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
              )}

              {/* Unit Footer Navigation */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!prevUnit}
                  onClick={() => prevUnit && setSelectedUnitId(prevUnit.id)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap ${
                    prevUnit
                      ? "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 cursor-pointer"
                      : "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{prevUnit ? `上一单元：${prevUnit.title}` : "已到首个单元"}</span>
                </button>

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
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
