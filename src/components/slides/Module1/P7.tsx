import Slide from "@/components/Slide";

export default function P7() {
  return (
    <Slide notes="Spec-Driven Development (SDD) 是 AI Native 的基石。没有 Spec，就没有确定性。">
      <h2 className="text-6xl mb-8">SDD: 确定性研发的基石</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            SDD (Spec-Driven Development) 是 AI Native 的核心。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Spec 是 AI 的指令集</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Spec 抹平了语言边界</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>Spec 是可验证的</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Spec: User Authentication
# Input: Email, Password
# Output: JWT Token
# Validation: Email format, Password length
# Error: 401 Unauthorized`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
