import Slide from "@/components/Slide";

export default function P79() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="总结一下第五模块。我们讨论了评估闭环的重要性，从拒绝‘人肉 QA’到构建‘确定性引擎’。核心在于：利用 LLM-as-a-Judge 和语义验证，将 AI 的不确定性转化为软件的确定性。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan">模块 5 总结：评估闭环</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">01</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">拒绝“人肉 QA”，通过自动化手段填补算力缺口。</p>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">02</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">引入 LLM-as-a-Judge，构建多维度的自动裁判机制。</p>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">03</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">从单元测试进化到语义验证，实现意图对齐。</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">04</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">构建“确定性引擎”，将不确定性转化为可信资产。</p>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">05</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">实施持续评估 (CE)，贯穿研发生命周期全流程。</p>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="text-gemini-purple font-bold group-hover:scale-110 transition-transform">06</div>
              <p className="text-lg opacity-80 group-hover:opacity-100">从“清洁工”进化为“设计师”，关注机制而非错误。</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-2xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Key Takeaways Visualization */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-white">核心心法：<span className="text-gemini-purple italic">确定性思维</span></h3>
        <div className="flex justify-between items-center gap-8">
          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-white/10 text-center relative group">
            <div className="text-5xl mb-6">🎲</div>
            <div className="text-xl font-bold mb-2">概率性输入</div>
            <p className="text-sm opacity-50">AI 生成的代码是概率性的，不可直接信任。</p>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl opacity-30 group-hover:translate-x-2 transition-transform">→</div>
          </div>
          <div className="flex-1 p-8 bg-gemini-cyan/20 rounded-2xl border border-gemini-cyan/40 text-center scale-110 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="text-5xl mb-6">⚙️</div>
            <div className="text-xl font-bold mb-2">确定性引擎</div>
            <p className="text-sm opacity-80">通过规则、评估和反馈，将概率转化为确定。</p>
          </div>
          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-white/10 text-center relative group">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-2xl opacity-30 group-hover:-translate-x-2 transition-transform">→</div>
            <div className="text-5xl mb-6">💎</div>
            <div className="text-xl font-bold mb-2">工程化资产</div>
            <p className="text-sm opacity-50">最终交付的是经过验证、可维护的软件资产。</p>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Action Items */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-gemini-cyan">下一步行动建议</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-xl font-bold mb-4 text-gemini-purple">短期：建立感知</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li>• 在现有项目中引入 Promptfoo 进行提示词测试。</li>
              <li>• 尝试使用 LLM-as-a-Judge 对生成的代码进行初步评估。</li>
              <li>• 记录 AI 生成代码的常见错误模式。</li>
            </ul>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-xl font-bold mb-4 text-gemini-cyan">长期：构建闭环</h4>
            <ul className="space-y-3 text-sm opacity-70">
              <li>• 搭建端到端的自愈流水线。</li>
              <li>• 沉淀领域专属的 Benchmark 评估集。</li>
              <li>• 推动团队从“写代码”向“设计评估机制”转型。</li>
            </ul>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
