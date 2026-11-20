import { useMemo, useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

const DEBUG_FLOW_STEPS = [
  {
    step: "1. 症状 (Symptom)",
    detail: "页面点击保存无响应，控制台出现 Failed to fetch，没有盲目重发给 AI 重写页面。",
  },
  {
    step: "2. 定位层 (Layer)",
    detail: "按 Frontend → Network/CORS → Express API → DB → Env 五层逐级缩小到服务端路由层。",
  },
  {
    step: "3. 收集证据 (Evidence)",
    detail: "查看 Network 状态码 500 + Express 终端日志：Error: Missing env DATABASE_URL。",
  },
  {
    step: "4. 形成假设 (Hypothesis)",
    detail: "本地新增的持久化路由读取了未注入的环境变量，而非前端 fetch 代码写错。",
  },
  {
    step: "5. 验证修复 (Verify)",
    detail: "在 .env 补齐配置 + 启动前加 Zod 显式报错提示，重启服务返回 200 并补 1 条健康检查。",
  },
];

interface AdrOption {
  id: string;
  name: string;
  cost: string;
  complexity: string;
  maintainability: string;
  bestWhen: string;
  tradeoffNote: string;
}

const ADR_SCENARIO_OPTIONS: AdrOption[] = [
  {
    id: "polling",
    name: "方案 A：短轮询 (REST Polling)",
    cost: "极低（无长连接运维）",
    complexity: "低（复用普通 API）",
    maintainability: "高（无状态易扩展）",
    bestWhen: "适合任务耗时 5–30 秒的看板/状态更新，1 人团队追求最快稳定上线。",
    tradeoffNote: "有 2–5 秒刷新延迟，不适合高频毫秒级协同编辑；但毫无连接断开重连心智负担。",
  },
  {
    id: "sse",
    name: "方案 B：Server-Sent Events (SSE)",
    cost: "中低（单向 HTTP 流）",
    complexity: "中（需处理流结束与代理超时）",
    maintainability: "中高（原生浏览器 EventSource）",
    bestWhen: "适合 AI 流式文本输出、构建日志实时播报等“服务端单向推客户端”场景。",
    tradeoffNote: "只能服务端推客户端，部分反向代理需关闭缓冲（X-Accel-Buffering: no）。",
  },
  {
    id: "ws",
    name: "方案 C：双向 WebSocket",
    cost: "高（常驻有状态连接/心跳重连）",
    complexity: "高（跨实例扩展需 Redis Pub/Sub）",
    maintainability: "中（测试与排障链路更长）",
    bestWhen: "仅当明确需要多人实时协作画板、高频双向对战或毫秒级推送时选用。",
    tradeoffNote: "在无双工需求的工具站硬上 WebSocket 属于典型过度设计（Over-Engineering）。",
  },
];

const ADR_ARTIFACT = `# DEBUG_FLOW_AND_ADR_TEMPLATE.md — 报错五步排查流程与架构决策记录 (ADR)

## 一、全栈报错五步排障流程图（遇到红字先走流程，不靠盲贴）
\`\`\`text
[1. 症状复现] ──▶ [2. 定位归属层: UI / Network / API / DB / Env]
                         │
                         ▼
[5. 最小修复 + 回归验证] ◀── [4. 可证伪假设] ◀── [3. 收集客观证据: 状态码+终端栈]
\`\`\`

## 二、架构决策记录模板 (ADR — 无唯一正确答案，记录权衡取舍)
- **决策议题**：实时状态同步方式选择（Polling / SSE / WebSocket）
- **当前约束与阶段**：__________（团队人数、预算上限、延迟容忍度）
- **备选方案权衡**：
  - 方案 A（轮询）：成本最低、复杂度最低；代价是 3s 延迟
  - 方案 B（SSE）：单向流体验好；代价是代理超时与断线续传处理
  - 方案 C（WebSocket）：双向低延迟；代价是连接状态管理与扩容成本
- **最终决定与回退边界**：选用 ______；当未来出现 ______ 指标瓶颈时再行演进重构。`;

export default function V5e() {
  const [flowIdx, setFlowIdx] = useState(0);
  const [adrId, setAdrId] = useState("polling");
  const [exploredAdrs, setExploredAdrs] = useState<string[]>(["polling"]);

  const activeAdr = useMemo(
    () => ADR_SCENARIO_OPTIONS.find((o) => o.id === adrId) ?? ADR_SCENARIO_OPTIONS[0],
    [adrId]
  );

  const handleSelectAdr = (id: string) => {
    setAdrId(id);
    setExploredAdrs((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <ModuleLoopStudio
      moduleCode="M9"
      eyebrow="DEBUG PIPELINE & MULTI-OPTION ADR · 报错五步法与架构权衡"
      title="五步报错解码流 × 无唯一答案的架构权衡演练 (ADR)"
      notes="强化 症状→定位层→收集证据→形成假设→验证修复 的完整排障路径，并演示如何在成本、复杂度与可维护性之间做架构权衡。"
      objective="能用五步排障流准确定位三层报错归属，并在没有唯一标准答案的架构决策中按成本/复杂度/可维护性做合理取舍并写出 ADR。"
      boundary="架构选型没有“永远最优解”；把选型理由与未来演进触发条件写进 ADR，远比追求高大上的分布式框架更重要。"
      positiveCase={{
        title: "先定层再取证排障 + 贴合阶段的务实 ADR",
        scenario: "保存数据报 Failed to fetch，且团队正决定看板实时刷新采用轮询还是 WebSocket。",
        steps: [
          "先看 Network（500）与后端终端日志（Missing DATABASE_URL），锁定属于 Env/DB 层，5 分钟补齐配置与启动前 Zod 检查。",
          "针对看板 10 秒刷新一次的业务约束，对比轮询/SSE/WebSocket 三者的成本与运维复杂度。",
          "写下 ADR：MVP 阶段选短轮询降低复杂度，约定等日活交互超标后再升级 SSE。",
        ],
        snippetLabel: "启动环境变量防漏检查（提前把隐藏炸弹变清晰报错）",
        snippet: `const EnvSchema = z.object({ DATABASE_URL: z.string().min(1) });
// 启动时缺失即输出清晰中文报错并退出，不留到接口运行时才炸`,
        verdict: "排障直击根因不乱改 UI；架构贴合团队当前承载力。",
      }}
      failureCase={{
        title: "盲猜症状乱改前端 + 盲目引入高复杂度方案",
        scenario: "看到控制台红字就全选贴给 AI，同时一上来让 AI 搭 WebSocket + 消息队列。",
        steps: [
          "后端缺环境变量报 500，却让 AI 连改 6 次前端 fetch 重试与表单样式。",
          "明明只需要每 5 秒同步一次状态，却引入双向 WebSocket + 连接池管理，导致部署后频繁断连掉线。",
          "未留架构决策原因（ADR），一个月后新人接手看不懂为何存在冗余中间件。",
        ],
        snippetLabel: "典型排障走偏对话",
        snippet: `"界面点保存还是报错！你再换一种 axios 写法试试。" (实际是后端缺配置)`,
        verdict: "跳过分层取证会无限放大调试时间，脱离约束的技术选型会背上长期运维债。",
      }}
      practiceTitle="课堂双演练：点按 5 步排障链路 & 对比 3 种无标准答案的架构权衡（至少对比 2 方案）"
      practicePassedCount={exploredAdrs.length >= 2 ? 2 : exploredAdrs.length}
      practiceTotalCount={2}
      dodItems={[
        {
          id: "m9-dod-1",
          label: "能独立按「症状 → 层级 → 证据 → 假设 → 验证」定位报错",
          verifyHint: "先分清 UI / API / DB / Env 层，再向 AI 下达修复指令",
        },
        {
          id: "m9-dod-2",
          label: "在右侧对比了至少 2 种方案的成本、复杂度与可维护性取舍",
          verifyHint: "理解为何轮询、SSE、WebSocket 各有成立场景",
        },
        {
          id: "m9-dod-3",
          label: "已导出「报错五步排查表 & 架构决策记录 (ADR) 模板」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="五步排障流程图与架构决策记录 (ADR) 模板"
      artifactFilename="DEBUG_FLOW_AND_ADR_TEMPLATE.md"
      artifactContent={ADR_ARTIFACT}
      reflectionQuestion="假设你现在做一个只有 200 个日活的内部效率工具，却考虑引入微服务和 WebSocket，对照成本、复杂度、可维护性三项，你的 ADR 应该怎么权衡？"
      reflectionHint="在 200 DAU 阶段，单人/小团队最稀缺的是维护注意力。ADR 应优先选单体全栈 + 短轮询或轻量 SSE（成本低、部署简单、可维护性高），并把“单库 CPU > 70% 或真实需要双工协同”作为未来拆分的客观触发条件。"
      renderPractice={() => (
        <div className="space-y-3 text-xs">
          {/* 5-step Error Decoding Flow */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="text-[11px] font-mono text-gemini-cyan">
              Part A · 报错五步排查链路（点击切换查看细节）
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {DEBUG_FLOW_STEPS.map((st, idx) => (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setFlowIdx(idx)}
                  className={`py-1.5 px-1.5 rounded-lg font-mono text-[10px] border cursor-pointer truncate ${
                    flowIdx === idx
                      ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-bold"
                      : "bg-white/5 text-slate-300 border-white/10"
                  }`}
                >
                  {st.step}
                </button>
              ))}
            </div>
            <div className="text-slate-200 px-1 leading-relaxed">
              {DEBUG_FLOW_STEPS[flowIdx].detail}
            </div>
          </div>

          {/* Multi-option Architecture Decision ADR */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="text-[11px] font-mono text-gemini-purple">
              Part B · 架构权衡（需求：状态实时同步 — 无唯一正确答案，按项目阶段取舍）
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ADR_SCENARIO_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectAdr(opt.id)}
                  className={`p-2 rounded-lg text-left text-[11px] border cursor-pointer transition-colors ${
                    adrId === opt.id
                      ? "bg-gemini-purple/25 border-gemini-purple text-white font-semibold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-black/45 border border-white/10">
                <div className="text-slate-400 font-mono">成本</div>
                <div className="text-white mt-0.5">{activeAdr.cost}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/45 border border-white/10">
                <div className="text-slate-400 font-mono">复杂度</div>
                <div className="text-white mt-0.5">{activeAdr.complexity}</div>
              </div>
              <div className="p-2 rounded-lg bg-black/45 border border-white/10">
                <div className="text-slate-400 font-mono">可维护性</div>
                <div className="text-white mt-0.5">{activeAdr.maintainability}</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-200 leading-relaxed">
              <strong className="text-emerald-300">适用情景：</strong>
              {activeAdr.bestWhen} <span className="text-amber-300">（权衡代价：{activeAdr.tradeoffNote}）</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
