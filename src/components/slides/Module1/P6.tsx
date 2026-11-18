import Slide from "@/components/Slide";

export default function P6() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="产品经理与独立开发者最常卡在“前端还原”。在 Cursor 中，通过拖入高保真截图 + Figma MCP + 10-ui-tailwind.mdc，可直接生成响应式组件并用 Browser MCP 自检。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            跨模态理解：Cursor 中的 Figma ➔ 代码闭环
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gemini-cyan mb-1">INPUT · 截图 + FIGMA MCP</div>
                <h3 className="text-lg font-bold mb-1.5 text-white">视觉结构与 Design Token 直读</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  把截图直接拖进 Cursor <code className="text-gemini-cyan">Cmd+I</code>，或通过 <code className="text-gemini-cyan">Figma MCP</code> 读取精确圆角、字体字阶、色值与 AutoLayout 层级。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gemini-purple mb-1">OUTPUT · 组件化 + 规则对齐</div>
                <h3 className="text-lg font-bold mb-1.5 text-white">自动对齐 .cursor/rules 前端规范</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  挂载 <code className="text-gemini-purple">10-ui-tailwind.mdc</code> 后，Agent 不会输出乱糟糟的绝对定位，而是生成可复用的 React + Tailwind 响应式组件。
                </p>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
              <div className="text-[11px] font-mono text-slate-400">CURSOR MULTIMODAL WORKFLOW</div>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 rounded-lg bg-black/50 border border-white/10 text-slate-200">
                  1. 拖入 Figma 截图 / 粘贴节点链接
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-gemini-cyan/30 text-gemini-cyan">
                  2. Plan 模式拆解组件树 &amp; 断点状态
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-gemini-purple/30 text-gemini-purple">
                  3. Agent 生成 TSX + Empty/Loading 交互
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-emerald-400/30 text-emerald-300">
                  4. Playwright MCP 截图自检桌面与手机端
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-gemini-cyan">
                ↓ 向下查看前端落地步骤与视觉自检实战
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Visual Analysis & Rules */}
      <Slide backgroundColor="#050505" notes="如何避免 AI 生成一堆无法维护的硬编码 DIV？核心在于用 Rules 约束组件拆分与主题 Token。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">FRONTEND PIPELINE</div>
          <h3 className="text-3xl mb-6 font-bold text-white">告别切图：Cursor 视觉工程三步法</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · LAYOUT &amp; TOKENS</div>
              <h4 className="font-bold text-base mb-2 text-white">提取栅格与主题色</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                先让 Cursor 把设计稿的间距、主色与圆角沉淀到 <code className="text-white">@theme</code>，确保全站组件风格统一。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · STATE COVERAGE</div>
              <h4 className="font-bold text-base mb-2 text-white">补齐设计稿没画的状态</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Figma 通常只有理想态。提示词里要求同时补齐 <strong className="text-white">Loading 骨架屏、空数据引导与表单报错态</strong>。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · COMPONENTIZATION</div>
              <h4 className="font-bold text-base mb-2 text-white">Props 接口与可访问性</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                拆分为独立的 <code className="text-white">PricingCard</code>、<code className="text-white">FeatureGrid</code>，自动补全键盘可达性与对比度。
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-[#0b0f19] rounded-xl border border-gemini-cyan/20 font-mono text-xs text-slate-200">
            <span className="text-gemini-cyan"># 实用提示词：</span>
            {"基于附带 Figma 节点，使用 @src/styles/tokens.css 还原组件，严禁硬编码像素宽度；需同时适配 1280px 桌面与 375px 移动端。"}
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Case Study - Indie Product Pricing & Dashboard */}
      <Slide backgroundColor="#050505" notes="真实场景：产品经理 15 分钟在 Cursor 中从 Figma 完成可用前端页并自检修复。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">CASE STUDY · INDIE BUILDER</div>
          <h3 className="text-3xl mb-6 font-bold text-white">案例：15 分钟从 Figma 交付响应式 SaaS 定价与看板页</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">Step 01</div>
              <h4 className="font-bold text-sm mb-1.5 text-white">Figma MCP 拉取节点</h4>
              <p className="text-xs text-slate-300 leading-relaxed">在 Cursor Agent 直接粘贴 Figma 链接，自动获取三档定价卡片与对比表格结构。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">Step 02</div>
              <h4 className="font-bold text-sm mb-1.5 text-white">注入 UI .mdc 规则</h4>
              <p className="text-xs text-slate-300 leading-relaxed">编辑 <code className="text-white">.tsx</code> 自动激活 <code className="text-white">10-ui-tailwind.mdc</code>，强制使用 <code className="text-white">tabular-nums</code> 对齐金额数字。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">Step 03</div>
              <h4 className="font-bold text-sm mb-1.5 text-white">接入真实年/月付切换</h4>
              <p className="text-xs text-slate-300 leading-relaxed">用 <code className="text-white">Cmd+K</code> 选中价格区域，补充月付/年付折扣状态与 Stripe Checkout 跳转回调。</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">Step 04</div>
              <h4 className="font-bold text-sm mb-1.5 text-white">Browser MCP 自检</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Agent 打开无头浏览器截屏 375px 手机视图，发现按钮折行后自动改写布局并复测。</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>过去需要设计师标注 + 前端联调 2 天；现在产品经理在 Cursor 内一气呵成。</span>
            <span className="font-mono text-gemini-cyan font-bold">视觉走查自修复闭环</span>
          </div>
        </div>
      </Slide>
    </section>
  );
}
