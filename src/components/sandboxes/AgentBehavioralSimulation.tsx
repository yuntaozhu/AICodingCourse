import { useMemo, useState } from "react";
import { Compass, Layers, ShieldAlert, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type StrategyId = "defensive" | "aggressive" | "blind-vibe" | "orchestrated";

interface RadarAxis {
  id: keyof StrategyScores;
  label: string;
  shortLabel: string;
  habitRef: string;
  description: string;
}

interface StrategyScores {
  velocity: number;
  simplicity: number;
  noStray: number;
  security: number;
  testRigor: number;
  accountability: number;
}

interface StrategyProfile {
  id: StrategyId;
  label: string;
  tag: string;
  summary: string;
  reworkRisk: string;
  decisionTakeaway: string;
  baseScores: StrategyScores;
}

const RADAR_AXES: RadarAxis[] = [
  {
    id: "velocity",
    label: "持续开发速度",
    shortLabel: "开发速度",
    habitRef: "Sustainable Speed",
    description: "扣除返工与调试阻塞后的净功能交付速度。",
  },
  {
    id: "simplicity",
    label: "低认知复杂度",
    shortLabel: "低复杂度 #3",
    habitRef: "Habit #3 · Keep It Simple",
    description: "函数职责单一性、浅层分支与圈复杂度控制能力。",
  },
  {
    id: "noStray",
    label: "零死代码残留",
    shortLabel: "零残留 #4",
    habitRef: "Habit #4 · No Stray Code",
    description: "无多余调试日志、僵尸函数、TODO 占位与空 catch。",
  },
  {
    id: "security",
    label: "SAST 安全抗性",
    shortLabel: "SAST 安全 #5",
    habitRef: "Habit #5 · Analyze Everything",
    description: "针对注入、并发竞态与权限越界的自动防御深度。",
  },
  {
    id: "testRigor",
    label: "测试真实度",
    shortLabel: "反作弊单测 #6",
    habitRef: "Habit #6 · Mandatory Tests",
    description: "边界覆盖与拦截 expect(true).toBe(true) / .skip 假绿灯。",
  },
  {
    id: "accountability",
    label: "人类可审校度",
    shortLabel: "主编主权 #1/#7",
    habitRef: "Habit #1 & #7 · Review",
    description: "Diff 可读性与 git blame 下的开发者完全掌控程度。",
  },
];

const STRATEGIES: StrategyProfile[] = [
  {
    id: "defensive",
    label: "防御性编程",
    tag: "DEFENSIVE",
    summary: "强调 Fail-Closed 边界、全面异常兜底与保守小步修改。",
    reworkRisk: "低（14%）",
    decisionTakeaway:
      "安全与可审校度极高，但若缺少 Agent 任务拆解与并行验证，容易因过度防御样板代码而拖慢功能迭代节奏。",
    baseScores: {
      velocity: 62,
      simplicity: 78,
      noStray: 80,
      security: 90,
      testRigor: 84,
      accountability: 88,
    },
  },
  {
    id: "aggressive",
    label: "激进重构",
    tag: "AGGRESSIVE",
    summary: "跨文件大跨度重写与高频抽象合并，优先追求短期架构升级与开发速度。",
    reworkRisk: "中高（46%）",
    decisionTakeaway:
      "初期代码变更推进极快，但大 Diff 易触发「Two Steps Back」连锁回归，且遗留死代码与高耦合 Review 堵点明显增加。",
    baseScores: {
      velocity: 88,
      simplicity: 52,
      noStray: 46,
      security: 54,
      testRigor: 48,
      accountability: 42,
    },
  },
  {
    id: "blind-vibe",
    label: "无约束 Vibe 直出",
    tag: "UNCONSTRAINED",
    summary: "单句自然语言直接 Accept All，跳过上下文裁剪、DoD 与 Bugbot。",
    reworkRisk: "极高（72%）",
    decisionTakeaway:
      "首屏生成速度看似拉满，但实际进入第 70% 集成期后，隐藏的静默错误、Test Reward Hacking 与盲贴代码会导致返工雪崩。",
    baseScores: {
      velocity: 74,
      simplicity: 36,
      noStray: 28,
      security: 30,
      testRigor: 24,
      accountability: 22,
    },
  },
  {
    id: "orchestrated",
    label: "7 Habits 编排策略",
    tag: "ORCHESTRATED",
    summary: "结合 Plan 契约、上下文剪枝、Bugbot/SAST 自动拦截与小步主编签核。",
    reworkRisk: "极低（8%）",
    decisionTakeaway:
      "Agent Orchestration 的核心价值：不是用速度换质量，而是通过上游契约与自动化门禁同时拉升可持续交付速度与代码质量。",
    baseScores: {
      velocity: 90,
      simplicity: 88,
      noStray: 92,
      security: 91,
      testRigor: 89,
      accountability: 92,
    },
  },
];

function clampScore(n: number): number {
  return Math.max(15, Math.min(98, Math.round(n)));
}

export default function AgentBehavioralSimulation() {
  const [primaryId, setPrimaryId] = useState<StrategyId>("defensive");
  const [compareId, setCompareId] = useState<StrategyId>("orchestrated");
  const [showCompareOverlay, setShowCompareOverlay] = useState<boolean>(true);
  const [enableContextGuard, setEnableContextGuard] = useState<boolean>(false);
  const [enableBugbotGate, setEnableBugbotGate] = useState<boolean>(false);
  const [enableSmallDiffCap, setEnableSmallDiffCap] = useState<boolean>(false);
  const [focusedAxisId, setFocusedAxisId] = useState<keyof StrategyScores>("velocity");

  const primaryProfile = STRATEGIES.find((s) => s.id === primaryId) ?? STRATEGIES[0];
  const compareProfile = STRATEGIES.find((s) => s.id === compareId) ?? STRATEGIES[3];

  const simulatedScores = useMemo<StrategyScores>(() => {
    const base = primaryProfile.baseScores;
    // Apply interactive orchestration guardrails dynamically (smaller marginal boost if already orchestrated)
    const isAlreadyOrchestrated = primaryProfile.id === "orchestrated";
    const scale = isAlreadyOrchestrated ? 0.25 : 1;

    return {
      velocity: clampScore(
        base.velocity +
          (enableContextGuard ? 8 * scale : 0) +
          (enableBugbotGate ? 5 * scale : 0) +
          (enableSmallDiffCap ? 4 * scale : 0)
      ),
      simplicity: clampScore(
        base.simplicity +
          (enableContextGuard ? 10 * scale : 0) +
          (enableSmallDiffCap ? 12 * scale : 0)
      ),
      noStray: clampScore(
        base.noStray +
          (enableBugbotGate ? 18 * scale : 0) +
          (enableSmallDiffCap ? 8 * scale : 0)
      ),
      security: clampScore(
        base.security +
          (enableBugbotGate ? 20 * scale : 0) +
          (enableContextGuard ? 6 * scale : 0)
      ),
      testRigor: clampScore(
        base.testRigor +
          (enableBugbotGate ? 16 * scale : 0) +
          (enableContextGuard ? 8 * scale : 0)
      ),
      accountability: clampScore(
        base.accountability +
          (enableSmallDiffCap ? 18 * scale : 0) +
          (enableContextGuard ? 7 * scale : 0)
      ),
    };
  }, [primaryProfile, enableContextGuard, enableBugbotGate, enableSmallDiffCap]);

  const compareScores = compareProfile.baseScores;

  const summaryMetrics = useMemo(() => {
    const qualityAvg = Math.round(
      (simulatedScores.simplicity +
        simulatedScores.noStray +
        simulatedScores.security +
        simulatedScores.testRigor +
        simulatedScores.accountability) /
        5
    );
    const speedScore = simulatedScores.velocity;
    const compareQualityAvg = Math.round(
      (compareScores.simplicity +
        compareScores.noStray +
        compareScores.security +
        compareScores.testRigor +
        compareScores.accountability) /
        5
    );
    const qualityGap = compareQualityAvg - qualityAvg;
    const speedGap = compareScores.velocity - speedScore;

    return {
      qualityAvg,
      speedScore,
      compareQualityAvg,
      qualityGap,
      speedGap,
    };
  }, [simulatedScores, compareScores]);

  // SVG Radar geometry
  const size = 290;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 96;

  const getPolygonPoints = (scores: StrategyScores) =>
    RADAR_AXES.map((axis, idx) => {
      const angle = (-Math.PI / 2) + (idx * 2 * Math.PI) / RADAR_AXES.length;
      const r = (scores[axis.id] / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x, y, axis, score: scores[axis.id], angle };
    });

  const primaryPoints = getPolygonPoints(simulatedScores);
  const comparePoints = getPolygonPoints(compareScores);

  const toPointString = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const focusedAxis = RADAR_AXES.find((a) => a.id === focusedAxisId) ?? RADAR_AXES[0];

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-purple tracking-wider uppercase">
            MODULE 9 · AGENT BEHAVIORAL SIMULATION · 架构策略雷达推演
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Agent Behavioral Simulation：架构策略对 7 Habits 代码质量与速度的影响
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STRATEGIES.map((strat) => {
            const active = strat.id === primaryId;
            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => setPrimaryId(strat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {strat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Col Body */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 6 cols: Interactive Radar Chart + Guardrail Simulation Toggles */}
        <div className="col-span-6 p-4 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-gemini-cyan inline-flex items-center gap-1.5 text-[11px]">
              <Compass className="w-3.5 h-3.5" />
              <span>6 维行为雷达图（点击顶点查看 Sonar Habit 指标）</span>
            </span>

            <button
              type="button"
              onClick={() => setShowCompareOverlay((prev) => !prev)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showCompareOverlay
                  ? "bg-gemini-purple/20 border-gemini-purple/50 text-purple-200"
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              {showCompareOverlay ? `叠加对比：${compareProfile.label}` : "开启策略叠加对比"}
            </button>
          </div>

          {/* SVG Radar Chart */}
          <div className="flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full max-w-[300px] h-[250px] overflow-visible"
              role="img"
              aria-label="Agent 架构策略 6 维雷达图"
            >
              {/* Concentric rings */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const ringPts = RADAR_AXES.map((_, idx) => {
                  const angle = (-Math.PI / 2) + (idx * 2 * Math.PI) / RADAR_AXES.length;
                  const r = ratio * maxR;
                  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
                });
                return (
                  <polygon
                    key={ratio}
                    points={toPointString(ringPts)}
                    fill="none"
                    stroke="rgba(255,255,255,0.09)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radial axis lines & outer labels */}
              {RADAR_AXES.map((axis, idx) => {
                const angle = (-Math.PI / 2) + (idx * 2 * Math.PI) / RADAR_AXES.length;
                const x2 = cx + maxR * Math.cos(angle);
                const y2 = cy + maxR * Math.sin(angle);
                const lx = cx + (maxR + 24) * Math.cos(angle);
                const ly = cy + (maxR + 18) * Math.sin(angle);
                const isFocused = axis.id === focusedAxisId;

                return (
                  <g
                    key={axis.id}
                    className="cursor-pointer"
                    onClick={() => setFocusedAxisId(axis.id)}
                  >
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x2}
                      y2={y2}
                      stroke={isFocused ? "rgba(76,221,236,0.55)" : "rgba(255,255,255,0.12)"}
                      strokeWidth={isFocused ? "1.5" : "1"}
                    />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={
                        Math.abs(Math.cos(angle)) < 0.2
                          ? "middle"
                          : Math.cos(angle) > 0
                          ? "start"
                          : "end"
                      }
                      dominantBaseline="middle"
                      fill={isFocused ? "#4cddec" : "#cbd5e1"}
                      fontSize="9.5"
                      fontFamily="monospace"
                      fontWeight={isFocused ? "700" : "500"}
                    >
                      {axis.shortLabel}
                    </text>
                  </g>
                );
              })}

              {/* Comparison Overlay Polygon */}
              {showCompareOverlay && (
                <polygon
                  points={toPointString(comparePoints)}
                  fill="rgba(155, 114, 203, 0.14)"
                  stroke="#9b72cb"
                  strokeWidth="1.75"
                  strokeDasharray="4 3"
                />
              )}

              {/* Primary Strategy Polygon */}
              <polygon
                points={toPointString(primaryPoints)}
                fill="rgba(76, 221, 236, 0.22)"
                stroke="#4cddec"
                strokeWidth="2.2"
              />

              {/* Interactive Vertices */}
              {primaryPoints.map((pt) => {
                const isFocused = pt.axis.id === focusedAxisId;
                return (
                  <circle
                    key={pt.axis.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={isFocused ? 5 : 3.5}
                    fill={isFocused ? "#ffffff" : "#4cddec"}
                    stroke="#040711"
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => setFocusedAxisId(pt.axis.id)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Interactive Guardrail Modifiers */}
          <div className="pt-2.5 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>叠加编排护栏实验（观察雷达包络扩张效果）：</span>
              <span className="text-gemini-purple">Live Simulation</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEnableContextGuard((prev) => !prev)}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  enableContextGuard
                    ? "bg-gemini-cyan/15 border-gemini-cyan/55 text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-semibold">
                  {enableContextGuard ? "✓ " : "+ "}上下文剪枝 (.mdc)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEnableBugbotGate((prev) => !prev)}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  enableBugbotGate
                    ? "bg-emerald-500/15 border-emerald-400/55 text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-semibold">
                  {enableBugbotGate ? "✓ " : "+ "}Bugbot + SAST
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEnableSmallDiffCap((prev) => !prev)}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  enableSmallDiffCap
                    ? "bg-gemini-purple/20 border-gemini-purple/55 text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-semibold">
                  {enableSmallDiffCap ? "✓ " : "+ "}Diff &lt;150 行上限
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 6 cols: Strategy Profile + Quality vs Speed Analysis + Orchestration Value */}
        <div className="col-span-6 flex flex-col gap-3">
          {/* Strategy Summary & Score Cards */}
          <div className="p-3.5 rounded-xl bg-white/[0.035] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-gemini-cyan">{primaryProfile.tag}</div>
                <h3 className="text-base font-bold text-white">{primaryProfile.label}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="text-slate-400">对照曲线:</span>
                <select
                  value={compareId}
                  onChange={(e) => setCompareId(e.target.value as StrategyId)}
                  onKeyDown={stopRevealKey}
                  aria-label="选择对比策略"
                  className="rounded-lg bg-black/60 border border-white/15 px-2 py-1 text-[11px] text-purple-200 focus:outline-none focus:border-gemini-purple"
                >
                  {STRATEGIES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0b0f19]">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">{primaryProfile.summary}</p>

            {/* Quality vs Speed KPI Strip */}
            <div className="grid grid-cols-3 gap-2 tabular-nums">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/8">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>7 Habits 质量均分</span>
                </div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {summaryMetrics.qualityAvg}
                  <span className="text-[10px] text-slate-500 font-normal"> / 100</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/8">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-gemini-cyan" />
                  <span>持续开发速度</span>
                </div>
                <div className="text-xl font-black font-mono text-gemini-cyan mt-0.5">
                  {summaryMetrics.speedScore}
                  <span className="text-[10px] text-slate-500 font-normal"> / 100</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/8">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-300" />
                  <span>70% 困境返工率</span>
                </div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-1.5">
                  {primaryProfile.reworkRisk}
                </div>
              </div>
            </div>
          </div>

          {/* Focused Axis Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-gemini-purple font-semibold">
                聚焦维度：{focusedAxis.label}（{focusedAxis.habitRef}）
              </span>
              <span className="text-xs font-mono tabular-nums text-white font-bold">
                {simulatedScores[focusedAxis.id]}
                {showCompareOverlay && (
                  <span className="text-purple-300 font-normal ml-1.5">
                    vs 对照 {compareScores[focusedAxis.id]}
                  </span>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{focusedAxis.description}</p>

            {/* Compact 6-Axis Score Bars */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1 tabular-nums">
              {RADAR_AXES.map((axis) => {
                const val = simulatedScores[axis.id];
                const cmp = compareScores[axis.id];
                return (
                  <button
                    key={axis.id}
                    type="button"
                    onClick={() => setFocusedAxisId(axis.id)}
                    className={`text-left p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      axis.id === focusedAxisId
                        ? "bg-white/[0.06] border-gemini-cyan/45"
                        : "bg-transparent border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-slate-300 truncate">{axis.shortLabel}</span>
                      <span className="text-white font-semibold">
                        {val}
                        {showCompareOverlay ? ` / ${cmp}` : ""}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gemini-cyan rounded-full transition-all duration-300"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Orchestration Decision Value Callout */}
          <div className="flex-1 p-3.5 rounded-xl bg-gemini-purple/10 border border-gemini-purple/35 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-gemini-purple font-semibold inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Agent Orchestration 决策价值洞察</span>
              </span>
              {showCompareOverlay && primaryId !== compareId && (
                <span className="text-[10px] font-mono text-slate-300 tabular-nums inline-flex items-center gap-1">
                  <Layers className="w-3 h-3 text-gemini-cyan" />
                  对比差值：质量 {summaryMetrics.qualityGap >= 0 ? `+${summaryMetrics.qualityGap}` : summaryMetrics.qualityGap} · 速度{" "}
                  {summaryMetrics.speedGap >= 0 ? `+${summaryMetrics.speedGap}` : summaryMetrics.speedGap}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              {primaryProfile.decisionTakeaway}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
