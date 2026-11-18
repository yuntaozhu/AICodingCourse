import Slide from "@/components/Slide";
import TradeoffSteeringSandbox from "@/components/sandboxes/TradeoffSteeringSandbox";

export default function P2b() {
  return (
    <section>
      {/* Main Slide: Why Software Engineering Fundamentals Matter More in Agentic Coding */}
      <Slide
        backgroundColor="#040711"
        notes="吸纳《How have software engineering fundamentals changed with agentic coding?》核心洞见：背诵语法正在过时，但软件工程底层内功决定了你能否发现并驾驶 Agent 做出正确的 7 维系统权衡，以及设计好供 AI 自身读取的数据基础设施。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            AI Engineering Skills · Agent 时代的软件工程基本功重构
          </div>
          <h2 className="text-4xl mb-5 font-bold tracking-tight text-white">
            语法记忆已过时，但<span className="text-gemini-purple">五大工程内功</span>决定上限
          </h2>

          <div className="grid grid-cols-12 gap-5 items-stretch text-xs mb-4">
            {/* Left: The 7 Tradeoffs & Core Thesis */}
            <div className="col-span-5 p-5 rounded-2xl bg-[#0b0f19] border border-white/15 flex flex-col justify-between gap-3">
              <div className="space-y-2.5">
                <div className="text-sm font-bold text-white">
                  为什么“盲目 Vibe Coding”跑出简单 Demo 后必然撞墙？
                </div>
                <p className="text-slate-300 leading-relaxed">
                  即便全部代码由 Coding Agent 执笔，如果开发者自身不理解软件原理，就根本<strong className="text-white">不知道存在哪些工程权衡</strong>，从而无法驾驶 Agent 为业务做出正确取舍。
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 space-y-1">
                  <div className="font-semibold text-amber-300">Agent 最易悄然踩错的 7 维系统权衡</div>
                  <div className="font-mono text-[11px] text-slate-200 leading-relaxed">
                    延迟 (Latency) · 可用性 (Availability) · 一致性 (Consistency) · 可靠性 (Reliability) · 可维护性 (Maintainability) · 简洁性 (Simplicity) · 成本 (Cost)
                  </div>
                </div>
              </div>
              <div className="pt-2.5 border-t border-white/10 text-slate-300 leading-relaxed">
                <strong className="text-gemini-cyan">双倍杠杆效应：</strong>AI 核心往往依托于完整软件应用对外交付；懂软件基本功，也能帮你精准界定「软件能做什么、不能做什么」。
              </div>
            </div>

            {/* Right: 5 Pillars Overview */}
            <div className="col-span-7 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-gemini-cyan">01. 全栈系统构建（Full-Stack）</div>
                <p className="text-slate-300 leading-relaxed">
                  专才得以借 Agent 跨入全栈，但仍需理解 UI、缓存、渲染、API 设计、Auth、状态会话、异步处理、测试、安全与无障碍。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-gemini-purple">02. 数据管理与 Agent 数据基建</div>
                <p className="text-slate-300 leading-relaxed">
                  数据地基极难修改：按访问模式选关系/文档/KV/图库，管好事务、新鲜度与隐私；更关键的是——<strong className="text-white">AI 系统的上下文输入就取自你的数据源</strong>。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-emerald-400">03. 动态演进架构（Architecture）</div>
                <p className="text-slate-300 leading-relaxed">
                  权衡并发与成本、前后端边界、单体 vs 微服务与技术栈实验；记住<strong className="text-white">正确架构是移动靶心</strong>（原型 ≠ 首版生产 ≠ 规模化）。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="font-bold text-amber-300">04. 安全左移与系统韧性</div>
                <p className="text-slate-300 leading-relaxed">
                  设计单元/集成测试配比、限流降级与<strong className="text-white">最小爆炸半径</strong>；每位开发者如今都是半个安全工程师，用 AI 查漏洞、供应链投毒与云攻击面。
                </p>
              </div>

              <div className="col-span-2 p-3.5 rounded-2xl bg-white/5 border border-gemini-cyan/30 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-white mb-0.5">05. 生产部署、可观测性与扩展治理（Scaling &amp; Ops）</div>
                  <p className="text-slate-300 leading-relaxed">
                    完整 SDLC（环境 / 发布策略 / CI/CD / IaaS）、可观测告警与事故响应、负载扩展（分片 / 索引 / 副本）以及 Git / Code Review / 依赖与技术债治理。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-gemini-cyan">
            <span>↓ 向下交互演练：五大支柱 × Cursor 七维权衡驾驶指令</span>
            <span className="text-slate-400">→ 接着在 P3 看超级单兵架构师三大实战抓手</span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Interactive 5-Pillar Tradeoff Steering Matrix */}
      <Slide
        backgroundColor="#02050e"
        notes="交互式权衡驾驶台：点击五大软件工程核心支柱，对比盲目 Vibe Coder 常见失控现场 vs 架构师驾驶 Cursor Plan 的精确约束提示词。"
      >
        <div className="flex flex-col justify-center h-full">
          <TradeoffSteeringSandbox />
        </div>
      </Slide>
    </section>
  );
}
