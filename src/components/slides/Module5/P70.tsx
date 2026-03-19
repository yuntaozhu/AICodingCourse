import Slide from "@/components/Slide";

export default function P70() {
  return (
    <Slide backgroundColor="#020205" notes="单元测试只能验证‘代码是否按预期运行’，但无法验证‘代码是否符合业务意图’。在 AI Native 时代，我们需要的是语义验证。通过 Gemini 3.1 的超长上下文，我们可以将整个业务文档作为上下文，来验证生成的代码是否真正实现了业务目标。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple">语义验证：<span className="text-white">超越单元测试</span></h2>
        <div className="flex gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="p-4 bg-white/5 rounded-lg border-l-4 border-red-500">
              <h4 className="font-bold mb-1">单元测试 (Unit Test)</h4>
              <p className="text-sm opacity-60">验证逻辑：1 + 1 = 2？</p>
            </div>
            <div className="p-4 bg-gemini-cyan/10 rounded-lg border-l-4 border-gemini-cyan">
              <h4 className="font-bold mb-1">语义验证 (Semantic Validation)</h4>
              <p className="text-sm opacity-60">验证意图：这个函数是否符合《2026 支付安全协议》？</p>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gemini-purple/20 blur-xl rounded-full"></div>
              <div className="relative bg-black/40 p-8 rounded-2xl border border-white/10 font-mono text-sm">
                <div className="text-gemini-cyan mb-2">// Gemini 3.1 Intent Check</div>
                <div className="text-white opacity-40">Context: Business Spec v2.1</div>
                <div className="text-white opacity-40">Target: PaymentGateway.ts</div>
                <div className="mt-4 text-green-400">✓ Logic matches intent</div>
                <div className="text-yellow-400">⚠ Missing edge case: Timeout</div>
                <div className="text-gemini-purple mt-4">Recommendation: Add retry logic</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
