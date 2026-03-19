import Slide from "@/components/Slide";

export default function P16() {
  return (
    <Slide notes="全量代码库理解让安全审计变得自动化。AI 可以识别漏洞。">
      <h2 className="text-6xl mb-8">安全审计：AI 的扫描</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            全量代码库理解让安全审计变得自动化。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>识别 SQL 注入和 XSS 风险</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>分析权限控制逻辑漏洞</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>提供漏洞修复建议</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Security Audit
# Issue: SQL Injection Risk
# File: db.ts
# Risk Level: Critical
# Recommendation: Use Parameterized Queries`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
