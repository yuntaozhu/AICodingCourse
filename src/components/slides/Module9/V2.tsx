import Slide from "@/components/Slide";

export default function V2() {
  return (
    <section>
      {/* Main Slide: Chapter 3, 4, 6, 7, 12 - Runtimes, Meta-Frameworks & Backend Options */}
      <Slide
        backgroundColor="#040711"
        notes="破除独立开发者最易混淆的概念：元框架（Next.js/Astro）不是替代 React/Vue 的竞品，而是在发动机之上装好的整车。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            CHAPTER 3, 4, 6, 7 &amp; 12 · 运行时、元框架与后端架构
          </div>
          <h2 className="text-4xl font-bold text-white mb-5">
            破除三大认知迷思：<span className="text-gemini-purple">元框架 ≠ 替代框架</span>
          </h2>

          <div className="grid grid-cols-12 gap-4 text-xs">
            <div className="col-span-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="font-mono text-gemini-cyan">01 · 整车隐喻 &amp; 孤岛架构（Ch.6 Meta-Frameworks）</div>
              <p className="text-slate-300 leading-relaxed">
                纯 <strong className="text-white">React + Vite</strong> 是单页应用（SPA），首屏需先下载执行全部 JS，易白屏且不利 SEO，也不能直连数据库。
              </p>
              <div className="space-y-2 text-slate-200">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <strong className="text-white">Next.js（React 整车）：</strong>React 只是发动机；Next.js 在它外层装配好了文件路由 (<code className="text-gemini-cyan">app/</code>)、SSR 服务端预渲染与 API 路由。
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <strong className="text-white">Astro（Islands 孤岛）：</strong>默认向浏览器发送零 JS 的静态 HTML 海洋，仅在搜索框、交互卡片等局部位置点亮独立 JS 孤岛（跨 React/Vue 混用）。
                </div>
              </div>
            </div>

            <div className="col-span-6 p-5 rounded-2xl bg-[#0b0f19] border border-white/15 space-y-3">
              <div className="font-mono text-gemini-purple">02 · 后端框架 &amp; 运行时四选一（Ch.3 &amp; Ch.7）</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white">Next.js Routes</div>
                  <div className="text-slate-400 mt-0.5">中小型全栈项目直接替代独立后端</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white">Express / Fastify</div>
                  <div className="text-slate-400 mt-0.5">Express 最通用；Fastify 快 2 倍且自带 JSON Schema</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white">Hono (&lt;14 KB)</div>
                  <div className="text-slate-400 mt-0.5">冷启动极快，边缘计算 &amp; Serverless 首选</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-bold text-white">NestJS</div>
                  <div className="text-slate-400 mt-0.5">强约定控制器/服务/模块，适合大型多人企业</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-slate-200 leading-relaxed">
                <strong className="text-emerald-400">构建翻译器（Ch.12）：</strong>Vite（纯 SPA 默认极速 ESM+HMR）与 Turbopack（Next.js 内置）负责把 TS/JSX 翻译成浏览器代码；新手包管理器默认选 <code className="text-white">npm</code>，多项目省空间再换 <code className="text-white">pnpm</code>。
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs font-mono text-slate-400">
            ↓ 向下查看 AI 生成项目的根目录文件与文件夹解剖图（Ch.19 Project Structure）
          </p>
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Chapter 19 - Project Structure Anatomy */}
      <Slide
        backgroundColor="#050814"
        notes="Handbook 第 19 章：打开 Cursor 左侧文件树不再发怵，1 分钟看懂根配置文件与核心目录职责。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            CHAPTER 19 · PROJECT STRUCTURE ANATOMY
          </div>
          <h3 className="text-3xl font-bold text-white mb-5">
            打开 AI 生成的仓库不发怵：关键配置与目录一览表
          </h3>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan mb-1">根目录“身份证”配置文件</div>
              <div className="space-y-1.5 text-slate-300">
                <div><code className="text-white">package.json</code> — 项目身份证：名称、运行脚本 (<code className="text-gemini-cyan">dev/build</code>) 与 <code className="text-white">dependencies</code> 清单</div>
                <div><code className="text-white">tsconfig.json</code> — TypeScript 严格度、编译目标与 <code className="text-white">@/*</code> 路径别名</div>
                <div><code className="text-rose-300">.env / .env.local</code> — 敏感密钥保险箱（数据库/AI Key），<strong className="text-white">绝不提交到 Git</strong></div>
                <div><code className="text-white">.gitignore</code> — 告诉 Git 屏蔽 <code className="text-white">node_modules</code>、<code className="text-white">.env</code> 与构建产物</div>
                <div><code className="text-white">drizzle.config.ts / next.config.js</code> — 数据库迁移或元框架运行配置</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-mono text-gemini-purple mb-1">标准全栈源码目录职责</div>
                <div className="space-y-1.5 text-slate-300">
                  <div><code className="text-white">app/</code>（或 <code className="text-white">src/pages/</code>）— 页面路由，<code className="text-white">app/about/page.tsx = /about</code></div>
                  <div><code className="text-white">app/api/</code>（或 <code className="text-white">server.ts</code>）— 后端安全接口层</div>
                  <div><code className="text-white">components/</code> — 可复用 UI 积木（按钮、弹窗、卡片）</div>
                  <div><code className="text-white">lib/ · db/</code> — 工具函数、客户端 SDK 与数据库 Schema 迁移</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/35 text-slate-200 leading-relaxed">
                <strong className="text-amber-300">关于 node_modules 文件夹的铁律：</strong>
                体积可达数百 MB。永远不要手工修改里面任何代码，也永远不要提交进 Git；一旦依赖损坏，直接整包删掉并重新运行 <code className="text-white">npm install</code> 即可无损重建。
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
