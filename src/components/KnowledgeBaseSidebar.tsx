import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import {
  AI_BOOKS_KNOWLEDGE_BASE,
  AUTO_TAXONOMY_DEFINITIONS,
  BOOK_CATEGORY_LIST,
  deriveAutoTaxonomyTags,
  getBookGithubUrl,
  type AutoTaxonomyTag,
  type BookCategory,
  type KnowledgeBookItem,
} from "@/data/aiBooksKnowledgeBase";
import {
  COURSE_LAST_REVIEWED_AT,
  COURSE_RESOURCES,
  type CourseResource,
  type CourseVerificationStatus,
  type ResourceSourceType,
} from "@/data/courseCurriculum";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

type ModuleFilter = "ALL" | "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | "M9" | "M10";
type SidebarTab = "books" | "sources";

const SOURCE_TYPE_LABELS: Record<ResourceSourceType, string> = {
  "official-course": "官方课程",
  "official-doc": "官方文档与工具",
  "engineering-repo": "工程实践仓库",
  "security-eval": "安全与评测",
  paper: "书籍与文献仓库",
};

interface KnowledgeBaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KnowledgeBaseSidebar({ isOpen, onClose }: KnowledgeBaseSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | "ALL">("ALL");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [tagFilter, setTagFilter] = useState<AutoTaxonomyTag | "ALL">("ALL");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<ResourceSourceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<CourseVerificationStatus | "ALL">("ALL");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandedResourceId, setExpandedResourceId] = useState<string | null>(null);
  const [expandAllDetails, setExpandAllDetails] = useState(false);

  useEffect(() => {
    const handleOpenResources = (event: Event) => {
      const custom = event as CustomEvent<{ moduleCode?: ModuleFilter }>;
      setActiveTab("sources");
      if (custom.detail?.moduleCode) {
        setModuleFilter(custom.detail.moduleCode);
      }
      setSearchQuery("");
      setSourceTypeFilter("ALL");
      setStatusFilter("ALL");
    };
    window.addEventListener("course:open-resources", handleOpenResources);
    return () => window.removeEventListener("course:open-resources", handleOpenResources);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const bookTagsMap = useMemo(() => {
    const map: Record<string, AutoTaxonomyTag[]> = {};
    for (const item of AI_BOOKS_KNOWLEDGE_BASE) {
      map[item.id] = deriveAutoTaxonomyTags(item);
    }
    return map;
  }, []);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return AI_BOOKS_KNOWLEDGE_BASE.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;
      if (moduleFilter !== "ALL" && !item.targetModules.includes(moduleFilter)) return false;
      const itemTags = bookTagsMap[item.id] || [];
      if (tagFilter !== "ALL" && !itemTags.includes(tagFilter)) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.authorOrSource.toLowerCase().includes(q) ||
        item.coreTakeaways.toLowerCase().includes(q) ||
        item.courseApplication.toLowerCase().includes(q) ||
        itemTags.some((t) => t.toLowerCase().includes(q)) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter, moduleFilter, tagFilter, bookTagsMap]);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return COURSE_RESOURCES.filter((res) => {
      if (sourceTypeFilter !== "ALL" && res.sourceType !== sourceTypeFilter) return false;
      if (statusFilter !== "ALL" && res.status !== statusFilter) return false;
      if (moduleFilter !== "ALL" && !res.relatedModules.includes(moduleFilter)) return false;
      if (!q) return true;
      return (
        res.title.toLowerCase().includes(q) ||
        res.organization.toLowerCase().includes(q) ||
        res.summary.toLowerCase().includes(q) ||
        res.useInCourse.toLowerCase().includes(q) ||
        res.url.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, sourceTypeFilter, statusFilter, moduleFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setModuleFilter("ALL");
    setTagFilter("ALL");
    setSourceTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  const handleJumpModule = (modCode: string) => {
    window.dispatchEvent(
      new CustomEvent("reveal:jump-module", {
        detail: { moduleId: modCode.toLowerCase(), v: 0 },
      })
    );
  };

  const handleOpenLab05 = () => {
    window.dispatchEvent(
      new CustomEvent("reveal:jump-lab", {
        detail: { labId: "book-kb" },
      })
    );
    onClose();
  };

  return (
    <aside
      aria-label="AI 书籍与课程来源索引侧栏"
      aria-hidden={!isOpen}
      onWheel={stopRevealWheel}
      className={`fixed top-0 right-0 bottom-0 z-50 w-[420px] max-w-[92vw] bg-[#090d16]/96 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="w-4 h-4 text-gemini-cyan shrink-0" />
            <span className="truncate">知识库与课程来源索引</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            {activeTab === "books"
              ? `书库 ${AI_BOOKS_KNOWLEDGE_BASE.length} 册 · 显示 ${filteredBooks.length} 册`
              : `官方与开源来源 ${COURSE_RESOURCES.length} 项 · 显示 ${filteredResources.length} 项`}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenLab05}
            onKeyDown={stopRevealKey}
            className="px-2.5 py-1.5 rounded-lg bg-gemini-cyan/15 hover:bg-gemini-cyan/25 border border-gemini-cyan/35 text-[11px] font-medium text-gemini-cyan transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-gemini-cyan"
            title="前往 Lab 05 知识库智能备课工作台"
          >
            <Sparkles className="w-3 h-3" />
            <span>Lab 05 备课</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            onKeyDown={stopRevealKey}
            aria-label="收起知识库侧栏"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-gemini-cyan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3 pt-2.5 pb-2 border-b border-white/10 bg-[#0a0f1a] shrink-0">
        <div
          className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/10"
          role="tablist"
          aria-label="知识库视图切换"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "books"}
            onClick={() => setActiveTab("books")}
            onKeyDown={stopRevealKey}
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
              activeTab === "books"
                ? "bg-white text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            书籍与论文 ({AI_BOOKS_KNOWLEDGE_BASE.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "sources"}
            onClick={() => setActiveTab("sources")}
            onKeyDown={stopRevealKey}
            className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
              activeTab === "sources"
                ? "bg-gemini-cyan text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            课程来源索引 ({COURSE_RESOURCES.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-3 border-b border-white/10 space-y-2 shrink-0 bg-[#0b101b]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={stopRevealKey}
            placeholder={
              activeTab === "books"
                ? "检索书名、作者、arXiv 或 Cursor 主题..."
                : "检索官方课程、组织、开源仓库或课程用法..."
            }
            aria-label={activeTab === "books" ? "检索知识库书籍" : "检索课程来源索引"}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              onKeyDown={stopRevealKey}
              aria-label="清空检索词"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "books" ? (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as BookCategory | "ALL")}
              onKeyDown={stopRevealKey}
              aria-label="按分类筛选"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-[11px] text-slate-200 focus:outline-none focus:border-gemini-cyan cursor-pointer"
            >
              {BOOK_CATEGORY_LIST.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#090d16]">
                  {cat.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value as ResourceSourceType | "ALL")}
              onKeyDown={stopRevealKey}
              aria-label="按来源类型筛选"
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-[11px] text-slate-200 focus:outline-none focus:border-gemini-cyan cursor-pointer"
            >
              <option value="ALL" className="bg-[#090d16]">
                全部来源类型
              </option>
              {(Object.keys(SOURCE_TYPE_LABELS) as ResourceSourceType[]).map((st) => (
                <option key={st} value={st} className="bg-[#090d16]">
                  {SOURCE_TYPE_LABELS[st]}
                </option>
              ))}
            </select>
          )}

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
            onKeyDown={stopRevealKey}
            aria-label="按课程模块筛选"
            className="w-24 shrink-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-gemini-cyan cursor-pointer"
          >
            <option value="ALL" className="bg-[#090d16]">
              全部模块
            </option>
            {(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"] as const).map((m) => (
              <option key={m} value={m} className="bg-[#090d16]">
                {m}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setExpandAllDetails((prev) => !prev)}
            onKeyDown={stopRevealKey}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              expandAllDetails
                ? "bg-white text-slate-950 border-white font-semibold"
                : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
            }`}
          >
            {expandAllDetails ? "收起详情" : "全部展开"}
          </button>
        </div>

        {activeTab === "books" ? (
          <div className="flex items-center gap-1 flex-wrap pt-0.5">
            <button
              type="button"
              onClick={() => setTagFilter("ALL")}
              onKeyDown={stopRevealKey}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tagFilter === "ALL"
                  ? "bg-white text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              全部标签
            </button>
            {AUTO_TAXONOMY_DEFINITIONS.map((def) => (
              <button
                key={def.id}
                type="button"
                onClick={() => setTagFilter((prev) => (prev === def.id ? "ALL" : def.id))}
                onKeyDown={stopRevealKey}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tagFilter === def.id
                    ? "bg-gemini-purple text-white font-semibold"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/15"
                }`}
              >
                {def.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: "ALL", label: "全部核验态" },
                  { id: "verified", label: "来源已核对" },
                  { id: "needs-review", label: "随版本待复核" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  onKeyDown={stopRevealKey}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === item.id
                      ? "bg-white text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/15"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {(moduleFilter !== "ALL" ||
              sourceTypeFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              searchQuery.trim() !== "") && (
              <button
                type="button"
                onClick={handleResetFilters}
                onKeyDown={stopRevealKey}
                className="text-[11px] text-slate-400 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                清空筛选
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Catalog */}
      <div onWheel={stopRevealWheel} className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === "sources" && (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-2.5 text-[11px] text-slate-300 leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>版权归属与核验原则（最近核验：{COURSE_LAST_REVIEWED_AT}）</span>
            </div>
            <p className="text-slate-400">
              本索引仅做第一手链接归属、方法提炼与模块映射，不代表任何外部机构授权或背书；离线环境未逐仓库抓取 SPDX 原文的条目一律标为“许可证：待核验”。
            </p>
          </div>
        )}

        {activeTab === "books" ? (
          filteredBooks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center px-4 text-xs text-slate-400 space-y-2">
              <BookOpen className="w-6 h-6 opacity-50" />
              <p>未找到匹配的书籍或论文。</p>
              <button
                type="button"
                onClick={handleResetFilters}
                onKeyDown={stopRevealKey}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
              >
                重置筛选条件
              </button>
            </div>
          ) : (
            filteredBooks.map((book: KnowledgeBookItem) => {
              const isExpanded = expandAllDetails || expandedBookId === book.id;
              return (
                <div
                  key={book.id}
                  className={`rounded-xl border transition-colors ${
                    isExpanded
                      ? "bg-white/[0.06] border-gemini-cyan/40"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBookId((prev) => (prev === book.id ? null : book.id))
                    }
                    onKeyDown={stopRevealKey}
                    aria-expanded={isExpanded}
                    className="w-full p-2.5 text-left flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white leading-snug">
                        {book.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap tabular-nums">
                        <span>{book.authorOrSource}</span>
                        <span aria-hidden="true">·</span>
                        <span>{book.sizeMB.toFixed(1)} MB</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-gemini-cyan">{book.targetModules.join("/")}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">
                          {(bookTagsMap[book.id] || []).join(" / ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-slate-400 mt-0.5 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-1 border-t border-white/10 space-y-2 text-[11px]">
                      <p className="text-slate-300 leading-relaxed">
                        <span className="font-mono text-slate-400">核心提炼：</span>
                        {book.coreTakeaways}
                      </p>
                      <p className="text-slate-200 leading-relaxed">
                        <span className="font-mono text-gemini-cyan">课程应用：</span>
                        {book.courseApplication}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {(bookTagsMap[book.id] || []).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setTagFilter((prev) => (prev === tag ? "ALL" : tag))}
                            onKeyDown={stopRevealKey}
                            className={`px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                              tagFilter === tag
                                ? "bg-gemini-purple text-white"
                                : "bg-white/10 hover:bg-gemini-purple/60 text-slate-200"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          {book.targetModules.map((mod) => (
                            <button
                              key={mod}
                              type="button"
                              onClick={() => handleJumpModule(mod)}
                              onKeyDown={stopRevealKey}
                              className="px-2 py-0.5 rounded bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-white transition-colors cursor-pointer"
                            >
                              {mod}
                            </button>
                          ))}
                        </div>
                        <a
                          href={getBookGithubUrl(book)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-gemini-cyan hover:underline whitespace-nowrap shrink-0"
                        >
                          <span>{book.externalUrl ? "arXiv PDF" : "GitHub PDF"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : filteredResources.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center px-4 text-xs text-slate-400 space-y-2">
            <BookOpen className="w-6 h-6 opacity-50" />
            <p>未找到匹配的课程来源记录。</p>
            <button
              type="button"
              onClick={handleResetFilters}
              onKeyDown={stopRevealKey}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
            >
              重置筛选条件
            </button>
          </div>
        ) : (
          filteredResources.map((res: CourseResource) => {
            const isExpanded = expandAllDetails || expandedResourceId === res.id;
            return (
              <div
                key={res.id}
                className={`rounded-xl border transition-colors ${
                  isExpanded
                    ? "bg-white/[0.06] border-gemini-cyan/40"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedResourceId((prev) => (prev === res.id ? null : res.id))
                  }
                  onKeyDown={stopRevealKey}
                  aria-expanded={isExpanded}
                  className="w-full p-2.5 text-left flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white leading-snug">
                      {res.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap tabular-nums">
                      <span>{res.organization}</span>
                      <span aria-hidden="true">·</span>
                      <span>{SOURCE_TYPE_LABELS[res.sourceType]}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          res.status === "needs-review" ? "text-amber-300" : "text-emerald-300"
                        }
                      >
                        {res.status === "needs-review" ? "随版本待复核" : "来源已核对"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400">
                        许可证：{res.licenseVerified ? res.license : "待核验"}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 mt-0.5 shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-2.5 pb-2.5 pt-1 border-t border-white/10 space-y-2 text-[11px]">
                    <p className="text-slate-300 leading-relaxed">
                      <span className="font-mono text-slate-400">来源摘要：</span>
                      {res.summary}
                    </p>
                    <p className="text-slate-200 leading-relaxed">
                      <span className="font-mono text-gemini-cyan">课程用途：</span>
                      {res.useInCourse}
                    </p>
                    {res.cautions && (
                      <p className="text-amber-300/90 leading-relaxed">
                        <span className="font-mono">核验提醒：</span>
                        {res.cautions}
                      </p>
                    )}
                    <div className="text-[10px] font-mono text-slate-400 tabular-nums">
                      核验日期：{res.reviewedAt} · 关联模块：{res.relatedModules.join(" / ")}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {res.relatedModules.map((mod) => (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => handleJumpModule(mod)}
                            onKeyDown={stopRevealKey}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 font-mono text-white transition-colors cursor-pointer"
                          >
                            {mod}
                          </button>
                        ))}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-gemini-cyan hover:underline whitespace-nowrap shrink-0"
                      >
                        <span>原始出处</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
