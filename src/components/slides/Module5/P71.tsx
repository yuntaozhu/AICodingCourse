import Slide from "@/components/Slide";

export default function P71() {
  return (
    <Slide backgroundColor="#020205" notes="我们要构建的是一个‘确定性引擎’。这个引擎的核心是：将不确定的 AI 生成结果，通过确定性的规则和动态的评估逻辑，转化为可信的、可交付的软件资产。这不仅是技术，更是一种工程哲学。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">构建“确定性引擎”</h2>
        <div className="flex justify-between items-center gap-12">
          <div className="flex-1 text-center p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-4xl mb-4">AI 生成</div>
            <div className="text-sm opacity-50">不确定性 (Uncertainty)</div>
          </div>
          <div className="text-gemini-purple text-5xl">→</div>
          <div className="flex-1 text-center p-8 bg-gemini-purple/20 rounded-3xl border border-gemini-purple/40">
            <div className="text-4xl mb-4 text-gemini-cyan font-bold">确定性引擎</div>
            <div className="text-sm opacity-70">规则 + 评估 + 反馈</div>
          </div>
          <div className="text-gemini-purple text-5xl">→</div>
          <div className="flex-1 text-center p-8 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-4xl mb-4">可信资产</div>
            <div className="text-sm opacity-50">确定性 (Certainty)</div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-gemini-cyan font-bold mb-2">静态规则</div>
            <p className="text-xs opacity-50">Lint, Security Scan, Type Check</p>
          </div>
          <div>
            <div className="text-gemini-cyan font-bold mb-2">动态评估</div>
            <p className="text-xs opacity-50">LLM-as-a-Judge, Runtime Check</p>
          </div>
          <div>
            <div className="text-gemini-cyan font-bold mb-2">意图对齐</div>
            <p className="text-xs opacity-50">Spec-to-Code Validation</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
