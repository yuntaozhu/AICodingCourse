import Slide from "@/components/Slide";

export default function P5() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="传统手写 RAG 切片容易破坏代码结构。Cursor 通过本地 @Codebase 语义索引 + 精准 @Files/@Folders/@Git 组合长上下文与 KV Cache，实现高召回、低噪音的跨文件理解。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-gemini-cyan">
            RAG 的进化：Cursor 精准上下文与全量推理
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <div className="text-[11px] font-mono text-red-400 mb-2">LEGACY CHUNKED RAG</div>
              <h3 className="text-xl mb-4 text-red-400 font-bold">传统自建 RAG 的痛点</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-mono">✘</span>
                  <span>固定长度切片强行割裂函数、类型契约与组件状态流。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-mono">✘</span>
                  <span>Top-K 仅召回只言片语，漏掉关键路由注册或鉴权中间件。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-mono">✘</span>
                  <span>向量库同步滞后，代码刚重构就检索出过期片段。</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gemini-cyan/5 border border-gemini-cyan/25 rounded-2xl relative">
              <div className="text-[11px] font-mono text-gemini-cyan mb-2">CURSOR CONTEXT ENGINE</div>
              <h3 className="text-xl mb-4 text-gemini-cyan font-bold">Cursor 分层上下文工程</h3>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan font-mono">✔</span>
                  <span>
                    <strong className="text-white">AST 感知索引 (@Codebase)：</strong>按语法树分块并实时追踪 Git 变更，先定位再读取完整文件。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan font-mono">✔</span>
                  <span>
                    <strong className="text-white">显式锚定 (@Files / @Folders / @Git)：</strong>人类用 <code className="text-gemini-cyan">@</code> 直接锁定源头契约文件。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gemini-cyan font-mono">✔</span>
                  <span>
                    <strong className="text-white">规则常驻 (.cursor/rules)：</strong>架构约束自动注入，无需每次重复口述。
                  </span>
                </li>
              </ul>
              <div className="mt-4 text-right text-[11px] font-mono text-gemini-cyan">
                ↓ 向下查看原理与独立 SaaS 重构案例
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Why Naive RAG Fails */}
      <Slide backgroundColor="#050505" notes="代码是强依赖图结构，盲目切片会丢掉长程类型与调用约束。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">TECHNICAL ANALYSIS 01</div>
          <h3 className="text-3xl mb-6 font-bold text-white">为什么“纯切片 RAG”在写代码时容易翻车？</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · BROKEN AST</div>
              <h4 className="font-bold mb-2 text-base text-white">逻辑块语义断裂</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                一个 React 表单组件横跨 Props 类型、Zod 校验与提交回调，按行数切片后 AI 看不到完整状态约束。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · MISSING LINKS</div>
              <h4 className="font-bold mb-2 text-base text-white">跨端接口脱节</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                前端请求与后端路由、数据库 Schema 分处不同目录，单纯向量检索很难同时完整召回三端契约。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">03 · STALE CACHE</div>
              <h4 className="font-bold mb-2 text-base text-white">上下文噪音污染</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                未排除 <code className="text-white">dist/</code> 与构建产物时，AI 会被重复打包代码干扰，产生同名文件改错的幻觉。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: What Cursor Uses Instead */}
      <Slide backgroundColor="#050505" notes="Cursor 结合本地 AST 语义检索、精确符号引用与 Prompt KV Cache，兼顾召回率与低成本。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">THE CURSOR APPROACH</div>
          <h3 className="text-3xl mb-6 font-bold text-white">不用传统手写 RAG，Cursor 用什么？</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-cyan font-bold text-lg mb-3">1. 多跳工具检索 + 整文件精读</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Cursor Agent 先用 <code className="text-gemini-cyan">ripgrep</code> 与语义索引定位符号位置，再整段读取完整文件与关联类型定义，配合 Prompt Caching 复用前缀 KV Cache，既保证上下文完整又压低响应延迟。
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-gemini-cyan">
                <span className="px-2 py-1 bg-gemini-cyan/10 rounded">Grep / @Codebase 定位</span>
                <span>➔</span>
                <span className="px-2 py-1 bg-gemini-cyan/10 rounded">整文件读取 + KV Cache</span>
              </div>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-gemini-purple font-bold text-lg mb-3">2. 人类显式 @ 锚定 + .cursorignore</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                独立开发者不必把整个项目硬塞进每轮对话：通过 <code className="text-gemini-purple">@shared/types.ts</code> 与 <code className="text-gemini-purple">@server/routes</code> 精准指定事实源，并用 <code className="text-gemini-purple">.cursorignore</code> 屏蔽产物噪音。
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-gemini-purple">
                <span className="px-2 py-1 bg-gemini-purple/10 rounded">@Files 显式事实源</span>
                <span>➔</span>
                <span className="px-2 py-1 bg-gemini-purple/10 rounded">.cursor/rules 自动挂载</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Case Study - Indie SaaS Pricing & Billing Refactor */}
      <Slide backgroundColor="#050505" notes="真实案例：独立开发者在 Cursor 中跨端升级 SaaS 订阅计费体系。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-cyan mb-2">CURSOR CASE STUDY</div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            案例：SaaS 产品“按量计费”跨端重构（零漏改）
          </h3>
          <div className="p-6 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/25">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs font-mono text-gemini-cyan mb-2">Step 1 · 锁定契约</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  在 <code className="text-white">Cmd+I</code> 中输入 <code className="text-gemini-cyan">@shared/plan.ts @server/stripe.ts @Pricing.tsx</code>，让 Cursor 一次性读入前后端共享类型。
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs font-mono text-gemini-purple mb-2">Step 2 · 影响面排查</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Agent 结合 <code className="text-white">@Codebase</code> 自动扫出 7 处引用旧版 <code className="text-white">planTier</code> 枚举的页面、Webhook 与权限校验中间件。
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs font-mono text-emerald-400 mb-2">Step 3 · 同步改写+编译</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  多文件并行修改后，Agent 自动在终端运行 <code className="text-white">npx tsc --noEmit</code> 与单测验证全部调用方零报错。
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                对比传统切片 RAG：再也不会出现“前端改了字段、后端 Webhook 还在读旧字段”的线上事故。
              </span>
              <span className="font-mono font-bold text-gemini-cyan tabular-nums">
                7 处跨端调用 1 次同步齐备
              </span>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
