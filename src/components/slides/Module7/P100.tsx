import Slide from "@/components/Slide";

export default function P100() {
  return (
    <Slide
      backgroundColor="#020205"
      notes="课程总结与行动清单：带走四件可立即投入实战的 Cursor 资产，并前往 Module 8 交互工具箱开始演练。"
    >
      <div className="flex flex-col justify-center items-center h-full text-center max-w-5xl mx-auto">
        <div className="text-xs font-mono text-gemini-cyan uppercase tracking-widest mb-3">
          Course Wrap-Up · Ship Your Product
        </div>
        <h1 className="text-5xl md:text-6xl mb-4 font-bold text-white">
          从创意到上线，现在开始构建
        </h1>
        <p className="text-lg text-gemini-cyan font-mono mb-8">
          Cursor AI Coding 独立开发者 &amp; 产品经理实战课
        </p>
        <div className="h-1 w-40 bg-white/15 mb-8" />
        <div className="grid grid-cols-4 gap-4 w-full text-left text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-gemini-cyan mb-1">ACTION 01</div>
            <div className="text-slate-200">用 JTBD + Plan 模式先定 PRD 与接口契约</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-gemini-purple mb-1">ACTION 02</div>
            <div className="text-slate-200">建立 AGENTS.md 与 .cursor/rules/*.mdc</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-emerald-400 mb-1">ACTION 03</div>
            <div className="text-slate-200">用 Debug + Git Checkpoint 稳步上线收费</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-amber-400 mb-1">ACTION 04</div>
            <div className="text-slate-200">继续探索 M8 沙盘 · M9 全栈图谱 · M10 审美库</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
