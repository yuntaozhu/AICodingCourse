import Slide from "@/components/Slide";

export default function P97() {
  return (
    <Slide backgroundColor="#020205" notes="总结全篇。AI Coding 研发范式革命的核心是：意图架构、评估闭环、零干预流水线。这不仅是技术的升级，更是思维方式的彻底革命。我们要拥抱变化，定义未来。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">全篇核心回顾</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-8 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-cyan">意图架构</h3>
            <p className="text-xs opacity-50 text-left">将业务需求转化为确定性的架构约束，实现“意图即代码”。</p>
          </div>
          <div className="p-8 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-cyan">评估闭环</h3>
            <p className="text-xs opacity-50 text-left">拒绝“人肉 QA”，构建自动化的语义验证与确定性引擎。</p>
          </div>
          <div className="p-8 bg-gemini-purple/10 rounded-3xl border border-gemini-purple/30 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-cyan">零干预流水线</h3>
            <p className="text-xs opacity-50 text-left">实现 Issue-to-PR 的全自动闭环，让研发进入自动驾驶时代。</p>
          </div>
        </div>
        <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10 text-center">
          <p className="text-2xl font-bold italic text-gemini-purple">“AI Native 不是终点，而是新纪元的起点。”</p>
        </div>
      </div>
    </Slide>
  );
}
