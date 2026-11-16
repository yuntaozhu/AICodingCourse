import Slide from "@/components/Slide";

export default function P31b() {
  return (
    <Slide backgroundColor="#020205" notes="SDD 是 AI Native 研发的‘灵魂’。在传统开发中，设计文档往往是过时的。但在 AI Native 时代，SDD 是 AI 的执行蓝图。它定义了系统的边界、数据流、接口契约和核心算法。没有 SDD，AI 研发就是‘盲目试错’；有了 SDD，AI 研发就是‘按图索骥’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">SDD：确定性研发的蓝图</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">什么是 SDD (Software Design Document)?</h3>
              <p className="text-sm opacity-70 leading-relaxed">
                SDD 是对业务需求的结构化翻译。它不包含具体的代码实现，但包含实现代码所需的所有<strong className="text-white">决策信息</strong>。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">🏗️</div>
                <div className="text-xs font-bold">架构模式</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-xs font-bold">数据模型</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">🔌</div>
                <div className="text-xs font-bold">接口契约</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs font-bold">安全规范</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="p-8 bg-gemini-cyan/10 rounded-3xl border border-gemini-cyan/30">
              <h3 className="text-2xl font-bold mb-6 text-gemini-cyan">SDD 的核心价值</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">消除歧义：</strong> 为 AI 提供唯一的“真理来源”。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">确定性输出：</strong> 显著降低 AI 生成代码的随机性。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">可维护性：</strong> 架构大脑的核心组成部分。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
