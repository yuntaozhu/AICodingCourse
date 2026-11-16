import Slide from "@/components/Slide";

export default function Module5() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#051005" notes="跨模态理解：从设计稿到代码。探讨 AI 如何理解视觉设计并将其转化为高质量代码。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-cyan text-xs uppercase tracking-widest mb-3">Module 5</h2>
          <h1 className="text-7xl mb-4 leading-none text-white font-bold">跨模态理解：<br /><span className="text-gemini-purple">从设计稿到代码</span></h1>
          <p className="text-2xl font-mono text-gemini-purple opacity-80 mb-6">视觉意图的直接翻译：前端开发的终极形态</p>
          <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
          <p className="text-sm text-white/50 italic animate-bounce">↓ 点击向下按钮探索更多</p>
        </div>
      </Slide>

      {/* Sub Slide 1: Traditional vs AI */}
      <Slide backgroundColor="#101510" notes="传统流程与 AI 驱动流程的对比。AI 大幅缩短了从设计到交付的链路。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">Process Evolution</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">传统流程 vs AI 驱动流程</h3>
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-red-400 font-bold text-xl mb-4">传统：低效的手工劳动</h4>
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 opacity-60">1. 设计师标注 (Blueprints)</div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 opacity-60">2. 开发者手动切图 (Assets)</div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 opacity-60">3. 手写 HTML/CSS 布局</div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 opacity-60">4. 反复调整还原度</div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-emerald-400 font-bold text-xl mb-4">AI：端到端的自动化</h4>
              <div className="space-y-3">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">1. 截图/设计稿输入 (Vision)</div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">2. AI 视觉理解 (Semantic Analysis)</div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">3. 自动生成 Tailwind/React 代码</div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">4. 像素级还原 + 响应式适配</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Case Study */}
      <Slide backgroundColor="#051005" notes="案例：从 Figma 截图到响应式 Landing Page。展示 AI 在视觉还原上的惊人表现。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-gemini-purple text-sm font-bold mb-4 uppercase tracking-widest">Case Study</h2>
          <h3 className="text-4xl mb-8 font-bold text-white">案例：从 Figma 截图到响应式 Landing Page</h3>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 border border-zinc-700 mb-4">
                [ Figma Design Screenshot ]
              </div>
              <p className="text-sm text-white/60 italic text-center">输入：一张复杂的电商首页设计稿</p>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-gemini-purple/10 rounded-xl border border-gemini-purple/30">
                <h4 className="font-bold text-white mb-2">AI 视觉识别</h4>
                <p className="text-sm text-white/70">精准识别布局、配色、字体、间距以及复杂的交互组件（如轮播图、下拉菜单）。</p>
              </div>
              <div className="p-6 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/30">
                <h4 className="font-bold text-white mb-2">代码生成</h4>
                <p className="text-sm text-white/70">生成符合最佳实践的 React + Tailwind CSS 代码，包含响应式断点和无障碍支持。</p>
              </div>
              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-bold text-white mb-2">结果</h4>
                <p className="text-sm text-white/70">从截图到上线仅需 5 分钟，还原度高达 99% 以上。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
