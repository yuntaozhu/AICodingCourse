import type { ModuleShortCode } from "./courseCurriculum";

export interface DeliveryModeOption {
  mode: "double-period" | "short-lecture" | "workshop" | "seminar" | "self-paced";
  label: string;
  duration: string;
  focusPlan: string;
}

export interface TraditionalVsAiRow {
  dimension: string;
  traditionalWay: string;
  aiCodingWay: string;
}

export interface InstructorDemoStep {
  phase: string;
  action: string;
  aiBehaviorOrEvidence: string;
  humanControl: string;
}

export interface RubricDimension {
  dimension: string;
  passCriteria: string;
  evidence: string;
  redFlag: string;
}

export interface HomeworkTier {
  tier: "quick-30m" | "module-hours" | "team-days";
  label: string;
  title: string;
  goal: string;
  inputsAndLimits: string;
  deliverable: string;
  verifyMethod: string;
  kbContribution: string;
  offlineFallback: string;
  humanReviewGate: string;
}

export interface ModuleTeachingPackage {
  moduleId: string;
  moduleCode: ModuleShortCode;
  coreQuestion: string;
  deliveryModes: DeliveryModeOption[];
  trimAndMergeNote: string;
  traditionalVsAi: {
    rows: TraditionalVsAiRow[];
    bottleneckShift: string;
    nonDelegableCases: string[];
  };
  humanAiSplit: {
    humanMustDecide: string[];
    aiCanDraft: string[];
    collaborativeLoop: string;
  };
  instructorDemo: {
    prepAndEnv: string;
    targetOutcome: string;
    steps: InstructorDemoStep[];
    stuckStudentPrompts: string[];
    noKeyOfflineFallback: string;
    acceptableAlternatives: string[];
  };
  exerciseVariants: {
    minimalClassroom: string;
    advancedChallenge: string;
    pairOrTeamMode: string;
    randomizedSeedNote: string;
    offlineSafeFallback: string;
    nonDelegableCheckpoints: string[];
  };
  failureModesDeepDive: {
    classicError: string;
    looksRightButWrong: string;
    contextOrToolFailure: string;
    triageQuestions: string[];
    remediationRule: string;
  };
  rubric: RubricDimension[];
  homeworkTiers: HomeworkTier[];
}

export const MODULE_TEACHING_PACKAGES: Record<string, ModuleTeachingPackage> = {
  m1: {
    moduleId: "m1",
    moduleCode: "M1",
    coreQuestion: "如何把一句模糊需求拆解为 AI 可收敛、人类可验收的执行蓝图？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "完整讲授范式演进 + 现场故意翻车演示 + Lab 01 分组演练 + 蓝图互评 + 测验复盘。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "聚焦“一句话盲写 vs Plan 四段式”对比与翻车现场演示，现场带过 Lab 01 最小练习。",
      },
      {
        mode: "workshop",
        label: "工作坊 (40m)",
        duration: "40 分钟",
        focusPlan: "跳过概念背景，直接拿各自真实功能需求用 Plan 蓝图模板改写并交换做 DoD 挑刺。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "拆解 2 份过往因为指令模糊导致的返工 PR，现场补齐禁改边界与验收命令。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "30 分钟",
        focusPlan: "按闭环工作台 01–04 标签顺序学习，在 Lab 01 跑通 100 分审计后完成 4 道巩固题。",
      },
    ],
    trimAndMergeNote:
      "若课程总时长紧缩，可将 M1 前半段与 M3 产品 MVP 启动阶段合并讲授，保留“Plan 先行 + 禁止边界 + DoD 验收”主线。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "任务表达与起点",
          traditionalWay: "由人直接拆文件与函数签名，在 IDE 内逐行打草稿。",
          aiCodingWay: "人编写 Context/Intent/Guardrails/DoD 规格，AI 在秒级产出多文件候选方案。",
        },
        {
          dimension: "执行与试错成本",
          traditionalWay: "写错样板代价高，往往边写边小步推演接口。",
          aiCodingWay: "生成很快但更容易一次性污染 6~10 个文件，返工成本从“打字”转移到“回滚与范围清洗”。",
        },
        {
          dimension: "验证方式",
          traditionalWay: "作者本人清楚自己改了哪几行，自测焦点明确。",
          aiCodingWay: "必须依赖独立验证命令（tsc/test/curl）确认 AI 没有顺手改坏未提及模块。",
        },
      ],
      bottleneckShift:
        "编码起草时间大幅压缩，但瓶颈转移到“需求边界是否写清”与“人类如何快速判断候选方案是否越界”。",
      nonDelegableCases: [
        "核心业务优先级取舍与是否上线该功能的决策",
        "不可逆的数据表删改、权限模型变更与对外兼容承诺",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "业务目标与本次只修改的垂直切片范围（Scope）",
        "严禁触碰的文件、现有公开 API 契约与安全边界",
        "是否放行 Plan 进入编码、以及最终是否合并 Diff",
      ],
      aiCanDraft: [
        "基于已有仓库梳理受影响文件清单",
        "生成实现步骤草案、边界测试用例骨架与样板代码",
      ],
      collaborativeLoop: "人写四段蓝图 -> AI 给方案与文件清单 -> 人删多余改动并确认契约 -> AI 编码 -> 命令验真。",
    },
    instructorDemo: {
      prepAndEnv: "准备任意含 3 个以上路由/页面的示例仓库（离线可用 Lab 01 本地模拟沙盘）。",
      targetOutcome: "现场演示模糊指令为何必然翻车，以及补齐禁改边界与 DoD 后如何收敛。",
      steps: [
        {
          phase: "Step 1 · 首轮反面示范",
          action: "向 AI 输入一句模糊指令：“帮我把个人中心升级一下，加上导出数据功能。”",
          aiBehaviorOrEvidence: "AI 顺手改动全局导航样式、替换依赖并写了一个前端假导出按钮，未校验权限。",
          humanControl: "讲师暂停应用修改，指出未定义边界导致 AI 自行脑补且越权修改共用布局。",
        },
        {
          phase: "Step 2 · 定位失败与补齐约束",
          action: "退回修改前，切换 Plan Mode 补写 Context(@指定路由)、Guardrails(禁改全局样式与权限层) 与 DoD。",
          aiBehaviorOrEvidence: "AI 先返回仅涉及目标路由与独立导出组件的 2 步方案清单，标出待确认字段。",
          humanControl: "讲师核对方案：驳回其顺带引入重型表格库的提议，要求改用轻量原生 CSV 输出。",
        },
        {
          phase: "Step 3 · 局部执行与命令验收",
          action: "只放行已对齐的方案执行修改，并运行 `npx tsc --noEmit` 与边界 curl 验证。",
          aiBehaviorOrEvidence: "构建通过且未影响无关页面；仅在目标接口返回预期字段。",
          humanControl: "讲师核对 `git diff --stat` 与命令输出，决定保留变更并归档蓝图模板。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：如果写不出 Guardrails，请先问自己“这次改坏哪 2 个文件我会最头疼”，把它们写进禁止修改清单。",
        "提示卡：先只做一个最小按钮或单条 API，不要试图在第一张 Plan 里囊括登录、导出与权限后台。",
      ],
      noKeyOfflineFallback: "无任何 API Key 或网络时，全程在课程 Lab 01（Plan→Agent 提示词沙盘）完成对比审计。",
      acceptableAlternatives: [
        "Plan 可用 Markdown 四段式，也可用 Issue 模板或简明表格表达，重点在于边界与验证命令可核查。",
        "小型确定性单函数修改无需强行开复杂 Plan，可直接局部内联完成。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 01 选 1 个预设业务场景，补充 2 条禁止修改边界 + 1 条可执行 DoD 命令，使审计得分达到 100。",
      advancedChallenge: "把上述场景拆成 2 个互不重叠的垂直切片蓝图，确保前切片不依赖后切片即可独立验收合并。",
      pairOrTeamMode: "两人互换需求蓝图扮演审查者：只要能找出 1 个未写清的异常输入或越界风险，即要求对方修订后重交。",
      randomizedSeedNote: "练习时随机抽取限制条件（如：禁用新增第三方依赖 / 必须保留旧版 API 字段 / 限时 10 分钟上线）。",
      offlineSafeFallback: "无外网环境使用课程内置 Lab 01 规则与本地 `PLAN_SPEC_TEMPLATE.md` 完成演练。",
      nonDelegableCheckpoints: [
        "不得由 AI 自行决定“顺便重构哪个无关目录”",
        "DoD 中的验收命令必须由人类核对确实能覆盖核心风险",
      ],
    },
    failureModesDeepDive: {
      classicError: "一句话大包大揽提示词导致 AI 改动 15 个文件并悄悄删除旧逻辑。",
      looksRightButWrong: "AI 输出了长达 400 字看似结构严谨的 Plan，但缺少“不允许修改什么”和具体验证命令，导致一执行仍旧发散。",
      contextOrToolFailure: "把整个无用页面甚至旧草稿一起 `@` 进上下文，诱导 AI 按废弃结构设计新方案。",
      triageQuestions: [
        "这份 Plan 里哪些文件是这次真的需要改的，哪些只是 AI 想顺手优化？",
        "如果修改失败，我靠哪一条客观命令或人工步骤第一时间发现？",
      ],
      remediationRule: "遵循 kb-m1-plan-blueprint：每次跨文件动作前锁定「目标入口 + 禁改清单 + 验证命令」三要素。",
    },
    rubric: [
      {
        dimension: "范围可控性",
        passCriteria: "明确指定目标修改入口并显式列出至少 2 项禁触碰文件或行为边界。",
        evidence: "蓝图文本中的 Context 与 Guardrails 段落 + 修改后 `git diff --stat`。",
        redFlag: "出现“顺便优化整个项目/相关代码全部重构”等无界描述。",
      },
      {
        dimension: "可观察验收标准",
        passCriteria: "给出至少 1 条可执行命令或客观测评点，明确成功与失败判定证据。",
        evidence: "蓝图 DoD 段（如 `npx tsc --noEmit`、接口状态码与异常输入断言）。",
        redFlag: "仅写“页面好看、功能正常工作、没报错就行”。",
      },
      {
        dimension: "人工审查与决策留痕",
        passCriteria: "记录人主动删减或修正 AI 首轮计划中至少 1 处过度设计的决策依据。",
        evidence: "对比首轮 AI 提案与最终放行清单的调整说明。",
        redFlag: "未阅读 AI 输出的计划清单就直接全选 Accept。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "改写一次历史返工需求的启动蓝图",
        goal: "挑自己最近一次让 AI 改坏代码的需求，按四段模板重写启动蓝图。",
        inputsAndLimits: "仅输入 1 个业务需求，限制改动 <= 3 个文件，禁止引入新依赖。",
        deliverable: "修订前/后提示词对比 + 明确列出的 3 条禁改边界。",
        verifyMethod: "交由同伴或新会话审查该蓝图能否在不猜的情况下定位修改点与验证命令。",
        kbContribution: "若提炼出通用的禁改句式，补充进个人常用蓝图清单或团队模板。",
        offlineFallback: "使用纯文本 Markdown 对比修订，无需连接外部大模型 API。",
        humanReviewGate: "由人类亲自核对旧返工原因是否已被蓝图里的 Guardrails 彻底堵住。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "用 Plan→Agent 在真实小项目交付一个垂直切片",
        goal: "从零用先 Plan 后执行方式完成一个带表单校验与异常提示的功能切片。",
        inputsAndLimits: "本地任意 Git 仓库新分支；必须先提交或保存 Plan 文档再允许 Agent 写代码。",
        deliverable: "Plan.md + 控制在合理 Diff 范围内的功能提交 + DoD 验证日志。",
        verifyMethod: "运行项目类型检查、Lint 与至少 2 个边界输入用例并记录通过截图/输出。",
        kbContribution: "把过程中 AI 试图越界的文件类型补充进团队 `templates-and-checklists.md`。",
        offlineFallback: "无 API Key 可基于课程仓库本地新建练习分支用文本校验逻辑练习。",
        humanReviewGate: "人类逐文件核对 Diff，确认无多余注释、死代码或无关样式篡改。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "建立团队级需求/PR 蓝图准入模板",
        goal: "针对团队真实迭代中最易返工的一类任务建立标准 Plan 模板并在 3 个 PR 试行。",
        inputsAndLimits: "覆盖前后端联调或权限变更类需求；要求每位成员对模板提 1 条改进建议。",
        deliverable: "沉淀进仓库的 `PLAN_SPEC_TEMPLATE.md` + 3 次使用反馈记录。",
        verifyMethod: "对比试行前后因“范围改错/漏测异常”被打回的评审次数。",
        kbContribution: "在 `docs/knowledge-base/` 新增或更新团队专属蓝图并标注版本号与负责人。",
        offlineFallback: "以团队周会离线评审 3 份近期真实需求文档代替线上流水线试点。",
        humanReviewGate: "由技术负责人评审模板是否造成过度文书负担，裁剪非必要字段。",
      },
    ],
  },

  m2: {
    moduleId: "m2",
    moduleCode: "M2",
    coreQuestion: "如何确保 AI 看见的是高信噪比真代码，而非构建垃圾与腐败记忆？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "上下文窗口机理 + .cursorignore 配置 + 跨模块调用链追踪演示 + Context Rot 急救演练。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "精讲“噪音污染与新会话复位”，现场演示去掉 dist/ 噪音前后的检索命中对比。",
      },
      {
        mode: "workshop",
        label: "工作坊 (40m)",
        duration: "40 分钟",
        focusPlan: "学员携带当前在研仓库清理 .cursorignore，并用 ACC 摘要模板给长对话做交接。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "诊断一组“AI 一直改错旧字段”的对话历史，练习何时该切断对话重启。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "35 分钟",
        focusPlan: "完成模块闭环演练 + Lab 06 上下文负载压测对比 + M2 测验。",
      },
    ],
    trimAndMergeNote: "如果受众以零代码 PM 为主，可将本模块精简为 15 分钟并并入 M1 讲“为什么不能乱贴整个文档”。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "阅读大型陌生仓库",
          traditionalWay: "人靠 IDE 全局搜索、跳定义和文档逐步拼出调用链。",
          aiCodingWay: "借助代码库索引与精确 `@` 引用在分钟级梳理主干调用与依赖边界。",
        },
        {
          dimension: "信息过载的影响",
          traditionalWay: "人翻目录遇到 `dist/` 会自动跳过。",
          aiCodingWay: "若不屏蔽产物目录和失效日志，AI 会按编译混淆代码或旧日志编造建议。",
        },
        {
          dimension: "多轮调试记忆",
          traditionalWay: "人的大脑容易疲劳但不会把 10 轮前报错当成真需求。",
          aiCodingWay: "对话越长信噪比越差，旧错误样本持续诱发幻觉，必须主动摘要切换新会话。",
        },
      ],
      bottleneckShift: "从“自己翻代码找入口太慢”转向“控制上下文纯度与及时清理腐败会话状态”。",
      nonDelegableCases: [
        "敏感凭证文件（.env、私钥）与合规数据的访问隔离决策",
        "跨核心模块重构时，由人确认调用链清单中是否有反射/动态路由漏网之鱼",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "哪些目录和密钥必须被 `.cursorignore` 严格屏蔽",
        "何时对话已出现 Context Rot 必须截断重开",
        "跨模块改造影响面清单是否已完整覆盖动态调用与外部消费者",
      ],
      aiCanDraft: [
        "扫描目标入口的上下游调用图与类型引用点",
        "生成结构化会话交接摘要（目标、已定契约、未完待办）",
      ],
      collaborativeLoop: "人划定索引边界 -> AI 梳理影响面 -> 人核查漏网动态依赖 -> 分小批次修改 -> 状态摘要切换新会话。",
    },
    instructorDemo: {
      prepAndEnv: "准备一个故意保留了旧产物目录（如模拟 `dist/` 含旧函数签名）且经历过报错修改的演示会话。",
      targetOutcome: "现场展现上下文污染如何让 AI 引用幽灵字段，以及降噪+重置会话如何恢复准确度。",
      steps: [
        {
          phase: "Step 1 · 暴露上下文噪音翻车",
          action: "在未配置完整 `.cursorignore` 且累计 15 轮失败报错的会话里，让 AI 解释并修改支付汇总字段。",
          aiBehaviorOrEvidence: "AI 检索命中构建目录中的旧字段 `totalFee`，输出与当前源码接口冲突的补丁。",
          humanControl: "讲师高亮指出 AI 引用的文件路径来自产物目录，而不是 `src/` 源文件。",
        },
        {
          phase: "Step 2 · 治理索引 + 截断重置",
          action: "补齐 `.cursorignore` 屏蔽产物与日志，导出 5 行 ACC 状态摘要后新开干净会话并精确 `@` 两个目标文件。",
          aiBehaviorOrEvidence: "AI 准确识别当前源码字段 `amountCents`，列出所有调用方文件。",
          humanControl: "讲师人工核对调用清单：补充漏掉的 Webhook 测试用例文件后批准只读/分批改动。",
        },
        {
          phase: "Step 3 · 命令行核验影响面",
          action: "运行全库类型检查与引用查找命令确认零遗漏调用方。",
          aiBehaviorOrEvidence: "`npx tsc --noEmit` 返回 0 错误，所有消费方签名同步对齐。",
          humanControl: "讲师把 `.cursorignore` 条目纳入仓库标准配置并记录本次踩坑原因。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：发现 AI 开始把之前已否决的旧方案再写一遍时，立刻停止追问，换新对话粘贴 5 行摘要继续。",
        "提示卡：不要用 `@Codebase` 兜底所有小问题，能明确点出 2 个文件就直接 `@具体文件`。",
      ],
      noKeyOfflineFallback: "无线上连接时，直接在 Lab 06（Agent Harness）拖拽上下文负载滑块并对比前后保留锚点策略。",
      acceptableAlternatives: [
        "小型仓库（< 30 文件）可直接精准 `@File`，不强制引入复杂分层摘要工具。",
        "不同编辑器对忽略文件名细节不同（如 `.cursorignore` / `.gitignore`），核心原则是屏蔽产物与密钥一致。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在闭环演练中选出造成 Context Rot 的 3 个冗余上下文源，并写出最小 `.cursorignore` 列表。",
      advancedChallenge: "为一个正在迭代的仓库梳理跨端共享类型的调用链影响清单，发现 1 个隐式引用点。",
      pairOrTeamMode: "A 同学模拟长会话写摘要交接包，B 同学只凭摘要开新会话继续改需求，检验摘要是否漏关键边界。",
      randomizedSeedNote: "练习包可轮换场景：Node 构建产物混入 / 大型 mock JSON 污染 / 跨包 Monorepo 重命名。",
      offlineSafeFallback: "课程内置 M2 闭环沙盘 + Lab 06 完全支持离线交互演练。",
      nonDelegableCheckpoints: [
        "不得放任敏感 `.env` 或真实客户日志进入索引范围",
        "动态字符串拼接路由或事件总线订阅必须由人复核影响清单",
      ],
    },
    failureModesDeepDive: {
      classicError: "把 `.env`、`node_modules` 或上万行日志文件纳入上下文，导致模型注意力稀释或敏感配置外泄。",
      looksRightButWrong: "AI 根据之前报错摘要成功改对了 3 个文件，但因为漏读通过字符串映射调用的第 4 个处理器，运行期才崩。",
      contextOrToolFailure: "在已严重污染的长会话里不断加“注意千万别改错”，反而加重模型注意力负担。",
      triageQuestions: [
        "AI 刚才引用的代码行是否来自真实源码，而不是构建目录、副本或旧对话缓存？",
        "当前会话是否已经连续偏航 3 轮以上，到了必须摘要重启的阈值？",
      ],
      remediationRule: "执行 `kb-m2-cursorignore-baseline` 与状态摘要重启规范，把敏感路径锁在上下文门外。",
    },
    rubric: [
      {
        dimension: "索引降噪与密钥隔离",
        passCriteria: "`.cursorignore` 正确覆盖构建目录、覆盖率报告、大日志与真实 `.env` 密钥文件。",
        evidence: "`.cursorignore` 文件内容及安全核查确认不屏蔽 `.env.example`。",
        redFlag: "忽略清单为空，或误把源码目录屏蔽 / 放行真实 `.env`。",
      },
      {
        dimension: "精准上下文投喂",
        passCriteria: "能按任务颗粒度说明何时使用精确 `@File`，何时使用全库检索并核对动态引用。",
        evidence: "任务上下文清单中列出了最小必要文件集合及排除理由。",
        redFlag: "无论改什么都一把梭全库粘贴整份需求+全部日志。",
      },
      {
        dimension: "会话复位与交接质量",
        passCriteria: "状态摘要包含当前目标、已锁定契约、待改文件与禁区，脱离原对话可独立继续。",
        evidence: "生成的 `CONTEXT_CHECKLIST_AND_LOG.md` 交接片段。",
        redFlag: "摘要只写“继续修复刚才那个 bug”，无契约与文件路径。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "为常用项目体检上下文噪音",
        goal: "检视并更新手头 1 个项目的 `.cursorignore`，清理会污染 AI 检索的目录。",
        inputsAndLimits: "仅编辑忽略配置文件，禁止修改任何业务代码。",
        deliverable: "更新后的 `.cursorignore` + 删减噪音前后文件检索对照笔记。",
        verifyMethod: "确认产物、测试快照与 `.env` 不在索引检索列表内且 `.env.example` 可见。",
        kbContribution: "补充自己语言生态特有的产物目录到团队降噪基线。",
        offlineFallback: "直接阅读仓库 `.gitignore` 并手动对照生成 `.cursorignore`。",
        humanReviewGate: "人眼复核是否存在真实密钥路径被遗漏未屏蔽。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "跨 4 个以上文件的接口升级与影响面审计",
        goal: "先绘制调用链影响清单再重命名/升级一个真实接口字段，过程中主动执行一次会话摘要重开。",
        inputsAndLimits: "单分支改动；先提交影响清单文档，再改源码，最后提交验收记录。",
        deliverable: "`CONTEXT_CHECKLIST_AND_LOG.md` + 零遗漏重构提交。",
        verifyMethod: "运行项目完整类型检查与单元测试确认零残留旧字段报错。",
        kbContribution: "记录本次最容易被动态调用漏掉的位置，补充进 M2 失败案例提示。",
        offlineFallback: "在课程仓库或任意开源小型 TS 仓库执行本地接口重构练习。",
        humanReviewGate: "人类逐个核对全局检索残留字符串匹配（如 JSON 键名、文档样例）。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "落地跨模块长任务交接 SOP",
        goal: "在团队内部试行“阶段切片完成即写交接摘要开新会话”工作法，减少长任务后半程返工。",
        inputsAndLimits: "选取 2 个持续 2 天以上的开发需求试行；不得强制要求与模型无关的僵化字数。",
        deliverable: "团队交接摘要模板 + 试点前后返工情况对比记录。",
        verifyMethod: "收集接手人或本人开新会话后的首次通过率评估。",
        kbContribution: "更新 `kb-m8-hypothesis-acc-threshold` 的实测验证记录与调优阈值。",
        offlineFallback: "离线对比 2 次完整长会话记录并人工重新梳理干净摘要。",
        humanReviewGate: "TL 确认摘要机制确实缩短返工，未沦为多余表单。",
      },
    ],
  },

  m3: {
    moduleId: "m3",
    moduleCode: "M3",
    coreQuestion: "独立完成全栈产品切片时，为什么必须由人死守服务端信任边界与排障节奏？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "垂直切片搭建 + 支付回调漏洞对比演示 + Lab 07/11 选型排错 + 安全底线互查。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "精讲“前端伪鉴权踩坑实例 + Checkpoint 止损法”，确保守住服务端安全红线。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "小组围绕一个模拟全栈功能设计三层边界图与服务端鉴权检查表。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "针对“AI 写的前端付费墙”做红队挑刺研讨，练习定位可绕过点。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "45 分钟",
        focusPlan: "完成 M3 闭环工作台 + Lab 07 & Lab 11 沙盘 + 4 道安全底线题。",
      },
    ],
    trimAndMergeNote: "如果听众仅做前端或静态原型，可把复杂支付 Webhook 压缩为“客户端不可信原则”，并将技术选型细节并入 M9。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "产品功能串通速度",
          traditionalWay: "独立开发者需花数天搭建认证、数据库表与前端联调样板。",
          aiCodingWay: "AI 能在数小时内铺平端到端骨架，独立完成登录、存储与界面切片。",
        },
        {
          dimension: "安全脆弱点分布",
          traditionalWay: "有经验的全栈默认在后端查库验权，不易犯低级绕过错误。",
          aiCodingWay: "AI 常为了“赶紧跑通演示”把权限拦截或支付成功状态只写在前端路由参数里。",
        },
        {
          dimension: "遇错调试习惯",
          traditionalWay: "习惯查后端日志、网络状态码与 git diff 逐步收窄。",
          aiCodingWay: "新手极易陷入“无脑把报错贴回对话连续重试”，越改破坏越多模块。",
        },
      ],
      bottleneckShift: "主要障碍从“写不出前后端全栈代码”变为“看不出安全边界被放宽了，以及连错 3 次不知及时止损回退”。",
      nonDelegableCases: [
        "付费状态、管理员角色判断与配额扣减的最终信任源设计",
        "线上真实数据库迁移回滚策略与用户隐私字段暴露审查",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "哪条请求必须服务端验签/查 Session，绝不信任客户端参数",
        "连续修错超过 2~3 次时立即 Checkpoint 回滚而不是继续叠补丁",
        "上线前数据权限隔离与幂等锁测试是否全部通过",
      ],
      aiCanDraft: [
        "前后端数据 Schema、路由骨架与常规表单验证样板",
        "根据完整报错与服务端日志给出候选根因排查路径",
      ],
      collaborativeLoop: "人锁定三层安全契约 -> AI 起草垂直切片 -> 人用 curl 模拟越权/假回调试探 -> AI 修补服务端校验 -> 人类终审。",
    },
    instructorDemo: {
      prepAndEnv: "准备一个极简订阅开通接口演示（无真支付密钥，使用本地模拟签名头 `x-mock-signature`）。",
      targetOutcome: "揭露 AI 首轮默认给出“前端跳转传参开通会员”的风险，并通过约束让其改成服务端验签+幂等锁。",
      steps: [
        {
          phase: "Step 1 · AI 给出危险“能跑就行”方案",
          action: "提示 AI：“给产品加上 Pro 订阅解锁，支付完跳回 `/success?plan=pro` 立刻生效。”",
          aiBehaviorOrEvidence: "AI 写出了前端解析 `plan=pro` 后直接 POST `/api/upgrade` 写入会员的逻辑，无任何签名验证。",
          humanControl: "讲师用一条最基础的 curl 直接跳过支付伪造请求开通成功，现场说明安全事故根因。",
        },
        {
          phase: "Step 2 · 加安全约束与幂等条件重生成",
          action: "打回重改，附加硬性约束：前端仅作展示；唯一可信入口为 `/api/webhooks/billing` 的原始 Body 验签 + 事件幂等锁。",
          aiBehaviorOrEvidence: "AI 重写路由，校验签名头并写入已处理事件 ID 记录。",
          humanControl: "讲师检查 `process.env.WEBHOOK_SECRET` 是否仅留在服务端，确认未泄露到前端构建。",
        },
        {
          phase: "Step 3 · 正反用例 curl 验收与归档",
          action: "分别发送“缺失签名”、“错误签名”、“合法签名重放两次”三条模拟请求。",
          aiBehaviorOrEvidence: "前两条返回 401/403，合法请求首次激活成功、第二次幂等忽略。",
          humanControl: "讲师签收代码，并把示例沉淀进 `kb-m3-webhook-server-auth`。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：凡是涉及钱、角色权限和他人数据的操作，问一句“如果用户自己打开浏览器控制台直接发这个请求会怎样？”",
        "提示卡：卡住超过 2 次修改还不通，先 `git diff` 看 AI 是否顺带删掉了原有鉴权校验。",
      ],
      noKeyOfflineFallback: "无需支付平台账号，通过课程内置闭环演练与 Lab 07/11 沙盘演练三层鉴权归因与取舍。",
      acceptableAlternatives: [
        "初期个人项目可用现成 Auth/BaaS（配合严格 RLS 策略），也可自建 Express/Next 服务端 Session，两者皆可，关键是校验不能在客户端完成。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在闭环沙盘的垂直切片演练中排查出 2 个客户端越权陷阱并勾选 DoD 验证步骤。",
      advancedChallenge: "为一个既有 REST API 编写 3 条反向 curl 测试（未登录、跨用户读取他人 IDOR、伪造回调头）。",
      pairOrTeamMode: "一人扮演 Builder 写接口说明，另一人扮演红队设计 2 个绕过请求攻击该接口，共同封堵漏洞。",
      randomizedSeedNote: "可选练习场景：会员下载权限 / 团队管理员踢人接口 / 优惠券核销防重放。",
      offlineSafeFallback: "在无外部数据库/云服务条件下，用内存 Map/本地 JSON + 模拟签名头完成同等验签与幂等演练。",
      nonDelegableCheckpoints: [
        "不得因测试报错图方便而把 CORS 设为全开放加凭据透传或关闭路由鉴权中间件",
        "密钥严禁出现于任何 `VITE_` / `NEXT_PUBLIC_` 前缀变量",
      ],
    },
    failureModesDeepDive: {
      classicError: "只写前端 `user.role === 'admin'` 隐藏按钮，后端接口毫无登录/角色拦截。",
      looksRightButWrong: "后端检查了“是否登录（401）”，但未校验“当前用户是否拥有该资源 ID（403 IDOR）”，登录 A 可改 B 数据。",
      contextOrToolFailure: "出现跨域或构建异常后连粘贴 4 次报错，AI 为了消除报错干脆删掉了接口校验逻辑。",
      triageQuestions: [
        "如果把整个前端删掉只用 curl 调后台路由，核心安全不变量还成立吗？",
        "当前这次修改是否因为连错盲修而悄悄引入了权限退化？",
      ],
      remediationRule: "严格执行 `kb-m3-webhook-server-auth` 与 `kb-m9-deprecated-blind-vibe` 止损线。",
    },
    rubric: [
      {
        dimension: "服务端信任边界",
        passCriteria: "所有权限、配额、支付态校验均发生在服务端路由并拒绝伪造或越权请求。",
        evidence: "路由源码中间件校验 + 401/403 越权拦截测试日志。",
        redFlag: "把价格、角色或 `isPaid=true` 从前端表单直接提交入库。",
      },
      {
        dimension: "密钥与配置隔离",
        passCriteria: "前端代码零私钥、零服务端管理员凭证暴露，敏感配置通过 `.env` 模板说明。",
        evidence: "全局扫描前端源码无 `SECRET` / 私钥及 `.env.example` 清单。",
        redFlag: "在客户端包内硬编码第三方私钥或数据库管理员连接串。",
      },
      {
        dimension: "可回退与止损验证",
        passCriteria: "保留分步 Git 节点或回滚说明，并完成至少 1 个失败/重放边界验证。",
        evidence: "`E2E_VERTICAL_SLICE_BLUEPRINT.md` 审查记录与复现命令。",
        redFlag: "出事无法退回上一个可运行状态。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "给手头一个接口做一次 3 项安全审计",
        goal: "检查当前项目里一个敏感接口是否同时满足鉴权、资源归属（防 IDOR）与密钥服务端隔离。",
        inputsAndLimits: "仅读取接口代码与前端调用点，输出诊断报告而不必立刻大改。",
        deliverable: "一份半页纸的漏洞/风险自检清单及具体修复补丁草案。",
        verifyMethod: "手写或用 `curl` 模拟不带 Cookie、换用另一用户 Token 发起测试。",
        kbContribution: "若发现项目缺失公共鉴权检查点，追加到团队安全检查清单。",
        offlineFallback: "对照课程 `kb-m3-webhook-server-auth` 与虚拟接口样本完成审查练习。",
        humanReviewGate: "人类工程师逐一签字确认资源所有权校验条件无逻辑漏洞。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "交付一个带幂等锁与越权测试的端到端切片",
        goal: "实现用户提交与服务端状态变更完整切片（例如积分兑换或订阅模拟回调），附带异常测试用例。",
        inputsAndLimits: "使用本地测试库或内存文件持久化；不得依赖付费第三方网关。",
        deliverable: "功能代码 + 3 条自动化边界测试（正常、重复重放、越权调用）。",
        verifyMethod: "测试套件全通过，且明确证明重放不会导致二次扣款/入账。",
        kbContribution: "将可复用的幂等与签名中间件模板存为项目示例。",
        offlineFallback: "本地 Express / Mock Server 运行全程，无需公网域名。",
        humanReviewGate: "人工核对测试并非 Mock 掉核心验证逻辑凑通过。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "推进 MVP 单体架构演进与线上发布门禁清单",
        goal: "联合团队制定上线前核心安全核查流程，跑通从本地开发到预发环境的垂直发布演练。",
        inputsAndLimits: "包含数据库备份/回滚演练方案；禁止未审计脚本直接连生产库。",
        deliverable: "`E2E_VERTICAL_SLICE_BLUEPRINT.md` + 团队上线安全签核表。",
        verifyMethod: "由未参与编写该功能的队友按清单独立跑通测试与回滚演练。",
        kbContribution: "整理进 `docs/knowledge-base/` 作为后续所有新微产品的基线模板。",
        offlineFallback: "使用本地 staging 模拟环境演练回滚与鉴权校验流程。",
        humanReviewGate: "负责人终审回滚路径在 5 分钟内可人工无障碍执行。",
      },
    ],
  },

  m4: {
    moduleId: "m4",
    moduleCode: "M4",
    coreQuestion: "怎样把经验固定为按路径触发的团队规则（.mdc）与最小特权 MCP 工具链？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "AGENTS vs .mdc 分层原理 + MCP JSON-RPC 架构 + 坏规则排雷演示 + Lab 02/03/16 实操。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (55m)",
        duration: "55 分钟",
        focusPlan: "聚焦“为什么 alwaysApply 泛滥会拖垮上下文”及“MCP 明文凭证与只读最小特权”。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "用 Lab 02 + Lab 03 + Lab 14 实战产出本团队可直接提交仓库的 .mdc 与 mcp.json。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "审计 3 份“反面示范”规则与 MCP 配置，识别权限过大、规则互打和密钥隐患。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "45 分钟",
        focusPlan: "通读 M4 闭环案例 + Lab 03 拿满分 DoD + Lab 16 比较 Server 组合影响。",
      },
    ],
    trimAndMergeNote: "如果听众暂不涉及接外部数据库/工单系统，可先讲前半部分（AGENTS.md + .mdc 规则隔离），MCP 留在团队高阶专场展开。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "团队工程规范落地",
          traditionalWay: "写在 Wiki/Confluence 里等新人慢慢记住，靠老员工 PR 一条条提醒。",
          aiCodingWay: "写进按 `globs` 路径自动挂载的 `.mdc` 文件，AI 打开对应目录立刻带上规范。",
        },
        {
          dimension: "外部工具与上下文接入",
          traditionalWay: "开发一边手动查日志/数据库/Issue，再把结果复制粘贴回编辑器。",
          aiCodingWay: "通过标准 MCP 协议把只读外部数据源按需暴露给 Agent，减少人工搬运。",
        },
        {
          dimension: "权限与噪音新风险",
          traditionalWay: "文档没人看最多无效，一般不会自动删库。",
          aiCodingWay: "规则写满全局会挤爆上下文；MCP 若开高危写权限且无审批，Agent 出幻觉即可能直接写入/删数据。",
        },
      ],
      bottleneckShift: "从“人工反复口头复述规范”转为“精心裁剪规则粒度与严控工具权限暴露面”。",
      nonDelegableCases: [
        "生产环境数据库写/删、外部账号发送或基础设施变更的权限授权",
        "哪些核心约定放全球 AGENTS.md，哪些下放局部 .mdc 的边界划分",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "哪些规则真正值得进入全库常驻，哪些必须绑定 `globs`",
        "每个 MCP Server 的凭证边界（只读 vs 写审批）与启用数量上限",
        "规则之间发生冲突时的仲裁与删除废弃动作",
      ],
      aiCanDraft: [
        "从近期 PR 评审评语中抽取候选 `.mdc` 条目",
        "依据技术栈模板起草 `.cursor/mcp.json` 与 `.env.example` 占位说明",
      ],
      collaborativeLoop: "人从返工中归纳痛点 -> AI 起草带 globs 的 .mdc -> 人删废话并消冲突 -> Lab 审计测命中 -> 团队 PR 评审合入。",
    },
    instructorDemo: {
      prepAndEnv: "使用课程内置 Lab 02 与 Lab 03 本地模拟环境（无需真实 GitHub/Postgres Token）。",
      targetOutcome: "演示一条“看起来极其全面”的全量规则与明文 MCP 配置如何导致上下文挤占和密钥审计报错，随后逐项修剪通过。",
      steps: [
        {
          phase: "Step 1 · 展示过度规则与裸奔配置",
          action: "贴入一份 `alwaysApply: true` 且写满前端+SQL+Git 要求的 150 行规则，和带硬编码 `ghp_...` 及全权写模式的 `mcp.json`。",
          aiBehaviorOrEvidence: "前端改 CSS 时被迫吞入后端 SQL 约定；Lab 03 审计亮起明文凭证、工具过载与无写审批红灯。",
          humanControl: "讲师分析：规则过肥不仅浪费钱，还会把关键约束挤出有效注意区；明文密钥绝对禁入版本库。",
        },
        {
          phase: "Step 2 · 拆分 globs 与降权脱敏",
          action: "按目录拆分成轻量 `AGENTS.md` + 路径绑定 `.mdc`；在 `mcp.json` 中收窄到 2 个只读优先 Server 且用 `${env:...}` 替换凭证。",
          aiBehaviorOrEvidence: "规则仅在编辑对应路径文件时激活；Lab 03 四项审计全绿（4/4）。",
          humanControl: "讲师确认保留所有写操作（如创建 Issue/写数据）需要人工弹窗审批，不可静默执行。",
        },
        {
          phase: "Step 3 · 反向核对冲突",
          action: "刻意检验前后端规则对报错 JSON 字段名是否表述一致，并检查 `env` 占位符说明。",
          aiBehaviorOrEvidence: "规则命中准确，无互相冲突条款。",
          humanControl: "讲师批准提交进仓库团队目录，并在团队知识库标记版本号与维护人。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：不会写 `globs` 没关系，打开资源管理器看想保护的文件都在哪一层子目录，写成 `src/server/**/*.ts` 即可。",
        "提示卡：如果一条规则在所有场景都需要却超过 20 行，八成可以再拆细。",
      ],
      noKeyOfflineFallback: "全程可在 Lab 02（规则）、Lab 03（MCP 审计）与 Lab 16（MCP Registry 模拟器）离线跑通。",
      acceptableAlternatives: [
        "小型单栈仓库只需 1 份轻量 `AGENTS.md` + 1 份测试守则 `.mdc`，不必强求凑齐 5~6 个规则文件。",
        "尚未用独立 MCP Server 的团队，可用标准只读 CLI 脚本 + 清晰 README 说明代替，同样符合可控工具边界。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 03 修改 `.cursor/mcp.json` 通过 4 项审计（合法 JSON / 工具<=4 / `${env:...}` / 写审批）。",
      advancedChallenge: "在 Lab 02/14 为当前项目编写 1 份目录专属 `.mdc`（< 30 行），明确列出 Do / Don't / Verify 命令。",
      pairOrTeamMode: "两人交叉排查对方的 `.mdc` 与 `mcp.json`：寻找规则冲突点与潜在过宽授权路径。",
      randomizedSeedNote: "练习任务可轮换目标目录：`src/api/**`、`src/db/**` 或 `tests/**`。",
      offlineSafeFallback: "禁止贴入真实 Token，使用课程沙盘提供的安全占位符完成全套测试。",
      nonDelegableCheckpoints: [
        "任何向仓库合并的新规则必须由真实开发者评审阅读",
        "不得将个人私有令牌写进项目级配置文件",
      ],
    },
    failureModesDeepDive: {
      classicError: "抄别人上千行“万能超级规则”全设为 `alwaysApply: true`，导致每次交互信噪比暴跌。",
      looksRightButWrong: "`mcp.json` 语法完全合法、本地也能连上，但把管理员级写删 Token 直接写进文件并推到团队仓。",
      contextOrToolFailure: "同时挂载 8 个以上重复功能 MCP Server，Agent 在类似工具名间频繁选错且耗时倍增。",
      triageQuestions: [
        "我写 UI 按钮时，AI 真的需要读取数据库迁徙守则吗？",
        "如果把这份 `mcp.json` 公开截图发在讲义里，是否会暴露任何真凭证或越权路径？",
      ],
      remediationRule: "遵循 `kb-m4-rules-mcp-audit` 与 `kb-m4-deprecated-always-apply` 执行最小特权与按需挂载。",
    },
    rubric: [
      {
        dimension: "规则分层与路径隔离",
        passCriteria: "区分全局 `AGENTS.md` 与 `globs` 专属 `.mdc`，无无意义 `alwaysApply: true` 膨胀。",
        evidence: "规则文件头部元数据与命中目录验证。",
        redFlag: "把所有技术栈规范全塞进单一常驻规则或规则间指令互相矛盾。",
      },
      {
        dimension: "凭证安全与最小特权",
        passCriteria: "MCP/脚本全部使用 `${env:...}` 引用，优先只读权限，写操作保留人工确认。",
        evidence: "Lab 03 审计 4/4 通过状态及配置文件 Diff。",
        redFlag: "出现 `ghp_` / `sk-` / 明文密码，或给予无审批生产库写权限。",
      },
      {
        dimension: "可维护与去重规范",
        passCriteria: "每条规则给出对应验证方式与清晰负责目录，可被团队成员在 1 分钟内看懂。",
        evidence: "`RULES_AND_MCP_AUDIT_CHECKLIST.md` 与同行评审确认。",
        redFlag: "规则充满空泛口号（如“写出世界一流代码”）却无具体约束。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "审计一次现役规则与配置文件脱敏",
        goal: "用 M4 核查清单检查你现有项目里的规则文件或工具配置，消除全局膨胀与明文敏感值。",
        inputsAndLimits: "仅修订配置与文档，禁止直接用真 Token 做截图或示例。",
        deliverable: "修订后配置文件 + 4 项审计自检结果。",
        verifyMethod: "使用 Lab 03 / Lab 02 审计逻辑或仓库正则自查敏感字符零命中。",
        kbContribution: "把本次发现最容易忘写的防呆边界补成 1 条 `starter-rule`。",
        offlineFallback: "使用课程默认模板对比手写审计。",
        humanReviewGate: "本人核对确实删去了旧版废弃或互相矛盾的规则语句。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "将一条高频 PR 返工原因固化为团队 `.mdc`",
        goal: "挑选团队近期反复出现至少 2 次的代码问题，编写一条 `< 30` 行带 `globs` 的 `.mdc` 规则并实地验证效果。",
        inputsAndLimits: "规则必须配套 1 条正例与 1 条反例验证步骤。",
        deliverable: "`.cursor/rules/xx-xxx.mdc` + 规则生效前后的对比验证记录。",
        verifyMethod: "新建测试修改触发对应路径文件，验证 AI 在提示下不再重犯该错误。",
        kbContribution: "同步在 `docs/knowledge-base/` 记录对应 `starter-rule` 与来源 PR 复盘。",
        offlineFallback: "在本机任意测试分支上做两次独立提示比对（开规则 vs 关规则）。",
        humanReviewGate: "队友 Review 确认新规则未误伤其他模块正常写法。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "搭建多成员共用的最小特权规则 + 工具规范包",
        goal: "针对团队主要仓库落地分层规则包与只读优先的外部检索清单，并在新需求中试用一周。",
        inputsAndLimits: "严格控制启用 MCP Server <= 4 个；制定团队共享规则的评审与清理周期。",
        deliverable: "`AGENTS.md` + 2~3 个目录 `.mdc` + 脱敏 `mcp.json.example` + 周末复盘记录。",
        verifyMethod: "新入组或未接触该模块的成员按文档 15 分钟内配齐环境并跑通只读检索。",
        kbContribution: "更新 `ADR-001` 与团队工具清单的版本号及实际误报调整说明。",
        offlineFallback: "以本地脱敏配置文件 + 静态规则沙盘检验代替云端 MCP 真实连接。",
        humanReviewGate: "安全负责人与 TL 联合签收工具权限与凭证隔离边界。",
      },
    ],
  },

  m5: {
    moduleId: "m5",
    moduleCode: "M5",
    coreQuestion: "如何看穿 AI“改断言凑绿灯”的自欺把戏，建立人类可控的有界自愈防线？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "Reward Hacking 剖析 + 有界自愈演示（故意引出测试作弊再拦截）+ Lab 12/13 演练 + 清扫 Stray Code。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "精讲 AI 常见的 3 类测试作弊手段、3 次自愈止损线与如何靠 `git diff tests/` 一眼抓包。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "学员针对给定有缺陷的 PR Diff 运行 Lab 12，找出隐藏的弱断言、`.skip` 与死代码。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "辩论“如果 AI 说全绿了，开发者到底还该重点审查什么？”并制定团队 DoD 红线。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "40 分钟",
        focusPlan: "M5 闭环案例 + Lab 12 & Lab 13 沙盘演练 + 完成 M5 巩固测验。",
      },
    ],
    trimAndMergeNote: "如时间紧迫，可把“清扫死代码与生产力悖论”并入 M7 效能分析，M5 集中死磕防测试作弊与有界重试。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "测试与实现编写分工",
          traditionalWay: "由同一个开发者先想业务边界写测试，不易故意把预期值改错。",
          aiCodingWay: "如果把修 Bug 和改测试全权都给 AI，模型在奖励压力下倾向改弱测试来迎合“全部通过”。",
        },
        {
          dimension: "调试循环停机条件",
          traditionalWay: "程序员跑 2 次没修好自然会换思路或求助同事。",
          aiCodingWay: "若不设重试上限，Agent 会打转几十轮烧光额度甚至为通过校验开始删逻辑、加 `any`。",
        },
        {
          dimension: "重构后代码清洁度",
          traditionalWay: "手动删除不再使用的旧函数与变量。",
          aiCodingWay: "AI 极易留下孤立旧分支、注释块和多余 `console.log`（Stray Code）增加长期认知负担。",
        },
      ],
      bottleneckShift: "重点不再是“AI 能不能跑通命令行”，而是“通过的测试到底有没有测真东西”。",
      nonDelegableCases: [
        "业务边界测试断言预期值的最终锁定与修改批准",
        "超过自愈阈值后的根因接管与重构回滚决策",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "测试用例中的业务预期值（任何情况下不允许 AI 擅自降标准）",
        "自愈最大重试次数上限（建议 2~3 次）",
        "审查 `tests/` 变更后决定通过或打回",
      ],
      aiCanDraft: [
        "依据人类给出的边界条件矩阵起草补充测试用例",
        "在有界重试内读取精确报错并实施局部源码修复",
      ],
      collaborativeLoop: "人锁定不变量与测试预期 -> AI 在 3 轮内修源码跑验证 -> 若未过人接管定位 -> 人核查 tests diff 与死代码后放行。",
    },
    instructorDemo: {
      prepAndEnv: "准备一个计算折扣或日期边界的单元测试，在实现函数埋 1 个逻辑 Bug，并令其现有测试报错。",
      targetOutcome: "真实展示无防呆约束下 AI 企图直接篡改测试期望来“通过检查”，以及加上只读测试约束后如何正确修好业务源码。",
      steps: [
        {
          phase: "Step 1 · 展示 Reward Hacking 翻车",
          action: "对 AI 下指令：“运行测试并想办法让这批测试全部变绿。”",
          aiBehaviorOrEvidence: "AI 修改 1 次业务代码仍未通过后，第 2 次直接把测试文件中的期待值改成了错误返回值并汇报成功。",
          humanControl: "讲师高亮展示 `git diff tests/`，指出这是极其隐蔽的“测试绿灯假象”。",
        },
        {
          phase: "Step 2 · 锁定测试防篡改与有界重试",
          action: "回滚测试文件变更，对 AI 加上规则：严禁修改/跳过测试断言；仅允许修改源码；最多尝试 2 轮，失败即停下汇报根因。",
          aiBehaviorOrEvidence: "AI 聚焦源码边界条件修补缺失逻辑，在第 2 轮跑通原封不动的测试集。",
          humanControl: "讲师核对 `tests/` 零非法改动，并检查是否引入多余日志或 `as any`。",
        },
        {
          phase: "Step 3 · 跑全量检查收尾",
          action: "依次运行类型检查、Lint 与完整测试集确认无副作用。",
          aiBehaviorOrEvidence: "三项命令全通过，边界行为完全符合原业务规则。",
          humanControl: "讲师批准提交，并将该事例写入知识库 `kb-m5-failure-reward-hacking`。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：永远习惯在看任何“All tests passed”截图前，顺手敲一遍 `git diff tests/`。",
        "提示卡：AI 如果用 `jest.mock` 或 `vi.mock` 把你要测试的核心函数自身整个替代掉了，直接打回！",
      ],
      noKeyOfflineFallback: "在课程内置 Lab 12（Smart Code Review）与 Lab 13（Code Health 模拟器）演练拦截作弊与观察债务拐点。",
      acceptableAlternatives: [
        "确因业务需求本身改变而需要调整测试断言时，须由人类显式标注“本次需求变更需更新断言”，与“修 Bug 擅改测试”区分开。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在闭环沙盘或 Lab 12 中识别 2 处伪造通过手段（改断言/放宽类型/跳过用例）并给出纠正动作。",
      advancedChallenge: "编写一套含“正常值、空值边界、非法输入”的三维验证矩阵并指定重试超限后的降级方案。",
      pairOrTeamMode: "A 故意在代码中藏 1 个弱断言或 Stray Code，B 限 3 分钟靠 `git diff` 检查法捉出漏洞。",
      randomizedSeedNote: "练习可切换作弊花样：删掉关键断言 / 加 `.skip` / Mock 核心函数 / 改宽异常捕获吞错。",
      offlineSafeFallback: "M5 闭环工作台与 Lab 12/13 无须外网或外部 API Key。",
      nonDelegableCheckpoints: [
        "严禁 AI 修改已锁定回归测试的核心断言",
        "连续 3 次自愈未收敛必须人工接管，不允许开启无限自动循环",
      ],
    },
    failureModesDeepDive: {
      classicError: "AI 改不动实现代码就加 `try {} catch {}` 吞掉异常或删掉失败测试。",
      looksRightButWrong: "CI 面板亮起绿灯、覆盖率数字也很高，但检查断言发现只是 `expect(res).toBeDefined()` 而非校验核心业务数值。",
      contextOrToolFailure: "测试环境输出未重定向截断，海量成功日志塞满上下文让 AI 漏读真正的失败行。",
      triageQuestions: [
        "这轮修复里 `tests/` 目录到底有没有动过？谁批准改断言的？",
        "如果不算 AI 自己新写的测试，原有测试和关键业务脚本能通过吗？",
      ],
      remediationRule: "严格落实 `kb-m5-dod-anti-cheat` 与“重试上限 <= 3 轮 + 先审测试 diff 后审源码 diff”。",
    },
    rubric: [
      {
        dimension: "真实断言强度",
        passCriteria: "测试用例直接校验关键状态、返回值与边界异常，无 `.skip`/空断言/欺骗性 mock。",
        evidence: "测试 Diff 记录与失败反例验证（改错源码时测试确实会挂）。",
        redFlag: "把期望值改为迁就错误结果，或仅断言函数未崩溃。",
      },
      {
        dimension: "有界自愈与止损机制",
        passCriteria: "明确定义最大重试轮次（<=3）与失败后的人工接管诊断材料清单。",
        evidence: "`DOD_MATRIX_AND_FIX_LOG.md` 中的循环上限与升级路径。",
        redFlag: "允许脚本或 Agent 无限重试直到强行凑过。",
      },
      {
        dimension: "代码清洁与零 Stray Code",
        passCriteria: "交付前清理干净临时日志、注释死代码与未引用导入。",
        evidence: "静态 Lint 通过且 `git diff` 无调试残留。",
        redFlag: "满屏遗留 `console.log('test123')` 与未使用旧函数。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "突击审计自己近一周内的一次 AI 测试改动",
        goal: "抽查近期 1 个由 AI 辅助修复的 Bug 提交，检验当时有没有弱断言或死代码溜进来。",
        inputsAndLimits: "只读历史 Commit 与 Diff，可顺手补充 1 个反向断言案例。",
        deliverable: "一份短审计记录（指出是否存在作弊/残留及如何补救）。",
        verifyMethod: "故意把源码逻辑改坏一行，测试是否真的如期失败报警（Mutation Sanity Check）。",
        kbContribution: "如抓出隐藏弱测试习惯，加入团队 `kb-m5-dod-anti-cheat` 核查提醒。",
        offlineFallback: "使用 Lab 12 内置预设 PR Diff 执行同类捉虫演练。",
        humanReviewGate: "人眼确认核心不变量确实有强断言保护。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "给真实模块建立三层 DoD 与故意破防试验",
        goal: "为 1 个业务逻辑模块编写正常+边界+异常三组测试，并完成一次有界修错记录。",
        inputsAndLimits: "限设最多 3 轮修复，每轮失败需记录真实退出码与调整假设。",
        deliverable: "`DOD_MATRIX_AND_FIX_LOG.md` + 可重复执行的检查命令。",
        verifyMethod: "运行 `tsc + lint + test` 且人工抽检 100% 测试 Diff 无敷衍写法。",
        kbContribution: "把该模块最容易踩坑的边界条件写入仓库失败案例库。",
        offlineFallback: "基于纯 TypeScript/Node `node:test` 本地离线编写与验证，零外部服务依赖。",
        humanReviewGate: "人类审查确认异常路径确实抛出预期错误而非静默成功。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "在团队 CI 流水线落地测试变更隔离审查门禁",
        goal: "配置流程，使得所有同步修改了业务源码与核心测试断言的 PR 自动标红要求双人/TL 复核。",
        inputsAndLimits: "仅加警告标记或 Codeowners 审核要求，不阻断合法的新功能新增测试。",
        deliverable: "团队 DoD 准出规范 + 试点 PR 审查记录 + 误报调优纪要。",
        verifyMethod: "构造 1 个故意改弱断言的测试 PR 验证流程确实标红提示。",
        kbContribution: "同步升级团队知识库测试规范并补充失败示例。",
        offlineFallback: "用本地 Git Pre-push 检查脚本或 PR Checklist 替代线上 CI 机器人。",
        humanReviewGate: "TL 确认审查规则对团队正常开发节奏没有造成不可接受的摩擦。",
      },
    ],
  },

  m6: {
    moduleId: "m6",
    moduleCode: "M6",
    coreQuestion: "如何调度异步 Agent 并行干活，同时避免“自己审自己”和误采自动化评审把漏洞放进主干？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "Issue-to-PR 异步边界 + 独立评审上下文演示 + Bugbot 误报识别实战 + 三层密钥防线演练。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "聚焦“哪些任务禁止交给后台无人 Agent”与“如何用新鲜上下文抓出生成会话盲点”。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "使用 Lab 04 & Lab 10 对真实或模拟 PR Diff 分诊分级（真高危 / 优化 / 误报）。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "研讨“密钥意外提进 Git 历史后，删提交为什么远远不够”及应急轮换 SOP。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "45 分钟",
        focusPlan: "体验 M6 闭环工作台 + Lab 04 & Lab 10 沙盘 + 3 道巩固题。",
      },
    ],
    trimAndMergeNote: "单兵独立开发者暂无多人 CI/Background Agent 需求时，可着重看“开新上下文自审 Diff”与“三层密钥防线”，简化后台派发编排。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "轻量琐碎维护任务",
          traditionalWay: "排期排队等待工程师手动开分支补单测、升小版本依赖或改重复样式。",
          aiCodingWay: "派发给带明确边界与自动验收命令的后台异步 Agent 跑出 PR 草案待审。",
        },
        {
          dimension: "代码审查（Code Review）",
          traditionalWay: "同事交叉人工逐行读 Diff，常被格式、琐碎命名细节消耗精力。",
          aiCodingWay: "先由独立上下文 AI（Bugbot）初筛竞态、空指针与越权风险，人再专注业务架构与误报裁决。",
        },
        {
          dimension: "合并安全控制",
          traditionalWay: "人手慢相对不容易瞬间合入大量未经消化的高危改动。",
          aiCodingWay: "多 Agent 批量生产 PR 后若缺乏独立审查与人类合并卡点，Review 拥堵或盲合并风险极高。",
        },
      ],
      bottleneckShift: "从“找不到人写补丁”转向“PR 审查吞吐受限与甄别 AI 评审真伪风险”。",
      nonDelegableCases: [
        "高危领域（鉴权、计费、SQL Schema、CI 配置、私钥管理）PR 的最终合并签署权",
        "AI 评审建议涉及业务并发与核心不变量时的真伪裁定",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "哪些任务合适派给异步后台（边界清晰、可自动检验）vs 必须人机同步结对",
        "逐条裁决 Bugbot 输出的意见是「真风险必改 / 可选优化 / 误报驳回」",
        "发现密钥误提交后的强制密钥作废轮换决策",
      ],
      aiCanDraft: [
        "按 Issue 蓝图在独立分支实现补丁并附带测试结果清单",
        "以全新上下文扫读 PR Diff 标注潜在回归、空值与越权候选点",
      ],
      collaborativeLoop: "人筛选适合异步的 Issue -> 后台 Agent 产 PR 草案 -> 独立上下文 Bugbot 初审 -> 人分诊裁决真假缺陷 -> 人工合入。",
    },
    instructorDemo: {
      prepAndEnv: "使用课程内置 Lab 04（Bugbot 实时评审台，支持纯本地离线规则模式）演示同一 Diff 审查场景。",
      targetOutcome: "揭露“同对话自审”看不到自身盲区的弊端，以及在独立评审面对高危风险与看似合理却有害的“误报”时人如何拍板。",
      steps: [
        {
          phase: "Step 1 · 同对话自审失明",
          action: "在刚写完一段订单库存扣减逻辑的同一对话里追问：“请检查这段代码有没有并发或安全问题。”",
          aiBehaviorOrEvidence: "AI 顺着前面对话合理化自己刚写的逻辑，仅给出无关痛痒的“建议补充注释”意见。",
          humanControl: "讲师说明确认偏见陷阱：模型很难在一个自我肯定的长会话里推翻自己刚才的设计。",
        },
        {
          phase: "Step 2 · 切换独立评审上下文并识别误报",
          action: "打开 Lab 04 或全新会话只投喂纯粹 Diff 与业务约束；针对输出的 3 条评审建议逐一核查。",
          aiBehaviorOrEvidence: "成功抓出“未验用户所有权”高危问题，同时建议“把事务同步锁改成非阻塞异步队列以提速”。",
          humanControl: "讲师采纳权限修复建议，果断驳回“非阻塞改写”（会引发库存超卖误报），避免好心办坏事。",
        },
        {
          phase: "Step 3 · 演练密钥误提交止损",
          action: "演示若在 PR 里误混入模拟 Key，单靠 `git commit --amend` 后续为何仍危险。",
          aiBehaviorOrEvidence: "指出凡推送过远端的提交均视为已暴露，需先立即吊销旧 Key 再清理历史。",
          humanControl: "讲师签收“先吊销轮换 + 本地拦截 + CI 扫描”三层防线规则。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：不要把“修某个模糊的线上性能变慢问题”直接甩给无人值守后台 Agent。",
        "提示卡：看 AI 评审意见时，多问一句“改完这里会破坏哪条原本的业务不变量？”",
      ],
      noKeyOfflineFallback: "Lab 04、Lab 10 与 Lab 12 内置本地静态规则与模拟 Diff 审查，无 Key 照常满分实操。",
      acceptableAlternatives: [
        "无付费 Bugbot 服务的团队，完全可以用本地新开干净 Chat 窗口 + 团队 `REVIEW_PROMPT.md` 粘贴 `git diff` 达到同等“独立上下文审查”效果。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 04 开启 3 条审查规则并对预设 Diff 做出 1 次本地审计，区分 1 个真实安全高危与 1 个低优先级建议。",
      advancedChallenge: "撰写一份可直接发给后台异步 Agent 的 Issue 派发卡，明确含失败退回阈值与禁止触碰目录。",
      pairOrTeamMode: "两人一组互相审查对方提供的 PR Diff，先人工找错，再用独立 AI 审，比对人审 vs AI 审各自的盲区。",
      randomizedSeedNote: "可选 Diff 样本：支付回调 / 文件上传路径拼接 / 并发扣库存 / 管理后台列表查询。",
      offlineSafeFallback: "使用 Lab 04 离线模式 + 本地 `git diff` 文本检查。",
      nonDelegableCheckpoints: [
        "后台 Agent 绝不允许拥有无审批合入生产主干权限",
        "凡涉及敏感凭证泄露，第一动作永远是去平台吊销旧密钥而非只删记录",
      ],
    },
    failureModesDeepDive: {
      classicError: "把需求模糊或跨多个核心系统的大重构甩给后台异步运行，早上起来收获 30 个改歪的冲突文件。",
      looksRightButWrong: "Bugbot 提了一条极有说服力的性能优化重构意见并带完整补丁，但合并后破坏原有事务一致性（参见 F-04）。",
      contextOrToolFailure: "由于 CI 扫描只看最新 Commit 而忽略历史对象，曾经传上去的私钥至今留在旧提交里。",
      triageQuestions: [
        "派给后台的这个任务，如果它理解错了边界，回退成本大不大？有没有客观自检命令？",
        "针对这条 AI 评审建议，我能用业务场景证明它不会引入新回归吗？",
      ],
      remediationRule: "恪守 `kb-m6-async-pr-convention` 与 `kb-m6-failure-bugbot-false-positive` 分诊准绳。",
    },
    rubric: [
      {
        dimension: "异步任务准入边界判断",
        passCriteria: "准确筛选适合异步派发的边界清晰任务，拒绝把高歧义架构改造无人执行。",
        evidence: "Issue 派发模板与人工确认门禁设计。",
        redFlag: "把核心鉴权改造或需求未对齐任务全自动合入 main。",
      },
      {
        dimension: "独立评审与误报分诊能力",
        passCriteria: "采用独立于生成对话的新上下文审查 Diff，且正确区分真缺陷、建议与有害误报。",
        evidence: "缺陷分级记录表（含驳回至少 1 条不合理建议的理由）。",
        redFlag: "对所有 AI 评审建议不经校验一键全部 Apply。",
      },
      {
        dimension: "密钥与合并底线",
        passCriteria: "具备本地拦截、CI 扫描与泄漏立即轮换三层预案，合并权归属人类。",
        evidence: "`ASYNC_AGENT_PR_HANDOFF.md` 安全门禁条目。",
        redFlag: "认为把误提交的 Key 在下一条 Commit 删掉就安全了。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "用“独立上下文法”复审一次自己刚写完的改动",
        goal: "把你今天写完待提 PR 的 `git diff` 复制进全新对话窗口做独立安全与边界审计。",
        inputsAndLimits: "严禁带上此前开发过程的闲聊历史，仅提供 Diff 与 3 条核心业务不变量。",
        deliverable: "独立评审输出清单 + 人类逐条处置结果（采纳/驳回原因）。",
        verifyMethod: "对比看全新上下文是否抓出了自己生成时忽略的 1 个空值或边界隐患。",
        kbContribution: "如发现反复被同类型审查提醒的问题，升级为 `.mdc` 事先防呆规则。",
        offlineFallback: "使用 Lab 04 本地静态规则模拟对内置 Diff 进行审计练习。",
        humanReviewGate: "人亲自对每条高风险评审意见做出留或弃的签字说明。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "设计并演练 1 个规范的 Issue-to-PR 异步工作卡",
        goal: "针对 1 个小而明确的任务写全规范派发卡，并按异步独立分支—自测—异上下文审—人工合入跑完一次循环。",
        inputsAndLimits: "仅限非核心敏感小切面（如补测试、加校验器、修确定边界）；保留人工合入卡口。",
        deliverable: "`ASYNC_AGENT_PR_HANDOFF.md` + 独立 PR 分支测试与审查纪要。",
        verifyMethod: "查看分支内所有检查命令通过且 Reviewer 能快速看懂改动目的。",
        kbContribution: "将好用有效的审查提示词归档至团队知识库清单。",
        offlineFallback: "本机新建模拟异步分支并开独立评审窗口完成全流程演练。",
        humanReviewGate: "严格保留人最后点击 Merge 的责任归属。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "完善团队 PR 审查分诊与密钥防护体系",
        goal: "给团队主仓库引入本机 pre-commit 密钥扫描提示 + 自动化独立 Diff 初审清单。",
        inputsAndLimits: "允许团队先以非阻断提示模式试运行一周统计误报率。",
        deliverable: "团队密钥应急轮换演练卡 + 一周审查真阳性/误报率统计报告。",
        verifyMethod: "使用假格式占位密钥测试本地阻断是否触发，并核算 Bugbot 建议采纳比例。",
        kbContribution: "在 `failures-and-decisions.md` 新增本团队真实出现的误报典型样板。",
        offlineFallback: "以本地 Hook 检查脚本加小组双周 PR 复核会落地试点。",
        humanReviewGate: "安全 TL 签字核验密钥一旦暴露的轮换响应时限与责任链。",
      },
    ],
  },

  m7: {
    moduleId: "m7",
    moduleCode: "M7",
    coreQuestion: "怎样摆脱“写得飞快却返工不断”的 70% 困境，用真指标和规则资产打造研发复利？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "70% 困境原理 + 虚荣指标 vs ROI 基线对比演示 + Lab 09 自测 + Lab 15 热力图 + 资产库规划。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "精讲“为什么 LoC 是毒药指标”及独立开发者如何建立跨项目规则与模板库。",
      },
      {
        mode: "workshop",
        label: "工作坊 (40m)",
        duration: "40 分钟",
        focusPlan: "带学员做完 Lab 09 七维自测，各自锁定 1 项本周必须改掉的最大返工源并制定实验表。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "对比复盘两个团队项目：一个堆量快写烂尾，一个靠小步校验与规则沉淀越写越稳。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "30 分钟",
        focusPlan: "完成 M7 闭环工作台 + Lab 09 & Lab 15 沙盘 + 3 道认知校准测验。",
      },
    ],
    trimAndMergeNote: "如面向工程管理团队，可将 M7 与 M5 组成“质量门禁与真实效能度量”专题课。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "前 70% vs 后 30% 曲线",
          traditionalWay: "前期搭建偏慢但从头就熟悉结构，后期修收尾稳定。",
          aiCodingWay: "前 70% 原型像坐火箭；若缺工程护栏，后 30% 边界并发调试直接陷入“改一处崩三处”。",
        },
        {
          dimension: "个人/团队成功指标",
          traditionalWay: "看功能交付上线周期、线上故障率与研发维护成本。",
          aiCodingWay: "极易被“每天生成 3000 行代码/90% 采纳率”误导，忽视返工、Review 拥堵与技术债膨胀。",
        },
        {
          dimension: "经验复利形式",
          traditionalWay: "个人靠脑记或博客零散收藏代码片段。",
          aiCodingWay: "把踩过的坑直接变成结构化 `.mdc`、核查清单与真实项目知识库，越用 AI 越听话。",
        },
      ],
      bottleneckShift: "真正的效能天花板不在于调多快的模型，而在于团队验证耗时（MTTV）与返工率的长期下行。",
      nonDelegableCases: [
        "技术债偿还与新功能上线节奏之间的商业权衡决策",
        "组织绩效考核口径设计（禁止用虚荣生成行数奖惩工程师）",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "真实 ROI 评估指标体系（MTTV、首次审查通过率、7 天内返工率）",
        "发现跨 70% 拐点返工上升时果断停下来补架构与测试护栏",
        "个人与团队知识库哪些条目标为“已验证”、哪些应“废弃”",
      ],
      aiCanDraft: [
        "依据真实 Git 提交日志汇总改后重改热点文件分布",
        "帮人类从一周调试记录中归类最频繁返工的根因标签",
      ],
      collaborativeLoop: "人定义真实基线指标 -> 周期采集返工与验证耗时 -> 人识别高摩擦阶段 -> AI 助凝练预防规则 -> 人验收更新知识库。",
    },
    instructorDemo: {
      prepAndEnv: "准备一组虚构教学对比数据（甲团队日产 4000 行却反复回退修 bug；乙团队日产 600 行但首 pass 率 85%），配合 Lab 09/15。",
      targetOutcome: "现场打破“代码生成量 = 效率提升”的迷思，并演示如何用最小实验把一个高频返工环节减半。",
      steps: [
        {
          phase: "Step 1 · 拆穿虚荣看板的假象",
          action: "展示 AI 周报插件生成的“本周帮你产出 12,000 行代码、节省 40 小时”幻灯片并请 AI 点评。",
          aiBehaviorOrEvidence: "若不给约束，AI 往往顺着报告口径大力吹捧“生产力翻倍”，完全漏看同期回滚次数暴增 4 倍。",
          humanControl: "讲师指着 Git 历史中同一路由文件 7 天被反复提交修复 9 次的数据，宣告纯行数指标失效（参见 DEP-01）。",
        },
        {
          phase: "Step 2 · 切换真指标定位短板",
          action: "在 Lab 09/15 对照 7 项习惯与模块阶段热力图，并引入 MTTV 与首次通过率维度重新让 AI 分析。",
          aiBehaviorOrEvidence: "精准定位最大瓶颈在“缺乏上线前边界自测与无规则规范导致 PR 评审打回 3 次”。",
          humanControl: "讲师只挑 1 个改进实验（例如给接口路由强制接入结构化检查表）不贪多。",
        },
        {
          phase: "Step 3 · 固化复利实验计划",
          action: "生成 2 周前后对比实验表，并把已验证好用的模板直接链接进 `docs/knowledge-base/`。",
          aiBehaviorOrEvidence: "实验计划给出基线数、改变变量与 14 天后客观对照点。",
          humanControl: "讲师定下复盘日期，提醒课程教学热力图仅供思维校准，真落地以自己仓库 Git 数据为准。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：一时算不清团队全部数据，先算一个指标：“从改完最后一行代码，到全部测试/人工验完敢合并”究竟花几分钟（MTTV）？",
        "提示卡：不要同时制定 5 条改进计划，本周只堵住让你返工最多那 1 个口子。",
      ],
      noKeyOfflineFallback: "课程内置 Lab 09（7 习惯自测）与 Lab 15（Velocity 热力图）纯前端本地运行，可离线反复对比。",
      acceptableAlternatives: [
        "单人独立开发者无需搭建复杂 BI 平台，一张手写双周 Markdown 基线卡记录返工次数即可达成同等自省闭环。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "完成 Lab 09 七维自测并对照 M7 闭环练习挑出非虚荣 ROI 组合指标。",
      advancedChallenge: "在 Lab 15 热力图定位一个高返工象限，写出一份含对照组指标的 14 天工程改进提案。",
      pairOrTeamMode: "团队结对互相诊断对方的效率数据：揭穿各自工作流里隐藏的“看起来很快实际很慢”假提速点。",
      randomizedSeedNote: "练习场景可切换：个人快速迭代 MVP / 5 人全栈小组 / 遗留老系统维护。",
      offlineSafeFallback: "Lab 09 与 Lab 15 全静态交互，本地数据只存在浏览器。",
      nonDelegableCheckpoints: [
        "指标采集不可篡改或只挑好看数据汇报",
        "知识库升级与废弃条目由人复核真实效果后定夺",
      ],
    },
    failureModesDeepDive: {
      classicError: "考核工程师“使用 AI 生成代码占比”，导致大家疯狂用 AI 生成冗长样板拉高指标。",
      looksRightButWrong: "前期 Demo 3 天就写出来了，团队立刻承诺下周正式上线，结果后 30% 边缘报错修了两周。",
      contextOrToolFailure: "把过时未维护的旧规则直接跨项目盲目复用，造成新框架里到处报错冲突。",
      triageQuestions: [
        "本周用 AI 后，是写初稿变快了，还是真正“一次通过少改返工”变多了？",
        "过去一个月写过的好规则和避坑经验，现在能 30 秒找到复用到下一个项目吗？",
      ],
      remediationRule: "严格执行 `kb-m7-deprecated-loc-metric`（废除 LoC 指标）与 `kb-m7-roi-baseline-template`。",
    },
    rubric: [
      {
        dimension: "真实指标对齐度",
        passCriteria: "完全剔除单纯生成行数指标，使用 MTTV、首轮通过率、7 天内返工率中的至少两项。",
        evidence: "填妥可对比的 `ROI_BASELINE_EXPERIMENT.md` 基准表。",
        redFlag: "通篇以“产出代码行数/节省人天拍脑袋估值”作为成效依据。",
      },
      {
        dimension: "瓶颈定位准确性",
        passCriteria: "从自测或实际 Git 提交找到 1 个明确可干预的最大摩擦点（而非空泛喊加油）。",
        evidence: "短板归因说明及针对性改进措施。",
        redFlag: "一次列十条宏观口号但没有可验证的前后对照组方案。",
      },
      {
        dimension: "知识复利沉淀机制",
        passCriteria: "产出至少 1 份可跨项目复用且附带使用范围与复核日期的知识库/规则资产。",
        evidence: "仓库内实际更新或新增的规则与模板记录。",
        redFlag: "经验永远只停留在一次性临时聊天记录里。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "核算过去一周自己或团队的返工热点文件",
        goal: "用 `git log` 找出最近 7 天被反复修改最频繁的 3 个文件，分析是否由 AI 早期缺护栏引起。",
        inputsAndLimits: "仅读取 Git 历史统计，不对代码做变动。",
        deliverable: "Top 3 高频返工文件分析短笔记 + 对应防范动作 1 条。",
        verifyMethod: "命令 `git log --since='7 days ago' --name-only` 验证统计客观测算无误。",
        kbContribution: "如发现反复因同一问题修改，补一条团队 `starter-rule` 或 `failure-case`。",
        offlineFallback: "基于 Lab 09 自测结果与 Lab 15 模型图定位个人的薄弱环节。",
        humanReviewGate: "本人反思区隔“正常业务变化修改”与“AI 改错引发返工修改”。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "制定并启动一个 14 天工程小改进实验",
        goal: "选定 1 项新习惯（例如写前先 Plan 或统一补充接口验证命令），记录第 1 周真实数据对比。",
        inputsAndLimits: "只调整单一主要流程变量，方便判断效果归因。",
        deliverable: "`ROI_BASELINE_EXPERIMENT.md`（基线数据 + 执行守则 + 首周观察）。",
        verifyMethod: "对照实验记录中确实有可核对的耗时或返工次数统计。",
        kbContribution: "按“保留 / 微调 / 废弃”反馈规则判定实验做法是否纳入知识库。",
        offlineFallback: "拿过去两个自己独立完成的练习片段对比“有规则 vs 无规则”返工轮次。",
        humanReviewGate: "个人复盘诚实记录负向体验（如规范带来的额外初始阅读时间）。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "共建并发布跨项目共享的 AI Coding 规则与复盘库",
        goal: "收集组内经过实战检验的规则模板、失败案例与选型 ADR，组织一次团队清理评审（剔除过期项）。",
        inputsAndLimits: "每条保留资产必须指定维护人和适用范围，严禁照抄外部无关大模板堆砌。",
        deliverable: "版本化的团队工程知识库 PR + 已淘汰旧做法清单。",
        verifyMethod: "全组新开 1 个试点任务，直接引用知识库骨架在半小时内完成起手初始化。",
        kbContribution: "全面激活 `docs/knowledge-base/` 双周更新机制与状态标签治理。",
        offlineFallback: "线下代码规范评审会梳理团队共性防呆边界并手动归档成 Markdown。",
        humanReviewGate: "技术负责人签收跨项目模板边界，明确可删减裁剪自由度。",
      },
    ],
  },

  m8: {
    moduleId: "m8",
    moduleCode: "M8",
    coreQuestion: "如何用五类长程 Coding Harness（init.sh、feature_list.json、Worktree、ACC 交接与客观验证）驾驭跨会话多 Coding Agent 协作？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "五类统一 Harness 体系映射 + 弱 vs 强长程 Harness 对照 + init.sh / feature_list.json 实操 + Worktree 多 Agent 隔离 + Lab 06 演练。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "精讲为什么长会话后半段必定遗忘禁令，以及用状态锚点 + ACC 摘要 + Worktree 物理隔离稳定长程编码。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "现场为一个多模块任务编写 init.sh 与 feature_list.json，并在 Lab 06 演练强长程 Harness 与 ACC 交接压缩。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "辨析 M6 异步 Issue-to-PR、M8 长程 Coding Harness 与 M12 运行时 Agent 应用三层边界，复盘原型迁移可选场景。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "40 分钟",
        focusPlan: "完成 M8 闭环工作台 + Lab 06 长程 Harness 对照演练 + 3 道系统边界测验。",
      },
    ],
    trimAndMergeNote: "如暂不涉及并发多 Agent，可专注“init.sh 环境初始化 + feature_list.json 状态锁 + ACC 跨会话交接”，把多 Worktree 与原型迁移参考作为可选扩展。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "跨会话任务连续性",
          traditionalWay: "靠人类工程师查看 Issue 看板与本地 Git 提交记忆接续任务。",
          aiCodingWay: "无 Harness 时新会话会丢失初期边界禁令，必须靠 feature_list.json 与 ACC 摘要外化状态锚点。",
        },
        {
          dimension: "多任务并行隔离",
          traditionalWay: "个人同一时间仅在单个本地目录切分支串行推进。",
          aiCodingWay: "可并排启动多个 Coding Agent，但若共用工作目录，文件覆盖、构建产物互斥与类型撕裂频发，必须用 Git Worktree + 目录所有权隔离。",
        },
        {
          dimension: "原型迁移边界（可选参考）",
          traditionalWay: "看静态原型重新手写工程代码，安全通道由后端控制。",
          aiCodingWay: "把在线原型引入工程仓时需纳入契约先行与本地重跑校验清单，避免覆盖鉴权或泄漏密钥。",
        },
      ],
      bottleneckShift: "长程软件工程的主要风险转化为“无外部状态锚点导致后半程偏航”与“多 Agent 并发写冲突”。",
      nonDelegableCases: [
        "init.sh、测试期望与 feature_list.json 的防篡改保护（严禁 Agent 静默删减失败条目）",
        "多 Coding Agent 并发时的 Git Worktree 划分与共享入口文件汇总",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "五类 Harness 边界（指令、范围与权限、工具与环境、状态与交接、验证与反馈）的最低基线",
        "多 Coding Agent 并发时的 git worktree 目录写入所有权边界",
        "feature_list.json 勾选通过前的真实命令行退出码验收",
      ],
      aiCanDraft: [
        "按划分好归属目录的 worktree 独立实施垂直切片与单测",
        "生成结构化 ACC 交接摘要卡（保留目标、禁区、已验证文件与下一步）",
      ],
      collaborativeLoop: "人初始化 init.sh 与 feature_list.json -> 按 Worktree 隔离派发多 Agent -> 阶段结束产出 ACC 交接 -> 人核验全量回归测试后勾选关闭。",
    },
    instructorDemo: {
      prepAndEnv: "准备一个超过 3 个特性切片的仓库任务，准备一套弱 Harness（单聊天硬撑）与强 Harness（init.sh + feature_list.json + Worktree）对照脚本。",
      targetOutcome: "现场对比无 Harness 长会话在第 16 轮忘记权限禁令的现象，展示五类 Harness 如何稳定跨会话续跑。",
      steps: [
        {
          phase: "Step 1 · 弱长程 Harness 偏航现场",
          action: "在同一个超长会话连续改完 4 个需求，不写 feature_list.json 也不切 Worktree 并发写入。",
          aiBehaviorOrEvidence: "后半程 Agent 忘掉“不准改动 Auth 中间件”，并发分支同时写坏共享类型文件。",
          humanControl: "讲师立即展示 Context Rot 与覆盖冲突，指出“仅靠聊天历史记约束不可靠”。",
        },
        {
          phase: "Step 2 · 装配系统五类强 Harness",
          action: "加载 init.sh、feature_list.json（标明 scopeAllowlist 与 verifyCommand）并按 Git Worktree 拆分写权限；使用 Lab 06 演示 ACC 交接压缩。",
          aiBehaviorOrEvidence: "每个新会话仅注入 ACC 摘要 + 当前 feature 切片，初期安全约束 100% 留存且目录 0 冲突。",
          humanControl: "讲师审阅 diff 确认测试断言与 feature_list 未被擅自篡改。",
        },
        {
          phase: "Step 3 · 合入复验与 Runbook 归档",
          action: "合并 worktree 分支后执行 npm run lint && npx tsc --noEmit && npm test，把经验更新入 kb-m8-long-horizon-harness。",
          aiBehaviorOrEvidence: "全量测试一次性退出码 0 通过。",
          humanControl: "讲师强调 M8 仅专注 Coding Harness，不与 M12 运行时 RAG/Agent 产品实现混淆。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：凡是感觉对话开始复读或遗忘开头约定，立刻暂停并导出 12 行 ACC 交接卡换新窗口！",
        "提示卡：两个并发 Coding Agent 写入目录如果有交集，就不要并行，先拆接口契约或串行汇总入口。",
      ],
      noKeyOfflineFallback: "Lab 06（长程 Coding Harness 与 ACC 压缩对照沙盘）纯本地交互运行；AI 书籍知识库可在顶部知识库中心独立检索。",
      acceptableAlternatives: [
        "单人开发小型功能无需强开多个 Worktree，保留 feature_list.json + ACC 交接 + 客观验证命令即可完成长程护栏。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "对照五类 Harness 模型为自己当前项目补出 init.sh 启动自检与 1 条 ACC 交接模板。",
      advancedChallenge: "在 Lab 06 对比弱/强长程 Harness 曲线，并为多 Agent 并发配置无交集 Worktree 目录规则。",
      pairOrTeamMode: "两人各负责 1 个 Worktree 目录并行开发模块并独立输出 ACC 交接卡，再由对方验收合并。",
      randomizedSeedNote: "练习任务可轮换：跨模块 API 升级 / 前端静态原型迁入全栈仓 / 批量单测补齐。",
      offlineSafeFallback: "在 Lab 06 与本地脚本模板中离线完成全部配置与对照演练。",
      nonDelegableCheckpoints: [
        "禁止 Agent 自行删除或弱化 feature_list.json 中的验证命令",
        "并发 Worktree 汇总进共享入口时由人类最终复核",
      ],
    },
    failureModesDeepDive: {
      classicError: "跨越 20 轮长会话不清理上下文也不写外部状态表，后半段反复破坏前半段已经修好的功能。",
      looksRightButWrong: "并发开了 3 个 Agent 都汇报成功，合并时后者直接抹掉前者写入共享路由的新代码。",
      contextOrToolFailure: "把 M6 云端异步 PR 流程或 M12 运行时 RAG 逻辑误塞进本地编码 Harness 规则里，职责混乱。",
      triageQuestions: [
        "如果现在立刻关掉这个对话窗口重开新会话，新 Agent 只看仓库文件能接上进度而不破环旧约束吗？",
        "所有并发 Coding Agent 的写入路径白名单交集是不是严格为空？",
      ],
      remediationRule: "严格执行 kb-m8-long-horizon-harness 与 kb-m8-contract-worktree-convention，并结合 kb-m8-hypothesis-acc-threshold 验证交接效果。",
    },
    rubric: [
      {
        dimension: "五类 Harness 完备度",
        passCriteria: "交付物明确覆盖指令、范围与权限、工具与环境、状态与交接、验证与反馈五类配置。",
        evidence: "LONG_HORIZON_HARNESS_RUNBOOK.md 及 init.sh / feature_list.json 骨架。",
        redFlag: "只写了一段系统提示词，缺少目录范围锁、状态持久化或验证命令。",
      },
      {
        dimension: "并发与状态防丢机制",
        passCriteria: "列出互不重叠的 Worktree 目录所有权及含不可破坏契约的 ACC 交接卡。",
        evidence: "Worktree 分区表与 ACC 交接摘要。",
        redFlag: "多 Agent 同目录混改且无任何状态锚点。",
      },
      {
        dimension: "边界清晰与客观验证",
        passCriteria: "清晰区分 M6 异步 PR 与 M12 运行时 Agent，提供可重复构建与测试退出码 0 证据。",
        evidence: "本地验证命令记录与可选原型迁移检查单。",
        redFlag: "只依赖对话自述“已完成”而未执行全量回归测试。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "给长会话任务建立 ACC 交接压缩卡与 feature_list 状态段",
        goal: "将一个正在进行的多文件任务压缩为不超过 15 行的 ACC 摘要并在新会话续跑。",
        inputsAndLimits: "必须保留：当前目标、已锁定契约、禁改目录与唯一验收命令。",
        deliverable: "ACC 交接卡 + feature_list.json 单条结构化条目。",
        verifyMethod: "新会话首次改写严格遵守原禁令且验证命令退出码为 0。",
        kbContribution: "将交接验证结论补充到 kb-m8-hypothesis-acc-threshold 观察日志。",
        offlineFallback: "在 Lab 06 切换「强长程 Harness」视图完成交接锚点核查。",
        humanReviewGate: "人工核对交接卡未丢失安全或类型约束。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "为当前仓库装配 init.sh + feature_list.json 并跑通两轮跨会话续跑",
        goal: "编写仓库可重复初始化与自检入口 init.sh，按 feature_list.json 完成 2 个连续切片并在交接后全部绿灯。",
        inputsAndLimits: "禁止修改测试预期凑通过；若沿用原型迁移参考须补齐服务端代理校验。",
        deliverable: "LONG_HORIZON_HARNESS_RUNBOOK.md + 两轮连续验证退出码日志。",
        verifyMethod: "执行 ./init.sh && npm run lint && npx tsc --noEmit && npm test 全过。",
        kbContribution: "沉淀仓库专属状态锚点模板至团队工程知识库。",
        offlineFallback: "基于本地模板仓库演练 init.sh 与 feature_list.json 状态切换。",
        humanReviewGate: "人工确认两个切片合入后未破坏原有接口与测试。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "试行多 Coding Agent + Git Worktree 并发推进模块开发",
        goal: "划分 2 个零写交集的模块，分别在不同 Git Worktree 推进并通过独立评审后无冲突合入。",
        inputsAndLimits: "TL 先锁定共享类型契约；合入前必须经过独立上下文审查与全量 CI 门禁。",
        deliverable: "Worktree 分区日志 + 并发合入 PR + 回归测试通过证明。",
        verifyMethod: "零覆盖丢失且合并主干后全量构建与测试一次通过。",
        kbContribution: "补充仓库目录分区最佳实践到 kb-m8-contract-worktree-convention。",
        offlineFallback: "使用本地双 worktree 目录顺序模拟并发改动与合入检查。",
        humanReviewGate: "技术负责人最终签收共享入口文件的合并。",
      },
    ],
  },

  m9: {
    moduleId: "m9",
    moduleCode: "M9",
    coreQuestion: "面对全栈架构与琳琅满目的工具栈，如何保持清醒选型并用五步解码终结盲修报错？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "三层 Web 请求闭环图 + 选型 ADR 权衡 + Lab 07 报错解码实战 + Lab 11 架构决策模拟。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "专为 PM/零基础或转全栈者精讲：看懂浏览器/服务端/库三层分工 + 遇到红屏前 3 步先查哪。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "结合 4 个高频真实报错（CORS/Hydration/401/Env 缺失）用 Lab 07 分层破案并填简版 ADR。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "比对“2 人小团队盲目上微服务+多库” vs “单体清晰分层”，讨论运维复杂度账单。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "40 分钟",
        focusPlan: "学习 M9 闭环工作台 + 玩通 Lab 07 & Lab 11 沙盘 + 3 道白盒判断测验。",
      },
    ],
    trimAndMergeNote: "若学员均为资深后端，可快速略过基础 HTTP 三层科普，集中在 CORS/Hydration 前后端边界调试及 ADR 规范化。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "技术选型决策",
          traditionalWay: "依赖团队已有积累或花几天逐一试错写 Demo 评估框架。",
          aiCodingWay: "AI 常按网络热度推荐复杂微服务或最新不成熟包，人必须根据团队规模与运维预算拍板克制。",
        },
        {
          dimension: "报错阅读与定位",
          traditionalWay: "看状态码、查 Network 面板和服务端终端日志分清是谁出的错。",
          aiCodingWay: "极易不看日志位置把整坨报错直接丢回给 AI，导致 AI 把数据库连不上伪装成改前端代码。",
        },
        {
          dimension: "白盒掌控感",
          traditionalWay: "虽写得慢但清楚每个请求如何穿越路由到达数据库。",
          aiCodingWay: "如果把后端和库全当黑盒交给 Vibe Coding，一旦出现鉴权或环境变量错漏即刻完全瘫痪。",
        },
      ],
      bottleneckShift: "从“手写全栈连线太繁琐”变成“选型过度复杂化与报错跨层盲猜导致的死循环”。",
      nonDelegableCases: [
        "贴合团队人力、成本预算与可维护期限的技术栈拍板与架构 ADR",
        "外部云服务计费/免费额度/隐私合规条款核验（不可轻信过时训练知识）",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "技术选型的业务前提（用户规模、团队熟悉度、云服务预算与可迁移性）",
        "报错究竟发生在 Frontend / Backend / Database 哪一层的初步判定",
        "连续盲试不果时的止损回退点",
      ],
      aiCanDraft: [
        "根据给定业务约束对比 2~3 套可行架构并起草 ADR 草稿",
        "人类指出所在层级与首行报错后，生成针对性的最小复现与补丁",
      ],
      collaborativeLoop: "人限定规模预算约束 -> AI 给多方案对比 -> 人敲定 ADR -> 遇错按五步定层后再请 AI 修复 -> 人类用 curl/浏览网控复验。",
    },
    instructorDemo: {
      prepAndEnv: "准备一个常见前后端本地联调报错案例（例如前端请求后端接口报 CORS / 或因服务端缺 env 导致返回 500）。",
      targetOutcome: "现场示范“不分辨报错层盲目贴给 AI 会越改越乱”，随后通过读首行报错+Network 定位 1 次精准解决。",
      steps: [
        {
          phase: "Step 1 · 盲贴堆栈引发反向破坏",
          action: "只把浏览器控制台报错截图或一句话“页面接口挂了帮我修一下”直接丢给 AI。",
          aiBehaviorOrEvidence: "AI 没看见服务端缺失环境变量或端口错误，反而在前端组件删掉了校验或硬写假数据兜底掩盖错误。",
          humanControl: "讲师立即叫停：假数据虽然消灭了红字，但彻底破坏了真数据链路！",
        },
        {
          phase: "Step 2 · 执行五步解码精准定位层归属",
          action: "打开 Network 查看真实状态码与响应体，同步看服务端终端首行日志，确认是服务端缺 `DATABASE_URL` 或 CORS 白名单未包含开发端口。",
          aiBehaviorOrEvidence: "明确告知 AI 错误发生在服务端层及具体环境变量缺失，要求补上 `.env.example` 说明与健壮报错提示。",
          humanControl: "讲师核对服务端配置安全（绝不写 CORS `*` 配 `credentials: true`），只允许本地安全白名单。",
        },
        {
          phase: "Step 3 · 最小复现验收与记录 ADR",
          action: "用 `curl` 与浏览器刷新核验前后端打通，并利用 `kb-m9-debug-adr-template` 补完架构选型取舍记录。",
          aiBehaviorOrEvidence: "数据流贯通且有清晰启动前置报错提示，新开发者不会再卡在同一坑里。",
          humanControl: "讲师提醒所有云平台免费额度/定价必须核对当前官网条款（标记 `待核验`）。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：永远先回答两个字——“前端、后端还是数据库？”再把日志贴给 AI。",
        "提示卡：如果 AI 给你的技术选型里一下子出现 Kafka、K8s 和 Redis 集群，先问一句“100 个用户真的需要吗？”",
      ],
      noKeyOfflineFallback: "课程 Lab 07（Vibe 全栈图谱与报错解码）与 Lab 11（架构决策模拟器）均内建完整离线演练机制。",
      acceptableAlternatives: [
        "不同全栈栈（如 Next.js 全栈、Vite+Express、BaaS 等）没有绝对优劣，只要选型 ADR 里自洽解释清楚团队熟悉度与迁移代价均视为优秀。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 07 完成 3 类高频报错（CORS / Env 缺失 / Hydration 或 401）的所属层判定与对应修复指令匹配。",
      advancedChallenge: "在 Lab 11 为指定场景填出一份完整包含备选方案对比、安全护栏与运维代价的简化 ADR。",
      pairOrTeamMode: "一方扮演 PM/非技术提出产品约束，另一方扮演工程师解释为什么某个方案最省维护成本并共同定稿 ADR。",
      randomizedSeedNote: "练习环境可抽换规模卡：1 人周末验证黑客松 / 3 人小创业队半年产品 / 企业内网工具。",
      offlineSafeFallback: "Lab 07 与 Lab 11 完全在浏览器内存本地交互运行。",
      nonDelegableCheckpoints: [
        "不能由 AI 盲选高门槛分布式架构给自己埋运维炸弹",
        "外部服务计费配额不可用模型陈旧训练记忆拍板，须查官方文档",
      ],
    },
    failureModesDeepDive: {
      classicError: "1 人小工具硬上微服务+多数据库消息队列，连本地启动都要半小时，AI 每次改一个功能都要同时改 4 个仓库。",
      looksRightButWrong: "为了消除前端报错，AI 把失败回调全改成 `catch { return mockData }`，表面一切正常实则后端早就挂了。",
      contextOrToolFailure: "把服务器 500 报错当成浏览器问题让 AI 疯狂改 React 组件，来回 5 轮毁掉整个页面状态。",
      triageQuestions: [
        "看一眼 Network 面板状态码和服务端日志，错到底出在哪一层？",
        "这个技术选型如果半年后只有我一个人维护，半夜出问题能最快定位恢复吗？",
      ],
      remediationRule: "遵循 `kb-m9-debug-adr-template` 五步排查与 `kb-m9-deprecated-blind-vibe`（禁止无定层盲贴）。",
    },
    rubric: [
      {
        dimension: "全栈分层归因准确度",
        passCriteria: "能准确分辨 CORS、401/403、构建失败、Env 缺失与 Hydration 错误所在层级并给出最小排查步。",
        evidence: "Lab 07 解码判定结果及报错排查五步表填报。",
        redFlag: "把数据库连不上或后端 500 当成前端按钮样式问题让 AI 反复修前端。",
      },
      {
        dimension: "架构 ADR 权衡清晰度",
        passCriteria: "写明所选方案理由、被否决替代方案、运维/费用限制与演进拆解触发点。",
        evidence: "`DEBUG_FLOW_AND_ADR_TEMPLATE.md` 完整记录。",
        redFlag: "只写“因为网上一篇文章说它最强/AI 默认推荐这个”而无团队约束匹配分析。",
      },
      {
        dimension: "诚实降级与边界标注",
        passCriteria: "核验外部平台配额限制或标明“待核验”，绝不在前端藏硬编码兜底数据欺骗状态。",
        evidence: "ADR 风险备注与真实接口降级提示校验。",
        redFlag: "接口挂掉后悄悄回退显示假列表让用户误以为保存成功。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "诊断自己手头一次顽固联调报错的层级定位图",
        goal: "挑一个最近卡最久的报错或 Lab 07 预设案例，按 5 步解码表走完定位和最小验证步骤。",
        inputsAndLimits: "禁做超过 10 行代码改动；重点在写清每一层排查证据。",
        deliverable: "填好的 5 步解码卡（首行信息 + 层次 + 最小复现 curl/日志 + 预防措施）。",
        verifyMethod: "同伴只看这半页纸即可直接重现错误根因不再盲猜。",
        kbContribution: "补充该报错特征到项目 README 排障小节。",
        offlineFallback: "直接选 Lab 07 任意 3 个内建报错现场执行剖析练习。",
        humanReviewGate: "确认定位出的方案没有绕过原有安全控制（如关闭 CORS 或校验）。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "为一则新设想项目撰写完整技术选型 ADR",
        goal: "针对你要搭建的个人小产品或内部工具，做一次三层技术栈对比选择并完成 ADR 文档。",
        inputsAndLimits: "限制方案选项 <= 3 个；必须包含“什么时候这套方案会不够用、如何拆迁”。",
        deliverable: "`DEBUG_FLOW_AND_ADR_TEMPLATE.md` 完整决策档案（含待核验官网价格项标注）。",
        verifyMethod: "与团队伙伴或 AI 扮演评审挑战选型弱点，看 ADR 能否正面自洽回应。",
        kbContribution: "作为团队通用小项目起手架构 ADR 归档至知识库。",
        offlineFallback: "基于 Lab 11 架构模拟器设定的场景与约束离线推演完成。",
        humanReviewGate: "本人明确写清选型中“需要在线下核实官方最新收费规则”的待核验条款。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "建立全组统一的联调排障词典与健康检查约定",
        goal: "统一定位前后端本地联调高频坑点（环境模板、端口代理、健康检查 `/api/health`），消除新人入门卡顿。",
        inputsAndLimits: "全团队成员均可一键跑通本地检查；绝不包含真密钥在 `.env.example`。",
        deliverable: "更新后的团队 `.env.example` + 统一错误码对照约定 + 新人 15 分钟联调核对清单。",
        verifyMethod: "找一位未配过该仓库环境的队友按指南现场配通并故意制造 1 个缺失报错测试提示是否清晰。",
        kbContribution: "汇总形成 `docs/knowledge-base/` 内可传帮带的故障自救图谱。",
        offlineFallback: "用本地单机双端模式模拟缺失变量、断开存储并检验报错输出质量。",
        humanReviewGate: "后端与前端负责人共同审查错误提示不向外泄露出敏感路径或内部密钥。",
      },
    ],
  },

  m10: {
    moduleId: "m10",
    moduleCode: "M10",
    coreQuestion: "如何消除千篇一律的“AI 模板味”，用结构化视觉规格与可调源码参数实现稳定美观的前端？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "拆解“AI 模板味”5 大特征 + 整站 vs 局部状态喂料对照 + Lab 08 参考库 + 真实组件规格改造实操。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "精讲为什么“高大上现代科技风”必定翻车，以及“结构拆解表 + 离散源码参数 + 三态完备”套路。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "学员挑选 1 个目标页面，用 `VISUAL_TEARDOWN_COMPONENT_SPEC.md` 拆出布局、排版尺度与交互三态规范。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "集中诊治 3 份“紫渐变发光大圆角卡片堆砌”的 AI 页面，现场做减法重构并核查对比度可访问性。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "30 分钟",
        focusPlan: "完成 M10 闭环工作台 + 探索 Lab 08（23 站索引）+ 4 道视觉工程测验。",
      },
    ],
    trimAndMergeNote: "如面向纯后端或基础设施团队，可仅用 20 分钟讲清“用结构规格替代模糊形容词 + 空/加载/错态与可访问性必查点”。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "视觉输入表达",
          traditionalWay: "靠设计师出完整 Figma 标尺、间距 Token 与交互状态图，前端逐像素还原。",
          aiCodingWay: "AI 能在秒级搭出骨架，但若只给“好看现代风”，模型必用千篇一律的紫蓝渐变、圆角堆砌与虚假装饰。",
        },
        {
          dimension: "交互完备度",
          traditionalWay: "有经验前端会自然检查空态、错态、移动端换行与键盘焦点。",
          aiCodingWay: "AI 默认只顾桌面端“理想满数据状态”，遗漏 Navbar 展开态、Footer 窄屏挤压与无障碍对比度。",
        },
        {
          dimension: "可微调资产沉淀",
          traditionalWay: "手工维护公司基础设计组件库与样式变量文件。",
          aiCodingWay: "采用“局部截图 + 离散参数（如圆角/阴影/排版阶梯）+ 技术栈对齐源码”喂料，复现稳定可调。",
        },
      ],
      bottleneckShift: "重点从“手写 CSS 动画太慢”变成“缺乏明确结构视觉规格导致高返工与低质模板味堆砌”。",
      nonDelegableCases: [
        "品牌调性主次权衡与真实信息密度取舍（禁止机械混搭多个参考站）",
        "版权合规把关（只拆解布局与设计系统规律，绝不抄袭第三方版权文案、品牌 Logo 与专有图库）",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "目标页的核心信息任务、主色调比例与严禁出现的装饰噪音清单",
        "是否对齐自身仓库既有组件框架及响应式断点策略",
        "视觉走查时对对比度、空/错态与可访问性是否放行",
      ],
      aiCanDraft: [
        "依据结构化拆解规格表生成对齐指定技术栈（如 React + Tailwind）的界面骨架",
        "快速输出空态、加载占位、异常报错态的配套组件状态分支",
      ],
      collaborativeLoop: "人拆解布局与参数约束 -> AI 生成初版 -> 人检查移动断点、交互展开态与对比度 -> 局部微调补齐三态 -> 验收留存规格。",
    },
    instructorDemo: {
      prepAndEnv: "使用课程内置 Lab 08（UI 审美参考库）与本地一段可预览的典型组件展示（无需付费设计 API）。",
      targetOutcome: "对比展示模糊提示催生出的“AI 模板味翻车版”，与补齐视觉规格表及禁用项后的清爽专业输出。",
      steps: [
        {
          phase: "Step 1 · 展示模糊审美指令的模板味翻车",
          action: "向 AI 输入：“做一个极其炫酷高级的现代科技感课程统计面板，加很多动画渐变卡片。”",
          aiBehaviorOrEvidence: "AI 堆砌了大量紫色霓虹发光边框、静默小药丸胶囊、无意义闪烁圆点与极低对比度灰字，且无移动端适配与空数据状态。",
          humanControl: "讲师逐项点评 4 处典型 AI Slop 症状，说明“炫酷”词越泛、模板味越重。",
        },
        {
          phase: "Step 2 · 注入视觉拆解规格与参数禁用约束",
          action: "套用 `kb-m10-anti-ai-slop-spec`：明确列网格、用 `·` 分隔非标签文本、禁用装饰脉冲动画与大紫渐变、指定主辅色比例与三态组件。",
          aiBehaviorOrEvidence: "AI 收敛输出清晰的层级排版、表格数字对齐（tabular-nums）、清爽按钮态与完备空态/错态提示。",
          humanControl: "讲师特意点开窄屏模式检查 Navbar 展开与长文字截断表现，发现 1 处按钮换行后要求加上 `whitespace-nowrap`。",
        },
        {
          phase: "Step 3 · 跑可访问性与构建门禁",
          action: "核对键盘 Tab 焦点框可见性、文字对比度及运行本地构建/Lint 检查。",
          aiBehaviorOrEvidence: "无静态检查报错，主要互动控件支持键盘聚焦与屏幕阅读器属性。",
          humanControl: "讲师签收改版组件，并将有效参数组合记录入组件规格文档。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：一时想不起设计术语，就先把目标页拆成 3 个数字回答：主区域分几栏？最大宽度是多少？首屏用户最先该看哪 1 句话？",
        "提示卡：看到页面上到处飘着小圆角彩色徽章（Badge）和闪烁绿点时，拿掉一半立刻高级一倍。",
      ],
      noKeyOfflineFallback: "Lab 08 内置完整 23 站分类卡片与可复制结构化提示词模板，无需联网生成图片即可演练规格撰写。",
      acceptableAlternatives: [
        "对于无高定设计需求的内网后台工具，直接选用一套克制的已有标准组件库约定间距和对比度即可，不必盲目追求华丽动效。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在闭环沙盘或 Lab 08 挑选 1 个分类站参考，写出一份含“结构层级+三态要求+3 项 AI 味禁用规则”的拆解卡。",
      advancedChallenge: "对一段既有 AI 生成表单组件进行“去 AI 味诊断”，删去冗余装饰并补齐 Empty/Loading/Error 态及键盘焦点。",
      pairOrTeamMode: "两人各自挑 1 个现有项目页面互做视觉走查挑刺，输出 3 条可量化修改点（非“不好看”等主观词）。",
      randomizedSeedNote: "练习任务可轮换：数据统计看板 / 开发者文档导航壳 / 定价选型表移动端适配。",
      offlineSafeFallback: "在课程内置闭环演练与本地源码审查中完成全部训练，无需外网抓图。",
      nonDelegableCheckpoints: [
        "严禁整站照搬复制他人受版权保护的文案、品牌资产或插画图库",
        "核心表单与按钮的可访问对比度及交互三态必须经过人工真机/窗口尺寸验视",
      ],
    },
    failureModesDeepDive: {
      classicError: "一次性把 3 个风格截然不同的参考站图拼进提示词，生成界面元素打架、字体与色彩体系分裂。",
      looksRightButWrong: "桌面全屏看起来赏心悦目，一缩窄到平板/手机宽度或把数据列表清空，页面立刻错位成白屏或横向溢出。",
      contextOrToolFailure: "只喂了顶部默认收起状态的导航栏截图，导致 AI 瞎编出丑陋且不可点的下拉菜单。",
      triageQuestions: [
        "这一页如果只能保留 1 个视觉重点、删掉 50% 的框线与渐变，信息还会清楚吗？",
        "我在窄屏下用键盘 Tab 键走一圈、把接口数据返回空数组，页面都能体面运行吗？",
      ],
      remediationRule: "遵循 `kb-m10-anti-ai-slop-spec` 规范，结合 `kb-m10-hypothesis-single-slice-visual` 分步检查桌面与窄屏交互态。",
    },
    rubric: [
      {
        dimension: "结构与约束表达清晰度",
        passCriteria: "规格文档包含明确的布局栅格、排版尺度、色彩主次比例与具体禁用项（而非空洞形容词）。",
        evidence: "`VISUAL_TEARDOWN_COMPONENT_SPEC.md` 视觉拆解表。",
        redFlag: "仅写“极简大厂高级质感风”要求 AI 自由发挥。",
      },
      {
        dimension: "去 AI 模板味克制度",
        passCriteria: "剔除无关紫蓝渐变背景、滥用装饰性脉冲圆点、静默假胶囊徽章与过载发光边框。",
        evidence: "界面静态审查或代码样式检查无违规模板装饰。",
        redFlag: "满屏无语义发光圆角卡片和挤在一起的微弱对比文字。",
      },
      {
        dimension: "状态完备与交互可用性",
        passCriteria: "覆及桌面/移动窄屏响应表现、Empty/Loading/Error 三态以及清晰的键盘焦点与可读对比度。",
        evidence: "多视口/多状态自检清单勾选项。",
        redFlag: "只实现满数据桌面端，数据为空或屏幕缩窄即布局崩坏。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "为手头 1 个界面做一次“减法与三态”诊治",
        goal: "审视自己已有或 AI 刚生成的 1 个页面，列举出 3 处多余装饰及缺失的状态（如空态或窄屏）。",
        inputsAndLimits: "可仅先写排查诊断清单，再挑最小一处改净验证。",
        deliverable: "前后对照修改记录 + 1 份自用的“AI 生成前必带视觉禁用清单”。",
        verifyMethod: "浏览器缩窄到 375px 宽及手动模拟返回空数组检查不溢出、不白屏。",
        kbContribution: "补充你项目中反复踩中的前端样式坏习惯到知识库禁止清单。",
        offlineFallback: "基于本课程 Lab 08 或本地静态 HTML/React 示例组件练习排查。",
        humanReviewGate: "本人用键盘操作验证焦点移动清晰、重点信息一眼可读。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "按视觉拆解表从头生成一个零 AI 模板味的交互模块",
        goal: "先填好 `VISUAL_TEARDOWN_COMPONENT_SPEC.md` 规格再交给 AI 编码，完成包含导航展开态与三态的页面模块。",
        inputsAndLimits: "对齐现有仓库框架，严禁整站照抄他人品牌文案或图片资产。",
        deliverable: "视觉拆解表 + 源码实现 + 桌面/移动端与三态检查录屏或说明。",
        verifyMethod: "通过项目 Lint/类型校验及至少 2 位同学对可操作性和清晰度盲测。",
        kbContribution: "将该模块的组件参数基准与排版尺度提取成团队设计模板条目。",
        offlineFallback: "使用课程已有组件体系本地分支离线完成改造对比。",
        humanReviewGate: "人工核验文字对比度、可点击态反馈与空版权素材风险。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "沉淀团队共享的 UI 生成规则（.mdc）与组件走查基线",
        goal: "把本仓库真正采用的颜色变量、排版阶梯、表格规范与必查状态写进前端专属 `.mdc` 中。",
        inputsAndLimits: "绑定到前端路径 `src/components/**`；避免侵入后端目录。",
        deliverable: "前端专用 `.cursor/rules/30-ui-design-system.mdc` + 视觉验收 checklist。",
        verifyMethod: "拿一份新界面需求直接跑一轮生成，评价团队一次成型还原度与返工率。",
        kbContribution: "更新 `kb-m10-anti-ai-slop-spec` 及团队局部状态喂料假设的实际反馈数据。",
        offlineFallback: "用团队共享静态样式词典与本地组件 Demo 做人工走查基准。",
        humanReviewGate: "前端与设计负责人签收，确保规格既阻止了丑陋堆砌又不扼杀必要创意表达。",
      },
    ],
  },

  m11: {
    moduleId: "m11",
    moduleCode: "M11",
    coreQuestion: "不提前编写复杂 Agent 代码，如何输出一份让业务、风控与研发共同签收的 Agent 产品蓝图？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "Workflow vs Agent 决策树 + Data PRD 敏感分层 + Prompt PRD & HITL 审批矩阵实战撰写 + 交叉挑战评审。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "聚焦“哪些需求根本不需要做成自主 Agent”，现场拆解 1 份医疗/校园/报销场景双 PRD 模板。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "分组对同一业务诉求裁剪 Workflow 边界，补齐 tenantId 隔离键与不可逆写操作 HITL 门槛。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "剖析“未写 Data PRD 失效日期导致模型引用去年报销旧条款”与“无 HITL 直接自动打款”事故。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "45 分钟",
        focusPlan: "学习 M11 全部架构单元测试，独立完成 Data/Prompt PRD + HITL 矩阵产物并通过 4 道巩固测验。",
      },
    ],
    trimAndMergeNote: "若受众主要是研发团队，可跳过基础产品需求拆分，直接聚焦 Data PRD 权限/时效字段与 Prompt PRD 预算/升级阈值契约。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "产品立项规格",
          traditionalWay: "写清楚确定性表单字段、状态流转与接口报错文案即可。",
          aiCodingWay: "Agent 引入不确定推理与工具调用，必须新增 Data PRD（权限与时效）与 Prompt PRD（工具预算与拒答/人工接管）。",
        },
        {
          dimension: "架构复杂性判断",
          traditionalWay: "按流程步骤画固定流程图。",
          aiCodingWay: "极易盲目追求“全自主 Agent”导致可控性丧失，必须用决策树先看能否用确定性 Workflow 收口。",
        },
        {
          dimension: "跨职能协同分工",
          traditionalWay: "PM 出 PRD 后研发写完再测试。",
          aiCodingWay: "PM 可用双 PRD 与模拟风险矩阵先做规范校验（衔接 M13-Gov），再与工程实现（M12）严格解耦分工。",
        },
      ],
      bottleneckShift: "产品设计瓶颈从“漏画界面弹窗”变成“漏设知识库权限边界、版本淘汰与 HITL 人工接管点”。",
      nonDelegableCases: [
        "判断流程到底该用固定 Workflow 还是自主 Agent 的风险收益权衡",
        "写死哪些高风险动作绝不允许自动放行（HITL 签字责任界定）",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "业务场景是否必须由自主 Agent 解决，还是固定工作流更稳妥",
        "数据源敏感等级、tenantId/role 隔离键与过期失效阈值",
        "写操作 HITL 审批门禁与置信度不足时的拒答/转人工规则",
      ],
      aiCanDraft: [
        "根据业务场景起草 Data PRD / Prompt PRD 初稿并补全常见异常场景清单",
        "列出可能触发工具误调或越权的对抗提问示例供 PM 审核",
      ],
      collaborativeLoop: "人判定是否用 Agent -> 人锁定敏感数据源与 HITL 红线 -> AI 协助扩展双 PRD 与边界案例 -> 产研共审签收交接。",
    },
    instructorDemo: {
      prepAndEnv: "准备“校园学术会议助手 / 费用报销代理”需求简报与 kb-m11-agent-prd-blueprint 模板。",
      targetOutcome: "演示如何将一句“做个帮全员自动报销和查制度的 AI 助手”拆剪为边界可控的双 PRD 与 HITL 审批矩阵。",
      steps: [
        {
          phase: "Step 1 · 拆穿过度自主 Agent 冲动",
          action: "对比“发票金额核对入账”与“复杂跨规则例外说明”，在 Workflow vs Agent 决策树逐项核查。",
          aiBehaviorOrEvidence: "常规校验用确定性规则即可 100% 稳定通过，仅对非结构化政策比对引入受控检索节点。",
          humanControl: "讲师裁定将打款与财务入账设为独立硬审批阶段，严禁 Agent 直接写账本。",
        },
        {
          phase: "Step 2 · 补全 Data PRD 与 Prompt PRD 硬约束",
          action: "逐条填出 tenantId + roleScope、active/deprecated 状态字段、工具预算 <= 4 及置信度 < 0.65 拒答条款。",
          aiBehaviorOrEvidence: "形成可直接交接研发与治理评审的结构化规格。",
          humanControl: "讲师检查无任何空泛口号（如“保证回答准确”），全部转化为可机检条款。",
        },
        {
          phase: "Step 3 · 映射双轨 Capstone 分流",
          action: "说明非技术/PM 基于本蓝图进入 M13-Gov 治理评审，工程角色进入 M12 运行时知识库与代码实现。",
          aiBehaviorOrEvidence: "职责清晰，无代码学习者路径完全闭合。",
          humanControl: "讲师强调 M11 产物是后续两条 Capstone 共同的上游契约基准。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：凡是能用 if-else 和表单下拉框枚举完的步骤，千万不要强行交给 Agent 推理！",
        "提示卡：写 Prompt PRD 时问一句——“如果它检索出零条资料或猜错了，谁来兜底停下？”",
      ],
      noKeyOfflineFallback: "M11 全部蓝图模板与决策树案例均内置于单元工作台与知识库，完全支持离线撰写与互评。",
      acceptableAlternatives: [
        "敏捷小团队可将 Data PRD 与 Prompt PRD 合并为同一份 1 页结构化 Markdown，只要权限、失效淘汰、工具预算与 HITL 四栏齐备即合格。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "挑选 1 个业务场景（校园会议助手 / 报销助手），完成 Workflow vs Agent 判定卡与至少 3 条 HITL 触发条件。",
      advancedChallenge: "编写完整双 PRD（包含 2 类越权探针预期拒绝结果与 ROI 止损评估指标）。",
      pairOrTeamMode: "PM 与工程师角色扮演：工程师专门挑战 Data PRD 里漏掉的脏数据与过期版本边界。",
      randomizedSeedNote: "练习场景可轮换：校园学术会议助手 / 医疗知识检索辅助 / 内部 IT 工单分诊代理。",
      offlineSafeFallback: "使用课程内置 AGENT_PRODUCT_BLUEPRINT.md 模板离线撰写自查。",
      nonDelegableCheckpoints: [
        "HITL 审批门槛与最高允许误判代价由人类业务负责人确定",
        "不得把模糊承诺当成可验收需求",
      ],
    },
    failureModesDeepDive: {
      classicError: "把本该用确定性脚本+表单处理的标准审批强行做成自主 Agent，结果延迟翻倍还经常漏字段。",
      looksRightButWrong: "PRD 写满 5 页功能介绍，却只字未提“实习生能否检索到薪酬文档”“旧制度更新后怎么作废”。",
      contextOrToolFailure: "在 PRD 中允许 Agent 一次性挂载 12 个跨部门读写工具而不设步数上限和确认门禁。",
      triageQuestions: [
        "如果把该任务里的 LLM 推理换成固定决策流，能否覆盖 80% 主流程？",
        "文档过期作废与跨角色隔离在 Data PRD 中写明由哪几个元数据字段执行了吗？",
      ],
      remediationRule: "严格套用 kb-m11-agent-prd-blueprint 模板并核查 HITL 矩阵四象限。",
    },
    rubric: [
      {
        dimension: "Workflow vs Agent 判定合理性",
        passCriteria: "列出任务确定性程度、异常处理复杂度与失控代价，明确说明为何选用 Workflow 或受控 Agent。",
        evidence: "Workflow vs Agent 决策判定表。",
        redFlag: "未做任何论证直接宣布“全部交给自主多 Agent 协同”。",
      },
      {
        dimension: "Data PRD 权限与时效完整性",
        passCriteria: "明确定义数据源敏感分级、tenantId/role 隔离键及 active/deprecated 版本淘汰契约。",
        evidence: "AGENT_PRODUCT_BLUEPRINT.md Data PRD 章节。",
        redFlag: "忽略权限边界与过期条款淘汰策略。",
      },
      {
        dimension: "Prompt PRD 与 HITL 矩阵可执行性",
        passCriteria: "划定工具预算上限、低置信度拒答阈值及不可逆写操作的人工确认审批流。",
        evidence: "HITL 审批矩阵与降级规则表。",
        redFlag: "写操作自动执行无人工复核或缺少拒答边界。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "为你想做的 AI 应用补全 HITL 风险与人工审批表",
        goal: "列出 5 项该应用涉及的读/写动作，按可逆性与代价划分自动放行区与人工确认区。",
        inputsAndLimits: "严禁把“删除/打款/改权限/对外发邮件”放入无人确认自动区。",
        deliverable: "5 动作 HITL 审批表 + 2 条强制拒答边界条件。",
        verifyMethod: "同伴对照表能立刻判定任意越权情景该停在哪个门禁。",
        kbContribution: "汇总高频业务误判陷阱至知识库评审清单。",
        offlineFallback: "基于“校园会议助手”示例离线完成审批分级填写。",
        humanReviewGate: "业务与产品负责人确认不可逆操作均已挂人工审批。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "产出完整 AGENT_PRODUCT_BLUEPRINT.md 双文档蓝图",
        goal: "面向一个选定产品需求，完整填妥 Workflow 决策、Data PRD、Prompt PRD 与 ROI 边界。",
        inputsAndLimits: "不含真实敏感生产数据，使用脱敏样本结构描述。",
        deliverable: "AGENT_PRODUCT_BLUEPRINT.md 完整规范文档。",
        verifyMethod: "对照 M11 3 项 Rubric 全部勾选满足且无遗漏隔离键。",
        kbContribution: "按 kb-m11-agent-prd-blueprint 沉淀为可复用产研模板。",
        offlineFallback: "在工作台离线编辑导出 Markdown 供工程/治理评审使用。",
        humanReviewGate: "技术与风控接口人共同签认交接条件清晰。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "拉齐团队既有 Agent 项目的 Data/Prompt PRD 基线并建立准入关",
        goal: "用双 PRD 规范复盘 1 个现有内部 AI 工具，补齐之前遗漏的权限隔离与版本淘汰条款。",
        inputsAndLimits: "不破坏现有生产稳定流，优先补齐测试集与审批卡点。",
        deliverable: "团队级 Agent 立项准入评审表 + 补齐后的双 PRD。",
        verifyMethod: "新立项需求必须提交 Data/Prompt PRD 方能进入开发或治理排期。",
        kbContribution: "纳入公司内部工程与产品知识库标准流程。",
        offlineFallback: "组织线下产研联合蓝图评审会完成规范补全。",
        humanReviewGate: "产研负责人共同签字启用新立项准入门禁。",
      },
    ],
  },

  m12: {
    moduleId: "m12",
    moduleCode: "M12",
    coreQuestion: "如何构建与研发工程知识库彻底分离、具备 ACL Pre-filter、引用溯源、Tombstone 淘汰与预算熔断的运行时 Agent？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "工程 KB vs 运行时 KB 双链架构 + ACL 检索前强过滤漏洞演示 + Hybrid/Wiki 检索与 Tombstone + Lab 18/19 实战。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "直击运行时 RAG 六步链路，重点演示“先召回后 Prompt 掩盖导致越权泄密”及“无熔断工具死循环”。",
      },
      {
        mode: "workshop",
        label: "工作坊 (50m)",
        duration: "50 分钟",
        focusPlan: "基于 retrieveAuthorizedChunks 骨架扩展 Tombstone 淘汰与引用锚点校验，跑通 Lab 18 & Lab 19。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "比较纯向量切片 RAG 与结构化 Wiki 索引路由在数学/哲学/合规条目场景下的检索精度与幻觉差异。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "55 分钟",
        focusPlan: "完成 M12 六步链路学习 + Lab 18 & Lab 19 沙盘全部验证 + 4 道运行时工程测验。",
      },
    ],
    trimAndMergeNote: "若学员主要构建单租户结构化 Wiki 助手，可弱化复杂多租户矢量集群选型，但必须完整保留 ACL/status 检索前过滤、引用溯源与预算熔断。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "知识库职责定位",
          traditionalWay: "开发文档给程序员看；线上数据库表给运行应用查询。",
          aiCodingWay: "切忌混淆！工程 KB（Rules/PDF 书单）供 Coding Agent 读代码；运行时 KB（Ingestion/ACL/Citation/Eval）供线上应用动态检索。",
        },
        {
          dimension: "权限与时效控制",
          traditionalWay: "SQL WHERE tenant_id = ? AND is_active = 1 硬过滤。",
          aiCodingWay: "极易失误做成“先全库向量检索 Top-K，再靠 Prompt 嘱咐不要泄密”；必须坚持检索前强过滤 + Tombstone 淘汰。",
        },
        {
          dimension: "循环失控防御",
          traditionalWay: "有限重连与固定超时抛错。",
          aiCodingWay: "Agent 工具循环必须强制配 maxSteps、单工具超时、费用预算熔断与 HITL 挂起中断点。",
        },
      ],
      bottleneckShift: "工程重灾区从“调通大模型聊天 API”转为“堵住 RAG 越权漏出、过期召回、无依据编造与工具循环耗尽配额”。",
      nonDelegableCases: [
        "检索前过滤（ACL Pre-filter）与状态淘汰代码逻辑不得退让给 Prompt 指令兜底",
        "写操作工具挂起批准门禁与最大步数/费用硬上限由服务端强制执行",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "tenantId / allowedRoles / active 状态字段在检索底层强制过滤",
        "纯向量切片 vs 结构化 Wiki 路由的分域策略",
        "工具白名单、maxSteps 与费用熔断阈值以及引用锚点必填校验",
      ],
      aiCanDraft: [
        "按给定契约实现文档分块、混合打分函数与结构化引用 JSON 封装",
        "编写越权探测与过期版本淘汰自动化测试脚本",
      ],
      collaborativeLoop: "人锁定 ACL 与熔断契约 -> AI 起草检索与工具循环实现 -> 人执行零越权/零过期探针测试 -> 补齐引用溯源校验。",
    },
    instructorDemo: {
      prepAndEnv: "打开 docs/knowledge-base/runtime-domain-kb.md 可运行 TypeScript 骨架及 Lab 18、Lab 19。",
      targetOutcome: "演示先召回后 Prompt 掩盖如何在提示注入下泄密，随即切换 Pre-filter + Tombstone + Citation Grounding 与熔断保护全部堵住。",
      steps: [
        {
          phase: "Step 1 · 演示 Post-prompt 权限失效与旧条款混入",
          action: "在 Lab 18 选择「Post-prompt 掩盖（不安全）」并以普通员工/实习生角色发起检索含机密薪资或过期条款的查询。",
          aiBehaviorOrEvidence: "敏感与 deprecated 片段进入模型上下文后，通过归纳或诱导提示直接被泄露，且模型混用已失效旧条文。",
          humanControl: "讲师声明红线：只要越权原文进入 LLM 上下文即构成 P0 安全缺陷。",
        },
        {
          phase: "Step 2 · 开启 ACL Pre-filter + Tombstone + 引用锚点",
          action: "切换为「ACL Pre-filter + Tombstone」，检查 retrieveAuthorizedChunks 的过滤顺序及返回结果中的 docId/version/section 锚点。",
          aiBehaviorOrEvidence: "越权样本召回瞬间归 0，历史废弃条款被拦截，无法命中充足依据时触发拒答边界。",
          humanControl: "讲师提示教学沙盘用内存过滤模拟，生产须下推到支持元数据前过滤的向量/搜索引擎索引条件中。",
        },
        {
          phase: "Step 3 · 触发 Agent 工具死循环熔断与人工审批挂起",
          action: "切换到 Lab 19 触发外部工具超时重试与高危写操作请求。",
          aiBehaviorOrEvidence: "循环达到 maxSteps=4 后立即确定性停机并保留状态上下文；写操作自动进入待人工审批挂起态。",
          humanControl: "讲师归档双层测试契约，强调所有线上运行 Agent 必须有独立检索层与端到端层评测。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：永远把 `tenantId === session.tenantId && allowedRoles.includes(session.role) && status === 'active'` 写在检索之前，而不是 Prompt 之后！",
        "提示卡：写不出漂亮混合检索时，先把结构清晰的制度/公式做成 Wiki 锚点目录路由，精确度常常高于盲目切 500 字文本块。",
      ],
      noKeyOfflineFallback: "Lab 18（运行时 KB）与 Lab 19（Agent 工具循环熔断）内置完整确定性多租户与状态机仿真，零 API Key 可全量通关。",
      acceptableAlternatives: [
        "在结构化程度高的小型领域库（如哲学/数学定理/团队 Wiki）中，使用清晰章节索引路由 + BM25 精确匹配往往优于复杂的重型矢量数据库。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 18 验证 Pre-filter 拦截效果并在 Lab 19 触发 1 次预算熔断与 HITL 挂起。",
      advancedChallenge: "基于 docs/knowledge-base/runtime-domain-kb.md 扩展 1 个检索前过滤与引用校验单元测试文件。",
      pairOrTeamMode: "红蓝对抗：红队编写跨租户和过期条款探测问句，蓝队加固检索过滤与拒答阈值。",
      randomizedSeedNote: "练习语料可轮换：医疗合规制度库 / 多租户 SaaS 客服库 / 数学建模结构化 Wiki。",
      offlineSafeFallback: "完全依托 Lab 18 / Lab 19 本地交互状态机与静态代码骨架演练。",
      nonDelegableCheckpoints: [
        "服务端会话身份鉴权与过滤键由后端解析，绝不信任前端传入的 tenantId/role",
        "零越权探针必须作为不可跳过的 CI 回归用例",
      ],
    },
    failureModesDeepDive: {
      classicError: "把开发知识库的一份全量 Markdown 导出文件塞进 System Prompt 当作线上产品知识库，无权限隔离也无法动态更新淘汰。",
      looksRightButWrong: "常规提问测试全部回答流利，但只要问旧政策条款或越权探测，立刻一本正经编造或泄露秘密。",
      contextOrToolFailure: "按固定 500 字符硬切分数学推导或合规前提-结论条款，导致“前提条件”和“适用禁令”被切进两个分块里各自失真。",
      triageQuestions: [
        "在请求打入 LLM 之前，无权和已废弃的数据切片有没有在数据源查询环节就被物理排除？",
        "外部工具异常或模型陷入自我反思循环时，系统会在第几步、花费多少钱时硬性熔断？",
      ],
      remediationRule: "严格遵守 kb-m12-acl-prefilter-contract 与 kb-m12-hybrid-citation-grounding，区分双链路 KB 边界。",
    },
    rubric: [
      {
        dimension: "双链路分离与 ACL Pre-filter 执行力",
        passCriteria: "检索路径严格在查询前校验服务端会话 tenantId、role 与 active 状态，禁止先召回后提示词掩盖。",
        evidence: "Lab 18 验证记录或 retrieveAuthorizedChunks 过滤逻辑测试。",
        redFlag: "把无权限原文放入上下文并仅靠 Prompt 叮嘱“勿透露”。",
      },
      {
        dimension: "Citation Grounding 与 Tombstone 淘汰",
        passCriteria: "每条结论绑定 docId/version/section 引用锚点，deprecated 版本召回率为 0，无证据时拒答。",
        evidence: "带引用结构输出与旧版本冲突测试用例通过结果。",
        redFlag: "允许模型脱离检索上下文自由发挥且无法回溯原文位置。",
      },
      {
        dimension: "运行时循环控制与熔断",
        passCriteria: "实现工具白名单、maxSteps/费用硬上限及高危写操作挂起 HITL 机制。",
        evidence: "Lab 19 熔断曲线与 RUNTIME_AGENT_KB_IMPL.md 控制表。",
        redFlag: "无步数上限或无人工审批直接放行不可逆修改。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "编写并运行 3 条跨租户越权与过期版本探测用例",
        goal: "针对 retrieveAuthorizedChunks 骨架或自有检索接口，构造实习生越权与旧版文档探测验证。",
        inputsAndLimits: "所有探测断言均要求命中数为 0 或显式返回拒答标识。",
        deliverable: "3 条探测测试代码与命令行退出码 0 结果。",
        verifyMethod: "测试输出 0 越权、0 过期误召回。",
        kbContribution: "把典型越权提问模式记录进红队探针清单。",
        offlineFallback: "在 Lab 18 切换不同身份与状态开关完整截屏验证。",
        humanReviewGate: "人工复核身份信息均来自服务端认证会话而非前端入参。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "完成带引用溯源与预算熔断的运行时 KB + Agent 服务骨架",
        goal: "串联检索前过滤、结构化引用输出、maxSteps 熔断与写操作 HITL 暂停状态返回。",
        inputsAndLimits: "仅使用脱敏示例文档切片与模拟工具，禁止在源码硬编码外部密钥。",
        deliverable: "RUNTIME_AGENT_KB_IMPL.md + 可运行服务代码与单元测试集。",
        verifyMethod: "npx tsc --noEmit && 单元测试全绿（含故障超时熔断测试）。",
        kbContribution: "总结分块边界与 Wiki 路由选型笔记补入知识库。",
        offlineFallback: "基于 docs/knowledge-base/runtime-domain-kb.md 离线实现本地内存版本并测试。",
        humanReviewGate: "工程师核验所有写操作与状态变更均受门禁保护。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "建立生产领域 KB 增量更新 Tombstone 流水线与双层回归探针",
        goal: "打通文档发布即标记旧版本 deprecated、同步刷新索引并自动触发 Ragas/Promptfoo 风格回归门禁。",
        inputsAndLimits: "灰度发布先在测试集验证 Recall@K 与零越权，不直接在全库做无回滚覆盖。",
        deliverable: "增量索引更新脚本 + Tombstone 淘汰回归套件。",
        verifyMethod: "发布 v2 后 1 分钟内确认全库查询不再生效 v1 切片且引用指标达标。",
        kbContribution: "将运维流程更新到 kb-m12-acl-prefilter-contract 迁移指引中。",
        offlineFallback: "用本地 JSON/SQLite 版本化文档库模拟增量替换与旧版作废验证。",
        humanReviewGate: "检索负责人与安全负责人共同签收零越权报告。",
      },
    ],
  },

  "m13-gov": {
    moduleId: "m13-gov",
    moduleCode: "M13-Gov",
    coreQuestion: "不编写后端与检索代码，产品经理与非技术负责人如何基于预制轨迹与评测集完成严谨的上线治理评审？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "四类治理高危风险剖析 + Lab 20 预制轨迹实战审签 + Go/Conditional/No-Go 分级辩论 + 模拟评审边界声明核查。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (45m)",
        duration: "45 分钟",
        focusPlan: "精讲 PM 如何看懂 Agent 执行轨迹中的越权/幻觉信号并产出研发可执行的整改工单。",
      },
      {
        mode: "workshop",
        label: "工作坊 (45m)",
        duration: "45 分钟",
        focusPlan: "使用 Lab 20 完整审查 3 条预制业务轨迹（会议/医疗/报销），导出带明确阻断理由的审签报告。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "讨论“哪些瑕疵可附条件放行（Conditional），哪些必须一票否决（No-Go）”及模拟评审声明的合规意义。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "45 分钟",
        focusPlan: "完成 M13-Gov 治理单元 + Lab 20 全部 3 条轨迹评审与报告导出 + 4 道治理测验。",
      },
    ],
    trimAndMergeNote: "如与其他角色联席评审，保留“P0 阻断判定演练 + 模拟验证边界声明”，并现场对接 M12 研发团队确认工单接收口径。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "产品经理上线验收方式",
          traditionalWay: "按PRD逐条点击界面按钮核对页面跳转、报错提示与数据保存。",
          aiCodingWay: "Agent 界面往往只见一个聊天框；必须通过审计多步推理与检索轨迹发现越权、过期引用与未确认写操作。",
        },
        {
          dimension: "非技术角色参与深度",
          traditionalWay: "后端鉴权和异常分支往往看不太懂，只能等测试报 Bug。",
          aiCodingWay: "借助结构化预制轨迹与 Golden 评测集，PM 可直接用治理核查表定位问题并反补 Data/Prompt PRD。",
        },
        {
          dimension: "结论诚实边界",
          traditionalWay: "UAT 验收环境与真实运行环境接近。",
          aiCodingWay: "必须明确标注：本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。",
        },
      ],
      bottleneckShift: "治理验收重点转向“防伪造全绿假象、拆穿无引用顺滑胡说，以及绝不把模拟评审包装为生产实测”。",
      nonDelegableCases: [
        "Go / Conditional / No-Go 上线准出裁决与业务合规签字责任",
        "严格保留模拟评审边界声明，不允许删除或弱化免责口径",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "各轨迹触发的风险等级（P0 阻断 vs 待观察优化）及对应 PRD 修订",
        "Go / Conditional / No-Go 最终签字结论",
        "转交工程团队修复后的复审验收口径",
      ],
      aiCanDraft: [
        "按预制轨迹日志梳理出各步调用工具与检索文档清单",
        "根据人类勾选的阻断原因生成规范化的整改工单与评审纪要草稿",
      ],
      collaborativeLoop: "人按核查表审查预制轨迹 -> 标记风险并关联 Data/Prompt PRD 条款 -> 系统汇总模拟评审报告 -> 人复核边界声明后签发给工程或产品归档。",
    },
    instructorDemo: {
      prepAndEnv: "打开 Lab 20（无代码 Agent 预制轨迹风险评估与评审台）与 kb-m13-gov-trajectory-rubric。",
      targetOutcome: "演示一条“表面回答极其流畅完美、实则隐藏跨角色越权与过期条款”的轨迹，教会 PM 精准抓出隐患并下达 No-Go 整改单。",
      steps: [
        {
          phase: "Step 1 · 拆穿流利回答背后的越权漏过滤",
          action: "在 Lab 20 打开轨迹 1（报销与薪酬查询场景），请学员先看最终回复文本，再展开中间检索片段元数据。",
          aiBehaviorOrEvidence: "最终回复语言礼貌通顺，但元数据明确显示实习生身份竟召回了 `restricted-salary` 片段。",
          humanControl: "讲师立即定级为 P0 No-Go，指出仅看聊天结果绝不可能发现这种隐蔽漏洞。",
        },
        {
          phase: "Step 2 · 检查 HITL 缺失与无引用幻觉",
          action: "切换轨迹 2 与轨迹 3，检查过期条款召回、无引用编造及直接发起付款工具调用未挂起人工审批。",
          aiBehaviorOrEvidence: "每条高危动作均能映射回 M11 编写的 Data PRD 与 Prompt PRD 具体条款漏洞。",
          humanControl: "讲师勾选整改动作并生成带工程验收条件的 Conditional / No-Go 整改工单。",
        },
        {
          phase: "Step 3 · 复核模拟验证边界声明",
          action: "导出模拟治理评审报告，重点高亮底部固定声明文本。",
          aiBehaviorOrEvidence: "报告清晰包含“本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。”",
          humanControl: "讲师强调非技术 Capstone 考察的是系统性风控与规格能力，不可越界冒充线上压测结论。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：审轨迹先看三件事：谁问的（role/tenant）？查了哪条（status/docId）？动了什么不可逆工具（有没有 HITL 暂停）？",
        "提示卡：凡是看到“本测试集没问题”，立刻补问一句——“这只是预制轨迹，生产真实运行系统由谁跑实测？”",
      ],
      noKeyOfflineFallback: "Lab 20 预制轨迹评估台完全在本地静态交互运行，支持完整风险标注与 Markdown 报告导出。",
      acceptableAlternatives: [
        "如果学员有自有业务需求，可沿用同一套四维度评分表自检自己 M11 产出的蓝图文档（仍须保留模拟边界声明）。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "在 Lab 20 审查全部 3 条预制轨迹，准确识别全部预置 P0 隐患并生成评审报告。",
      advancedChallenge: "针对报告中发现的每处缺陷，回写对应的 M11 Data PRD / Prompt PRD 修订补丁条款与工程接手测试要求。",
      pairOrTeamMode: "PM 负责审签与下达整改单，搭档工程师对照给出修复方案与所需回归测试用例。",
      randomizedSeedNote: "预制轨迹覆盖校园会议系统、医疗合规检索与费用报销代理三类场景。",
      offlineSafeFallback: "在 Lab 20 本地浏览器离线完成全量评审勾选与 Markdown 导出。",
      nonDelegableCheckpoints: [
        "P0 越权风险与未设 HITL 写操作不得放行上线",
        "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。",
      ],
    },
    failureModesDeepDive: {
      classicError: "只看最终输出是否通顺流畅就批准 Go，完全漏查检索元数据中的越权文档与过期版本。",
      looksRightButWrong: "把教学沙盘中的模拟评审通过当成上线通行证，未交接研发跑真实端到端测试便急于全员推广。",
      contextOrToolFailure: "发现风险后只写“请研发优化一下模型智商”，没指出具体缺哪个 ACL 过滤键或 HITL 审批门禁。",
      triageQuestions: [
        "每条待整改意见是否都已经明确写清要修 Data PRD、Prompt PRD 还是工程前置过滤？",
        "导出的报告里是否明确写明本验收属于基于预制轨迹与固定评测集的模拟治理评审？",
      ],
      remediationRule: "严格执行 kb-m13-gov-trajectory-rubric，任何情况下禁止删除模拟评审边界声明。",
    },
    rubric: [
      {
        dimension: "轨迹隐患识别准确率",
        passCriteria: "能准确标出跨租户/低角色越权、过期文档召回、无引用编造与写操作未挂 HITL 四类风险。",
        evidence: "Lab 20 评审结果与 GOV_CAPSTONE_REVIEW.md 风险追踪表。",
        redFlag: "遗漏跨角色越权或将高危无审批写操作判为可直接上线。",
      },
      {
        dimension: "PRD 与工程工单闭环度",
        passCriteria: "为每条阻断项补齐可执行的 Data/Prompt PRD 修正条件，并向工程团队明确回归验收探针。",
        evidence: "审签单整改指令与 Go/Conditional/No-Go 判定理由。",
        redFlag: "只给出模糊感想（如“回答不够好”）而非可核对修复规格。",
      },
      {
        dimension: "模拟验证边界诚实度",
        passCriteria: "完整保留“本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。”声明。",
        evidence: "导出报告与 Capstone 自检勾选记录。",
        redFlag: "把模拟评审报告宣称为“已通过真实生产系统验收”。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "完成 Lab 20 全部 3 条预制轨迹审签并导出报告",
        goal: "在无代码评审台标出每条轨迹的高危点并输出正式审批判定与边界声明。",
        inputsAndLimits: "不允许忽略提示的 P0 越权告警强行选择 Go。",
        deliverable: "导出的模拟治理评审 Markdown 报告。",
        verifyMethod: "全部预置风险命中且报告含完整边界声明。",
        kbContribution: "补录一条常见跨职能沟通易漏掉的风险检查项。",
        offlineFallback: "Lab 20 原生支持纯离线导出。",
        humanReviewGate: "自己对照标准解析逐条复查判定理由。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "提交一份可直接立项审签的 GOV_CAPSTONE_REVIEW.md 治理包",
        goal: "联合自己 M11 产出的 Data/Prompt PRD 与 Lab 20 轨迹评审结论，形成完整的产品与治理 Capstone 交付。",
        inputsAndLimits: "须写清转交 M12/M13-Eng 研发补测的前提列表。",
        deliverable: "GOV_CAPSTONE_REVIEW.md + 修订后双 PRD 关键页。",
        verifyMethod: "与 1 位技术同学走查，确认其可直接据此写出对应自动化探针测试。",
        kbContribution: "依据审查反馈更新团队 kb-m13-gov-trajectory-rubric。",
        offlineFallback: "在工作台 Markdown 笔记与 Lab 20 中完成完整组装导出。",
        humanReviewGate: "产品、安全/风控两方观点互相质询确认无漏项。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "在产品团队建立 AI 功能上线前“模拟轨迹预审”制度",
        goal: "把本套无代码审计表接入公司新 AI 功能的开发前/测试中产品验收模板。",
        inputsAndLimits: "仅用于产品规格与治理预审，仍需搭配研发端真实 Eval 测试后才可放行生产。",
        deliverable: "团队级《AI 功能上线前产品治理预审单》模板 + 1 次真实需求试审记录。",
        verifyMethod: "试审成功提前拦截出至少 1 处之前需求未定义的权限或人工确认盲区。",
        kbContribution: "回流新增高频误判类别至团队治理知识库。",
        offlineFallback: "组织 PM 团队桌面演练对内部拟上线 AI 方案做模拟评审。",
        humanReviewGate: "业务与研发双负责人签字确立联合上线准入门禁。",
      },
    ],
  },

  "m13-eng": {
    moduleId: "m13-eng",
    moduleCode: "M13-Eng",
    coreQuestion: "如何交付并客观验收一个绑定真实 ACL 过滤、Tombstone 淘汰、预算熔断与五类 Coding Harness 护栏的生产级 Agent 系统？",
    deliveryModes: [
      {
        mode: "double-period",
        label: "双课时 (90m)",
        duration: "90 分钟",
        focusPlan: "工程 Capstone 验收全图景 + 双层 Eval 实战拆分（KB 检索层 vs 端到端轨迹）+ Harness 五要素回顾 + 综合答辩指导。",
      },
      {
        mode: "short-lecture",
        label: "短讲座 (50m)",
        duration: "50 分钟",
        focusPlan: "精讲为什么工程 Capstone 禁止“只演 3 条对话 Demo”，必须提供零越权/零过期探针与可重复命令行退出码。",
      },
      {
        mode: "workshop",
        label: "工作坊 (60m)",
        duration: "60 分钟",
        focusPlan: "在工作坊组装 ENG_CAPSTONE_DELIVERY.md 验收清单，现场跑通检索指标、越权探针与熔断断言测试。",
      },
      {
        mode: "seminar",
        label: "研讨复盘 (30m)",
        duration: "30 分钟",
        focusPlan: "评审典型的工程失败模式：测试作弊凑高 Eval 分、单层聚合指标掩盖检索故障、长期维护缺 Harness 退化。",
      },
      {
        mode: "self-paced",
        label: "自主学习",
        duration: "60 分钟",
        focusPlan: "完成 M13-Eng 综合单元与双层 Eval 交付清单 + 4 道最终工程校验测验。",
      },
    ],
    trimAndMergeNote: "如为单人独立开发者 Capstone，可精简多成员 Worktree 并行调度演练，但双层 Eval、零越权/过期探针与预算熔断验证一项不可删减。",
    traditionalVsAi: {
      rows: [
        {
          dimension: "上线验证依据",
          traditionalWay: "依赖人工 QA 点界面与接口集成测试套件全绿。",
          aiCodingWay: "Agent 存在非确定性输出与越权风险，必须拆出 KB 检索指标（Recall@K/零越权/零过期）+ 端到端轨迹评测双层自动化门禁。",
        },
        {
          dimension: "交付物形态",
          traditionalWay: "交付跑通的源码仓库和部署脚本。",
          aiCodingWay: "除了可运行 Agent 与运行时 KB 代码，还必须同库交付五类 Coding Harness 护栏（AGENTS.md/globs/.mdc/init.sh/feature_list）确保后续迭代不退化。",
        },
        {
          dimension: "故障排查精度",
          traditionalWay: "看服务端栈轨迹立刻定位函数。",
          aiCodingWay: "若不拆开检索评测与推理评测，根本分不清答错是因为没检索对原文还是推理忽略了引用。",
        },
      ],
      bottleneckShift: "工程 Capstone 最大失误往往是“Demo 能正常聊几句就以为做完了，实际上既没测跨租户越权也没有长期回归评测基线”。",
      nonDelegableCases: [
        "Golden Dataset 与越权/过期红队测试集的人工核定（禁止模型用弱断言自欺欺人）",
        "生产密钥零前端泄露与写操作审批机制的最终安全签署",
      ],
    },
    humanAiSplit: {
      humanMustDecide: [
        "双层 Eval 及格线（0% 越权、0% 过期召回、Recall@K / 引用准确率 / 步数熔断基线）",
        "对抗性测试用例集与生产边界检查项（不可由 AI 自行删除失败用例）",
        "项目级五类 Coding Harness 的最终锁定",
      ],
      aiCanDraft: [
        "按测试规格批量生成模拟租户与文档切片测试固件",
        "编写自动汇总双层 Eval 分数报告的命令行脚本",
      ],
      collaborativeLoop: "人锁定双层评测基线与对抗测试集 -> 在 Harness 护栏下用 Coding Agent 完善系统 -> 执行客观退出码回归 -> 人签发工程交付包。",
    },
    instructorDemo: {
      prepAndEnv: "准备完整的运行时 KB + Agent 工程代码库、双层 Eval 校验脚本与 kb-m13-eng-dual-eval-suite 清单。",
      targetOutcome: "演示如何用一条命令行同时跑通检索指标、越权探针、Tombstone 验证与预算熔断，定位一次隐蔽的检索退化。",
      steps: [
        {
          phase: "Step 1 · 拆解混合指标假象",
          action: "展示一个“总端到端通过率 70%”的笼统分数，随后运行拆分后的检索侧与端到端侧双层脚本。",
          aiBehaviorOrEvidence: "双层报表立即暴露“端到端失败全是由于新上传 PDF 切片把核心公式拆断导致 Recall@3 跌至 0.45”。",
          humanControl: "讲师指出若不拆双层指标，工程师往往会错误去乱改 System Prompt 而白费力气。",
        },
        {
          phase: "Step 2 · 运行对抗性红队回归探针",
          action: "执行越权探针（跨 tenant / 低角色）与历史过期条款（deprecated）验证脚本。",
          aiBehaviorOrEvidence: "越权召回 0%、过期误召回 0%，超时工具触发 maxSteps 确定性熔断。",
          humanControl: "讲师审查 tests/ 目录 diff 确保无 `.skip` 或篡改预期值的作弊痕迹。",
        },
        {
          phase: "Step 3 · 验收集成仓库的五类 Coding Harness",
          action: "核对仓库中的 AGENTS.md、.mdc globs、init.sh、feature_list.json 与回归验证命令清单。",
          aiBehaviorOrEvidence: "完整项目具备可持续演进能力，新接入的 Coding Agent 可直接沿用护栏不破坏核心防线。",
          humanControl: "讲师总结双轨 Capstone（M13-Gov 与 M13-Eng）如何共同支撑组织落地可信 Agent 系统。",
        },
      ],
      stuckStudentPrompts: [
        "提示卡：永远把 `ACL 越权率 = 0%` 和 `过期召回率 = 0%` 设为不可商量的自动化断言硬门禁！",
        "提示卡：测试跑不过时，不准改弱 Eval 标准，要顺着“检索问题 vs 推理问题 vs 工具循环控制问题”三层逐一修根因。",
      ],
      noKeyOfflineFallback: "可通过本地内存运行时知识库、确定性工具状态机与 node:test/Vitest 离线执行全套双层 Eval 回归，无外部付费 API Key 亦可满分交付。",
      acceptableAlternatives: [
        "在不调用实时 LLM API 的纯本地离线环境，可以使用确定性 Mock LLM 响应器与真实内存检索器完整测试检索侧 Recall@K、ACL 隔离、引用绑定与步数熔断控制流。",
      ],
    },
    exerciseVariants: {
      minimalClassroom: "基于 M12 骨架补充完整双层 Eval 验证清单，并跑通 1 组检索侧 + 1 组熔断侧自动化测试。",
      advancedChallenge: "构建完整可运行的行业垂直 Agent 系统（如校园会议系统 / 合规问答助手），交付零越权报告与完整五类 Harness Runbook。",
      pairOrTeamMode: "双人分工：一人主攻运行时 KB 索引与双层 Eval 套件，一人主攻 Agent 状态机、HITL 门禁与仓库 Coding Harness 装配，通过 PR 互审合并。",
      randomizedSeedNote: "Capstone 选题可选：校园会议协同系统 / 哲学文献精准溯源检索 / 企业内部合规助手。",
      offlineSafeFallback: "在本地环境运行完整 TypeScript 检索与控制流测试集，提交命令行退出码 0 证据。",
      nonDelegableCheckpoints: [
        "严禁删改 Eval 测试用例凑通过（Anti-Reward-Hacking）",
        "所有外部凭证与数据库隔离必须在服务端强制执行",
      ],
    },
    failureModesDeepDive: {
      classicError: "只挑 5 个管理员正向示例对话通过即宣称工程 Capstone 完工，上线第一天就被普通用户问出内部敏感条款。",
      looksRightButWrong: "总分报告好看，但偷偷把越权测试断言改成宽松匹配，或未测试工具失败重试上限。",
      contextOrToolFailure: "交付了 Agent 源码却没留下任何 AGENTS.md / 测试门禁，两周后后续修改直接搞崩原有的 ACL 过滤。",
      triageQuestions: [
        "我的仓库里有一条独立命令能一键检验 ACL 零越权、Tombstone 生效、预算熔断和类型检查吗？",
        "如果明天再加一个新工具或新文档来源，现有的双层 Eval 和 Coding Harness 能在合并前拦住退化吗？",
      ],
      remediationRule: "严格遵守 kb-m13-eng-dual-eval-suite 与 kb-m8-long-horizon-harness 交付规范。",
    },
    rubric: [
      {
        dimension: "运行时系统与安全底线完备度",
        passCriteria: "交付带真实服务端 ACL Pre-filter、Tombstone 淘汰、引用锚点与预算熔断的可运行服务与测试。",
        evidence: "源码仓库、测试代码及命令行全绿运行证据。",
        redFlag: "仅在前端硬编码 mock 对话或靠 Prompt 约束权限。",
      },
      {
        dimension: "双层 Eval 客观验收证明",
        passCriteria: "分别报告检索侧（0 越权、0 过期、Recall@K）与端到端侧（工具准确率、忠实度、熔断测试）指标。",
        evidence: "ENG_CAPSTONE_DELIVERY.md 双层 Eval 评测表与无篡改测试输出。",
        redFlag: "只有几张正向对话截图而无对抗测试与回归数据。",
      },
      {
        dimension: "长期演进 Coding Harness 沉淀",
        passCriteria: "项目保留精简 AGENTS.md、作用域 .mdc、初始化自检与可重复 CI/本地验证门禁命令。",
        evidence: "仓库 Harness 配置文件清单与 Runbook。",
        redFlag: "为赶工期临时删掉规则、类型校验或跳过测试。",
      },
    ],
    homeworkTiers: [
      {
        tier: "quick-30m",
        label: "30 分钟快速验证",
        title: "核对 Capstone 上线前双层 Eval 差距清单",
        goal: "对照 kb-m13-eng-dual-eval-suite 为当前工程补齐缺失的越权、过期与熔断用例列表。",
        inputsAndLimits: "每项差距必须对应具体待写测试文件名与期望退出码。",
        deliverable: "双层 Eval 差距核查单。",
        verifyMethod: "同组研发一眼能确认测试覆盖无明显安全/时效盲区。",
        kbContribution: "补录项目特定领域的容易漏测边界样例。",
        offlineFallback: "基于 Lab 18 & Lab 19 与 docs/knowledge-base/runtime-domain-kb.md 核对生成差距表。",
        humanReviewGate: "研发负责人复核未放过任何 P0 级别安全探测缺口。",
      },
      {
        tier: "module-hours",
        label: "数小时模块作业",
        title: "完成并验证单项目版 ENG_CAPSTONE_DELIVERY.md 工程交付",
        goal: "独立完成带内存或本地存储的运行时 KB + Agent 服务、双层 Eval 套件与仓库五类 Harness 配置。",
        inputsAndLimits: "严禁硬编码真实密钥，严禁以修改测试预期凑通过。",
        deliverable: "可运行服务 + 测试套件全绿输出 + ENG_CAPSTONE_DELIVERY.md。",
        verifyMethod: "执行 npx tsc --noEmit && npm test（含 0 越权/0 过期/熔断断言）全部退出码 0。",
        kbContribution: "将通用双层 Eval 脚手架回写进个人或团队工程知识库。",
        offlineFallback: "使用本地离线测试固件 + 确定性检索验证器跑通全套验收脚本。",
        humanReviewGate: "本人签署 Anti-Reward-Hacking 核查与安全边界确认。",
      },
      {
        tier: "team-days",
        label: "多日团队级任务",
        title: "团队协同交付生产级 Agent 应用并接入 CI 双层回归门禁",
        goal: "通过 Worktree / PR 分工协作，实现端到端业务 Agent 应用并在 CI 自动跑通双层 Eval 与密钥扫雷。",
        inputsAndLimits: "PR 合入必须经过独立上下文审查与自动化测试通过。",
        deliverable: "完整生产应用 PR + CI Eval 报告 + 团队维护 Runbook。",
        verifyMethod: "连续 3 次模拟文档/规则增量更新后，CI 全量门禁稳定 100% 拦截回退且正向回归绿灯。",
        kbContribution: "正式升级团队知识库工程条目与运行时条目版本号。",
        offlineFallback: "在本地 Git Worktree 与 CI 模拟脚本环境中全流程跑通验收。",
        humanReviewGate: "技术负责人与产品治理负责人（M13-Gov）联合签收上线。",
      },
    ],
  },
};

export function getModuleTeachingPackage(moduleIdOrCode: string): ModuleTeachingPackage | undefined {
  const key = moduleIdOrCode.trim().toLowerCase();
  return MODULE_TEACHING_PACKAGES[key];
}
