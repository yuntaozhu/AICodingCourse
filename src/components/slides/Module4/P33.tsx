import Slide from "@/components/Slide";

export default function P33() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Grounding 是 Agent 的核心能力。Agent 可以基于实时信息进行决策。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-3xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text text-center">
            Grounding: Agent 的实时大脑
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-cyan">Real-time Information</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  Agent 不再受限于训练数据的截止日期。通过实时搜索和工具调用，它能够获取最新的新闻、股价、天气或技术文档，确保决策的时效性。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-purple">Contextual Grounding</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  将 Agent 锚定在特定的上下文（如企业私有文档、代码库或用户个人数据）中，消除幻觉，提供精准且符合事实的回答。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-72 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="text-4xl animate-pulse">🌍</div>
                    <div className="text-xl font-mono text-gemini-cyan">Grounding Assistant</div>
                    <div className="text-xs opacity-40">"Verifying facts against real-world data..."</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">GOOGLE SEARCH ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Google Search Grounding */}
      <Slide backgroundColor="#050505" notes="AI 可以直接访问互联网，获取最新信息。">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">GOOGLE SEARCH GROUNDING</div>
          <h3 className="text-3xl mb-6 font-bold text-white">实时搜索：连接世界</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">动态事实核查</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                当用户询问最近发生的事件时，Agent 自动触发搜索，提取多个可靠来源的信息进行交叉验证，并给出带有引用链接的回答。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">趋势分析与预测</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                基于最新的市场数据 or 社交媒体趋势，Agent 能够进行实时的分析 and 预测，为决策提供数据支撑。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Enterprise Data Grounding */}
      <Slide backgroundColor="#050505" notes="AI 可以基于企业内部数据提供精准服务。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">ENTERPRISE DATA GROUNDING</div>
          <h3 className="text-3xl mb-8 font-bold text-white">私有知识：企业级大脑</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">全量上下文注入</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                利用超长上下文窗口，将整个项目文档 or 代码库作为背景，Agent 能够理解复杂的内部逻辑 and 业务术语，提供专家级的咨询。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">安全与隐私保护</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                在确保数据不出域的前提下，实现高效的知识检索 and 问答，满足企业对数据安全 and 合规性的严苛要求。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
