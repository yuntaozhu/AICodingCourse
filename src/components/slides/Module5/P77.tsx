import Slide from "@/components/Slide";

export default function P77() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="工欲善其事，必先利其器。在 2026 年，我们已经拥有了一系列强大的评估工具。Promptfoo 帮助我们优化提示词，LangSmith 提供了全链路的追踪和评估。这些工具的集成，让我们的评估闭环变得更加稳健。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">评估工具箱：<span className="text-gemini-purple italic">2026 标配</span></h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start hover:bg-white/10 transition-colors group cursor-pointer">
            <div className="w-16 h-16 bg-gemini-cyan/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛠️</div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gemini-cyan">Promptfoo</h3>
              <p className="opacity-60 text-sm">针对提示词（Prompt）的自动化测试与对比评估。支持多模型横向对比。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start hover:bg-white/10 transition-colors group cursor-pointer">
            <div className="w-16 h-16 bg-gemini-purple/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔍</div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gemini-purple">LangSmith</h3>
              <p className="opacity-60 text-sm">全链路 Trace 监控与评估。实时捕捉 AI 的思考过程并进行打分。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start hover:bg-white/10 transition-colors group cursor-pointer">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛡️</div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">G-Eval Framework</h3>
              <p className="opacity-60 text-sm">基于 LLM 的语义评估标准。通过 CoT 提供可解释的评分理由。</p>
            </div>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 flex gap-6 items-start hover:bg-white/10 transition-colors group cursor-pointer">
            <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📊</div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-400">Custom Eval Pipelines</h3>
              <p className="opacity-60 text-sm">企业内部自建的评估流水线。集成业务私有数据与合规性检查。</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-2xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Promptfoo Deep Dive */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-gemini-cyan">Promptfoo：提示词工程的“单元测试”</h3>
        <div className="grid grid-cols-2 gap-12">
          <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
            <div className="text-sm font-mono text-gemini-purple mb-4">promptfooconfig.yaml</div>
            <pre className="text-xs opacity-70 leading-relaxed">
{`prompts: [prompt1.txt, prompt2.txt]
providers: [openai:gpt-4o, google:gemini-1.5-pro]
tests:
  - vars:
      input: "如何实现分布式锁？"
    assert:
      - type: icontains
        value: "Redis"
      - type: llm-rubric
        value: "回答必须包含安全风险提示"`}
            </pre>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl font-bold mb-2 text-gemini-cyan">多维对比矩阵</div>
              <p className="text-sm opacity-60">一眼看出不同模型、不同 Prompt 在相同输入下的得分差异。</p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl font-bold mb-2 text-gemini-cyan">自动化断言</div>
              <p className="text-sm opacity-60">支持正则、语义相似度、甚至调用另一个 LLM 进行逻辑断言。</p>
            </div>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: LangSmith Tracing */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-gemini-purple">LangSmith：AI 思考过程的“显微镜”</h3>
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-gemini-cyan/20 text-gemini-cyan text-xs rounded border border-gemini-cyan/40">Trace</div>
              <div className="flex-1 h-px bg-white/10"></div>
              <div className="text-xs opacity-40">240ms</div>
            </div>
            <div className="ml-8 p-4 bg-white/5 rounded-lg border-l-4 border-gemini-purple">
              <div className="text-sm font-bold mb-1">Chain: CodeGeneration</div>
              <p className="text-xs opacity-50">Input: "Create a React component for user profile"</p>
            </div>
            <div className="ml-16 p-4 bg-white/5 rounded-lg border-l-4 border-gemini-cyan">
              <div className="text-sm font-bold mb-1">Tool: BrowserSearch</div>
              <p className="text-xs opacity-50">Searching for "Tailwind profile card templates"</p>
            </div>
            <div className="ml-8 p-4 bg-green-500/10 rounded-lg border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div className="text-sm font-bold">Feedback: Correctness</div>
                <div className="text-green-400 font-bold">Score: 0.95</div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center text-sm opacity-60">
            “通过全链路 Trace，我们不仅知道结果对不对，更知道它是如何推导出来的，从而精准优化 Agent 的工作流。”
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
