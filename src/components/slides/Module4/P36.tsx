import Slide from "@/components/Slide";

export default function P36() {
  return (
    <Slide notes="Agent 闭环是 Agent 的核心能力。Agent 可以自动完成任务并验证。">
      <h2 className="text-6xl mb-8">Agent 闭环：从任务到验证</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Agent 闭环是 Agent 的核心能力。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动执行任务</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动验证任务结果</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动修复任务中的问题</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Agent Loop
# Task: Create API
# Action: Generate code -> Run tests -> Fix errors -> Verify API`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
