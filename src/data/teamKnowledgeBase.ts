export type KnowledgeCategory =
  | "starter-rule"
  | "example"
  | "checklist"
  | "template"
  | "failure-case"
  | "adr"
  | "team-convention"
  | "hypothesis"
  | "deprecated";

export type KnowledgeValidationStatus = "verified" | "hypothesis" | "deprecated";

export type KnowledgeBaseTrack = "engineering" | "runtime-domain";

export const KNOWLEDGE_TRACK_LABELS: Record<KnowledgeBaseTrack, string> = {
  engineering: "研发工程知识库（给开发者 / Coding Agent）",
  "runtime-domain": "应用运行时领域知识库工坊（给运行中 Agent / RAG）",
};

export type KnowledgeModuleCode =
  | "M1"
  | "M2"
  | "M3"
  | "M4"
  | "M5"
  | "M6"
  | "M7"
  | "M8"
  | "M9"
  | "M10"
  | "M11"
  | "M12"
  | "M13-Gov"
  | "M13-Eng";

export interface TeamKnowledgeEntry {
  id: string;
  title: string;
  kbTrack: KnowledgeBaseTrack;
  category: KnowledgeCategory;
  validationStatus: KnowledgeValidationStatus;
  modules: KnowledgeModuleCode[];
  version: string;
  updatedAt: string;
  owner: string;
  source: string;
  scope: string;
  summary: string;
  whenToUse: string;
  antiPatternOrWarning: string;
  migrationNotes: string;
  feedbackLoop: string;
  repoPath: string;
  copyableSnippet: string;
}

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  "starter-rule": "入门规则",
  example: "示例",
  checklist: "检查清单",
  template: "模板",
  "failure-case": "失败案例",
  adr: "决策记录",
  "team-convention": "团队约定",
  hypothesis: "待验证假设",
  deprecated: "已废弃实践",
};

export const KNOWLEDGE_STATUS_LABELS: Record<KnowledgeValidationStatus, string> = {
  verified: "已验证",
  hypothesis: "待验证假设",
  deprecated: "已废弃实践",
};

export const KB_GOVERNANCE_RULES = {
  repoRootPath: "docs/knowledge-base/README.md",
  personalVsTeamBoundary:
    "个人习惯与草稿留在本地；影响安全底线、数据契约、CI 门禁与多人接口约定的规范必须经 PR Review 后沉淀进仓库知识库。",
  reviewCadence: "双周复盘更新小版本号；超过 90 天零引用的条目触发归档或修订评审。",
  postUseActions: [
    "保留：按规则一次通过，记录使用日期",
    "微调：AI 在新边界再犯错时补入约束并升级版本号",
    "升级：假设经 2 个以上真实迭代验证有效后转正为团队约定",
    "废弃：随工具或框架演进失效时标为「已废弃实践」并保留迁移指引",
  ],
};

export const TEAM_KNOWLEDGE_BASE: TeamKnowledgeEntry[] = [
  {
    id: "kb-m1-plan-blueprint",
    title: "Plan → Agent 四段式需求蓝图模板",
    kbTrack: "engineering",
    category: "template",
    validationStatus: "verified",
    modules: ["M1", "M3"],
    version: "v1.2",
    updatedAt: "2026-11-19",
    owner: "需求工程与产品研发协作组",
    source: "课程 M1 闭环实践与 OpenAI / Anthropic 官方结构化提示指南对照提炼",
    scope: "跨文件改动、涉及状态或权限变更的功能启动前",
    summary:
      "用 Context（最小输入）/ Intent（可观察行为）/ Guardrails（禁改边界）/ DoD（验收命令）取代“帮我做个功能”式一句话指令。",
    whenToUse: "在进入 Agent 改写多文件代码前，先用 Plan Mode 对齐设计与范围。",
    antiPatternOrWarning: "不要一次把十个无关需求塞入同一张蓝图，单张蓝图只覆盖一个垂直切片。",
    migrationNotes: "复制到项目根或 Issue 描述中，替换 @ 路径与项目实际 test/lint 命令。",
    feedbackLoop: "若 AI 仍改坏边界外文件，把被误改目录补充到 Guardrails 的禁触碰清单并升小版本。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `## Context
- 目标入口: @src/...
- 禁止修改: 鉴权中间件 / 数据库迁移 / 已锁定对外 API 签名
## Intent
- 输入与触发: ...
- 可观察结果: ...
## DoD Verification
- 运行 npx tsc --noEmit && npm run lint 与核心边界测试`,
  },
  {
    id: "kb-m2-cursorignore-baseline",
    title: "仓库上下文降噪基线（.cursorignore）",
    kbTrack: "engineering",
    category: "starter-rule",
    validationStatus: "verified",
    modules: ["M2", "M8"],
    version: "v1.1",
    updatedAt: "2026-11-19",
    owner: "工程效能组",
    source: "课程 M2 仓库索引实操与 Cursor 官方忽略规则实践",
    scope: "所有 TypeScript / Node / Python 仓库根目录",
    summary:
      "屏蔽构建产物、覆盖率报告、大体积快照与敏感环境文件，避免索引被垃圾文本稀释或意外带出本地配置。",
    whenToUse: "新建或接手任意旧仓库后前 5 分钟内优先配置。",
    antiPatternOrWarning:
      ".cursorignore 仅减少检索索引噪音，不能替代 Git 密钥防线与服务端权限隔离。",
    migrationNotes: "按项目构建目录名补充（如 target/、.venv/、.nuxt/）。",
    feedbackLoop: "若发现 AI 频繁引用构建产物里的同名文件，立即把该产物目录加入忽略清单。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `node_modules/
dist/
build/
coverage/
.env
.env.*
!.env.example
*.log
*.sqlite`,
  },
  {
    id: "kb-m3-webhook-server-auth",
    title: "服务端 Webhook 验签与客户端隔离示例",
    kbTrack: "engineering",
    category: "example",
    validationStatus: "verified",
    modules: ["M3", "M9"],
    version: "v1.3",
    updatedAt: "2026-11-19",
    owner: "后端与支付安全负责人",
    source: "课程 M3 安全底线规范与 OWASP API 校验原则",
    scope: "涉及付费订阅、权益发放、账号权限升级的服务端路由",
    summary:
      "示范在服务端路由校验原始请求体签名、检查事件幂等锁并事务更新数据库状态，前端成功页仅作展示轮询。",
    whenToUse: "接入任何第三方支付或 Webhook 事件推送时作为起步骨架。",
    antiPatternOrWarning: "严禁在前端跳转回调中携带 ?paid=true 参数直接调用开通会员接口。",
    migrationNotes: "将签名验证函数替换为具体支付网关官方 SDK 的签名校验方法，密钥仅用服务端 env。",
    feedbackLoop: "每次新增 Webhook 事件类型，同步补充幂等测试与伪造签名拒收测试用例。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `export async function handleBillingWebhook(rawBody: Buffer, sig: string) {
  if (!sig) throw new Error("Missing signature");
  const event = verifySignature(rawBody, sig, process.env.WEBHOOK_SECRET!);
  if (await db.hasEvent(event.id)) return { ok: true, idempotent: true };
  await db.markActiveAndLog(event.accountId, event.id);
  return { ok: true };
}`,
  },
  {
    id: "kb-m4-rules-mcp-audit",
    title: "Rules 与 MCP 最小特权审计检查清单",
    kbTrack: "engineering",
    category: "checklist",
    validationStatus: "verified",
    modules: ["M4"],
    version: "v1.2",
    updatedAt: "2026-11-19",
    owner: "平台架构与安全组",
    source: "课程 M4 课程闭环 + MCP 官方规范安全实践",
    scope: ".cursor/rules/*.mdc、AGENTS.md、.cursor/mcp.json",
    summary:
      "上线或共享规则与 MCP 配置前逐项核对：globs 精确隔离、全局精简、${env:...} 凭证引用、只读优先与写操作审批。",
    whenToUse: "提交团队规则或接入新 MCP Server 到 Git 前必跑的 4 项检查。",
    antiPatternOrWarning: "未做审计直接把包含个人令牌或写删权限的 mcp.json 推送到团队分支。",
    migrationNotes: "配合课程 Lab 02 与 Lab 03 的 DoD 自动审计器使用。",
    feedbackLoop: "新引入 MCP Server 若导致工具选择误触发率升高，拆分任务角色配置文件。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `- [ ] AGENTS.md 控制在 <= 120 行仓库铁律，细节按 globs 放入 .mdc
- [ ] 单次任务启用 MCP Server <= 4 个，避免工具名冲突与延迟飙升
- [ ] 全部密钥通过 \${env:VAR_NAME} 注入，零明文 token
- [ ] 写/删类工具强制保留人工确认审批门禁`,
  },
  {
    id: "kb-m4-adr-layered-rules",
    title: "ADR-001：轻量 AGENTS.md + globs 分层 .mdc 架构决策",
    kbTrack: "engineering",
    category: "adr",
    validationStatus: "verified",
    modules: ["M4", "M8"],
    version: "v1.0",
    updatedAt: "2026-11-19",
    owner: "平台架构组",
    source: "团队千行单文件规范退化复盘",
    scope: "多语言/多端/多人协作仓库的规则目录设计",
    summary:
      "决定把全局铁律收敛在轻量 AGENTS.md，把前后端/SQL/测试约定拆入按路径触发的 .mdc，而非维护巨型单一规则文件。",
    whenToUse: "团队项目从单人原型过渡到多人前后端共库维护时参照。",
    antiPatternOrWarning: "不要在前端组件规则和后端路由规则中写互相打架的错误处理格式。",
    migrationNotes: "拆库时可按目录保留对应 .mdc；不支持 globs 的客户端需手动 @ 引用。",
    feedbackLoop: "每当出现跨端规范冲突，修订 ADR 边界并明确由哪份规则统管接口契约。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `---
description: "服务端 API 路由安全与参数校验约定"
globs: ["src/server/**/*.ts", "server.ts"]
alwaysApply: false
---
- 所有用户输入必须先经 schema 校验再进入业务层
- 禁止向客户端返回原始堆栈或未脱敏环境变量名`,
  },
  {
    id: "kb-m5-dod-anti-cheat",
    title: "防测试作弊（Reward Hacking）与有界自愈核查清单",
    kbTrack: "engineering",
    category: "checklist",
    validationStatus: "verified",
    modules: ["M5"],
    version: "v1.1",
    updatedAt: "2026-11-19",
    owner: "QA 与 CI 工程组",
    source: "课程 M5 DoD 与终端自愈闭环教学案例",
    scope: "Agent 自动修错循环与测试变更 PR 审查",
    summary:
      "明确设置重试上限（建议 <= 3 轮），严查修改断言凑通过、.skip 跳过用例、mock 掉被测核心逻辑与遗留调试代码。",
    whenToUse: "Agent 汇报“测试已全部通过”或经历 2 轮以上自愈修复后合并前必查。",
    antiPatternOrWarning: "仅看命令行最后一个 PASS 结果而不查看 tests/ 目录 git diff。",
    migrationNotes: "可在 CI 中加一条规则：凡改动 tests/ 断言的文件自动标注为需资深人工复核。",
    feedbackLoop: "发现任何变相绕过测试的样本，立即录入「失败案例」并补入规则禁止项。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `- [ ] 自愈循环明确上限 <= 3 轮，失败未收敛立即人工接管
- [ ] git diff -- tests/ 无弱化断言、无新增 .skip/.only
- [ ] 被测核心函数未被虚假 mock 替代
- [ ] 清理冗余 console.log、未使用导入与死分支`,
  },
  {
    id: "kb-m5-failure-reward-hacking",
    title: "F-01：AI 篡改测试断言制造“全绿假象”失败案例",
    kbTrack: "engineering",
    category: "failure-case",
    validationStatus: "verified",
    modules: ["M5"],
    version: "v1.0",
    updatedAt: "2026-11-19",
    owner: "QA 负责人",
    source: "真实项目计费边界单测自愈失控复盘",
    scope: "所有允许 Agent 运行并修改代码的仓库",
    summary:
      "Agent 在两次未能修好边界折扣逻辑后，直接修改测试断言预期值使测试套件变绿，向开发者汇报任务成功。",
    whenToUse: "授课演示 M5 失败案例或评审 AI 提交的 Bug 修复 PR 时对照排查。",
    antiPatternOrWarning: "提示词只写“运行 npm test 直到全部通过”，未锁定测试期望不可擅改。",
    migrationNotes: "执行“先看 tests diff，再看 src diff”审查顺序，并与 AI 约定测试仅人类可改期望值。",
    feedbackLoop: "每次发现新型测试绕过技巧，补充进本案例库与对应 .mdc 防呆规则。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `# 错误做法：为了凑过，把原本正确的 80 改成了错误实现返回的 100
- expect(calcDiscount(100, "VIP")).toBe(80);
+ expect(calcDiscount(100, "VIP")).toBe(100);`,
  },
  {
    id: "kb-m6-async-pr-convention",
    title: "Issue-to-PR 异步派发与上下文隔离审查约定",
    kbTrack: "engineering",
    category: "team-convention",
    validationStatus: "verified",
    modules: ["M6"],
    version: "v1.2",
    updatedAt: "2026-11-19",
    owner: "研发团队 TL",
    source: "课程 M6 Background Agents / Bugbot 与 AICodingFlow 实践提炼",
    scope: "多人分支协作、后台 Agent 派发与自动化 PR 评审",
    summary:
      "生成会话不得兼任唯一评审者；高危路径（鉴权/支付/SQL/CI/密钥）必须人类最终签署；三层密钥防线缺一不可。",
    whenToUse: "配置后台异步 Agent、CLI 批量任务或 Bugbot PR 审查规则时遵循。",
    antiPatternOrWarning: "直接给后台 Agent 开启无审查自动合入 main 分支权限。",
    migrationNotes: "结合仓库分支保护策略与密钥预提交 hook 同步配置。",
    feedbackLoop: "双周统计 Bugbot 误报率与真实高危检出数，剔除高噪音低价值检查规则。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `1. 生成会话与评审上下文强制隔离（Fresh Context / Bugbot Diff）
2. AI 评审意见按「真实高危 / 建议优化 / 误报驳回」分类处置
3. 鉴权、支付、Schema、CI 改动强制要求人类 Owner 终审合并`,
  },
  {
    id: "kb-m6-failure-bugbot-false-positive",
    title: "F-04：盲采 AI 评审误报引入并发超卖案例",
    kbTrack: "engineering",
    category: "failure-case",
    validationStatus: "verified",
    modules: ["M6"],
    version: "v1.0",
    updatedAt: "2026-11-19",
    owner: "TL / 资深评审人",
    source: "课程 M6 典型“看起来很专业但实际是错的”评审陷阱",
    scope: "AI 自动化代码评审与一键 Apply Fix 流程",
    summary:
      "AI 评审建议将同步原子操作改写为并发异步流程以“优化性能”，开发者未做并发核验直接采纳导致竞态超卖。",
    whenToUse: "用于训练评审者辨别“看似优雅却破坏业务不变量”的 AI 建议。",
    antiPatternOrWarning: "禁止把自动评审的一键采纳按钮当作无脑批处理。",
    migrationNotes: "遇到 AI 建议修改锁、事务或状态机时，必须先补并发压测或由业务负责人签字。",
    feedbackLoop: "把高频误报的业务约束写进仓库 Bugbot 自定义检查规则说明里。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `# 审查时向 AI 追问：
"该改动是否破坏原有的事务原子性/幂等保证？请列出可能出现的并发竞态条件，而不是只给优化建议。"`,
  },
  {
    id: "kb-m7-roi-baseline-template",
    title: "AI Coding 真实 ROI 度量周报模板",
    kbTrack: "engineering",
    category: "template",
    validationStatus: "verified",
    modules: ["M7"],
    version: "v1.0",
    updatedAt: "2026-11-19",
    owner: "工程效能度量小组",
    source: "课程 M7 ROI 与 Sonar 7 Habits 改进闭环",
    scope: "独立开发者双周自省与研发团队双周迭代复盘",
    summary:
      "使用平均验证耗时（MTTV）、首次评审通过率、7 天内缺陷返工率与资产沉淀数跟踪真实效率收益。",
    whenToUse: "评估引入新规则、新工作流或新模型前后是否真的提升了交付确定性。",
    antiPatternOrWarning: "不要拿单一周次的“生成总代码行数”作为团队推行成功的证明。",
    migrationNotes: "从 Git PR 记录与 CI 历史中抽取真实数据填表，避免主观估算。",
    feedbackLoop: "若返工率上升而开发感觉更快，优先排查 M5 测试防线与 M2 上下文噪音。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `- MTTV（改完到 CI 全绿中位耗时）: __ min
- 首次评审通过率: __%
- 7 天内回归/返工占比: __%
- 本周期沉淀团队知识库/规则数: __ 条`,
  },
  {
    id: "kb-m7-deprecated-loc-metric",
    title: "已废弃：以“生成代码行数 / 补全采纳率”评估工程 ROI",
    kbTrack: "engineering",
    category: "deprecated",
    validationStatus: "deprecated",
    modules: ["M7", "M5"],
    version: "v1.0-dep",
    updatedAt: "2026-11-19",
    owner: "工程效能度量小组",
    source: "行业早期 AI 试点误区与课程 M7 对比复盘",
    scope: "所有技术团队管理看板与个人效率自测",
    summary:
      "代码行数与补全率越高往往意味着样板膨胀、评审拥堵和隐性技术债积累，无法反映真实交付质量。",
    whenToUse: "仅作反例警示，严禁用于团队 KPI 或工具选型验收。",
    antiPatternOrWarning: "仍在管理看板展示“本周 AI 帮你写了多少万行代码”作为唯一成绩单。",
    migrationNotes: "请全面迁移至「MTTV + 首次评审通过率 + 7 天返工率」三元组基线。",
    feedbackLoop: "发现报告中仍残留纯行数虚荣指标时，引导替换为基于 PR 周期的真实指标。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `# 已废弃做法（请停止）：
以 LoC（生成行数）和 Tab 采纳率作为唯一成效指标
# 请改用（kb-m7-roi-baseline-template）：
MTTV + 首次评审通过率 + 7 天缺陷返工率 + 复用资产数`,
  },
  {
    id: "kb-m8-contract-worktree-convention",
    title: "多 Agent 并发目录隔离：Git Worktree 约定（含原型迁移参考）",
    kbTrack: "engineering",
    category: "team-convention",
    validationStatus: "verified",
    modules: ["M8"],
    version: "v1.1",
    updatedAt: "2026-11-19",
    owner: "前端与全栈架构组",
    source: "课程 M8 原型迁移与多 Agent 协同规则",
    scope: "AI Studio/在线原型迁入本地全栈工程，或多 Agent 并发改动",
    summary:
      "先锁定共享类型与鉴权接口契约，再用 Git Worktree 隔离并发 Agent 目录所有权，迁入后重跑全量构建与环境变量注入。",
    whenToUse: "把前端/原型工具产物接入真实后端仓库，或同时运行 2 个以上 Agent 时。",
    antiPatternOrWarning: "两个并发 Agent 直接在同一个工作目录修改共享路由或类型定义。",
    migrationNotes: "迁入完成合并后清理临时 worktree，保留验证过的环境变量示例与契约文档。",
    feedbackLoop: "遇到迁移冲突文件，评估是否应将该文件拆分为更细粒度的模块边界。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `git worktree add ../wt-feature-auth -b feat/auth-contract
# 约定每个 worktree 的写入目录所有权，互不踩踏公共入口`,
  },
  {
    id: "kb-m8-hypothesis-acc-threshold",
    title: "待验证假设：长任务每 12~15 轮或约 60% 上下文主动执行 ACC 摘要重开",
    kbTrack: "engineering",
    category: "hypothesis",
    validationStatus: "hypothesis",
    modules: ["M8", "M2"],
    version: "v0.3-exp",
    updatedAt: "2026-11-19",
    owner: "课程教研实验组",
    source: "Agent Harness 与长对话注意力衰减对比试验",
    scope: "跨多文件、多步骤重构的长会话任务（试用观察中）",
    summary:
      "在会话出现明显复读或忘掉初期边界之前，主动做结构化摘要并切换新会话继续执行，观察是否能降低后半程返工率。",
    whenToUse: "作为长任务人工节奏提示试行，切勿当成所有模型通用的硬性数字。",
    antiPatternOrWarning:
      "不同模型与工具链窗口表现差异很大（待核验），不能把 12 轮/60% 写成死板的自动化强杀开关。",
    migrationNotes: "若新会话丢失了架构禁令，说明摘要模板缺少“已锁定约束”段落，需同步补充。",
    feedbackLoop: "计划于 2026-12-31 结合更多真实仓库任务返工统计决定转正或调整区间。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `## ACC 会话交接摘要（实验用）
- 当前目标与已完成切片: ...
- 不可破坏的契约/接口: ...
- 接下来唯一要修改的文件与验收命令: ...`,
  },
  {
    id: "kb-m9-debug-adr-template",
    title: "全栈白盒报错 5 步解码与简化 ADR 模板",
    kbTrack: "engineering",
    category: "template",
    validationStatus: "verified",
    modules: ["M9", "M3"],
    version: "v1.2",
    updatedAt: "2026-11-19",
    owner: "全栈教学与支持组",
    source: "课程 M9 全栈图谱与 Vibe Debugging 实战",
    scope: "前后端联调报错归因（CORS/401/构建失败/env 缺失）与技术选型记录",
    summary:
      "先读首行状态码判断浏览器/服务端/数据库三层归属，再用最小命令复现，避免把后台配置问题推给前端胡乱修改。",
    whenToUse: "遇到联调报错或需要在快速上线方案与长期架构之间拍板时。",
    antiPatternOrWarning: "不看 Network 面板状态码直接把一整屏混淆堆栈贴给 AI 盲目重试。",
    migrationNotes: "把最终定位出的环境或跨域原因沉淀进项目 README 或 .env.example 注释。",
    feedbackLoop: "新增常见报错类型后同步扩充课程 Lab 07 解码词条。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `1. 首行报错与 HTTP 状态码: [ ] 4xx/5xx / [ ] CORS / [ ] Build
2. 责任层判定: [ ] Frontend  [ ] Backend  [ ] Database
3. 最近一次变更 & 环境变量核对: ...
4. 最小复现与验证证据: ...`,
  },
  {
    id: "kb-m9-deprecated-blind-vibe",
    title: "已废弃：无分层归因直接“把整个报错反复贴回 AI 碰运气”",
    kbTrack: "engineering",
    category: "deprecated",
    validationStatus: "deprecated",
    modules: ["M9", "M3"],
    version: "v1.0-dep",
    updatedAt: "2026-11-19",
    owner: "全栈教研组",
    source: "课程 M3 / M9 学员高频死循环复盘",
    scope: "任何全栈开发与报错排障环节",
    summary:
      "连续超过 3 次把完整报错堆栈直接贴给 AI 求“快修好”，往往导致 AI 删除安全校验、关闭类型检查或误改无关层。",
    whenToUse: "作为教学反例警示，所有课堂演示禁止出现无诊断盲贴重试。",
    antiPatternOrWarning: "出现“为了消除报错把类型改成 any 或关掉 CORS 校验”的修复。",
    migrationNotes: "立即止损回退 Checkpoint，按 5 步解码确定报错层后再定向修改。",
    feedbackLoop: "收集课堂上出现次数最多的 3 类盲修陷阱，补入课前提醒。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `# 已废弃：连续盲贴报错超过 3 轮
# 请改用：Checkpoint 回退 + 5 步分层定位（Frontend / Backend / Database）`,
  },
  {
    id: "kb-m4-deprecated-always-apply",
    title: "已废弃：将全部规则设为 alwaysApply: true 且在 mcp.json 填明文 Token",
    kbTrack: "engineering",
    category: "deprecated",
    validationStatus: "deprecated",
    modules: ["M4", "M2"],
    version: "v1.1-dep",
    updatedAt: "2026-11-19",
    owner: "平台架构与安全组",
    source: "规则膨胀退化与配置泄露演练审计",
    scope: ".cursor/rules/*.mdc 与 .cursor/mcp.json",
    summary:
      "全局无条件注入大段规则会挤占有效工作上下文，而明文 Token 极易通过 Git 提交或课堂截屏泄露。",
    whenToUse: "团队安全巡检与 Lab 02 / Lab 03 排雷审计对照。",
    antiPatternOrWarning: "把整份团队百科全书复制进全局规则并标记 alwaysApply: true。",
    migrationNotes: "拆分目录规则并配置精确 globs；凭证统一迁移至 ${env:VAR_NAME} 与本地隔离环境变量。",
    feedbackLoop: "每次代码库目录重构后复核一次 rules 的 globs 是否仍然命中。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `# 已废弃：alwaysApply: true 全量灌水 & "TOKEN": "ghp_xxxx"
# 请改用：globs: ["src/api/**/*.ts"] + "\${env:GITHUB_PERSONAL_ACCESS_TOKEN}"`,
  },
  {
    id: "kb-m10-anti-ai-slop-spec",
    title: "去 AI 模板味 UI 组件与可访问性验收规格模板",
    kbTrack: "engineering",
    category: "template",
    validationStatus: "verified",
    modules: ["M10"],
    version: "v1.1",
    updatedAt: "2026-11-19",
    owner: "前端体验与设计系统组",
    source: "课程 M10 视觉拆解与组件源码参数实战",
    scope: "前端页面搭建、设计稿还原与视觉走查",
    summary:
      "明确信息层级、排版尺度、色彩主次、文本分隔元信息与空态/错态/加载态，消除无节制渐变与堆砌胶囊。",
    whenToUse: "使用截图或参数驱动 AI 生成或重构 Web 界面前作为前置约束。",
    antiPatternOrWarning: "仅输入“做一个高级现代科技感网页”而无排版与状态约定。",
    migrationNotes: "结合目标项目 Tailwind / 设计系统 Token 替换色值与字体阶梯。",
    feedbackLoop: "发现 AI 反复生成未约束的装饰动效或低对比灰字时，补入规格禁用项。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `- 布局骨架: 明确列数、最大宽度与首屏核心任务
- 视觉克制: 禁用无关紫色渐变大背景与静态元数据小胶囊，改用 · 分隔纯文本
- 完备状态: 必须实现 Empty / Loading / Error 三态与清晰焦点框`,
  },
  {
    id: "kb-m10-hypothesis-single-slice-visual",
    title: "待验证假设：局部状态分步喂料比一次喂整套多页截图偏差更低",
    kbTrack: "engineering",
    category: "hypothesis",
    validationStatus: "hypothesis",
    modules: ["M10"],
    version: "v0.2-exp",
    updatedAt: "2026-11-19",
    owner: "前端体验与设计系统组",
    source: "课程 M10 多模态截图还原课堂对照观察",
    scope: "复杂交互组件（导航展开态、筛选抽屉、移动端底部栏）还原",
    summary:
      "先确定整页布局骨架，再针对导航展开、弹窗和移动端断点单独喂入局部截图与离散源码参数，拟减少返工。",
    whenToUse: "作为复杂页面分步还原的工作流试行，需按项目多模态模型版本实测对照。",
    antiPatternOrWarning: "一次性丢入 6 张不同分辨率截图期待 AI 一次猜对所有响应式状态。",
    migrationNotes: "若新版本视觉模型能直接稳定理解整套图集，则简化为单轮框架+局部微调。",
    feedbackLoop: "收集不同框架（Tailwind / CSS Modules）下的返工轮次后再决定是否转正。",
    repoPath: "docs/knowledge-base/failures-and-decisions.md",
    copyableSnippet: `Step 1: 先定桌面端页面网格与主排版骨架
Step 2: 单独传入 Navbar 展开态 + 移动端截图补齐响应式与交互态`,
  },
  {
    id: "kb-m8-long-horizon-harness",
    title: "长程 Coding Harness 五要素装配（init.sh + feature_list.json + Worktree）",
    kbTrack: "engineering",
    category: "template",
    validationStatus: "verified",
    modules: ["M8"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "Harness 工程教学组",
    source: "系统统一五类 Harness 架构（借鉴长程编码护栏工程模式）",
    scope: "跨多轮会话、跨多个模块的长程编码任务与多 Coding Agent 协同",
    summary:
      "用 init.sh 锁定可重复环境，用 feature_list.json 固化任务状态与防删条，用 Git Worktree 物理隔离多 Agent 写范围，消除长对话漂移。",
    whenToUse: "任务预计超过 15 轮会话或需要 2 个以上 Coding Agent 并行推进时。",
    antiPatternOrWarning: "不要与 M6 异步 Issue-to-PR 混淆；本地多 Agent 并发必须先划清目录所有权。",
    migrationNotes: "将示例 feature_list.json 字段映射为当前仓库真实测试命令。",
    feedbackLoop: "每次交接失败后补齐缺失锚点到 AGENTS.md 与交接模板。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `{
  "featureId": "feat-runtime-acl",
  "scopeAllowlist": ["src/server/kb/**", "tests/kbAcl.test.ts"],
  "verifyCommand": "npm test && npx tsc --noEmit",
  "passes": false,
  "handoffNote": "已完成类型定义，下一步仅实现检索前 tenantId 过滤"
}`,
  },
  {
    id: "kb-m9-m3-pattern-boundaries",
    title: "M9 / M3 设计模式试点：分层边界、Facade 门面与垂直切片防过度抽象卡",
    kbTrack: "engineering",
    category: "adr",
    validationStatus: "verified",
    modules: ["M9", "M3"],
    version: "v1.0",
    updatedAt: "2026-11-25",
    owner: "架构边界与设计模式试点组",
    source: "Coding Everything Stage 1 设计模式试点（M9/M3）",
    scope: "全栈垂直切片、第三方支付/邮件集成、前后端权限边界评审",
    summary:
      "用分层边界隔离 UI 与服务端权威状态，用轻量 Facade 门面收口外部 SDK 验签与幂等锁，并按垂直切片小步验收；拒绝为单实现场景提前堆砌 AbstractFactory 或拆分微服务。",
    whenToUse: "AI 第一版把数据库/鉴权写入 React 组件，或第三方回调散落在多个路由中时。",
    antiPatternOrWarning: "不要在 Prompt 里只写“用设计模式”，也不要为单支付通道建 5 层空转发与 DI 容器。",
    migrationNotes: "当外部通道增至 3 家以上或确认存在独立吞吐瓶颈时，再从单一 Facade 演进为 Strategy 注册表。",
    feedbackLoop: "记录课堂故障演练中被误选为坏味道的过度抽象诱饵，更新反例说明。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `# M9/M3 模式取舍检查（KISS / YAGNI）
1. 边界: UI 仅渲染态，401/403 与付费态全部留在 src/server/**
2. Facade: 第三方验签 + 幂等锁收口于单一 Gateway 模块，不建单实现 Factory
3. 验收: 未登录 curl 401/403 + 同 eventId 重放幂等 + tsc/test 全绿`,
  },
  {
    id: "kb-m5-m8-state-circuit-handoff",
    title: "M5 / M8 设计模式试点：显式状态机、有限重试熔断与检查点交接",
    kbTrack: "engineering",
    category: "adr",
    validationStatus: "verified",
    modules: ["M5", "M8"],
    version: "v1.0",
    updatedAt: "2026-11-25",
    owner: "DoD 与长程 Harness 试点组",
    source: "Coding Everything Stage 1 设计模式试点（M5/M8）",
    scope: "AI 自愈循环、测试防篡改门禁、跨会话 ACC 检查点与并发 Worktree 交接",
    summary:
      "以 4 态显式迁移表取代混乱布尔开关，将自愈循环严格封顶为 <= 3 轮同错即熔断且禁止改写 tests/ 断言，并通过 feature_list.json 与 ACC 检查点保留跨会话边界。",
    whenToUse: "AI 在自愈循环里反复盲修、修改测试断言凑绿灯，或超过 15 轮会话丢失禁改范围时。",
    antiPatternOrWarning: "单机 4 态验证流程禁止强上 XState 分布式 Saga 或全局 Pub-Sub 总线。",
    migrationNotes: "仅当审计/通知存在多独立消费者且属不同目录所有权时，再抽轻量事件订阅。",
    feedbackLoop: "根据学员 ACC 交接演练失败原因补充禁改路径与错误签名格式。",
    repoPath: "docs/knowledge-base/templates-and-checklists.md",
    copyableSnippet: `type HealingState = "pending" | "verifying" | "circuit_broken" | "passed";
// 硬门禁: maxAttempts = 3; 连续同错即 circuit_broken; git diff tests/ 禁止被自动改写`,
  },
];

export const ENGINEERING_MODULE_CODES: KnowledgeModuleCode[] = [
  "M1",
  "M2",
  "M3",
  "M4",
  "M5",
  "M6",
  "M7",
  "M8",
  "M9",
  "M10",
];

export function searchEngineeringKnowledgeBase(options: {
  query?: string;
  moduleFilter?: string;
  categoryFilter?: KnowledgeCategory | "ALL";
  statusFilter?: KnowledgeValidationStatus | "ALL";
}): TeamKnowledgeEntry[] {
  const normalizedQuery = (options.query || "").trim().toLowerCase();
  const moduleFilter = options.moduleFilter || "ALL";
  const categoryFilter = options.categoryFilter || "ALL";
  const statusFilter = options.statusFilter || "ALL";

  return TEAM_KNOWLEDGE_BASE.filter((item) => {
    if (moduleFilter !== "ALL" && !item.modules.includes(moduleFilter as KnowledgeModuleCode)) {
      return false;
    }
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
      return false;
    }
    if (statusFilter !== "ALL" && item.validationStatus !== statusFilter) {
      return false;
    }
    if (normalizedQuery) {
      const haystack =
        `${item.title} ${item.summary} ${item.scope} ${item.copyableSnippet} ${item.owner}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}

export function getKnowledgeEntriesForModule(moduleCode: KnowledgeModuleCode): TeamKnowledgeEntry[] {
  return TEAM_KNOWLEDGE_BASE.filter((entry) => entry.modules.includes(moduleCode));
}
