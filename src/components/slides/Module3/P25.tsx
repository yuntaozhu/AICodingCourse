import Slide from "@/components/Slide";

export default function P25() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="借鉴 easy-vibe 第二阶段前端路径：现代独立开发者有三条成熟的设计转代码路径，结合 Cursor 多模态输入与 Figma MCP 快速落地高保真 UI。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            UI ENGINEERING · DESIGN TO CODE IN CURSOR
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：设计稿转前端代码的<span className="text-gemini-cyan">三条成熟路径</span>
          </h2>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-2">路径 01 · 截图直出</div>
                <h3 className="text-lg font-bold text-white mb-2">多模态视觉直接还原</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  把竞品截图、手绘草图或 AI 生成的界面图直接拖入 Cursor Cmd+I，指定 Tailwind CSS v4 与现代组件库（如 shadcn/ui），1 分钟产出响应式骨架。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
                适合：早期 MVP、AI Studio 快速验证
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-purple mb-2">路径 02 · 插件/AI 生图</div>
                <h3 className="text-lg font-bold text-white mb-2">AI 素材 Agent + 平台导出</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  先用文生图 / 设计助手批量产出统一风格的图标、Hero 海报与 MasterGo/Figma 页面，再导出基础 HTML/React 结构交由 Cursor 拆分为可复用组件。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
                适合：品牌落地页、营销官网
              </div>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/40 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-400 mb-2">路径 03 · 工程首选</div>
                <h3 className="text-lg font-bold text-white mb-2">Figma MCP 语义直连</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  在 Cursor 中配置 Figma MCP，直接读取图层树、Auto Layout、Design Tokens 与精确色值字号，配合 Playwright MCP 截图对比，消除 90% 像素误差。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-400">
                适合：多页面 SaaS、设计系统对齐
              </div>
            </div>
          </div>
          <p className="mt-5 text-xs font-mono text-slate-400">
            ↓ 向下查看多产品 UI 一致性规则与 Playwright 视觉自检提示词
          </p>
        </div>
      </Slide>

      {/* Sub Slide 1: Design Token Consistency */}
      <Slide
        backgroundColor="#050814"
        notes="独立开发者做多个产品时容易风格失控，用 .cursor/rules 固化组件库、色彩与排版法则。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">UI CONSISTENCY RULES</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            告别“AI 塑料感”：用规则锁死审美与组件规范
          </h3>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="text-base font-bold mb-2 text-gemini-cyan">统一设计系统清单</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  在 <code className="text-white">10-ui-design.mdc</code> 中明确声明 60-30-10 配色预算、固定圆角阶梯、字体家族（如 Plus Jakarta Sans + JetBrains Mono）以及禁止滥用无意义的彩色胶囊标签。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="text-base font-bold mb-2 text-gemini-purple">必须补齐四态体验</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  要求 Cursor 为每个异步界面同时生成：Skeleton 加载态、引导性 Empty 空状态、可重试 Error 态以及 375px/1440px 双视口响应式适配。
                </p>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-white/15 font-mono text-xs text-slate-200 flex flex-col justify-center">
              <div className="text-gemini-cyan mb-2"># Playwright MCP 视觉验收指令</div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`请使用 Playwright MCP 访问 http://127.0.0.1:3000：
1. 分别在 1440x900 与 390x844 截图检查首屏
2. 检查是否存在文字截断、按钮换行或横向滚动条
3. 核对 Console 与 Network 是否有 4xx/5xx 报错
4. 如发现对齐偏差，直接定位对应 TSX 组件修复并重截确认`}</pre>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>延伸专章：M10「AI Coding 审美积累与 VibeCoding 效能实践」含全量 23 站喂料配方（Lab 08）</span>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("reveal:jump-module", { detail: { moduleId: "m10", v: 0 } })
                )
              }
              className="text-gemini-cyan font-mono hover:underline shrink-0 cursor-pointer whitespace-nowrap"
            >
              前往 M10 审美与效能 (Lab 08) →
            </button>
          </div>
        </div>
      </Slide>
    </section>
  );
}
