import type { KnowledgeModuleCode } from "./teamKnowledgeBase.ts";

export type BookCategory =
  | "AI Architecture"
  | "AI Engineering"
  | "LLM & NLP"
  | "LLMOps & MLOps"
  | "Data Science"
  | "Machine Learning"
  | "Papers & Lectures";

export interface KnowledgeBookItem {
  id: string;
  title: string;
  authorOrSource: string;
  category: BookCategory;
  repoPath: string;
  externalUrl?: string;
  sizeMB: number;
  targetModules: KnowledgeModuleCode[];
  coreTakeaways: string;
  courseApplication: string;
  keywords: string[];
}

export interface CurriculumBookBundle {
  id: string;
  label: string;
  targetModule: KnowledgeModuleCode;
  goal: string;
  bookIds: string[];
}

const REPO_BASE = "https://github.com/MinhNguyenDS/AI-pdf-books";

export function getBookGithubUrl(repoPathOrBook: string | KnowledgeBookItem): string {
  if (typeof repoPathOrBook !== "string") {
    if (repoPathOrBook.externalUrl) return repoPathOrBook.externalUrl;
    return `${REPO_BASE}/blob/Master/${encodeURI(repoPathOrBook.repoPath)}`;
  }
  return `${REPO_BASE}/blob/Master/${encodeURI(repoPathOrBook)}`;
}

export function getBookRawUrl(repoPath: string): string {
  return `https://raw.githubusercontent.com/MinhNguyenDS/AI-pdf-books/Master/${encodeURI(repoPath)}`;
}

export type AutoTaxonomyTag =
  | "架构设计"
  | "算法原理"
  | "工程实践"
  | "智能体与上下文"
  | "数据与可视化"
  | "评测与安全";

export interface AutoTaxonomyDefinition {
  id: AutoTaxonomyTag;
  label: AutoTaxonomyTag;
  ruleSummary: string;
}

export const AUTO_TAXONOMY_DEFINITIONS: AutoTaxonomyDefinition[] = [
  {
    id: "架构设计",
    label: "架构设计",
    ruleSummary: "匹配 AI Architecture 分类及 Multiagent / Design Patterns / System Design / Database / Harness 元数据",
  },
  {
    id: "算法原理",
    label: "算法原理",
    ruleSummary: "匹配 Machine Learning 分类及 Transformer / Attention / Math / Fine-tuning / Pre-training / arXiv 理论词条",
  },
  {
    id: "工程实践",
    label: "工程实践",
    ruleSummary: "匹配 AI Engineering / LLMOps 分类及 Cursor / FastAPI / K8s / CLI / Testing / Production 部署词条",
  },
  {
    id: "智能体与上下文",
    label: "智能体与上下文",
    ruleSummary: "匹配 Agent / MCP / RAG / GraphRAG / Context / Memory / Compaction / Tool Use 元数据",
  },
  {
    id: "数据与可视化",
    label: "数据与可视化",
    ruleSummary: "匹配 Data Science 分类及 SQL / DuckDB / Pandas / Storytelling / BI / Pipeline 元数据",
  },
  {
    id: "评测与安全",
    label: "评测与安全",
    ruleSummary: "匹配 Eval / Benchmark / Judge / Verify / Sleeper / Auditing / Security / Guardrails 元数据",
  },
];

export function deriveAutoTaxonomyTags(book: KnowledgeBookItem): AutoTaxonomyTag[] {
  const haystack = [
    book.title,
    book.authorOrSource,
    book.category,
    book.coreTakeaways,
    book.courseApplication,
    book.keywords.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const tags: AutoTaxonomyTag[] = [];

  if (
    book.category === "AI Architecture" ||
    /architecture|design pattern|multiagent|orchestrat|system design|platform|database internals|distributed|clean architecture|serverless|scaffolding|harness|schema gating|state machine|graphrag/.test(
      haystack
    )
  ) {
    tags.push("架构设计");
  }

  if (
    book.category === "Machine Learning" ||
    /transformer|attention|mathematics|linear algebra|calculus|probability|statistics|deep learning|neural|contrastive|gan|diffusion|pre-training|fine-tuning|rlhf|dpo|lora|optimization|reasoning|stanford|slm|deepseek|llama/.test(
      haystack
    )
  ) {
    tags.push("算法原理");
  }

  if (
    book.category === "AI Engineering" ||
    book.category === "LLMOps & MLOps" ||
    /cursor|fastapi|kubernetes|docker|cli|production|deployment|testing|ci\/cd|vibe coding|spec|prd|coders|build|reproducibility|prompt engineering|opendev|serverless|gateway|monitoring|mlops|llmops|git/.test(
      haystack
    )
  ) {
    tags.push("工程实践");
  }

  if (
    /agent|mcp|rag|graphrag|context|memory|compaction|tool use|planner|reranker|embedding|workflow|subagent/.test(
      haystack
    )
  ) {
    tags.push("智能体与上下文");
  }

  if (
    book.category === "Data Science" ||
    /data science|sql|duckdb|pandas|numpy|storytelling|dashboard|visualization|\bbi\b|data pipeline|analytics|forecasting|matplotlib|seaborn|excel/.test(
      haystack
    )
  ) {
    tags.push("数据与可视化");
  }

  if (
    /eval|benchmark|judge|verify|sleeper|auditing|security|guardrail|safety|alignment|humaneval|mmlu|gpqa|calibration|copyright|adversarial|process supervision|glaze/.test(
      haystack
    )
  ) {
    tags.push("评测与安全");
  }

  if (tags.length === 0) {
    if (book.category === "LLM & NLP") {
      tags.push("算法原理", "工程实践");
    } else {
      tags.push("工程实践");
    }
  }

  return tags;
}

export const BOOK_CATEGORY_LIST: { id: BookCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "全部馆藏" },
  { id: "AI Engineering", label: "AI 工程与 Vibe" },
  { id: "AI Architecture", label: "AI 系统架构" },
  { id: "LLM & NLP", label: "LLM 与 NLP" },
  { id: "LLMOps & MLOps", label: "LLMOps 与部署" },
  { id: "Data Science", label: "数据与存储底座" },
  { id: "Machine Learning", label: "机器学习基础" },
  { id: "Papers & Lectures", label: "核心论文与讲义" },
];

export const AI_BOOKS_KNOWLEDGE_BASE: KnowledgeBookItem[] = [
  // ================= AI books (5) =================
  {
    id: "beyond-vibe-coding",
    title: "Beyond Vibe Coding: From Coder to AI-Era Developer",
    authorOrSource: "Addy Osmani · O'Reilly",
    category: "AI Engineering",
    repoPath: "AI books/[O'Reilly] Beyond Vibe Coding From Coder to AI-Era Developer.pdf",
    externalUrl: "https://beyond.addy.ie",
    sizeMB: 4.9,
    targetModules: ["M1", "M3", "M5", "M7", "M8", "M10"],
    coreTakeaways:
      "提出著名的「70% 困境」与「退两步循环」：AI 能秒速完成前 70% 样板工程，但后 30%（边界、安全、并发、集成）在无理解下盲修会陷入越修越坏；揭示「知识悖论」与 Bootstrapper vs Iterator 双模式，主张以 Context Engineering (CHOP) 与总编（Editor-in-Chief）思维驾驭 AI。",
    courseApplication:
      "作为 M1 P10 核心理论升级与 M7 架构演进准则：明确原型验证期 (Bootstrapper) 与生产迭代期 (Iterator) 边界，用 Plan + .mdc + DoD 跨越最后 30% 深水区。",
    keywords: ["Vibe Coding", "70% Problem", "Knowledge Paradox", "Context Engineering", "CHOP", "Editor-in-Chief", "Addy Osmani"],
  },
  {
    id: "ai-engineering-chip-huyen",
    title: "AI Engineering: Building Applications with Foundation Models (Chip Huyen)",
    authorOrSource: "O'Reilly · Chip Huyen",
    category: "AI Engineering",
    repoPath: "AI books/[O'Reilly] AI Engineering_Building Applications with Foundation Models_Chip Huyen.pdf",
    sizeMB: 29.8,
    targetModules: ["M1", "M2", "M5", "M6"],
    coreTakeaways: "全面阐述大模型应用工程体系：模型评测基准、Prompt 与 Context 工程、RAG vs 长上下文权衡、Agent 工具链与生产防幻觉护栏。",
    courseApplication: "支撑 M2 上下文去噪与 M5 评测闭环：教独立开发者如何建立客观可复现的 Eval/DoD 体系，而非靠主观体感调优。",
    keywords: ["Foundation Models", "Eval", "Context Engineering", "Guardrails", "Chip Huyen"],
  },
  {
    id: "ai-agents-in-action",
    title: "AI Agents in Action",
    authorOrSource: "Manning",
    category: "AI Engineering",
    repoPath: "AI books/[Manning] AI Agents in Action.pdf",
    sizeMB: 30.0,
    targetModules: ["M4", "M6", "M8"],
    coreTakeaways: "深入剖析自主智能体的记忆、规划、工具调用 (Tool Use)、多 Agent 协同模式与人机共驾回环。",
    courseApplication: "丰富 M4 MCP 工具协议与 M6 Cursor Background Agents 异步任务拆解的实战代码模板。",
    keywords: ["Agents", "Tool Use", "Planning", "Memory", "Manning"],
  },
  {
    id: "ai-ml-for-coders",
    title: "AI and Machine Learning for Coders",
    authorOrSource: "O'Reilly · Laurence Moroney",
    category: "AI Engineering",
    repoPath: "AI books/[O'Reilly] Al and Machine Learning for Coders.pdf",
    sizeMB: 34.5,
    targetModules: ["M3", "M5"],
    coreTakeaways: "面向应用工程师而非纯数学家的 AI 编程入门书，用工程代码思维打通视觉识别、序列文本与端侧部署。",
    courseApplication: "用于 M3 AI Studio 原型开发者理解底层推理调用、输入预处理与多模态界面联动。",
    keywords: ["Coders", "Computer Vision", "NLP", "Model Deployment"],
  },
  {
    id: "ai-powered-bi",
    title: "AI-Powered Business Intelligence",
    authorOrSource: "O'Reilly · Tobias Zwingmann",
    category: "AI Engineering",
    repoPath: "AI books/[O'Reilly] AI-Powered Business Intelligence_Improve Forecasts and Decision Making with Machine Learning_Tobias Zwingmann.pdf",
    sizeMB: 18.3,
    targetModules: ["M3", "M7", "M8"],
    coreTakeaways: "讲透如何把预测分析、KPI 看板与商业决策直接转化为产品级数据应用。",
    courseApplication: "为 M8 数据看板类 AI Studio 案例（案例槽位 B）提供业务指标拆解与产品变现灵感。",
    keywords: ["BI", "Dashboard", "Forecasting", "ROI", "PM"],
  },

  // ================= AI Architecture books (7) =================
  {
    id: "building-apps-ai-agents",
    title: "Building Applications with AI Agents: Designing and Implementing Multiagent Systems",
    authorOrSource: "O'Reilly",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Building Applications with AI Agents Designing and Implementing Multiagent Systems.pdf",
    sizeMB: 5.5,
    targetModules: ["M4", "M6", "M8"],
    coreTakeaways: "系统梳理多 Agent 编排拓扑（顺序、路由、监督者、辩论）、状态共享契约与工具沙盒隔离原则。",
    courseApplication: "与 M4 Agent Teams“Contract-First 契约先行 + Worktree 隔离”教学页深度对齐，给出生产级多智能体设计范式。",
    keywords: ["Multiagent", "Orchestration", "MCP", "State Machine", "Supervisor"],
  },
  {
    id: "generative-ai-design-patterns",
    title: "Generative AI Design Patterns",
    authorOrSource: "O'Reilly",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Generative AI Design Patterns.pdf",
    sizeMB: 16.1,
    targetModules: ["M1", "M3", "M4"],
    coreTakeaways: "沉淀生成式 AI 领域的 30+ 经典工程设计模式：结构化输出、Context Caching、流式反馈、多模态路由与可信降级。",
    courseApplication: "提炼为 Cursor `.cursor/rules` 的架构模式清单，帮助开发者为 Express `/api/*` 与前端流式交互选择标准解。",
    keywords: ["Design Patterns", "Structured Output", "Streaming", "Context Caching"],
  },
  {
    id: "designing-ml-systems",
    title: "Designing Machine Learning Systems",
    authorOrSource: "O'Reilly · Chip Huyen",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Designing Machine Learning Systems.pdf",
    sizeMB: 5.7,
    targetModules: ["M5", "M7"],
    coreTakeaways: "从数据飞轮、线上漂移监控、持续评估到业务 ROI 对齐的端到端系统设计经典。",
    courseApplication: "作为 M7「ROI 与架构大脑进化」核心参考，解释为何上线后的反馈闭环远比初版代码更值钱。",
    keywords: ["System Design", "Monitoring", "Data Flywheel", "Feedback Loop"],
  },
  {
    id: "architecting-data-ml-platforms",
    title: "Architecting Data and Machine Learning Platforms",
    authorOrSource: "O'Reilly",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Architecting Data and Machine Learning Platforms.pdf",
    sizeMB: 5.4,
    targetModules: ["M3", "M4", "M7"],
    coreTakeaways: "剖析现代云原生数据平台、工作流编排与成本可观测性的分层架构准则。",
    courseApplication: "用于 M3 全栈独立产品在从 MVP 演进到高并发 SaaS 时的架构分层指引。",
    keywords: ["Platform", "Data Pipeline", "Scalability", "Observability"],
  },
  {
    id: "genai-on-kubernetes",
    title: "Generative AI on Kubernetes: Operationalizing Large Language Models",
    authorOrSource: "O'Reilly",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Generative AI on Kubernetes Operationalizing Large Language Models.pdf",
    sizeMB: 8.0,
    targetModules: ["M3", "M6"],
    coreTakeaways: "覆盖高并发 LLM 服务容器化、GPU 资源调度、推理网关限流与自托管私有部署方案。",
    courseApplication: "扩展 M3 部署选型对比：何时用 Vercel/Zeabur 零运维上线，何时切入自建容器集群。",
    keywords: ["Kubernetes", "Inference", "Docker", "Scaling", "Gateway"],
  },
  {
    id: "ml-design-patterns",
    title: "Machine Learning Design Patterns",
    authorOrSource: "O'Reilly · Lakshmanan et al.",
    category: "AI Architecture",
    repoPath: "AI Architecture books/[O'Reilly] Machine Learning Design Patterns_Solutions to Common Challenges in Data Preparation Model Building and MLOps.pdf",
    sizeMB: 16.1,
    targetModules: ["M5", "M6"],
    coreTakeaways: "总结特征表示、可复现训练、容错服务与持续校验等 30 种高频可复用工程模式。",
    courseApplication: "启发 M5 自动化测试模式：把“可重复性”和“防回归校验”写入 DoD 门禁规则。",
    keywords: ["Design Patterns", "MLOps", "Reproducibility", "Testing"],
  },
  {
    id: "gof-design-patterns",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software (GoF)",
    authorOrSource: "Addison-Wesley · GoF",
    category: "AI Architecture",
    repoPath: "AI Architecture books/Design Patterns - Elements of Reusable Object Oriented Software.pdf",
    sizeMB: 4.6,
    targetModules: ["M2", "M4"],
    coreTakeaways: "软件工程经典《设计模式》23 式：策略、适配器、观察者、工厂模式决定代码可维护性上限。",
    courseApplication: "配合 M2 Cursor 重构提示词：在重构指令中显式点名“使用 Adapter/Strategy 模式隔离第三方支付或模型 SDK”，AI 输出质量立竿见影。",
    keywords: ["GoF", "Refactoring", "Strategy", "Adapter", "Clean Architecture"],
  },

  // ================= LLM and NLP books (15) =================
  {
    id: "prompt-engineering-llms",
    title: "Prompt Engineering for LLMs",
    authorOrSource: "O'Reilly · John Berryman & Albert Ziegler",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Prompt Engineering for LLMs.pdf",
    sizeMB: 12.6,
    targetModules: ["M1", "M2", "M4"],
    coreTakeaways: "由 GitHub Copilot 核心团队工程师撰写！深入揭示代码补全模型背后的上下文窗口组装、Token 预算分配与高质量 Prompt 架构。",
    courseApplication: "直接解释 Cursor `@Files`、`.mdc` 上下文优先级排序与代码提示词工程的底层工作原理。",
    keywords: ["Prompt Engineering", "Copilot", "Context Window", "Code Generation"],
  },
  {
    id: "designing-llm-apps",
    title: "Designing Large Language Model Applications",
    authorOrSource: "O'Reilly (2023)",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Designing Large Language Model Applications (2023).pdf",
    sizeMB: 1.4,
    targetModules: ["M1", "M2", "M3"],
    coreTakeaways: "短小精悍的 LLM 产品设计手册：拆解 UX 流式交互、幻觉缓释界面与 Prompt 版本管理策略。",
    courseApplication: "为产品经理在 M1/M3 设计 AI 功能交互（流式骨架、重试与来源引用）提供现成交互原型参考。",
    keywords: ["UX", "LLM Apps", "Streaming", "Product Design"],
  },
  {
    id: "hands-on-llms",
    title: "Hands-On Large Language Models: Language Understanding and Generation",
    authorOrSource: "O'Reilly · Jay Alammar & Maarten Grootendorst",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Hands-On Large Language Models Language Understanding and Generation.pdf",
    sizeMB: 21.4,
    targetModules: ["M2", "M4"],
    coreTakeaways: "全书配图极佳！可视化讲透 Transformer 注意力、语义检索 Embedding、重排序 Rerank 与微调机制。",
    courseApplication: "用于 M2/M4 教学拆解：为什么传统切片 RAG 在强依赖代码库失效，而全量注意力+AST 索引更可靠。",
    keywords: ["Transformers", "Embeddings", "RAG", "Visual Guide", "Jay Alammar"],
  },
  {
    id: "build-llm-from-scratch",
    title: "Build a Large Language Model (From Scratch)",
    authorOrSource: "Manning · Sebastian Raschka",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[Manning] Build a Large Language Model (From Scratch).pdf",
    sizeMB: 25.4,
    targetModules: ["M2", "M7"],
    coreTakeaways: "手把手从零用 PyTorch 实现 Tokenizer、因果注意力、预训练与指令微调。",
    courseApplication: "帮助想进阶理解 KV Cache（Context Caching 省钱原理）与 Token 计费底层逻辑的学员补全认知拼图。",
    keywords: ["LLM Scratch", "Attention", "Tokenizer", "KV Cache", "Raschka"],
  },
  {
    id: "domain-specific-slm",
    title: "Domain-Specific Small Language Models: Efficient AI for Local Deployment",
    authorOrSource: "Manning",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[Manning] Domain-Specific Small Language Models Efficient AI for local deployment.pdf",
    sizeMB: 38.6,
    targetModules: ["M4", "M7"],
    coreTakeaways: "讲解垂类小模型蒸馏、量化与本地低延迟推理，平衡推理成本与数据隐私。",
    courseApplication: "配合 M7 ROI 成本优化章节：何时调用大模型规划（Plan），何时切轻量模型或本地模型执行批量生成。",
    keywords: ["SLM", "Quantization", "Local Deployment", "Cost Optimization"],
  },
  {
    id: "nlp-with-transformers",
    title: "Natural Language Processing with Transformers",
    authorOrSource: "O'Reilly · Hugging Face Team",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Natural Language Processing with Transformers.pdf",
    sizeMB: 17.3,
    targetModules: ["M2", "M5"],
    coreTakeaways: "Transformer 模型工程化圣经：文本分类、问答、代码生成模型评估与推理加速。",
    courseApplication: "夯实 M5 语义理解与多任务评估指标设计基础。",
    keywords: ["Transformers", "HuggingFace", "Evaluation", "Inference"],
  },
  {
    id: "prompt-engineering-guide-vn",
    title: "Prompt Engineering Guide (DAIR.AI Compendium)",
    authorOrSource: "Community Edition",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/Prompt Engineering Guide VN.pdf",
    sizeMB: 3.0,
    targetModules: ["M1", "M4"],
    coreTakeaways: "汇编 CoT 思维链、Few-Shot、ReAct、Tree-of-Thoughts 与防提示词注入的完整技巧大全。",
    courseApplication: "用于 M1 Plan Mode 提示词四要素与 ReAct 调试推理链教学参考。",
    keywords: ["CoT", "Few-Shot", "ReAct", "Prompt Injection"],
  },
  {
    id: "applied-nlp-enterprise",
    title: "Applied Natural Language Processing in the Enterprise",
    authorOrSource: "O'Reilly",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Applied Natural Language Processing in the Enterprise.pdf",
    sizeMB: 10.3,
    targetModules: ["M4", "M6"],
    coreTakeaways: "聚焦企业知识搜索、合规审计与多语言文本流水线在真实生产环境中的落地坑点。",
    courseApplication: "支撑 M4 私有企业文档接入与 M6 合规扫描规则编写。",
    keywords: ["Enterprise NLP", "Compliance", "Search", "Production"],
  },
  {
    id: "practical-nlp",
    title: "Practical Natural Language Processing",
    authorOrSource: "O'Reilly",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Practical Natural Language Processing.pdf",
    sizeMB: 30.6,
    targetModules: ["M2", "M3"],
    coreTakeaways: "对比正则、经典统计与神经网络在不同文本产品场景下的务实选型。",
    courseApplication: "辅助 M6 本地 Bugbot 静态扫描器设计（先用 AST/正则零成本秒检，再调 LLM 深度语义审计）。",
    keywords: ["Hybrid Pipeline", "Heuristics", "Text Classification"],
  },
  {
    id: "speech-and-language-processing",
    title: "Speech and Language Processing (Jurafsky & Martin)",
    authorOrSource: "Stanford",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[Stanford] Speech and Language Processing.pdf",
    sizeMB: 22.1,
    targetModules: ["M2"],
    coreTakeaways: "斯坦福语言处理权威教材，完整建立概率语言模型、序列标注与对话系统理论框架。",
    courseApplication: "作为知识库底层理论检索来源，按需在备课助手中引用标准术语定义。",
    keywords: ["Stanford", "Theory", "Language Modeling", "Dialogue"],
  },
  {
    id: "foundations-statistical-nlp",
    title: "Foundations of Statistical Natural Language Processing",
    authorOrSource: "MIT Press · Manning & Schütze",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[MIT] Foundations of Statistical Natural Language Processing.pdf",
    sizeMB: 7.3,
    targetModules: ["M2"],
    coreTakeaways: "统计自然语言处理奠基之作，深入阐明 n-gram、互信息与概率建模原理。",
    courseApplication: "帮助理解检索相关性评分 (BM25/TF-IDF) 与向量混合检索原理。",
    keywords: ["Statistical NLP", "MIT", "Information Retrieval"],
  },
  {
    id: "deep-learning-in-nlp",
    title: "Deep Learning in Natural Language Processing",
    authorOrSource: "Springer",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[Springer] Deep Learning in Natural Language Processing.pdf",
    sizeMB: 10.8,
    targetModules: ["M2"],
    coreTakeaways: "系统梳理词嵌入、序列到序列模型与表示学习的演进脉络。",
    courseApplication: "提供 NLP 表示学习背景参考，支持知识库跨主题关联提问。",
    keywords: ["Deep Learning", "Word Embeddings", "Seq2Seq"],
  },
  {
    id: "nlp-with-python",
    title: "Natural Language Processing with Python",
    authorOrSource: "O'Reilly",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Natural Language Processing With Python.pdf",
    sizeMB: 5.2,
    targetModules: ["M3"],
    coreTakeaways: "基于 Python 与 NLTK 的经典文本清洗、分词、句法剖析实战手册。",
    courseApplication: "适合快速编写语料清洗与规则抽样 Python 辅助脚本。",
    keywords: ["Python", "NLTK", "Tokenization", "Parsing"],
  },
  {
    id: "natural-language-annotation-ml",
    title: "Natural Language Annotation for Machine Learning",
    authorOrSource: "O'Reilly",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/[O'Reilly] Natural-Language-Annotation-for-Machine-Learning.pdf",
    sizeMB: 10.4,
    targetModules: ["M5"],
    coreTakeaways: "讲解高质量标注规范 (Guidelines)、一致率 (IAA) 与评估数据集构建方法。",
    courseApplication: "启发 M5 黄金评估集 (Golden Eval Set) 设计：如何构建小而精的 30 条真实回归测试集。",
    keywords: ["Annotation", "Eval Dataset", "IAA", "Data Quality"],
  },
  {
    id: "nltk-3-cookbook",
    title: "Text Processing with NLTK 3 Cookbook",
    authorOrSource: "Packt",
    category: "LLM & NLP",
    repoPath: "LLM and NLP books/Text Processing with NLTK 3 Cookbook.pdf",
    sizeMB: 1.9,
    targetModules: ["M3"],
    coreTakeaways: "轻量级 Python 文本清洗与预处理食谱集。",
    courseApplication: "辅助编写 Markdown/日志文本预处理自动化小工具。",
    keywords: ["Text Processing", "Python", "Regex"],
  },

  // ================= LLMOps and MLOps books (6) =================
  {
    id: "what-is-llmops",
    title: "What is LLMOps: Large Language Models in Production",
    authorOrSource: "O'Reilly",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/[O'Reilly] What is LLMOps_Large Language Models in Production.pdf",
    sizeMB: 1.4,
    targetModules: ["M6", "M7"],
    coreTakeaways: "精炼定义 LLMOps 核心循环：Prompt 评估、Token 延迟监控、版本灰度切换与安全网关。",
    courseApplication: "帮助独立开发者把 Cursor 生成的 AI 应用从“能跑的 Demo”升级为可观测、可控成本的生产服务。",
    keywords: ["LLMOps", "Latency", "Observability", "Cost Control"],
  },
  {
    id: "building-genai-fastapi",
    title: "Building Generative AI Services with FastAPI",
    authorOrSource: "O'Reilly",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/[O'Reilly] Building Generative AI Services with FastAPI.pdf",
    sizeMB: 10.0,
    targetModules: ["M3", "M4", "M8"],
    coreTakeaways: "详述如何用异步 API 框架打造流式 SSE、并发限流、工具调用与安全隔离的 AI 后端服务。",
    courseApplication: "可直接对照升级 M3 后端架构与本项目的 Express/FastAPI `/api/*` 服务端代理规范。",
    keywords: ["FastAPI", "SSE", "Streaming API", "Backend Proxy"],
  },
  {
    id: "oreilly-fastapi",
    title: "FastAPI: Modern Python Web Development",
    authorOrSource: "O'Reilly",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/[O'Reilly] FastAPI.pdf",
    sizeMB: 24.4,
    targetModules: ["M3", "M4"],
    coreTakeaways: "深入讲解 Pydantic 类型契约、自动生成 OpenAPI/Swagger 文档、依赖注入与异步鉴权。",
    courseApplication: "与 M3 P26「OpenAPI 契约驱动全栈开发」深度契合，为 Python 后端开发者提供标准 `.mdc` 规则参照。",
    keywords: ["FastAPI", "Pydantic", "OpenAPI", "Async", "Auth"],
  },
  {
    id: "genai-with-langchain-2024",
    title: "Generative AI with LangChain (2024)",
    authorOrSource: "Packt",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/Generative AI with LangChain (2024).pdf",
    sizeMB: 13.6,
    targetModules: ["M3", "M4"],
    coreTakeaways: "实战构建多步骤链、文档加载器、对话记忆、工具绑定与 Agent 工作流。",
    courseApplication: "丰富 M3 项目 C（定制知识库与 Agent 工作台）与 M4 外部工具接入案例。",
    keywords: ["LangChain", "Workflow", "Memory", "Tools"],
  },
  {
    id: "practical-mlops",
    title: "Practical MLOps: Operationalizing Machine Learning Models",
    authorOrSource: "O'Reilly · Noah Gift & Alfredo Deza",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/[O'Reilly] Practical MLOps_Operationalizing Machine Learning Models.pdf",
    sizeMB: 75.3,
    targetModules: ["M5", "M6"],
    coreTakeaways: "从 Makefile 自动化、CI/CD 测试流水线到模型部署与自动回滚的全套运维工程实战。",
    courseApplication: "强化 M5 DoD 与 M6 CI 无头流水线章节的自动化门禁清单设计。",
    keywords: ["MLOps", "CI/CD", "Automation", "Deployment"],
  },
  {
    id: "python-for-devops",
    title: "Python for DevOps: Learn Ruthlessly Effective Automation",
    authorOrSource: "O'Reilly",
    category: "LLMOps & MLOps",
    repoPath: "LLMOps and MLOps books/[O'Reilly] Python for DevOps_Learn Ruthlessly Effective Automation.pdf",
    sizeMB: 11.0,
    targetModules: ["M3", "M6"],
    coreTakeaways: "利用 CLI 工具、脚本自动化、容器与云原生运维工具彻底消除重复人工操作。",
    courseApplication: "指导 M6 Cursor CLI 脚本与长时任务循环安全保护脚本的编写原则。",
    keywords: ["DevOps", "CLI", "Automation", "Scripts"],
  },

  // ================= Data Science books (9) =================
  {
    id: "database-internals",
    title: "Database Internals: Deep Dive into Distributed Data Systems",
    authorOrSource: "O'Reilly · Alex Petrov",
    category: "Data Science",
    repoPath: "Data Science books/[O'Reilly] Database Internals.pdf",
    sizeMB: 15.1,
    targetModules: ["M3", "M4"],
    coreTakeaways: "深入理解 B-Tree/LSM 存储引擎、事务隔离级别与分布式一致性原理。",
    courseApplication: "帮助 Cursor 开发者在设计 Postgres/Supabase 索引、幂等表与并发扣款事务时写出不踩坑的 Spec。",
    keywords: ["Database", "B-Tree", "Transactions", "Consistency"],
  },
  {
    id: "storytelling-with-data",
    title: "Storytelling with Data (Cole Nussbaumer Knaflic)",
    authorOrSource: "Wiley",
    category: "Data Science",
    repoPath: "Data Science books/Storytelling with data cole nussbaumer knaflic.pdf",
    sizeMB: 12.4,
    targetModules: ["M3", "M7", "M8"],
    coreTakeaways: "数据可视化与商业叙事金标准：克制配色、去除图表杂波、用视觉焦点引导决策。",
    courseApplication: "直接提升 M3 前端看板与 M7 效能指标页的视觉审美，可作为 `.cursor/rules` 的图表规范依据。",
    keywords: ["Visualization", "UI Design", "Charts", "Clarity"],
  },
  {
    id: "python-data-science-handbook",
    title: "Python Data Science Handbook (Jake VanderPlas)",
    authorOrSource: "O'Reilly",
    category: "Data Science",
    repoPath: "Data Science books/[O'Reilly] Python Data Science Handbook - Jake VanderPlas.pdf",
    sizeMB: 19.9,
    targetModules: ["M3"],
    coreTakeaways: "NumPy、Pandas、Matplotlib 与 Scikit-Learn 数据科学全栈实用手边书。",
    courseApplication: "为数据产品与分析脚本类任务提供标准数据结构范式。",
    keywords: ["Pandas", "NumPy", "Scikit-Learn", "Analysis"],
  },
  {
    id: "python-for-data-analysis",
    title: "Python for Data Analysis (Wes McKinney)",
    authorOrSource: "O'Reilly",
    category: "Data Science",
    repoPath: "Data Science books/[O'Reilly] Python for Data Analysis - data wrangling with Pandas NumPy and IPython.pdf",
    sizeMB: 12.5,
    targetModules: ["M3"],
    coreTakeaways: "Pandas 之父亲授数据清洗、时间序列重采样与结构化批处理技巧。",
    courseApplication: "适合作为构建数据清洗微工具、CSV 批量导入模块时的工程参照。",
    keywords: ["Data Wrangling", "Pandas", "ETL"],
  },
  {
    id: "practical-statistics-ds",
    title: "Practical Statistics for Data Scientists",
    authorOrSource: "O'Reilly",
    category: "Data Science",
    repoPath: "Data Science books/[O'Reilly] Practical Statistics for Data Scientists.pdf",
    sizeMB: 13.5,
    targetModules: ["M5", "M7"],
    coreTakeaways: "精讲 A/B 实验显著性、抽样偏差与置信区间评估方法。",
    courseApplication: "帮助 M7 产品经理科学设计上线后的 A/B 转化率实验，而非凭感觉改版。",
    keywords: ["A/B Testing", "Statistics", "Sampling", "Confidence Interval"],
  },
  {
    id: "data-science-from-scratch",
    title: "Data Science from Scratch (Joel Grus)",
    authorOrSource: "O'Reilly",
    category: "Data Science",
    repoPath: "Data Science books/[O'Reilly] Data Science from Scratch.pdf",
    sizeMB: 5.7,
    targetModules: ["M2"],
    coreTakeaways: "用纯 Python 从零实现线性代数、梯度下降、向量余弦相似度与基础推荐系统。",
    courseApplication: "让零基础开发者直观理解向量相似度检索的本质与局限。",
    keywords: ["Cosine Similarity", "Vectors", "First Principles"],
  },
  {
    id: "data-mining-concepts-3rd",
    title: "Data Mining: Concepts and Techniques (3rd Edition)",
    authorOrSource: "Morgan Kaufmann · Jiawei Han",
    category: "Data Science",
    repoPath: "Data Science books/Data Mining Concepts and Techniques 3rd Edition.pdf",
    sizeMB: 12.0,
    targetModules: ["M2"],
    coreTakeaways: "数据挖掘权威教材：聚类、频繁模式与异常检测算法体系。",
    courseApplication: "提供数据预处理与用户行为聚类分析的底层概念参照。",
    keywords: ["Clustering", "Anomaly Detection", "Data Mining"],
  },
  {
    id: "eda-with-r",
    title: "Exploratory Data Analysis with R",
    authorOrSource: "Leanpub · Roger Peng",
    category: "Data Science",
    repoPath: "Data Science books/Exploratory Data Analysis with R.pdf",
    sizeMB: 30.2,
    targetModules: ["M7"],
    coreTakeaways: "探索性数据分析 (EDA) 原则：先看分布与异常值再建假设。",
    courseApplication: "用于 M7 研发日志与产品漏斗分析的方法论参考。",
    keywords: ["EDA", "Diagnostics", "Data Exploration"],
  },
  {
    id: "probability-statistics-cookbook",
    title: "The Probability and Statistics Cookbook",
    authorOrSource: "Open Reference",
    category: "Data Science",
    repoPath: "Data Science books/The Probability and Statistics Cookbook.pdf",
    sizeMB: 1.5,
    targetModules: ["M5"],
    coreTakeaways: "便携概率分布与统计检验公式速查表。",
    courseApplication: "可随时由 Cursor 工程师检索核对评估置信度计算公式。",
    keywords: ["Probability", "Formulas", "Reference"],
  },

  // ================= Machine Learning books (5) =================
  {
    id: "hands-on-ml-scikit-tf",
    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
    authorOrSource: "O'Reilly · Aurélien Géron",
    category: "Machine Learning",
    repoPath: "Machine Learning books/[O'Reilly] Hands On Machine Learning with Scikit Learn and TensorFlow.pdf",
    sizeMB: 43.9,
    targetModules: ["M3", "M5"],
    coreTakeaways: "全球口碑最高的机器学习工程实践宝典，强调验证集防泄露与流水线化验证。",
    courseApplication: "对应 AI Coding 中的“训练集/测试集隔离”思想：先独立写 DoD 验收测试，再让 Agent 写实现代码。",
    keywords: ["Validation Split", "Pipeline", "Deep Learning", "Best Practices"],
  },
  {
    id: "fundamentals-of-deep-learning",
    title: "Fundamentals of Deep Learning",
    authorOrSource: "O'Reilly",
    category: "Machine Learning",
    repoPath: "Machine Learning books/[O'Reilly] Fundamentals of Deep Learning.pdf",
    sizeMB: 15.2,
    targetModules: ["M1"],
    coreTakeaways: "用清晰图解建立神经网络、反向传播、注意力与生成模型直觉。",
    courseApplication: "帮助产品经理用通俗直觉理解 AI 能力边界与幻觉成因。",
    keywords: ["Neural Networks", "Backprop", "Deep Learning"],
  },
  {
    id: "intro-ml-python",
    title: "Introduction to Machine Learning with Python",
    authorOrSource: "O'Reilly · Andreas Müller & Sarah Guido",
    category: "Machine Learning",
    repoPath: "Machine Learning books/[O'Reilly] Introduction to Machine Learning with Python.pdf",
    sizeMB: 6.7,
    targetModules: ["M3"],
    coreTakeaways: "最适合程序员上手的 ML 特征工程与交叉验证实用教材。",
    courseApplication: "适合独立开发者给 SaaS 加入轻量分类、推荐与标签能力。",
    keywords: ["Scikit-Learn", "Cross-Validation", "Feature Engineering"],
  },
  {
    id: "ml-basic-vn",
    title: "Machine Learning Basic (Vietnamese Visual Compendium)",
    authorOrSource: "Community Edition",
    category: "Machine Learning",
    repoPath: "Machine Learning books/ML_basic_VN.pdf",
    sizeMB: 22.9,
    targetModules: ["M1"],
    coreTakeaways: "图解监督/无监督学习核心算法，便于快速扫盲机器学习术语。",
    courseApplication: "基础术语科普备用资料。",
    keywords: ["ML Basics", "Visual Notes"],
  },
  {
    id: "machine-learning-vn",
    title: "Machine Learning Co Ban (Tiep Pham Series)",
    authorOrSource: "Community Edition",
    category: "Machine Learning",
    repoPath: "Machine Learning books/Machine_learning_VN.pdf",
    sizeMB: 7.0,
    targetModules: ["M1"],
    coreTakeaways: "系统梳理梯度下降、正则化与分类回归经典推演。",
    courseApplication: "基础算法原理延伸阅读。",
    keywords: ["Optimization", "Regularization"],
  },

  // ================= Papers & Lectures (26) =================
  {
    id: "paper-codex-humaneval",
    title: "Evaluating Large Language Models Trained on Code (arXiv:2107.03374)",
    authorOrSource: "OpenAI Codex / HumanEval",
    category: "Papers & Lectures",
    repoPath: "Paper/2107.03374v2.pdf",
    sizeMB: 1.8,
    targetModules: ["M1", "M5"],
    coreTakeaways: "AI Coding 领域里程碑论文！提出基于真实单元测试通过率 (pass@k) 而非文本相似度的代码生成评估标准。",
    courseApplication: "奠定 M5「DoD 完成定义」的学术基石：只有跑过真实编译器与单元测试的代码才能算完成。",
    keywords: ["Codex", "HumanEval", "pass@k", "DoD", "Code Evaluation"],
  },
  {
    id: "paper-lets-verify-step-by-step",
    title: "Let's Verify Step by Step (arXiv:2305.20050)",
    authorOrSource: "OpenAI · Process Supervision",
    category: "Papers & Lectures",
    repoPath: "Paper/2305.20050v1.pdf",
    sizeMB: 4.2,
    targetModules: ["M1", "M5", "M6"],
    coreTakeaways: "证明过程监督 (Process Supervision / PRM) 显著优于仅看最终结果的奖励 (ORM)，每一步推理校验能大幅降低幻觉蔓延。",
    courseApplication: "直接解释为何 Cursor 要用「Plan 分步拆解 ➔ 逐文件小步验证 ➔ 原子 Git Commit」，而非一口气让 AI 写完 20 个文件。",
    keywords: ["Process Supervision", "PRM", "Step-by-Step", "Plan Mode"],
  },
  {
    id: "paper-llm-as-a-judge",
    title: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (arXiv:2306.05685)",
    authorOrSource: "LMSYS · LLM-as-a-Judge",
    category: "Papers & Lectures",
    repoPath: "Paper/2306.05685.pdf",
    sizeMB: 1.4,
    targetModules: ["M5", "M6"],
    coreTakeaways: "揭示以模型充当裁判的三大偏差（位置偏差、冗长偏好、自我确认偏好）及高对齐评估实践。",
    courseApplication: "直接指导 M6 Bugbot 与 M5 独立 Reviewer 设计：必须开启干净新上下文审 Diff，并引入确定性静态规则破除模型偏见。",
    keywords: ["LLM-as-a-Judge", "Bugbot", "Self-Bias", "Code Review"],
  },
  {
    id: "paper-code-comprehension-auditing",
    title: "Code Comprehension then Auditing for Unsupervised LLM Evaluation (arXiv:2410.03131)",
    authorOrSource: "arXiv:2410.03131",
    category: "Papers & Lectures",
    repoPath: "Paper/2410.03131v3.pdf",
    sizeMB: 5.0,
    targetModules: ["M2", "M6", "M8"],
    coreTakeaways: "提出「先深度理解代码语义拓扑，再执行系统性安全与逻辑审计」的两阶段代码审计评估框架。",
    courseApplication: "可直接升级 M6 Lab 04 Bugbot 审查流：要求审查提示词先输出意图摘要，再逐条对照规则做漏洞审计。",
    keywords: ["Code Auditing", "Comprehension", "Bugbot", "Static Analysis"],
  },
  {
    id: "paper-automated-agentic-systems",
    title: "Automated Design of Agentic Systems (arXiv:2408.08435)",
    authorOrSource: "arXiv:2408.08435 · ADAS",
    category: "Papers & Lectures",
    repoPath: "Paper/2408.08435v1.pdf",
    sizeMB: 1.0,
    targetModules: ["M4", "M6", "M8"],
    coreTakeaways: "探索用代码化的元智能体搜索和发现更优的多智能体协作流、反思环路与工具组合。",
    courseApplication: "支撑 M4/M6 智能体团队编排进化：将一次次手动摸索出的 Prompt 流程固化为可进化 SKILL.md 工作流。",
    keywords: ["ADAS", "Agentic Systems", "Meta-Agent", "Workflow Design"],
  },
  {
    id: "paper-graph-rag-survey",
    title: "Graph Retrieval-Augmented Generation: A Survey (arXiv:2408.08921)",
    authorOrSource: "arXiv:2408.08921 · GraphRAG",
    category: "Papers & Lectures",
    repoPath: "Paper/2408.08921v1.pdf",
    sizeMB: 1.7,
    targetModules: ["M2", "M4"],
    coreTakeaways: "全面综述如何利用知识图谱保留跨实体的结构化关系，弥补纯向量分块检索丢失全局依赖的短板。",
    courseApplication: "深化 M2 上下文课程：解释为何代码库依赖图 / AST 索引 + 全量上下文远胜普通文本切片 RAG。",
    keywords: ["GraphRAG", "Dependency Graph", "Context Retrieval"],
  },
  {
    id: "paper-sleeper-agents",
    title: "Sleeper Agents: Training Deceptive LLMs that Persist Through Safety Training (arXiv:2401.05566)",
    authorOrSource: "Anthropic · Safety",
    category: "Papers & Lectures",
    repoPath: "Paper/2401.05566.pdf",
    sizeMB: 3.2,
    targetModules: ["M5", "M6"],
    coreTakeaways: "证明条件触发的后门代码生成难以靠常规对话对齐消除，必须依赖确定性静态扫描、沙盒测试与强制代码审计。",
    courseApplication: "增强 M6 Bugbot 安全警示案例：绝不可盲信模型生成代码的“表面礼貌合规”，必须走确定性安全门禁。",
    keywords: ["Sleeper Agents", "Security Audit", "Backdoor", "Safety Gate"],
  },
  {
    id: "paper-controllable-text-gen",
    title: "Controllable Text Generation for Large Language Models: A Survey (arXiv:2408.12599)",
    authorOrSource: "arXiv:2408.12599",
    category: "Papers & Lectures",
    repoPath: "Paper/2408.12599v1.pdf",
    sizeMB: 2.8,
    targetModules: ["M1", "M4"],
    coreTakeaways: "总结约束解码、Schema 强约束与指令遵循可控性技术演进。",
    courseApplication: "说明 `.cursor/rules`、`responseSchema` 与 Zod 强类型约束对稳定代码生成的工程意义。",
    keywords: ["Controllable Generation", "Schema", "Rules"],
  },
  {
    id: "paper-llm-codegen-lecture",
    title: "LLM Code Generation Lecture (Stanford / Industry Slides)",
    authorOrSource: "Lecture Deck",
    category: "Papers & Lectures",
    repoPath: "Paper/LLM_codegen_lecture.pdf",
    sizeMB: 14.9,
    targetModules: ["M1", "M2", "M5"],
    coreTakeaways: "系统梳理代码大模型发展脉络、Repo 级补全上下文构建、测试驱动修复与 IDE 交互范式。",
    courseApplication: "与 M1 课程演进路线图与 M2 Repo 级上下文治理高度契合。",
    keywords: ["Code Generation", "Repo Context", "IDE", "Lecture"],
  },
  {
    id: "paper-aws-serverless",
    title: "AWS Serverless Architectures Reference Guide",
    authorOrSource: "AWS Whitepaper",
    category: "Papers & Lectures",
    repoPath: "Paper/aws-serverless.pdf",
    sizeMB: 3.3,
    targetModules: ["M3", "M6"],
    coreTakeaways: "剖析无服务器架构事件驱动、无状态计算、只读文件系统限制与冷启动优化法则。",
    courseApplication: "为 M3 Vercel Serverless / Express 部署排障（如避免写入只读 `/var/task` 目录）提供直接架构原理支持。",
    keywords: ["Serverless", "Vercel", "Cloud", "Read-Only FS"],
  },
  {
    id: "paper-prompt-engineering-guide-pdf",
    title: "Prompt Engineering Guide (Original PDF Edition)",
    authorOrSource: "DAIR.AI",
    category: "Papers & Lectures",
    repoPath: "Paper/Prompt_Engineering_Guide.pdf",
    sizeMB: 3.0,
    targetModules: ["M1", "M4"],
    coreTakeaways: "英文原版提示词工程指南，覆盖结构化分步推理与工具辅助提示词格式。",
    courseApplication: "可用于 M1 Lab 01 Plan-to-Agent 提示词模板校验参考。",
    keywords: ["Prompting", "Structured Prompt", "Reference"],
  },
  {
    id: "paper-stanford-transformers-cheatsheet",
    title: "Stanford Cheatsheet: Transformers & Large Language Models",
    authorOrSource: "Stanford CS",
    category: "Papers & Lectures",
    repoPath: "Paper/stanford-cheatsheet-transformers-large-language-models.pdf",
    sizeMB: 1.4,
    targetModules: ["M2"],
    coreTakeaways: "一页精炼总结 Self-Attention 复杂度、位置编码 (RoPE) 与长上下文缩放要点。",
    courseApplication: "解释 M2 “为什么不能无脑塞入百万行 node_modules 噪音”——注意力稀释与有效上下文窗制约。",
    keywords: ["Stanford", "Self-Attention", "Context Window", "Cheatsheet"],
  },
  {
    id: "paper-mmlu-pro",
    title: "MMLU-Pro: A More Robust and Challenging Multi-Task Benchmark (arXiv:2406.01574)",
    authorOrSource: "arXiv:2406.01574",
    category: "Papers & Lectures",
    repoPath: "Paper/2406.01574v6.pdf",
    sizeMB: 0.9,
    targetModules: ["M5", "M7"],
    coreTakeaways: "展示十选一高难度干扰项如何击穿大模型投机猜测，构建更具区分度的推理评测。",
    courseApplication: "启发本课程每模块随堂测验与 Eval 基准设计原则。",
    keywords: ["Benchmark", "MMLU-Pro", "Evaluation"],
  },
  {
    id: "paper-gpqa",
    title: "GPQA: A Graduate-Level Google-Proof Q&A Benchmark (arXiv:2311.12022)",
    authorOrSource: "arXiv:2311.12022",
    category: "Papers & Lectures",
    repoPath: "Paper/2311.12022v1.pdf",
    sizeMB: 0.6,
    targetModules: ["M5"],
    coreTakeaways: "探索防搜索泄漏的高难度专家验证基准构建与人类对齐校验流程。",
    courseApplication: "参考专家级边界验证集构造方式。",
    keywords: ["GPQA", "Hard Benchmark", "Expert Validation"],
  },
  {
    id: "paper-humanitys-last-exam",
    title: "Humanity's Last Exam (arXiv:2501.14249)",
    authorOrSource: "CAIS · arXiv:2501.14249",
    category: "Papers & Lectures",
    repoPath: "Paper/2501.14249v5.pdf",
    sizeMB: 2.0,
    targetModules: ["M7"],
    coreTakeaways: "衡量前沿大模型跨学科极深推理边界与自我校准（Calibration）幻觉率。",
    courseApplication: "在 M7 讨论模型置信度校准：什么时候 AI 应该拒绝猜测并反问人类架构师。",
    keywords: ["Calibration", "Frontier Eval", "Reasoning"],
  },
  {
    id: "paper-bart",
    title: "BART: Denoising Sequence-to-Sequence Pre-training (arXiv:1910.13461)",
    authorOrSource: "Facebook AI · arXiv:1910.13461",
    category: "Papers & Lectures",
    repoPath: "Paper/1910.13461v1.pdf",
    sizeMB: 0.3,
    targetModules: ["M2"],
    coreTakeaways: "经典编码器-解码器去噪重建预训练论文，奠定代码填空 (Fill-in-the-Middle) 技术灵感。",
    courseApplication: "关联理解 Cursor Tab 光标上下文双边填空补全机制。",
    keywords: ["BART", "Denoising", "FIM", "Autocomplete"],
  },
  {
    id: "paper-mbart",
    title: "Multilingual Denoising Pre-training for Neural Machine Translation (arXiv:2001.08210)",
    authorOrSource: "Facebook AI · arXiv:2001.08210",
    category: "Papers & Lectures",
    repoPath: "Paper/2001.08210v2.pdf",
    sizeMB: 1.5,
    targetModules: ["M2"],
    coreTakeaways: "验证跨语言统一表示迁移能力，解释大模型如何在不同编程语言间迁移模式。",
    courseApplication: "支持多语言全栈项目（如 TS + Python + SQL）在同一 Cursor 对话内协同重构。",
    keywords: ["Multilingual", "Transfer Learning", "Cross-Language"],
  },
  {
    id: "paper-debertav3",
    title: "DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training (arXiv:2111.09543)",
    authorOrSource: "Microsoft · arXiv:2111.09543",
    category: "Papers & Lectures",
    repoPath: "Paper/2111.09543v4.pdf",
    sizeMB: 0.7,
    targetModules: ["M4"],
    coreTakeaways: "解耦注意力与高效判别式预训练代表作，常用于超高速代码检索重排序器 (Reranker)。",
    courseApplication: "帮助理解 Cursor `@Codebase` 索引后台的 Embedding + Reranker 快速召回栈。",
    keywords: ["DeBERTaV3", "Reranker", "Codebase Indexing"],
  },
  {
    id: "paper-glaze-usenix23",
    title: "GLAZE: Protecting Artists from Style Mimicry (USENIX Security '23)",
    authorOrSource: "USENIX Security",
    category: "Papers & Lectures",
    repoPath: "Paper/glaze-usenix23.pdf",
    sizeMB: 6.6,
    targetModules: ["M6"],
    coreTakeaways: "展示对抗样本扰动与视觉版权防护前沿安全攻防实践。",
    courseApplication: "丰富 M6 AI 安全与数据/版权边界意识讨论。",
    keywords: ["Security", "Copyright", "Adversarial"],
  },
  {
    id: "paper-contrastive-learning",
    title: "Contrastive Learning Tutorial (ECCV · Ting Chen)",
    authorOrSource: "ECCV Tutorial",
    category: "Papers & Lectures",
    repoPath: "Paper/contrastive-learning-ECCV-tutorial_ting_Chen.pdf",
    sizeMB: 7.4,
    targetModules: ["M2"],
    coreTakeaways: "对比学习经典综述，解释正负样本如何塑造高质量语义向量空间。",
    courseApplication: "加深对语义相似度搜索边界条件的理解。",
    keywords: ["Contrastive Learning", "Representation", "Embedding"],
  },
  {
    id: "paper-gan-goodfellow",
    title: "NIPS 2016 Tutorial: Generative Adversarial Networks (Ian Goodfellow)",
    authorOrSource: "Ian Goodfellow",
    category: "Papers & Lectures",
    repoPath: "Paper/GAN Ian Goodfellow.pdf",
    sizeMB: 23.2,
    targetModules: ["M5"],
    coreTakeaways: "生成器与判别器对抗博弈思想源头：生成器负责产出，判别器负责挑刺。",
    courseApplication: "思想迁移到 Cursor 研发闭环：Builder Agent（生成）与 Bugbot / 测试门禁（判别）形成良性对抗闭环。",
    keywords: ["Generator vs Discriminator", "Adversarial Loop"],
  },
  {
    id: "paper-how-to-read-paper",
    title: "How to Read a Paper (S. Keshav · Three-Pass Approach)",
    authorOrSource: "University of Waterloo",
    category: "Papers & Lectures",
    repoPath: "Paper/HowtoReadPaper.pdf",
    sizeMB: 0.1,
    targetModules: ["M1", "M2"],
    coreTakeaways: "经典的“三遍阅读法”：第一遍 5 分钟扫结构，第二遍抓核心图例，第三遍深究实现细节。",
    courseApplication: "可迁移为 Cursor 接手陌生开源项目或 AI Studio 原型时的「三遍 Codebase 摸底法」。",
    keywords: ["Three-Pass", "Code Reading", "Onboarding"],
  },
  {
    id: "paper-craft-of-research",
    title: "The Craft of Research",
    authorOrSource: "University of Chicago Press",
    category: "Papers & Lectures",
    repoPath: "Paper/the_craft_of_reseach.pdf",
    sizeMB: 2.0,
    targetModules: ["M1"],
    coreTakeaways: "讲透如何把模糊话题聚焦为“有证据支撑、可验证解决的核心问题 (Claim + Evidence)”。",
    courseApplication: "支撑 M1 产品规格与 PRD 结构化论证编写能力。",
    keywords: ["Problem Framing", "Evidence", "Spec Writing"],
  },
  {
    id: "paper-writing-part-1",
    title: "Academic & Technical Writing Guide · Part 1",
    authorOrSource: "Research Guide",
    category: "Papers & Lectures",
    repoPath: "Paper/Paper_Writing_Part-1.pdf",
    sizeMB: 1.4,
    targetModules: ["M1", "M3"],
    coreTakeaways: "结构化技术表达规范：先结论后细节、清晰段落逻辑与读者视角组织。",
    courseApplication: "提升 `PRD.md`、`AGENTS.md` 与 GitHub Issue 的可读性与机器解析度。",
    keywords: ["Technical Writing", "PRD", "Clarity"],
  },
  {
    id: "paper-writing-part-2",
    title: "Academic & Technical Writing Guide · Part 2",
    authorOrSource: "Research Guide",
    category: "Papers & Lectures",
    repoPath: "Paper/Paper_Writing_Part-2.pdf",
    sizeMB: 0.1,
    targetModules: ["M3", "M7"],
    coreTakeaways: "图表摘要、实验对照报告写作与精确数据呈现规范。",
    courseApplication: "优化 PR 描述模板、Cursor 变更报告与 ROI 复盘文档撰写。",
    keywords: ["Reporting", "PR Summary", "Documentation"],
  },
  {
    id: "paper-coccoc-webinar",
    title: "Data Career Tracks: Data Scientist, Analyst & Data Engineer (Webinar)",
    authorOrSource: "Industry Webinar",
    category: "Papers & Lectures",
    repoPath: "Paper/Webinar CocCoc_Data Scientist, Data Analyst & Data Engineer.pdf",
    sizeMB: 4.7,
    targetModules: ["M1", "M8"],
    coreTakeaways: "拆解数据工程、分析与科学三类角色的日常产出物与工程协作接口。",
    courseApplication: "辅助 M8 产品团队多角色 Agent 职能建模。",
    keywords: ["Roles", "Data Engineering", "Team Structure"],
  },
  {
    id: "paper-opendev-terminal-agents",
    title: "Building Effective AI Coding Agents for the Terminal: Scaffolding, Harness & Context Engineering (arXiv:2603.05344)",
    authorOrSource: "Nghi D. Q. Bui · arXiv:2603.05344 (2026)",
    category: "Papers & Lectures",
    repoPath: "external/arxiv-2603.05344.pdf",
    externalUrl: "https://arxiv.org/pdf/2603.05344",
    sizeMB: 3.2,
    targetModules: ["M1", "M2", "M4", "M5", "M6", "M8"],
    coreTakeaways: "提出终端编码 Agent 四层架构（Scaffolding / Harness / Context Engineering / Persistence）：指出工具输出占 70–80% 上下文，靠 5 阶自适应压缩 (ACC: 70%/80%/85%/90%/99%) 降峰值 54%；用 Schema Gating、Thinking/Action 解耦、惰性 MCP 发现 (40%→<5%) 与 role:user 事件级系统提醒消除长程衰减。",
    courseApplication: "作为 M2 上下文压力管理、M4 惰性 MCP/Plan 隔离、M5 3-Nudge 错误自愈、M6 CLI 沙盒安全与 Lab 06 推演沙盘的核心工程蓝本。",
    keywords: ["OPENDEV", "2603.05344", "Scaffolding", "Harness", "ACC", "Schema Gating", "Lazy MCP", "Context Engineering"],
  },
  {
    id: "the-vibe-coders-handbook-2026",
    title: "The Vibe Coder's Handbook: Understanding Every Tool Your AI Just Used (March 2026 Edition)",
    authorOrSource: "Nasser AlNasser & Harsimran · vibecodershandbook.pages.dev",
    category: "AI Architecture",
    repoPath: "assets/aistudio/TheVibeCodersHandbook_cd703cf8.pdf",
    externalUrl: "https://vibecodershandbook.pages.dev/chapters/introduction",
    sizeMB: 2.1,
    targetModules: ["M1", "M3", "M8", "M9", "M10"],
    coreTakeaways: "用通俗“餐厅三层模型 / 整车装配 / 孤岛架构”系统讲透现代 JS/TS 全栈 14 项核心工具分工（Either/Or 互斥选型 vs Work Together 协同组合）；揭露 45% AI 生成代码含安全漏洞的警钟，并附 8 类高频报错解码器、项目目录解剖与 32 词速查词典。",
    courseApplication: "直接支撑新增课程模块 Module 9（全栈工具图谱与白盒化实战）及 Lab 07 交互式 14 岗装配与报错解码沙盘，帮助非科班出身的独立开发者与产品经理彻底读懂 Cursor 生成的每一层代码。",
    keywords: ["Vibe Coding", "Master Map", "TypeScript", "Next.js", "Astro Islands", "Drizzle", "Zustand", "TanStack Query", "Zod", "Security"],
  },
  {
    id: "paper-ai-coding-scientific-2410",
    title: "The Why, What, and How of AI-Based Coding in Scientific Research (arXiv:2410.02156)",
    authorOrSource: "Tonghe Zhuang & Zhicheng Lin · arXiv:2410.02156",
    category: "Papers & Lectures",
    repoPath: "external/arxiv-2410.02156.pdf",
    externalUrl: "https://arxiv.org/pdf/2410.02156",
    sizeMB: 1.4,
    targetModules: ["M1", "M2", "M5", "M8"],
    coreTakeaways:
      "从 Why / What / How 三维拆解非计算机专业研究者与领域专家的 AI 编程范式：提炼 6 类 AI 编码辅助（生成、跨语言翻译、逐行解释学习、排错、重构优化、文档生成）与 5 步迭代工作流（立项约束 → 会话建境 → 生成审查 → 基准验证防隐性错误 → 精炼文档化）。",
    courseApplication:
      "融入 M1 P10 与 M5 验证闭环：为产品经理与非科班独立开发者提供对抗「知识悖论」的逐行解释学习法，以及用基准数据集拦截静默逻辑/数值幻觉的 5 步流。",
    keywords: ["arXiv:2410.02156", "Scientific Coding", "Six Types", "Five-Step Workflow", "Code Translation", "Silent Errors"],
  },
  {
    id: "sonarsource-7-habits-ai-coding",
    title: "7 Habits of Highly Effective AI Coding",
    authorOrSource: "Sonar (SonarSource) eBook",
    category: "AI Engineering",
    repoPath: "external/sonar-7-habits-of-highly-effective-ai-coding.pdf",
    externalUrl: "https://www.sonarsource.com/7-habits-of-highly-effective-ai-coding-ebook.pdf",
    sizeMB: 2.3,
    targetModules: ["M4", "M5", "M6", "M7", "M8"],
    coreTakeaways:
      "直面 AI 编码“工程生产力悖论”（代码产量暴增但 Review 与调试堵死），提出七大铁律：人类对每行代码负全责（git blame 不会指向 AI）、过度文档化上下文、保持低认知复杂度、严禁残留无用死代码（No Stray Code）、对 AI 代码执行比手写更严的 SAST 全量扫描、强制单测且严防 AI Test Reward Hacking、人工 Review 聚焦架构与业务逻辑。",
    courseApplication:
      "升级 M5 P67b 代码质量双塔与 M6 Lab 04 Bugbot 检测规则：将「清扫 Stray Code」与「识别弱断言/测试作弊 Reward Hacking」直接编码进 DoD 与静态审查台。",
    keywords: ["Sonar", "7 Habits", "Accountability", "No Stray Code", "Cognitive Complexity", "Reward Hacking", "SAST"],
  },
  {
    id: "iasalut-ai-code-good-practice",
    title: "Good Practice Guide for Code Development in AI Solutions in Health",
    authorOrSource: "TIC Salut Social · Programa Salut/IA",
    category: "AI Engineering",
    repoPath: "external/iasalut-good-practice-guide-ai-health.pdf",
    externalUrl: "https://iasalut.cat/wp-content/uploads/2023/05/Good-practice-guide-for-code-development-in-Artificial-Intelligence-solutions-in-health.pdf",
    sizeMB: 1.8,
    targetModules: ["M4", "M5", "M6", "M8"],
    coreTakeaways:
      "面向医疗临床等高风险 AI 系统的工程规范指南：涵盖多语言选型（Python/R/Java/C++）、命名秩序与 SOLID 原则、定量静态复杂度指标（圈复杂度 Cyclomatic + Halstead 复杂度）、五层测试金字塔（单元 → 实现集成 → 系统 → 验收 → 回归）以及 ISO / MDR / EU AI Act 可审计合规标准。",
    courseApplication:
      "融入 M5 P67b 高合规验证体系：指导独立开发者在金融、医疗、支付等关键业务中用圈复杂度阈值与五层测试金字塔守住生产稳定性。",
    keywords: ["IASalut", "SOLID", "Cyclomatic Complexity", "Halstead", "5-Layer Testing", "Compliance", "EU AI Act"],
  },
];

export const CURRICULUM_BOOK_BUNDLES: CurriculumBookBundle[] = [
  {
    id: "bundle-opendev-harness",
    label: "2603.05344 Harness 专题",
    targetModule: "M2",
    goal: "基于 OPENDEV (arXiv:2603.05344) 重构 Cursor 上下文压缩、Schema Gating 与防衰减工作流",
    bookIds: [
      "paper-opendev-terminal-agents",
      "ai-engineering-chip-huyen",
      "building-apps-ai-agents",
      "paper-lets-verify-step-by-step",
    ],
  },
  {
    id: "bundle-m1-paradigm",
    label: "M1 范式跃迁书单",
    targetModule: "M1",
    goal: "跨越 70% 困境与知识悖论，用 6 类辅助与 5 步迭代建立结构化 Cursor 工程思维",
    bookIds: [
      "beyond-vibe-coding",
      "paper-ai-coding-scientific-2410",
      "ai-engineering-chip-huyen",
      "paper-lets-verify-step-by-step",
    ],
  },
  {
    id: "bundle-m2-context",
    label: "M2 上下文架构书单",
    targetModule: "M2",
    goal: "理解为什么全量上下文 + 依赖图拓扑在复杂重构中击败碎片化 RAG",
    bookIds: [
      "paper-graph-rag-survey",
      "hands-on-llms",
      "gof-design-patterns",
      "paper-stanford-transformers-cheatsheet",
    ],
  },
  {
    id: "bundle-m3-fullstack",
    label: "M3 全栈上线书单",
    targetModule: "M3",
    goal: "夯实 FastAPI/Express API、数据库事务引擎、数据看板与 Serverless 上线底座",
    bookIds: [
      "building-genai-fastapi",
      "database-internals",
      "storytelling-with-data",
      "paper-aws-serverless",
    ],
  },
  {
    id: "bundle-m4-agents",
    label: "M4 规则与多智能体书单",
    targetModule: "M4",
    goal: "设计 Contract-First 契约先行的 Multi-Agent 协作与 Generative AI 模式库",
    bookIds: [
      "building-apps-ai-agents",
      "ai-agents-in-action",
      "generative-ai-design-patterns",
      "paper-automated-agentic-systems",
    ],
  },
  {
    id: "bundle-m5-quality",
    label: "M5 质量门禁与七习惯书单",
    targetModule: "M5",
    goal: "融合 Sonar 7 Habits（防 Stray Code / Reward Hacking）与 IASalut 五层测试与复杂度门禁",
    bookIds: [
      "sonarsource-7-habits-ai-coding",
      "iasalut-ai-code-good-practice",
      "beyond-vibe-coding",
      "paper-ai-coding-scientific-2410",
    ],
  },
  {
    id: "bundle-m6-bugbot",
    label: "M6 审查与安全门禁书单",
    targetModule: "M6",
    goal: "消除 LLM 审查自偏见与生产力悖论，建立高可信 Bugbot 安全审计流",
    bookIds: [
      "sonarsource-7-habits-ai-coding",
      "paper-llm-as-a-judge",
      "paper-code-comprehension-auditing",
      "paper-sleeper-agents",
    ],
  },
  {
    id: "bundle-m9-vibestack",
    label: "M9 全栈白盒图谱书单",
    targetModule: "M9",
    goal: "基于 The Vibe Coder's Handbook 建立现代 Web 三层架构、Either/Or 选型与安全校验全局心智模型",
    bookIds: [
      "the-vibe-coders-handbook-2026",
      "beyond-vibe-coding",
      "building-genai-fastapi",
      "database-internals",
    ],
  },
  {
    id: "bundle-m10-aesthetics",
    label: "M10 审美与效能书单",
    targetModule: "M10",
    goal: "围绕 AI Coding 审美积累与 VibeCoding 效能实践，打通高信噪比视觉输入、组件架构选择与 Cursor 精准提示词落地",
    bookIds: [
      "beyond-vibe-coding",
      "the-vibe-coders-handbook-2026",
    ],
  },
];
