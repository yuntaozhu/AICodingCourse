import Slide from "@/components/Slide";

export default function P12b() {
  return (
    <Slide backgroundColor="#020205" notes="RAG 在处理代码时有天然的缺陷：它会切断代码之间的语义联系。而 2M+ 的全量上下文让 AI 能够像人类架构师一样，同时‘看到’整个项目的依赖树。这不是简单的搜索，而是全局的推理。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">RAG 的终结：全量上下文</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
              <h3 className="text-xl font-bold mb-2 text-red-400">RAG 的局限 (The Old Way)</h3>
              <ul className="text-sm space-y-2 opacity-70">
                <li>• <strong className="text-white">语义断裂：</strong> 代码切片丢失了跨文件的类继承和调用关系。</li>
                <li>• <strong className="text-white">检索噪声：</strong> 相似的代码片段误导 AI，导致“幻觉”式修复。</li>
                <li>• <strong className="text-white">缺乏全局观：</strong> 无法理解复杂的架构模式和全局配置。</li>
              </ul>
            </div>
            <div className="p-6 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30">
              <h3 className="text-xl font-bold mb-2 text-gemini-cyan">全量上下文 (The AI Native Way)</h3>
              <ul className="text-sm space-y-2">
                <li>• <strong className="text-white">2M+ Token：</strong> 整个仓库、文档、依赖库全部装入 Context。</li>
                <li>• <strong className="text-white">全局推理：</strong> AI 能够理解 A 文件修改对 Z 文件的潜在影响。</li>
                <li>• <strong className="text-white">零碎片化：</strong> 保持代码的完整性，实现真正的“架构级”理解。</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gemini-purple/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full border-2 border-dashed border-gemini-cyan/50 rounded-full p-8 text-center">
                <div className="text-4xl mb-4">📚</div>
                <div className="text-lg font-bold">From "Search"<br/>to "Reasoning"</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
