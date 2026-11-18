import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Search, Sparkles, X } from "lucide-react";
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
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

type ModuleFilter = "ALL" | "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | "M9" | "M10";

interface KnowledgeBaseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KnowledgeBaseSidebar({ isOpen, onClose }: KnowledgeBaseSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | "ALL">("ALL");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [tagFilter, setTagFilter] = useState<AutoTaxonomyTag | "ALL">("ALL");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [expandAllDetails, setExpandAllDetails] = useState(false);

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setModuleFilter("ALL");
    setTagFilter("ALL");
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
      aria-label="AI 书籍知识库侧栏"
      aria-hidden={!isOpen}
      onWheel={stopRevealWheel}
      className={`fixed top-0 right-0 bottom-0 z-50 w-[400px] max-w-[92vw] bg-[#090d16]/96 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BookOpen className="w-4 h-4 text-gemini-cyan shrink-0" />
            <span className="truncate">AI 书籍与论文知识库</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
            共 {AI_BOOKS_KNOWLEDGE_BASE.length} 册 · 当前显示 {filteredBooks.length} 册
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

      {/* Search & Filter Controls */}
      <div className="p-3 border-b border-white/10 space-y-2 shrink-0 bg-[#0b101b]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={stopRevealKey}
            placeholder="检索书名、作者、arXiv 或 Cursor 主题..."
            aria-label="检索知识库书籍"
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

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
            onKeyDown={stopRevealKey}
            aria-label="按课程模块筛选"
            className="w-24 shrink-0 px-2 py-1.5 rounded-lg bg-white/5 border border-white/15 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-gemini-cyan cursor-pointer"
          >
            <option value="ALL" className="bg-[#090d16]">全部模块</option>
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
            {expandAllDetails ? "收起摘要" : "全部摘要"}
          </button>
        </div>

        {/* Auto-Generated Taxonomy Tag Filter Row */}
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
      </div>

      {/* Scrollable Catalog */}
      <div
        onWheel={stopRevealWheel}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {filteredBooks.length === 0 ? (
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
                      <span className="text-slate-300">{(bookTagsMap[book.id] || []).join(" / ")}</span>
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
        )}
      </div>
    </aside>
  );
}
