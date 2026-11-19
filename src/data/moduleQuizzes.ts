export interface QuizReviewTarget {
  label: string;
  labId?: string;
  moduleId?: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  reviewTarget?: QuizReviewTarget;
}

export interface ModuleQuiz {
  moduleNumber: number;
  moduleTitle: string;
  subtitle: string;
  backgroundColor?: string;
  questions: QuizQuestion[];
}

export const MODULE_QUIZZES: Record<number, ModuleQuiz> = {
  1: {
    moduleNumber: 1,
    moduleTitle: "AI Coding 研发范式革命",
    subtitle: "意图架构师、全量上下文与 SDD/DoD 闭环检验",
    backgroundColor: "#020205",
    questions: [
      {
        id: "m1-q1",
        topic: "意图架构师能力模型",
        question: "在 AI Native 研发时代，人类“意图架构师”最核心的三项竞争力是什么？",
        options: [
          "手写正则速度、记忆框架 API、手工切图能力",
          "抽象能力（定义边界）、评估能力（制定 DoD）、编排能力（调度 Agent）",
          "熟练背诵算法模板、手动配置 Webpack、逐行代码补全",
          "单纯依赖行内自动补全并手动复制粘贴代码片段",
        ],
        correctIndex: 1,
        explanation:
          "代码已成为可随时再生的中间产物，架构师的核心价值在于用高纯度意图抽象问题、用 DoD 评估交付物，并编排多 Agent 协同落地。",
        reviewTarget: { labId: "plan-prompt", label: "实操 Lab 01 · Plan→Agent 提示词沙盘" },
      },
      {
        id: "m1-q2",
        topic: "全量上下文与 Context Caching",
        question: "在代码场景中，为什么 1M+ 全量上下文配合 Context Caching 能取代传统 RAG？",
        options: [
          "代码是强图结构与长程依赖，RAG 切片会破坏语义，而 KV Cache 预加载兼顾 100% 召回与低延迟",
          "RAG 无法处理任何中文注释，只能处理英文变量名",
          "Context Caching 会自动把代码编译成二进制机器码",
          "全量上下文不需要遵循任何架构规范或项目依赖关系",
        ],
        correctIndex: 0,
        explanation:
          "代码依赖跨文件分布，Chunking 会割裂函数与类型约束；全量上下文保留完整调用链，Context Caching 则将代码库预加载到 KV Cache，显著降低成本与延迟。",
        reviewTarget: { labId: "agent-harness", label: "深入 Lab 06 · 上下文压缩与 Harness" },
      },
      {
        id: "m1-q3",
        topic: "SDD 与 DoD 确定性闭环",
        question: "在从 Intent 到上线的确定性工作流中，SDD 与 DoD 分别承担什么职责？",
        options: [
          "SDD 负责自动部署容器，DoD 负责生成 UI 设计稿",
          "两者都是纯展示型文档，不参与 AI 的实际代码生成与验证",
          "SDD 将意图固化为可执行架构契约与蓝图，DoD 作为验收门禁驱动 AI 自纠错达标",
          "SDD 只用于前端样式调整，DoD 只用于统计代码行数",
        ],
        correctIndex: 2,
        explanation:
          "SDD（软件设计文档）在编码前约束接口、数据结构与边界；DoD（完成定义）通过静态扫描与自动化测试强制 AI 闭环纠错，消除“开盲盒”式交付。",
        reviewTarget: { labId: "plan-prompt", label: "复盘 Lab 01 · SDD 与 DoD 检查点" },
      },
      {
        id: "m1-q4",
        topic: "Agent 时代的软件工程基本功",
        question: "既然 Coding Agent 已经能代写全部代码，为什么深刻理解软件工程基本功的开发者依然大幅胜出“盲目 Vibe Coder”？",
        options: [
          "因为 Coding Agent 无法识别任何现代编程语言语法，必须靠人工手敲循环",
          "懂基本功才能识别并驾驶 Agent 应对延迟/可用性/一致性/可靠性/可维护性/简洁性/成本等权衡，并设计好供 AI 消费的底层数据架构",
          "因为架构方案从原型到百万用户规模化阶段始终保持一成不变",
          "因为全栈能力只需要关注前端 UI 组件，不需要管数据生命周期与爆炸半径",
        ],
        correctIndex: 1,
        explanation:
          "记忆语法正在过时，但若不知道存在七维系统权衡，就无法向 Agent 发出正确约束；同时 AI 系统直接从你的数据源获取上下文，且正确架构是随阶段移动的靶心，全靠人提供关键工程上下文。",
        reviewTarget: { moduleId: "m1", label: "回看 Module 1 核心讲义" },
      },
    ],
  },
  2: {
    moduleNumber: 2,
    moduleTitle: "全量代码库理解",
    subtitle: "噪音过滤、跨模块重构与自动化审计检验",
    backgroundColor: "#050510",
    questions: [
      {
        id: "m2-q1",
        topic: "精简上下文与去噪",
        question: "将整个代码库喂给 2M+ 上下文模型前，最关键的预处理原则是什么？",
        options: [
          "把 node_modules、构建产物和二进制日志全部打包输入",
          "排除构建产物与依赖目录等噪音，保留核心源码、类型定义与架构配置",
          "随机删除一半的测试文件以减少字符数",
          "只输入 CSS 样式表，不输入任何业务逻辑代码",
        ],
        correctIndex: 1,
        explanation:
          "全量上下文不等于垃圾倾倒。剔除 node_modules、dist 等冗余产物能显著提升信噪比，让模型注意力聚焦在真实业务逻辑与依赖关系上。",
        reviewTarget: { moduleId: "m2", label: "回看 Module 2 · 上下文去噪讲义" },
      },
      {
        id: "m2-q2",
        topic: "跨模块深度重构",
        question: "升级核心支付接口签名时，全量代码库理解相比局部编辑的核心优势是什么？",
        options: [
          "只修改接口声明文件，其余报错留给运行期排查",
          "自动追踪跨文件调用链与连锁反应，同步更新所有上下游适配层与测试",
          "强制把所有微服务合并成单个 HTML 文件",
          "跳过类型检查直接部署到生产环境",
        ],
        correctIndex: 1,
        explanation:
          "具备全局视野的 AI 能同时看到接口定义、各模块调用方、Mock 数据与边界测试，从而一次性掌控重构引发的连锁反应。",
        reviewTarget: { labId: "agent-harness", label: "体验 Lab 06 · 跨文件上下文压缩" },
      },
      {
        id: "m2-q3",
        topic: "安全与数据流审计",
        question: "全量上下文如何提升 AI 安全审计与 Code Review 的准确性？",
        options: [
          "仅靠正则匹配密码关键词",
          "忽略外部输入，只检查代码缩进是否美观",
          "跨越单文件限制进行深度数据流分析，追踪从入口请求到数据库落盘的完整污点路径",
          "自动关闭所有防火墙与鉴权中间件",
        ],
        correctIndex: 2,
        explanation:
          "安全漏洞往往隐藏在多层函数调用与全局拦截器之间，全量上下文让 AI 能够沿真实数据流追踪鉴权遗漏与注入风险。",
        reviewTarget: { labId: "smart-code-review", label: "实操 Lab 12 · Bugbot 安全规则审查" },
      },
    ],
  },
  3: {
    moduleNumber: 3,
    moduleTitle: "Cursor 全栈实战与商业化上线",
    subtitle: "Design-to-Code、Supabase/Stripe 闭环与 Vibe Debugging 检验",
    backgroundColor: "#100505",
    questions: [
      {
        id: "m3-q1",
        topic: "Stripe 支付闭环安全",
        question: "接入 Stripe 订阅付费时，为什么不能在用户跳转到前端 `/success` 页面后直接为其开通会员权益？",
        options: [
          "因为 Stripe 后台不允许配置 `/success` 路径",
          "任意用户都可直接访问 `/success` URL 绕过付款；权益发放必须只信任服务端 Webhook 签名验证结果",
          "因为 `/success` 页面无法加载 Tailwind CSS 样式",
          "只有移动端浏览器支持触发前端跳转",
        ],
        correctIndex: 1,
        explanation:
          "跳转成功页仅用于前端友好提示。真正可靠的权益发放必须依赖后端接收 Stripe 签名 Webhook、校验 stripe-signature 并做 event.id 幂等落库。",
        reviewTarget: { moduleId: "m3", label: "回看 Module 3 · 支付与服务端安全" },
      },
      {
        id: "m3-q2",
        topic: "Vibe Debugging 排障心法",
        question: "遇到页面白屏或点击无响应且连续让 AI 修改 3 次仍越改越乱时，最高效的工程处理方式是什么？",
        options: [
          "继续盲目追加第 10 轮“请再帮我修一下”提示词",
          "截图 + 附上 F12 Console/Network 报错精准定位；若仍发散则立刻通过 Checkpoint/Git 回滚到上一个绿灯版本换思路",
          "把所有 TypeScript 类型全部改成 any 以消除控制台输出",
          "直接删除整个前端组件目录重新初始化仓库",
        ],
        correctIndex: 1,
        explanation:
          "Vibe Debugging 的核心是用完整现场（截图+Console+Network）缩小搜索空间，并用 Git/Checkpoint 作为安全锚点及时止损回滚，再把根因写入 .cursor/rules。",
        reviewTarget: { labId: "vibe-stack-map", label: "打开 Lab 07 · 报错解码与排障矩阵" },
      },
      {
        id: "m3-q3",
        topic: "长时任务与测试防作弊",
        question: "使用 `PRD.md` + `feature_list.json` 驱动跨会话开发时，应如何防止 AI 为了凑“全部通过”而投机取巧？",
        options: [
          "允许 AI 在测试报错时直接注释或删掉失败断言",
          "不写任何自动化测试，全部靠肉眼点击确认",
          "在规则中严禁削弱或跳过失败测试，每完成一项功能通过客观命令验收后再打勾并执行原子 Git Commit",
          "要求 AI 在单次对话内一口气改完 50 个不相关文件",
        ],
        correctIndex: 2,
        explanation:
          "把完成判断权交给客观校验脚本与清单状态机，同时禁止篡改断言与按特性细粒度提交，才能保证长时自主编码不偏移。",
        reviewTarget: { labId: "efficiency-assessment", label: "自测 Lab 09 · Sonar 7 Habits 门禁" },
      },
      {
        id: "m3-q4",
        topic: "高信噪比前端参考输入",
        question: "用 Cursor 实现前端交互与视觉时，为什么不建议仅输入“干净一点、高级但不要太高级”等形容词？",
        options: [
          "因为 Cursor 只支持英文提示词，不支持中文审美形容词",
          "模糊形容词会留出过大盲猜空间（Garbage in, garbage out）；应提供整站局部备注图、导航展开态截图或对应框架组件源码与参数",
          "因为形容词会触发 Tailwind CSS 编译语法错误",
          "因为必须在每次生成前把三家不同风格网站的页面全部拼进同一文件",
        ],
        correctIndex: 1,
        explanation:
          "审美判断力源于高信噪比输入：给 AI 看整页叙事顺序、保留哪些留白比例，或者直接从 React Bits / Vue Bits / Codrops 等站喂给精确参数、依赖与源码，远比堆砌形容词精准得多。",
        reviewTarget: { labId: "ui-inspiration", label: "浏览 Lab 08 · 23 站 UI 参考库" },
      },
    ],
  },
  4: {
    moduleNumber: 4,
    moduleTitle: ".cursor/rules、AGENTS.md 与 MCP 架构",
    subtitle: "规则触发机制、惰性 MCP 发现与外部工具隔离检验",
    backgroundColor: "#050510",
    questions: [
      {
        id: "m4-q1",
        topic: ".cursor/rules (.mdc) 精准触发",
        question: "为了防止规则文件过长塞爆上下文窗口，`.cursor/rules/*.mdc` 应当如何合理配置触发机制？",
        options: [
          "把所有数据库、CSS、测试和部署细节全部设为 alwaysApply: true",
          "仅把全局核心约束放进 00-project-dna / AGENTS.md，其余规范按 globs 路径或描述按需自动挂载",
          "把所有规则写成注释放进 package.json 中",
          "每次改文件都手动复制粘贴 2000 行规范进对话框",
        ],
        correctIndex: 1,
        explanation:
          "基于 globs 路径匹配（如 server/routes/**/*.ts）和按需描述触发规则，既保证修改关键路径时自动注入安全红线，又避免日常编码被无关规则稀释注意力。",
        reviewTarget: { labId: "cursor-rules", label: "实操 Lab 02 · .mdc 规则与 AGENTS 沙盘" },
      },
      {
        id: "m4-q2",
        topic: "MCP 工具发现与上下文压缩",
        question: "面对 GitHub、Postgres、Context7、TaskMaster 等众多 MCP 工具时，如何避免上下文被海量 JSON Schema 占满？",
        options: [
          "一次性启用 50 个 MCP 服务的所有全量工具描述并常驻系统提示词",
          "采用惰性工具发现与只读/写入分离：仅挂载当前任务必需 MCP，且对写操作设置明确人类确认门禁",
          "把所有数据库密码直接硬编码进 MCP 客户端前端代码中",
          "禁用 GitHub 和 Postgres MCP，全靠模型凭记忆猜测表字段名",
        ],
        correctIndex: 1,
        explanation:
          "根据 OPENDEV 与模板工程实践，全量挂载工具 Schema 会直接吞噬大量 Token；按任务隔离 MCP、用 Context7 两步查最新文档、对 Memory/TaskMaster 写操作加确认门槛才是工程正解。",
        reviewTarget: { labId: "mcp-toolbox", label: "实操 Lab 03 · MCP 配置与 DoD 验收" },
      },
      {
        id: "m4-q3",
        topic: "规则自进化（90-self-improve.mdc）",
        question: "当 Cursor Agent 在同一类接口或构建错误上连续返工两次后，工程团队如何防止它下次再犯？",
        options: [
          "清空对话窗口重新祈祷 AI 下次发挥好一点",
          "把根因与防呆约束沉淀进 .cursor/rules 或 AGENTS.md 并在团队共享，让规则库持续反哺进化",
          "关掉 TypeScript 严格模式和 ESLint 检查",
          "禁止在项目中使用 Git 版本控制",
        ],
        correctIndex: 1,
        explanation:
          "每一次踩坑都应转化为规则资产（self-improve 闭环），这正是独立开发者“越用 Cursor 越稳定”的长期复利来源。",
        reviewTarget: { labId: "prompt-crafting", label: "演练 Lab 14 · Prompt Crafting 规则生成" },
      },
    ],
  },
  5: {
    moduleNumber: 5,
    moduleTitle: "DoD 完成定义与高质量自愈闭环",
    subtitle: "Sonar 7 Habits、IASalut 五层测试与终端自动纠错检验",
    backgroundColor: "#051005",
    questions: [
      {
        id: "m5-q1",
        topic: "Sonar 7 Habits · 破除生产力悖论",
        question: "根据 Sonar《7 Habits of Highly Effective AI Coding》，为什么很多团队用了 AI 写代码速度暴增，整体交付却反而变慢？",
        options: [
          "因为 AI 工具生成的每行代码都不受版权法保护",
          "AI 产量暴增将瓶颈转移到了 Review 与排错阶段；若缺乏责任归属、清理 Stray Code（死代码）与更严苛的 SAST 扫描，技术债会迅速堵死交付",
          "因为现代计算机运行单元测试的速度比大模型生成还慢",
          "因为团队没有给每份源码手动添加彩色表情符号",
        ],
        correctIndex: 1,
        explanation:
          "git blame 永远指向提交代码的开发者而非 AI。必须严格清扫 AI 产出的冗余导入与死代码（No Stray Code）、压低认知复杂度（Keep It Simple）并自动化全量扫描。",
        reviewTarget: { labId: "efficiency-assessment", label: "自测 Lab 09 · Sonar 7 Habits 评估" },
      },
      {
        id: "m5-q2",
        topic: "防范测试作弊（Reward Hacking）与五层验证",
        question: "让 AI 自写单测并自检通过时，最隐蔽且危险的“Reward Hacking（奖励黑客）”陷阱是什么？",
        options: [
          "AI 为每个核心业务接口写了过多边界异常断言",
          "AI 编写 expect(true).toBe(true) 等弱断言、跳过失败用例或删改测试条件来“凑绿灯”，掩盖真实逻辑或数值错误",
          "AI 使用真实数据库隔离环境运行集成测试",
          "AI 严格控制了函数的圈复杂度（Cyclomatic Complexity）",
        ],
        correctIndex: 1,
        explanation:
          "Sonar 第 6 习惯与 arXiv:2410.02156 均强调：AI 擅长写 Happy Path 测试，但极易弱化断言自欺欺人；高可靠工程（如 IASalut 医疗 AI 指南）需人工定义边界与五层测试金字塔，并监控圈复杂度与 Halstead 复杂度。",
        reviewTarget: { labId: "smart-code-review", label: "演练 Lab 12 · 测试作弊与规则审查" },
      },
      {
        id: "m5-q3",
        topic: "DoD 与终端自愈闭环（3-Nudge）",
        question: "当 Cursor Agent 在终端运行 DoD 验证连续报错时，合理的自动化收敛机制是什么？",
        options: [
          "让 Agent 无限循环盲改 100 次直到配额耗尽",
          "读取报错堆栈做有界自愈（如 3 次 Nudge 限制）；若跨过阈值仍未收敛，立刻用 Checkpoint/Git 回滚并向人类架构师求助",
          "直接把报错的测试文件从仓库删除",
          "跳过 tsc 和 build，直接手动修改线上编译产物",
        ],
        correctIndex: 1,
        explanation:
          "DoD 是确定性的退出门禁，搭配有界自愈次数与 Git Checkpoint 止损，能防止 Agent 在错误方向越改越乱（Two Steps Back）。",
        reviewTarget: { moduleId: "m5", label: "回看 Module 5 · DoD 自愈闭环讲义" },
      },
    ],
  },
  6: {
    moduleNumber: 6,
    moduleTitle: "Background Agents、CLI 与 Bugbot",
    subtitle: "异步分支并行、PR 自动化审计与三层密钥安全防线检验",
    backgroundColor: "#050510",
    questions: [
      {
        id: "m6-q1",
        topic: "Issue-to-PR 异步工作流",
        question: "在独立开发者实战中，什么样的任务最适合交给云端 Background Agents + Cursor CLI 异步处理？",
        options: [
          "边界完全模糊、还没想清楚商业模式的核心产品方向探索",
          "有明确 Issue 契约与 DoD 检查命令的任务（如修复边缘 Bug、升级依赖、补齐单元测试与文档）",
          "直接把未测试代码绕过审查强行推送到生产主分支",
          "需要团队成员面对面讨论商业定价策略的会议纪要",
        ],
        correctIndex: 1,
        explanation:
          "Background Agent 在隔离分支上运行，只有当需求边界清晰、具备自动化测试和构建门禁时，异步提交的 PR 才能真正做到“人类 2 分钟审阅合并”。",
        reviewTarget: { labId: "code-health-sim", label: "仿真 Lab 13 · Agent 代码健康度曲线" },
      },
      {
        id: "m6-q2",
        topic: "Bugbot 混合评审与反自偏见",
        question: "为什么不能让刚刚写出代码的同一个对话会话自己兼任终审裁判，而需要独立上下文的 Bugbot / SAST 守门？",
        options: [
          "同一个会话窗口存在惯性偏好与上下文自偏见（LLM-as-a-Judge 盲区），容易忽略自己在写代码时做出的错误假设",
          "因为 Bugbot 只能审查 CSS 文件，不能审查 TypeScript 文件",
          "因为独立会话不需要遵守项目的 .cursor/rules",
          "因为关闭安全扫描能让 CI 构建速度更快",
        ],
        correctIndex: 0,
        explanation:
          "隔离上下文审查配合确定性静态规则（如 SQLi、鉴权遗漏、Stray Code 与 Reward Hacking 检测），才能打破“自己批改自己试卷”的幻觉盲区。",
        reviewTarget: { labId: "bugbot-review", label: "实操 Lab 04 · Bugbot 实时评审台" },
      },
      {
        id: "m6-q3",
        topic: "三层密钥与供应链安全门禁",
        question: "参考工程安全基线，防止 AI 把硬编码密钥或危险漏洞带入生产仓库的纵深防线应当如何设计？",
        options: [
          "只在口头上提醒 AI“不要泄露密钥”，不做任何工具拦截",
          "本地 pre-commit（Gitleaks）拦截提交 + CI 深度历史扫雷（TruffleHog）+ 静态语义审计（CodeQL / Bugbot）三层纵深防御",
          "把所有密钥写进 README.md 方便团队共享",
          "使用前端 VITE_ 前缀环境变量存放数据库管理员密码",
        ],
        correctIndex: 1,
        explanation:
          "不能把安全寄托在模型“自觉遵守”。本地 Hook、CI 密钥扫雷与 CodeQL/Bugbot 构成不可绕过的自动化门禁，将风险消灭在合并前。",
        reviewTarget: { labId: "smart-code-review", label: "实操 Lab 12 · 安全门禁规则沙盘" },
      },
    ],
  },
  7: {
    moduleNumber: 7,
    moduleTitle: "独立开发者 ROI 与架构大脑",
    subtitle: "70% 困境突围、MTTV 效能度量与规则资产复利检验",
    backgroundColor: "#020205",
    questions: [
      {
        id: "m7-q1",
        topic: "Addy Osmani · 70% 困境与知识悖论",
        question: "《Beyond Vibe Coding》提出的「70% 困境」与「知识悖论」对独立开发者与产品经理的核心警示是什么？",
        options: [
          "AI 永远只能写 70 行以内的单文件脚本",
          "AI 能极快做出前 70% 的原型（Bootstrapper），但最后 30% 的安全/并发/集成若不懂底层原理会陷入“进一退二”死循环，必须靠主动审阅与系统边界跨越",
          "只要花更多钱买更贵的模型，就再也不需要任何代码审查与架构设计",
          "产品原型完成后绝不能重构成生产代码",
        ],
        correctIndex: 1,
        explanation:
          "快速原型极易让人跳过心智模型积累；进入生产迭代期（Iterator）必须切换为“总编（Editor-in-Chief）”思维，用 Context Engineering 与工程内功驾驭最后 30%。",
        reviewTarget: { moduleId: "m7", label: "回看 Module 7 · 70% 困境与 ROI 讲义" },
      },
      {
        id: "m7-q2",
        topic: "AI 时代工程效能真实 ROI 指标",
        question: "在 Cursor 研发体系中，最能真实衡量产品开发投资回报率（ROI）的指标组合是？",
        options: [
          "每日生成的代码总行数和注释字数",
          "MTTV（想法到可验证上线周期）、Plan 后首轮通过率、终端自愈率与返工率",
          "同时打开的浏览器标签页数量",
          "项目 node_modules 文件夹的总磁盘占用",
        ],
        correctIndex: 1,
        explanation:
          "代码量毫无意义（甚至冗余代码是负资产）。真正创造商业价值的是从创意到安全上线收款的速度与一次性交付确定性。",
        reviewTarget: { labId: "velocity-heatmap", label: "查看 Lab 15 · Developer Velocity 热力图" },
      },
      {
        id: "m7-q3",
        topic: "个人架构大脑资产复利",
        question: "一个人如何把每次用 Cursor 踩坑排错的经验，沉淀为下个独立产品的“启动加速度”？",
        options: [
          "每次开新项目都从零手写提示词，不保存任何规则或模板",
          "将验证过的 .cursor/rules (.mdc)、SKILL.md、MCP 配置与高分 UI 参考备注归档进个人知识库，形成可复用架构大脑",
          "把旧项目的所有业务代码直接整包复制而不做任何精简",
          "完全依赖模型临场自由发挥，不保留任何历史经验",
        ],
        correctIndex: 1,
        explanation:
          "代码只是临时产物，经过实战检验的 Rules、Skills、安全门禁与审美样本库，才是独立开发者最核心的复利护城河。",
        reviewTarget: { labId: "book-kb", label: "打开 Lab 05 · AI 书籍知识库备课台" },
      },
    ],
  },
  8: {
    moduleNumber: 8,
    moduleTitle: "Cursor 工具箱 × AI Studio × Easy-Vibe 闭环",
    subtitle: "沙盘演练、原型工程化迁移与多 Agent 契约协作检验",
    backgroundColor: "#050510",
    questions: [
      {
        id: "m8-q1",
        topic: "AI Studio ➔ Cursor 生产迁移",
        question: "产品经理在 Google AI Studio 验证完一个可交互前端原型后，导入 Cursor 进行工程化上线的第一步关键动作是？",
        options: [
          "直接把数据库管理密钥写进前端组件环境变量 Vite 前缀中",
          "建立 AGENTS.md 与 .cursor/rules (.mdc) 锁定工程规范，并将 Gemini/DB/支付密钥收口至服务端代理路由",
          "删除所有 TypeScript 类型定义以减少编译耗时",
          "跳过 Plan 模式直接让 Agent 随机覆盖全仓库文件",
        ],
        correctIndex: 1,
        explanation:
          "先用规则文件确立目录规范与服务端密钥安全红线，再用 Plan + MCP 分步接入真实 DB 与权限校验，才能平滑实现从演示原型到可收费产品的跃迁。",
        reviewTarget: { moduleId: "m8", label: "回看 Module 8 · 迁移与案例讲义" },
      },
      {
        id: "m8-q2",
        topic: "多 Agent 并行协作隔离",
        question: "当需要让多个 Cursor Background Agents 或 Agent Team 并行推进前后端开发时，防止互相覆盖冲突的核心原则是？",
        options: [
          "不写接口契约，让所有 Agent 自由猜测字段名并编辑同一个大文件",
          "先用 Plan 模式锁定共享类型与 API 契约（Contract-First），再结合 Git Worktree 与明确目录写权限分工",
          "先上线前端再决定后端路由返回什么字段",
          "关闭 Bugbot 与类型检查直接合并所有分支",
        ],
        correctIndex: 1,
        explanation:
          "契约先行加上 Worktree/目录写入隔离，使前后端 Agent 在同一套类型源头下并行演进，最后由独立上下文的 Reviewer 与 Bugbot 验收合入。",
        reviewTarget: { labId: "agent-harness", label: "演练 Lab 06 · Agent Harness 隔离架构" },
      },
      {
        id: "m8-q3",
        topic: "Rules (.mdc) vs Skills (SKILL.md)",
        question: "在长期维护多个独立开发项目时，`.cursor/rules/*.mdc` 与 `SKILL.md` 应当如何分工配合？",
        options: [
          "两者功能完全重复，只需随机保留一个空文件",
          "`.mdc` 承担基于路径/常驻触发的架构与安全底线护栏，`SKILL.md` 沉淀跨项目复用的专项SOP工作流",
          "`SKILL.md` 专门用来存放用户明文密码，`.mdc` 用来放图片素材",
          "只有在遇到页面 CSS 颜色出错时才允许创建规则文件",
        ],
        correctIndex: 1,
        explanation:
          "规则负责日常编码时的自动防呆守卫，技能包负责封装可移植的标准操作流，二者共同构成独立开发者的个人架构大脑资产。",
        reviewTarget: { labId: "cursor-rules", label: "实操 Lab 02 · .mdc 规则配置沙盘" },
      },
    ],
  },
  9: {
    moduleNumber: 9,
    moduleTitle: "Vibe Coder's Handbook 全栈工具图谱与白盒实战",
    subtitle: "Web 三层架构、Either/Or 选型决策、45% 安全警钟与报错解码检验",
    backgroundColor: "#040711",
    questions: [
      {
        id: "m9-q1",
        topic: "元框架本质与状态分层",
        question: "在 Cursor 生成现代 React 应用时，关于 Next.js、Zustand 与 TanStack Query 的分工，下列哪项描述是正确的？",
        options: [
          "Next.js 会彻底淘汰 React，Zustand 与 TanStack Query 只能二选一安装",
          "Next.js 是架在 React 之上的全栈元框架（负责 SSR/路由/API）；Zustand 管浏览器 UI 状态，TanStack Query 管服务端请求缓存，二者协同配合",
          "React 可以不经编译直接在浏览器当作原始机器码执行，无需任何 Build Tool",
          "Tailwind CSS 会把所有前端逻辑自动转换成 PostgreSQL 数据库表",
        ],
        correctIndex: 1,
        explanation:
          "《The Vibe Coder's Handbook》将工具清晰分为 Either/Or（如 React vs Vue、Drizzle vs Prisma）与 Work Together（Next.js 构建在 React 上；Zustand 管客户端状态 + TanStack Query 管服务端状态）。",
        reviewTarget: { labId: "vibe-stack-map", label: "查看 Lab 07 · Vibe 全栈工具图谱" },
      },
      {
        id: "m9-q2",
        topic: "Vibe Coding 45% 安全漏洞警钟",
        question: "研究统计 45% 的 AI 生成代码存在安全漏洞。当 Cursor 生成登录、支付或数据库操作代码时，哪套组合最能从机制上守住底线？",
        options: [
          "把 DATABASE_URL 放进前端组件并在跳转 /success 页后直接开通权限",
          "在浏览器端用原生 JavaScript 手写 SQL 拼接字符串，以减少依赖体积",
          "客户端永不信任 + 服务端入口用 Zod 严格校验 + 数据库通过 Drizzle/Prisma ORM 参数化查询 + 密钥留在服务端 .env",
          "为了快速上线先关闭 HTTPS 与 Supabase RLS 策略",
        ],
        correctIndex: 2,
        explanation:
          "前端代码可被任意用户用 DevTools 修改。只有“密钥驻留服务端 + Zod 边界验证 + ORM 防 SQL 注入 + 密码哈希/HTTPS”四道机制同时在位，才能避免高危漏洞。",
        reviewTarget: { labId: "arch-decision-sim", label: "挑战 Lab 11 · 架构决策模拟器" },
      },
      {
        id: "m9-q3",
        topic: "报错解码黄金法则",
        question: "开发或部署时屏幕出现红字报错（如 Hydration mismatch 或 ECONNREFUSED），第一步最高效的排障动作是什么？",
        options: [
          "忽略第一行错误信息，直接让 AI 从头删掉整个 src 目录重写",
          "精读并复制报错第一行判断归因（如水合差异移入 useEffect、端口拒绝检查服务与连接串），清理缓存后把精简现场交给 AI",
          "把 package.json 里的 dependencies 全部删除并手动修改 node_modules 源码",
          "在报错组件外层套一个空 catch 块把错误静默吞掉",
        ],
        correctIndex: 1,
        explanation:
          "90% 的前端与构建报错在第一行已指明问题本质；配合“切莫手改 node_modules”、核对 Console/Network 及清缓存重启 5 步法即可快速复位。",
        reviewTarget: { labId: "vibe-stack-map", label: "查看 Lab 07 · 报错解码实验室" },
      },
    ],
  },
  10: {
    moduleNumber: 10,
    moduleTitle: "AI Coding 审美积累与 VibeCoding 效能实践",
    subtitle: "高信噪比视觉输入、整站/局部参考拆解与组件源码喂料检验",
    backgroundColor: "#040711",
    questions: [
      {
        id: "m10-q1",
        topic: "Garbage In, Garbage Out · 拒绝模糊形容词",
        question: "让 AI 实现界面时，为什么“干净一点、有设计感、高级但不要太高级”往往适得其反？",
        options: [
          "因为大模型只能识别 CSS 十六进制色号，无法理解汉字",
          "抽象形容词为 AI 留下了过大猜测空间；应改用带具体备注的案例图、留白比例或直接喂给调好参数的组件源码",
          "因为高级感必须靠人工手写原生 HTML，Cursor 不支持 Tailwind CSS",
          "因为系统提示词不允许超过 10 个字",
        ],
        correctIndex: 1,
        explanation:
          "审美（Taste）源于大量输入积累下的取舍判断力。指出喜欢参考案例里的具体某一点（如字图占比、叙事顺序或 hover 结构）并配合源码参数，远比空洞形容词精准。",
        reviewTarget: { labId: "ui-inspiration", label: "浏览 Lab 08 · 高信噪比 UI 参考库" },
      },
      {
        id: "m10-q2",
        topic: "整站与区块借鉴原则（Land-book / Minimal Gallery）",
        question: "借鉴多个整站参考案例来构建自己的产品落地页时，哪项做法最容易导致视觉灾变？",
        options: [
          "先确定自己的页面内容结构与信息顺序，再统一字体、间距和色板",
          "把三家不同网站各自最好看的 Hero、功能卡和页脚直接拼进同一页面",
          "参考 Minimal Gallery 极简案例时，明确指明必须保留哪些业务数据防止被删空",
          "按行业从 Websitevice 筛选对口参考，连同官方布局特征描述一起喂给 Cursor",
        ],
        correctIndex: 1,
        explanation:
          "单看都很出彩的区块强拼在一起往往风格冲突割裂。正确做法是先用 Land-book / Lapa Ninja 确定内容结构与叙事节奏，再用统一视觉语言统一收口。",
        reviewTarget: { labId: "ui-inspiration", label: "对比 Lab 08 · 整站类参考案例" },
      },
      {
        id: "m10-q3",
        topic: "局部盲区：导航与页脚喂料",
        question: "使用 Navbar Gallery 与 Footer Design 为 Cursor 提供局部改版参考时，最关键的输入细节是？",
        options: [
          "Navbar 只截默认收起态一排文字即可，下拉面板让 AI 自行编造",
          "同时截取 Navbar 收起态与展开态 Mega Menu 截图，并为 Footer 附上真实链接清单与手机端视图",
          "页脚只需放一个 Logo 和 copyright 文字，不需考虑移动端布局",
          "把网站所有正文内容都塞进顶部导航栏里",
        ],
        correctIndex: 1,
        explanation:
          "只给收起态截图 AI 无法猜出展开下拉面板的信息分组；页脚则需结合真实业务链接清单、场景视觉与手机端视图避免虎头蛇尾。",
        reviewTarget: { moduleId: "m10", label: "回看 Module 10 · 审美与局部盲区讲义" },
      },
      {
        id: "m10-q4",
        topic: "实现源码类组件库喂料规范",
        question: "在从 React Bits、Vue Bits、Codrops 与 Animata 等实现类参考站提取效果喂给 Cursor 时，哪项习惯最能提升一次成功效能？",
        options: [
          "直接把 React Bits 的代码粘贴进 Vue 项目，让 AI 边改需求边顺手跨框架翻译",
          "只给 AI 看一张静态网页截图，然后不断要求“打字机再丝滑自然一点”",
          "确保技术栈对口（Vue 选 Vue Bits + motion-v），先调好离散参数（间隔/循环/光标/颜色），并检查 Codrops WebGPU 等兼容性与 Uiverse 统一收口",
          "把全站每个卡片都加上 Aceternity 发光边框和 Magic UI 跑马灯特效",
        ],
        correctIndex: 2,
        explanation:
          "代码与参数直喂是最高信噪比输入：选对原生框架库、用具体毫秒与开关选项替代抽象感觉、先定主角保持动效克制，并统一主题配色避免集市拼盘感。",
        reviewTarget: { labId: "ui-inspiration", label: "提取 Lab 08 · 源码类组件 Prompt" },
      },
    ],
  },
};

export interface QuizReviewSummary {
  totalCount: number;
  answeredCount: number;
  correctCount: number;
  accuracyPct: number;
  missedQuestions: QuizQuestion[];
  recommendedTargets: QuizReviewTarget[];
}

export function getQuizReviewSummary(
  quiz: ModuleQuiz,
  answers: Record<string, number>
): QuizReviewSummary {
  const questions = quiz.questions;
  const totalCount = questions.length;
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] === q.correctIndex
  ).length;
  const accuracyPct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const missedQuestions = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex
  );

  const seenKeys = new Set<string>();
  const recommendedTargets: QuizReviewTarget[] = [];
  for (const q of missedQuestions) {
    if (!q.reviewTarget) continue;
    const key = `${q.reviewTarget.labId ?? ""}:${q.reviewTarget.moduleId ?? ""}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      recommendedTargets.push(q.reviewTarget);
    }
  }

  return {
    totalCount,
    answeredCount,
    correctCount,
    accuracyPct,
    missedQuestions,
    recommendedTargets,
  };
}
