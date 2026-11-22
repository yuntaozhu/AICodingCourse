import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  Check,
  Download,
  Eye,
  EyeOff,
  Home,
  Presentation as PresentationIcon,
  Search,
  Trash2,
  X,
} from "lucide-react";
import CourseCatalogHome from "@/components/course/CourseCatalogHome";
import CourseKnowledgeView, {
  type KnowledgeSectionFilter,
} from "@/components/course/CourseKnowledgeView";
import ModuleLearningPage from "@/components/course/ModuleLearningPage";
import {
  SEARCH_KIND_LABELS,
  searchCourseWorkspace,
  type GlobalSearchResult,
} from "@/data/courseSearch";
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
  type SkillVerificationRecord,
} from "@/data/courseWorkspaceStore";
import { getCompletedLabIds, loadAllLabDodProgress } from "@/data/labPracticeEngine";
import type { KnowledgeBaseTrack } from "@/data/teamKnowledgeBase";

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
    !initialModuleId || initialModuleId === workspaceState.lastVisited?.moduleId
      ? workspaceState.lastVisited?.unitId
      : undefined
  );
  const [kbModuleFilter, setKbModuleFilter] = useState<string>("ALL");
  const [kbInitialSearch, setKbInitialSearch] = useState<string>("");
  const [kbInitialSection, setKbInitialSection] = useState<KnowledgeSectionFilter>("all");
  const [kbInitialTrack, setKbInitialTrack] = useState<KnowledgeBaseTrack | undefined>(undefined);
  const [kbNavSeq, setKbNavSeq] = useState(0);
  const [moduleNavSeq, setModuleNavSeq] = useState(0);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() =>
    getCompletedLabIds(loadAllLabDodProgress())
  );
  const [quizAnswersByModule, setQuizAnswersByModule] = useState<
    Record<string, Record<string, number>>
  >(() => loadAllQuizAnswers());
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportedFeedback, setExportedFeedback] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollWorkspaceTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const searchResponse = useMemo(
    () =>
      searchCourseWorkspace(globalQuery, {
        customKbEntries: workspaceState.customKbEntries,
        includeInstructorMaterials: workspaceState.viewMode === "instructor",
        limit: 16,
      }),
    [globalQuery, workspaceState.customKbEntries, workspaceState.viewMode]
  );

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (!isEditingField && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
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
    setModuleNavSeq((seq) => seq + 1);
    setSubView("module");
    scrollWorkspaceTop();
  };

  const handleOpenKnowledgeBase = (
    moduleCode?: string,
    initialSearch = "",
    section: KnowledgeSectionFilter = "all",
    track?: KnowledgeBaseTrack
  ) => {
    setKbModuleFilter(moduleCode || "ALL");
    setKbInitialSearch(initialSearch);
    setKbInitialSection(section);
    setKbInitialTrack(track);
    setKbNavSeq((seq) => seq + 1);
    setSubView("knowledge");
    scrollWorkspaceTop();
  };

  const handleSelectSearchResult = (item: GlobalSearchResult) => {
    setSearchOpen(false);
    if (item.kind === "module") {
      handleOpenModule(item.moduleId);
    } else if (item.kind === "unit") {
      handleOpenModule(item.moduleId, item.unitId);
    } else if (item.kind === "book") {
      handleOpenKnowledgeBase("ALL", item.kbQuery || globalQuery.trim(), "books", "engineering");
    } else if (item.kind === "runtime-kb") {
      handleOpenKnowledgeBase(
        item.moduleCode,
        item.kbQuery || globalQuery.trim(),
        "rules",
        "runtime-domain"
      );
    } else {
      handleOpenKnowledgeBase(
        item.moduleCode,
        item.kbQuery || globalQuery.trim(),
        item.kbSection || "all",
        item.kbTrack || "engineering"
      );
    }
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

  const handleVerifySkill = (record: SkillVerificationRecord) => {
    updateState((prev) => ({
      ...prev,
      verifiedSkills: {
        ...prev.verifiedSkills,
        [record.skillId]: record,
      },
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

            {/* Global Search Bar beside Navigation Tabs */}
            <div ref={searchBoxRef} className="relative ml-0 sm:ml-1.5 w-full sm:w-64 lg:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                role="combobox"
                aria-expanded={searchOpen && globalQuery.trim().length > 0}
                aria-label="全局检索课程模块、单元内容与自定义知识库"
                value={globalQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setGlobalQuery(e.target.value);
                  setHighlightedIdx(0);
                  setSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    searchInputRef.current?.blur();
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchOpen(true);
                    setHighlightedIdx((prev) =>
                      searchResponse.results.length > 0
                        ? (prev + 1) % searchResponse.results.length
                        : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchOpen(true);
                    setHighlightedIdx((prev) =>
                      searchResponse.results.length > 0
                        ? (prev - 1 + searchResponse.results.length) % searchResponse.results.length
                        : 0
                    );
                  } else if (e.key === "Enter" && searchResponse.results.length > 0) {
                    e.preventDefault();
                    const picked =
                      searchResponse.results[highlightedIdx] || searchResponse.results[0];
                    if (picked) {
                      handleSelectSearchResult(picked);
                    }
                  }
                }}
                placeholder="全局检索模块、单元、知识库..."
                className="w-full pl-8 pr-12 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan focus:bg-white/[0.08] transition-colors"
              />
              {globalQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalQuery("");
                    setHighlightedIdx(0);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="清空全局搜索"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 pointer-events-none">
                  /
                </span>
              )}

              {/* Global Search Results Dropdown */}
              {searchOpen && globalQuery.trim().length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-[min(92vw,34rem)] max-h-[70vh] overflow-y-auto rounded-xl bg-[#0a0f1d] border border-white/15 shadow-2xl z-50 custom-scrollbar">
                  <div className="sticky top-0 px-3 py-2 bg-[#0a0f1d]/95 backdrop-blur-sm border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <span>
                      命中 {searchResponse.totalCount} 条
                      {searchResponse.totalCount > searchResponse.results.length
                        ? `（展示前 ${searchResponse.results.length} 条）`
                        : ""}
                    </span>
                    <span className="tabular-nums">
                      模块 {searchResponse.counts.module} · 单元 {searchResponse.counts.unit} ·
                      自建 {searchResponse.counts["custom-kb"]} · 工程{" "}
                      {searchResponse.counts["team-kb"]} · 运行时{" "}
                      {searchResponse.counts["runtime-kb"]} · 书籍 {searchResponse.counts.book}
                    </span>
                  </div>

                  {searchResponse.results.length === 0 ? (
                    <div className="p-5 text-center space-y-1 text-xs">
                      <div className="text-slate-200 font-medium">
                        未找到与 “{globalQuery.trim()}” 匹配的内容
                      </div>
                      <div className="text-slate-400">
                        可尝试搜索模块编号（如 M4）、工程关键词（如 Plan、MCP、DoD）、书名或自建知识标题
                      </div>
                    </div>
                  ) : (
                    <div className="p-1.5 space-y-1">
                      {searchResponse.results.map((item, idx) => {
                        const isHighlighted = idx === highlightedIdx;
                        const kindTone =
                          item.kind === "module"
                            ? "text-gemini-cyan border-gemini-cyan/35 bg-gemini-cyan/10"
                            : item.kind === "custom-kb"
                            ? "text-sky-300 border-sky-400/35 bg-sky-500/10"
                            : item.kind === "runtime-kb"
                            ? "text-emerald-300 border-emerald-400/40 bg-emerald-500/15"
                            : item.kind === "team-kb"
                            ? "text-purple-200 border-gemini-purple/40 bg-gemini-purple/15"
                            : item.kind === "book"
                            ? "text-amber-300 border-amber-400/35 bg-amber-500/10"
                            : "text-slate-200 border-white/15 bg-white/5";

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onMouseEnter={() => setHighlightedIdx(idx)}
                            onClick={() => handleSelectSearchResult(item)}
                            className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                              isHighlighted
                                ? "bg-white/10 border-gemini-cyan/50"
                                : "bg-transparent border-transparent hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-white leading-snug">
                                {item.title}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded border text-[10px] font-mono shrink-0 ${kindTone}`}
                              >
                                {SEARCH_KIND_LABELS[item.kind]}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {item.subtitle}
                            </div>
                            <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                              {item.snippet}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
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
            onOpenKnowledgeBase={(modCode, track) =>
              handleOpenKnowledgeBase(modCode, "", "all", track)
            }
            onSwitchToReveal={onSwitchToReveal}
          />
        )}

        {subView === "module" && activeModuleRecord && (
          <ModuleLearningPage
            key={`${activeModuleRecord.id}-${moduleNavSeq}`}
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
            onVerifySkill={handleVerifySkill}
            onToggleViewMode={handleToggleViewMode}
            onOpenKnowledgeBase={(modCode, track) =>
              handleOpenKnowledgeBase(modCode, "", "all", track)
            }
            onSwitchToReveal={onSwitchToReveal}
            onScrollTop={scrollWorkspaceTop}
          />
        )}

        {subView === "knowledge" && (
          <CourseKnowledgeView
            key={`${kbInitialTrack || "auto"}-${kbModuleFilter}-${kbInitialSection}-${kbNavSeq}`}
            initialTrack={kbInitialTrack}
            initialModuleFilter={kbModuleFilter}
            initialSearchQuery={kbInitialSearch}
            initialSection={kbInitialSection}
            customEntries={workspaceState.customKbEntries}
            onAddCustomEntry={handleAddCustomKb}
            onDeleteCustomEntry={handleDeleteCustomKb}
            onJumpToModule={(modId) => handleOpenModule(modId)}
            onOpenBookLab={() => onSwitchToReveal({ labId: "book-kb" })}
            onOpenRuntimeLab={(labId) => onSwitchToReveal({ labId })}
          />
        )}
      </main>
    </div>
  );
}
