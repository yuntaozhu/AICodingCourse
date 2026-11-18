import Slide from "@/components/Slide";

export default function P9() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="一个人如何像一支完整产研团队一样工作？在 Cursor 中，你可以通过切换不同模式与后台代理，串联起产品架构、全栈开发、异步测试与自动 Code Review。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            Agentic Workflow：一人运转 Cursor“虚拟研发团队”
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-slate-200">
                独立开发者不必等待前端、后端、测试排期。Cursor 内置的四种协同角色，让你一个人掌控完整产品交付链。
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-cyan">1. 架构师角色：Plan Mode (Shift+Tab)</div>
                  <div className="text-xs text-slate-300">拆解需求边界、输出 SDD 蓝图与多文件修改计划。</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-purple">2. 全栈执行角色：Foreground Agent</div>
                  <div className="text-xs text-slate-300">跨前后端写码、调用 Figma/DB MCP 并实时跑通本地开发服务器。</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-emerald-400">3. 异步加班角色：Background Agents &amp; Bugbot</div>
                  <div className="text-xs text-slate-300">云端开分支补齐单测/修 Issue，提交 PR 后由 Bugbot 自动逐行审查。</div>
                </div>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/35">
              <div className="text-[11px] font-mono text-gemini-purple mb-2">SOLO BUILDER AGENT TOPOLOGY</div>
              <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">{`Human (PM / 意图决策者)
  ├──▶ [Plan Mode]      输出需求 Spec 与接口契约
  ├──▶ [Agent + MCP]    生成页面、API、迁移脚本
  ├──▶ [Background]     异步分支补齐 E2E 与文档
  └──▶ [Bugbot PR]      扫描漏洞/N+1 -> 一键 Fix in Cursor`}</pre>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-purple">
                ↓ 向下查看独立产品团队落地协同案例
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Case Study - Indie Builder Shipping Feature */}
      <Slide backgroundColor="#050505" notes="实战案例：用 Cursor 四角色在一天内上线完整的 AI 文档分享与权限功能。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">CASE STUDY · 0-TO-1 FEATURE LAUNCH</div>
          <h3 className="text-3xl mb-6 font-bold text-white">案例：1 天上线“付费文档分享与水印权限”</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">Stage 1 · 15 min</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Plan 模式定 Spec</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 <code className="text-white">Cmd+I</code> 切换到 Plan，用 <code className="text-white">@db/schema.ts</code> 产出公开链接 Token 与访问次数限制方案。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">Stage 2 · 45 min</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Agent 并行开发</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                结合 <code className="text-white">Figma MCP</code> 做出分享弹窗，同步生成后端权限校验与过期清理接口。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">Stage 3 · 异步后台</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Background Agent 补测</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                把“补全过期链接 403 边界测试与移动端分享页”派发给后台 Agent 异步跑通并提 PR。
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">Stage 4 · 5 min</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Bugbot 终审上线</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bugbot 捕获到“分享 Token 未做速率限制”，点击 <strong className="text-white">Fix in Cursor</strong> 一键补上中间件合并发布。
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gemini-cyan/5 rounded-xl border border-gemini-cyan/25 text-xs text-slate-200 flex items-center justify-between">
            <span>关键秘诀：不同职责隔离在不同会话（Chat Tab）或分支中，防止单个上下文窗口塞满过时尝试。</span>
            <span className="font-mono text-gemini-cyan font-bold">一功能一线程</span>
          </div>
        </div>
      </Slide>
    </section>
  );
}
