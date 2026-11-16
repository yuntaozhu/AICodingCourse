import Slide from "@/components/Slide";

export default function P76() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="评估不应该只在 PR 提交时发生，而应该贯穿整个研发生命周期。持续评估（CE）是 AI Native 研发的新标准。无论是需求变更、代码更新，还是环境变化，系统都应该实时进行评估，确保业务意图的持续对齐。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan italic">持续评估 (Continuous Evaluation)</h2>
        <div className="relative h-40 w-full flex items-center justify-between px-8">
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-gemini-cyan/20 transition-colors text-sm">需求</div>
            <div className="h-1 w-8 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-gemini-cyan/20 transition-colors text-sm">生成</div>
            <div className="h-1 w-8 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gemini-purple flex items-center justify-center border border-gemini-purple/40 group-hover:scale-125 transition-transform text-sm">评估</div>
            <div className="h-1 w-8 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-gemini-cyan/20 transition-colors text-sm">部署</div>
            <div className="h-1 w-8 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-gemini-purple flex items-center justify-center border border-gemini-purple/40 group-hover:scale-125 transition-transform text-sm">监控</div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gemini-cyan font-mono text-xs animate-pulse">
            ↑ 持续反馈环 ↑
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-base font-bold mb-1 text-gemini-cyan">实时性</h3>
            <p className="text-[10px] opacity-50">秒级反馈，在错误发生的第一时间拦截。</p>
          </div>
          <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-base font-bold mb-1 text-gemini-cyan">全覆盖</h3>
            <p className="text-[10px] opacity-50">从代码到配置，从逻辑到安全，全方位监控。</p>
          </div>
          <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <h3 className="text-base font-bold mb-1 text-gemini-cyan">自适应</h3>
            <p className="text-[10px] opacity-50">根据业务变更自动调整评估策略。</p>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: The CE Pipeline Triggers */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-purple">持续评估触发器：何时评估？</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl">🚀</div>
            <div>
              <div className="text-lg font-bold mb-0.5">代码变更 (Code Push)</div>
              <p className="text-xs opacity-60">最基础的触发。每次 PR 或 Commit 都会触发全量或增量的语义评估。</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl">📦</div>
            <div>
              <div className="text-lg font-bold mb-0.5">依赖升级 (Dependency Update)</div>
              <p className="text-xs opacity-60">当底层库或框架升级时，自动评估现有 AI 生成代码的兼容性与安全性。</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/50 transition-colors">
            <div className="text-2xl">🤖</div>
            <div>
              <div className="text-lg font-bold mb-0.5">模型迭代 (Model Update)</div>
              <p className="text-xs opacity-60">当底层 LLM 版本更新时，重新运行所有 Benchmark，确保生成质量没有倒退。</p>
            </div>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Drift Detection & Performance Monitoring */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">漂移检测：监控 AI 的“状态”</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="text-lg font-bold mb-4 text-gemini-purple">什么是“评估漂移”？</h4>
            <p className="text-xs opacity-70 leading-relaxed">
              随着代码库的演进，原本通过评估的代码可能因为架构变更而变得不再合规。持续评估需要能够检测到这种“意图漂移”。
            </p>
            <div className="mt-6 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-[10px] text-red-400">
              Warning: Component 'UserCard' intent alignment dropped below 80% due to recent API changes.
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center font-bold text-sm">A</div>
              <div>
                <div className="font-bold text-sm">基准对比</div>
                <p className="text-[10px] opacity-50">定期将生产环境代码与黄金样本集进行对比。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center font-bold text-sm">B</div>
              <div>
                <div className="font-bold text-sm">异常预警</div>
                <p className="text-[10px] opacity-50">当评估分数出现显著波动时，自动触发人工审计。</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gemini-cyan/20 flex items-center justify-center font-bold text-sm">C</div>
              <div>
                <div className="font-bold text-sm">闭环优化</div>
                <p className="text-[10px] opacity-50">将漂移数据反馈给模型微调或 Prompt 优化环节。</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
