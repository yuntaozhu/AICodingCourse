import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookMarked,
  Check,
  Download,
  Eye,
  EyeOff,
  Home,
  Presentation as PresentationIcon,
  Trash2,
} from "lucide-react";
import CourseCatalogHome from "@/components/course/CourseCatalogHome";
import CourseKnowledgeView from "@/components/course/CourseKnowledgeView";
import ModuleLearningPage from "@/components/course/ModuleLearningPage";
import { COURSE_MODULE_RECORDS, getModuleRecordById } from "@/data/courseUnitsModel";
import {
  buildWorkspaceMarkdownExport,
  clearAllCourseLearningData,
  loadAllQuizAnswers,
  loadWorkspaceState,
  saveWorkspaceState,
  type CourseWorkspaceState,
  type CustomKnowledgeDraft,
  type PracticeNoteRecord,
} from "@/data/courseWorkspaceStore";
import { getCompletedLabIds, loadAllLabDodProgress } from "@/data/labPracticeEngine";

type CourseSubView = "catalog" | "module" | "knowledge";

interface CourseSystemAppProps {
  initialModuleId?: string;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string; slideOffset?: number }) => void;
}

export default function CourseSystemApp({
  initialModuleId,
  onSwitchToReveal,
}: CourseSystemAppProps) {
  const [workspaceState, setWorkspaceState] = useState<CourseWorkspaceState>(() =>
    loadWorkspaceState()
  );
  const [subView, setSubView] = useState<CourseSubView>(
    initialModuleId ? "module" : "catalog"
  );
  const [activeModuleId, setActiveModuleId] = useState<string>(
    initialModuleId || workspaceState.lastVisited?.moduleId || "m1"
  );
  const [activeUnitId, setActiveUnitId] = useState<string | undefined>(
    workspaceState.lastVisited?.unitId
  );
  const [kbModuleFilter, setKbModuleFilter] = useState<string>("ALL");
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() =>
    getCompletedLabIds(loadAllLabDodProgress())
  );
  const [quizAnswersByModule, setQuizAnswersByModule] = useState<
    Record<string, Record<string, number>>
  >(() => loadAllQuizAnswers());
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportedFeedback, setExportedFeedback] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollWorkspaceTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const syncLabs = () => setCompletedLabIds(getCompletedLabIds(loadAllLabDodProgress()));
    const syncQuizzes = () => setQuizAnswersByModule(loadAllQuizAnswers());
    const handleStorage = () => {
      syncLabs();
      syncQuizzes();
    };
    window.addEventListener("course:lab-progress-updated", syncLabs);
    window.addEventListener("course:quiz-progress-updated", syncQuizzes);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("course:lab-progress-updated", syncLabs);
      window.removeEventListener("course:quiz-progress-updated", syncQuizzes);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateState = (updater: (prev: CourseWorkspaceState) => CourseWorkspaceState) => {
    setWorkspaceState((prev) => {
      const next = updater(prev);
      saveWorkspaceState(next);
      return next;
    });
  };

  const handleOpenModule = (moduleId: string, unitId?: string, planId?: string) => {
    setActiveModuleId(moduleId);
    setActiveUnitId(unitId);
    if (planId) {
      updateState((prev) => ({
        ...prev,
        selectedPlanByModule: { ...prev.selectedPlanByModule, [moduleId]: planId },
      }));
    }
    setSubView("module");
    scrollWorkspaceTop();
  };

  const handleOpenKnowledgeBase = (moduleCode?: string) => {
    setKbModuleFilter(moduleCode || "ALL");
    setSubView("knowledge");
    scrollWorkspaceTop();
  };

  const handleSelectPlan = (moduleId: string, planId: string) => {
    updateState((prev) => ({
      ...prev,
      selectedPlanByModule: { ...prev.selectedPlanByModule, [moduleId]: planId },
    }));
  };

  const handleApplyPlanPresetAll = (preset: "double" | "short" | "workshop" | "self") => {
    updateState((prev) => {
      const nextPlans = { ...prev.selectedPlanByModule };
      for (const mod of COURSE_MODULE_RECORDS) {
        const target =
          mod.deliveryPlans.find((p) => p.id.endsWith(`-plan-${preset}`)) ||
          mod.deliveryPlans[0];
        if (target) {
          nextPlans[mod.id] = target.id;
        }
      }
      return {
        ...prev,
        selectedPlanByModule: nextPlans,
      };
    });
  };

  const handleVisitUnit = useCallback((moduleId: string, unitId: string, planId: string) => {
    const now = new Date().toISOString().slice(0, 10);
    setWorkspaceState((prev) => {
      if (
        prev.lastVisited?.moduleId === moduleId &&
        prev.lastVisited?.unitId === unitId &&
        prev.lastVisited?.planId === planId
      ) {
        return prev;
      }
      const next = {
        ...prev,
        lastVisited: { moduleId, unitId, planId, updatedAt: now },
      };
      saveWorkspaceState(next);
      return next;
    });
  }, []);

  const handleToggleUnitComplete = (unitId: string) => {
    updateState((prev) => ({
      ...prev,
      completedUnitIds: {
        ...prev.completedUnitIds,
        [unitId]: !prev.completedUnitIds[unitId],
      },
    }));
  };

  const handleToggleCriterion = (unitId: string, criterionText: string) => {
    updateState((prev) => {
      const current = prev.dodCheckedByUnit[unitId] || [];
      const nextList = current.includes(criterionText)
        ? current.filter((item) => item !== criterionText)
        : [...current, criterionText];
      return {
        ...prev,
        dodCheckedByUnit: {
          ...prev.dodCheckedByUnit,
          [unitId]: nextList,
        },
      };
    });
  };

  const handleSavePracticeNote = (unitId: string, partial: Partial<PracticeNoteRecord>) => {
    const today = new Date().toISOString().slice(0, 10);
    updateState((prev) => {
      const existing = prev.practiceNotes[unitId] || {
        artifactDraft: "",
        reflectionNote: "",
        updatedAt: today,
      };
      return {
        ...prev,
        practiceNotes: {
          ...prev.practiceNotes,
          [unitId]: {
            ...existing,
            ...partial,
            updatedAt: today,
          },
        },
      };
    });
  };

  const handleAddCustomKb = (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => {
    const today = new Date().toISOString().slice(0, 10);
    const id = `custom-kb-${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      customKbEntries: [{ ...entry, id, updatedAt: today }, ...prev.customKbEntries],
    }));
  };

  const handleDeleteCustomKb = (id: string) => {
    updateState((prev) => ({
      ...prev,
      customKbEntries: prev.customKbEntries.filter((item) => item.id !== id),
    }));
  };

  const handleToggleViewMode = () => {
    updateState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "learner" ? "instructor" : "learner",
    }));
  };

  const handleExportMarkdown = async () => {
    const md = buildWorkspaceMarkdownExport(workspaceState, quizAnswersByModule);
    try {
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aicoding-learning-export-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportedFeedback(true);
      window.setTimeout(() => setExportedFeedback(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(md);
        setExportedFeedback(true);
        window.setTimeout(() => setExportedFeedback(false), 2000);
      } catch {
        setExportedFeedback(false);
      }
    }
  };

  const handleConfirmClearAll = () => {
    const fresh = clearAllCourseLearningData();
    setWorkspaceState(fresh);
    setQuizAnswersByModule({});
    setActiveModuleId("m1");
    setActiveUnitId(undefined);
    setConfirmClear(false);
    setSubView("catalog");
    scrollWorkspaceTop();
  };

  const activeModuleRecord = getModuleRecordById(activeModuleId);

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-auto bg-[#020205] text-slate-200 custom-scrollbar"
    >
      {/* Sticky Course System Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#070a12]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSubView("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subView === "catalog"
                  ? "bg-white text-slate-950 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>课程目录</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubView("module");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subView === "module"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>
                模块学习{activeModuleRecord ? ` (${activeModuleRecord.code})` : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenKnowledgeBase()}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subView === "knowledge"
                  ? "bg-gemini-purple text-white font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>知识库中心</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleViewMode}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                workspaceState.viewMode === "instructor"
                  ? "bg-gemini-purple/25 border-gemini-purple text-purple-100"
                  : "bg-white/5 border-white/15 text-slate-300 hover:text-white"
              }`}
            >
              {workspaceState.viewMode === "instructor" ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-gemini-purple" />
                  <span>教师视图</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>学员视图</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void handleExportMarkdown()}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                exportedFeedback
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                  : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
              }`}
              title="导出已保存的练习产物、复盘笔记与自定义知识条目为 Markdown"
            >
              {exportedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已导出 .md</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-gemini-cyan" />
                  <span>导出成果 (.md)</span>
                </>
              )}
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/15 hover:border-rose-400/40 text-xs text-slate-300 hover:text-rose-200 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除本地数据</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-400/40 rounded-lg px-2 py-1 text-xs">
                <span className="text-rose-200">确认清空进度与笔记？</span>
                <button
                  type="button"
                  onClick={handleConfirmClearAll}
                  className="px-2 py-0.5 rounded bg-rose-500 text-white font-semibold cursor-pointer"
                >
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-0.5 rounded bg-white/10 text-slate-200 cursor-pointer"
                >
                  取消
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                onSwitchToReveal({
                  moduleId: subView === "module" ? activeModuleId : undefined,
                })
              }
              className="px-3 py-1.5 rounded-lg bg-gemini-cyan/15 hover:bg-gemini-cyan/25 border border-gemini-cyan/40 text-xs font-semibold text-gemini-cyan cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <PresentationIcon className="w-3.5 h-3.5" />
              <span>幻灯片模式 (Reveal)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-view Router */}
      <main className="pb-12">
        {subView === "catalog" && (
          <CourseCatalogHome
            workspaceState={workspaceState}
            completedLabIds={completedLabIds}
            quizAnswersByModule={quizAnswersByModule}
            onOpenModule={handleOpenModule}
            onApplyPlanPresetAll={handleApplyPlanPresetAll}
            onOpenKnowledgeBase={handleOpenKnowledgeBase}
            onSwitchToReveal={onSwitchToReveal}
          />
        )}

        {subView === "module" && activeModuleRecord && (
          <ModuleLearningPage
            key={activeModuleRecord.id}
            moduleRecord={activeModuleRecord}
            initialUnitId={activeUnitId}
            workspaceState={workspaceState}
            completedLabIds={completedLabIds}
            onBackToCatalog={() => setSubView("catalog")}
            onOpenModule={(modId) => handleOpenModule(modId)}
            onSelectPlan={handleSelectPlan}
            onVisitUnit={handleVisitUnit}
            onToggleUnitComplete={handleToggleUnitComplete}
            onToggleCriterion={handleToggleCriterion}
            onSavePracticeNote={handleSavePracticeNote}
            onAddCustomKb={handleAddCustomKb}
            onToggleViewMode={handleToggleViewMode}
            onOpenKnowledgeBase={handleOpenKnowledgeBase}
            onSwitchToReveal={onSwitchToReveal}
            onScrollTop={scrollWorkspaceTop}
          />
        )}

        {subView === "knowledge" && (
          <CourseKnowledgeView
            key={kbModuleFilter}
            initialModuleFilter={kbModuleFilter}
            customEntries={workspaceState.customKbEntries}
            onAddCustomEntry={handleAddCustomKb}
            onDeleteCustomEntry={handleDeleteCustomKb}
            onJumpToModule={(modId) => handleOpenModule(modId)}
          />
        )}
      </main>
    </div>
  );
}
