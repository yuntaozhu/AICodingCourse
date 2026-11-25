import type { Stage1PilotModuleId } from "../../data/designPatternPilots.ts";

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
  moduleId: Stage1PilotModuleId;
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
    liveRepoCue: "打开 Stage 1 模式卡对照“最简单实现 vs 模式方案”，刻意排除微服务/抽象工厂诱饵。",
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
      "挑出 2 份不同实现（一份克制的单门面模块 + 一份堆砌了多余 Factory/Repository 的实现）并排对比可读性与改动文件数，当场完成 Stage 1 四维 Rubric 签核。",
    liveRepoCue: "学员提交包含 Diff 摘要、测试输出与「为何没有过度抽象」说明的交付卡。",
    facilitationPrompt:
      "收尾提问：将来业务增长到什么明确阈值时，你才会把今天的单门面升级为 Strategy 注册表？",
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
    goal: "互查交接卡信息密度与模式克制程度，完成 Stage 1 证据归档。",
    instructorAction:
      "让两位学员交换各自导出的 ACC 检查点交接卡，测试对方只看这 15 行文件能否接手不改歪禁区目录；点评是否存在不必要的状态机框架或空转发层。",
    liveRepoCue: "按 Stage 1 四维 Rubric 抽查学员交付物并记录复盘评语。",
    facilitationPrompt:
      "收尾提问：你的自愈循环今天为什么用纯函数+枚举表就停手了，而不是封装一个通用的多插件重试引擎？",
  },
];

export const PRIVATE_PATTERN_PILOT_SCRIPTS: Record<
  Stage1PilotModuleId,
  InstructorPatternPilotScript
> = {
  m9: {
    moduleId: "m9",
    pairTitle: "M9 / M3 · 架构边界、Facade 与垂直切片试点",
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
    pairTitle: "M9 / M3 · 架构边界、Facade 与垂直切片试点",
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
  m5: {
    moduleId: "m5",
    pairTitle: "M5 / M8 · DoD 自愈与长程 Harness 模式试点",
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
  m8: {
    moduleId: "m8",
    pairTitle: "M5 / M8 · DoD 自愈与长程 Harness 模式试点",
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
};

export function getInstructorPatternScriptForModule(
  moduleId: string
): InstructorPatternPilotScript | null {
  if (
    moduleId === "m3" ||
    moduleId === "m5" ||
    moduleId === "m8" ||
    moduleId === "m9"
  ) {
    return PRIVATE_PATTERN_PILOT_SCRIPTS[moduleId];
  }
  return null;
}
