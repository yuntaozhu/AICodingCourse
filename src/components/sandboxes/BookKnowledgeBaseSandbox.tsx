import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Layers, Plus, Check, Sparkles, Search, BookMarked } from "lucide-react";
import {
  AI_BOOKS_KNOWLEDGE_BASE,
  AUTO_TAXONOMY_DEFINITIONS,
  BOOK_CATEGORY_LIST,
  CURRICULUM_BOOK_BUNDLES,
  deriveAutoTaxonomyTags,
  getBookGithubUrl,
  type AutoTaxonomyTag,
  type BookCategory,
  type KnowledgeBookItem,
} from "@/data/aiBooksKnowledgeBase";
import {
  buildOfflineCourseSynthesis,
  synthesizeCourseFromBooks,
  type KbOutputMode,
} from "@/lib/gemini";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type RightPanelTab = "inspect" | "synthesize";
type ModuleFilter = "ALL" | "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7" | "M8" | "M9" | "M10";

export default function BookKnowledgeBaseSandbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<BookCategory | "ALL">("ALL");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const [tagFilter, setTagFilter] = useState<AutoTaxonomyTag | "ALL">("ALL");
  const [activeBookId, setActiveBookId] = useState<string>(AI_BOOKS_KNOWLEDGE_BASE[0].id);

  const [rightTab, setRightTab] = useState<RightPanelTab>("inspect");
  const [stagedIds, setStagedIds] = useState<string[]>([
    "beyond-vibe-coding",
    "ai-engineering-chip-huyen",
    "building-apps-ai-agents",
  ]);
  const [targetModule, setTargetModule] = useState<Exclude<ModuleFilter, "ALL">>("M3");
  const [outputMode, setOutputMode] = useState<KbOutputMode>("lesson_outline");
  const [topicInput, setTopicInput] = useState("Cursor 独立开发者从原型到生产级 Agent 交付");
  const [synthesizedResult, setSynthesizedResult] = useState<string>("");
  const [synthesisModel, setSynthesisModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bookTagsMap = useMemo(() => {
    const map: Record<string, AutoTaxonomyTag[]> = {};
    for (const item of AI_BOOKS_KNOWLEDGE_BASE) {
      map[item.id] = deriveAutoTaxonomyTags(item);
    }
    return map;
  }, []);

  const tagCounts = useMemo(() => {
    const counts: Record<AutoTaxonomyTag, number> = {
      架构设计: 0,
      算法原理: 0,
      工程实践: 0,
      智能体与上下文: 0,
      数据与可视化: 0,
      评测与安全: 0,
    };
    for (const item of AI_BOOKS_KNOWLEDGE_BASE) {
      for (const tag of bookTagsMap[item.id] || []) {
        counts[tag] += 1;
      }
    }
    return counts;
  }, [bookTagsMap]);

  const activeTagDef = useMemo(
    () => AUTO_TAXONOMY_DEFINITIONS.find((def) => def.id === tagFilter) ?? null,
    [tagFilter]
  );

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

  const activeBook: KnowledgeBookItem = useMemo(() => {
    return (
      AI_BOOKS_KNOWLEDGE_BASE.find((b) => b.id === activeBookId) ??
      filteredBooks[0] ??
      AI_BOOKS_KNOWLEDGE_BASE[0]
    );
  }, [activeBookId, filteredBooks]);

  const stagedBooks = useMemo(() => {
    return stagedIds
      .map((id) => AI_BOOKS_KNOWLEDGE_BASE.find((b) => b.id === id))
      .filter((b): b is KnowledgeBookItem => Boolean(b));
  }, [stagedIds]);

  const toggleStageBook = (id: string) => {
    setStagedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 6) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const applyBundle = (bundleId: string) => {
    const bundle = CURRICULUM_BOOK_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    setStagedIds(bundle.bookIds);
    setTargetModule(bundle.targetModule);
    setTopicInput(bundle.goal);
    setRightTab("synthesize");
    setErrorMessage(null);
  };

  const handleOfflineSynthesize = () => {
    if (stagedBooks.length === 0) {
      setErrorMessage("请先在左侧至少勾选 1 本书或论文。");
      return;
    }
    setErrorMessage(null);
    const out = buildOfflineCourseSynthesis({
      topic: topicInput,
      targetModule,
      outputMode,
      selectedBooks: stagedBooks,
    });
    setSynthesizedResult(out);
    setSynthesisModel("离线结构化模板引擎");
  };

  const handleGeminiSynthesize = async () => {
    if (stagedBooks.length === 0) {
      setErrorMessage("请先在左侧至少勾选 1 本书或论文。");
      return;
    }
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const res = await synthesizeCourseFromBooks({
        topic: topicInput,
        targetModule,
        outputMode,
        selectedBooks: stagedBooks,
      });
      setSynthesizedResult(res.content);
      setSynthesisModel(res.model);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI 备课生成失败";
      setErrorMessage(msg);
      const fallback = buildOfflineCourseSynthesis({
        topic: topicInput,
        targetModule,
        outputMode,
        selectedBooks: stagedBooks,
      });
      setSynthesizedResult(fallback);
      setSynthesisModel("离线回退结构");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJumpToModule = (modCode: string) => {
    window.dispatchEvent(
      new CustomEvent("reveal:jump-module", {
        detail: { moduleId: modCode.toLowerCase(), v: 0 },
      })
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 05 · AI-PDF-BOOKS KNOWLEDGE BASE ({AI_BOOKS_KNOWLEDGE_BASE.length} RESOURCES)
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            AI 书籍与论文知识库 × 智能备课引擎
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums">
          来源：AI-pdf-books + 前沿论文/手册 · 当前命中 {filteredBooks.length} / {AI_BOOKS_KNOWLEDGE_BASE.length}
        </div>
      </div>

      {/* Category & Module Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#0b0f19] p-2 rounded-xl border border-white/10">
        <div className="flex items-center gap-1 flex-wrap">
          {BOOK_CATEGORY_LIST.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              onKeyDown={stopRevealKey}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={stopRevealKey}
              placeholder="检索书名 / arXiv / 概念..."
              className="pl-8 pr-2.5 py-1 w-48 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
            onKeyDown={stopRevealKey}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-slate-200 focus:outline-none focus:border-gemini-cyan cursor-pointer"
          >
            <option value="ALL" className="bg-[#0b0f19]">全部模块</option>
            {(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10"] as const).map((m) => (
              <option key={m} value={m} className="bg-[#0b0f19]">
                仅看 {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Automated Classification Tags Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2.5 py-1.5 bg-[#0b0f19] rounded-xl border border-white/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400 mr-1 whitespace-nowrap">
            自动分类标签:
          </span>
          <button
            type="button"
            onClick={() => setTagFilter("ALL")}
            onKeyDown={stopRevealKey}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              tagFilter === "ALL"
                ? "bg-white text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            全部 ({AI_BOOKS_KNOWLEDGE_BASE.length})
          </button>
          {AUTO_TAXONOMY_DEFINITIONS.map((def) => {
            const isActive = tagFilter === def.id;
            return (
              <button
                key={def.id}
                type="button"
                title={def.ruleSummary}
                onClick={() => setTagFilter((prev) => (prev === def.id ? "ALL" : def.id))}
                onKeyDown={stopRevealKey}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  isActive
                    ? "bg-gemini-purple text-white font-semibold"
                    : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/15"
                }`}
              >
                {def.label} ({tagCounts[def.id]})
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[340px]">
          {activeTagDef ? activeTagDef.ruleSummary : "基于书目元数据自动标引 · 点击标签即时过滤"}
        </div>
      </div>

      {/* Main Two-Zone Split Stage */}
      <div className="grid grid-cols-12 gap-4 h-[395px]">
        {/* Left Zone: Searchable Book Catalog */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 overflow-y-auto p-2.5 space-y-1.5"
        >
          {filteredBooks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs space-y-2">
              <BookOpen className="w-6 h-6 opacity-60" />
              <div>未找到匹配书目，请清空检索词或重置分类标签。</div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("ALL");
                  setModuleFilter("ALL");
                  setTagFilter("ALL");
                }}
                onKeyDown={stopRevealKey}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors"
              >
                重置全部筛选
              </button>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const isSelected = book.id === activeBook.id;
              const isStaged = stagedIds.includes(book.id);
              const autoTags = bookTagsMap[book.id] || [];
              return (
                <div
                  key={book.id}
                  onClick={() => setActiveBookId(book.id)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-white/10 border-gemini-cyan/60"
                      : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate" title={book.title}>
                      {book.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap tabular-nums">
                      <span>{book.authorOrSource}</span>
                      <span aria-hidden="true">·</span>
                      <span>{book.sizeMB.toFixed(1)} MB</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-gemini-cyan">{book.targetModules.join("/")}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300">{autoTags.join(" / ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStageBook(book.id);
                      }}
                      onKeyDown={stopRevealKey}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                        isStaged
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                          : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                      }`}
                    >
                      {isStaged ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      <span>{isStaged ? "已选" : "备课"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Zone: Reader Detail & Course-Builder Studio */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
        >
          <div>
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setRightTab("inspect")}
                onKeyDown={stopRevealKey}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  rightTab === "inspect"
                    ? "bg-white text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>单书精读与映射</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab("synthesize")}
                onKeyDown={stopRevealKey}
                className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                  rightTab === "synthesize"
                    ? "bg-gemini-purple text-white font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>辅助建课 ({stagedBooks.length})</span>
              </button>
            </div>

            {rightTab === "inspect" ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono text-gemini-cyan">
                    {activeBook.category} · {activeBook.authorOrSource} · {activeBook.sizeMB.toFixed(1)} MB
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 leading-snug">
                    {activeBook.title}
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">核心思想提炼</div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activeBook.coreTakeaways}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/30">
                  <div className="text-[11px] font-mono text-gemini-cyan mb-1">
                    如何辅助 Cursor 课程建设
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed">
                    {activeBook.courseApplication}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">自动分类:</span>
                  {(bookTagsMap[activeBook.id] || []).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter((prev) => (prev === tag ? "ALL" : tag))}
                      onKeyDown={stopRevealKey}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        tagFilter === tag
                          ? "bg-gemini-purple text-white font-semibold"
                          : "bg-white/10 hover:bg-gemini-purple/60 text-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">关联模块:</span>
                    {activeBook.targetModules.map((mod) => (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => handleJumpToModule(mod)}
                        onKeyDown={stopRevealKey}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 text-[11px] font-mono text-white transition-colors cursor-pointer"
                      >
                        {mod}
                      </button>
                    ))}
                  </div>

                  <a
                    href={getBookGithubUrl(activeBook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-gemini-cyan hover:underline"
                  >
                    <span>{activeBook.externalUrl ? "arXiv PDF" : "GitHub PDF"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Curated Preset Bundles */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    快速套用课程主题书单
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {CURRICULUM_BOOK_BUNDLES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => applyBundle(b.id)}
                        onKeyDown={stopRevealKey}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-slate-200 transition-colors cursor-pointer"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Staged Books Summary */}
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  <div className="font-mono text-slate-400 mb-1">
                    备课篮（{stagedBooks.length}/6 本，点击左侧可增删）：
                  </div>
                  {stagedBooks.length === 0 ? (
                    <span className="text-amber-300">暂未选择书籍，请在左侧勾选。</span>
                  ) : (
                    <div className="space-y-0.5 text-slate-200">
                      {stagedBooks.map((b) => (
                        <div key={b.id} className="truncate">
                          · {b.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Output Config */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={targetModule}
                    onChange={(e) => setTargetModule(e.target.value as Exclude<ModuleFilter, "ALL">)}
                    onKeyDown={stopRevealKey}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-gemini-purple cursor-pointer"
                  >
                    <option value="M1" className="bg-[#0b0f19]">目标：M1 Cursor 范式</option>
                    <option value="M2" className="bg-[#0b0f19]">目标：M2 上下文架构</option>
                    <option value="M3" className="bg-[#0b0f19]">目标：M3 全栈与上线</option>
                    <option value="M4" className="bg-[#0b0f19]">目标：M4 Rules · MCP</option>
                    <option value="M5" className="bg-[#0b0f19]">目标：M5 DoD 验证闭环</option>
                    <option value="M6" className="bg-[#0b0f19]">目标：M6 Bugbot 异步</option>
                    <option value="M7" className="bg-[#0b0f19]">目标：M7 ROI 与演进</option>
                    <option value="M8" className="bg-[#0b0f19]">目标：M8 案例实战库</option>
                    <option value="M9" className="bg-[#0b0f19]">目标：M9 全栈白盒图谱</option>
                    <option value="M10" className="bg-[#0b0f19]">目标：M10 审美与效能</option>
                  </select>

                  <select
                    value={outputMode}
                    onChange={(e) => setOutputMode(e.target.value as KbOutputMode)}
                    onKeyDown={stopRevealKey}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-gemini-purple cursor-pointer"
                  >
                    <option value="lesson_outline" className="bg-[#0b0f19]">产出：课程章节大纲</option>
                    <option value="cursor_rule" className="bg-[#0b0f19]">产出：.cursor/rules (.mdc)</option>
                    <option value="hands_on_lab" className="bg-[#0b0f19]">产出：Cursor 实验题</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={stopRevealKey}
                  placeholder="输入你想拓展的教学场景或产品功能..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-purple"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOfflineSynthesize}
                    onKeyDown={stopRevealKey}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
                  >
                    离线结构合成
                  </button>
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGeminiSynthesize}
                    onKeyDown={stopRevealKey}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-gemini-cyan hover:bg-gemini-cyan/90 text-slate-950 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1 whitespace-nowrap disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? "Gemini 备课中..." : "AI 融合生成"}</span>
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/30 text-[11px] text-amber-300">
                    {errorMessage}
                  </div>
                )}

                {synthesizedResult && (
                  <div className="p-3 rounded-xl bg-black/50 border border-white/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400">
                        {synthesisModel || "生成结果"}
                      </span>
                      <CopySnippetButton text={synthesizedResult} label="复制方案" />
                    </div>
                    <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {synthesizedResult}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>选中书籍后可一键生成新章节或 .mdc 规则</span>
            <button
              type="button"
              onClick={() => toggleStageBook(activeBook.id)}
              onKeyDown={stopRevealKey}
              className="text-gemini-cyan hover:underline cursor-pointer"
            >
              {stagedIds.includes(activeBook.id) ? "从备课篮移出" : "+ 加入当前书单"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
