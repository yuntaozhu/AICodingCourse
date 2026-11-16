import Slide from "@/components/Slide";

export default function P74b() {
  return (
    <Slide backgroundColor="#020205" notes="DoD 是 AI Native 研发的‘质量红线’。在传统开发中，DoD 往往是口头约定或简单的 Checklist。但在 AI Native 时代，DoD 是 AI 代理必须满足的硬性约束。它定义了什么是‘完成’，包括代码质量、测试覆盖、安全扫描和性能达标。没有通过 DoD 的代码，AI 代理不允许提交 PR。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">DoD：AI 输出的质量红线</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">什么是 DoD (Definition of Done)?</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                DoD 是对“完成”的标准化定义。它是 AI 代理在交付任务前必须通过的<strong className="text-white">最后一道关卡</strong>。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-xs font-bold">单元测试 100%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs font-bold">安全扫描零漏洞</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">📏</div>
                <div className="text-xs font-bold">代码规范对齐</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs font-bold">性能基准达标</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30">
              <h3 className="text-2xl font-bold mb-6 text-gemini-cyan">DoD 的核心价值</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">质量确定性：</strong> 确保 AI 产出的每一行代码都符合企业标准。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">自动化拦截：</strong> 自动拒绝不达标的产出，减少人工 Review 压力。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">持续进化：</strong> DoD 规范随架构大脑自动演进。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
