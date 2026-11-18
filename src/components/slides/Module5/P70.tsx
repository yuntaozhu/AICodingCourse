import Slide from "@/components/Slide";

export default function P70() {
  return (
    <section>
      {/* Main Slide */}
      <Slide backgroundColor="#020205" notes="单元测试只能验证‘代码是否按预期运行’，但无法验证‘代码是否符合业务意图’。在 Cursor 时代，我们需要在 DoD 中引入语义验证，将 PRD 与合规规则作为校验基准。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">SEMANTIC VALIDATION · 业务意图验收</div>
          <h2 className="text-4xl mb-8 font-bold tracking-tight text-white">
            语义验证：<span className="text-gemini-purple">超越单元测试的意图门禁</span>
          </h2>
          <div className="grid grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-red-400/30">
                <div className="text-xs font-mono text-red-400 mb-1">TRADITIONAL UNIT TEST</div>
                <h4 className="text-lg font-bold mb-1 text-white">单元测试：只校验逻辑对错</h4>
                <p className="text-sm text-slate-300">验证：<code className="text-white">calculateDiscount(100) === 80</code></p>
                <p className="text-xs text-slate-400 mt-1">即使逻辑无误，也感知不到“该折扣仅限首单新用户”的业务漏写。</p>
              </div>
              <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/40">
                <div className="text-xs font-mono text-gemini-cyan mb-1">CURSOR INTENT VALIDATION</div>
                <h4 className="text-lg font-bold mb-1 text-gemini-cyan">语义验证：核对业务规范一致性</h4>
                <p className="text-sm text-white">验证：这个函数是否完整落实了 @PRD.md 的权限与计费红线？</p>
                <p className="text-xs text-slate-300 mt-1">在 Cursor 新对话中喂入 <code className="text-white">@git diff</code> 与 <code className="text-white">@PRD.md</code> 做独立交叉审计。</p>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/15 font-mono text-xs flex flex-col justify-center">
              <div className="text-gemini-cyan mb-3 tracking-wider">CURSOR BUGBOT · INTENT DIFF AUDIT</div>
              <div className="space-y-1 mb-4 text-slate-400">
                <div>Context: @PRD_Checkout.md</div>
                <div>Target: server/routes/stripe.ts</div>
              </div>
              <div className="space-y-2.5 text-slate-200">
                <div className="text-emerald-400">✓ 金额分/元换算与 Zod 校验匹配 Spec</div>
                <div className="text-amber-300">⚠ 缺少幂等事件表 event_id 查重，Webhook 重试会重复加额度</div>
                <div className="text-gemini-purple mt-3 p-3 bg-gemini-purple/10 rounded-xl border border-gemini-purple/25">
                  修复建议：插入 processed_events 主键约束后再执行用户额度更新事务。
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Intent vs Logic */}
      <Slide backgroundColor="#050814" notes="对比代码逻辑正确性与业务意图一致性的差异。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">INTENT VS LOGIC</div>
          <h3 className="text-3xl mb-8 font-bold text-white">逻辑正确但业务错误：AI 交付中最隐蔽的盲区</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-red-400">逻辑通过 (Unit Test Pass)</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                函数运行完全不报错，单元测试 100% 绿灯。例如：促销函数准确计算了 8 折价格并返回 HTTP 200。
              </p>
              <div className="p-3 bg-red-400/10 rounded-xl border border-red-400/25 text-xs font-mono text-red-300">
                Test: calculateDiscount(100) === 80 // PASS
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-3 text-gemini-cyan">意图违背 (Spec Violation)</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                如果 PRD 规定“仅限未付费过的新用户且不可与优惠券叠加”，只看函数本身很难发现缺少鉴权与互斥判断。
              </p>
              <div className="p-3 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/25 text-xs font-mono text-gemini-cyan">
                Spec: Only FIRST_ORDER &amp; non-stackable // MISSED
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Semantic Guardrails */}
      <Slide backgroundColor="#050814" notes="如何在 Cursor 与 CI 流水线中落地语义验证。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">SEMANTIC GUARDRAILS</div>
          <h3 className="text-3xl mb-8 font-bold text-white">语义护栏：三步建立可验证闭环</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · SPEC AS SOURCE</div>
              <h4 className="text-lg font-bold mb-2 text-white">文档常驻仓库</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                将 <code className="text-white">PRD.md</code>、收费规则与权限矩阵作为 Markdown 存入仓库，成为唯一真理源。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-gemini-purple/30">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · FRESH REVIEW</div>
              <h4 className="text-lg font-bold mb-2 text-white">干净上下文交叉审</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                编码结束后新建 Cursor Chat，只喂入 <code className="text-white">@PRD.md</code> 与 <code className="text-white">@Branch Diff</code> 逐条对照打勾。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · BUGBOT GATE</div>
              <h4 className="text-lg font-bold mb-2 text-white">PR 自动拦截上线</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                配合 Cursor Bugbot 在提交 PR 时自动标注与规范不一致之处，修完再合并上线。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
