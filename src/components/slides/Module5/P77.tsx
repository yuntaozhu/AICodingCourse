import Slide from "@/components/Slide";

export default function P77() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="2026 年独立开发者在 Cursor 中最实用的四大评估与防回归工具栈：终端自愈循环、Bugbot PR 审查、Playwright 视觉回归与 Cursor CLI 无头批量质检。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-bold text-white">
            Cursor 评估与防回归工具箱：<span className="text-gemini-purple">2026 实战标配</span>
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · TERMINAL LOOP</div>
              <h3 className="text-xl font-bold mb-2 text-white">Cursor Agent 自愈测试循环</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 Agent 每次改动后自动触发 <code className="text-white">vitest / tsc / eslint</code>，根据失败堆栈自动定位并迭代修复，免去人工来回贴报错。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · PR DIFF AUDIT</div>
              <h3 className="text-xl font-bold mb-2 text-white">Cursor Bugbot 自动审查</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                专门针对 Git Diff 的异步评审机器人，捕获隐蔽空指针、越权访问、N+1 查询与竞态隐患，并支持一键拉回本地修复。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · E2E VISION</div>
              <h3 className="text-xl font-bold mb-2 text-white">Playwright MCP 端到端断言</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                模拟真实用户在页面点击创建、支付、刷新验证，并拦截 Console Runtime Error 与移动端横向溢出。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">04 · HEADLESS CLI</div>
              <h3 className="text-xl font-bold mb-2 text-white">Cursor CLI &amp; CI 自动化门禁</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                在终端或 CI 脚本中无头调用 Cursor Agent 执行批量重构、规则一致性扫描与模型基准评测。
              </p>
            </div>
          </div>
          <div className="mt-6 text-right text-xs font-mono text-gemini-cyan">
            ↓ 向下查看 Bugbot 审查流与 Cursor CLI 质检脚本
          </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Bugbot Diff Review */}
      <Slide backgroundColor="#020205" notes="Bugbot 如何像资深架构师一样审查每一次功能分支提交。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-purple mb-2">PR QUALITY GUARD</div>
          <h3 className="text-3xl mb-6 font-bold text-white">Bugbot：每个 Pull Request 的 24 小时守门员</h3>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-white/10 font-mono text-xs text-slate-200 space-y-3">
              <div className="text-gemini-cyan"># Bugbot Review Comment on PR #42</div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-red-300 font-bold mb-1">[High] Missing Auth Check in POST /api/export</div>
                <div className="text-slate-300 text-[11px]">第 28 行导出接口未校验 workspaceId 归属，可能导致越权读取他人数据。</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-amber-300 font-bold mb-1">[Medium] useEffect Missing AbortController</div>
                <div className="text-slate-300 text-[11px]">快速切换筛选条件时旧请求晚返回会覆盖最新列表状态。</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-base font-bold mb-1.5 text-gemini-cyan">独立开发者为什么最需要 Bugbot？</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  单人写代码没有同事帮你 Code Review，最容易在熬夜赶工时漏掉鉴权或边界逻辑。Bugbot 在合入主干前充当你的“第二双眼睛”。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="text-base font-bold mb-1.5 text-gemini-purple">与 .cursor/rules 联动校验</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  当你把团队红线写进仓库规则后，Bugbot 与本地评审会自动对照规则条目给出针对性修复指令。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Vertical Slide 2: Cursor CLI & Regression Check */}
      <Slide backgroundColor="#020205" notes="结合 Cursor CLI 在命令行与 CI 中运行非交互式代码审计和基准评测。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">CURSOR CLI · AUTOMATED EVAL</div>
          <h3 className="text-3xl mb-6 font-bold text-white">Cursor CLI：把规则校验跑进终端与流水线</h3>
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/10 space-y-4">
            <pre className="text-xs font-mono text-gemini-cyan leading-relaxed whitespace-pre-wrap">{`# 在 CI 或本地终端用 Cursor CLI 无头检查最新改动是否满足 AGENTS.md 与安全红线
cursor-agent -p "对照 .cursor/rules/20-api-security.mdc 检查 git diff main，\\
若发现未鉴权路由或前端泄露 Key 请列出文件与行号，最后跑 npm run build 确认"

# 评测不同模型或规则配置下的修复通过率（配对固定回归数据集）
MODEL_BENCH="gemini-4-hydrogen" npm run eval:dod`}</pre>
            <div className="pt-4 border-t border-white/10 text-xs text-slate-300">
              通过“本地终端 DoD + PR 阶段 Bugbot + CI 无头 CLI”三层防线，独立开发者也能拥有大厂级别的交付稳定性。
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
