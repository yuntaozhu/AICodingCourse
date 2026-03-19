import Slide from "@/components/Slide";

export default function P17() {
  return (
    <Slide notes="全量代码库理解让性能分析变得自动化。AI 可以识别瓶颈。">
      <h2 className="text-6xl mb-8">性能分析：AI 的诊断</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Performance Bottleneck</h3>
            <p className="text-sm opacity-70">AI 识别代码中的性能瓶颈。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Optimization Suggestion</h3>
            <p className="text-sm opacity-70">AI 提供性能优化建议。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Performance Optimization Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
