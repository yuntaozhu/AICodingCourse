import Slide from "@/components/Slide";

export default function P28() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="实战练习：构建一个 AI 驱动的性能优化工具。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            实战：AI 驱动的性能优化工具
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed opacity-80">
                构建一个能够自动分析、建议并验证性能优化的闭环系统。
              </p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动识别性能瓶颈</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动生成优化建议</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">AI 自动验证优化效果</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="font-mono text-xs text-gemini-purple/80 leading-relaxed">
                  <code>{`# Performance Optimization
# Bottleneck: JSON Parsing
# Tool: AI Coding
# Result: Use simdjson
# Speedup: 10x
# Status: Verified ✅`}</code>
                </pre>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">BOTTLENECK ANALYSIS ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Bottleneck Identification */}
      <Slide backgroundColor="#050505" notes="AI 可以分析复杂的 Profiling 数据，找出真正的性能杀手。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">BOTTLENECK ANALYSIS</div>
          <h3 className="text-3xl mb-8 font-bold text-white">精准定位：Profiling 数据分析</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">火焰图深度解析</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 自动扫描 CPU 火焰图，识别出那些占用大量 CPU 时间但逻辑简单的“热点函数”，并分析其调用栈以确定优化空间。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">内存分配追踪</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                分析内存分配快照，识别频繁的短生命周期对象分配，建议使用对象池或更高效的数据结构以减轻 GC 压力。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Optimization Strategies */}
      <Slide backgroundColor="#050505" notes="AI 能够提供从底层指令到高层架构的全方位优化建议。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">OPTIMIZATION STRATEGIES</div>
          <h3 className="text-3xl mb-10 font-bold text-white">策略生成：从算法到指令</h3>
          <div className="grid grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-purple">
              <h4 className="font-bold mb-2 text-sm">SIMD 加速</h4>
              <p className="text-[10px] opacity-60">自动识别可向量化的循环，并生成使用 AVX-512 或 NEON 指令集的优化代码。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-cyan">
              <h4 className="font-bold mb-2 text-sm">无锁数据结构</h4>
              <p className="text-[10px] opacity-60">在多线程高并发场景下，建议并实现基于 CAS 的无锁队列或哈希表，减少锁竞争。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 border-t-4 border-t-gemini-purple">
              <h4 className="font-bold mb-2 text-sm">零拷贝优化</h4>
              <p className="text-[10px] opacity-60">分析 I/O 路径，建议使用 mmap 或直接内存访问，减少用户态与内核态之间的数据拷贝。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
