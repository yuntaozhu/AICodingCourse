import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface RuleFixTask {
  id: string;
  flawType: string;
  badRule: string;
  choices: { id: string; text: string; isGood: boolean; feedback: string }[];
}

const RULE_FIX_TASKS: RuleFixTask[] = [
  {
    id: "fix-broad",
    flawType: "1. 范围过宽（alwaysApply + **/*）",
    badRule: "alwaysApply: true\nglobs: **/*\n- 所有文件必须使用 React hooks 和 Tailwind",
    choices: [
      {
        id: "fb-1",
        text: "改为 alwaysApply: false + globs: src/components/**/*.tsx，仅约束前端 TSX",
        isGood: true,
        feedback: "精准！后端 server/*.ts 不再被 React 规则误伤，Token 预算立省。",
      },
      {
        id: "fb-2",
        text: "保持 alwaysApply: true，在底部加一句“后端请忽略”",
        isGood: false,
        feedback: "依然浪费全局上下文窗口，且模型在长上下文里容易忽略末尾例外声明。",
      },
    ],
  },
  {
    id: "fix-conflict",
    flawType: "2. 规则冲突 & 不可验证约定",
    badRule: "01-ui.mdc: 用 Zustand 写优雅高性能代码\n02-state.mdc: 禁止新增状态库只用 Redux",
    choices: [
      {
        id: "fc-1",
        text: "合并为单一规则：明确唯一状态方案，把“优雅”改为“单组件 <200 行 + 跑通 tsc/lint”",
        isGood: true,
        feedback: "精准！消除了规则打架，并把模糊形容词改写成了命令可校验的规则。",
      },
      {
        id: "fc-2",
        text: "两条都保留，让 Agent 自己看心情选一个",
        isGood: false,
        feedback: "规则自相矛盾会导致代码库混用两套状态管理，越写越乱。",
      },
    ],
  },
  {
    id: "fix-mcp",
    flawType: "3. 无害 MCP 最小特权审计（教学模拟配置）",
    badRule: `"postgres-demo": { "args": ["postgresql://admin:demo123@localhost/app"], "mode": "auto-write" }`,
    choices: [
      {
        id: "fm-1",
        text: "改用 ${env:DB_READONLY_URL} 只读凭证 + 关闭自动写入改为人工审批确认",
        isGood: true,
        feedback: "精准！遵循只读优先、零明文凭证与写操作人类审批门禁三原则。",
      },
      {
        id: "fm-2",
        text: "把密码改长一点并加上 autoApprove: true 提高速度",
        isGood: false,
        feedback: "硬编码明文加自动写执行会同时触发凭证泄露与不可逆误删风险。",
      },
    ],
  },
];

const RULES_MCP_ARTIFACT = `# RULES_AND_MCP_AUDIT_CHECKLIST.md — Rules 与 MCP 风险权限清单

## 一、.cursor/rules (.mdc) 自检 4 铁律
1. **作用域最小化**：全局 \`AGENTS.md\` 仅放构建/测试命令（<40 行）；目录规范用 \`globs\` + \`alwaysApply: false\`。
2. **零规则冲突**：状态管理、路由风格、样式方案全仓只允许一个权威规则源。
3. **可验证改写**：禁止写“写优雅/安全的代码”；必须写成“输入用 Zod 校验、无 any、提交前通过 \`npm run lint\`”。
4. **定期修剪**：已被 ESLint / TypeScript 编译器强制保证的条目及时从 \`.mdc\` 删除。

## 二、安全、无害的最小特权 .cursor/mcp.json 示例（只读优先）
\`\`\`json
{
  "mcpServers": {
    "demo-db-readonly": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "\${env:DB_READONLY_URL}"],
      "env": {
        "DB_READONLY_URL": "\${env:DB_READONLY_URL}"
      }
    }
  }
}
\`\`\`

## 三、MCP 权限与风险门禁
- [ ] **只读优先**：默认只挂载 read / query / list 工具；禁用未审计的 \`DROP / DELETE\`。
- [ ] **凭证隔离**：100% 使用 \`\${env:VAR_NAME}\` 引用，仓库内零明文 Token。
- [ ] **写操作审批**：发 PR、写库、发消息类 MCP 工具一律开启人工 Confirm 审批。`;

export default function P31e() {
  const [picks, setPicks] = useState<Record<string, string>>({});

  const passedCount = RULE_FIX_TASKS.filter((task) => {
    const picked = picks[task.id];
    return task.choices.find((c) => c.id === picked)?.isGood;
  }).length;

  return (
    <ModuleLoopStudio
      moduleCode="M4"
      eyebrow="RULES & MCP GOVERNANCE · 坏规则改写与最小特权审计"
      title="Rules 排雷改写 & 无害 MCP 最小特权安全演练"
      notes="针对过宽、冲突、不可验证的坏规则进行改写实战，并在无害教学配置中完成只读优先、最小权限的 MCP 安全审计。"
      objective="能诊断并改写过宽/冲突/不可验证的 .mdc 规则，并按只读优先、${env:...} 占位与人工审批原则审计 .cursor/mcp.json。"
      boundary="规则文件越精简越有效；严禁在 .mcp.json 写明文密钥，严禁把可写/删库权限在不设人工 Confirm 的情况下交给 Agent。"
      positiveCase={{
        title: "作用域清晰 + 可验证规则 + 只读优先 MCP",
        scenario: "把「团队 API 规范与本地查表需求」沉淀为高精度工程规则与安全配置。",
        steps: [
          "API 安全规则绑定 globs: server/**/*.ts 且 alwaysApply: false，不污染前端上下文。",
          "每条规则可执行、可校验（例：写接口必须经 Zod schema 解析，禁止字符串拼接 SQL）。",
          "数据库 MCP 只配只读账号 ${env:DB_READONLY_URL}，且写操作强制人工审批。",
        ],
        snippetLabel: "改写后的高质量 .mdc 规则",
        snippet: `---
description: Backend API validation and error handling
globs: server/routes/**/*.ts
alwaysApply: false
---
- Validate req.body with Zod before DB access.
- Return structured JSON errors; never leak stack traces.`,
        verdict: "规则零冲突、仅按需注入，MCP 即使遭遇 Prompt 注入也无法越权删库。",
      }}
      failureCase={{
        title: "过宽、冲突、空泛规则 + 过权 MCP 配置",
        scenario: "常见工程治理失控：把所有团队习惯一股脑塞进 rules，顺手给了 MCP 全库读写。",
        steps: [
          "范围过宽：每份规则都设 alwaysApply: true，10 份规则开局就占掉数千 Token。",
          "规则打架与不可验证：A 文件写用 Redux、B 文件写用 Zustand，还要求“代码高雅高性能”。",
          "MCP 过度授权：在 .cursor/mcp.json 明文写读写账号且开启自动免确认执行。",
        ],
        snippetLabel: "典型失控规则与风险配置",
        snippet: `alwaysApply: true # 10 份全开 -> 注意力稀释
- "保持代码优雅，性能达到最优" # 无法自动化验收
"DB_URL": "postgresql://root:secret@prod:5432/db" # 明文+高危权限`,
        verdict: "AI 在互相打架的约束下无所适从，高权限 MCP 放大了误操作破坏半径。",
      }}
      practiceTitle="课堂改写与审计练习：修复 2 类坏规则与 1 份过权 MCP 配置"
      practicePassedCount={passedCount}
      practiceTotalCount={RULE_FIX_TASKS.length}
      dodItems={[
        {
          id: "m4-dod-1",
          label: "已消灭 alwaysApply: true 泛滥与规则间技术栈冲突",
          verifyHint: "按文件目录设置 globs，全局约束控制在 40 行内",
        },
        {
          id: "m4-dod-2",
          label: "完成右侧 3 道坏规则改写与 MCP 安全审计",
          verifyHint: "确认不可验证词已替换为明确检查项，MCP 改为只读+${env:...}",
        },
        {
          id: "m4-dod-3",
          label: "带走并应用「Rules + MCP 风险与权限审计清单」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="Rules 排雷与 MCP 最小特权风险权限清单"
      artifactFilename="RULES_AND_MCP_AUDIT_CHECKLIST.md"
      artifactContent={RULES_MCP_ARTIFACT}
      reflectionQuestion="挑一条你们团队口头常说、但 AI 总是做不到的习惯（例如“接口返回要统一”、“代码要好维护”），你打算怎么把它改写成 AI 能对照检查的明确规则？"
      reflectionHint="把形容词拆成“结构+工具+反例”：例如把“接口返回统一”改写为「所有 /api/* 路由成功返回 { ok: true, data }，失败返回 { ok: false, error } + HTTP 4xx/5xx，禁止直接 res.send 纯文本」并附正反例。"
      renderPractice={() => (
        <div className="space-y-2.5 text-xs">
          {RULE_FIX_TASKS.map((task) => {
            const picked = picks[task.id];
            const pickedChoice = task.choices.find((c) => c.id === picked);
            return (
              <div
                key={task.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
              >
                <div className="font-mono text-[11px] text-gemini-purple">{task.flawType}</div>
                <pre className="p-2 rounded-lg bg-black/50 font-mono text-[10px] text-rose-200 whitespace-pre-wrap">
                  {task.badRule}
                </pre>
                <div className="grid grid-cols-2 gap-2">
                  {task.choices.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setPicks((p) => ({ ...p, [task.id]: ch.id }))}
                      className={`p-2 rounded-lg text-left text-[11px] border cursor-pointer transition-colors ${
                        picked === ch.id
                          ? ch.isGood
                            ? "bg-emerald-500/15 border-emerald-400/45 text-emerald-100"
                            : "bg-rose-500/15 border-rose-400/45 text-rose-100"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25"
                      }`}
                    >
                      {ch.text}
                    </button>
                  ))}
                </div>
                {pickedChoice && (
                  <div
                    className={`text-[11px] px-2 py-1 rounded ${
                      pickedChoice.isGood ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
                    }`}
                  >
                    {pickedChoice.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    />
  );
}
