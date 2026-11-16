import Slide from "@/components/Slide";

export default function P70() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#020205" notes="单元测试只能验证‘代码是否按预期运行’，但无法验证‘代码是否符合业务意图’。在 AI Native 时代，我们需要的是语义验证。通过 AI Coding 的超长上下文，我们可以将整个业务文档作为上下文，来验证生成的代码是否真正实现了业务目标。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl mb-10 font-black italic tracking-tighter text-gemini-purple glow-text leading-tight">
            语义验证：<span className="text-white">超越单元测试</span>
          </h2>
          <div className="flex gap-8 items-center">
            <div className="flex-1 space-y-6">
              <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-red-500 hover:bg-white/10 transition-all">
                <h4 className="text-xl font-bold mb-1 text-white">单元测试 (Unit Test)</h4>
                <p className="text-base opacity-60 italic">验证逻辑：1 + 1 = 2？</p>
                <p className="text-xs opacity-40 mt-1">关注代码实现的正确性，无法感知业务目标的偏离。</p>
              </div>
              <div className="p-5 bg-gemini-cyan/10 rounded-2xl border-l-4 border-gemini-cyan hover:bg-gemini-cyan/20 transition-all relative group">
                <h4 className="text-xl font-bold mb-1 text-gemini-cyan">语义验证 (Semantic Validation)</h4>
                <p className="text-base opacity-80 italic text-white">验证意图：这个函数是否符合《2026 支付安全协议》？</p>
                <p className="text-xs opacity-60 mt-1">关注代码是否真正解决了业务问题，确保“所写即所想”。</p>
                <div className="absolute -right-4 -bottom-4 animate-bounce text-gemini-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-mono">INTENT VS LOGIC ↓</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -inset-6 bg-gemini-purple/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-black/60 p-8 rounded-3xl border border-white/10 font-mono text-xs shadow-2xl">
                  <div className="text-gemini-cyan mb-3 tracking-widest opacity-70">// AI Coding Intent Check</div>
                  <div className="space-y-1 mb-4">
                    <div className="text-white opacity-40">Context: Business Spec v2.1</div>
                    <div className="text-white opacity-40">Target: PaymentGateway.ts</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-green-400 flex items-center gap-2">
                      <span>✓</span> <span>Logic matches intent</span>
                    </div>
                    <div className="text-yellow-400 flex items-center gap-2">
                      <span>⚠</span> <span>Missing edge case: Timeout</span>
                    </div>
                    <div className="text-gemini-purple mt-4 p-3 bg-gemini-purple/10 rounded-xl border border-gemini-purple/20">
                      <span className="font-bold">Recommendation:</span> Add retry logic with exponential backoff.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Intent vs Logic */}
      <Slide backgroundColor="#050505" notes="对比代码逻辑正确性与业务意图一致性的差异。">
        <div className="flex flex-col justify-center h-full text-center max-w-5xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2 tracking-widest">INTENT VS LOGIC</div>
          <h3 className="text-3xl mb-10 font-bold text-white">意图与逻辑：失之毫厘，差之千里</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-red-400">逻辑正确 (Logic OK)</h4>
              <p className="text-xs opacity-60 leading-relaxed mb-4">
                代码运行无误，通过了所有单元测试。例如：一个折扣计算函数正确地减去了 20%。
              </p>
              <div className="p-3 bg-red-400/10 rounded-xl border border-red-400/20 text-[10px] font-mono text-red-400">
                Test: calculateDiscount(100) === 80 // PASS
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">意图错误 (Intent Error)</h4>
              <p className="text-xs opacity-60 leading-relaxed mb-4">
                虽然代码逻辑正确，但违反了业务规则。例如：该折扣仅限“新用户”，但代码未做身份校验。
              </p>
              <div className="p-3 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/20 text-[10px] font-mono text-gemini-cyan">
                Spec: Only for NEW users. // FAILED
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Semantic Guardrails */}
      <Slide backgroundColor="#050505" notes="如何在流水线中落地语义验证。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto px-8">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2 tracking-widest">SEMANTIC GUARDRAILS</div>
          <h3 className="text-3xl mb-10 font-bold text-white text-center">语义护栏：将业务文档转化为自动化检查</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <div className="text-3xl mb-4">📄</div>
              <h4 className="text-lg font-bold mb-2 text-gemini-cyan">文档索引化</h4>
              <p className="text-xs opacity-50">将 PRD、架构设计、合规协议索引至向量库，作为验证的“真理来源”。</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center border-gemini-purple/30">
              <div className="text-3xl mb-4">🤖</div>
              <h4 className="text-lg font-bold mb-2 text-gemini-purple">意图提取器</h4>
              <p className="text-xs opacity-50">利用 LLM 从代码提交中提取“实现意图”，并与文档中的“业务意图”进行比对。</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <div className="text-3xl mb-4">🚫</div>
              <h4 className="text-lg font-bold mb-2 text-gemini-cyan">语义阻断</h4>
              <p className="text-xs opacity-50">如果发现代码实现偏离了业务目标，在 CI 阶段直接阻断，并给出语义层面的修改建议。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
