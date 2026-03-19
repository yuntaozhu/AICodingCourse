import Slide from "@/components/Slide";

export default function P87() {
  return (
    <Slide backgroundColor="#020205" notes="零人工干预（Zero Human Intervention）是我们的终极目标。在 2026 年，这已经不再是科幻。通过意图架构、评估闭环和自愈流水线的结合，我们可以实现从业务想法到线上价值交付的‘全自动驾驶’。">
      <div className="flex flex-col justify-center h-full items-center text-center">
        <h2 className="text-6xl mb-12 font-bold text-gemini-cyan italic">零人工干预：终极目标</h2>
        <div className="relative w-full max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gemini-purple/20 to-gemini-cyan/20 blur-3xl rounded-full"></div>
          <div className="relative grid grid-cols-4 gap-4">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl mb-2">💡</div>
              <div className="text-sm font-bold">Idea</div>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="text-sm font-bold">Auto-Dev</div>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="text-sm font-bold">Auto-Eval</div>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm font-bold">Value</div>
            </div>
          </div>
          <div className="mt-12 p-8 bg-gemini-purple/20 rounded-3xl border border-gemini-purple/40">
            <p className="text-2xl font-bold">“人类定义‘为什么’，AI 完成‘怎么做’。”</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
