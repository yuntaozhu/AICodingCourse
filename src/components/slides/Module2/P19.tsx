import Slide from "@/components/Slide";

export default function P19() {
  return (
    <Slide notes="全量代码库理解让测试生成变得自动化。AI 可以生成高质量测试。">
      <h2 className="text-6xl mb-8">测试生成：AI 的验证</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Unit Test Generation</h3>
            <p className="text-sm opacity-70">AI 生成单元测试用例。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Integration Test Generation</h3>
            <p className="text-sm opacity-70">AI 生成集成测试用例。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Test Generation Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
