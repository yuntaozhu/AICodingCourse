import Slide from "@/components/Slide";

export default function P25() {
  return (
    <Slide notes="跨模态 UI 是未来的趋势。AI 可以生成跨模态 UI。">
      <h2 className="text-6xl mb-8">跨模态 UI：AI 的设计</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Multi-modal UI Design</h3>
            <p className="text-sm opacity-70">AI 设计支持语音、手势、视觉的 UI。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Adaptive UI Generation</h3>
            <p className="text-sm opacity-70">AI 根据用户行为自动调整 UI 布局。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-cyan/10 border border-gemini-cyan/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-cyan">Multi-modal UI Assistant</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
