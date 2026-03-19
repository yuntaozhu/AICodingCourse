import Slide from "@/components/Slide";

export default function P6() {
  return (
    <Slide notes="跨模态理解是 Gemini 3.1 的杀手锏。它可以直接理解 UI 设计稿。">
      <h2 className="text-6xl mb-8">跨模态理解：从设计稿到代码</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col justify-center gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Input: UI Design (Figma/Sketch)</h3>
            <p className="text-sm opacity-70">Gemini 3.1 直接解析视觉元素、间距、配色。</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl mb-2">Output: Production-Ready Code</h3>
            <p className="text-sm opacity-70">生成符合 Tailwind CSS 规范的 React 组件。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full h-64 bg-gemini-purple/10 border border-gemini-purple/30 rounded-lg flex items-center justify-center">
             <span className="text-2xl font-mono text-gemini-purple">Visual Understanding</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
