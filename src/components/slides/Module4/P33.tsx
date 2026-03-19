import Slide from "@/components/Slide";

export default function P33() {
  return (
    <Slide notes="Grounding 是 Agent 的核心能力。Agent 可以基于实时信息进行决策。">
      <h2 className="text-6xl mb-8">Grounding: Agent 的实时大脑</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Real-time Information</h3>
            <p className="text-sm opacity-70">Agent 基于实时搜索结果进行决策。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Contextual Grounding</h3>
            <p className="text-sm opacity-70">Agent 基于特定上下文进行决策。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Grounding Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
