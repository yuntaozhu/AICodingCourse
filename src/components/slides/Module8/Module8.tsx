import Slide from "@/components/Slide";
import { AI_BOOKS_KNOWLEDGE_BASE } from "@/data/aiBooksKnowledgeBase";
import { ArrowUpRight, BookOpen, Cpu, Layers, Plug, ShieldCheck } from "lucide-react";

function jumpToLab(labId: string) {
  window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId } }));
}

export default function Module8() {
  const bookCount = AI_BOOKS_KNOWLEDGE_BASE.length;
  return (
    <section>
      {/* Main Slide */}
      <Slide
        backgroundColor="#040711"
        notes={`第八模块聚焦 Cursor 全栈工作流工具箱直达入口、${bookCount} 册 AI 书库知识库备课助手，以及如何把 AI Studio 原型系统化迁移进 Cursor。`}
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
            Module 8 · Cursor 工具箱 · {bookCount} 册 AI 知识库 &amp; AI Studio 案例库
          </div>
          <h1 className="text-5xl mb-4 leading-tight text-white font-bold">
            Cursor 演练沙盘与{" "}
            <span className="text-gemini-purple">{bookCount} 册书库备课引擎</span>
          </h1>
          <p className="text-base font-mono text-gemini-cyan/85 mb-6 max-w-4xl">
            Plan/Agent · .cursor/rules (.mdc) · MCP 集成 · Bugbot 审查 · AI-pdf-books + arXiv + Vibe Handbook
          </p>
          <div className="h-1 w-24 bg-gemini-purple mb-6" />

          {/* 10 Quick Jump Cards for Interactive Labs (5x2 grid) */}
          <div className="grid grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => jumpToLab("plan-prompt")}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gemini-cyan/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-cyan mb-1">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> LAB 01
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">Plan ➔ Agent</div>
              <div className="text-[11px] text-slate-400">提示词 + DoD 装配</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("cursor-rules")}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-gemini-purple/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-purple mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> LAB 02
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">.mdc 规则引擎</div>
              <div className="text-[11px] text-slate-400">模拟 globs 路径命中</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("mcp-toolbox")}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
                <span className="flex items-center gap-1">
                  <Plug className="w-3.5 h-3.5" /> LAB 03
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">MCP 配置器</div>
              <div className="text-[11px] text-slate-400">Context7 / TaskMaster</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("bugbot-review")}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> LAB 04
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">Bugbot 评审台</div>
              <div className="text-[11px] text-slate-400">Sonar 规则 + AI 审查</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("book-kb")}
              className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/40 hover:border-gemini-cyan text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-cyan mb-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> LAB 05
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">{bookCount} 册书库备课</div>
              <div className="text-[11px] text-slate-200">AI 专著 + arXiv 合成</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("agent-harness")}
              className="p-3 rounded-xl bg-gemini-purple/10 border border-gemini-purple/40 hover:border-gemini-purple text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-purple mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> LAB 06
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">Agent Harness</div>
              <div className="text-[11px] text-slate-200">2603.05344 ACC 压缩</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("vibe-stack-map")}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/35 hover:border-emerald-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
                <span>LAB 07 · M9</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">Vibe 全栈图谱</div>
              <div className="text-[11px] text-slate-200">14 岗装配 + 报错解码</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("ui-inspiration")}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/35 hover:border-amber-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-amber-300 mb-1">
                <span>LAB 08 · M10</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">23 站 UI 审美库</div>
              <div className="text-[11px] text-slate-200">高信噪比视觉喂料台</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("efficiency-assessment")}
              className="p-3 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/35 hover:border-gemini-cyan text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-cyan mb-1">
                <span>LAB 09 · M7</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">AI 编码效能自测</div>
              <div className="text-[11px] text-slate-200">Sonar 7 Habits 成熟度处方</div>
            </button>

            <button
              type="button"
              onClick={() => jumpToLab("devops-ai-first")}
              className="p-3 rounded-xl bg-gemini-purple/10 border border-gemini-purple/35 hover:border-gemini-purple text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono text-gemini-purple mb-1">
                <span>LAB 10 · M6</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
              </div>
              <div className="text-sm text-white font-bold mb-0.5">DevOps vs AI-First</div>
              <div className="text-[11px] text-slate-200">D3.js 研发周期动态对比</div>
            </button>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            → 右滑直达 Lab 05 知识库、Lab 06 Agent Harness 推演台与 M9 / M10；↓ 向下查看 AI Studio 迁移 SOP
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: AI Studio -> Cursor Production Workflow */}
      <Slide
        backgroundColor="#050814"
        notes="最受独立开发者和产品经理欢迎的工作流：先在 Google AI Studio 分钟级验证视觉与核心 AI 能力，再导入 Cursor 补齐工程护栏、数据库、测试并上线。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">01. VIBE-TO-PRODUCTION WORKFLOW</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            黄金搭档：Google AI Studio 出原型 ➔ Cursor 工程化上线
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">STEP 01 · AI STUDIO</div>
              <h3 className="text-base font-bold text-white mb-2">分钟级验证创意原型</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 AI Studio 快速探索视觉风格、核心交互与 Gemini 多模态能力，确认产品方向是否成立。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">STEP 02 · CURSOR RULES</div>
              <h3 className="text-base font-bold text-white mb-2">注入 AGENTS.md 与 .mdc</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                将项目打开在 Cursor 中，用 <code className="text-white">AGENTS.md</code> 锁定目录规范、Tailwind 风格与服务端 API Key 红线。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">STEP 03 · PLAN + MCP</div>
              <h3 className="text-base font-bold text-white mb-2">补齐鉴权、DB 与边界态</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                用 Plan 模式对接真实 Postgres/Firebase、收口 Express <code className="text-white">/api/*</code>，并挂载 Playwright MCP 自检响应式。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-amber-400 mb-2">STEP 04 · BUGBOT + DEPLOY</div>
              <h3 className="text-base font-bold text-white mb-2">Bugbot 守门上线</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                提交分支由 Bugbot 自动扫描并发与注入风险，跑通 <code className="text-white">tsc</code> 与 <code className="text-white">build</code> 门禁后安全发布。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Ready-to-Import AI Studio Case Slots */}
      <Slide
        backgroundColor="#040711"
        notes="本课件自身就是 AI Studio 与 Cursor 工程方法论的最佳元案例；其余三个槽位可随时填入您的真实项目。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">02. AI STUDIO 实战案例矩阵</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Cursor × AI Studio 真实项目案例槽位
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/15">
              <div className="text-xs font-mono text-gemini-cyan mb-1">元案例（已落地） · 本 Web 课件系统</div>
              <h3 className="text-lg font-bold text-white mb-2">AI Native 课件系统：从 AI Studio 到服务端代理</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                真实示范了 Reveal 栈修复、字体排版防溢出、客户端 Gemini 迁移至 Express <code className="text-white">/api/review</code>（<code className="text-white">gemini-4-hydrogen</code>）与交互沙盘防按键冲突。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-gemini-cyan/40">
              <div className="text-xs font-mono text-gemini-cyan mb-1">案例槽位 B · 数据看板 / 专业分析工具</div>
              <h3 className="text-lg font-bold text-white mb-2">Cursor @Codebase + Tab 复杂状态重构</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                演示如何在 Cursor 中用 <code className="text-white">@Files</code> 同步共享类型，批量升级多图表面板与异步数据流而不产生状态竞态。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-gemini-purple/40">
              <div className="text-xs font-mono text-gemini-purple mb-1">案例槽位 C · 订阅制 SaaS 全栈产品</div>
              <h3 className="text-lg font-bold text-white mb-2">Plan 模式 SDD + 数据库与支付 MCP 实战</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                演示如何先用 Plan 模式锁定 Schema 与权限红线，再用 <code className="text-white">20-api-security.mdc</code> 与 Bugbot 零漏洞上线。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-emerald-400/40">
              <div className="text-xs font-mono text-emerald-400 mb-1">案例槽位 D · AI Agent 自动化效率产品</div>
              <h3 className="text-lg font-bold text-white mb-2">Background Agent + Playwright 端到端自愈</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                演示如何为工具类产品搭建 Playwright MCP 冒烟检查与 Background Agent 异步回归测试，实现一人高频迭代。
              </p>
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/25 text-xs text-slate-200">
            随时把您在 AI Studio 做的具体项目名称与功能发给我，可以直接填入 B / C / D 案例槽位；↓ 向下查看 <code className="text-white">datawhalechina/easy-vibe</code> 开源课程对比与融合图谱。
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: datawhalechina/easy-vibe Benchmark & Curriculum Fusion */}
      <Slide
        backgroundColor="#050814"
        notes="结合开源项目 datawhalechina/easy-vibe 进行全课程吸收与升级：保留其产品发现、排障、支付部署与 PRD 训练营体系，并补齐 Cursor 原生交互沙盘与规则工程。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            03. OPEN-SOURCE BENCHMARK · DATAWHALE/EASY-VIBE 课程融合图谱
          </div>
          <h2 className="text-3xl font-bold text-white mb-5">
            吸收 <code className="text-gemini-cyan">easy-vibe</code> 精髓 × 打造 Cursor 硬核实战版
          </h2>
          <div className="grid grid-cols-12 gap-5 items-stretch">
            <div className="col-span-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="text-xs font-mono text-gemini-purple">已吸纳并落地的 EASY-VIBE 四大长板</div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  · <strong className="text-white">Stage 1 产品前置验证：</strong>
                  双钻模型、JTBD、Mom Test 与三阶学习路径地图（已融入 M1 P3）
                </li>
                <li>
                  · <strong className="text-white">常见错误排障心法：</strong>
                  截图+Console/Network 喂料与安全回滚（已升级至 M3 P28）
                </li>
                <li>
                  · <strong className="text-white">0-to-Revenue 商业闭环：</strong>
                  Design-to-Code 三路径、Supabase RLS、Stripe 验签与零运维部署（M3 P25–P27）
                </li>
                <li>
                  · <strong className="text-white">Stage 3 长时自治与团队协作：</strong>
                  <code className="text-white">SKILL.md</code>、Contract-First 与 <code className="text-white">feature_list.json</code> 循环护栏（M4 P35 · M6 P84d）
                </li>
              </ul>
            </div>

            <div className="col-span-6 p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-3">
              <div className="text-xs font-mono text-gemini-cyan">本课件相比传统文档教程的四大独创增强</div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  · <strong className="text-white">内置 10 个可动手交互沙盘（Lab 01–10）：</strong>
                  不用切出课件，现场演练 Plan 提示词、Rules 命中、MCP JSON、Bugbot、{bookCount} 册书库备课、ACC 压缩、Vibe 14 岗图谱、23 站 UI 审美库、效能自测与 D3.js DevOps 对比仪表盘
                </li>
                <li>
                  · <strong className="text-white">真实 Bugbot 混合评审台：</strong>
                  离线秒扫硬编码密钥/竞态漏洞 + 服务端代理 Gemini 深度审计 Diff
                </li>
                <li>
                  · <strong className="text-white">AI Studio ➔ Cursor 生产迁移 SOP：</strong>
                  打通创意验证（AI Studio）与全栈工程化护栏（Cursor + Express/DB）的最后一公里
                </li>
                <li>
                  · <strong className="text-white">CS 基础附录精炼映射：</strong>
                  把 Git/CLI/端口、API 契约、鉴权与成本控制直接内嵌到每个对应模块而非堆砌在文末
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
