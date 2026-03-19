import Slide from "@/components/Slide";

export default function P23() {
  return (
    <Slide notes="性能手术是优化系统的关键。AI 可以辅助性能手术。">
      <h2 className="text-6xl mb-8">性能手术：AI 的精准优化</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Precision Optimization</h3>
            <p className="text-sm opacity-70">AI 精准定位性能瓶颈并提供优化代码。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Algorithm Replacement</h3>
            <p className="text-sm opacity-70">AI 建议并实现更高效的算法。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Performance Surgery Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
