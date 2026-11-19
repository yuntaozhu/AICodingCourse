export interface McpDodCriterion {
  id: string;
  label: string;
  verifyHint: string;
}

export interface McpTroubleshootItem {
  symptom: string;
  cause: string;
  resolution: string;
}

export interface McpAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface McpConfigAuditResult {
  validJson: boolean;
  serverCount: number;
  checks: McpAuditCheck[];
  warnings: string[];
}

export const MCP_LAB_GUIDE = {
  title: "Module 4 实战练习：配置最小特权 .cursor/mcp.json",
  audience: "已具备基础全栈开发或 Cursor 使用经验，准备接入外部工具上下文的学习者",
  prerequisites: [
    "已完成 Module 4 前 2 节（理解 .cursor/rules 与上下文窗口限制）",
    "（可选本地实操）本机已安装 Node.js >= 20 与 npx 命令",
  ],
  observableObjectives: [
    "按当前任务选择 2–4 个必需 MCP Server，避免全量挂载导致上下文噪音与 Token 暴涨",
    "为需要凭证的服务配置 ${env:VAR_NAME} 占位引用，杜绝在配置中写入明文密钥",
    "区分只读检索工具与写入类工具，并设定“写入人工审批”边界后导出有效 .cursor/mcp.json",
  ],
  steps: [
    "1. 在左侧挑选一个目标场景所需的 2–4 个 MCP（例如「Figma + Playwright」或「Postgres + GitHub」）。",
    "2. 将安全策略切换为「仅放行只读」或「写入人工审批」，切到「模拟 Agent 调用轨迹」观察写操作如何被拦截或确认。",
    "3. 在本页核对自动体检全部通过后，点击顶部「复制 mcp.json」，保存到你的实验项目 .cursor/mcp.json 并运行本地验证命令。",
  ],
  deliverable: "一份可直接放入本地实验项目根目录的 .cursor/mcp.json（通过 JSON 语法与密钥零泄露校验）",
  verificationCommands: [
    {
      label: "校验 JSON 语法与顶层 mcpServers 字段",
      command:
        "node -e \"const c=JSON.parse(require('fs').readFileSync('.cursor/mcp.json','utf8')); if(!c.mcpServers||!Object.keys(c.mcpServers).length) process.exit(1); console.log('OK:', Object.keys(c.mcpServers))\"",
    },
    {
      label: "使用官方 MCP Inspector 调试单个 Server（可选真实环境）",
      command: "npx @modelcontextprotocol/inspector npx -y @upstash/context7-mcp",
    },
  ],
  dodCriteria: [
    {
      id: "scoped-servers",
      label: "按场景精简挂载 2–4 个核心 MCP（拒绝盲目全选）",
      verifyHint: "左上方显示已挂载 2–4 个服务",
    },
    {
      id: "env-placeholder",
      label: "所有敏感凭证使用 ${env:VAR_NAME} 引用，配置中零明文密钥",
      verifyHint: "右侧自动体检「密钥零硬编码」显示通过",
    },
    {
      id: "write-gate",
      label: "已切换模拟演练轨迹，明确只读放行与写操作人工审批门禁",
      verifyHint: "查看过「模拟 Agent 调用轨迹」标签并确认策略",
    },
    {
      id: "local-verify",
      label: "已复制 .cursor/mcp.json 到本地并在终端跑通 JSON/Inspector 校验",
      verifyHint: "终端输出 OK 与已挂载 server key 列表",
    },
  ] satisfies McpDodCriterion[],
  troubleshooting: [
    {
      symptom: "Cursor 提示 spawn npx ENOENT 或 Server 启动超时",
      cause: "GUI 编辑器未继承 nvm/fnm 的 PATH，或首次 npx 下载慢超时。",
      resolution: "改用 node/npx 绝对路径（which npx 查询），或预先全局/本地安装对应包。",
    },
    {
      symptom: "MCP 启动报错缺少 Token，但系统环境变量已配置",
      cause: "未在 .cursor/mcp.json 的 env 中映射 ${env:VAR_NAME}，或变量所在 shell 未重启生效。",
      resolution: "核对 env 字段键名拼写，并从已导出环境变量的终端重新拉起 Cursor。",
    },
    {
      symptom: "接入数据库 MCP 后担心 Agent 误删/改写数据",
      cause: "传入了具备写权限的数据库连接串或未配置只读账号。",
      resolution: "在数据库侧创建只读角色账号给 DATABASE_URL，禁止将生产超级权限连入开发 MCP。",
    },
  ] satisfies McpTroubleshootItem[],
  boundaryNotice:
    "模拟器边界声明：本页全部配置预览、轨迹推演与 DoD 勾选均在浏览器本地运行，不会连接你本地磁盘、数据库、GitHub 或 Slack；真机接入外部 MCP 时，请注意第三方服务配额费用、最小只读权限以及不可信外部数据带来的 Prompt 注入风险。",
};

const SECRET_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: "GitHub Token (ghp_/github_pat_)", regex: /\b(ghp_[A-Za-z0-9_]{10,}|github_pat_[A-Za-z0-9_]{10,})/ },
  { label: "OpenAI / Stripe Secret Key (sk_ / sk-)", regex: /\b(sk_live_[A-Za-z0-9]{8,}|sk-[A-Za-z0-9_-]{16,})/ },
  { label: "Slack Token (xoxb-/xoxp-)", regex: /\b(xoxb-[A-Za-z0-9-]+|xoxp-[A-Za-z0-9-]+)/ },
  { label: "含明文密码的连接串", regex: /postgres(ql)?:\/\/[^/\s:${}]+:[^@\s${}]+@/i },
];

export function auditMcpConfigJson(
  rawJson: string,
  posture: "readonly" | "confirm-write"
): McpConfigAuditResult {
  const warnings: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid JSON";
    return {
      validJson: false,
      serverCount: 0,
      warnings: [`JSON 解析失败：${msg}`],
      checks: [
        { id: "json-valid", label: "JSON 语法合法", passed: false, detail: msg },
        { id: "scope-budget", label: "按需挂载规模 (1–4 个)", passed: false, detail: "等待有效 JSON" },
        { id: "no-secrets", label: "零明文密钥硬编码", passed: false, detail: "等待有效 JSON" },
        { id: "write-posture", label: "写入权限护栏明确", passed: false, detail: "等待有效 JSON" },
      ],
    };
  }

  const root =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  const mcpServers =
    root?.mcpServers && typeof root.mcpServers === "object" && !Array.isArray(root.mcpServers)
      ? (root.mcpServers as Record<string, unknown>)
      : null;

  const serverKeys = mcpServers ? Object.keys(mcpServers) : [];
  const serverCount = serverKeys.length;

  let secretHit: string | null = null;
  for (const p of SECRET_PATTERNS) {
    if (p.regex.test(rawJson)) {
      secretHit = p.label;
      break;
    }
  }

  let unreferencedEnvValue = false;
  if (mcpServers) {
    for (const key of serverKeys) {
      const entry = mcpServers[key];
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
      const envObj = (entry as Record<string, unknown>).env;
      if (envObj && typeof envObj === "object" && !Array.isArray(envObj)) {
        for (const [envKey, envVal] of Object.entries(envObj as Record<string, unknown>)) {
          if (typeof envVal === "string" && envVal.trim().length > 0 && !envVal.includes("${env:")) {
            unreferencedEnvValue = true;
            warnings.push(`服务 "${key}" 的 env.${envKey} 未使用 \${env:...} 占位符`);
          }
        }
      }
    }
  }

  if (secretHit) {
    warnings.push(`检测到疑似明文密钥：${secretHit}`);
  }
  if (serverCount === 0) {
    warnings.push("mcpServers 为空：至少启用 1 个必需 MCP Server 才能生效");
  } else if (serverCount > 4) {
    warnings.push(`当前挂载了 ${serverCount} 个 MCP，可能增加工具 Schema Token 占用`);
  }

  const checks: McpAuditCheck[] = [
    {
      id: "json-valid",
      label: "JSON 语法与 mcpServers 结构",
      passed: Boolean(mcpServers && serverCount > 0),
      detail: mcpServers
        ? serverCount > 0
          ? `已解析 ${serverCount} 个服务节点`
          : "mcpServers 为空"
        : "缺少 mcpServers 对象",
    },
    {
      id: "scope-budget",
      label: "上下文精简挂载 (1–4 个)",
      passed: serverCount >= 1 && serverCount <= 4,
      detail:
        serverCount === 0
          ? "尚未启用服务"
          : serverCount <= 4
          ? `${serverCount} 个服务 · 噪音可控`
          : `${serverCount} 个服务 · 建议精简或开启惰性发现`,
    },
    {
      id: "no-secrets",
      label: "零明文密钥与 ${env:...} 引用",
      passed: !secretHit && !unreferencedEnvValue,
      detail: secretHit
        ? `发现 ${secretHit}`
        : unreferencedEnvValue
        ? "存在未用 ${env:...} 包裹的值"
        : "全部凭证已通过 ${env:...} 隔离",
    },
    {
      id: "write-posture",
      label: "最小特权策略已声明",
      passed: posture === "readonly" || posture === "confirm-write",
      detail: posture === "readonly" ? "仅放行只读工具" : "写入工具需人工确认",
    },
  ];

  return {
    validJson: true,
    serverCount,
    checks,
    warnings,
  };
}
