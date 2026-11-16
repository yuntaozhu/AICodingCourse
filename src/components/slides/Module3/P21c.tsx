import Slide from "@/components/Slide";

export default function P21c() {
  return (
    <Slide backgroundColor="#020205" notes="在某电商项目中，我们需要快速生成一个复杂的商品详情页。通过上传一张高保真设计稿，AI 在 30 秒内生成了完整的 React 组件，包括响应式布局、Tailwind 样式以及基础的交互逻辑。还原度高达 98%，开发者只需进行少量的业务逻辑绑定。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">案例：高保真原型的一键生成</h2>
        <div className="flex gap-12">
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">项目背景：电商详情页快速原型</h3>
              <ul className="text-sm space-y-3 opacity-70">
                <li>• <strong className="text-white">输入：</strong> 一张 1920x1080 的高保真设计稿截图。</li>
                <li>• <strong className="text-white">输出：</strong> 包含 20+ 组件的 React 代码。</li>
                <li>• <strong className="text-white">技术栈：</strong> Next.js + Tailwind CSS + Lucide Icons。</li>
              </ul>
            </div>
            <div className="p-6 bg-gemini-purple/20 rounded-2xl border border-gemini-purple/40">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">核心价值</h3>
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl mb-1">⚡</div>
                  <div>30s 生成</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl mb-1">🎯</div>
                  <div>98% 还原</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl mb-1">🛠️</div>
                  <div>直接可用</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full h-64 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gemini-cyan/10 to-gemini-purple/10"></div>
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-4">🖼️ → 💻</div>
                <p className="text-sm opacity-60">“从视觉到代码的零损耗转化”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
