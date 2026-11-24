import { db } from "../../db/index.ts";
import { staticAuditRuns } from "../../db/schema.ts";

export interface StaticAuditFinding {
  id: string;
  ruleId: string;
  severity: "blocking" | "warning";
  title: string;
  detail: string;
}

export interface StaticAuditResult {
  passed: boolean;
  blockingCount: number;
  warningCount: number;
  findings: StaticAuditFinding[];
  changedFiles: string[];
  auditedAt: string;
}

const SECRET_TOKEN_REGEX =
  /(sk-[a-zA-Z0-9_-]{16,}|ghp_[a-zA-Z0-9]{16,}|github_pat_[a-zA-Z0-9_]{16,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{20,}|Bearer\s+[A-Za-z0-9\-._~+/]{20,}|VITE_[A-Z0-9_]*(SECRET|PRIVATE|TOKEN|PASSWORD))/;

const SQL_INJECTION_REGEX =
  /((SELECT|INSERT|UPDATE|DELETE)\b[\s\S]{0,120}(\$\{[^}]+\}|'\s*\+\s*[a-zA-Z_$]))/i;

const REWARD_HACKING_REGEX =
  /(expect\s*\(\s*true\s*\)\s*\.toBe\s*\(\s*true\s*\)|assert\.ok\s*\(\s*true\s*\)|\b(it|test|describe)\.skip\s*\(|\/\/\s*@ts-ignore\b|eslint-disable\b)/;

const OVERCLAIM_GEO_REGEX =
  /(保证进入\s*AI\s*推荐|100%\s*被\s*AI\s*引用|保证排名第一|guaranteed\s+AI\s+ranking)/i;

function normalizeRepoPath(rawPath: string): string {
  return rawPath
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

export function matchSimpleGlob(filePath: string, pattern: string): boolean {
  const normFile = normalizeRepoPath(filePath);
  const normPattern = normalizeRepoPath(pattern);
  if (!normFile || !normPattern) return false;
  if (normFile === normPattern) return true;

  if (normPattern.endsWith("/**")) {
    const prefix = normPattern.slice(0, -3);
    return normFile === prefix || normFile.startsWith(`${prefix}/`);
  }
  if (normPattern.endsWith("*")) {
    const prefix = normPattern.slice(0, -1);
    return normFile.startsWith(prefix);
  }
  if (normPattern.includes("*")) {
    const [head, tail] = normPattern.split("*");
    return normFile.startsWith(head) && normFile.endsWith(tail);
  }
  return false;
}

export function runDeterministicStaticAudit(input: {
  moduleId: string;
  codeOrArtifactText: string;
  specText?: string;
  rulesText?: string;
  diffSummary?: string;
  testCommandLog?: string;
  changedFiles?: string[];
  allowedGlobs?: string[];
  blockedPaths?: string[];
  requireProjectStructure?: boolean;
}): StaticAuditResult {
  const findings: StaticAuditFinding[] = [];
  const combinedSource = [
    input.codeOrArtifactText || "",
    input.specText || "",
    input.rulesText || "",
    input.diffSummary || "",
    input.testCommandLog || "",
  ].join("\n");

  const changedFiles = (input.changedFiles ?? [])
    .map(normalizeRepoPath)
    .filter(Boolean);

  // 1. Secret / client env exposure check
  const secretMatch = combinedSource.match(SECRET_TOKEN_REGEX);
  if (secretMatch) {
    findings.push({
      id: "rule-secret-leak",
      ruleId: "SEC-001",
      severity: "blocking",
      title: "检测到疑似明文密钥或客户端敏感环境变量前缀",
      detail: `命中敏感模式（${secretMatch[0].slice(0, 14)}...）。请改用服务端 process.env 或 \${env:VAR_NAME} 占位符后重新提交。`,
    });
  }

  // 2. SQL concatenation injection check
  if (SQL_INJECTION_REGEX.test(combinedSource)) {
    findings.push({
      id: "rule-sql-concat",
      ruleId: "SEC-002",
      severity: "blocking",
      title: "检测到 SQL 字符串拼接风险",
      detail: "严禁使用模板字符串或加号拼接 SQL 变量，请改用参数化查询或 Drizzle ORM 条件绑定。",
    });
  }

  // 3. Reward Hacking / Assertion tampering check
  const cheatMatch = combinedSource.match(REWARD_HACKING_REGEX);
  if (cheatMatch) {
    findings.push({
      id: "rule-reward-hacking",
      ruleId: "QA-001",
      severity: "blocking",
      title: "检测到疑似测试作弊（Reward Hacking）或跳过门禁模式",
      detail: `命中模式：${cheatMatch[0]}。禁止通过 .skip、@ts-ignore 或恒真断言凑绿，请保留真实测试断言并修复业务实现。`,
    });
  }

  // 4. File allowlist & blocked paths boundary check
  const blockedPaths = input.blockedPaths ?? [
    "rules/00-core-redlines.mdc",
    ".env",
    ".env.local",
    ".env.production",
  ];
  const allowedGlobs = input.allowedGlobs ?? [];

  for (const file of changedFiles) {
    if (file.includes("..")) {
      findings.push({
        id: `rule-path-traversal-${file}`,
        ruleId: "SCOPE-000",
        severity: "blocking",
        title: "检测到非法路径穿越字符 (..)",
        detail: `文件路径 ${file} 包含非法父目录跳转，已阻断提交。`,
      });
      continue;
    }

    const hitBlocked = blockedPaths.some((bp) => matchSimpleGlob(file, bp));
    if (hitBlocked) {
      findings.push({
        id: `rule-blocked-path-${file}`,
        ruleId: "SCOPE-001",
        severity: "blocking",
        title: "触碰受保护红线文件",
        detail: `变更文件 ${file} 命中禁改清单（${blockedPaths.join(", ")}），请还原该文件改动。`,
      });
      continue;
    }

    if (allowedGlobs.length > 0) {
      const withinAllowlist = allowedGlobs.some((glob) => matchSimpleGlob(file, glob));
      if (!withinAllowlist) {
        findings.push({
          id: `rule-allowlist-${file}`,
          ruleId: "SCOPE-002",
          severity: "blocking",
          title: "变更文件超出任务白名单范围",
          detail: `文件 ${file} 不在允许目录（${allowedGlobs.join(", ")}）内，请拆分最小化 Diff。`,
        });
      }
    }
  }

  // 5. GEO overclaim compliance check
  if (OVERCLAIM_GEO_REGEX.test(combinedSource)) {
    findings.push({
      id: "rule-geo-overclaim",
      ruleId: "GEO-001",
      severity: "blocking",
      title: "存在违规效果承诺表述（GEO 合规红线）",
      detail:
        "禁止承诺“保证进入 AI 推荐/保证排名第一”。请改为客观表述：建立来源登记、结构化语料、抽样评测与人工审核工作流。",
    });
  }

  // 6. Project evidence completeness warnings
  if (input.requireProjectStructure) {
    if (!input.specText || input.specText.trim().length < 20) {
      findings.push({
        id: "rule-spec-missing",
        ruleId: "SPEC-001",
        severity: "warning",
        title: "缺少完整 SPEC.md 规格边界说明",
        detail: "建议补充业务边界、输入输出与异常回退条件（≥20 字），方便人工审校接管。",
      });
    }
    if (!input.testCommandLog || input.testCommandLog.trim().length < 8) {
      findings.push({
        id: "rule-test-log-missing",
        ruleId: "DOD-001",
        severity: "warning",
        title: "缺少命令验证输出日志",
        detail: "建议贴入 tsc / lint / npm test 或 Eval 运行输出摘要。",
      });
    }
  }

  const blockingCount = findings.filter((f) => f.severity === "blocking").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;

  return {
    passed: blockingCount === 0,
    blockingCount,
    warningCount,
    findings,
    changedFiles,
    auditedAt: new Date().toISOString(),
  };
}

export async function recordStaticAuditRun(input: {
  userId: number;
  workspaceId?: number | null;
  submissionId?: number | null;
  moduleId: string;
  audit: StaticAuditResult;
}) {
  const [saved] = await db
    .insert(staticAuditRuns)
    .values({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      submissionId: input.submissionId ?? null,
      moduleId: input.moduleId,
      passed: input.audit.passed,
      blockingCount: input.audit.blockingCount,
      warningCount: input.audit.warningCount,
      findingsJson: input.audit.findings,
      changedFilesJson: input.audit.changedFiles,
    })
    .returning();
  return saved;
}
