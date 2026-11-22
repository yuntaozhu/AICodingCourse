import Slide from "@/components/Slide";
import { AlertTriangle, CheckCircle2, Layers, ShieldCheck } from "lucide-react";

export default function Module13EngIntro() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Module 13-Eng 是工程化 Capstone，综合 M8 长程 Coding Harness、M11 蓝图与 M12 运行时 ACL/Tombstone 服务，要求用双层自动化 Eval 证明生产上线就绪度。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
          Module 13-Eng · 工程版 Capstone · 独立开发者 / 工程团队 / 高校学生终点
        </div>
        <h1 className="text-4xl sm:text-5xl mb-4 leading-tight text-white font-bold">
          生产级 Agent、{" "}
          <span className="text-gemini-purple">Harness 与运行时 KB 工程 Capstone</span>
        </h1>
        <p className="text-base font-mono text-gemini-cyan/85 mb-6 max-w-4xl">
          串联 M8 五类长程 Coding Harness + M11 产品蓝图 + M12 ACL Pre-filter / Tombstone / 预算熔断
        </p>

        <div className="grid grid-cols-3 gap-4 text-xs mb-5">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-cyan">
              <Layers className="w-4 h-4" />
              <span>交付支柱 1 · Coding Harness</span>
            </div>
            <div className="text-sm font-bold text-white">五要素研发护栏</div>
            <p className="text-slate-300 leading-relaxed">
              提交 <code className="text-white">AGENTS.md</code>、路径 <code className="text-white">.mdc</code>、最小特权 MCP 与长程 <code className="text-white">init.sh</code> 验证脚本。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-purple">
              <ShieldCheck className="w-4 h-4" />
              <span>交付支柱 2 · 运行时隔离</span>
            </div>
            <div className="text-sm font-bold text-white">真实服务 + 强鉴权检索</div>
            <p className="text-slate-300 leading-relaxed">
              后端路由在检索前强制过滤 <code className="text-white">tenantId + role + active</code>，对写操作实施 HITL 审批挂起与步数熔断。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>交付支柱 3 · Dual Eval 实证</span>
            </div>
            <div className="text-sm font-bold text-white">可重复命令行测试退出码 0</div>
            <p className="text-slate-300 leading-relaxed">
              同时跑通检索侧与 Agent 端到端侧评测集，保留跨租户越权、过期文档与死循环三类负向探针回归结果。
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-400/35 text-xs text-rose-200 flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>
            <strong className="text-white">硬性验收红线：</strong>禁止仅凭“3 条正向 Demo 对话能跑通”宣告 Capstone 合格；必须给出 ACL 越权探针、Tombstone 淘汰与成本熔断的可重复测试证据。
          </span>
        </div>
      </div>
    </Slide>
  );
}
