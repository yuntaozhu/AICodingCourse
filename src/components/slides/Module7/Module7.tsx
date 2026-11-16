import Slide from "@/components/Slide";

export default function Module7() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#051005" notes="DoD: 验证 AI 的输出。探讨如何定义“完成”的标准，确保 AI 交付物的质量。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-cyan text-xs uppercase tracking-widest mb-3">Module 7</h2>
          <h1 className="text-7xl mb-4 leading-none text-white font-bold">DoD：<br /><span className="text-gemini-purple">验证 AI 的输出</span></h1>
          <p className="text-2xl font-mono text-gemini-purple opacity-80 mb-6">Definition of Done：让 AI 的交付物不再是“开盲盒”</p>
          <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
          <p className="text-sm text-white/50 italic animate-bounce">↓ 点击向下按钮探索更多</p>
        </div>
      </Slide>

      {/* Sub Slide 1: Why DoD */}
      <Slide backgroundColor="#100505" notes="为什么需要 DoD？AI 可能会产生幻觉或遗漏边缘情况，DoD 是质量的最后一道防线。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">Why Need DoD?</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">为什么 AI Coding 需要 DoD?</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">🚫</div>
              <h4 className="text-xl font-bold mb-3 text-red-400">对抗幻觉</h4>
              <p className="text-sm text-white/60 leading-relaxed">AI 可能会一本正经地胡说八道，DoD 强制要求验证逻辑的正确性。</p>
            </div>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">🧩</div>
              <h4 className="text-xl font-bold mb-3 text-gemini-cyan">补全边缘情况</h4>
              <p className="text-sm text-white/60 leading-relaxed">AI 往往只关注 Happy Path，DoD 强制要求覆盖异常处理和边界条件。</p>
            </div>
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold mb-3 text-gemini-purple">确保标准一致</h4>
              <p className="text-sm text-white/60 leading-relaxed">DoD 规定了代码风格、性能指标和安全要求，确保 AI 输出符合团队规范。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: DoD Prompts & Usage */}
      <Slide backgroundColor="#051005" notes="DoD 开发提示词与使用。如何通过 Prompt 让 AI 自我验证。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">DoD Prompts & Usage</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">DoD 开发提示词与实战</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-gemini-cyan font-bold">DoD 验证提示词 (示例)</h4>
              <div className="bg-zinc-900 p-6 rounded-xl border border-white/10 font-mono text-xs text-emerald-400 leading-relaxed">
                {`"在提交代码前，请确保满足以下 DoD：
1. 所有核心功能必须有对应的单元测试。
2. 代码必须通过 ESLint 检查，无警告。
3. 必须处理网络超时和 API 报错的异常情况。
4. 首页加载时间在 3G 网络下不得超过 2s。
请逐项检查并报告结果。"`}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-gemini-purple font-bold">AI Coding 如何使用 DoD</h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">1</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">作为验收标准：</span>在 Prompt 的结尾明确列出 DoD，作为 AI 停止工作的条件。</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">2</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">自动化测试驱动：</span>AI 根据 DoD 生成测试脚本，运行通过才算“完成”。</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gemini-cyan flex items-center justify-center font-bold text-black shrink-0">3</div>
                  <p className="text-sm text-white/70"><span className="text-white font-bold">自我纠错循环：</span>如果未满足 DoD，AI 必须根据反馈自动重写代码，直到达标。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
