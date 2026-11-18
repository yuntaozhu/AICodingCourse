import { useMemo, useState } from "react";
import { Layers, ShieldCheck, Compass, RotateCcw } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type SandboxView = "compaction" | "harness" | "blueprint";
type AgentModeId = "thinking" | "plan" | "build";
type ReminderRole = "system_top" | "user_recency";

interface AccStageInfo {
  id: string;
  label: string;
  badgeText: string;
  badgeTone: string;
  strategy: string;
  tokenSaving: string;
  cursorMapping: string;
  preservesRecentTurns: number;
}

function getAccStage(pressure: number): AccStageInfo {
  if (pressure >= 99) {
    return {
      id: "stage4",
      label: "Stage 4 · Full Compaction (≥99%)",
      badgeText: "ARCHIVED + SUMMARY",
      badgeTone: "text-rose-300 bg-rose-500/15 border-rose-400/40",
      strategy:
        "将完整对话序列化归档至 scratch 文件，中间轮次由 LLM 压缩摘要并注入 Artifact Index（记录所有 read/edit/create 文件路径），保留最近消息原文以实现无损可追溯压缩。",
      tokenSaving: "峰值降耗 ~54% · 归档无损可逆",
      cursorMapping: "Cursor 对照：/summarize 后将关键改动路径写回 .cursor/rules 或新开 Composer 挂载 @Plan.md",
      preservesRecentTurns: 1,
    };
  }
  if (pressure >= 90) {
    return {
      id: "stage3",
      label: "Stage 3 · Aggressive Masking (90%)",
      badgeText: "AGGRESSIVE MASK",
      badgeTone: "text-orange-300 bg-orange-500/15 border-orange-400/40",
      strategy:
        "保真窗口收缩至仅最新 1 组工具输出，其余全部历史工具返回替换为约 15 tokens 的离线引用指针，保住推理主上下文不崩塌。",
      tokenSaving: "历史工具结果降耗 ~95%",
      cursorMapping: "Cursor 对照：移除无关 @Files 引用，仅保留当前正在修改的 2–3 个核心文件与最新报错栈",
      preservesRecentTurns: 1,
    };
  }
  if (pressure >= 85) {
    return {
      id: "stage25",
      label: "Stage 2.5 · Fast Pruning (85%)",
      badgeText: "FAST PRUNING",
      badgeTone: "text-amber-300 bg-amber-500/15 border-amber-400/40",
      strategy:
        "零 LLM 成本！自后向前扫描工具输出，超出最近保真预算的旧工具返回直接替换为 [pruned] 标记，快速回收被工具结果占用的 70–80% 空间。",
      tokenSaving: "0 额外 LLM 调用 · 立省 ~42% 预算",
      cursorMapping: "Cursor 对照：终端只截取报错最后 30 行而非整段构建日志贴给 Agent",
      preservesRecentTurns: 2,
    };
  }
  if (pressure >= 80) {
    return {
      id: "stage2",
      label: "Stage 2 · Observation Masking (80%)",
      badgeText: "OBSERVATION MASK",
      badgeTone: "text-amber-200 bg-amber-500/10 border-amber-400/30",
      strategy:
        "原地将陈旧的 read_file / grep 输出替换为紧凑引用指针 [output offloaded to scratch file]（约 15 tokens），维持消息协议合法性的同时保住最新观测全貌。",
      tokenSaving: "单条结果从 ~2,400 降至 ~15 tokens",
      cursorMapping: "Cursor 对照：已完成验收的前置模块只留接口契约摘要，不再整文件挂载",
      preservesRecentTurns: 3,
    };
  }
  if (pressure >= 70) {
    return {
      id: "stage1",
      label: "Stage 1 · Warning Monitor (70%)",
      badgeText: "WARNING · MONITOR",
      badgeTone: "text-gemini-cyan bg-gemini-cyan/10 border-gemini-cyan/35",
      strategy:
        "用 API 返回的真实 prompt_tokens 校准压力，开始追踪上下文增长斜率；暂不做破坏性裁剪，为下一轮触发 Masking 准备 Artifact Index。",
      tokenSaving: "全保真观测 · 准备进入掩码阈值",
      cursorMapping: "Cursor 对照：关注 Composer 上下文进度条，避免同时粘贴整份长文档与构建全日志",
      preservesRecentTurns: 4,
    };
  }
  return {
    id: "stage0",
    label: "Stage 0 · Nominal Working Horizon (<70%)",
    badgeText: "NOMINAL · FULL FIDELITY",
    badgeTone: "text-emerald-300 bg-emerald-500/15 border-emerald-400/35",
    strategy:
      "工具返回与历史推理均以 100% 原始保真度保留在上下文窗内，Artifact Index 静默记录已读写文件供后续长程会话检索。",
    tokenSaving: "100% 原始细节保留",
    cursorMapping: "Cursor 对照：适合小步多轮迭代与精准 @Codebase / @Docs 探索",
    preservesRecentTurns: 4,
  };
}

const SAMPLE_OBSERVATIONS = [
  {
    turn: 2,
    tool: "read_file('package.json')",
    rawTokens: 920,
    preview: "{ dependencies: { react: '^19.2.0', reveal.js: '^6.0.0', ... } }",
  },
  {
    turn: 7,
    tool: "grep('createServer', 'src/')",
    rawTokens: 2850,
    preview: "14 matches across server.ts, src/lib/gemini.ts, vite.config.ts ...",
  },
  {
    turn: 14,
    tool: "run_command('npm run lint')",
    rawTokens: 3400,
    preview: "ESLint report: 0 errors, 2 warnings in Presentation.tsx lines 41-55 ...",
  },
  {
    turn: 22,
    tool: "edit_file('server.ts', diff)",
    rawTokens: 1180,
    preview: "Applied fuzzy-matched hunk at POST /api/kb/synthesize (+34/-2) ...",
  },
];

const AGENT_MODES: Record<
  AgentModeId,
  {
    title: string;
    subtitle: string;
    visibleTools: string[];
    removedTools: string[];
    mechanism: string;
  }
> = {
  thinking: {
    title: "Phase 1 · Explicit Thinking（纯推理去噪相）",
    subtitle: "工具 Schema 完全清空，避免“看见锤子就想直接敲”",
    visibleTools: ["(None — 0 Tool Schemas Injected)"],
    removedTools: ["write_file", "edit_file", "run_command", "delete_file", "mcp_execute"],
    mechanism:
      "论文实证：当可执行工具暴露给模型时，LLM 倾向仓促调用而非深度规划。独立无工具 Thinking 阶段配合双记忆（每 5 轮全量再生 Episodic Summary 防止 Summary Drift），显著提升长程规划质量。",
  },
  plan: {
    title: "Plan Mode · Schema Gating（架构级只读隔离）",
    subtitle: "物理移除写工具而非靠运行时弹窗拦阻",
    visibleTools: ["read_file", "grep / ast_search", "lsp_goto_definition", "discover_mcp_index"],
    removedTools: ["write_file (Removed from Schema)", "edit_file (Removed from Schema)", "run_command (Removed from Schema)"],
    mechanism:
      "Make unsafe tools invisible, not blocked：若模型在 Schema 中看不见写工具，它就无法推理如何绕过权限。等价于 Cursor Plan Mode 先只读摸底全仓再让人类拍板。",
  },
  build: {
    title: "Build Mode · Fuzzy Edit + 6-Stage Shell + Shadow Git",
    subtitle: "吸收 LLM 近似输出并保证文件系统秒级可逆",
    visibleTools: [
      "read_file",
      "edit_file (Fuzzy Match Chain)",
      "run_command (6-Stage Sandbox)",
      "lazy_mcp_load (On-Demand)",
    ],
    removedTools: ["destructive_rm_rf (Hard Blocked)", "eager_all_mcp_schemas (-35% Overhead)"],
    mechanism:
      "面对缩进/尾空格漂移，编辑工具按精确➔去空白➔模糊链短路匹配；Shell 经过 6 级安全门+16 种后台服务正则自识别+30k 截断，且 Shadow Git 保证每次写入皆可一键回退。",
  },
};

export default function AgentHarnessSandbox() {
  const [activeView, setActiveView] = useState<SandboxView>("compaction");
  const [pressure, setPressure] = useState<number>(85);
  const [mcpCount, setMcpCount] = useState<number>(8);
  const [lazyMcp, setLazyMcp] = useState<boolean>(true);
  const [agentMode, setAgentMode] = useState<AgentModeId>("plan");
  const [reminderRole, setReminderRole] = useState<ReminderRole>("user_recency");
  const [blueprintSide, setBlueprintSide] = useState<"curriculum" | "platform">("curriculum");

  const accStage = useMemo(() => getAccStage(pressure), [pressure]);
  const modeInfo = AGENT_MODES[agentMode];

  const eagerMcpPct = Math.min(48, Math.round(mcpCount * 5));
  const lazyMcpPct = lazyMcp ? 4 : eagerMcpPct;

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 06 · ARXIV:2603.05344 (OPENDEV) × CURSOR AGENT HARNESS
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            终端 Agent 架构、5 阶上下文压缩与课程双轨改造台
          </h2>
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums">
          论文依据：Nghi D. Q. Bui (2026) · 工具结果占 70–80% 上下文 · ACC 峰值降耗 54%
        </div>
      </div>

      {/* Top View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#0b0f19] p-1.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveView("compaction")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
              activeView === "compaction"
                ? "bg-gemini-cyan text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>01. ACC 5 阶上下文压缩模拟器</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("harness")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
              activeView === "harness"
                ? "bg-gemini-purple text-white font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>02. Schema Gating 与防遗忘机制</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView("blueprint")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
              activeView === "blueprint"
                ? "bg-white text-slate-950 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>03. 课程与系统双轨升级蓝图</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setPressure(85);
            setLazyMcp(true);
            setAgentMode("plan");
            setReminderRole("user_recency");
          }}
          onKeyDown={stopRevealKey}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重置基准状态</span>
        </button>
      </div>

      {/* Main Content Stage */}
      {activeView === "compaction" && (
        <div className="grid grid-cols-12 gap-4 h-[435px]">
          {/* Left Zone: Live Context Message Window */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-xs font-mono text-slate-300">
                  SESSION CONTEXT STREAM · 实时上下文消息降噪演算
                </div>
                <span className={`px-2.5 py-0.5 rounded border text-[11px] font-mono ${accStage.badgeTone}`}>
                  {accStage.badgeText}
                </span>
              </div>

              {/* Pressure Bar */}
              <div className="mb-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-300">当前上下文压力 p = prompt_tokens / max_context</span>
                  <span className="text-gemini-cyan font-bold">{pressure}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                  <div
                    className={`h-full transition-all ${
                      pressure >= 90
                        ? "bg-rose-400"
                        : pressure >= 80
                          ? "bg-amber-400"
                          : "bg-gemini-cyan"
                    }`}
                    style={{ width: `${pressure}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                  <span>0%</span>
                  <span>70% Warn</span>
                  <span>80% Mask</span>
                  <span>85% Prune</span>
                  <span>90% Aggr</span>
                  <span>99% Archive</span>
                </div>
              </div>

              {/* Simulated Observation Stream */}
              <div className="space-y-2">
                {SAMPLE_OBSERVATIONS.map((obs, idx) => {
                  const keepThreshold = SAMPLE_OBSERVATIONS.length - accStage.preservesRecentTurns;
                  const isPreserved = idx >= keepThreshold;

                  let renderMode: "RAW" | "MASKED" | "PRUNED" | "ARCHIVED" = "RAW";
                  let effectiveTokens = obs.rawTokens;
                  let renderedText = obs.preview;

                  if (!isPreserved) {
                    if (pressure >= 99) {
                      renderMode = "ARCHIVED";
                      effectiveTokens = 12;
                      renderedText =
                        "Archived to .opendev/scratch/session-archive.jsonl · Tracked in Artifact Index (modified/read)";
                    } else if (pressure >= 90) {
                      renderMode = "MASKED";
                      effectiveTokens = 15;
                      renderedText = `[output offloaded to scratch file · ${obs.tool} · use read_file to recover]`;
                    } else if (pressure >= 85) {
                      renderMode = "PRUNED";
                      effectiveTokens = 8;
                      renderedText = `[pruned stale tool output · ${obs.tool}]`;
                    } else if (pressure >= 80) {
                      renderMode = "MASKED";
                      effectiveTokens = 15;
                      renderedText = `[output offloaded to scratch file · ~15 tokens]`;
                    }
                  }

                  return (
                    <div
                      key={obs.turn}
                      className={`p-2.5 rounded-xl border text-xs ${
                        renderMode === "RAW"
                          ? "bg-white/[0.04] border-white/15"
                          : "bg-black/40 border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1 tabular-nums">
                        <span className="text-slate-200">
                          Turn {obs.turn} · {obs.tool}
                        </span>
                        <span
                          className={
                            renderMode === "RAW" ? "text-emerald-400" : "text-amber-300"
                          }
                        >
                          {renderMode} · {effectiveTokens} tok (原 {obs.rawTokens})
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 truncate">
                        {renderedText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Artifact Index 始终保留：package.json (R) · server.ts (M)</span>
              <span className="text-gemini-cyan tabular-nums">{accStage.tokenSaving}</span>
            </div>
          </div>

          {/* Right Zone: Control Deck & Cursor Action Mapping */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">
                  模拟上下文占用率：{pressure}% ({accStage.label})
                </label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                  onKeyDown={stopRevealKey}
                  className="w-full accent-gemini-cyan cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { p: 60, name: "60% 正常" },
                  { p: 72, name: "72% 预警" },
                  { p: 82, name: "82% 指针掩码" },
                  { p: 87, name: "87% 零成本剪枝" },
                  { p: 92, name: "92% 激进收缩" },
                  { p: 99, name: "99% 归档摘要" },
                ].map((preset) => (
                  <button
                    key={preset.p}
                    type="button"
                    onClick={() => setPressure(preset.p)}
                    onKeyDown={stopRevealKey}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
                      Math.abs(pressure - preset.p) <= 2
                        ? "bg-gemini-cyan text-slate-950 font-semibold"
                        : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-mono text-gemini-purple mb-1">
                  OPENDEV ACC 分级策略解析
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{accStage.strategy}</p>
              </div>

              <div className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/30">
                <div className="text-[11px] font-mono text-gemini-cyan mb-1">
                  面向独立开发者：Cursor 对应实操策略
                </div>
                <p className="text-xs text-slate-100 leading-relaxed">{accStage.cursorMapping}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-white">核心结论：</strong>把上下文当“有限预算”而非“无限缓冲区”。常规 95% 才一刀切总结会丢失关键文件名；分级掩码 + 剪枝可免掉大部分昂贵总结。
            </div>
          </div>
        </div>
      )}

      {activeView === "harness" && (
        <div className="grid grid-cols-12 gap-4 h-[435px]">
          {/* Left Zone: Schema Gating & Lazy MCP Simulator */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(["thinking", "plan", "build"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAgentMode(m)}
                    onKeyDown={stopRevealKey}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                      agentMode === m
                        ? "bg-gemini-purple text-white font-semibold"
                        : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                    }`}
                  >
                    {m === "thinking"
                      ? "01. Thinking (无工具)"
                      : m === "plan"
                        ? "02. Plan (Schema Gating)"
                        : "03. Build (Write + Fuzzy)"}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-white">{modeInfo.title}</div>
                <div className="text-xs text-gemini-cyan mt-0.5">{modeInfo.subtitle}</div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{modeInfo.mechanism}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
                  <div className="font-mono text-[11px] text-emerald-300 mb-1.5">
                    VISIBLE SCHEMA · Agent 当前可见工具
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] text-slate-200">
                    {modeInfo.visibleTools.map((t) => (
                      <li key={t}>+ {t}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/30">
                  <div className="font-mono text-[11px] text-rose-300 mb-1.5">
                    GATED / REMOVED · 架构级物理屏蔽
                  </div>
                  <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                    {modeInfo.removedTools.map((t) => (
                      <li key={t}>- {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Lazy MCP Overhead Bar */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300 tabular-nums">
                  挂载 MCP Server 数量：{mcpCount} 个
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={mcpCount}
                    onChange={(e) => setMcpCount(Number(e.target.value))}
                    onKeyDown={stopRevealKey}
                    className="w-24 accent-gemini-cyan cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setLazyMcp((v) => !v)}
                    onKeyDown={stopRevealKey}
                    className={`px-2.5 py-1 rounded text-[11px] cursor-pointer whitespace-nowrap ${
                      lazyMcp
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                    }`}
                  >
                    {lazyMcp ? "Lazy Discovery ON" : "Eager全量加载 OFF"}
                  </button>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-300 flex justify-between tabular-nums">
                <span>
                  启动阶段上下文预算占用：{lazyMcpPct}% {lazyMcp ? "(仅索引摘要)" : "(全量 JSON Schema)"}
                </span>
                <span className={lazyMcp ? "text-emerald-400" : "text-rose-400"}>
                  {lazyMcp ? "节省 ~36% 首轮预算" : "⚠ 接近论文实测 40% 浪费线"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Zone: Anti-Fadeout Reminders & 3-Nudge Error Recovery */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-1.5">
                  对抗长程遗忘：系统提醒注入策略（30 轮后）
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setReminderRole("system_top")}
                    onKeyDown={stopRevealKey}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono cursor-pointer ${
                      reminderRole === "system_top"
                        ? "bg-rose-500/25 text-rose-200 border border-rose-400/40"
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}
                  >
                    顶部 System Prompt
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderRole("user_recency")}
                    onKeyDown={stopRevealKey}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-mono cursor-pointer ${
                      reminderRole === "user_recency"
                        ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40"
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}
                  >
                    事件级 role: user 提醒
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                {reminderRole === "system_top" ? (
                  <div className="space-y-1.5 text-slate-300">
                    <div className="font-mono text-[11px] text-rose-300">
                      STATUS: FADED OUT (30+ TOOL CALLS)
                    </div>
                    <p className="leading-relaxed">
                      指令被 30 轮工具返回埋在最顶部，模型注意力衰减；若每轮机械重复又会被当成背景噪音忽略。
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-slate-200">
                    <div className="font-mono text-[11px] text-emerald-300">
                      STATUS: HIGH SALIENCE AT DECISION POINT
                    </div>
                    <p className="leading-relaxed">
                      论文实测：仅在关键事件触发时（且限制频率上限），以 <code className="text-gemini-cyan">role: user</code> 在最高近因位置注入简短提醒，遵守率远高于顶部 System Prompt。
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-mono text-gemini-purple">
                  CONTEXT-INJECTED ERROR RECOVERY · 3-NUDGE 上限
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  把报错分 6 类（权限 / 找不到文件 / 编辑失配 / 语法 / 限流 / 超时）匹配外部纯文本恢复模板实时注入；同一错误连续 3 次尝试失败即停手求助人类，杜绝死循环烧 Token。
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/25 text-[11px] text-slate-200 leading-relaxed">
              对应本课程 M5 DoD 铁律：同一校验脚本失败 3 次后强制退回 Cursor Plan 模式重新审视架构。
            </div>
          </div>
        </div>
      )}

      {activeView === "blueprint" && (
        <div className="grid grid-cols-12 gap-4 h-[435px]">
          {/* Switcher + Summary */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-3">
              <div className="text-xs font-mono text-gemini-cyan">
                HOW ARXIV:2603.05344 UPGRADES OUR STACK
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">
                用《Building Effective AI Coding Agents》构建「课程内容 + 课程系统」双闭环
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                论文的核心论断是：可靠的自主编程 Agent 本质上是<strong className="text-white">“脚手架、Harness 与上下文工程”问题</strong>，而非单纯堆大模型参数。这恰好给了我们升级课程与课件平台的两条明确路线。
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBlueprintSide("curriculum")}
                  onKeyDown={stopRevealKey}
                  className={`py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    blueprintSide === "curriculum"
                      ? "bg-gemini-cyan text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  ① 如何改建课程内容
                </button>
                <button
                  type="button"
                  onClick={() => setBlueprintSide("platform")}
                  onKeyDown={stopRevealKey}
                  className={`py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    blueprintSide === "platform"
                      ? "bg-gemini-purple text-white font-semibold"
                      : "bg-white/5 text-slate-300 hover:bg-white/15 border border-white/10"
                  }`}
                >
                  ② 如何升级课程系统
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
              已同步收录进 M8 Lab 05 知识库（第 74 号文献），可直接勾选生成任意模块讲义或 .mdc 规则。
            </div>
          </div>

          {/* Right Zone: Concrete Action Matrix */}
          <div
            onWheel={stopRevealWheel}
            className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 overflow-y-auto space-y-2.5"
          >
            {blueprintSide === "curriculum" ? (
              <>
                <div className="text-xs font-mono text-gemini-cyan">
                  CURRICULUM REDESIGN · 论文核心概念映射至 M1–M6 实操课纲
                </div>
                {[
                  {
                    mod: "M1/M4 · Scaffolding & Schema Gating",
                    detail:
                      "用论文“Make unsafe tools invisible”原则解释 Cursor Plan Mode 与 AGENTS.md：为什么只靠口头 Prompt 禁止乱改文件会失效，必须物理隔离写工具与分阶段确认。",
                  },
                  {
                    mod: "M2 · 上下文预算与 ACC 5 阶压缩",
                    detail:
                      "引入实证数据（工具结果占 70–80% 预算、30 轮后指令衰减）：教独立开发者按 70%/80%/85% 阶段做日志截断、@Files 瘦身与 /summarize，减少 54% 峰值上下文崩溃。",
                  },
                  {
                    mod: "M4 · Lazy MCP 按需发现 & 二阶段 Skill",
                    detail:
                      "全量加载 MCP 吃掉 40% 启动预算：课程实操把“全局开关所有 MCP”改为项目级 .cursor/mcp.json 精简索引 + SKILL.md 按需唤醒（<5% 启动占用）。",
                  },
                  {
                    mod: "M5 · 3-Nudge 错误模板注入 & DoD 熔断",
                    detail:
                      "吸收 Context-Injected Error Recovery：教用户在规则里写明“常见报错恢复指引 + 连续失败 3 次即中止退回 Plan”，终结 Agent 无限改错死循环。",
                  },
                  {
                    mod: "M6 · CLI Sandbox + Shadow Git 可逆护栏",
                    detail:
                      "结合 OpenDev 6 步 Shell 安全门与终端级 Agent 演进趋势，补齐 Cursor CLI Headless 自动化与操作日志快照回滚规范。",
                  },
                ].map((item) => (
                  <div key={item.mod} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs font-bold text-white mb-1">{item.mod}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="text-xs font-mono text-gemini-purple">
                  COURSE PLATFORM ARCHITECTURE · 把本课件平台改造成真正的 Learning Harness
                </div>
                {[
                  {
                    layer: "1. 知识库与备课引擎增加 ACC 压缩预算（Token Budget）",
                    detail:
                      "当学员在 Lab 05 选定多本专著/论文调用 /api/kb/synthesize 时，按 Artifact Index + 摘要指针拼接精选上下文，避免长书评直接塞满模型窗口。",
                  },
                  {
                    layer: "2. 交互式 Rules/Bugbot 沙盘引入 3-Nudge 恢复模板",
                    detail:
                      "把 Bugbot 报错从冷冰冰的错误提示，升级成论文式 6 类错误分类 + 可操作恢复指令（例如直接输出 Cursor Fix 模板并限制重试次数）。",
                  },
                  {
                    layer: "3. Workload-Optimized 多模型路由（express /api/*）",
                    detail:
                      "对齐论文“按工作负载路由模型”：轻量讲义合成、Rules 校验走高速模型（gemini-4-hydrogen），复杂多文件架构审查按需切入深度推理模型。",
                  },
                  {
                    layer: "4. Dual-Memory 学情记忆 + Artifact Index 持久化",
                    detail:
                      "为学员保存跨章节练习轨迹（改写了哪些 .mdc、通过了哪几关 Quiz、做过哪套实验），用周期性再生摘要防止长期学习路径跑偏。",
                  },
                  {
                    layer: "5. 惰性加载实验组件 & 离线 Stale-While-Revalidate",
                    detail:
                      "延续课程 74 册知识库 + 离线模板引擎设计，即便无外网/无 Key 也能 100% 离线演练 Rules、MCP、Bugbot 与 ACC 沙盘。",
                  },
                ].map((item) => (
                  <div key={item.layer} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-xs font-bold text-white mb-1">{item.layer}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
