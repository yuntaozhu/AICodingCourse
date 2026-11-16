import Slide from "@/components/Slide";

export default function Module4() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#050510" notes="RAG 的终结：全量上下文。探讨为什么在 AI Coding 中，全量上下文优于 RAG。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-cyan text-xs uppercase tracking-widest mb-3">Module 4</h2>
          <h1 className="text-7xl mb-4 leading-none text-white font-bold">RAG 的终结：<br /><span className="text-gemini-purple">全量上下文</span></h1>
          <p className="text-2xl font-mono text-gemini-purple opacity-80 mb-6">AI Coding 的范式转移：从检索到理解</p>
          <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
          <p className="text-sm text-white/50 italic animate-bounce">↓ 点击向下按钮探索更多</p>
        </div>
      </Slide>

      {/* Sub Slide 1: Why not RAG */}
      <Slide backgroundColor="#0a0a15" notes="为什么 AI Coding 不再需要 RAG？代码的结构化特性决定了局部检索的局限性。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">Why Not RAG?</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">为什么 AI Coding 不再需要 RAG？</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
              <h3 className="text-gemini-cyan text-xl mb-4 font-bold">RAG 的局限性</h3>
              <ul className="space-y-4 text-white/80">
                <li className="flex gap-3">
                  <span className="text-gemini-purple">●</span>
                  <span><strong className="text-white">检索不精准：</strong>向量相似度无法理解代码逻辑。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-purple">●</span>
                  <span><strong className="text-white">丢失全局依赖：</strong>无法跨文件理解复杂的调用链路。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-purple">●</span>
                  <span><strong className="text-white">上下文碎片化：</strong>AI 拿到的只是代码片段，而非系统全貌。</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center bg-gemini-purple/5 p-8 rounded-2xl border border-gemini-purple/20">
              <p className="text-lg leading-relaxed text-white/70 italic">
                “代码是高度结构化的，一个变量的定义可能在 A 文件，使用在 B 文件，而类型约束在 C 文件。局部检索永远无法拼凑出完整的架构意志。”
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Long Context */}
      <Slide backgroundColor="#050510" notes="全量上下文的崛起。Gemini 1.5 Pro 等模型提供的超长上下文窗口改变了游戏规则。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">The Rise of Long Context</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">全量上下文 (Long Context) 的崛起</h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-8 bg-gemini-purple/10 p-8 rounded-2xl border border-gemini-purple/30">
              <div className="text-6xl font-bold text-gemini-cyan tracking-tighter">2,000,000+</div>
              <div>
                <h3 className="text-2xl font-bold text-white">Tokens 上下文窗口</h3>
                <p className="text-white/60">Gemini 2.0 / 1.5 Pro 支持百万级 Token 输入</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
                <h4 className="font-bold mb-2 text-gemini-cyan">上帝视角</h4>
                <p className="text-sm text-white/60">整个代码库直接喂给模型，无需检索，模型拥有全局认知。</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
                <h4 className="font-bold mb-2 text-gemini-cyan">零丢失</h4>
                <p className="text-sm text-white/60">保留所有文件关联、注释和历史上下文，避免信息断层。</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
                <h4 className="font-bold mb-2 text-gemini-cyan">深度推理</h4>
                <p className="text-sm text-white/60">模型在全量数据上进行跨文件逻辑推理，识别深层冲突。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Case Study */}
      <Slide backgroundColor="#100510" notes="案例分析：重构遗留系统。展示全量上下文在实际复杂项目中的威力。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">Case Study</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">案例：重构一个拥有 50 个文件的遗留系统</h3>
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="w-1/2 p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="text-red-400 font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">❌</span> RAG 方案的失败
                </div>
                <p className="text-white/70 leading-relaxed">
                  由于检索窗口限制，AI 漏掉了位于深层目录的一个全局拦截器定义，导致生成的重构代码在运行时产生权限漏洞。
                </p>
              </div>
              <div className="w-1/2 p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">✅</span> 全量上下文方案的成功
                </div>
                <p className="text-white/70 leading-relaxed">
                  AI 读入全部 50 个文件，识别出跨文件的逻辑冲突，并自动补全了所有受影响的接口调用，一次性完成 0 Bug 重构。
                </p>
              </div>
            </div>
            <div className="p-8 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-2xl text-center">
              <p className="text-2xl font-bold text-gemini-cyan italic">
                “在 AI Coding 时代，上下文就是生产力。”
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
