import { useMemo, useState } from "react";
import { BarChart3, Calculator, RotateCcw, TrendingUp } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface RoiState {
  teamSize: number;
  monthlyCostPerDev: number; // RMB thousands
  toolCostPerDev: number; // RMB
  bugFixHours: number;
  bugsPerMonth: number;
  featuresPerMonth: number;
  reworkPct: number;
  velocityGainPct: number;
  bugFixReductionPct: number;
  reworkReductionPct: number;
}

const DEFAULT_STATE: RoiState = {
  teamSize: 4,
  monthlyCostPerDev: 30,
  toolCostPerDev: 290,
  bugFixHours: 4.5,
  bugsPerMonth: 14,
  featuresPerMonth: 6,
  reworkPct: 28,
  velocityGainPct: 55,
  bugFixReductionPct: 62,
  reworkReductionPct: 58,
};

const TEAM_PRESETS: { id: string; label: string; patch: Partial<RoiState> }[] = [
  {
    id: "solo",
    label: "独立开发者 (1人)",
    patch: {
      teamSize: 1,
      monthlyCostPerDev: 25,
      bugFixHours: 3.5,
      bugsPerMonth: 10,
      featuresPerMonth: 5,
      reworkPct: 22,
      velocityGainPct: 65,
      bugFixReductionPct: 60,
      reworkReductionPct: 55,
    },
  },
  {
    id: "squad",
    label: "精锐全栈小队 (4人)",
    patch: { ...DEFAULT_STATE },
  },
  {
    id: "team",
    label: "成长型研发团队 (12人)",
    patch: {
      teamSize: 12,
      monthlyCostPerDev: 34,
      bugFixHours: 5.5,
      bugsPerMonth: 16,
      featuresPerMonth: 5,
      reworkPct: 34,
      velocityGainPct: 48,
      bugFixReductionPct: 64,
      reworkReductionPct: 62,
    },
  },
];

function clampNum(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
}

export default function AiRoiCalculatorSandbox() {
  const [state, setState] = useState<RoiState>({ ...DEFAULT_STATE });

  const updateField = <K extends keyof RoiState>(key: K, value: number) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (patch: Partial<RoiState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setState({ ...DEFAULT_STATE });
  };

  const metrics = useMemo(() => {
    const monthlyHoursPerDev = 160;
    const hourlyRate = (state.monthlyCostPerDev * 1000) / monthlyHoursPerDev;
    const totalTeamMonthlyHours = state.teamSize * monthlyHoursPerDev;

    // Baseline
    const baselineBugHours = state.teamSize * state.bugsPerMonth * state.bugFixHours;
    const baselineReworkHours = totalTeamMonthlyHours * (state.reworkPct / 100);
    const baselineNetBuildHours = Math.max(
      20,
      totalTeamMonthlyHours - baselineBugHours - baselineReworkHours
    );
    const baselineFeaturesTotal = state.teamSize * state.featuresPerMonth;

    // With Cursor + Bugbot
    const newBugFixHours = Number(
      (state.bugFixHours * (1 - state.bugFixReductionPct / 100)).toFixed(2)
    );
    const afterBugHours = state.teamSize * state.bugsPerMonth * newBugFixHours;
    const afterReworkPct = state.reworkPct * (1 - state.reworkReductionPct / 100);
    const afterReworkHours = totalTeamMonthlyHours * (afterReworkPct / 100);
    const afterFeaturesTotal = Number(
      (baselineFeaturesTotal * (1 + state.velocityGainPct / 100)).toFixed(1)
    );

    const savedBugHours = Math.max(0, baselineBugHours - afterBugHours);
    const savedReworkHours = Math.max(0, baselineReworkHours - afterReworkHours);

    // Equivalent dev hours gained from higher feature throughput (capped sensibly for financial valuation)
    const effectiveBuildRatio = baselineNetBuildHours / totalTeamMonthlyHours;
    const velocityHoursEquivalent =
      baselineNetBuildHours * (state.velocityGainPct / 100) * Math.min(1, effectiveBuildRatio + 0.35);

    const totalHoursSaved = savedBugHours + savedReworkHours + velocityHoursEquivalent;
    const grossMonthlyValue = totalHoursSaved * hourlyRate;
    const monthlyToolCost = state.teamSize * state.toolCostPerDev;
    const netMonthlyGain = grossMonthlyValue - monthlyToolCost;

    const roiPct =
      monthlyToolCost > 0 ? Math.round((netMonthlyGain / monthlyToolCost) * 100) : 0;
    const paybackDays =
      grossMonthlyValue > 0
        ? Math.max(0.4, Number(((monthlyToolCost / grossMonthlyValue) * 22).toFixed(1)))
        : 22;

    const afterEffectiveOutputPct = Math.min(
      95,
      Math.round(
        ((totalTeamMonthlyHours - afterBugHours - afterReworkHours) /
          totalTeamMonthlyHours) *
          100
      )
    );
    const baselineEffectiveOutputPct = Math.round(
      (baselineNetBuildHours / totalTeamMonthlyHours) * 100
    );

    const paradoxWarning =
      state.velocityGainPct >= 80 && state.reworkReductionPct < 30;

    // 6-Month Cumulative Trajectory
    const months = [1, 2, 3, 4, 5, 6];
    const trajectory = months.map((m) => {
      // Ramp up factor: month 1 adopts at 75%, month 2+ reaches full efficiency
      const rampFactor = m === 1 ? 0.78 : m === 2 ? 0.94 : 1;
      const cumSavings = Math.round(
        grossMonthlyValue * (m === 1 ? 0.78 : m === 2 ? 1.72 : 1.72 + (m - 2) * rampFactor)
      );
      const cumCost = monthlyToolCost * m;
      return {
        month: m,
        cumSavings,
        cumCost,
        netCum: cumSavings - cumCost,
      };
    });

    const maxTrajectoryVal = Math.max(
      1000,
      ...trajectory.map((t) => Math.max(t.cumSavings, t.cumCost))
    );

    return {
      hourlyRate,
      baselineBugHours,
      afterBugHours,
      newBugFixHours,
      baselineReworkHours,
      afterReworkHours,
      baselineFeaturesTotal,
      afterFeaturesTotal,
      baselineEffectiveOutputPct,
      afterEffectiveOutputPct,
      totalHoursSaved: Math.round(totalHoursSaved),
      grossMonthlyValue: Math.round(grossMonthlyValue),
      monthlyToolCost: Math.round(monthlyToolCost),
      netMonthlyGain: Math.round(netMonthlyGain),
      roiPct,
      paybackDays,
      paradoxWarning,
      trajectory,
      maxTrajectoryVal,
    };
  }, [state]);

  // SVG Chart coordinates (viewBox 440 x 130)
  const chartW = 440;
  const chartH = 128;
  const padL = 14;
  const padR = 14;
  const padT = 14;
  const padB = 22;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const savingsPoints = metrics.trajectory.map((pt, idx) => {
    const x = padL + (idx / (metrics.trajectory.length - 1)) * plotW;
    const y = padT + plotH - (pt.cumSavings / metrics.maxTrajectoryVal) * plotH;
    return { x, y, ...pt };
  });

  const costPoints = metrics.trajectory.map((pt, idx) => {
    const x = padL + (idx / (metrics.trajectory.length - 1)) * plotW;
    const y = padT + plotH - (pt.cumCost / metrics.maxTrajectoryVal) * plotH;
    return { x, y, ...pt };
  });

  const savingsLinePath = savingsPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const savingsAreaPath = `${savingsLinePath} L ${savingsPoints[savingsPoints.length - 1].x.toFixed(
    1
  )} ${(padT + plotH).toFixed(1)} L ${savingsPoints[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`;
  const costLinePath = costPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const formatRMB = (val: number) => {
    if (Math.abs(val) >= 10000) return `¥${(val / 10000).toFixed(1)}万`;
    return `¥${val.toLocaleString("zh-CN")}`;
  };

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wider uppercase">
            MODULE 7 · AI 研发 ROI 计算沙盘（CURSOR + BUGBOT 效能经济模型）
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            AI 研发 ROI 计算器：量化引入 Cursor + Bugbot 的工时与成本回报
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TEAM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.patch)}
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

      {/* 12-Col Body */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 5 cols: Baseline Inputs + Expected Improvement % Sliders */}
        <div className="col-span-5 flex flex-col gap-3">
          {/* Baseline Metrics Card */}
          <div className="p-3.5 rounded-xl bg-white/[0.035] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-gemini-cyan">
              <span className="inline-flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>1. 输入当前基线开发效率指标</span>
              </span>
              <span className="text-slate-400 tabular-nums">
                折合时薪 ¥{Math.round(metrics.hourlyRate)}/h
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">团队人数（人）</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={state.teamSize}
                  onChange={(e) =>
                    updateField("teamSize", clampNum(Number(e.target.value), 1, 100))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">人均月成本（千元）</span>
                <input
                  type="number"
                  min={8}
                  max={120}
                  value={state.monthlyCostPerDev}
                  onChange={(e) =>
                    updateField("monthlyCostPerDev", clampNum(Number(e.target.value), 8, 120))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">单 Bug 修复时长（小时）</span>
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  max={40}
                  value={state.bugFixHours}
                  onChange={(e) =>
                    updateField("bugFixHours", clampNum(Number(e.target.value), 0.5, 40))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">人均月交付需求（个）</span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={state.featuresPerMonth}
                  onChange={(e) =>
                    updateField("featuresPerMonth", clampNum(Number(e.target.value), 1, 40))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">人均月 Bug 数（个）</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={state.bugsPerMonth}
                  onChange={(e) =>
                    updateField("bugsPerMonth", clampNum(Number(e.target.value), 1, 60))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-[10px] text-slate-400 block">当前 CR 与返工耗时（%）</span>
                <input
                  type="number"
                  min={5}
                  max={65}
                  value={state.reworkPct}
                  onChange={(e) =>
                    updateField("reworkPct", clampNum(Number(e.target.value), 5, 65))
                  }
                  onKeyDown={stopRevealKey}
                  className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-gemini-cyan"
                />
              </label>
            </div>
          </div>

          {/* Cursor + Bugbot Expected Improvement Sliders */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-gemini-purple/35 space-y-2.5">
            <div className="text-[11px] font-mono text-gemini-purple">
              2. 引入 Cursor + Bugbot 预期提升百分比
            </div>

            <div className="space-y-2 tabular-nums">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">代码与需求产出速度提升</span>
                  <span className="font-mono font-bold text-gemini-cyan">
                    +{state.velocityGainPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={state.velocityGainPct}
                  onChange={(e) => updateField("velocityGainPct", Number(e.target.value))}
                  className="w-full accent-[#4cddec] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Bug 修复时长缩短（@终端自愈 + 定位）</span>
                  <span className="font-mono font-bold text-emerald-400">
                    -{state.bugFixReductionPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={2}
                  value={state.bugFixReductionPct}
                  onChange={(e) => updateField("bugFixReductionPct", Number(e.target.value))}
                  className="w-full accent-[#34d399] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-slate-300">Bugbot 拦截导致的返工工时降幅</span>
                  <span className="font-mono font-bold text-gemini-purple">
                    -{state.reworkReductionPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={2}
                  value={state.reworkReductionPct}
                  onChange={(e) => updateField("reworkReductionPct", Number(e.target.value))}
                  className="w-full accent-[#9b72cb] cursor-pointer"
                />
              </div>
            </div>

            {metrics.paradoxWarning && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/35 text-[10px] text-amber-200 leading-relaxed">
                注意「Sonar 生产力悖论」：代码产出增速 ≥80% 但 Bugbot 降返工不足 30%，Review 队列极易堵塞。
              </div>
            )}
          </div>
        </div>

        {/* Right 7 cols: KPI Cards + Comparison Bars + 6-Month ROI Trajectory Chart */}
        <div className="col-span-7 flex flex-col gap-3">
          {/* Top 4 KPI Summary Cards */}
          <div className="grid grid-cols-4 gap-2.5 tabular-nums">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/35">
              <div className="text-[10px] font-mono text-emerald-300">月度净 ROI</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {metrics.roiPct > 0 ? `+${metrics.roiPct}%` : `${metrics.roiPct}%`}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                工具投入 {formatRMB(metrics.monthlyToolCost)}/月
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/35">
              <div className="text-[10px] font-mono text-gemini-cyan">月度净省工时</div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {metrics.totalHoursSaved}h
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                等效净收益 {formatRMB(metrics.netMonthlyGain)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gemini-purple/10 border border-gemini-purple/35">
              <div className="text-[10px] font-mono text-gemini-purple">回本周期</div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {metrics.paybackDays} 天
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                按每月 22 工作日折算
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/12">
              <div className="text-[10px] font-mono text-slate-300">半年累计净收益</div>
              <div className="text-2xl font-black font-mono text-amber-300 mt-0.5">
                {formatRMB(metrics.trajectory[metrics.trajectory.length - 1].netCum)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                有效研发时间 {metrics.baselineEffectiveOutputPct}% → {metrics.afterEffectiveOutputPct}%
              </div>
            </div>
          </div>

          {/* Chart 1: Before vs After Comparison Chart */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-white inline-flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>效能对比图：传统研发基线 vs 引入 Cursor + Bugbot</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-600 inline-block" /> 基线
                </span>
                <span className="inline-flex items-center gap-1 text-gemini-cyan">
                  <span className="w-2.5 h-2.5 rounded-xs bg-gemini-cyan inline-block" /> Cursor + Bugbot
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 tabular-nums">
              {[
                {
                  label: "单 Bug 平均修复时长",
                  before: state.bugFixHours,
                  after: metrics.newBugFixHours,
                  unit: "h",
                  delta: `-${state.bugFixReductionPct}%`,
                  deltaColor: "text-emerald-400",
                  max: Math.max(state.bugFixHours, metrics.newBugFixHours, 1),
                },
                {
                  label: "团队月交付功能点数",
                  before: metrics.baselineFeaturesTotal,
                  after: metrics.afterFeaturesTotal,
                  unit: "个",
                  delta: `+${state.velocityGainPct}%`,
                  deltaColor: "text-gemini-cyan",
                  max: Math.max(metrics.baselineFeaturesTotal, metrics.afterFeaturesTotal, 1),
                },
                {
                  label: "团队月度 Bug 消耗工时",
                  before: Math.round(metrics.baselineBugHours),
                  after: Math.round(metrics.afterBugHours),
                  unit: "h",
                  delta: `-${Math.round(metrics.baselineBugHours - metrics.afterBugHours)}h`,
                  deltaColor: "text-emerald-400",
                  max: Math.max(metrics.baselineBugHours, metrics.afterBugHours, 1),
                },
                {
                  label: "团队月度 CR/返工损耗",
                  before: Math.round(metrics.baselineReworkHours),
                  after: Math.round(metrics.afterReworkHours),
                  unit: "h",
                  delta: `-${Math.round(metrics.baselineReworkHours - metrics.afterReworkHours)}h`,
                  deltaColor: "text-gemini-purple",
                  max: Math.max(metrics.baselineReworkHours, metrics.afterReworkHours, 1),
                },
              ].map((row) => (
                <div key={row.label} className="p-2.5 rounded-lg bg-white/[0.025] border border-white/8 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-200 font-medium truncate">{row.label}</span>
                    <span className={`font-mono font-bold shrink-0 ${row.deltaColor}`}>
                      {row.delta}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-10 text-slate-400 shrink-0">{row.before}{row.unit}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full transition-all duration-300"
                          style={{ width: `${(row.before / row.max) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span className="w-10 text-gemini-cyan font-semibold shrink-0">{row.after}{row.unit}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gemini-cyan to-emerald-400 rounded-full transition-all duration-300"
                          style={{ width: `${(row.after / row.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: 6-Month Cumulative ROI Curve (SVG) */}
          <div className="flex-1 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-mono text-white inline-flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>6 个月累计 ROI 曲线：节省研发价值 vs 工具投入成本</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-gemini-cyan">— 累计节省价值</span>
                <span className="text-gemini-purple">-- 累计订阅投入</span>
              </div>
            </div>

            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-[126px] overflow-visible"
              role="img"
              aria-label="6 个月 Cursor + Bugbot 累计 ROI 曲线图"
            >
              <defs>
                <linearGradient id="roiSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4cddec" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#4cddec" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal guide lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padT + plotH * (1 - ratio);
                return (
                  <line
                    key={ratio}
                    x1={padL}
                    y1={y}
                    x2={chartW - padR}
                    y2={y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Area & Lines */}
              <path d={savingsAreaPath} fill="url(#roiSavingsGrad)" />
              <path
                d={costLinePath}
                fill="none"
                stroke="#9b72cb"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <path d={savingsLinePath} fill="none" stroke="#4cddec" strokeWidth="2.5" />

              {/* Points & Month Labels */}
              {savingsPoints.map((pt) => (
                <g key={pt.month}>
                  <circle cx={pt.x} cy={pt.y} r="3.5" fill="#4cddec" stroke="#040711" strokeWidth="1.5" />
                  <text
                    x={pt.x}
                    y={chartH - 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    M{pt.month}
                  </text>
                  {(pt.month === 1 || pt.month === 3 || pt.month === 6) && (
                    <text
                      x={pt.x}
                      y={Math.max(10, pt.y - 7)}
                      textAnchor={pt.month === 6 ? "end" : pt.month === 1 ? "start" : "middle"}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {formatRMB(pt.cumSavings)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
