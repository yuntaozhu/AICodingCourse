export interface RuleTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  globs: string[];
  alwaysApply: boolean;
  body: string;
}

export interface ProductArchetype {
  id: string;
  name: string;
  audienceTag: string;
  stackSummary: string;
  sampleIdea: string;
  agentsSummary: string;
  defaultFiles: string[];
  recommendedRuleIds: string[];
}

export interface ContextTagOption {
  tag: string;
  label: string;
  tokenWeight: number;
  usageTip: string;
}

export interface DodCheckOption {
  id: string;
  label: string;
  commandOrRule: string;
}

export interface McpServerConfig {
  id:
    | "figma"
    | "github"
    | "postgres"
    | "playwright"
    | "context7"
    | "memory"
    | "taskmaster";
  name: string;
  role: string;
  command: string;
  args: string[];
  envKeys: string[];
  readOnlyTools: string[];
  writeTools: string[];
}

export interface BugbotCodePreset {
  id: string;
  label: string;
  filePath: string;
  code: string;
}

export const PRODUCT_ARCHETYPES: ProductArchetype[] = [
  {
    id: "saas-fullstack",
    name: "SaaS 订阅全栈应用",
    audienceTag: "独立开发者 MVP",
    stackSummary: "React 19 + Tailwind v4 + Express/Next API + PostgreSQL + Stripe",
    sampleIdea: "为独立设计师上线一个按月订阅的组件库 SaaS，含定价页、Stripe Checkout 支付与会员下载权限校验",
    agentsSummary: `# AGENTS.md
## Project DNA
- Product: Indie SaaS Component Hub (0-to-1 MVP)
- Stack: React + TypeScript strict + Tailwind CSS + Express API + Postgres

## Verification (DoD)
- Run \`npx tsc --noEmit\` and \`npm run lint\` after multi-file edits
- Every API route must validate body with Zod and verify session before DB mutation`,
    defaultFiles: [
      "src/components/PricingCard.tsx",
      "server/routes/checkout.ts",
      "db/migrations/001_subscriptions.sql",
      "README.md",
    ],
    recommendedRuleIds: ["project-dna", "ui-tailwind", "api-security", "dod-checks"],
  },
  {
    id: "ai-studio-prod",
    name: "AI Studio 原型生产化",
    audienceTag: "AI 工具产品经理",
    stackSummary: "Vite + React + Express /api/* Proxy + @google/genai (Server-Side)",
    sampleIdea: "把我在 AI Studio 生成的智能周报原型改造成可上线版本：API Key 收口服务端、补齐错误兜底与手机端适配",
    agentsSummary: `# AGENTS.md
## Project DNA
- Origin: Migrated from Google AI Studio Prototype to Production Full-Stack
- AI Calls: Server-side only via \`/api/*\` with \`@google/genai\` (\`gemini-4-hydrogen\`)

## Guardrails
- NEVER expose GEMINI_API_KEY in Vite client bundles
- Every interactive workflow must handle loading, empty, and 429/500 states`,
    defaultFiles: [
      "server/routes/generate.ts",
      "src/components/ReportWorkspace.tsx",
      "vite.config.ts",
    ],
    recommendedRuleIds: ["project-dna", "api-security", "ui-tailwind", "dod-checks"],
  },
  {
    id: "figma-landing",
    name: "Figma 高保真产品官网",
    audienceTag: "产品经理 / 独立出海",
    stackSummary: "React + Tailwind CSS v4 + Motion + 响应式断点 + SEO Meta",
    sampleIdea: "根据 Figma 设计稿还原产品官网 Hero 区、三栏定价对比表和 FAQ 折叠面板，并通过移动端浏览器验收",
    agentsSummary: `# AGENTS.md
## Project DNA
- Focus: High-fidelity landing page from Figma design tokens
- Layout: Mobile-first responsive grid, WCAG AA contrast, semantic landmarks

## Verification (DoD)
- Verify desktop (1280px) and mobile (375px) viewports via Playwright Browser MCP`,
    defaultFiles: [
      "src/components/HeroSection.tsx",
      "src/styles/tokens.css",
      "index.html",
    ],
    recommendedRuleIds: ["project-dna", "ui-tailwind", "dod-checks"],
  },
];

export const RULE_TEMPLATES: RuleTemplate[] = [
  {
    id: "project-dna",
    slug: "00-project-dna",
    title: "全局架构与技术栈 DNA",
    description: "锁定目录约定、TypeScript 严格模式与禁止事项（全局生效）",
    globs: ["**/*"],
    alwaysApply: true,
    body: `# Project DNA
- Use TypeScript strict mode; avoid \`any\` and untyped API payloads.
- Keep components modular and single-responsibility (< 220 lines per file).
- Preserve existing working routes and state contracts unless explicitly asked to refactor.`,
  },
  {
    id: "ui-tailwind",
    slug: "10-ui-tailwind",
    title: "UI 组件与 Tailwind 排版规范",
    description: "仅在前端 TSX/CSS 文件自动注入，防止 Vibe Coding 样式崩坏",
    globs: ["src/components/**/*.tsx", "src/styles/**/*.css"],
    alwaysApply: false,
    body: `# Frontend & Tailwind Guidelines
- Use Tailwind CSS utilities only; avoid inline styles or legacy CSS overrides.
- Ensure WCAG AA contrast, \`tabular-nums\` on counters/metrics, and empty/loading/error UI states.
- Check mobile (375px) and desktop (1280px) overflow before completing UI edits.`,
  },
  {
    id: "api-security",
    slug: "20-api-security",
    title: "服务端接口与数据安全护栏",
    description: "编辑后端路由、数据库与配置文件时自动触发安全约束",
    globs: ["server/**/*.ts", "db/**/*.sql", "vite.config.ts"],
    alwaysApply: false,
    body: `# API & Security Guardrails
- Never inject secrets or GEMINI_API_KEY into frontend bundles or \`vite.config.ts\` defines.
- Validate every POST/PUT payload with Zod schema and enforce session/auth checks.
- Use parameterized SQL queries; prohibit string concatenation in database calls.`,
  },
  {
    id: "dod-checks",
    slug: "30-dod-checks",
    title: "DoD 完成定义与自愈门禁",
    description: "Agent 完成多文件改动准备汇报前按描述智能调用",
    globs: [],
    alwaysApply: false,
    body: `# Definition of Done (DoD)
- Before declaring completion, run \`npx tsc --noEmit\` and \`npm run lint\`.
- If checks fail, inspect terminal diagnostics and fix root causes instead of suppressing rules.
- Summarize changed files, verified commands, and any remaining manual steps.`,
  },
  {
    id: "self-improve",
    slug: "90-self-improve",
    title: "自我进化规则沉淀 (.mdc 元规则)",
    description: "新模式跨 3 个以上文件、重复 PR 评审意见或同类 Bug 复发时自动触发规则更新",
    globs: [".cursor/rules/*.mdc"],
    alwaysApply: true,
    body: `# Self-Improving Rule Governance
- Trigger updates when a new pattern spans 3+ files or review feedback repeats.
- Author rules with [file](mdc:path) cross-links and concrete DO / DON'T blocks.
- Prune stale constraints once underlying helper abstractions stabilize.`,
  },
  {
    id: "workflow-git",
    slug: "95-workflow-git",
    title: "特性分支 + PR 交付与 Pager 防卡死",
    description: "所有功能开发隔离在特性分支并用 gh pr create 收口，禁用交互分页器",
    globs: ["**/*"],
    alwaysApply: false,
    body: `# Branching, PR & Terminal Safety
- Run \`export PAGER=""\` at session start so \`git log\` / \`gh pr view\` never hang.
- Branch off main (\`feature/*\`, \`fix/*\`, \`docs/*\`); never commit directly to main.
- Open PR via \`gh pr create --fill\`, then return cleanly to \`main\`.`,
  },
];

export const CONTEXT_TAGS: ContextTagOption[] = [
  { tag: "@Codebase", label: "@Codebase", tokenWeight: 18, usageTip: "跨仓库语义检索架构与调用链" },
  { tag: "@Files", label: "@Files", tokenWeight: 8, usageTip: "精准锁定 2-3 个核心源码文件" },
  { tag: "@Folders", label: "@Folders", tokenWeight: 12, usageTip: "限定模块目录，避免无关噪音" },
  { tag: "@Figma", label: "@Figma", tokenWeight: 14, usageTip: "拉取设计稿节点与 Token 参数" },
  { tag: "@Docs", label: "@Docs", tokenWeight: 10, usageTip: "挂载官方新版 SDK 文档防幻觉" },
  { tag: "@Git", label: "@Git", tokenWeight: 9, usageTip: "对照近期 Diff 与历史提交上下文" },
];

export const DOD_CHECK_OPTIONS: DodCheckOption[] = [
  { id: "tsc", label: "TypeScript 零报错", commandOrRule: "运行 `npx tsc --noEmit` 必须 0 errors" },
  { id: "lint", label: "ESLint 规范门禁", commandOrRule: "运行 `npm run lint` 零致命警告" },
  { id: "states", label: "完整异常与空状态", commandOrRule: "UI 必须覆盖 Loading / Empty / API Error 状态" },
  { id: "security", label: "密钥与鉴权核查", commandOrRule: "敏感 Key 仅留存服务端且写接口具备输入校验" },
  { id: "browser", label: "浏览器自检通过", commandOrRule: "通过 Playwright MCP 验证桌面与移动端零溢出" },
];

export const MCP_SERVERS: McpServerConfig[] = [
  {
    id: "figma",
    name: "Figma MCP",
    role: "读取设计稿组件树、颜色间距 Token 与图层结构",
    command: "npx",
    args: ["-y", "figma-developer-mcp", "--stdio"],
    envKeys: ["FIGMA_API_KEY"],
    readOnlyTools: ["get_figma_data", "download_figma_images"],
    writeTools: [],
  },
  {
    id: "github",
    name: "GitHub MCP",
    role: "读取 Issue 需求、历史 PR 上下文与创建提交分支",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    envKeys: ["GITHUB_PERSONAL_ACCESS_TOKEN"],
    readOnlyTools: ["get_issue", "list_pull_requests", "get_file_contents"],
    writeTools: ["create_branch", "create_pull_request"],
  },
  {
    id: "postgres",
    name: "PostgreSQL / Supabase MCP",
    role: "实时探测表结构、索引分布与执行计划（拒绝猜测字段名）",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"],
    envKeys: ["DATABASE_URL"],
    readOnlyTools: ["query_readonly", "list_tables", "describe_table"],
    writeTools: ["execute_migration"],
  },
  {
    id: "playwright",
    name: "Playwright Browser MCP",
    role: "驱动无头浏览器点击交互、截取渲染画面并读取 Console 错误",
    command: "npx",
    args: ["-y", "@playwright/mcp@latest"],
    envKeys: [],
    readOnlyTools: ["browser_navigate", "browser_snapshot", "browser_console_messages"],
    writeTools: ["browser_click", "browser_type"],
  },
  {
    id: "context7",
    name: "Context7 Docs MCP",
    role: "强制两步拉取最新官方库文档（resolve-library-id → get-library-docs）",
    command: "npx",
    args: ["-y", "@upstash/context7-mcp"],
    envKeys: [],
    readOnlyTools: ["resolve-library-id", "get-library-docs"],
    writeTools: [],
  },
  {
    id: "memory",
    name: "Memory Knowledge Graph MCP",
    role: "跨会话持久记忆图谱（写入/删除实体前强制要求人类明确确认）",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    envKeys: ["MEMORY_FILE_PATH"],
    readOnlyTools: ["read_graph", "search_nodes"],
    writeTools: ["create_entities", "add_observations", "delete_entities"],
  },
  {
    id: "taskmaster",
    name: "TaskMaster AI MCP",
    role: "按角色分层模型解析 PRD 并拆解子任务（需明确指令再触发 parse-prd）",
    command: "npx",
    args: ["-y", "--package=task-master-ai", "task-master-ai"],
    envKeys: ["ANTHROPIC_API_KEY", "PERPLEXITY_API_KEY"],
    readOnlyTools: ["get_tasks", "next_task", "analyze_project_complexity"],
    writeTools: ["parse_prd", "expand_task", "set_task_status"],
  },
];

export const BUGBOT_CODE_PRESETS: BugbotCodePreset[] = [
  {
    id: "sqli-nplus1",
    label: "订单查询接口 (SQLi + N+1)",
    filePath: "server/routes/orders.ts",
    code: `app.post("/api/orders/search", async (req, res) => {
  const { userId } = req.body;
  const query = "SELECT * FROM users WHERE id = " + userId;
  const users = await db.execute(query);

  for (let i = 0; i < users.length; i++) {
    const orders = await db.execute("SELECT * FROM orders WHERE user_id = " + users[i].id);
    users[i].orders = orders;
  }

  return res.json(users);
});`,
  },
  {
    id: "react-race-key",
    label: "AI 面板组件 (竞态 + 硬编码 Key)",
    filePath: "src/components/AiSummaryPanel.tsx",
    code: `const GEMINI_KEY = "AIzaSyDummyHardcodedKeyExample123";

export function AiSummaryPanel({ projectId }: { projectId: string }) {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    fetch(\`https://api.example.com/summary?id=\${projectId}&key=\${GEMINI_KEY}\`)
      .then((r) => r.text())
      .then((text) => setSummary(text));
  }, [projectId]);

  return <div className="p-4">{summary}</div>;
}`,
  },
  {
    id: "clean-refactored",
    label: "合规修复版 (参数化 + 清理)",
    filePath: "server/routes/orders.ts",
    code: `app.post("/api/orders/search", requireSession, async (req, res) => {
  try {
    const parsed = SearchOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

    const rows = await db.execute(
      "SELECT u.id, u.name, o.id AS order_id FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.id = $1",
      [parsed.data.userId]
    );
    return res.json({ data: rows });
  } catch (err) {
    return res.status(500).json({ error: "Order lookup failed" });
  }
});`,
  },
  {
    id: "stray-reward-hack",
    label: "Sonar #4/#6 (死代码 + 测试作弊)",
    filePath: "src/__tests__/billing.test.ts",
    code: `// TODO: remove old debug helper later
export function debugHelper(x: number) {
  console.log("debug", x);
}

export async function chargeUser(amount: number) {
  try {
    return await gatewayCharge(amount);
  } catch (e) {}
}

test.skip("rejects negative charge", async () => {
  expect(await chargeUser(-10)).toThrow();
});

test("billing passes", () => {
  expect(true).toBe(true);
});`,
  },
];

export function doesGlobMatch(filePath: string, globs: string[]): boolean {
  if (globs.length === 0) return false;
  return globs.some((pattern) => {
    if (pattern === "**/*") return true;
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*\//g, "(?:.+/)?")
      .replace(/\*\*/g, ".*")
      .replace(/\*/g, "[^/]*");
    const regex = new RegExp(`^${escaped}$`);
    return regex.test(filePath);
  });
}

export function compileMdcFile(rule: RuleTemplate): string {
  const globsText = rule.globs.length > 0 ? rule.globs.join(", ") : "";
  return `---
description: ${rule.description}
globs: ${globsText}
alwaysApply: ${rule.alwaysApply}
---

${rule.body}`;
}
