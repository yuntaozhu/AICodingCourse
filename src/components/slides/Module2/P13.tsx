import Slide from "@/components/Slide";

export default function P13() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让跨模块重构变得简单。AI 可以理解整个依赖链。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-white glow-text">
            跨模块重构：AI 的全局视野
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan">Global Vision</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 不再是“管中窥豹”，而是拥有整个代码库的依赖关系图。它知道每一个函数被谁调用，每一个类型在哪里被引用。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple">Deep Refactoring</h3>
                <p className="text-xs opacity-60 leading-relaxed">自动识别重构对下游模块的影响。当你修改一个核心接口时，AI 会自动找出所有需要同步修改的地方。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center">
                   {/* Animated dependency nodes */}
                   <div className="absolute w-4 h-4 bg-gemini-cyan rounded-full animate-pulse"></div>
                   <div className="absolute w-24 h-24 border border-gemini-cyan/20 rounded-full animate-spin-slow"></div>
                   <div className="absolute w-36 h-36 border border-gemini-purple/20 rounded-full animate-reverse-spin-slow"></div>
                   <span className="text-lg font-mono text-gemini-cyan z-10 bg-black/80 px-4 py-2 rounded-lg border border-gemini-cyan/30">Dependency Graph</span>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">REFACTORING CASE ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Refactoring Scenario */}
      <Slide backgroundColor="#050505" notes="修改一个核心接口，在传统开发中是噩梦，在 AI Native 中是日常。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">REFACTORING SCENARIO</div>
          <h3 className="text-3xl mb-8 font-bold text-white">场景：核心支付接口升级</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/30">
                <h4 className="text-red-400 font-bold mb-2 text-sm">Before (Manual)</h4>
                <p className="text-xs opacity-60 leading-relaxed">
                  修改 <code className="text-white">PaymentService</code> 接口 &rarr; 编译报错 &rarr; 手动修改 20+ 个调用点 &rarr; 漏掉一个反射调用 &rarr; 线上事故。
                </p>
              </div>
              <div className="p-5 bg-green-500/10 rounded-2xl border border-green-500/30">
                <h4 className="text-green-400 font-bold mb-2 text-sm">After (AI-Led)</h4>
                <p className="text-xs opacity-60 leading-relaxed">
                  告知 AI: "升级 PaymentService 接口，增加多币种支持，并同步修改所有调用方。"
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-center">
              <h4 className="font-bold mb-4 text-sm">AI 的执行路径:</h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-gemini-cyan/20 text-gemini-cyan flex items-center justify-center text-[8px]">1</span>
                  <span>扫描全量代码，构建调用链拓扑。</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-gemini-cyan/20 text-gemini-cyan flex items-center justify-center text-[8px]">2</span>
                  <span>自动修改接口定义及所有实现类。</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-gemini-cyan/20 text-gemini-cyan flex items-center justify-center text-[8px]">3</span>
                  <span>更新单元测试，确保逻辑闭环。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: The Ripple Effect */}
      <Slide backgroundColor="#050505" notes="AI 不仅修改代码，还理解修改带来的连锁反应。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">THE RIPPLE EFFECT</div>
          <h3 className="text-3xl mb-8 font-bold text-white">掌控连锁反应</h3>
          <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-gemini-cyan/10 to-gemini-purple/10 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-cyan to-transparent"></div>
            <p className="text-lg mb-6 opacity-80 italic leading-relaxed">
              "AI 能够预判修改 A 模块会对 B 模块的性能或 C 模块的安全产生什么影响。"
            </p>
            <div className="grid grid-cols-2 gap-8 text-left">
              <div className="space-y-1.5">
                <h4 className="font-bold text-gemini-cyan text-sm">逻辑一致性检查</h4>
                <p className="text-[10px] opacity-50 leading-relaxed">确保重构后的业务逻辑在所有边界条件下依然保持一致。</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-gemini-purple text-sm">性能回归预警</h4>
                <p className="text-[10px] opacity-50 leading-relaxed">如果重构引入了潜在的性能瓶颈（如 N+1 查询），AI 会主动提示。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
