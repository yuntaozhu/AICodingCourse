import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_ID = "gemini-4-hydrogen";

const app = express();
app.use(express.json({ limit: "2mb" }));

interface ReviewBody {
  code?: string;
  rules?: string[];
  customRule?: string;
  mode?: "bugbot" | "architecture";
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: MODEL_ID,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/review", async (req, res) => {
  const { code, rules = [], customRule = "", mode = "bugbot" } = (req.body || {}) as ReviewBody;

  if (!code || typeof code !== "string" || !code.trim()) {
    res.status(400).json({ error: "请先提供需要审查的代码片段。" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），或直接使用「本地 Bugbot 静态规则自检」进行即时离线演练。",
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const activeRulesSummary =
      rules.length > 0 ? rules.map((r) => `- ${r}`).join("\n") : "- 默认遵循 TypeScript 严格模式与安全基线";

    const systemInstruction = `你是 Cursor Bugbot 首席代码审查官，专门服务于“从 0 到 1 上线产品的独立开发者与产品经理”。
请用清晰、紧凑的中文 Markdown 结构输出代码审查报告，严格对齐以下四个维度：
1. 🛡️ 安全与权限门禁（SQL 注入、密钥泄露、鉴权遗漏、XSS）
2. ⚡ 性能与状态陷阱（N+1 查询、React 竞态或无限渲染、阻塞逻辑）
3. 📜 .cursor/rules 规范遵循度（对照用户启用的规则逐条指出违背点）
4. ✅ 可执行 Fix in Cursor 建议（直接给出可直接让 Cursor Agent 修改的最小化修复方案与 DoD 验证命令）

输出控制在 450 字以内，条理分明，禁止空话。`;

    const prompt = `审查模式: ${mode === "architecture" ? "架构与 SDD 对齐审查" : "Cursor Bugbot PR 自动审查"}
已挂载的 .cursor/rules (.mdc):
${activeRulesSummary}
${customRule.trim() ? `\n补充自定义规则:\n${customRule.trim()}` : ""}

待审查代码:
\`\`\`
${code.slice(0, 12000)}
\`\`\``;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      feedback: response.text ?? "未生成审查结果。",
      model: MODEL_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "调用 Gemini 评审服务时发生未知错误";
    console.error("[/api/review] error:", message);
    res.status(500).json({
      error: `服务端 AI 评审调用失败：${message}`,
    });
  }
});

interface SynthesisBookInput {
  title: string;
  authorOrSource: string;
  category: string;
  coreTakeaways: string;
  courseApplication: string;
}

interface SynthesisBody {
  topic?: string;
  targetModule?: string;
  outputMode?: "lesson_outline" | "cursor_rule" | "hands_on_lab";
  selectedBooks?: SynthesisBookInput[];
}

app.post("/api/kb/synthesize", async (req, res) => {
  const {
    topic = "从原型到可上线独立产品",
    targetModule = "M3",
    outputMode = "lesson_outline",
    selectedBooks = [],
  } = (req.body || {}) as SynthesisBody;

  if (!Array.isArray(selectedBooks) || selectedBooks.length === 0) {
    res.status(400).json({ error: "请至少选择 1 本知识库书籍或论文后再生成课程内容。" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），可使用左侧「即刻离线备课合成」生成结构化方案。",
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const booksContext = selectedBooks
      .slice(0, 6)
      .map(
        (b, idx) =>
          `[${idx + 1}] 《${b.title}》 (${b.authorOrSource} · ${b.category})\n核心要点: ${b.coreTakeaways}\n课程应用: ${b.courseApplication}`
      )
      .join("\n\n");

    const modeLabelMap: Record<NonNullable<SynthesisBody["outputMode"]>, string> = {
      lesson_outline: "课程模块扩展讲义大纲（含 3 张 PPT 核心要点 + 教学案例 + 课堂提问）",
      cursor_rule: "可直接放入项目 .cursor/rules/ 的 .mdc 规则文件（含 YAML frontmatter 与 DoD 检查项）",
      hands_on_lab: "面向独立开发者与产品经理的 Cursor 动手实验题（含 Plan Mode 提示词 + 验收标准）",
    };

    const systemInstruction = `你是 Cursor AI Coding 实战课程的首席课程架构师，擅长将经典 AI/软件工程专著与前沿论文转化为“独立开发者与产品经理”可直接上手的实战课程内容。
要求：
1. 必须显式引用传入书单中的真实书名或论文名称作为理论/工程依据，严禁虚构未提供的书目。
2. 紧密结合 Cursor 特性（Plan 模式、@Files/@Codebase、.cursor/rules (.mdc)、MCP、Background Agents、Bugbot）。
3. 输出紧凑、可直接复制进课件或 Cursor 项目中，控制在 500 字以内。`;

    const prompt = `目标课程模块: ${targetModule}
生成形态: ${modeLabelMap[outputMode]}
教学主题: ${topic.trim() || "基于选定知识库构建课程模块"}

已选知识库参考资料:
${booksContext}`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      content: response.text ?? "未生成备课方案。",
      model: MODEL_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "知识库备课合成调用失败";
    console.error("[/api/kb/synthesize] error:", message);
    res.status(500).json({
      error: `知识库 AI 备课失败：${message}`,
    });
  }
});

interface CraftRulesBody {
  task?: string;
  targetType?: "mdc" | "agents_md";
  globs?: string;
  alwaysApply?: boolean;
  constraints?: string[];
}

app.post("/api/craft-rules", async (req, res) => {
  const {
    task = "",
    targetType = "mdc",
    globs = "src/**/*.{ts,tsx}",
    alwaysApply = false,
    constraints = [],
  } = (req.body || {}) as CraftRulesBody;

  if (!task || typeof task !== "string" || !task.trim()) {
    res.status(400).json({ error: "请先输入目标开发任务或产品场景描述。" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "未检测到服务端 GEMINI_API_KEY（请在 Settings > Secrets 中配置），可使用「离线规则模板装配」即时生成结构化配置。",
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const constraintsText =
      constraints.length > 0
        ? constraints.map((c) => `- ${c}`).join("\n")
        : "- TypeScript 严格模式，零 any，显式边界错误处理";

    const systemInstruction =
      targetType === "mdc"
        ? `你是 Cursor 上下文治理架构师，负责把开发任务转化为高信噪比的 .cursor/rules/*.mdc 规则文件。
输出规范：
1. 必须直接输出纯 .mdc 文件内容（不要用 \`\`\`markdown 代码块包裹），第一行即以 --- 开始 YAML frontmatter（包含 description、globs、alwaysApply）。
2. 正文控制在 45 行以内，包含：核心架构红线、必须遵循的 DO 与严禁踩坑的 DON'T（含简短代码约束）、以及末端 DoD 验证命令（如 npx tsc --noEmit && npm run lint）。
3. 精准聚焦目标任务，拒绝空泛套话。`
        : `你是 AI-First 全栈工程架构师，负责编写根目录跨工具 AGENTS.md 协作规范（供 Cursor Agent / CLI Agent / Bugbot 共同读取）。
输出规范：
1. 必须直接输出纯 Markdown 内容（不要用 \`\`\` 代码块外框包裹），以 # AGENTS.md 开头。
2. 总行数控制在 55 行以内，包含：项目角色与目录边界、开发/类型/构建/测试核对命令、不可逾越的安全与质量红线（含 DO / DON'T）、以及最小化 Diff 协作准则。
3. 紧密围绕用户输入的目标任务定制，语言简洁精准。`;

    const prompt = `目标文件格式: ${targetType === "mdc" ? ".cursor/rules/*.mdc" : "AGENTS.md"}
${targetType === "mdc" ? `指定 globs: ${globs.trim() || "src/**/*.{ts,tsx}"}\nalwaysApply: ${alwaysApply}` : "适用范围: 仓库根目录全量 Agent 上下文"}
目标开发任务:
${task.trim().slice(0, 2000)}

必选工程约束:
${constraintsText}`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    res.json({
      content: (response.text ?? "").trim() || "未生成配置内容。",
      model: MODEL_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "规则生成请求失败";
    console.error("[/api/craft-rules] error:", message);
    res.status(500).json({
      error: `服务端 AI 生成配置失败：${message}`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cursor AI Coding Course Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
