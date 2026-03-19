import Slide from "@/components/Slide";

export default function P14() {
  return (
    <Slide notes="全量代码库理解让技术债分析变得自动化。AI 可以识别代码异味。">
      <h2 className="text-6xl mb-8">技术债分析：AI 的诊断</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <p className="text-xl leading-relaxed">
            全量代码库理解让技术债分析变得自动化。
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>识别代码异味和冗余</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>分析模块耦合度和内聚性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gemini-cyan">▶</span>
              <span>提供重构优先级建议</span>
            </li>
          </ul>
        </div>
        <div className="bg-gemini-purple/10 p-6 rounded-lg border border-gemini-purple/30 purple-glow">
          <pre><code className="language-markdown">{`# Technical Debt Audit
# Module: Auth
# Issue: High coupling with Database
# Debt Level: High
# Recommendation: Extract Interface`}</code></pre>
        </div>
      </div>
    </Slide>
  );
}
