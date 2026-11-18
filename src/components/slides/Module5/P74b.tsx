import Slide from "@/components/Slide";

export default function P74b() {
  return (
    <Slide backgroundColor="#020205" notes="DoD 是独立开发者上线产品的质量红线。把 DoD 写进 .cursor/rules，就能强制 Cursor Agent 在收尾前自己跑完测试、类型检查与安全扫描。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
          DoD 完成定义：Cursor 交付的硬性质量红线
        </h2>
        <div className="grid grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-2 text-gemini-purple">什么是 Cursor 中的 DoD？</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                在传统开发里，DoD 常沦为口头清单；在 Cursor 中，DoD 是写进 <code className="text-gemini-cyan">.cursor/rules/30-dod.mdc</code> 与 <code className="text-white">AGENTS.md</code> 的<strong className="text-white">可执行退出条件</strong>。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-emerald-400 font-bold mb-1">01 · 类型编译绿灯</div>
                <div className="text-slate-300">tsc --noEmit 零报错</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-gemini-cyan font-bold mb-1">02 · 密钥与鉴权扫描</div>
                <div className="text-slate-300">无前端泄露 &amp; Zod 校验</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-gemini-purple font-bold mb-1">03 · UI 异常全覆盖</div>
                <div className="text-slate-300">Loading / Empty / Error</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-amber-400 font-bold mb-1">04 · 浏览器 E2E 冒烟</div>
                <div className="text-slate-300">桌面与手机零溢出</div>
              </div>
            </div>
          </div>

          <div className="p-7 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30 space-y-4">
            <h3 className="text-xl font-bold text-gemini-cyan">独立开发者的 DoD 收益</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">✔</span>
                <span><strong className="text-white">拒绝“半成品幻觉”：</strong>Agent 在宣布完成前必须自己证明代码能编能跑。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">✔</span>
                <span><strong className="text-white">降低产品经理审查门槛：</strong>不用人肉逐行读代码，先看终端绿灯与 Bugbot 报告。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">✔</span>
                <span><strong className="text-white">越用越稳的规则库：</strong>每次踩坑复盘都追加成一条新 DoD，下次绝不重犯。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
