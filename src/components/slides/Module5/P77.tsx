import Slide from "@/components/Slide";

export default function P77() {
  return (
    <Slide backgroundColor="#020205" notes="工欲善其事，必先利其器。在 2026 年，我们已经拥有了一系列强大的评估工具。Promptfoo 帮助我们优化提示词，LangSmith 提供了全链路的追踪和评估。这些工具的集成，让我们的评估闭环变得更加稳健。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">评估工具箱：<span className="text-gemini-purple italic">2026 标配</span></h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start">
            <div className="w-16 h-16 bg-gemini-cyan/20 rounded-lg flex items-center justify-center text-2xl">🛠️</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Promptfoo</h3>
              <p className="opacity-60 text-sm">针对提示词（Prompt）的自动化测试与对比评估。支持多模型横向对比。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start">
            <div className="w-16 h-16 bg-gemini-purple/20 rounded-lg flex items-center justify-center text-2xl">🔍</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">LangSmith</h3>
              <p className="opacity-60 text-sm">全链路 Trace 监控与评估。实时捕捉 AI 的思考过程并进行打分。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl">🛡️</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">G-Eval Framework</h3>
              <p className="opacity-60 text-sm">基于 LLM 的语义评估标准。通过 CoT 提供可解释的评分理由。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start">
            <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">📊</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Custom Eval Pipelines</h3>
              <p className="opacity-60 text-sm">企业内部自建的评估流水线。集成业务私有数据与合规性检查。</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
