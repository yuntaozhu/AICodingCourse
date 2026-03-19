import Slide from "@/components/Slide";

export default function P13() {
  return (
    <Slide notes="全量代码库理解让跨模块重构变得简单。AI 可以理解整个依赖链。">
      <h2 className="text-6xl mb-8">跨模块重构：AI 的全局视野</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Global Vision</h3>
            <p className="text-sm opacity-70">AI 理解整个代码库的依赖关系图。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Deep Refactoring</h3>
            <p className="text-sm opacity-70">自动识别重构对下游模块的影响。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Dependency Graph Understanding</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
