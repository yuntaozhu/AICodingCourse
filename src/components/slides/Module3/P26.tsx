import Slide from "@/components/Slide";

export default function P26() {
  return (
    <Slide notes="实战练习：构建一个 AI 驱动的交易引擎。">
      <h2 className="text-6xl mb-8">实战：AI 驱动的交易引擎</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            实战练习：构建一个 AI 驱动的交易引擎。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Spec: 高并发、低延迟、零拷贝</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Action: Gemini 3.1 生成 Rust 核心代码</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>DoD: 1M TPS, {"<"} 10us latency</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-rust">{`// Rust Trading Engine
struct Engine {
    order_book: OrderBook,
}
impl Engine {
    fn process_order(&mut self, order: Order) {
        // AI generated high-perf logic
    }
}`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
