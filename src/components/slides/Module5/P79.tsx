import Slide from "@/components/Slide";

export default function P79() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="总结第五模块：在 Cursor 中用确定性验证环替代人工当 QA。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">模块 5 总结：Cursor 评估闭环</h2>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="text-gemini-purple font-mono font-bold">01</div>
                <p className="text-base text-slate-200">拒绝“AI 写完人当 QA”，用 DoD 命令让 Agent 在终端自检自修。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-gemini-purple font-mono font-bold">02</div>
                <p className="text-base text-slate-200">每次修完高频 Bug，就把它沉淀成 <code className="text-gemini-cyan">.cursor/rules</code> 的一条铁律。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-gemini-purple font-mono font-bold">03</div>
                <p className="text-base text-slate-200">用 Playwright MCP 做真实浏览器验证，消除手机端与交互状态盲区。</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex gap-4 items-start">
                <div className="text-gemini-cyan font-mono font-bold">04</div>
                <p className="text-base text-slate-200">把代码从“概率生成”推进到“确定性编译+单测+Build 全绿”。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-gemini-cyan font-mono font-bold">05</div>
                <p className="text-base text-slate-200">在 PR 阶段引入 Bugbot，自动兜底单人开发容易忽视的安全漏洞。</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-gemini-cyan font-mono font-bold">06</div>
                <p className="text-base text-slate-200">用 Cursor CLI 把局部规则检验扩展到自动化脚本与 CI 门禁。</p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-right text-xs font-mono text-gemini-cyan">
            ↓ 向下查看立即可用的落地清单
          </div>
        </div>
      </Slide>

      {/* Vertical Slide 1: Action Items */}
      <Slide backgroundColor="#020205">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h3 className="text-3xl mb-8 font-bold text-gemini-cyan">今日落地建议（个人项目 15 分钟生效）</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-4 text-gemini-purple">立刻做：建基线</h4>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li>• 在仓库根目录新建 <code className="text-white">AGENTS.md</code>，写清启动、类型检查与 Lint 命令。</li>
                <li>• 新建 <code className="text-white">.cursor/rules/30-dod.mdc</code>，强制 Agent 汇报前自检。</li>
                <li>• 记下最近 3 次让 AI 返工的原因，补入对应路径的 <code className="text-white">.mdc</code> 规则。</li>
              </ul>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-4 text-gemini-cyan">进阶做：建流水线</h4>
              <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <li>• 为核心页面配置 Playwright MCP 端到端冒烟验证。</li>
                <li>• 仓库开启 Bugbot，实现“推分支 ➔ 自动审查 ➔ Fix in Cursor”。</li>
                <li>• 尝试用 Background Agents 并行处理文档更新与测试补全。</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 p-4 bg-[#0b0f19] rounded-xl border border-white/15 text-xs text-slate-300 flex items-center justify-between gap-4">
            <span>
              <strong className="text-gemini-cyan">书库理论溯源：</strong>
              OpenAI Codex 论文 (<code className="text-white">arXiv:2107.03374</code>) 确立了“运行测试 pass@k 而非文本相似”的 DoD 标准；
              <code className="text-white">arXiv:2306.05685</code> 揭示了单模型自评偏见，需以独立新上下文 + 静态校验破除。
            </span>
          </div>
        </div>
      </Slide>
    </section>
  );
}
