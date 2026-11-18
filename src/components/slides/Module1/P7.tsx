import Slide from "@/components/Slide";
import PlanPromptSandbox from "@/components/sandboxes/PlanPromptSandbox";

export default function P7() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="SDD (Spec-Driven Development) 是对抗 Vibe Coding 返工的核心武器。在 Cursor 中，用 Cmd+I 后按 Shift+Tab 即可切换 Plan 模式先生成可审批规格。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-purple">
            SDD 确定性研发：Cursor Plan 模式先出蓝图
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-slate-200">
                独立开发者最怕“一句话让 AI 开写，改了 12 个文件发现全偏了”。<strong className="text-white">Cursor Plan Mode (`Shift+Tab`)</strong> 让 AI 先出架构 Spec，人类拍板后再动代码。
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-cyan">1. 澄清模糊假设</div>
                  <div className="text-xs text-slate-300 mt-0.5">Plan 模式先反问权限边界、数据存储与交互降级方案，把坑填在编码前。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-purple">2. 持久化为 Markdown Spec</div>
                  <div className="text-xs text-slate-300 mt-0.5">计划可保存进仓库 <code className="text-white">docs/specs/</code>，随时用 <code className="text-white">@spec.md</code> 分阶段执行。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-emerald-400">3. 一键 Build 切换 Agent</div>
                  <div className="text-xs text-slate-300 mt-0.5">确认蓝图后点击 Build，Agent 按 To-Do 清单逐文件实施并跑验证命令。</div>
                </div>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35">
              <div className="text-[11px] font-mono text-gemini-purple mb-2">
                CURSOR PLAN OUTPUT · SPEC_CHECKOUT.MD
              </div>
              <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">{`## 1. Data Contract (Zod + DB)
- Table: subscriptions(user_id, plan, status, stripe_id)
- Idempotency key required on webhook events

## 2. File Plan
- [edit] server/routes/stripe.ts (verify webhook sig)
- [new]  src/components/PricingModal.tsx

## 3. Verification (DoD)
- npx tsc --noEmit (0 errors)
- curl /api/health & mock webhook test`}</pre>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-purple">
                ↓ 向下查看 SDD 提示词模板与交互演练沙盘
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: SDD Prompt Engineering in Cursor */}
      <Slide backgroundColor="#050505" notes="如何写好一条让 Cursor Plan 模式输出高质量 Spec 的提示词。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-purple mb-2">PROMPT ENGINEERING · CURSOR PLAN MODE</div>
          <h3 className="text-3xl mb-6 font-bold text-white">独立开发者的 SDD 黄金提示词四要素</h3>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-mono font-bold text-gemini-cyan mb-1">1. @ 上下文边界 (Scope)</h4>
                <p className="text-xs text-slate-300">用 <code className="text-white">@Files</code> 指明现有路由与类型源头，告诉 Cursor 复用哪些现有模块。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-mono font-bold text-gemini-purple mb-1">2. 核心数据契约 (Contract)</h4>
                <p className="text-xs text-slate-300">要求先输出 DB Schema、API 请求/响应 JSON 结构与错误码枚举，再规划 UI。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-mono font-bold text-emerald-400 mb-1">3. 安全与非功能红线 (Guardrails)</h4>
                <p className="text-xs text-slate-300">明确写清“不改现有认证逻辑、敏感 Key 放服务端、不引入重型新依赖”。</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-xs font-mono font-bold text-amber-400 mb-1">4. 可执行验收条件 (Exit DoD)</h4>
                <p className="text-xs text-slate-300">指定结束前必须执行的命令（如 <code className="text-white">tsc</code> / <code className="text-white">lint</code> / 浏览器冒烟）。</p>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/30 font-mono text-xs text-slate-200 flex flex-col justify-center">
              <div className="text-gemini-purple mb-3"># Cursor Plan Mode 实战模板</div>
              <pre className="whitespace-pre-wrap leading-relaxed">{`[Plan Mode] @server/app.ts @src/types/user.ts

我要上线「团队邀请链接」功能：
1. 生成 7 天过期的签名邀请码，支持单次使用失效
2. 被邀请人登录后自动加入对应 Workspace

在改写任何代码前，请先输出 Spec 计划：
- 涉及的数据表字段与 API 契约
- 权限越权与重放攻击防御点
- 分步文件修改清单与 DoD 验证命令`}</pre>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Interactive Plan Prompt Sandbox */}
      <Slide backgroundColor="#040711" notes="动手演练：在课件内直接把产品需求装配成 Cursor Plan/Agent 可执行指令。">
        <div className="flex flex-col justify-center h-full">
          <PlanPromptSandbox />
        </div>
      </Slide>
    </section>
  );
}
