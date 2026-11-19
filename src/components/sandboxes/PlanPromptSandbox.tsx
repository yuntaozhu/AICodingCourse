import { useMemo, useState } from "react";
import { Sparkles, Terminal, Layers } from "lucide-react";
import {
  CONTEXT_TAGS,
  DOD_CHECK_OPTIONS,
  PRODUCT_ARCHETYPES,
} from "@/data/cursorPresets";
import { CopySnippetButton } from "./SandboxFrame";
import LabPracticePanel from "./LabPracticePanel";
import { auditPlanPrompt } from "@/data/labPracticeEngine";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type CursorMode = "Plan" | "Agent" | "Ask" | "Debug";

const MODE_DESCRIPTIONS: Record<CursorMode, string> = {
  Plan: "先输出结构化 Spec 与待确认问题清单，人审后再一键 Build",
  Agent: "自主读写多文件、执行终端命令并按 DoD 闭环自愈",
  Ask: "只读分析代码库架构与依赖关系，零风险不改文件",
  Debug: "围绕报错堆栈定位根因、补充日志并生成最小修复补丁",
};

export default function PlanPromptSandbox() {
  const [selectedPresetId, setSelectedPresetId] = useState(PRODUCT_ARCHETYPES[0].id);
  const [idea, setIdea] = useState(PRODUCT_ARCHETYPES[0].sampleIdea);
  const [mode, setMode] = useState<CursorMode>("Plan");
  const [selectedTags, setSelectedTags] = useState<string[]>(["@Codebase", "@Files", "@Docs"]);
  const [selectedDod, setSelectedDod] = useState<string[]>(["tsc", "lint", "states", "security"]);
  const [activeTab, setActiveTab] = useState<"workbench" | "practice">("workbench");

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const preset = PRODUCT_ARCHETYPES.find((p) => p.id === id);
    if (preset) {
      setIdea(preset.sampleIdea);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const toggleDod = (id: string) => {
    setSelectedDod((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const activePreset = useMemo(
    () => PRODUCT_ARCHETYPES.find((p) => p.id === selectedPresetId) || PRODUCT_ARCHETYPES[0],
    [selectedPresetId]
  );

  const compiledPrompt = useMemo(() => {
    const contextLine =
      selectedTags.length > 0 ? selectedTags.join(" ") : "@Codebase (自动语义检索)";
    const dodLines = DOD_CHECK_OPTIONS.filter((d) => selectedDod.includes(d.id)).map(
      (d) => `- [ ] ${d.commandOrRule}`
    );

    return `[Cursor ${mode} Mode | Cmd+I]
Context: ${contextLine}
Rules: .cursor/rules/00-project-dna.mdc, AGENTS.md
Stack: ${activePreset.stackSummary}

# 1. 产品意图 (Intent)
${idea.trim() || "请补充您的产品需求..."}

# 2. ${mode === "Plan" ? "先出规格蓝图 (SDD Plan)" : "执行动作要求"}
${
  mode === "Plan"
    ? `- 列出涉及的数据模型、API 路由与组件目录变更
- 标出存在歧义的边界条件与默认方案，待我确认后再修改代码`
    : mode === "Agent"
    ? `- 按模块拆分实现前后端与类型定义，禁止使用 any 与硬编码密钥
- 每改完一阶段主动跑验证命令，遇到报错自行读取终端输出修复`
    : mode === "Ask"
    ? `- 仅做只读依赖分析与影响面评估，列出风险文件列表，不要修改任何代码`
    : `- 定位根因与复现路径，输出最小化补丁并验证回归边界`
}

# 3. 验收门禁 (DoD)
${dodLines.length > 0 ? dodLines.join("\n") : "- [ ] 确保构建与基础类型检查通过"}`;
  }, [activePreset.stackSummary, idea, mode, selectedDod, selectedTags]);

  const auditReport = useMemo(
    () =>
      auditPlanPrompt({
        idea,
        mode,
        selectedTags,
        selectedDod,
      }),
    [idea, mode, selectedDod, selectedTags]
  );

  const auditPassedCount = auditReport.checks.filter((c) => c.passed).length;

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan uppercase tracking-wider">
            Interactive Lab 01 · Cursor Cmd+I Workbench
          </div>
          <h3 className="text-lg font-bold text-white">
            Plan → Agent → DoD 提示词装配沙盘
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <div
            className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10"
            role="tablist"
            aria-label="Lab 01 模式切换"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "workbench"}
              onClick={() => setActiveTab("workbench")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === "workbench"
                  ? "bg-white text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              提示词装配
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "practice"}
              onClick={() => setActiveTab("practice")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === "practice"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              练习与 DoD ({auditPassedCount}/{auditReport.checks.length})
            </button>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            蓝图审计 <span className="text-gemini-cyan font-bold">{auditReport.score}</span>/100
          </div>
          <CopySnippetButton text={compiledPrompt} label="复制 Cursor 提示词" />
        </div>
      </div>

      {activeTab === "practice" ? (
        <LabPracticePanel
          labId="plan-prompt"
          auditReport={auditReport}
          auditTitle="Plan 蓝图确定性审计"
        />
      ) : (
        <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left 60% Controls */}
        <div className="col-span-7 flex flex-col gap-2.5">
          {/* Scenario Preset Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400 mr-1">产品场景:</span>
            {PRODUCT_ARCHETYPES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedPresetId === preset.id
                    ? "bg-gemini-cyan text-slate-950 font-semibold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Cursor Mode Selector */}
          <div className="grid grid-cols-4 gap-1.5">
            {(["Plan", "Agent", "Ask", "Debug"] as CursorMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-2.5 py-1.5 rounded-lg text-left border transition-colors cursor-pointer ${
                  mode === m
                    ? "bg-gemini-purple/20 border-gemini-purple text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-mono font-bold">
                  {m} {m === "Plan" ? "(Shift+Tab)" : ""}
                </div>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 px-1">{MODE_DESCRIPTIONS[mode]}</div>

          {/* Idea Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>输入产品经理一句话需求（支持直接编辑体验）</span>
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={stopRevealKey}
              rows={2}
              className="w-full rounded-xl bg-black/50 border border-white/15 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-gemini-cyan resize-none leading-relaxed"
              placeholder="输入你想在 Cursor 中落地的功能..."
            />
          </div>

          {/* @ Context & DoD Checkboxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
              <div className="text-[11px] font-mono text-gemini-cyan mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>挂载 @ 上下文符号</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CONTEXT_TAGS.map((item) => {
                  const active = selectedTags.includes(item.tag);
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => toggleTag(item.tag)}
                      title={item.usageTip}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        active
                          ? "bg-gemini-cyan/20 text-gemini-cyan border border-gemini-cyan/50"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
              <div className="text-[11px] font-mono text-gemini-purple mb-1.5 flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>勾选 DoD 验收门禁</span>
              </div>
              <div className="space-y-1">
                {DOD_CHECK_OPTIONS.slice(0, 4).map((d) => {
                  const checked = selectedDod.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDod(d.id)}
                        className="accent-[#4cddec] rounded"
                      />
                      <span>{d.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 40% Compiled Output */}
        <div className="col-span-5 flex flex-col rounded-xl bg-black/60 border border-white/10 overflow-hidden">
          <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gemini-cyan">Cmd+I · 编译后可执行指令</span>
            <span className="text-slate-400 tabular-nums">{selectedTags.length} 个上下文</span>
          </div>
          <pre
            className="flex-1 p-3 text-[11px] font-mono text-slate-200 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed max-h-[340px]"
            onWheel={stopRevealWheel}
          >
            {compiledPrompt}
          </pre>
        </div>
      </div>
      )}
    </div>
  );
}
