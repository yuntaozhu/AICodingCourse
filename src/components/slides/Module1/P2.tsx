import Slide from "@/components/Slide";

export default function P2() {
  return (
    <Slide notes="平庸的用法把 Cursor 当成自动补全插件，或者无规则瞎改的 Vibe Coding；专业用法是用 Plan Mode、.cursor/rules 与 DoD 门禁把产品意图确定性落地。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-6 font-bold text-gemini-cyan italic">
          告别盲目 Vibe Coding：Cursor 意图工程
        </h2>
        <div className="grid grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-slate-200">
              对于独立开发者与产品经理，Cursor 不是简单的“行内自动补全”，而是能同时管理需求拆解、全栈编码、终端测试与浏览器自检的研发搭档。
            </p>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">01</span>
                <span>
                  <strong className="text-white">Cmd+I 统一工作台：</strong>
                  用 <code className="text-gemini-cyan">Shift+Tab</code> 先切到 Plan 模式出方案，再进 Agent 模式多文件改动
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">02</span>
                <span>
                  <strong className="text-white">拒绝“越改越乱”：</strong>
                  通过 <code className="text-gemini-cyan">.cursor/rules/*.mdc</code> 与 <code className="text-gemini-cyan">AGENTS.md</code> 锁定架构边界
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">03</span>
                <span>
                  <strong className="text-white">终端自愈闭环：</strong>
                  Agent 改完代码自动跑类型检查与构建，读报错自行修正后才交付
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35">
            <div className="text-[11px] font-mono text-gemini-purple mb-2 uppercase tracking-wider">
              Cursor Cmd+I · Plan ➔ Agent 实战指令
            </div>
            <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">{`# Context: @Codebase @AGENTS.md
# Mode: Plan Mode (Shift+Tab) -> 确认后 Build

Intent:
为 SaaS 产品上线 Stripe 月度订阅与会员权限校验

Guardrails (.cursor/rules):
- 密钥与 Webhook 签名校验仅留存服务端路由
- 必须使用 Zod 校验请求参数并处理失败回退

DoD:
- npx tsc --noEmit 0 errors
- Playwright MCP 验证支付成功跳转与空状态`}</pre>
          </div>
        </div>
      </div>
    </Slide>
  );
}
