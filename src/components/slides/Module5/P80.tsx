import Slide from "@/components/Slide";

export default function P80() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="有了评估闭环，我们就可以放心地让 AI 进入我们的 CI/CD 流水线。下一模块，我们将探讨如何构建一个‘零人工干预’的 Issue-to-PR 流水线。准备好迎接 CI/CD 的革命了吗？">
        {/* Main Slide */}
        <div className="flex flex-col justify-center items-center h-full text-center">
        <div className="text-gemini-purple text-sm font-mono mb-4 tracking-widest uppercase opacity-70">Next Module</div>
        <h2 className="text-6xl mb-8 font-bold">CI/CD 革命：<br /><span className="text-gemini-cyan italic">Issue-to-PR 的零干预流水线</span></h2>
        <div className="h-1 w-32 bg-gemini-purple mb-12"></div>
        <div className="px-10 py-6 bg-white/5 rounded-2xl border border-gemini-cyan/30">
          <p className="text-xl opacity-80">下一站：Module 6 · 异步流水线与自动化评审</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-gemini-cyan text-2xl">↓</div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Module 6 Preview */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-gemini-cyan">模块 6 预告：全自动研发流水线</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">📝</div>
            <h4 className="text-xl font-bold mb-4 text-gemini-purple">Issue 理解</h4>
            <p className="text-sm opacity-60">AI 自动分析 GitHub Issue，提取业务逻辑与技术约束。</p>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">💻</div>
            <h4 className="text-xl font-bold mb-4 text-gemini-cyan">代码生成</h4>
            <p className="text-sm opacity-60">基于现有代码库，AI 自动生成符合规范的补丁或新功能。</p>
          </div>
          <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="text-4xl mb-6">🚀</div>
            <h4 className="text-xl font-bold mb-4 text-green-400">自动 PR</h4>
            <p className="text-sm opacity-60">通过评估闭环验证后，AI 自动提交 PR 并附带详细的变更说明。</p>
          </div>
        </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Preparation for Module 6 */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full">
        <h3 className="text-4xl mb-12 font-bold text-white">为下一阶段做好准备</h3>
        <div className="bg-white/5 p-10 rounded-3xl border border-white/10">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gemini-cyan/20 rounded-full flex items-center justify-center text-gemini-cyan font-bold">1</div>
              <p className="text-lg opacity-80">确保你的 CI 流水线已经具备基础的自动化测试能力。</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-gemini-purple/20 rounded-full flex items-center justify-center text-gemini-purple font-bold">2</div>
              <p className="text-lg opacity-80">思考：如果 AI 给你提了一个 PR，你最担心的三个问题是什么？</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">3</div>
              <p className="text-lg opacity-80">保持好奇心，我们将一起见证研发效率的指数级跃迁。</p>
            </div>
          </div>
        </div>
        </div>
      </Slide>
    </section>
  );
}
