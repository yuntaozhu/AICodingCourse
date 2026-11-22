import { getAuthHeaders } from "@/lib/authTokenStore";
import { recordAiApiCall } from "@/lib/performanceTelemetry";

function generateRequestId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface BugbotFinding {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "Security" | "Performance" | "Cursor Rules" | "DoD";
  line?: number;
  title: string;
  detail: string;
  fixInCursorPrompt: string;
}

export interface ReviewRequestPayload {
  code: string;
  rules: string[];
  customRule?: string;
  mode?: "bugbot" | "architecture";
}

export async function reviewCode(
  code: string,
  options: Omit<ReviewRequestPayload, "code"> = { rules: [] }
): Promise<{ feedback: string; model: string }> {
  const startedAt = performance.now();
  try {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch("/api/review", {
      method: "POST",
      headers,
      body: JSON.stringify({
        requestId: generateRequestId("review"),
        code,
        rules: options.rules,
        customRule: options.customRule,
        mode: options.mode ?? "bugbot",
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      feedback?: string;
      model?: string;
      error?: string;
    };

    const latencyMs = performance.now() - startedAt;
    recordAiApiCall({
      endpoint: "/api/review",
      ok: response.ok,
      latencyMs,
    });

    if (!response.ok) {
      throw new Error(data.error || `AI 评审请求失败 (HTTP ${response.status})`);
    }

    return {
      feedback: data.feedback || "未返回评审内容。",
      model: data.model || "gemini-4-hydrogen",
    };
  } catch (err) {
    if (err instanceof Error && !err.message.includes("AI 评审请求失败")) {
      recordAiApiCall({
        endpoint: "/api/review",
        ok: false,
        latencyMs: performance.now() - startedAt,
      });
    }
    throw err;
  }
}

export function runLocalBugbotCheck(code: string, activeRules: string[]): BugbotFinding[] {
  const findings: BugbotFinding[] = [];
  const lines = code.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (/(SELECT|INSERT|UPDATE|DELETE).*\+\s*[a-zA-Z_$]/.test(line) || /\$\{.*\}/.test(line) && /(SELECT|INSERT|UPDATE|DELETE)/i.test(line)) {
      findings.push({
        id: `sqli-${lineNum}`,
        severity: "critical",
        category: "Security",
        line: lineNum,
        title: "检测到字符串拼接 SQL 注入风险",
        detail: `第 ${lineNum} 行直接拼接变量构造 SQL，违反安全防线。`,
        fixInCursorPrompt: `在 Cursor 中选中第 ${lineNum} 行按 Cmd+K：改为参数化查询或 ORM 绑定参数，并补充 Zod 输入校验。`,
      });
    }

    if (/(sk_live_|AIzaSy|ghp_|SECRET_KEY\s*=\s*["'][^"']+["'])/i.test(line)) {
      findings.push({
        id: `secret-${lineNum}`,
        severity: "critical",
        category: "Security",
        line: lineNum,
        title: "检测到硬编码敏感密钥",
        detail: `第 ${lineNum} 行疑似包含明文密钥，严禁提交到前端或 Git 仓库。`,
        fixInCursorPrompt: `Cmd+I 指令：把密钥迁移到服务端 process.env，并检查 .gitignore 与 .env.example。`,
      });
    }

    if (/fetch\(|axios\.|db\.execute/.test(line)) {
      const prevLines = lines.slice(Math.max(0, idx - 4), idx).join("\n");
      if (/for\s*\(|\.forEach\(|\.map\(/.test(prevLines)) {
        findings.push({
          id: `nplus1-${lineNum}`,
          severity: "warning",
          category: "Performance",
          line: lineNum,
          title: "循环内发起阻塞 I/O（N+1 瓶颈）",
          detail: `第 ${lineNum} 行在循环体内部执行数据库/网络请求，并发下响应时间线性恶化。`,
          fixInCursorPrompt: `用 @Files 选中当前文件在 Agent 模式重构：改为 IN 批量查询或 Promise.all 并发聚合并加上限控制。`,
        });
      }
    }

    if (/useEffect\s*\(/.test(line) && /fetch\(|async/.test(lines.slice(idx, idx + 8).join("\n"))) {
      const block = lines.slice(idx, idx + 12).join("\n");
      if (!/AbortController|cancelled|ignore/.test(block)) {
        findings.push({
          id: `race-${lineNum}`,
          severity: "warning",
          category: "Performance",
          line: lineNum,
          title: "React useEffect 缺少异步竞态清理",
          detail: `第 ${lineNum} 行的异步请求未绑定 AbortController 或取消标志，快速切换状态易覆盖新数据。`,
          fixInCursorPrompt: `按 Cmd+K 修复：添加 AbortController cleanup，或在组件卸载时忽略过期响应。`,
        });
      }
    }
  });

  if (/app\.(post|put|delete)\s*\(/.test(code) && !/(auth|session|jwt|verify|middleware|req\.user)/i.test(code)) {
    findings.push({
      id: "auth-missing",
      severity: "critical",
      category: "Cursor Rules",
      title: "写操作接口缺少鉴权与权限校验",
      detail: "检测到 POST/PUT/DELETE 路由但未识别到 Session/JWT 或中间件校验，违背最小特权规范。",
      fixInCursorPrompt: "在 Cursor Agent 中挂载 @20-api-security.mdc：为所有写路由补齐鉴权中间件与 Zod Schema 校验。",
    });
  }

  if (/expect\s*\(\s*(true|1)\s*\)\s*\.toBe\s*\(\s*(true|1)\s*\)|test\.skip\(|it\.skip\(|xit\(|xtest\(/i.test(code)) {
    findings.push({
      id: "sonar-reward-hack",
      severity: "critical",
      category: "DoD",
      title: "Sonar 习惯 #6 警报：疑似 AI 测试作弊 (Reward Hacking)",
      detail: "检测到 expect(true).toBe(true) 空断言或 .skip 跳过测试，AI 可能通过弱化断言“凑绿灯”。",
      fixInCursorPrompt: "DoD 强制重构：删除虚假占位断言与 skip，围绕真实业务输出和异常边界重新编写独立单测。",
    });
  }

  if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(code) || /console\.log\(/.test(code) || /\/\/\s*TODO:/i.test(code)) {
    findings.push({
      id: "sonar-stray-code",
      severity: "warning",
      category: "DoD",
      title: "Sonar 习惯 #4 警报：存在残余调试代码或静默吞错 (Stray Code)",
      detail: "检测到残留 console.log、TODO 占位或空 catch {} 块，必须清理后再合并以防止技术债堆积。",
      fixInCursorPrompt: "Cmd+K 清理：移除残留 console.log 与占位注释，在 catch 中返回结构化错误或显式日志。",
    });
  }

  if (!/try\s*\{/.test(code) && /(execute|fetch|await)/.test(code)) {
    findings.push({
      id: "dod-error-handling",
      severity: "info",
      category: "DoD",
      title: "异步操作缺少显式错误处理边界",
      detail: `结合已启用规则（${activeRules.length} 条），建议补充 try/catch 与结构化错误返回。`,
      fixInCursorPrompt: "DoD 收尾指令：补充错误边界返回标准 HTTP 状态码，并添加至少 1 个异常分支单测。",
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: "pass-local",
      severity: "info",
      category: "DoD",
      title: "静态快速门禁通过（建议进一步跑实时 AI 语义审查）",
      detail: `已按 ${activeRules.length} 条 .cursor/rules 完成本地模式匹配，未发现明显高危模式。`,
      fixInCursorPrompt: "在 Cursor 终端运行 npm run lint && npx tsc --noEmit 完成最终 DoD 验证。",
    });
  }

  return findings;
}

export interface KbBookSynthesisInput {
  id: string;
  title: string;
  authorOrSource: string;
  category: string;
  coreTakeaways: string;
  courseApplication: string;
}

export type KbOutputMode = "lesson_outline" | "cursor_rule" | "hands_on_lab";

export async function synthesizeCourseFromBooks(payload: {
  topic: string;
  targetModule: string;
  outputMode: KbOutputMode;
  selectedBooks: KbBookSynthesisInput[];
}): Promise<{ content: string; model: string }> {
  const startedAt = performance.now();
  try {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch("/api/kb/synthesize", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...payload,
        requestId: generateRequestId("kb"),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      content?: string;
      model?: string;
      error?: string;
    };

    recordAiApiCall({
      endpoint: "/api/kb/synthesize",
      ok: response.ok,
      latencyMs: performance.now() - startedAt,
    });

    if (!response.ok) {
      throw new Error(data.error || `知识库备课生成失败 (HTTP ${response.status})`);
    }

    return {
      content: data.content || "未返回备课内容。",
      model: data.model || "gemini-4-hydrogen",
    };
  } catch (err) {
    if (err instanceof Error && !err.message.includes("知识库备课生成失败")) {
      recordAiApiCall({
        endpoint: "/api/kb/synthesize",
        ok: false,
        latencyMs: performance.now() - startedAt,
      });
    }
    throw err;
  }
}

export function buildOfflineCourseSynthesis(params: {
  topic: string;
  targetModule: string;
  outputMode: KbOutputMode;
  selectedBooks: KbBookSynthesisInput[];
}): string {
  const { topic, targetModule, outputMode, selectedBooks } = params;
  const cleanTopic = topic.trim() || "Cursor 工程化与确定性交付";
  const refs = selectedBooks.map((b) => `《${b.title}》`).join("、");

  if (outputMode === "cursor_rule") {
    return `---
description: "${targetModule} ${cleanTopic} · 基于知识库提炼"
globs: ["src/**/*.{ts,tsx}", "server/**/*.ts"]
alwaysApply: false
---

# 核心原则（参考文献：${refs}）
${selectedBooks
  .map((b, i) => `${i + 1}. [${b.authorOrSource}] ${b.courseApplication}`)
  .join("\n")}

# Cursor Agent 执行 DoD 门禁
- 修改多文件前必须先开启 Plan Mode (Shift+Tab) 输出数据契约
- 禁止泄露服务端密钥至前端或绕过输入校验
- 完成变更后执行 npx tsc --noEmit && npm run lint`;
  }

  if (outputMode === "hands_on_lab") {
    return `## ${targetModule} Cursor 实战实验：${cleanTopic}

### 理论依据
- 参考书目：${refs}

### 第一步：在 Cursor Plan Mode 输入指令
\`\`\`text
@AGENTS.md @PRD.md
请结合以下工程准则实现「${cleanTopic}」：
${selectedBooks.map((b) => `- ${b.coreTakeaways}`).join("\n")}
先输出文件修改计划与边界检查点，确认后再编码。
\`\`\`

### 第二步：实验验收 DoD
1. 运行 \`npx tsc --noEmit\` 保证零类型报错
2. 运行 Bugbot / 独立新会话核对 \`git diff\` 与上述书目红线一致`;
  }

  return `## ${targetModule} 课程升级讲义：${cleanTopic}

### 知识库引用底座（共 ${selectedBooks.length} 册）
${selectedBooks
  .map((b, idx) => `${idx + 1}. **《${b.title}》** (${b.authorOrSource})\n   - 提炼：${b.coreTakeaways}\n   - 转化：${b.courseApplication}`)
  .join("\n")}

### 建议 3 页 PPT 教学编排
- **主屏（痛点破局）**：拆解传统盲写为何失效，引出上述经典书目核心原则
- **子屏 1（Cursor 落地映射）**：演示如何在 \`Plan ➔ .cursor/rules ➔ MCP\` 中落成工程约束
- **子屏 2（实战演练）**：学员在课程沙盘中装配提示词并跑通 Bugbot 门禁验证`;
}

export type RuleTargetType = "mdc" | "agents_md";

export interface CraftRulesPayload {
  task: string;
  targetType: RuleTargetType;
  globs: string;
  alwaysApply: boolean;
  constraints: string[];
}

export async function craftCursorConfig(
  payload: CraftRulesPayload
): Promise<{ content: string; model: string }> {
  const startedAt = performance.now();
  try {
    const headers = await getAuthHeaders({ "Content-Type": "application/json" });
    const response = await fetch("/api/craft-rules", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...payload,
        requestId: generateRequestId("rules"),
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      content?: string;
      model?: string;
      error?: string;
    };

    recordAiApiCall({
      endpoint: "/api/craft-rules",
      ok: response.ok,
      latencyMs: performance.now() - startedAt,
    });

    if (!response.ok) {
      throw new Error(data.error || `AI 配置生成失败 (HTTP ${response.status})`);
    }

    return {
      content: data.content || "未返回生成内容。",
      model: data.model || "gemini-4-hydrogen",
    };
  } catch (err) {
    if (err instanceof Error && !err.message.includes("AI 配置生成失败")) {
      recordAiApiCall({
        endpoint: "/api/craft-rules",
        ok: false,
        latencyMs: performance.now() - startedAt,
      });
    }
    throw err;
  }
}

export function buildOfflineCursorConfig(payload: CraftRulesPayload): string {
  const cleanTask = payload.task.trim() || "构建高可靠全栈业务模块";
  const cleanGlobs = payload.globs.trim() || "src/**/*.{ts,tsx}";
  const activeConstraints =
    payload.constraints.length > 0
      ? payload.constraints
      : ["TypeScript 严格零 any", "禁止静默吞错与泄露密钥"];

  if (payload.targetType === "mdc") {
    return `---
description: "${cleanTask.slice(0, 72)}"
globs: ["${cleanGlobs}"]
alwaysApply: ${payload.alwaysApply ? "true" : "false"}
---

# 任务域上下文与工程红线
- 目标任务：${cleanTask}
${activeConstraints.map((c) => `- [强制约束] ${c}`).join("\n")}

# DO & DON'T（正反例对照）
- DO: 修改跨文件接口前先进入 Plan Mode 输出契约与验收点。
- DO: 异步请求绑定 AbortController，服务端写路由使用参数化查询与 Zod 校验。
- DON'T: 禁止使用 \`as any\`、空 \`catch {}\` 吞错、残留 \`console.log\` 或伪断言 \`expect(true).toBe(true)\`。

# DoD 终检门禁
- 执行 \`npx tsc --noEmit && npm run lint && npm run build\` 全部零报错后方可收尾。`;
  }

  return `# AGENTS.md

## 1. 仓库定位与目标任务
- 核心目标：${cleanTask}
- 工作模式：先规划接口与边界（Plan Mode），再执行小步可审校变更（Single Diff < 150 行）。

## 2. 构建与验收命令（Verification Gate）
- 类型检查：\`npx tsc --noEmit\`
- 代码规范：\`npm run lint\`
- 生产构建：\`npm run build\`

## 3. 全局工程约束与安全红线
${activeConstraints.map((c) => `- ${c}`).join("\n")}

## 4. DO & DON'T
- DO: 所有敏感环境变量仅在服务端读取，前端通过 \`/api/*\` 路由交互。
- DON'T: 禁止硬编码 API Key、跳过单测（\`.skip\`）或擅自引入未登记依赖。`;
}


