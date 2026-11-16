import Slide from "@/components/Slide";

export default function P5() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="RAG 已经死了。AI Coding 的全量上下文让 RAG 变得多余。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            RAG 的终结：全量上下文
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-red-500 opacity-40">LEGACY_RAG.LOG</div>
              <h3 className="text-xl mb-4 text-red-500 font-bold">RAG (The Old Way)</h3>
              <ul className="space-y-3 text-base opacity-80">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1 text-xs">✘</span>
                  <span className="text-sm">检索召回率低：Top-K 检索经常丢失关键代码片段。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1 text-xs">✘</span>
                  <span className="text-sm">丢失全局观：无法理解跨文件、跨模块的长程依赖。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1 text-xs">✘</span>
                  <span className="text-sm">维护成本高：复杂的向量数据库、Embedding 模型同步。</span>
                </li>
              </ul>
            </div>
            <div className="p-6 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-gemini-cyan opacity-40">FULL_CONTEXT.SYS</div>
              <h3 className="text-xl mb-4 text-gemini-cyan font-bold">Full Context (The AI Coding Way)</h3>
              <ul className="space-y-3 text-base opacity-80">
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan mt-1 text-xs">✔</span>
                  <span className="text-sm">100% 召回率：整个代码库都在内存中，无一遗漏。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan mt-1 text-xs">✔</span>
                  <span className="text-sm">深度依赖理解：精准定位全局变量、接口实现和调用链。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan mt-1 text-xs">✔</span>
                  <span className="text-sm">零基建负担：无需向量库，直接读取原始文件。</span>
                </li>
              </ul>
              <div className="absolute bottom-3 right-3 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">DEEP DIVE ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Why RAG Fails in Coding */}
      <Slide backgroundColor="#050505" notes="代码不是自然语言，代码是图结构。RAG 的切片会破坏这种结构。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">TECHNICAL ANALYSIS 01</div>
          <h3 className="text-3xl mb-8 font-bold text-white">为什么 RAG 在代码场景表现糟糕？</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-3">🧩</div>
              <h4 className="font-bold mb-1 text-base">语义断裂</h4>
              <p className="text-xs opacity-60">Chunking (切片) 会将一个完整的函数或类强行拆分，导致 AI 无法理解完整的逻辑块。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-3">🕸️</div>
              <h4 className="font-bold mb-1 text-base">长程依赖丢失</h4>
              <p className="text-xs opacity-60">A 文件定义的类型在 B 文件使用，RAG 很难在检索时同时召回这两者。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-3">🌫️</div>
              <h4 className="font-bold mb-1 text-base">向量噪声</h4>
              <p className="text-xs opacity-60">代码中相似的变量名会导致向量空间重叠，检索出大量无关的“干扰项”。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: The Power of 1M+ Context */}
      <Slide backgroundColor="#050505" notes="100万+ Token 意味着你可以把整个项目、文档、甚至依赖库全部塞进去。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">TECHNICAL ANALYSIS 02</div>
          <h3 className="text-3xl mb-8 font-bold text-white">百万级上下文带来的质变</h3>
          <div className="bg-gradient-to-br from-gemini-cyan/20 to-gemini-purple/20 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-white">1M+</div>
                <div className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Tokens</div>
              </div>
              <div className="text-3xl opacity-30">≈</div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-white">30,000+</div>
                <div className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Files</div>
              </div>
              <div className="text-3xl opacity-30">≈</div>
              <div className="text-center px-4">
                <div className="text-4xl font-bold text-white">Entire</div>
                <div className="text-[10px] opacity-50 uppercase tracking-widest mt-1">Repo</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 text-left">
              <div className="space-y-1">
                <h4 className="font-bold text-gemini-cyan text-base">全局推理能力</h4>
                <p className="text-xs opacity-70">AI 可以像人类架构师一样，在脑中构建完整的项目蓝图，进行跨文件的重构和逻辑验证。</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gemini-cyan text-base">零丢失的知识库</h4>
                <p className="text-xs opacity-70">所有的 API 文档、设计规范、历史提交记录都可以作为上下文，实现真正的“知行合一”。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Beyond RAG - Context Caching */}
      <Slide backgroundColor="#050505" notes="Context Caching 解决了长上下文的成本和延迟问题。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">THE NEW PARADIGM</div>
          <h3 className="text-3xl mb-8 font-bold text-white">不使用 RAG，那使用什么？</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-cyan font-bold mb-4">Context Caching (上下文缓存)</h4>
              <p className="text-sm opacity-70 leading-relaxed mb-4">
                将整个代码库预先加载到模型的 KV Cache 中。后续请求只需发送增量变化，响应速度提升 10 倍，成本降低 90%。
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-gemini-cyan">
                <span className="px-2 py-1 bg-gemini-cyan/10 rounded">PRE-LOADED</span>
                <span>➔</span>
                <span className="px-2 py-1 bg-gemini-cyan/10 rounded">INSTANT ACCESS</span>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-purple font-bold mb-4">Long Context Reasoning</h4>
              <p className="text-sm opacity-70 leading-relaxed mb-4">
                模型直接在原生注意力机制中处理全局依赖。不再需要复杂的 Embedding 匹配，而是直接进行语义层面的逻辑推理。
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-gemini-purple">
                <span className="px-2 py-1 bg-gemini-purple/10 rounded">NATIVE ATTENTION</span>
                <span>➔</span>
                <span className="px-2 py-1 bg-gemini-purple/10 rounded">GLOBAL LOGIC</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: Case Study - Legacy Refactoring */}
      <Slide backgroundColor="#050505" notes="全量上下文让重构变得前所未有的简单。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">CASE STUDY</div>
          <h3 className="text-3xl mb-8 font-bold text-white">案例：重构 10 万行遗留项目</h3>
          <div className="relative p-8 bg-gemini-cyan/5 rounded-3xl border border-gemini-cyan/20 overflow-hidden">
            <div className="grid grid-cols-3 gap-8 relative z-10">
              <div className="text-center">
                <div className="text-sm font-bold text-gemini-cyan mb-2">Step 1: Ingestion</div>
                <p className="text-[10px] opacity-60">将 10 万行代码、300 个文件一次性喂给 AI。AI 自动绘制出全局数据流图。</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gemini-cyan mb-2">Step 2: Analysis</div>
                <p className="text-[10px] opacity-60">识别出 15 处隐藏的全局状态污染和 3 处循环依赖。这是 RAG 绝对无法发现的。</p>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-gemini-cyan mb-2">Step 3: Execution</div>
                <p className="text-[10px] opacity-60">AI 自动生成重构计划并执行。跨文件的变量重命名和接口抽象在秒级完成。</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs italic opacity-50">"以前需要 2 周的人工审计，现在 AI 只需要 2 分钟。"</div>
              <div className="px-4 py-2 bg-gemini-cyan text-black font-bold rounded-full text-xs">效率提升 100x</div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
