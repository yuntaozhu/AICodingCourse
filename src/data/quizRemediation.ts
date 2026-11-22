import type { QuizQuestion } from "./moduleQuizzes.ts";

export const VALID_LAB_IDS = [
  "plan-prompt",
  "cursor-rules",
  "mcp-toolbox",
  "bugbot-review",
  "book-kb",
  "agent-harness",
  "vibe-stack-map",
  "ui-inspiration",
  "efficiency-assessment",
  "devops-ai-first",
  "arch-decision-sim",
  "smart-code-review",
  "code-health-sim",
  "prompt-crafting",
  "velocity-heatmap",
  "mcp-registry",
  "context-slice",
  "runtime-kb-rag",
  "agent-workflow-sim",
  "gov-trajectory-eval",
] as const;

export type ValidLabId = (typeof VALID_LAB_IDS)[number];

export interface ModuleObjectiveMeta {
  moduleId: string;
  audience: string;
  observableOutcome: string;
}

export interface QuizRemediationEntry {
  learningObjective: string;
  reviewAction: string;
  moduleId: string;
  labId?: ValidLabId;
  labLabel?: string;
}

export const MODULE_OBJECTIVES: Record<string, ModuleObjectiveMeta> = {
  m1: {
    moduleId: "m1",
    audience: "刚转向 AI-Native 研发的产品经理与独立开发者",
    observableOutcome: "能用 Plan 模式输出带边界与 DoD 门禁的可执行需求蓝图",
  },
  m2: {
    moduleId: "m2",
    audience: "需要在多文件项目中精准投喂上下文的开发者",
    observableOutcome: "能过滤目录噪音并规划跨模块重构及最小高信噪比上下文切片",
  },
  m3: {
    moduleId: "m3",
    audience: "正在落地登录、数据库与支付闭环的全栈建设者",
    observableOutcome: "能守住服务端 Webhook 鉴权底线并提交可核验 Starter 证据",
  },
  m4: {
    moduleId: "m4",
    audience: "准备团队化/长期维护 Cursor 项目的工程师",
    observableOutcome: "能配置按 globs 触发的 .mdc 规则与最小特权 .cursor/mcp.json",
  },
  m5: {
    moduleId: "m5",
    audience: "关注 AI 代码质量与自动化验收的技术负责人",
    observableOutcome: "能识别测试作弊（Reward Hacking）与死代码，设定有界自愈门禁",
  },
  m6: {
    moduleId: "m6",
    audience: "尝试异步 Agent 并行开发与自动 PR 审查的团队",
    observableOutcome: "能构建独立上下文的 Bugbot 审查流与三层密钥防线",
  },
  m7: {
    moduleId: "m7",
    audience: "追求长期研发复利的独立开发者与技术管理者",
    observableOutcome: "能区分代码行数幻觉与真实 MTTV/返工率 ROI 指标",
  },
  m8: {
    moduleId: "m8",
    audience: "需要驾驭长程跨会话任务与多 Coding Agent 并发的开发者",
    observableOutcome: "能装配五类长程 Coding Harness（init.sh/feature_list/Worktree/ACC）防偏航",
  },
  m9: {
    moduleId: "m9",
    audience: "需要系统梳理现代 Web 三层全栈架构的 Vibe Coder",
    observableOutcome: "能做出清醒的技术选型、守住 45% 安全底线并精准解码报错",
  },
  m10: {
    moduleId: "m10",
    audience: "希望提升前端产品完成度与 AI 视觉还原度的开发者",
    observableOutcome: "能使用高信噪比整站/局部截图及调参源码稳定驱动 UI 生成",
  },
  m11: {
    moduleId: "m11",
    audience: "规划并评估 Agent 系统的产品经理、架构师与技术负责人",
    observableOutcome: "能完成 Workflow vs Agent 决策并交付 Data PRD、Prompt PRD 与 HITL 审批矩阵",
  },
  m12: {
    moduleId: "m12",
    audience: "实现运行时 Agent 与领域知识库的工程师及进阶独立开发者",
    observableOutcome: "能落地 ACL 检索前强过滤、Tombstone 淘汰、引用溯源与步数预算熔断",
  },
  "m13-gov": {
    moduleId: "m13-gov",
    audience: "非技术学习者、产品经理与合规评审负责人",
    observableOutcome: "能基于预制轨迹与评测集审计高危风险，输出带模拟边界声明的治理审签表",
  },
  "m13-eng": {
    moduleId: "m13-eng",
    audience: "构建可上线 Agent 系统的工程团队、独立开发者与高校学生",
    observableOutcome: "能交付带双层 Eval、零越权探针与五类 Harness 护栏的生产级 Agent 系统",
  },
};

export const QUIZ_REMEDIATION_MAP: Record<string, QuizRemediationEntry> = {
  // Module 1
  "m1-q1": {
    learningObjective: "区分语法手写与意图抽象/DoD 评估/Agent 编排能力",
    reviewAction: "去 Lab 01 练习把模糊想法拆成带边界条件的 Plan 提示词",
    moduleId: "m1",
    labId: "plan-prompt",
    labLabel: "Lab 01 · Plan→Agent 沙盘",
  },
  "m1-q2": {
    learningObjective: "能说明代码图结构依赖与全量上下文缓存对跨文件定位的影响",
    reviewAction: "回顾 M1 上下文演进章节，或到 Lab 06 观察上下文压缩对比",
    moduleId: "m1",
    labId: "agent-harness",
    labLabel: "Lab 06 · Agent Harness",
  },
  "m1-q3": {
    learningObjective: "明确 SDD 设计契约与 DoD 退出门禁的分工",
    reviewAction: "在 Lab 01 勾选 DoD 验证项并对比输出提示词的收敛度",
    moduleId: "m1",
    labId: "plan-prompt",
    labLabel: "Lab 01 · Plan→Agent 沙盘",
  },
  "m1-q4": {
    learningObjective: "识别工程七维权衡与架构随阶段迁移的决策点",
    reviewAction: "到 Lab 11 架构决策模拟器体验 MVP 与架构解耦权衡",
    moduleId: "m1",
    labId: "arch-decision-sim",
    labLabel: "Lab 11 · 架构决策模拟器",
  },
  // Module 2
  "m2-q1": {
    learningObjective: "能配置全量代码库索引前的 .cursorignore 降噪与目录排除规则",
    reviewAction: "前往 Lab 02 检查 .cursorignore / globs 如何隔离无关噪音",
    moduleId: "m2",
    labId: "cursor-rules",
    labLabel: "Lab 02 · Rules 沙盘",
  },
  "m2-q2": {
    learningObjective: "利用全局调用链洞察安全推进跨模块接口升级",
    reviewAction: "去 Lab 06 观察跨文件调用链感知与上下文门控机制",
    moduleId: "m2",
    labId: "agent-harness",
    labLabel: "Lab 06 · Agent Harness",
  },
  "m2-q3": {
    learningObjective: "能对比跨文件污点数据流审计与单点正则检测的漏报差异",
    reviewAction: "到 Lab 04 用 Bugbot 审查台实测跨路由鉴权与数据流漏洞",
    moduleId: "m2",
    labId: "bugbot-review",
    labLabel: "Lab 04 · Bugbot 评审台",
  },
  // Module 3
  "m3-q1": {
    learningObjective: "严守客户端不可信原则，仅以服务端 Webhook 签名为准",
    reviewAction: "前往 Lab 04 选择支付路由预设，演练拦截未验签回调风险",
    moduleId: "m3",
    labId: "bugbot-review",
    labLabel: "Lab 04 · Bugbot 评审台",
  },
  "m3-q2": {
    learningObjective: "建立“现场证据定位 + Checkpoint 及时止损”排障反射",
    reviewAction: "到 Lab 07 查看常见报错解码与 5 步复位排查指南",
    moduleId: "m3",
    labId: "vibe-stack-map",
    labLabel: "Lab 07 · 全栈报错解码",
  },
  "m3-q3": {
    learningObjective: "用客观脚本验收与细粒度提交防止长时编码偏航",
    reviewAction: "前往 Lab 01 装配带 `npx tsc --noEmit` 门禁的任务指令",
    moduleId: "m3",
    labId: "plan-prompt",
    labLabel: "Lab 01 · Plan→Agent 沙盘",
  },
  "m3-q4": {
    learningObjective: "摒弃抽象形容词，用可复现布局与组件参数驱动 UI",
    reviewAction: "到 Lab 08 浏览 23 个 UI 参考站与可直接复制的提示词模板",
    moduleId: "m3",
    labId: "ui-inspiration",
    labLabel: "Lab 08 · UI 审美参考库",
  },
  // Module 4
  "m4-q1": {
    learningObjective: "合理设置 alwaysApply 与 globs 实现规则按需精准触发",
    reviewAction: "前往 Lab 02 或 Lab 14 实战生成按 globs 隔离的 .mdc 文件",
    moduleId: "m4",
    labId: "prompt-crafting",
    labLabel: "Lab 14 · 规则生成器",
  },
  "m4-q2": {
    learningObjective: "遵循最小特权与惰性发现原则配置外部 MCP 工具",
    reviewAction: "前往 Lab 03 完成最小特权 .cursor/mcp.json 与 DoD 自动体检",
    moduleId: "m4",
    labId: "mcp-toolbox",
    labLabel: "Lab 03 · MCP 配置沙盘",
  },
  "m4-q3": {
    learningObjective: "把反复返工的故障根因沉淀为团队共享规则资产",
    reviewAction: "去 Lab 02 查看 90-self-improve.mdc 元规则示例",
    moduleId: "m4",
    labId: "cursor-rules",
    labLabel: "Lab 02 · Rules 沙盘",
  },
  // Module 5
  "m5-q1": {
    learningObjective: "识别“写得快但审得慢”的生产力悖论并清扫 Stray Code",
    reviewAction: "前往 Lab 09 完成 Sonar 7 Habits 团队成熟度自测",
    moduleId: "m5",
    labId: "efficiency-assessment",
    labLabel: "Lab 09 · 效能自测",
  },
  "m5-q2": {
    learningObjective: "识别并拦截 AI 编写弱断言/跳测导致的 Reward Hacking",
    reviewAction: "前往 Lab 12 用自定义 Prompt 规则实测拦截测试作弊代码",
    moduleId: "m5",
    labId: "smart-code-review",
    labLabel: "Lab 12 · Smart Review",
  },
  "m5-q3": {
    learningObjective: "为终端自愈设定有界重试次数与回滚逃生门",
    reviewAction: "在 Lab 06 观察终端自愈循环与上下文失控边界",
    moduleId: "m5",
    labId: "agent-harness",
    labLabel: "Lab 06 · Agent Harness",
  },
  // Module 6
  "m6-q1": {
    learningObjective: "筛选边界清晰、可自动验收的任务交给 Background Agent",
    reviewAction: "前往 Lab 13 模拟对比受控后台 Agent 与无护栏 Agent 债务曲线",
    moduleId: "m6",
    labId: "code-health-sim",
    labLabel: "Lab 13 · Code Health 模拟",
  },
  "m6-q2": {
    learningObjective: "通过独立上下文审查打破生成会话的自我确认偏见",
    reviewAction: "到 Lab 12 调节 Bugbot 审查严格度并观察检出优先级变化",
    moduleId: "m6",
    labId: "smart-code-review",
    labLabel: "Lab 12 · Smart Review",
  },
  "m6-q3": {
    learningObjective: "搭建本地 Hook + CI 历史扫雷 + 静态审计三层密钥防线",
    reviewAction: "到 Lab 04 运行含明文密钥片段的本地与 AI 双重审计",
    moduleId: "m6",
    labId: "bugbot-review",
    labLabel: "Lab 04 · Bugbot 评审台",
  },
  // Module 7
  "m7-q1": {
    learningObjective: "克服 70% 原型顺利后剩余 30% 工程深水区的“知识悖论”",
    reviewAction: "到 Lab 09 自评当前工程习惯并定位最后 30% 的短板",
    moduleId: "m7",
    labId: "efficiency-assessment",
    labLabel: "Lab 09 · 效能自测",
  },
  "m7-q2": {
    learningObjective: "用 MTTV、首轮通过率与返工率替代“代码行数”评估 ROI",
    reviewAction: "前往 Lab 15 在流水线热力图对比不同工具链对 MTTV 的压缩效果",
    moduleId: "m7",
    labId: "velocity-heatmap",
    labLabel: "Lab 15 · Velocity 热力图",
  },
  "m7-q3": {
    learningObjective: "将验证过的 Rules、Skills 与参考库沉淀为跨项目资产",
    reviewAction: "到 Lab 05 挑选权威书单直接合成可复用的 .mdc 资产",
    moduleId: "m7",
    labId: "book-kb",
    labLabel: "Lab 05 · 书籍知识库",
  },
  // Module 8
  "m8-q1": {
    learningObjective: "用 init.sh、feature_list.json 与 ACC 摘要卡固定长程跨会话状态锚点",
    reviewAction: "前往 Lab 06 切换「强长程 Harness」对照观察 ACC 压缩与状态锚点保留效果",
    moduleId: "m8",
    labId: "agent-harness",
    labLabel: "Lab 06 · 长程 Coding Harness",
  },
  "m8-q2": {
    learningObjective: "实施 Contract-First 契约先行与 Git Worktree 目录所有权隔离并发冲突",
    reviewAction: "前往 Lab 06 查看多 Coding Agent Worktree 分区隔离架构",
    moduleId: "m8",
    labId: "agent-harness",
    labLabel: "Lab 06 · 长程 Coding Harness",
  },
  "m8-q3": {
    learningObjective: "严格区分 M6 异步 PR、M8 长程 Coding Harness 与 M12 运行时 Agent 应用边界",
    reviewAction: "回看 M8 五类 Harness 映射图，厘清使用 Coding Agent 与开发运行时 Agent 的分工",
    moduleId: "m8",
    labId: "agent-harness",
    labLabel: "Lab 06 · 长程 Coding Harness",
  },
  // Module 9
  "m9-q1": {
    learningObjective: "分辨元框架、客户端 UI 状态与服务端请求缓存的分层职责",
    reviewAction: "到 Lab 07 切换「2026 默认全栈」与「边缘 SPA」对比工具图谱",
    moduleId: "m9",
    labId: "vibe-stack-map",
    labLabel: "Lab 07 · Vibe 全栈图谱",
  },
  "m9-q2": {
    learningObjective: "守住 Zod 校验、ORM 参数化查询与服务端环境变量安全防线",
    reviewAction: "到 Lab 11 演练忽视安全与架构解耦对长期交付质量的冲击",
    moduleId: "m9",
    labId: "arch-decision-sim",
    labLabel: "Lab 11 · 架构决策模拟器",
  },
  "m9-q3": {
    learningObjective: "根据报错首行快速归因并执行清缓存/复核现场排障",
    reviewAction: "到 Lab 07 打开常见报错解码器查对 Hydration / 连接拒绝解法",
    moduleId: "m9",
    labId: "vibe-stack-map",
    labLabel: "Lab 07 · 全栈报错解码",
  },
  // Module 10
  "m10-q1": {
    learningObjective: "学会用具体布局比例、留白与源码参数替代空泛审美形容词",
    reviewAction: "到 Lab 08 挑选对口分类站点并复制结构化视觉提示词",
    moduleId: "m10",
    labId: "ui-inspiration",
    labLabel: "Lab 08 · UI 审美参考库",
  },
  "m10-q2": {
    learningObjective: "防止机械拼接多站风格导致页面视觉撕裂",
    reviewAction: "在 Lab 08 筛选「Ⅰ 整站类」对比完整页面叙事节奏",
    moduleId: "m10",
    labId: "ui-inspiration",
    labLabel: "Lab 08 · UI 审美参考库",
  },
  "m10-q3": {
    learningObjective: "补齐 Navbar 展开态与 Footer 移动端的常见喂料盲区",
    reviewAction: "在 Lab 08 查看「Ⅱ 局部类」对 Navbar 与 Footer 的喂料指南",
    moduleId: "m10",
    labId: "ui-inspiration",
    labLabel: "Lab 08 · UI 审美参考库",
  },
  "m10-q4": {
    learningObjective: "对齐项目技术栈选择源码组件库并传入调好参数的离散值",
    reviewAction: "在 Lab 08 筛选「Ⅲ 实现与源码类」复制参数化组件提示词",
    moduleId: "m10",
    labId: "ui-inspiration",
    labLabel: "Lab 08 · UI 审美参考库",
  },
  // Module 11
  "m11-q1": {
    learningObjective: "利用 Workflow vs Agent 决策树识别应保留确定性编排的场景",
    reviewAction: "回看 M11 Workflow vs Agent 判定卡，核对确定性流程与自主循环边界",
    moduleId: "m11",
  },
  "m11-q2": {
    learningObjective: "在 Data PRD 中锁定敏感分级、ACL 隔离键与失效版本淘汰契约",
    reviewAction: "对照知识库 M11 Agent 产品蓝图双文档模板逐项补全 Data PRD",
    moduleId: "m11",
  },
  "m11-q3": {
    learningObjective: "在 Prompt PRD 中划定工具白名单预算与不可逆写操作的 HITL 审批门禁",
    reviewAction: "复核 M11 HITL 风险矩阵，列出写操作暂停与低置信度拒答条件",
    moduleId: "m11",
  },
  "m11-q4": {
    learningObjective: "明确非技术角色通过 M13-Gov 治理评审并与 M12/M13-Eng 交接的分工链路",
    reviewAction: "查看 M11 到 M13-Gov 无代码治理 Capstone 的产研交接流程",
    moduleId: "m11",
  },
  // Module 12
  "m12-q1": {
    learningObjective: "区分研发工程知识库与运行时领域知识库的架构与生命周期差异",
    reviewAction: "前往 Lab 18 对照运行中 Agent 所需的 6 步运行时 KB 流水线",
    moduleId: "m12",
    labId: "runtime-kb-rag",
    labLabel: "Lab 18 · 运行时 KB 沙盘",
  },
  "m12-q2": {
    learningObjective: "在检索前过滤（Pre-filter）阶段强制执行 tenantId、role 与 active 状态校验",
    reviewAction: "在 Lab 18 切换「先召回后 Prompt 掩盖」模式观察跨租户泄露漏洞",
    moduleId: "m12",
    labId: "runtime-kb-rag",
    labLabel: "Lab 18 · 运行时 KB 沙盘",
  },
  "m12-q3": {
    learningObjective: "配置 Tombstone 状态淘汰旧版文档并要求每条回答绑定 docId+version 引用锚点",
    reviewAction: "到 Lab 18 实测开启 Tombstone 后 deprecated 历史条款召回降为 0",
    moduleId: "m12",
    labId: "runtime-kb-rag",
    labLabel: "Lab 18 · 运行时 KB 沙盘",
  },
  "m12-q4": {
    learningObjective: "为运行时工具调用循环设置步数上限、费用预算熔断与异常转人工门禁",
    reviewAction: "前往 Lab 19 触发工具超时死循环样例，验证 maxSteps 熔断与 HITL 挂起",
    moduleId: "m12",
    labId: "agent-workflow-sim",
    labLabel: "Lab 19 · 运行时 Agent 熔断沙盘",
  },
  // Module 13-Gov
  "m13-gov-q1": {
    learningObjective: "在预制 Agent 轨迹中精准定级跨租户与低权限 ACL 越权漏过滤 P0 隐患",
    reviewAction: "打开 Lab 20 审查预制轨迹 1，标出 ACL Pre-filter 缺失阻断项",
    moduleId: "m13-gov",
    labId: "gov-trajectory-eval",
    labLabel: "Lab 20 · 治理轨迹评审台",
  },
  "m13-gov-q2": {
    learningObjective: "识别零依据编造政策条款的忠实度失效并补充拒答与转人工门槛",
    reviewAction: "在 Lab 20 检查无引用输出样本，补全 Prompt PRD 拒答策略条款",
    moduleId: "m13-gov",
    labId: "gov-trajectory-eval",
    labLabel: "Lab 20 · 治理轨迹评审台",
  },
  "m13-gov-q3": {
    learningObjective: "准确声明 M13-Gov 模拟治理评审边界，绝不冒充生产运行系统实测验证",
    reviewAction: "复核 M13-Gov 报告页底部必须保留的预制轨迹模拟声明文案",
    moduleId: "m13-gov",
    labId: "gov-trajectory-eval",
    labLabel: "Lab 20 · 治理轨迹评审台",
  },
  "m13-gov-q4": {
    learningObjective: "针对缺少 HITL 确认与过期召回的高危样本下达 No-Go / Conditional 阻断判定",
    reviewAction: "使用 Lab 20 完成完整审签勾选并导出含修复工单的评审报告",
    moduleId: "m13-gov",
    labId: "gov-trajectory-eval",
    labLabel: "Lab 20 · 治理轨迹评审台",
  },
  // Module 13-Eng
  "m13-eng-q1": {
    learningObjective: "拆分 KB 检索指标（Recall@K/零越权/零过期）与 Agent 端到端轨迹评测维度",
    reviewAction: "对照 Lab 18 与 Lab 19 分别核验检索精度与工具调用轨迹准确率",
    moduleId: "m13-eng",
    labId: "runtime-kb-rag",
    labLabel: "Lab 18 · 运行时 KB 沙盘",
  },
  "m13-eng-q2": {
    learningObjective: "编写不可绕过的跨角色越权探针与 Tombstone 历史版本回归测试",
    reviewAction: "前往 Lab 18 查看 0% 越权与 0% 过期误召回的断言契约",
    moduleId: "m13-eng",
    labId: "runtime-kb-rag",
    labLabel: "Lab 18 · 运行时 KB 沙盘",
  },
  "m13-eng-q3": {
    learningObjective: "在生产级 Agent 工程中落地 M8 五类 Coding Harness 护栏维持长期演进",
    reviewAction: "前往 Lab 06 复盘 init.sh、feature_list.json 与回归验证闭环",
    moduleId: "m13-eng",
    labId: "agent-harness",
    labLabel: "Lab 06 · 长程 Coding Harness",
  },
  "m13-eng-q4": {
    learningObjective: "提供命令行退出码 0、双层 Eval 报告与 Harness Runbook 作为上线客观证据",
    reviewAction: "前往 Lab 19 验证预算熔断回归与工程 Capstone 交付清单",
    moduleId: "m13-eng",
    labId: "agent-workflow-sim",
    labLabel: "Lab 19 · 运行时 Agent 熔断沙盘",
  },
};

export function normalizeModuleIdKey(moduleIdOrNumber: string | number): string {
  if (typeof moduleIdOrNumber === "number") {
    return `m${moduleIdOrNumber}`;
  }
  const trimmed = String(moduleIdOrNumber).trim().toLowerCase();
  if (/^\d+$/.test(trimmed)) {
    return `m${trimmed}`;
  }
  return trimmed;
}

export function getQuestionRemediation(
  questionId: string,
  moduleIdOrNumber: string | number
): QuizRemediationEntry {
  const mapped = QUIZ_REMEDIATION_MAP[questionId];
  if (mapped) return mapped;
  const resolvedId = normalizeModuleIdKey(moduleIdOrNumber);
  return {
    learningObjective: "能执行并验证本模块核心工程原则",
    reviewAction: `建议回到 ${resolvedId.toUpperCase()} 首页重新梳理本节概念`,
    moduleId: resolvedId,
  };
}

export function buildRetryWrongAnswersState(
  questions: QuizQuestion[],
  currentAnswers: Record<string, number>
): {
  keptAnswers: Record<string, number>;
  firstWrongIndex: number;
  wrongCount: number;
} {
  const keptAnswers: Record<string, number> = {};
  let firstWrongIndex = -1;
  let wrongCount = 0;

  questions.forEach((q, idx) => {
    const chosen = currentAnswers[q.id];
    if (chosen === q.correctIndex) {
      keptAnswers[q.id] = chosen;
    } else {
      wrongCount += 1;
      if (firstWrongIndex === -1) {
        firstWrongIndex = idx;
      }
    }
  });

  return {
    keptAnswers,
    firstWrongIndex: firstWrongIndex === -1 ? 0 : firstWrongIndex,
    wrongCount,
  };
}
