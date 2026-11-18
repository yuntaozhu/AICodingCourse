import { useEffect, useMemo, useState } from "react";
import { Activity, Pause, Play, RotateCcw, SlidersHorizontal, Zap } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type ChangeComplexity = "ui" | "fullstack" | "core";

interface HabitsMetricsState {
  contextDocPct: number; // Habit #2
  cleanCodePct: number; // Habit #3 & #4
  bugbotSastPct: number; // Habit #5
  testRigorPct: number; // Habit #6
}

const COMPLEXITY_CONFIGS: Record<
  ChangeComplexity,
  { label: string; baseLeadHours: number; baseMttrHours: number }
> = {
  ui: { label: "轻量 UI/交互变更", baseLeadHours: 10, baseMttrHours: 4.5 },
  fullstack: { label: "跨模块全栈需求", baseLeadHours: 22, baseMttrHours: 9.5 },
  core: { label: "高并发核心链路", baseLeadHours: 36, baseMttrHours: 15.0 },
};

const DEFAULT_HABITS: HabitsMetricsState = {
  contextDocPct: 85,
  cleanCodePct: 82,
  bugbotSastPct: 88,
  testRigorPct: 84,
};

const HABIT_PRESETS: { id: string; label: string; state: HabitsMetricsState }[] = [
  {
    id: "vibe-chaos",
    label: "低 7 Habits（盲目 Vibe）",
    state: { contextDocPct: 20, cleanCodePct: 25, bugbotSastPct: 15, testRigorPct: 20 },
  },
  {
    id: "partial-ai",
    label: "过渡期（半工程化）",
    state: { contextDocPct: 55, cleanCodePct: 52, bugbotSastPct: 48, testRigorPct: 50 },
  },
  {
    id: "ai-first-full",
    label: "高 7 Habits（AI-First 复利）",
    state: DEFAULT_HABITS,
  },
];

const TOTAL_SPRINTS = 12;

export default function WorkflowEvolutionChartSandbox() {
  const [complexity, setComplexity] = useState<ChangeComplexity>("fullstack");
  const [habits, setHabits] = useState<HabitsMetricsState>({ ...DEFAULT_HABITS });
  const [currentSprint, setCurrentSprint] = useState<number>(8);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setCurrentSprint((prev) => {
        if (prev >= TOTAL_SPRINTS) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const updateHabit = <K extends keyof HabitsMetricsState>(key: K, value: number) => {
    setHabits((prev) => ({ ...prev, [key]: value }));
  };

  const handleTogglePlay = () => {
    if (currentSprint >= TOTAL_SPRINTS) {
      setCurrentSprint(1);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentSprint(1);
    setHabits({ ...DEFAULT_HABITS });
    setComplexity("fullstack");
  };

  const simulation = useMemo(() => {
    const cfg = COMPLEXITY_CONFIGS[complexity];
    const habitIndex =
      (habits.contextDocPct * 0.27 +
        habits.cleanCodePct * 0.25 +
        habits.bugbotSastPct * 0.24 +
        habits.testRigorPct * 0.24) /
      100;

    const points = Array.from({ length: TOTAL_SPRINTS }, (_, idx) => {
      const sprint = idx + 1;
      const progress = (sprint - 1) / (TOTAL_SPRINTS - 1);

      // Traditional development: gradually slows down as tech debt & coordination overhead accumulate
      const tradLead = Number(
        (cfg.baseLeadHours * (1 + 0.42 * progress)).toFixed(1)
      );
      const tradMttr = Number(
        (cfg.baseMttrHours * (1 + 0.48 * progress)).toFixed(1)
      );

      // Unconstrained AI (low 7 Habits baseline for reference): fast in W1-W3, spikes after W4 ("70% Problem")
      const vibeSpike = sprint <= 3 ? 0.58 : 0.58 + Math.pow((sprint - 3) / 9, 1.35) * 0.88;
      const vibeLead = Number((cfg.baseLeadHours * vibeSpike).toFixed(1));
      const vibeMttr = Number(
        (cfg.baseMttrHours * (sprint <= 3 ? 0.65 : 0.65 + ((sprint - 3) / 9) * 0.95)).toFixed(1)
      );

      // AI-First driven by user's 7 Habits sliders:
      // Low habitIndex causes drift over sprints; high habitIndex compounds .mdc & test assets downward
      const onboardingPenalty = sprint === 1 ? 0.12 : sprint === 2 ? 0.05 : 0;
      const compoundingGain = habitIndex * 0.62 * progress;
      const chaosDrift = (1 - habitIndex) * 0.72 * Math.pow(progress, 1.2);
      const aiFactorLead = Math.max(
        0.16,
        0.64 + onboardingPenalty - compoundingGain + chaosDrift
      );
      const aiFactorMttr = Math.max(
        0.12,
        0.58 + onboardingPenalty * 0.8 - habitIndex * 0.48 * progress + (1 - habitIndex) * 0.68 * progress
      );

      const aiLead = Number((cfg.baseLeadHours * aiFactorLead).toFixed(1));
      const aiMttr = Number((cfg.baseMttrHours * aiFactorMttr).toFixed(1));

      return {
        sprint,
        tradLead,
        vibeLead,
        aiLead,
        tradMttr,
        vibeMttr,
        aiMttr,
      };
    });

    const maxLead = Math.max(
      12,
      ...points.map((p) => Math.max(p.tradLead, p.vibeLead, p.aiLead))
    );
    const maxMttr = Math.max(
      6,
      ...points.map((p) => Math.max(p.tradMttr, p.vibeMttr, p.aiMttr))
    );

    const activePoint = points[currentSprint - 1] ?? points[0];
    const speedupRatio = Number((activePoint.tradLead / Math.max(0.5, activePoint.aiLead)).toFixed(1));
    const mttrCompressionPct = Math.round(
      ((activePoint.tradMttr - activePoint.aiMttr) / activePoint.tradMttr) * 100
    );

    return {
      points,
      maxLead,
      maxMttr,
      activePoint,
      speedupRatio,
      mttrCompressionPct,
      habitScore: Math.round(habitIndex * 100),
    };
  }, [complexity, habits, currentSprint]);

  // SVG Chart helper
  const svgW = 360;
  const svgH = 152;
  const padL = 28;
  const padR = 12;
  const padT = 14;
  const padB = 22;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getCoord = (idx: number, val: number, maxVal: number) => {
    const x = padL + (idx / (TOTAL_SPRINTS - 1)) * plotW;
    const y = padT + plotH - (val / maxVal) * plotH;
    return { x, y };
  };

  const buildPath = (
    getter: (pt: (typeof simulation.points)[number]) => number,
    maxVal: number,
    limitSprint: number
  ) => {
    return simulation.points
      .slice(0, limitSprint)
      .map((pt, idx) => {
        const { x, y } = getCoord(idx, getter(pt), maxVal);
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const activeX = padL + ((currentSprint - 1) / (TOTAL_SPRINTS - 1)) * plotW;

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wider uppercase">
            MODULE 7 · 7 HABITS WORKFLOW EVOLUTION SIMULATOR
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            传统开发 vs AI-First 研发流程：需求变更响应与 Bug 修复周期演化图
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {HABIT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setHabits({ ...preset.state })}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-white/12 text-slate-200 border border-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-white/12 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Sprint Timeline & Complexity Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">需求复杂度:</span>
          {(Object.keys(COMPLEXITY_CONFIGS) as ChangeComplexity[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setComplexity(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                complexity === key
                  ? "bg-gemini-purple/25 border-gemini-purple text-white font-semibold"
                  : "bg-black/40 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {COMPLEXITY_CONFIGS[key].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isPlaying
                ? "bg-amber-400/20 border-amber-400/45 text-amber-200"
                : "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? "暂停演化" : "实时演化演示"}</span>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-[160px] tabular-nums">
            <span className="text-[11px] font-mono text-gemini-cyan whitespace-nowrap shrink-0">
              Sprint {currentSprint}/{TOTAL_SPRINTS}
            </span>
            <input
              type="range"
              min={1}
              max={TOTAL_SPRINTS}
              value={currentSprint}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentSprint(Number(e.target.value));
              }}
              aria-label="演化周期 Sprint"
              className="w-full accent-[#4cddec] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main 12-Col Body */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 4 cols: 7 Habits Practice Metrics Controls + Live Summary */}
        <div className="col-span-4 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-gemini-cyan inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>7 Habits 实践指标调节</span>
              </span>
              <span className="text-white font-bold tabular-nums">
                综合指数 {simulation.habitScore}/100
              </span>
            </div>

            <div className="space-y-2.5 tabular-nums">
              {[
                {
                  key: "contextDocPct" as const,
                  label: "Habit #2 · 上下文文档化 (.mdc / AGENTS)",
                  val: habits.contextDocPct,
                  accent: "accent-[#4cddec]",
                  textColor: "text-gemini-cyan",
                },
                {
                  key: "cleanCodePct" as const,
                  label: "Habit #3/#4 · 低复杂度 & 零残留代码",
                  val: habits.cleanCodePct,
                  accent: "accent-[#9b72cb]",
                  textColor: "text-gemini-purple",
                },
                {
                  key: "bugbotSastPct" as const,
                  label: "Habit #5 · Bugbot + SAST 自动拦截",
                  val: habits.bugbotSastPct,
                  accent: "accent-[#34d399]",
                  textColor: "text-emerald-400",
                },
                {
                  key: "testRigorPct" as const,
                  label: "Habit #6 · 独立单测反作弊严格度",
                  val: habits.testRigorPct,
                  accent: "accent-[#fbbf24]",
                  textColor: "text-amber-300",
                },
              ].map((slider) => (
                <div key={slider.key}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-300 truncate">{slider.label}</span>
                    <span className={`font-mono font-bold shrink-0 ${slider.textColor}`}>
                      {slider.val}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={slider.val}
                    onChange={(e) => updateHabit(slider.key, Number(e.target.value))}
                    className={`w-full cursor-pointer ${slider.accent}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Sprint Delta Telemetry */}
          <div className="flex-1 p-3.5 rounded-xl bg-white/[0.035] border border-white/10 flex flex-col justify-between gap-2 tabular-nums">
            <div className="text-[11px] font-mono text-slate-400">
              SPRINT {currentSprint} 实时演化快照
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-black/45 border border-gemini-cyan/30">
                <div className="text-[10px] text-slate-400">变更响应提速</div>
                <div className="text-xl font-black font-mono text-gemini-cyan mt-0.5">
                  {simulation.speedupRatio}x
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {simulation.activePoint.tradLead}h → {simulation.activePoint.aiLead}h
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-black/45 border border-emerald-400/30">
                <div className="text-[10px] text-slate-400">Bug 修复周期压缩</div>
                <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                  {simulation.mttrCompressionPct >= 0
                    ? `-${simulation.mttrCompressionPct}%`
                    : `+${Math.abs(simulation.mttrCompressionPct)}%`}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {simulation.activePoint.tradMttr}h → {simulation.activePoint.aiMttr}h
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed">
              {simulation.habitScore >= 70
                ? "✓ 高 7 Habits 实践使规则与单测形成复利：第 3 周起响应耗时持续下探。"
                : simulation.habitScore >= 45
                ? "⚠ 半工程化状态下，中期技术债与局部返工会抵消部分 AI 提速。"
                : "✗ 缺少 7 Habits 护栏（橙线）：第 4 周后陷入「70% 困境」，修复耗时反超传统开发。"}
            </p>
          </div>
        </div>

        {/* Right 8 cols: Dual Live SVG Evolution Charts */}
        <div className="col-span-8 flex flex-col gap-3">
          {/* Chart 1: Requirement Change Response Time */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>图表 01：需求变更响应时间演化（Change Lead Time · 小时，越低越快）</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-slate-400">-- 传统研发</span>
                <span className="text-amber-300">·· 盲目 Vibe</span>
                <span className="text-gemini-cyan">— AI-First (7 Habits)</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-[145px] overflow-visible"
              role="img"
              aria-label="需求变更响应时间演化折线图"
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((r) => {
                const y = padT + plotH * (1 - r);
                return (
                  <g key={r}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 4}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {Math.round(simulation.maxLead * r)}h
                    </text>
                  </g>
                );
              })}

              {/* Current Sprint Cursor */}
              <line
                x1={activeX}
                y1={padT}
                x2={activeX}
                y2={padT + plotH}
                stroke="rgba(76,221,236,0.35)"
                strokeWidth="1.5"
              />

              {/* Traditional Curve */}
              <path
                d={buildPath((p) => p.tradLead, simulation.maxLead, currentSprint)}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              {/* Unconstrained Vibe Reference */}
              <path
                d={buildPath((p) => p.vibeLead, simulation.maxLead, currentSprint)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.6"
                strokeDasharray="2 3"
              />
              {/* AI-First (7 Habits) Curve */}
              <path
                d={buildPath((p) => p.aiLead, simulation.maxLead, currentSprint)}
                fill="none"
                stroke="#4cddec"
                strokeWidth="2.5"
              />

              {/* Active Sprint Dots */}
              {(() => {
                const pt = simulation.activePoint;
                const cTrad = getCoord(currentSprint - 1, pt.tradLead, simulation.maxLead);
                const cAi = getCoord(currentSprint - 1, pt.aiLead, simulation.maxLead);
                return (
                  <>
                    <circle cx={cTrad.x} cy={cTrad.y} r="3.5" fill="#94a3b8" />
                    <circle cx={cAi.x} cy={cAi.y} r="4.5" fill="#4cddec" stroke="#040711" strokeWidth="1.5" />
                  </>
                );
              })()}

              {/* Sprint X-axis Labels */}
              {simulation.points.map((pt, idx) => {
                const x = padL + (idx / (TOTAL_SPRINTS - 1)) * plotW;
                return (
                  <text
                    key={pt.sprint}
                    x={x}
                    y={svgH - 5}
                    textAnchor="middle"
                    fill={pt.sprint === currentSprint ? "#4cddec" : "#64748b"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight={pt.sprint === currentSprint ? "700" : "400"}
                  >
                    W{pt.sprint}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Chart 2: Bug Fix Cycle (MTTR) */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>图表 02：Bug 平均修复周期演化（MTTR · 小时，越低越快）</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-slate-400">-- 传统排障 MTTR</span>
                <span className="text-amber-300">·· 盲目 Vibe</span>
                <span className="text-emerald-400">— AI-First + Bugbot</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-[145px] overflow-visible"
              role="img"
              aria-label="Bug 修复周期演化折线图"
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((r) => {
                const y = padT + plotH * (1 - r);
                return (
                  <g key={r}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="rgba(255,255,255,0.07)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 4}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {(simulation.maxMttr * r).toFixed(0)}h
                    </text>
                  </g>
                );
              })}

              {/* Current Sprint Cursor */}
              <line
                x1={activeX}
                y1={padT}
                x2={activeX}
                y2={padT + plotH}
                stroke="rgba(52,211,153,0.35)"
                strokeWidth="1.5"
              />

              <path
                d={buildPath((p) => p.tradMttr, simulation.maxMttr, currentSprint)}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <path
                d={buildPath((p) => p.vibeMttr, simulation.maxMttr, currentSprint)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.6"
                strokeDasharray="2 3"
              />
              <path
                d={buildPath((p) => p.aiMttr, simulation.maxMttr, currentSprint)}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
              />

              {(() => {
                const pt = simulation.activePoint;
                const cTrad = getCoord(currentSprint - 1, pt.tradMttr, simulation.maxMttr);
                const cAi = getCoord(currentSprint - 1, pt.aiMttr, simulation.maxMttr);
                return (
                  <>
                    <circle cx={cTrad.x} cy={cTrad.y} r="3.5" fill="#94a3b8" />
                    <circle cx={cAi.x} cy={cAi.y} r="4.5" fill="#34d399" stroke="#040711" strokeWidth="1.5" />
                  </>
                );
              })()}

              {simulation.points.map((pt, idx) => {
                const x = padL + (idx / (TOTAL_SPRINTS - 1)) * plotW;
                return (
                  <text
                    key={pt.sprint}
                    x={x}
                    y={svgH - 5}
                    textAnchor="middle"
                    fill={pt.sprint === currentSprint ? "#34d399" : "#64748b"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight={pt.sprint === currentSprint ? "700" : "400"}
                  >
                    W{pt.sprint}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
