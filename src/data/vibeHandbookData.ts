export type MasterMapLayerGroup = "frontend" | "backend_data" | "tooling_deploy";

export type StackPresetId = "saas-2026" | "astro-content" | "edge-hono";

export interface MasterMapRow {
  id: string;
  job: string;
  jobZh: string;
  layerGroup: MasterMapLayerGroup;
  whatItDoes: string;
  eitherOrOptions: string[];
  default2026: string;
  analogy: string;
  whyAiPicksIt: string;
  cursorRuleTip: string;
  presetChoices: Record<StackPresetId, string>;
}

export interface StackPresetMeta {
  id: StackPresetId;
  label: string;
  audience: string;
  summary: string;
}

export const STACK_PRESETS: StackPresetMeta[] = [
  {
    id: "saas-2026",
    label: "2026 默认全栈 SaaS",
    audience: "独立开发者 SaaS / AI 产品",
    summary: "TypeScript + React + Next.js + Tailwind + PostgreSQL + Drizzle + Zustand + TanStack Query + Zod + Vercel",
  },
  {
    id: "astro-content",
    label: "内容站 / Astro 孤岛栈",
    audience: "文档站 / 营销官网 / 博客",
    summary: "TypeScript + Astro Islands (局部 React) + Tailwind + Zero JS 默认输出 + Netlify / Cloudflare",
  },
  {
    id: "edge-hono",
    label: "极速边缘 SPA + API 栈",
    audience: "低延迟工具 / 全球边缘应用",
    summary: "TypeScript + React + Vite + Hono (<14KB) + Supabase Postgres + Drizzle (~7KB) + Zod + Railway",
  },
];

export const MASTER_MAP_ROWS: MasterMapRow[] = [
  {
    id: "language",
    job: "Language",
    jobZh: "编程语言",
    layerGroup: "frontend",
    whatItDoes: "编写前后端业务逻辑的源码语言（浏览器只懂 JS，TS 编译后去除类型）",
    eitherOrOptions: ["TypeScript", "JavaScript"],
    default2026: "TypeScript",
    analogy: "TS = 带编译期红线安检的 JS，85% 专业新项目默认选择，Node.js 现已原生直跑 .ts。",
    whyAiPicksIt: "静态类型充当“永不过时的活文档”，让 Cursor Agent 减少约 60% 传参错位幻觉。",
    cursorRuleTip: "在 tsconfig.json 开启 strict: true，严禁在 .cursor/rules 中放任 any 逃逸。",
    presetChoices: {
      "saas-2026": "TypeScript",
      "astro-content": "TypeScript",
      "edge-hono": "TypeScript",
    },
  },
  {
    id: "runtime",
    job: "Runtime",
    jobZh: "服务端运行时",
    layerGroup: "backend_data",
    whatItDoes: "让 JS/TS 脱离浏览器，在服务器和本机命令行直接执行的引擎",
    eitherOrOptions: ["Node.js", "Bun", "Deno"],
    default2026: "Node.js",
    analogy: "不是框架也不是语言，而是驱动 React/Next/Express 运转的发动机（基于 V8）。",
    whyAiPicksIt: "生态兼容性最大、所有云托管平台原生支持；追求极速脚本可选 Bun（快 3–5x）。",
    cursorRuleTip: "在 package.json 锁定 engines.node，避免本地与生产版本不一致引发依赖崩溃。",
    presetChoices: {
      "saas-2026": "Node.js",
      "astro-content": "Node.js",
      "edge-hono": "Bun / Node.js",
    },
  },
  {
    id: "package-manager",
    job: "Package Manager",
    jobZh: "包管理器",
    layerGroup: "tooling_deploy",
    whatItDoes: "从 npm 仓库（250万+包）下载管理第三方依赖，读写 package.json",
    eitherOrOptions: ["npm", "pnpm", "Yarn Berry", "Bun"],
    default2026: "npm",
    analogy: "代码界的应用商店；node_modules 是本地缓存仓库（绝不手改、绝不进 Git）。",
    whyAiPicksIt: "npm 随 Node 自带、零配置零坑；多项目节省 70% 磁盘与提速 2x 可换 pnpm。",
    cursorRuleTip: "同一仓库只保留一种 lockfile，并在 .cursor/rules 指定统一安装命令。",
    presetChoices: {
      "saas-2026": "npm",
      "astro-content": "pnpm",
      "edge-hono": "Bun",
    },
  },
  {
    id: "frontend",
    job: "Frontend",
    jobZh: "UI 组件框架",
    layerGroup: "frontend",
    whatItDoes: "用可复用组件（按钮/表单/卡片）声明界面状态与 DOM 局部自动更新",
    eitherOrOptions: ["React", "Vue", "Angular", "Svelte"],
    default2026: "React",
    analogy: "餐厅的桌面摆盘规范；单个项目四选一互斥（React 占 ~45%、Vue ~19%）。",
    whyAiPicksIt: "React 训练语料与第三方库（shadcn/ui、TanStack）生态最庞大，AI 生成最稳。",
    cursorRuleTip: "声明函数式组件 + Hooks 规范，避免 AI 混入过时的 Class 组件写法。",
    presetChoices: {
      "saas-2026": "React",
      "astro-content": "React (按需孤岛)",
      "edge-hono": "React",
    },
  },
  {
    id: "meta-framework",
    job: "Meta-Framework",
    jobZh: "全栈元框架",
    layerGroup: "frontend",
    whatItDoes: "架构在 UI 框架之上，补齐 SSR 服务端渲染、文件路由与后端 API 能力",
    eitherOrOptions: ["Next.js", "Nuxt", "SvelteKit", "Remix", "Astro", "None (纯 SPA)"],
    default2026: "Next.js",
    analogy: "React 是汽车发动机，Next.js 是配齐底盘仪表盘的整车；Astro 是平静 HTML 海洋中的交互孤岛。",
    whyAiPicksIt: "避免纯 SPA 首屏白页与 SEO 盲区，让单项目同时完成前端渲染与 API 接口。",
    cursorRuleTip: "区分 Server Components 与 'use client' 边界，防止在服务端组件误用 useState。",
    presetChoices: {
      "saas-2026": "Next.js",
      "astro-content": "Astro (Islands)",
      "edge-hono": "None (纯 Vite SPA)",
    },
  },
  {
    id: "styling",
    job: "Styling",
    jobZh: "样式方案",
    layerGroup: "frontend",
    whatItDoes: "控制色彩、排版、间距、阴影与多端响应式断点",
    eitherOrOptions: ["Tailwind CSS", "CSS Modules", "styled-components", "Plain CSS / SCSS"],
    default2026: "Tailwind CSS",
    analogy: "原子工具类直接写在 JSX 上，打包自动裁剪未用样式（常小于 10KB）。",
    whyAiPicksIt: "55% 占比绝对主流；bg-blue-500 语义无歧义，AI 无需跨文件切换即可精准排版。",
    cursorRuleTip: "在 rules 锁定 60-30-10 配色与字体体系，避免 AI 滥用紫色渐变或胶囊边框。",
    presetChoices: {
      "saas-2026": "Tailwind CSS",
      "astro-content": "Tailwind CSS",
      "edge-hono": "Tailwind CSS",
    },
  },
  {
    id: "backend",
    job: "Backend",
    jobZh: "后端服务框架",
    layerGroup: "backend_data",
    whatItDoes: "隐藏在数据中心处理业务规则、鉴权、支付与数据库安全交互的厨房引擎",
    eitherOrOptions: ["Express", "Fastify", "NestJS", "Hono", "Next.js Routes"],
    default2026: "Express or Next.js",
    analogy: "Express 最普及（1800万/周中间件管道）；Hono <14KB 统治边缘；Next.js 可替代中小项目独立后端。",
    whyAiPicksIt: "中小型全栈项目直接用 Next.js Routes 最快；独立长连接/WebSocket/微服务用 Express/Fastify。",
    cursorRuleTip: "强制所有写路由挂鉴权中间件，严禁信任 req.body 传入的 userId 或价格字段。",
    presetChoices: {
      "saas-2026": "Next.js Routes",
      "astro-content": "Astro Actions / Static",
      "edge-hono": "Hono (<14KB)",
    },
  },
  {
    id: "database",
    job: "Database",
    jobZh: "持久化数据库",
    layerGroup: "backend_data",
    whatItDoes: "永久保存用户、订单、文章与系统日志的底层存储库（餐厅食材库）",
    eitherOrOptions: ["PostgreSQL", "MySQL", "SQLite", "MongoDB"],
    default2026: "PostgreSQL",
    analogy: "Postgres 是 2026 首选全能关系库；Supabase 提供开箱即用的托管 Postgres + Auth + RLS。",
    whyAiPicksIt: "强关系表结构 + JSONB + 向量扩展通吃，搭配 Supabase 几分钟拥有生产级底座。",
    cursorRuleTip: "在 Supabase 开启 Row-Level Security (auth.uid() = user_id)，绝不关闭 RLS。",
    presetChoices: {
      "saas-2026": "PostgreSQL (Supabase)",
      "astro-content": "None / SQLite",
      "edge-hono": "PostgreSQL (Supabase)",
    },
  },
  {
    id: "orm",
    job: "ORM",
    jobZh: "数据库映射层",
    layerGroup: "backend_data",
    whatItDoes: "用 TypeScript 操作数据库并自动防范 SQL 注入的中间翻译层",
    eitherOrOptions: ["Drizzle", "Prisma"],
    default2026: "Either",
    analogy: "Drizzle (~7KB) 贴近 SQL 语法且零编译步骤；Prisma 通过 .prisma 声明文件快速原型开发。",
    whyAiPicksIt: "用 ORM 查询默认参数化，可彻底根除 AI 拼接字符串导致的高危 SQL 注入漏洞。",
    cursorRuleTip: "禁止手写字符串拼接 SQL；所有 Schema 变更必须通过迁移脚本（Migration）提交。",
    presetChoices: {
      "saas-2026": "Drizzle ORM",
      "astro-content": "None",
      "edge-hono": "Drizzle ORM (~7KB)",
    },
  },
  {
    id: "client-state",
    job: "Client State",
    jobZh: "客户端状态",
    layerGroup: "frontend",
    whatItDoes: "仅存在于浏览器内存的界面临时状态（侧栏展开、筛选器、主题开关）",
    eitherOrOptions: ["Zustand", "Redux", "Jotai"],
    default2026: "Zustand",
    analogy: "约 1KB 极简 Store（2000万/周），彻底取代样板冗长的 Redux，与服务端状态协同分工。",
    whyAiPicksIt: "代码极短、无 Provider 嵌套地狱，Cursor Agent 5 分钟即可写对跨组件状态。",
    cursorRuleTip: "严禁把后端接口列表缓存手写进 Zustand；Zustand 只管纯 UI 交互状态。",
    presetChoices: {
      "saas-2026": "Zustand",
      "astro-content": "Nano Stores / 无",
      "edge-hono": "Zustand",
    },
  },
  {
    id: "server-state",
    job: "Server State",
    jobZh: "服务端数据获取",
    layerGroup: "frontend",
    whatItDoes: "统一接管 API 请求的 Loading、错误重试、缓存去重与后台静默刷新",
    eitherOrOptions: ["TanStack Query", "SWR"],
    default2026: "TanStack Query",
    analogy: "每个请求省去 30–50 行 useEffect 手写样板代码，20 个接口立省近千行易错代码。",
    whyAiPicksIt: "自带指数退避重试、标签切回自动刷新与请求去重，消除 React useEffect 竞态 Bug。",
    cursorRuleTip: "为所有 GET 数据流强制使用 useQuery，写操作配合 invalidateQueries 自动刷新缓存。",
    presetChoices: {
      "saas-2026": "TanStack Query",
      "astro-content": "构建时预取",
      "edge-hono": "TanStack Query",
    },
  },
  {
    id: "validation",
    job: "Validation",
    jobZh: "边界数据校验",
    layerGroup: "backend_data",
    whatItDoes: "在表单提交、API 入参和启动读取 .env 时强制核验数据形状合法性",
    eitherOrOptions: ["Zod", "Yup", "Joi"],
    default2026: "Zod",
    analogy: "“一次定义、双端通吃”——同时拿到运行时拦截报错与编译期 TS 类型推导 (z.infer)。",
    whyAiPicksIt: "800万/周断层第一，前端 React Hook Form 与后端 Express/Next 共享同一套契约。",
    cursorRuleTip: "所有 API POST/PATCH 入口必须先执行 schema.safeParse(req.body)，失败直返 400。",
    presetChoices: {
      "saas-2026": "Zod",
      "astro-content": "Zod (Content Schema)",
      "edge-hono": "Zod",
    },
  },
  {
    id: "build-tool",
    job: "Build Tool",
    jobZh: "构建打包器",
    layerGroup: "tooling_deploy",
    whatItDoes: "在上线前把 TS / JSX / Tailwind 翻译打包成浏览器唯一认识的 HTML/CSS/JS",
    eitherOrOptions: ["Vite", "Turbopack", "Webpack"],
    default2026: "Vite",
    analogy: "Vite (法语“快”) 靠原生 ESM 实现毫秒热更新 (HMR)；Next.js 内部默认托管 Turbopack。",
    whyAiPicksIt: "纯 React/Vue/Svelte 选 Vite 是绝对标准，几乎无需手写复杂 Webpack 配置。",
    cursorRuleTip: "禁止在 client 构建中引入服务端密钥变量；所有客户端 env 仅暴露公开前缀。",
    presetChoices: {
      "saas-2026": "Turbopack (Next 内置)",
      "astro-content": "Vite (Astro 内置)",
      "edge-hono": "Vite",
    },
  },
  {
    id: "deployment",
    job: "Deployment",
    jobZh: "云端上线托管",
    layerGroup: "tooling_deploy",
    whatItDoes: "告别 localhost，关联 GitHub push 自动构建发布为全球 HTTPS 域名服务",
    eitherOrOptions: ["Vercel", "Netlify", "Railway", "AWS / GCP / Azure"],
    default2026: "Vercel",
    analogy: "Vercel/Netlify 专精前端与 Serverless（PR 自动生成预览链接）；Railway 擅长托管常驻后端、Docker 与 DB。",
    whyAiPicksIt: "独立开发者零运维上线，push 即部署且免费 HTTPS；有复杂集群再迁往 AWS/GCP。",
    cursorRuleTip: "部署前核对 .env.example 与平台 Secrets 一致，排查 Serverless 只读磁盘写入。",
    presetChoices: {
      "saas-2026": "Vercel",
      "astro-content": "Netlify / Cloudflare Pages",
      "edge-hono": "Railway + Cloudflare",
    },
  },
];

export interface ErrorDecoderItem {
  id: string;
  group: "frontend" | "backend";
  errorTitle: string;
  meaning: string;
  rootCause: string;
  fixStep: string;
  cursorDebugPrompt: string;
}

export const ERROR_DECODER_ITEMS: ErrorDecoderItem[] = [
  {
    id: "err-undefined",
    group: "frontend",
    errorTitle: "Cannot read properties of undefined",
    meaning: "接口数据尚未返回或字段缺失，组件就提前读取了嵌套属性。",
    rootCause: "异步请求还在加载中、空数组未设默认值，或后端返回结构与前端假设不一致。",
    fixStep: "增加加载态判断与可选链守卫：if (!data) return <Skeleton /> 或使用 data?.items ?? []。",
    cursorDebugPrompt: "@报错组件.tsx 出现 Cannot read properties of undefined。请检查异步加载前的空值状态，补齐 Loading 骨架态与 ?. 可选链兜底。",
  },
  {
    id: "err-module",
    group: "frontend",
    errorTitle: "Module not found / Cannot find module",
    meaning: "import 导入路径拼写错误、大小写不符，或第三方 npm 包未安装。",
    rootCause: "AI 虚构了不存在的组件路径、@/ 别名配置有误，或新增依赖忘记执行 npm install。",
    fixStep: "核对路径大小写与 tsconfig paths 别名；缺失包在终端运行 npm install <pkg>。",
    cursorDebugPrompt: "控制台报 Module not found（附上第一行完整路径）。请核对真实文件名路径并检查 package.json 是否漏装依赖。",
  },
  {
    id: "err-hydration",
    group: "frontend",
    errorTitle: "Hydration mismatch (Next.js 高频)",
    meaning: "服务端预渲染的 HTML 与客户端浏览器初次水合渲染的结果不一致。",
    rootCause: "在组件初次渲染时直接读取 Date.now()、window.innerWidth、localStorage 或受浏览器插件注入干扰。",
    fixStep: "把依赖浏览器环境或随机值的渲染放进 useEffect(() => setMounted(true), []) 之后执行。",
    cursorDebugPrompt: "@页面组件.tsx 触发 Hydration mismatch。请定位首个服务端/客户端输出差异点，将浏览器专属读取延迟到 useEffect 挂载后。",
  },
  {
    id: "err-rerenders",
    group: "frontend",
    errorTitle: "Too many re-renders",
    meaning: "组件陷入无限死循环重渲染，React 强制熔断。",
    rootCause: "在组件函数体顶层直接调用了 setState，或 onClick={fn()} 写成了立即执行而非传函数引用 onClick={() => fn()}。",
    fixStep: "将 setState 移入事件处理函数或带正确依赖项的 useEffect 内。",
    cursorDebugPrompt: "@报错组件.tsx 报 Too many re-renders。请排查组件渲染体内的直接 setState 或未包箭头的 onClick 绑定。",
  },
  {
    id: "err-econnrefused",
    group: "backend",
    errorTitle: "ECONNREFUSED",
    meaning: "无法连接到数据库或后端 API 服务，TCP 连接被目标端口拒绝。",
    rootCause: "数据库/后端服务未启动、.env 里的 PORT 或 DATABASE_URL 配错，或主机用了 127.0.0.1 vs 容器域名不一致。",
    fixStep: "先确认本地 Postgres / Express 进程正在运行，再核对 .env 连接串端口。",
    cursorDebugPrompt: "后端报 ECONNREFUSED（附上端口号）。请核对 server 启动脚本、.env 连接地址及健康检查超时兜底。",
  },
  {
    id: "err-port",
    group: "backend",
    errorTitle: "Port already in use (EADDRINUSE)",
    meaning: "当前目标端口（常见 3000 / 8000）已被另一个后台进程占用。",
    rootCause: "上次 dev server 未正常退出成为僵尸进程，或开了两个终端重复运行 npm run dev。",
    fixStep: "执行 lsof -i :3000 查出 PID 并 kill，或将旧进程终止后重启服务。",
    cursorDebugPrompt: "启动服务报 EADDRINUSE 端口被占用，请帮我写出清理占用进程并重启验证的终端指令（不要擅自换掉规定端口）。",
  },
  {
    id: "err-cors",
    group: "backend",
    errorTitle: "CORS error (Access-Control-Allow-Origin)",
    meaning: "浏览器安全策略拦截了跨域请求，前端与后端不在同一域名/端口。",
    rootCause: "Vite (:5173) 直接请求独立后端 (:8000) 且未配 proxy，或后端 cors() 未放行对应 Origin 与请求头。",
    fixStep: "开发期用同源 Vite proxy 转发 /api/*，或后端显式配置 cors({ origin, credentials })。",
    cursorDebugPrompt: "浏览器 Network 报 CORS error。请优先配置同源服务端代理或明确允许的前端 Origin 白名单与预检头。",
  },
  {
    id: "err-peer-dep",
    group: "backend",
    errorTitle: "npm ERR! peer dep (EREADME / ERESOLVE)",
    meaning: "两个 npm 包对同一个基础依赖（如 React 18 vs 19）版本要求冲突。",
    rootCause: "引入了尚未更新 peerDependencies 声明的老插件，导致 npm 拒绝安装。",
    fixStep: "检查是否有多余旧包可替换为维护中版本，或临时使用 npm install --legacy-peer-deps。",
    cursorDebugPrompt: "安装依赖报 npm ERR! ERESOLVE peer dependency 冲突（贴前 15 行日志）。请判断冲突根源并给出兼容版本或安全替代库。",
  },
];

export const EMERGENCY_RECOVERY_STEPS: string[] = [
  "1. 精读报错的第一行文字（Golden Rule：90% 的错误复制第一行就能直接定位根因）",
  "2. 核对前端 Console 红字与 Network 红色请求的 HTTP 状态码 / Response",
  "3. 清理构建缓存（删除 .next / dist 目录）",
  "4. 彻底重装依赖（仅在依赖损坏时删除 node_modules 并重新运行 npm install）",
  "5. 重启开发服务器，并将精简现场 + 当前版本回滚锚点交给 Cursor Debug",
];

export type GlossaryCategory = "前端与渲染" | "后端与接口" | "数据与构建" | "AI 研发范式";

export interface GlossaryTermItem {
  term: string;
  category: GlossaryCategory;
  definition: string;
  whereSeenInAiApp: string;
}

export const GLOSSARY_TERMS: GlossaryTermItem[] = [
  { term: "API", category: "后端与接口", definition: "Application Programming Interface，两个程序之间按约定格式点菜与交付的通信接口。", whereSeenInAiApp: "前端 fetch('/api/orders') 与后端路由" },
  { term: "Backend", category: "后端与接口", definition: "运行在数据中心服务器上的隐藏逻辑层，负责鉴权、支付、风控与访问数据库。", whereSeenInAiApp: "server.ts / app/api/*/route.ts" },
  { term: "Bundler", category: "数据与构建", definition: "把数百个 TS/JSX/CSS 模块打包压缩为少数浏览器可执行文件的构建工具（如 Vite、Webpack）。", whereSeenInAiApp: "vite.config.ts / npm run build" },
  { term: "Client", category: "前端与渲染", definition: "用户手上的浏览器端，任何跑在这里的代码都能被审查或篡改，绝不能存放密钥。", whereSeenInAiApp: "src/components/* / 'use client'" },
  { term: "Component", category: "前端与渲染", definition: "像乐高积木一样自带数据和样式的可复用 UI 单元（按钮、表单、卡片）。", whereSeenInAiApp: "src/components/*.tsx" },
  { term: "CSS", category: "前端与渲染", definition: "Cascading Style Sheets，控制网页颜色、字体、间距、动画与响应式布局。", whereSeenInAiApp: "index.css / Tailwind 类名" },
  { term: "Deploy", category: "数据与构建", definition: "把本地 localhost 代码发布到 Vercel/Railway 等公网服务器，赋予可访问 URL。", whereSeenInAiApp: "Vercel / Railway / GitHub Actions" },
  { term: "Frontend", category: "前端与渲染", definition: "用户在浏览器中直接看见并点击交互的“餐厅大堂”。", whereSeenInAiApp: "React / Vue / Svelte 页面代码" },
  { term: "Framework", category: "前端与渲染", definition: "约定好组件组织与更新规律的结构化工具包，替代零散手写 DOM 操作。", whereSeenInAiApp: "React / Express / Fastify" },
  { term: "Hook", category: "前端与渲染", definition: "React 中以 use 开头的特殊函数，让组件管理状态(useState)与副作用(useEffect)。", whereSeenInAiApp: "useState / useEffect / useQuery" },
  { term: "HTML", category: "前端与渲染", definition: "HyperText Markup Language，网页骨架与语义内容蓝图（标题、表单、按钮）。", whereSeenInAiApp: "index.html / JSX 返回标签" },
  { term: "HTTP", category: "后端与接口", definition: "浏览器“服务员”与服务器“厨房”之间递送请求与响应的通用网络协议。", whereSeenInAiApp: "GET / POST 请求与 200/401/500 状态码" },
  { term: "JavaScript", category: "前端与渲染", definition: "所有浏览器唯一原生懂得的编程语言，驱动网页交互与跨端服务端生态。", whereSeenInAiApp: ".js 文件与编译后的运行时产物" },
  { term: "JSX", category: "前端与渲染", definition: "允许在 JavaScript/TypeScript 文件里直接书写类 HTML UI 标签的语法。", whereSeenInAiApp: ".tsx / .jsx 组件返回值" },
  { term: "Meta-Framework", category: "前端与渲染", definition: "架构在 UI 框架之上的全栈套件（如 Next.js 之于 React、Nuxt 之于 Vue）。", whereSeenInAiApp: "Next.js App Router / Astro Islands" },
  { term: "Middleware", category: "后端与接口", definition: "在请求抵达核心路由之前按流水线依次运行的守卫函数（日志、CORS、鉴权）。", whereSeenInAiApp: "Express app.use() / Next middleware.ts" },
  { term: "Migration", category: "数据与构建", definition: "按版本安全新增或修改数据库表结构与字段的脚本。", whereSeenInAiApp: "drizzle/ 或 supabase/migrations/" },
  { term: "Node.js", category: "后端与接口", definition: "把 Chrome V8 引擎搬出浏览器，使 JS/TS 能运行在服务器与本地终端的引擎。", whereSeenInAiApp: "本地 npm 脚本与 Express 服务" },
  { term: "npm", category: "数据与构建", definition: "Node Package Manager，管理超过 250 万开源代码包的生态注册表与命令行。", whereSeenInAiApp: "package.json / node_modules" },
  { term: "ORM", category: "数据与构建", definition: "Object-Relational Mapping，用 TypeScript 类型安全地读写数据库并防 SQL 注入。", whereSeenInAiApp: "Drizzle ORM / Prisma" },
  { term: "Package", category: "数据与构建", definition: "发布到 npm 上可直接 npm install 复用的功能代码包。", whereSeenInAiApp: "package.json dependencies" },
  { term: "REST API", category: "后端与接口", definition: "按 HTTP 动词（GET/POST/PUT/DELETE）划分资源操作的经典接口设计规范。", whereSeenInAiApp: "/api/orders, /api/users/:id" },
  { term: "Runtime", category: "后端与接口", definition: "代码实际执行所依托的底层宿主环境（浏览器、Node.js、Deno、Bun）。", whereSeenInAiApp: "Node 22 / Edge Runtime / Browser" },
  { term: "Schema", category: "数据与构建", definition: "对数据结构与合法约束的精确蓝图定义，用于数据库建表及 Zod 入参校验。", whereSeenInAiApp: "src/db/schema.ts / Zod z.object()" },
  { term: "Server", category: "后端与接口", definition: "机房中 7x24 小时运行后端程序与数据库、对外提供服务的远程计算机。", whereSeenInAiApp: "Railway / AWS / 云容器实例" },
  { term: "Serverless", category: "后端与接口", definition: "开发者只写函数、由云平台自动按请求弹性拉起与缩容的无服务器部署模式。", whereSeenInAiApp: "Vercel Functions / Cloudflare Workers" },
  { term: "SPA", category: "前端与渲染", definition: "Single Page Application，只加载一次页面骨架并在浏览器内无刷新局部切换视图。", whereSeenInAiApp: "Vite + React 客户端单页应用" },
  { term: "SQL", category: "数据与构建", definition: "Structured Query Language，用于检索和修改关系型数据库表数据的标准语言。", whereSeenInAiApp: "PostgreSQL 查询与 RLS 策略" },
  { term: "SSR", category: "前端与渲染", definition: "Server-Side Rendering，在服务器提前拼好完整 HTML 再发往浏览器以加快首屏与 SEO。", whereSeenInAiApp: "Next.js / Astro SSR 页面" },
  { term: "State", category: "前端与渲染", definition: "应用在任意时刻需要记住的数据：分为客户端 UI 状态（Zustand）与服务端数据状态（TanStack Query）。", whereSeenInAiApp: "useState / Zustand / TanStack Query" },
  { term: "TypeScript", category: "前端与渲染", definition: "带静态类型安检的 JavaScript 超集，在编译期提前拦截错值，显著提升 AI 生成准确率。", whereSeenInAiApp: ".ts / .tsx 与 tsconfig.json" },
  { term: "Vibe Coding", category: "AI 研发范式", definition: "2025 年由 Andrej Karpathy 提出：用自然语言向 AI 描述目标来生成软件；需配合架构认知与安全审计方能进生产。", whereSeenInAiApp: "Cursor Plan/Agent · AI Studio 原型研发" },
];

export function buildStackPlanPrompt(
  presetId: StackPresetId,
  customOverrides: Partial<Record<string, string>>
): string {
  const preset = STACK_PRESETS.find((p) => p.id === presetId) ?? STACK_PRESETS[0];
  const lines = MASTER_MAP_ROWS.map((row) => {
    const picked = customOverrides[row.id] ?? row.presetChoices[presetId];
    return `- ${row.job} (${row.jobZh}): ${picked}`;
  });
  return `[Cursor Plan Mode] @AGENTS.md
请严格按以下「${preset.label}」14 层技术栈契约初始化/重构项目，禁止擅自混用互斥框架：
${lines.join("\n")}

执行护栏（DoD）：
1. 客户端 State 仅用所选状态库管纯 UI 状态，服务端数据请求与缓存走统一 Fetching 方案
2. 所有写 API 入口必须通过 Validation Schema 校验并保留服务端密钥边界
3. 完成后执行 npx tsc --noEmit && npm run build 全量通过`;
}
