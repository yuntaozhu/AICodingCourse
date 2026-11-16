import Slide from "@/components/Slide";

export default function P27() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="实战练习：构建一个 AI 驱动的安全审计工具。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            实战：AI 驱动的安全审计工具
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-cyan text-sm">Security Audit Tool</h3>
                <p className="text-xs opacity-60 leading-relaxed">构建一个能够深度理解代码语义的安全审计工具。它不再依赖简单的正则匹配，而是通过数据流分析识别复杂的安全漏洞。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-2 font-bold text-gemini-purple text-sm">Automated Remediation</h3>
                <p className="text-xs opacity-60 leading-relaxed">发现漏洞只是第一步。该工具能够自动生成修复建议，并根据全量代码上下文调整修复方案，确保不破坏原有业务逻辑。</p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-64 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                 <div className="relative w-full h-full flex items-center justify-center text-center p-6">
                   <div className="space-y-3">
                     <div className="text-3xl animate-pulse">🛡️</div>
                     <div className="text-lg font-mono text-gemini-cyan">AI Security Auditor</div>
                     <div className="text-[10px] opacity-40">"Scanning for vulnerabilities and misconfigurations..."</div>
                   </div>
                 </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">VULNERABILITY SCANNING ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Vulnerability Scanning */}
      <Slide backgroundColor="#050505" notes="AI 能够识别出那些隐藏在复杂调用链中的安全漏洞。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">VULNERABILITY SCANNING</div>
          <h3 className="text-3xl mb-8 font-bold text-white">深度漏洞扫描：洞察隐患</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">💉</div>
              <h4 className="font-bold mb-2 text-sm">注入攻击识别</h4>
              <p className="text-[10px] opacity-60">追踪用户输入到数据库查询或系统命令的路径，识别潜在的 SQL 注入或命令注入风险。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">📜</div>
              <h4 className="font-bold mb-2 text-sm">跨站脚本 (XSS)</h4>
              <p className="text-[10px] opacity-60">分析前端渲染逻辑，识别未经过滤的动态内容输出，防止 XSS 攻击。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-2xl mb-3">🔑</div>
              <h4 className="font-bold mb-2 text-sm">敏感信息泄露</h4>
              <p className="text-[10px] opacity-60">自动扫描代码库中的硬编码密钥、密码或敏感配置，并建议使用安全存储方案。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Automated Patching */}
      <Slide backgroundColor="#050505" notes="AI 不仅发现问题，还负责解决问题。">
        <div className="flex flex-col justify-center h-full text-center max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">AUTOMATED PATCHING</div>
          <h3 className="text-3xl mb-10 font-bold text-white">自动化修复：安全闭环</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">智能补丁生成</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                AI 针对识别出的漏洞，自动生成最小化补丁。它会优先使用项目中已有的安全库或框架提供的防御机制。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">修复验证与回归</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                在应用补丁后，AI 自动生成针对该漏洞的测试用例，验证修复效果并确保没有引入新的安全或功能问题。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
