import Slide from "@/components/Slide";

export default function P27() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="借鉴 easy-vibe 商业化与部署章节：真正的独立产品必须打通 Stripe 支付链路与云端上线，实现从 0 到收入的完整闭环。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            MONETIZATION &amp; SHIPPING · 支付闭环与上线发布
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：Stripe <span className="text-gemini-cyan">最小可行收费链路</span>与云端部署
          </h2>
          <div className="grid grid-cols-2 gap-8 items-stretch">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base font-bold text-gemini-cyan mb-2">Stripe 5 步标准时序（不可省略服务端）</h3>
                <ol className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <li>1. 后台创建 Product &amp; Price ID，配置环境变量</li>
                  <li>2. 前端点击购买 ➔ 请求后端创建 Checkout Session</li>
                  <li>3. 后端绑定 <code className="text-white">client_reference_id</code> 返回跳转 URL</li>
                  <li>4. 用户付款后，Stripe 发送签名 Webhook 至后端</li>
                  <li>5. 后端验证签名 + 幂等落库开通权限</li>
                </ol>
              </div>
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/25 text-xs text-slate-200">
                <strong className="text-red-300">高频致命坑：</strong>跳转到 <code className="text-white">/success</code> 页面不等于支付成功！任何用户都可以手动输入该 URL；权益发放必须只认服务端 Webhook 验签结果。
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-white/15 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-purple mb-2">
                  DEPLOYMENT MATRIX · 主流零运维上线平台
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">Vercel / Cloudflare Pages</div>
                    <div className="text-slate-400 mt-0.5">前端 SPA 与轻量 Serverless API 首选，Git push 即自动预览与全球 CDN 分发</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">Zeabur / Render / Railway</div>
                    <div className="text-slate-400 mt-0.5">需要长连接 Express、Python Worker 或托管 PostgreSQL 时的容器化一键部署</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-400">
                ↓ 向下查看 Stripe Webhook 验签提示词与上线前 DoD 清单
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Stripe + Ship Checklist */}
      <Slide
        backgroundColor="#050814"
        notes="用 Cursor Agent 联调本地 Stripe CLI 与部署前生产检查。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">STRIPE WEBHOOK + SHIP DOD</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            让 Cursor 帮你接通本地 Webhook 联调与发布门禁
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-cyan/30 font-mono text-xs text-slate-200">
              <div className="text-gemini-cyan mb-2"># Stripe 支付闭环提示词</div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`@server/routes/billing.ts @src/db/schema.ts
请实现 POST /api/webhooks/stripe：
- 使用 raw body 校验 stripe-signature 请求头
- 仅监听 checkout.session.completed 与 subscription.deleted
- 通过 event.id 做幂等去重表，防止重复发额度
- 本地用 stripe listen --forward-to localhost:3000/api/webhooks/stripe 联调通过`}</pre>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-sm text-white mb-1">1. 生产环境变量核对</div>
                <p className="text-xs text-slate-300">切分 Test Key 与 Live Key，域名回调白名单与 CORS 同步配置。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-sm text-white mb-1">2. 错误监控与降级提示</div>
                <p className="text-xs text-slate-300">支付超时、Webhook 延迟到达时前端给出友好的「权益同步中」轮询状态。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-bold text-sm text-white mb-1">3. 真实沙盒卡片端到端走通</div>
                <p className="text-xs text-slate-300">使用测试卡 4242 完整走通下单、支付、权限解锁与取消订阅全流程。</p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: 5-Step Agent SaaS Prompt Chain & Supabase RPC Type Sync */}
      <Slide
        backgroundColor="#040711"
        notes="吸纳 ai-coding-with-cursor 第 6 章 Agent Mode 实战与 chat_bot_customer_support_project 提示词：用 5 步拆解式提示词从零搭好 SaaS 骨架，再用 RPC 契约提示词打通数据库类型。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            PROGRESSIVE AGENT BUILD · 五步 SaaS 递进搭建法 &amp; DB 类型契约
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            独立开发者 5 步提示词流水线：不靠一句超大 Prompt 赌运气
          </h3>
          <div className="grid grid-cols-12 gap-5 text-xs">
            <div className="col-span-7 p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan text-[11px]">
                5-STEP AGENT MODE SEQUENCE（每步通过验收后再进入下一步）
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div>1. <strong className="text-white">脚手架锁定：</strong>安装 Vite/Next + Tailwind + 组件库，固化目录与 ESLint 基线。</div>
                <div>2. <strong className="text-white">Dashboard 骨架：</strong>侧栏折叠、响应式主体区与右上角账户下拉菜单。</div>
                <div>3. <strong className="text-white">商业官网落地页：</strong>Features + Pricing + FAQ + Contact + Footer 一次对齐。</div>
                <div>4. <strong className="text-white">双主题持久化：</strong>Theme Provider + System 偏好探测 + <code className="text-white">localStorage</code> 同步。</div>
                <div>5. <strong className="text-white">Zod 鉴权与受保护路由：</strong>登录/注册校验、受保护页面守卫与错误边界态。</div>
              </div>
            </div>

            <div className="col-span-5 p-5 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/35 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="font-mono text-emerald-400 text-[11px]">
                  PRODUCTION TIP · SUPABASE RPC 契约同步
                </div>
                <p className="text-slate-300 leading-relaxed">
                  数据库脚本返回 JSON 时自动类型生成往往缺失。在 Cursor 中直接执行：
                </p>
                <pre className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">{`@supabase/migrations @src/db-types.ts
扫描所有 SQL RPC 函数，核对 Args 并补齐精确 Return 类型定义；完成后生成 10 项上线文档清单 (app_documentation_tasks.md)。`}</pre>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                数据库契约与文档同步先行，前端零幻觉调用
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
