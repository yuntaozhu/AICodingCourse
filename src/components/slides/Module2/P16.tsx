import Slide from "@/components/Slide";

export default function P16() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="全量代码库理解让安全审计变得自动化。AI 可以识别漏洞。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-red-500 glow-text">
            安全审计：AI 的扫描
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-xl leading-relaxed font-light opacity-90">
                全量代码库理解让安全审计从“事后补救”变为“事前免疫”。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-red-500 text-2xl">🛡️</div>
                  <div>
                    <div className="font-bold text-lg">漏洞识别</div>
                    <div className="text-xs opacity-60">精准识别 SQL 注入、XSS、越权访问等风险。</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                  <div className="text-red-500 text-2xl">🧩</div>
                  <div>
                    <div className="font-bold text-lg">逻辑漏洞分析</div>
                    <div className="text-xs opacity-60">分析复杂的业务逻辑漏洞，如竞态条件和支付绕过。</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/40 p-6 rounded-2xl border border-red-500/30 relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-3 text-[8px] font-mono text-red-500 opacity-40">SECURITY_AUDIT.MD</div>
              <pre className="text-xs leading-relaxed"><code className="language-markdown">{`# Security Audit
# Issue: SQL Injection Risk
# File: db.ts
# Risk Level: Critical
# Recommendation: Use Parameterized Queries
# Status: UNFIXED`}</code></pre>
              <div className="absolute bottom-3 right-3 animate-bounce text-red-500">
                <span className="text-[10px] font-mono">VULNERABILITY DETECTION ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Vulnerability Detection */}
      <Slide backgroundColor="#050505" notes="AI 不仅看代码，还看数据流。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-red-500 mb-2">VULNERABILITY DETECTION</div>
          <h3 className="text-3xl mb-8 font-bold text-white">深度数据流分析</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-base opacity-70">
                AI 能够追踪不可信输入在系统中的流转路径，识别潜在的攻击面。
              </p>
              <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <h4 className="text-red-400 font-bold mb-2 text-sm">Taint Analysis (污点分析)</h4>
                <p className="text-xs opacity-60 leading-relaxed">从 HTTP 请求参数开始，追踪其是否未经校验就进入了数据库查询或 HTML 渲染。</p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-5xl">🕵️‍♂️</div>
                <div className="text-lg font-bold text-red-400">AI Security Researcher</div>
                <div className="text-[10px] opacity-40">"Found 3 potential injection points in /api/orders"</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Secure Coding Assistant */}
      <Slide backgroundColor="#050505" notes="安全是开发者的责任，AI 是最好的导师。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-red-500 mb-2">SECURE CODING ASSISTANT</div>
          <h3 className="text-3xl mb-10 font-bold text-white">实时安全编码指导</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-red-400">即时反馈</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                当开发者编写不安全的代码时，AI 会立即介入并提供安全的替代方案，而不是等到代码审查阶段。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-green-400">自动修复建议</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 不仅指出漏洞，还能一键生成修复后的代码，并附带详细的安全原理解释。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
