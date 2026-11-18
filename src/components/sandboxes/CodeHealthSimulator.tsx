import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type ModeId = "inline" | "bg-raw" | "bg-guarded" | "manual";

interface ModeConfig {
  id: ModeId;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

const MODES: ModeConfig[] = [
  {
    id: "inline",
    label: "行内建议 (Tab / Inline)",
    shortLabel: "行内建议",
    color: "#4cddec",
    description: "单文件局部补全加速编码，但容易复制粘贴局部模式、缺乏跨模块重构视野。",
  },
  {
    id: "bg-raw",
    label: "后台 Agent（无门禁直出）",
    shortLabel: "后台 Agent(无护栏)",
    color: "#fb7185",
    description: "异步并发生成海量 PR，短期迭代爆表，但死代码与耦合债务呈指数堆积。",
  },
  {
    id: "bg-guarded",
    label: "后台 Agent + Bugbot 闭环",
    shortLabel: "Agent + Bugbot",
    color: "#34d399",
    description: "契约 Plan + .mdc 边界 + Bugbot/SAST 自动清债，保持长期高迭代与低债务稳态。",
  },
  {
    id: "manual",
    label: "纯手工基准 (No AI)",
    shortLabel: "纯手工基线",
    color: "#94a3b8",
    description: "受限于手写样板速度，但人工心智模型稳定，债务增长平缓。",
  },
];

interface SprintPoint {
  sprint: number;
  debt: number;
  debtRate: number;
  velocity: number;
  cumulativeFeatures: number;
}

function buildCurvePath(
  points: { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  return points
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(" ");
}

export default function CodeHealthSimulator() {
  const [totalSprints, setTotalSprints] = useState<number>(12);
  const [reviewRigor, setReviewRigor] = useState<number>(55); // % of diffs genuinely reviewed
  const [autoRefactorRate, setAutoRefactorRate] = useState<number>(60); // % Bugbot + 7 Habits cleanup
  const [visibleModes, setVisibleModes] = useState<Record<ModeId, boolean>>({
    inline: true,
    "bg-raw": true,
    "bg-guarded": true,
    manual: true,
  });
  const [focusedMode, setFocusedMode] = useState<ModeId>("bg-guarded");
  const [inspectSprint, setInspectSprint] = useState<number>(10);

  const clampedInspectSprint = Math.min(inspectSprint, totalSprints);

  const toggleModeVisibility = (id: ModeId) => {
    setVisibleModes((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Ensure at least one curve remains visible
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
    setFocusedMode(id);
  };

  const resetParams = () => {
    setTotalSprints(12);
    setReviewRigor(55);
    setAutoRefactorRate(60);
    setVisibleModes({ inline: true, "bg-raw": true, "bg-guarded": true, manual: true });
    setFocusedMode("bg-guarded");
    setInspectSprint(10);
  };

  const simulation = useMemo(() => {
    const reviewFactor = reviewRigor / 100; // 0..1
    const cleanupFactor = autoRefactorRate / 100; // 0..1

    const series: Record<ModeId, SprintPoint[]> = {
      inline: [],
      "bg-raw": [],
      "bg-guarded": [],
      manual: [],
    };

    for (const mode of MODES) {
      let debt = 8;
      let cumulativeFeatures = 0;

      for (let s = 1; s <= totalSprints; s++) {
        let baseVelocity = 3.2;
        let baseDebtInflow = 4.0;

        if (mode.id === "inline") {
          baseVelocity = 5.4;
          // Inline suggestions accumulate duplicate boilerplate unless reviewed carefully
          baseDebtInflow = 9.2 - reviewFactor * 3.8 - cleanupFactor * 1.4;
        } else if (mode.id === "bg-raw") {
          baseVelocity = 7.9;
          // Unbounded async agent PR bursts generate steep debt unless human review blocks bad PRs
          baseDebtInflow = 15.8 - reviewFactor * 4.2;
        } else if (mode.id === "bg-guarded") {
          baseVelocity = 6.9 + cleanupFactor * 0.7;
          // Guardrails + Bugbot continuously repay debt
          baseDebtInflow = 4.6 - reviewFactor * 1.8 - cleanupFactor * 2.4;
        } else {
          baseVelocity = 3.2 + reviewFactor * 0.2;
          baseDebtInflow = 3.6 - reviewFactor * 1.1;
        }

        // Compounding debt interest slows down feature iteration velocity
        const debtDrag =
          debt > 25 ? Math.pow((debt - 25) / 22, 1.38) * 1.65 : 0;
        const effectiveVelocity = Math.max(
          1.1,
          Number((baseVelocity - debtDrag).toFixed(2))
        );

        // High debt also causes emergency hotfix debt compounding
        const compoundDebt = debt > 50 ? (debt - 50) * 0.12 : 0;
        const netDebtDelta = Math.max(-2.5, baseDebtInflow + compoundDebt);
        const nextDebt = Math.max(4, Math.min(100, Number((debt + netDebtDelta).toFixed(1))));

        cumulativeFeatures = Number((cumulativeFeatures + effectiveVelocity).toFixed(1));

        series[mode.id].push({
          sprint: s,
          debt: nextDebt,
          debtRate: Number((nextDebt - debt).toFixed(1)),
          velocity: effectiveVelocity,
          cumulativeFeatures,
        });

        debt = nextDebt;
      }
    }

    // Crossover sprint: first sprint where bg-raw velocity drops below bg-guarded (or inline drops below guarded)
    const rawArr = series["bg-raw"];
    const guardedArr = series["bg-guarded"];
    const crossoverSprint =
      rawArr.find((pt, idx) => pt.velocity < (guardedArr[idx]?.velocity ?? 99))?.sprint ??
      null;

    return { series, crossoverSprint };
  }, [totalSprints, reviewRigor, autoRefactorRate]);

  // SVG Geometry shared for Debt Chart & Velocity Chart
  const svgW = 460;
  const svgH = 195;
  const pad = { top: 16, right: 16, bottom: 26, left: 36 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const xForSprint = (s: number) =>
    pad.left + ((s - 1) / Math.max(1, totalSprints - 1)) * plotW;

  const yForDebt = (debt: number) =>
    pad.top + (1 - Math.max(0, Math.min(100, debt)) / 100) * plotH;

  const maxVel = 9;
  const yForVel = (vel: number) =>
    pad.top + (1 - Math.max(0, Math.min(maxVel, vel)) / maxVel) * plotH;

  const inspectX = xForSprint(clampedInspectSprint);
  const cliffY = yForDebt(65); // 70% Cliff Debt Threshold (65 pt)

  const focusedStats =
    simulation.series[focusedMode][clampedInspectSprint - 1] ??
    simulation.series[focusedMode][0];
  const focusedMeta = MODES.find((m) => m.id === focusedMode) ?? MODES[2];

  const inlineEnd = simulation.series.inline[totalSprints - 1];
  const rawEnd = simulation.series["bg-raw"][totalSprints - 1];
  const guardedEnd = simulation.series["bg-guarded"][totalSprints - 1];

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-purple tracking-wide">
            Module 6 · Code Health Simulator · 技术债堆积速度 vs 功能迭代频率
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Code Health Simulator：行内建议 vs 后台 Agent 的长期演化曲线
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {MODES.map((m) => {
            const visible = visibleModes[m.id];
            const isFocus = focusedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModeVisibility(m.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  visible
                    ? isFocus
                      ? "bg-white/14 border-white/45 text-white font-semibold"
                      : "bg-white/6 border-white/15 text-slate-200 hover:bg-white/10"
                    : "bg-transparent border-white/8 text-slate-500 opacity-65"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: visible ? m.color : "#475569" }}
                />
                <span>{m.shortLabel}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={resetParams}
            className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-mono border border-white/12 bg-white/5 hover:bg-white/12 text-slate-200 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Main Two-Zone Sandbox Layout */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch text-xs">
        {/* Left 4 cols: Simulation Variable Sliders + Focused Curve Diagnostic */}
        <div className="col-span-4 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-gemini-cyan font-semibold flex items-center justify-between">
              <span>工程护栏与演化变量调节</span>
              <span className="text-slate-400 tabular-nums">{totalSprints} Sprints</span>
            </div>

            {/* Slider 1: Horizon */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">观察周期长度</span>
                <span className="text-gemini-cyan font-bold">{totalSprints} 个迭代</span>
              </div>
              <input
                type="range"
                min={6}
                max={16}
                step={1}
                value={totalSprints}
                onChange={(e) => setTotalSprints(Number(e.target.value))}
                className="w-full accent-[#4cddec] cursor-pointer"
              />
            </div>

            {/* Slider 2: Review Rigor */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">人类主编审校严格度 (Habit #1)</span>
                <span className="text-amber-300 font-bold">{reviewRigor}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={reviewRigor}
                onChange={(e) => setReviewRigor(Number(e.target.value))}
                className="w-full accent-[#fbbf24] cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                低于 40% 等同“盲目 Accept All”，大幅放大后台 Agent 债务堆积斜率。
              </div>
            </div>

            {/* Slider 3: Bugbot / Refactor Sweep */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">Bugbot &amp; SAST 自动清债率</span>
                <span className="text-emerald-300 font-bold">{autoRefactorRate}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={autoRefactorRate}
                onChange={(e) => setAutoRefactorRate(Number(e.target.value))}
                className="w-full accent-[#34d399] cursor-pointer"
              />
            </div>

            {/* Sprint Scrubber */}
            <div className="space-y-1 pt-2 border-t border-white/10">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">时间轴切片检查</span>
                <span className="text-white font-bold">Sprint {clampedInspectSprint}</span>
              </div>
              <input
                type="range"
                min={1}
                max={totalSprints}
                step={1}
                value={clampedInspectSprint}
                onChange={(e) => setInspectSprint(Number(e.target.value))}
                className="w-full accent-[#9b72cb] cursor-pointer"
              />
            </div>
          </div>

          {/* Focused Mode Live Snapshot */}
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[11px] font-bold"
                style={{ color: focusedMeta.color }}
              >
                {focusedMeta.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                @ Sprint {clampedInspectSprint}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-snug">
              {focusedMeta.description}
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono tabular-nums">
              <div className="p-1.5 rounded bg-black/45">
                <div className="text-[9px] text-slate-400">当前债务</div>
                <div className="text-xs font-bold text-white">{focusedStats.debt} pt</div>
              </div>
              <div className="p-1.5 rounded bg-black/45">
                <div className="text-[9px] text-slate-400">堆积速度</div>
                <div
                  className={`text-xs font-bold ${
                    focusedStats.debtRate <= 2
                      ? "text-emerald-300"
                      : focusedStats.debtRate <= 8
                      ? "text-gemini-cyan"
                      : "text-rose-300"
                  }`}
                >
                  {focusedStats.debtRate > 0 ? `+${focusedStats.debtRate}` : focusedStats.debtRate}
                </div>
              </div>
              <div className="p-1.5 rounded bg-black/45">
                <div className="text-[9px] text-slate-400">迭代频率</div>
                <div className="text-xs font-bold text-gemini-cyan">
                  {focusedStats.velocity}/轮
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 8 cols: Synchronized Dual Comparison Charts */}
        <div className="col-span-8 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Chart A: Technical Debt Accumulation */}
            <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-rose-300 font-semibold inline-flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>技术债累积速度曲线 (0–100 pt)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">越低越健康</span>
              </div>

              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-[175px] overflow-visible"
                role="img"
                aria-label="技术债累积速度对比曲线图"
              >
                {/* Y Grid Lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = yForDebt(val);
                  return (
                    <g key={val}>
                      <line
                        x1={pad.left}
                        y1={y}
                        x2={svgW - pad.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="1"
                      />
                      <text
                        x={pad.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* 70% Cliff Threshold Line */}
                <line
                  x1={pad.left}
                  y1={cliffY}
                  x2={svgW - pad.right}
                  y2={cliffY}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
                <text
                  x={svgW - pad.right - 2}
                  y={cliffY - 4}
                  textAnchor="end"
                  fill="#fbbf24"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  65pt 70% 困境失速线
                </text>

                {/* Active Scrubber Crosshair */}
                <line
                  x1={inspectX}
                  y1={pad.top}
                  x2={inspectX}
                  y2={svgH - pad.bottom}
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Curves */}
                {MODES.map((m) => {
                  if (!visibleModes[m.id]) return null;
                  const pts = simulation.series[m.id].map((p) => ({
                    x: xForSprint(p.sprint),
                    y: yForDebt(p.debt),
                  }));
                  const currPt = pts[clampedInspectSprint - 1];
                  return (
                    <g key={m.id}>
                      <path
                        d={buildCurvePath(pts)}
                        fill="none"
                        stroke={m.color}
                        strokeWidth={focusedMode === m.id ? 2.6 : 1.8}
                        opacity={focusedMode === m.id ? 1 : 0.78}
                      />
                      {currPt && (
                        <circle
                          cx={currPt.x}
                          cy={currPt.y}
                          r={focusedMode === m.id ? 4.5 : 3}
                          fill={m.color}
                          stroke="#040711"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                {[1, Math.ceil(totalSprints / 2), totalSprints].map((s) => (
                  <text
                    key={s}
                    x={xForSprint(s)}
                    y={svgH - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    S{s}
                  </text>
                ))}
              </svg>
            </div>

            {/* Chart B: Feature Iteration Frequency */}
            <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-emerald-300 font-semibold inline-flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span>功能迭代频率曲线 (Features / 轮)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">越高越可持续</span>
              </div>

              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-[175px] overflow-visible"
                role="img"
                aria-label="功能迭代频率演化对比曲线图"
              >
                {[0, 3, 6, 9].map((val) => {
                  const y = yForVel(val);
                  return (
                    <g key={val}>
                      <line
                        x1={pad.left}
                        y1={y}
                        x2={svgW - pad.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="1"
                      />
                      <text
                        x={pad.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Active Scrubber Crosshair */}
                <line
                  x1={inspectX}
                  y1={pad.top}
                  x2={inspectX}
                  y2={svgH - pad.bottom}
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Curves */}
                {MODES.map((m) => {
                  if (!visibleModes[m.id]) return null;
                  const pts = simulation.series[m.id].map((p) => ({
                    x: xForSprint(p.sprint),
                    y: yForVel(p.velocity),
                  }));
                  const currPt = pts[clampedInspectSprint - 1];
                  return (
                    <g key={m.id}>
                      <path
                        d={buildCurvePath(pts)}
                        fill="none"
                        stroke={m.color}
                        strokeWidth={focusedMode === m.id ? 2.6 : 1.8}
                        opacity={focusedMode === m.id ? 1 : 0.78}
                      />
                      {currPt && (
                        <circle
                          cx={currPt.x}
                          cy={currPt.y}
                          r={focusedMode === m.id ? 4.5 : 3}
                          fill={m.color}
                          stroke="#040711"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Labels */}
                {[1, Math.ceil(totalSprints / 2), totalSprints].map((s) => (
                  <text
                    key={s}
                    x={xForSprint(s)}
                    y={svgH - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    S{s}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Bottom Summary Comparison Cards (Tabular Numerals) */}
          <div className="grid grid-cols-3 gap-2.5 tabular-nums">
            <div className="p-3 rounded-xl bg-[#0b0f19] border border-gemini-cyan/30 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-mono text-gemini-cyan">
                <span className="inline-flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 shrink-0" />
                  <span>行内建议 (Tab/Inline)</span>
                </span>
                <span>期末 {totalSprints} 轮</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black font-mono text-white">
                  {inlineEnd.cumulativeFeatures} 功能
                </span>
                <span className="text-[11px] font-mono text-amber-300">
                  债务 {inlineEnd.debt} pt
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                单轮速率自第 5 轮起被局部复制代码缓慢拖累。
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-rose-400/35 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-mono text-rose-300">
                <span className="inline-flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                  <span>后台 Agent（无门禁）</span>
                </span>
                <span>
                  {simulation.crossoverSprint
                    ? `S${simulation.crossoverSprint} 失速反超`
                    : "高债务运行"}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black font-mono text-white">
                  {rawEnd.cumulativeFeatures} 功能
                </span>
                <span className="text-[11px] font-mono text-rose-300 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  债务 {rawEnd.debt} pt
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                早期极快，但堆满冗余 PR 后陷入修 Bug 泥潭。
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-emerald-400/35 space-y-1">
              <div className="flex items-center justify-between text-[10.5px] font-mono text-emerald-300">
                <span className="inline-flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 shrink-0" />
                  <span>Agent + Bugbot 闭环</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>稳态领先</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black font-mono text-emerald-300">
                  {guardedEnd.cumulativeFeatures} 功能
                </span>
                <span className="text-[11px] font-mono text-emerald-300 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  债务 {guardedEnd.debt} pt
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                凭借自动清债与门禁阻断，长期累计有效产出最高。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
