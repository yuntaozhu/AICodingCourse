import Slide from "@/components/Slide";

export default function P26() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="独立产品进入 Stage 2 全栈阶段的核心：用 Cursor Plan 模式锁定 Supabase / Postgres Schema、认证权限与 OpenAPI 契约，避免前后端字段各写各的。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            FULL-STACK &amp; SUPABASE · 契约驱动后端开发
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：Supabase 全栈底座与 <span className="text-gemini-purple">OpenAPI 契约驱动</span>
          </h2>
          <div className="grid grid-cols-2 gap-8 items-stretch">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base font-bold text-gemini-cyan mb-2">1. 先定数据表与 RLS 安全策略</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  让 Cursor 先基于 PRD 生成 SQL Schema 与 Supabase Row-Level Security（如 <code className="text-white">auth.uid() = user_id</code>），确保即使前端被调试也无法越权读写他人数据。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base font-bold text-gemini-purple mb-2">2. OpenAPI + Zod 共享类型源头</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  把请求/响应类型和 Zod 校验收口到共享 <code className="text-white">src/types/</code>。Cursor 编辑 Express/Next API 路由时，用 <code className="text-white">@types</code> 保证前端 fetch 与后端完全一致。
                </p>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35 flex flex-col justify-center">
              <div className="text-xs font-mono text-gemini-purple mb-2">
                CURSOR PLAN PROMPT · DB + API CONTRACT
              </div>
              <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{`[Plan Mode] @PRD.md @src/types/api.ts

我要落地「文案生成 SaaS」的 Supabase 后端：
1. 建立 projects 与 generations 两张表，开启 RLS
2. 服务端 Route /api/generate 校验登录态、扣减额度、调用 Gemini API
3. 严禁把 SUPABASE_SERVICE_ROLE_KEY 或 GEMINI_API_KEY 暴露到 VITE_*
4. 同步生成 /api/docs OpenAPI 规范与 curl 联调脚本`}</pre>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-purple">
                ↓ 向下查看服务端密钥隔离与本地联调 Checklist
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Backend Guardrails */}
      <Slide
        backgroundColor="#050814"
        notes="后端接口开发中最常见的独立开发者安全坑：前端直连第三方 Key、忘记鉴权与缺少速率限制。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">BACKEND SECURITY CHECKLIST</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            独立开发者后端三条不可逾越的安全底线
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-red-400 mb-2">01 · 严禁密钥进前端</div>
              <h4 className="text-base font-bold mb-2 text-white">Server-Side Proxy 代理</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                AI Key、数据库 Service Key、支付私钥只能留在 Express / Serverless 后端路由中读取，浏览器端仅与同源 <code className="text-white">/api/*</code> 通信。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">02 · 服务端算账与校验</div>
              <h4 className="text-base font-bold mb-2 text-white">不信任任何客户端入参</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                用户额度扣减、商品价格与角色权限必须在服务端重新查库核验，并用 Zod 对 Body 做严格白名单过滤。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · 环境变量与示例</div>
              <h4 className="text-base font-bold mb-2 text-white">.env 隔离与健康探针</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                提交代码前用 Bugbot 核查 <code className="text-white">.gitignore</code> 已忽略 <code className="text-white">.env</code>，仅提供无真实密钥的 <code className="text-white">.env.example</code> 与 <code className="text-white">/api/health</code> 探针。
              </p>
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-[#0b0f19] border border-white/15 flex items-center justify-between gap-4 text-xs text-slate-300">
            <span>
              延伸拆解：关于 <strong className="text-white">Drizzle (~7KB) vs Prisma</strong> 选型与 <strong className="text-white">Zustand × TanStack Query</strong> 状态分层详解，见新增模块 <code className="text-gemini-cyan">M9 全栈图谱</code>。
            </span>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("reveal:jump-module", { detail: { moduleId: "m9", v: 0 } })
                )
              }
              className="text-gemini-cyan font-mono hover:underline shrink-0 cursor-pointer"
            >
              前往 M9 全栈图谱 →
            </button>
          </div>
        </div>
      </Slide>
    </section>
  );
}
