import Slide from "@/components/Slide";

export default function P81() {
  return (
    <Slide backgroundColor="#050510" notes="Module 6: 当代码库具备完整的 AGENTS.md、.cursor/rules 与自动化 DoD，独立开发者就可以把重复改动交给 Background Agents、Cursor CLI 与 Bugbot，实现从 Issue 到可合入 PR 的异步流水线。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-gemini-cyan text-xs font-mono uppercase tracking-widest mb-3">Module 6</div>
        <h1 className="text-5xl md:text-6xl mb-4 leading-tight font-bold text-white">
          异步交付革命：<br />
          <span className="text-gemini-cyan">Background Agents · CLI · Bugbot</span>
        </h1>
        <p className="text-lg font-mono text-gemini-purple/90 mb-6">
          Issue / Todo ➔ 云端 Background Agent 并行开分支 ➔ Bugbot 自动审查 ➔ 人类 2 分钟合并
        </p>
        <div className="h-1 w-24 bg-gemini-cyan mb-6" />
        <p className="text-sm text-slate-300 max-w-2xl">
          独立开发者白天的精力应该用来打磨产品体验和获客增长，把修边缘 Bug、升级依赖与补测试交给云端异步运行的 Cursor Agent。
        </p>
      </div>
    </Slide>
  );
}
