import Slide from "@/components/Slide";

export default function P1() {
  return (
    <Slide
      backgroundColor="#020205"
      notes="欢迎来到基于 Cursor IDE 的 AI Coding 实战课。无论你是独立开发者还是产品经理，核心不再是死记语法，而是通过 Plan 模式、.cursor/rules 与 MCP 把想法从 0 到 1 确定性上线。"
    >
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-xs font-mono text-gemini-cyan uppercase tracking-[0.2em] mb-3">
          Cursor AI Coding · 独立开发者 &amp; 产品经理实战课
        </div>
        <h1 className="text-5xl md:text-6xl mb-4 leading-tight font-bold text-white">
          AI Coding<br />
          <span className="text-gemini-purple">Cursor 确定性研发范式革命</span>
        </h1>
        <p className="text-lg font-mono text-gemini-cyan/85 mb-6 max-w-3xl">
          从模糊创意 ➔ Plan 规格蓝图 ➔ Rules 上下文工程 ➔ Agent &amp; MCP 全栈上线
        </p>
        <div className="h-1 w-24 bg-gemini-cyan mb-8" />
        <div className="grid grid-cols-3 gap-4 max-w-4xl">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-gemini-cyan mb-1">01 · 核心引擎</div>
            <div className="text-sm font-semibold text-white">Cmd+I Plan/Agent 与 Tab 连击</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-gemini-purple mb-1">02 · 确定性护栏</div>
            <div className="text-sm font-semibold text-white">.cursor/rules (.mdc) &amp; AGENTS.md</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-emerald-400 mb-1">03 · 异步上线闭环</div>
            <div className="text-sm font-semibold text-white">MCP 联调 · Background Agents · Bugbot</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
