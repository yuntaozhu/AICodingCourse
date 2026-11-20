import { useState } from "react";
import Slide from "@/components/Slide";
import AestheticEvaluationCard from "@/components/sandboxes/AestheticEvaluationCard";
import UiInspirationSandbox from "@/components/sandboxes/UiInspirationSandbox";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";
import { ArrowUpRight } from "lucide-react";

function jumpToLab08() {
  window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId: "ui-inspiration" } }));
}

export function AestheticsThesisSlide() {
  return (
    <section>
      {/* Main Slide: Taste ≠ Aesthetics & Garbage In, Garbage Out */}
      <Slide
        backgroundColor="#040711"
        notes="Module 10 开篇（AI Coding 审美积累与 VibeCoding 效能实践）：阐明为什么文字形容词导致 Garbage In, Garbage Out，以及如何通过整站、局部、实现源码三层参考输入将主观直觉转化为高确定性 AI 提示词。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="text-xs font-mono text-gemini-cyan tracking-wide">
              Module 10 · AI Coding 审美积累与 VibeCoding 效能实践
            </div>
            <button
              type="button"
              onClick={jumpToLab08}
              className="text-xs font-mono text-gemini-purple hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>直达 Lab 08 · 23 站前端参考与 Prompt 生成台</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            审美积累与 AI 输入质量：<br />
            打破 <span className="text-gemini-cyan">Garbage In, Garbage Out</span>
          </h1>
          <p className="text-sm text-slate-300 mb-5 max-w-4xl leading-relaxed">
            对 AI 说 <strong className="text-white">“干净一点、有设计感、高级但不要太高级”</strong> 时，内心其实已有倾向却无法精确描述——每个词都给 AI 留出了过大发挥空间。与其再补十个形容词，不如给一张标明借鉴点的图、一段局部交互，或直接一份组件源码。
          </p>

          <div className="grid grid-cols-12 gap-4 text-xs mb-4">
            <div className="col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-cyan text-sm">Ⅰ 整站类（01–11 站）</div>
              <p className="text-slate-300 leading-relaxed">
                Lapa Ninja 到 Curated：看清首尾叙事节奏、字图留白比与行业版面分配；收藏时务必备注到底喜欢该页面的哪一点。
              </p>
            </div>
            <div className="col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-purple text-sm">Ⅱ 局部类（12–13 站）</div>
              <p className="text-slate-300 leading-relaxed">
                Navbar Gallery 与 Footer Design：整页风格已定时，缩小范围专攻容易挤成一排的顶部导航与虎头蛇尾的页脚。
              </p>
            </div>
            <div className="col-span-4 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-1.5">
              <div className="font-bold text-emerald-400 text-sm">Ⅲ 实现类（14–23 站）</div>
              <p className="text-slate-300 leading-relaxed">
                Codrops 到 Animata：分清 React / Vue / 纯 CSS，把效果链接、调好参数的选项与组件源码一并交给 AI，告别看图猜动画。
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-white/15 flex items-center justify-between gap-4 text-xs">
            <div className="text-slate-200 leading-relaxed">
              <strong className="text-gemini-purple">核心洞察（审美 ≠ 美学）：</strong>
              Taste 更像是在大量高质量输入积累下，逐渐形成的属于自己的<strong className="text-white">取舍与选择判断力</strong>。每个站都有好看与不好看的地方——先做输入积累，再精准喂给 AI。
            </div>
            <span className="font-mono text-gemini-cyan shrink-0 whitespace-nowrap">
              ↓ 向下看四步高信噪比输入 SOP
            </span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: 4-Step High-Signal Input SOP */}
      <Slide
        backgroundColor="#050814"
        notes="将 VibeCoding 参考输入流程沉淀为四步日常操作纪律：收藏备注具体亮点、先选结构再统视觉、连同留白比例与展开态输入、以及源码与参数直喂。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            VibeCoding 效能工作法 · 4-Step Visual Input Discipline
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            从直觉收藏到 Cursor 精准落地：四条输入提效法则
          </h2>

          <div className="grid grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan">01. 收藏时必须备注“喜欢其中哪一点”</div>
              <p className="text-slate-300 leading-relaxed">
                不要丢一个整站 URL 让 AI 全盘复刻。记下你喜欢的是<strong className="text-white">整体叙事顺序、滚动视差、hover 效果还是字重节奏</strong>；喂给 Cursor 时只指定参考该特征，节省 Token 且精准可控。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-purple">02. 先定内容结构，再定视觉处理（严禁拼盘）</div>
              <p className="text-slate-300 leading-relaxed">
                参考 Land-book / Saaspo 时，先决定自己页面怎么讲故事；切忌把三家网站各自最好看的区块直接拼在同一页里——单看都不错，合在一起往往风格失调。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-emerald-400">03. 连同比例、留白与展开态一并喂料</div>
              <p className="text-slate-300 leading-relaxed">
                使用 Siteinspire / Minimal Gallery 时要交代图片占比、边距与保留信息（防 AI 一“极简”就删光业务内容）；参考导航时务必补充<strong className="text-white">菜单展开后的完整截图</strong>。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-2">
              <div className="font-mono text-amber-300">04. 看清技术栈，直接喂源码 + 参数 + 依赖</div>
              <p className="text-slate-300 leading-relaxed">
                React Bits / Vue Bits / OriginKit / Animata 支持先在线预览调参。先调到顺眼状态，再把<strong className="text-white">对口框架的源码、具体参数与依赖包名</strong>一起喂给 AI。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}

export function FullSiteCatalogSlide() {
  return (
    <section>
      {/* Main Slide: Part I Full-Site Reference Catalog (01-11) */}
      <Slide
        backgroundColor="#040711"
        notes="Part I 整站类（01–11 站）完整教学拆解：按「叙事节奏 / 行业与创意 / 留白与取舍 / 对比与词库」四大维度梳理 Lapa Ninja 至 Curated。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            Part I · 整站类参考清单（01–11 站）· 从整页叙事到风格关键词积累
          </div>
          <h2 className="text-3xl font-bold text-white mb-5">
            整站参考不靠“全部照抄”：11 大高质量 Case 网站核心用法
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-cyan text-sm">A. 完整叙事流与产品说服力</div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">01. Lapa Ninja (lapa.ninja)：</strong>保留整页截图与视频（如 PP Neue Montreal 靠字体撑起视觉节奏），顺看首屏、中段承接与结尾 CTA。
                </div>
                <div>
                  <strong className="text-white">03. One Page Love (onpagelove.com)：</strong>小工具/活动页首选（如 Statements 把 PDF 转 CSV 工具讲成完整产品），先做好一页再拆分支。
                </div>
                <div>
                  <strong className="text-white">10. Saaspo (saaspo.com)：</strong>拆开 Landing/Pricing/Product/Customers（如 Papermark 直接嵌产品界面），喂 AI 时标出信息顺序而非只抄背景。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-purple text-sm">B. 垂直行业对齐与创意突破</div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">02. CSS Design Awards：</strong>带“拆作业”心态找单个记忆点细节（如 Viru 食品站的大图摄影与错落排版）。
                </div>
                <div>
                  <strong className="text-white">04. Websitevice (websitevice.com)：</strong>按咖啡店、牙科、酒店、教育等行业筛选，直接复制它的布局特征描述给 AI，比拿科技模板硬套准得多。
                </div>
                <div>
                  <strong className="text-white">09. Httpster (httpster.net)：</strong>收录 Unusual Layout/Navigation（如 Bauhaus Clock 让小产品成为主角），帮收藏夹摆脱同质化 SaaS 模板。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-emerald-400 text-sm">C. 留白关系与极简取舍</div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">05. Siteinspire (siteinspire.com)：</strong>研究字、图、留白落点（Scullion Architects 互不抢戏），通过 Typographic / Grid Layout 学专业提示词汇。
                </div>
                <div>
                  <strong className="text-white">06. Minimal Gallery (minimal.gallery)：</strong>少元素更突出字重、边距与裁切（Goodside），给参考图时须指明保留哪些内容，防 AI 一“极简”就删光信息。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-1.5">
              <div className="font-bold text-amber-300 text-sm">D. 横向对比、双端适配与风格溯源</div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">07. Land-book (land-book.com)：</strong>同类首页并排比较，且内置 Hero/Pricing 等 Sections 库解局部卡点，先选内容结构再定视觉处理。
                </div>
                <div>
                  <strong className="text-white">08. Godly · 11. Curated：</strong>Godly 看 Gitnimble 桌面+手机+区块拆解，交给 AI 前先把直觉“翻译”成具体描述；Curated 顺着 Basement Studio 标签找同风格案例并积累词库。
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-gemini-cyan">
            ↓ 向下看实操对比：模糊形容词提示词 vs 整站局部精准喂料模板
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Prompt Engineering Transformation for Full-Site References */}
      <Slide
        backgroundColor="#050814"
        notes="用前后对比示例演示：同样是做 SaaS 或工具站，如何把一句空泛形容词改写成低 Token、高还原度的整站参考指令。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            Garbage In vs High-Signal Input · 整站参考改写示范
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            把“有点设计感、不要太花哨”翻译成 Cursor 能执行的具体约束
          </h2>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-amber-500/8 border border-amber-400/25 space-y-3">
              <div className="font-bold text-amber-300 text-sm">
                低信噪比输入（盲猜失控区）
              </div>
              <pre className="p-3.5 rounded-xl bg-black/50 border border-white/10 font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{`“帮我做一个 PDF 转 CSV 工具的官网。
要求：干净一点、有设计感、高级但不要太高级，
看起来像个成熟 SaaS，手机端也要好看。”`}</pre>
              <p className="text-slate-300 leading-relaxed">
                后果：AI 只能套用最通用的暗紫渐变卡片模板，首屏堆砌空洞标语、缺少真实产品演示，改动五六轮仍不合心意。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/40 space-y-3">
              <div className="font-bold text-gemini-cyan text-sm">
                高信噪比输入（结合 One Page Love + Siteinspire + Godly）
              </div>
              <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">{`@src/pages/Home.tsx [附参考图]
1. 单页结构参考 One Page Love (Statements)：首屏直接嵌交互转换演示，紧接 3 步说明与信任承诺，暂不建二级子页。
2. 留白与字体占比参考 Siteinspire：锁定图文 6:4 比例与 32px 外边距，保留我方现有价格与格式列表（禁止极简删减）。
3. 375px 移动端按 Godly 详情页改为单列垂直堆叠。`}</pre>
              <p className="text-emerald-300 leading-relaxed">
                结果：Cursor 一次明确结构顺序、图文留白比、不删核心信息与手机端降维策略。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}

export function PartialComponentsSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Part II 局部类（12–13 站）：整页大框架已定，但菜单显得挤、页脚收得太仓促时，缩小参考范围比换整站更有效。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-purple mb-2">
          Part II · 局部类参考清单（12–13 站）· 缩小参考范围解决高频重灾区
        </div>
        <h2 className="text-3xl font-bold text-white mb-6">
          局部救场双星：不让拥挤导航栏与敷衍页脚拖垮整站质感
        </h2>

        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">12. Navbar Gallery</span>
              <span className="font-mono text-gemini-cyan">https://navbar.gallery</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              专门解决顶部那条导航栏的设计难题：按静态导航、下拉菜单、侧栏、全屏菜单及信息承载力极强的 <strong className="text-white">Mega Menu</strong> 归类，特别适合工具站与内容多分类站。
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-slate-200 leading-relaxed">
              <div>
                <strong className="text-gemini-cyan">案例 · Chesapeake Plywood：</strong>把产品分类标签与产品缩略图一起装进展开菜单，信息再多也不用挤成一排小字。
              </div>
              <div>
                <strong className="text-amber-300">给 AI 参考必杀技：</strong>务必<strong className="text-white">把展开后的面板状态一并截图</strong>；只给默认收起状态，AI 根本不知道展开里面该长什么样。
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">13. Footer Design</span>
              <span className="font-mono text-gemini-purple">https://footer.design</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              页脚经常是做到最后耐心耗尽、随便塞一个 Logo 加几列链接草草结束的重灾区。该站支持按字体、网格、明暗与画面风格筛选，并提供完整手机端页脚视图。
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-slate-200 leading-relaxed">
              <div>
                <strong className="text-gemini-purple">案例 · Playfolly：</strong>将真实产品场景画面与一句大字体品牌宣言放在页脚，页面到底了品牌表达依然有力不散场。
              </div>
              <div>
                <strong className="text-amber-300">给 AI 参考必杀技：</strong>整理好你自己的真实链接清单，搭配 1 张 Footer Design 截图（含移动端）直接交付 Cursor 补齐收尾。
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

export function ImplementationLibsSlide() {
  return (
    <section>
      {/* Main Slide: Part III Implementation & Code Component Libraries (14-23) */}
      <Slide
        backgroundColor="#040711"
        notes="Part III 外挂实现类（14–23 站）：把效果图、安装方式、参数选项与源码直接喂给 AI，妈妈再也不用担心 AI 对着静态截图猜动画。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            Part III · 外挂：实现类参考清单（14–23 站）· 源码与参数直喂 AI
          </div>
          <h2 className="text-3xl font-bold text-white mb-5">
            看清技术栈，直接喂 Demo 代码：10 大动效与组件源头库
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-cyan text-sm">
                A. 原理拆解 × 框架精确对口（14–16 站）
              </div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">14. Codrops：</strong>附带教程、Demo 与仓库（如自定义形状鼠标拖尾）；把教程、仓库和要改的部分一起给 AI，同时检查 <code className="text-gemini-cyan">Three.js / WebGPU</code> 兼容性。
                </div>
                <div>
                  <strong className="text-white">15. React Bits：</strong>文字/背景/鼠标反馈可预览，Aurora 可在线调颜色、速度与融合度并一键 <strong className="text-emerald-300">Copy for AI</strong>。
                </div>
                <div>
                  <strong className="text-white">16. Vue Bits：</strong>Vue 原生移植版（如 Dock 依赖 <code className="text-white">motion-v</code>），省掉 AI 跨框架翻译的中间翻车，严防 Vue 里塞进 React 代码。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-gemini-purple text-sm">
                B. 可视化调参 × 动效参数化（17 &amp; 23 站）
              </div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">17. OriginKit：</strong>选类目、看预览、右侧调颜色/密度/速度（如 Cursor Ring Field），文档含代码、Framer 与 MCP 路径；需注意甄别免费与付费组件门槛。
                </div>
                <div>
                  <strong className="text-white">23. Animata：</strong>把“打字机再自然一点”拆成具体参数（Typing Text 的逐字间隔、是否循环、光标是否驻留），并提供安装与手动复制代码。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-amber-300 text-sm">
                C. 点到为止的局部动效（18–19 站）
              </div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">18. Magic UI：</strong>Number Ticker 让业绩数字平滑跳动，只取所需，将文档、安装方式、目标数值与精确出现位置一并给 AI。
                </div>
                <div>
                  <strong className="text-white">19. Aceternity UI：</strong>Tailwind + Motion 光线与边框反馈（Glowing Effect）；先定页面唯一主角再点缀，每张卡片都发光反而主次全无。
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-1.5">
              <div className="font-bold text-emerald-400 text-sm">
                D. 高频互动质感 × 小零件视觉统一（20–22 站）
              </div>
              <div className="space-y-1.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">20. Animate UI：</strong>打磨折叠面板 Accordion、Tabs、弹窗开关的手感，且按 <code className="text-white">Radix UI / Base UI</code> 分组对口接入。
                </div>
                <div>
                  <strong className="text-white">21. Cult UI · 22. Uiverse：</strong>Cult UI（ShiftCard 扩展 shadcn，hover 展示双层细节）借交互后须统一字体间距；Uiverse 纯 HTML/CSS 按钮开关零件切勿杂糅，必须统一替换成全站主色调。
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs font-mono text-gemini-cyan">
            ↓ 向下看参数化喂料对比 · → 右滑打开 Lab 08 全 23 站实时检索与 Prompt 生成器
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Parameterized Code Feeding vs Blind Animation Prompting */}
      <Slide
        backgroundColor="#050814"
        notes="展示实现类网站最核心的价值：把文字猜谜（再丝滑自然一点）转换成 Vue Bits / Animata / Codrops 的精确框架源码 + 参数选项 + 兼容声明。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            Direct Code + Parameter Injection · 终结“看图猜动画”
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            框架先对口，参数先调好：把五轮返工压缩成一回合
          </h2>

          <div className="grid grid-cols-3 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan">框架防错：React Bits ≠ Vue Bits</div>
              <p className="text-slate-300 leading-relaxed">
                两者视觉很像，但底层分别是 React 与 Vue (<code className="text-white">motion-v</code>)。做 Vue 项目直接取 Vue Bits 的 Dock 源码，省去 AI 翻译语法与动画钩子的翻车。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-purple">参数具体化：Animata &amp; OriginKit</div>
              <p className="text-slate-300 leading-relaxed">
                不要再说“打字机效果再自然一点”。打开预览先把逐字间隔调成 <code className="text-white">38ms</code>、关闭无限循环、设置结束隐藏光标，再把精确配置与源码一起交给 Cursor。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-2">
              <div className="font-mono text-amber-300">克制与统一：Uiverse &amp; Aceternity</div>
              <p className="text-slate-300 leading-relaxed">
                Uiverse 来自无数作者、风格混杂；Aceternity 光效极强。拿回源码后务必由 Cursor 将硬编码颜色统一收口至全站 Design Tokens，并只保留 1 处视觉焦点。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}

export function AestheticsEvaluationSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="交互训练环节：使用「审美评估指标」卡片，对参考站点按布局结构、色彩方案、动效交互打分并归类，查看汇总统计并生成只保留高分亮点的 Cursor 精准输入指令。"
    >
      <div className="flex flex-col justify-center h-full">
        <AestheticEvaluationCard />
      </div>
    </Slide>
  );
}

export function AestheticsLabSlide() {
  return (
    <Slide
      backgroundColor="#02050e"
      notes="Lab 08 交互沙盘：内置 23 个 VibeCoding 参考网站完整检索台，按整站类（11）、局部类（2）、实现类（10）筛选并一键生成喂给 Cursor 的防走样 Prompt。"
    >
      <div className="flex flex-col justify-center h-full">
        <UiInspirationSandbox />
      </div>
    </Slide>
  );
}

const TEARDOWN_DIMENSIONS = [
  {
    id: "layout",
    dim: "布局 (Layout)",
    vague: "页面现代大气一点",
    checkableSpec: "桌面端 12 列栅格（左侧 5 列主叙事 + 右侧 7 列预览卡片），单屏无横向滚动条",
  },
  {
    id: "hierarchy",
    dim: "视觉层级 (Hierarchy)",
    vague: "重点要突出",
    checkableSpec: "每屏只留 1 个主 CTA（实心高亮）+ 1 个次按钮（描边），禁止每张卡片都加发光边框",
  },
  {
    id: "spacing",
    dim: "间距节奏 (Spacing)",
    vague: "看起来不要太挤",
    checkableSpec: "区块外边距统一 py-12/gap-6，卡片内边距 p-5，表格与指标卡严格对齐基线",
  },
  {
    id: "typography",
    dim: "排版尺度 (Typography)",
    vague: "字体要有设计感",
    checkableSpec: "主标题 text-4xl font-bold，数据指标强制 font-mono tabular-nums，正文保持 >=14px 高对比度",
  },
  {
    id: "responsive",
    dim: "响应式与异常态",
    vague: "兼容一下手机",
    checkableSpec: "375px 手机端自动转为单列 stack；按钮加 whitespace-nowrap；覆盖 Loading/Empty/Error 三态",
  },
];

const VISUAL_SPEC_ARTIFACT = `# VISUAL_TEARDOWN_COMPONENT_SPEC.md — 视觉拆解表与 AI 可检查组件规格

## 一、五维视觉拆解表（先拆解再写代码）
| 拆解维度 | 设计意图（人话） | AI 可检验规格（写入 Prompt / .mdc） | 验收核查方式 |
| :--- | :--- | :--- | :--- |
| **布局 Layout** | 信息主次分明不拥挤 | 12 列栅格（5+7），单屏无横向溢出 | 1280px 视口 \`scrollWidth <= innerWidth\` |
| **层级 Hierarchy** | 一眼看清主动作 | 全屏仅 1 个高对比主 CTA；禁用全卡片霓虹脉冲 | 人工目测首屏唯一视觉重心 |
| **间距 Spacing** | 呼吸感一致 | 统一 \`gap-5 / p-5\`，避免逐卡手写魔数间距 | 审查 Tailwind 类名一致性 |
| **排版 Typography** | 数字对齐、阅读清晰 | 指标加 \`tabular-nums\`，按钮加 \`whitespace-nowrap\` | 切换动态数字无抖动、按钮不折行 |
| **响应式 Responsive** | 桌面手机同样稳 | \`grid-cols-1 md:grid-cols-12\`，补齐空态/错态 | 375×812 模拟视口截屏零遮挡 |

## 二、前后迭代提示词对比模板
\`\`\`text
[第 1 轮先搭骨架] 按以上五维规格生成组件，仅用黑白灰与 1 个强调色占位，确认结构与 375px 布局无误。
[第 2 轮加细节与校验] 对照组件源码补齐 Loading/Empty/Error 三态，禁止装饰性 animate-pulse，跑通 npm run build。
\`\`\``;

export function VisualTeardownSpecSlide() {
  const [viewMode, setViewMode] = useState<"before" | "after">("after");
  const [checkedDims, setCheckedDims] = useState<string[]>(["layout", "responsive"]);

  const toggleDim = (id: string) => {
    setCheckedDims((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <ModuleLoopStudio
      moduleCode="M10"
      eyebrow="VISUAL TEARDOWN & SPEC · 视觉拆解、可执行规格与前后迭代"
      title="视觉拆解表 ➔ AI 可检查组件规格 ➔ 前后迭代实战"
      notes="通过布局、层级、间距、排版与响应式五维拆解训练，学会把模糊设计意图转化为 AI 可逐条验收的组件规格与前后迭代对比。"
      objective="能从参考界面拆出布局/层级/间距/排版/响应式 5 维客观规格，并通过先结构后细节的两轮迭代摆脱“AI 模板味”。"
      boundary="审美参考站仅用于拆解结构规律与参数；严禁照搬他人受版权保护的文案、品牌资产与图片，也不在一开始就让 AI 一代出复杂动效。"
      positiveCase={{
        title: "先拆 5 维规格再分两轮迭代",
        scenario: "把「要一个清爽的产品定价与指标区」拆解成可执行规格，经两轮迭代交付。",
        steps: [
          "第 1 轮（结构与响应式）：先锁定 12 列栅格、375px 单列降维与主次按钮对比度，跑出无溢出的干净骨架。",
          "第 2 轮（排版与状态）：注入 tabular-nums 数据对齐、whitespace-nowrap 防折行与 Empty/Error 降级态。",
          "对照五维 DoD 验收：桌面 1280px 与手机 375px 截屏确认零重叠、无多余发光边框。",
        ],
        snippetLabel: "AI 可检查的组件规格约束",
        snippet: `- Layout: grid-cols-1 md:grid-cols-12, zero horizontal overflow at 375px
- Hierarchy: single primary CTA; no decorative animate-pulse
- Type & States: tabular-nums for metrics; include Loading/Empty/Error`,
        verdict: "结构一次稳固，局部精修只需 1 轮，彻底告别五轮审美抽卡。",
      }}
      failureCase={{
        title: "模糊形容词“一代图”式提示词",
        scenario: "直接对 AI 说：「帮我做一个高级暗黑科技感、很有未来感的首页」。",
        steps: [
          "AI 触发默认高饱和蓝紫渐变 + 每张卡片发光边框 + 无意义闪烁脉冲圆点（典型 AI 模板味）。",
          "按钮文字在窄屏折成两行，动态数字跳动导致整列像素抖动。",
          "只要求“好看”，没有写空态/错误态与断点要求，交付后发现手机端卡片横向撑爆屏幕。",
        ],
        snippetLabel: "高返工率的模糊 Prompt",
        snippet: `"做一个酷炫高级、很有科技感、带丝滑动画的数据产品首页，越惊艳越好。"`,
        verdict: "缺乏可检验的布局/间距/排版约束，模型只能用刻板视觉 clichés 填充空白。",
      }}
      practiceTitle="课堂拆解练习：切换对比前后效果，并勾选将 5 项设计维度转为 AI 可检规格（至少选 3 项）"
      practicePassedCount={checkedDims.length >= 3 ? 3 : checkedDims.length}
      practiceTotalCount={3}
      dodItems={[
        {
          id: "m10-dod-1",
          label: "已把模糊设计形容词转化为布局/层级/间距/排版/响应式可执行规格",
          verifyHint: "至少覆盖 3 个维度的客观类名或断点约束",
        },
        {
          id: "m10-dod-2",
          label: "已完成桌面 1280px 与手机 375px 无溢出与三态检查",
          verifyHint: "确认无脉冲圆点、无按钮折行、数字加 tabular-nums",
        },
        {
          id: "m10-dod-3",
          label: "已导出「视觉拆解表 + AI 可检查组件规格模板」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="视觉拆解表与 AI 可检查组件规格模板"
      artifactFilename="VISUAL_TEARDOWN_COMPONENT_SPEC.md"
      artifactContent={VISUAL_SPEC_ARTIFACT}
      reflectionQuestion="下次你在参考网站看到一个特别舒服的卡片或导航栏时，除了“真好看”，你会逼自己记下哪 3 个具体参数再喂给 Cursor？"
      reflectionHint="强制记录这 3 项：1) 栅格与宽度占比（例如 12 列里的 5+7）；2) 字号层级差与行高间距（例如标题与正文至少差 2 档、卡片内边距统一 20px）；3) 窄屏（375px）和展开态的收口形态。"
      renderPractice={() => (
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-gemini-cyan">
              点击勾选拆解维度，切换对比前后输入差异：
            </span>
            <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("before")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer whitespace-nowrap ${
                  viewMode === "before"
                    ? "bg-rose-500 text-white font-semibold"
                    : "text-slate-300"
                }`}
              >
                改造前 · 模糊词
              </button>
              <button
                type="button"
                onClick={() => setViewMode("after")}
                className={`px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer whitespace-nowrap ${
                  viewMode === "after"
                    ? "bg-emerald-500 text-slate-950 font-semibold"
                    : "text-slate-300"
                }`}
              >
                改造后 · AI 可检规格
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            {TEARDOWN_DIMENSIONS.map((item) => {
              const selected = checkedDims.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleDim(item.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer grid grid-cols-12 gap-2 items-center ${
                    selected
                      ? "bg-emerald-500/10 border-emerald-400/40"
                      : "bg-white/[0.03] border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="col-span-4 font-mono text-[11px] text-white flex items-center gap-1.5">
                    <span className={selected ? "text-emerald-300" : "text-slate-400"}>
                      {selected ? "[✓]" : "[ ]"}
                    </span>
                    <span>{item.dim}</span>
                  </div>
                  <div className="col-span-8 text-[11px] leading-snug">
                    {viewMode === "before" ? (
                      <span className="text-rose-200">模糊写法：“{item.vague}”</span>
                    ) : (
                      <span className="text-emerald-200">{item.checkableSpec}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
