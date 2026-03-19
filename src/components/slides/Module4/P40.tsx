import Slide from "@/components/Slide";

export default function P40() {
  return (
    <Slide notes="Agent 核心能力总结。从工具到 Agent 的全面演进。">
      <h2 className="text-6xl mb-8">Agent 核心能力总结</h2>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="text-xl mb-2">Browser Use</h3>
            <p className="text-sm opacity-70">Agent 的眼睛和手。</p>
          </div>
          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h3 className="text-xl mb-2">Grounding</h3>
            <p className="text-sm opacity-70">Agent 的实时大脑。</p>
          </div>
          <div className="p-4 bg-gemini-purple/20 rounded border border-gemini-purple/50">
            <h3 className="text-xl mb-2">Agentic Workflow</h3>
            <p className="text-sm opacity-70 font-bold">Agent 的协作与闭环。</p>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-white/10 via-gemini-purple to-gemini-cyan"></div>
      </div>
    </Slide>
  );
}
