import Slide from "@/components/Slide";

export default function P10() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="AI Native 研发范式的演进。从 Copilot 到 Agentic Workflow。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-white glow-text">
            AI Native 研发范式的演进
          </h2>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative group hover:bg-white/10 transition-all">
                <div className="text-3xl mb-3">⌨️</div>
                <h3 className="text-xl mb-1 font-bold">Copilot Era</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 作为副驾驶，辅助代码补全。人是主体，AI 是工具。</p>
                <div className="mt-3 text-[8px] font-mono opacity-30 uppercase">2021 - 2023</div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 relative group hover:bg-white/10 transition-all">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl mb-1 font-bold">Agentic Era</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 作为 Agent，独立完成任务。人是指令发起者，AI 是执行者。</p>
                <div className="mt-3 text-[8px] font-mono opacity-30 uppercase">2024 - 2025</div>
              </div>
              <div className="p-6 bg-gemini-purple/20 rounded-2xl border border-gemini-purple/50 relative group hover:bg-gemini-purple/30 transition-all">
                <div className="text-3xl mb-3">🏗️</div>
                <h3 className="text-xl mb-1 font-bold text-gemini-purple">AI Native Era</h3>
                <p className="text-xs opacity-80 font-bold leading-relaxed">AI 作为架构意志，全面托管研发。人是架构师，AI 是整个工厂。</p>
                <div className="mt-3 text-[8px] font-mono text-gemini-purple uppercase">2026+</div>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-white/10 via-gemini-purple to-gemini-cyan animate-pulse"></div>
            </div>
            <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
              <span className="text-[10px] font-mono">EVOLUTION DETAILS ↓</span>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Copilot vs Agentic */}
      <Slide backgroundColor="#050505" notes="从补全代码到解决问题，这是质的飞跃。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">PARADIGM SHIFT 01</div>
          <h3 className="text-3xl mb-8 font-bold text-white">从“代码补全”到“任务达成”</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-white/60 mb-1 font-bold uppercase text-[10px]">Copilot (Passive)</h4>
                <p className="text-base italic leading-relaxed">"帮我写一个正则表达式来校验邮箱。"</p>
                <div className="mt-3 text-xs opacity-40">结果：生成一段代码片段，需要人手动集成、测试和调试。</div>
              </div>
              <div className="p-5 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h4 className="text-gemini-purple mb-1 font-bold uppercase text-[10px]">Agentic (Active)</h4>
                <p className="text-base italic leading-relaxed">"给用户注册流程增加邮箱验证功能，包含前后端逻辑和单元测试。"</p>
                <div className="mt-3 text-xs opacity-60">结果：AI 自动修改多个文件，运行测试，确保功能完整可用。</div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-gemini-purple/20 rounded-full animate-ping"></div>
                <div className="absolute inset-4 bg-gemini-purple/40 rounded-full animate-pulse"></div>
                <div className="absolute inset-8 bg-gemini-purple rounded-full flex items-center justify-center text-3xl">🚀</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: The Future - Architecture as Intent */}
      <Slide backgroundColor="#050505" notes="在 AI Native 时代，代码只是副产品，架构意志才是核心。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">PARADIGM SHIFT 02</div>
          <h3 className="text-3xl mb-8 font-bold text-white">未来：架构即意志 (Architecture as Intent)</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">软件不再是“写”出来的</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                开发者通过定义 Spec、约束和目标，由 AI 自动推导出最优的实现路径。代码成为了可以随时丢弃、随时重生成的“中间产物”。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">研发效能的无限坍缩</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                从需求到上线的周期从“周”坍缩到“分钟”。一个人就是一个完整的研发团队，AI 托管了所有的琐碎细节和工程复杂度。
              </p>
            </div>
          </div>
          <div className="mt-8 text-xl font-light italic text-white/40">
            "The best code is no code. The second best code is AI-generated code."
          </div>
        </div>
      </Slide>
    </section>
  );
}
