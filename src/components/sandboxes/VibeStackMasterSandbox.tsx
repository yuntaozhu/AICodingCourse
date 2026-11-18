import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, ExternalLink, Layers, RotateCcw, Search } from "lucide-react";
import {
  buildStackPlanPrompt,
  EMERGENCY_RECOVERY_STEPS,
  ERROR_DECODER_ITEMS,
  GLOSSARY_TERMS,
  MASTER_MAP_ROWS,
  STACK_PRESETS,
  type GlossaryCategory,
  type MasterMapLayerGroup,
  type StackPresetId,
} from "@/data/vibeHandbookData";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type SandboxTab = "master-map" | "error-decoder" | "glossary";

export default function VibeStackMasterSandbox() {
  const [activeTab, setActiveTab] = useState<SandboxTab>("master-map");

  // Tab 1: Master Map state
  const [presetId, setPresetId] = useState<StackPresetId>("saas-2026");
  const [layerFilter, setLayerFilter] = useState<MasterMapLayerGroup | "ALL">("ALL");
  const [selectedRowId, setSelectedRowId] = useState<string>(MASTER_MAP_ROWS[4].id);
  const [customOverrides, setCustomOverrides] = useState<Partial<Record<string, string>>>({});

  // Tab 2: Error Decoder state
  const [errorGroupFilter, setErrorGroupFilter] = useState<"ALL" | "frontend" | "backend">("ALL");
  const [selectedErrorId, setSelectedErrorId] = useState<string>(ERROR_DECODER_ITEMS[2].id);

  // Tab 3: Glossary state
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [glossaryCategory, setGlossaryCategory] = useState<GlossaryCategory | "ALL">("ALL");

  const filteredRows = useMemo(() => {
    if (layerFilter === "ALL") return MASTER_MAP_ROWS;
    return MASTER_MAP_ROWS.filter((r) => r.layerGroup === layerFilter);
  }, [layerFilter]);

  const activeRow = useMemo(() => {
    return MASTER_MAP_ROWS.find((r) => r.id === selectedRowId) ?? MASTER_MAP_ROWS[0];
  }, [selectedRowId]);

  const activeRowChoice = customOverrides[activeRow.id] ?? activeRow.presetChoices[presetId];

  const generatedPlanPrompt = useMemo(
    () => buildStackPlanPrompt(presetId, customOverrides),
    [presetId, customOverrides]
  );

  const filteredErrors = useMemo(() => {
    if (errorGroupFilter === "ALL") return ERROR_DECODER_ITEMS;
    return ERROR_DECODER_ITEMS.filter((e) => e.group === errorGroupFilter);
  }, [errorGroupFilter]);

  const activeError = useMemo(() => {
    return (
      filteredErrors.find((e) => e.id === selectedErrorId) ??
      filteredErrors[0] ??
      ERROR_DECODER_ITEMS[0]
    );
  }, [filteredErrors, selectedErrorId]);

  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((item) => {
      if (glossaryCategory !== "ALL" && item.category !== glossaryCategory) return false;
      if (!q) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.whereSeenInAiApp.toLowerCase().includes(q)
      );
    });
  }, [glossaryQuery, glossaryCategory]);

  const handleSelectPreset = (id: StackPresetId) => {
    setPresetId(id);
    setCustomOverrides({});
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest">
            LAB 07 · THE VIBE CODER&apos;S HANDBOOK · MARCH 2026
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            全栈工具总图谱 (14 岗) × 高频报错解码器 × 32 词速查台
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <a
            href="/assets/aistudio/TheVibeCodersHandbook_cd703cf8.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onKeyDown={stopRevealKey}
            className="text-gemini-cyan hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>原书 PDF (56页)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="https://vibecodershandbook.pages.dev/chapters/introduction"
            target="_blank"
            rel="noopener noreferrer"
            onKeyDown={stopRevealKey}
            className="text-slate-300 hover:text-white hover:underline inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>在线章节版</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Primary Workbench Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#0b0f19] p-1.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("master-map")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 tabular-nums ${
              activeTab === "master-map"
                ? "bg-gemini-cyan text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>01. 14 岗技术栈装配台 (Ch.16)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("error-decoder")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 tabular-nums ${
              activeTab === "error-decoder"
                ? "bg-amber-400 text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>02. 8 大高频报错解码器 (Ch.18)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("glossary")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 tabular-nums ${
              activeTab === "glossary"
                ? "bg-gemini-purple text-white font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>03. 32 词工程词典</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2 hidden md:block">
          {activeTab === "master-map" && "区分「互斥二选一 (Either/Or)」与「协同配合 (Work Together)」"}
          {activeTab === "error-decoder" && "黄金法则：先精读报错第一行，再向 Cursor 投喂最小完整现场"}
          {activeTab === "glossary" && `覆盖全书 ${GLOSSARY_TERMS.length} 个核心工程术语与代码落地位置`}
        </div>
      </div>

      {/* TAB 1: MASTER MAP */}
      {activeTab === "master-map" && (
        <div className="space-y-2.5">
          {/* Preset & Layer Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0b0f19] px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400 mr-1">栈预设:</span>
              {STACK_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  onKeyDown={stopRevealKey}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    presetId === p.id
                      ? "bg-white text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {Object.keys(customOverrides).length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomOverrides({})}
                  onKeyDown={stopRevealKey}
                  className="px-2 py-1 rounded-md text-[11px] text-amber-300 hover:bg-white/10 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置微调</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {(
                [
                  { id: "ALL", label: "全部 (14)" },
                  { id: "frontend", label: "前端与状态" },
                  { id: "backend_data", label: "后端与数据" },
                  { id: "tooling_deploy", label: "构建与部署" },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setLayerFilter(g.id)}
                  onKeyDown={stopRevealKey}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    layerFilter === g.id
                      ? "bg-gemini-purple text-white font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 h-[370px]">
            {/* Left Zone: 14-Row Interactive Master Map */}
            <div
              onWheel={stopRevealWheel}
              className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 overflow-y-auto p-2.5 space-y-1.5"
            >
              {filteredRows.map((row, idx) => {
                const isSelected = row.id === activeRow.id;
                const currentChoice = customOverrides[row.id] ?? row.presetChoices[presetId];
                const isModified = Boolean(customOverrides[row.id]);
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedRowId(row.id)}
                    onKeyDown={stopRevealKey}
                    className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-white/10 border-gemini-cyan/60"
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/25"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span>{row.jobZh}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {row.job}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {row.whatItDoes}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-mono font-semibold whitespace-nowrap ${
                          isModified ? "text-amber-300" : "text-gemini-cyan"
                        }`}
                      >
                        {currentChoice}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {row.eitherOrOptions.length} 选 1
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Zone: Inspector + Live Plan Prompt */}
            <div
              onWheel={stopRevealWheel}
              className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-3.5 flex flex-col justify-between overflow-y-auto space-y-2.5"
            >
              <div className="space-y-2.5">
                <div>
                  <div className="text-[11px] font-mono text-gemini-cyan">
                    {activeRow.job} · 2026 默认：{activeRow.default2026}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {activeRow.jobZh}：当前选中 {activeRowChoice}
                  </h3>
                </div>

                {/* Clickable Either/Or Customizer */}
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    点击切换此层互斥选项 (Either / Or)：
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRow.eitherOrOptions.map((opt) => {
                      const isPicked = activeRowChoice === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setCustomOverrides((prev) => ({
                              ...prev,
                              [activeRow.id]: opt,
                            }))
                          }
                          onKeyDown={stopRevealKey}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            isPicked
                              ? "bg-gemini-cyan text-slate-950 font-semibold"
                              : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/15"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                  <div className="text-[11px] font-mono text-slate-400">核心隐喻与 AI 选型逻辑</div>
                  <p className="text-slate-200 leading-relaxed">{activeRow.analogy}</p>
                  <p className="text-slate-400 leading-relaxed">{activeRow.whyAiPicksIt}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-gemini-purple/10 border border-gemini-purple/30 text-xs">
                  <div className="text-[11px] font-mono text-gemini-purple mb-0.5">
                    Cursor Rules 护栏建议
                  </div>
                  <p className="text-slate-200 leading-relaxed">{activeRow.cursorRuleTip}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 truncate">
                  导出 14 层契约给 Cursor Plan Mode
                </span>
                <CopySnippetButton text={generatedPlanPrompt} label="复制技术栈 Plan" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ERROR DECODER */}
      {activeTab === "error-decoder" && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0b0f19] px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: "ALL", label: "全部报错 (8)" },
                  { id: "frontend", label: "前端渲染报错 (4)" },
                  { id: "backend", label: "后端与构建报错 (4)" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setErrorGroupFilter(f.id)}
                  onKeyDown={stopRevealKey}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                    errorGroupFilter === f.id
                      ? "bg-amber-400 text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-300 hover:bg-white/15"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] font-mono text-amber-300">
              Golden Rule：永远先读报错第一行 · 90% 问题已有确定解
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 h-[370px]">
            {/* Left Error List */}
            <div
              onWheel={stopRevealWheel}
              className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 overflow-y-auto p-2.5 space-y-1.5"
            >
              {filteredErrors.map((err) => {
                const isSelected = err.id === activeError.id;
                return (
                  <button
                    key={err.id}
                    type="button"
                    onClick={() => setSelectedErrorId(err.id)}
                    onKeyDown={stopRevealKey}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-400/60"
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400 mb-0.5">
                      {err.group === "frontend" ? "FRONTEND ERROR" : "BACKEND / BUILD ERROR"}
                    </div>
                    <div className="text-xs font-mono font-semibold text-white truncate">
                      {err.errorTitle}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 line-clamp-1">
                      {err.meaning}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Decoder + 5-Step Emergency Checklist */}
            <div
              onWheel={stopRevealWheel}
              className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-3"
            >
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono text-amber-400">
                    {activeError.group === "frontend" ? "浏览器现场报错" : "服务端 / 依赖构建报错"}
                  </div>
                  <h3 className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeError.errorTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-mono text-slate-400 mb-1">人话翻译 · 常见根因</div>
                    <p className="text-slate-200 leading-relaxed">{activeError.rootCause}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                    <div className="text-[11px] font-mono text-emerald-400 mb-1">标准修复动作</div>
                    <p className="text-slate-200 leading-relaxed">{activeError.fixStep}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-gemini-cyan/30 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gemini-cyan">
                      复制这段精准喂料话术给 Cursor
                    </span>
                    <CopySnippetButton text={activeError.cursorDebugPrompt} label="复制排障指令" />
                  </div>
                  <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {activeError.cursorDebugPrompt}
                  </pre>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="text-[11px] font-mono text-slate-400 mb-1.5">
                  Ch.20 项目彻底挂了时的 5 步复位清单（解决 90% 异常）
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-300">
                  {EMERGENCY_RECOVERY_STEPS.map((step) => (
                    <div key={step}>{step}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 32-TERM GLOSSARY */}
      {activeTab === "glossary" && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0b0f19] px-3 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["ALL", "前端与渲染", "后端与接口", "数据与构建", "AI 研发范式"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGlossaryCategory(cat)}
                    onKeyDown={stopRevealKey}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      glossaryCategory === cat
                        ? "bg-gemini-purple text-white font-semibold"
                        : "bg-white/5 text-slate-300 hover:bg-white/15"
                    }`}
                  >
                    {cat === "ALL" ? `全部 (${GLOSSARY_TERMS.length})` : cat}
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                onKeyDown={stopRevealKey}
                placeholder="检索术语如 ORM, SSR, Zod..."
                aria-label="检索全栈工程术语词典"
                className="pl-8 pr-3 py-1 w-56 rounded-lg bg-white/5 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-purple"
              />
            </div>
          </div>

          <div
            onWheel={stopRevealWheel}
            className="h-[370px] overflow-y-auto bg-[#0b0f19] rounded-2xl border border-white/10 p-3 grid grid-cols-2 gap-2.5 content-start"
          >
            {filteredGlossary.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-xs text-slate-400">
                未找到匹配的工程术语，请尝试清空搜索关键词。
              </div>
            ) : (
              filteredGlossary.map((item) => (
                <div
                  key={item.term}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-mono font-bold text-white">{item.term}</span>
                    <span className="text-[10px] font-mono text-gemini-cyan">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
                  <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-white/10">
                    常见位置：{item.whereSeenInAiApp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
