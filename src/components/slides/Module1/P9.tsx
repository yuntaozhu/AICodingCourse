import Slide from "@/components/Slide";

export default function P9() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agentic Workflow 是 AI Native 的核心。Agent 不再是孤立的工具，而是协作的团队。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            Agentic Workflow: 协作的艺术
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed font-light opacity-90">
                Agentic Workflow 是 AI Native 的核心。Agent 不再是孤立的工具，而是协作的团队。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">🤝</div>
                  <div>
                    <div className="font-bold text-sm">Agent 协作：从 Intent 到 Code</div>
                    <div className="text-xs opacity-60">多角色分工，模拟人类研发团队。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">🔄</div>
                  <div>
                    <div className="font-bold text-sm">Agent 闭环：从 Code 到 Test</div>
                    <div className="text-xs opacity-60">自我纠错，直到通过所有验证。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-gemini-cyan text-xl">🚀</div>
                  <div>
                    <div className="font-bold text-sm">Agent 编排：从 Test 到 Deploy</div>
                    <div className="text-xs opacity-60">全链路自动化，释放人类生产力。</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-gemini-purple/30 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gemini-purple opacity-40">WORKFLOW_V1.0.MD</div>
              <pre className="text-xs leading-relaxed"><code className="language-markdown">{`# Agent: Architect
# Agent: Developer
# Agent: Tester
# Agent: Security Auditor
# Workflow: Architect -> Developer -> Tester -> Security Auditor`}</code></pre>
              <div className="absolute bottom-3 right-3 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">WORKFLOW DETAILS ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Multi-Agent Collaboration */}
      <Slide backgroundColor="#050505" notes="多 Agent 协作是解决复杂问题的关键。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">多 Agent 协作 (Multi-Agent Collaboration)</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-2 font-bold text-sm"># Architect Agent</div>
              <p className="text-xs opacity-70 leading-relaxed">
                负责全局架构设计，拆解任务，定义接口规范。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-2 font-bold text-sm"># Developer Agent</div>
              <p className="text-xs opacity-70 leading-relaxed">
                负责具体模块的实现，遵循 Architect 定义的规范。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-2 font-bold text-sm"># QA Agent</div>
              <p className="text-xs opacity-70 leading-relaxed">
                负责编写测试用例，执行测试，反馈 Bug 给 Developer。
              </p>
            </div>
          </div>
          <div className="mt-8 p-6 bg-gemini-cyan/5 rounded-2xl border border-gemini-cyan/20 font-mono text-[10px] text-gemini-cyan/80">
            {`// Multi-Agent Interaction Example
Architect: "Define OrderService interface."
Developer: "Implement OrderService in Go."
QA: "Run integration tests for OrderService."
Developer: "Fixing race condition found by QA."`}
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Self-Correction Loop */}
      <Slide backgroundColor="#050505" notes="自我纠错是 Agent 智能的体现。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-purple">自我纠错闭环 (Self-Correction Loop)</h3>
          <div className="flex gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-lg">🔍</div>
                <div>
                  <h4 className="font-bold text-sm">错误检测</h4>
                  <p className="text-xs opacity-60">自动捕获编译错误、测试失败和 Lint 警告。</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-lg">🛠️</div>
                <div>
                  <h4 className="font-bold text-sm">自动修复</h4>
                  <p className="text-xs opacity-60">Agent 分析错误日志，自动修改代码并重新验证。</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-lg">📈</div>
                <div>
                  <h4 className="font-bold text-sm">持续进化</h4>
                  <p className="text-xs opacity-60">通过多次迭代，代码质量不断逼近 100% 合规。</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-5 bg-black/60 rounded-2xl border border-white/10 font-mono text-[9px] leading-tight text-white/40">
              <div className="text-gemini-purple mb-2">// Self-Correction Session</div>
              <div className="text-white/80">Developer: Generated code for /api/orders</div>
              <div className="text-red-400/80">Tester: Test failed! Error: 404 Not Found</div>
              <div className="text-white/80">Developer: Analyzing... Found missing route registration.</div>
              <div className="text-white/80">Developer: Fixed route. Re-submitting.</div>
              <div className="text-green-400/80">Tester: All tests passed!</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Case Study - Building an Agent R&D Team */}
      <Slide backgroundColor="#050505" notes="如何建立一个高效的 Agent 研发团队。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">CASE STUDY</div>
          <h3 className="text-3xl mb-8 font-bold text-white">案例：建立 Agent 研发团队</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-cyan font-bold mb-4">团队配置 (Team Setup)</h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="text-lg">👑</div>
                  <div>
                    <div className="text-xs font-bold">Product Agent</div>
                    <div className="text-[10px] opacity-50">负责需求分析和 PRD 生成。</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-lg">📐</div>
                  <div>
                    <div className="text-xs font-bold">Architect Agent</div>
                    <div className="text-[10px] opacity-50">负责技术选型和 SDD 编写。</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="text-lg">👨‍💻</div>
                  <div>
                    <div className="text-xs font-bold">Coding Agent</div>
                    <div className="text-[10px] opacity-50">负责代码实现和单元测试。</div>
                  </div>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-purple font-bold mb-4">协同机制 (Collaboration)</h4>
              <div className="space-y-4">
                <div className="p-3 bg-gemini-purple/5 rounded-lg border border-gemini-purple/20">
                  <div className="text-[10px] font-bold mb-1">异步通信 (Async Pub/Sub)</div>
                  <p className="text-[9px] opacity-60">Agent 之间通过消息队列交换任务状态，互不阻塞。</p>
                </div>
                <div className="p-3 bg-gemini-purple/5 rounded-lg border border-gemini-purple/20">
                  <div className="text-[10px] font-bold mb-1">共享上下文 (Shared Context)</div>
                  <p className="text-[9px] opacity-60">所有 Agent 共享同一个代码库和设计文档的实时视图。</p>
                </div>
                <div className="p-3 bg-gemini-purple/5 rounded-lg border border-gemini-purple/20">
                  <div className="text-[10px] font-bold mb-1">人类介入 (Human-in-the-loop)</div>
                  <p className="text-[9px] opacity-60">在关键决策点（如架构审批）引入人类确认。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: Collaborative Workflow Case */}
      <Slide backgroundColor="#050505" notes="从需求到上线的全链路协同。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">END-TO-END WORKFLOW</div>
          <h3 className="text-3xl mb-8 font-bold text-white">协同工作流：从需求到上线</h3>
          <div className="relative p-8 bg-gemini-cyan/5 rounded-3xl border border-gemini-cyan/20">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center text-black font-bold text-xs">1</div>
                <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs font-bold">Product Agent</span> ➔ <span className="text-[10px] opacity-60">生成 PRD 并发送给 Architect</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center text-black font-bold text-xs">2</div>
                <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs font-bold">Architect Agent</span> ➔ <span className="text-[10px] opacity-60">生成 SDD 和 API 定义，分发给 Developer</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center text-black font-bold text-xs">3</div>
                <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs font-bold">Coding Agent</span> ➔ <span className="text-[10px] opacity-60">并行开发多个子模块，提交 PR</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center text-black font-bold text-xs">4</div>
                <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xs font-bold">Reviewer Agent</span> ➔ <span className="text-[10px] opacity-60">自动 Code Review，通过后触发 CI/CD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
