import { useMemo, useState } from "react";
import { ExternalLink, Search, Sparkles } from "lucide-react";
import {
  UI_REFERENCE_CATEGORIES,
  UI_REFERENCE_SITES,
  type UiReferenceCategory,
} from "@/data/uiReferenceSites";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

export default function UiInspirationSandbox() {
  const [category, setCategory] = useState<"all" | UiReferenceCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(UI_REFERENCE_SITES[0].id);

  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UI_REFERENCE_SITES.filter((site) => {
      if (category !== "all" && site.category !== category) return false;
      if (!q) return true;
      return (
        site.name.toLowerCase().includes(q) ||
        site.oneLiner.toLowerCase().includes(q) ||
        site.caseHighlight.toLowerCase().includes(q) ||
        site.whatToWatch.toLowerCase().includes(q) ||
        site.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const activeSite = useMemo(() => {
    return (
      filteredSites.find((s) => s.id === selectedId) ||
      filteredSites[0] ||
      UI_REFERENCE_SITES[0]
    );
  }, [filteredSites, selectedId]);

  const handleCategoryChange = (nextCategory: "all" | UiReferenceCategory) => {
    setCategory(nextCategory);
    const firstMatch = UI_REFERENCE_SITES.find((site) =>
      nextCategory === "all" ? true : site.category === nextCategory
    );
    if (firstMatch) {
      setSelectedId(firstMatch.id);
    }
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-wide">
            Interactive Lab 08 · High-Signal Visual &amp; Code Input Library
          </div>
          <h3 className="text-lg font-bold text-white">
            VibeCoding 前端审美参考库（23 站）与 Cursor 精准喂料生成器
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={stopRevealKey}
              placeholder="搜站点 / Vue / Radix / 页脚 / MCP..."
              aria-label="搜索参考网站"
              className="w-56 rounded-lg bg-black/50 border border-white/15 pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300 tabular-nums whitespace-nowrap shrink-0">
            检索 <span className="text-gemini-cyan font-bold">{filteredSites.length}</span>/{UI_REFERENCE_SITES.length} 站
          </div>
        </div>
      </div>

      {/* Category Filter Tabs (Interactive Buttons) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/45 border border-white/10">
          {UI_REFERENCE_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  active
                    ? "bg-gemini-cyan text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-400 truncate max-w-md">
          {UI_REFERENCE_CATEGORIES.find((c) => c.id === category)?.summary}
        </div>
      </div>

      {/* Two-zone Split: 42% Site Catalog List | 58% Deep Breakdown + Prompt Recipe */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left List */}
        <div
          className="col-span-5 flex flex-col gap-1.5 max-h-[370px] overflow-y-auto custom-scrollbar pr-1"
          onWheel={stopRevealWheel}
        >
          {filteredSites.length === 0 ? (
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 text-center text-xs text-slate-400">
              未找到匹配站点，请清空关键词或切换全部分类重试。
            </div>
          ) : (
            filteredSites.map((site) => {
              const isSelected = site.id === activeSite.id;
              return (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setSelectedId(site.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-gemini-cyan/12 border-gemini-cyan/60 text-white"
                      : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-bold flex items-center gap-1.5 truncate">
                      <span className="font-mono text-gemini-cyan tabular-nums shrink-0">
                        {site.index}.
                      </span>
                      <span className="truncate">{site.name}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                      {site.categoryLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-1">
                    {site.oneLiner}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail & Prompt Generator */}
        <div
          className="col-span-7 rounded-xl bg-black/55 border border-white/10 p-4 flex flex-col justify-between gap-3 max-h-[370px] overflow-y-auto custom-scrollbar"
          onWheel={stopRevealWheel}
        >
          <div className="space-y-2.5">
            {/* Title & Direct Link */}
            <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-white/10">
              <div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-0.5 tabular-nums">
                  <span className="font-mono text-gemini-cyan">{activeSite.index}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSite.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSite.tags.join(" / ")}</span>
                </div>
                <h4 className="text-xl font-bold text-white">{activeSite.name}</h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <CopySnippetButton text={activeSite.url} label="复制网址" />
                <a
                  href={activeSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 text-xs font-mono text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>打开站点</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Case Highlight & Strategy */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="font-semibold text-gemini-cyan">代表案例与细节看点</div>
                <p className="text-slate-200 leading-relaxed">{activeSite.caseHighlight}</p>
                <p className="text-slate-400 leading-relaxed">{activeSite.whatToWatch}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="font-semibold text-gemini-purple">喂给 Cursor 的防走样法则</div>
                <p className="text-slate-200 leading-relaxed">{activeSite.aiInputTip}</p>
              </div>
            </div>
          </div>

          {/* Ready-to-Copy Prompt */}
          <div className="rounded-xl bg-[#070b14] border border-gemini-cyan/30 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-gemini-cyan inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>可直接复制喂给 Cursor Agent 的 Prompt 模板</span>
              </span>
              <CopySnippetButton text={activeSite.promptTemplate} label="复制 Prompt" />
            </div>
            <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {activeSite.promptTemplate}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
