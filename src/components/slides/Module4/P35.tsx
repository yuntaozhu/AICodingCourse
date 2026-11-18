import Slide from "@/components/Slide";

export default function P35() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="融合 easy-vibe Agent Teams 最佳实践与 Cursor Subagents/Background Agents：多智能体高效协同的秘密不是人海战术，而是 Contract-First（契约先行）与文件边界隔离。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            MULTI-AGENT ORCHESTRATION · 契约先行与文件隔离
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white text-center">
            Agent 协作团队：<span className="text-gemini-cyan">Easy-Vibe 契约先行最佳实践</span>
          </h2>
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-cyan">Single Agent vs Agent Teams 怎么选？</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  单文件改动或线性任务直接用主 Cursor Agent 即可；只有当任务可拆成互不重叠的模块（如前端 UI、后端 API、独立测试集）且需要“先研究后并行实现”时，才启用多 Agent / 多 Worktree 并行。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-purple">避免自相矛盾的三大铁律</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Contract-First（契约先行）</strong>、每个 Agent 只拥有明确目录写权限（<strong className="text-white">避免文件冲突</strong>），以及先用只读模式完成调研再开改代码。
                </p>
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-white/15 rounded-2xl p-5 flex flex-col justify-between font-mono text-xs text-slate-200">
              <div>
                <div className="text-gemini-cyan mb-2">SKILL.MD + WORKTREE PARALLEL PATTERN</div>
                <pre className="whitespace-pre-wrap leading-relaxed">{`1. [Lead / Plan Mode] 锁定 shared/types.ts 与 OpenAPI 契约
2. [Agent A · Worktree-1] 仅修改 src/components/** 还原界面
3. [Agent B · Worktree-2] 仅修改 server/routes/** 实现接口
4. [Reviewer / Bugbot] 汇总 Diff，检查越界修改与 DoD 绿灯`}</pre>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 text-right">
                ↓ 向下查看角色分工矩阵与 SKILL.md 技能沉淀规范
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Role-Based Collaboration */}
      <Slide backgroundColor="#050814" notes="生成与审查分离，用独立视角消除单一模型的自我确认偏见。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">SEPARATION OF CONCERNS</div>
          <h3 className="text-3xl mb-6 font-bold text-white">角色化分工：生成、测试与审查相互制衡</h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · ARCHITECT AGENT</div>
              <h4 className="text-base font-bold mb-2 text-white">Plan 模式调研与定契约</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                先扫描仓库与外部文档，输出共享类型定义、接口入参出参与文件边界分配，作为并行编码的唯一契约源。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · BUILDER AGENTS</div>
              <h4 className="text-base font-bold mb-2 text-white">Git Worktree 隔离实施</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                前端、后端或自动化脚本各自在独立 Git Worktree 中按 <code className="text-white">SKILL.md</code> 工作流执行，互不覆盖文件锁。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · REVIEWER &amp; BUGBOT</div>
              <h4 className="text-base font-bold mb-2 text-white">全新上下文独立验货</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                不带“生成过程滤镜”，在干净上下文里核对 <code className="text-white">git diff</code>、运行 <code className="text-white">tsc</code>/测试并排查安全隐患。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: SKILL.md + Reusable Workflows */}
      <Slide backgroundColor="#050814" notes="参考 easy-vibe Stage 3：把一次性巧合成功的做法沉淀为可移植的 SKILL.md。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">SKILL.MD PORTABLE CAPABILITY</div>
          <h3 className="text-3xl mb-6 font-bold text-white">从“写死提示词”升级为可复用 SKILL.md 技能包</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-base font-bold mb-2 text-gemini-cyan">Rules (.mdc) vs Skills (SKILL.md)</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">.cursor/rules (.mdc)</strong> 负责常驻架构底线与文件触发守卫；<strong className="text-white">SKILL.md</strong> 负责按需触发的专项SOP（例如“上线前 SEO 与元数据巡检”“Stripe Webhook 联调技能”）。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-base font-bold mb-2 text-gemini-purple">一次打磨，跨项目随插随用</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                把排查过的标准步骤、脚本与边界清单封装成技能包目录，你的下一个 AI Studio ➔ Cursor 独立项目只需引入该技能即可瞬间获得同等工程水准。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
