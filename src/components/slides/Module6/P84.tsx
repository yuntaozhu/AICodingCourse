import Slide from "@/components/Slide";

export default function P84() {
  return (
    <Slide backgroundColor="#020205" notes="在这个流水线中，自主代理（Autonomous Agents）扮演了核心角色。它们不再是简单的脚本，而是具备推理、规划和执行能力的‘数字员工’。它们可以处理复杂的依赖关系，解决代码冲突，甚至在发现架构不合理时提出重构建议。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">流水线上的“数字员工”</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gemini-purple">自主代理的能力</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <span className="text-gemini-cyan">●</span>
                <span><strong className="text-white">需求理解：</strong> 深度解析 Issue 描述，提取核心意图。</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gemini-cyan">●</span>
                <span><strong className="text-white">任务规划：</strong> 将复杂需求拆解为可执行的代码修改步骤。</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gemini-cyan">●</span>
                <span><strong className="text-white">冲突解决：</strong> 自动处理 Git 冲突，确保代码可合并。</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-gemini-cyan">●</span>
                <span><strong className="text-white">重构建议：</strong> 发现坏味道时，主动发起重构任务。</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gemini-purple/20 blur-3xl rounded-full"></div>
            <div className="relative bg-black/40 p-8 rounded-2xl border border-white/10 h-full flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🧠</div>
                <div className="text-2xl font-bold text-gemini-cyan">Gemini 3.1 Reasoning</div>
                <p className="text-sm opacity-60">基于超长上下文的全局代码理解与逻辑推理。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
