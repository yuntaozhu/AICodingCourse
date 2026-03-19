import Slide from "@/components/Slide";

export default function P9() {
  return (
    <Slide notes="Agentic Workflow 是 AI Native 的核心。Agent 不再是孤立的工具，而是协作的团队。">
      <h2 className="text-6xl mb-8">Agentic Workflow: 协作的艺术</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Agentic Workflow 是 AI Native 的核心。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 协作：从 Intent 到 Code</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 闭环：从 Code 到 Test</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 编排：从 Test 到 Deploy</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Agent: Architect
# Agent: Developer
# Agent: Tester
# Agent: Security Auditor
# Workflow: Architect -> Developer -> Tester -> Security Auditor`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
