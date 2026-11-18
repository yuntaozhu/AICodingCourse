import Slide from "@/components/Slide";

export default function P84b() {
  return (
    <Slide backgroundColor="#020205" notes="在 Cursor 中通过 Playwright Browser MCP，Agent 能真正打开网页点击表单、等待异步响应并捕获控制台异常，实现全自动端到端验证。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
          Playwright Browser MCP：自动化 E2E 自检
        </h2>

        <div className="grid grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-lg font-bold text-gemini-purple">为什么独立产品上线前必须跑 Browser MCP？</h3>
              <div className="space-y-2.5 text-sm text-slate-200">
                <div>• <strong className="text-white">编译通过 ≠ 页面能点：</strong>捕获水合报错、白屏与 API 跨域失败。</div>
                <div>• <strong className="text-white">多端视口截图比对：</strong>同时检查 1280px 桌面与 375px 手机端的遮挡溢出。</div>
                <div>• <strong className="text-white">发现即原地修复：</strong>Agent 看到报错日志后直接修改对应组件源码并复测。</div>
              </div>
            </div>

            <div className="p-5 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/30">
              <div className="text-xs font-mono text-gemini-cyan mb-1.5 uppercase tracking-wider">Cursor Prompt 示例</div>
              <p className="text-xs font-mono text-slate-200 leading-relaxed">
                "使用 Playwright MCP 访问 /checkout，填入测试邮箱并点击订阅，确认无 Console Error 且跳转成功页。"
              </p>
            </div>
          </div>

          <div className="bg-[#0b0f19] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-white/10 px-4 py-2.5 flex items-center gap-3">
              <div className="text-[11px] font-mono text-slate-300">Playwright MCP Session</div>
              <div className="bg-black/40 px-3 py-1 rounded text-[11px] text-slate-400 font-mono flex-1">
                http://localhost:3000/checkout
              </div>
            </div>
            <div className="p-5 font-mono text-xs space-y-2 text-gemini-cyan/90">
              <div className="text-slate-400"># Cursor Agent + Playwright MCP Execution</div>
              <div>{`> `}browser_navigate("/checkout")</div>
              <div>{`> `}browser_type("#email", "founder@indie.dev")</div>
              <div>{`> `}browser_click("button:has-text('立即订阅')")</div>
              <div className="text-amber-300">! Waiting for Stripe redirect &amp; loading state...</div>
              <div>{`> `}browser_console_messages() -&gt; 0 errors</div>
              <div className="text-emerald-400 font-bold">✓ E2E Pass: Order #12345 rendered cleanly on 375px &amp; 1280px</div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
