import Slide from "@/components/Slide";

export default function P39() {
  return (
    <Slide notes="Agent 治理是 Agent 的核心能力。Agent 可以自动管理研发合规。">
      <h2 className="text-6xl mb-8">Agent 治理：研发合规的自动化</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Compliance</h3>
            <p className="text-sm opacity-70">Agent 自动检查研发流程是否合规。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Governance</h3>
            <p className="text-sm opacity-70">Agent 自动管理研发资源和权限。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Governance Orchestrator</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
