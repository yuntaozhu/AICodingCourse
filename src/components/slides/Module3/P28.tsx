import Slide from "@/components/Slide";

export default function P28() {
  return (
    <Slide notes="实战练习：构建一个 AI 驱动的性能优化工具。">
      <h2 className="text-6xl mb-8">实战：AI 驱动的性能优化工具</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            实战练习：构建一个 AI 驱动的性能优化工具。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>AI 自动识别性能瓶颈</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>AI 自动生成优化建议</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>AI 自动验证优化效果</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Performance Optimization
# Bottleneck: JSON Parsing
# Tool: Gemini 3.1
# Result: Use simdjson
# Speedup: 10x`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
