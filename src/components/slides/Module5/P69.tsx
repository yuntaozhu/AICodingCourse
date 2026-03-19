import Slide from "@/components/Slide";

export default function P69() {
  return (
    <Slide backgroundColor="#020205" notes="我们要引入一套成熟的评估框架。RAGAS 针对检索增强生成，G-Eval 针对通用任务。在 2026 年，这些框架已经成为了研发流水线的标配。它们为 AI 的产出提供了可量化的、确定性的评分标准。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">评估框架：<span className="text-gemini-purple italic">确定性的标尺</span></h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gemini-purple transition-all">
            <div className="text-gemini-cyan font-mono mb-4">RAGAS</div>
            <h3 className="text-xl font-bold mb-2">检索质量评估</h3>
            <p className="text-sm opacity-60">评估忠实度、相关性和答案的准确性。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gemini-purple transition-all">
            <div className="text-gemini-cyan font-mono mb-4">G-Eval</div>
            <h3 className="text-xl font-bold mb-2">通用语义评估</h3>
            <p className="text-sm opacity-60">基于思维链（CoT）的深度逻辑验证。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-gemini-purple transition-all">
            <div className="text-gemini-cyan font-mono mb-4">Custom Metrics</div>
            <h3 className="text-xl font-bold mb-2">业务自定义指标</h3>
            <p className="text-sm opacity-60">针对特定领域（如金融、医疗）的合规性检查。</p>
          </div>
        </div>
        <div className="mt-12 p-6 bg-gemini-purple/20 rounded-xl border border-gemini-purple/40">
          <p className="text-center font-mono text-gemini-cyan">“没有度量，就没有管理；没有评估，就没有确定性。”</p>
        </div>
      </div>
    </Slide>
  );
}
