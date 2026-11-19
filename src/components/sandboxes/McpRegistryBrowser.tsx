import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Database,
  FileCode2,
  GitPullRequest,
  Globe,
  MessageSquare,
  Play,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trash2,
} from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface JsonRpcLogEntry {
  uid: string;
  rpcId: number | null;
  timestamp: string;
  direction: "host->mcp" | "mcp->host";
  serverId: string;
  method: string;
  summary: string;
  payload: string;
}

type RegistryCategory = "all" | "collab" | "data" | "verify" | "docs";

interface McpRegistryEntry {
  id: string;
  name: string;
  packageName: string;
  category: Exclude<RegistryCategory, "all">;
  categoryLabel: string;
  description: string;
  tools: string[];
  tokenOverhead: number;
  privilegeLevel: "只读安全" | "受控写入" | "需人工审批";
  envVar: string;
  command: string;
  args: string[];
  contextImpact: string;
}

const REGISTRY_SERVERS: McpRegistryEntry[] = [
  {
    id: "github",
    name: "GitHub MCP",
    packageName: "@modelcontextprotocol/server-github",
    category: "collab",
    categoryLabel: "协作与托管",
    description: "同步 Issue 需求上下文、拉取 PR Diff 历史，并在 Cursor 中规范创建分支与 PR。",
    tools: ["get_issue", "get_pull_request_diff", "create_pull_request"],
    tokenOverhead: 980,
    privilegeLevel: "受控写入",
    envVar: "GITHUB_PERSONAL_ACCESS_TOKEN",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    contextImpact: "Cursor Agent 直接读取关联 Issue 验收标准与近期 PR 变更约束。",
  },
  {
    id: "postgres",
    name: "PostgreSQL MCP",
    packageName: "@modelcontextprotocol/server-postgres",
    category: "data",
    categoryLabel: "数据存储",
    description: "只读内省真实表结构、外键关系与 EXPLAIN 执行计划，消除 ORM 字段幻觉。",
    tools: ["list_tables", "describe_schema", "query_readonly"],
    tokenOverhead: 760,
    privilegeLevel: "只读安全",
    envVar: "POSTGRES_READONLY_URL",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "${env:POSTGRES_READONLY_URL}"],
    contextImpact: "SQL 与 Drizzle/Prisma 查询100%对齐生产表结构与索引。",
  },
  {
    id: "slack",
    name: "Slack MCP",
    packageName: "@modelcontextprotocol/server-slack",
    category: "collab",
    categoryLabel: "协作与托管",
    description: "检索故障频道讨论串与客户工单反馈，把非结构化团队决策直接注入 Plan。",
    tools: ["search_channel_threads", "get_thread_replies", "post_release_summary"],
    tokenOverhead: 840,
    privilegeLevel: "需人工审批",
    envVar: "SLACK_BOT_TOKEN",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    contextImpact: "捕获群聊里的临时口径变更，避免按过时 PRD 编码。",
  },
  {
    id: "playwright",
    name: "Playwright MCP",
    packageName: "@playwright/mcp",
    category: "verify",
    categoryLabel: "端到端验证",
    description: "驱动无头浏览器验证真实交互流程、收集 Console 报错与移动端布局快照。",
    tools: ["browser_navigate", "browser_snapshot", "read_console_errors"],
    tokenOverhead: 1120,
    privilegeLevel: "只读安全",
    envVar: "PLAYWRIGHT_HEADLESS",
    command: "npx",
    args: ["-y", "@playwright/mcp@latest"],
    contextImpact: "让 Cursor 完成从静态类型检查到真实 DOM 渲染的闭环自愈。",
  },
  {
    id: "context7",
    name: "Context7 Docs MCP",
    packageName: "@upstash/context7-mcp",
    category: "docs",
    categoryLabel: "文档与记忆",
    description: "按版本号实时检索第三方库官方最新文档与迁移示例，告别 API 过时幻觉。",
    tools: ["resolve_library_id", "get_library_docs"],
    tokenOverhead: 620,
    privilegeLevel: "只读安全",
    envVar: "CONTEXT7_API_KEY",
    command: "npx",
    args: ["-y", "@upstash/context7-mcp@latest"],
    contextImpact: "强制锚定当前 package.json 版本对应的 SDK 签名。",
  },
  {
    id: "sentry",
    name: "Sentry MCP",
    packageName: "@sentry/mcp-server",
    category: "verify",
    categoryLabel: "端到端验证",
    description: "直连线上异常聚合栈、触发频率与面包屑轨迹，辅助快速定位根因。",
    tools: ["get_issue_stacktrace", "list_recent_regressions"],
    tokenOverhead: 710,
    privilegeLevel: "只读安全",
    envVar: "SENTRY_AUTH_TOKEN",
    command: "npx",
    args: ["-y", "@sentry/mcp-server"],
    contextImpact: "将线上报错堆栈直接转化为最小可复现单元测试输入。",
  },
];

const CATEGORY_TABS: { id: RegistryCategory; label: string }[] = [
  { id: "all", label: "全部 Server" },
  { id: "collab", label: "协作 (GitHub/Slack)" },
  { id: "data", label: "数据库" },
  { id: "verify", label: "验证与排障" },
  { id: "docs", label: "实时文档" },
];

const SERVER_ICONS: Record<string, typeof Server> = {
  github: GitPullRequest,
  postgres: Database,
  slack: MessageSquare,
  playwright: Globe,
  context7: BookOpen,
  sentry: ShieldAlert,
};

function formatClockTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function buildSampleToolResult(serverId: string, toolName: string): Record<string, unknown> {
  switch (serverId) {
    case "github":
      return {
        tool: toolName,
        repo: "acme/saas-core",
        data: { pr: 418, title: "fix: enforce webhook idempotency", checks: "passing" },
      };
    case "postgres":
      return {
        tool: toolName,
        readOnly: true,
        tables: ["users", "orders", "webhook_events"],
        rowEstimate: 14820,
      };
    case "slack":
      return {
        tool: toolName,
        channel: "#prod-incidents",
        matches: [{ ts: "17:04", note: "Confirm Stripe rawBody check before retry" }],
      };
    case "playwright":
      return {
        tool: toolName,
        viewport: "375x812",
        consoleErrors: 0,
        overflowDetected: false,
      };
    case "context7":
      return {
        tool: toolName,
        libraryId: "/drizzle-orm/drizzle-orm",
        version: "0.41.0",
        snippetsLoaded: 3,
      };
    default:
      return {
        tool: toolName,
        unresolvedIssues: 2,
        topRegression: "TypeError in checkout/route.ts:42",
      };
  }
}

interface QuickLoadBundle {
  id: string;
  label: string;
  description: string;
  serverIds: string[];
}

const QUICK_LOAD_BUNDLES: QuickLoadBundle[] = [
  {
    id: "custom",
    label: "自定义组合 (Custom)",
    description: "手动勾选开关 MCP Server",
    serverIds: [],
  },
  {
    id: "fullstack-db",
    label: "Fullstack Database (GitHub + Postgres + Context7)",
    description: "全栈数据与契约闭环：Issue/PR + 只读 Schema 内省 + 最新 ORM 文档",
    serverIds: ["github", "postgres", "context7"],
  },
  {
    id: "devops-toolchain",
    label: "DevOps Toolchain (GitHub + Slack + Sentry + Playwright)",
    description: "发布与自愈流水线：代码托管 + 频道同步 + 线上异常栈 + 端到端验证",
    serverIds: ["github", "slack", "sentry", "playwright"],
  },
  {
    id: "incident-triage",
    label: "Production Incident Triage (Slack + Sentry + Postgres)",
    description: "生产排障铁三角：群聊上下文 + 崩溃堆栈 + 生产表只读核验",
    serverIds: ["slack", "sentry", "postgres"],
  },
  {
    id: "full-suite",
    label: "Full 6-Server Suite (全量六联工具链)",
    description: "演示全栈 6 Server 并行挂载及 Lazy Discovery 节省 Token 效果",
    serverIds: ["github", "postgres", "slack", "playwright", "context7", "sentry"],
  },
  {
    id: "clear-all",
    label: "清空已挂载 (0 Servers)",
    description: "观察无 MCP 实证锚定时的上下文盲猜风险",
    serverIds: [],
  },
];

export default function McpRegistryBrowser() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<RegistryCategory>("all");
  const [enabledIds, setEnabledIds] = useState<string[]>(["github", "postgres"]);
  const [activeBundleId, setActiveBundleId] = useState<string>("custom");
  const [focusedId, setFocusedId] = useState<string>("github");
  const [lazyDiscovery, setLazyDiscovery] = useState<boolean>(true);
  const rpcCounterRef = useRef<number>(105);

  const [eventLogs, setEventLogs] = useState<JsonRpcLogEntry[]>(() => [
    {
      uid: "boot-4",
      rpcId: 102,
      timestamp: "17:00:02",
      direction: "mcp->host",
      serverId: "postgres",
      method: "tools/list",
      summary: "已注册 3 个只读 Schema 工具 (list_tables, describe_schema, query_readonly)",
      payload: JSON.stringify(
        {
          jsonrpc: "2.0",
          id: 102,
          result: {
            tools: ["list_tables", "describe_schema", "query_readonly"],
          },
        },
        null,
        2
      ),
    },
    {
      uid: "boot-3",
      rpcId: 102,
      timestamp: "17:00:02",
      direction: "host->mcp",
      serverId: "postgres",
      method: "tools/list",
      summary: "Cursor Host 请求 PostgreSQL MCP 可用工具列表",
      payload: JSON.stringify(
        { jsonrpc: "2.0", id: 102, method: "tools/list", params: { lazy: true } },
        null,
        2
      ),
    },
    {
      uid: "boot-2",
      rpcId: 101,
      timestamp: "17:00:01",
      direction: "mcp->host",
      serverId: "github",
      method: "initialize",
      summary: "握手成功 · protocolVersion: 2025-03-26 (capabilities.tools)",
      payload: JSON.stringify(
        {
          jsonrpc: "2.0",
          id: 101,
          result: {
            protocolVersion: "2025-03-26",
            serverInfo: { name: "github-mcp", version: "1.4.0" },
            capabilities: { tools: { listChanged: true } },
          },
        },
        null,
        2
      ),
    },
    {
      uid: "boot-1",
      rpcId: 101,
      timestamp: "17:00:01",
      direction: "host->mcp",
      serverId: "github",
      method: "initialize",
      summary: "Cursor Host 发起 MCP Server 能力握手",
      payload: JSON.stringify(
        {
          jsonrpc: "2.0",
          id: 101,
          method: "initialize",
          params: { clientInfo: { name: "cursor-host", version: "1.0" } },
        },
        null,
        2
      ),
    },
  ]);
  const [selectedLogUid, setSelectedLogUid] = useState<string>("boot-4");

  const appendRpcLogs = (entries: Omit<JsonRpcLogEntry, "uid" | "timestamp">[]) => {
    const ts = formatClockTime();
    const created = entries.map((e, idx) => ({
      ...e,
      timestamp: ts,
      uid: `rpc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${idx}`,
    }));
    setEventLogs((prev) => [...created.reverse(), ...prev].slice(0, 32));
    if (created[created.length - 1]) {
      setSelectedLogUid(created[created.length - 1].uid);
    }
  };

  const filteredServers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return REGISTRY_SERVERS.filter((srv) => {
      const catOk = categoryFilter === "all" || srv.category === categoryFilter;
      if (!catOk) return false;
      if (!q) return true;
      return (
        srv.name.toLowerCase().includes(q) ||
        srv.packageName.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        srv.tools.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter]);

  const handleQuickLoadBundle = (bundleId: string) => {
    setActiveBundleId(bundleId);
    const bundle = QUICK_LOAD_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle || bundle.id === "custom") return;

    setEnabledIds(bundle.serverIds);
    setSearchQuery("");
    setCategoryFilter("all");
    if (bundle.serverIds[0]) {
      setFocusedId(bundle.serverIds[0]);
    }

    const reqId = rpcCounterRef.current++;
    const mountedNames = REGISTRY_SERVERS.filter((s) =>
      bundle.serverIds.includes(s.id)
    ).map((s) => s.name);

    appendRpcLogs([
      {
        rpcId: reqId,
        direction: "host->mcp",
        serverId: "cursor-host",
        method: "workspace/loadBundle",
        summary: `Quick Load 预设包「${bundle.label.split(" (")[0]}」`,
        payload: JSON.stringify(
          {
            jsonrpc: "2.0",
            id: reqId,
            method: "workspace/loadBundle",
            params: { preset: bundle.id, servers: bundle.serverIds },
          },
          null,
          2
        ),
      },
      {
        rpcId: reqId,
        direction: "mcp->host",
        serverId: bundle.serverIds[0] ?? "cursor-host",
        method: "notifications/tools/list_changed",
        summary:
          mountedNames.length > 0
            ? `批量就绪 (${mountedNames.join(" + ")})`
            : "已卸载全部 MCP Server，上下文切换为离线基线",
        payload: JSON.stringify(
          {
            jsonrpc: "2.0",
            id: reqId,
            result: {
              activeServers: bundle.serverIds,
              lazyDiscovery,
            },
          },
          null,
          2
        ),
      },
    ]);
  };

  const toggleServer = (id: string) => {
    const srv = REGISTRY_SERVERS.find((s) => s.id === id);
    const willEnable = !enabledIds.includes(id);

    setActiveBundleId("custom");
    setEnabledIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setFocusedId(id);

    if (!srv) return;

    if (willEnable) {
      const initId = rpcCounterRef.current++;
      const listId = rpcCounterRef.current++;
      appendRpcLogs([
        {
          rpcId: initId,
          direction: "host->mcp",
          serverId: srv.id,
          method: "initialize",
          summary: `启动 ${srv.name} 并协商 JSON-RPC 2.0 能力`,
          payload: JSON.stringify(
            {
              jsonrpc: "2.0",
              id: initId,
              method: "initialize",
              params: { server: srv.packageName },
            },
            null,
            2
          ),
        },
        {
          rpcId: listId,
          direction: "mcp->host",
          serverId: srv.id,
          method: "tools/list",
          summary: `返回 ${srv.tools.length} 个 Tool Schema (+${srv.tokenOverhead} tokens)`,
          payload: JSON.stringify(
            {
              jsonrpc: "2.0",
              id: listId,
              result: {
                tools: srv.tools.map((name) => ({ name })),
              },
            },
            null,
            2
          ),
        },
      ]);
    } else {
      const shutId = rpcCounterRef.current++;
      appendRpcLogs([
        {
          rpcId: shutId,
          direction: "host->mcp",
          serverId: srv.id,
          method: "shutdown",
          summary: `卸载 ${srv.name} 并通知 Cursor 清理工具缓存`,
          payload: JSON.stringify(
            { jsonrpc: "2.0", id: shutId, method: "shutdown", params: { server: srv.id } },
            null,
            2
          ),
        },
        {
          rpcId: null,
          direction: "mcp->host",
          serverId: srv.id,
          method: "notifications/tools/list_changed",
          summary: `已从当前上下文移除 ${srv.tools.length} 个工具绑定`,
          payload: JSON.stringify(
            {
              jsonrpc: "2.0",
              method: "notifications/tools/list_changed",
              params: { removedServer: srv.id },
            },
            null,
            2
          ),
        },
      ]);
    }
  };

  const handleSimulateToolCall = (srv: McpRegistryEntry, toolName: string) => {
    const callId = rpcCounterRef.current++;
    const sampleResult = buildSampleToolResult(srv.id, toolName);
    appendRpcLogs([
      {
        rpcId: callId,
        direction: "host->mcp",
        serverId: srv.id,
        method: "tools/call",
        summary: `Cursor Agent 调用 ${srv.id}.${toolName}()`,
        payload: JSON.stringify(
          {
            jsonrpc: "2.0",
            id: callId,
            method: "tools/call",
            params: { name: toolName, arguments: { scope: "workspace" } },
          },
          null,
          2
        ),
      },
      {
        rpcId: callId,
        direction: "mcp->host",
        serverId: srv.id,
        method: "tools/call:result",
        summary: `${srv.name} 返回实证上下文 (${JSON.stringify(sampleResult).length}B)`,
        payload: JSON.stringify(
          {
            jsonrpc: "2.0",
            id: callId,
            result: {
              content: [{ type: "application/json", data: sampleResult }],
            },
          },
          null,
          2
        ),
      },
    ]);
  };

  const integrationState = useMemo(() => {
    const enabledServers = REGISTRY_SERVERS.filter((s) => enabledIds.includes(s.id));
    const totalTools = enabledServers.reduce((acc, s) => acc + s.tools.length, 0);
    const rawTokens = enabledServers.reduce((acc, s) => acc + s.tokenOverhead, 0);
    // Lazy MCP discovery keeps upfront system prompt small until a tool domain is triggered
    const effectiveTokens = lazyDiscovery
      ? Math.round(rawTokens * 0.28 + enabledServers.length * 60)
      : rawTokens;

    const contextPipeline = [
      {
        step: "01 · 需求与群聊口径对齐",
        grounded: enabledIds.includes("github") || enabledIds.includes("slack"),
        source:
          enabledIds.includes("github") && enabledIds.includes("slack")
            ? "GitHub Issue + Slack 讨论串实时注入"
            : enabledIds.includes("github")
            ? "GitHub Issue 验收标准注入"
            : enabledIds.includes("slack")
            ? "Slack 频道上下文注入"
            : "依赖人工手动复制粘贴 PRD（存在口径滞后风险）",
      },
      {
        step: "02 · Schema 与 SDK 文档锚定",
        grounded: enabledIds.includes("postgres") || enabledIds.includes("context7"),
        source:
          enabledIds.includes("postgres") && enabledIds.includes("context7")
            ? "Postgres 真实表结构 + Context7 新版文档双锚定"
            : enabledIds.includes("postgres")
            ? "Postgres 只读 Schema 内省完成"
            : enabledIds.includes("context7")
            ? "Context7 最新库文档已挂载"
            : "模型凭记忆猜字段名与 SDK 参数（易发类型漂移）",
      },
      {
        step: "03 · 运行时验证与异常闭环",
        grounded: enabledIds.includes("playwright") || enabledIds.includes("sentry"),
        source:
          enabledIds.includes("playwright") && enabledIds.includes("sentry")
            ? "Playwright 实机验证 + Sentry 线上堆栈闭环"
            : enabledIds.includes("playwright")
            ? "Playwright 浏览器快照 & Console 报错自动采集"
            : enabledIds.includes("sentry")
            ? "Sentry 异常堆栈直接映射回归用例"
            : "仅做静态编译检查，缺乏实机与线上监控反馈",
      },
    ];

    const mcpServersObj: Record<
      string,
      { command: string; args: string[]; env?: Record<string, string> }
    > = {};
    for (const s of enabledServers) {
      mcpServersObj[s.id] = {
        command: s.command,
        args: s.args,
        env: { [s.envVar]: `\${env:${s.envVar}}` },
      };
    }

    const generatedJson = JSON.stringify({ mcpServers: mcpServersObj }, null, 2);

    return {
      enabledServers,
      totalTools,
      rawTokens,
      effectiveTokens,
      contextPipeline,
      generatedJson,
    };
  }, [enabledIds, lazyDiscovery]);

  const focusedServer =
    REGISTRY_SERVERS.find((s) => s.id === focusedId) ?? REGISTRY_SERVERS[0];

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-purple tracking-wide">
            Module 4 · MCP Registry Browser · 搜索并挂载外部工具上下文
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            MCP Registry Browser：检索、开关与 Cursor 上下文集成预览
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="mcp-quick-load"
              className="text-[11px] font-mono text-slate-300 whitespace-nowrap"
            >
              Quick Load:
            </label>
            <select
              id="mcp-quick-load"
              value={activeBundleId}
              onChange={(e) => handleQuickLoadBundle(e.target.value)}
              onKeyDown={stopRevealKey}
              aria-label="Quick Load MCP Server preset bundle"
              className="rounded-lg bg-[#0b0f19] border border-gemini-purple/45 px-2.5 py-1.5 text-[11px] font-mono text-purple-200 focus:outline-none focus:border-gemini-cyan cursor-pointer max-w-[235px]"
            >
              {QUICK_LOAD_BUNDLES.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#0b0f19] text-slate-100">
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextLazy = !lazyDiscovery;
              setLazyDiscovery(nextLazy);
              const cfgId = rpcCounterRef.current++;
              appendRpcLogs([
                {
                  rpcId: cfgId,
                  direction: "host->mcp",
                  serverId: "cursor-host",
                  method: "workspace/didChangeConfiguration",
                  summary: nextLazy
                    ? "开启 Lazy MCP Discovery（按域惰性加载 Schema）"
                    : "切换为全量 Schema 预加载模式",
                  payload: JSON.stringify(
                    {
                      jsonrpc: "2.0",
                      id: cfgId,
                      method: "workspace/didChangeConfiguration",
                      params: { lazyDiscovery: nextLazy },
                    },
                    null,
                    2
                  ),
                },
              ]);
            }}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              lazyDiscovery
                ? "bg-emerald-500/15 border-emerald-400/45 text-emerald-300"
                : "bg-white/5 border-white/12 text-slate-300"
            }`}
          >
            {lazyDiscovery ? "✓ Lazy MCP 按需发现（省 72% Token）" : "全量 Schema 预加载模式"}
          </button>
        </div>
      </div>

      {/* Main Split: Left 7 cols Registry Search & Cards | Right 5 cols Live Cursor Context Integration */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 7 cols: Search Bar, Category Filter, Server Cards */}
        <div className="col-span-7 flex flex-col gap-2.5">
          {/* Search + Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={stopRevealKey}
                placeholder="搜索 MCP Server（如 github、postgres、slack、tool名）..."
                aria-label="搜索 MCP Registry 服务器"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0b0f19] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 overflow-x-auto">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    categoryFilter === tab.id
                      ? "bg-gemini-cyan text-slate-950 font-bold"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Server Registry Grid */}
          {filteredServers.length === 0 ? (
            <div className="flex-1 rounded-xl bg-[#0b0f19] border border-white/10 p-8 flex flex-col items-center justify-center text-center text-slate-400">
              <Server className="w-6 h-6 text-slate-500 mb-2" />
              <div>未找到匹配 “{searchQuery}” 的 MCP Server</div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="mt-2 text-[11px] font-mono text-gemini-cyan hover:underline cursor-pointer"
              >
                清除搜索条件
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredServers.map((srv) => {
                const enabled = enabledIds.includes(srv.id);
                const focused = focusedId === srv.id;
                const Icon = SERVER_ICONS[srv.id] ?? Server;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setFocusedId(srv.id)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      enabled
                        ? focused
                          ? "bg-[#10192b] border-gemini-cyan/60"
                          : "bg-white/[0.045] border-emerald-400/35"
                        : focused
                        ? "bg-[#0e1320] border-white/30"
                        : "bg-[#0b0f19] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              enabled ? "text-emerald-400" : "text-slate-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {srv.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 truncate">
                              {srv.packageName}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleServer(srv.id);
                          }}
                          className={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            enabled
                              ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-semibold"
                              : "bg-white/5 border-white/12 text-slate-300 hover:text-white"
                          }`}
                        >
                          {enabled ? "已挂载" : "启用"}
                        </button>
                      </div>

                      <p className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/8 flex items-center justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                      <span>{srv.tools.length} Tools · {srv.privilegeLevel}</span>
                      <span>+{srv.tokenOverhead} tok</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Server Tool Inspection & Simulated JSON-RPC Call Footer */}
          <div className="p-2.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="font-mono text-gemini-cyan shrink-0">
                {focusedServer.name}：
              </span>
              {focusedServer.tools.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => handleSimulateToolCall(focusedServer, tool)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-gemini-cyan/15 border border-white/12 hover:border-gemini-cyan/45 font-mono text-[10px] text-slate-200 hover:text-gemini-cyan transition-colors cursor-pointer whitespace-nowrap"
                  title={`向 ${focusedServer.name} 发送 tools/call (${tool}) 请求`}
                >
                  <Play className="w-2.5 h-2.5 shrink-0" />
                  <span>{tool}</span>
                </button>
              ))}
            </div>
            <span className="text-slate-400 font-mono text-[10px] shrink-0">
              点击工具可触发 JSON-RPC 实时调用
            </span>
          </div>
        </div>

        {/* Right 5 cols: Live Cursor Context Integration + JSON-RPC Event Log + mcp.json */}
        <div className="col-span-5 flex flex-col justify-between gap-2.5">
          {/* Context Telemetry & 3-Step Grounding */}
          <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-gemini-cyan inline-flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>当前 Cursor 上下文实时集成状态</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                {integrationState.enabledServers.length} Server · {integrationState.totalTools} Tools
              </span>
            </div>

            <div className="p-2 rounded-lg bg-black/45 border border-white/8 space-y-1 tabular-nums">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-300">上下文 Schema 占用估算</span>
                <span className="text-emerald-300 font-bold">
                  {integrationState.effectiveTokens} tokens
                  {lazyDiscovery && integrationState.rawTokens > 0 && (
                    <span className="text-slate-400 font-normal ml-1">
                      (原 {integrationState.rawTokens})
                    </span>
                  )}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gemini-cyan transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((integrationState.effectiveTokens / 6000) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {integrationState.contextPipeline.map((stage) => (
                <div
                  key={stage.step}
                  title={stage.source}
                  className={`p-1.5 rounded-lg border text-[10px] ${
                    stage.grounded
                      ? "bg-emerald-500/8 border-emerald-400/30"
                      : "bg-amber-500/8 border-amber-400/25"
                  }`}
                >
                  <div className="flex items-center gap-1 font-mono font-semibold text-white truncate">
                    {stage.grounded ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-300 shrink-0" />
                    )}
                    <span className="truncate">{stage.step.replace(/^\d+\s*·\s*/, "")}</span>
                  </div>
                  <div
                    className={`mt-0.5 text-[9.5px] font-mono ${
                      stage.grounded ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {stage.grounded ? "实证锚定" : "缺失"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Log Panel (Real-time JSON-RPC 2.0 Stream) */}
          <div className="flex-1 rounded-xl bg-[#0b0f19] border border-gemini-cyan/30 overflow-hidden flex flex-col">
            <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-gemini-cyan font-semibold inline-flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>Event Log · JSON-RPC 2.0 通信流</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {eventLogs.length} 帧
                </span>
                <button
                  type="button"
                  onClick={() => handleSimulateToolCall(focusedServer, focusedServer.tools[0])}
                  className="px-2 py-0.5 rounded bg-gemini-cyan/15 hover:bg-gemini-cyan/25 border border-gemini-cyan/40 text-[10px] font-mono text-gemini-cyan cursor-pointer whitespace-nowrap"
                >
                  模拟 RPC
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEventLogs([]);
                    setSelectedLogUid("");
                  }}
                  title="清空 Event Log"
                  aria-label="清空 Event Log"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {eventLogs.length === 0 ? (
              <div className="flex-1 p-4 flex items-center justify-center text-[11px] font-mono text-slate-400">
                暂无 JSON-RPC 日志：请开关左侧 MCP Server 或点击“模拟 RPC”
              </div>
            ) : (
              <div className="grid grid-cols-12 flex-1 min-h-[146px] max-h-[168px]">
                {/* Stream list (7 cols) */}
                <div
                  onWheel={stopRevealWheel}
                  className="col-span-7 border-r border-white/10 overflow-y-auto p-1.5 space-y-1 font-mono"
                >
                  {eventLogs.map((log) => {
                    const isSelected = log.uid === selectedLogUid;
                    const isOutbound = log.direction === "host->mcp";
                    return (
                      <button
                        key={log.uid}
                        type="button"
                        onClick={() => setSelectedLogUid(log.uid)}
                        className={`w-full p-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-gemini-cyan/12 border-gemini-cyan/45"
                            : "bg-white/[0.02] border-transparent hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-[9.5px]">
                          <span
                            className={`inline-flex items-center gap-0.5 font-semibold ${
                              isOutbound ? "text-gemini-purple" : "text-emerald-300"
                            }`}
                          >
                            {isOutbound ? (
                              <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                            ) : (
                              <ArrowDownLeft className="w-2.5 h-2.5 shrink-0" />
                            )}
                            <span>{isOutbound ? "HOST→MCP" : "MCP→HOST"}</span>
                          </span>
                          <span className="text-slate-400 tabular-nums">
                            {log.rpcId !== null ? `#${log.rpcId}` : "notif"} · {log.timestamp}
                          </span>
                        </div>
                        <div className="text-[10px] text-white font-semibold truncate mt-0.5">
                          [{log.serverId}] {log.method}
                        </div>
                        <div className="text-[9.5px] text-slate-400 truncate">
                          {log.summary}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected JSON-RPC Payload Inspector (5 cols) */}
                <pre
                  onWheel={stopRevealWheel}
                  className="col-span-5 p-2 bg-black/45 font-mono text-[9.5px] text-emerald-300 overflow-y-auto leading-snug whitespace-pre-wrap break-all"
                >
                  {(eventLogs.find((l) => l.uid === selectedLogUid) ?? eventLogs[0]).payload}
                </pre>
              </div>
            )}
          </div>

          {/* Live .cursor/mcp.json Compact Preview */}
          <div className="rounded-xl bg-[#0b0f19] border border-white/10 overflow-hidden flex flex-col">
            <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/10 flex items-center justify-between gap-2">
              <span className="font-mono text-[10.5px] text-gemini-purple inline-flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                <span>实时同步 .cursor/mcp.json</span>
              </span>
              <CopySnippetButton text={integrationState.generatedJson} label="复制 JSON" />
            </div>
            <pre
              onWheel={stopRevealWheel}
              className="p-2 font-mono text-[10px] text-slate-300 overflow-y-auto max-h-[82px] leading-snug"
            >
              {integrationState.generatedJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
