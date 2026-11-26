import type { DesignPatternModuleId } from "../../data/designPatternPilots.ts";

export interface InstructorLessonPhase {
  phaseIndex: string;
  title: string;
  durationMinutes: number;
  goal: string;
  instructorAction: string;
  liveRepoCue: string;
  facilitationPrompt: string;
}

export interface InstructorPatternPilotScript {
  moduleId: DesignPatternModuleId;
  pairTitle: string;
  lessonTitle: string;
  totalMinutes: 90;
  preClassMaterialsNote: string;
  phases: InstructorLessonPhase[];
  overAbstractionRedFlags: string[];
  oralDefenseQuestions: string[];
}

const ARCH_FULLSTACK_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "在写代码前锁定目录权限与不变量：前端不裁决付费/角色真相，服务端守住 401/403 与幂等。",
    instructorAction:
      "投屏打开真实仓库 `specs/SPEC.md` 与目录结构（不翻 PPT 讲定义），当场写下 3 条验收标准：未登录拒 401、越权 IDOR 拒 403、重放回调不双倍入账。",
    liveRepoCue: "展示 `src/components/` 与 `src/server/` 两个目录边界及 `.cursorrules` 禁改清单。",
    facilitationPrompt:
      "提问学员：如果把整个前端页面删掉，只留 API 和数据库，哪些安全规则必须依然成立？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "演示不加边界约束时 AI 产出“看似可点但实质混层越权”的第一版代码，真实踩坑而非只放成功录像。",
    instructorAction:
      "故意用宽泛指令让 AI 写升级按钮和 `/api/account/upgrade`，运行页面看似顺利解锁；随后用一条 `curl` 直接传 `userId=99&isPaid=true` 当场击穿。",
    liveRepoCue: "终端执行越权 curl 并对比浏览器 Network 状态码，暴露前端传真相的缺陷。",
    facilitationPrompt:
      "追问全班：界面没有报红字、按钮也能跳转，为什么这版代码绝对不能合并上线？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "带学员区分问题源自“需求遗漏”“上下文污染”还是“模块边界与依赖耦合”。",
    instructorAction:
      "逐行读第一版的 `git diff`，指出 UI/API 混层和第三方回调直接散落路由这两处坏味道，对照「分层边界」与「Facade 门面」模式卡判断是否需要引入抽象。",
    liveRepoCue: "打开模式卡对照“最简单实现 vs 模式方案”，刻意排除微服务/抽象工厂诱饵。",
    facilitationPrompt:
      "引导判断：此时我们需要一个薄门面模块隔离验签和幂等，那需要上 AbstractFactory 或拆成微服务吗？为什么？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员亲手修订规则与边界测试，再约束 AI 用轻量分层+Facade 收口并跑通验证。",
    instructorAction:
      "巡场检查学员是否在动手改代码前先写好反例测试与允许修改白名单；对直接贴一整套企业设计模式框架的学员现场叫停做减法。",
    liveRepoCue: "要求学员运行 `npx tsc --noEmit` 与越权/重放两条测试，退出码必须为 0。",
    facilitationPrompt:
      "卡住提示：别让 AI 顺手建 5 个接口文件，先问自己“现在是不是只有 1 个供应商、1 条入口路径？”",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "通过同行 Diff 对比与口头答辩，让学员说清模式取舍与“何时不该用”。",
    instructorAction:
      "挑出 2 份不同实现（一份克制的单门面模块 + 一份堆砌了多余 Factory/Repository 的实现）并排对比可读性与改动文件数，当场完成四维 Rubric 签核。",
    liveRepoCue: "学员提交包含 Diff 摘要、测试输出与「为何没有过度抽象」说明的交付卡。",
    facilitationPrompt:
      "收尾提问：将来业务增长到什么明确阈值时，你才会把今天的单门面升级为 Strategy 注册表？",
  },
];

const RULES_MCP_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "锁定多模型/多 MCP 工具接入时的统一内部契约（Ports）与默认最小权限策略（Policy）。",
    instructorAction:
      "投屏打开真实仓库 `src/tools/` 与 `rules/mcp-security.mdc`，写明 3 条底线：业务代码禁止直接解析厂商 SDK 原生 JSON、工具调用必须经单一策略网关、未注册工具名直接拒批。",
    liveRepoCue: "展示业务主链路被硬编码模型响应格式与 `shell.exec` 污染的起始分支。",
    facilitationPrompt:
      "提问学员：如果明天把主模型从提供商 A 切到提供商 B，业务层应该改几个文件？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "暴露 AI 直接在业务路由堆 `if (provider === ...)` 且让 MCP 工具自带放行开关的漏洞。",
    instructorAction:
      "用“快速接通两个模型和文件/命令工具”作为初始提示，让 AI 现场生成散落分支；随后构造一条 `provider=b` 且触发越权工具参数的请求，展示响应结构错乱与权限绕过。",
    liveRepoCue: "执行工具调用回归测试，暴露跨层泄露厂商报错对象及动态加载未知工具的风险。",
    facilitationPrompt:
      "追问全班：即使 Prompt 里写了“遵循 Adapter 模式”，为什么这段代码依然在策略上失守？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "拆解厂商差异泄漏、条件分支蔓延与工具权限边界散落 3 类坏味道，收敛最小 Ports + Adapter + Policy 组合。",
    instructorAction:
      "逐行读 `git diff`，对照 M4 模式卡验证：为何只需 1 个 `ModelPort` 接口、2 个适配器与 1 个静态权限映射表，而不是整套运行时热插拔 PluginRegistry。",
    liveRepoCue: "在故障演练台对比“继续写三层 if/else”“引入动态扫描插件框架”与“Port+Adapter+静态策略表”。",
    facilitationPrompt:
      "引导判断：现在明确只有 2 家内部模型提供商和 3 个白名单工具，动态扫目录注册为什么反而危险？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员收紧 `.cursorrules` 禁止业务路由直引厂商 SDK，先补厂商切换契约测试和越权工具拦截测试再让 AI 重构。",
    instructorAction:
      "巡场核查每位学员是否在 `tests/` 中锁死“禁止新增未登记工具名”断言；提醒把超时、配额与工具白名单收进单一 Policy 函数。",
    liveRepoCue: "运行契约切换测试与高危工具拦截单测，确保全部绿灯且无外部 SDK 类型泄露到 UI。",
    facilitationPrompt:
      "卡住提示：先写好 `ModelPort` 的 10 行 TypeScript 类型返回体，再让 AI 分别套上两个 Adapter。",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "通过 Diff 互评确认“隔离真实变化轴（多供应商）而不把静态白名单做复杂”的工程纪律。",
    instructorAction:
      "抽查两份学员 PR，对比“Ports+静态 Record 映射”与“自带依赖注入容器的 PluginBus”的可审计性，完成口头答辩和 Rubric 签核。",
    liveRepoCue: "核对交付物中的工具白名单静态表、Adapter 测试输出与反过度设计说明。",
    facilitationPrompt:
      "收尾提问：将来什么情况下你才需要把静态策略映射升级为独立策略引擎？",
  },
];

const DOD_HARNESS_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "锁定任务生命周期、重试上限（<= 3）以及 `tests/` 测试断言在修 Bug 期间只读的铁律。",
    instructorAction:
      "展示一段既有业务单元测试和 Harness 状态契约，当场声明本节课验收不看“页面有没有绿灯”，而看 `tests/` 是否零擅改且超限必熔断。",
    liveRepoCue: "展示 `feature_list.json` 与 `rules/` 中的测试只读约束。",
    facilitationPrompt:
      "提问学员：如果让 AI 一遍遍自动修复直到全绿，你最担心它偷改哪个目录？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "复现 AI 在无上限自愈压力下如何从“修源码”滑向“改弱断言/加 skip”制造假绿灯。",
    instructorAction:
      "运行一个带故意逻辑故障的任务而不加重试上限与测试 Diff 校验，展示 AI 连错 2 轮后把核心断言改弱甚至加 `try/catch` 吞错并汇报“全部通过”。",
    liveRepoCue: "执行 `git diff tests/` 抓包作弊现场，并模拟会话中断后无交接锚点导致旧规则失效。",
    facilitationPrompt:
      "追问全班：测试命令明明退出码是 0，为什么这反而比直接报错更危险？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "定位无界循环、测试防线失守与无检查点状态漂移 3 类坏味道，选出最小模式组合。",
    instructorAction:
      "对照模式卡拆解「显式状态机 + 有限重试熔断 + ACC 检查点交接」，明确对比为何局部 4 态枚举表优于引入重型 XState 或分布式 Saga。",
    liveRepoCue: "在故障演练台比对“加到 20 轮重试”、“上 Saga 中间件”与“3 轮熔断+检查点”三组断言结果。",
    facilitationPrompt:
      "引导讨论：审计日志只有 1 个落盘接收方时，上全局事件总线会带来什么调试代价？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员配置显式状态迁移表、3 轮同错早停守卫与 <= 15 行 ACC 交接卡，验证能拦截作弊与正确停机。",
    instructorAction:
      "督促学员先写“故意传入非法状态跃迁与 `.skip` 补丁必然失败”的反向测试，再让 AI 补充状态机实现；新开干净窗口验证 ACC 交接续跑。",
    liveRepoCue: "查看测试命令日志确认 `circuit_broken` 触发与非法跃迁抛错均已实测。",
    facilitationPrompt:
      "卡住提示：把报错签名（error signature）记下来，连续两次报错相同就立刻停，不要指望第 3 次奇迹。",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "互查交接卡信息密度与模式克制程度，完成证据归档。",
    instructorAction:
      "让两位学员交换各自导出的 ACC 检查点交接卡，测试对方只看这 15 行文件能否接手不改歪禁区目录；点评是否存在不必要的状态机框架或空转发层。",
    liveRepoCue: "按四维 Rubric 抽查学员交付物并记录复盘评语。",
    facilitationPrompt:
      "收尾提问：你的自愈循环今天为什么用纯函数+枚举表就停手了，而不是封装一个通用的多插件重试引擎？",
  },
];

const AGENT_PRODUCT_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "划清“确定性 Workflow”与“受控 Agent 路由”的边界，并锁定高风险写操作必须经过人工审批（HITL）。",
    instructorAction:
      "打开 `general-agent-orchestrator-lab` 起始仓库，对比两类需求（固定格式退款工单 vs 多来源线索归因），明确 3 项硬验收：结构化路由不失控、Worker 步数 <= 3 熔断、任何外部写操作须生成 `pending_human_approval`。",
    liveRepoCue: "展示 `specs/SPEC.md` 中的成本预算上限与禁止自主执行外部副作用清单。",
    facilitationPrompt:
      "提问学员：一个输入输出完全固定的审批/报表流程，硬塞进自主 ReAct Agent 会多出哪些成本和事故面？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "复现 AI 默认把所有请求丢进无限制自由循环 ReAct Agent 且直接执行外部写操作导致的成本失控与事故。",
    instructorAction:
      "现场用宽泛指令让 AI 写一个“全自动任务助手”，输入一条模糊或包含“批量发送/修改权限”的请求，展示它连续循环调工具、无法收敛并直接触发写动作日志。",
    liveRepoCue: "在 Eval 控制台运行 `general-agent-workflow-eval-v1`，展示 `loopCircuitBreakRate` 与写操作门禁失败现场。",
    facilitationPrompt:
      "追问全班：即使给系统提示词加上“请谨慎操作，最多思考 3 步”，为什么不能用来替代代码级熔断与审批停顿状态？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "诊断过度代理化（Over-Agentification）、Worker 上下文膨胀与缺少人类中断点 3 类坏味道。",
    instructorAction:
      "逐行分析轨迹与 Diff，对照 M11 模式卡说明「确定性前置 Routing + 有限步 Orchestrator-Worker + HITL 暂停确认」的适用条件，排除去中心化多 Agent 辩论群诱饵。",
    liveRepoCue: "演示如何将已知确定分支从 Agent 摘回纯函数 Workflow，仅在模糊检索分类处保留 Worker。",
    facilitationPrompt:
      "引导判断：这里加 5 个彼此自由对话的 Reviewer/Planner Agent 群聊，对延迟、成本和可调试性意味着什么？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员定义前置 Router 枚举、Worker `maxSteps <= 3` 熔断器与 HITL 审批票据，跑通确定性与 Agent 双轨测试。",
    instructorAction:
      "巡场检查学员是否为“确定性分支”和“越权写操作拦截”分别编写了断言，防止 AI 在重构时悄悄把审批回调默认设为 `autoApprove: true`。",
    liveRepoCue: "重跑 `general-agent-workflow-eval-v1`，验证 `loopCircuitBreakRate = 100%` 且写操作全部停留在审批前。",
    facilitationPrompt:
      "卡住提示：先把写操作收敛成一个返回 `ApprovalDraft` 对象的纯函数，不传任何真实写入句柄给 Worker。",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "对比“纯确定性分支 + 单 Orchestrator”与“多 Agent 自由网格”，强化反过度 Agent 化原则。",
    instructorAction:
      "投屏对比两份方案的步数、Token 消耗与 Trace 可读性，听取学员阐述为何 80% 路径无需 Agent 参与，完成 Rubric 签核。",
    liveRepoCue: "归档包含路由决策矩阵、Eval 报告与人工审批边界说明的交付卡。",
    facilitationPrompt:
      "收尾提问：你的系统里哪一部分未来即使业务量翻 10 倍，也依然应该锁死为普通确定性函数而非 Agent？",
  },
];

const RUNTIME_KB_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "确立运行时知识检索的两条红线：ACL 权限与失效状态（Tombstone/Deprecation）必须在进向量/上下文之前过滤；检索步骤拆分为单一职责 Pipeline。",
    instructorAction:
      "展示混合着跨租户文档、已废弃规范与当前有效手册的语料仓，写死 3 条验收测试：`aclLeakCount === 0`、`staleRecallCount === 0`、无证据命中时拒答并给出可查来源空集。",
    liveRepoCue: "打开 `runtime-kb-acl-eval-v1` 失败基线样本与租户隔离 Spec。",
    facilitationPrompt:
      "提问学员：如果先把包含机密文档的 Top-K chunk 塞进模型上下文，再加一句“请勿泄露无权限内容”，漏洞在哪里？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "复现典型的“先全局检索再后置过滤/让 LLM 自行判断权限”与“索引/检索逻辑拧成巨型函数”事故。",
    instructorAction:
      "让 AI 快速写一个 RAG 问答函数，随后用租户 A 账号发起检索并故意注入旧版冲突规则词，当场演示机密段落或 Tombstone 失效文档泄露进引用与上下文窗口。",
    liveRepoCue: "运行 `runtime-kb-acl-eval-v1` 打印 `aclLeakCount > 0` 与 `staleRecallCount > 0` 轨迹。",
    facilitationPrompt:
      "追问全班：报错日志里根本没有异常抛错，而且回答看起来很流利，我们为什么必须把这次运行判为高危失败？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "定位后置鉴权越权、失效文档未剔除与检索链路职责耦合 3 类坏味道，收敛为前置 ACL Filter + 线性 3 步 Pipeline。",
    instructorAction:
      "对照 M12 模式卡，展示「Query Normalize → Pre-Retrieval ACL & Tombstone Filter → Rank & Grounded Format」3 步固定流水线，明确对比为何此处不需要动态热插拔多级责任链。",
    liveRepoCue: "比对“事后正则脱敏”“9 层动态责任链框架”与“3 段顺序函数 Pipeline + 强前置过滤”。",
    facilitationPrompt:
      "引导讨论：这 3 个阶段顺序固定且强依赖前置拦截，为什么硬拆成可任意重排的责任链反而可能埋下安全回退隐患？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员在检索函数入口强校验 `viewerContext.tenantId` 与 `status === 'active'`，重写线性 Pipeline 并跑通 ACL/失效零泄漏评测。",
    instructorAction:
      "巡场检查学员的单元测试是否直接验证“在调用相关性打分与上下文组装之前，无权限文档已被剔除”，防止 AI 把过滤偷偷塞回尾部格式化阶段。",
    liveRepoCue: "跑通 `runtime-kb-acl-eval-v1`，要求 `aclLeakCount === 0` 且 `staleRecallCount === 0`。",
    facilitationPrompt:
      "卡住提示：把候选文档过滤写成检索打分函数的唯一入参类型，让未经 `filterAccessibleActiveDocs()` 处理的数组在类型层面就无法进入排序。",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "互审检索阶段链路透明度与证据可追溯性，确保每一处过滤点都经由测试证实。",
    instructorAction:
      "对比两份实现（3 步直白 Pipeline vs 过度抽象的通用事件流过滤器），核查交付记录中的拒绝过度设计理由与真实 Eval 指标快照。",
    liveRepoCue: "归档检索 Pipeline 架构图、ACL 零泄露 Eval 报告与复盘证据。",
    facilitationPrompt:
      "收尾提问：当未来多出一套跨部门合规脱敏规则时，你的 Pipeline 在哪一固定环节加 1 个纯函数就能覆盖而不打乱前置 ACL？",
  },
];

const CAPSTONE_ADR_PHASES: InstructorLessonPhase[] = [
  {
    phaseIndex: "01",
    title: "明确任务、Spec 与验收标准",
    durationMinutes: 10,
    goal: "锁定 Capstone 交付物不是“能点开的 Demo”，而是完整可追溯证据链：Spec + 受控模式取舍 ADR + 测试/Eval 证明 + 已知限制清单。",
    instructorAction:
      "打开 Stage 3 可追溯证据链检查面板，宣布 Capstone 答辩的 4 条一票否决项：无法说明备选方案、存在未验证过度声明、缺失可复现命令日志、把模拟结果伪装成真实执行。",
    liveRepoCue: "展示 `ADR-template.md` 与 `geo-evidence-eval-v1` / `general-agent-workflow-eval-v1` 双轨门禁。",
    facilitationPrompt:
      "提问学员：如果 3 个月后有另一位工程师接手你的 Capstone 仓库，哪份文档最能阻止他走你踩过的老路？",
  },
  {
    phaseIndex: "02",
    title: "AI 协作实现第一版并故意暴露缺陷",
    durationMinutes: 20,
    goal: "复现 AI 在收尾阶段常见两大陷阱：要么堆满“未来扩展用”的空抽象目录，要么在 ADR 里用宏大术语掩盖测试缺口与真实限制。",
    instructorAction:
      "演示让 AI 为 Capstone 生成一份“企业级架构总结”——满篇写着事件驱动微服务与多级抽象，再对照真实 Diff 指出其中 40% 接口只有一个实现且关键越权/回滚限制只字未提。",
    liveRepoCue: "运行静态门禁与证据完整度核验，暴露“装饰性 ADR + 未落地隔离边界”问题。",
    facilitationPrompt:
      "追问全班：为什么隐瞒系统已知限制（Known Limitations）和把空抽象当亮点，在真实项目交接中是致命伤？",
  },
  {
    phaseIndex: "03",
    title: "共同查看报错、Diff 与坏味道诊断",
    durationMinutes: 20,
    goal: "审计“投机性泛化（Speculative Generality）”“证据断链”与“验证模式混淆”3 类 Capstone 级坏味道。",
    instructorAction:
      "对照 M13 模式卡，演示如何逐条对当前仓库做“删减冗余抽象审计”以及如何用诚实四步结构（背景、备选方案对比、采纳决策与边界、已知限制与回滚开关）重写 ADR。",
    liveRepoCue: "在故障演练台逐项核对 6 环节证据追溯链与反过度设计删除清单。",
    facilitationPrompt:
      "引导讨论：如何在工程评审中清晰标注“当前仅经过静态/模拟评测，真实自动执行须等待隔离 Runner”而不虚报成熟度？",
  },
  {
    phaseIndex: "04",
    title: "学员修订 Spec / Rules / 测试并让 AI 改造验证",
    durationMinutes: 25,
    goal: "学员删减当前只有 1 个调用方的多余抽象层，补齐端到端测试命令日志、Eval 链接与诚实的已知限制声明。",
    instructorAction:
      "一对一巡场挑战每位学员的设计选择：要求现场指出“你今天删掉了 AI 写的哪层多余封装”，并确认每条保留下来的模式都能指向真实测试或 Eval 依据。",
    liveRepoCue: "确保静态门禁、关联 Eval 与 6 环节证据追溯评分均达到可提交标准。",
    facilitationPrompt:
      "卡住提示：写已知限制时别怕暴露缺口，写清“当前不做什么、哪些依赖人类审批兜底”才是真正专业。",
  },
  {
    phaseIndex: "05",
    title: "方案对比、模式必要性与反过度抽象复盘",
    durationMinutes: 15,
    goal: "模拟正式架构评审会与项目交接答辩，完成整门《AI 时代的软件设计模式与架构边界实战》收官验收。",
    instructorAction:
      "邀请 2 位学员（工程向与治理向各 1 位）演示 5 分钟结构化 ADR 答辩，由同学扮演接手者挑战其边界假设与回滚步骤，当场给出总评签核。",
    liveRepoCue: "提交最终 Capstone 证据包并锁定技能认证审阅队列。",
    facilitationPrompt:
      "收尾提问：学完这门主线后，你下次让 AI 写新功能前发出的第一句结构约束会是什么？",
  },
];

export const PRIVATE_PATTERN_PILOT_SCRIPTS: Record<
  DesignPatternModuleId,
  InstructorPatternPilotScript
> = {
  m9: {
    moduleId: "m9",
    pairTitle: "M9 / M3 · 架构边界、Facade 与垂直切片",
    lessonTitle: "90 分钟项目课带教脚本：全栈请求追踪、分层边界与反过度设计",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 与图示作为课前预习材料发给学员；课堂 90 分钟全程围绕真实全栈仓、Network/stderr 报错与 Diff 展开。",
    phases: ARCH_FULLSTACK_PHASES,
    overAbstractionRedFlags: [
      "只有 1 张核心业务表却提前写出 GenericBaseRepository<T> + UnitOfWork + FactoryProvider",
      "1~3 人原型阶段为追求“架构感”把单体接口拆成多进程微服务 + HTTP RPC 包装层",
      "在每个 React 按钮外都包一层毫无逻辑的 CustomHookAdapter 再套 ServiceLocator",
    ],
    oralDefenseQuestions: [
      "指着当前 PR 里的一处 Facade 或分层切分，如果删掉它会让哪类未来变更扩散到多少个文件？",
      "如果明天要把这套方案交接给只看过 README 的队友，他从报错走到数据库落库一共要跳几个文件？",
      "你今天特意拒绝了哪一种看似高级的抽象？为什么现在不需要它？",
    ],
  },
  m3: {
    moduleId: "m3",
    pairTitle: "M9 / M3 · 架构边界、Facade 与垂直切片",
    lessonTitle: "90 分钟项目课带教脚本：垂直切片信任边界、Facade 门面与越权攻防",
    totalMinutes: 90,
    preClassMaterialsNote:
      "课前让学员自阅安全红线与门面示意图；课堂重点用真实越权 curl 击穿 AI 初版并做收敛重构。",
    phases: ARCH_FULLSTACK_PHASES,
    overAbstractionRedFlags: [
      "只有一个模拟支付通道却提前设计 AbstractStrategyRegistry 与插件动态加载器",
      "把简单 Zod 输入校验包成多层 ValidatorChainOfResponsibility 却漏掉最核心的 req.auth.userId 校验",
      "前端没有多端复用需求却抽离跨平台 UI Abstraction Layer 增加调试复杂度",
    ],
    oralDefenseQuestions: [
      "请直接用 1 条 curl 命令演示如何绕过你修改前的前端校验，以及修改后门面在哪一行拦截了它？",
      "为什么说在 Prompt 里写“遵循 SOLID 与 Facade 模式”不能替代真实的 401/403 与重放单测？",
      "假设未来新增第 2 家支付渠道，你现在的垂直切片需要改哪 1 个模块，是否会污染 UI 层？",
    ],
  },
  m4: {
    moduleId: "m4",
    pairTitle: "M4 · Rules / MCP 多提供方隔离与策略边界",
    lessonTitle: "90 分钟项目课带教脚本：Adapter、Ports、Policy 策略门控与最小静态 Registry",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 与图示仅作课前预习“Port/Adapter 对照表”；课堂 90 分钟在真实仓里现场切换模型提供方并击穿失控 MCP 工具调用。",
    phases: RULES_MCP_PHASES,
    overAbstractionRedFlags: [
      "只有 2 个固定内部模型却自建 AST 级动态规则脚本引擎与热加载扫描器",
      "业务层依然直接 import 第三方 SDK 类型，却在外部套了一层毫无隔离价值的空 Wrapper 类",
      "将所有 MCP 工具权限下放给大模型自由判断或通过环境变量开关一键全部放行",
    ],
    oralDefenseQuestions: [
      "请演示把主模型从 Provider A 切换到 Provider B 时，你的业务编排与前端层各自修改了多少行？",
      "如果模型突然请求调用一个未在白名单内的工具，Policy 网关会在调用链路哪一环直接阻断？",
      "你为什么选择静态映射表而非运行时动态扫描注册全部目录作为 Tool Registry？",
    ],
  },
  m5: {
    moduleId: "m5",
    pairTitle: "M5 / M6 / M8 · DoD 自愈、异步任务与长程 Harness",
    lessonTitle: "90 分钟项目课带教脚本：抓包测试作弊、有限重试熔断与反过度工程",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 仅作 Reward Hacking 术语预习；课堂 90 分钟现场让 AI 尝试改弱测试再亲手加守卫熔断。",
    phases: DOD_HARNESS_PHASES,
    overAbstractionRedFlags: [
      "为一个 20 行的重试循环编写支持动态热插拔插件与自定义 DSL 的 RetryFramework",
      "通过编写复杂 Mock Factory 把真实业务边界函数架空，以此宣称单测覆盖率 100%",
      "用 4 个分散的布尔值替代显式状态机，或反过来用重型状态机库替代 2 个分支的简单 if",
    ],
    oralDefenseQuestions: [
      "请展示你的 `git diff tests/`，证明这轮修复通过不是靠弱化断言或加 `.skip` 凑出来的。",
      "你的有限重试逻辑遇到连续两次相同失败签名时会怎样退出？下一步交给人类的诊断上下文包含什么？",
      "为什么这里只用原生枚举状态表而不引入通用状态机框架或消息队列？",
    ],
  },
  m6: {
    moduleId: "m6",
    pairTitle: "M5 / M6 / M8 · DoD 自愈、异步任务与长程 Harness",
    lessonTitle: "90 分钟项目课带教脚本：幂等重试契约、轻量事件解耦与异步恢复检查点",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 仅用于课前速览异步状态生命周期图示；课堂重点模拟任务中途断开与重放请求下的幂等恢复。",
    phases: DOD_HARNESS_PHASES,
    overAbstractionRedFlags: [
      "单进程内部仅 1 个日志消费者，却强制搭设分布式事件总线与死信队列基础设施",
      "异步队列任务不记录幂等键（idempotencyKey），重复投递时靠前端防抖假装解决并发重入",
      "在每个异步回调函数之间插入 3 层通用 EventTransformer 却丢失原始失败堆栈",
    ],
    oralDefenseQuestions: [
      "如果同一个作业请求被网络重试连续投递 3 次，你的状态机和幂等键如何保证副作用只发生 1 次？",
      "你今天把哪个模块解耦成了异步事件/回调，又把哪部分刻意保留为直调同步函数？依据是什么？",
      "当长任务执行到一半突然中断重启，恢复点从哪里读取上一步已经通过校验的中间结果？",
    ],
  },
  m8: {
    moduleId: "m8",
    pairTitle: "M5 / M6 / M8 · DoD 自愈、异步任务与长程 Harness",
    lessonTitle: "90 分钟项目课带教脚本：检查点状态交接、Worktree 隔离与长程自愈边界",
    totalMinutes: 90,
    preClassMaterialsNote:
      "课前预习五类 Harness 图谱；课堂全程围绕跨会话真实续跑、ACC 交接压缩与多 Worktree 边界评审。",
    phases: DOD_HARNESS_PHASES,
    overAbstractionRedFlags: [
      "把原本 1 个文件内的同步步骤拆成 4 个 Pub-Sub 异步事件，造成交接时无人能看懂执行顺序",
      "ACC 交接卡写了 200 行废话或套用长篇模板，关键的禁改目录与唯一验收命令反而被淹没",
      "为本地双人练习搭建分布式状态同步后台，而未先用干净 Git Worktree 目录隔离写权限",
    ],
    oralDefenseQuestions: [
      "现在立刻关掉这个 AI 会话重开，仅凭你提交的 ACC 检查点与 `feature_list.json`，新会话如何知道不能碰哪些文件？",
      "你在这个任务里是否引入了 Observer/Pub-Sub？如果引入了，它解耦的是哪两个不同变化方向的模块？",
      "如果某条检查命令突然报错且连续 2 轮未修复，Harness 怎样确保不会继续污染已经验收通过的旧切片？",
    ],
  },
  m11: {
    moduleId: "m11",
    pairTitle: "M11 · Agent 产品设计、路由决策与 HITL 审批门禁",
    lessonTitle: "90 分钟项目课带教脚本：Workflow 与 Agent 判定、Orchestrator-Worker 及人工审批停顿",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 仅在课前快速浏览确定性 Workflow 与 Agent 对比矩阵；课堂全程以 M11 通用 Agent 编排起始仓与 Eval 跑测为主。",
    phases: AGENT_PRODUCT_PHASES,
    overAbstractionRedFlags: [
      "可以用 1 个 switch 或确定性规则表单完成的分类流程，硬设计成 4 个互相辩论的自主 Multi-Agent 群聊",
      "用 Prompt 礼貌叮嘱代替代码级 `maxSteps <= 3` 熔断和人工审批停顿枚举",
      "Orchestrator 把整份 2 万字历史上下文原封不动转给每个轻量 Worker 导致成本与幻觉同步爆炸",
    ],
    oralDefenseQuestions: [
      "请指明你的架构中哪几条输入路径走了确定性 Workflow，哪条路径必须交给 Worker 探索，边界如何界定？",
      "如果下游 Worker 连续 2 次返回不合规格式或触及写操作，代码怎样强制切入 `pending_human_approval` 而不是自行重试绕过？",
      "为什么要拒绝在这阶段引入全自主 Swarm/多 Agent 共识框架？",
    ],
  },
  m12: {
    moduleId: "m12",
    pairTitle: "M12 · 运行时知识库、Pipeline 与 ACL 前置过滤",
    lessonTitle: "90 分钟项目课带教脚本：线性检索 Pipeline、ACL 前置过滤与失效语料 Tombstone 拦截",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 仅作前置过滤与后置过滤对照预习；课堂 90 分钟直接用跨租户注入测试击穿后置过滤 RAG 并重构 Pipeline。",
    phases: RUNTIME_KB_PHASES,
    overAbstractionRedFlags: [
      "先全库混合召回再把结果喂给大模型或尾部正则“去敏”，把安全防线寄托在 LLM 遵守系统提示词",
      "检索链路仅有 3 个固定步骤，却强行抽象出可运行时动态插入任意中间件的复杂责任链引擎",
      "只做语义相似度排序却忽略文档 `status`（deprecated/tombstone）和租户范围，导致过期规章混入答案",
    ],
    oralDefenseQuestions: [
      "请指出代码中哪一行保证了跨租户和已废弃文档在打分与拼装 Prompt 前就已经物理出局？",
      "若用户提问命中零条有效权限文档，系统会怎样降级拒答而非让模型自由补充常识？",
      "你的 3 步线性 Pipeline 比通用动态 Middleware 链有哪些明显的安全与排错优势？",
    ],
  },
  "m13-eng": {
    moduleId: "m13-eng",
    pairTitle: "M13 · Capstone 架构决策记录（ADR）、可追溯证据与反过度设计",
    lessonTitle: "90 分钟项目课带教脚本（工程轨）：端到端证据链审查、模式删减与 ADR 口头答辩",
    totalMinutes: 90,
    preClassMaterialsNote:
      "无新增幻灯片讲解；学员带着真实 Capstone 仓库、Eval 报告、ADR 决策卡与已知限制进入现场代码评审。",
    phases: CAPSTONE_ADR_PHASES,
    overAbstractionRedFlags: [
      "ADR 堆砌大量高阶架构术语，但仓库里只有 1 个调用方却拆出 5 层抽象接口与空转发服务",
      "将“静态材料检查/模拟评测通过”宣传为“已完成真实生产环境无隔离代码执行验证”",
      "刻意隐瞒系统已知限制（Known Limitations）、失败回滚步骤与人工兜底成本",
    ],
    oralDefenseQuestions: [
      "请现场展示你在收尾重构中删掉的一处 AI 自动生成的过度抽象，以及保留下来的那 1~2 个核心模式各自对应哪类真实变化？",
      "结合可追溯证据链，从 Spec 版本、静态审计、Eval 数据集到人工审阅，哪个环节一旦变更必须重新验收？",
      "在安全隔离 Runner 尚未接入前，你的 Capstone 如何划定代码验证与人工批准（human_approval）的职责边界？",
    ],
  },
  "m13-gov": {
    moduleId: "m13-gov",
    pairTitle: "M13 · Capstone 架构决策记录（ADR）、可追溯证据与反过度设计",
    lessonTitle: "90 分钟项目课带教脚本（产品与治理轨）：ADR 边界审阅、Workflow/Agent 取舍与风险签核",
    totalMinutes: 90,
    preClassMaterialsNote:
      "PPT 仅作 ADR 结构与风险矩阵速查；课堂围绕真实交付轨迹、Eval 指标异常定位与人工审批门禁评审展开。",
    phases: CAPSTONE_ADR_PHASES,
    overAbstractionRedFlags: [
      "治理规则只写“确保准确安全合规”等空话，没有落实为可测的禁用输出、步数上限与权限拦截指标",
      "不区分问题复杂度，一律要求产品流程采用自由度最高的自主 Agent 导致预算不可控且无法复现",
      "签核上线清单时未要求附上 Known Limitations、降级预案和人工复核响应 SLA",
    ],
    oralDefenseQuestions: [
      "面向产品需求评审时，你用哪 3 条直观标准快速判定应当优先采用确定性 Workflow 而非自主 Agent？",
      "当 Eval 报告中 `aclLeakCount = 0` 但 `refusalAccuracy` 偏低时，你如何定位问题并要求工程侧修改哪条边界？",
      "如果明天要把这套产品方案交由非团队成员审计上线，你写了哪几条明确的不可自动化人工签核条件？",
    ],
  },
};

export function getInstructorPatternScriptForModule(
  moduleId: string
): InstructorPatternPilotScript | null {
  if (Object.prototype.hasOwnProperty.call(PRIVATE_PATTERN_PILOT_SCRIPTS, moduleId)) {
    return PRIVATE_PATTERN_PILOT_SCRIPTS[moduleId as DesignPatternModuleId];
  }
  return null;
}

