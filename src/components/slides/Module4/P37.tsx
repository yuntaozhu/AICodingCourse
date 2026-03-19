import Slide from "@/components/Slide";

export default function P37() {
  return (
    <Slide notes="Agent 编排是 Agent 的核心能力。Agent 可以自动管理研发流程。">
      <h2 className="text-6xl mb-8">Agent 编排：研发流程的自动化</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated CI/CD</h3>
            <p className="text-sm opacity-70">Agent 自动管理代码集成和部署流程。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Release</h3>
            <p className="text-sm opacity-70">Agent 自动管理版本发布流程。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">CI/CD Orchestrator</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
