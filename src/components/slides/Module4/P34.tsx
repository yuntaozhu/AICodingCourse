import Slide from "@/components/Slide";

export default function P34() {
  return (
    <Slide notes="Security Agent 是 Agent 的核心能力。Agent 可以自动进行安全审计。">
      <h2 className="text-6xl mb-8">Security Agent: Agent 的安全盾牌</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Security Agent 是 Agent 的核心能力。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动进行漏洞扫描</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动进行安全加固</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动进行合规性审计</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Security Agent
# Task: Audit codebase
# Tool: Gemini 3.1
# Result: 3 vulnerabilities found
# Action: Fix vulnerabilities`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
