import Slide from "@/components/Slide";

export default function P34() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Security Agent 是 Agent 的核心能力。Agent 可以自动进行安全审计。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center px-8">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-purple glow-text text-center">
            Security Agent: Agent 的安全盾牌
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed opacity-80">
                Security Agent 不仅是扫描器，更是能够自主思考、防御和修复的安全专家。
              </p>
              <ul className="space-y-4 text-lg">
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动进行漏洞扫描</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动进行安全加固</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <span className="text-gemini-purple group-hover:scale-125 transition-transform">▶</span>
                  <span className="font-bold">Agent 自动进行合规性审计</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gemini-purple/5 p-6 rounded-3xl border border-gemini-purple/20 purple-glow h-full flex flex-col justify-center">
                <pre className="font-mono text-xs text-gemini-purple/80 leading-relaxed">
                  <code>{`# Security Agent
# Task: Audit codebase
# Tool: AI Coding
# Result: 3 vulnerabilities found
# Action: Fix vulnerabilities
# Status: Secure ✅`}</code>
                </pre>
              </div>
              <div className="absolute -bottom-4 -right-4 animate-bounce text-gemini-purple">
                <span className="text-[10px] font-mono">THREAT MODELING ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Threat Modeling */}
      <Slide backgroundColor="#050505" notes="AI 可以自动识别潜在的攻击向量。">
        <div className="max-w-5xl mx-auto h-full flex flex-col justify-center px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">THREAT MODELING</div>
          <h3 className="text-3xl mb-6 font-bold text-white">威胁建模：预判攻击</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">攻击面分析</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                Agent 自动扫描系统的所有入口点（API、UI、数据库、第三方集成），识别潜在的攻击路径，并根据业务逻辑评估风险等级。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">红蓝对抗模拟</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 模拟攻击者的思维，尝试利用识别出的漏洞进行渗透，同时作为防御者提出加固方案，实现自我进化的安全防御。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Compliance as Code */}
      <Slide backgroundColor="#050505" notes="AI 可以确保系统始终符合安全合规标准。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center px-8">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">COMPLIANCE AS CODE</div>
          <h3 className="text-3xl mb-8 font-bold text-white">合规即代码：持续审计</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">自动化合规检查</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                实时监控代码和配置，确保其符合 SOC2、ISO 27001 或 GDPR 等国际安全标准，自动生成合规性报告。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">安全策略强制执行</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                在 CI/CD 流程中自动拦截不符合安全策略的变更，并提供详细的改进建议，将安全隐患消灭在萌芽状态。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
