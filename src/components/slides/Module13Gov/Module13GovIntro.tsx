import Slide from "@/components/Slide";
import { AlertTriangle, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";

const M13_GOV_DISCLAIMER =
  "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。";

export default function Module13GovIntro() {
  return (
    <Slide
      backgroundColor="#040711"
      notes={`Module 13-Gov 为非技术学习者与产品经理设计的无代码产品与治理 Capstone。${M13_GOV_DISCLAIMER}`}
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
          Module 13-Gov · 无代码治理 Capstone · PM / 非技术路径终点
        </div>
        <h1 className="text-4xl sm:text-5xl mb-4 leading-tight text-white font-bold">
          Agent 系统产品与{" "}
          <span className="text-gemini-purple">治理 Capstone（无代码版）</span>
        </h1>
        <p className="text-base font-mono text-gemini-cyan/85 mb-5 max-w-4xl">
          基于 M11 产品蓝图与预制执行轨迹完成风险审查、HITL 审批签字与上线准出判定
        </p>

        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/50 text-xs text-amber-100 flex items-center gap-2.5 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-semibold">{M13_GOV_DISCLAIMER}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-cyan">
              <FileText className="w-4 h-4" />
              <span>交付物 01 · 双 PRD 对齐</span>
            </div>
            <div className="text-sm font-bold text-white">Data PRD + Prompt PRD</div>
            <p className="text-slate-300 leading-relaxed">
              明确数据源权限字段（<code className="text-white">tenantId / role</code>）、Tombstone 下线规则与无引用拒答阈值。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-purple">
              <ShieldCheck className="w-4 h-4" />
              <span>交付物 02 · HITL 审批矩阵</span>
            </div>
            <div className="text-sm font-bold text-white">人工接管与熔断责任表</div>
            <p className="text-slate-300 leading-relaxed">
              对高危写操作、资金入账与低置信度回答标定人类审批人、SLA 与降级回退方案。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <ClipboardCheck className="w-4 h-4" />
              <span>交付物 03 · 轨迹治理评审</span>
            </div>
            <div className="text-sm font-bold text-white">Go / Conditional / No-Go 审签</div>
            <p className="text-slate-300 leading-relaxed">
              在下一张沙盘 Lab 20 中审查预制事故轨迹，识别越权与幻觉并签发可执行工程整改单。
            </p>
          </div>
        </div>

        <div className="mt-5 text-xs text-slate-400">
          → 右滑进入 Lab 20 无代码 Agent 预制轨迹风险评估与评审台
        </div>
      </div>
    </Slide>
  );
}
