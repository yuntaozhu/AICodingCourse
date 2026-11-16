export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
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
          "单纯依赖 Copilot 自动补全并手动复制粘贴代码片段",
        ],
        correctIndex: 1,
        explanation:
          "代码已成为可随时再生的中间产物，架构师的核心价值在于用高纯度意图抽象问题、用 DoD 评估交付物，并编排多 Agent 协同落地。",
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
      },
    ],
  },
  3: {
    moduleNumber: 3,
    moduleTitle: "研发实战练习",
    subtitle: "PBT 属性测试、性能手术与 AI 工程实战检验",
    backgroundColor: "#100505",
    questions: [
      {
        id: "m3-q1",
        topic: "PBT 属性测试",
        question: "在 AI 辅助生成 PBT（Property-Based Testing）时，“智能收缩（Shrinking）”的价值是什么？",
        options: [
          "把生产数据库体积压缩到 1MB",
          "当随机测试触发 Bug 时，自动将海量复杂输入化简为最小、最易复现的反例",
          "减少单元测试断言数量以提高通过率",
          "将 TypeScript 代码自动转译为 Markdown 文档",
        ],
        correctIndex: 1,
        explanation:
          "PBT 先围绕业务不变性生成大量边界输入；一旦失败，Shrinking 机制会把复杂的随机失败用例剥离噪音，收敛到直击根因的最小复现样本。",
      },
      {
        id: "m3-q2",
        topic: "性能手术与热点优化",
        question: "面对 Profiling 性能瓶颈报告，AI 执行“性能手术”的正确闭环是？",
        options: [
          "基于 Profiling 数据定位热点路径与算法复杂度瓶颈，实施重构并用基准测试验证 DoD",
          "盲目为所有函数添加多层缓存而不测内存占用",
          "删除日志输出并调高服务器超时时间来掩盖延迟",
          "仅重命名变量而不改变数据结构与算法逻辑",
        ],
        correctIndex: 0,
        explanation:
          "真正的性能手术依赖 Profiling 定位真实热点（如 O(N²) 循环或锁竞争），采用更优数据结构/所有权模型重写，并以量化性能指标作为 DoD 验收。",
      },
      {
        id: "m3-q3",
        topic: "逆向理解与交互式文档",
        question: "AI 在接手无文档、高混淆遗留系统时的核心实战作用不包括哪一项？",
        options: [
          "结合调用上下文进行去混淆与命名还原，梳理状态流转",
          "从零散报文与处理函数中推断未公开通信协议",
          "自动生成可随代码同步演进的架构图与交互式文档",
          "跳过所有回归测试直接删除难以看懂的旧模块",
        ],
        correctIndex: 3,
        explanation:
          "AI 可以通过语义还原、协议推断与可视化架构梳理来拆解黑盒系统，但任何改动仍必须受回归测试与边界探索保护，绝不能盲删未知逻辑。",
      },
    ],
  },
  4: {
    moduleNumber: 4,
    moduleTitle: "RAG 的终结：全量上下文",
    subtitle: "结构化代码理解与遗留系统零漏洞重构检验",
    backgroundColor: "#050510",
    questions: [
      {
        id: "m4-q1",
        topic: "RAG 的结构性短板",
        question: "为什么基于文本切片和向量相似度的 RAG 在重构复杂项目时容易引入线上漏洞？",
        options: [
          "向量数据库不支持存储 UTF-8 字符",
          "检索窗口受限且切片碎片化，容易漏掉深层目录中的全局拦截器或隐式约束",
          "RAG 只能读取 JSON 文件，无法读取 TypeScript 文件",
          "RAG 每次查询都会强制修改 Git 提交历史",
        ],
        correctIndex: 1,
        explanation:
          "变量定义、权限拦截器与业务调用常分散在不同目录中，局部 Top-K 召回极易遗漏关键全局约束，从而导致权限或状态漏洞。",
      },
      {
        id: "m4-q2",
        topic: "2M+ 上下文能力边界",
        question: "百万级（2,000,000+ Tokens）上下文窗口赋予 AI Coding 的核心能力是？",
        options: [
          "以“上帝视角”原生注意力处理全量代码、注释与文档，零信息断层地做跨文件深度推理",
          "让浏览器单线程渲染速度提升 100 倍",
          "自动替团队采购云服务器和域名证书",
          "完全不需要开发者明确任何重构目标",
        ],
        correctIndex: 0,
        explanation:
          "超大上下文窗口让模型直接在内部注意力机制中建立全仓库心智图谱，无需经过容易失真的中间切块与二次检索。",
      },
      {
        id: "m4-q3",
        topic: "遗留系统重构对比",
        question: "在重构包含 50 个文件的遗留系统时，全量上下文方案如何确保受影响接口全部同步？",
        options: [
          "只修改前 5 个文件，剩下的靠人工 grep 手改",
          "一次读入全部 50 个文件，识别深层逻辑冲突并自动补全所有受影响接口调用",
          "把所有函数参数改成 any 类型以跳过编译错误",
          "重新创建全新仓库并丢弃原有业务规则",
        ],
        correctIndex: 1,
        explanation:
          "全量输入使 AI 能全局盘点所有依赖节点与冲突点，在修改底层接口的同时联动修正全部调用方，大幅降低遗漏风险。",
      },
    ],
  },
  5: {
    moduleNumber: 5,
    moduleTitle: "跨模态理解：从设计稿到代码",
    subtitle: "视觉语义解析与高保真前端生成检验",
    backgroundColor: "#051005",
    questions: [
      {
        id: "m5-q1",
        topic: "端到端前端范式",
        question: "相比传统“标注 → 切图 → 手写 CSS → 反复对齐”流程，跨模态 AI 驱动开发的核心跃迁是？",
        options: [
          "直接输出不可修改的静态 PNG 图片作为网页",
          "基于设计稿/截图进行视觉语义理解，直接生成响应式、可维护的组件化前端代码",
          "要求设计师必须改用汇编语言绘制界面",
          "取消所有响应式断点，仅适配单一屏幕尺寸",
        ],
        correctIndex: 1,
        explanation:
          "多模态模型能直接读懂版式层级、色彩系统、间距节奏与交互组件语义，将“视觉意图”直接翻译为 React + Tailwind CSS 等工程代码。",
      },
      {
        id: "m5-q2",
        topic: "深度视觉分析",
        question: "AI 解析 Figma 截图时，“深度视觉分析”不仅提取颜色和字号，还重点识别什么？",
        options: [
          "设计稿的文件创建时间与作者操作系统版本",
          "布局栅格层级、组件复用结构（如轮播/下拉菜单）与交互状态语义",
          "设计师电脑的显卡型号与显示器刷新率",
          "图片文件的 EXIF 相机焦距参数",
        ],
        correctIndex: 1,
        explanation:
          "高质量前端代码不能只是绝对定位堆砌，AI 需识别容器嵌套、Flex/Grid 对齐关系及可复用 UI 状态，才能产出工程级组件。",
      },
      {
        id: "m5-q3",
        topic: "还原度校验",
        question: "当需要保证高保真视觉还原与交互可用性时，跨模态工作流的最后关键一步是什么？",
        options: [
          "生成完第一版代码后直接跳过浏览器预览上线",
          "结合无障碍支持、多端响应式断点及渲染截图比对进行视觉一致性闭环校验",
          "把所有文字颜色全部改为纯白色以提升亮度",
          "移除所有键盘焦点和交互事件监听",
        ],
        correctIndex: 1,
        explanation:
          "生成后通过真实渲染对比与断点、可访问性校验（Vision-Verify Loop），才能实现 99%+ 的高保真还原与稳健交互。",
      },
    ],
  },
  6: {
    moduleNumber: 6,
    moduleTitle: "SDD：确定性研发的基石",
    subtitle: "软件设计文档契约与设计先行实战检验",
    backgroundColor: "#051005",
    questions: [
      {
        id: "m6-q1",
        topic: "SDD 核心定位",
        question: "在 AI Coding 工程体系中，SDD（Software Design Document）最准确的定位是什么？",
        options: [
          "项目上线后用来应付审计的事后补写文档",
          "连接“人类意图”与“AI 代码实现”的桥梁与施工蓝图，将模糊需求转化为精确约束",
          "专门用于替代单元测试的自动脚本工具",
          "仅用来记录团队成员考勤信息的表格",
        ],
        correctIndex: 1,
        explanation:
          "没有 SDD 的约束，AI 往往在编码阶段自由发挥甚至偏移架构方向；SDD 把技术栈、接口签名和状态机前置锁定为确定性契约。",
      },
      {
        id: "m6-q2",
        topic: "SDD 关键要素",
        question: "一份能有效约束 AI 编码的 SDD 提示词，通常必须明确哪些核心维度？",
        options: [
          "只需要写出产品名称和一句口号即可",
          "技术栈与目录约束、API 接口签名与错误码契约、核心数据流与状态机逻辑",
          "只需要规定团队例会的召开时间",
          "禁止在文档中出现任何数据结构定义",
        ],
        correctIndex: 1,
        explanation:
          "架构约束、接口契约与逻辑细节三者齐备，AI 才能在生成多个文件时保持类型、路由与异常处理的高度一致。",
      },
      {
        id: "m6-q3",
        topic: "SDD 落地流程",
        question: "在团队使用 SDD 驱动 AI 编码时，正确的工程协作顺序是什么？",
        options: [
          "先让 AI 盲写全部业务代码，出错后再反推设计文档",
          "先由 AI 生成 SDD 并经人类架构师评审确认 → 将 SDD 作为全局上下文喂入编码 → 进行一致性校验",
          "每次写新文件都更换一套完全不同的技术栈",
          "把 SDD 保密起来，绝不放入 AI 的上下文窗口",
        ],
        correctIndex: 1,
        explanation:
          "“先设计、人评审、再编码、后校验”把试错成本留在文档阶段，避免在代码生成后才发现方向性返工。",
      },
    ],
  },
  7: {
    moduleNumber: 7,
    moduleTitle: "DoD：验证 AI 的输出",
    subtitle: "对抗幻觉、边缘覆盖与自纠错门禁检验",
    backgroundColor: "#051005",
    questions: [
      {
        id: "m7-q1",
        topic: "为什么需要 DoD",
        question: "在 AI Coding 中引入严格的 DoD（Definition of Done）主要解决哪三类典型风险？",
        options: [
          "网速慢、键盘磨损、显示器反光",
          "AI 逻辑幻觉、只写 Happy Path 忽略边缘异常、代码风格与质量标准不一致",
          "Git 分支命名过长、字体文件过大",
          "云厂商账单结算周期不统一",
        ],
        correctIndex: 1,
        explanation:
          "大模型天然倾向于优先给出看似能跑的 Happy Path，DoD 通过强制覆盖测试、边界条件与 Lint/性能门槛，将“开盲盒”变为可验证交付。",
      },
      {
        id: "m7-q2",
        topic: "可执行的 DoD 规范",
        question: "以下哪一项属于高质量、可由工具自动化验证的 DoD 条款？",
        options: [
          "“代码要尽量写得优雅一些、让人看着舒服”",
          "“核心逻辑具备单元测试、ESLint 零警告通过、覆盖网络超时与 API 异常分支、满足首屏性能预算”",
          "“请 AI 自己觉得差不多了就可以结束”",
          "“尽量少写注释以减少文件体积”",
        ],
        correctIndex: 1,
        explanation:
          "好的 DoD 必须客观、可量化、可机器校验（测试通过率、Lint 零报错、异常分支与性能基线），而非主观形容词。",
      },
      {
        id: "m7-q3",
        topic: "自我纠错闭环",
        question: "在 Prompt 结尾嵌入 DoD 后，AI 编码工作流应如何运行？",
        options: [
          "输出完第一段代码就立刻宣布任务完成",
          "依据 DoD 驱动测试与静态检查；若任一项未达标，则读取报错反馈自动重写直至全部通过",
          "遇到测试失败时自动删除测试用例以保证 100% 通过",
          "把报错日志直接隐藏不向开发者展示",
        ],
        correctIndex: 1,
        explanation:
          "DoD 是 AI 停止工作的门禁条件（Exit Criteria），只有当自动化验证全部绿灯通过时，交付闭环才真正完成。",
      },
    ],
  },
  8: {
    moduleNumber: 8,
    moduleTitle: "Agentic Workflow：协作的艺术",
    subtitle: "多角色 Agent 团队编排与全链路协同检验",
    backgroundColor: "#051005",
    questions: [
      {
        id: "m8-q1",
        topic: "Agent 团队角色分工",
        question: "在构建多 Agent 研发团队时，将职责拆分为架构师、开发、测试、Reviewer Agent 的核心收益是什么？",
        options: [
          "单纯为了增加 API 调用次数和 Token 消耗",
          "让每个 Agent 聚焦单一职责并形成相互制衡的验证闭环，避免单一上下文过载与盲区",
          "让所有 Agent 同时修改同一行代码制造冲突",
          "完全替代人类做任何商业决策与产品目标设定",
        ],
        correctIndex: 1,
        explanation:
          "角色专业化（生成与审查分离、架构与实现分离）能显著抑制单一模型的自我确认偏见，建立高质量的工程流水线。",
      },
      {
        id: "m8-q2",
        topic: "端到端协同流程",
        question: "在多 Agent 协同实战流水线中，多个开发 Agent 能够安全“并行开发”的前提是什么？",
        options: [
          "不写任何接口定义，各自凭感觉编写字段名",
          "架构师 Agent 在前期已产出清晰的 SDD 与 API 契约，随后由测试 Agent 按契约做集成校验",
          "先上线前端再决定后端用什么语言",
          "关闭所有类型检查与版本控制",
        ],
        correctIndex: 1,
        explanation:
          "契约先行（SDD + API Contract）是并行开发不踩踏的基石；前后端开发 Agent 基于同一契约推进，并由测试 Agent 自动验证集成一致性。",
      },
      {
        id: "m8-q3",
        topic: "人类角色转型",
        question: "当 Agentic Workflow 成为研发主力后，人类工程师的角色发生了怎样的本质转变？",
        options: [
          "从架构师退化为单纯的打字员",
          "从“一线搬砖工”转变为“团队管理者与意图编排者”，聚焦目标定义、契约审批与风险把关",
          "必须学会同时手写五种编程语言的底层汇编",
          "不再需要理解任何系统架构与业务边界",
        ],
        correctIndex: 1,
        explanation:
          "人类不再被琐碎语法与重复编码消耗精力，而是站在管理与架构视角定义目标、审核 SDD/DoD 并调控 Agent 团队高效产出。",
      },
    ],
  },
};
