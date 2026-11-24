import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  Check,
  CloudUpload,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FolderGit2,
  Globe,
  Home,
  LogIn,
  LogOut,
  Presentation as PresentationIcon,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import CourseCatalogHome from "@/components/course/CourseCatalogHome";
import CourseKnowledgeView, {
  type KnowledgeSectionFilter,
} from "@/components/course/CourseKnowledgeView";
import ModuleLearningPage from "@/components/course/ModuleLearningPage";
import ProjectWorkspacePanel, { type ProjectHubTab } from "@/components/course/ProjectWorkspacePanel";
import AdminConsole from "@/components/lms/AdminConsole";
import CohortLearnerPanel from "@/components/lms/CohortLearnerPanel";
import InstructorCockpit from "@/components/lms/InstructorCockpit";
import type { ModuleProgressStage } from "@/data/projectTemplatesPublic";
import { useAuth } from "@/context/authContextCore";
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
  type WorkspaceQuizScoreSummary,
} from "@/data/courseWorkspaceStore";
import { getCompletedLabIds, loadAllLabDodProgress } from "@/data/labPracticeEngine";
import type { KnowledgeBaseTrack } from "@/data/teamKnowledgeBase";
import {
  deleteCustomKbEntry,
  fetchWorkspaceCloudState,
  importLegacyWorkspace,
  saveCustomKbEntry,
  saveWorkspaceUnitProgress,
} from "@/lib/apiClient";

export type CourseSubView =
  | "catalog"
  | "module"
  | "projects"
  | "knowledge"
  | "cohort"
  | "instructor"
  | "admin";

interface CourseSystemAppProps {
  initialModuleId?: string;
  initialSubView?: CourseSubView;
  onGoOfficialHome?: () => void;
  onOpenBilling?: () => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string; slideOffset?: number }) => void;
}

export default function CourseSystemApp({
  initialModuleId,
  initialSubView,
  onGoOfficialHome,
  onOpenBilling,
  onSwitchToReveal,
}: CourseSystemAppProps) {
  const { session, loading: authLoading, signOutUser, refreshSession } = useAuth();
  const isInstructorAuthorized = Boolean(session?.isAdmin || session?.isInstructorOrTa);
  const hasPaidAccess = Boolean(session?.hasPaidAccess);

  const [workspaceState, setWorkspaceState] = useState<CourseWorkspaceState>(() =>
    loadWorkspaceState()
  );
  const [subView, setSubView] = useState<CourseSubView>(
    initialSubView || (initialModuleId ? "module" : "catalog")
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
  const [projectHubTab, setProjectHubTab] = useState<ProjectHubTab>("workspace");
  const [projectHubModuleId, setProjectHubModuleId] = useState<string | undefined>(undefined);
  const [projectHubSeq, setProjectHubSeq] = useState(0);
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() =>
    getCompletedLabIds(loadAllLabDodProgress())
  );
  const [quizAnswersByModule, setQuizAnswersByModule] = useState<
    Record<string, Record<string, number>>
  >(() => loadAllQuizAnswers());
  const [latestQuizByModule, setLatestQuizByModule] = useState<
    Record<string, WorkspaceQuizScoreSummary>
  >({});
  const [moduleStageById, setModuleStageById] = useState<
    Record<string, ModuleProgressStage>
  >({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [exportedFeedback, setExportedFeedback] = useState(false);
  const [legacyImportPrompt, setLegacyImportPrompt] = useState(false);
  const [legacyImporting, setLegacyImporting] = useState(false);
  const [cloudNotice, setCloudNotice] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollWorkspaceTop = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const syncFromCloud = useCallback(async () => {
    if (!session) return;
    try {
      const cloud = await fetchWorkspaceCloudState();
      const localDraft = loadWorkspaceState();
      const hasLocalDraft =
        Object.keys(localDraft.completedUnitIds).length > 0 ||
        Object.keys(localDraft.practiceNotes).length > 0 ||
        localDraft.customKbEntries.length > 0;
      const cloudEmpty =
        Object.keys(cloud.completedUnitIds).length === 0 &&
        Object.keys(cloud.practiceNotes).length === 0 &&
        cloud.customKbEntries.length === 0;
      if (hasLocalDraft && cloudEmpty) {
        setLegacyImportPrompt(true);
      }

      setWorkspaceState((prev) => ({
        ...prev,
        completedUnitIds: cloud.completedUnitIds,
        dodCheckedByUnit: cloud.dodCheckedByUnit,
        selectedPlanByModule: {
          ...prev.selectedPlanByModule,
          ...cloud.selectedPlanByModule,
        },
        practiceNotes: cloud.practiceNotes,
        customKbEntries: cloud.customKbEntries as CustomKnowledgeDraft[],
        verifiedSkills: cloud.verifiedSkills as Record<string, SkillVerificationRecord>,
        viewMode: isInstructorAuthorized ? prev.viewMode : "learner",
      }));

      const nextQuizAns: Record<string, Record<string, number>> = {};
      const nextLatestQuiz: Record<string, WorkspaceQuizScoreSummary> = {};
      for (const [modId, att] of Object.entries(cloud.latestQuizByModule)) {
        nextQuizAns[modId] = att.answers;
        nextLatestQuiz[modId] = {
          correctCount: att.correctCount,
          totalCount: att.totalCount,
          scorePct: att.scorePct,
        };
      }
      setQuizAnswersByModule((prev) => ({ ...prev, ...nextQuizAns }));
      setLatestQuizByModule(nextLatestQuiz);
      if (cloud.moduleStageById) {
        setModuleStageById(cloud.moduleStageById);
      }
    } catch {
      // Keep graceful state if cloud fetch transiently fails
    }
  }, [session, isInstructorAuthorized]);

  useEffect(() => {
    if (session) {
      void syncFromCloud();
    } else {
      setWorkspaceState((prev) =>
        prev.viewMode === "instructor" ? { ...prev, viewMode: "learner" } : prev
      );
    }
  }, [session, syncFromCloud]);

  useEffect(() => {
    if (initialModuleId) {
      setActiveModuleId(initialModuleId);
      setSubView("module");
    }
  }, [initialModuleId]);

  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  const searchResponse = useMemo(
    () =>
      searchCourseWorkspace(globalQuery, {
        customKbEntries: workspaceState.customKbEntries,
        includeInstructorMaterials:
          isInstructorAuthorized && workspaceState.viewMode === "instructor",
        limit: 16,
      }),
    [globalQuery, workspaceState.customKbEntries, workspaceState.viewMode, isInstructorAuthorized]
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

  const handleOpenProjectHub = (tab: ProjectHubTab = "workspace", moduleId?: string) => {
    setProjectHubTab(tab);
    setProjectHubModuleId(moduleId);
    setProjectHubSeq((seq) => seq + 1);
    setSubView("projects");
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

  const resolveUnitContext = (unitId: string) => {
    for (const mod of COURSE_MODULE_RECORDS) {
      if (mod.units.some((u) => u.id === unitId)) {
        const planId =
          workspaceState.selectedPlanByModule[mod.id] || mod.deliveryPlans[0]?.id || `${mod.id}-plan-double`;
        return { moduleId: mod.id, planId };
      }
    }
    return { moduleId: activeModuleId, planId: `${activeModuleId}-plan-double` };
  };

  const handleToggleUnitComplete = (unitId: string) => {
    const nextCompleted = !workspaceState.completedUnitIds[unitId];
    updateState((prev) => ({
      ...prev,
      completedUnitIds: {
        ...prev.completedUnitIds,
        [unitId]: nextCompleted,
      },
    }));
    if (session) {
      const ctx = resolveUnitContext(unitId);
      void saveWorkspaceUnitProgress({
        moduleId: ctx.moduleId,
        unitId,
        planId: ctx.planId,
        completed: nextCompleted,
      });
    }
  };

  const handleToggleCriterion = (unitId: string, criterionText: string) => {
    const current = workspaceState.dodCheckedByUnit[unitId] || [];
    const nextList = current.includes(criterionText)
      ? current.filter((item) => item !== criterionText)
      : [...current, criterionText];
    updateState((prev) => ({
      ...prev,
      dodCheckedByUnit: {
        ...prev.dodCheckedByUnit,
        [unitId]: nextList,
      },
    }));
    if (session) {
      const ctx = resolveUnitContext(unitId);
      void saveWorkspaceUnitProgress({
        moduleId: ctx.moduleId,
        unitId,
        planId: ctx.planId,
        dodChecked: nextList,
      });
    }
  };

  const handleSavePracticeNote = (unitId: string, partial: Partial<PracticeNoteRecord>) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = workspaceState.practiceNotes[unitId] || {
      artifactDraft: "",
      reflectionNote: "",
      updatedAt: today,
    };
    const merged = {
      ...existing,
      ...partial,
      updatedAt: today,
    };
    updateState((prev) => ({
      ...prev,
      practiceNotes: {
        ...prev.practiceNotes,
        [unitId]: merged,
      },
    }));
    if (session) {
      const ctx = resolveUnitContext(unitId);
      void saveWorkspaceUnitProgress({
        moduleId: ctx.moduleId,
        unitId,
        planId: ctx.planId,
        artifactDraft: merged.artifactDraft,
        reflectionNote: merged.reflectionNote,
        selectedTransferTier: merged.selectedTransferTier ?? null,
      });
    }
  };

  const handleAddCustomKb = (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => {
    const today = new Date().toISOString().slice(0, 10);
    const id = `custom-kb-${Date.now()}`;
    updateState((prev) => ({
      ...prev,
      customKbEntries: [{ ...entry, id, updatedAt: today }, ...prev.customKbEntries],
    }));
    if (session) {
      void saveCustomKbEntry({
        clientEntryId: id,
        title: entry.title,
        moduleCode: entry.moduleCode,
        category: entry.category,
        scope: entry.scope,
        content: entry.content,
        cautionNote: entry.cautionNote,
      });
    }
  };

  const handleDeleteCustomKb = (id: string) => {
    updateState((prev) => ({
      ...prev,
      customKbEntries: prev.customKbEntries.filter((item) => item.id !== id),
    }));
    if (session) {
      void deleteCustomKbEntry(id);
    }
  };

  const handleToggleViewMode = () => {
    if (!isInstructorAuthorized) return;
    updateState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === "learner" ? "instructor" : "learner",
    }));
  };

  const handleImportLegacyDrafts = async () => {
    const localDraft = loadWorkspaceState();
    setLegacyImporting(true);
    try {
      const res = await importLegacyWorkspace({
        completedUnitIds: localDraft.completedUnitIds,
        dodCheckedByUnit: localDraft.dodCheckedByUnit,
        practiceNotes: localDraft.practiceNotes,
        customKbEntries: localDraft.customKbEntries,
      });
      setLegacyImportPrompt(false);
      setCloudNotice(
        `已导入 ${res.importedUnits} 条单元进度/草稿与 ${res.importedKb} 条个人知识到云端（草稿导入不直接授予技能认证）。`
      );
      await syncFromCloud();
    } catch (err) {
      setCloudNotice(err instanceof Error ? err.message : "导入历史草稿失败。");
    } finally {
      setLegacyImporting(false);
    }
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
    const md = buildWorkspaceMarkdownExport(
      workspaceState,
      quizAnswersByModule,
      latestQuizByModule
    );
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
    setLatestQuizByModule({});
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
            {onGoOfficialHome && (
              <button
                type="button"
                onClick={onGoOfficialHome}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="返回 Coding Everything 项目学院官网首页"
              >
                <Globe className="w-3.5 h-3.5 text-gemini-cyan" />
                <span className="hidden sm:inline">官网</span>
              </button>
            )}

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
              onClick={() => setSubView("projects")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subView === "projects"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>项目学院 &amp; Tutor</span>
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
              <span>知识库</span>
            </button>

            <button
              type="button"
              onClick={() => setSubView("cohort")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                subView === "cohort"
                  ? "bg-emerald-400 text-slate-950 font-semibold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>班级与作业</span>
            </button>

            {isInstructorAuthorized && (
              <button
                type="button"
                onClick={() => setSubView("instructor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  subView === "instructor"
                    ? "bg-gemini-purple text-white font-semibold"
                    : "text-purple-200 hover:bg-gemini-purple/20"
                }`}
              >
                <span>教师批改台</span>
              </button>
            )}

            {session?.isAdmin && (
              <button
                type="button"
                onClick={() => setSubView("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  subView === "admin"
                    ? "bg-amber-400 text-slate-950 font-semibold"
                    : "text-amber-200 hover:bg-amber-500/20"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>教务后台</span>
              </button>
            )}

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
            {isInstructorAuthorized && (
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
            )}

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
                  <span className="hidden xl:inline">导出成果 (.md)</span>
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
                <span className="hidden xl:inline">清除本地草稿</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-400/40 rounded-lg px-2 py-1 text-xs">
                <span className="text-rose-200">确认清空本地缓存？</span>
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
              className="px-2.5 py-1.5 rounded-lg bg-gemini-cyan/15 hover:bg-gemini-cyan/25 border border-gemini-cyan/40 text-xs font-semibold text-gemini-cyan cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <PresentationIcon className="w-3.5 h-3.5" />
              <span>幻灯片模式</span>
            </button>

            {session ? (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenBilling?.()}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                  title={session.user.email}
                >
                  <CreditCard className="w-3.5 h-3.5 text-gemini-cyan" />
                  <span className="font-mono text-[11px]">
                    {hasPaidAccess ? "已开通权益" : "订阅 / 兑换"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  aria-label="退出登录"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={authLoading}
                onClick={() => window.dispatchEvent(new CustomEvent("app:open-login"))}
                className="px-3 py-1.5 rounded-lg bg-gemini-purple text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登录解锁</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Cloud Sync / Legacy LocalStorage Draft Migration Banner */}
      {(legacyImportPrompt || cloudNotice) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="p-3 rounded-xl border border-gemini-cyan/35 bg-gemini-cyan/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-100">
              {cloudNotice ||
                "检测到您登录前在浏览器本地保存了练习笔记与单元进度，是否作为历史草稿导入当前云端账号？（导入草稿不自动授予测验成绩或技能认证）"}
            </span>
            <div className="flex items-center gap-2">
              {legacyImportPrompt && (
                <button
                  type="button"
                  disabled={legacyImporting}
                  onClick={() => void handleImportLegacyDrafts()}
                  className="px-3 py-1 rounded-lg bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>{legacyImporting ? "导入中..." : "一键导入云端"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setLegacyImportPrompt(false);
                  setCloudNotice(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view Router */}
      <main className="pb-12">
        {subView === "catalog" && (
          <CourseCatalogHome
            workspaceState={workspaceState}
            completedLabIds={completedLabIds}
            quizAnswersByModule={quizAnswersByModule}
            latestQuizByModule={latestQuizByModule}
            moduleStageById={moduleStageById}
            hasPaidAccess={hasPaidAccess}
            isInstructorAuthorized={isInstructorAuthorized}
            onOpenBilling={onOpenBilling}
            onOpenProjects={() => handleOpenProjectHub("workspace")}
            onOpenModule={handleOpenModule}
            onApplyPlanPresetAll={handleApplyPlanPresetAll}
            onOpenKnowledgeBase={(modCode, track) =>
              handleOpenKnowledgeBase(modCode, "", "all", track)
            }
            onSwitchToReveal={onSwitchToReveal}
          />
        )}

        {subView === "projects" && (
          <ProjectWorkspacePanel
            initialTab={projectHubTab}
            initialModuleId={projectHubModuleId}
            navSeq={projectHubSeq}
            onOpenBilling={onOpenBilling}
            onOpenModule={handleOpenModule}
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
            latestQuizSummary={latestQuizByModule[activeModuleRecord.id]}
            moduleStage={moduleStageById[activeModuleRecord.id]}
            hasPaidAccess={hasPaidAccess}
            isInstructorAuthorized={isInstructorAuthorized}
            isSignedIn={Boolean(session)}
            onOpenBilling={onOpenBilling}
            onRefreshCloudState={() => {
              void syncFromCloud();
              void refreshSession();
            }}
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
            onOpenProjectHub={handleOpenProjectHub}
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

        {subView === "cohort" && (
          <CohortLearnerPanel
            onOpenBilling={() => onOpenBilling?.()}
            onJumpToModule={(modId) => handleOpenModule(modId)}
          />
        )}

        {subView === "instructor" && <InstructorCockpit />}

        {subView === "admin" && <AdminConsole />}
      </main>
    </div>
  );
}
