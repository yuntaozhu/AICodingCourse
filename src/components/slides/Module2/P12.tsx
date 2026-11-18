import Slide from "@/components/Slide";

export default function P12() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="在 Cursor 中理解全量代码库，核心是 @Codebase 索引 + 显式 @ 引用 + AGENTS.md；如需向外部评审分享整库快照，可配合 Repomix 导出。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            Cursor 上下文体系：@ 符号矩阵与仓库记忆
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-slate-200">
                过去我们要手动用 Repomix 打包文本再粘贴给网页聊天框；在 Cursor 中，代码库已通过 AST 实时索引，你可以随时按需精准挂载上下文。
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-cyan font-mono">@Codebase / @Folders / @Files</div>
                  <div className="text-xs text-slate-300 mt-0.5">从全局语义探索收敛到核心契约文件，消除跨文件遗漏。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-gemini-purple font-mono">@Docs / @Git / @Web</div>
                  <div className="text-xs text-slate-300 mt-0.5">挂载最新版库文档、对比 Git Diff 排查回归，拒绝 API 幻觉。</div>
                </div>
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="font-bold text-sm text-emerald-400 font-mono">AGENTS.md &amp; Notepads</div>
                  <div className="text-xs text-slate-300 mt-0.5">持久化目录规范与阶段性 PRD 草稿，跨对话秒级复用。</div>
                </div>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-gemini-purple/30 flex flex-col justify-between">
              <div className="text-[11px] font-mono text-gemini-purple mb-2">CURSOR CONTEXT COMMANDS</div>
              <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">{`# 1. 跨文件重构精准提问
@src/types/billing.ts @server/routes/stripe.ts
检查所有订阅状态流转，补充取消订阅宽限期逻辑

# 2. 对照近期改动排查 Bug (Debug Mode)
@Git (last 3 commits) @src/App.tsx
为什么刷新后状态重置？找出根因再给最小补丁

# 3. 外部大模型深度审计备选
npx repomix . --output snapshot.xml`}</pre>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-purple">
                ↓ 向下查看 .cursorignore 降噪与上下文黄金法则
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: .cursorignore Noise Filtering */}
      <Slide backgroundColor="#050505" notes="排除构建产物与日志噪音，是提升 Cursor @Codebase 召回准确率的第一步。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">CONTEXT HYGIENE</div>
          <h3 className="text-3xl mb-6 font-bold text-white">.cursorignore：屏蔽噪音，提升召回精度</h3>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                通过根目录配置 <code className="text-gemini-cyan px-1.5 py-0.5 bg-white/5 rounded">.cursorignore</code>，防止打包产物、缓存日志与敏感文件进入 Cursor 索引与模型上下文。
              </p>
              <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-bold mb-2.5 text-white text-sm">独立开发者必屏蔽清单</h4>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li>• dist/ .next/ build/（避免 AI 误改编译产物）</li>
                  <li>• *.lock / package-lock.json（数万行 Token 黑洞）</li>
                  <li>• .env / *.pem（防止敏感凭证进入外部上下文）</li>
                  <li>• public/assets/*.png / *.mp4（大体积静态资产）</li>
                </ul>
              </div>
            </div>
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-white/10 font-mono text-xs text-gemini-purple">
              <div className="text-[11px] text-slate-400 mb-2"># .cursorignore</div>
              <pre className="leading-relaxed">{`node_modules/
dist/
.next/
coverage/
*.log
package-lock.json
pnpm-lock.yaml
.env*
!.env.example`}</pre>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Context Best Practices */}
      <Slide backgroundColor="#050505" notes="保持长上下文清晰的三条工程习惯：小步单主题会话、契约先行、Rules 持久化。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">BEST PRACTICES</div>
          <h3 className="text-3xl mb-8 font-bold text-white">独立开发者的 Cursor 上下文三原则</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · ONE THREAD PER TASK</div>
              <h4 className="font-bold mb-2 text-base text-white">一功能开一个新对话</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                不要在同一个聊天框连续写 50 轮不相关需求。每完成一个里程碑提交 Git 后开新 Tab，防止旧报错污染注意力。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · CONTRACT FIRST</div>
              <h4 className="font-bold mb-2 text-base text-white">先喂类型再写实现</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                每次让 Agent 改后端或前端时，同时 <code className="text-white">@</code> 共享类型文件或数据库 Schema，100% 杜绝字段名漂移。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · RULES OVER REPETITION</div>
              <h4 className="font-bold mb-2 text-base text-white">反复提醒的话写进 .mdc</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                只要你在对话里纠正过 AI 两次（例如“别用 any”、“用 Zod 校验”），立刻沉淀到 <code className="text-white">.cursor/rules/</code>。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
