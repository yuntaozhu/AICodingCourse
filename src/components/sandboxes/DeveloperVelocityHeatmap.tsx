import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { Cpu, Flame, Layers, RotateCcw, Sparkles } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type MetricView = "speedup" | "reduction";

interface PipelineStage {
  id: string;
  label: string;
  shortLabel: string;
}

interface ToolStack {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  baseMultipliers: Record<string, number>;
  mechanisms: Record<string, string>;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "plan", label: "需求与架构拆解", shortLabel: "需求架构" },
  { id: "coding", label: "代码编写", shortLabel: "代码编写" },
  { id: "testing", label: "测试与终端调试", shortLabel: "测试调试" },
  { id: "review", label: "Code Review", shortLabel: "Code Review" },
  { id: "security", label: "安全与合规审计", shortLabel: "安全审计" },
  { id: "deploy", label: "部署与故障恢复", shortLabel: "部署恢复" },
];

const TOOL_STACKS: ToolStack[] = [
  {
    id: "manual",
    label: "纯手工基准 (No AI)",
    shortLabel: "纯手工基准",
    description: "依赖传统 IDE 与人工查文档、手写单测及排队人工 Review。",
    baseMultipliers: {
      plan: 1.0,
      coding: 1.0,
      testing: 1.0,
      review: 1.0,
      security: 1.0,
      deploy: 1.0,
    },
    mechanisms: {
      plan: "全人工口头对齐需求，边界歧义易在编码后暴露。",
      coding: "手写样板代码与类型定义耗时占比高。",
      testing: "需手工编写 Mock 与排查控制台堆栈。",
      review: "PR 排队等待人工逐行核对，风格与空边界易遗漏。",
      security: "发版前集中走查，高危漏洞发现滞后。",
      deploy: "脚本报错需人工翻阅 CI 日志逐项修复。",
    },
  },
  {
    id: "inline-tab",
    label: "行内补全 (Tab / Inline)",
    shortLabel: "行内补全",
    description: "仅使用单文件行内自动补全，未开启 Plan 契约、MCP 或 Bugbot。",
    baseMultipliers: {
      plan: 1.15,
      coding: 1.95,
      testing: 1.3,
      review: 1.05,
      security: 0.95,
      deploy: 1.1,
    },
    mechanisms: {
      plan: "对架构拆解助力有限，仍需人工理清跨文件依赖。",
      coding: "局部函数与重复样板补全提速明显，减少键入耗时。",
      testing: "可快速补全单测模板，但容易生成弱断言凑绿灯。",
      review: "代码产出变快但 PR 体积膨胀，人工审校负载反增。",
      security: "缺少统一 .mdc 红线，局部补全可能复制不安全写法。",
      deploy: "局部辅助配置脚本，缺乏自动化流水线闭环。",
    },
  },
  {
    id: "cursor-plan-rules",
    label: "Cursor Plan + .mdc Rules",
    shortLabel: "Cursor + Rules",
    description: "先出 Plan 契约，再用 .cursor/rules/*.mdc 精确约束模块架构与风格。",
    baseMultipliers: {
      plan: 2.35,
      coding: 2.8,
      testing: 2.1,
      review: 1.85,
      security: 1.9,
      deploy: 1.55,
    },
    mechanisms: {
      plan: "Plan Mode 秒级输出文件修改清单、Schema 与里程碑契约。",
      coding: "globs 精准挂载域规范，多文件联动生成返工率大幅下降。",
      testing: "DoD 规则驱动自动运行 tsc/lint 并收敛边界分支。",
      review: "Diff 结构清晰一致，降低评审者认知负担。",
      security: "20-api-security.mdc 在编码阶段预先拦截 SQLi 与明文密钥。",
      deploy: "构建脚本与环境变量契约统一，减少环境漂移报错。",
    },
  },
  {
    id: "cursor-mcp",
    label: "Cursor + Rules + MCP",
    shortLabel: "Cursor + MCP",
    description: "接入 Context7、数据库与 Playwright MCP，实现真实上下文直连与端到端自检。",
    baseMultipliers: {
      plan: 2.85,
      coding: 3.35,
      testing: 3.15,
      review: 2.2,
      security: 2.15,
      deploy: 2.4,
    },
    mechanisms: {
      plan: "直连真实数据库 Schema 与最新官方 SDK 文档，零幻觉规划。",
      coding: "借助 Context7 实时 API 签名，杜绝过时语法返工。",
      testing: "Playwright MCP 自动打开浏览器验证交互、响应式与报错控制台。",
      review: "附带实时验证日志与截图证据，显著缩短交叉确认周期。",
      security: "通过 DB 只读 MCP 核验 RLS 策略与索引状态。",
      deploy: "CLI + MCP 自动探测健康端口并快速定位构建异常。",
    },
  },
  {
    id: "full-loop",
    label: "Cursor + MCP + Bugbot 闭环",
    shortLabel: "Cursor+MCP+Bugbot",
    description: "融合 Background Agent、MCP 实证链与 Bugbot/SAST 自动守门的全流程加速。",
    baseMultipliers: {
      plan: 3.1,
      coding: 3.9,
      testing: 3.75,
      review: 4.25,
      security: 4.45,
      deploy: 3.3,
    },
    mechanisms: {
      plan: "TaskMaster/Plan + 架构图谱协同拆解并行子任务。",
      coding: "异步 Background Agent 并行交付，小步 Diff 契约可控。",
      testing: "终端闭环自愈 + 独立基准单测拦截 Test Reward Hacking。",
      review: "Bugbot 自动扫描并发竞态、N+1 与空 catch，主编只审核心边界。",
      security: "全量 SAST 与 7 Habits 门禁把高危漏洞拦截在合并之前。",
      deploy: "验证门禁全绿自动推进发布，MTTR 缩短至分钟级。",
    },
  },
];

interface HeatmapCell {
  stackId: string;
  stackLabel: string;
  stageId: string;
  stageLabel: string;
  speedup: number;
  reductionPct: number;
  mechanism: string;
}

export default function DeveloperVelocityHeatmap() {
  const [adoptionDepth, setAdoptionDepth] = useState<number>(85); // % workflow maturity
  const [codebaseComplexity, setCodebaseComplexity] = useState<number>(3); // 1..5
  const [metricView, setMetricView] = useState<MetricView>("speedup");
  const [selectedCell, setSelectedCell] = useState<{ stackId: string; stageId: string }>({
    stackId: "full-loop",
    stageId: "review",
  });

  const svgRef = useRef<SVGSVGElement>(null);

  const matrix = useMemo(() => {
    const adoptionFactor = 0.65 + (adoptionDepth / 100) * 0.45; // 0.65 .. 1.10
    // Higher complexity hurts manual/inline slightly, while MCP+Bugbot shines on complex repos
    const cells: HeatmapCell[] = [];
    const stackAverages: Record<string, number> = {};

    for (const stack of TOOL_STACKS) {
      let sum = 0;
      for (const stage of PIPELINE_STAGES) {
        const raw = stack.baseMultipliers[stage.id];
        let adjusted = raw;

        if (stack.id === "manual") {
          adjusted = Math.max(0.75, Number((1.0 - (codebaseComplexity - 2) * 0.05).toFixed(2)));
        } else if (stack.id === "inline-tab") {
          const penalty = (codebaseComplexity - 2) * 0.06;
          adjusted = Math.max(
            0.85,
            Number(((1 + (raw - 1) * adoptionFactor) - penalty).toFixed(2))
          );
        } else if (stack.id === "full-loop" || stack.id === "cursor-mcp") {
          const complexBonus = (codebaseComplexity - 2) * 0.1;
          adjusted = Math.max(
            1.1,
            Number((1 + (raw - 1) * adoptionFactor + complexBonus).toFixed(2))
          );
        } else {
          adjusted = Math.max(
            1.0,
            Number((1 + (raw - 1) * adoptionFactor).toFixed(2))
          );
        }

        const reductionPct = Math.max(
          -15,
          Math.min(85, Math.round((1 - 1 / adjusted) * 100))
        );

        cells.push({
          stackId: stack.id,
          stackLabel: stack.shortLabel,
          stageId: stage.id,
          stageLabel: stage.label,
          speedup: adjusted,
          reductionPct,
          mechanism: stack.mechanisms[stage.id],
        });
        sum += adjusted;
      }
      stackAverages[stack.id] = Number((sum / PIPELINE_STAGES.length).toFixed(2));
    }

    const activeCell =
      cells.find(
        (c) => c.stackId === selectedCell.stackId && c.stageId === selectedCell.stageId
      ) ?? cells[cells.length - 1];

    const bestCell = [...cells].sort((a, b) => b.speedup - a.speedup)[0];

    return { cells, stackAverages, activeCell, bestCell };
  }, [adoptionDepth, codebaseComplexity, selectedCell]);

  // Render D3.js Heatmap Matrix
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = 760;
    const height = 278;
    const margin = { top: 34, right: 86, bottom: 18, left: 132 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand<string>()
      .domain(PIPELINE_STAGES.map((s) => s.id))
      .range([0, innerW])
      .padding(0.1);

    const yScale = d3
      .scaleBand<string>()
      .domain(TOOL_STACKS.map((t) => t.id))
      .range([0, innerH])
      .padding(0.14);

    // Rich perceptually distinct dark-to-emerald velocity scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([0.9, 1.8, 3.0, 4.6])
      .range(["#172033", "#1d4ed8", "#06b6d4", "#10b981"])
      .clamp(true);

    // Column headers (Pipeline Stages)
    g.selectAll(".col-label")
      .data(PIPELINE_STAGES)
      .enter()
      .append("text")
      .attr("x", (d) => (xScale(d.id) ?? 0) + xScale.bandwidth() / 2)
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.id === selectedCell.stageId ? "#4cddec" : "#cbd5e1"))
      .attr("font-size", "11px")
      .attr("font-family", "monospace")
      .attr("font-weight", (d) => (d.id === selectedCell.stageId ? "700" : "500"))
      .text((d) => d.shortLabel);

    // Row headers (Tool Combinations)
    g.selectAll(".row-label")
      .data(TOOL_STACKS)
      .enter()
      .append("text")
      .attr("x", -10)
      .attr("y", (d) => (yScale(d.id) ?? 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "end")
      .attr("fill", (d) => (d.id === selectedCell.stackId ? "#4cddec" : "#e2e8f0"))
      .attr("font-size", "11px")
      .attr("font-family", "monospace")
      .attr("font-weight", (d) => (d.id === selectedCell.stackId ? "700" : "500"))
      .text((d) => d.shortLabel);

    // Right-side summary column header ("综合均值")
    g.append("text")
      .attr("x", innerW + 44)
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .attr("fill", "#9b72cb")
      .attr("font-size", "10.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", "700")
      .text("端到端均值");

    // Heatmap Cells
    const cellGroups = g
      .selectAll(".heat-cell")
      .data(matrix.cells)
      .enter()
      .append("g")
      .attr("class", "heat-cell")
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        setSelectedCell({ stackId: d.stackId, stageId: d.stageId });
      });

    cellGroups
      .append("rect")
      .attr("x", (d) => xScale(d.stageId) ?? 0)
      .attr("y", (d) => yScale(d.stackId) ?? 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("rx", 7)
      .attr("fill", (d) => colorScale(d.speedup))
      .attr("stroke", (d) =>
        d.stackId === selectedCell.stackId && d.stageId === selectedCell.stageId
          ? "#ffffff"
          : "rgba(255,255,255,0.12)"
      )
      .attr("stroke-width", (d) =>
        d.stackId === selectedCell.stackId && d.stageId === selectedCell.stageId ? 2.2 : 1
      )
      .attr("opacity", 0.92);

    cellGroups
      .append("text")
      .attr("x", (d) => (xScale(d.stageId) ?? 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => (yScale(d.stageId) ?? 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.speedup >= 2.7 ? "#04110b" : "#f8fafc"))
      .attr("font-size", "11.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", "700")
      .style("pointer-events", "none")
      .text((d) =>
        metricView === "speedup"
          ? `${d.speedup.toFixed(1)}x`
          : d.reductionPct >= 0
          ? `-${d.reductionPct}%`
          : `+${Math.abs(d.reductionPct)}%`
      );

    // Row Average Summary Column
    g.selectAll(".row-avg")
      .data(TOOL_STACKS)
      .enter()
      .append("text")
      .attr("x", innerW + 44)
      .attr("y", (d) => (yScale(d.id) ?? 0) + yScale.bandwidth() / 2 + 4)
      .attr("text-anchor", "middle")
      .attr("fill", (d) => (d.id === "full-loop" ? "#34d399" : "#e2e8f0"))
      .attr("font-size", "11.5px")
      .attr("font-family", "monospace")
      .attr("font-weight", "700")
      .text((d) => `${matrix.stackAverages[d.id].toFixed(2)}x`);
  }, [matrix, metricView, selectedCell]);

  const activeStackMeta =
    TOOL_STACKS.find((s) => s.id === selectedCell.stackId) ?? TOOL_STACKS[4];

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wide">
            Module 7 · Developer Velocity Heatmap · D3.js 工具栈 × 流水线加速热力矩阵
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Developer Velocity Heatmap：AI 工具组合对研发全链路环节的加速效应
          </h2>
        </div>

        {/* Metric View Toggle & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              onClick={() => setMetricView("speedup")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                metricView === "speedup"
                  ? "bg-gemini-cyan text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              加速倍率 (×)
            </button>
            <button
              type="button"
              onClick={() => setMetricView("reduction")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                metricView === "reduction"
                  ? "bg-emerald-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              周期压缩 (%)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setAdoptionDepth(85);
              setCodebaseComplexity(3);
              setMetricView("speedup");
              setSelectedCell({ stackId: "full-loop", stageId: "review" });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/12 border border-white/12 text-[11px] font-mono text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Main Content: D3 Heatmap Stage (8 cols) + Controls & Cell Diagnosis (4 cols) */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 8 cols: D3.js Heatmap Canvas */}
        <div className="col-span-8 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-300 inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>点击任意单元格下钻查看提效机制（D3 交互矩阵）</span>
            </span>

            {/* Color Scale Legend */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span>1.0x 基线</span>
              <span className="w-4 h-2.5 rounded-sm bg-[#172033] border border-white/15" />
              <span className="w-4 h-2.5 rounded-sm bg-[#1d4ed8]" />
              <span className="w-4 h-2.5 rounded-sm bg-[#06b6d4]" />
              <span className="w-4 h-2.5 rounded-sm bg-[#10b981]" />
              <span>4.5x+ 极速闭环</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox="0 0 760 278"
              className="w-full h-[265px]"
              role="img"
              aria-label="D3.js 开发者研发效率加速热力图"
            />
          </div>

          {/* Bottom Strip inside Chart Card: Best Hotspot & End-to-End Comparison */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
            <span className="text-slate-300 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                全场最高加速热点：
                <strong className="text-white ml-1">
                  {matrix.bestCell.stackLabel} × {matrix.bestCell.stageLabel}
                </strong>
                <span className="text-emerald-300 ml-1.5">
                  ({matrix.bestCell.speedup.toFixed(2)}x · -{matrix.bestCell.reductionPct}%)
                </span>
              </span>
            </span>
            <span className="text-gemini-cyan">
              全闭环综合提速 {matrix.stackAverages["full-loop"].toFixed(2)}x vs 行内补全{" "}
              {matrix.stackAverages["inline-tab"].toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Right 4 cols: Parameter Sliders & Selected Cell Drilldown */}
        <div className="col-span-4 flex flex-col justify-between gap-3">
          {/* Variable Controls */}
          <div className="p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-gemini-purple font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>环境变量调节（热力值实时重算）</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">规则与工作流熟练度</span>
                <span className="text-gemini-cyan font-bold">{adoptionDepth}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                step={5}
                value={adoptionDepth}
                onChange={(e) => setAdoptionDepth(Number(e.target.value))}
                className="w-full accent-[#4cddec] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-300">代码库跨模块耦合度</span>
                <span className="text-amber-300 font-bold">Lv.{codebaseComplexity} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={codebaseComplexity}
                onChange={(e) => setCodebaseComplexity(Number(e.target.value))}
                className="w-full accent-[#fbbf24] cursor-pointer"
              />
              <div className="text-[10px] text-slate-400">
                复杂度越高，单纯行内补全越受阻，而 MCP + Bugbot 上下文检索优势越放大。
              </div>
            </div>
          </div>

          {/* Selected Cell Diagnostic Card */}
          <div className="flex-1 p-3.5 rounded-xl bg-white/[0.04] border border-gemini-cyan/35 flex flex-col justify-between gap-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] font-mono text-gemini-cyan inline-flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 shrink-0" />
                  <span>聚焦矩阵切片分析</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {matrix.activeCell.stageLabel}
                </span>
              </div>

              <div className="text-sm font-bold text-white">{activeStackMeta.label}</div>
              <p className="text-[10.5px] text-slate-400 leading-snug">
                {activeStackMeta.description}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 tabular-nums">
                <div className="p-2 rounded-lg bg-black/45 border border-white/8">
                  <div className="text-[10px] text-slate-400">环节加速倍率</div>
                  <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                    {matrix.activeCell.speedup.toFixed(2)}x
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-black/45 border border-white/8">
                  <div className="text-[10px] text-slate-400">耗时压缩比例</div>
                  <div className="text-xl font-black font-mono text-gemini-cyan mt-0.5">
                    {matrix.activeCell.reductionPct >= 0
                      ? `-${matrix.activeCell.reductionPct}%`
                      : `+${Math.abs(matrix.activeCell.reductionPct)}%`}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-black/45 border border-white/10 text-[11px] text-slate-200 leading-relaxed">
              <span className="font-mono text-gemini-cyan">核心提效归因：</span>
              {matrix.activeCell.mechanism}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
