import Slide from "@/components/Slide";

export default function P85b() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="依赖升级不再需要人肉试错：通过 Background Agent + Cursor CLI + Playwright MCP，自动更新版本、修复 Breaking Changes 并跑通 E2E 回归后提 PR。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
            异步依赖升级：Background Agent + CLI 零风险演进
          </h2>

          <div className="grid grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <h3 className="text-lg font-bold text-gemini-purple">Cursor 自动化升级闭环</h3>
                <div className="space-y-2.5 text-sm text-slate-200">
                  <div>1. <strong className="text-white">检测过期包：</strong>CI 定时任务检测到安全漏洞或大版本升级。</div>
                  <div>2. <strong className="text-white">Cursor CLI / Background Agent：</strong>开新分支更新依赖并对照官方文档修复 Breaking Changes。</div>
                  <div>3. <strong className="text-white">E2E 验证：</strong>自动触发 <code className="text-gemini-cyan">Playwright MCP</code> 验证核心支付与表单页面无异常。</div>
                </div>
              </div>

              <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/30">
                <div className="text-[11px] font-mono text-gemini-cyan mb-2 uppercase tracking-wider">
                  CI Headless Cursor CLI Example
                </div>
                <pre className="text-xs leading-relaxed font-mono text-slate-300 whitespace-pre-wrap">{`cursor-agent -p "升级过期安全依赖，对照 @AGENTS.md 运行 \\
npx tsc --noEmit && npm run build 与 Playwright 冒烟检查，\\
全绿灯后自动开启 Pull Request"`}</pre>
              </div>
            </div>

            <div className="bg-[#0b0f19] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="bg-white/10 px-4 py-2.5 flex items-center gap-2">
                <div className="px-2 py-0.5 bg-gemini-purple/20 text-gemini-purple rounded text-[11px] font-mono">
                  PR #135
                </div>
                <div className="text-[11px] text-slate-300 font-mono truncate">
                  chore(deps): upgrade sdk &amp; verify Playwright smoke tests
                </div>
              </div>
              <div className="p-5 font-mono text-xs space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-slate-400">Bugbot &amp; DoD Status</span>
                  <span className="text-emerald-400 font-bold">ALL CHECKS PASS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Background Agent 已自动调整配置并完成回归校验：TypeScript 0 报错、Bundle 编译通过、3 个核心路由在 375px 与 1280px 视口均无 Console 异常。
                </p>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-[11px]">
                  <div className="text-gemini-purple uppercase tracking-wider">Playwright MCP Report</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Landing &amp; Pricing</span>
                    <span className="text-emerald-400">PASS</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Checkout &amp; Auth Flow</span>
                    <span className="text-emerald-400">PASS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>
              <strong className="text-gemini-purple">安全论文依据：</strong>
              Anthropic《Sleeper Agents》(<code className="text-white">2401.05566</code>) 与《Code Comprehension then Auditing》(<code className="text-white">2410.03131</code>) + OPENDEV (<code className="text-white">2603.05344</code>)
            </span>
            <span className="font-mono text-gemini-cyan shrink-0">↓ 终端 Agent 四重安全闸门</span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Terminal Coding Agent Safety Harness (arXiv:2603.05344) */}
      <Slide
        backgroundColor="#040711"
        notes="吸纳 arXiv:2603.05344 第 2.4 与第 3.3 节：CLI 自主 Agent 的安全性不能只靠 Prompt，必须靠 Schema Gating、进程级沙盒与 Shadow Git。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            ARXIV:2603.05344 · SAFETY THROUGH ARCHITECTURAL CONSTRAINTS
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            终端自主 Agent 四重架构级护栏（CLI 与 Background Agent 铁律）
          </h3>
          <div className="grid grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-gemini-cyan mb-1.5">01 · SCHEMA GATING（隐身而非口头拦阻）</div>
              <p className="text-slate-300 leading-relaxed">
                在 Plan / 审计阶段从模型可用工具列表中物理移除写工具与 Shell 执行权；模型看不见工具，就无法“说服自己”绕过权限边界。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-gemini-purple mb-1.5">02 · 6 阶进程沙盒与 30k 截断</div>
              <p className="text-slate-300 leading-relaxed">
                CLI 执行经过危险模式硬拦截、自动识别 16 类长驻 Dev Server 转入后台 PTY、输出头尾 30k 字符截断及 60s 空闲超时控制，防终端卡死与预算爆炸。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-emerald-400 mb-1.5">03 · 3-NUDGE CONTEXT ERROR RECOVERY</div>
              <p className="text-slate-300 leading-relaxed">
                把权限、找不到文件、编辑失配等 6 类报错匹配模板在决策前注入；连续 3 次未修复立即中止死循环，退回人类决策或切换 Cursor Plan 模式。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-amber-400 mb-1.5">04 · SHADOW GIT SNAPSHOT &amp; DOOM-LOOP</div>
              <p className="text-slate-300 leading-relaxed">
                每次文件改动留存影子 Git 快照可秒级 Undo，并用最近 20 次操作指纹队列捕获重复无效改错（Doom-Loop）及时熔断。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: 3-Layer Secret & CI Security Gate (jpke/cursor-vibe-coding-template) */}
      <Slide
        backgroundColor="#050814"
        notes="吸纳 jpke/cursor-vibe-coding-template 的三层防泄露安全流水线与 workflow.mdc 工程纪律：本地 pre-commit Gitleaks、CI 端 TruffleHog + 五语言 CodeQL，以及禁用分页器与强制 PR 合入流程。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            3-LAYER SECRET &amp; SAST PIPELINE · GITLEAKS × TRUFFLEHOG × CODEQL
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            Vibe Coding 防泄密三道闸门 × 特性分支标准合入闭环
          </h3>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-3">
              <div className="font-mono text-emerald-400">
                01 · 本地 + CI 三层密钥与静态审计防线
              </div>
              <div className="space-y-2 text-slate-300 leading-relaxed">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">Layer 1 · 本地 pre-commit 拦截：</strong>通过 <code className="text-gemini-cyan">./scripts/setup-security-hooks.sh</code> 安装 <code className="text-white">.pre-commit-config.yaml</code> + <code className="text-white">.gitleaks.toml</code>（白名单放行 <code className="text-white">*.env.example</code>），在 <code className="text-white">git commit</code> 前物理拦截 API Key。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">Layer 2 · CI 深度历史扫描：</strong><code className="text-white">security-scan.yml</code> 在每次 Push / PR 并行跑通 <strong className="text-white">Gitleaks</strong> 全提交史审计与 <strong className="text-white">TruffleHog (--only-verified)</strong> 活体密钥验证。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">Layer 3 · 5 语言 CodeQL SAST：</strong>自动覆盖 <span className="font-mono text-gemini-cyan">JS/TS · Python · Go · Swift</span> 语义级漏洞探测与周度定时巡检。
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35 space-y-3">
              <div className="font-mono text-gemini-purple">
                02 · workflow.mdc：Agent 分支交付与终端防挂死
              </div>
              <p className="text-slate-300 leading-relaxed">
                模板通过 <code className="text-white">workflow.mdc</code> 固化 Agent 操作 Git 与终端的硬约束，防止主干污染与命令行卡死：
              </p>
              <pre className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">{`export PAGER=""                  # 禁止 less 分页器卡死 Agent 终端
git checkout -b feature/auth-ui  # 严禁直推 main，按前缀隔离开发
# ... 修改、测试、pre-commit 绿灯 ...
gh pr create --fill              # 创建 PR 对照验收，随后切回 main`}</pre>
              <div className="text-[11px] text-slate-400">
                配套 <code className="text-white">development.mdc</code> 要求 UI 原型 HTML 先行、样式统一收口 <code className="text-white">design.json</code>、测试产物统一落盘 <code className="text-white">tests_output/</code>。
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
