import Slide from "@/components/Slide";

export default function P15() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让新员工入职变得简单。AI 可以解释整个系统。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-white glow-text">
            AI 辅助入职：系统全解
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan">System Explanation</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 不再是简单的文档搜索，而是能够解释整个系统的架构、设计模式和关键业务流程。它能告诉你“为什么”这么设计。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple">Code Walkthrough</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 带领新员工走读关键代码模块。通过交互式对话，新员工可以快速理解复杂的逻辑实现，缩短上手时间。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-bounce">👨‍💻</div>
                     <div className="text-lg font-mono text-gemini-cyan">AI Onboarding Assistant</div>
                     <div className="text-[10px] opacity-40">"Ask me anything about the codebase..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">INTERACTIVE ONBOARDING ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Interactive Q&A */}
      <Slide backgroundColor="#050505" notes="新员工可以随时随地向 AI 提问，不再需要频繁打扰老员工。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">INTERACTIVE Q&A</div>
          <h3 className="text-3xl mb-8 font-bold text-white">交互式知识探索</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 italic text-xs opacity-70 leading-relaxed">
                "这个订单状态机的流转逻辑在哪里定义的？为什么要引入状态模式？"
              </div>
              <div className="p-5 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30 text-xs">
                <p className="text-gemini-cyan font-bold mb-2">AI Response:</p>
                <p className="opacity-80 leading-relaxed">
                  逻辑定义在 <code className="text-white">OrderStateMachine.ts</code> 中。引入状态模式是为了解决订单类型增加时逻辑过于臃肿的问题，方便后续扩展预售、拼团等新业务。
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-sm">✔</span>
                <span className="text-xs opacity-70">即时响应，无需等待导师。</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-sm">✔</span>
                <span className="text-xs opacity-70">基于全量代码，回答极其精准。</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 text-sm">✔</span>
                <span className="text-xs opacity-70">支持多语言解释，消除文化隔阂。</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Knowledge Transfer */}
      <Slide backgroundColor="#050505" notes="AI 成为了团队的“活字典”，保留了那些没有写在文档里的知识。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">KNOWLEDGE TRANSFER</div>
          <h3 className="text-3xl mb-8 font-bold text-white">永不流失的组织记忆</h3>
          <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gemini-cyan/10 to-gemini-purple/10 rounded-3xl border border-white/10">
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gemini-cyan">打破知识孤岛</h4>
                <p className="text-xs opacity-60 leading-relaxed">AI 整合了代码、文档、PR 记录和架构设计，形成了一个统一的知识图谱，任何人都可以随时调用。</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gemini-purple">对抗人员流动</h4>
                <p className="text-xs opacity-60 leading-relaxed">即使核心开发者离职，他们留下的代码逻辑和设计意图依然被 AI 深度理解并能传授给后来者。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
