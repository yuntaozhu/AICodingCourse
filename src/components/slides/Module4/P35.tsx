import Slide from "@/components/Slide";

export default function P35() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 协作是 Agent 的核心能力。多个 Agent 可以协作完成任务。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text text-center">
            Agent 协作：从孤立到协同
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="flex flex-col justify-center gap-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-cyan">Multi-Agent Collaboration</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  单个 Agent 的能力有限，但通过多 Agent 协作，我们可以模拟真实的研发团队。每个 Agent 专注于特定领域，通过高效的通信协议共同解决复杂问题。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-purple">Agent Orchestration</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  引入编排器（Orchestrator）角色，负责任务拆解、资源分配、冲突解决 and 质量把控，实现从“单兵作战”到“军团作战”的跨越。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-72 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="text-4xl animate-pulse">🤝</div>
                    <div className="text-xl font-mono text-gemini-cyan">Agent Orchestrator</div>
                    <div className="text-xs opacity-40">"Coordinating multiple specialized agents..."</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">ROLE-BASED COLLABORATION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Role-Based Collaboration */}
      <Slide backgroundColor="#050505" notes="不同角色的 Agent 协作完成研发全流程。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">ROLE-BASED COLLABORATION</div>
          <h3 className="text-3xl mb-6 font-bold text-white">角色化协作：模拟真实团队</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">💻</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-cyan">Coder Agent</h4>
              <p className="text-[10px] opacity-60 leading-tight">专注于代码编写 and 重构，严格遵循设计规范 and 代码风格。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🔍</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-purple">Reviewer Agent</h4>
              <p className="text-[10px] opacity-60 leading-tight">负责代码审查，识别潜在的逻辑错误、性能瓶颈 and 安全隐患。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🧪</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-cyan">Tester Agent</h4>
              <p className="text-[10px] opacity-60 leading-tight">自动生成测试用例并执行，确保代码变更不影响现有功能。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Dynamic Orchestration */}
      <Slide backgroundColor="#050505" notes="编排器根据反馈动态调整工作流。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">DYNAMIC ORCHESTRATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">动态编排：自适应工作流</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">闭环反馈机制</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                编排器根据 Reviewer or Tester 的反馈，自动将任务打回 Coder 进行修复，形成闭环，直到满足交付标准。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">弹性任务分配</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                根据任务的复杂度 and 当前各 Agent 的负载，动态调整协作策略，确保研发资源的最优利用。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
