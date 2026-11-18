import Slide from "@/components/Slide";

export default function P30() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="独立产品上线前最不能省的一关：让 Cursor Agent 为核心计费、鉴权与状态流转自动生成单元测试、PBT 边界测试与 Playwright 冒烟测试。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            AUTOMATED TESTING · CURSOR AGENT 驱动测试闭环
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            实战：让 Cursor Agent 跑通 <span className="text-gemini-purple">Vitest + E2E 自愈测试</span>
          </h2>
          <div className="grid grid-cols-2 gap-8 items-stretch">
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-slate-300">
                独立开发者没有专职 QA 团队，越是靠 AI 快速改代码，越需要把测试当成防止旧功能回退的“自动安全气囊”。
              </p>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-gemini-cyan mb-1">1. 核心纯函数 / 价格计算 ➔ Vitest + PBT</div>
                  <div className="text-slate-300">用高随机输入验证金额分/元换算、折扣叠加与并发扣减绝不出现负数或浮点误差。</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-gemini-purple mb-1">2. API 契约与权限 ➔ 集成回归测试</div>
                  <div className="text-slate-300">校验未登录访问返回 401、越权访问返回 403、非法入参返回 400。</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-emerald-400 mb-1">3. 关键转化路径 ➔ Playwright 冒烟</div>
                  <div className="text-slate-300">登录 ➔ 核心功能提交 ➔ 结果渲染，保证每次大改后核心主链路可点通。</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35 flex flex-col justify-between font-mono text-xs text-slate-200">
              <div>
                <div className="text-gemini-purple mb-2"># DoD 测试自愈循环指令</div>
                <pre className="whitespace-pre-wrap leading-relaxed">{`[Agent Mode] @server/routes/billing.ts
请为计费与额度扣减逻辑补齐 Vitest 测试：
1. 覆盖正常扣减、余额不足拦截、并发重复请求幂等
2. 覆盖 NaN / 负数 / 超大整数边界输入
3. 自主运行 npx vitest run，如遇失败直接读取报错修复实现或修正测试，直到全部绿灯通过。`}</pre>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400">
                ↓ 向下查看边界挖掘与防虚构通过门禁
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Edge Case Discovery */}
      <Slide backgroundColor="#050814" notes="警惕 AI 为了让测试通过而修改断言或 Mock 掉核心逻辑，Bugbot 与人工 Code Review 必须紧盯测试改动。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">EDGE CASE &amp; ANTI-CHEAT GUARD</div>
          <h3 className="text-3xl mb-6 font-bold text-white">边界挖掘与测试防作弊门禁</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-gemini-purple">必测四类边界条件</h4>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li>· <strong className="text-white">空值与超长文本：</strong>空数组、Emoji、10KB 描述输入不崩溃</li>
                <li>· <strong className="text-white">网络超时与重复点击：</strong>AbortError 处理、按钮 Loading 防重入</li>
                <li>· <strong className="text-white">时区与货币精度：</strong>统一服务端 UTC 与整数分 (cents) 计算</li>
                <li>· <strong className="text-white">权限越界：</strong>普通用户携带伪造 ID 尝试修改他人资源</li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-gemini-cyan">防止 AI “改测试凑绿灯”</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                在 <code className="text-white">.cursor/rules</code> 中写入明确约束：遇到失败测试时，严禁擅自删除断言、注释测试用例或改用假数据绕过报错，必须先向用户说明根因。
              </p>
              <div className="p-3 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/25 text-[11px] font-mono text-gemini-cyan">
                Rule: Never weaken assertions or skip failing tests without explicit approval.
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
