import Slide from "@/components/Slide";

export default function P18() {
  return (
    <Slide notes="全量代码库理解让文档生成变得自动化。AI 可以生成高质量文档。">
      <h2 className="text-6xl mb-8">文档生成：AI 的写作</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            全量代码库理解让文档生成变得自动化。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>生成 API 接口文档</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>生成系统架构文档</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>生成用户操作手册</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# API Documentation
# Endpoint: /api/auth
# Method: POST
# Description: User login
# Parameters: email, password`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
