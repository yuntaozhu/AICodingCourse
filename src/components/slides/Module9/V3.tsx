import Slide from "@/components/Slide";

export default function V3() {
  return (
    <section>
      {/* Main Slide: Chapters 8, 9, 10, 11 - ORM, Dual-Track State & Zod */}
      <Slide
        backgroundColor="#040711"
        notes="Handbook 第 8–11 章核心：明确区分数据库 ORM 二选一、客户端状态 vs 服务端状态协同工作，以及用 Zod 作为跨前后端单源契约。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            CHAPTER 8–11 · 数据层 ORM × 双轨状态管理 × ZOD 单源契约
          </div>
          <h2 className="text-4xl font-bold text-white mb-5">
            别让 AI 把代码搅成一锅粥：<span className="text-gemini-cyan">各司其职的现代中枢</span>
          </h2>

          <div className="grid grid-cols-3 gap-4 text-xs">
            {/* Column 1: Postgres + Drizzle vs Prisma */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="font-mono text-emerald-400">CH.8 · 持久化与 ORM 二选一</div>
              <div className="font-bold text-white text-sm">PostgreSQL (Supabase) + ORM</div>
              <p className="text-slate-300 leading-relaxed">
                PostgreSQL 是 2026 最推荐全能关系库，Supabase 自带托管 DB、Auth 与实时订阅。ORM 自动参数化查询，根绝 SQL 注入：
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-slate-200">
                <div><strong className="text-gemini-cyan">Drizzle (~7KB)：</strong>纯 TS 写 Schema，语法贴近 SQL，Edge/Serverless 首选。</div>
                <div><strong className="text-gemini-purple">Prisma：</strong>独立 <code className="text-white">.prisma</code> 语言抽象 SQL，新手原型极快。</div>
              </div>
            </div>

            {/* Column 2: Zustand + TanStack Query */}
            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/40 space-y-2.5">
              <div className="font-mono text-gemini-cyan">CH.9 &amp; 10 · 协同工作 (Work Together)</div>
              <div className="font-bold text-white text-sm">Zustand × TanStack Query</div>
              <p className="text-slate-300 leading-relaxed">
                现代前端严格拆分两种状态——二者<strong className="text-white">配合使用，绝非互斥替代</strong>：
              </p>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-slate-200">
                <div><strong className="text-white">Zustand (~1KB)：</strong>仅存浏览器纯 UI 状态（侧栏折叠、弹窗、主题）。</div>
                <div><strong className="text-white">TanStack Query：</strong>接管接口请求、Loading、缓存去重、后台刷新与指数重试——每个接口省下 30–50 行易出错的 <code className="text-white">useEffect</code>。</div>
              </div>
            </div>

            {/* Column 3: Zod */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="font-mono text-gemini-purple">CH.11 · 边界安检之王</div>
              <div className="font-bold text-white text-sm">Zod：运行时校验 + 编译期类型</div>
              <p className="text-slate-300 leading-relaxed">
                用户表单、恶意负数价格、启动读取 <code className="text-white">.env</code>、第三方 API 改格式——所有边界都必须做合法性核验。
              </p>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-slate-200">
                <div><strong className="text-emerald-400">杀手级优势：</strong>定义一份 Zod Schema，自动推导出完整 TS 类型（零重复声明），全面替代传统 Yup / Joi。</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-[#0b0f19] border border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span>
              2026 最常见稳定前端黄金组合：<strong className="text-white">Zustand（UI 状态） + TanStack Query（服务端状态） + React Hook Form + Zod（表单与契约）</strong>
            </span>
            <span className="font-mono text-gemini-cyan shrink-0">↓ 向下复制防状态混写规则</span>
          </div>
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Anti-Spaghetti Cursor Rule */}
      <Slide
        backgroundColor="#050814"
        notes="用一条精炼规则防止 Cursor Agent 在项目变大时退化回手写 useEffect 拉数据、不校验 API Body 的坏习惯。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            CURSOR ARCHITECTURAL GUARDRAIL · 防退化规则模板
          </div>
          <h3 className="text-3xl font-bold text-white mb-5">
            把 Handbook 第 8–11 章写成一条 Cursor 护栏规则
          </h3>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 font-mono text-slate-200">
              <div className="text-gemini-cyan mb-2"># .cursor/rules/30-state-and-zod.mdc</div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`---
description: "State separation, TanStack Query, Zod & ORM safety"
globs: ["src/**/*", "server/**/*"]
---
1. CLIENT vs SERVER STATE:
   - Never store API responses inside Zustand; use TanStack Query (or SWR).
   - Never write raw useEffect + fetch without AbortController/Query.
2. VALIDATION BOUNDARY:
   - Define request & env schemas in src/schemas/ using Zod.
   - Use schema.safeParse(req.body) before any DB mutation.
3. DATABASE QUERIES:
   - Always use Drizzle/Prisma parameterized queries. No raw SQL interpolation.`}</pre>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-white mb-1">为什么这能直接消灭 70% 返工？</div>
                <p className="text-slate-300 leading-relaxed">
                  如果没有上述边界约束，AI 默认会给每个新页面都手写一份 <code className="text-white">useState + useEffect + fetch</code>，很快导致重复请求、卸载内存泄漏告警与过期数据覆盖。
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="font-bold text-gemini-purple mb-1">Drizzle vs Prisma 选择一句话建议</div>
                <p className="text-slate-300 leading-relaxed">
                  懂一点 SQL 或重视 Serverless 冷启动体积（~7KB）选 <strong className="text-white">Drizzle</strong>；团队刚接触数据库、偏爱高层抽象快速出原型选 <strong className="text-white">Prisma</strong>。同一项目二选一，切勿混用。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
