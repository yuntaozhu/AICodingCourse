import Slide from "@/components/Slide";

export default function P32() {
  return (
    <Slide notes="Browser Use 是 Agent 的核心能力。Agent 可以像人一样操作浏览器。">
      <h2 className="text-6xl mb-8">Browser Use: Agent 的眼睛和手</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            Browser Use 是 Agent 的核心能力。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动操作浏览器完成任务</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动识别网页元素并进行交互</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Agent 自动处理网页中的复杂逻辑</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Browser Use
# Task: Book a flight
# Tool: Gemini 3.1 + Playwright
# Action: Open browser -> Search flight -> Select flight -> Book flight`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
