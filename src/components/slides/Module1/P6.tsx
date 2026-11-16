import Slide from "@/components/Slide";

export default function P6() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="跨模态理解是 AI Coding 的杀手锏。它可以直接理解 UI 设计稿。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-black italic tracking-tighter text-gemini-cyan glow-text">
            跨模态理解：从设计稿到代码
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-gemini-cyan/50 transition-all">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gemini-cyan/20 rounded-lg flex items-center justify-center text-xs">1</span>
                  视觉输入 (Visual Input)
                </h3>
                <p className="text-base opacity-70">AI 直接理解 Figma/Sketch 设计稿中的布局、间距、阴影和配色。</p>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-gemini-purple/50 transition-all">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gemini-purple/20 rounded-lg flex items-center justify-center text-xs">2</span>
                  语义映射 (Semantic Mapping)
                </h3>
                <p className="text-base opacity-70">将视觉元素映射为业务组件和状态逻辑，而非简单的 HTML 堆砌。</p>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gemini-cyan/20 blur-3xl rounded-full group-hover:bg-gemini-cyan/40 transition-all"></div>
              <div className="relative aspect-video bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="text-center">
                  <div className="text-5xl mb-3">🖼️ ➔ 💻</div>
                  <div className="text-[10px] font-mono opacity-40">Vision-to-Code Pipeline</div>
                </div>
                <div className="absolute bottom-3 right-3 animate-bounce text-gemini-cyan">
                  <span className="text-[10px] font-mono">SCROLL DOWN FOR DETAIL ↓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Visual Analysis */}
      <Slide backgroundColor="#050505" notes="视觉分析不仅仅是看颜色，而是理解层级。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">深度视觉分析 (Deep Visual Analysis)</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-3 text-sm"># Layout Engine</div>
              <p className="text-xs opacity-70 leading-relaxed">
                识别 Flexbox/Grid 布局模式。自动推断响应式断点（sm, md, lg）。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-3 text-sm"># Design Tokens</div>
              <p className="text-xs opacity-70 leading-relaxed">
                自动提取颜色、字体、圆角、阴影。生成符合企业规范的 Tailwind 配置。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-gemini-cyan mb-3 text-sm"># Component Extraction</div>
              <p className="text-xs opacity-70 leading-relaxed">
                识别重复模式。自动将设计稿拆解为 Button, Card, Input 等原子组件。
              </p>
            </div>
          </div>
          <div className="mt-8 p-6 bg-gemini-cyan/5 rounded-xl border border-gemini-cyan/20 font-mono text-[10px] text-gemini-cyan/80">
            {`// AI Vision Output Example
{
  "layout": "flex-row",
  "spacing": "gap-8",
  "components": ["HeroSection", "FeatureGrid", "CTA"],
  "tokens": { "primary": "#4cddec", "radius": "2xl" }
}`}
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Logic Synthesis */}
      <Slide backgroundColor="#050505" notes="从静态到动态，是跨模态理解的最高境界。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-purple">逻辑合成 (Logic Synthesis)</h3>
          <div className="flex gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-sm">⚡</div>
                <div>
                  <h4 className="font-bold text-sm">交互推断</h4>
                  <p className="text-xs opacity-60">基于设计稿中的原型连线，自动生成 React 状态管理逻辑。</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-sm">🛡️</div>
                <div>
                  <h4 className="font-bold text-sm">无障碍增强</h4>
                  <p className="text-xs opacity-60">自动补全 ARIA 标签、Tab 顺序和语义化 HTML 标签。</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gemini-purple/20 flex items-center justify-center text-gemini-purple text-sm">📦</div>
                <div>
                  <h4 className="font-bold text-sm">数据绑定</h4>
                  <p className="text-xs opacity-60">识别表单字段，自动生成 Zod 校验 Schema 和 API 提交逻辑。</p>
                </div>
              </div>
            </div>
            <div className="flex-1 p-5 bg-black/60 rounded-xl border border-white/10 font-mono text-[9px] leading-tight text-white/40">
              <div className="text-gemini-purple mb-1">// Generated React Component</div>
              <div className="text-white/80">const CheckoutForm = () =&gt; {'{'}</div>
              <div className="pl-4">const {'{'} register, handleSubmit {'}'} = useForm();</div>
              <div className="pl-4">return (</div>
              <div className="pl-8 text-gemini-cyan">{` <form className="grid grid-cols-2 gap-6" ...>`}</div>
              <div className="pl-12 text-gemini-cyan">{`   <Input {...register("email")} label="Email" />`}</div>
              <div className="pl-12 text-gemini-cyan">{`   <Button type="submit">Complete Order</Button>`}</div>
              <div className="pl-8 text-gemini-cyan">{` </form>`}</div>
              <div className="pl-4">);</div>
              <div className="text-white/80">{'}'};</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Case Study - From Figma to Dashboard */}
      <Slide backgroundColor="#050505" notes="一个真实的案例：如何通过一张截图生成复杂的 Dashboard。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-cyan mb-2">CASE STUDY</div>
          <h3 className="text-3xl mb-8 font-bold text-white">案例：从 Figma 截图到响应式 Dashboard</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-2">📸</div>
              <h4 className="font-bold text-xs mb-1">1. 截图上传</h4>
              <p className="text-[10px] opacity-50">上传 Figma 导出的高保真截图，包含复杂的图表和侧边栏。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-2">🔍</div>
              <h4 className="font-bold text-xs mb-1">2. 组件识别</h4>
              <p className="text-[10px] opacity-50">AI 识别出 Recharts 图表、Lucide 图标和 Tailwind 布局。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-2">⚙️</div>
              <h4 className="font-bold text-xs mb-1">3. 代码生成</h4>
              <p className="text-[10px] opacity-50">生成干净的 React 代码，自动处理 Dark Mode 和响应式适配。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xl mb-2">🚀</div>
              <h4 className="font-bold text-xs mb-1">4. 交互注入</h4>
              <p className="text-[10px] opacity-50">AI 自动添加筛选过滤、分页加载和 Mock 数据。直接运行。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: Visual Consistency Check */}
      <Slide backgroundColor="#050505" notes="视觉还原度是前端开发的灵魂。AI 可以自动进行像素级对比。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[10px] font-mono text-gemini-purple mb-2">THE LAST MILE</div>
          <h3 className="text-3xl mb-8 font-bold text-white">视觉还原度校验 (Visual Consistency)</h3>
          <div className="flex gap-8 items-center bg-white/5 p-8 rounded-3xl border border-white/10">
            <div className="flex-1 text-center">
              <div className="aspect-video bg-black/40 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-[10px] opacity-40">ORIGINAL DESIGN</div>
            </div>
            <div className="text-2xl text-gemini-cyan animate-pulse">VS</div>
            <div className="flex-1 text-center">
              <div className="aspect-video bg-black/40 rounded-lg border border-gemini-cyan/40 flex items-center justify-center text-[10px] text-gemini-cyan">GENERATED CODE SCREENSHOT</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/20">
            <p className="text-xs text-center opacity-80">
              <span className="font-bold text-gemini-cyan">AI 自我修正：</span> "检测到侧边栏宽度偏差 4px，正在更新 Tailwind Class: <code className="bg-black/40 px-1 rounded text-pink-400">w-64</code> ➔ <code className="bg-black/40 px-1 rounded text-green-400">w-60</code>"
            </p>
          </div>
        </div>
      </Slide>
    </section>
  );
}
