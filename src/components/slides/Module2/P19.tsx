import Slide from "@/components/Slide";

export default function P19() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让测试生成变得自动化。AI 可以生成高质量测试。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            测试生成：AI 的验证
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan text-sm">Unit Test Generation</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 能够理解函数逻辑，自动生成覆盖各种输入场景的单元测试，显著提升代码覆盖率。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple text-sm">Integration Test Generation</h3>
                <p className="text-xs opacity-60 leading-relaxed">基于对全量代码库的理解，AI 能够识别模块间的交互，生成复杂的集成测试，确保系统整体稳定性。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-bounce">🧪</div>
                     <div className="text-lg font-mono text-gemini-cyan">Automated Test Suite</div>
                     <div className="text-[10px] opacity-40">"Simulating user flows and edge cases..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">EDGE CASE DISCOVERY ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Edge Case Discovery */}
      <Slide backgroundColor="#050505" notes="AI 擅长发现人类容易忽略的边界情况。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">EDGE CASE DISCOVERY</div>
          <h3 className="text-3xl mb-8 font-bold text-white">挖掘隐藏的边界</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🚫</div>
              <h4 className="font-bold mb-2 text-sm">空值与异常</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">自动测试 Null、Undefined、空字符串等异常输入，确保系统健壮性。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">📏</div>
              <h4 className="font-bold mb-2 text-sm">数值边界</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">测试最大值、最小值、溢出情况以及非法的数值范围。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">⏱️</div>
              <h4 className="font-bold mb-2 text-sm">并发与竞态</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">模拟高并发场景，识别潜在的竞态条件和死锁问题。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Regression Test Suite */}
      <Slide backgroundColor="#050505" notes="AI 可以确保修复一个 Bug 的同时不引入新的 Bug。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">REGRESSION TESTING</div>
          <h3 className="text-3xl mb-10 font-bold text-white">回归测试：守护稳定性</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-10 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">Bug 驱动的测试生成</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                当修复一个 Bug 时，AI 自动生成复现该 Bug 的测试用例，并将其加入回归测试集，防止问题再次出现。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">智能测试选择</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                基于代码变更分析，AI 仅运行受影响的测试用例，大幅缩短 CI/CD 流程中的测试时间。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
