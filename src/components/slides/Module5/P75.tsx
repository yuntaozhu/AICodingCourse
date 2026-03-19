import Slide from "@/components/Slide";

export default function P75() {
  return (
    <Slide backgroundColor="#020205" notes="不要盲目相信通用的 Benchmark。在 2026 年，每个团队都应该有自己的‘领域 Benchmark’。通过构建针对自己业务场景的评估集，我们可以持续监控 AI 在特定领域（如支付、推荐、搜索）的表现，从而进行针对性的优化。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">构建你的领域 Benchmark</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gemini-cyan">为什么需要？</h3>
            <p className="opacity-70">通用模型在特定业务场景（如私有协议、特定框架）下可能表现不佳。你需要一把尺子来衡量它在“你的战场”上的表现。</p>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="font-bold text-gemini-purple mb-2">数据来源</h4>
              <ul className="text-sm opacity-60 space-y-2">
                <li>• 历史高质量 PR 数据</li>
                <li>• 业务文档与 Spec</li>
                <li>• 线上故障复盘数据</li>
              </ul>
            </div>
          </div>
          <div className="bg-black/40 p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-center">评估指标 (Metrics)</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>代码生成准确率</span>
                <span className="text-gemini-cyan">94.2%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gemini-cyan h-full w-[94.2%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span>安全规范合规率</span>
                <span className="text-gemini-purple">99.8%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gemini-purple h-full w-[99.8%]"></div>
              </div>
              <div className="flex justify-between items-center">
                <span>业务逻辑对齐度</span>
                <span className="text-white">88.5%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[88.5%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
