import Slide from "@/components/Slide";

export default function P93() {
  return (
    <Slide backgroundColor="#020205" notes="使用 Cursor Plan + .mdc + Bugbot 带来的真正 ROI 不是省几个打字动作，而是让单兵开发者和产品经理能够快速验证商业假设、稳健上线迭代。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-white">
          独立开发者的真实 ROI：上线速度 × 稳定性
        </h2>
        <div className="grid grid-cols-12 gap-8 items-center">
          <div className="col-span-7 space-y-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-1.5 text-gemini-cyan">产品验证速度（Time-to-Market）</h3>
              <p className="text-sm text-slate-300">
                借助 Figma MCP 与 Plan ➔ Agent 模式，周末两天就能上线带支付、鉴权与完整错误边界的可收费 MVP。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-1.5 text-gemini-purple">告别脆弱原型（Zero Rework）</h3>
              <p className="text-sm text-slate-300">
                <code className="text-white">.cursor/rules</code> + <code className="text-white">AGENTS.md</code> 让项目越迭代越稳，新增需求不会把上周写好的页面改崩。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-1.5 text-emerald-400">单人团队杠杆（1人 = 产研测全栈）</h3>
              <p className="text-sm text-slate-300">
                Background Agents 与 Bugbot 承接了测试补全与 PR 初审，让你把全部精力聚焦在用户痛点与产品增长上。
              </p>
            </div>
          </div>

          <div className="col-span-5 flex flex-col justify-center items-center p-8 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/25 text-center">
            <div className="text-7xl font-bold font-mono text-gemini-cyan tabular-nums mb-3">10X+</div>
            <div className="text-xs font-mono text-slate-300 uppercase tracking-widest mb-4">
              0-to-1 Launch Velocity
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              从“想法停留在原型图”到“真金白银接入线上用户”的跨度，被压缩到了个人可独自驾驭的尺度。
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
