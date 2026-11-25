export type ProjectLifecycleState =
  | "draft"
  | "static_audited"
  | "submitted"
  | "ai_prereviewed"
  | "human_review"
  | "changes_requested"
  | "approved"
  | "archived";

export interface ProjectLifecycleStageMeta {
  state: ProjectLifecycleState;
  label: string;
  shortLabel: string;
  description: string;
}

export const PROJECT_LIFECYCLE_STAGES: ProjectLifecycleStageMeta[] = [
  {
    state: "draft",
    label: "1. Draft（规格草稿）",
    shortLabel: "Draft",
    description: "创建项目工作区，明确 SPEC.md 与文件白名单边界",
  },
  {
    state: "static_audited",
    label: "2. Static Audit（服务端门禁通过）",
    shortLabel: "Static Audit",
    description: "服务端确定性规则审计通过（零密钥/SQLi/测试作弊/越界路径）",
  },
  {
    state: "submitted",
    label: "3. Submitted（已提交证据）",
    shortLabel: "Submitted",
    description: "附带 SPEC、Diff、测试日志与 Eval 报告提交审校",
  },
  {
    state: "ai_prereviewed",
    label: "4. AI Pre-review（AI 预审初筛）",
    shortLabel: "AI Pre-review",
    description: "仅生成风险与修改建议草稿，不构成最终通过或技能授予",
  },
  {
    state: "human_review",
    label: "5. Human Review（人工审校中）",
    shortLabel: "Human Review",
    description: "导师或企业评审人核查边界、证据与可接管性",
  },
  {
    state: "changes_requested",
    label: "6. Changes Requested（退回修订）",
    shortLabel: "Changes Req",
    description: "未达到验收标准，按审校批注修改后重新提交",
  },
  {
    state: "approved",
    label: "7. Approved（人工批准通过）",
    shortLabel: "Approved",
    description: "导师人工确认通过并核发对应能力认证（SkillGrant）",
  },
  {
    state: "archived",
    label: "8. Evidence Archived（归档可交接）",
    shortLabel: "Archived",
    description: "生成含 Handoff 运维边界与评测日志的完整数字资产包",
  },
];

export type ModuleProgressStage =
  | "not_started"
  | "viewed"
  | "practiced"
  | "submitted"
  | "auto_verified"
  | "human_reviewed"
  | "skill_granted";

export const MODULE_STAGE_LABELS: Record<ModuleProgressStage, string> = {
  not_started: "未开始",
  viewed: "Viewed（已阅读）",
  practiced: "Practiced（已演练）",
  submitted: "Submitted（已交证据）",
  auto_verified: "Auto Verified（自动门禁通过）",
  human_reviewed: "Human Reviewed（人工审校通过）",
  skill_granted: "Skill Granted（能力认证已授）",
};

export interface StarterKitTreeNode {
  path: string;
  purpose: string;
  writable: boolean;
}

export const STANDARD_STARTER_KIT_TREE: StarterKitTreeNode[] = [
  { path: "app/", purpose: "可运行演示前端与入口路由", writable: true },
  { path: "src/", purpose: "核心业务逻辑、检索过滤与工作流实现", writable: true },
  { path: "specs/SPEC.md", purpose: "需求边界、输入输出契约、禁用项与异常回退", writable: true },
  { path: "data/", purpose: "脱敏或公开抽样数据集（严禁导入未脱敏生产隐私数据）", writable: true },
  { path: "rules/00-core-redlines.mdc", purpose: "锁定系统底线规则（密钥/鉴权/防作弊，学员不可覆盖）", writable: false },
  { path: "rules/20-project-domain.mdc", purpose: "项目特定领域约束（globs 精确隔离）", writable: true },
  { path: "tests/", purpose: "自动化验收测试（严禁删断言或加 .skip 凑绿）", writable: true },
  { path: "eval/", purpose: "固定评测集与 Recall@K / Citation / ACL 指标配置", writable: true },
  { path: "evidence/", purpose: "执行日志、Diff 摘要、静态审计与 Eval 快照", writable: true },
  { path: "handoff/HANDOFF.md", purpose: "运维、权限边界、模型成本与人工接管说明", writable: true },
];

export const GEO_EVIDENCE_LAB_DISCLAIMER =
  "边界声明：GEO Evidence Lab 仅构建公开/授权品牌信息监测、结构化语料整理、引用溯源核验、抽样评测与人工审核原型；不承诺、亦不得对外表述为“保证品牌进入 AI 推荐排名或必然提升商业转化”。";

export const FIRST_HOUR_DEFAULT_CHECKLIST: Array<{
  id: string;
  label: string;
  detail: string;
}> = [
  {
    id: "fh-1-boot",
    label: "1. 启动项目工作区并核对文件白名单",
    detail: "阅读 specs/SPEC.md 与 rules/00-core-redlines.mdc，确认允许修改的目录范围。",
  },
  {
    id: "fh-2-change",
    label: "2. 在允许目录内修改一个受控字段或规则",
    detail: "例如在 src/ 或 rules/20-project-domain.mdc 补充来源引用校验规则。",
  },
  {
    id: "fh-3-fail-test",
    label: "3. 观察一次失败校验或阻断反馈",
    detail: "触发一次未绑定权威来源或未勾选边界声明的静态审计/测试失败。",
  },
  {
    id: "fh-4-fix-pass",
    label: "4. 修复并运行确定性验证通过",
    detail: "补齐引用字段或合规边界，通过服务端静态门禁与 Eval 基线。",
  },
  {
    id: "fh-5-diff",
    label: "5. 审查改动文件清单与 Diff 摘要",
    detail: "核对变更文件是否全部位于白名单目录，确认未触碰红线配置与测试断言。",
  },
  {
    id: "fh-6-evidence",
    label: "6. 归档首小时 Evidence & Handoff 报告",
    detail: "生成含 SPEC、Diff、测试日志与边界声明的交付包，验证入门门槛。",
  },
];

export interface SubmissionHistoryStatItem {
  id: number;
  moduleId: string;
  artifactTitle: string;
  status: string;
  curriculumVersion?: string;
  updatedAt: string;
  workspaceId?: number | null;
  staticAuditPassed: boolean | null;
  hasAiPrereview: boolean;
  aiPrereviewPassed: boolean | null;
}

export interface SubmissionStatsSummary {
  totalSubmissions: number;
  completedTasks: number;
  staticAuditedCount: number;
  staticPassedCount: number;
  staticAuditComplianceRate: number | null;
  aiPrereviewedCount: number;
  aiPrereviewPassedCount: number;
  aiPrereviewSuccessRate: number | null;
}

export function calculateSubmissionStats(
  submissions: SubmissionHistoryStatItem[]
): SubmissionStatsSummary {
  const totalSubmissions = submissions.length;
  const completedTasks = submissions.filter((s) => s.status === "approved").length;

  const staticAuditedItems = submissions.filter((s) => s.staticAuditPassed !== null);
  const staticPassedCount = staticAuditedItems.filter((s) => s.staticAuditPassed === true).length;
  const staticAuditComplianceRate =
    staticAuditedItems.length > 0
      ? Math.round((staticPassedCount / staticAuditedItems.length) * 100)
      : null;

  const aiItems = submissions.filter(
    (s) => s.hasAiPrereview && s.aiPrereviewPassed !== null
  );
  const aiPrereviewPassedCount = aiItems.filter((s) => s.aiPrereviewPassed === true).length;
  const aiPrereviewSuccessRate =
    aiItems.length > 0 ? Math.round((aiPrereviewPassedCount / aiItems.length) * 100) : null;

  return {
    totalSubmissions,
    completedTasks,
    staticAuditedCount: staticAuditedItems.length,
    staticPassedCount,
    staticAuditComplianceRate,
    aiPrereviewedCount: aiItems.length,
    aiPrereviewPassedCount,
    aiPrereviewSuccessRate,
  };
}

export const PROJECT_STUDIO_VERSION = "2026.11";
export const STATIC_AUDIT_RULE_VERSION = "v2026.11-static-1";

export type VerificationModeId =
  | "static_material_check"
  | "simulated_eval"
  | "real_execution_pending_runner"
  | "human_approval";

export interface VerificationModeMeta {
  id: VerificationModeId;
  label: string;
  shortLabel: string;
  boundaryNote: string;
}

export const VERIFICATION_MODES: Record<VerificationModeId, VerificationModeMeta> = {
  static_material_check: {
    id: "static_material_check",
    label: "静态材料检查",
    shortLabel: "静态检查",
    boundaryNote:
      "服务端确定性规则审计（密钥、SQL 拼接、测试作弊、文件白名单与结构完整性），不直接执行不可信业务代码。",
  },
  simulated_eval: {
    id: "simulated_eval",
    label: "模拟评测",
    shortLabel: "模拟 Eval",
    boundaryNote:
      "基于固定脱敏评测数据集与策略探针的可复现评估，用于检验 ACL 前置过滤、Tombstone 拦截与熔断意识。",
  },
  real_execution_pending_runner: {
    id: "real_execution_pending_runner",
    label: "真实代码执行（隔离 Runner 待接入）",
    shortLabel: "实机日志（待隔离沙盒）",
    boundaryNote:
      "当前不直接在 Web/Serverless 进程中运行学员仓库代码；命令输出为学员自贴验证日志，安全隔离 Runner 将于 Stage 3 接入。",
  },
  human_approval: {
    id: "human_approval",
    label: "人工批准",
    shortLabel: "人工批准",
    boundaryNote:
      "AI 预审初筛与自动化门禁均不可代替人工授证；最终通过（Approved）与技能授予（SkillGrant）须由人类导师在审校台确认。",
  },
};

export type StudioFlowStepId =
  | "task_spec"
  | "workspace_audit"
  | "simulated_eval"
  | "tutor_diagnosis"
  | "evidence_submit"
  | "human_review_archive";

export interface StudioFlowStepStatus {
  id: StudioFlowStepId;
  indexLabel: string;
  title: string;
  verificationModeLabel: string;
  completed: boolean;
  recommendedNext: boolean;
  targetAction: "module" | "workspace" | "eval" | "tutor" | "archive";
  detail: string;
}

export function buildStudioFlowReadiness(input: {
  hasWorkspace: boolean;
  firstHourDoneCount: number;
  staticAuditPassed: boolean | null;
  hasPassedEval: boolean;
  submissionCount: number;
  lifecycleState?: ProjectLifecycleState | null;
}): {
  completedCount: number;
  totalSteps: number;
  nextStepId: StudioFlowStepId;
  steps: StudioFlowStepStatus[];
} {
  const step1Done = input.hasWorkspace && input.firstHourDoneCount >= 1;
  const step2Done = input.hasWorkspace && input.staticAuditPassed === true;
  const step3Done = input.hasPassedEval;
  const step4Done = input.firstHourDoneCount >= 3 || input.submissionCount > 0;
  const step5Done =
    input.submissionCount > 0 ||
    input.lifecycleState === "submitted" ||
    input.lifecycleState === "ai_prereviewed" ||
    input.lifecycleState === "human_review" ||
    input.lifecycleState === "approved" ||
    input.lifecycleState === "archived";
  const step6Done =
    input.lifecycleState === "approved" || input.lifecycleState === "archived";

  const rawSteps: Array<Omit<StudioFlowStepStatus, "recommendedNext">> = [
    {
      id: "task_spec",
      indexLabel: "01",
      title: "任务与模式边界",
      verificationModeLabel: "课程任务 + Starter Spec",
      completed: step1Done,
      targetAction: "module",
      detail: "先在对应模块明确系统边界、模式取舍与允许修改范围",
    },
    {
      id: "workspace_audit",
      indexLabel: "02",
      title: "静态门禁校验",
      verificationModeLabel: VERIFICATION_MODES.static_material_check.label,
      completed: step2Done,
      targetAction: "workspace",
      detail: "编辑 SPEC / Rules / Diff 并通过服务端静态材料检查",
    },
    {
      id: "simulated_eval",
      indexLabel: "03",
      title: "Eval 基准验证",
      verificationModeLabel: VERIFICATION_MODES.simulated_eval.label,
      completed: step3Done,
      targetAction: "eval",
      detail: "在固定数据集上跑通 Recall、Citation 与 ACL 零越权验证",
    },
    {
      id: "tutor_diagnosis",
      indexLabel: "04",
      title: "Tutor 引用诊断",
      verificationModeLabel: "已解锁材料只读引文",
      completed: step4Done,
      targetAction: "tutor",
      detail: "针对失败规则或坏味道向 Course Tutor 定位修复依据",
    },
    {
      id: "evidence_submit",
      indexLabel: "05",
      title: "提交证据与日志",
      verificationModeLabel: VERIFICATION_MODES.real_execution_pending_runner.shortLabel,
      completed: step5Done,
      targetAction: "workspace",
      detail: "汇总 Diff、自贴测试命令输出与 Eval ID 发起审校提交",
    },
    {
      id: "human_review_archive",
      indexLabel: "06",
      title: "人工批准与归档",
      verificationModeLabel: VERIFICATION_MODES.human_approval.label,
      completed: step6Done,
      targetAction: "archive",
      detail: "经导师人工审核批准后导出含版本追溯的 Handoff 资产包",
    },
  ];

  const firstIncomplete = rawSteps.find((s) => !s.completed);
  const nextStepId: StudioFlowStepId = firstIncomplete
    ? firstIncomplete.id
    : "human_review_archive";

  const steps: StudioFlowStepStatus[] = rawSteps.map((s) => ({
    ...s,
    recommendedNext: s.id === nextStepId && !s.completed,
  }));

  return {
    completedCount: steps.filter((s) => s.completed).length,
    totalSteps: steps.length,
    nextStepId,
    steps,
  };
}

export const EVAL_POLICY_VERSION = "eval-policy-v2026.11";

export interface IsolatedRunnerContract {
  executionStatus: "deferred_pending_isolated_runner";
  forbiddenRuntime: "vercel_serverless_function";
  networkEgress: "blocked";
  secretAccess: "blocked";
  maxRuntimeSeconds: number;
  maxMemoryMb: number;
  humanReviewRequired: true;
  summary: string;
}

export const ISOLATED_RUNNER_CONTRACT: IsolatedRunnerContract = {
  executionStatus: "deferred_pending_isolated_runner",
  forbiddenRuntime: "vercel_serverless_function",
  networkEgress: "blocked",
  secretAccess: "blocked",
  maxRuntimeSeconds: 30,
  maxMemoryMb: 512,
  humanReviewRequired: true,
  summary:
    "不可信学员代码严禁直接在 Web/Serverless 函数进程执行；当前采用静态材料检查 + 模拟 Eval + 学员自贴日志 + 人工复核证据链，后续安全 Runner 须在禁用公网、零密钥注入、30s/512MB 限额的隔离沙盒中运行。",
};

export interface TraceableEvalSummary {
  evalRunId: number;
  datasetSlug: string;
  datasetTitle: string;
  datasetVersion: string;
  evalPolicyVersion: string;
  curriculumVersion: string;
  passed: boolean;
  recallAtK: number;
  citationPrecision: number;
  aclLeakCount: number;
  staleRecallCount: number;
  refusalAccuracy: number;
  loopCircuitBreakRate: number;
  verificationMode: "simulated_eval";
  createdAt: string;
}

export interface EvidenceCompletenessCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface EvidenceTraceabilityChain {
  curriculumVersion: string;
  generatedAt: string;
  task: {
    moduleId: string;
    workspaceId: number | null;
    workspaceTitle: string | null;
    templateSlug: string | null;
  };
  staticAudit: {
    auditRunId: number | null;
    ruleVersion: string;
    passed: boolean | null;
    blockingCount: number;
    warningCount: number;
    auditedAt: string | null;
    verificationMode: "static_material_check";
  };
  eval: TraceableEvalSummary | null;
  executionAttestation: {
    hasCommandLog: boolean;
    verificationMode: "real_execution_pending_runner";
    runnerContractStatus: "deferred_pending_isolated_runner";
  };
  humanReview: {
    status: string;
    decisionRationaleProvided: boolean;
    knownLimitationsProvided: boolean;
    reviewerFeedbackCount: number;
    latestDecision: string | null;
    grantedSkillId: string | null;
    verificationMode: "human_approval";
  };
  completeness: {
    scorePct: number;
    passedCount: number;
    totalCount: number;
    checks: EvidenceCompletenessCheck[];
  };
}

export function buildEvidenceTraceabilityChain(input: {
  curriculumVersion?: string;
  moduleId: string;
  workspaceId?: number | null;
  workspaceTitle?: string | null;
  templateSlug?: string | null;
  staticAuditRunId?: number | null;
  staticAuditRuleVersion?: string;
  staticAuditPassed?: boolean | null;
  staticBlockingCount?: number;
  staticWarningCount?: number;
  staticAuditedAt?: string | null;
  evalSummary?: TraceableEvalSummary | null;
  changedFiles?: string[];
  specSnapshot?: string;
  diffSummary?: string;
  testCommandLog?: string;
  handoffSummary?: string;
  decisionRationale?: string;
  knownLimitations?: string;
  submissionStatus?: string;
  reviewerFeedbackCount?: number;
  latestReviewDecision?: string | null;
  grantedSkillId?: string | null;
}): EvidenceTraceabilityChain {
  const hasSpec = (input.specSnapshot ?? "").trim().length >= 20;
  const hasChangedFiles = (input.changedFiles ?? []).length > 0;
  const hasDiff = (input.diffSummary ?? "").trim().length >= 10;
  const staticPassed = input.staticAuditPassed === true;
  const hasCommandLog = (input.testCommandLog ?? "").trim().length >= 8;
  const hasEvalOrCommandLog = Boolean(input.evalSummary) || hasCommandLog;
  const decisionRationaleProvided = (input.decisionRationale ?? "").trim().length >= 10;
  const knownLimitationsProvided = (input.knownLimitations ?? "").trim().length >= 10;
  const hasHandoffOrDecision =
    decisionRationaleProvided ||
    knownLimitationsProvided ||
    (input.handoffSummary ?? "").trim().length >= 20;

  const checks: EvidenceCompletenessCheck[] = [
    { key: "spec_present", label: "SPEC.md 需求与边界契约", passed: hasSpec },
    { key: "changed_files_present", label: "变更文件清单 (changedFiles)", passed: hasChangedFiles },
    { key: "diff_present", label: "Git Diff 最小改动摘要", passed: hasDiff },
    { key: "static_audit_passed", label: "服务端静态材料检查通过", passed: staticPassed },
    { key: "verification_or_eval", label: "模拟 Eval 或自贴验证命令日志", passed: hasEvalOrCommandLog },
    { key: "human_handoff_notes", label: "模式选择理由 / 已知限制 / Handoff 说明", passed: hasHandoffOrDecision },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const totalCount = checks.length;
  const scorePct = Math.round((passedCount / totalCount) * 100);

  return {
    curriculumVersion: input.curriculumVersion || PROJECT_STUDIO_VERSION,
    generatedAt: new Date().toISOString(),
    task: {
      moduleId: input.moduleId,
      workspaceId: input.workspaceId ?? null,
      workspaceTitle: input.workspaceTitle ?? null,
      templateSlug: input.templateSlug ?? null,
    },
    staticAudit: {
      auditRunId: input.staticAuditRunId ?? null,
      ruleVersion: input.staticAuditRuleVersion || STATIC_AUDIT_RULE_VERSION,
      passed: input.staticAuditPassed ?? null,
      blockingCount: input.staticBlockingCount ?? 0,
      warningCount: input.staticWarningCount ?? 0,
      auditedAt: input.staticAuditedAt ?? null,
      verificationMode: "static_material_check",
    },
    eval: input.evalSummary ?? null,
    executionAttestation: {
      hasCommandLog,
      verificationMode: "real_execution_pending_runner",
      runnerContractStatus: ISOLATED_RUNNER_CONTRACT.executionStatus,
    },
    humanReview: {
      status: input.submissionStatus || "submitted",
      decisionRationaleProvided,
      knownLimitationsProvided,
      reviewerFeedbackCount: input.reviewerFeedbackCount ?? 0,
      latestDecision: input.latestReviewDecision ?? null,
      grantedSkillId: input.grantedSkillId ?? null,
      verificationMode: "human_approval",
    },
    completeness: {
      scorePct,
      passedCount,
      totalCount,
      checks,
    },
  };
}


