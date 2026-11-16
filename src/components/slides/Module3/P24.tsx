import Slide from "@/components/Slide";

export default function P24() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="PBT (Property-Based Testing) 是高质量测试的保障。AI 可以生成 PBT。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            PBT: 属性驱动的测试
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed font-light opacity-80">
                PBT (Property-Based Testing) 突破了传统示例测试的局限。AI 能够自动识别系统的“不变性”属性，并生成海量随机数据进行压力测试。
              </p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">定义代码应遵循的属性</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">自动生成海量测试数据</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">发现传统测试难以覆盖的边界情况</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-purple to-transparent opacity-50"></div>
              <pre className="text-xs font-mono text-gemini-purple/80">
                <code className="language-markdown">{`# PBT: Sort Function
# Property: Output is sorted
# Property: Output contains same elements as input
# AI Strategy:
#   - Generate 10,000 random arrays
#   - Include: Empty, Single, Huge, Duplicates
# Result: Found bug in stable sort logic`}</code>
              </pre>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">PROPERTY DEFINITION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Property Definition */}
      <Slide backgroundColor="#050505" notes="AI 能够帮助开发者发现那些隐藏在业务逻辑中的“不变性”。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">PROPERTY DEFINITION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">识别系统的不变性</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">逻辑一致性</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 分析代码逻辑，自动提取出诸如“加密后再解密应等于原值”或“转账后账户总额应保持不变”等核心属性。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">状态机验证</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                对于复杂的状态机，AI 定义合法的状态转换属性，确保无论输入序列如何，系统都不会进入非法状态。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Shrinking to Minimal Reproducer */}
      <Slide backgroundColor="#050505" notes="当 PBT 发现错误时，AI 可以帮助我们将海量数据简化为最简单的复现用例。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">SHRINKING</div>
          <h3 className="text-3xl mb-10 font-bold text-white">智能收缩：直击问题核心</h3>
          <div className="max-w-4xl mx-auto space-y-4 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-5">
              <div className="text-2xl">🔍</div>
              <div>
                <h4 className="font-bold text-gemini-cyan text-sm">自动简化用例</h4>
                <p className="text-[10px] opacity-50">当 PBT 在一个包含 1000 个元素的数组中发现错误时，AI 自动将其“收缩”为仅包含 2 个元素的最小复现用例。</p>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-5">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-bold text-gemini-purple text-sm">根因分析辅助</h4>
                <p className="text-[10px] opacity-50">结合最小复现用例，AI 自动分析代码执行路径，指出导致属性失效的具体代码行。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
