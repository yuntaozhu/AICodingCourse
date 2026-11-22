import type {
  KnowledgeCategory,
  KnowledgeModuleCode,
  KnowledgeValidationStatus,
} from "./teamKnowledgeBase";

export type RuntimePipelineStage =
  | "blueprint-prd"
  | "acl-prefilter"
  | "hybrid-retrieval"
  | "citation-grounding"
  | "tombstone-lifecycle"
  | "dual-eval";

export const RUNTIME_PIPELINE_STAGE_LABELS: Record<RuntimePipelineStage, string> = {
  "blueprint-prd": "1. Data/Prompt PRD 与 HITL",
  "acl-prefilter": "2. ACL 检索前过滤",
  "hybrid-retrieval": "3. 混合检索与 Wiki 路由",
  "citation-grounding": "4. Citation Grounding 溯源",
  "tombstone-lifecycle": "5. Tombstone 版本淘汰",
  "dual-eval": "6. 检索 + 轨迹 Dual Eval",
};

export const RUNTIME_WORKSHOP_MODULE_CODES: KnowledgeModuleCode[] = [
  "M11",
  "M12",
  "M13-Gov",
  "M13-Eng",
];

export interface RuntimeKnowledgeEntry {
  id: string;
  title: string;
  kbTrack: "runtime-domain";
  pipelineStage: RuntimePipelineStage;
  category: KnowledgeCategory;
  validationStatus: KnowledgeValidationStatus;
  modules: KnowledgeModuleCode[];
  version: string;
  updatedAt: string;
  owner: string;
  source: string;
  scope: string;
  summary: string;
  whenToUse: string;
  antiPatternOrWarning: string;
  evalGate: string;
  migrationNotes: string;
  feedbackLoop: string;
  repoPath: string;
  copyableSnippet: string;
}

export const RUNTIME_KB_WORKSHOP_RULES = {
  repoRootPath: "docs/knowledge-base/runtime-domain-kb.md",
  trackName: "链路 B · Agent 运行时领域知识库工坊（给运行中 Agent / RAG）",
  separationBoundary:
    "本链路专用于生产级 Agent 应用的数据接入、ACL 检索前过滤、混合/Wiki 检索、引用溯源、Tombstone 生命周期与双层 Eval；与开发者使用的工程规范库及 78 册 AI-pdf-books 备课书库在检索源与导出产物上完全隔离。",
  simulationNotice:
    "课堂 Lab 18/19/20 提供结构化教学模拟与可运行 TypeScript 骨架，不替代线上向量集群压测与生产实测验收。",
  pipelineSteps: [
    "数据接入与切分（Schema + PII 分级）",
    "ACL 检索前强过滤（tenantId + role + status）",
    "混合召回与结构化 Wiki 目录路由",
    "Citation Grounding 锚点绑定与低置信度拒答",
    "Tombstone 标记淘汰过期文档",
    "Retrieval Recall@K + Agent 轨迹 Dual Eval",
  ],
};

export const RUNTIME_WORKSHOP_KNOWLEDGE_BASE: RuntimeKnowledgeEntry[] = [
  {
    id: "kb-m11-agent-prd-blueprint",
    title: "Agent 产品蓝图双文档：Data PRD + Prompt PRD + HITL 矩阵",
    kbTrack: "runtime-domain",
    pipelineStage: "blueprint-prd",
    category: "template",
    validationStatus: "verified",
    modules: ["M11", "M13-Gov"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "Agent 产品架构组",
    source: "M11 Agent 系统蓝图课程规格",
    scope: "立项评估是否需要 Agent、定义数据源分级与人工接管（HITL）审批边界",
    summary:
      "先用 Workflow vs Agent 决策树排除过度设计，再通过 Data PRD 锁定隐私与失效代价、Prompt PRD 锁定工具预算与人工升级条件。",
    whenToUse: "开发或评审任何多步骤 AI 应用（会议助手、医疗 GEO、数学建模 Wiki、客服代理）之前。",
    antiPatternOrWarning: "能用确定性脚本与表单解决的流程，不要强行做成自主多轮 Agent。",
    evalGate: "Data PRD 必须显式标注 PII 分级与权限隔离键；写操作工具挂 humanApprovalGate。",
    migrationNotes: "非技术与 PM 可直接基于本模板完成 M13-Gov 治理评审交付。",
    feedbackLoop: "回放真实失败轨迹后，把新增的风险条件补充进 HITL 触发清单。",
    repoPath: "docs/knowledge-base/runtime-domain-kb.md",
    copyableSnippet: `## 1. Data PRD
- 数据源与敏感级别: [public | internal | restricted-PII]
- 权限隔离键: tenantId + roleScope（检索前强过滤）
## 2. Prompt PRD & HITL
- 工具白名单预算: <= 4 个（写操作必须挂 humanApprovalGate）
- 拒答与升级条件: 检索置信度 < 0.65 或命中过期版本时中止生成并转交人工`,
  },
  {
    id: "kb-m12-acl-prefilter-contract",
    title: "运行时 KB 硬红线：ACL 检索前过滤（Pre-filter）与版本淘汰契约",
    kbTrack: "runtime-domain",
    pipelineStage: "acl-prefilter",
    category: "starter-rule",
    validationStatus: "verified",
    modules: ["M12", "M13-Eng"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "运行时检索与安全组",
    source: "M12 运行时领域知识库六步工程链路",
    scope: "所有带权限隔离或有时效迭代的线上 RAG / Wiki 知识库后端",
    summary:
      "租户、角色权限与文档状态（active/deprecated）必须在向量或 BM25 查询条件中强过滤，严禁把越权或过期原文送入 LLM 上下文。",
    whenToUse: "实现企业知识库、医疗合规系统、校园内部会议系统检索路由时强制执行。",
    antiPatternOrWarning:
      "先召回全库 Top-K，再在 System Prompt 里口头要求模型“不要泄露机密”属于严重越权漏洞。",
    evalGate: "跨租户探针命中率 = 0%；Tombstone 废弃文档召回率 = 0%。",
    migrationNotes: "参考 docs/knowledge-base/runtime-domain-kb.md 的 retrieveAuthorizedChunks 可运行骨架。",
    feedbackLoop: "将每一次越权试探样例固化进自动化零越权回归测试集。",
    repoPath: "docs/knowledge-base/runtime-domain-kb.md",
    copyableSnippet: `const authorized = chunks.filter(
  (c) =>
    c.tenantId === session.tenantId &&
    c.allowedRoles.includes(session.role) &&
    c.status === "active"
);`,
  },
  {
    id: "kb-m12-hybrid-citation-grounding",
    title: "混合检索（BM25 + 语义 + Wiki 路由）与 Citation Grounding 溯源协议",
    kbTrack: "runtime-domain",
    pipelineStage: "citation-grounding",
    category: "example",
    validationStatus: "verified",
    modules: ["M12", "M13-Eng"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "运行时检索与安全组",
    source: "M12 混合检索与结构化 Wiki 实战",
    scope: "医学条款、数学建模公式库、哲学典籍引用与制度问答",
    summary:
      "结合精确词法检索与语义召回（结构化知识优先走 Wiki 目录页），要求每条结论绑定不可篡改的 docId、version、section 引用锚点。",
    whenToUse: "纯向量切分导致公式/编号/专有名词召回丢失或模型脱离原文编造引用时。",
    antiPatternOrWarning: "把长篇数学推导或合同条款按固定 500 字符硬切断，导致条件与结论分离。",
    evalGate: "Recall@3 >= 0.85；Citation Grounding 锚点可回查准确率 >= 0.90。",
    migrationNotes: "Wiki 结构页按章节锚点索引；评测时同时统计 Recall@K 与 Citation Precision。",
    feedbackLoop: "定期抽检低忠实度（Faithfulness）样本，优化分块边界或转为 Wiki 索引页。",
    repoPath: "docs/knowledge-base/runtime-domain-kb.md",
    copyableSnippet: `interface GroundedClaim {
  claim: string;
  citations: Array<{ docId: string; version: string; section: string; excerpt: string }>;
  grounded: boolean; // 无足够证据时必须返回 false 并拒答
}`,
  },
  {
    id: "kb-m13-gov-trajectory-rubric",
    title: "M13-Gov 治理评审规范：预制轨迹风险识别与模拟边界声明",
    kbTrack: "runtime-domain",
    pipelineStage: "tombstone-lifecycle",
    category: "checklist",
    validationStatus: "verified",
    modules: ["M13-Gov"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "Agent 治理与评审组",
    source: "M13-Gov 无代码治理 Capstone 验收规格",
    scope: "产品经理、非技术学习者与业务负责人做 Agent 上线前模拟治理评审",
    summary:
      "基于预制执行轨迹与 Golden 评测集检查四类典型隐患（越权调用、ACL 漏过滤、过期版本召回、无引用编造），产出可审签 HITL 矩阵。",
    whenToUse: "在 M13-Gov 完成无代码版 Capstone 上线前风险评审时。",
    antiPatternOrWarning:
      "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。",
    evalGate: "预制轨迹四类隐患全部检出并配置对应 HITL 人工接管门禁。",
    migrationNotes: "评审通过后若进入工程排期，应将风险矩阵同步交给 M12/M13-Eng 团队转化为自动化测试。",
    feedbackLoop: "每次发现新业务越权轨迹模式，增补进预制轨迹库与评审 Rubric。",
    repoPath: "docs/knowledge-base/runtime-domain-kb.md",
    copyableSnippet: `- [ ] 识别轨迹中的 KB 权限漏过滤与过期指南召回风险
- [ ] 在 Data PRD 补齐 tenantId / role / status 强制过滤契约
- [ ] 为不可逆写操作与低置信度输出配置 HITL 人工接管门禁
- [ ] 声明：模拟治理评审通过 ≠ 生产运行系统实测验证`,
  },
  {
    id: "kb-m13-eng-dual-eval-suite",
    title: "M13-Eng 双层 Eval 报告模板（KB 检索指标 + Agent 端到端轨迹评测）",
    kbTrack: "runtime-domain",
    pipelineStage: "dual-eval",
    category: "checklist",
    validationStatus: "verified",
    modules: ["M13-Eng", "M12"],
    version: "v1.0",
    updatedAt: "2026-11-20",
    owner: "Agent 评测与可靠性组",
    source: "M13-Eng 工程 Capstone 验收规格",
    scope: "可运行 Agent 与运行时 KB 上线前客观验收",
    summary:
      "拆开评估检索侧（Recall@K、ACL 零越权、过期版本零召回）与 Agent 端到端侧（工具调用准确率、步数/预算熔断、忠实度与延迟）。",
    whenToUse: "提交 M13-Eng 工程版 Capstone 或发布 Agent 版本更新前。",
    antiPatternOrWarning:
      "不能只测 3 条正向提问就宣称 Agent 可靠；必须包含越权探测、过期文档与故障工具测试集。",
    evalGate: "ACL 越权 0% ｜ 过期版本召回 0% ｜ Recall@3 >= 0.85 ｜ 步数预算熔断 100% 触发。",
    migrationNotes: "结合仓库本地 Vitest / node:test 自动化脚本持续回归。",
    feedbackLoop: "把线上或测试中发现的失败轨迹固化为 Golden Dataset 永久回归用例。",
    repoPath: "docs/knowledge-base/runtime-domain-kb.md",
    copyableSnippet: `## M13-Eng 客观验收基线
- ACL 越权漏出率: 0%（含跨租户与低权限角色探针）
- 过期版本误召回率: 0%（Tombstone 淘汰生效）
- 检索 Recall@3: >= 0.85 | 引用锚点准确率: >= 0.90
- Agent 步数与费用熔断测试: 100% 触发可控终止`,
  },
];

export function searchRuntimeKnowledgeBase(options: {
  query?: string;
  moduleFilter?: string;
  stageFilter?: RuntimePipelineStage | "ALL";
  statusFilter?: KnowledgeValidationStatus | "ALL";
}): RuntimeKnowledgeEntry[] {
  const normalizedQuery = (options.query || "").trim().toLowerCase();
  const moduleFilter = options.moduleFilter || "ALL";
  const stageFilter = options.stageFilter || "ALL";
  const statusFilter = options.statusFilter || "ALL";

  return RUNTIME_WORKSHOP_KNOWLEDGE_BASE.filter((entry) => {
    if (moduleFilter !== "ALL" && !entry.modules.includes(moduleFilter as KnowledgeModuleCode)) {
      return false;
    }
    if (stageFilter !== "ALL" && entry.pipelineStage !== stageFilter) {
      return false;
    }
    if (statusFilter !== "ALL" && entry.validationStatus !== statusFilter) {
      return false;
    }
    if (normalizedQuery) {
      const haystack =
        `${entry.title} ${entry.summary} ${entry.scope} ${entry.evalGate} ${entry.copyableSnippet} ${entry.owner} ${RUNTIME_PIPELINE_STAGE_LABELS[entry.pipelineStage]}`.toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}

export function getRuntimeKnowledgeEntriesForModule(
  moduleCode: KnowledgeModuleCode
): RuntimeKnowledgeEntry[] {
  return RUNTIME_WORKSHOP_KNOWLEDGE_BASE.filter((entry) => entry.modules.includes(moduleCode));
}

export interface RuntimeChunkRecord {
  chunkId: string;
  docId: string;
  tenantId: string;
  allowedRoles: string[];
  version: string;
  status: "active" | "deprecated";
  supersededBy?: string;
  section: string;
  text: string;
  semanticScore?: number;
}

export interface RuntimeCallerSession {
  tenantId: string;
  role: string;
}

export interface GroundedCitation {
  chunkId: string;
  docId: string;
  version: string;
  section: string;
  excerpt: string;
  score: number;
}

export interface BlockedChunkTrace {
  chunkId: string;
  docId: string;
  reasonCode: "tombstone" | "cross-tenant" | "unauthorized-role";
  reason: string;
}

export interface RuntimeRetrievalResult {
  grounded: boolean;
  refusalReason: string | null;
  authorizedPoolCount: number;
  citations: GroundedCitation[];
  blocked: BlockedChunkTrace[];
}

export function retrieveAuthorizedRuntimeChunks(
  index: RuntimeChunkRecord[],
  session: RuntimeCallerSession,
  queryTerms: string[],
  options?: {
    topK?: number;
    minScore?: number;
    allowEmptyQueryBaseline?: boolean;
  }
): RuntimeRetrievalResult {
  const topK = options?.topK ?? 3;
  const minScore = options?.minScore ?? 1;
  const normalizedTerms = queryTerms.map((t) => t.trim().toLowerCase()).filter(Boolean);

  // Stage 2 & Stage 5: Mandatory ACL Pre-filter + Tombstone Invalidation BEFORE any scoring
  const authorized: RuntimeChunkRecord[] = [];
  const blocked: BlockedChunkTrace[] = [];

  for (const chunk of index) {
    if (chunk.status !== "active") {
      blocked.push({
        chunkId: chunk.chunkId,
        docId: chunk.docId,
        reasonCode: "tombstone",
        reason: chunk.supersededBy
          ? `Tombstone 拦截：status=deprecated（已由 ${chunk.supersededBy} 替代）`
          : "Tombstone 拦截：status=deprecated 已淘汰版本",
      });
      continue;
    }
    if (chunk.tenantId !== session.tenantId) {
      blocked.push({
        chunkId: chunk.chunkId,
        docId: chunk.docId,
        reasonCode: "cross-tenant",
        reason: `ACL 拦截：跨租户 (${chunk.tenantId} != ${session.tenantId})`,
      });
      continue;
    }
    if (!chunk.allowedRoles.includes(session.role)) {
      blocked.push({
        chunkId: chunk.chunkId,
        docId: chunk.docId,
        reasonCode: "unauthorized-role",
        reason: `ACL 拦截：角色无权 (${session.role} ∉ [${chunk.allowedRoles.join(",")}])`,
      });
      continue;
    }
    authorized.push(chunk);
  }

  if (normalizedTerms.length === 0 && !options?.allowEmptyQueryBaseline) {
    return {
      grounded: false,
      refusalReason: "缺少有效检索词或授权证据不足，触发 Citation Grounding 安全拒答。",
      authorizedPoolCount: authorized.length,
      citations: [],
      blocked,
    };
  }

  // Stage 3 & Stage 4: Score only authorized active chunks & attach immutable citations
  const scored = authorized
    .map((chunk) => {
      const haystack = `${chunk.section} ${chunk.text}`.toLowerCase();
      const lexicalHits = normalizedTerms.filter((term) => haystack.includes(term)).length;
      const baseSemantic = chunk.semanticScore ?? 0;
      const score =
        normalizedTerms.length === 0
          ? baseSemantic
          : lexicalHits > 0
          ? Number((lexicalHits + baseSemantic).toFixed(4))
          : 0;
      return { chunk, lexicalHits, score };
    })
    .filter(({ lexicalHits, score }) =>
      normalizedTerms.length === 0 ? score > 0 : lexicalHits > 0 && score >= minScore
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (scored.length === 0) {
    return {
      grounded: false,
      refusalReason:
        normalizedTerms.length > 0
          ? "当前授权有效知识库中无满足阈值的证据切片，中止生成并拒答或升级 HITL。"
          : "当前身份在目标租户无有效授权切片，触发安全拒答。",
      authorizedPoolCount: authorized.length,
      citations: [],
      blocked,
    };
  }

  return {
    grounded: true,
    refusalReason: null,
    authorizedPoolCount: authorized.length,
    citations: scored.map(({ chunk, score }) => ({
      chunkId: chunk.chunkId,
      docId: chunk.docId,
      version: chunk.version,
      section: chunk.section,
      excerpt: chunk.text,
      score,
    })),
    blocked,
  };
}

export interface RuntimeEvalProbe {
  id: string;
  session: RuntimeCallerSession;
  queryTerms: string[];
  expectGrounded: boolean;
  expectedDocIds?: string[];
  forbiddenDocIds?: string[];
}

export interface RuntimeEvalReport {
  totalProbes: number;
  passedProbes: number;
  unauthorizedLeakCount: number;
  deprecatedRecallCount: number;
  refusalMismatchCount: number;
  passed: boolean;
}

export function evaluateRuntimeKbRetrieval(
  index: RuntimeChunkRecord[],
  probes: RuntimeEvalProbe[]
): RuntimeEvalReport {
  const chunkById = new Map(index.map((c) => [c.chunkId, c]));
  let passedProbes = 0;
  let unauthorizedLeakCount = 0;
  let deprecatedRecallCount = 0;
  let refusalMismatchCount = 0;

  for (const probe of probes) {
    const result = retrieveAuthorizedRuntimeChunks(index, probe.session, probe.queryTerms);
    let probeOk = true;

    for (const cit of result.citations) {
      const src = chunkById.get(cit.chunkId);
      if (!src) {
        probeOk = false;
        continue;
      }
      if (src.tenantId !== probe.session.tenantId || !src.allowedRoles.includes(probe.session.role)) {
        unauthorizedLeakCount += 1;
        probeOk = false;
      }
      if (src.status !== "active") {
        deprecatedRecallCount += 1;
        probeOk = false;
      }
      if (probe.forbiddenDocIds?.includes(cit.docId)) {
        probeOk = false;
      }
    }

    if (result.grounded !== probe.expectGrounded) {
      refusalMismatchCount += 1;
      probeOk = false;
    }

    if (probe.expectedDocIds && probe.expectedDocIds.length > 0) {
      const recalledDocIds = new Set(result.citations.map((c) => c.docId));
      for (const expectedDocId of probe.expectedDocIds) {
        if (!recalledDocIds.has(expectedDocId)) {
          probeOk = false;
        }
      }
    }

    if (probeOk) {
      passedProbes += 1;
    }
  }

  return {
    totalProbes: probes.length,
    passedProbes,
    unauthorizedLeakCount,
    deprecatedRecallCount,
    refusalMismatchCount,
    passed:
      passedProbes === probes.length &&
      unauthorizedLeakCount === 0 &&
      deprecatedRecallCount === 0 &&
      refusalMismatchCount === 0,
  };
}
