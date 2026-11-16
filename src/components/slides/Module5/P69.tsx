import Slide from "@/components/Slide";

export default function P69() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#020205" notes="我们要引入一套成熟的评估框架。RAGAS 针对检索增强生成，G-Eval 针对通用任务。在 2026 年，这些框架已经成为了研发流水线的标配。它们为 AI 的产出提供了可量化的、确定性的评分标准。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl mb-10 font-black italic tracking-tighter text-white glow-text leading-tight">
            评估框架：<span className="text-gemini-purple">确定性的标尺</span>
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-gemini-purple transition-all group relative overflow-hidden">
              <div className="text-gemini-cyan font-mono mb-4 tracking-widest text-[10px]">RAGAS</div>
              <h3 className="text-xl font-bold mb-3">检索质量评估</h3>
              <p className="text-xs opacity-60 leading-relaxed">专门针对 RAG 系统的评估框架，从忠实度、相关性和上下文精度三个维度进行量化评分。</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gemini-cyan animate-bounce">
                <span className="text-[10px] font-mono">RAGAS IN ACTION ↓</span>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-gemini-purple transition-all group relative overflow-hidden">
              <div className="text-gemini-cyan font-mono mb-4 tracking-widest text-[10px]">G-EVAL</div>
              <h3 className="text-xl font-bold mb-3">通用语义评估</h3>
              <p className="text-xs opacity-60 leading-relaxed">利用 LLM 作为裁判，通过思维链 (CoT) 技术对复杂任务的逻辑性、连贯性和准确性进行深度验证。</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gemini-purple animate-bounce">
                <span className="text-[10px] font-mono">G-EVAL WORKFLOW ↓</span>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-gemini-purple transition-all group">
              <div className="text-gemini-cyan font-mono mb-4 tracking-widest text-[10px]">CUSTOM METRICS</div>
              <h3 className="text-xl font-bold mb-3">业务自定义指标</h3>
              <p className="text-xs opacity-60 leading-relaxed">针对特定领域（如金融合规、医疗伦理、代码规范）构建的专属评估算子，确保 AI 产出符合业务边界。</p>
            </div>
          </div>
          <div className="mt-10 p-6 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <p className="text-center font-mono text-gemini-cyan text-lg italic">“没有度量，就没有管理；没有评估，就没有确定性。”</p>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: RAGAS in Action */}
      <Slide backgroundColor="#050505" notes="深入解析 RAGAS 的核心评估维度。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2 tracking-widest">RAGAS IN ACTION</div>
          <h3 className="text-3xl mb-10 font-bold text-white">RAGAS：量化检索增强的每一环</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">Faithfulness</h4>
              <p className="text-xs opacity-60 mb-3">忠实度：答案是否完全基于检索到的上下文？</p>
              <div className="text-[10px] font-mono text-gemini-cyan/40">Avoid Hallucinations</div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">Answer Relevance</h4>
              <p className="text-xs opacity-60 mb-3">答案相关性：回答是否直接且有效地解决了用户问题？</p>
              <div className="text-[10px] font-mono text-gemini-purple/40">Direct & Concise</div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">Context Precision</h4>
              <p className="text-xs opacity-60 mb-3">上下文精度：检索到的内容是否真正包含解决问题所需的关键信息？</p>
              <div className="text-[10px] font-mono text-gemini-cyan/40">Efficient Retrieval</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: G-Eval Workflow */}
      <Slide backgroundColor="#050505" notes="展示 G-Eval 如何利用 CoT 进行评分。">
        <div className="flex flex-col justify-center h-full text-center max-w-5xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2 tracking-widest">G-EVAL WORKFLOW</div>
          <h3 className="text-3xl mb-10 font-bold text-white">G-Eval：基于思维链的深度裁判</h3>
          <div className="space-y-4 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-6 h-6 bg-gemini-purple/20 rounded-full flex items-center justify-center text-xs">1</div>
                <h4 className="text-base font-bold">定义评估标准 (Define Criteria)</h4>
              </div>
              <p className="text-xs opacity-50 ml-10">明确任务的成功定义，如“代码是否符合 Clean Code 规范”。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-6 h-6 bg-gemini-purple/20 rounded-full flex items-center justify-center text-xs">2</div>
                <h4 className="text-base font-bold">生成思维链 (Generate CoT)</h4>
              </div>
              <p className="text-xs opacity-50 ml-10">裁判模型先写出评估逻辑，分析代码的优缺点，而不是直接给分。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex gap-4 items-center mb-2">
                <div className="w-6 h-6 bg-gemini-purple/20 rounded-full flex items-center justify-center text-xs">3</div>
                <h4 className="text-base font-bold">加权评分 (Weighted Scoring)</h4>
              </div>
              <p className="text-xs opacity-50 ml-10">基于 CoT 的分析结果，给出最终的量化分值，并附带改进建议。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
