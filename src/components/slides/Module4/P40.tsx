import Slide from "@/components/Slide";

export default function P40() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 核心能力总结。从工具到 Agent 的全面演进。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center px-8">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text text-center">
            Agent 核心能力总结
          </h2>
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-gemini-cyan transition-all">
                <h3 className="text-lg mb-3 font-bold text-gemini-cyan">Browser Use</h3>
                <p className="text-xs opacity-60 leading-relaxed">Agent 的“眼睛”与“手”，通过视觉感知与动作执行，打破了模型与现实世界的隔阂。</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:border-gemini-purple transition-all">
                <h3 className="text-lg mb-3 font-bold text-gemini-purple">Grounding</h3>
                <p className="text-xs opacity-60 leading-relaxed">Agent 的“实时大脑”，通过检索增强与工具调用，确保决策的准确性与时效性。</p>
              </div>
              <div className="p-6 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <h3 className="text-lg mb-3 font-bold text-white">Agentic Workflow</h3>
                <p className="text-xs opacity-80 font-medium leading-relaxed">Agent 的“协作与闭环”，通过多智能体编排与自我进化，实现了研发全流程的自动化。</p>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gemini-purple to-transparent opacity-30"></div>
            <div className="text-center animate-bounce text-gemini-purple">
              <span className="text-[10px] font-mono uppercase tracking-widest">Evolution Path ↓</span>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Evolution Path */}
      <Slide backgroundColor="#050505" notes="展示从静态工具到自主智能体的演进路径。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">EVOLUTION PATH</div>
          <h3 className="text-3xl mb-10 font-bold text-white">演进之路：从辅助工具到自主智能体</h3>
          <div className="relative h-48 flex items-center justify-between px-12">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-white/20 mb-3"></div>
              <div className="text-xs font-bold opacity-40">L1: Copilot</div>
              <div className="text-[8px] opacity-20">代码补全 / 聊天辅助</div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-gemini-cyan/40 mb-3"></div>
              <div className="text-xs font-bold text-gemini-cyan">L2: Tool-User</div>
              <div className="text-[8px] text-gemini-cyan/60">函数调用 / 简单任务</div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-gemini-purple shadow-[0_0_20px_rgba(168,85,247,0.6)] mb-3 animate-pulse"></div>
              <div className="text-base font-black italic text-gemini-purple">L3: Autonomous Agent</div>
              <div className="text-[10px] text-gemini-purple/80">端到端交付 / 闭环进化</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Future Vision */}
      <Slide backgroundColor="#050505" notes="对未来 AI 驱动研发的展望。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">FUTURE VISION</div>
          <h3 className="text-3xl mb-10 font-bold text-white">未来展望：软件开发的范式转移</h3>
          <div className="grid grid-cols-2 gap-10 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">从“写代码”到“定义意图”</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                开发者将从繁琐的语法实现中解放出来，专注于业务逻辑的定义与系统架构的设计，由 Agent 负责具体的工程落地。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">实时演进的软件系统</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                软件不再是静态的代码集合，而是能够根据用户反馈、环境变化和性能指标实时自我优化、自我修复的动态生命体。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
