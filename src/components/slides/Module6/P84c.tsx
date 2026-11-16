import Slide from "@/components/Slide";

export default function P84c() {
  return (
    <Slide backgroundColor="#020205" notes="Agentic Workflow 的核心在于‘协作’。在 AI Native 时代，我们不再是管理程序员，而是管理一个由不同专业 Agent 组成的‘数字研发团队’。每个 Agent 都有明确的角色、工具集和 DoD 标准。通过标准化的通信协议和任务编排，它们能够高效协同，完成从需求到上线的全流程。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">Agentic Workflow：构建数字研发团队</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="text-4xl">📐</div>
            <h3 className="text-xl font-bold text-gemini-purple">Architect Agent</h3>
            <p className="text-xs opacity-60">负责需求解析、SDD 生成与架构对齐。它是团队的“大脑”。</p>
            <div className="text-[10px] font-mono bg-black/40 p-2 rounded border border-white/5 text-gemini-cyan">Tool: SDD Generator</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="text-4xl">💻</div>
            <h3 className="text-xl font-bold text-gemini-purple">Coder Agent</h3>
            <p className="text-xs opacity-60">负责代码实现、单元测试编写与 Bug 修复。它是团队的“双手”。</p>
            <div className="text-[10px] font-mono bg-black/40 p-2 rounded border border-white/5 text-gemini-cyan">Tool: Code Editor</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center space-y-4">
            <div className="text-4xl">🛡️</div>
            <h3 className="text-xl font-bold text-gemini-purple">Reviewer Agent</h3>
            <p className="text-xs opacity-60">负责 DoD 验证、安全扫描与性能评估。它是团队的“守卫”。</p>
            <div className="text-[10px] font-mono bg-black/40 p-2 rounded border border-white/5 text-gemini-cyan">Tool: DoD Validator</div>
          </div>
        </div>
        <div className="mt-12 p-6 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30 text-center">
          <p className="text-lg font-bold">“从‘单兵作战’到‘军团协同’：定义 AI Native 研发的新组织形式。”</p>
        </div>
      </div>
    </Slide>
  );
}
