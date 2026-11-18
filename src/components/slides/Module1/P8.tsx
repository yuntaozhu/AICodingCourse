import Slide from "@/components/Slide";

export default function P8() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="DoD 是防止 AI 交出“看起来能跑但一部署就挂”半成品的唯一方法。在 Cursor 中把 DoD 写进 .cursor/rules/30-dod.mdc 并让 Agent 自动跑终端验证。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            DoD 完成定义：Cursor Agent 终端自愈闭环
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold mb-2 text-white">为什么“看起来没红线”不够？</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  LLM 天生倾向于优先写通 Happy Path。没有 DoD 门禁时，常见翻车是：表单没做校验、移动端溢出、甚至接口报错静默吞掉。
                </p>
              </div>
              <div className="p-5 bg-gemini-cyan/10 rounded-xl border border-gemini-cyan/30">
                <h3 className="text-lg font-bold mb-2 text-gemini-cyan">Cursor 自愈闭环（Loop until Green）</h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  把验证命令写进 Prompt 或 <code className="text-white">.cursor/rules</code>。Cursor Agent 改完代码后自动运行终端检查，读到报错即自动修补，直到全部绿灯。
                </p>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
              <div className="text-[11px] font-mono text-gemini-cyan uppercase tracking-wider">
                Cursor Self-Healing DoD Loop
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-black/50 border border-white/10 flex justify-between">
                  <span className="text-slate-200">1. Agent 编辑多文件</span>
                  <span className="text-slate-400">Apply Diff</span>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-amber-400/30 flex justify-between">
                  <span className="text-slate-200">2. 自动跑 npx tsc &amp;&amp; npm run lint</span>
                  <span className="text-amber-300">发现 2 处报错</span>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-gemini-purple/40 flex justify-between">
                  <span className="text-slate-200">3. 读取 Terminal Stack 自动修复</span>
                  <span className="text-gemini-purple">Auto-Fix</span>
                </div>
                <div className="p-3 rounded-lg bg-black/50 border border-emerald-400/40 flex justify-between">
                  <span className="text-slate-200">4. 复跑构建 + Playwright E2E</span>
                  <span className="text-emerald-400">ALL PASS</span>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-gemini-cyan mt-1">
                ↓ 向下查看 DoD 分层门禁与 Rules 写法
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: 3-Layer DoD for Indie Builders */}
      <Slide backgroundColor="#050505" notes="面向独立开发者的三层轻量级 DoD 门禁：无需重型运维即可实现高质量上线。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">INDIE BUILDER QUALITY GATES</div>
          <h3 className="text-3xl mb-6 font-bold text-white">独立开发者的三层自动化 DoD 门禁</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">L1 · STATIC GATES</div>
              <h4 className="font-bold text-base mb-2 text-white">类型与静态规范</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• npx tsc --noEmit (0 error)</li>
                <li>• npm run lint</li>
                <li>• npm run build</li>
              </ul>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">L2 · LOGIC &amp; API</div>
              <h4 className="font-bold text-base mb-2 text-white">边界单测与安全校验</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• Zod 请求体非法输入测试</li>
                <li>• 未登录访问返回 401</li>
                <li>• 无明文密钥泄露前端包</li>
              </ul>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">L3 · BROWSER MCP</div>
              <h4 className="font-bold text-base mb-2 text-white">真实浏览器端到端自检</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                <li>• Console 零红字异常</li>
                <li>• 1280px / 375px 零横滚</li>
                <li>• 核心创建/提交链路可通</li>
              </ul>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: DoD .mdc Rule Template */}
      <Slide backgroundColor="#050505" notes="把 DoD 固化在 .cursor/rules/30-dod-checks.mdc 中，每次 Agent 准备收工前自动触发。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-purple mb-2">CURSOR RULES FOR DOD</div>
          <h3 className="text-3xl mb-6 font-bold text-white">把 DoD 写进 .cursor/rules/30-dod-checks.mdc</h3>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-cyan/30 font-mono text-xs text-slate-200">
              <pre className="whitespace-pre-wrap leading-relaxed">{`---
description: Run verification before reporting task done
alwaysApply: false
---

# Definition of Done (DoD)
Before summarizing your changes:
1. Run \`npx tsc --noEmit\` and \`npm run lint\`.
2. Verify modified UI routes render cleanly with no console errors.
3. Confirm Loading, Empty, and API Error states are handled.
4. If any check fails, inspect the terminal output and fix the root cause.`}</pre>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-bold text-gemini-cyan mb-1">省 Token 的秘密：description 按需触发</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  设置 <code className="text-white">alwaysApply: false</code> 并写清 <code className="text-white">description</code>，Cursor Agent 只在任务收尾验证阶段自动加载，不占用平时对话上下文。
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-sm font-bold text-gemini-purple mb-1">产品经理也能做终验</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  结合 <strong className="text-white">Bugbot</strong> 与终端绿灯截图，非纯技术背景的产品经理也能客观确认产品是否达到上线水准。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
