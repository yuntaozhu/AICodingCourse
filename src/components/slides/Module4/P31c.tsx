import Slide from "@/components/Slide";

export default function P31c() {
  return (
    <Slide backgroundColor="#020205" notes="SDD 的提示词设计是 AI Native 研发的关键。它不是简单的‘帮我写个文档’，而是‘根据我的业务需求，生成一份包含架构决策、数据模型和接口定义的 SDD’。AI 能够根据 SDD 自动生成代码、测试用例和文档，实现‘一处定义，处处生成’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">SDD 核心提示词与 AI 协同模式</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">SDD 开发提示词 (Prompt)</h3>
              <pre className="text-[10px] font-mono text-gemini-cyan/80 bg-black/40 p-4 rounded-xl border border-white/10 whitespace-pre-wrap">
{`# Role: Senior Architect
# Task: Generate SDD for [Feature Name]
# Context: Current Tech Stack (React, Node, PG)
# Requirements:
1. Define Data Models (JSON Schema)
2. Define API Endpoints (OpenAPI Spec)
3. Outline Component Hierarchy
4. Specify Security & Error Handling
5. Define Performance Constraints
# Output: Structured Markdown SDD`}
              </pre>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">AI 协同模式</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center text-xl">📝</div>
                  <div className="text-xs"><strong>Human:</strong> 提供业务意图与核心约束。</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-xl">🧠</div>
                  <div className="text-xs"><strong>AI:</strong> 生成结构化 SDD 并进行架构对齐。</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center text-xl">🛠️</div>
                  <div className="text-xs"><strong>AI Agent:</strong> 根据 SDD 自动生成全栈代码。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
