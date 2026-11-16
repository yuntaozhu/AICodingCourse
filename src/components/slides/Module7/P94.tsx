import Slide from "@/components/Slide";

export default function P94() {
  return (
    <Slide backgroundColor="#020205" notes="AI 架构大脑（AI Architecture Brain）是企业的‘数字中枢’。它存储了企业所有的架构意图、业务逻辑和安全规范。通过 AI Coding 的长上下文能力，它能够实时指导 AI 代理的开发工作，确保所有产出都符合企业的‘意志’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan">AI 架构大脑：<span className="text-white italic">数字中枢</span></h2>
        <div className="relative p-12 bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gemini-purple/20 blur-3xl rounded-full"></div>
          <div className="grid grid-cols-2 gap-12 relative z-10">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gemini-purple">核心功能</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">意图存储：</strong> 集中管理业务需求与架构设计。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">实时对齐：</strong> 在开发过程中实时纠偏，确保意图一致。</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gemini-cyan">●</span>
                  <span><strong className="text-white">知识演进：</strong> 自动从历史数据中学习并优化架构。</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center text-center">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-sm opacity-60 italic">“架构大脑不只是知识库，它是具备‘意志’的执行引擎。”</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
