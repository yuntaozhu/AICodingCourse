import Slide from "@/components/Slide";

export default function P8() {
  return (
    <Slide notes="DoD (Definition of Done) 是 SDD 的延伸。它定义了完成的标准。">
      <h2 className="text-6xl mb-8">DoD: 验证 AI 的输出</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">DoD: Definition of Done</h3>
            <p className="text-sm opacity-70">AI 生成的代码必须符合 DoD 标准。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Verification</h3>
            <p className="text-sm opacity-70">通过测试、Lint、安全扫描自动验证 DoD。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">DoD Verification Loop</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
