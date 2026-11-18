import Slide from "@/components/Slide";

export default function P84c() {
  return (
    <Slide backgroundColor="#020205" notes="面向独立开发者的 Cursor 全链路角色编排：Plan 定规格、Agent 写代码、Background Agent 异步测试、Bugbot 把关 PR。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
          Cursor 全链路协同：独立开发者的“四重数字角色”
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-mono text-gemini-cyan">01 · PLANNER</div>
            <h3 className="text-lg font-bold text-white">Plan 模式</h3>
            <p className="text-xs text-slate-300 leading-relaxed">输出 SDD 数据契约、API 路由与风险拆解清单，人审后再动手。</p>
            <div className="text-[11px] font-mono bg-black/40 p-2 rounded border border-white/5 text-gemini-cyan">
              Cmd+I (Shift+Tab)
            </div>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-mono text-gemini-purple">02 · BUILDER</div>
            <h3 className="text-lg font-bold text-white">Foreground Agent</h3>
            <p className="text-xs text-slate-300 leading-relaxed">挂载 .mdc 规则与 Figma/DB MCP，多文件协同落地核心业务。</p>
            <div className="text-[11px] font-mono bg-black/40 p-2 rounded border border-white/5 text-gemini-purple">
              Agent + MCP
            </div>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-mono text-emerald-400">03 · ASYNC WORKER</div>
            <h3 className="text-lg font-bold text-white">Background Agent</h3>
            <p className="text-xs text-slate-300 leading-relaxed">云端独立分支异步补齐边界测试、响应式修补与迁移脚本。</p>
            <div className="text-[11px] font-mono bg-black/40 p-2 rounded border border-white/5 text-emerald-400">
              Cloud Sandbox PR
            </div>
          </div>
          <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="text-xs font-mono text-amber-400">04 · GUARDIAN</div>
            <h3 className="text-lg font-bold text-white">Cursor Bugbot</h3>
            <p className="text-xs text-slate-300 leading-relaxed">自动审查 PR Diff 安全漏洞与性能隐患，一键 Fix in Cursor。</p>
            <div className="text-[11px] font-mono bg-black/40 p-2 rounded border border-white/5 text-amber-400">
              PR Diff Review
            </div>
          </div>
        </div>
        <div className="mt-8 p-5 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/25 text-center">
          <p className="text-base font-bold text-white">
            “个人开发者不再缺人手，缺的是把规范写进 Rules 并让 Agent 闭环验收的能力。”
          </p>
        </div>
      </div>
    </Slide>
  );
}
