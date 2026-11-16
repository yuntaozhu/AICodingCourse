import Slide from "@/components/Slide";

export default function P26() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="实战练习：构建一个 AI 驱动的交易引擎。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text">
            实战：AI 驱动的交易引擎
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed font-light opacity-80">
                通过构建一个极速交易引擎，体验 AI Native 研发的全流程。从 Spec 定义到 DoD 验证，AI 贯穿始终。
              </p>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Spec: 高并发、低延迟、零拷贝</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Action: AI Coding 生成 Rust 核心代码</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-cyan group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">DoD: 1M TPS, {"<"} 10us latency</span>
                </li>
              </ul>
            </div>
            <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gemini-purple to-transparent opacity-50"></div>
              <pre className="text-xs font-mono text-gemini-purple/80">
                <code className="language-rust">{`// Rust Trading Engine
struct Engine {
    order_book: OrderBook,
}
impl Engine {
    fn process_order(&mut self, order: Order) {
        // AI generated high-perf logic
        // Zero-copy deserialization
        // Lock-free matching
    }
}`}</code>
              </pre>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">RUST CORE GEN ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Rust Core Generation */}
      <Slide backgroundColor="#050505" notes="AI 能够生成符合 Rust 所有权模型的高性能代码。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">RUST CORE GENERATION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">高性能 Rust 核心生成</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">内存安全与零拷贝</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 自动应用 Rust 的所有权和借用检查机制，生成无需 GC 的内存安全代码。通过 `std::mem::transmute` 等技术实现数据的零拷贝解析。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">极速撮合算法</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 实现基于红黑树或 B-Tree 的高效订单簿管理，确保 O(log N) 的撮合复杂度，并针对缓存行进行数据对齐优化。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Latency Profiling & DoD */}
      <Slide backgroundColor="#050505" notes="AI 不仅写代码，还负责验证代码是否达到了性能指标。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">LATENCY PROFILING</div>
          <h3 className="text-3xl mb-10 font-bold text-white">DoD 验证：性能达标</h3>
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">📊</div>
              <h4 className="font-bold mb-2 text-sm">吞吐量测试</h4>
              <p className="text-[10px] opacity-50">AI 自动生成压力测试脚本，验证系统在 1M TPS 下的稳定性。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">⏱️</div>
              <h4 className="font-bold mb-2 text-sm">延迟分布分析</h4>
              <p className="text-[10px] opacity-50">通过火焰图和性能采样，AI 识别并消除 P99 延迟中的长尾问题。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xl mb-3">✅</div>
              <h4 className="font-bold mb-2 text-sm">自动化 DoD 检查</h4>
              <p className="text-[10px] opacity-50">AI 自动比对测试结果与 Spec 要求，确保每一行代码都符合性能契约。</p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
