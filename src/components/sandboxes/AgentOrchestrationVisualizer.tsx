import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  FileCode2,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface OrchestrationStep {
  id: string;
  stepNum: string;
  agentRole: string;
  title: string;
  habitTag: string;
  habitDetail: string;
  contextIn: string[];
  contextPruned: string;
  tokenUsagePct: number;
  subtasks: { label: string; status: "done" | "active" | "queued" }[];
  contextOut: string;
  guardrailCheck: string;
  artifactTitle: string;
  artifactSnippet: string;
}

interface ScenarioConfig {
  id: string;
  label: string;
  goal: string;
  steps: OrchestrationStep[];
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "stripe-webhook",
    label: "Stripe 支付回调幂等",
    goal: "在 Next.js API 中接入 Stripe Webhook 验签、幂等落库与 Vitest 边界验证",
    steps: [
      {
        id: "ctx",
        stepNum: "01",
        agentRole: "Context Curator",
        title: "上下文文档化与按需挂载",
        habitTag: "Habit #2 · Over-Document Context",
        habitDetail: "只注入 AGENTS.md、支付域 .mdc 与官方 Stripe SDK 类型，剪枝无关 UI 组件。",
        contextIn: ["AGENTS.md (架构红线)", "20-api-security.mdc (globs 命中)", "src/db/schema.ts (orders 表)"],
        contextPruned: "已剪枝 14 个前端页面与 CSS 文件（节省 68% 上下文噪音）",
        tokenUsagePct: 24,
        subtasks: [
          { label: "1. 锁定 webhook_events 幂等表结构", status: "active" },
          { label: "2. 编写签名校验 + 事务更新状态", status: "queued" },
          { label: "3. 构造伪造签名与重复投递单测", status: "queued" },
        ],
        contextOut: "Scoped Context Pack (2.4k tokens) → Planner Agent",
        guardrailCheck: "已阻断全仓无差别 @Codebase 注入，契约边界清晰。",
        artifactTitle: ".cursor/rules/20-api-security.mdc",
        artifactSnippet: `globs: ["src/app/api/**/*.ts"]
- Webhook 必须使用 rawBody + stripe.webhooks.constructEvent 验签
- 严禁依赖前端传回的 paid=true 字段直接改单`,
      },
      {
        id: "plan",
        stepNum: "02",
        agentRole: "Planner Agent",
        title: "高内聚任务拆解（低复杂度）",
        habitTag: "Habit #3 · Keep It Simple",
        habitDetail: "拆分为 3 个单职责纯函数，锁定圈复杂度 <= 8，拒绝百行嵌套大函数。",
        contextIn: ["Scoped Context Pack", "Stripe Event Payload Type"],
        contextPruned: "已剥离异步邮件通知（降级为独立队列任务，降低主链路耦合）",
        tokenUsagePct: 31,
        subtasks: [
          { label: "1. 锁定 webhook_events 幂等表结构", status: "done" },
          { label: "2. verifyStripeSignature() 纯函数拆分", status: "active" },
          { label: "3. 事务防重放与负向测试集定义", status: "queued" },
        ],
        contextOut: "DAG Execution Plan (3 Subtasks) → Coder Agent",
        guardrailCheck: "圈复杂度预估 4（安全阈值 <= 10），符合 SOLID 单一职责。",
        artifactTitle: "Plan Spec · 3-Step DAG",
        artifactSnippet: `Step A: db.insert(webhookEvents).onConflictDoNothing()
Step B: verifySignature(rawBody, sigHeader) -> Stripe.Event
Step C: db.transaction() 原子更新订单状态为 PAID`,
      },
      {
        id: "code",
        stepNum: "03",
        agentRole: "Coder Agent",
        title: "受限域增量编码与零残留清理",
        habitTag: "Habit #4 · No Stray Code",
        habitDetail: "仅修改路由与订单服务 2 个文件；交付切片前自动清理调试日志与空 catch。",
        contextIn: ["DAG Execution Plan", "src/app/api/stripe/route.ts"],
        contextPruned: "仅保留当前路由文件切片，避免误改历史支付模块",
        tokenUsagePct: 38,
        subtasks: [
          { label: "1. 锁定 webhook_events 幂等表结构", status: "done" },
          { label: "2. 编写签名校验 + 事务更新状态", status: "done" },
          { label: "3. 构造伪造签名与重复投递单测", status: "active" },
        ],
        contextOut: "Clean Diff Patch (+64 / -6 lines) → Test Agent",
        guardrailCheck: "已自动剔除 2 处 console.log 调试语句及 1 个未使用 import。",
        artifactTitle: "src/app/api/stripe/route.ts (Diff)",
        artifactSnippet: `const event = stripe.webhooks.constructEvent(rawBody, sig, secret);
await db.transaction(async (tx) => {
  const inserted = await tx.insert(webhookEvents)
    .values({ id: event.id }).onConflictDoNothing().returning();
  if (inserted.length === 0) return; // 幂等拦截重复投递
  await markOrderPaid(tx, event.data.object);
});`,
      },
      {
        id: "test",
        stepNum: "04",
        agentRole: "Test Verifier",
        title: "独立基准单测与防测试作弊",
        habitTag: "Habit #6 · Mandatory Tests (No Reward Hacking)",
        habitDetail: "校验异常路径与重复投递；拦截弱断言 expect(true).toBe(true) 或 .skip。",
        contextIn: ["Clean Diff Patch", "Stripe Mock Fixture"],
        contextPruned: "屏蔽实现内部私有 helper，仅黑盒验证输入输出与数据库状态",
        tokenUsagePct: 41,
        subtasks: [
          { label: "1. 非法签名返回 HTTP 400 验证", status: "done" },
          { label: "2. 相同 event.id 投递两次仅扣/改一次", status: "done" },
          { label: "3. 断言强度审计（防 Reward Hacking）", status: "done" },
        ],
        contextOut: "Verified Test Report (4/4 Passed) → Bugbot Agent",
        guardrailCheck: "断言审计通过：0 处 .skip，0 处空断言，负向分支全覆盖。",
        artifactTitle: "tests/stripe-webhook.test.ts",
        artifactSnippet: `it("ignores duplicate webhook event safely", async () => {
  await postWebhook(validPayload, validSig);
  await postWebhook(validPayload, validSig);
  const orders = await db.select().from(ordersTable);
  expect(orders[0].paidCount).toBe(1); // 真实状态断言
});`,
      },
      {
        id: "bugbot",
        stepNum: "05",
        agentRole: "Bugbot + SAST",
        title: "全量静态扫雷与并发安全复核",
        habitTag: "Habit #5 · Analyze Everything",
        habitDetail: "执行超越人类代码的严苛 SAST：扫描密钥硬编码、竞态条件与超时边界。",
        contextIn: ["Clean Diff Patch", "Verified Test Report"],
        contextPruned: "聚焦安全规则集：OWASP API + Race Condition + Secret Scan",
        tokenUsagePct: 29,
        subtasks: [
          { label: "1. Secret Scan（密钥必须来自 process.env）", status: "done" },
          { label: "2. 并发事务竞态审计（Unique Constraint）", status: "done" },
          { label: "3. npx tsc --noEmit && npm run lint", status: "done" },
        ],
        contextOut: "SAST Clean Badge (0 Critical / 0 Stray) → Human Editor",
        guardrailCheck: "未发现明文 STRIPE_WEBHOOK_SECRET 或 TOCTOU 并发漏洞。",
        artifactTitle: "Bugbot & SAST Audit Log",
        artifactSnippet: `[PASS] No hardcoded secrets (process.env.STRIPE_WEBHOOK_SECRET)
[PASS] Idempotency backed by DB unique key + transaction
[PASS] tsc --noEmit: 0 errors | eslint: 0 warnings`,
      },
      {
        id: "review",
        stepNum: "06",
        agentRole: "Editor-in-Chief",
        title: "人类主编终审与 git blame 签核",
        habitTag: "Habit #1 Accountability & #7 Rigorous Review",
        habitDetail: "输出 <100 行结构化变更摘要，由人类开发者理解每行副作用后签核合入。",
        contextIn: ["SAST Clean Badge", "64-line Diff Summary"],
        contextPruned: "仅呈现核心边界变更与影响面清单，避免信息过载",
        tokenUsagePct: 18,
        subtasks: [
          { label: "1. 人类逐块阅读 Diff 与数据库迁移影响", status: "done" },
          { label: "2. 确认回滚方案与可观测告警", status: "done" },
          { label: "3. git commit 签核（责任归属人类开发者）", status: "done" },
        ],
        contextOut: "Production-Ready PR Approved (#142)",
        guardrailCheck: "100% 变更已由人类理解并可解释，彻底跨越 70% 困境。",
        artifactTitle: "PR Review Checklist (Signed Off)",
        artifactSnippet: `Author Accountability: Verified rawBody parsing & idempotency key
Blast Radius: Isolated to /api/stripe + webhook_events table
Status: APPROVED FOR PRODUCTION DEPLOY`,
      },
    ],
  },
  {
    id: "rbac-refactor",
    label: "RBAC 权限中间件重构",
    goal: "把散落在 6 个接口里的角色判断收口为统一 RBAC Guard 与全链路单测",
    steps: [
      {
        id: "ctx",
        stepNum: "01",
        agentRole: "Context Curator",
        title: "权限边界与调用拓扑建境",
        habitTag: "Habit #2 · Over-Document Context",
        habitDetail: "注入鉴权架构文档与现有 6 个 API 签名，明确禁止静默降级放行。",
        contextIn: ["AGENTS.md (Auth 红线)", "src/middleware/auth.ts", "6 个路由文件签名"],
        contextPruned: "已剪枝非鉴权业务模型，聚焦角色枚举与 Session 结构",
        tokenUsagePct: 26,
        subtasks: [
          { label: "1. 盘点 Admin / Editor / Viewer 权限矩阵", status: "active" },
          { label: "2. 抽离 withRoleGuard() 高阶守卫", status: "queued" },
          { label: "3. 越权 403 回归测试覆盖", status: "queued" },
        ],
        contextOut: "Auth Matrix & Call Graph → Planner Agent",
        guardrailCheck: "明确 Fail-Closed 默认拒绝原则，禁止缺省 role 放行。",
        artifactTitle: "Auth Matrix Spec",
        artifactSnippet: `Viewer: GET /api/reports
Editor: POST /api/reports (own tenant only)
Admin: DELETE /api/reports/* + /api/billing/*`,
      },
      {
        id: "plan",
        stepNum: "02",
        agentRole: "Planner Agent",
        title: "小步可回滚重构计划",
        habitTag: "Habit #3 · Keep It Simple",
        habitDetail: "拆分为先建守卫、逐路由替换、再清理旧逻辑三步，杜绝一次性重写。",
        contextIn: ["Auth Matrix & Call Graph"],
        contextPruned: "锁定每步最大改动 <= 3 个文件，便于逐批 Diff",
        tokenUsagePct: 29,
        subtasks: [
          { label: "1. 盘点权限矩阵与统一错误码 401/403", status: "done" },
          { label: "2. 抽离 requireRole(allowedRoles) 守卫", status: "active" },
          { label: "3. 越权 403 负向单测生成", status: "queued" },
        ],
        contextOut: "Incremental Refactor Plan → Coder Agent",
        guardrailCheck: "单函数分支数 <= 5，杜绝深层嵌套 if-else。",
        artifactTitle: "Guard Interface Contract",
        artifactSnippet: `export function requireRole(
  session: Session | null,
  allowed: readonly Role[]
): asserts session is AuthenticatedSession`,
      },
      {
        id: "code",
        stepNum: "03",
        agentRole: "Coder Agent",
        title: "统一收口与清除废弃分支",
        habitTag: "Habit #4 · No Stray Code",
        habitDetail: "删除 6 个路由里重复手写的 if (user.role !== ...) 死代码与遗留 TODO。",
        contextIn: ["Incremental Refactor Plan", "Target API Routes"],
        contextPruned: "逐个文件注入，单轮只处理鉴权守卫替换",
        tokenUsagePct: 35,
        subtasks: [
          { label: "1. 实现 requireRole() Fail-Closed 守卫", status: "done" },
          { label: "2. 替换 6 处重复鉴权并删除冗余 helper", status: "done" },
          { label: "3. 编写跨租户越权测试", status: "active" },
        ],
        contextOut: "Refactored Diff (-88 duplicate lines) → Test Agent",
        guardrailCheck: "清扫 4 处 TODO 占位注释与 1 个未导出废弃函数 legacyCheckAuth。",
        artifactTitle: "src/middleware/requireRole.ts",
        artifactSnippet: `if (!session) throw new HttpError(401, "Unauthorized");
if (!allowed.includes(session.role)) {
  throw new HttpError(403, "Forbidden: insufficient role");
}`,
      },
      {
        id: "test",
        stepNum: "04",
        agentRole: "Test Verifier",
        title: "越权矩阵测试与反作弊检验",
        habitTag: "Habit #6 · Mandatory Tests (No Reward Hacking)",
        habitDetail: "强制验证未登录 401、低权限 403 与跨租户越权阻断。",
        contextIn: ["Refactored Diff", "Role Matrix"],
        contextPruned: "只保留测试所需的最小 Session 构造工厂",
        tokenUsagePct: 33,
        subtasks: [
          { label: "1. Viewer 调用 DELETE 必须返回 403", status: "done" },
          { label: "2. 伪造空 session 必须返回 401", status: "done" },
          { label: "3. 确认无 mock bypass 绕过鉴权函数", status: "done" },
        ],
        contextOut: "Auth Test Suite Passed (9/9) → Bugbot Agent",
        guardrailCheck: "拦截 1 处测试 mock 了 requireRole 本身的无效用例并重写为真实调用。",
        artifactTitle: "tests/rbac-guard.test.ts",
        artifactSnippet: `it("blocks viewer from admin delete endpoint", async () => {
  const res = await callDeleteReport({ role: "viewer" });
  expect(res.status).toBe(403);
});`,
      },
      {
        id: "bugbot",
        stepNum: "05",
        agentRole: "Bugbot + SAST",
        title: "权限逃逸与路径遗漏扫描",
        habitTag: "Habit #5 · Analyze Everything",
        habitDetail: "全量扫描所有 /api/* 路由，确认无漏网端点缺失鉴权守卫。",
        contextIn: ["Auth Test Suite", "All /api/* Route Manifest"],
        contextPruned: "路由清单扫描模式下忽略非服务端静态资源",
        tokenUsagePct: 22,
        subtasks: [
          { label: "1. 扫描 12 个 API 路由守卫覆盖率", status: "done" },
          { label: "2. 检测是否存在默认 admin fallback", status: "done" },
          { label: "3. TypeScript + ESLint 零告警门禁", status: "done" },
        ],
        contextOut: "Route Security Coverage 100% → Human Editor",
        guardrailCheck: "全量扫描发现 0 个裸奔接口与 0 处硬编码测试 token。",
        artifactTitle: "Route Coverage Report",
        artifactSnippet: `[12/12] API routes protected or explicitly marked @public
[0] Fail-open fallback branches detected`,
      },
      {
        id: "review",
        stepNum: "06",
        agentRole: "Editor-in-Chief",
        title: "人类主编安全签核",
        habitTag: "Habit #1 Accountability & #7 Rigorous Review",
        habitDetail: "核对公开白名单与 tenantId 隔离边界，人类签字合入主干。",
        contextIn: ["Route Coverage Report", "Net -88 Lines Diff"],
        contextPruned: "仅展示守卫核心代码与路由变更对照表",
        tokenUsagePct: 16,
        subtasks: [
          { label: "1. 复核 @public 白名单仅含健康检查与登录", status: "done" },
          { label: "2. 确认生产审计日志包含 actorId 与操作类型", status: "done" },
          { label: "3. 签核合并 PR", status: "done" },
        ],
        contextOut: "RBAC Refactor Merged Safely",
        guardrailCheck: "代码净减少 88 行，可维护性与安全边界同步提升。",
        artifactTitle: "Final Sign-Off",
        artifactSnippet: `Reviewer Note: Checked fail-closed path & tenant isolation.
Net Complexity Delta: -42% cognitive load across 6 routes.`,
      },
    ],
  },
];

export default function AgentOrchestrationVisualizer() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const steps = scenario.steps;
  const activeStep = steps[activeStepIndex] ?? steps[0];

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2600);
    return () => window.clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleSelectScenario = (id: string) => {
    setScenarioId(id);
    setActiveStepIndex(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIndex(0);
  };

  const handleTogglePlay = () => {
    if (activeStepIndex >= steps.length - 1) {
      setActiveStepIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl"
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wider uppercase">
            AGENT ORCHESTRATION VISUALIZER · MODULE 9 白盒流水线推演
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            基于 Sonar「7 Habits」的 Agent 任务拆解与上下文流转可视化
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectScenario(item.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                item.id === scenario.id
                  ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goal + Playback Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
        <div className="text-xs text-slate-200 min-w-0 truncate">
          <span className="font-mono text-gemini-purple mr-2">TARGET:</span>
          {scenario.goal}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setActiveStepIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={activeStepIndex === 0}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 text-slate-200 disabled:opacity-35 border border-white/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="上一步"
            aria-label="上一步"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              isPlaying
                ? "bg-amber-400/20 text-amber-200 border-amber-400/40"
                : "bg-gemini-purple/25 hover:bg-gemini-purple/35 text-white border-gemini-purple/50"
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? "暂停推演" : activeStepIndex >= steps.length - 1 ? "重新演示" : "自动流转"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={activeStepIndex === steps.length - 1}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 text-slate-200 disabled:opacity-35 border border-white/10 transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="下一步"
            aria-label="下一步"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/12 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="重置到第 1 步"
            aria-label="重置"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6-Stage Horizontal Orchestration Pipeline */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex;
          const isCompleted = idx < activeStepIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setActiveStepIndex(idx);
              }}
              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-gemini-cyan/15 border-gemini-cyan text-white shadow-[0_0_16px_rgba(76,221,236,0.18)]"
                  : isCompleted
                  ? "bg-emerald-500/8 border-emerald-400/35 text-slate-200 hover:bg-emerald-500/12"
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1">
                <span className={isActive ? "text-gemini-cyan font-bold" : isCompleted ? "text-emerald-400" : "text-slate-500"}>
                  STEP {step.stepNum}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Cpu className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-gemini-cyan" : "text-slate-600"}`} />
                )}
              </div>
              <div className="text-[11px] font-bold text-white truncate">{step.agentRole}</div>
              <div className="text-[10px] text-slate-300 truncate mt-0.5">{step.title}</div>
              <div className="mt-1.5 text-[9px] font-mono text-gemini-purple truncate">
                {step.habitTag.split("·")[0].trim()}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom 12-Col Context Flow & Guardrail Inspector */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left: Context Packet & Subtask Decomposition (6 cols) */}
        <div className="col-span-6 p-4 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-gemini-cyan">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>上下文切片与任务状态流转（Context Flow）</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 tabular-nums">
                上下文占用：{activeStep.tokenUsagePct}%
              </span>
            </div>

            {/* Context Window Budget Bar */}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gemini-cyan to-gemini-purple transition-all duration-300"
                style={{ width: `${activeStep.tokenUsagePct}%` }}
              />
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                <div className="font-mono text-[10px] text-slate-400 mb-1">
                  INBOUND CONTEXT（当前 Agent 接收的精确上下文）
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeStep.contextIn.map((ctx) => (
                    <span
                      key={ctx}
                      className="px-2 py-0.5 rounded bg-gemini-cyan/12 border border-gemini-cyan/30 text-[10px] font-mono text-gemini-cyan"
                    >
                      {ctx}
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5">
                  剪枝策略：{activeStep.contextPruned}
                </div>
              </div>

              {/* Subtasks */}
              <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8 space-y-1">
                <div className="font-mono text-[10px] text-slate-400 mb-1">
                  TASK DECOMPOSITION（子任务拆解执行态）
                </div>
                {activeStep.subtasks.map((task) => (
                  <div key={task.label} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className={task.status === "done" ? "text-emerald-300" : task.status === "active" ? "text-white font-medium" : "text-slate-500"}>
                      {task.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono shrink-0 ${
                        task.status === "done"
                          ? "text-emerald-400"
                          : task.status === "active"
                          ? "text-gemini-cyan"
                          : "text-slate-600"
                      }`}
                    >
                      {task.status === "done" ? "DONE" : task.status === "active" ? "RUNNING" : "QUEUED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outbound Handoff */}
          <div className="px-3 py-2 rounded-lg bg-gemini-purple/12 border border-gemini-purple/35 flex items-center justify-between gap-2 text-[11px] font-mono">
            <span className="text-gemini-purple shrink-0">OUTBOUND HANDOFF</span>
            <span className="text-white truncate flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-gemini-cyan shrink-0" />
              {activeStep.contextOut}
            </span>
          </div>
        </div>

        {/* Right: Sonar 7 Habits Guardrail + Artifact Preview (6 cols) */}
        <div className="col-span-6 p-4 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-amber-300 font-semibold">
                {activeStep.habitTag}
              </span>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                Step {activeStepIndex + 1}/{steps.length}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {activeStep.habitDetail}
            </p>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-start gap-2 text-[11px] text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{activeStep.guardrailCheck}</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#040711] border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-gemini-cyan">
                <FileCode2 className="w-3.5 h-3.5" />
                {activeStep.artifactTitle}
              </span>
              <span>STEP ARTIFACT</span>
            </div>
            <pre className="text-[11px] font-mono text-slate-200 leading-relaxed overflow-x-auto custom-scrollbar whitespace-pre-wrap">
              <code>{activeStep.artifactSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
