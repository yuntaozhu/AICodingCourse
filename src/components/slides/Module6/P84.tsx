import Slide from "@/components/Slide";

export default function P84() {
  return (
    <Slide backgroundColor="#020205" notes="Cursor Background Agents 让你在云端隔离分支中同时派发多个任务：读代码、改模块、跑测试、开 PR，互不打断你当前本地正在开发的主线任务。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-white">
          Cursor Background Agents：云端异步“数字搭档”
        </h2>
        <div className="grid grid-cols-2 gap-10 items-center">
          <div className="p-7 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-5">
            <h3 className="text-xl font-bold text-gemini-purple">不占用本地工作区的异步并行能力</h3>
            <ul className="space-y-3.5 text-sm text-slate-200">
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">01</span>
                <span><strong className="text-white">独立云端沙盒：</strong>自动切出新 Git 分支，完全不干扰你本地编辑器里的未提交代码。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">02</span>
                <span><strong className="text-white">严格继承仓库规范：</strong>自动读取 <code className="text-white">AGENTS.md</code> 与 <code className="text-white">.cursor/rules/*.mdc</code> 开展实现。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gemini-cyan font-mono">03</span>
                <span><strong className="text-white">自验证后提 PR：</strong>跑通终端单测与 Playwright MCP 检查后才创建 Pull Request。</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-1">适用场景 A · 独立开发者并行赶版本</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                你在本地专注写核心支付页；同时在 Slack / Web / Cursor 派发 2 个 Background Agent 分别去补“邮件模板国际化”和“移动端表格溢出演修”。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-1">适用场景 B · Cursor CLI 无头批量任务</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 CI 或定时任务里通过 <code className="text-white">cursor-agent -p</code> 自动根据新提交生成更新日志、补全缺失单测或核查安全基线。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
