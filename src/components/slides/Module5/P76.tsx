import Slide from "@/components/Slide";

export default function P76() {
  return (
    <Slide backgroundColor="#020205" notes="评估不应该只在 PR 提交时发生，而应该贯穿整个研发生命周期。持续评估（CE）是 AI Native 研发的新标准。无论是需求变更、代码更新，还是环境变化，系统都应该实时进行评估，确保业务意图的持续对齐。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">持续评估 (Continuous Evaluation)</h2>
        <div className="relative h-48 w-full flex items-center justify-between px-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">需求</div>
            <div className="h-1 w-12 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">生成</div>
            <div className="h-1 w-12 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gemini-purple flex items-center justify-center border border-gemini-purple/40">评估</div>
            <div className="h-1 w-12 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">部署</div>
            <div className="h-1 w-12 bg-gemini-purple"></div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gemini-purple flex items-center justify-center border border-gemini-purple/40">监控</div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gemini-cyan font-mono text-sm">
            ↑ 持续反馈环 ↑
          </div>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-2">实时性</h3>
            <p className="text-xs opacity-50">秒级反馈，在错误发生的第一时间拦截。</p>
          </div>
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-2">全覆盖</h3>
            <p className="text-xs opacity-50">从代码到配置，从逻辑到安全，全方位监控。</p>
          </div>
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold mb-2">自适应</h3>
            <p className="text-xs opacity-50">根据业务变更自动调整评估策略。</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
