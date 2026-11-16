import Slide from "@/components/Slide";

export default function P38() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 学习是 Agent 的核心能力。Agent 可以从反馈中学习。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text text-center">
            Agent 学习：从反馈到进化
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed text-white/80">
                Agent 不仅仅是执行者，更是能够通过闭环反馈不断自我进化的智能体。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">多维反馈收集：从用户评价到运行指标</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">自动根因分析：识别模式并进行自我优化</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="opacity-70 group-hover:opacity-100 transition-opacity">持续知识更新：动态扩展 RAG 与模型参数</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="text-xs font-mono text-gemini-purple/80 leading-relaxed">
                  <code className="language-markdown">{`# Agent Evolution Loop
# 1. Collect: User Feedback & Logs
# 2. Analyze: Pattern Recognition
# 3. Optimize: Update Prompt/Spec
# 4. Deploy: Regenerate & Verify
# 5. Learn: Store in Memory`}</code>
                </pre>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">FEEDBACK LOOP ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Feedback Loop */}
      <Slide backgroundColor="#050505" notes="详细展示从反馈到优化的闭环流程。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">FEEDBACK LOOP</div>
          <h3 className="text-3xl mb-8 font-bold text-white">闭环反馈：智能进化的引擎</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl mb-3">📥</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-purple">感知 (Perceive)</h4>
              <p className="text-[10px] opacity-50 leading-tight">收集用户显式反馈、代码报错、性能瓶颈及安全预警。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl mb-3">🧠</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-purple">思考 (Reflect)</h4>
              <p className="text-[10px] opacity-50 leading-tight">利用 LLM 分析失败案例，提取共性问题，生成优化策略。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-2xl mb-3">⚡</div>
              <h4 className="text-sm font-bold mb-1 text-gemini-purple">行动 (Act)</h4>
              <p className="text-[10px] opacity-50 leading-tight">自动修改 Prompt、更新代码规范 or 调整模型微调数据集。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Knowledge Evolution */}
      <Slide backgroundColor="#050505" notes="Agent 如何更新其内部知识库。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">KNOWLEDGE EVOLUTION</div>
          <h3 className="text-3xl mb-10 font-bold text-white">知识进化：构建动态专家系统</h3>
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="flex gap-6 items-center p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-gemini-purple/20 rounded-full flex items-center justify-center text-xl shrink-0">📚</div>
              <div>
                <h4 className="text-lg font-bold text-gemini-purple mb-1">动态 RAG 更新</h4>
                <p className="text-xs opacity-60 leading-relaxed">Agent 自动将新解决的问题、新采用的技术栈文档索引到向量数据库中，确保知识的时效性。</p>
              </div>
            </div>
            <div className="flex gap-6 items-center p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-gemini-cyan/20 rounded-full flex items-center justify-center text-xl shrink-0">🧬</div>
              <div>
                <h4 className="text-lg font-bold text-gemini-cyan mb-1">模型持续微调</h4>
                <p className="text-xs opacity-60 leading-relaxed">基于高质量的 R&D 历史数据，Agent 可以触发轻量级微调（LoRA 等），使模型更契合特定业务场景。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
