import Slide from "@/components/Slide";

export default function P37() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="Agent 编排是 Agent 的核心能力。Agent 可以自动管理研发流程。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text text-center">
            Agent 编排：研发流程的自动化
          </h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="flex flex-col justify-center gap-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-cyan">Automated CI/CD</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  Agent 接管传统的流水线，不仅负责构建 and 部署，还能根据代码变更的风险等级动态调整测试策略，实现真正的持续集成 and 持续交付。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <h3 className="text-xl mb-1 font-bold text-gemini-purple">Automated Release</h3>
                <p className="text-xs opacity-60 leading-relaxed">
                  从版本号递增、更新日志生成到多渠道分发，Agent 自动化管理整个发布流程，减少人为干预，降低发布风险。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="w-full h-72 bg-gemini-cyan/5 border border-gemini-cyan/20 rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center text-center p-8">
                  <div className="space-y-4">
                    <div className="text-4xl animate-pulse">🚀</div>
                    <div className="text-xl font-mono text-gemini-cyan">CI/CD Orchestrator</div>
                    <div className="text-xs opacity-40">"Managing deployment pipelines and release cycles..."</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 animate-bounce text-gemini-cyan">
                <span className="text-[10px] font-mono">INTELLIGENT PIPELINE ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Intelligent Pipeline */}
      <Slide backgroundColor="#050505" notes="AI 可以优化流水线执行效率并自动分析失败原因。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">INTELLIGENT PIPELINE</div>
          <h3 className="text-3xl mb-6 font-bold text-white">智能流水线：提效与自愈</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">执行路径优化</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                Agent 分析历史构建数据，识别耗时最长的环节，并自动优化并行度 or 缓存策略，显著缩短反馈周期。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">失败自动诊断</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                当流水线失败时，Agent 自动分析日志，区分是环境问题、测试抖动还是真正的代码漏洞，并给出修复建议。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Canary Deployment */}
      <Slide backgroundColor="#050505" notes="AI 能够自主管理灰度发布过程。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center text-center">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">CANARY DEPLOYMENT</div>
          <h3 className="text-3xl mb-8 font-bold text-white">灰度发布：数据驱动的决策</h3>
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">实时指标监控</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                在灰度发布期间，Agent 实时监控错误率、延迟 and 业务指标，自动对比灰度组与对照组的差异。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-purple">自动回滚与放量</h4>
              <p className="text-xs opacity-60 leading-relaxed">
                如果灰度指标异常，Agent 立即触发自动回滚；如果表现稳定，则按预设策略逐步扩大流量，直到全量上线。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
