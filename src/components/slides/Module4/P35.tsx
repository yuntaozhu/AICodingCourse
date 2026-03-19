import Slide from "@/components/Slide";

export default function P35() {
  return (
    <Slide notes="Agent 协作是 Agent 的核心能力。多个 Agent 可以协作完成任务。">
      <h2 className="text-6xl mb-8">Agent 协作：从孤立到协同</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Multi-Agent Collaboration</h3>
            <p className="text-sm opacity-70">多个 Agent 协作完成复杂的研发任务。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Agent Orchestration</h3>
            <p className="text-sm opacity-70">Agent 编排器自动分配和管理任务。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Agent Orchestrator</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
