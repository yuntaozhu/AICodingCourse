import Slide from "@/components/Slide";

export default function P29() {
  return (
    <Slide notes="实战练习：构建一个 AI 驱动的文档生成工具。">
      <h2 className="text-6xl mb-8">实战：AI 驱动的文档生成工具</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Automated Documentation</h3>
            <p className="text-sm opacity-70">AI 自动生成高质量文档。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Multi-modal Documentation</h3>
            <p className="text-sm opacity-70">AI 生成包含图表、视频的文档。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">AI Documentation Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
