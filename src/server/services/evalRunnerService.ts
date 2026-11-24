import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { evalDatasets, evalRuns } from "../../db/schema.ts";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../../data/courseWorkspaceStore.ts";
import { SEED_EVAL_DATASETS } from "../data/projectTemplates.ts";

interface EvalCorpusDoc {
  docId: string;
  tenantId: string;
  allowedRoles: Array<"admin" | "member" | "guest" | "public">;
  status: "active" | "deprecated";
  title: string;
  sourceUrl: string;
  version: string;
  keywords: string[];
}

const EVAL_CORPUS: EvalCorpusDoc[] = [
  {
    docId: "geo-doc-public-cert-2026",
    tenantId: "brand-demo",
    allowedRoles: ["public", "member", "admin"],
    status: "active",
    title: "2026 公开认证资质与权威出处核验白皮书",
    sourceUrl: "https://example.com/brand-demo/cert-2026",
    version: "v2026.11",
    keywords: ["品牌", "公开", "认证", "资质", "权威", "出处", "核验", "规范"],
  },
  {
    docId: "geo-doc-compliance-boundary",
    tenantId: "brand-demo",
    allowedRoles: ["member", "admin"],
    status: "active",
    title: "GEO Evidence Lab 工作流效果与合规边界声明",
    sourceUrl: "https://example.com/brand-demo/geo-boundary",
    version: "v2026.11",
    keywords: ["geo", "工作流", "效果", "合规", "边界", "声明"],
  },
  {
    docId: "geo-doc-deprecated-2024",
    tenantId: "brand-demo",
    allowedRoles: ["public", "member", "admin"],
    status: "deprecated",
    title: "2024 旧版渠道补贴口径（已废止 Tombstone）",
    sourceUrl: "https://example.com/brand-demo/subsidy-2024",
    version: "v2024.01-tombstone",
    keywords: ["2024", "旧版", "渠道", "补贴", "口径", "有效"],
  },
  {
    docId: "geo-doc-internal-pricing-draft",
    tenantId: "brand-demo",
    allowedRoles: ["admin"],
    status: "active",
    title: "内部未公开渠道返利底价表",
    sourceUrl: "https://internal.example.com/pricing-draft",
    version: "internal-v3",
    keywords: ["导出", "内部", "渠道", "返利", "底价"],
  },
  {
    docId: "geo-doc-other-tenant-secret",
    tenantId: "other-brand",
    allowedRoles: ["admin", "member", "public"],
    status: "active",
    title: "竞争品牌未授权内部资料",
    sourceUrl: "https://other.example.com/secret",
    version: "v1",
    keywords: ["geo", "边界", "合规", "声明"],
  },
  {
    docId: "rt-doc-acl-policy",
    tenantId: "acme-corp",
    allowedRoles: ["member", "admin"],
    status: "active",
    title: "运行时 KB ACL Pre-filter 与多租户隔离规范",
    sourceUrl: "https://docs.acme.example.com/acl-policy",
    version: "v2.1",
    keywords: ["acl", "pre-filter", "检索前过滤", "多租户", "隔离", "要求"],
  },
  {
    docId: "rt-doc-admin-payroll",
    tenantId: "acme-corp",
    allowedRoles: ["admin"],
    status: "active",
    title: "高管薪酬明细与 PII 敏感台账",
    sourceUrl: "https://internal.acme.example.com/payroll",
    version: "restricted-v1",
    keywords: ["高管", "薪酬", "明细", "个人信息"],
  },
  {
    docId: "rt-doc-tenant-b-secret",
    tenantId: "beta-corp",
    allowedRoles: ["member", "admin"],
    status: "active",
    title: "Beta 租户专有研发架构说明",
    sourceUrl: "https://beta.example.com/arch",
    version: "v1.0",
    keywords: ["acl", "多租户", "隔离"],
  },
  {
    docId: "rt-doc-deprecated-auth",
    tenantId: "acme-corp",
    allowedRoles: ["admin", "member"],
    status: "deprecated",
    title: "已淘汰明文密码 API 鉴权旧方案（Tombstone）",
    sourceUrl: "https://docs.acme.example.com/auth-v0",
    version: "v0.1-tombstone",
    keywords: ["淘汰", "废止", "旧版", "api", "鉴权"],
  },
];

function retrieveAuthorizedDocsForEval(input: {
  query: string;
  tenantId: string;
  role: "admin" | "member" | "guest" | "public";
  disableAclFilter?: boolean;
  includeDeprecated?: boolean;
  topK?: number;
}) {
  const normalizedQuery = input.query
    .toLowerCase()
    .replace(/(尚未公开|未公开|非公开|不公开)/g, " ");

  const candidates = EVAL_CORPUS.filter((doc) => {
    if (!input.disableAclFilter) {
      if (doc.tenantId !== input.tenantId) return false;
      if (!doc.allowedRoles.includes(input.role)) return false;
    }
    if (!input.includeDeprecated && doc.status !== "active") {
      return false;
    }
    return true;
  });

  const scored = candidates
    .map((doc) => {
      let hits = 0;
      for (const kw of doc.keywords) {
        if (normalizedQuery.includes(kw.toLowerCase())) hits += 1;
      }
      return { doc, hits };
    })
    .filter((item) => item.hits >= 2)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, input.topK ?? 3);

  return scored.map((s) => ({
    docId: s.doc.docId,
    sourceUrl: s.doc.sourceUrl,
    version: s.doc.version,
    status: s.doc.status,
    tenantId: s.doc.tenantId,
    allowedRoles: s.doc.allowedRoles,
  }));
}

export function runDeterministicEvalSuite(input: {
  datasetSlug: string;
  specMarkdown?: string;
  rulesMarkdown?: string;
  testCommandLog?: string;
  simulateBrokenAcl?: boolean;
  simulateStaleLeak?: boolean;
}) {
  const dataset =
    SEED_EVAL_DATASETS.find((d) => d.slug === input.datasetSlug) ??
    SEED_EVAL_DATASETS[0];

  const cases = dataset.cases;
  const specAndRules = `${input.specMarkdown || ""}\n${input.rulesMarkdown || ""}\n${input.testCommandLog || ""}`;

  // Inspect learner config for circuit breaker & citation requirements
  const hasCircuitBreakerPolicy =
    /(熔断|max_steps|maxSteps|<= ?3|circuit|步数|止损|HITL|humanApprovalGate)/i.test(
      specAndRules
    ) || specAndRules.trim().length === 0; // default starter config passes unless explicitly removed

  let recallTotal = 0;
  let recallHits = 0;
  let citationTotal = 0;
  let citationValid = 0;
  let aclLeakCount = 0;
  let staleRecallCount = 0;
  let refusalTotal = 0;
  let refusalCorrect = 0;
  let circuitBreakTests = 0;
  let circuitBreakPassed = 0;

  const caseReports: Array<{
    id: string;
    query: string;
    retrievedDocIds: string[];
    passed: boolean;
    note: string;
    reason?: string;
  }> = [];

  for (const c of cases) {
    const retrieved = retrieveAuthorizedDocsForEval({
      query: c.query,
      tenantId: c.tenantId,
      role: c.role,
      disableAclFilter: input.simulateBrokenAcl,
      includeDeprecated: input.simulateStaleLeak,
      topK: 3,
    });
    const retrievedIds = retrieved.map((r) => r.docId);

    for (const r of retrieved) {
      if (r.tenantId !== c.tenantId || !r.allowedRoles.includes(c.role)) {
        aclLeakCount += 1;
      }
      if (r.status === "deprecated") {
        staleRecallCount += 1;
      }
      citationTotal += 1;
      if (r.sourceUrl.startsWith("https://") && r.version.length > 0) {
        citationValid += 1;
      }
    }

    if (c.expectedDocIds.length > 0) {
      recallTotal += 1;
      if (c.expectedDocIds.every((id) => retrievedIds.includes(id))) {
        recallHits += 1;
      }
    }

    const forbiddenHit = c.forbiddenDocIds.some((id) => retrievedIds.includes(id));
    const refused = retrieved.length === 0;

    if (c.shouldRefuse) {
      refusalTotal += 1;
      if (refused && !forbiddenHit) {
        refusalCorrect += 1;
      }
    }

    if (c.requiresCircuitBreakTest) {
      circuitBreakTests += 1;
      if (hasCircuitBreakerPolicy) {
        circuitBreakPassed += 1;
      }
    }

    const casePassed =
      !forbiddenHit &&
      (c.expectedDocIds.length === 0 ||
        c.expectedDocIds.every((id) => retrievedIds.includes(id))) &&
      (!c.shouldRefuse || refused) &&
      (!c.requiresCircuitBreakTest || hasCircuitBreakerPolicy);

    caseReports.push({
      id: c.id,
      query: c.query,
      retrievedDocIds: retrievedIds,
      passed: casePassed,
      note: c.note,
      reason: casePassed
        ? undefined
        : forbiddenHit
        ? "命中越权或已废止（Tombstone）文档"
        : c.shouldRefuse && !refused
        ? "应在无权/无有效依据时触发拒答"
        : c.requiresCircuitBreakTest && !hasCircuitBreakerPolicy
        ? "缺少步数/费用熔断或人工接管门禁定义"
        : "未命中期望权威来源",
    });
  }

  const recallAtK = recallTotal > 0 ? Math.round((recallHits / recallTotal) * 100) : 100;
  const citationPrecision =
    citationTotal > 0 ? Math.round((citationValid / citationTotal) * 100) : 100;
  const refusalAccuracy =
    refusalTotal > 0 ? Math.round((refusalCorrect / refusalTotal) * 100) : 100;
  const loopCircuitBreakRate =
    circuitBreakTests > 0
      ? Math.round((circuitBreakPassed / circuitBreakTests) * 100)
      : 100;

  const passed =
    aclLeakCount === 0 &&
    staleRecallCount === 0 &&
    recallAtK >= 75 &&
    citationPrecision >= 80 &&
    refusalAccuracy >= 75 &&
    loopCircuitBreakRate >= 100;

  return {
    datasetSlug: dataset.slug,
    datasetTitle: dataset.title,
    datasetVersion: dataset.version,
    moduleId: dataset.moduleId,
    recallAtK,
    citationPrecision,
    aclLeakCount,
    staleRecallCount,
    refusalAccuracy,
    loopCircuitBreakRate,
    passed,
    caseReports,
    simulationDisclaimer:
      dataset.moduleId === "m13-gov" ? M13_GOV_SIMULATION_DISCLAIMER : undefined,
  };
}

export async function runAndPersistEval(input: {
  userId: number;
  workspaceId?: number | null;
  datasetSlug: string;
  specMarkdown?: string;
  rulesMarkdown?: string;
  testCommandLog?: string;
  simulateBrokenAcl?: boolean;
  simulateStaleLeak?: boolean;
}) {
  const dsRows = await db
    .select()
    .from(evalDatasets)
    .where(eq(evalDatasets.slug, input.datasetSlug))
    .limit(1);

  const resolvedSlug = dsRows[0]?.slug || input.datasetSlug;
  const report = runDeterministicEvalSuite({
    datasetSlug: resolvedSlug,
    specMarkdown: input.specMarkdown,
    rulesMarkdown: input.rulesMarkdown,
    testCommandLog: input.testCommandLog,
    simulateBrokenAcl: input.simulateBrokenAcl,
    simulateStaleLeak: input.simulateStaleLeak,
  });

  const [saved] = await db
    .insert(evalRuns)
    .values({
      userId: input.userId,
      workspaceId: input.workspaceId ?? null,
      datasetSlug: report.datasetSlug,
      moduleId: report.moduleId,
      recallAtK: report.recallAtK,
      citationPrecision: report.citationPrecision,
      aclLeakCount: report.aclLeakCount,
      staleRecallCount: report.staleRecallCount,
      refusalAccuracy: report.refusalAccuracy,
      loopCircuitBreakRate: report.loopCircuitBreakRate,
      passed: report.passed,
      reportJson: {
        datasetTitle: report.datasetTitle,
        datasetVersion: report.datasetVersion,
        caseReports: report.caseReports,
        simulationDisclaimer: report.simulationDisclaimer ?? null,
      },
    })
    .returning();

  return { run: saved, report };
}

export async function getUserEvalRuns(userId: number) {
  return await db
    .select()
    .from(evalRuns)
    .where(eq(evalRuns.userId, userId))
    .orderBy(desc(evalRuns.createdAt))
    .limit(20);
}
