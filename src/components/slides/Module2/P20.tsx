import Slide from "@/components/Slide";

export default function P20() {
  return (
    <Slide notes="全量代码库理解让代码审查变得自动化。AI 可以提供高质量审查。">
      <h2 className="text-6xl mb-8">代码审查：AI 的建议</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            全量代码库理解让代码审查变得自动化。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>识别代码风格和规范问题</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>分析代码逻辑和边界情况</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>提供代码优化和重构建议</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Code Review
# File: main.ts
# Issue: Potential Null Pointer
# Risk Level: Medium
# Recommendation: Add null check`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
