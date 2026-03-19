import Slide from "@/components/Slide";

export default function P10() {
  return (
    <Slide notes="AI Native 研发范式的演进。从 Copilot 到 Agentic Workflow。">
      <h2 className="text-6xl mb-8">AI Native 研发范式的演进</h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="text-xl mb-2">Copilot Era</h3>
            <p className="text-sm opacity-70">AI 作为副驾驶，辅助代码补全。</p>
          </div>
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="text-xl mb-2">Agentic Era</h3>
            <p className="text-sm opacity-70">AI 作为 Agent，独立完成任务。</p>
          </div>
          <div className="p-4 bg-gemini-purple/20 rounded border border-gemini-purple/50">
            <h3 className="text-xl mb-2">AI Native Era</h3>
            <p className="text-sm opacity-70 font-bold">AI 作为架构意志，全面托管研发。</p>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-white/10 via-gemini-purple to-gemini-cyan"></div>
      </div>
    </Slide>
  );
}
