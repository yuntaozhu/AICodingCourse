import Slide from "@/components/Slide";

export default function P29() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="实战练习：构建一个 AI 驱动的文档生成工具。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-3xl mb-6 font-black italic tracking-tighter text-gemini-cyan glow-text">
            实战：AI 驱动的文档生成工具
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-lg mb-1 font-bold text-gemini-cyan">Automated Documentation</h3>
                <p className="text-[11px] opacity-60 leading-relaxed">
                  告别过时的文档。AI 实时同步代码变更，自动生成 API 参考、架构说明和部署指南，确保文档始终与代码保持一致。
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-lg mb-1 font-bold text-gemini-purple">Multi-modal Documentation</h3>
                <p className="text-[11px] opacity-60 leading-relaxed">
                  文档不再只是文字。AI 能够根据代码逻辑自动生成时序图、类图，甚至录制关键流程的演示视频，提供全方位的理解视角。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-56 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                  <div className="space-y-3">
                    <div className="text-3xl animate-pulse">📚</div>
                    <div className="text-lg font-mono text-gemini-cyan">AI Documentation Assistant</div>
                    <div className="text-[10px] opacity-40">"Generating living documentation from codebase..."</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">INTERACTIVE Q&A ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Interactive Documentation */}
      <Slide backgroundColor="#050505" notes="文档不再是静态的，而是可以对话的。">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">INTERACTIVE Q&A</div>
          <h3 className="text-2xl mb-6 font-bold text-white">交互式文档：随问随答</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-base font-bold mb-2 text-gemini-cyan">语义搜索与问答</h4>
              <p className="text-[11px] opacity-60 leading-relaxed">
                开发者可以直接向文档提问，如“如何配置多租户隔离？”，AI 会结合文档内容和代码实现，给出精准的解答和代码示例。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-base font-bold mb-2 text-gemini-purple">上下文感知引导</h4>
              <p className="text-[11px] opacity-60 leading-relaxed">
                根据用户当前查看的代码片段，AI 自动推荐相关的文档章节和最佳实践，实现“文档找人”的智能化体验。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Visual Documentation */}
      <Slide backgroundColor="#050505" notes="AI 能够自动生成各种图表，帮助开发者快速理解系统架构。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">VISUAL DOCUMENTATION</div>
          <h3 className="text-2xl mb-6 font-bold text-white">可视化文档：一图胜千言</h3>
          <div className="grid grid-cols-3 gap-5 text-left">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-2">📊</div>
              <h4 className="text-xs font-bold mb-1">架构时序图</h4>
              <p className="text-[10px] opacity-60 leading-tight">自动分析跨服务调用，生成 Mermaid 或 PlantUML 时序图，清晰展示业务流程。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-2">🌳</div>
              <h4 className="text-xs font-bold mb-1">依赖拓扑图</h4>
              <p className="text-[10px] opacity-60 leading-tight">可视化模块间的依赖关系，帮助识别循环依赖和架构腐化风险。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-2">🔄</div>
              <h4 className="text-xs font-bold mb-1">状态机可视化</h4>
              <p className="text-[10px] opacity-60 leading-tight">针对复杂的业务状态流转，自动提取状态机逻辑并生成直观的状态转换图。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
