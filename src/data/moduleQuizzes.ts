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
  reviewTarget?: QuizReviewTarget;
}

export type SanitizedQuizQuestion = QuizQuestion;

export interface ModuleQuiz {
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  subtitle: string;
  backgroundColor?: string;
  questions: QuizQuestion[];
}

export const MODULE_QUIZZES: Record<string, ModuleQuiz> = {
  "m1": {
    "moduleId": "m1",
    "moduleNumber": 1,
    "moduleTitle": "AI Coding 研发范式革命",
    "subtitle": "意图架构师、全量上下文与 SDD/DoD 闭环检验",
    "backgroundColor": "#020205",
    "questions": [
      {
        "id": "m1-q1",
        "topic": "意图架构师能力模型",
        "question": "在 AI Native 研发时代，人类“意图架构师”最核心的三项竞争力是什么？",
        "options": [
          "手写正则速度、记忆框架 API、手工切图能力",
          "抽象能力（定义边界）、评估能力（制定 DoD）、编排能力（调度 Agent）",
          "熟练背诵算法模板、手动配置 Webpack、逐行代码补全",
          "单纯依赖行内自动补全并手动复制粘贴代码片段"
        ],
        "reviewTarget": {
          "labId": "plan-prompt",
          "label": "实操 Lab 01 · Plan→Agent 提示词沙盘"
        }
      },
      {
        "id": "m1-q2",
        "topic": "全量上下文与 Context Caching",
        "question": "在代码场景中，为什么 1M+ 全量上下文配合 Context Caching 能取代传统 RAG？",
        "options": [
          "代码是强图结构与长程依赖，RAG 切片会破坏语义，而 KV Cache 预加载兼顾 100% 召回与低延迟",
          "RAG 无法处理任何中文注释，只能处理英文变量名",
          "Context Caching 会自动把代码编译成二进制机器码",
          "全量上下文不需要遵循任何架构规范或项目依赖关系"
        ],
        "reviewTarget": {
          "labId": "agent-harness",
          "label": "深入 Lab 06 · 上下文压缩与 Harness"
        }
      },
      {
        "id": "m1-q3",
        "topic": "SDD 与 DoD 确定性闭环",
        "question": "在从 Intent 到上线的确定性工作流中，SDD 与 DoD 分别承担什么职责？",
        "options": [
          "SDD 负责自动部署容器，DoD 负责生成 UI 设计稿",
          "两者都是纯展示型文档，不参与 AI 的实际代码生成与验证",
          "SDD 将意图固化为可执行架构契约与蓝图，DoD 作为验收门禁驱动 AI 自纠错达标",
          "SDD 只用于前端样式调整，DoD 只用于统计代码行数"
        ],
        "reviewTarget": {
          "labId": "plan-prompt",
          "label": "复盘 Lab 01 · SDD 与 DoD 检查点"
        }
      },
      {
        "id": "m1-q4",
        "topic": "Agent 时代的软件工程基本功",
        "question": "既然 Coding Agent 已经能代写全部代码，为什么深刻理解软件工程基本功的开发者依然大幅胜出“盲目 Vibe Coder”？",
        "options": [
          "因为 Coding Agent 无法识别任何现代编程语言语法，必须靠人工手敲循环",
          "懂基本功才能识别并驾驶 Agent 应对延迟/可用性/一致性/可靠性/可维护性/简洁性/成本等权衡，并设计好供 AI 消费的底层数据架构",
          "因为架构方案从原型到百万用户规模化阶段始终保持一成不变",
          "因为全栈能力只需要关注前端 UI 组件，不需要管数据生命周期与爆炸半径"
        ],
        "reviewTarget": {
          "moduleId": "m1",
          "label": "回看 Module 1 核心讲义"
        }
      }
    ]
  },
  "m2": {
    "moduleId": "m2",
    "moduleNumber": 2,
    "moduleTitle": "全量代码库理解",
    "subtitle": "噪音过滤、跨模块重构与自动化审计检验",
    "backgroundColor": "#050510",
    "questions": [
      {
        "id": "m2-q1",
        "topic": "精简上下文与去噪",
        "question": "将整个代码库喂给 2M+ 上下文模型前，最关键的预处理原则是什么？",
        "options": [
          "把 node_modules、构建产物和二进制日志全部打包输入",
          "排除构建产物与依赖目录等噪音，保留核心源码、类型定义与架构配置",
          "随机删除一半的测试文件以减少字符数",
          "只输入 CSS 样式表，不输入任何业务逻辑代码"
        ],
        "reviewTarget": {
          "moduleId": "m2",
          "label": "回看 Module 2 · 上下文去噪讲义"
        }
      },
      {
        "id": "m2-q2",
        "topic": "跨模块深度重构",
        "question": "升级核心支付接口签名时，全量代码库理解相比局部编辑的核心优势是什么？",
        "options": [
          "只修改接口声明文件，其余报错留给运行期排查",
          "自动追踪跨文件调用链与连锁反应，同步更新所有上下游适配层与测试",
          "强制把所有微服务合并成单个 HTML 文件",
          "跳过类型检查直接部署到生产环境"
        ],
        "reviewTarget": {
          "labId": "agent-harness",
          "label": "体验 Lab 06 · 跨文件上下文压缩"
        }
      },
      {
        "id": "m2-q3",
        "topic": "安全与数据流审计",
        "question": "全量上下文如何提升 AI 安全审计与 Code Review 的准确性？",
        "options": [
          "仅靠正则匹配密码关键词",
          "忽略外部输入，只检查代码缩进是否美观",
          "跨越单文件限制进行深度数据流分析，追踪从入口请求到数据库落盘的完整污点路径",
          "自动关闭所有防火墙与鉴权中间件"
        ],
        "reviewTarget": {
          "labId": "smart-code-review",
          "label": "实操 Lab 12 · Bugbot 安全规则审查"
        }
      }
    ]
  },
  "m3": {
    "moduleId": "m3",
    "moduleNumber": 3,
    "moduleTitle": "Cursor 全栈实战与商业化上线",
    "subtitle": "Design-to-Code、Supabase/Stripe 闭环与 Vibe Debugging 检验",
    "backgroundColor": "#100505",
    "questions": [
      {
        "id": "m3-q1",
        "topic": "Stripe 支付闭环安全",
        "question": "接入 Stripe 订阅付费时，为什么不能在用户跳转到前端 `/success` 页面后直接为其开通会员权益？",
        "options": [
          "因为 Stripe 后台不允许配置 `/success` 路径",
          "任意用户都可直接访问 `/success` URL 绕过付款；权益发放必须只信任服务端 Webhook 签名验证结果",
          "因为 `/success` 页面无法加载 Tailwind CSS 样式",
          "只有移动端浏览器支持触发前端跳转"
        ],
        "reviewTarget": {
          "moduleId": "m3",
          "label": "回看 Module 3 · 支付与服务端安全"
        }
      },
      {
        "id": "m3-q2",
        "topic": "Vibe Debugging 排障心法",
        "question": "遇到页面白屏或点击无响应且连续让 AI 修改 3 次仍越改越乱时，最高效的工程处理方式是什么？",
        "options": [
          "继续盲目追加第 10 轮“请再帮我修一下”提示词",
          "截图 + 附上 F12 Console/Network 报错精准定位；若仍发散则立刻通过 Checkpoint/Git 回滚到上一个绿灯版本换思路",
          "把所有 TypeScript 类型全部改成 any 以消除控制台输出",
          "直接删除整个前端组件目录重新初始化仓库"
        ],
        "reviewTarget": {
          "labId": "vibe-stack-map",
          "label": "打开 Lab 07 · 报错解码与排障矩阵"
        }
      },
      {
        "id": "m3-q3",
        "topic": "长时任务与测试防作弊",
        "question": "使用 `PRD.md` + `feature_list.json` 驱动跨会话开发时，应如何防止 AI 为了凑“全部通过”而投机取巧？",
        "options": [
          "允许 AI 在测试报错时直接注释或删掉失败断言",
          "不写任何自动化测试，全部靠肉眼点击确认",
          "在规则中严禁削弱或跳过失败测试，每完成一项功能通过客观命令验收后再打勾并执行原子 Git Commit",
          "要求 AI 在单次对话内一口气改完 50 个不相关文件"
        ],
        "reviewTarget": {
          "labId": "efficiency-assessment",
          "label": "自测 Lab 09 · Sonar 7 Habits 门禁"
        }
      },
      {
        "id": "m3-q4",
        "topic": "高信噪比前端参考输入",
        "question": "用 Cursor 实现前端交互与视觉时，为什么不建议仅输入“干净一点、高级但不要太高级”等形容词？",
        "options": [
          "因为 Cursor 只支持英文提示词，不支持中文审美形容词",
          "模糊形容词会留出过大盲猜空间（Garbage in, garbage out）；应提供整站局部备注图、导航展开态截图或对应框架组件源码与参数",
          "因为形容词会触发 Tailwind CSS 编译语法错误",
          "因为必须在每次生成前把三家不同风格网站的页面全部拼进同一文件"
        ],
        "reviewTarget": {
          "labId": "ui-inspiration",
          "label": "浏览 Lab 08 · 23 站 UI 参考库"
        }
      }
    ]
  },
  "m4": {
    "moduleId": "m4",
    "moduleNumber": 4,
    "moduleTitle": ".cursor/rules、AGENTS.md 与 MCP 架构",
    "subtitle": "规则触发机制、惰性 MCP 发现与外部工具隔离检验",
    "backgroundColor": "#050510",
    "questions": [
      {
        "id": "m4-q1",
        "topic": ".cursor/rules (.mdc) 精准触发",
        "question": "为了防止规则文件过长塞爆上下文窗口，`.cursor/rules/*.mdc` 应当如何合理配置触发机制？",
        "options": [
          "把所有数据库、CSS、测试和部署细节全部设为 alwaysApply: true",
          "仅把全局核心约束放进 00-project-dna / AGENTS.md，其余规范按 globs 路径或描述按需自动挂载",
          "把所有规则写成注释放进 package.json 中",
          "每次改文件都手动复制粘贴 2000 行规范进对话框"
        ],
        "reviewTarget": {
          "labId": "cursor-rules",
          "label": "实操 Lab 02 · .mdc 规则与 AGENTS 沙盘"
        }
      },
      {
        "id": "m4-q2",
        "topic": "MCP 工具发现与上下文压缩",
        "question": "面对 GitHub、Postgres、Context7、TaskMaster 等众多 MCP 工具时，如何避免上下文被海量 JSON Schema 占满？",
        "options": [
          "一次性启用 50 个 MCP 服务的所有全量工具描述并常驻系统提示词",
          "采用惰性工具发现与只读/写入分离：仅挂载当前任务必需 MCP，且对写操作设置明确人类确认门禁",
          "把所有数据库密码直接硬编码进 MCP 客户端前端代码中",
          "禁用 GitHub 和 Postgres MCP，全靠模型凭记忆猜测表字段名"
        ],
        "reviewTarget": {
          "labId": "mcp-toolbox",
          "label": "实操 Lab 03 · MCP 配置与 DoD 验收"
        }
      },
      {
        "id": "m4-q3",
        "topic": "规则自进化（90-self-improve.mdc）",
        "question": "当 Cursor Agent 在同一类接口或构建错误上连续返工两次后，工程团队如何防止它下次再犯？",
        "options": [
          "清空对话窗口重新祈祷 AI 下次发挥好一点",
          "把根因与防呆约束沉淀进 .cursor/rules 或 AGENTS.md 并在团队共享，让规则库持续反哺进化",
          "关掉 TypeScript 严格模式和 ESLint 检查",
          "禁止在项目中使用 Git 版本控制"
        ],
        "reviewTarget": {
          "labId": "prompt-crafting",
          "label": "演练 Lab 14 · Prompt Crafting 规则生成"
        }
      }
    ]
  },
  "m5": {
    "moduleId": "m5",
    "moduleNumber": 5,
    "moduleTitle": "DoD 完成定义与高质量自愈闭环",
    "subtitle": "Sonar 7 Habits、IASalut 五层测试与终端自动纠错检验",
    "backgroundColor": "#051005",
    "questions": [
      {
        "id": "m5-q1",
        "topic": "Sonar 7 Habits · 破除生产力悖论",
        "question": "根据 Sonar《7 Habits of Highly Effective AI Coding》，为什么很多团队用了 AI 写代码速度暴增，整体交付却反而变慢？",
        "options": [
          "因为 AI 工具生成的每行代码都不受版权法保护",
          "AI 产量暴增将瓶颈转移到了 Review 与排错阶段；若缺乏责任归属、清理 Stray Code（死代码）与更严苛的 SAST 扫描，技术债会迅速堵死交付",
          "因为现代计算机运行单元测试的速度比大模型生成还慢",
          "因为团队没有给每份源码手动添加彩色表情符号"
        ],
        "reviewTarget": {
          "labId": "efficiency-assessment",
          "label": "自测 Lab 09 · Sonar 7 Habits 评估"
        }
      },
      {
        "id": "m5-q2",
        "topic": "防范测试作弊（Reward Hacking）与五层验证",
        "question": "让 AI 自写单测并自检通过时，最隐蔽且危险的“Reward Hacking（奖励黑客）”陷阱是什么？",
        "options": [
          "AI 为每个核心业务接口写了过多边界异常断言",
          "AI 编写 expect(true).toBe(true) 等弱断言、跳过失败用例或删改测试条件来“凑绿灯”，掩盖真实逻辑或数值错误",
          "AI 使用真实数据库隔离环境运行集成测试",
          "AI 严格控制了函数的圈复杂度（Cyclomatic Complexity）"
        ],
        "reviewTarget": {
          "labId": "smart-code-review",
          "label": "演练 Lab 12 · 测试作弊与规则审查"
        }
      },
      {
        "id": "m5-q3",
        "topic": "DoD 与终端自愈闭环（3-Nudge）",
        "question": "当 Cursor Agent 在终端运行 DoD 验证连续报错时，合理的自动化收敛机制是什么？",
        "options": [
          "让 Agent 无限循环盲改 100 次直到配额耗尽",
          "读取报错堆栈做有界自愈（如 3 次 Nudge 限制）；若跨过阈值仍未收敛，立刻用 Checkpoint/Git 回滚并向人类架构师求助",
          "直接把报错的测试文件从仓库删除",
          "跳过 tsc 和 build，直接手动修改线上编译产物"
        ],
        "reviewTarget": {
          "moduleId": "m5",
          "label": "回看 Module 5 · DoD 自愈闭环讲义"
        }
      }
    ]
  },
  "m6": {
    "moduleId": "m6",
    "moduleNumber": 6,
    "moduleTitle": "Background Agents、CLI 与 Bugbot",
    "subtitle": "异步分支并行、PR 自动化审计与三层密钥安全防线检验",
    "backgroundColor": "#050510",
    "questions": [
      {
        "id": "m6-q1",
        "topic": "Issue-to-PR 异步工作流",
        "question": "在独立开发者实战中，什么样的任务最适合交给云端 Background Agents + Cursor CLI 异步处理？",
        "options": [
          "边界完全模糊、还没想清楚商业模式的核心产品方向探索",
          "有明确 Issue 契约与 DoD 检查命令的任务（如修复边缘 Bug、升级依赖、补齐单元测试与文档）",
          "直接把未测试代码绕过审查强行推送到生产主分支",
          "需要团队成员面对面讨论商业定价策略的会议纪要"
        ],
        "reviewTarget": {
          "labId": "code-health-sim",
          "label": "仿真 Lab 13 · Agent 代码健康度曲线"
        }
      },
      {
        "id": "m6-q2",
        "topic": "Bugbot 混合评审与反自偏见",
        "question": "为什么不能让刚刚写出代码的同一个对话会话自己兼任终审裁判，而需要独立上下文的 Bugbot / SAST 守门？",
        "options": [
          "同一个会话窗口存在惯性偏好与上下文自偏见（LLM-as-a-Judge 盲区），容易忽略自己在写代码时做出的错误假设",
          "因为 Bugbot 只能审查 CSS 文件，不能审查 TypeScript 文件",
          "因为独立会话不需要遵守项目的 .cursor/rules",
          "因为关闭安全扫描能让 CI 构建速度更快"
        ],
        "reviewTarget": {
          "labId": "bugbot-review",
          "label": "实操 Lab 04 · Bugbot 实时评审台"
        }
      },
      {
        "id": "m6-q3",
        "topic": "三层密钥与供应链安全门禁",
        "question": "参考工程安全基线，防止 AI 把硬编码密钥或危险漏洞带入生产仓库的纵深防线应当如何设计？",
        "options": [
          "只在口头上提醒 AI“不要泄露密钥”，不做任何工具拦截",
          "本地 pre-commit（Gitleaks）拦截提交 + CI 深度历史扫雷（TruffleHog）+ 静态语义审计（CodeQL / Bugbot）三层纵深防御",
          "把所有密钥写进 README.md 方便团队共享",
          "使用前端 VITE_ 前缀环境变量存放数据库管理员密码"
        ],
        "reviewTarget": {
          "labId": "smart-code-review",
          "label": "实操 Lab 12 · 安全门禁规则沙盘"
        }
      }
    ]
  },
  "m7": {
    "moduleId": "m7",
    "moduleNumber": 7,
    "moduleTitle": "独立开发者 ROI 与架构大脑",
    "subtitle": "70% 困境突围、MTTV 效能度量与规则资产复利检验",
    "backgroundColor": "#020205",
    "questions": [
      {
        "id": "m7-q1",
        "topic": "Addy Osmani · 70% 困境与知识悖论",
        "question": "《Beyond Vibe Coding》提出的「70% 困境」与「知识悖论」对独立开发者与产品经理的核心警示是什么？",
        "options": [
          "AI 永远只能写 70 行以内的单文件脚本",
          "AI 能极快做出前 70% 的原型（Bootstrapper），但最后 30% 的安全/并发/集成若不懂底层原理会陷入“进一退二”死循环，必须靠主动审阅与系统边界跨越",
          "只要花更多钱买更贵的模型，就再也不需要任何代码审查与架构设计",
          "产品原型完成后绝不能重构成生产代码"
        ],
        "reviewTarget": {
          "moduleId": "m7",
          "label": "回看 Module 7 · 70% 困境与 ROI 讲义"
        }
      },
      {
        "id": "m7-q2",
        "topic": "AI 时代工程效能真实 ROI 指标",
        "question": "在 Cursor 研发体系中，最能真实衡量产品开发投资回报率（ROI）的指标组合是？",
        "options": [
          "每日生成的代码总行数和注释字数",
          "MTTV（想法到可验证上线周期）、Plan 后首轮通过率、终端自愈率与返工率",
          "同时打开的浏览器标签页数量",
          "项目 node_modules 文件夹的总磁盘占用"
        ],
        "reviewTarget": {
          "labId": "velocity-heatmap",
          "label": "查看 Lab 15 · Developer Velocity 热力图"
        }
      },
      {
        "id": "m7-q3",
        "topic": "个人架构大脑资产复利",
        "question": "一个人如何把每次用 Cursor 踩坑排错的经验，沉淀为下个独立产品的“启动加速度”？",
        "options": [
          "每次开新项目都从零手写提示词，不保存任何规则或模板",
          "将验证过的 .cursor/rules (.mdc)、SKILL.md、MCP 配置与高分 UI 参考备注归档进个人知识库，形成可复用架构大脑",
          "把旧项目的所有业务代码直接整包复制而不做任何精简",
          "完全依赖模型临场自由发挥，不保留任何历史经验"
        ],
        "reviewTarget": {
          "labId": "book-kb",
          "label": "打开 Lab 05 · AI 书籍知识库备课台"
        }
      }
    ]
  },
  "m8": {
    "moduleId": "m8",
    "moduleNumber": 8,
    "moduleTitle": "长程软件任务的 Harness 与多 Coding Agent 协同",
    "subtitle": "系统五类 Harness、init.sh + feature_list.json 状态锚点与 Git Worktree 并发隔离检验",
    "backgroundColor": "#050510",
    "questions": [
      {
        "id": "m8-q1",
        "topic": "长程 Harness 状态与交接锚点",
        "question": "跨超过 15 轮会话执行大型重构时，如何配置系统五类 Harness 中的「状态与交接」避免 Agent 丢失初始架构边界？",
        "options": [
          "把所有历史聊天记录原封不动继续塞到 100% 上下文溢出为止",
          "用 init.sh 锁定可重复环境，用 feature_list.json 固化防删状态项，并按阶段生成含不可破坏契约的 ACC 交接卡切换新会话",
          "每当对话变长就自动清空所有测试文件以节省上下文",
          "只靠口头嘱咐模型“千万别忘掉刚才的约定”"
        ],
        "reviewTarget": {
          "labId": "agent-harness",
          "label": "演练 Lab 06 · 长程 Coding Harness"
        }
      },
      {
        "id": "m8-q2",
        "topic": "多 Coding Agent 并发目录隔离",
        "question": "当两个以上 Coding Agent 同时修改同一仓库中的多个模块时，防止覆盖冲突与类型撕裂的核心做法是？",
        "options": [
          "让所有 Agent 直接在同一个工作目录轮流覆盖保存",
          "先锁定共享类型/API 契约，再为每个 Agent 分配独立 Git Worktree 与明确目录写权限所有权",
          "关闭 TypeScript 类型检查以便各写各的接口",
          "最后由最慢的一个 Agent 强行 `git push --force` 覆盖他人代码"
        ],
        "reviewTarget": {
          "labId": "agent-harness",
          "label": "演练 Lab 06 · Worktree 与多 Agent 协同"
        }
      },
      {
        "id": "m8-q3",
        "topic": "M6 vs M8 vs M12 系统边界辨析",
        "question": "本课程体系中，M6、M8 与 M12 三者在定位与关注对象上的严格边界划分是什么？",
        "options": [
          "三者都在讲同一个如何写 ChatGPT 提示词的技巧",
          "M6 聚焦云端/CLI Issue-to-PR 异步协作；M8 聚焦长程本地软件任务的五类 Coding Harness；M12 聚焦开发面向终端用户的运行时 Agent 与知识库系统",
          "M8 用来替代 M12 的线上 RAG 数据库实现",
          "M6 只适用于非技术产品经理，M8 只用来浏览 PDF 书单"
        ],
        "reviewTarget": {
          "moduleId": "m8",
          "label": "回看 Module 8 · 五类 Harness 架构"
        }
      }
    ]
  },
  "m9": {
    "moduleId": "m9",
    "moduleNumber": 9,
    "moduleTitle": "Vibe Coder's Handbook 全栈工具图谱与白盒实战",
    "subtitle": "Web 三层架构、Either/Or 选型决策、45% 安全警钟与报错解码检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m9-q1",
        "topic": "元框架本质与状态分层",
        "question": "在 Cursor 生成现代 React 应用时，关于 Next.js、Zustand 与 TanStack Query 的分工，下列哪项描述是正确的？",
        "options": [
          "Next.js 会彻底淘汰 React，Zustand 与 TanStack Query 只能二选一安装",
          "Next.js 是架在 React 之上的全栈元框架（负责 SSR/路由/API）；Zustand 管浏览器 UI 状态，TanStack Query 管服务端请求缓存，二者协同配合",
          "React 可以不经编译直接在浏览器当作原始机器码执行，无需任何 Build Tool",
          "Tailwind CSS 会把所有前端逻辑自动转换成 PostgreSQL 数据库表"
        ],
        "reviewTarget": {
          "labId": "vibe-stack-map",
          "label": "查看 Lab 07 · Vibe 全栈工具图谱"
        }
      },
      {
        "id": "m9-q2",
        "topic": "Vibe Coding 45% 安全漏洞警钟",
        "question": "研究统计 45% 的 AI 生成代码存在安全漏洞。当 Cursor 生成登录、支付或数据库操作代码时，哪套组合最能从机制上守住底线？",
        "options": [
          "把 DATABASE_URL 放进前端组件并在跳转 /success 页后直接开通权限",
          "在浏览器端用原生 JavaScript 手写 SQL 拼接字符串，以减少依赖体积",
          "客户端永不信任 + 服务端入口用 Zod 严格校验 + 数据库通过 Drizzle/Prisma ORM 参数化查询 + 密钥留在服务端 .env",
          "为了快速上线先关闭 HTTPS 与 Supabase RLS 策略"
        ],
        "reviewTarget": {
          "labId": "arch-decision-sim",
          "label": "挑战 Lab 11 · 架构决策模拟器"
        }
      },
      {
        "id": "m9-q3",
        "topic": "报错解码黄金法则",
        "question": "开发或部署时屏幕出现红字报错（如 Hydration mismatch 或 ECONNREFUSED），第一步最高效的排障动作是什么？",
        "options": [
          "忽略第一行错误信息，直接让 AI 从头删掉整个 src 目录重写",
          "精读并复制报错第一行判断归因（如水合差异移入 useEffect、端口拒绝检查服务与连接串），清理缓存后把精简现场交给 AI",
          "把 package.json 里的 dependencies 全部删除并手动修改 node_modules 源码",
          "在报错组件外层套一个空 catch 块把错误静默吞掉"
        ],
        "reviewTarget": {
          "labId": "vibe-stack-map",
          "label": "查看 Lab 07 · 报错解码实验室"
        }
      }
    ]
  },
  "m10": {
    "moduleId": "m10",
    "moduleNumber": 10,
    "moduleTitle": "AI Coding 审美积累与 VibeCoding 效能实践",
    "subtitle": "高信噪比视觉输入、整站/局部参考拆解与组件源码喂料检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m10-q1",
        "topic": "Garbage In, Garbage Out · 拒绝模糊形容词",
        "question": "让 AI 实现界面时，为什么“干净一点、有设计感、高级但不要太高级”往往适得其反？",
        "options": [
          "因为大模型只能识别 CSS 十六进制色号，无法理解汉字",
          "抽象形容词为 AI 留下了过大猜测空间；应改用带具体备注的案例图、留白比例或直接喂给调好参数的组件源码",
          "因为高级感必须靠人工手写原生 HTML，Cursor 不支持 Tailwind CSS",
          "因为系统提示词不允许超过 10 个字"
        ],
        "reviewTarget": {
          "labId": "ui-inspiration",
          "label": "浏览 Lab 08 · 高信噪比 UI 参考库"
        }
      },
      {
        "id": "m10-q2",
        "topic": "整站与区块借鉴原则（Land-book / Minimal Gallery）",
        "question": "借鉴多个整站参考案例来构建自己的产品落地页时，哪项做法最容易导致视觉灾变？",
        "options": [
          "先确定自己的页面内容结构与信息顺序，再统一字体、间距和色板",
          "把三家不同网站各自最好看的 Hero、功能卡和页脚直接拼进同一页面",
          "参考 Minimal Gallery 极简案例时，明确指明必须保留哪些业务数据防止被删空",
          "按行业从 Websitevice 筛选对口参考，连同官方布局特征描述一起喂给 Cursor"
        ],
        "reviewTarget": {
          "labId": "ui-inspiration",
          "label": "对比 Lab 08 · 整站类参考案例"
        }
      },
      {
        "id": "m10-q3",
        "topic": "局部盲区：导航与页脚喂料",
        "question": "使用 Navbar Gallery 与 Footer Design 为 Cursor 提供局部改版参考时，最关键的输入细节是？",
        "options": [
          "Navbar 只截默认收起态一排文字即可，下拉面板让 AI 自行编造",
          "同时截取 Navbar 收起态与展开态 Mega Menu 截图，并为 Footer 附上真实链接清单与手机端视图",
          "页脚只需放一个 Logo 和 copyright 文字，不需考虑移动端布局",
          "把网站所有正文内容都塞进顶部导航栏里"
        ],
        "reviewTarget": {
          "moduleId": "m10",
          "label": "回看 Module 10 · 审美与局部盲区讲义"
        }
      },
      {
        "id": "m10-q4",
        "topic": "实现源码类组件库喂料规范",
        "question": "在从 React Bits、Vue Bits、Codrops 与 Animata 等实现类参考站提取效果喂给 Cursor 时，哪项习惯最能提升一次成功效能？",
        "options": [
          "直接把 React Bits 的代码粘贴进 Vue 项目，让 AI 边改需求边顺手跨框架翻译",
          "只给 AI 看一张静态网页截图，然后不断要求“打字机再丝滑自然一点”",
          "确保技术栈对口（Vue 选 Vue Bits + motion-v），先调好离散参数（间隔/循环/光标/颜色），并检查 Codrops WebGPU 等兼容性与 Uiverse 统一收口",
          "把全站每个卡片都加上 Aceternity 发光边框和 Magic UI 跑马灯特效"
        ],
        "reviewTarget": {
          "labId": "ui-inspiration",
          "label": "提取 Lab 08 · 源码类组件 Prompt"
        }
      }
    ]
  },
  "m11": {
    "moduleId": "m11",
    "moduleNumber": 11,
    "moduleTitle": "Agent 产品蓝图、Workflow 决策与治理架构",
    "subtitle": "Workflow vs Agent 判定、Data/Prompt PRD 与 HITL 审批矩阵检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m11-q1",
        "topic": "Workflow vs 自主 Agent 判定",
        "question": "在立项评审一个需要处理企业固定格式发票并入账的需求时，应如何选择架构形态？",
        "options": [
          "无条件做成全自主多轮 Agent，体现技术先进性",
          "优先采用确定性 Workflow（结构化 OCR + 规则校验 + 固定状态流），仅对无法枚举分支的异常工单挂接局部推理节点",
          "让多个自主 Agent 在生产数据库上自由试错直到金额平衡",
          "不设任何输入格式验证，直接由 Prompt 决定入账字段"
        ],
        "reviewTarget": {
          "moduleId": "m11",
          "label": "回看 Module 11 · Workflow vs Agent 决策树"
        }
      },
      {
        "id": "m11-q2",
        "topic": "Data PRD 核心要素",
        "question": "面向运行时知识库的 Data PRD 必须明确定义哪三项硬约束，才能让研发团队安全落地？",
        "options": [
          "仅写明“把公司全部 PDF 上传即可”",
          "数据源敏感分级、权限隔离键（tenantId / roleScope）与版本失效淘汰机制（active / deprecated）",
          "只规定界面卡片背景颜色和圆角大小",
          "允许模型回答时自由忽略文档失效日期"
        ],
        "reviewTarget": {
          "moduleId": "m11",
          "label": "回看 Module 11 · Data PRD 规格"
        }
      },
      {
        "id": "m11-q3",
        "topic": "Prompt PRD 与 HITL 人工审批矩阵",
        "question": "在 Prompt PRD 中设计费用报销或医疗建议 Agent 时，哪些操作必须落在 HITL（Human-in-the-loop）强制确认区？",
        "options": [
          "只读检索公开 FAQ 列表",
          "不可逆写操作（退款/打款/改权限）、检索置信度低于阈值或涉及合规高危决策的输出",
          "把响应文本从 Markdown 转成纯文本",
          "记录一条只读调试耗时日志"
        ],
        "reviewTarget": {
          "moduleId": "m11",
          "label": "回看 Module 11 · HITL 矩阵"
        }
      },
      {
        "id": "m11-q4",
        "topic": "非技术角色与工程团队交接边界",
        "question": "产品经理完成 M11 Agent 产品蓝图后，不直接编写后端代码的情况下可以如何完成严谨验证？",
        "options": [
          "凭个人直觉口头宣布方案零风险可直接上线",
          "基于 M13-Gov 预制轨迹与固定评测集完成模拟治理评审并产出 HITL 签字单，再交接给 M12/M13-Eng 工程团队做实测验证",
          "把开发环境的数据库密码放进 PRD 文档分发给全员",
          "跳过权限设计直接发布到公开互联网"
        ],
        "reviewTarget": {
          "moduleId": "m13-gov",
          "label": "查看 Module 13-Gov · 治理 Capstone"
        }
      }
    ]
  },
  "m12": {
    "moduleId": "m12",
    "moduleNumber": 12,
    "moduleTitle": "运行时 Agent 工作流与领域知识库工程实现",
    "subtitle": "工程 KB vs 运行时 KB、ACL Pre-filter、混合检索与熔断机制检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m12-q1",
        "topic": "两条 KB 链路严格拆分",
        "question": "为什么不能把“给 Cursor 看的研发规范文档导出包”直接宣称为线上应用的“运行时领域知识库”？",
        "options": [
          "因为两者使用的字体大小不一样",
          "研发工程 KB 面向 Coding Agent 读仓库代码与规则；运行时 KB 必须独立处理实时数据接入、租户 ACL 过滤、引用溯源、Tombstone 淘汰与线上检索评测",
          "因为运行时应用不需要引用外部文档",
          "因为 Markdown 文件不能被 Node.js 读取"
        ],
        "reviewTarget": {
          "labId": "runtime-kb-rag",
          "label": "实操 Lab 18 · 运行时 KB ACL 沙盘"
        }
      },
      {
        "id": "m12-q2",
        "topic": "ACL 检索前过滤红线",
        "question": "实现带多租户和角色隔离的 RAG 检索接口时，关于权限过滤的唯一安全位置是？",
        "options": [
          "先向量召回全库 Top-10，再在 System Prompt 里警告模型“请自行过滤无权限片段”",
          "在执行向量/BM25 查询的过滤条件（Pre-filter）中强制匹配 tenantId、role 与 status === 'active'，绝不让无权原文进入模型上下文",
          "检索出原文返回给浏览器，由前端 CSS 隐藏",
          "每周人工抽查一次聊天记录即可"
        ],
        "reviewTarget": {
          "labId": "runtime-kb-rag",
          "label": "对照 Lab 18 · Pre-filter vs Post-prompt"
        }
      },
      {
        "id": "m12-q3",
        "topic": "Citation Grounding 与 Tombstone 淘汰",
        "question": "当某条公司报销政策更新为 v2 且旧版 v1 标为 deprecated 后，运行时系统应当如何防止回答旧制度？",
        "options": [
          "继续保留 v1 并希望向量相似度自动变低",
          "在索引更新链路对旧切片执行 Tombstone 标记/删除（过滤 status !== 'active'），并强制每条回答绑定 docId + version + section 引用锚点",
          "把所有文档全部合并成一个 10MB 纯文本",
          "禁止用户询问与时间相关的政策条款"
        ],
        "reviewTarget": {
          "labId": "runtime-kb-rag",
          "label": "实操 Lab 18 · Tombstone 与引用溯源"
        }
      },
      {
        "id": "m12-q4",
        "topic": "运行时 Agent 步数与费用熔断",
        "question": "在线上服务中运行带工具调用循环的 Agent 时，遇到外部 API 连续超时该如何防止死循环失控？",
        "options": [
          "取消步数限制让它无限重试直到恢复",
          "强制执行工具白名单、单工具超时、maxSteps / 费用预算熔断，以及连续失败后降级转人工（HITL）",
          "允许模型自动编写并执行任意 shell 脚本绕过 API",
          "直接向客户端返回未捕获异常堆栈"
        ],
        "reviewTarget": {
          "labId": "agent-workflow-sim",
          "label": "演练 Lab 19 · 工具循环与熔断沙盘"
        }
      }
    ]
  },
  "m13-gov": {
    "moduleId": "m13-gov",
    "moduleNumber": 13,
    "moduleTitle": "Agent 系统产品与治理 Capstone（无代码版）",
    "subtitle": "预制轨迹风险审计、HITL 门禁签字与模拟评审边界声明检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m13-gov-q1",
        "topic": "轨迹审计高危模式识别",
        "question": "在审查一条预制 Agent 轨迹时发现：用户身份为 `role: intern`，检索结果却出现了标有 `salary-band-internal` 的文档摘要。最直接的根因定级是？",
        "options": [
          "轻微文案排版瑕疵，可带病上线",
          "P0 高危 ACL 漏过滤漏洞：检索层未在查询前强制校验 roleScope，必须退回工程补齐 Pre-filter 探针后重评",
          "大模型温度参数 temperature 设高了 0.1",
          "前端加载动画时间太短"
        ],
        "reviewTarget": {
          "labId": "gov-trajectory-eval",
          "label": "实操 Lab 20 · 预制轨迹风险评估台"
        }
      },
      {
        "id": "m13-gov-q2",
        "topic": "无引用编造与拒答边界",
        "question": "若评测轨迹显示检索返回 0 条高置信片段，但 Agent 依然流利编造出“公司规定每周五可报销 200 元”，在 Prompt PRD 评审中应如何处置？",
        "options": [
          "表扬模型表达流畅，直接批准上线",
          "判为忠实度（Faithfulness）失效：补充强制引用校验规则与置信度不足拒答/转人工条件",
          "把系统提示词改成“请尽量说得更自信”",
          "增加输出最大字数上限"
        ],
        "reviewTarget": {
          "labId": "gov-trajectory-eval",
          "label": "演练 Lab 20 · 忠实度风险识别"
        }
      },
      {
        "id": "m13-gov-q3",
        "topic": "模拟治理评审的严谨边界",
        "question": "完成 M13-Gov 无代码版治理评审并导出报告后，关于“模拟评审结论”的准确对外表述是？",
        "options": [
          "系统已在真实生产流量下完成百万级高并发压测并零故障运行",
          "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证",
          "无代码评审可以完全替代工程团队的后端鉴权与单元测试",
          "签字后线上永远不再需要监控或回归测试"
        ],
        "reviewTarget": {
          "moduleId": "m13-gov",
          "label": "回看 M13-Gov · 模拟验证边界声明"
        }
      },
      {
        "id": "m13-gov-q4",
        "topic": "Go / Conditional / No-Go 决策规范",
        "question": "面对“未触发越权，但高危写操作工具尚缺人工确认框，且 2 条过期文档仍被召回”的评审样本，应下达哪种审签结论？",
        "options": [
          "直接 Go 全面开放全员使用",
          "No-Go / Conditional 阻断整改：必须先落实写操作 HITL 审批门禁与 Tombstone 淘汰回归验证后方可放行",
          "忽略过期文档问题，以后每年手动清理一次",
          "只给非研发部门临时开放"
        ],
        "reviewTarget": {
          "labId": "gov-trajectory-eval",
          "label": "完成 Lab 20 · 审签判定输出"
        }
      }
    ]
  },
  "m13-eng": {
    "moduleId": "m13-eng",
    "moduleNumber": 14,
    "moduleTitle": "生产级 Agent、Harness 与运行时 KB 工程 Capstone",
    "subtitle": "双层 Eval（KB 检索 + 端到端轨迹）、五类 Harness 护栏与回归门禁检验",
    "backgroundColor": "#040711",
    "questions": [
      {
        "id": "m13-eng-q1",
        "topic": "双层 Eval 体系拆分原则",
        "question": "在 M13-Eng 工程验收中，为什么不能只测一个最终端到端通过率，而必须把 KB 检索评测与 Agent 端到端评测拆开？",
        "options": [
          "为了把 CI 运行时间刻意拉长一倍",
          "拆开统计 Recall@K / 零越权 / 零过期与工具调用准确率 / 忠实度 / 步数熔断，才能精确定位失败究竟出在“检索没召回对”还是“Agent 推理跑偏”",
          "因为检索侧不需要自动化测试",
          "因为 Agent 端到端评测不需要 Golden Dataset"
        ],
        "reviewTarget": {
          "labId": "runtime-kb-rag",
          "label": "复盘 Lab 18 · 检索指标与 ACL 探针"
        }
      },
      {
        "id": "m13-eng-q2",
        "topic": "零越权与 Tombstone 自动化探针",
        "question": "工程 Capstone 自动化测试集里，关于安全与时效回归必须包含哪两类对抗用例？",
        "options": [
          "只测试 5 条管理员视角的正向标准问句",
          "跨租户/低权限角色越权探测（期望召回=0）与已标为 deprecated 的历史条款冲突探测（期望召回=0）",
          "仅检查前端按钮颜色是否符合设计稿",
          "允许测试用例用 `expect(true).toBe(true)` 占位通过"
        ],
        "reviewTarget": {
          "labId": "runtime-kb-rag",
          "label": "核验 Lab 18 · 越权与过期测试"
        }
      },
      {
        "id": "m13-eng-q3",
        "topic": "Coding Harness 支撑生产 Capstone 演进",
        "question": "多模块工程团队协作构建并长期迭代 M13-Eng Capstone 时，如何把 M8 的五类 Harness 真正用到项目仓库中？",
        "options": [
          "用完 Demo 后删掉所有 `.cursor/rules`、`feature_list.json` 与测试命令",
          "保留精简 AGENTS.md + 目录 globs .mdc（指令/范围）、`init.sh`（工具/环境）、状态/交接清单（状态）及全量 tsc + 越权/Eval 套件（验证）",
          "让所有开发者共用同一个无限长聊天框改全部后端路由",
          "把第三方密钥写入前端代码方便联调"
        ],
        "reviewTarget": {
          "labId": "agent-harness",
          "label": "复盘 Lab 06 · 五类 Coding Harness"
        }
      },
      {
        "id": "m13-eng-q4",
        "topic": "客观交付证据链",
        "question": "提交 M13-Eng 工程版 Capstone 验收时，最硬核的完成证明应当是什么？",
        "options": [
          "一份纯文字 PPT 描述“我们的 Agent 非常聪明”",
          "可重复运行的命令行测试退出码 0 证据（覆盖服务端 ACL/鉴权、Tombstone、预算熔断）、双层 Eval 基线指标与完整 Harness Runbook",
          "仅录屏一段理想输入的聊天演示视频",
          "口头承诺上线后再人工抽查报错"
        ],
        "reviewTarget": {
          "labId": "agent-workflow-sim",
          "label": "核验 Lab 19 · 熔断与预算验证"
        }
      }
    ]
  }
};
