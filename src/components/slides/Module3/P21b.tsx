import Slide from "@/components/Slide";

export default function P21b() {
  return (
    <Slide backgroundColor="#020205" notes="跨模态理解是 AI Native 研发的杀手锏。AI 不再只是读代码，它能‘看’懂 UI 设计。通过视觉模型，AI 能够识别设计稿中的组件、布局、间距和交互逻辑，并直接生成高质量的前端代码。这彻底消除了 UI 还原度的痛点。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">跨模态理解：从设计稿到代码</h2>
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-purple">视觉到代码的飞跃</h3>
              <ul className="text-sm space-y-4 opacity-70">
                <li>• <strong className="text-white">组件识别：</strong> 自动识别按钮、输入框、卡片等 UI 元素。</li>
                <li>• <strong className="text-white">布局推断：</strong> 理解 Flexbox/Grid 布局，而非绝对定位。</li>
                <li>• <strong className="text-white">样式提取：</strong> 精准提取颜色、阴影、圆角和字体规范。</li>
                <li>• <strong className="text-white">交互生成：</strong> 根据视觉暗示生成 Hover、Active 等状态。</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="p-6 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30 text-center">
              <div className="text-4xl mb-2">🎨</div>
              <div className="text-sm font-bold">Figma / Image</div>
            </div>
            <div className="flex justify-center text-gemini-cyan animate-bounce">↓</div>
            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30 text-center">
              <div className="text-4xl mb-2">💻</div>
              <div className="text-sm font-bold">React + Tailwind</div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
