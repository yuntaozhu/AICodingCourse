import {
  COURSE_LABS,
  COURSE_LAST_REVIEWED_AT,
  COURSE_MODULES,
  COURSE_RESOURCES,
  type CourseModule,
  type CourseVerificationStatus,
  type TrackId,
} from "./courseCurriculum";
import type { SkillId } from "./courseSkills";
import { MODULE_QUIZZES } from "./moduleQuizzes";
import { MODULE_TEACHING_PACKAGES, type ModuleTeachingPackage } from "./moduleTeachingPackages";
import { TEAM_KNOWLEDGE_BASE } from "./teamKnowledgeBase";
import { RUNTIME_WORKSHOP_KNOWLEDGE_BASE } from "./runtimeKnowledgeBase";

const M13_GOV_DISCLAIMER_TEXT =
  "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。";

export type CourseUnitType =
  | "concept"
  | "ai-vs-trad"
  | "instructor-demo"
  | "collab-practice"
  | "failure-case"
  | "sandbox"
  | "discussion"
  | "quiz"
  | "knowledge-base"
  | "transfer-task";

export const COURSE_UNIT_TYPE_LABELS: Record<CourseUnitType, string> = {
  concept: "概念讲解",
  "ai-vs-trad": "AI vs 传统对比",
  "instructor-demo": "教师演示",
  "collab-practice": "人机协同练习",
  "failure-case": "失败案例剖析",
  sandbox: "交互沙盘",
  discussion: "讨论与复盘",
  quiz: "巩固测验",
  "knowledge-base": "知识库沉淀",
  "transfer-task": "课后迁移任务",
};

export interface UnitLearnerTask {
  goal: string;
  steps: string[];
  requiredMaterials: string[];
  humanResponsibilities: string[];
  aiResponsibilities: string[];
}

export interface UnitFailureAnalysis {
  mistakeScenario: string;
  rootCause: string;
  analysisQuestions: string[];
  fixGuidance: string;
}

export interface UnitLearnerArtifactSpec {
  title: string;
  filename: string;
  templateContent: string;
}

export interface UnitTeacherMaterials {
  teachingTips: string;
  referenceAnswers: string[];
  commonPitfalls: string[];
  timeTrimNote: string;
}

export interface CourseUnit {
  id: string;
  moduleId: string;
  title: string;
  type: CourseUnitType;
  learningObjective: string;
  summary: string;
  contentBlocks: string[];
  relatedResourceIds: string[];
  estimatedMinutes: number;
  demoSteps?: {
    phase: string;
    action: string;
    aiBehaviorOrEvidence: string;
    humanControl: string;
  }[];
  learnerTask?: UnitLearnerTask;
  failureAnalysis?: UnitFailureAnalysis;
  learnerArtifact?: UnitLearnerArtifactSpec;
  completionCriteria: string[];
  knowledgeEntryIds: string[];
  knowledgeSedimentNote: string;
  afterClassNote?: string;
  teacherMaterials: UnitTeacherMaterials;
  verificationStatus: CourseVerificationStatus;
  updatedAt: string;
  revealJump?: {
    labId?: string;
    slideOffset?: number;
    label?: string;
  };
}

export interface DeliveryPlan {
  id: string;
  name: string;
  shortLabel: string;
  targetAudience: string;
  description: string;
  unitIds: string[];
}

export interface CourseModuleRecord {
  id: string;
  code: CourseModule["code"];
  order: number;
  trackId: TrackId;
  title: string;
  exemplarLevel: "complete-exemplar" | "compatible-adapter";
  audience: string[];
  prerequisites: string[];
  prerequisiteModuleIds: string[];
  prerequisiteSkillIds: SkillId[];
  grantsSkillIds: SkillId[];
  learningObjectives: string[];
  boundaryNote: string;
  units: CourseUnit[];
  deliveryPlans: DeliveryPlan[];
  labIds: string[];
  resourceIds: string[];
  status: CourseVerificationStatus;
  updatedAt: string;
}

const M1_FULL_UNITS: CourseUnit[] = [
  {
    id: "m1-u1-concept",
    moduleId: "m1",
    title: "01 意图架构师模型与四段式需求蓝图",
    type: "concept",
    learningObjective:
      "能拆解 Context / Intent / Guardrails / DoD 四要素，并区分“行内补全”与“Plan → Agent”适用边界。",
    summary:
      "AI Coding 时代的核心瓶颈不再是打字速度，而是能否把模糊业务诉求表达为范围收敛、边界明确、可运行验证的执行契约。",
    contentBlocks: [
      "1. 单文件局部文案或确定性微调适合行内补全（Tab）或简短单句；一旦跨越 2 个以上文件、涉及数据结构或鉴权边界，必须先在 Plan Mode 对齐设计再触发 Agent 编码。",
      "2. 四段式需求蓝图最小结构：Context（仅挂载最小必要 @ 文件与禁碰模块）、Intent（输入/状态变化与预期行为）、Guardrails（禁止修改目录、禁止新增重型依赖、密钥规范）、DoD（至少 1 条可执行命令行校验）。",
      "3. 适用边界：小步、可逆、纯样式微调不需要写长篇 Plan 文档，避免过度流程形式主义。",
    ],
    relatedResourceIds: ["dlai-prompt-eng", "anthropic-prompt-eng", "cursor-docs"],
    estimatedMinutes: 8,
    completionCriteria: [
      "能指出什么时候可以跳过 Plan 直接局部修改，什么时候必须先停在 Plan Mode",
      "能完整列出四段式蓝图的 4 个核心组成部分及各自职责",
      "能写明至少 1 项本次任务严禁触碰的文件或接口边界",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "对应知识库模板《Plan → Agent 四段式需求蓝图模板》(v1.2)。",
    teacherMaterials: {
      teachingTips:
        "开场用 2 分钟提问学员最近一次 AI 改坏代码的原因，把讨论引导至“指令没写禁区与验证命令”。",
      referenceAnswers: [
        "适用边界参考：改单个组件按钮文案 -> 直接局部改；加带数据库/限流的匿名反馈箱 -> 必须先 Plan。",
        "四要素缺一不可中，实战返工率最高的是缺少 Guardrails（没声明不准改什么）和 DoD（没给出退出自检命令）。",
      ],
      commonPitfalls: [
        "误把所有小改动都强制套用冗长表单，反而拖慢开发节奏。",
        "只在 Context 里写“@Codebase 看着办”，未锁定具体入口文件。",
      ],
      timeTrimNote: "短讲模式可把本单元压缩为 5 分钟，直接拿四段模板卡片切入演示。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
    revealJump: { slideOffset: 1, label: "查看 M1 概念幻灯片" },
  },
  {
    id: "m1-u2-ai-vs-trad",
    moduleId: "m1",
    title: "02 AI Coding vs 传统编程工程对照",
    type: "ai-vs-trad",
    learningObjective:
      "能对比传统开发与 AI Coding 在任务分解、候选产出、验证成本上的差异，并说明瓶颈如何向审查转移。",
    summary:
      "AI 让首版实现起草成本趋近于零，但把错误放大和审查回滚的代价转移到了范围界定与 Diff 验收环节。",
    contentBlocks: [
      "• 任务起点：传统编码由人逐行构造接口与实现；AI Coding 由人定义契约与边界，AI 在秒级产出多文件候选改动。",
      "• 返工来源：传统返工多因手写耗时或边界漏想；AI 返工多因“一句话模糊指令导致 AI 自行脑补并顺手重写无关模块”。",
      "• 验证方式：AI 生成的代码必须依赖客观命令行检查（tsc / lint / test / curl）和人工 `git diff --stat` 核查，不能靠“AI 汇报已完成”轻信通过。",
      "• 不可委托给 AI 的决策：业务范围裁剪、不可逆数据变更、安全权限模型定义与最终合并责任。",
    ],
    relatedResourceIds: ["easy-vibe", "openai-prompt-guide"],
    estimatedMinutes: 7,
    completionCriteria: [
      "能说出至少 2 项编码速度提升后反而加重的工程环节（如范围清理、Diff 审查）",
      "能列举至少 2 项绝对不能委托给 AI 拍板的决策事项",
      "能解释为什么个人自测思维在多文件 Agent 时代必须升级为客观命令验证",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "将对比发现的返工高发区直接作为团队蓝图模板的重点审核栏。",
    teacherMaterials: {
      teachingTips:
        "强调“AI 写得很快 != 需求已经想清楚”。鼓励学员把精力从背语法转移到写边界与读 Diff。",
      referenceAnswers: [
        "瓶颈转移：起草编码时间下降 60%+，但若无范围锁和 DoD，清理 AI 过度改动的返工时间会翻倍。",
        "不可委托决策：功能优先级取舍、数据库不可逆迁移、生产权限与对外 API 破坏性变更。",
      ],
      commonPitfalls: ["部分零基础学员误以为“以后不需要懂边界和测试，全让 AI 看一眼就行”。"],
      timeTrimNote: "研讨课可仅展示对照表 3 分钟，直接让有开发经验的学员补充各自痛点。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
    revealJump: { slideOffset: 3, label: "对比 Reveal 范式演进" },
  },
  {
    id: "m1-u3-demo",
    moduleId: "m1",
    title: "03 教师现场演示：一句盲写翻车 → 加边界收敛",
    type: "instructor-demo",
    learningObjective:
      "能观察并复述“模糊提示引发越界修改 → 补充禁改清单 → Plan 审批收敛 → 客观命令验真”的完整控制流。",
    summary:
      "围绕“团队匿名反馈箱”案例，先故意展示一句话直接让 Agent 写导致的灾难修改，再演示人类如何介入加约束收窄并验收。",
    contentBlocks: [
      "演示业务场景：产品经理提出“做个团队匿名反馈收集页，支持提交、筛选和防刷”。",
      "演示过程重点观察：讲师如何拒绝第一轮看似能跑但擅改认证和依赖库的方案，而非直接点击全部 Accept。",
    ],
    relatedResourceIds: ["cursor-docs", "anthropic-prompt-eng"],
    estimatedMinutes: 12,
    demoSteps: [
      {
        phase: "Step 1 · 反面起步（暴露盲写缺陷）",
        action: "直接在 Agent Mode 输入：「帮我加个团队匿名反馈功能并连数据库，界面好看点。」",
        aiBehaviorOrEvidence:
          "AI 未询问存储选型，擅自引入重型 ORM、改写现有登录中间件为开放写入，并顺带重构公共导航布局。",
        humanControl: "讲师果断拒收改动并回退，指出缺少 Scope 边界锁与存储契约导致 AI 越权猜想。",
      },
      {
        phase: "Step 2 · 切换 Plan 补齐四要素约束",
        action:
          "按 Shift+Tab 进 Plan Mode，精确 @ 目标路由与类型文件，写明：仅改反馈路由与页面、严禁改动 Auth 中间件、使用现有 Zod + 内存限流。",
        aiBehaviorOrEvidence:
          "AI 先输出仅涉及 3 个文件的设计清单与 400/429 状态码契约，同时询问分页默认条数边界。",
        humanControl: "讲师确认文件清单无越权改动并答复边界值，然后才批准切 Agent 实施。",
      },
      {
        phase: "Step 3 · 命令行验真与人工签名",
        action: "实施完毕后运行 `npx tsc --noEmit`、`npm test` 并检查 `git diff --stat`。",
        aiBehaviorOrEvidence: "类型零报错、400/429 单测全绿，且鉴权路由 0 行变动。",
        humanControl: "讲师人工签收提交，并将四段式指令保留进模块蓝图库。",
      },
    ],
    completionCriteria: [
      "能指认第一轮盲写方案中 AI 越界改动的至少 2 个风险点",
      "能说明第二轮切回 Plan Mode 时额外补入了哪 2 条核心约束",
      "能核对最终验收不仅看页面展示，还核验了 `git diff --stat` 与命令退出码",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "演示产生的指令骨架即 `PLAN_SPEC_TEMPLATE.md` 的标准源模板。",
    teacherMaterials: {
      teachingTips:
        "如果现场演示环境无外网 API Key，可直接使用本地预设对比代码 Diff + 课程内 P7b 正反对比动画完成演示。",
      referenceAnswers: [
        "关键演示转折点：在 Step 1 不要急着修复报错，直接对比 diff 说明“如果此时不断追问，只会越补越乱，正确做法是回退并先出 Plan”。",
        "多元可接受做法：若改动仅限于单函数纯逻辑重构，可直接让 AI 给局部 Plan 摘要而无需完整重文档。",
      ],
      commonPitfalls: ["讲师为了省时间跳过“故意翻车”直接放完美提示词，导致学员感受不到为什么一定要写 Guardrails。"],
      timeTrimNote: "30 分钟研讨模式可只看 Step 1 和 Step 2 的前后 Diff 对比（约 6 分钟）。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
    revealJump: { slideOffset: 8, label: "在 Reveal 打开 P7b 闭环对照" },
  },
  {
    id: "m1-u4-failure",
    moduleId: "m1",
    title: "04 常见错误与失败案例剖析",
    type: "failure-case",
    learningObjective:
      "能识别“一句话大包大揽”和“看似工整却无禁区与验证命令的假 Plan”两类高频失败模式，并写出纠偏指令。",
    summary:
      "并非带了标题就算好 Plan——缺乏不可修改边界和可执行验证命令的计划，执行时仍会失控返工。",
    contentBlocks: [
      "• 显性失败：一句“帮我重构个人中心加导出”让 AI 一次修改 15 个文件并顺手删掉旧权限校验。",
      "• 隐蔽陷阱（看起来对但实际错）：AI 输出了长达 400 字、分点清晰的“完美计划”，但里面充斥着“优化整体结构”“全面提升健壮性”，却只字未提哪些旧文件不准碰、最后跑哪条命令才算过。",
      "• 工具/上下文失败：把未使用的草稿文件与旧版备份同时 @ 进上下文，诱导 AI 按废弃接口设计计划。",
    ],
    relatedResourceIds: ["anthropic-prompt-eng"],
    estimatedMinutes: 7,
    failureAnalysis: {
      mistakeScenario:
        "某学员按要求写了 Plan，内容为：“1. 分析项目结构；2. 优化反馈组件样式与交互；3. 接入数据库并确保功能正常。”随后直接点 Execute。",
      rootCause:
        "该 Plan 看似分了三步，实则完全没有具体文件路径（Scope）、没有技术选型与禁止项（Guardrails）、也没有真实可执行验收命令（DoD），等于把决定权拱手让给 AI 瞎猜。",
      analysisQuestions: [
        "这份计划里哪一句话限制了 AI 不能动原有的登录中间件与公共导航栏？",
        "如果 AI 写完后悄悄用假数组代替了数据库保存，靠什么客观步骤第一时间抓包？",
      ],
      fixGuidance:
        "补充具体 @ 文件清单、写死“禁改现有 Auth 与导航、不新增 ORM”、并追加 `npx tsc --noEmit && curl` 异常状态码验收步骤。",
    },
    completionCriteria: [
      "能从一段看起来工整的虚假 Plan 中揪出缺失的 2 项关键控制要素",
      "能写出至少 1 条可直接约束 AI 不碰公共文件的禁改陈述",
      "能设计至少 1 个用命令行而非肉眼点页面验证成功的方法",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "将自己项目中曾踩过的“虚假 Plan 扩展重构”记录补入团队反例清单。",
    teacherMaterials: {
      teachingTips: "先让学员自己找出上面这段“看似不错”的 Plan 哪里有坑，再揭示答案。",
      referenceAnswers: [
        "参考纠偏答复：1) 缺少目标与禁改文件路径；2) “确保功能正常”不是可检验标准，应改为明确 HTTP 状态码单测和构建退出码为 0。",
      ],
      commonPitfalls: ["学员把“界面更好看”“代码更优雅”当成约束条件写进 Guardrails。"],
      timeTrimNote: "自主学习与工作坊可将该案例作为进入练习前的 5 分钟热身自测。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
  },
  {
    id: "m1-u5-practice",
    moduleId: "m1",
    title: "05 人机协同练习：把模糊需求拆成可审批蓝图",
    type: "collab-practice",
    learningObjective:
      "能独立完成 1 份带最小输入、禁改边界与 DoD 验证命令的四段式 Plan 蓝图，并记录至少 1 处人工裁决。",
    summary:
      "选择一个预设业务需求（或自带项目需求），按模板撰写蓝图并通过 3 项可核查完成标准，将成果保存在本地工作台。",
    contentBlocks: [
      "• 课堂最小版（10 分钟）：围绕“为现有订单列表增加按状态筛选与导出 CSV 按钮”撰写四段式蓝图并完成边界自检。",
      "• 结对挑战：同桌互相扮演评审员，只要能挑出一个未说明的异常输入或可能被误改的文件，即退回补充再放行。",
      "• 无密钥/离线替代：无需调用真实大模型，在本地练习笔记本撰写并对照完成标准逐项核验即可。",
    ],
    relatedResourceIds: ["dlai-prompt-eng", "easy-vibe"],
    estimatedMinutes: 15,
    learnerTask: {
      goal: "输出一份范围封闭、禁止项明确且可命令行验证的 Plan 蓝图，不得顺带重做无关功能。",
      steps: [
        "选定单一垂直切片需求（若需求过大，主动砍掉二期功能，只留最小可闭环版本）。",
        "写出 Context（限定最多 3 个入口文件）与 Guardrails（明确 2 条绝对不准修改的现有模块或约束）。",
        "写出 DoD Verification（至少包含类型/Lint 检查与 1 个边界错误用例验证方法）。",
        "在下方笔记区保存你的蓝图草案与自我复盘，勾选完成标准并导出 Markdown。",
      ],
      requiredMaterials: [
        "PLAN_SPEC_TEMPLATE.md 模板骨架",
        "1 个待拆解需求场景（如：订单导出 / 反馈提交 / 个人头像更新）",
      ],
      humanResponsibilities: [
        "裁剪需求范围，决定本期只做什么、不做哪些二期功能",
        "写死禁止改动的现有认证、路由或公共组件边界",
        "审查最终验收命令确实覆盖核心风险",
      ],
      aiResponsibilities: [
        "根据人类给出的蓝图梳理具体实现步骤与文件影响面",
        "按清单补充边界测试用例草稿与局部源码实现",
      ],
    },
    learnerArtifact: {
      title: "M1 需求澄清与 Plan 审批蓝图草案",
      filename: "PLAN_SPEC_TEMPLATE.md",
      templateContent: `## Context（只给最小必要输入）
- 目标文件 / 入口: @src/routes/orders.ts @src/components/OrderTable.tsx
- 禁止修改边界: 登录鉴权中间件、全局导航栏样式、现有支付回调路由

## Intent（可观察行为）
- 输入与触发: 管理员点击「导出当前筛选 CSV」，支持空列表提示
- 预期输出: 仅导出当前状态过滤后的脱敏字段，不暴露内部成本价

## Guardrails（工程红线）
- 禁止新增重型 Excel 依赖库，使用纯原生字符串拼接与转义防止 CSV 公式注入
- 服务端必须校验管理员会话，不可仅凭前端传参过滤

## DoD Verification（AI 停下前必须执行）
1. npx tsc --noEmit（退出码 0）
2. npm run lint（无新增错误）
3. 验证空数据返回 200 空表头、未登录调用接口返回 401`,
    },
    completionCriteria: [
      "蓝图明确锁定入口文件，且至少写出 2 条不可触碰的文件或技术限制",
      "意图部分描述了具体输入、正常输出与至少 1 个异常/空态行为",
      "DoD 部分包含至少 1 条可执行工程命令（如 tsc/lint/test/curl），而非主观形容词",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "验证好用的边界禁令句式建议同步保存到团队知识库模板区。",
    teacherMaterials: {
      teachingTips:
        "巡场时重点看学员有没有写“禁止新增重型依赖”和“不修改 Auth”；若学员写的全是功能清单，提醒其砍掉一半当二期。",
      referenceAnswers: [
        "参考高分关键点：能主动把“权限、数据校验、CSV 注入转义、空状态”写进 Guardrails/DoD，且明确声明不改登录路由。",
        "可接受替代写法：如果学员使用 Issue Checklist 格式或简明四行表代替长 Markdown，只要 4 要素齐备均算满分通过。",
      ],
      commonPitfalls: [
        "把 5 个页面一起写进同一张 Plan 蓝图。",
        "忘记在导出场景声明服务端权限验证或敏感字段脱敏。",
      ],
      timeTrimNote: "工作坊模式建议把本练习延长至 20 分钟并留 5 分钟两人交叉挑刺。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
  },
  {
    id: "m1-u6-sandbox",
    moduleId: "m1",
    title: "06 交互沙盘：Lab 01 Plan → Agent 提示词审计台",
    type: "sandbox",
    learningObjective:
      "能在 Lab 01 沙盘中装配结构化提示词并通过全部 5 项本地工程审计（得分 100），辨识明文密钥与无界风险。",
    summary:
      "启动现有 Reveal.js 内置 Lab 01 交互沙盘，实时检验 Intent 具体度、Plan 先行、精准 @ 挂载、DoD 勾选与零密钥泄露。",
    contentBlocks: [
      "• 该沙盘在前端本地纯静态运行，无需任何外部大模型 API Key 即可获得即时规则审计反馈。",
      "• 完成 Lab 01 内置 3 项验收条件后，进度会自动同步回本课程系统首页与左侧导航栏。",
    ],
    relatedResourceIds: ["cursor-docs"],
    estimatedMinutes: 10,
    completionCriteria: [
      "在 Lab 01 选择 Plan 模式而非直接 Agent 一把梭",
      "挂载 1–4 个精确 @ 上下文符号并勾选至少 2 项可执行 DoD 门禁",
      "完成 Lab 01 全部验收勾选，且提示词无明文 Token 告警",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "Lab 01 中保存的提示词可随全局「工程交付包 (.md)」一键导出。",
    teacherMaterials: {
      teachingTips: "鼓励学员故意试一次把模式切回 Agent 并清空 @ 标签，亲眼观察审计分暴跌的原因。",
      referenceAnswers: [
        "满分组合：需求描述 >= 12 字且无空泛词 + 模式=Plan + 选中 1~4 个 @ 标签 + 勾选 >= 2 项 DoD + 无 sk-/ghp_ 字样。",
      ],
      commonPitfalls: ["部分学员在沙盘里一次性点亮全部 6 个 @ 标签，触发上下文过载警告。"],
      timeTrimNote: "短讲模式可跳过课堂现场操作沙盘，留作自主练习环节。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
    revealJump: { labId: "plan-prompt", label: "前往 Reveal 打开 Lab 01 沙盘" },
  },
  {
    id: "m1-u7-discussion",
    moduleId: "m1",
    title: "07 课堂讨论与复盘：哪些事该写规范，哪些直接改？",
    type: "discussion",
    learningObjective:
      "能结合自身过往返工实例判断问题出在四要素的哪一环，并在团队中识别过度文档与盲目直写的平衡点。",
    summary:
      "避免教条主义——既不鼓励一句话乱冲，也不把 2 行的文字修改强行套成半小时会议流程。",
    contentBlocks: [
      "• 讨论焦点 A：回想最近一次 AI 帮倒忙，补齐四要素中的哪一条本可以直接阻止那次返工？",
      "• 讨论焦点 B：什么样的小需求坚决不用写重型 Plan？（如单文件 UI 文案调整、明确位置的颜色Token替换、已有明确测试的 5 行 Bug 修复）。",
    ],
    relatedResourceIds: ["easy-vibe"],
    estimatedMinutes: 6,
    completionCriteria: [
      "写下至少 1 条针对自己过往返工经历的具体复盘归因",
      "能清晰区分“值得先 Plan”与“可轻量化直接修改”的两类真实工作场景",
      "记录下周起在工作流中要停用的 1 个不良习惯",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "研讨中达成共识的场景边界可沉淀为团队内部简版准入准则。",
    teacherMaterials: {
      teachingTips: "避免只讲正确大道理，请 2 位有不同背景（如 PM 与后端开发）的学员分享各自对范围边界的看法。",
      referenceAnswers: [
        "典型共识：只要改动涉及公共状态、数据持久层、外部接口契约或跨 2 个以上文件，哪怕代码量不大，也值得花 2 分钟过一遍 Plan 范围确认。",
      ],
      commonPitfalls: ["把讨论变成工具功能对比大会，偏离“人何时做控制与验收决策”。"],
      timeTrimNote: "双课时建议保留 8 分钟完整圆桌讨论；短讲课可改为课后思考题。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
  },
  {
    id: "m1-u8-quiz",
    moduleId: "m1",
    title: "08 模块巩固测验（M1 四题诊断）",
    type: "quiz",
    learningObjective:
      "能正确解答 M1 的 4 道核心判断与边界测验题，并根据错题建议定位对应练习加固。",
    summary:
      "涵盖传统手写 vs AI 编排重心转移、全库图拓扑缓存价值、SDD vs DoD 分工与七维工程权衡。",
    contentBlocks: [
      "• 测验结果仅保存在当前浏览器 localStorage，并与 Reveal 幻灯片末尾的 Module1Quiz 实时互通。",
    ],
    relatedResourceIds: ["dlai-prompt-eng"],
    estimatedMinutes: 6,
    completionCriteria: [
      "完成全部 4 道 M1 单选题并审阅每题解析",
      "答错题目均已查看对应知识点定位与补救操作建议",
      "确保本模块正确率达到 75%（至少答对 3 题）以上",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "错题暴露出的认知盲区建议补充进个人复盘日志。",
    teacherMaterials: {
      teachingTips: "建议讲师关注第 3 题（SDD 与 DoD 分工）和第 4 题（阶段权衡），常有学员混淆设计契约与退出验收门禁。",
      referenceAnswers: [
        "可在学员作答全部结束后展示解析，切勿在学员答题前提前念出正确选项字母。",
      ],
      commonPitfalls: ["只看答案对错，不点开对应的 Lab 补救动作验证。"],
      timeTrimNote: "工作坊模式可跳过当堂集中测验，改为课后自主自查。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
    revealJump: { slideOffset: 12, label: "跳转 Reveal Module1Quiz" },
  },
  {
    id: "m1-u9-kb",
    moduleId: "m1",
    title: "09 团队知识库沉淀与复用记录",
    type: "knowledge-base",
    learningObjective:
      "能查阅仓库知识库《Plan → Agent 四段式需求蓝图模板》，并撰写 1 条结合自身业务场景的可复用规则或笔记保存。",
    summary:
      "课程不是看完即散——把练习中验证好用的禁区条款与验证命令存入个人/团队知识库，支持一键导出 Markdown 带入真实仓库。",
    contentBlocks: [
      "• 官方知识条目位于 `docs/knowledge-base/templates-and-checklists.md` 与右上角「团队知识库」侧栏。",
      "• 用后反馈循环：下次在自己项目实际套用本模板后，若发现 AI 仍在某处越界，立刻把该目录加入 Guardrails 并升小版本号。",
    ],
    relatedResourceIds: ["aicoding-cookbook", "cursor-docs"],
    estimatedMinutes: 6,
    completionCriteria: [
      "查阅本模块关联知识条目的适用范围（Scope）与警示（Warning）",
      "在工作台新增或编辑至少 1 条结合自己项目特点的沉淀条目（或自定义蓝图规范）",
      "测试导出或复制 Markdown，确认可无障碍粘贴进自己项目文档中",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "支持直接在下方知识沉淀卡片新增条目并同步保存在本地浏览器。",
    teacherMaterials: {
      teachingTips: "现场展示仓库真实文件路径 `docs/knowledge-base/templates-and-checklists.md`，证明模板不是死 PPT。",
      referenceAnswers: [
        "沉淀示范：如“团队订单系统专用 Guardrails：禁止 AI 修改 priceCalculation.ts 的小数舍入规则，新增字段必须附带旧数据兼容默认值”。",
      ],
      commonPitfalls: ["直接整段复制默认模板不替换占位路径，导致拿到项目里没法直接用。"],
      timeTrimNote: "短讲与自主学习均建议保留至少 3 分钟完成这一步沉淀，避免学完空手离开。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
  },
  {
    id: "m1-u10-transfer",
    moduleId: "m1",
    title: "10 课后三档迁移任务（按时间与角色选做）",
    type: "transfer-task",
    learningObjective:
      "能根据自身时间选定一档课后真实任务，在有验证命令和人工审查卡点护航下完成首次项目迁移。",
    summary:
      "提供 30 分钟快速验证、数小时功能切片、多日团队准入规范三档难度，全部附带无外网 API 替代方式与人工确认门禁。",
    contentBlocks: [
      "• 无论选择哪一档任务，核心准则不变：先写清边界与验证方法再动手，完成后必须把有效改动回写知识库。",
    ],
    relatedResourceIds: ["learn-ai-coding"],
    estimatedMinutes: 8,
    afterClassNote: "详见下方三档迁移任务的输入约束、交付标准与人工审查卡点。",
    completionCriteria: [
      "明确选定与本周时间相匹配的 1 档课后迁移任务",
      "核对任务目标、输入限制及提交时的客观验证方法",
      "明确完成后需要由人类亲自复核的关键审查卡点",
    ],
    knowledgeEntryIds: ["kb-m1-plan-blueprint"],
    knowledgeSedimentNote: "完成后将真实踩坑反馈写回个人/团队知识库。",
    teacherMaterials: {
      teachingTips: "建议零基础或工作繁忙学员首周只选 30 分钟档“改写一次历史返工需求的启动蓝图”，降低起步阻力。",
      referenceAnswers: [
        "三档任务差异在于影响半径：个人历史复盘 -> 单分支真实垂直切片 -> 多人 PR 准入契约。",
      ],
      commonPitfalls: ["贪多直接挑团队级任务却没留校验回访时间，最终烂尾。"],
      timeTrimNote: "双课时结课用 5 分钟布置即可；自主学习者直接标记所选档位并记入复盘。",
    },
    verificationStatus: "verified",
    updatedAt: "2026-11-19",
  },
];

const M1_DELIVERY_PLANS: DeliveryPlan[] = [
  {
    id: "m1-plan-double",
    name: "双课时完整闭环（推荐课堂全程）",
    shortLabel: "双课时完整版",
    targetAudience: "完整新授课、训练营标准双课时教学",
    description: "依序经历概念建立 → 传统对比 → 讲师翻车示范 → 失败辨析 → 练习+沙盘 → 研讨测验 → 沉淀与迁移。",
    unitIds: [
      "m1-u1-concept",
      "m1-u2-ai-vs-trad",
      "m1-u3-demo",
      "m1-u4-failure",
      "m1-u5-practice",
      "m1-u6-sandbox",
      "m1-u7-discussion",
      "m1-u8-quiz",
      "m1-u9-kb",
      "m1-u10-transfer",
    ],
  },
  {
    id: "m1-plan-short",
    name: "短讲精要（午间分享 / 快速导入）",
    shortLabel: "短讲精要",
    targetAudience: "团队 30–40 分钟快速理念拉齐与示范导入",
    description: "跳过长时练习与测验，直击四段蓝图、瓶颈转移、讲师翻车对照、典型假 Plan 识破与核心模板带走。",
    unitIds: [
      "m1-u1-concept",
      "m1-u2-ai-vs-trad",
      "m1-u3-demo",
      "m1-u4-failure",
      "m1-u9-kb",
    ],
  },
  {
    id: "m1-plan-workshop",
    name: "实战工作坊（动手拆解与互审）",
    shortLabel: "工作坊实战",
    targetAudience: "以练习产出会商为主的 45 分钟实操专场",
    description: "极简概念交代后立刻进入需求拆解编写、Lab 01 沙盘审计、小组互批讨论与知识资产导出。",
    unitIds: [
      "m1-u1-concept",
      "m1-u5-practice",
      "m1-u6-sandbox",
      "m1-u7-discussion",
      "m1-u9-kb",
    ],
  },
  {
    id: "m1-plan-self",
    name: "自主学习路径（个人通关版）",
    shortLabel: "自主学习",
    targetAudience: "独立自学者、线上异步消化与自我自测",
    description: "保留核心原理、反例警示、动手练习、交互沙盘、测验核对、知识沉淀与课后迁移任务，省去多人课堂讨论。",
    unitIds: [
      "m1-u1-concept",
      "m1-u2-ai-vs-trad",
      "m1-u4-failure",
      "m1-u5-practice",
      "m1-u6-sandbox",
      "m1-u8-quiz",
      "m1-u9-kb",
      "m1-u10-transfer",
    ],
  },
];

const MODULE_STARTER_ARTIFACTS: Record<string, UnitLearnerArtifactSpec> = {
  m2: {
    title: "M2 上下文白名单与 .cursorignore 边界卡",
    filename: "CONTEXT_SCOPE_CARD.md",
    templateContent: `## 本次任务挂载范围（Context Allowlist）
- 核心入口文件: @src/features/checkout/service.ts @src/features/checkout/types.ts
- 显式排除路径（.cursorignore）: dist/ node_modules/ legacy-v1/ *.log

## 噪音过滤检查
- [ ] 已关闭无关历史标签页与废弃草稿文件
- [ ] 修改前已通过「只读架构测绘 Prompt」核对真实函数签名
- [ ] 跨文件改动不超过 5 个核心模块；超出则拆成子任务`,
  },
  m3: {
    title: "M3 独立产品垂直切片、鉴权证据与接口契约卡",
    filename: "PRODUCT_SLICE_SPEC.md",
    templateContent: `## 垂直切片范围（只保留 1 个可端到端跑通闭环）
- 用户流程: 表单提交 -> Zod 服务端校验 -> 本地/服务端持久化 -> 错误提示回显
- 严禁前端直连: 任何真实数据库管理员密钥或第三方支付 Secret 严禁放入 VITE_*

## 接口异常契约与 Starter 技能核验说明
- 400 Bad Request: 字段校验失败返回结构化 fieldErrors
- 401/403: 未认证或越权操作拒绝写库（须附带 401/403 拒绝测试输出或签名验证日志）
- 重要声明: 仅勾选完成 M3 不会自动解锁 skill-backend-api-auth / skill-ai-project-exp，须在模块页提交 Starter 证据或通过诊断测评
- 验证命令: npx tsc --noEmit && curl 异常与正常状态码`,
  },
  m4: {
    title: "M4 作用域规则与最小特权 MCP 配置骨架",
    filename: "20-api-and-mcp-guardrails.mdc",
    templateContent: `---
description: 约束服务端路由校验与 MCP 只读最小特权访问
globs: ["src/server/**/*.ts", ".cursor/mcp.json"]
alwaysApply: false
---
- 所有外部输入必须经过 Schema 校验，严禁将 req.body 直接写入存储
- .cursor/mcp.json 严禁出现明文 Token，统一使用 \${env:VAR_NAME} 引用
- 涉及写操作工具默认开启人工确认闸门，不配置生产库删除权限`,
  },
  m5: {
    title: "M5 防假绿 DoD 验证门禁清单",
    filename: "DOD_VERIFICATION_GATE.md",
    templateContent: `## 防 Reward Hacking 审查
- [ ] 严禁通过 skip 测试、删断言或放宽 any 类型绕过报错
- [ ] 至少包含 1 个边界错误输入用例（空值 / 非法格式 / 越权状态）
- [ ] 自愈循环最多尝试 3 轮：若仍失败立即暂停并核查根因

## 退出前必跑客观命令
1. npx tsc --noEmit
2. npm run lint
3. npm test`,
  },
  m6: {
    title: "M6 异步 Agent 分支隔离与 Bugbot 审查卡",
    filename: "BUGBOT_REVIEW_CHECKLIST.md",
    templateContent: `## 异步 Agent 派发前隔离检查
- 任务分支: feat/<isolated-slice>（严禁直接在 main 分支运行异步修改）
- 权限收窄: 禁止自动推送或修改部署密钥与生产配置

## 人工 Diff & Bugbot 二次确认
- [ ] 运行 git diff --stat 检查改动文件数与意外改写
- [ ] 逐条核对 Bugbot 安全/逻辑告警并排除误报
- [ ] 验证构建与测试通过后再发起合并`,
  },
  m7: {
    title: "M7 独立开发者 ROI 复利与债务止损卡",
    filename: "ROI_DECISION_MATRIX.md",
    templateContent: `## 本周投入-收益评估
- 重复踩坑问题: （例：AI 反复改坏日期时区转换）
- 复利沉淀动作: 写入 .cursor/rules/15-date-tz.mdc，后续 0 重复提醒

## 上线前止损红线（不可跨过）
- [ ] 未写端到端冒烟验证的支付/鉴权改动禁止上线
- [ ] 大型重构超过 2 轮无收敛立即回滚拆分，不继续堆砌修复补丁`,
  },
  m8: {
    title: "M8 长程 Coding Harness 五要素装配与多 Worktree 交接卡",
    filename: "LONG_HORIZON_HARNESS_RUNBOOK.md",
    templateContent: `## 系统五类长程 Coding Harness 装配清单
1. 指令（Instruction）: 锁定本轮单切片契约与禁止修改目录
2. 范围与权限（Scope & Permission）: Plan 模式 Schema Gating + Git Worktree 目录所有权隔离（agent-a -> src/server/**，agent-b -> src/components/**）
3. 工具与环境（Tools & Environment）: bash init.sh 幂等环境自检 + Lazy MCP 按需挂载
4. 状态与交接（State & Handoff）: feature_list.json（JSON 状态锚点，passes 只读验收）+ ACC 压缩摘要（保留未解报错与路径边界）
5. 验证与反馈（Verification & Feedback）: 3-Nudge 错因分流 + npm run lint && npx tsc --noEmit && npm run build

## 可选参考场景：原型工程化三步迁移
- 仅在迁入 AI Studio 原型时执行：拆 types/api/ui -> 补 Zod 与单测 -> 替换 Mock 为受控接口`,
  },
  m9: {
    title: "M9 全栈三层架构决策记录 (ADR) 与排错卡",
    filename: "ARCH_BOUNDARY_ADR.md",
    templateContent: `## 架构决策记录（ADR）
- 问题场景: （例：前端高频交互状态 vs 服务端权威账本边界划分）
- 选型结论: 前端负责交互展示与乐观反馈；金额/权限判定严格留在服务端
- 放弃方案与代价: 放弃纯前端直写规则，减少后期越权返工

## 高频报错解码入口
- 跨域 CORS / 401 / 500 -> 先看 Network 状态码与服务端 stderr，再定位路由与环境变量`,
  },
  m10: {
    title: "M10 高信噪比 UI 视觉参考拆解与组件契约",
    filename: "UI_VISUAL_TEARDOWN.md",
    templateContent: `## 视觉结构拆解（禁止纯形容词提示）
- 布局骨架: （例：顶部固定操作栏 + 左侧 4 列导航 + 右侧 8 列主内容区）
- 色彩与对比: 深色底板 #0b0f19 + 细边框 white/10 + 主强调色仅用于关键 CTA
- 反模式红线: 禁止无交互功能的静态彩色胶囊标签堆积；避免过度磨砂弹窗

## 响应式与键盘验收
- [ ] 移动端 < 640px 无横向溢出
- [ ] 表单输入与模态框支持键盘导航且不与全局快捷键冲突`,
  },
  m11: {
    title: "M11 Agent 产品蓝图（Workflow 决策 + Data/Prompt PRD + HITL 矩阵）",
    filename: "AGENT_PRODUCT_BLUEPRINT.md",
    templateContent: `## 1. Workflow vs Agent 架构判定
- 业务流程是否步骤固定且规则可枚举？ [ ] 是（优先确定性 Workflow） / [ ] 否（进入受控 Agent）
- 高风险写操作清单: 外部发送 / 删库 / 资金入账（全部要求人工 HITL 审批）

## 2. Data PRD（运行时领域知识契约）
- 数据源与更新频率: 规章文档 / 历史工单（每日增量 + 版本淘汰 Tombstone）
- 权限过滤主键: tenantId + role + status='active'（检索查询前强制 pre-filter）
- 溯源要求: 每条关键结论必须返回 docId + version + sectionAnchor

## 3. Prompt PRD 与预算熔断
- maxSteps 上限: 5 步 ｜ 单次调用 Token 上限: 12k ｜ 工具白名单: kb_search, ticket_draft
- 拒答与兜底话术: 无匹配授权引用时明确输出「依据不足，请转人工复核」，严禁编造条款`,
  },
  m12: {
    title: "M12 运行时 Agent 与领域知识库实现契约（ACL Pre-filter + Eval）",
    filename: "RUNTIME_AGENT_KB_IMPL.md",
    templateContent: `## 1. 运行时 KB 六步工程检查
- [ ] Ingestion: 文档切片携带 docId / version / tenantId / allowedRoles / status('active'|'deprecated')
- [ ] ACL Pre-filter: 查询索引前先按 caller.tenantId 与 caller.role 过滤，严禁先召回后靠 Prompt 遮蔽
- [ ] Hybrid + Wiki 路由: 结构化概念走 Wiki 词条路由，长文档走 BM25 + 向量混合召回
- [ ] Tombstone 淘汰: 发现新版本发布立即置 deprecated，检索零命中过期条款
- [ ] Citation Grounding: 输出校验每条事实均有有效引用 ID
- [ ] Dual Eval: 分别跑检索侧（0 越权 / 0 过期）与 Agent 端到端（步数熔断 + HITL 挂起）测试`,
  },
  "m13-gov": {
    title: "M13-Gov 无代码 Agent 上线前模拟治理评审审签单",
    filename: "GOV_CAPSTONE_REVIEW.md",
    templateContent: `> **重要声明**：${M13_GOV_DISCLAIMER_TEXT}

## 1. 预制轨迹风险扫描记录
- [ ] 跨租户/角色越权泄露核查（是否发现检索未做 ACL Pre-filter）
- [ ] 过期版本条款（deprecated）召回核查
- [ ] 无引用锚点编造结论核查
- [ ] 外部写操作（退款/发邮件/改权限）HITL 人工暂停核查

## 2. 模拟治理评审裁决
- 评审结论: [ ] Go（满足模拟条件） / [ ] Conditional（附条件整改） / [ ] No-Go（退回研发）
- 退回研发工单: 写明需研发在 M12/M13-Eng 补齐的真实测试与工程修复项`,
  },
  "m13-eng": {
    title: "M13-Eng 生产级 Agent、Harness 与运行时 KB 工程 Capstone 交付单",
    filename: "ENG_CAPSTONE_DELIVERY.md",
    templateContent: `## 1. 可运行系统与 Harness 护栏验收
- [ ] 长程开发期已通过 init.sh + Worktree 隔离 + 5 类 Coding Harness 检查
- [ ] 运行时 KB 已实施数据库/索引级 tenantId + role + active pre-filter（附单测退出码 0）

## 2. 双层 Eval 实测证据（严禁仅凭 3 条正向 Demo 过关）
- 检索侧 Eval: Recall@K 达标 ｜ 跨租户越权探针命中 = 0 ｜ 过期 Tombstone 召回 = 0
- Agent 端到端 Eval: 预算超限 maxSteps 熔断通过 ｜ 写操作 HITL 挂起通过 ｜ 忠实度校验通过
- 验证命令: npm run lint && npx tsc --noEmit && npm test`,
  },
};

function buildCompatibleUnitsForModule(
  mod: CourseModule,
  pkg: ModuleTeachingPackage
): { units: CourseUnit[]; deliveryPlans: DeliveryPlan[] } {
  const modKbEntries = [
    ...TEAM_KNOWLEDGE_BASE,
    ...RUNTIME_WORKSHOP_KNOWLEDGE_BASE,
  ].filter((kb) => kb.modules.includes(mod.code));
  const kbIds = modKbEntries.map((k) => k.id);
  const modLabs = COURSE_LABS.filter((l) => mod.labIds.includes(l.id));
  const quiz = MODULE_QUIZZES[mod.id];
  const quizSlideOffset = Math.max(0, mod.slideCount - 1);
  const demoSlideOffset = Math.min(2, quizSlideOffset);
  const practiceSlideOffset = Math.min(Math.max(1, Math.floor(mod.slideCount / 2)), quizSlideOffset);

  const conceptUnit: CourseUnit = {
    id: `${mod.id}-u1-concept`,
    moduleId: mod.id,
    title: `01 核心目标与适用边界：${pkg.coreQuestion}`,
    type: "concept",
    learningObjective: mod.learningObjectives[0] || `能说明 ${mod.code} 核心工作流与适用边界`,
    summary: `先修要求：${mod.prerequisites.join("；")}。边界声明：${mod.boundaryNote}`,
    contentBlocks: [
      ...mod.learningObjectives.map((obj, idx) => `目标 ${idx + 1}：${obj}`),
      `边界红线：${mod.boundaryNote}`,
      `可压缩说明：${pkg.trimAndMergeNote}`,
    ],
    relatedResourceIds: mod.resourceIds,
    estimatedMinutes: 8,
    completionCriteria: [
      "能复述本模块核心驱动问题及先修要求",
      "能明确指出不适合采用本模块复杂做法的边界条件",
      "能打开本模块对应的课程资源或原有幻灯片索引",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "对应团队知识库条目可在「知识库沉淀」单元直接查看与复制。",
    teacherMaterials: {
      teachingTips: `授课裁剪提示：${pkg.trimAndMergeNote}`,
      referenceAnswers: pkg.instructorDemo.acceptableAlternatives,
      commonPitfalls: [pkg.failureModesDeepDive.classicError],
      timeTrimNote: pkg.trimAndMergeNote,
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
    revealJump: { slideOffset: 0, label: `进入 Reveal ${mod.code} 幻灯片` },
  };

  const compareUnit: CourseUnit = {
    id: `${mod.id}-u2-compare`,
    moduleId: mod.id,
    title: "02 AI Coding vs 传统编程对照与人机分工",
    type: "ai-vs-trad",
    learningObjective: `能对比 ${mod.code} 中传统开发与 AI Coding 做法差异，并划清不可委托决策。`,
    summary: `瓶颈转移：${pkg.traditionalVsAi.bottleneckShift}`,
    contentBlocks: [
      ...pkg.traditionalVsAi.rows.map(
        (r) => `【${r.dimension}】传统：${r.traditionalWay} ｜ AI Coding：${r.aiCodingWay}`
      ),
      `必须由人决策：${pkg.humanAiSplit.humanMustDecide.join("；")}`,
      `AI 适合起草：${pkg.humanAiSplit.aiCanDraft.join("；")}`,
      `人机协作闭环：${pkg.humanAiSplit.collaborativeLoop}`,
    ],
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 7,
    completionCriteria: [
      "能指明本模块从传统到 AI Coding 后转移变重的核心审查瓶颈",
      "能说出至少 2 项绝对不允许委托给 AI 自动决断的事项",
      "能描述本模块推荐的人机协同闭环节奏",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "将人机分工与禁区条款纳入团队日常评审 Checklist。",
    teacherMaterials: {
      teachingTips: "对比表建议用具体业务后果说明为什么不能把决策权限交出。",
      referenceAnswers: pkg.traditionalVsAi.nonDelegableCases,
      commonPitfalls: [pkg.failureModesDeepDive.looksRightButWrong],
      timeTrimNote: "短讲模式重点强调瓶颈转移与不可委托事项。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
  };

  const demoUnit: CourseUnit = {
    id: `${mod.id}-u3-demo`,
    moduleId: mod.id,
    title: "03 教师演示：暴露缺陷 → 加约束 → 命令验真",
    type: "instructor-demo",
    learningObjective: `能观察并复述 ${mod.code} 演示中从首轮缺陷暴露到补齐约束并验真的完整控制流。`,
    summary: pkg.instructorDemo.targetOutcome,
    contentBlocks: [
      `课前环境准备：${pkg.instructorDemo.prepAndEnv}`,
      `无密钥离线替代：${pkg.instructorDemo.noKeyOfflineFallback}`,
    ],
    demoSteps: pkg.instructorDemo.steps,
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 12,
    completionCriteria: [
      "能指认演示首轮中暴露出的 AI 关键缺陷或风险行为",
      "能复述人工加约束后如何通过客观证据完成验证",
      "能说出除默认示范外的 1 种可接受替代工程方案",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: pkg.failureModesDeepDive.remediationRule,
    teacherMaterials: {
      teachingTips: `卡住引导话术：${pkg.instructorDemo.stuckStudentPrompts.join(" ｜ ")}`,
      referenceAnswers: pkg.instructorDemo.acceptableAlternatives,
      commonPitfalls: [
        `无 API Key 离线替代方案：${pkg.instructorDemo.noKeyOfflineFallback}`,
      ],
      timeTrimNote: "研讨或短讲可直接切入 Step 1 与 Step 2 前后对照。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
    revealJump: { slideOffset: demoSlideOffset, label: `查看 Reveal ${mod.code} 示范页` },
  };

  const failureUnit: CourseUnit = {
    id: `${mod.id}-u4-failure`,
    moduleId: mod.id,
    title: "04 常见错误与失败案例剖析",
    type: "failure-case",
    learningObjective: `能辨识 ${mod.code} 中“看起来对但实际错”的高频陷阱与工具失效根因，并写出纠偏规则。`,
    summary: pkg.failureModesDeepDive.classicError,
    contentBlocks: [
      `典型翻车模式：${pkg.failureModesDeepDive.classicError}`,
      `隐蔽失效特征：${pkg.failureModesDeepDive.looksRightButWrong}`,
      `工具/上下文故障源：${pkg.failureModesDeepDive.contextOrToolFailure}`,
    ],
    failureAnalysis: {
      mistakeScenario: pkg.failureModesDeepDive.classicError,
      rootCause: `${pkg.failureModesDeepDive.looksRightButWrong}（工具/上下文因素：${pkg.failureModesDeepDive.contextOrToolFailure}）`,
      analysisQuestions: pkg.failureModesDeepDive.triageQuestions,
      fixGuidance: pkg.failureModesDeepDive.remediationRule,
    },
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 8,
    completionCriteria: [
      "能指出本模块最常见的“表面通过但实质存在隐患”的反模式特征",
      "能独立回答至少 2 个排错诊断问题后再对照参考根因",
      "能写出 1 条可直接防复发的规则约束或检查门禁",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: pkg.failureModesDeepDive.remediationRule,
    teacherMaterials: {
      teachingTips: "请先让学员在学员视图下独立思考排查问题，再揭晓深层根因与纠偏做法。",
      referenceAnswers: [
        `深层根因：${pkg.failureModesDeepDive.looksRightButWrong}`,
        `防复发纠偏规范：${pkg.failureModesDeepDive.remediationRule}`,
      ],
      commonPitfalls: [pkg.failureModesDeepDive.contextOrToolFailure],
      timeTrimNote: "短讲模式重点展示“看起来对但实际错”的反例对比即可（约 5 分钟）。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
  };

  const starterArtifact = MODULE_STARTER_ARTIFACTS[mod.id] || {
    title: `${mod.code} 标准交付与复盘记录`,
    filename: `${mod.code}_PRACTICE_DELIVERABLE.md`,
    templateContent: `# ${mod.title} 练习产物与 Rubric 自检\n\n## 交付物清单\n${mod.deliverables
      .map((d) => `- ${d}`)
      .join("\n")}\n\n## Rubric 自查\n${pkg.rubric
      .map((r) => `- [ ] ${r.dimension}：${r.passCriteria}（证据：${r.evidence}）`)
      .join("\n")}\n\n## 人工确认边界\n${pkg.exerciseVariants.nonDelegableCheckpoints
      .map((c) => `- [ ] ${c}`)
      .join("\n")}`,
  };

  const practiceUnit: CourseUnit = {
    id: `${mod.id}-u5-practice`,
    moduleId: mod.id,
    title: "05 人机协同练习与多维 Rubric 检验",
    type: "collab-practice",
    learningObjective: `能按 ${mod.code} 分层练习要求完成人机协作输出，并通过全部 Rubric 与人工审查点检验。`,
    summary: `课堂最小版：${pkg.exerciseVariants.minimalClassroom}`,
    contentBlocks: [
      `课堂最小版：${pkg.exerciseVariants.minimalClassroom}`,
      `进阶挑战版：${pkg.exerciseVariants.advancedChallenge}`,
      `结对/团队模式：${pkg.exerciseVariants.pairOrTeamMode}`,
      `防背题换参种子：${pkg.exerciseVariants.randomizedSeedNote}`,
      `无外部依赖离线替代：${pkg.exerciseVariants.offlineSafeFallback}`,
    ],
    learnerTask: {
      goal: pkg.exerciseVariants.minimalClassroom,
      steps: [
        "明确本次练习的输入边界与禁止交由 AI 代劳的人类检查点。",
        "结合无 Key 离线方案或本地仓库运行人机协同实操并记录输出。",
        "对照多维 Rubric（非代码行数）逐条查验并留存产物与复盘。",
      ],
      requiredMaterials: mod.deliverables,
      humanResponsibilities: pkg.exerciseVariants.nonDelegableCheckpoints,
      aiResponsibilities: pkg.humanAiSplit.aiCanDraft,
    },
    learnerArtifact: starterArtifact,
    relatedResourceIds: mod.resourceIds,
    estimatedMinutes: 15,
    completionCriteria: pkg.rubric.map((r) => `${r.dimension}：${r.passCriteria}`),
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "将练习产出的规则或清单保留到团队知识库。",
    teacherMaterials: {
      teachingTips: "要求学员先过 Rubric 红线检查，再提交产物，不要拿未核对的大段代码凑数。",
      referenceAnswers: pkg.rubric.map((r) => `${r.dimension} 合格证据：${r.evidence}（红线：${r.redFlag}）`),
      commonPitfalls: pkg.rubric.map((r) => r.redFlag),
      timeTrimNote: "时间有限时聚焦课堂最小版完成 1 轮核验。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
    revealJump: { slideOffset: practiceSlideOffset, label: `打开 Reveal ${mod.code} 实战页` },
  };

  const sandboxUnits: CourseUnit[] = modLabs.map((lab, idx) => ({
    id: `${mod.id}-u6-sandbox-${lab.id}`,
    moduleId: mod.id,
    title: `${String(6 + idx).padStart(2, "0")} 交互沙盘：Lab ${lab.code} ${lab.title}`,
    type: "sandbox",
    learningObjective: `能在 Lab ${lab.code} 沙盘内完成实操演练并全部通过其 DoD 验收标准。`,
    summary: lab.goal,
    contentBlocks: [
      `初始起点：${lab.startingState}`,
      `预计耗时：${lab.estimatedMinutes} 分钟（费用级别：${lab.cost === "free" ? "免费本地模拟" : "可选 AI 增强，无 Key 可本地降级"}）`,
      `安全边界：${lab.safetyNotes.join(" ")}`,
    ],
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: lab.estimatedMinutes,
    completionCriteria:
      lab.acceptanceCriteria.length >= 3
        ? lab.acceptanceCriteria
        : [
            ...lab.acceptanceCriteria,
            `保存并留存沙盘产出物：${lab.deliverables[0] || lab.title}`,
            "写下 1 条沙盘模拟结果与真实生产环境之间的安全差异边界",
          ].slice(0, Math.max(3, lab.acceptanceCriteria.length + 1)),
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: `沙盘产出物：${lab.deliverables.join("；")}`,
    teacherMaterials: {
      teachingTips: `沙盘常见误区：${lab.failureModes.join("；")}`,
      referenceAnswers: lab.acceptanceCriteria,
      commonPitfalls: lab.failureModes,
      timeTrimNote: "如已使用同系列沙盘，可由讲师快速带过关键判定步骤。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
    revealJump: { labId: lab.id, label: `启动 Reveal Lab ${lab.code}` },
  }));

  const nextNumBase = 6 + sandboxUnits.length;

  const discussionUnit: CourseUnit = {
    id: `${mod.id}-u7-discussion`,
    moduleId: mod.id,
    title: `${String(nextNumBase).padStart(2, "0")} 讨论与复盘：人机协作裁决点与团队摩擦`,
    type: "discussion",
    learningObjective: `能结合自身项目场景说明 ${mod.code} 中人类裁决边界的取舍依据，避免教条套用。`,
    summary: pkg.humanAiSplit.collaborativeLoop,
    contentBlocks: [
      `• 研讨焦点 A（不可委派红线）：${pkg.traditionalVsAi.nonDelegableCases.join("；")}`,
      `• 研讨焦点 B（人类核查点）：${pkg.exerciseVariants.nonDelegableCheckpoints.join("；")}`,
      `• 研讨焦点 C（常见阻塞追问）：${pkg.instructorDemo.stuckStudentPrompts[0] || pkg.coreQuestion}`,
    ],
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 6,
    completionCriteria: [
      "写下 1 条结合自身仓库真实情况的裁决取舍笔记",
      "指出 1 处本模块做法在团队落地时最容易出现的教条主义误区",
      "明确 1 项需在下周代码审查中强化的个人/团队核对动作",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "研讨达成的团队准入共识建议记录为团队决策档案（ADR）。",
    teacherMaterials: {
      teachingTips: "鼓励不同岗位学员（前端/后端/PM/负责人）就风险承担点交换真实视角。",
      referenceAnswers: pkg.traditionalVsAi.nonDelegableCases,
      commonPitfalls: ["只谈工具表面快捷，忽略真实项目中的权限、成本或回归责任边界。"],
      timeTrimNote: "自主学习或紧凑短讲可略过现场圆桌，保留复盘笔记即可。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
  };

  const quizUnit: CourseUnit = {
    id: `${mod.id}-u8-quiz`,
    moduleId: mod.id,
    title: `${String(nextNumBase + 1).padStart(2, "0")} 巩固测验（${quiz ? quiz.questions.length : 3} 题即时诊断）`,
    type: "quiz",
    learningObjective: `能独立完成 ${mod.code} 核心诊断测验，并针对错题定位相应沙盘或知识点加固。`,
    summary: "支持在本工作台直接作答测验并即时查看解析与补救建议，作答记录与 Reveal 幻灯片测验双向同步。",
    contentBlocks: [
      `• 本测验包含 ${quiz ? quiz.questions.length : 3} 道聚焦工程边界与异常排查的选择题。`,
      "• 作答记录保存在当前浏览器 localStorage，不依赖任何云端服务。",
    ],
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 6,
    completionCriteria: [
      `完成全部 ${quiz ? quiz.questions.length : 3} 道核心自测题并阅读解析`,
      "针对存在疑问或答错题目查阅对应补救行动与沙盘入口",
      "确保核心概念与红线判断准确无误",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "建议把易混淆选项背后的判定依据补入个人笔记。",
    teacherMaterials: {
      teachingTips: "建议在学员全部提交后再集中串讲易错题，避免先念答案剧透。",
      referenceAnswers: (quiz?.questions || []).map(
        (q, i) => `Q${i + 1} (${q.topic})：${q.options[q.correctIndex]}`
      ),
      commonPitfalls: ["仅凭直觉选最长选项，未核查安全红线与校验依据。"],
      timeTrimNote: "工作坊模式可将测验移至课后自主通关。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
    revealJump: { slideOffset: quizSlideOffset, label: `跳转 Reveal ${mod.code} Quiz` },
  };

  const kbUnit: CourseUnit = {
    id: `${mod.id}-u9-kb`,
    moduleId: mod.id,
    title: `${String(nextNumBase + 2).padStart(2, "0")} 团队知识库沉淀与资产复用`,
    type: "knowledge-base",
    learningObjective: `能检索并审阅 ${mod.code} 关联知识库条目边界，并沉淀至少 1 条适配自身项目的可复用规则或清单。`,
    summary: `本模块内置 ${modKbEntries.length} 条工程知识库资产，支持直接新增个人/团队草稿并随成果导出 Markdown。`,
    contentBlocks: [
      `• 本模块关联内置条目（${modKbEntries.length} 条）：${modKbEntries.map((k) => `《${k.title}》`).join("、") || "通用工程规范"}。`,
      "• 务必核对每条知识的适用范围（Scope）、验证态（已验证 / 待验证假设 / 已废弃实践）与前置警示，避免跨场景盲搬。",
    ],
    relatedResourceIds: mod.resourceIds,
    estimatedMinutes: 6,
    completionCriteria: [
      "查看本模块关联团队知识库条目的适用范围与警示条款",
      "利用本单元快速表单或知识库中心保存至少 1 条可复用规则/检查清单",
      "验证导出的 Markdown 内容可直接贴入目标项目仓库中复用",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: pkg.failureModesDeepDive.remediationRule,
    teacherMaterials: {
      teachingTips: "提醒学员重点关注标注“待验证假设”和“已废弃实践”的条目，理解规则会随模型迭代而过期。",
      referenceAnswers: modKbEntries.map((k) => `《${k.title}》适用范围：${k.scope}`),
      commonPitfalls: ["整段照搬示例目录或忽略版本变更直接写死进全局规则。"],
      timeTrimNote: "即便在短讲中也保留 3 分钟，确保学员带走至少 1 条结构化模板。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
  };

  const transferUnit: CourseUnit = {
    id: `${mod.id}-u10-transfer`,
    moduleId: mod.id,
    title: `${String(nextNumBase + 3).padStart(2, "0")} 课后三档迁移任务（按时间与角色选做）`,
    type: "transfer-task",
    learningObjective: `能选定 1 档与当前时间匹配的 ${mod.code} 课后真实迁移任务，明确交付物与人工审查卡点。`,
    summary: "从 30 分钟单点微改到多日团队规范落地，均附带无外网 API 离线替代方案与不可跳过的人类卡点。",
    contentBlocks: pkg.homeworkTiers.map(
      (hw) => `【${hw.label}】${hw.title} — 输入限制：${hw.inputsAndLimits} ｜ 离线替代：${hw.offlineFallback}`
    ),
    relatedResourceIds: mod.resourceIds.slice(0, 2),
    estimatedMinutes: 8,
    afterClassNote: pkg.homeworkTiers.map((h) => `${h.label}：${h.deliverable}`).join(" ｜ "),
    completionCriteria: [
      "根据自身角色与可用时间选定 1 档课后迁移任务并保存",
      "确认提交物所需的客观验证命令与离线替代方案",
      "明确任务完成后必须由人工亲自签核的审查卡点",
    ],
    knowledgeEntryIds: kbIds,
    knowledgeSedimentNote: "完成课后迁移后，将实际踩坑与新规则反向更新进团队知识库。",
    teacherMaterials: {
      teachingTips: "鼓励零基础或时间紧张学员优先选 A 档 30 分钟快速验证任务，确保形成首次闭环。",
      referenceAnswers: pkg.homeworkTiers.map((h) => `${h.label} 人工把关：${h.humanReviewGate}`),
      commonPitfalls: ["直接选择跨团队大改任务但未预留评审窗口，导致中途放弃。"],
      timeTrimNote: "结课用 3–5 分钟布置并让学员当场选定档位。",
    },
    verificationStatus: mod.status,
    updatedAt: mod.lastReviewedAt,
  };

  const units = [
    conceptUnit,
    compareUnit,
    demoUnit,
    failureUnit,
    practiceUnit,
    ...sandboxUnits,
    discussionUnit,
    quizUnit,
    kbUnit,
    transferUnit,
  ];

  const sandboxIds = sandboxUnits.map((u) => u.id);

  const deliveryPlans: DeliveryPlan[] = [
    {
      id: `${mod.id}-plan-double`,
      name: "双课时完整闭环（推荐课堂全程）",
      shortLabel: "双课时完整版",
      targetAudience: "完整授课、训练营标准双课时教学",
      description: "依序经历概念边界 → 传统对比 → 讲师演示 → 失败剖析 → 协同练习与沙盘 → 研讨测验 → 沉淀与迁移。",
      unitIds: units.map((u) => u.id),
    },
    {
      id: `${mod.id}-plan-short`,
      name: "短讲精要（午间分享 / 快速导入）",
      shortLabel: "短讲精要",
      targetAudience: "团队 30–40 分钟理念对齐与核心控制流导入",
      description: "聚焦概念边界、人机对照、翻车演示、隐蔽失败剖析与知识库带走。",
      unitIds: [conceptUnit.id, compareUnit.id, demoUnit.id, failureUnit.id, kbUnit.id],
    },
    {
      id: `${mod.id}-plan-workshop`,
      name: "实战工作坊（动手演练与互评）",
      shortLabel: "工作坊实战",
      targetAudience: "以现场练习、沙盘审计与裁决互评为主的实操专场",
      description: "快速交代边界后直接进入协同练习、交互沙盘、团队研讨与知识资产沉淀。",
      unitIds: [
        conceptUnit.id,
        practiceUnit.id,
        ...sandboxIds,
        discussionUnit.id,
        kbUnit.id,
      ],
    },
    {
      id: `${mod.id}-plan-self`,
      name: "自主学习路径（个人通关版）",
      shortLabel: "自主学习",
      targetAudience: "线上个人学习、沙盘自测与课后迁移落地",
      description: "保留核心原理、对比、反例辨析、实操沙盘、自测检验、知识沉淀与迁移任务。",
      unitIds: [
        conceptUnit.id,
        compareUnit.id,
        failureUnit.id,
        practiceUnit.id,
        ...sandboxIds,
        quizUnit.id,
        kbUnit.id,
        transferUnit.id,
      ],
    },
  ];

  return { units, deliveryPlans };
}

const COMPLETE_EXEMPLAR_IDS = new Set(["m1", "m11", "m12", "m13-gov", "m13-eng"]);

export const COURSE_MODULE_RECORDS: CourseModuleRecord[] = COURSE_MODULES.map((mod) => {
  const pkg = MODULE_TEACHING_PACKAGES[mod.id];
  if (mod.id === "m1") {
    return {
      id: mod.id,
      code: mod.code,
      order: mod.order,
      trackId: mod.trackId,
      title: mod.title,
      exemplarLevel: "complete-exemplar",
      audience: mod.audience,
      prerequisites: mod.prerequisites,
      prerequisiteModuleIds: mod.prerequisiteModuleIds,
      prerequisiteSkillIds: mod.prerequisiteSkillIds,
      grantsSkillIds: mod.grantsSkillIds,
      learningObjectives: mod.learningObjectives,
      boundaryNote: mod.boundaryNote,
      units: M1_FULL_UNITS,
      deliveryPlans: M1_DELIVERY_PLANS,
      labIds: mod.labIds,
      resourceIds: mod.resourceIds,
      status: mod.status,
      updatedAt: "2026-11-20",
    };
  }

  const compatible = buildCompatibleUnitsForModule(mod, pkg);
  if (mod.id === "m13-gov") {
    compatible.units = compatible.units.map((u) =>
      u.type === "concept" || u.type === "sandbox" || u.type === "collab-practice"
        ? {
            ...u,
            contentBlocks: [
              `【模拟治理边界声明】${M13_GOV_DISCLAIMER_TEXT}`,
              ...u.contentBlocks,
            ],
          }
        : u
    );
  }

  return {
    id: mod.id,
    code: mod.code,
    order: mod.order,
    trackId: mod.trackId,
    title: mod.title,
    exemplarLevel: COMPLETE_EXEMPLAR_IDS.has(mod.id) ? "complete-exemplar" : "compatible-adapter",
    audience: mod.audience,
    prerequisites: mod.prerequisites,
    prerequisiteModuleIds: mod.prerequisiteModuleIds,
    prerequisiteSkillIds: mod.prerequisiteSkillIds,
    grantsSkillIds: mod.grantsSkillIds,
    learningObjectives: mod.learningObjectives,
    boundaryNote: mod.boundaryNote,
    units: compatible.units,
    deliveryPlans: compatible.deliveryPlans,
    labIds: mod.labIds,
    resourceIds: mod.resourceIds,
    status: mod.status,
    updatedAt: mod.lastReviewedAt || COURSE_LAST_REVIEWED_AT,
  };
});

export function getModuleRecordById(moduleId: string): CourseModuleRecord | undefined {
  return COURSE_MODULE_RECORDS.find((m) => m.id === moduleId);
}

export function getUnitsForPlan(moduleRecord: CourseModuleRecord, planId?: string): CourseUnit[] {
  const plan =
    moduleRecord.deliveryPlans.find((p) => p.id === planId) || moduleRecord.deliveryPlans[0];
  if (!plan) return moduleRecord.units;
  const byId = new Map(moduleRecord.units.map((u) => [u.id, u]));
  return plan.unitIds.map((id) => byId.get(id)).filter((u): u is CourseUnit => Boolean(u));
}

export function getDeliveryPlanMinutes(
  moduleRecord: CourseModuleRecord,
  plan: DeliveryPlan
): number {
  const byId = new Map(moduleRecord.units.map((u) => [u.id, u]));
  return plan.unitIds.reduce((sum, id) => sum + (byId.get(id)?.estimatedMinutes ?? 0), 0);
}

export function getResourcesByIds(resourceIds: string[]) {
  const set = new Set(resourceIds);
  return COURSE_RESOURCES.filter((r) => set.has(r.id));
}
