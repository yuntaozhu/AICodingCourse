import Slide from "@/components/Slide";

export default function P31() {
  return (
    <Slide backgroundColor="#050510" notes="欢迎来到第四模块。在完成全量代码理解与实战演练后，我们将深入 Agent 工程底座：从 SDD 蓝图到 Browser Use、Grounding、安全代理与多 Agent 编排。">
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <h2 className="text-gemini-cyan text-xs uppercase tracking-widest mb-3">Module 4</h2>
        <h1 className="text-6xl mb-4 leading-tight text-white font-bold">Agent 工程架构：<br /><span className="text-gemini-purple">SDD 与全链路自主协同</span></h1>
        <p className="text-xl font-mono text-gemini-purple opacity-80 mb-6">Browser Use · Grounding · Security Agent · Orchestration</p>
        <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
        <p className="text-sm text-white/50">向右翻页探索 11 节深度课程内容 →</p>
      </div>
    </Slide>
  );
}
