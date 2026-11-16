import Slide from "@/components/Slide";

export default function P2() {
  return (
    <Slide notes="平庸的开发者用 AI 写函数，顶级的架构师用 AI 托管意志。我们要建立的是一套严密的逻辑闭环：从 Intent 到 Spec 到 DoD。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan italic">拒绝平庸：不仅仅是补全</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <p className="text-lg leading-relaxed opacity-90">
              在 AI Coding 时代，AI 不再是你的“副驾驶”，而是你的“首席架构师”。
            </p>
            <ul className="space-y-3 text-base">
              <li className="flex items-start gap-2">
                <span className="text-gemini-cyan">▶</span>
                <span>从代码补全到“架构意志”的全面托管</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gemini-cyan">▶</span>
                <span>抹平语言边界：Java/Go/Rust 只是实现细节</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gemini-cyan">▶</span>
                <span>拒绝 Vibe Coding：强制推行 SDD (Spec-Driven Development)</span>
              </li>
            </ul>
          </div>
          <div className="bg-gemini-purple/10 p-5 rounded-xl border border-gemini-purple/30 purple-glow flex flex-col justify-center">
            <pre className="text-xs"><code className="language-markdown">{`# Intent: Build a high-perf trading engine
# Spec: Zero-copy, Lock-free, Rust-based
# DoD: 1M TPS, < 10us latency
# Action: AI Coding generates full repo structure`}</code></pre>
          </div>
        </div>
      </div>
    </Slide>
  );
}
