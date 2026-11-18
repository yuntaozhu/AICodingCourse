import Slide from "@/components/Slide";

export default function P40() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="总结 Cursor 工程底座的三大核心支柱，并展示个人开发者效率演进的四级阶梯。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <h2 className="text-4xl mb-8 font-bold tracking-tight text-gemini-purple text-center">
            Cursor Agent 工程底座总结
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · CONTEXT &amp; RULES</div>
              <h3 className="text-lg mb-2 font-bold text-white">.mdc 规则 + AGENTS.md</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                把技术栈偏好、安全防线与 DoD 门禁固化进仓库，通过 globs 按路径精准注入上下文。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · MCP EXTENSIONS</div>
              <h3 className="text-lg mb-2 font-bold text-white">Figma / DB / Browser MCP</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                让 Agent 直读设计稿、数据库结构与浏览器实时渲染结果，用确定事实替代臆测。
              </p>
            </div>
            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/35">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · AGENTIC LOOP</div>
              <h3 className="text-lg mb-2 font-bold text-white">Plan ➔ Agent ➔ Verify</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                先出规格蓝图、人审后再改多文件、终端自动跑测自愈，形成可靠交付闭环。
              </p>
            </div>
          </div>
          <div className="mt-8 text-center text-xs font-mono text-gemini-purple">
            ↓ 向下查看 Cursor 能力演进四级阶梯
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: L1-L4 Evolution Path */}
      <Slide backgroundColor="#050505" notes="从 L1 Tab 补全到 L4 Background Agents & Bugbot 的四级跃迁。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-[11px] font-mono text-gemini-purple mb-2">CURSOR MATURITY LADDER</div>
          <h3 className="text-3xl mb-8 font-bold text-white">个人开发者的 Cursor 能力四级跃迁</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-slate-400 mb-2">L1 · TAB 预测</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Cursor Tab 连击</h4>
              <p className="text-xs text-slate-400 leading-relaxed">多行补全与跨位置跳转预测，省去重复样板敲击。</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">L2 · CMD+K 手术</div>
              <h4 className="font-bold text-sm text-white mb-1.5">行内局部重构</h4>
              <p className="text-xs text-slate-300 leading-relaxed">选中精确代码块快速改写类型、提取组件或补注释。</p>
            </div>
            <div className="p-5 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/35">
              <div className="text-xs font-mono text-gemini-cyan mb-2">L3 · PLAN + AGENT</div>
              <h4 className="font-bold text-sm text-white mb-1.5">端到端功能闭环</h4>
              <p className="text-xs text-slate-200 leading-relaxed">Plan 规划 + Rules 护栏 + MCP 联调 + 终端自动验收。</p>
            </div>
            <div className="p-5 bg-gemini-purple/15 rounded-2xl border border-gemini-purple/45">
              <div className="text-xs font-mono text-gemini-purple mb-2">L4 · ASYNC FACTORY</div>
              <h4 className="font-bold text-sm text-white mb-1.5">Background + Bugbot</h4>
              <p className="text-xs text-slate-200 leading-relaxed">云端异步代理并行推进需求，Bugbot 自动守卫 PR 质量。</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Grounded in AI Architecture Books */}
      <Slide
        backgroundColor="#040711"
        notes="衔接知识库中 O'Reilly《Building Applications with AI Agents》《Generative AI Design Patterns》与 arXiv:2408.08435，夯实多 Agent 架构原理。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            KNOWLEDGE BASE BACKING · 多智能体与设计模式底座
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            从书库理论到 Cursor 工程：三本必读架构基石
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">BUILDING APPS WITH AI AGENTS</div>
              <h4 className="text-base font-bold text-white mb-2">状态契约与工具沙盒</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                清晰定义多 Agent 间的监督者/路由器模式与只读-确认写隔离策略，直接对应 Cursor MCP 的安全分级权限设计。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">GENERATIVE AI DESIGN PATTERNS</div>
              <h4 className="text-base font-bold text-white mb-2">30+ 可复用生成式设计模式</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                把结构化输出、Context Caching、流式回退与语义护栏提炼进 <code className="text-white">.cursor/rules/*.mdc</code>，避免重复踩坑。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">ARXIV:2408.08435 · ADAS</div>
              <h4 className="text-base font-bold text-white mb-2">《Automated Design of Agentic Systems》</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                启发团队把不断迭代成功的排障与编码习惯沉淀成标准化 <code className="text-white">SKILL.md</code>，实现工作流的跨项目复用。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
