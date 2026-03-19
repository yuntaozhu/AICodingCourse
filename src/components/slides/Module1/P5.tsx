import Slide from "@/components/Slide";

export default function P5() {
  return (
    <Slide notes="RAG 已经死了。Gemini 3.1 的全量上下文让 RAG 变得多余。">
      <h2 className="text-6xl mb-8">RAG 的终结：全量上下文</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h3 className="text-2xl mb-4 text-red-500">RAG (The Old Way)</h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li>✘ 检索召回率低</li>
            <li>✘ 丢失代码库全局上下文</li>
            <li>✘ 复杂的向量库维护</li>
            <li>✘ 幻觉严重</li>
          </ul>
        </div>
        <div className="p-6 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg">
          <h3 className="text-2xl mb-4 text-gemini-cyan">Full Context (The Gemini Way)</h3>
          <ul className="space-y-2 text-sm opacity-70">
            <li>✔ 100% 召回率</li>
            <li>✔ 深度理解跨模块依赖</li>
            <li>✔ 零基础设施负担</li>
            <li>✔ 逻辑推理更精准</li>
          </ul>
        </div>
      </div>
    </Slide>
  );
}
