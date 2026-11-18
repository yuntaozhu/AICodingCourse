import Slide from "@/components/Slide";

export default function P4() {
  return (
    <section>
      <Slide notes="Cursor 把上下文工程、跨模态输入、规则治理与多工具执行集成在同一工作台内，成为独立开发者的主力生产底座。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            Cursor 工作台：独立产品的四大工程支柱
          </h2>

          <div className="grid grid-cols-12 gap-4">
            {/* Main Feature */}
            <div className="col-span-8 bg-[#0b0f19] p-6 rounded-2xl border border-gemini-purple/35 flex flex-col justify-between min-h-[210px]">
              <div>
                <div className="text-[11px] font-mono text-gemini-purple mb-2 uppercase tracking-widest">
                  Context Engineering
                </div>
                <h3 className="text-3xl font-bold mb-2 text-white">
                  @Codebase 索引 + 精准 @ 上下文注入
                </h3>
                <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                  用局部语义索引搭配 <code className="text-gemini-cyan">@Files</code>、<code className="text-gemini-cyan">@Folders</code> 与 <code className="text-gemini-cyan">@Git</code> 精准喂给模型所需源码，再以 <code className="text-gemini-purple">.cursor/rules/*.mdc</code> 持久化项目规范。
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs font-mono tabular-nums">
                <div>
                  <div className="text-slate-400">快速行内改写</div>
                  <div className="text-gemini-cyan font-bold mt-0.5">Cmd+K &amp; Tab 连击</div>
                </div>
                <div>
                  <div className="text-slate-400">多文件自主执行</div>
                  <div className="text-gemini-purple font-bold mt-0.5">Plan ➔ Agent 模式</div>
                </div>
                <div>
                  <div className="text-slate-400">跨库规则记忆</div>
                  <div className="text-emerald-400 font-bold mt-0.5">.mdc + AGENTS.md</div>
                </div>
              </div>
            </div>

            {/* Multi-modal */}
            <div className="col-span-4 bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-2">MULTIMODAL + MCP</div>
                <h3 className="text-lg font-bold mb-2 text-white">设计稿与浏览器直连</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  直接把 UI 截图拖入对话框或接入 <strong className="text-white">Figma MCP</strong>，并用 <strong className="text-white">Playwright MCP</strong> 自动截图对比排查排版溢出。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-400">
                Figma ➔ React + Tailwind ➔ 浏览器自检
              </div>
            </div>

            {/* Spec-Driven */}
            <div className="col-span-4 bg-white/5 p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-amber-400 mb-2">PLAN FIRST</div>
                <h3 className="text-lg font-bold mb-2 text-white">Plan 模式先出蓝图</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  写代码前先让 Cursor 输出架构与接口方案并保存为 Markdown Spec，避免多文件修改偏离意图。
                </p>
              </div>
            </div>

            {/* Async & Bugbot */}
            <div className="col-span-8 bg-gemini-cyan/5 p-5 rounded-2xl border border-gemini-cyan/25 flex items-center justify-between gap-6">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-1">ASYNC &amp; GUARDRAILS</div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  用 <strong className="text-white">Background Agents</strong> 异步拆分支跑通功能与测试，再用 <strong className="text-white">Bugbot</strong> 自动扫描 PR Diff 的安全与性能隐患。
                </p>
              </div>
              <div className="shrink-0 text-right font-mono text-xs text-gemini-cyan tabular-nums">
                ↓ 快捷键 &amp; @ 指令速查
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Cursor Commands Cheatsheet & @ Context Matrix */}
      <Slide
        backgroundColor="#050814"
        notes="参考开源课程 ai-coding-with-cursor 整理的 Cursor 日常肌肉记忆快捷键、TODO 行内演进法与完整 @ 符号检索矩阵。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            CURSOR CHEATSHEET · 日常交互快捷键与 @ 上下文指令矩阵
          </div>
          <h3 className="text-3xl mb-5 font-bold text-white">
            从 Tab 预测到 <code className="text-gemini-purple">@Docs</code> 自定义文档的肌肉记忆清单
          </h3>
          <div className="grid grid-cols-12 gap-5 text-xs">
            <div className="col-span-6 p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-2.5">
              <div className="font-mono text-gemini-cyan text-[11px] uppercase tracking-wider">
                核心交互键位（Core &amp; Inline Edit）
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                  <span className="text-white font-semibold">Tab 连续预测</span>
                  <span className="text-slate-300 text-right">按注释 TODO 渐进补全函数体与下一个编辑点</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                  <span className="text-gemini-cyan font-semibold">⌘K / Ctrl+K</span>
                  <span className="text-slate-300 text-right">行内原地改写（配 # TODO 清单逐函升级校验）</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                  <span className="text-gemini-purple font-semibold">⌘L / ⌘Shift+L</span>
                  <span className="text-slate-300 text-right">切出 Chat 并把当前选中代码块精确挂载进对话</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                  <span className="text-emerald-400 font-semibold">⌘I / Composer</span>
                  <span className="text-slate-300 text-right">Agent 模式多文件创建；⌘Enter 接收 / ⌘Backspace 拒绝</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-amber-400 font-semibold">语音听写 Dictation</span>
                  <span className="text-slate-300 text-right">配合项目 .cursorrules 口述接口需求直出 FastAPI/UI</span>
                </div>
              </div>
            </div>

            <div className="col-span-6 p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35 space-y-2.5">
              <div className="font-mono text-gemini-purple text-[11px] uppercase tracking-wider">
                @ 符号上下文指令（Precision Context）
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gemini-cyan">@Files / @Folders</div>
                  <div className="text-slate-400 mt-0.5">显式锁定 Schema 与共享类型文件</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gemini-cyan">@Docs (Add new doc)</div>
                  <div className="text-slate-400 mt-0.5">抓取新版第三方 SDK 文档消除过时 API</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gemini-purple">@Terminals / @Linter</div>
                  <div className="text-slate-400 mt-0.5">直接引用终端报错与 TS Lint 红线</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gemini-purple">@Git / @Recent changes</div>
                  <div className="text-slate-400 mt-0.5">按当前 Diff 生成 Commit 与 PR 审查</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-emerald-400">@Cursor rules</div>
                  <div className="text-slate-400 mt-0.5">在对话中显式激活指定 .mdc 规范</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-amber-400">@Past chats / @Web</div>
                  <div className="text-slate-400 mt-0.5">跨会话复用历史决策或实时检索报错</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
