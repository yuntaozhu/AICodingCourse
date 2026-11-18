import Slide from "@/components/Slide";

export default function P85c() {
  return (
    <Slide backgroundColor="#020205" notes="AI 驱动的 CR 不仅仅是一个简单的检查工具，它是集成在 CI/CD 流水线中的核心环节。每当有代码提交（无论是人类还是 AI 代理），AI Coding 都会作为第一道防线，从架构、安全、性能和规范四个维度进行深度扫描。只有通过了 AI 评审的代码，才会进入人类终审阶段。下一页我们将进行一个实时演示。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">CI/CD 中的 AI 评审流水线</h2>
        
        <div className="grid grid-cols-1 gap-8">
          <div className="flex justify-between items-center bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gemini-purple"></div>
            
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-2xl border border-white/20">📥</div>
              <div className="text-xs font-mono opacity-60 uppercase">Code Push</div>
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-gemini-purple/50 mx-4 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gemini-purple">Trigger Webhook</div>
            </div>

            <div className="flex flex-col items-center gap-4 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gemini-purple/20 blur-xl rounded-full"></div>
                <div className="w-24 h-24 bg-gemini-purple/20 rounded-full flex items-center justify-center text-4xl border-2 border-gemini-purple relative">🤖</div>
              </div>
              <div className="text-sm font-bold text-gemini-purple">AI Coding CR Agent</div>
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-gemini-purple/50 to-white/20 mx-4 relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gemini-cyan">Post Feedback</div>
            </div>

            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-2xl border border-white/20">💬</div>
              <div className="text-xs font-mono opacity-60 uppercase">PR Comments</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-purple/50 transition-colors">
              <div className="text-xl mb-2">🏗️</div>
              <div className="text-sm font-bold text-white mb-1">架构遵循</div>
              <p className="text-[10px] opacity-60">验证代码是否符合 DDD 规范及模块解耦原则。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors">
              <div className="text-xl mb-2">🛡️</div>
              <div className="text-sm font-bold text-white mb-1">安全审计</div>
              <p className="text-[10px] opacity-60">实时扫描 SQL 注入、XSS 及敏感信息泄露。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-colors">
              <div className="text-xl mb-2">⚡</div>
              <div className="text-sm font-bold text-white mb-1">性能优化</div>
              <p className="text-[10px] opacity-60">识别 O(n) 查询、内存泄漏及非必要重绘。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
              <div className="text-xl mb-2">✨</div>
              <div className="text-sm font-bold text-white mb-1">最佳实践</div>
              <p className="text-[10px] opacity-60">确保变量命名、注释规范及代码简洁度。</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30 flex items-center gap-4">
          <div className="text-xs font-mono text-gemini-purple bg-gemini-purple/20 px-2 py-1 rounded">PROMPT</div>
          <p className="text-[10px] italic opacity-70">
            "Act as a Principal Engineer. Review this diff for architectural violations against our '2026-Core-Specs'. 
            Flag any security risks and suggest performance improvements for high-load scenarios."
          </p>
        </div>
      </div>
    </Slide>
  );
}
