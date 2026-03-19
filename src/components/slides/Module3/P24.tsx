import Slide from "@/components/Slide";

export default function P24() {
  return (
    <Slide notes="PBT (Property-Based Testing) 是高质量测试的保障。AI 可以生成 PBT。">
      <h2 className="text-6xl mb-8">PBT: 属性驱动的测试</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            PBT (Property-Based Testing) 是高质量测试的保障。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>定义代码应遵循的属性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>自动生成海量测试数据</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>发现传统测试难以覆盖的边界情况</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# PBT: Sort Function
# Property: Output is sorted
# Property: Output contains same elements as input
# Tool: Gemini 3.1
# Result: Edge cases found (empty list, duplicates)`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
