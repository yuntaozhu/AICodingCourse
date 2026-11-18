import { useState } from "react";
import { Compass, AlertTriangle, ShieldCheck } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface EngineeringPillar {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  tradeoffs: string[];
  blindSpot: string;
  architectSteering: string;
  keyChecklist: string[];
  steeringPrompt: string;
  courseMapping: string;
}

const PILLARS: EngineeringPillar[] = [
  {
    id: "fullstack",
    index: "01",
    title: "全栈系统构建能力（Building Full-Stack Applications）",
    shortTitle: "全栈构建能力",
    tradeoffs: ["Latency 延迟", "Maintainability 可维护性", "Simplicity 简洁性"],
    blindSpot:
      "以前端或移动端专长身份直接全权托管 Agent 生成后端，却不知道渲染策略、缓存、鉴权与状态归属该如何划分，导致页面卡顿、会话串号且首屏逻辑与服务端耦合混乱。",
    architectSteering:
      "Coding Agent 帮你补齐不熟悉领域的写法，但你必须清楚全栈核心拼图如何咬合，明确要求 Agent 按职责拆分前后端与异步任务。",
    keyChecklist: [
      "前端：UI 组件拆分、页面渲染模式（SSR vs SPA）、无障碍 Accessibility",
      "中间层：API 风格与契约设计、浏览器/服务端缓存（Caching）、状态与会话管理",
      "后端与测试：身份认证 Auth、异步队列处理、数据持久化与自动化测试边界",
    ],
    steeringPrompt: `[Plan Mode] 在实现该全栈功能前，请先锁定以下工程权衡：
1. 页面渲染与缓存：首屏数据采用服务端预取还是客户端按需缓存？标出失效策略。
2. 状态与会话：哪些状态保留在 URL/客户端，哪些鉴权状态必须收口服务端 Session？
3. 异步边界：耗时超过 500ms 的任务必须拆为异步作业并给出前端轮询/进度态。`,
    courseMapping: "对应实战：M3 全栈演练 · M9 全栈图谱",
  },
  {
    id: "data",
    index: "02",
    title: "数据管理与 Agent 数据基建（Managing Data）",
    shortTitle: "数据与 Agent 基建",
    tradeoffs: ["Consistency 一致性", "Reliability 可靠性", "Cost 成本", "Latency 延迟"],
    blindSpot:
      "把“跑通 Demo”当成终点，任由 Agent 随便建几张宽表；上线后才发现访问模式不匹配、并发写覆盖、缺保留期清理，更致命的是——AI 应用自身的上下文就来自你的数据源（表设计错，AI 根本不知道自己不知道什么）。",
    architectSteering:
      "数据是软件最难重构的地基（即便有 Agent 协助迁移）。必须基于真实访问模式选型存储引擎，设计事务并发、生命周期与隐私合规，并持续演进专门服务 Agent 的数据基础设施。",
    keyChecklist: [
      "存储选型：按访问模式匹配关系表（Relational）/ 文档 / KV 缓存 / 图数据库",
      "数据完整性：事务（Transactions）、并发锁、数据清洗（Clean）、新鲜度（Freshness）",
      "治理与 AI 赋能：隐私合规保留周期 + 面向 Agent 检索的高信噪比数据源建模",
    ],
    steeringPrompt: `[Plan Mode] @src/db/schema.ts 审查数据层架构决策：
1. 根据高频读写比例说明为何选择关系表 / 文档 / KV（或混合索引），给出预期 QPS 与延迟预算。
2. 标出核心写路径上的事务边界与并发防重策略（防扣费/库存超卖）。
3. 说明该数据源如何为下游 AI Agent 提供干净、低噪、带时间戳新鲜度标记的上下文输入。`,
    courseMapping: "对应实战：M2 上下文工程 · M3 Supabase/DB · M4 MCP",
  },
  {
    id: "architecture",
    index: "03",
    title: "动态演进系统架构（Designing System Architectures）",
    shortTitle: "系统架构权衡",
    tradeoffs: ["Simplicity 简洁性", "Latency 延迟", "Cost 成本", "Maintainability 可维护性"],
    blindSpot:
      "对仅服务 100 名早期用户的 MVP 套用重型微服务、多队列和复杂微前端（过度工程）；或者相反，到了高并发阶段仍把重计算塞进单线程请求里（架构滞后）。",
    architectSteering:
      "架构正确性是一个随产品阶段移动的靶心（Prototype → 首个生产版 → 规模化）。先锚定用户量、延迟与成本诉求，决定前后端边界、系统解耦粒度与栈选型，必要时做小规模实验实测对比。",
    keyChecklist: [
      "阶段匹配：原型极简单体（Monolith）→ 首个生产系统 → 按瓶颈拆服务（Microservices）",
      "核心边界：平台选型、前后端职责切分、应用状态放置位置、语言/运行时/框架实验评估",
      "上下文约束：告诉 Agent 当前真实并发规模与预算上限，禁止盲目堆砌分布式组件",
    ],
    steeringPrompt: `[Plan Mode] 当前产品处于「首个生产上线阶段（预计日活 2k，重读轻写）」。
1. 对比「模块化单体 vs 拆出独立 Worker」两种方案的运维成本与 P95 延迟权衡，先做小实验验证瓶颈再定栈。
2. 明确划定前端展示层与后端鉴权/聚合层边界，防止业务逻辑漂移到浏览器端。`,
    courseMapping: "对应实战：M1 意图架构 · M4 Plan/SDD · M9 元框架选型",
  },
  {
    id: "security",
    index: "04",
    title: "安全左移与系统韧性（Making Systems Secure & Reliable）",
    shortTitle: "安全与可靠性",
    tradeoffs: ["Reliability 可靠性", "Availability 可用性", "Consistency 一致性"],
    blindSpot:
      "只测主流程（Happy Path），从未要求 Agent 考虑第三方 AI API 限流（429）、部分服务挂掉时的降级，也没做安全扫描，直到上线后一条恶意输入或依赖供应链投毒直接拖垮全站。",
    architectSteering:
      "测试与安全不再是上线前才补的环节——贯彻“安全左移（Shift Left）”：每一位全栈开发者同时也是半个安全工程师。先定测试金字塔比例与故障爆炸半径，再用 AI + 静态工具扫描漏洞与云配置风险。",
    keyChecklist: [
      "测试策略：Unit 单元与 Integration 集成测试配比、测试框架与关键路径覆盖率门禁",
      "失败设计：外部 API 限流退避（Rate Limit）、优雅降级（Graceful Degradation）、缩小爆炸半径",
      "安全左移：代码漏洞审计、依赖供应链注入排查、云权限与暴露面检查（pre-commit + CI）",
    ],
    steeringPrompt: `[Audit & Harden] 对核心 API 与前端调用执行可靠性与安全左移加固：
1. 补齐针对限流（429）与上游超时的指数退避 + 降级兜底，将单点故障爆炸半径隔离在非核心模块。
2. 编写单元 + 集成测试覆盖权鉴越权与非法输入边界。
3. 扫描硬编码密钥、依赖供应链风险及服务端权限配置暴露面。`,
    courseMapping: "对应实战：M5 DoD自愈 · M6 Bugbot + 三层密钥/CodeQL 防线",
  },
  {
    id: "production",
    index: "05",
    title: "生产部署、可观测性与扩展治理（Scaling & Operating）",
    shortTitle: "生产运维与扩展",
    tradeoffs: ["Availability 可用性", "Latency 延迟", "Maintainability 可维护性", "Cost 成本"],
    blindSpot:
      "代码在本地 localhost 跑通就直接发布：没有 CI/CD、没有告警与日志可观测性、数据库缺索引且无发布回滚预案；用户激增或遇到事故时只能抓瞎，技术债随每次 Agent 修改呈指数级堆积。",
    architectSteering:
      "软件真正服务用户靠完整的 SDLC 闭环：环境配置、发布策略、CI/CD 自动化与 IaaS 基建；线上建立可观测性与告警响应；面对真实负载通过负载均衡与数据分片/索引/读写副本演进，并用 Git/Code Review/依赖维护治理技术债。",
    keyChecklist: [
      "交付链路：部署环境隔离、灰度/回滚发布策略、CI/CD 自动化流水线与 IaaS 管理",
      "线上护航：结构化可观测性（Observability）、阈值告警（Alerts）、线上事故响应预案",
      "扩展与卫生：负载均衡、数据库分片/索引/主从复制（Sharding/Indexing/Replication）及技术债清理",
    ],
    steeringPrompt: `[Production Readiness] @AGENTS.md 准备将该服务推向生产环境，请生成上线检查与可观测改造方案：
1. 完善 CI/CD（tsc + lint + 迁移检查）与零停机回滚发布步骤。
2. 为关键接口补充结构化日志、延迟直方图指标与错误率告警阈值。
3. 核查核心查询语句的索引覆盖情况，列出需优先偿还的技术债清单。`,
    courseMapping: "对应实战：M3 上线部署 · M6 Background Agent + CLI · M7 ROI 演进",
  },
];

export default function TradeoffSteeringSandbox() {
  const [activeId, setActiveId] = useState<string>(PILLARS[0].id);
  const current = PILLARS.find((p) => p.id === activeId) || PILLARS[0];

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-wide">
            Agentic Tradeoff Steering Matrix · 拒绝“盲从 Vibe Coding”
          </div>
          <h3 className="text-lg font-bold text-white">
            五大软件工程基本功：如何驾驶 Cursor 做出正确权衡
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
          已选支柱 <span className="text-gemini-cyan font-bold">{current.index}</span> / 05
        </div>
      </div>

      {/* 5-Pillar Selector Tabs */}
      <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-black/45 border border-white/10">
        {PILLARS.map((pillar) => {
          const active = pillar.id === current.id;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActiveId(pillar.id)}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap truncate tabular-nums ${
                active
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {pillar.index}. {pillar.shortTitle}
            </button>
          );
        })}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 7 cols: Blind spot vs Architect Steering + Checklist */}
        <div
          className="col-span-7 flex flex-col gap-2.5 max-h-[370px] overflow-y-auto custom-scrollbar pr-1"
          onWheel={stopRevealWheel}
        >
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-gemini-cyan shrink-0" />
                <span>{current.title}</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              牵动核心权衡：{current.tradeoffs.join(" · ")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-400/25 space-y-1.5">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>盲目 Vibe Coder 典型翻车</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{current.blindSpot}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-400/25 space-y-1.5">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>软件基本功驾驶法则</span>
              </div>
              <p className="text-slate-200 leading-relaxed">{current.architectSteering}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="font-mono text-gemini-purple text-[11px]">
              必须显式检查的核心技术要素（不可外包给模型盲猜）
            </div>
            <ul className="space-y-1 text-slate-300 leading-relaxed">
              {current.keyChecklist.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            <div className="pt-1.5 border-t border-white/10 text-[11px] font-mono text-gemini-cyan">
              {current.courseMapping}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Copyable Steering Prompt */}
        <div className="col-span-5 rounded-xl bg-black/60 border border-gemini-purple/35 p-3.5 flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
              <span className="font-mono text-gemini-purple font-semibold">
                Cursor Plan 权衡驾驶提示词
              </span>
              <CopySnippetButton text={current.steeringPrompt} label="复制指令" />
            </div>
            <pre
              className="font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[260px] overflow-y-auto custom-scrollbar"
              onWheel={stopRevealWheel}
            >
              {current.steeringPrompt}
            </pre>
          </div>
          <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
            记住：如果你自己都不知道存在 <strong className="text-white">延迟 / 一致性 / 爆炸半径 / 成本</strong> 权衡，你就无法向 Cursor 发出这类指令。
          </div>
        </div>
      </div>
    </div>
  );
}
