import Slide from "@/components/Slide";

export default function P74c() {
  return (
    <Slide backgroundColor="#020205" notes="如何用 Cursor Agent + Bugbot 建立自动验证与打回修复闭环。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-white">
          DoD 验证提示词与 Cursor 自愈闭环
        </h2>
        <div className="grid grid-cols-2 gap-10 items-center">
          <div className="p-6 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35">
            <h3 className="text-base font-mono font-bold mb-3 text-gemini-cyan">
              AGENTS.md · DoD 验收段示例
            </h3>
            <pre className="text-xs font-mono text-slate-200 bg-black/50 p-4 rounded-xl border border-white/10 whitespace-pre-wrap leading-relaxed">{`## Verification Commands (Mandatory DoD)
1. TypeCheck: npx tsc --noEmit
2. Lint: npm run lint
3. Build: npm run build
4. Browser Check: Verify desktop (1280px) & mobile (375px)

# Agent Execution Rule:
If any command fails, read stdout/stderr, fix the root cause,
and re-run until all checks pass.`}</pre>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-gemini-purple">三步自动化质量闭环</h3>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <span className="font-mono text-gemini-cyan font-bold mr-2">01 · Terminal Auto-Run</span>
                <span>Cursor Agent 在终端执行类型、Lint 与构建检查。</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <span className="font-mono text-gemini-purple font-bold mr-2">02 · Bugbot Diff Guard</span>
                <span>提交 PR 时 Bugbot 自动扫描 SQL 注入、竞态与死代码。</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <span className="font-mono text-emerald-400 font-bold mr-2">03 · Fix in Cursor</span>
                <span>点击 Bugbot 评论上的 Fix in Cursor，自动定位行号秒级修补。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
