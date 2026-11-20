import { useMemo, useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface ExperimentIntervention {
  id: string;
  label: string;
  targetBottleneck: string;
  cycleDaysAfter: number;
  reworkPctAfter: number;
  defectRateAfter: number;
  reviewMinsAfter: number;
  autoPart: string;
  humanGate: string;
}

const INTERVENTIONS: ExperimentIntervention[] = [
  {
    id: "plan-mdc",
    label: "实验 A：跨文件改动强制 Plan + .mdc 边界",
    targetBottleneck: "反复返工与字段名漂移",
    cycleDaysAfter: 2.1,
    reworkPctAfter: 14,
    defectRateAfter: 4,
    reviewMinsAfter: 25,
    autoPart: "Agent 按 globs 规则生成骨架并跑 tsc/lint",
    humanGate: "Plan 文件影响面与接口契约人工审批",
  },
  {
    id: "pre-pr-bugbot",
    label: "实验 B：PR 合入前强制单测 + 独立 Review",
    targetBottleneck: "人工 Review 堵车与逃逸缺陷",
    cycleDaysAfter: 2.4,
    reworkPctAfter: 18,
    defectRateAfter: 2,
    reviewMinsAfter: 18,
    autoPart: "CI 自动跑静态门禁并标注高危 Diff 位置",
    humanGate: "人类终审鉴权逻辑、删除操作与测试真实性",
  },
  {
    id: "raw-vibe",
    label: "对照组：无门禁纯加速生成（负向示例）",
    targetBottleneck: "追求行数产出的假象提效",
    cycleDaysAfter: 3.6,
    reworkPctAfter: 46,
    defectRateAfter: 15,
    reviewMinsAfter: 70,
    autoPart: "零约束一键生成整段大文件",
    humanGate: "无前置审批，事后全靠人肉救火排障",
  },
];

export default function P93b() {
  const [selectedId, setSelectedId] = useState<string>("plan-mdc");
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "14d">("7d");
  const [visitedIds, setVisitedIds] = useState<string[]>(["plan-mdc"]);

  const current = useMemo(
    () => INTERVENTIONS.find((i) => i.id === selectedId) ?? INTERVENTIONS[0],
    [selectedId]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setVisitedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const artifactText = `# ROI_BASELINE_EXPERIMENT.md — 可比基线与短周期流程改进实验表

## 1. 四项可比工程基线（告别“代码行数”虚荣指标）
| 指标名称 | 改造前基线 (Baseline) | 本轮实验 (${selectedPeriod}) 目标值 | 数据来源（必须客观可查） |
| :--- | :--- | :--- | :--- |
| **交付周期 (MTTV)** | 3.5 天 / 需求 | <= ${current.cycleDaysAfter} 天 / 需求 | Git PR 创建到合并时间戳 |
| **返工比例 (Rework)** | 38% 改动在 48h 内回改 | <= ${current.reworkPctAfter}% | Bugfix / Revert Commit 占比 |
| **逃逸缺陷率 (Defect)** | 11% 上线后修补 | <= ${current.defectRateAfter}% | 线上告警或回归失败计数 |
| **人工 Review 耗时** | 55 分钟 / PR | <= ${current.reviewMinsAfter} 分钟 / PR | 评审打卡 / PR 往返轮次 |

## 2. 短周期可控实验计划（当前方案：${current.label}）
- **聚焦瓶颈**：${current.targetBottleneck}
- **自动化边界 (Automation)**：${current.autoPart}
- **人类审批边界 (Human-in-the-Loop)**：${current.humanGate}
- **止损退出条件**：若连续 3 个任务返工比例未降反升，立即回滚该工作流配置并复盘规则复杂度。`;

  return (
    <ModuleLoopStudio
      moduleCode="M7"
      eyebrow="COMPARABLE ROI & EXPERIMENT · 可比基线与可控流程改进"
      title="ROI 可比基线度量 × 短周期工程改进实验设计"
      notes="引入可比 ROI 指标（交付周期、返工率、缺陷率、人工审阅成本），并设计带自动化与人工审批边界的短周期流程改进实验。"
      objective="能用 4 项可比工程指标替代“生成代码行数”度量真实 ROI，并设计周期 7–14 天的可控工作流改进实验。"
      boundary="教学沙盘中的对比数值为演练模型；真实团队落实验证必须基于自身 Git/PR 历史记录先测 1 周基线再单变量对比。"
      positiveCase={{
        title: "先定 4 项基线 + 单变量 7 天改进实验",
        scenario: "团队感觉用了 AI 写得很快，但周交付功能没变多；通过可比指标定位真正卡点。",
        steps: [
          "记录过去 2 周基线：交付周期 3.5 天、48h 内返工率 38%、人工 Review 耗 55 分钟/PR。",
          "只引入 1 个可控变量：跨模块任务先出 Plan 并启用 .mdc 路径规则，自动化跑 lint/tsc，人类只审 Plan 与高危 Diff。",
          "7 天后对比同一口径指标：返工率降至 14%，人工审阅缩至 25 分钟，净交付周期显著缩短。",
        ],
        snippetLabel: "可观测 ROI 净收益公式",
        snippet: `Net ROI = (基线交付周期 - 实测交付周期) - (额外规则维护耗时 + 返工排障耗时)
判断标准：若 Review 耗时与返工率同步下降，才是正 ROI`,
        verdict: "有基线可对照，改进动作与收益因果清晰可复现。",
      }}
      failureCase={{
        title: "沉迷“日产 5000 行”虚荣指标，导致净 ROI 为负",
        scenario: "为了展示 AI 提效，鼓励无约束一键生成大段模块，跳过规则与前置测试。",
        steps: [
          "表面指标“AI 代码采纳行数”暴涨 4 倍，但每个 PR 动辄 1500 行，审阅人根本看不完。",
          "PR 审查时间从 30 分钟暴涨到 70 分钟，上线后返工占比高达 46%，整体需求交付反而变慢。",
          "一次改了太多流程变量，出问题后说不清到底是模型、规则还是测试策略拖了后腿。",
        ],
        snippetLabel: "典型生产力悖论指标曲线",
        snippet: `生成代码行数: +400%  |  PR 体积: +320%
结果: 人工 Review 耗时 +130%，返工率 46%，有效功能交付 -15%`,
        verdict: "把中间生成量当最终价值，忽略了下游审查与返工成本。",
      }}
      practiceTitle="课堂实验设计演练：切换对比方案与实验周期（需查看至少 2 组对照以完成判定）"
      practicePassedCount={visitedIds.length >= 2 ? 2 : visitedIds.length}
      practiceTotalCount={2}
      dodItems={[
        {
          id: "m7-dod-1",
          label: "明确了 4 项可比指标（交付周期、返工率、缺陷率、人工审核成本）",
          verifyHint: "不使用“生成代码行数”作为唯一度量",
        },
        {
          id: "m7-dod-2",
          label: "在右侧对比了正反两组方案的 ROI 影响与人机边界",
          verifyHint: "切换查看至少 2 组实验方案",
        },
        {
          id: "m7-dod-3",
          label: "已导出「基线对比记录表 & 短周期实验计划」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="可比 ROI 基线表与短周期工程实验计划"
      artifactFilename="ROI_BASELINE_EXPERIMENT.md"
      artifactContent={artifactText}
      reflectionQuestion="在你当前的工作流里，哪一个环节耗掉了最多的人类注意力（例如：修样式、写单测、Review 大 Diff 还是排查环境变量）？你会设计什么 7 天小实验来测出 AI 到底帮了多少忙？"
      reflectionHint="一次只挑 1 个痛点并写死人工审批门禁：例如选「减少 PR 返工」，约定连续 7 天所有 >2 文件改动先过 Plan 审阅 + 本地 tsc 门禁，周末用 Git revert/fix commit 占比检验是否真的降低了返工。"
      renderPractice={() => (
        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {INTERVENTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border cursor-pointer transition-colors ${
                    selectedId === item.id
                      ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                      : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
              {(["7d", "14d"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-white text-slate-950 font-semibold"
                      : "text-slate-300"
                  }`}
                >
                  {period === "7d" ? "7 天短周期" : "14 天周期"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">交付周期 (基线 3.5d)</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {current.cycleDaysAfter}d
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">返工占比 (基线 38%)</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                  current.reworkPctAfter > 30 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {current.reworkPctAfter}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">逃逸缺陷 (基线 11%)</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                  current.defectRateAfter > 10 ? "text-rose-400" : "text-gemini-cyan"
                }`}
              >
                {current.defectRateAfter}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="text-[10px] font-mono text-slate-400">人工审阅 (基线 55m)</div>
              <div
                className={`text-xl font-bold font-mono tabular-nums mt-1 ${
                  current.reviewMinsAfter > 55 ? "text-rose-400" : "text-gemini-purple"
                }`}
              >
                {current.reviewMinsAfter}m
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25">
              <div className="font-mono text-[11px] text-emerald-300 mb-1">
                自动化负责边界 (Automation)
              </div>
              <div className="text-slate-200 leading-relaxed">{current.autoPart}</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25">
              <div className="font-mono text-[11px] text-amber-300 mb-1">
                人工审批负责边界 (Human Gate)
              </div>
              <div className="text-slate-200 leading-relaxed">{current.humanGate}</div>
            </div>
          </div>
        </div>
      )}
    />
  );
}
