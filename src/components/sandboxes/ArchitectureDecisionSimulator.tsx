import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type StrategyId = "mvp-first" | "decoupled" | "ai-automated";

interface StrategyMeta {
  id: StrategyId;
  name: string;
  subtitle: string;
  description: string;
  mechanism: string;
}

interface SprintScenario {
  round: number;
  title: string;
  context: string;
  pressure: string;
  impacts: Record<
    StrategyId,
    {
      baseDays: number;
      debtDelta: number;
      qualityDelta: number;
      feedback: string;
    }
  >;
}

const STRATEGIES: StrategyMeta[] = [
  {
    id: "mvp-first",
    name: "MVP 优先",
    subtitle: "极速验证 · 跳过契约与分层",
    description: "直接编写业务功能，暂不划分领域边界、自动化测试或静态门禁，优先抢占首轮上线窗口。",
    mechanism: "前期交付最快，但技术债随迭代复利增长，突破临界点后触发返工拖慢进度。",
  },
  {
    id: "decoupled",
    name: "架构解耦",
    subtitle: "契约先行 · 手动精雕边界",
    description: "优先建立清晰的三层模块边界、接口 DTO 与人工 Code Review，严格控制圈复杂度与耦合度。",
    mechanism: "前中期需投入额外设计工时，但技术债增长极低，后期需求变更与故障修复稳健。",
  },
  {
    id: "ai-automated",
    name: "AI 自动化优先",
    subtitle: "Plan 契约 · Rules + Bugbot 闭环",
    description: "用 Plan Mode 锁定 Schema、.cursor/rules 注入架构约束，并由 Bugbot 与 AI 单测自动守门。",
    mechanism: "在保持高交付速度的同时自动清偿冗余代码与隐藏漏洞，守住 7 Habits 质量基线。",
  },
];

const SPRINT_SCENARIOS: SprintScenario[] = [
  {
    round: 1,
    title: "Sprint 01 · 冷启动原型与鉴权底座",
    context: "需在首周交付用户登录、权限拦截与核心业务表单，市场团队要求尽早拿 Demo 收集种子用户反馈。",
    pressure: "交付窗口紧迫，是否要花时间做目录分层与规则护栏？",
    impacts: {
      "mvp-first": {
        baseDays: 1.5,
        debtDelta: 22,
        qualityDelta: -10,
        feedback: "1.5 天闪电上线 Demo，但路由与数据库逻辑直连，埋下后续改版耦合隐患。",
      },
      decoupled: {
        baseDays: 4.2,
        debtDelta: 4,
        qualityDelta: 8,
        feedback: "鉴权中间件与领域模型清晰解耦，但纯手工编写样板代码拉长了首轮交付周期。",
      },
      "ai-automated": {
        baseDays: 2.1,
        debtDelta: 2,
        qualityDelta: 9,
        feedback: "Plan 锁定鉴权契约 + .mdc 规则自动生成类型安全骨架，兼顾首周上线速度与高可读性。",
      },
    },
  },
  {
    round: 2,
    title: "Sprint 02 · 支付回调与数据库事务上线",
    context: "接入支付 Webhook 验签、幂等防重放与异步队列，任何静默逻辑错误都会直接导致资金账目不一致。",
    pressure: "并发竞态与异常分支成倍增加，需要权衡验证深度与上线速度。",
    impacts: {
      "mvp-first": {
        baseDays: 2.2,
        debtDelta: 26,
        qualityDelta: -15,
        feedback: "快速拼装回调接口上线，但缺少幂等锁与负向单测，异常兜底出现空 catch 吞错。",
      },
      decoupled: {
        baseDays: 4.5,
        debtDelta: 3,
        qualityDelta: 9,
        feedback: "事务边界与纯函数验签结构严密，人工走查与边界测试投入较多工时。",
      },
      "ai-automated": {
        baseDays: 2.3,
        debtDelta: -2,
        qualityDelta: 10,
        feedback: "Bugbot 自动拦下重放竞态风险并补齐边界单测，同时顺带重构清理了首轮冗余样板。",
      },
    },
  },
  {
    round: 3,
    title: "Sprint 03 · 需求突发改版与多租户扩展",
    context: "产品临时要求将单租户工作台升级为团队协同权限体系，跨 12 个页面与 6 张数据表联动修改。",
    pressure: "历史债务开始收割利息：前期架构选择将直接决定改版是否引发连锁回归。",
    impacts: {
      "mvp-first": {
        baseDays: 3.4,
        debtDelta: 25,
        qualityDelta: -16,
        feedback: "缺少抽象层导致「改 A 坏 B」，大量时间消耗在打补丁与排查状态漂移。",
      },
      decoupled: {
        baseDays: 3.6,
        debtDelta: 2,
        qualityDelta: 6,
        feedback: "受益于清晰接口边界，多租户策略可局部插拔扩展，回归风险始终处于低位。",
      },
      "ai-automated": {
        baseDays: 2.2,
        debtDelta: -3,
        qualityDelta: 7,
        feedback: "借助 Context7 锚定权限规范与小步 Diff 门禁，AI 并行完成迁移且未引入死代码残留。",
      },
    },
  },
  {
    round: 4,
    title: "Sprint 04 · 高峰期故障自愈与规模化发布",
    context: "线上流量翻倍后出现局部慢查询与内存泄漏风险，需要在本轮完成 SAST 安全扫雷并交付稳定版。",
    pressure: "决定项目最终是平稳进入规模期，还是陷入 70% 困境的泥潭。",
    impacts: {
      "mvp-first": {
        baseDays: 3.8,
        debtDelta: 18,
        qualityDelta: -12,
        feedback: "救火式热修虽勉强止血，但代码库可读性与测试覆盖已跌破健康线，后续迭代寸步难行。",
      },
      decoupled: {
        baseDays: 3.4,
        debtDelta: -4,
        qualityDelta: 7,
        feedback: "通过模块边界快速定位瓶颈并完成重构还债，系统稳定性优异但累计交付周期偏长。",
      },
      "ai-automated": {
        baseDays: 1.9,
        debtDelta: -5,
        qualityDelta: 8,
        feedback: "终端自愈闭环 + SAST 自动扫描一键清零高危残留，以最短周期达成生产级质量。",
      },
    },
  },
];

const STRATEGY_BADGE_COLORS: Record<StrategyId, string> = {
  "mvp-first": "text-amber-300 border-amber-400/45 bg-amber-500/12",
  decoupled: "text-gemini-cyan border-gemini-cyan/45 bg-gemini-cyan/12",
  "ai-automated": "text-emerald-300 border-emerald-400/45 bg-emerald-500/12",
};

const STRATEGY_ICONS: Record<StrategyId, typeof Zap> = {
  "mvp-first": Zap,
  decoupled: Layers,
  "ai-automated": Sparkles,
};

interface SimulationStepSnapshot {
  round: number;
  title: string;
  strategyId: StrategyId | null;
  roundDays: number;
  debtInterestDays: number;
  debtAfter: number;
  qualityAfter: number;
  feedback: string;
}

export default function ArchitectureDecisionSimulator() {
  const [activeRound, setActiveRound] = useState<number>(1);
  // Pre-seed Sprint 1 with "mvp-first" so learners see live feedback immediately on arrival and can compare switches
  const [decisions, setDecisions] = useState<Record<number, StrategyId | null>>({
    1: "mvp-first",
    2: null,
    3: null,
    4: null,
  });

  const simulation = useMemo(() => {
    let totalDays = 0;
    let totalInterestDays = 0;
    let currentDebt = 8; // Realistic baseline project setup debt
    let currentQuality = 72; // Baseline engineering quality

    const snapshots: SimulationStepSnapshot[] = [];

    for (const scenario of SPRINT_SCENARIOS) {
      const picked = decisions[scenario.round];
      if (!picked) {
        snapshots.push({
          round: scenario.round,
          title: scenario.title,
          strategyId: null,
          roundDays: 0,
          debtInterestDays: 0,
          debtAfter: currentDebt,
          qualityAfter: currentQuality,
          feedback: "待决策：请为本迭代选择开发策略。",
        });
        continue;
      }

      const impact = scenario.impacts[picked];
      // Tech debt compounds delivery delay once accumulated debt exceeds 30 pt
      const interestDelay =
        currentDebt > 30 ? Number((((currentDebt - 30) / 15) * 0.65).toFixed(1)) : 0;
      const roundDays = Number((impact.baseDays + interestDelay).toFixed(1));

      // AI automated & decoupled choices partially neutralize compound debt; MVP compounds if debt > 45
      const compoundExtra =
        picked === "mvp-first" && currentDebt >= 45 ? 5 : 0;

      currentDebt = Math.max(4, Math.min(100, currentDebt + impact.debtDelta + compoundExtra));
      currentQuality = Math.max(22, Math.min(98, currentQuality + impact.qualityDelta));
      totalDays = Number((totalDays + roundDays).toFixed(1));
      totalInterestDays = Number((totalInterestDays + interestDelay).toFixed(1));

      snapshots.push({
        round: scenario.round,
        title: scenario.title,
        strategyId: picked,
        roundDays,
        debtInterestDays: interestDelay,
        debtAfter: currentDebt,
        qualityAfter: currentQuality,
        feedback: impact.feedback,
      });
    }

    const decidedCount = Object.values(decisions).filter(Boolean).length;
    const activeSnapshot =
      snapshots.find((s) => s.round === activeRound) ?? snapshots[0];

    // Debt status assessment (dual-coded icon + text + color)
    const debtStatus =
      currentDebt <= 28
        ? { label: "低债可控", tone: "text-emerald-300", bar: "bg-emerald-400" }
        : currentDebt <= 58
        ? { label: "利息警戒", tone: "text-amber-300", bar: "bg-amber-400" }
        : { label: "70% 困境高危", tone: "text-rose-300", bar: "bg-rose-400" };

    // Quality status assessment
    const qualityStatus =
      currentQuality >= 84
        ? { label: "生产就绪", tone: "text-emerald-300", bar: "bg-emerald-400" }
        : currentQuality >= 62
        ? { label: "需审校加固", tone: "text-gemini-cyan", bar: "bg-gemini-cyan" }
        : { label: "返工高风险", tone: "text-rose-300", bar: "bg-rose-400" };

    // Derive final rank when all 4 rounds are decided
    let architectRank = "推演进行中";
    if (decidedCount === 4) {
      if (currentQuality >= 88 && currentDebt <= 20 && totalDays <= 10.5) {
        architectRank = "S 级 · AI-First 主编架构师";
      } else if (currentQuality >= 82 && currentDebt <= 35) {
        architectRank = "A 级 · 稳健架构演进派";
      } else if (currentDebt <= 65 && currentQuality >= 58) {
        architectRank = "B 级 · 务实平衡型开发者";
      } else {
        architectRank = "C 级 · 技术债消防员（陷入 70% 困境）";
      }
    }

    // Sub-scores derived deterministically from current quality & debt
    const sastScore = Math.max(20, Math.min(98, Math.round(currentQuality * 0.95 + (100 - currentDebt) * 0.07)));
    const maintainabilityScore = Math.max(18, Math.min(99, Math.round(100 - currentDebt * 0.72 + (currentQuality - 50) * 0.25)));
    const testCoverage = Math.max(15, Math.min(96, Math.round(currentQuality * 0.88 + (decisions[2] === "ai-automated" || decisions[4] === "ai-automated" ? 9 : 0))));

    return {
      totalDays,
      totalInterestDays,
      currentDebt,
      currentQuality,
      decidedCount,
      snapshots,
      activeSnapshot,
      debtStatus,
      qualityStatus,
      architectRank,
      sastScore,
      maintainabilityScore,
      testCoverage,
    };
  }, [decisions, activeRound]);

  const currentScenario =
    SPRINT_SCENARIOS.find((s) => s.round === activeRound) ?? SPRINT_SCENARIOS[0];
  const activeStrategyId = decisions[activeRound];

  const handleSelectStrategy = (strategyId: StrategyId) => {
    setDecisions((prev) => ({
      ...prev,
      [activeRound]: strategyId,
    }));
  };

  const handleAdvanceRound = () => {
    if (activeRound < 4) {
      const nextRound = activeRound + 1;
      setActiveRound(nextRound);
    }
  };

  const handleApplyAllSprints = (strategyId: StrategyId) => {
    setDecisions({
      1: strategyId,
      2: strategyId,
      3: strategyId,
      4: strategyId,
    });
    setActiveRound(4);
  };

  const handleResetGame = () => {
    setDecisions({
      1: "mvp-first",
      2: null,
      3: null,
      4: null,
    });
    setActiveRound(1);
  };

  // Baseline comparison against 4-round decoupled manual baseline (~15.7 days)
  const baselineManualDays = 15.7;
  const deliveryBarPct = Math.max(
    14,
    Math.min(100, Math.round((simulation.totalDays / 18) * 100))
  );

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Top Header & Sprint Stepper */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wide">
            Module 9 · Architecture Decision Simulator · 四轮敏捷架构策略推演
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Architecture Decision Simulator：交付速度、技术债与研发质量博弈
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* 4-Round Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {SPRINT_SCENARIOS.map((sc) => {
              const isCurrent = sc.round === activeRound;
              const picked = decisions[sc.round];
              return (
                <button
                  key={sc.round}
                  type="button"
                  onClick={() => setActiveRound(sc.round)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                    isCurrent
                      ? "bg-gemini-cyan text-slate-950 font-bold"
                      : picked
                      ? "bg-white/8 text-slate-200 hover:bg-white/14"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span>Sprint {sc.round}</span>
                  {picked && !isCurrent && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleResetGame}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/12 border border-white/12 text-[11px] font-mono text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置推演</span>
          </button>
        </div>
      </div>

      {/* Main Two-Zone Game Arena */}
      <div className="grid grid-cols-12 gap-3.5 items-stretch text-xs">
        {/* Left 4 cols: Active Dilemma & 4-Sprint Decision Log */}
        <div className="col-span-4 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-gemini-purple">
              <span>当前迭代挑战（{activeRound} / 4）</span>
              <span className="tabular-nums text-slate-400">
                已决策 {simulation.decidedCount}/4
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">
              {currentScenario.title}
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {currentScenario.context}
            </p>
            <div className="p-2 rounded-lg bg-amber-500/8 border border-amber-400/25 text-[11px] text-amber-200 leading-snug">
              决策难点：{currentScenario.pressure}
            </div>
          </div>

          {/* Sprint Timeline Decisions */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400">
              全周期决策轨迹（点击任意轮次可回溯改选）
            </div>
            <div className="space-y-1">
              {simulation.snapshots.map((snap) => {
                const pickedMeta = STRATEGIES.find((s) => s.id === snap.strategyId);
                const isSelectedRound = snap.round === activeRound;
                return (
                  <button
                    key={snap.round}
                    type="button"
                    onClick={() => setActiveRound(snap.round)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelectedRound
                        ? "bg-gemini-cyan/10 border-gemini-cyan/45"
                        : "bg-white/[0.02] border-white/8 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        S{snap.round}
                      </span>
                      <span
                        className={`text-[11px] font-medium truncate ${
                          pickedMeta ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {pickedMeta ? pickedMeta.name : "待选择策略"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-slate-300 shrink-0">
                      {snap.strategyId ? `${snap.roundDays}d · 债 ${snap.debtAfter}` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 8 cols: 3 Selectable Strategy Cards + Action Bar */}
        <div className="col-span-8 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-3 gap-3 flex-1">
            {STRATEGIES.map((strategy) => {
              const isSelected = activeStrategyId === strategy.id;
              const impact = currentScenario.impacts[strategy.id];
              const Icon = STRATEGY_ICONS[strategy.id];

              return (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => handleSelectStrategy(strategy.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "bg-[#10182b] border-gemini-cyan shadow-[0_0_20px_rgba(76,221,236,0.14)]"
                      : "bg-[#0b0f19] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono whitespace-nowrap ${
                          STRATEGY_BADGE_COLORS[strategy.id]
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{strategy.name}</span>
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-gemini-cyan font-semibold whitespace-nowrap">
                          ✓ 当前已选
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold text-white">
                      {strategy.subtitle}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {strategy.description}
                    </p>
                  </div>

                  {/* Per-Sprint Delta Preview */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5 w-full">
                    <div className="text-[10px] text-slate-400 leading-snug">
                      {strategy.mechanism}
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono tabular-nums">
                      <div className="p-1 rounded bg-black/40">
                        <div className="text-[9px] text-slate-400">本轮耗时</div>
                        <div className="text-[11px] font-bold text-white">
                          +{impact.baseDays}d
                        </div>
                      </div>
                      <div className="p-1 rounded bg-black/40">
                        <div className="text-[9px] text-slate-400">技术债</div>
                        <div
                          className={`text-[11px] font-bold ${
                            impact.debtDelta <= 0
                              ? "text-emerald-300"
                              : impact.debtDelta <= 8
                              ? "text-gemini-cyan"
                              : "text-amber-300"
                          }`}
                        >
                          {impact.debtDelta > 0 ? `+${impact.debtDelta}` : impact.debtDelta}
                        </div>
                      </div>
                      <div className="p-1 rounded bg-black/40">
                        <div className="text-[9px] text-slate-400">质量分</div>
                        <div
                          className={`text-[11px] font-bold ${
                            impact.qualityDelta >= 0 ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {impact.qualityDelta > 0
                            ? `+${impact.qualityDelta}`
                            : impact.qualityDelta}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Round Progression & Quick Whole-Project Preset Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400 shrink-0">一键全程策略对比：</span>
              {STRATEGIES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleApplyAllSprints(s.id)}
                  className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/12 border border-white/10 text-[10px] font-mono text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  全程 {s.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {activeRound < 4 ? (
                <button
                  type="button"
                  disabled={!activeStrategyId}
                  onClick={handleAdvanceRound}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    activeStrategyId
                      ? "bg-gemini-cyan text-slate-950 hover:bg-cyan-300 cursor-pointer"
                      : "bg-white/10 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span>锁定并进入 Sprint {activeRound + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gemini-purple/18 border border-gemini-purple/45 text-[11px] font-mono text-purple-200 whitespace-nowrap shrink-0">
                  <Cpu className="w-3.5 h-3.5 text-gemini-purple" />
                  <span>{simulation.architectRank}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Feedback Dock (Card Footer Telemetry) */}
      <div className="pt-3 border-t border-white/12 space-y-2.5">
        <div className="grid grid-cols-3 gap-3 tabular-nums">
          {/* Metric 1: Project Delivery Time */}
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-300 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
                <span>项目累计交付时间</span>
              </span>
              <span
                className={`text-[10px] font-mono whitespace-nowrap ${
                  simulation.totalInterestDays > 0 ? "text-amber-300" : "text-emerald-300"
                }`}
              >
                {simulation.totalInterestDays > 0
                  ? `▲ 含债务返工 +${simulation.totalInterestDays} 天`
                  : "● 零返工拖拽"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-xl font-black font-mono text-white">
                {simulation.totalDays.toFixed(1)}
                <span className="text-xs font-normal text-slate-400 ml-1">天</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                全手工解耦基准 {baselineManualDays} 天
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gemini-cyan transition-all duration-300"
                style={{ width: `${deliveryBarPct}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Technical Debt Accumulation */}
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-300 inline-flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>技术债累积量</span>
              </span>
              <span
                className={`text-[10px] font-mono inline-flex items-center gap-1 whitespace-nowrap ${simulation.debtStatus.tone}`}
              >
                {simulation.currentDebt > 58 ? (
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                )}
                <span>{simulation.debtStatus.label}</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`text-xl font-black font-mono ${simulation.debtStatus.tone}`}>
                {simulation.currentDebt}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 100 pt</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                警戒阈值 &gt; 30 pt 开始收割利息
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${simulation.debtStatus.bar}`}
                style={{ width: `${simulation.currentDebt}%` }}
              />
            </div>
          </div>

          {/* Metric 3: R&D Quality Indicators */}
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-300 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>研发质量综合指标</span>
              </span>
              <span className={`text-[10px] font-mono whitespace-nowrap ${simulation.qualityStatus.tone}`}>
                {simulation.qualityStatus.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <div className={`text-xl font-black font-mono ${simulation.qualityStatus.tone}`}>
                {simulation.currentQuality}
                <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">
                可维护 {simulation.maintainabilityScore} · SAST {simulation.sastScore} · 单测{" "}
                {simulation.testCoverage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${simulation.qualityStatus.bar}`}
                style={{ width: `${simulation.currentQuality}%` }}
              />
            </div>
          </div>
        </div>

        {/* Real-time Contextual Diagnosis Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/8 text-[11px]">
          <div className="flex items-center gap-2 text-slate-200">
            <Gauge className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
            <span className="font-mono text-gemini-cyan shrink-0">
              Sprint {activeRound} 实时反馈：
            </span>
            <span>{simulation.activeSnapshot.feedback}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
            当前阶段：{simulation.decidedCount}/4 轮已推演
          </span>
        </div>
      </div>
    </div>
  );
}
