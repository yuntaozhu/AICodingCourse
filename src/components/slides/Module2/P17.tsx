import Slide from "@/components/Slide";

export default function P17() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让性能分析变得自动化。AI 可以识别瓶颈。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            性能分析：AI 的诊断
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan text-sm">Performance Bottleneck</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 不再是盲目猜测，而是通过分析全量代码逻辑，识别潜在的性能瓶颈。它能发现那些隐藏在深层调用链中的低效操作。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple text-sm">Optimization Suggestion</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 提供针对性的性能优化建议。从算法改进到缓存策略，AI 能够给出具体的代码实现，显著提升系统响应速度。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-pulse">⚡</div>
                     <div className="text-lg font-mono text-gemini-cyan">Performance Optimization</div>
                     <div className="text-[10px] opacity-40">"Analyzing execution paths for latency..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">BOTTLENECK ANALYSIS ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Bottleneck Identification */}
      <Slide backgroundColor="#050505" notes="AI 可以识别出人类难以察觉的性能陷阱。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">BOTTLENECK IDENTIFICATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">精准识别性能陷阱</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🔄</div>
              <h4 className="font-bold mb-2 text-sm">N+1 查询</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">自动识别循环中的数据库查询或 API 调用，建议使用批量操作或 Join。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">💾</div>
              <h4 className="font-bold mb-2 text-sm">内存泄漏</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">分析对象生命周期，识别未释放的资源或持续增长的集合。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🧵</div>
              <h4 className="font-bold mb-2 text-sm">阻塞操作</h4>
              <p className="text-[10px] opacity-60 leading-relaxed">发现主线程上的同步 I/O 或耗时计算，建议异步化或卸载到工作线程。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Performance Tuning */}
      <Slide backgroundColor="#050505" notes="AI 提供的优化方案通常是多维度的。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">AUTOMATED TUNING</div>
          <h3 className="text-3xl mb-10 font-bold text-white">多维性能调优</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-10 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">缓存策略优化</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 自动识别高频访问且计算昂贵的数据，建议合理的缓存级别（内存、Redis）和失效机制。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">索引与查询优化</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                基于全量代码中的查询模式，AI 建议最优的数据库索引设计，并重写低效的 SQL 语句。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
