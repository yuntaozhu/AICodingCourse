import Slide from "@/components/Slide";
import { Compass, FileCheck2, ShieldAlert, Workflow } from "lucide-react";

export default function Module11Intro() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Module 11 是 Track 3（Agent 产品、运行时知识库与双轨 Capstone）的起点，面向产品经理、非技术学习者与工程师共同对齐 Agent 系统蓝图。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
          Module 11 · Track 3 起点 · Agent Product &amp; Governance Blueprint
        </div>
        <h1 className="text-4xl sm:text-5xl mb-4 leading-tight text-white font-bold">
          Agent 产品蓝图、{" "}
          <span className="text-gemini-purple">Workflow 决策与治理架构</span>
        </h1>
        <p className="text-base font-mono text-gemini-cyan/85 mb-6 max-w-4xl">
          从“使用 Coding Agent 写代码”跨入“设计、约束并验收可部署到产品中的自主 Agent 系统”
        </p>
        <div className="h-1 w-24 bg-gemini-purple mb-6" />

        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-cyan">
              <Compass className="w-4 h-4" />
              <span>01 先决边界</span>
            </div>
            <div className="text-sm font-bold text-white">无代码也能设计蓝图</div>
            <p className="text-slate-300 leading-relaxed">
              前置仅要求三层全栈职责认知（M9），不要求先会写 LangGraph 或向量库代码；PM 与架构师在此对齐规格。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-purple">
              <Workflow className="w-4 h-4" />
              <span>02 编排选型</span>
            </div>
            <div className="text-sm font-bold text-white">Workflow 优先于 Agent</div>
            <p className="text-slate-300 leading-relaxed">
              流程可枚举的账单、审批与表单类任务一律用确定性 Workflow，仅在开放路径规划时才启用有限步数 Agent。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
              <span>03 双 PRD 交付</span>
            </div>
            <div className="text-sm font-bold text-white">Data PRD + Prompt PRD</div>
            <p className="text-slate-300 leading-relaxed">
              一份说清数据源、权限字段与 Tombstone 淘汰策略；另一份锁定工具白名单、预算上限与无依据拒答阈值。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>04 双轨 Capstone 分流</span>
            </div>
            <div className="text-sm font-bold text-white">M13-Gov 与 M13-Eng</div>
            <p className="text-slate-300 leading-relaxed">
              PM/非技术学员可直接走向 <strong className="text-white">M13-Gov</strong> 模拟治理评审；工程师则衔接 M12 走向 <strong className="text-white">M13-Eng</strong>。
            </p>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-[#0b0f19] border border-white/15 text-xs text-slate-300 flex items-center justify-between gap-4">
          <span>
            关键划分：<strong className="text-white">产品蓝图责任不可外包给模型</strong>——数据源准入、ACL 租户字段、高风险写操作 HITL 审批线必须由业务与产研共同签字落盘。
          </span>
          <span className="font-mono text-gemini-cyan shrink-0">→ 右滑查看 Workflow vs Agent 决策树</span>
        </div>
      </div>
    </Slide>
  );
}
