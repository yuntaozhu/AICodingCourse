import Slide from "@/components/Slide";

export default function P27() {
  return (
    <Slide notes="实战练习：构建一个 AI 驱动的安全审计工具。">
      <h2 className="text-6xl mb-8">实战：AI 驱动的安全审计工具</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Security Audit Tool</h3>
            <p className="text-sm opacity-70">AI 自动扫描代码库并识别漏洞。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Remediation</h3>
            <p className="text-sm opacity-70">AI 自动生成漏洞修复代码。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">AI Security Auditor</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
