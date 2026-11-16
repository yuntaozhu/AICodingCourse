import Slide from "@/components/Slide";

export default function P78() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="最后，我们要明确一点：拒绝给 AI 当 QA，本质上是拒绝低效的重复劳动。AI Native 架构师应该关注的是‘如何定义规则’，而不是‘如何检查错误’。我们要从‘代码清洁工’进化为‘架构设计师’。">
        {/* Main Slide */}
        <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple italic">拒绝成为“代码清洁工”</h2>
        <div className="flex gap-12 items-center">
          <div className="flex-1">
            <div className="p-8 bg-red-500/10 rounded-3xl border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-red-400">过去：代码清洁工</h3>
              <ul className="space-y-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <li>• 盯着屏幕找 Bug</li>
                <li>• 纠结于缩进和命名</li>
                <li>• 手动写重复的测试用例</li>
                <li>• 疲于奔命的“救火员”</li>
              </ul>
            </div>
          </div>
          <div className="text-3xl opacity-30 font-mono">VS</div>
          <div className="flex-1">
            <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30 hover:bg-gemini-cyan/20 transition-colors cursor-pointer group">
              <h3 className="text-2xl font-bold mb-4 text-gemini-cyan">未来：架构设计师</h3>
              <ul className="space-y-3 group-hover:scale-105 transition-transform origin-left">
                <li>• 定义业务意图与架构约束</li>
                <li>• 构建自动化的评估闭环</li>
                <li>• 关注系统的确定性与演进</li>
                <li>• 运筹帷幄的“总指挥”</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-2xl font-bold text-white">“你的价值不在于你发现了多少 Bug，而在于你构建了多少不产生 Bug 的机制。”</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-2xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: The Architect's Focus */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-gemini-purple">架构师的新战场：确定性工程</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">🎯</div>
            <h4 className="text-xl font-bold mb-4 text-gemini-cyan">意图建模</h4>
            <p className="text-sm opacity-60">将模糊的业务需求转化为 AI 可理解、可验证的结构化意图。</p>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">🛡️</div>
            <h4 className="text-xl font-bold mb-4 text-gemini-purple">边界设计</h4>
            <p className="text-sm opacity-60">设计自愈流水线的触发条件、回滚策略和人工介入点。</p>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">📈</div>
            <h4 className="text-xl font-bold mb-4 text-green-400">质量治理</h4>
            <p className="text-sm opacity-60">定义评估指标，监控模型漂移，确保持续交付的确定性。</p>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Skillset Evolution */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-white">技能树的进化</h3>
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-2 gap-16 relative z-10">
            <div>
              <h4 className="text-2xl font-bold mb-8 text-red-400">正在贬值的技能</h4>
              <ul className="space-y-4 opacity-70">
                <li className="flex items-center gap-3">❌ 熟记所有 API 参数</li>
                <li className="flex items-center gap-3">❌ 编写重复的样板代码</li>
                <li className="flex items-center gap-3">❌ 手动执行回归测试</li>
                <li className="flex items-center gap-3">❌ 解决简单的语法错误</li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-8 text-gemini-purple">正在升值的技能</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white">✅ 提示词工程与上下文管理</li>
                <li className="flex items-center gap-3 text-white">✅ 自动化评估集构建</li>
                <li className="flex items-center gap-3 text-white">✅ 复杂系统架构设计</li>
                <li className="flex items-center gap-3 text-white">✅ 领域知识与业务洞察</li>
              </ul>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gemini-purple/10 blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gemini-cyan/10 blur-3xl -ml-32 -mb-32"></div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
