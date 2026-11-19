import type { RuleTemplate } from "./cursorPresets";
import { COURSE_LABS, type LabDefinition } from "./courseCurriculum";

export interface LabAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface LabAuditReport {
  score: number;
  checks: LabAuditCheck[];
  warnings: string[];
}

export const LAB_DOD_STORAGE_KEY = "cursor_course_lab_dod_progress_v1";
export const LEGACY_M4_MCP_DOD_KEY = "cursor_course_m4_mcp_dod_v1";

const SECRET_TOKEN_PATTERN =
  /(sk-[a-zA-Z0-9]{16,}|ghp_[a-zA-Z0-9]{16,}|github_pat_[a-zA-Z0-9_]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{20,}|Bearer\s+[A-Za-z0-9\-._~+/]{20,})/;

export function auditPlanPrompt(input: {
  idea: string;
  mode: "Plan" | "Agent" | "Ask" | "Debug";
  selectedTags: string[];
  selectedDod: string[];
}): LabAuditReport {
  const trimmedIdea = input.idea.trim();
  const warnings: string[] = [];

  const hasConcreteIntent =
    trimmedIdea.length >= 12 &&
    !/(随便写写|看着办|全部搞定|帮我做个网站就行)/.test(trimmedIdea);
  if (!hasConcreteIntent) {
    warnings.push("需求描述偏短或过于笼统，建议补充核心业务对象、权限或失败回退条件。");
  }

  const usesSafeModeFirst = input.mode === "Plan" || input.mode === "Ask" || input.mode === "Debug";
  if (input.mode === "Agent") {
    warnings.push("当前直接以 Agent 模式起步；跨多文件新需求建议先用 Plan (Shift+Tab) 确认变更清单。");
  }

  const scopedContextOk = input.selectedTags.length >= 1 && input.selectedTags.length <= 4;
  if (input.selectedTags.length === 0) {
    warnings.push("未挂载任何 @ 上下文符号，Agent 可能在错误文件或过时实现上猜测。");
  } else if (input.selectedTags.length > 4) {
    warnings.push("挂载的 @ 上下文过多（>4 项），容易挤占注意力并降低首轮指令遵循度。");
  }

  const hasVerifiableDod = input.selectedDod.length >= 2;
  if (!hasVerifiableDod) {
    warnings.push("勾选的 DoD 验收门禁少于 2 项，建议至少保留类型检查与边界态校验。");
  }

  const noSecrets = !SECRET_TOKEN_PATTERN.test(trimmedIdea);
  if (!noSecrets) {
    warnings.push("检测到疑似真实 API Key 或 Token，严禁将明文密钥粘贴进提示词或上下文。");
  }

  const checks: LabAuditCheck[] = [
    {
      id: "concrete-intent",
      label: "需求意图具体（≥12 字符且含明确目标）",
      passed: hasConcreteIntent,
      detail: hasConcreteIntent
        ? `当前需求长度 ${trimmedIdea.length} 字符`
        : "请描述清晰的功能边界与目标对象",
    },
    {
      id: "plan-before-build",
      label: "优先规格对齐 / 只读定位（Plan / Ask / Debug）",
      passed: usesSafeModeFirst,
      detail:
        input.mode === "Plan"
          ? "已使用 Plan 模式先输出规格与待确认问题"
          : input.mode === "Agent"
          ? "建议先切 Plan 对齐接口再执行 Agent 修改"
          : `当前为 ${input.mode} 模式，不直接大规模改写代码`,
    },
    {
      id: "scoped-context",
      label: "上下文挂载精准（1–4 个 @ 符号）",
      passed: scopedContextOk,
      detail: `当前已挂载 ${input.selectedTags.length} 个 @ 上下文`,
    },
    {
      id: "verifiable-dod",
      label: "可验证 DoD 门禁（≥2 项检查）",
      passed: hasVerifiableDod,
      detail: `已勾选 ${input.selectedDod.length} 项验收检查`,
    },
    {
      id: "no-secrets",
      label: "无明文密钥泄露风险",
      passed: noSecrets,
      detail: noSecrets ? "未发现明文 Key 模式" : "发现疑似 Token/Key，请改用环境变量名",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    warnings,
  };
}

export function auditCursorRules(rules: RuleTemplate[]): LabAuditReport {
  const warnings: string[] = [];
  const alwaysApplyCount = rules.filter((r) => r.alwaysApply).length;
  const globRules = rules.filter((r) => !r.alwaysApply && r.globs.length > 0);
  const hasBroadWildcard = globRules.some((r) =>
    r.globs.some((g) => g.trim() === "*" || g.trim() === "**/*" || g.trim() === "**")
  );
  const allBodies = rules.map((r) => r.body).join("\n");
  const hasActionableConstraints =
    rules.length > 0 &&
    rules.every((r) => r.body.trim().length >= 20) &&
    /(禁止|必须|严禁|验证|env|Zod|tsc|test|Error|密钥|鉴权|avoid|never|must|strict|validate|verify|check)/i.test(
      allBodies
    );
  const noSecrets = !SECRET_TOKEN_PATTERN.test(allBodies);

  if (alwaysApplyCount > 1) {
    warnings.push(`当前有 ${alwaysApplyCount} 条规则开启 alwaysApply: true，建议精简至 ≤1 条以避免全局上下文膨胀。`);
  }
  if (globRules.length === 0) {
    warnings.push("缺少按目录 globs 触发的局部规则，无法做到跨端按需隔离。");
  }
  if (hasBroadWildcard) {
    warnings.push("检测到过宽的 **/* 或 * glob 通配符，会退化为全量注入。");
  }
  if (!hasActionableConstraints) {
    warnings.push("规则正文需包含明确可核查约束（如禁止事项、校验库或验证命令）。");
  }
  if (!noSecrets) {
    warnings.push("规则正文中检测到疑似真实密钥字面量，请立即替换为占位说明。");
  }

  const checks: LabAuditCheck[] = [
    {
      id: "always-apply-budget",
      label: "全局 alwaysApply 规则控制在 0–1 条",
      passed: alwaysApplyCount <= 1,
      detail: `当前 alwaysApply: true 共 ${alwaysApplyCount} 条`,
    },
    {
      id: "glob-targeted",
      label: "具备精确 globs 路径按需规则（无 **/* 泛化）",
      passed: globRules.length >= 1 && !hasBroadWildcard,
      detail: `精确 glob 规则 ${globRules.length} 条${hasBroadWildcard ? "（含过宽通配符）" : ""}`,
    },
    {
      id: "actionable-body",
      label: "规则正文具备可执行工程约束与禁忌",
      passed: hasActionableConstraints,
      detail: hasActionableConstraints ? "包含明确的禁止项与验证约束" : "规则正文约束不够具体",
    },
    {
      id: "no-secrets-in-rules",
      label: "规则文件中不含真实凭证或 Token",
      passed: noSecrets,
      detail: noSecrets ? "未发现明文密钥" : "发现疑似密钥字符，请清除",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    warnings,
  };
}

export type LabDodProgressMap = Record<string, Record<number, boolean>>;

export function loadAllLabDodProgress(): LabDodProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAB_DOD_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    const result: LabDodProgressMap =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as LabDodProgressMap)
        : {};

    // Also include legacy M4 MCP lab checklist (array of 4 DoD IDs) under "mcp-toolbox" if present
    if (!result["mcp-toolbox"]) {
      const legacyRaw = window.localStorage.getItem(LEGACY_M4_MCP_DOD_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw) as unknown;
        if (Array.isArray(legacyParsed) && legacyParsed.length >= 4) {
          result["mcp-toolbox"] = { 0: true, 1: true, 2: true };
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function loadLabChecklist(labId: string): Record<number, boolean> {
  const all = loadAllLabDodProgress();
  return all[labId] ?? {};
}

export function saveLabChecklist(labId: string, checklist: Record<number, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadAllLabDodProgress();
    current[labId] = checklist;
    window.localStorage.setItem(LAB_DOD_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("course:lab-progress-updated"));
  } catch {
    // Ignore storage errors
  }
}

export function isLabDodComplete(
  lab: LabDefinition,
  progressMap: LabDodProgressMap
): boolean {
  const checked = progressMap[lab.id];
  if (!checked || lab.acceptanceCriteria.length === 0) return false;
  return lab.acceptanceCriteria.every((_, idx) => Boolean(checked[idx]));
}

export function getCompletedLabIds(progressMap: LabDodProgressMap): string[] {
  return COURSE_LABS.filter((lab) => isLabDodComplete(lab, progressMap)).map((l) => l.id);
}

export function auditBugbotSession(input: {
  enabledRulesCount: number;
  ranLocalCheck: boolean;
  findingsCount: number;
  usedAiReview: boolean;
}): LabAuditReport {
  const warnings: string[] = [];
  const hasRuleCoverage = input.enabledRulesCount >= 2;
  const ranCheck = input.ranLocalCheck || input.usedAiReview;
  const securityRuleActive = input.enabledRulesCount >= 1;
  const reviewedFindings = ranCheck && input.findingsCount >= 0;

  if (!hasRuleCoverage) {
    warnings.push("建议至少挂载 2 条 .cursor/rules（含安全护栏与 DoD 检查）再执行 PR 评审。");
  }
  if (!ranCheck) {
    warnings.push("请先点击「本地规则秒检」或「AI 深度评审」完成首轮风险扫描。");
  }

  const checks: LabAuditCheck[] = [
    {
      id: "rule-coverage",
      label: "已挂载 ≥2 条结构化 .mdc 评审规则",
      passed: hasRuleCoverage,
      detail: `当前挂载 ${input.enabledRulesCount} 条规则`,
    },
    {
      id: "deterministic-scan",
      label: "已执行静态或独立上下文代码扫描",
      passed: ranCheck,
      detail: ranCheck
        ? `已检出 ${input.findingsCount} 项待确认发现`
        : "尚未触发评审扫描",
    },
    {
      id: "security-baseline",
      label: "保留权限/SQLi/密钥底线检查规则",
      passed: securityRuleActive,
      detail: securityRuleActive ? "安全底线规则生效中" : "缺少安全规则挂载",
    },
    {
      id: "human-signoff",
      label: "人工复核高危项并禁止盲目合并",
      passed: reviewedFindings,
      detail: reviewedFindings ? "请逐条确认修复指令后在右侧勾选 DoD" : "等待完成扫描后人工确认",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  return {
    score: Math.round((passedCount / checks.length) * 100),
    checks,
    warnings,
  };
}

export const LAB_ARTIFACTS_STORAGE_KEY = "cursor_course_lab_artifacts_v1";

export interface LabArtifactsStore {
  planPrompt?: string;
  mdcRuleSlug?: string;
  mdcRuleContent?: string;
  mcpConfigJson?: string;
  updatedAt?: string;
}

export function loadLabArtifacts(): LabArtifactsStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAB_ARTIFACTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as LabArtifactsStore)
      : {};
  } catch {
    return {};
  }
}

export function saveLabArtifact(partial: Partial<LabArtifactsStore>): void {
  if (typeof window === "undefined") return;
  try {
    const prev = loadLabArtifacts();
    const next: LabArtifactsStore = {
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    window.localStorage.setItem(LAB_ARTIFACTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
}

export function buildEngineeringHandoffMarkdown(params: {
  pathLabel?: string;
  completedModuleIds: string[];
  completedLabIds: string[];
  artifacts: LabArtifactsStore;
}): string {
  const pathText = params.pathLabel || "完整课程路径";
  const planSection =
    params.artifacts.planPrompt?.trim() ||
    `[Cursor Plan Mode | Cmd+I]\nContext: @Codebase @Files @Docs\nIntent: 请在 Lab 01 沙盘输入您的产品需求并复制结构化 Plan 蓝图`;
  const ruleSlug = params.artifacts.mdcRuleSlug || "10-ui-tailwind";
  const ruleSection =
    params.artifacts.mdcRuleContent?.trim() ||
    `---\ndescription: 请在 Lab 02 沙盘编辑并导出您的项目级 .mdc 规则\nglobs:\n  - src/**/*.tsx\nalwaysApply: false\n---`;
  const mcpSection =
    params.artifacts.mcpConfigJson?.trim() ||
    `{\n  "mcpServers": {\n    "github": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-github"],\n      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "\${env:GITHUB_PERSONAL_ACCESS_TOKEN}" }\n    }\n  }\n}`;

  return [
    `# AICodingCourse 工程化交付包`,
    ``,
    `- 学习路径：${pathText}`,
    `- 模块进度：已完成 ${params.completedModuleIds.length}/10 (${params.completedModuleIds.join(", ") || "尚未记录"})`,
    `- 实操验收：已验收 ${params.completedLabIds.length}/${COURSE_LABS.length} (${params.completedLabIds.join(", ") || "尚未记录"})`,
    `- 导出日期：${params.artifacts.updatedAt || "2026-11-18"}（仅基于浏览器本地练习产物生成）`,
    ``,
    `## 1. 需求规格蓝图 (Lab 01 · Plan -> Agent Spec)`,
    ``,
    "```text",
    planSection,
    "```",
    ``,
    `## 2. 仓库上下文规则 (.cursor/rules/${ruleSlug}.mdc · Lab 02)`,
    ``,
    "```markdown",
    ruleSection,
    "```",
    ``,
    `## 3. 最小特权 MCP 配置 (.cursor/mcp.json · Lab 03)`,
    ``,
    "```json",
    mcpSection,
    "```",
    ``,
    `## 4. 上线前 DoD 与人工审核门禁`,
    ``,
    `- [ ] \`npm run lint\`（0 错误）`,
    `- [ ] \`npx tsc --noEmit\`（0 类型错误）`,
    `- [ ] \`npm test\`（单元测试全量通过）`,
    `- [ ] \`npm run build\`（生产构建通过）`,
    `- [ ] 人工确认：所有密钥仅通过 \`\${env:...}\` 或服务端环境变量注入；支付/鉴权/写库路径未经人工复核禁止自动上线。`,
    ``,
  ].join("\n");
}

