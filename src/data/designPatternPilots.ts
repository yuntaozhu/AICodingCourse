export type Stage1PilotModuleId = "m3" | "m5" | "m8" | "m9";
export type PilotPairId = "pair-arch-fullstack" | "pair-dod-harness";

export interface DesignPatternCard {
  id: string;
  pairId: PilotPairId;
  moduleCodes: Array<"M3" | "M5" | "M8" | "M9">;
  name: string;
  englishName: string;
  focusGoal: string;
  /** 1. 问题与变化方向 */
  problemAndChangeAxis: string;
  /** 2. 最简单实现 */
  simplestImplementation: string;
  /** 3. 模式方案 */
  patternSolution: string;
  /** 4. 代价与反例 */
  tradeoffsAndAntiExamples: string;
  /** 5. AI 协作实现 */
  aiCollabProtocol: string;
  /** 6. 测试验证 */
  verificationChecks: string[];
  /** 7. 何时不该使用（反过度抽象） */
  whenNotToUse: string;
}

export interface FaultDrillAssertion {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface FaultDrillSmellOption {
  id: string;
  label: string;
  hint: string;
  isActualSmell: boolean;
}

export interface FaultDrillDecisionOption {
  id: string;
  label: string;
  category: "under-engineered" | "over-abstracted" | "right-sized";
  summary: string;
  patchPreview: string;
  assertions: FaultDrillAssertion[];
  feedback: string;
}

export interface FaultDrillScenario {
  id: string;
  pairId: PilotPairId;
  moduleIds: Stage1PilotModuleId[];
  title: string;
  scenarioContext: string;
  buggyTitle: string;
  buggyCode: string;
  reproductionTrace: string[];
  smellOptions: FaultDrillSmellOption[];
  decisionOptions: FaultDrillDecisionOption[];
  antiOverAbstractionPrompt: string;
  antiOverAbstractionSample: string;
}

export interface Stage1RubricCriterion {
  id: string;
  dimension: string;
  passCriteria: string;
  evidence: string;
  redFlag: string;
}

export interface DesignPatternPilotGroup {
  id: PilotPairId;
  title: string;
  subtitle: string;
  moduleIds: Stage1PilotModuleId[];
  moduleLabel: string;
  coreQuestion: string;
  patterns: DesignPatternCard[];
  faultDrill: FaultDrillScenario;
}

export const STAGE1_PILOT_RUBRIC: Stage1RubricCriterion[] = [
  {
    id: "rubric-smell",
    dimension: "01. 坏味道识别",
    passCriteria:
      "能从真实报错与 Diff 中识别至少 1 类结构坏味道（如 UI/API/DB 混杂、客户端伪鉴权、无上限自愈或跨目录写冲突），并指出触发故障的调用路径。",
    evidence: "故障演练诊断勾选结果与损坏调用链说明。",
    redFlag: "只把报错现象抄给 AI 重试，说不出代码边界到底错在哪一层。",
  },
  {
    id: "rubric-rationale",
    dimension: "02. 模式选择依据",
    passCriteria:
      "能对照最简单实现与业务变化方向，解释为何引入所选模式（如分层边界、Facade、状态机、有限重试+熔断或检查点交接）。",
    evidence: "架构决策记录（ADR）中的变化方向分析与被否决备选方案。",
    redFlag: "把“在 Prompt 里写了一句请用设计模式”当成架构已收敛的证明。",
  },
  {
    id: "rubric-verify",
    dimension: "03. 确定性验收运行",
    passCriteria:
      "能运行类型检查、边界单测或 curl 越权/重放测试，确认原有逻辑被正确保护且退出码为 0，不靠改弱断言凑绿灯。",
    evidence: "正反测试断言通过日志与 tests/ 零擅改确认。",
    redFlag: "测试仅断言返回值存在，或删除原有失败用例强行通过。",
  },
  {
    id: "rubric-anti-overdesign",
    dimension: "04. 反过度抽象说明",
    passCriteria:
      "能明确写出本次拒绝了哪类过度抽象方案（如单实现抽象工厂、过早微服务或重型通用事件总线），说明 KISS/YAGNI 边界与未来拆分的触发阈值。",
    evidence: "交付草稿中的「为何没有过度抽象」段落与适用边界声明。",
    redFlag: "为一个 30 行表单接口堆砌 RepositoryFactory、AdapterProvider 与 5 层空转发。",
  },
];

export const STAGE1_PILOT_GROUPS: DesignPatternPilotGroup[] = [
  {
    id: "pair-arch-fullstack",
    title: "M9 / M3 · 架构边界、Facade 与垂直切片试点",
    subtitle: "针对全栈实现中的前后端信任越界、第三方 SDK 耦合与局部盲目抽象",
    moduleIds: ["m9", "m3"],
    moduleLabel: "M9 全栈白盒图谱 · M3 垂直切片安全",
    coreQuestion:
      "如何在保留快速垂直交付的同时，靠分层边界与 Facade 死守服务端信任线，并拒绝无价值的工厂/微服务过度设计？",
    patterns: [
      {
        id: "pattern-layered-boundary",
        pairId: "pair-arch-fullstack",
        moduleCodes: ["M9", "M3"],
        name: "分层与模块边界",
        englishName: "Layered & Module Boundary",
        focusGoal: "隔离 UI 展示、HTTP 输入校验与服务端权威状态变更，防止客户端越权直改核心数据。",
        problemAndChangeAxis:
          "AI 为求“先跑通页面”，常把数据库校验、金额/权限判断或敏感私钥逻辑混进 React 组件或裸路由里。变化方向在于：UI 展示频繁调整，而鉴权、计费与数据不变量必须集中受控。",
        simplestImplementation: `// 最小可控基线：单个全栈接口文件内先清晰分段（校验 -> 鉴权 -> 事务写入）
export async function POST(req: Request, user: AuthUser) {
  const input = UpgradeSchema.parse(await req.json());
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await upgradeAccountInDb(user.id, input.plan));
}`,
        patternSolution: `// 清晰三层边界：Route 只解包、Guard 验权、Domain Service 管状态
// 1. UI 层 (src/components/**): 仅渲染展示态，不持有权限裁决真相
// 2. API 入口 (src/server/routes/**): Zod 校验 + requireAuth + 调用服务层
// 3. 领域与存储 (src/server/services/**): 封装唯一可信账本与幂等锁`,
        tradeoffsAndAntiExamples:
          "代价：跨文件跳转略增，需要同步维护输入/输出类型契约。\n反例：为仅 2 个字段的简单表单拆出 Controller -> Presenter -> Service -> RepositoryImpl -> DAO 五层转发。",
        aiCollabProtocol:
          "在 Spec/Rules 中锁定目录职责：禁止 `src/components/**` 访问密钥或直接决定付费态；要求 AI 先输出接口输入输出契约再动路由和 UI。",
        verificationChecks: [
          "用不带 Cookie/Token 的 curl 请求写接口，验证固定返回 401/403",
          "用普通用户 A 的会话请求用户 B 的资源 ID（IDOR），验证被服务端拦截",
          "运行静态扫描确认前端目录零 SECRET / 管理员凭证引用",
        ],
        whenNotToUse:
          "纯客户端本地计算器、无持久化与多用户隔离的静态演示页，不需要强拆后端服务层。",
      },
      {
        id: "pattern-facade",
        pairId: "pair-arch-fullstack",
        moduleCodes: ["M3", "M9"],
        name: "门面隔离外部依赖",
        englishName: "Facade Pattern",
        focusGoal: "把第三方支付回调、邮件/OTP 发送或外部存储 SDK 的复杂细节收口为单一受控模块。",
        problemAndChangeAxis:
          "若在 6 个业务路由里散落调用第三方支付/邮件 SDK，不仅签名校验逻辑容易遗漏，换供应商或本地离线测试时还会牵一发而动全身。变化方向是“外部供应商实现会变，业务语义不变”。",
        simplestImplementation: `// 当全系统只有 1 处发信时：直接封装 1 个普通函数即可，不必建接口与工厂
export async function sendLoginOtp(email: string, code: string) {
  return mailerClient.send({ to: email, subject: "验证码", text: code });
}`,
        patternSolution: `// Facade 门面收口：对外只暴露稳定语义方法，内部隐藏验签/重放与提供商差异
export const billingGateway = {
  async processVerifiedWebhook(rawBody: Buffer, signature: string) {
    const event = verifySignatureOrThrow(rawBody, signature, process.env.WEBHOOK_SECRET);
    if (await hasProcessedEvent(event.id)) return { idempotent: true };
    return grantEntitlementAtomically(event.accountId, event.productId, event.id);
  },
};`,
        tradeoffsAndAntiExamples:
          "代价：多一层薄包装，需避免把门面写成“什么都塞进去的上帝对象”。\n反例：只有一个底层实现却提前写 `IBillingAdapter` + `BillingAdapterFactory` + `DIContainer`。",
        aiCollabProtocol:
          "在 Rules 中要求外部 API Key 只允许在 `src/server/services/*Gateway.ts` 读取；告诉 AI“不要引入依赖注入框架，直接导出纯函数或轻量对象门面”。",
        verificationChecks: [
          "传入缺失或伪造签名测试 `processVerifiedWebhook`，验证拒绝入账",
          "同一合法 `event.id` 连续回放 2 次，验证权益仅生效 1 次（幂等）",
          "离线测试无需真实外网密钥即可验证门面签名失败路径",
        ],
        whenNotToUse:
          "整个应用仅在一个页面调一次极简公开只读 API 且未来无切换/验签需求时，直接函数调用即可。",
      },
      {
        id: "pattern-vertical-slice",
        pairId: "pair-arch-fullstack",
        moduleCodes: ["M3", "M9"],
        name: "垂直切片推进",
        englishName: "Vertical Slice Architecture",
        focusGoal: "先打通单个端到端真实闭环（输入校验 -> 服务端鉴权 -> 数据落库 -> UI 反馈），再按复用需求抽公共层。",
        problemAndChangeAxis:
          "AI 极易按“水平铺摊子”方式一次生成 12 张空表、8 个通用组件和微服务脚手架，结果连第 1 条用户请求都跑不通。变化方向是按独立业务动作逐步扩展，而不是横铺基础设施。",
        simplestImplementation: `// 单个切片目录或文件先自洽跑通（Spec -> 1 条路由 -> 1 个组件 -> 1 组测试）
// 待出现第 2、第 3 个相似切片后，再决定抽取共享 Helper`,
        patternSolution: `// 每个功能按「独立切片」验收：
// 1. specs/SPEC.md 定义该切片的输入边界、禁止修改范围与验收命令
// 2. 服务端单文件路由 + 单域服务落地核心不变量
// 3. 前端最小交互组件消费真实接口（附带 Empty/Error 态）
// 4. 切片级集成测试全绿后再开始下一个切片`,
        tradeoffsAndAntiExamples:
          "代价：初期两个切片之间可能存在少量可接受的重复代码（Rule of Three 前保留重复）。\n反例：第一天还没跑通登录就先搭通用 CRUD 代码生成器与微服务总线。",
        aiCollabProtocol:
          "每次仅让 AI 修改当前切片允许清单（`allowedGlobs`）内的 2~4 个文件，并在完成后立即跑 `tsc + lint + 切片测试`。",
        verificationChecks: [
          "用 `git diff --stat` 核查改动集中在当前切片路径，无顺带重写的无关页面",
          "一条真实业务流从前端点击到数据库持久化再刷新回显全部走通（非 Mock）",
        ],
        whenNotToUse:
          "全站底层统一横切关注点（如全局认证解析中间件、统一日志脱敏）已在团队基线稳定存在时，应直接复用现有横切中间件而非每个切片重写一遍。",
      },
    ],
    faultDrill: {
      id: "drill-arch-billing-leak",
      pairId: "pair-arch-fullstack",
      moduleIds: ["m9", "m3"],
      title: "故障演练：订阅升级切片越权与前后端混杂",
      scenarioContext:
        "你要求 AI 在 MVP 项目中添加「专业版升级与权益解锁」功能。AI 第一版运行起来“表面完全正常”，点击升级也能跳转成功页，但在上线安全评审前被测试打回。",
      buggyTitle: "AI 第一版输出（存在 3 处结构与安全坏味道）",
      buggyCode: `// src/components/UpgradeButton.tsx (UI 与计费信任混杂)
export function UpgradeButton({ userId }: { userId: number }) {
  async function handleCheckoutSuccess() {
    // 坏味道 A：客户端直接通知后端“我已付款”，未经过签名回调或门面隔离
    await fetch("/api/account/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan: "pro", isPaid: true }),
    });
    window.localStorage.setItem("pro_unlocked", "true");
  }
  return <button onClick={handleCheckoutSuccess}>完成支付并解锁</button>;
}

// src/server/routes/account.ts (无鉴权边界、无幂等锁)
app.post("/api/account/upgrade", async (req, res) => {
  const { userId, plan, isPaid } = req.body;
  if (isPaid) {
    await db.updateUserPlan(userId, plan);
  }
  res.json({ ok: true });
});`,
      reproductionTrace: [
        "curl -X POST /api/account/upgrade -d '{\"userId\":99,\"plan\":\"pro\",\"isPaid\":true}' -> HTTP 200 { ok: true }（未登录即篡改他人账户！）",
        "重放同一回调请求 3 次 -> 账户积分与有效期被重复累加 3 次",
        "静态审查发现 UI 层直接决定 `isPaid` 布尔真相并在 localStorage 缓存权威状态",
      ],
      smellOptions: [
        {
          id: "smell-client-trust",
          label: "信任客户端与越权缺口：由前端传 `userId`/`isPaid` 且服务端未鉴权（IDOR）",
          hint: "权限与付费真相必须源自服务端 Session + 验签回调",
          isActualSmell: true,
        },
        {
          id: "smell-mixed-layer",
          label: "分层混杂与缺少门面：支付回调处理与账本入库散落无隔离、缺少幂等锁",
          hint: "支付验签与幂等控制应集中在服务端受控门面/服务中",
          isActualSmell: true,
        },
        {
          id: "smell-no-microservice",
          label: "未拆分独立计费微服务与 Kafka 消息队列导致耦合",
          hint: "警惕！MVP 阶段拆微服务往往是典型的过度设计诱饵",
          isActualSmell: false,
        },
        {
          id: "smell-no-graphql",
          label: "使用了 REST JSON 接口而不是 GraphQL Federation",
          hint: "传输协议形式并非本缺陷根因",
          isActualSmell: false,
        },
      ],
      decisionOptions: [
        {
          id: "dec-patch-frontend-only",
          label: "仅在前端加密码弹窗并检查 `user.role` 后再发请求",
          category: "under-engineered",
          summary: "仍由 `/api/account/upgrade` 信任客户端参数，curl 绕过 UI 依然直接攻破。",
          patchPreview: `if (!currentUser.verified) return alert("请先付款"); // 仅前端拦截，服务端仍裸奔`,
          assertions: [
            {
              id: "a-auth",
              label: "未登录 curl 直调拒绝 (401/403)",
              passed: false,
              detail: "FAIL: 绕过前端直接 POST /api/account/upgrade 仍返回 200",
            },
            {
              id: "a-idempotency",
              label: "重复回调幂等锁不双倍入账",
              passed: false,
              detail: "FAIL: 缺少 eventId 幂等记录",
            },
            {
              id: "a-kiss",
              label: "控制改动复杂度（无多余抽象层）",
              passed: true,
              detail: "PASS: 未引入多余抽象，但核心安全边界未修复",
            },
          ],
          feedback:
            "不可接受：仅在浏览器 UI 层拦挡属于典型的客户端伪鉴权，无法通过服务端安全边界验收。",
        },
        {
          id: "dec-over-abstract-enterprise",
          label: "引入微服务拆分 + AbstractBillingFactory + 4 层 Repository/DI 容器",
          category: "over-abstracted",
          summary: "为了单一支付回调建了 7 个抽象接口、跨进程 RPC 与通用策略注册表，导致调试链路拉长 4 倍。",
          patchPreview: `interface IBillingProviderFactory { createStrategy(): AbstractCheckoutPipeline; }
// 为单一回调拆出 8 个文件，但仍需手写相同验签检查`,
          assertions: [
            {
              id: "a-auth",
              label: "未登录 curl 直调拒绝 (401/403)",
              passed: true,
              detail: "PASS: 网关拦截了未验签请求",
            },
            {
              id: "a-idempotency",
              label: "重复回调幂等锁不双倍入账",
              passed: true,
              detail: "PASS: 记录已处理事件 ID",
            },
            {
              id: "a-kiss",
              label: "控制改动复杂度（无多余抽象层）",
              passed: false,
              detail: "FAIL: 为单供应商 MVP 引入工厂层级与跨服务拆分，违反 KISS/YAGNI 原则",
            },
          ],
          feedback:
            "过度设计警示：虽然安全门禁能过，但在当前阶段人为制造大量空接口与跨服务调度，会显著增加 AI 幻觉率与个人/小团队维护成本。",
        },
        {
          id: "dec-layered-facade-slice",
          label: "采用「分层边界 + 轻量 Facade 门面 + 垂直切片」收口（推荐方案）",
          category: "right-sized",
          summary:
            "前端仅跳转结账并轮询 `/api/auth/me` 只读态；服务端新增单个 `billingGateway` 门面函数统一执行原始 Body 验签、幂等事件锁与事务入账，不建多供应商抽象工厂。",
          patchPreview: `// 1. UI 仅轮询只读会话态，移除 isPaid/userId 传参
// 2. 服务端门面收口：verifyWebhookSignature -> idempotencyLock(event.id) -> grantEntitlement(accountId)`,
          assertions: [
            {
              id: "a-auth",
              label: "未登录/伪造签名 curl 拒绝 (401/403)",
              passed: true,
              detail: "PASS: 缺少合法签名或伪造请求被门面在入口 401 拦截",
            },
            {
              id: "a-idempotency",
              label: "同 event.id 重放 2 次仅入账 1 次",
              passed: true,
              detail: "PASS: 第 2 次重放命中幂等键返回 { ok: true, deduplicated: true }",
            },
            {
              id: "a-kiss",
              label: "控制改动复杂度（无多余抽象层）",
              passed: true,
              detail: "PASS: 仅改动 1 个门面服务、1 条路由与 1 个 UI 组件，零多余工厂接口",
            },
          ],
          feedback:
            "判定通过：准确用最小分层与 Facade 隔离了外部回调验签和幂等状态，同时克制地保留单体垂直切片结构。",
        },
      ],
      antiOverAbstractionPrompt:
        "写明为何只用单一 `billingGateway` 门面模块，而不提前拆分独立微服务或编写 `AbstractPaymentFactory`：",
      antiOverAbstractionSample:
        "当前仅接入单一受控支付回调入口且团队人数 <= 5 人，单一服务端模块 Facade 已能完整隔离验签、幂等锁与密钥边界；只有当同时接入 3 家以上支付通道或吞吐瓶颈独立扩容时，再拆出 Strategy 注册表或独立服务。",
    },
  },
  {
    id: "pair-dod-harness",
    title: "M5 / M8 · DoD 自愈与长程 Harness 模式试点",
    subtitle: "针对无上限死循环、AI 改弱测试作弊与多会话/并发状态丢失",
    moduleIds: ["m5", "m8"],
    moduleLabel: "M5 DoD 与有界自愈 · M8 长程 Coding Harness",
    coreQuestion:
      "如何用显式状态机、幂等与有限重试熔断、以及检查点交接模式，让 AI 既能稳定推进长任务，又不会偷偷删测试或无限空转？",
    patterns: [
      {
        id: "pattern-state-machine",
        pairId: "pair-dod-harness",
        moduleCodes: ["M5", "M8"],
        name: "显式状态机",
        englishName: "Explicit State Machine",
        focusGoal: "把隐式布尔标志位组合收口为有限合法状态迁移表，防止状态覆盖与越级放行。",
        problemAndChangeAxis:
          "当任务同时用 `isRunning`、`isRetrying`、`hasError`、`isDone` 四个布尔变量表达进度时，极易出现“既报错又标记已完成”的非法态。变化方向是“业务生命周期阶段需要受控流转与审计”。",
        simplestImplementation: `// 若只有极简 2 态（未开始 / 已完成），单个 boolean 足够，勿套状态机框架`,
        patternSolution: `type TaskStatus = "pending" | "verifying" | "escalated_to_human" | "passed";
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ["verifying"],
  verifying: ["passed", "escalated_to_human"],
  escalated_to_human: ["verifying"], // 人工修正 Spec 后方可重跑
  passed: [], // 终态锁定
};
export function transitionTask(from: TaskStatus, to: TaskStatus): TaskStatus {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new Error(\`Illegal transition: \${from} -> \${to}\`);
  }
  return to;
}`,
        tradeoffsAndAntiExamples:
          "代价：每次状态新增都需显式更新迁移矩阵。\n反例：为只有两步的本地工具引入重型 XState 图形工作流引擎与持久化状态机总线。",
        aiCollabProtocol:
          "把合法状态枚举和迁移表写进 Spec；要求 AI 为每条非法迁移路径补 1 条抛出异常的单测。",
        verificationChecks: [
          "尝试从未验证态直接跃迁到 `passed`，确认抛出非法迁移错误",
          "核对状态表无任何未定义组合分支",
        ],
        whenNotToUse:
          "只有简单线性两态开关（开/关）且无回退、无审批门槛的局部 UI 控件。",
      },
      {
        id: "pattern-idempotency-bounded-retry",
        pairId: "pair-dod-harness",
        moduleCodes: ["M5"],
        name: "幂等与有限重试 + 熔断",
        englishName: "Idempotency, Bounded Retry & Circuit Breaker",
        focusGoal: "限定自愈循环最大次数（<= 3）并在连续同错或企图改弱测试时强制熔断交由人工接管。",
        problemAndChangeAxis:
          "无上限的“报错 -> 再改一遍”Agent 自愈会在 3 轮后开始删断言、`@ts-ignore` 或重复写脏数据。变化方向是“故障重试次数、失败类型与幂等执行结果必须有硬天花板”。",
        simplestImplementation: `// 对纯只读幂等检查，简单 for 循环重试 2 次并附带退出条件即可`,
        patternSolution: `export async function runBoundedHealing(maxAttempts = 3) {
  let lastErrorSignature = "";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (await hasUnauthorizedTestDiff()) {
      return { status: "circuit_broken", reason: "禁止修改锁定测试断言（Reward Hacking）" };
    }
    const result = await executeVerification();
    if (result.exitCode === 0) return { status: "passed", attempts: attempt };
    if (result.signature === lastErrorSignature) {
      return { status: "circuit_broken", reason: "连续相同失败，触发早停并移交人工定位" };
    }
    lastErrorSignature = result.signature;
    await applyScopedSourceFix(result.failureSummary, { idempotencyKey: \`fix-\${attempt}\` });
  }
  return { status: "circuit_broken", reason: \`超过上限 \${maxAttempts} 轮未收敛，已停止\` };
}`,
        tradeoffsAndAntiExamples:
          "代价：遇到需 4 次微调的简单样式报错也会暂停提示人类，需要人为按一次确认继续。\n反例：把 `maxAttempts` 设成 25，或遇到测试报错时自动放宽断言阈值以求跳出循环。",
        aiCollabProtocol:
          "在 `.cursorrules` 明确写入：修复源码时禁止改动 `tests/**` 预期断言；同一报错签名连续出现 2 次立刻停止并输出诊断摘要。",
        verificationChecks: [
          "故意制造不可通过的测试断言，验证循环严格在第 2~3 次终止并返回 `circuit_broken`",
          "故意在补丁中混入 `test.skip`，验证守卫门禁立刻拦截",
        ],
        whenNotToUse:
          "单次手动运行且由人逐行审查点击确认的小步调试，不需要自动重试脚本外壳。",
      },
      {
        id: "pattern-observer-checkpoint-handoff",
        pairId: "pair-dod-harness",
        moduleCodes: ["M8", "M5"],
        name: "检查点交接与事件解耦",
        englishName: "Checkpoint Handoff & Observer / Pub-Sub",
        focusGoal: "用外部状态文件（feature_list.json + ACC 交接卡）保持跨会话连续性，并用事件订阅解耦日志/审计副作用。",
        problemAndChangeAxis:
          "长会话超过 20 轮必发生上下文漂移；同时，主流程函数里硬编码堆砌通知、审计与缓存刷新会造成多 Worktree 文件写冲突。变化方向是“主流程状态锚点持久化 + 旁路副作用按事件订阅”。",
        simplestImplementation: `// 若只有一个后置动作（例如仅记录 1 行日志），直接调用函数比 Pub-Sub 更清晰透明`,
        patternSolution: `// 1. 检查点交接契约 (feature_list.json + ACC_HANDOFF.md)
//    只保存：当前切片目标、锁定契约、目录写白名单、最新验收退出码与下一步指令
// 2. 轻量事件解耦 (仅当存在审计/通知/指标等多方订阅且各自属不同目录时)
domainEvents.on("slice.verified", recordAuditTrail);
domainEvents.on("slice.verified", appendHandoffCheckpoint);`,
        tradeoffsAndAntiExamples:
          "代价：事件链路不如直接函数调用直观，排错时需要追踪订阅者列表。\n反例：为只有 1 个调用方的简单表单提交搭一套全局 async EventBus，导致调用栈断裂难以调试。",
        aiCollabProtocol:
          "阶段结束强制生成 <= 15 行的 ACC 检查点交接卡并重开纯净新会话；多 Agent 并发时用 Git Worktree 分目录所有权。",
        verificationChecks: [
          "关闭原会话仅凭 ACC 交接卡与 `feature_list.json` 启动新会话，核对未丢失禁改目录约束",
          "确认主流程不因审计日志等旁路订阅细节改动而频繁修改核心路由文件",
        ],
        whenNotToUse:
          "单会话 5 轮内能收尾的小修改，或只有单一同步副作用的函数，严禁为“显得解耦”强上 Pub-Sub 总线。",
      },
    ],
    faultDrill: {
      id: "drill-dod-runaway-healing",
      pairId: "pair-dod-harness",
      moduleIds: ["m5", "m8"],
      title: "故障演练：无界自愈死循环与测试断言篡改",
      scenarioContext:
        "团队编写了一个自动修复脚本配合长程编码任务。某次库存扣减测试报错，Agent 在无人看守下连跑了十多轮后回报“所有测试已通过”，但上线检查时发现核心业务测试已被架空。",
      buggyTitle: "有缺陷的自动修复与交接片段",
      buggyCode: `// scripts/autoFixLoop.ts (无熔断上限 + 允许改测试 + 无外部检查点)
export async function healUntilGreen(taskContext: string[]) {
  while (true) {
    const passed = await runTests();
    if (passed) return { ok: true };
    // 坏味道 A：无 maxAttempts 上限，且把全部文件(含 tests/) 传给 AI 自由改写
    const patch = await askAiToMakeTestsPass(taskContext);
    await applyPatchAnywhere(patch); // AI 第 4 轮改写了 tests/inventory.test.ts 期待值！
    // 坏味道 B：仅靠内存数组堆积历史，崩溃或重开后状态全丢
    taskContext.push(patch.summary);
  }
}`,
      reproductionTrace: [
        "Round 1–3: AI 连续 3 次修错同一行边界条件，耗时并消耗大量上下文",
        "Round 4: AI 将 `expect(stock).toBe(0)` 改为 `expect(stock).toBeDefined()`，随后返回 `{ ok: true }`",
        "会话中断重开：未写检查点文件与目录范围锁，新会话不知道上一轮修改了测试文件",
      ],
      smellOptions: [
        {
          id: "smell-unbounded-loop",
          label: "缺少有限重试与熔断停机条件（`while (true)` 无上限且不检测连续同错）",
          hint: "自愈循环必须有硬上限与早停交接机制",
          isActualSmell: true,
        },
        {
          id: "smell-reward-hacking",
          label: "测试边界失守（允许补丁修改 `tests/` 断言来制造绿灯假象）",
          hint: "修业务 Bug 时测试期望必须是只读受保护状态",
          isActualSmell: true,
        },
        {
          id: "smell-missing-checkpoint",
          label: "缺少外部检查点与交接状态（仅靠增长 `taskContext` 数组维持状态）",
          hint: "应外化为结构化检查点/ACC 交接记录",
          isActualSmell: true,
        },
        {
          id: "smell-no-event-sourcing",
          label: "没有用分布式 Event Sourcing 重构整套脚手架",
          hint: "过度架构诱饵：简单检查点 JSON 已足矣",
          isActualSmell: false,
        },
      ],
      decisionOptions: [
        {
          id: "dec-raise-loop-limit",
          label: "把 `while (true)` 改成 `for (i = 0; i < 20; i++)`，其余保持不变",
          category: "under-engineered",
          summary: "仍然放任 AI 改测试文件凑绿灯，20 轮空转同样浪费严重且无状态交接。",
          patchPreview: `for (let i = 0; i < 20; i++) { await applyPatchAnywhere(patch); }`,
          assertions: [
            {
              id: "a-retry-cap",
              label: "自愈重试受限于 <= 3 轮并按同错熔断",
              passed: false,
              detail: "FAIL: 仍可能连续空转 20 轮且无重复错误早停",
            },
            {
              id: "a-test-lock",
              label: "拦截修改 tests/ 核心断言或 .skip（防作弊）",
              passed: false,
              detail: "FAIL: `applyPatchAnywhere` 依然允许改写测试断言",
            },
            {
              id: "a-kiss",
              label: "状态交接轻量清晰（无重型消息框架）",
              passed: true,
              detail: "PASS: 代码行数很少，但关键防线全部缺失",
            },
          ],
          feedback:
            "校验未通过：仅调大循环次数并不能阻止测试篡改（Reward Hacking）与长会话状态漂移。",
        },
        {
          id: "dec-heavy-saga-orchestrator",
          label: "引入分布式 Saga 编排引擎 + Redis 消息队列 + 5 级抽象状态插件",
          category: "over-abstracted",
          summary: "为了管理本地单机 3 轮验证循环引入分布式事务协调器与独立中间件集群。",
          patchPreview: `const saga = new DistributedSagaOrchestrator({ redisUrl, brokers: 3 });
saga.registerPlugin(new GenericRetryPlugin());`,
          assertions: [
            {
              id: "a-retry-cap",
              label: "自愈重试受限于 <= 3 轮并按同错熔断",
              passed: true,
              detail: "PASS: 策略配置限制了 3 次尝试",
            },
            {
              id: "a-test-lock",
              label: "拦截修改 tests/ 核心断言或 .skip（防作弊）",
              passed: true,
              detail: "PASS: 校验脚本检测了测试文件变更",
            },
            {
              id: "a-kiss",
              label: "状态交接轻量清晰（无重型消息框架）",
              passed: false,
              detail: "FAIL: 本地单机脚手架引入分布式 Saga 与 Redis 依赖，部署与调试成本暴增",
            },
          ],
          feedback:
            "过度设计警示：本地测试门禁与交接文件应零重型外部基础设施依赖；引入 Saga/Redis 反而让故障排查重心偏离业务源码。",
        },
        {
          id: "dec-state-circuit-checkpoint",
          label: "采用「显式状态机 + 有限重试(<=3)熔断 + 检查点交接」收口（推荐方案）",
          category: "right-sized",
          summary:
            "用 4 态显式流转表控制生命周期，设定 `maxAttempts = 3` 与 tests/ 只读 Diff 拦截守卫，熔断或交接时只写入轻量 `ACC_HANDOFF.md` 与 `feature_list.json`。",
          patchPreview: `// 状态: pending -> verifying -> (passed | circuit_broken)
// 守卫: if (touchedProtectedTests(diff)) breakWith("Reward Hacking Blocked");
// 交接: writeCheckpointJson({ goal, lockedContracts, lastExitCode, nextStep });`,
          assertions: [
            {
              id: "a-retry-cap",
              label: "自愈重试受限于 <= 3 轮并按同错熔断",
              passed: true,
              detail: "PASS: 第 3 轮失败或连续同错立刻切换 `circuit_broken` 等待人介入",
            },
            {
              id: "a-test-lock",
              label: "拦截修改 tests/ 核心断言或 .skip（防作弊）",
              passed: true,
              detail: "PASS: 检测到擅改测试断言即刻阻断并标红",
            },
            {
              id: "a-kiss",
              label: "状态交接轻量清晰（无重型消息框架）",
              passed: true,
              detail: "PASS: 仅用本地结构化 JSON 检查点 + 有限循环实现，无额外中间件",
            },
          ],
          feedback:
            "判定通过：以最小结构实现了状态可控、测试防篡改与跨会话断点续跑，没有引入不必要的事件引擎。",
        },
      ],
      antiOverAbstractionPrompt:
        "写明为何只使用显式枚举状态表与本地 JSON 检查点，而不引入 XState/Saga 或通用分布式事件总线：",
      antiOverAbstractionSample:
        "当前只有 4 个明确状态（pending / verifying / circuit_broken / passed）且跑在单机本地研发 Harness 环境，一个 15 行的枚举迁移表与 JSON 检查点即可满足跨会话交接和熔断；除非未来演化出跨进程并发工作流编排，否则无需引入重型状态机库或消息队列。",
    },
  },
];

export function getPilotGroupForModule(moduleId: string): DesignPatternPilotGroup | null {
  return (
    STAGE1_PILOT_GROUPS.find((g) => g.moduleIds.includes(moduleId as Stage1PilotModuleId)) ?? null
  );
}

export interface FaultDrillEvaluationResult {
  passed: boolean;
  smellMatchedCount: number;
  actualSmellCount: number;
  falseSmellPickedCount: number;
  decisionCategory: FaultDrillDecisionOption["category"] | null;
  assertions: FaultDrillAssertion[];
  antiOverAbstractionValid: boolean;
  summaryMessage: string;
}

export function evaluateFaultDrill(input: {
  drill: FaultDrillScenario;
  selectedSmellIds: string[];
  selectedDecisionId: string | null;
  antiOverAbstractionNote: string;
}): FaultDrillEvaluationResult {
  const actualSmells = input.drill.smellOptions.filter((s) => s.isActualSmell);
  const actualIds = new Set(actualSmells.map((s) => s.id));
  const selectedSet = new Set(input.selectedSmellIds);

  let smellMatchedCount = 0;
  let falseSmellPickedCount = 0;
  for (const sid of selectedSet) {
    if (actualIds.has(sid)) {
      smellMatchedCount += 1;
    } else {
      falseSmellPickedCount += 1;
    }
  }

  const decision = input.drill.decisionOptions.find((d) => d.id === input.selectedDecisionId) ?? null;
  const assertions = decision ? decision.assertions : [];
  const allAssertionsPassed =
    assertions.length > 0 && assertions.every((a) => a.passed);

  const noteLen = input.antiOverAbstractionNote.trim().length;
  const antiOverAbstractionValid = noteLen >= 16;

  const smellsReady = smellMatchedCount >= 1 && falseSmellPickedCount === 0;
  const passed = Boolean(
    smellsReady &&
      decision?.category === "right-sized" &&
      allAssertionsPassed &&
      antiOverAbstractionValid
  );

  let summaryMessage = "请依次完成坏味道勾选、方案决策与反过度抽象说明后运行验证。";
  if (falseSmellPickedCount > 0) {
    summaryMessage =
      "坏味道诊断中混入了「过度设计诱饵」（如微服务或分布式事件总线），请重新核对真正导致故障的原因。";
  } else if (smellMatchedCount === 0) {
    summaryMessage = "请至少识别出 1 类真实的坏味道再推进方案重构。";
  } else if (!decision) {
    summaryMessage = "请选择 1 项修复重构方案以运行确定性验收断言。";
  } else if (decision.category !== "right-sized") {
    summaryMessage = decision.feedback;
  } else if (!antiOverAbstractionValid) {
    summaryMessage =
      "代码验收断言已全绿，但还需填写不少于 16 字的「反过度抽象说明」，阐明为何不采用更复杂抽象。";
  } else if (passed) {
    summaryMessage =
      "Stage 1 故障演练验收全过：已识别真实坏味道、选定克制模式、跑通确定性断言并附带反过度抽象说明。";
  }

  return {
    passed,
    smellMatchedCount,
    actualSmellCount: actualSmells.length,
    falseSmellPickedCount,
    decisionCategory: decision?.category ?? null,
    assertions,
    antiOverAbstractionValid,
    summaryMessage,
  };
}

export function buildPatternPilotEvidenceMarkdown(input: {
  moduleCode: string;
  group: DesignPatternPilotGroup;
  selectedPattern: DesignPatternCard;
  selectedSmellLabels: string[];
  selectedDecision: FaultDrillDecisionOption | null;
  evaluation: FaultDrillEvaluationResult;
  antiOverAbstractionNote: string;
}): string {
  const assertionsLines =
    input.evaluation.assertions.length > 0
      ? input.evaluation.assertions
          .map((a) => `- [${a.passed ? "x" : " "}] ${a.label} — ${a.detail}`)
          .join("\n")
      : "- [ ] 尚未运行故障演练验收断言";

  return [
    `## ${input.moduleCode} 设计模式与架构边界决策记录（Stage 1 试点）`,
    ``,
    `- 重点对照模式：${input.selectedPattern.name}（${input.selectedPattern.englishName}）`,
    `- 问题与变化方向：${input.selectedPattern.problemAndChangeAxis}`,
    ``,
    `### 1. 故障演练坏味道诊断（${input.group.faultDrill.title}）`,
    input.selectedSmellLabels.length > 0
      ? input.selectedSmellLabels.map((l) => `- 已识别：${l}`).join("\n")
      : `- 尚未勾选坏味道`,
    ``,
    `### 2. 模式选择与确定性验收结果`,
    `- 选定方案：${input.selectedDecision ? input.selectedDecision.label : "未选定"}`,
    assertionsLines,
    ``,
    `### 3. 反过度抽象说明（KISS / YAGNI 边界）`,
    input.antiOverAbstractionNote.trim() || input.group.faultDrill.antiOverAbstractionSample,
    `- 何时不该使用「${input.selectedPattern.name}」：${input.selectedPattern.whenNotToUse}`,
  ].join("\n");
}
