import Slide from "@/components/Slide";

export default function P29() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="借鉴 easy-vibe Stage 2 PRD 实战项目与 Stage 3 Long-Running Tasks：大项目不能靠一句 Prompt 硬写到底，必须用 PRD.md + feature_list.json 外部清单防止 AI 过早停止或失忆。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            PRD-DRIVEN &amp; LONG-RUNNING HARNESS · 防止 AI 过早停止
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：<span className="text-gemini-cyan">PRD.md + 任务清单协议</span>驱动长时开发
          </h2>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-cyan">为什么 AI 会“看起来做完了就停”？</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  大模型没有客观的“工程完工感”，生成几百行或遇到一次长耗时就容易中途收尾。解决之道是把验收权交给外部文件状态机，而不是 AI 的主观感觉。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-purple">双文件记忆锚点：PRD.md + progress.txt</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  每次开启新的 Cursor Agent 对话或 Background Agent 时，先让它读 <code className="text-white">@PRD.md</code> 与 <code className="text-white">@feature_list.json</code>，只领下一个未完成条目，做完跑测试再打勾 Commit。
                </p>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-cyan/30 flex flex-col justify-between font-mono text-xs text-slate-200">
              <div>
                <div className="text-gemini-cyan mb-2">feature_list.json · 外部客观进度锁</div>
                <pre className="whitespace-pre-wrap leading-relaxed">{`[
  { "id": "F-01", "feature": "Supabase Auth 登录拦截", "passes": true },
  { "id": "F-02", "feature": "文案生成 /api/generate 额度扣减", "passes": true },
  { "id": "F-03", "feature": "Stripe Webhook 验签与会员解锁", "passes": false },
  { "id": "F-04", "feature": "Playwright 移动端响应式巡检", "passes": false }
]`}</pre>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400">
                ↓ 向下查看 Easy-Vibe 精选全栈 PRD 项目训练营蓝图
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: PRD-Driven Full-Stack Assignments */}
      <Slide
        backgroundColor="#050814"
        notes="参考 easy-vibe Stage 2 真实作业库：通过 PRD.md 驱动全栈实战，把学到的 UI、Supabase、Stripe 与测试连成一体。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">PRD PROJECT TEMPLATES</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            独立开发者高价值 PRD 实战练兵场（源自 Easy-Vibe 精选项目结构）
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-1">项目 A · SAAS + SUPABASE</div>
              <h4 className="text-base font-bold mb-2 text-white">AI 文案生成付费平台</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                训练重心：Supabase Auth + RLS 隔离、额度配额表、Express 流式接口代理与 Stripe 订阅解锁。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-1">项目 B · LANDING + MCP</div>
              <h4 className="text-base font-bold mb-2 text-white">高转化 AI 图像产品官网</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                训练重心：Figma MCP 设计稿还原、AI 视觉素材生成、多断点响应式与首屏 LCP 性能门禁。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">项目 C · AGENT WORKBENCH</div>
              <h4 className="text-base font-bold mb-2 text-white">定制知识库与行程 Agent</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                训练重心：多步骤 Tool Calling 编排、Dify/Workflow API 对接、结构化 JSON 输出与失败兜底。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
