import Slide from "@/components/Slide";

export default function P84d() {
  return (
    <section>
      <Slide
        backgroundColor="#020205"
        notes="结合 easy-vibe Stage 3 GitHub Issues 驱动迭代与 Cursor Background Agents：当一个功能在 GitHub Issue 中立项，Cursor Background Agent 在云端沙盒拉取分支、按 Plan 编码并跑通 DoD 后自动提交 PR，最后由 Bugbot 审查交付。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            ISSUE-TO-PR LOOP · GITHUB + CURSOR BACKGROUND AGENTS
          </div>
          <h2 className="text-4xl mb-8 font-bold text-white">
            实战案例：GitHub Issues 驱动的多 Agent 异步闭环
          </h2>
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7 space-y-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base font-bold mb-2 text-gemini-cyan">独立产品迭代真实场景</h3>
                <ul className="text-xs space-y-2 text-slate-300 leading-relaxed">
                  <li>· <strong className="text-white">输入：</strong>写清验收标准 (DoD) 的 GitHub Issue（支持直接附带用户反馈截图）</li>
                  <li>· <strong className="text-white">执行：</strong>Cursor Background Agent + CLI 异步拉分支完成多文件实现并跑全量校验</li>
                  <li>· <strong className="text-white">守门：</strong>自动开 PR 触发 <strong className="text-white">Bugbot</strong> 审阅与 Playwright 回归截图</li>
                </ul>
              </div>
              <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35">
                <h3 className="text-sm font-bold mb-3 text-gemini-purple">全异步 4 步协同流水线</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-slate-200">
                    01. GitHub Issue
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-gemini-cyan">
                    02. Plan 拆解
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-gemini-purple">
                    03. 云端沙盒编码
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-emerald-400">
                    04. Bugbot + PR
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 flex flex-col justify-center items-center p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-5xl font-bold font-mono tabular-nums text-gemini-cyan mb-2">
                4x–10x
              </div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
                Async Parallel Throughput
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                “人类专注于定义高价值 Issue 与审查 PR 决策，琐碎的改码、跑测试与修类型全部退居云端异步完成。”
              </p>
              <div className="mt-4 text-[11px] font-mono text-gemini-cyan">
                ↓ 向下查看多小时长时任务“防过早停止”安全loop协议
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Long-Running Loop Guardrails from easy-vibe Stage 3 */}
      <Slide
        backgroundColor="#050814"
        notes="借鉴 easy-vibe Stage 3 long-running-tasks：运行无人值守 Coding 循环时，必须配齐迭代上限、测试客观门禁与 Git 回滚锚点，避免死循环烧 Token。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            LONG-RUNNING TASKS GUARDRAILS
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            长时自主编码三大安全护栏（Cursor CLI / 自动化脚本）
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · OBJECTIVE EXIT GATE</div>
              <h4 className="text-base font-bold mb-2 text-white">客观退出条件取代“感觉完成”</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                每轮结束由脚本执行 <code className="text-white">tsc</code> + <code className="text-white">vitest</code> + <code className="text-white">build</code>；只要任一命令返回非 0，就把错误堆栈重新注入下一轮修复，而非直接结束。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">02 · MAX ITERATIONS CAP</div>
              <h4 className="text-base font-bold mb-2 text-white">最大迭代次数与预算熔断</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                禁止无保护 <code className="text-white">while true</code>！必须设置单任务最多 5 轮自愈上限，连续卡死同一报错立即暂停并通知人类架构师介入。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · ATOMIC GIT CHECKPOINTS</div>
              <h4 className="text-base font-bold mb-2 text-white">每通过一个特性即提交快照</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                每勾完一项 <code className="text-white">feature_list.json</code> 立即做一次细粒度 Git Commit，确保任何时候改坏都能一键精确回到上一个绿灯状态。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
