import Slide from "@/components/Slide";

export default function P38() {
  return (
    <Slide notes="Agent 学习是 Agent 的核心能力。Agent 可以从反馈中学习。">
      <h2 className="text-6xl mb-8">Agent 学习：从反馈到进化</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Agent 学习是 Agent 的核心能力。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动收集用户反馈</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动分析反馈并进行自我优化</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动更新知识库和模型</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Agent Learning
# Input: User Feedback
# Action: Analyze feedback -> Update Spec -> Regenerate Code -> Verify`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
