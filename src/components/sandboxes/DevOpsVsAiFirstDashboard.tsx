import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "d3-transition";
import { Cpu, GitBranch, Layers, RotateCcw, Users } from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type ReleaseScope = "feature" | "major" | "hotfix";

interface PhaseSpec {
  id: string;
  label: string;
  color: string;
  waterfallHours: number;
  aiFirstHours: number;
  note: string;
}

const SCOPE_MULTIPLIERS: Record<ReleaseScope, { label: string; factor: number }> = {
  hotfix: { label: "紧急热修 (Hotfix)", factor: 0.45 },
  feature: { label: "标准迭代 (Feature)", factor: 1.0 },
  major: { label: "跨模块大版本 (Major)", factor: 1.85 },
};

const COMPLEXITY_LABELS: Record<number, string> = {
  1: "小型 MVP (<15k LOC)",
  2: "轻量应用 (30k LOC)",
  3: "标准 SaaS (60k LOC)",
  4: "中型全栈 (120k LOC)",
  5: "复杂分布式 (250k+ LOC)",
};

export default function DevOpsVsAiFirstDashboard() {
  const [teamSize, setTeamSize] = useState<number>(8);
  const [complexityLevel, setComplexityLevel] = useState<number>(3);
  const [releaseScope, setReleaseScope] = useState<ReleaseScope>("feature");
  const [activePhaseId, setActivePhaseId] = useState<string>("coding");

  const ganttSvgRef = useRef<SVGSVGElement>(null);
  const curveSvgRef = useRef<SVGSVGElement>(null);

  const model = useMemo(() => {
    const scopeFactor = SCOPE_MULTIPLIERS[releaseScope].factor;

    // Traditional Waterfall scales poorly with team coordination (Brooks's Law) & codebase complexity
    const coordTaxTrad = 1 + 0.045 * Math.pow(Math.max(0, teamSize - 1), 1.18);
    const compFactorTrad = 0.65 + complexityLevel * 0.42;

    // AI-First mitigates coordination tax via AGENTS.md/.mdc isolation & Bugbot parallel review
    const coordTaxAi = 1 + 0.012 * Math.max(0, teamSize - 1);
    const compFactorAi = 0.55 + complexityLevel * 0.16;

    const phases: PhaseSpec[] = [
      {
        id: "spec",
        label: "01 需求拆解与架构",
        color: "#4cddec",
        waterfallHours: Number((18 * scopeFactor * coordTaxTrad * (0.7 + complexityLevel * 0.18)).toFixed(1)),
        aiFirstHours: Number((4.2 * scopeFactor * coordTaxAi * (0.75 + complexityLevel * 0.08)).toFixed(1)),
        note: "瀑布流需多轮会议评审 PRD；AI-First 用 Plan Mode + AGENTS.md 锁定接口契约。",
      },
      {
        id: "coding",
        label: "02 编码实现与联调",
        color: "#9b72cb",
        waterfallHours: Number((42 * scopeFactor * compFactorTrad * (1 + teamSize * 0.015)).toFixed(1)),
        aiFirstHours: Number((11.5 * scopeFactor * compFactorAi).toFixed(1)),
        note: "AI-First 通过 @Files + .mdc 规则作用域并行生成，大幅压缩手写与跨人等接口耗时。",
      },
      {
        id: "testing",
        label: "03 测试与回归验证",
        color: "#34d399",
        waterfallHours: Number((28 * scopeFactor * coordTaxTrad * (0.75 + complexityLevel * 0.22)).toFixed(1)),
        aiFirstHours: Number((5.8 * scopeFactor * (0.8 + complexityLevel * 0.1)).toFixed(1)),
        note: "传统模式测试滞后并集中返工；AI-First 随写随跑 tsc/lint/独立单测终端自愈。",
      },
      {
        id: "review",
        label: "04 CR 与安全审计",
        color: "#fbbf24",
        waterfallHours: Number((16 * scopeFactor * coordTaxTrad).toFixed(1)),
        aiFirstHours: Number((2.6 * scopeFactor * (0.85 + complexityLevel * 0.06)).toFixed(1)),
        note: "Bugbot + SAST 先行拦下死代码、密钥与竞态风险，人类主编只审架构边界。",
      },
      {
        id: "release",
        label: "05 部署与故障恢复",
        color: "#f472b6",
        waterfallHours: Number((12 * scopeFactor * (0.85 + teamSize * 0.025)).toFixed(1)),
        aiFirstHours: Number((1.9 * scopeFactor * (0.85 + complexityLevel * 0.04)).toFixed(1)),
        note: "瀑布流集中发版窗口风险高；AI-First 小步高频 CI/CD 流水线回滚成本极低。",
      },
    ];

    const totalWaterfallHours = phases.reduce((acc, p) => acc + p.waterfallHours, 0);
    const totalAiHours = phases.reduce((acc, p) => acc + p.aiFirstHours, 0);
    const waterfallDays = Number((totalWaterfallHours / 8).toFixed(1));
    const aiDays = Number((totalAiHours / 8).toFixed(1));
    const compressionPct = Math.round(((totalWaterfallHours - totalAiHours) / totalWaterfallHours) * 100);
    const speedup = Number((totalWaterfallHours / Math.max(0.5, totalAiHours)).toFixed(1));
    const savedHours = Math.round(totalWaterfallHours - totalAiHours);

    // Scaling curve across team sizes (1..40) at current complexity & scope
    const scaleCurve = [1, 4, 8, 12, 18, 25, 32, 40].map((t) => {
      const wTax = 1 + 0.045 * Math.pow(Math.max(0, t - 1), 1.18);
      const aTax = 1 + 0.012 * Math.max(0, t - 1);
      const wTotalDays =
        ((18 * (0.7 + complexityLevel * 0.18) * wTax +
          42 * compFactorTrad * (1 + t * 0.015) +
          28 * (0.75 + complexityLevel * 0.22) * wTax +
          16 * wTax +
          12 * (0.85 + t * 0.025)) *
          scopeFactor) /
        8;
      const aTotalDays =
        ((4.2 * (0.75 + complexityLevel * 0.08) * aTax +
          11.5 * compFactorAi +
          5.8 * (0.8 + complexityLevel * 0.1) +
          2.6 * (0.85 + complexityLevel * 0.06) +
          1.9 * (0.85 + complexityLevel * 0.04)) *
          scopeFactor) /
        8;
      return {
        team: t,
        waterfallDays: Number(wTotalDays.toFixed(1)),
        aiDays: Number(aTotalDays.toFixed(1)),
      };
    });

    return {
      phases,
      totalWaterfallHours,
      totalAiHours,
      waterfallDays,
      aiDays,
      compressionPct,
      speedup,
      savedHours,
      scaleCurve,
    };
  }, [teamSize, complexityLevel, releaseScope]);

  // D3 Chart 1: Stacked SDLC Phase Gantt / Bar Comparison
  useEffect(() => {
    const svgEl = ganttSvgRef.current;
    if (!svgEl) return;

    const width = 560;
    const height = 166;
    const margin = { top: 20, right: 20, bottom: 30, left: 108 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxHours = Math.max(24, model.totalWaterfallHours * 1.08);
    const x = d3.scaleLinear().domain([0, maxHours]).range([0, innerW]).nice();

    const tracks = ["传统瀑布流", "AI-First 闭环"];
    const y = d3.scaleBand<string>().domain(tracks).range([0, innerH]).padding(0.32);

    // Subtle vertical grid lines
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(innerH)
          .tickFormat(() => "")
      )
      .call((grid) => {
        grid.select(".domain").remove();
        grid
          .selectAll("line")
          .attr("stroke", "rgba(255,255,255,0.07)")
          .attr("stroke-dasharray", "3 3");
      });

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickFormat((d) => `${Number(d)}h`)
      )
      .call((axis) => {
        axis.select(".domain").attr("stroke", "rgba(255,255,255,0.2)");
        axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.2)");
        axis
          .selectAll("text")
          .attr("fill", "#94a3b8")
          .attr("font-size", "9.5px")
          .attr("font-family", "monospace");
      });

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .call((axis) => {
        axis.select(".domain").remove();
        axis
          .selectAll("text")
          .attr("fill", "#e2e8f0")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .attr("dx", "-6");
      });

    interface SegmentDatum {
      track: string;
      phase: PhaseSpec;
      x0: number;
      x1: number;
      hours: number;
    }

    const segments: SegmentDatum[] = [];
    let wCursor = 0;
    let aCursor = 0;
    for (const phase of model.phases) {
      segments.push({
        track: "传统瀑布流",
        phase,
        x0: wCursor,
        x1: wCursor + phase.waterfallHours,
        hours: phase.waterfallHours,
      });
      wCursor += phase.waterfallHours;

      segments.push({
        track: "AI-First 闭环",
        phase,
        x0: aCursor,
        x1: aCursor + phase.aiFirstHours,
        hours: phase.aiFirstHours,
      });
      aCursor += phase.aiFirstHours;
    }

    const rects = g
      .selectAll<SVGRectElement, SegmentDatum>("rect.phase-seg")
      .data(segments)
      .enter()
      .append("rect")
      .attr("class", "phase-seg")
      .attr("y", (d) => y(d.track) ?? 0)
      .attr("height", y.bandwidth())
      .attr("x", (d) => x(d.x0))
      .attr("width", 0)
      .attr("rx", 4)
      .attr("fill", (d) => d.phase.color)
      .attr("opacity", (d) => (d.phase.id === activePhaseId ? 0.98 : 0.72))
      .attr("stroke", (d) => (d.phase.id === activePhaseId ? "#ffffff" : "#070b14"))
      .attr("stroke-width", (d) => (d.phase.id === activePhaseId ? 1.5 : 1))
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        setActivePhaseId(d.phase.id);
      });

    rects
      .transition()
      .duration(380)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => Math.max(2, x(d.x1) - x(d.x0) - 1));

    // Track total annotations at end of each bar
    const totals = [
      { track: "传统瀑布流", total: model.totalWaterfallHours, color: "#cbd5e1" },
      { track: "AI-First 闭环", total: model.totalAiHours, color: "#4cddec" },
    ];
    g.selectAll<SVGTextElement, (typeof totals)[number]>("text.track-total")
      .data(totals)
      .enter()
      .append("text")
      .attr("class", "track-total")
      .attr("x", (d) => Math.min(innerW - 2, x(d.total) + 6))
      .attr("y", (d) => (y(d.track) ?? 0) + y.bandwidth() / 2 + 3.5)
      .attr("fill", (d) => d.color)
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("font-weight", "700")
      .text((d) => `${Math.round(d.total)}h (${(d.total / 8).toFixed(1)}d)`);
  }, [model, activePhaseId]);

  // D3 Chart 2: Scaling Curve across Team Size (Brooks's Law vs AI-First)
  useEffect(() => {
    const svgEl = curveSvgRef.current;
    if (!svgEl) return;

    const width = 440;
    const height = 160;
    const margin = { top: 14, right: 16, bottom: 26, left: 36 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([1, 40]).range([0, innerW]);
    const maxY = Math.max(10, d3.max(model.scaleCurve, (d) => d.waterfallDays) ?? 30);
    const y = d3.scaleLinear().domain([0, maxY * 1.1]).range([innerH, 0]).nice();

    // Grid
    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat(() => "")
      )
      .call((grid) => {
        grid.select(".domain").remove();
        grid
          .selectAll("line")
          .attr("stroke", "rgba(255,255,255,0.07)")
          .attr("stroke-dasharray", "3 3");
      });

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues([1, 8, 16, 24, 32, 40])
          .tickFormat((d) => `${Number(d)}人`)
      )
      .call((axis) => {
        axis.select(".domain").attr("stroke", "rgba(255,255,255,0.2)");
        axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.2)");
        axis
          .selectAll("text")
          .attr("fill", "#94a3b8")
          .attr("font-size", "9px")
          .attr("font-family", "monospace");
      });

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickFormat((d) => `${Number(d)}d`)
      )
      .call((axis) => {
        axis.select(".domain").remove();
        axis.selectAll("line").remove();
        axis
          .selectAll("text")
          .attr("fill", "#94a3b8")
          .attr("font-size", "9px")
          .attr("font-family", "monospace");
      });

    type CurvePt = (typeof model.scaleCurve)[number];
    const lineTrad = d3
      .line<CurvePt>()
      .x((d) => x(d.team))
      .y((d) => y(d.waterfallDays))
      .curve(d3.curveMonotoneX);

    const lineAi = d3
      .line<CurvePt>()
      .x((d) => x(d.team))
      .y((d) => y(d.aiDays))
      .curve(d3.curveMonotoneX);

    const areaAi = d3
      .area<CurvePt>()
      .x((d) => x(d.team))
      .y0(innerH)
      .y1((d) => y(d.aiDays))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(model.scaleCurve)
      .attr("d", areaAi)
      .attr("fill", "rgba(76, 221, 236, 0.14)");

    g.append("path")
      .datum(model.scaleCurve)
      .attr("d", lineTrad)
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5 4");

    g.append("path")
      .datum(model.scaleCurve)
      .attr("d", lineAi)
      .attr("fill", "none")
      .attr("stroke", "#4cddec")
      .attr("stroke-width", 2.5);

    // Current teamSize marker line & points
    const curX = x(teamSize);
    g.append("line")
      .attr("x1", curX)
      .attr("y1", 0)
      .attr("x2", curX)
      .attr("y2", innerH)
      .attr("stroke", "rgba(155, 114, 203, 0.65)")
      .attr("stroke-width", 1.5);

    g.append("circle")
      .attr("cx", curX)
      .attr("cy", y(model.waterfallDays))
      .attr("r", 4)
      .attr("fill", "#94a3b8")
      .attr("stroke", "#040711")
      .attr("stroke-width", 1.5);

    g.append("circle")
      .attr("cx", curX)
      .attr("cy", y(model.aiDays))
      .attr("r", 4.5)
      .attr("fill", "#4cddec")
      .attr("stroke", "#040711")
      .attr("stroke-width", 1.5);
  }, [model, teamSize]);

  const activePhase =
    model.phases.find((p) => p.id === activePhaseId) ?? model.phases[1];

  const handleReset = () => {
    setTeamSize(8);
    setComplexityLevel(3);
    setReleaseScope("feature");
    setActivePhaseId("coding");
  };

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
            LAB 10 · DEVOPS VS AI-FIRST 对比仪表盘（D3.JS SDLC 动态可视化）
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            传统瀑布流开发 vs AI-First 闭环开发：研发周期与规模扩展对比
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(SCOPE_MULTIPLIERS) as ReleaseScope[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setReleaseScope(key)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                releaseScope === key
                  ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {SCOPE_MULTIPLIERS[key].label}
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

      {/* Controls + KPI Strip */}
      <div className="grid grid-cols-12 gap-3 mb-3.5 items-stretch text-xs">
        {/* Team Size & Codebase Complexity Controls (6 cols) */}
        <div className="col-span-6 p-3 rounded-xl bg-white/[0.035] border border-white/10 grid grid-cols-2 gap-4 tabular-nums">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gemini-cyan" />
                <span>团队人数规模</span>
              </span>
              <span className="font-mono font-bold text-gemini-cyan">{teamSize} 人</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              aria-label="团队人数规模"
              className="w-full accent-[#4cddec] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
              <span>1人独立</span>
              <span>15人小队</span>
              <span>40人多组</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gemini-purple" />
                <span>代码库复杂度</span>
              </span>
              <span className="font-mono font-bold text-gemini-purple">Lv.{complexityLevel}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={complexityLevel}
              onChange={(e) => setComplexityLevel(Number(e.target.value))}
              aria-label="代码库复杂度"
              className="w-full accent-[#9b72cb] cursor-pointer"
            />
            <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
              {COMPLEXITY_LABELS[complexityLevel]}
            </div>
          </div>
        </div>

        {/* 3 KPI Summary Cards (6 cols) */}
        <div className="col-span-6 grid grid-cols-3 gap-2.5 tabular-nums">
          <div className="p-3 rounded-xl bg-black/45 border border-white/10">
            <div className="text-[10px] font-mono text-slate-400">传统瀑布流周期</div>
            <div className="text-xl font-black font-mono text-slate-200 mt-0.5">
              {model.waterfallDays} 天
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              总计 {Math.round(model.totalWaterfallHours)} 小时
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/35">
            <div className="text-[10px] font-mono text-gemini-cyan">AI-First 闭环周期</div>
            <div className="text-xl font-black font-mono text-white mt-0.5">
              {model.aiDays} 天
            </div>
            <div className="text-[10px] font-mono text-emerald-400">
              加速 {model.speedup}x · -{model.compressionPct}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/35">
            <div className="text-[10px] font-mono text-emerald-300">单周期净省人时</div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              {model.savedHours}h
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              主要消解等待与返工
            </div>
          </div>
        </div>
      </div>

      {/* D3 Visualizations Row */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 7 cols: D3 Stacked SDLC Gantt + Phase Inspector */}
        <div className="col-span-7 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-white inline-flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>D3.js 研发阶段周期分解（点击色块查看阶段对比）</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">按 8h/工作日折算</span>
          </div>

          <svg
            ref={ganttSvgRef}
            viewBox="0 0 560 166"
            className="w-full h-[154px]"
            role="img"
            aria-label="D3.js 传统瀑布流与 AI-First 闭环开发阶段周期堆叠对比图"
          />

          {/* Interactive Phase Legend + Active Detail */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {model.phases.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhaseId(p.id)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono border transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    p.id === activePhase.id
                      ? "bg-white/12 border-white/40 text-white"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-xs inline-block shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-black/45 border border-white/8 flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-200 leading-relaxed min-w-0">
                <strong className="text-white">{activePhase.label}：</strong>
                {activePhase.note}
              </div>
              <div className="text-right font-mono tabular-nums shrink-0">
                <div className="text-[11px] text-gemini-cyan font-bold">
                  {activePhase.waterfallHours}h → {activePhase.aiFirstHours}h
                </div>
                <div className="text-[10px] text-emerald-400">
                  压缩 {Math.round(((activePhase.waterfallHours - activePhase.aiFirstHours) / activePhase.waterfallHours) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: D3 Team & Complexity Scaling Curve */}
        <div className="col-span-5 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-white inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-gemini-purple" />
              <span>D3.js 规模扩展曲线（1 → 40 人）</span>
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-slate-400">-- 瀑布流</span>
              <span className="text-gemini-cyan">— AI-First</span>
            </div>
          </div>

          <svg
            ref={curveSvgRef}
            viewBox="0 0 440 160"
            className="w-full h-[168px]"
            role="img"
            aria-label="D3.js 团队规模与研发周期对比曲线图"
          />

          <div className="p-2.5 rounded-lg bg-gemini-purple/10 border border-gemini-purple/30 text-[11px] text-slate-200 leading-relaxed">
            <strong className="text-gemini-purple">规模法则洞察：</strong>
            当团队扩展至 <span className="font-mono text-white">{teamSize}</span> 人且复杂度达到{" "}
            <span className="font-mono text-white">Lv.{complexityLevel}</span> 时，传统瀑布流受限于沟通协调熵增呈指数拖慢；而 AI-First 通过{" "}
            <code className="text-white">.mdc</code> 规则隔离与 Bugbot 自动评审，把交付周期稳定锁在{" "}
            <span className="font-mono text-gemini-cyan font-bold">{model.aiDays} 天</span>。
          </div>
        </div>
      </div>
    </div>
  );
}
