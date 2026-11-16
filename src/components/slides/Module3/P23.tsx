import Slide from "@/components/Slide";

export default function P23() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="性能手术是优化系统的关键。AI 可以辅助性能手术。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            性能手术：AI 的精准优化
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan text-sm">Precision Optimization</h3>
                <p className="text-xs opacity-60 leading-relaxed">AI 能够像外科医生一样，精准定位系统中的性能“病灶”，并提供最小化改动的优化方案。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple text-sm">Algorithm Replacement</h3>
                <p className="text-xs opacity-60 leading-relaxed">对于低效的算法，AI 能够建议并自动实现更高效的替代方案，如将 O(n²) 优化为 O(n log n)。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-pulse">🔪</div>
                     <div className="text-lg font-mono text-gemini-cyan">Performance Surgery</div>
                     <div className="text-[10px] opacity-40">"Refining critical paths for maximum throughput..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">HOT PATH OPTIMIZATION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Hot Path Optimization */}
      <Slide backgroundColor="#050505" notes="AI 能够识别并优化系统中最繁忙的代码路径。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">HOT PATH OPTIMIZATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">热点路径优化：毫秒必争</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">循环展开与矢量化</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 自动识别计算密集型循环，建议展开循环或利用 SIMD 指令集进行矢量化加速，提升 CPU 利用率。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">无锁数据结构</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                在高并发热点路径上，AI 建议使用原子操作或无锁数据结构替代传统的锁机制，消除竞争瓶颈。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Resource Management */}
      <Slide backgroundColor="#050505" notes="AI 能够优化系统对各项资源的使用效率。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">RESOURCE MANAGEMENT</div>
          <h3 className="text-3xl mb-10 font-bold text-white">资源管理：极致效率</h3>
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🧠</div>
              <h4 className="font-bold mb-2 text-sm">内存池化</h4>
              <p className="text-[10px] opacity-50">AI 建议对频繁分配的小对象使用内存池，减少 GC 压力和碎片。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">📡</div>
              <h4 className="font-bold mb-2 text-sm">I/O 批处理</h4>
              <p className="text-[10px] opacity-50">自动识别零散的 I/O 操作，建议合并为批处理，降低系统调用开销。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">🔋</div>
              <h4 className="font-bold mb-2 text-sm">能效优化</h4>
              <p className="text-[10px] opacity-50">在移动端场景下，AI 建议降低不必要的轮询频率，延长设备续航。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
