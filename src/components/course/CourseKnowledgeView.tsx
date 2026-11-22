import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FlaskConical,
  Plus,
  Search,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import {
  AI_BOOKS_KNOWLEDGE_BASE,
  BOOK_CATEGORY_LIST,
  deriveAutoTaxonomyTags,
  getBookGithubUrl,
  type BookCategory,
} from "@/data/aiBooksKnowledgeBase";
import {
  buildKnowledgeBaseMarkdownExport,
  buildRuntimeWorkshopMarkdownExport,
  type CustomKnowledgeDraft,
} from "@/data/courseWorkspaceStore";
import {
  ENGINEERING_MODULE_CODES,
  KB_GOVERNANCE_RULES,
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  searchEngineeringKnowledgeBase,
  type KnowledgeBaseTrack,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
  type KnowledgeValidationStatus,
} from "@/data/teamKnowledgeBase";
import {
  RUNTIME_KB_WORKSHOP_RULES,
  RUNTIME_PIPELINE_STAGE_LABELS,
  RUNTIME_WORKSHOP_KNOWLEDGE_BASE,
  RUNTIME_WORKSHOP_MODULE_CODES,
  searchRuntimeKnowledgeBase,
  type RuntimePipelineStage,
} from "@/data/runtimeKnowledgeBase";

export type KnowledgeSectionFilter = "all" | "rules" | "books";

interface CourseKnowledgeViewProps {
  initialTrack?: KnowledgeBaseTrack;
  initialModuleFilter?: string;
  initialSearchQuery?: string;
  initialSection?: KnowledgeSectionFilter;
  customEntries: CustomKnowledgeDraft[];
  onAddCustomEntry: (entry: Omit<CustomKnowledgeDraft, "id" | "updatedAt">) => void;
  onDeleteCustomEntry: (id: string) => void;
  onJumpToModule: (moduleId: string) => void;
  onOpenBookLab?: () => void;
  onOpenRuntimeLab?: (labId: string) => void;
}

function inferDefaultTrack(
  initialTrack: KnowledgeBaseTrack | undefined,
  initialModuleFilter: string,
  initialSection: KnowledgeSectionFilter
): KnowledgeBaseTrack {
  if (initialTrack) return initialTrack;
  if (
    initialSection !== "books" &&
    RUNTIME_WORKSHOP_MODULE_CODES.includes(initialModuleFilter as KnowledgeModuleCode)
  ) {
    return "runtime-domain";
  }
  return "engineering";
}

export default function CourseKnowledgeView({
  initialTrack,
  initialModuleFilter = "ALL",
  initialSearchQuery = "",
  initialSection = "all",
  customEntries,
  onAddCustomEntry,
  onDeleteCustomEntry,
  onJumpToModule,
  onOpenBookLab,
  onOpenRuntimeLab,
}: CourseKnowledgeViewProps) {
  const resolvedInitialTrack = inferDefaultTrack(
    initialTrack,
    initialModuleFilter,
    initialSection
  );

  const [activeTrack, setActiveTrack] = useState<KnowledgeBaseTrack>(resolvedInitialTrack);

  // =========================================================================
  // 链路 A：研发工程知识库独立检索状态（TEAM_KNOWLEDGE_BASE + 自建草稿 + 78 册开源书库）
  // =========================================================================
  const [engSectionFilter, setEngSectionFilter] = useState<KnowledgeSectionFilter>(initialSection);
  const [engModuleFilter, setEngModuleFilter] = useState<string>(
    resolvedInitialTrack === "engineering" &&
      ENGINEERING_MODULE_CODES.includes(initialModuleFilter as KnowledgeModuleCode)
      ? initialModuleFilter
      : "ALL"
  );
  const [engCategoryFilter, setEngCategoryFilter] = useState<KnowledgeCategory | "ALL">("ALL");
  const [engBookCategoryFilter, setEngBookCategoryFilter] = useState<BookCategory | "ALL">("ALL");
  const [engStatusFilter, setEngStatusFilter] = useState<KnowledgeValidationStatus | "ALL">("ALL");
  const [engSearchQuery, setEngSearchQuery] = useState(
    resolvedInitialTrack === "engineering" ? initialSearchQuery : ""
  );
  const [showAllBooks, setShowAllBooks] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [savedBookId, setSavedBookId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newModuleCode, setNewModuleCode] = useState<KnowledgeModuleCode>(
    ENGINEERING_MODULE_CODES.includes(initialModuleFilter as KnowledgeModuleCode)
      ? (initialModuleFilter as KnowledgeModuleCode)
      : "M1"
  );
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>("template");
  const [newScope, setNewScope] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCaution, setNewCaution] = useState("");

  // =========================================================================
  // 链路 B：Agent 运行时工作坊独立检索状态（RUNTIME_WORKSHOP_KNOWLEDGE_BASE 独占）
  // =========================================================================
  const [runtimeModuleFilter, setRuntimeModuleFilter] = useState<string>(
    resolvedInitialTrack === "runtime-domain" &&
      RUNTIME_WORKSHOP_MODULE_CODES.includes(initialModuleFilter as KnowledgeModuleCode)
      ? initialModuleFilter
      : "ALL"
  );
  const [runtimeStageFilter, setRuntimeStageFilter] = useState<RuntimePipelineStage | "ALL">("ALL");
  const [runtimeStatusFilter, setRuntimeStatusFilter] = useState<
    KnowledgeValidationStatus | "ALL"
  >("ALL");
  const [runtimeSearchQuery, setRuntimeSearchQuery] = useState(
    resolvedInitialTrack === "runtime-domain" ? initialSearchQuery : ""
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 链路 A 独立检索管道（绝不混入 runtime-domain 条目）
  const normalizedEngQuery = engSearchQuery.trim().toLowerCase();

  const filteredEngineeringEntries = useMemo(
    () =>
      searchEngineeringKnowledgeBase({
        query: engSearchQuery,
        moduleFilter: engModuleFilter,
        categoryFilter: engCategoryFilter,
        statusFilter: engStatusFilter,
      }),
    [engSearchQuery, engModuleFilter, engCategoryFilter, engStatusFilter]
  );

  const filteredCustomEntries = useMemo(() => {
    return customEntries.filter((item) => {
      if (engModuleFilter !== "ALL" && item.moduleCode !== engModuleFilter) return false;
      if (engCategoryFilter !== "ALL" && item.category !== engCategoryFilter) return false;
      if (normalizedEngQuery) {
        const haystack =
          `${item.title} ${item.scope} ${item.content} ${item.cautionNote}`.toLowerCase();
        if (!haystack.includes(normalizedEngQuery)) return false;
      }
      return true;
    });
  }, [customEntries, engModuleFilter, engCategoryFilter, normalizedEngQuery]);

  const filteredEngineeringBooks = useMemo(() => {
    return AI_BOOKS_KNOWLEDGE_BASE.filter((book) => {
      if (
        engModuleFilter !== "ALL" &&
        !book.targetModules.includes(engModuleFilter as KnowledgeModuleCode)
      ) {
        return false;
      }
      if (engBookCategoryFilter !== "ALL" && book.category !== engBookCategoryFilter) {
        return false;
      }
      if (normalizedEngQuery) {
        const haystack =
          `${book.title} ${book.authorOrSource} ${book.category} ${book.coreTakeaways} ${book.courseApplication} ${book.keywords.join(" ")} ${book.repoPath}`.toLowerCase();
        if (!haystack.includes(normalizedEngQuery)) return false;
      }
      return true;
    });
  }, [engModuleFilter, engBookCategoryFilter, normalizedEngQuery]);

  // 链路 B 独立检索管道（绝不混入工程规范、个人草稿或 AI-pdf-books）
  const filteredRuntimeEntries = useMemo(
    () =>
      searchRuntimeKnowledgeBase({
        query: runtimeSearchQuery,
        moduleFilter: runtimeModuleFilter,
        stageFilter: runtimeStageFilter,
        statusFilter: runtimeStatusFilter,
      }),
    [runtimeSearchQuery, runtimeModuleFilter, runtimeStageFilter, runtimeStatusFilter]
  );

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  const triggerMarkdownDownload = (filename: string, md: string) => {
    try {
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      void navigator.clipboard?.writeText(md);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddCustomEntry({
      title: newTitle.trim(),
      moduleCode: newModuleCode,
      category: newCategory,
      scope: newScope.trim() || "当前个人/项目试行",
      content: newContent.trim(),
      cautionNote: newCaution.trim(),
    });
    setNewTitle("");
    setNewScope("");
    setNewContent("");
    setNewCaution("");
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Dual-Track Mode Switcher: 两条独立链路彻底分屏，不提供混合视图 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f19] border border-white/12 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400">
              DUAL-PIPELINE KNOWLEDGE CENTER · 两条知识检索链路在数据源、检索栏与导出产物上彻底分离
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              知识库双链路工作台：开发期工程规范 vs Agent 运行时领域知识库
            </h1>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0"
            role="tablist"
            aria-label="知识库独立检索链路切换"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTrack === "engineering"}
              onClick={() => setActiveTrack("engineering")}
              className={`px-3.5 py-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                activeTrack === "engineering"
                  ? "bg-gemini-purple/25 border-gemini-purple text-white"
                  : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Terminal className="w-3.5 h-3.5 text-purple-300" />
                <span>链路 A：研发工程知识库</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                给开发者 / Coding Agent · 规范 + 草稿 + {AI_BOOKS_KNOWLEDGE_BASE.length} 册书库
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTrack === "runtime-domain"}
              onClick={() => setActiveTrack("runtime-domain")}
              className={`px-3.5 py-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                activeTrack === "runtime-domain"
                  ? "bg-emerald-500/20 border-emerald-400 text-white"
                  : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Cpu className="w-3.5 h-3.5 text-emerald-300" />
                <span>链路 B：Agent 运行时工作坊</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                给运行中 Agent / RAG · 六步检索与评测 ({RUNTIME_WORKSHOP_KNOWLEDGE_BASE.length} 项契约)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 链路 A 视图：研发工程知识库检索与备课流                               */}
      {/* =================================================================== */}
      {activeTrack === "engineering" ? (
        <div className="space-y-6" role="tabpanel" aria-label="链路 A 研发工程知识库">
          {/* Header & Engineering Governance Summary */}
          <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-200">
                <BookMarked className="w-4 h-4 text-gemini-purple" />
                <span>
                  链路 A · 研发工程知识库 · 对应仓库 {KB_GOVERNANCE_RULES.repoRootPath} · 集成{" "}
                  {AI_BOOKS_KNOWLEDGE_BASE.length} 册 AI-pdf-books
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                开发期工程规范、个人沉淀草稿与 AI-pdf-books 开源书库
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {KB_GOVERNANCE_RULES.personalVsTeamBoundary} 用后闭环：
                {KB_GOVERNANCE_RULES.postUseActions.join(" / ")}。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const summaryParts = [
                    "链路 A（研发工程知识库）",
                    engSectionFilter === "all"
                      ? "全部工程资产"
                      : engSectionFilter === "rules"
                      ? "仅工程规范与自建"
                      : "仅 AI-pdf-books 书库",
                    engModuleFilter === "ALL" ? "全部工程模块" : `模块 ${engModuleFilter}`,
                    engCategoryFilter === "ALL"
                      ? "全部工程分类"
                      : KNOWLEDGE_CATEGORY_LABELS[engCategoryFilter],
                    engBookCategoryFilter === "ALL" ? "" : `书目分类 ${engBookCategoryFilter}`,
                    engStatusFilter === "ALL"
                      ? "全部核验态"
                      : KNOWLEDGE_STATUS_LABELS[engStatusFilter],
                    engSearchQuery.trim() ? `关键词 "${engSearchQuery.trim()}"` : "",
                  ].filter(Boolean);
                  const md = buildKnowledgeBaseMarkdownExport({
                    builtInEntries: engSectionFilter === "books" ? [] : filteredEngineeringEntries,
                    customEntries: engSectionFilter === "books" ? [] : filteredCustomEntries,
                    books: engSectionFilter === "rules" ? [] : filteredEngineeringBooks,
                    filterSummary: summaryParts.join(" · "),
                  });
                  triggerMarkdownDownload(
                    `AICodingCourse-工程知识库-${new Date().toISOString().slice(0, 10)}.md`,
                    md
                  );
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                title="仅导出链路 A 研发工程规范、自建草稿与参考书目"
              >
                <Download className="w-4 h-4 text-gemini-cyan" />
                <span>导出工程知识 (.md)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="px-4 py-2.5 rounded-xl bg-gemini-purple text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? "收起新增表单" : "新增我的工程沉淀"}</span>
              </button>
            </div>
          </div>

          {/* Add Learner Engineering KB Draft Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateSubmit}
              className="p-5 rounded-2xl bg-[#0d1322] border border-gemini-cyan/40 space-y-3"
            >
              <div className="text-sm font-semibold text-white">
                新建工程知识沉淀条目（保存在浏览器本地，仅归属链路 A 工程知识库）
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="条目标题（例：订单路由禁改价格舍入规则）"
                  required
                  className="sm:col-span-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
                />
                <select
                  value={newModuleCode}
                  onChange={(e) => setNewModuleCode(e.target.value as KnowledgeModuleCode)}
                  aria-label="所属工程模块"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-gemini-cyan"
                >
                  {ENGINEERING_MODULE_CODES.map((m) => (
                    <option key={m} value={m} className="bg-[#090d16]">
                      所属模块 {m}
                    </option>
                  ))}
                </select>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}
                  aria-label="工程知识分类"
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-gemini-cyan"
                >
                  {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#090d16]">
                      {KNOWLEDGE_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={newScope}
                onChange={(e) => setNewScope(e.target.value)}
                placeholder="适用范围（例：仅适用于 src/server/billing/** 支付模块）"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                required
                placeholder="粘贴可直接复用的 .mdc 规则、AGENTS.md 模板、失败根因或核对清单（严禁包含真实密钥）"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
              />
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <input
                  type="text"
                  value={newCaution}
                  onChange={(e) => setNewCaution(e.target.value)}
                  placeholder="使用注意事项或避坑提示（可选）"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer whitespace-nowrap"
                >
                  保存到工程知识库
                </button>
              </div>
            </form>
          )}

          {/* Engineering Search & Filter Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    {
                      id: "all",
                      label: `全部工程资产 (${filteredCustomEntries.length + filteredEngineeringEntries.length + filteredEngineeringBooks.length})`,
                    },
                    {
                      id: "rules",
                      label: `工程规范与自建 (${filteredCustomEntries.length + filteredEngineeringEntries.length})`,
                    },
                    {
                      id: "books",
                      label: `AI-pdf-books 书库 (${filteredEngineeringBooks.length} 册)`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEngSectionFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      engSectionFilter === tab.id
                        ? "bg-gemini-cyan text-slate-950 font-semibold"
                        : "bg-[#0b0f19] border border-white/12 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <a
                  href="https://github.com/MinhNguyenDS/AI-pdf-books"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/12 text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI-pdf-books 源仓库</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {onOpenBookLab && (
                  <button
                    type="button"
                    onClick={onOpenBookLab}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>进入 Lab 05 AI 备课台</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={engSearchQuery}
                  onChange={(e) => setEngSearchQuery(e.target.value)}
                  placeholder="在链路 A（工程规范 / .mdc / ADR / 书库）中检索..."
                  aria-label="搜索研发工程知识库条目"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
                />
              </div>

              <select
                value={engModuleFilter}
                onChange={(e) => setEngModuleFilter(e.target.value)}
                aria-label="按工程模块过滤"
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-slate-200 cursor-pointer"
              >
                <option value="ALL" className="bg-[#090d16]">
                  全部工程模块 (M1–M10)
                </option>
                {ENGINEERING_MODULE_CODES.map((m) => (
                  <option key={m} value={m} className="bg-[#090d16]">
                    {m}
                  </option>
                ))}
              </select>

              {engSectionFilter !== "books" && (
                <select
                  value={engCategoryFilter}
                  onChange={(e) =>
                    setEngCategoryFilter(e.target.value as KnowledgeCategory | "ALL")
                  }
                  aria-label="按工程知识类别过滤"
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 cursor-pointer"
                >
                  <option value="ALL" className="bg-[#090d16]">
                    全部 9 类工程知识
                  </option>
                  {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map((cat) => (
                    <option key={cat} value={cat} className="bg-[#090d16]">
                      {KNOWLEDGE_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              )}

              {engSectionFilter !== "rules" && (
                <select
                  value={engBookCategoryFilter}
                  onChange={(e) => setEngBookCategoryFilter(e.target.value as BookCategory | "ALL")}
                  aria-label="按书库分类过滤"
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 cursor-pointer"
                >
                  {BOOK_CATEGORY_LIST.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#090d16]">
                      书库：{cat.label}
                    </option>
                  ))}
                </select>
              )}

              {engSectionFilter !== "books" && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "ALL", label: "全部核验态" },
                      { id: "verified", label: "已验证" },
                      { id: "hypothesis", label: "待验证假设" },
                      { id: "deprecated", label: "已废弃实践" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setEngStatusFilter(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap ${
                        engStatusFilter === s.id
                          ? "bg-white text-slate-950 font-semibold"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <span className="ml-auto text-xs font-mono text-slate-400 tabular-nums">
                工程规范 {filteredEngineeringEntries.length} · 自建{" "}
                {filteredCustomEntries.length} · 书籍 {filteredEngineeringBooks.length}
              </span>
            </div>
          </div>

          {/* Learner Custom Engineering Entries */}
          {engSectionFilter !== "books" && filteredCustomEntries.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gemini-cyan">我的本地工程知识沉淀草稿</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomEntries.map((item) => (
                  <article
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#0d1424] border border-gemini-cyan/35 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-gemini-cyan">
                          {item.moduleCode} · {KNOWLEDGE_CATEGORY_LABELS[item.category]} · 本地保存 ·{" "}
                          {item.updatedAt}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteCustomEntry(item.id)}
                        className="text-[11px] font-mono text-rose-300 hover:underline cursor-pointer shrink-0"
                      >
                        删除
                      </button>
                    </div>
                    <div className="text-xs text-slate-300">适用范围：{item.scope}</div>
                    {item.cautionNote && (
                      <div className="text-xs text-amber-300">注意事项：{item.cautionNote}</div>
                    )}
                    <pre className="p-3 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </pre>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onJumpToModule(item.moduleCode.toLowerCase())}
                        className="text-xs font-mono text-gemini-cyan hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>回到 {item.moduleCode} 学习</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopyText(item.id, item.content)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                            <span>复制模板</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Built-in Engineering Team KB Grid */}
          {engSectionFilter !== "books" && filteredEngineeringEntries.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-purple-200">
                  内置团队研发工程规范与踩坑档案（{filteredEngineeringEntries.length} 条）
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEngineeringEntries.map((entry) => {
                  const statusTone =
                    entry.validationStatus === "deprecated"
                      ? "text-rose-300"
                      : entry.validationStatus === "hypothesis"
                      ? "text-amber-300"
                      : "text-emerald-300";

                  return (
                    <article
                      key={entry.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                        entry.validationStatus === "deprecated"
                          ? "bg-rose-500/[0.04] border-rose-400/25"
                          : "bg-[#0b0f19] border-white/12"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                          <span className="text-purple-200">
                            链路 A 工程 KB · {entry.modules.join("/")} ·{" "}
                            {KNOWLEDGE_CATEGORY_LABELS[entry.category]} · {entry.version}
                          </span>
                          <span className={`inline-flex items-center gap-1 ${statusTone}`}>
                            {entry.validationStatus === "verified" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : entry.validationStatus === "hypothesis" ? (
                              <FlaskConical className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            <span>{KNOWLEDGE_STATUS_LABELS[entry.validationStatus]}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">{entry.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{entry.summary}</p>

                        <div className="text-[11px] text-slate-400 space-y-1">
                          <div>
                            <span className="text-slate-300 font-medium">适用范围：</span>
                            {entry.scope}
                          </div>
                          <div>
                            <span className="text-slate-300 font-medium">来源与维护：</span>
                            {entry.source} · {entry.owner} · 更新 {entry.updatedAt}
                          </div>
                          <div
                            className={
                              entry.validationStatus === "deprecated"
                                ? "text-rose-300"
                                : "text-amber-300/90"
                            }
                          >
                            <span className="font-medium">注意与警示：</span>
                            {entry.antiPatternOrWarning}
                          </div>
                        </div>

                        <pre className="p-2.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {entry.copyableSnippet}
                        </pre>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {entry.modules.map((mod) => (
                            <button
                              key={mod}
                              type="button"
                              onClick={() => onJumpToModule(mod.toLowerCase())}
                              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-[11px] text-white transition-colors cursor-pointer"
                            >
                              打开 {mod}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleCopyText(entry.id, entry.copyableSnippet)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
                        >
                          {copiedId === entry.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                              <span>复制内容</span>
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* AI-pdf-books Repository Library (Strictly Link A) */}
          {engSectionFilter !== "rules" &&
            filteredEngineeringBooks.length > 0 &&
            (() => {
              const isFiltered =
                Boolean(normalizedEngQuery) ||
                engModuleFilter !== "ALL" ||
                engBookCategoryFilter !== "ALL" ||
                showAllBooks;
              const visibleBooks = isFiltered
                ? filteredEngineeringBooks
                : filteredEngineeringBooks.slice(0, 18);

              return (
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-amber-200 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-300" />
                        <span>
                          AI-pdf-books 开源电子书与论文参考库（当前匹配{" "}
                          {filteredEngineeringBooks.length} / {AI_BOOKS_KNOWLEDGE_BASE.length} 册）
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        归属链路 A 研发工程备课参考，索引 GitHub MinhNguyenDS/AI-pdf-books 全量 73 册 PDF 专著及 5 篇前沿指南。
                      </p>
                    </div>
                    {!isFiltered && filteredEngineeringBooks.length > 18 && (
                      <button
                        type="button"
                        onClick={() => setShowAllBooks(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-xs text-amber-200 cursor-pointer"
                      >
                        展开全部 {filteredEngineeringBooks.length} 册书目
                      </button>
                    )}
                    {showAllBooks &&
                      !normalizedEngQuery &&
                      engModuleFilter === "ALL" &&
                      engBookCategoryFilter === "ALL" && (
                        <button
                          type="button"
                          onClick={() => setShowAllBooks(false)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-300 cursor-pointer"
                        >
                          收起至前 18 册
                        </button>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleBooks.map((book) => {
                      const autoTags = deriveAutoTaxonomyTags(book);
                      const bookUrl = getBookGithubUrl(book);
                      const isRepoBook =
                        !book.externalUrl &&
                        !book.repoPath.startsWith("assets/") &&
                        !book.repoPath.startsWith("external/");

                      return (
                        <article
                          key={book.id}
                          className="p-4 rounded-2xl bg-[#0b0f19] border border-amber-400/20 hover:border-amber-400/40 transition-colors flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-mono tabular-nums">
                              <span className="text-amber-300">{book.category}</span>
                              <span className="text-slate-400">
                                {isRepoBook ? "AI-pdf-books" : "前沿精选"} · {book.sizeMB.toFixed(1)} MB
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {book.title}
                              </h4>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {book.authorOrSource}
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {book.coreTakeaways}
                            </p>

                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-[11px] text-slate-300 leading-relaxed">
                              <span className="text-gemini-cyan font-medium">课程应用：</span>
                              {book.courseApplication}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                              {autoTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-1">
                              {book.targetModules.slice(0, 3).map((mod) => (
                                <button
                                  key={mod}
                                  type="button"
                                  onClick={() => onJumpToModule(mod.toLowerCase())}
                                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-[11px] text-white transition-colors cursor-pointer"
                                >
                                  {mod}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  onAddCustomEntry({
                                    title: `书目笔记 · ${book.title}`,
                                    moduleCode:
                                      book.targetModules.find((m) =>
                                        ENGINEERING_MODULE_CODES.includes(m)
                                      ) || "M8",
                                    category: "example",
                                    scope: `${book.authorOrSource} · ${book.category}`,
                                    content: [
                                      `来源：${bookUrl}`,
                                      `核心要点：${book.coreTakeaways}`,
                                      `课程应用：${book.courseApplication}`,
                                      `关键词：${book.keywords.join(", ")}`,
                                    ].join("\n"),
                                    cautionNote:
                                      "开源书目仅作理论与工程设计参考，落地前须结合当前仓库 DoD 门禁验收。",
                                  });
                                  setSavedBookId(book.id);
                                  window.setTimeout(
                                    () => setSavedBookId((prev) => (prev === book.id ? null : prev)),
                                    1800
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white cursor-pointer"
                                title="把此书核心要点存入我的本地工程知识库"
                              >
                                {savedBookId === book.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>已存入</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 text-gemini-cyan" />
                                    <span>存笔记</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={bookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-[11px] text-amber-200"
                              >
                                <span>PDF</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

          {((engSectionFilter === "rules" &&
            filteredEngineeringEntries.length === 0 &&
            filteredCustomEntries.length === 0) ||
            (engSectionFilter === "books" && filteredEngineeringBooks.length === 0) ||
            (engSectionFilter === "all" &&
              filteredEngineeringEntries.length === 0 &&
              filteredCustomEntries.length === 0 &&
              filteredEngineeringBooks.length === 0)) && (
            <div className="p-8 rounded-2xl bg-[#0b0f19] border border-white/10 text-center space-y-3">
              <div className="text-sm font-semibold text-white">
                链路 A（研发工程知识库）当前筛选条件下暂无匹配内容
              </div>
              <p className="text-xs text-slate-400">
                可尝试清除搜索关键词，或将工程模块、分类、书库类别与核验状态恢复为“全部”。
              </p>
              <button
                type="button"
                onClick={() => {
                  setEngSectionFilter("all");
                  setEngModuleFilter("ALL");
                  setEngCategoryFilter("ALL");
                  setEngBookCategoryFilter("ALL");
                  setEngStatusFilter("ALL");
                  setEngSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer"
              >
                重置链路 A 筛选条件
              </button>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* 链路 B 视图：Agent 运行时领域知识库工坊独立检索链路                   */
        /* =================================================================== */
        <div className="space-y-6" role="tabpanel" aria-label="链路 B Agent 运行时工作坊">
          {/* Runtime Workshop Header & Strict Separation Boundary */}
          <div className="p-5 rounded-2xl bg-[#0b0f19] border border-emerald-400/35 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-300">
                  <Cpu className="w-4 h-4" />
                  <span>
                    链路 B · Agent 运行时工作坊 · 对应骨架 {RUNTIME_KB_WORKSHOP_RULES.repoRootPath}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  运行时领域知识库工坊：ACL 过滤、混合检索、引用溯源与双层 Eval
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {RUNTIME_KB_WORKSHOP_RULES.separationBoundary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const summaryParts = [
                      "链路 B（Agent 运行时工作坊）",
                      runtimeModuleFilter === "ALL"
                        ? "全部 Agent 模块 (M11–M13-Eng)"
                        : `模块 ${runtimeModuleFilter}`,
                      runtimeStageFilter === "ALL"
                        ? "全部 6 步管线阶段"
                        : RUNTIME_PIPELINE_STAGE_LABELS[runtimeStageFilter],
                      runtimeStatusFilter === "ALL"
                        ? "全部核验态"
                        : KNOWLEDGE_STATUS_LABELS[runtimeStatusFilter],
                      runtimeSearchQuery.trim() ? `关键词 "${runtimeSearchQuery.trim()}"` : "",
                    ].filter(Boolean);
                    const md = buildRuntimeWorkshopMarkdownExport({
                      runtimeEntries: filteredRuntimeEntries,
                      filterSummary: summaryParts.join(" · "),
                    });
                    triggerMarkdownDownload(
                      `AICodingCourse-运行时工作坊规范-${new Date().toISOString().slice(0, 10)}.md`,
                      md
                    );
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>导出运行时契约 (.md)</span>
                </button>
              </div>
            </div>

            {/* 6-Step Runtime Pipeline Strip + Interactive Lab Launchers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {RUNTIME_KB_WORKSHOP_RULES.pipelineSteps.map((stepText, idx) => (
                <div
                  key={stepText}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-emerald-400/20 text-xs text-slate-200 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{stepText}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <span className="text-amber-200/90 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{RUNTIME_KB_WORKSHOP_RULES.simulationNotice}</span>
              </span>

              {onOpenRuntimeLab && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenRuntimeLab("runtime-kb-rag")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-200 cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Lab 18 运行时 KB 工坊</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRuntimeLab("agent-workflow-sim")}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-slate-200 cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Lab 19 状态机沙盘</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRuntimeLab("gov-trajectory-eval")}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-200 cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Lab 20 治理轨迹评测</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Runtime Workshop Independent Search & Stage Filters */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-emerald-400/20 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={runtimeSearchQuery}
                  onChange={(e) => setRuntimeSearchQuery(e.target.value)}
                  placeholder="在链路 B（ACL 过滤 / Citation Grounding / Tombstone / Dual Eval）中检索..."
                  aria-label="搜索运行时工作坊契约"
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-emerald-400/25 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <select
                value={runtimeModuleFilter}
                onChange={(e) => setRuntimeModuleFilter(e.target.value)}
                aria-label="按 Agent 模块过滤"
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-slate-200 cursor-pointer"
              >
                <option value="ALL" className="bg-[#090d16]">
                  全部 Agent 模块 (M11–M13-Eng)
                </option>
                {RUNTIME_WORKSHOP_MODULE_CODES.map((m) => (
                  <option key={m} value={m} className="bg-[#090d16]">
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={runtimeStageFilter}
                onChange={(e) =>
                  setRuntimeStageFilter(e.target.value as RuntimePipelineStage | "ALL")
                }
                aria-label="按运行时管线阶段过滤"
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-200 cursor-pointer"
              >
                <option value="ALL" className="bg-[#090d16]">
                  全部 6 个运行时阶段
                </option>
                {(Object.keys(RUNTIME_PIPELINE_STAGE_LABELS) as RuntimePipelineStage[]).map(
                  (stage) => (
                    <option key={stage} value={stage} className="bg-[#090d16]">
                      {RUNTIME_PIPELINE_STAGE_LABELS[stage]}
                    </option>
                  )
                )}
              </select>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: "ALL", label: "全部状态" },
                    { id: "verified", label: "已验证" },
                    { id: "hypothesis", label: "待验证" },
                    { id: "deprecated", label: "已淘汰" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setRuntimeStatusFilter(s.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap ${
                      runtimeStatusFilter === s.id
                        ? "bg-emerald-400 text-slate-950 font-semibold"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <span className="ml-auto text-xs font-mono text-emerald-300 tabular-nums">
                运行时契约 {filteredRuntimeEntries.length} /{" "}
                {RUNTIME_WORKSHOP_KNOWLEDGE_BASE.length}
              </span>
            </div>
          </div>

          {/* Runtime Workshop Entries Grid */}
          {filteredRuntimeEntries.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRuntimeEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="p-4 rounded-2xl bg-[#0b0f19] border border-emerald-400/25 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                      <span className="text-emerald-300">
                        链路 B 运行时工作坊 · {RUNTIME_PIPELINE_STAGE_LABELS[entry.pipelineStage]} ·{" "}
                        {entry.modules.join("/")}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{KNOWLEDGE_STATUS_LABELS[entry.validationStatus]}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{entry.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{entry.summary}</p>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-[11px] text-emerald-100">
                      <span className="font-semibold text-emerald-300">客观验收门禁：</span>
                      {entry.evalGate}
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>
                        <span className="text-slate-300 font-medium">适用场景：</span>
                        {entry.scope}
                      </div>
                      <div>
                        <span className="text-slate-300 font-medium">参考实现：</span>
                        <code className="text-slate-200">{entry.repoPath}</code> · {entry.owner} ·
                        更新 {entry.updatedAt}
                      </div>
                      <div className="text-amber-300/90">
                        <span className="font-medium">风险边界：</span>
                        {entry.antiPatternOrWarning}
                      </div>
                    </div>

                    <pre className="p-2.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {entry.copyableSnippet}
                    </pre>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {entry.modules.map((mod) => (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => onJumpToModule(mod.toLowerCase())}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-400 hover:text-slate-950 font-mono text-[11px] text-emerald-200 transition-colors cursor-pointer"
                        >
                          打开 {mod}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleCopyText(entry.id, entry.copyableSnippet)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-emerald-300" />
                          <span>复制契约</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0b0f19] border border-emerald-400/20 text-center space-y-3">
              <div className="text-sm font-semibold text-white">
                链路 B（Agent 运行时工作坊）当前筛选条件下暂无匹配契约
              </div>
              <p className="text-xs text-slate-400">
                可尝试清空搜索词，或将模块、运行时管线阶段与核验状态恢复为“全部”。
              </p>
              <button
                type="button"
                onClick={() => {
                  setRuntimeModuleFilter("ALL");
                  setRuntimeStageFilter("ALL");
                  setRuntimeStatusFilter("ALL");
                  setRuntimeSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold text-xs hover:opacity-90 cursor-pointer"
              >
                重置链路 B 筛选条件
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
