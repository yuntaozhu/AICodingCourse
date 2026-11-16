import Slide from "@/components/Slide";

export default function P4() {
  return (
    <Slide notes="AI Coding 的 2M+ 上下文窗口彻底改变了游戏规则。RAG 只是权宜之计，全量上下文才是终极答案。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
          AI Coding: 架构意志的载体
        </h2>
        
        <div className="grid grid-cols-12 gap-4 h-[55vh]">
          {/* Main Feature: 2M+ Context */}
          <div className="col-span-8 bg-gradient-to-br from-gemini-purple/20 to-transparent p-6 rounded-2xl border border-gemini-purple/30 relative overflow-hidden group hover:border-gemini-purple/60 transition-all duration-500">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-gemini-purple/20 rounded-full blur-3xl group-hover:bg-gemini-purple/40 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="text-[10px] font-mono text-gemini-purple mb-2 uppercase tracking-widest">Core Capability</div>
                <h3 className="text-5xl font-black mb-2 leading-none tracking-tighter">2M+ CONTEXT WINDOW</h3>
                <p className="text-base opacity-70 max-w-md">全量代码库直接注入，无需复杂 RAG。AI 拥有完整的系统全局视野。</p>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="text-6xl font-black text-white/5 select-none">2,000,000</div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-1 h-6 bg-gemini-purple/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-modal */}
          <div className="col-span-4 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-all">
            <div>
              <div className="w-10 h-10 bg-gemini-cyan/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">👁️</span>
              </div>
              <h3 className="text-xl font-bold mb-2 leading-tight">Multi-modal Reasoning</h3>
              <p className="text-xs opacity-60 leading-relaxed">
                理解 UI 设计稿、架构图、甚至视频演示。跨越模态的逻辑对齐。
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gemini-cyan/40 border border-black"></div>
                <div className="w-6 h-6 rounded-full bg-gemini-purple/40 border border-black"></div>
                <div className="w-6 h-6 rounded-full bg-white/20 border border-black"></div>
              </div>
            </div>
          </div>

          {/* Spec-Driven */}
          <div className="col-span-4 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-all">
            <div>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">📜</span>
              </div>
              <h3 className="text-xl font-bold mb-2 leading-tight">Spec-Driven Logic</h3>
              <p className="text-xs opacity-60 leading-relaxed">
                严格遵循逻辑约束，生成确定性代码。消除幻觉，确保架构一致性。
              </p>
            </div>
          </div>

          {/* Extra Visual / Quote */}
          <div className="col-span-8 bg-gemini-cyan/5 p-6 rounded-2xl border border-gemini-cyan/20 flex items-center justify-center italic text-xl font-light text-gemini-cyan/80">
            "The context is the new memory. The spec is the new code."
          </div>
        </div>
      </div>
    </Slide>
  );
}
