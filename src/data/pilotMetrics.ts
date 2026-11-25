import { buildEvidenceTraceabilityChain } from "./projectTemplatesPublic.ts";

export interface PilotTrackSummary {
  slug: string;
  label: string;
  categoryLabel: string;
  targetModuleId: string;
  workspaceCount: number;
  completedCount: number;
  submissionCount: number;
  approvedCount: number;
  evalPassRatePct: number | null;
  avgCompletenessPct: number | null;
}

export interface Stage4PilotMetricsSummary {
  timeToFirstOutput: {
    sampleCount: number;
    avgHours: number | null;
    medianHours: number | null;
  };
  evidenceCompleteness: {
    sampleCount: number;
    avgScorePct: number | null;
    fullComplianceCount: number;
    fullComplianceRatePct: number | null;
  };
  failureFixRate: {
    totalFailureEpisodes: number;
    resolvedFailureEpisodes: number;
    fixRatePct: number | null;
  };
  patternJudgmentTransfer: {
    pilotPatternSubmissionCount: number;
    pilotLearnerCount: number;
    pilotLearnersWithTransfer: number;
    transferRatePct: number | null;
    rationaleDocumentedCount: number;
    rationaleDocumentedRatePct: number | null;
  };
  reviewTurnaround: {
    sampleCount: number;
    avgHours: number | null;
    medianHours: number | null;
    pendingReviewCount: number;
  };
  pilotProjectTracks: {
    realBusiness: PilotTrackSummary;
    generalAgent: PilotTrackSummary;
  };
  iterationDecision: {
    curriculumExpansionStatus: "insufficient_data" | "keep_piloting" | "ready_to_expand";
    curriculumExpansionLabel: string;
    automationRunnerStatus: "keep_manual_and_static_first" | "ready_for_isolated_runner";
    automationRunnerLabel: string;
    summaryRationale: string;
    nextRecommendedActions: string[];
  };
}

export interface PilotMetricWorkspaceInput {
  id: number;
  userId: number;
  templateSlug: string | null;
  trackType: string | null;
  targetModuleId: string | null;
  lifecycleState: string;
  createdAt: Date | string;
}

export interface PilotMetricAuditInput {
  id: number;
  userId: number;
  workspaceId: number | null;
  moduleId: string;
  passed: boolean;
  createdAt: Date | string;
}

export interface PilotMetricEvalInput {
  id: number;
  userId: number;
  workspaceId: number | null;
  moduleId: string;
  datasetSlug: string;
  passed: boolean;
  createdAt: Date | string;
}

export interface PilotMetricSubmissionInput {
  id: number;
  userId: number;
  moduleId: string;
  status: string;
  submittedAt: Date | string;
  staticAuditJson: Record<string, unknown> | null;
  workspaceId: number | null;
  specSnapshot?: string | null;
  diffSummary?: string | null;
  testCommandLog?: string | null;
  changedFiles?: string[] | null;
  handoffSummary?: string | null;
  decisionRationale?: string | null;
  knownLimitations?: string | null;
  linkedEvalRunId?: number | null;
}

export interface PilotMetricReviewInput {
  id: number;
  submissionId: number;
  decision: string;
  createdAt: Date | string;
}

export const STAGE4_PILOT_MILESTONE_PRESETS: Array<{
  title: string;
  moduleId: string;
  offsetDays: number;
  sortOrder: number;
}> = [
  {
    title: "Pilot Gate 1 · 分层与模块边界重构（M9/M3 设计模式试点）",
    moduleId: "m9",
    offsetDays: 7,
    sortOrder: 1,
  },
  {
    title: "Pilot Gate 2 · 幂等/状态机与长程检查点自愈（M5/M8）",
    moduleId: "m5",
    offsetDays: 14,
    sortOrder: 2,
  },
  {
    title: "Pilot Gate 3 · 通用 Agent 项目：路由、熔断与 HITL 审批（M11）",
    moduleId: "m11",
    offsetDays: 24,
    sortOrder: 3,
  },
  {
    title: "Pilot Gate 4 · 真实业务项目：GEO Evidence Lab 证据归档交接（M13-Eng）",
    moduleId: "m13-eng",
    offsetDays: 38,
    sortOrder: 4,
  },
];

const PATTERN_PILOT_MODULES = new Set(["m3", "m5", "m8", "m9"]);
const CAPSTONE_TRANSFER_MODULES = new Set(["m11", "m12", "m13-eng", "m13-gov"]);

function toTimestampMs(value: Date | string): number {
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundOneDecimal(val: number): number {
  return Math.round(val * 10) / 10;
}

function computeAvgAndMedian(values: number[]): {
  sampleCount: number;
  avg: number | null;
  median: number | null;
} {
  if (values.length === 0) {
    return { sampleCount: 0, avg: null, median: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  const mid = Math.floor(sorted.length / 2);
  const medianRaw =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return {
    sampleCount: sorted.length,
    avg: roundOneDecimal(sum / sorted.length),
    median: roundOneDecimal(medianRaw),
  };
}

function countFailureRecoveryEpisodes(
  runs: Array<{ streamKey: string; passed: boolean; createdAt: Date | string }>
): { totalFailureEpisodes: number; resolvedFailureEpisodes: number } {
  const grouped = new Map<string, Array<{ passed: boolean; ts: number }>>();
  for (const run of runs) {
    const list = grouped.get(run.streamKey) ?? [];
    list.push({ passed: run.passed, ts: toTimestampMs(run.createdAt) });
    grouped.set(run.streamKey, list);
  }

  let totalFailureEpisodes = 0;
  let resolvedFailureEpisodes = 0;

  for (const list of grouped.values()) {
    list.sort((a, b) => a.ts - b.ts);
    let inFailureEpisode = false;
    for (const item of list) {
      if (!item.passed && !inFailureEpisode) {
        totalFailureEpisodes += 1;
        inFailureEpisode = true;
      } else if (item.passed && inFailureEpisode) {
        resolvedFailureEpisodes += 1;
        inFailureEpisode = false;
      }
    }
  }

  return { totalFailureEpisodes, resolvedFailureEpisodes };
}

function extractHumanNotes(sub: PilotMetricSubmissionInput): {
  decisionRationale: string;
  knownLimitations: string;
} {
  const fromJson =
    sub.staticAuditJson &&
    typeof sub.staticAuditJson.humanEvidenceNotes === "object" &&
    sub.staticAuditJson.humanEvidenceNotes
      ? (sub.staticAuditJson.humanEvidenceNotes as {
          decisionRationale?: unknown;
          knownLimitations?: unknown;
        })
      : null;

  const decisionRationale =
    typeof sub.decisionRationale === "string" && sub.decisionRationale.trim().length > 0
      ? sub.decisionRationale
      : typeof fromJson?.decisionRationale === "string"
      ? fromJson.decisionRationale
      : "";

  const knownLimitations =
    typeof sub.knownLimitations === "string" && sub.knownLimitations.trim().length > 0
      ? sub.knownLimitations
      : typeof fromJson?.knownLimitations === "string"
      ? fromJson.knownLimitations
      : "";

  return { decisionRationale, knownLimitations };
}

function computeSubmissionCompletenessPct(sub: PilotMetricSubmissionInput): number {
  const frozenChain =
    sub.staticAuditJson &&
    typeof sub.staticAuditJson.traceabilityChain === "object" &&
    sub.staticAuditJson.traceabilityChain
      ? (sub.staticAuditJson.traceabilityChain as {
          completeness?: { scorePct?: unknown };
        })
      : null;

  if (typeof frozenChain?.completeness?.scorePct === "number") {
    return frozenChain.completeness.scorePct;
  }

  const notes = extractHumanNotes(sub);
  const staticPassed =
    sub.staticAuditJson && typeof sub.staticAuditJson.passed === "boolean"
      ? sub.staticAuditJson.passed
      : null;

  const chain = buildEvidenceTraceabilityChain({
    moduleId: sub.moduleId,
    workspaceId: sub.workspaceId,
    staticAuditPassed: staticPassed,
    changedFiles: sub.changedFiles ?? [],
    specSnapshot: sub.specSnapshot ?? "",
    diffSummary: sub.diffSummary ?? "",
    testCommandLog: sub.testCommandLog ?? "",
    handoffSummary: sub.handoffSummary ?? "",
    decisionRationale: notes.decisionRationale,
    knownLimitations: notes.knownLimitations,
    evalSummary: sub.linkedEvalRunId
      ? {
          evalRunId: sub.linkedEvalRunId,
          datasetSlug: "",
          datasetTitle: "",
          datasetVersion: "",
          evalPolicyVersion: "",
          curriculumVersion: "",
          passed: true,
          recallAtK: 100,
          citationPrecision: 100,
          aclLeakCount: 0,
          staleRecallCount: 0,
          refusalAccuracy: 100,
          loopCircuitBreakRate: 100,
          verificationMode: "simulated_eval",
          createdAt: "",
        }
      : null,
    submissionStatus: sub.status,
  });

  return chain.completeness.scorePct;
}

export function computePilotMetricsSummary(input: {
  workspaces: PilotMetricWorkspaceInput[];
  audits: PilotMetricAuditInput[];
  evals: PilotMetricEvalInput[];
  submissions: PilotMetricSubmissionInput[];
  reviews: PilotMetricReviewInput[];
}): Stage4PilotMetricsSummary {
  const wsById = new Map<number, PilotMetricWorkspaceInput>(
    input.workspaces.map((ws) => [ws.id, ws])
  );

  // 1. Time to First Output (workspace creation -> earliest passed audit or linked submission)
  const firstOutputHoursList: number[] = [];
  for (const ws of input.workspaces) {
    const wsCreatedMs = toTimestampMs(ws.createdAt);
    const candidateTimes: number[] = [];
    for (const audit of input.audits) {
      if (audit.workspaceId === ws.id && audit.passed) {
        candidateTimes.push(toTimestampMs(audit.createdAt));
      }
    }
    for (const sub of input.submissions) {
      if (sub.workspaceId === ws.id) {
        candidateTimes.push(toTimestampMs(sub.submittedAt));
      }
    }
    if (candidateTimes.length > 0) {
      const earliestMs = Math.min(...candidateTimes);
      const elapsedHours = Math.max(0, (earliestMs - wsCreatedMs) / 3_600_000);
      firstOutputHoursList.push(elapsedHours);
    }
  }
  const timeStats = computeAvgAndMedian(firstOutputHoursList);

  // 2. Evidence Completeness across submissions
  const completenessScores = input.submissions.map((sub) =>
    computeSubmissionCompletenessPct(sub)
  );
  const fullComplianceCount = completenessScores.filter((s) => s >= 100).length;
  const avgCompletenessPct =
    completenessScores.length > 0
      ? Math.round(
          completenessScores.reduce((acc, s) => acc + s, 0) / completenessScores.length
        )
      : null;
  const fullComplianceRatePct =
    completenessScores.length > 0
      ? Math.round((fullComplianceCount / completenessScores.length) * 100)
      : null;

  // 3. Test / Gate Failure Fix Rate
  const episodeInputs: Array<{
    streamKey: string;
    passed: boolean;
    createdAt: Date | string;
  }> = [
    ...input.audits.map((a) => ({
      streamKey: `audit:${a.userId}:${a.workspaceId ?? a.moduleId}`,
      passed: a.passed,
      createdAt: a.createdAt,
    })),
    ...input.evals.map((e) => ({
      streamKey: `eval:${e.userId}:${e.datasetSlug}:${e.workspaceId ?? e.moduleId}`,
      passed: e.passed,
      createdAt: e.createdAt,
    })),
  ];
  const episodeResult = countFailureRecoveryEpisodes(episodeInputs);
  const fixRatePct =
    episodeResult.totalFailureEpisodes > 0
      ? Math.round(
          (episodeResult.resolvedFailureEpisodes / episodeResult.totalFailureEpisodes) * 100
        )
      : null;

  // 4. Pattern Judgment Transfer
  const pilotPatternSubmissions = input.submissions.filter((s) =>
    PATTERN_PILOT_MODULES.has(s.moduleId)
  );
  const pilotLearnerIds = new Set<number>();
  for (const s of pilotPatternSubmissions) {
    pilotLearnerIds.add(s.userId);
  }
  for (const a of input.audits) {
    if (PATTERN_PILOT_MODULES.has(a.moduleId) && a.passed) {
      pilotLearnerIds.add(a.userId);
    }
  }

  let rationaleDocumentedCount = 0;
  const transferredLearners = new Set<number>();

  for (const sub of input.submissions) {
    const notes = extractHumanNotes(sub);
    const hasRationale = notes.decisionRationale.trim().length >= 10;
    const hasLimitations = notes.knownLimitations.trim().length >= 10;
    if (hasRationale) {
      rationaleDocumentedCount += 1;
    }
    if (
      pilotLearnerIds.has(sub.userId) &&
      CAPSTONE_TRANSFER_MODULES.has(sub.moduleId) &&
      (hasRationale || hasLimitations || sub.status === "approved")
    ) {
      transferredLearners.add(sub.userId);
    }
  }

  const rationaleDocumentedRatePct =
    input.submissions.length > 0
      ? Math.round((rationaleDocumentedCount / input.submissions.length) * 100)
      : null;
  const transferRatePct =
    pilotLearnerIds.size > 0
      ? Math.round((transferredLearners.size / pilotLearnerIds.size) * 100)
      : null;

  // 5. Instructor Review Turnaround
  const earliestReviewBySubId = new Map<number, number>();
  for (const rev of input.reviews) {
    const revMs = toTimestampMs(rev.createdAt);
    const existing = earliestReviewBySubId.get(rev.submissionId);
    if (existing === undefined || revMs < existing) {
      earliestReviewBySubId.set(rev.submissionId, revMs);
    }
  }

  const turnaroundHoursList: number[] = [];
  let pendingReviewCount = 0;
  for (const sub of input.submissions) {
    const revMs = earliestReviewBySubId.get(sub.id);
    if (revMs !== undefined) {
      const subMs = toTimestampMs(sub.submittedAt);
      turnaroundHoursList.push(Math.max(0, (revMs - subMs) / 3_600_000));
    } else if (sub.status === "submitted") {
      pendingReviewCount += 1;
    }
  }
  const turnaroundStats = computeAvgAndMedian(turnaroundHoursList);

  // 6. Dual Pilot Tracks Comparison (1 Real Business + 1 General Agent)
  const buildTrackSummary = (opts: {
    slug: string;
    label: string;
    categoryLabel: string;
    targetModuleId: string;
    matchWorkspace: (ws: PilotMetricWorkspaceInput) => boolean;
    matchSubOrEval: (moduleId: string, workspaceId: number | null) => boolean;
  }): PilotTrackSummary => {
    const matchedWorkspaces = input.workspaces.filter(opts.matchWorkspace);
    const wsIds = new Set(matchedWorkspaces.map((w) => w.id));
    const completedCount = matchedWorkspaces.filter(
      (w) => w.lifecycleState === "approved" || w.lifecycleState === "archived"
    ).length;

    const matchedSubs = input.submissions.filter(
      (s) =>
        (s.workspaceId !== null && wsIds.has(s.workspaceId)) ||
        opts.matchSubOrEval(s.moduleId, s.workspaceId)
    );
    const approvedCount = matchedSubs.filter((s) => s.status === "approved").length;
    const subScores = matchedSubs.map((s) => computeSubmissionCompletenessPct(s));
    const trackAvgCompleteness =
      subScores.length > 0
        ? Math.round(subScores.reduce((acc, n) => acc + n, 0) / subScores.length)
        : null;

    const matchedEvals = input.evals.filter(
      (e) =>
        (e.workspaceId !== null && wsIds.has(e.workspaceId)) ||
        opts.matchSubOrEval(e.moduleId, e.workspaceId)
    );
    const passedEvals = matchedEvals.filter((e) => e.passed).length;
    const evalPassRatePct =
      matchedEvals.length > 0 ? Math.round((passedEvals / matchedEvals.length) * 100) : null;

    return {
      slug: opts.slug,
      label: opts.label,
      categoryLabel: opts.categoryLabel,
      targetModuleId: opts.targetModuleId,
      workspaceCount: matchedWorkspaces.length,
      completedCount,
      submissionCount: matchedSubs.length,
      approvedCount,
      evalPassRatePct,
      avgCompletenessPct: trackAvgCompleteness,
    };
  };

  const realBusiness = buildTrackSummary({
    slug: "geo-evidence-lab",
    label: "GEO Evidence Lab · 品牌公开信息监测与引用质检台",
    categoryLabel: "真实业务项目",
    targetModuleId: "m13-eng",
    matchWorkspace: (ws) =>
      ws.templateSlug === "geo-evidence-lab" || ws.trackType === "geo-evidence",
    matchSubOrEval: (moduleId, wsId) => {
      if (wsId !== null && wsById.has(wsId)) {
        const ws = wsById.get(wsId)!;
        return ws.templateSlug === "geo-evidence-lab" || ws.trackType === "geo-evidence";
      }
      return moduleId === "m13-eng";
    },
  });

  const generalAgent = buildTrackSummary({
    slug: "general-agent-orchestrator-lab",
    label: "Agent Orchestrator & HITL Lab · 通用多步 Agent 工作台",
    categoryLabel: "通用 Agent 项目",
    targetModuleId: "m11",
    matchWorkspace: (ws) =>
      ws.templateSlug === "general-agent-orchestrator-lab" || ws.trackType === "general-agent",
    matchSubOrEval: (moduleId, wsId) => {
      if (wsId !== null && wsById.has(wsId)) {
        const ws = wsById.get(wsId)!;
        return (
          ws.templateSlug === "general-agent-orchestrator-lab" ||
          ws.trackType === "general-agent"
        );
      }
      return moduleId === "m11";
    },
  });

  // 7. Data-Driven Expansion & Automation Gate
  const totalSubs = input.submissions.length;
  const approvedSubs = input.submissions.filter((s) => s.status === "approved").length;
  const approvalRatePct = totalSubs > 0 ? Math.round((approvedSubs / totalSubs) * 100) : 0;

  const blockers: string[] = [];
  if (totalSubs < 3) {
    blockers.push(`当前仅有 ${totalSubs} 份带证据提交，需至少积累 3 份小班试点提交后再决策。`);
  }
  if (realBusiness.workspaceCount === 0 || generalAgent.workspaceCount === 0) {
    blockers.push("需确保真实业务项目（GEO）与通用 Agent 项目（M11）均至少各有 1 个试点工作区运转。");
  }
  if (avgCompletenessPct !== null && avgCompletenessPct < 75) {
    blockers.push(`当前证据完整度均值 ${avgCompletenessPct}% 低于 75% 扩班基线。`);
  }
  if (fixRatePct !== null && fixRatePct < 70) {
    blockers.push(`当前测试/门禁失败修复率 ${fixRatePct}% 低于 70%，建议先强化坏味道诊断脚手架。`);
  }
  if (rationaleDocumentedRatePct !== null && rationaleDocumentedRatePct < 70) {
    blockers.push(`模式选择理由与已知限制记录率为 ${rationaleDocumentedRatePct}%（低于 70%）。`);
  }
  if (turnaroundStats.avg !== null && turnaroundStats.avg > 48) {
    blockers.push(`导师反馈平均周期为 ${turnaroundStats.avg}h，超过 48h SLA。`);
  }

  let curriculumExpansionStatus: "insufficient_data" | "keep_piloting" | "ready_to_expand";
  let curriculumExpansionLabel: string;
  let summaryRationale: string;

  if (totalSubs < 3 || (realBusiness.workspaceCount === 0 && generalAgent.workspaceCount === 0)) {
    curriculumExpansionStatus = "insufficient_data";
    curriculumExpansionLabel = "数据累积中（待完成首批小班试点采集）";
    summaryRationale =
      blockers[0] || "当前处于试点启动期，请先组织学员完成双项目工作区与首个交付循环。";
  } else if (blockers.length === 0 && approvalRatePct >= 60) {
    curriculumExpansionStatus = "ready_to_expand";
    curriculumExpansionLabel = "达到扩班阈值（可逐步扩展课程与题库）";
    summaryRationale = `小班双项目试点证据完整度 ${avgCompletenessPct ?? 0}%、模式理由记录率 ${rationaleDocumentedRatePct ?? 0}%、人工通过率 ${approvalRatePct}%，具备向更多模块复制的条件。`;
  } else {
    curriculumExpansionStatus = "keep_piloting";
    curriculumExpansionLabel = "继续小班调优（暂不盲目扩课）";
    summaryRationale =
      blockers.join(" ") || `当前人工通过率 ${approvalRatePct}% 仍需提升至 60% 以上。`;
  }

  const readyForIsolatedRunner =
    curriculumExpansionStatus === "ready_to_expand" &&
    totalSubs >= 5 &&
    (avgCompletenessPct ?? 0) >= 80 &&
    (fixRatePct === null || fixRatePct >= 75);

  const automationRunnerStatus = readyForIsolatedRunner
    ? "ready_for_isolated_runner"
    : "keep_manual_and_static_first";
  const automationRunnerLabel = readyForIsolatedRunner
    ? "可立项接入隔离 Runner 沙盒"
    : "维持「静态检查 + 模拟 Eval + 人工复核」，暂缓重型 Runner";

  const nextRecommendedActions: string[] =
    blockers.length > 0
      ? blockers
      : [
          "保持 90 分钟工程现场课节奏，将优秀学员的 Diff 与模式取舍沉淀为反例教材。",
          readyForIsolatedRunner
            ? "试点证据链路已稳定，可按隔离契约（无公网/无密钥/30s 超时）分批接入真实执行 Runner。"
            : "继续积累至 5+ 完整证据交付与 80%+ 完整度后，再启动隔离 Runner 投入。",
        ];

  return {
    timeToFirstOutput: {
      sampleCount: timeStats.sampleCount,
      avgHours: timeStats.avg,
      medianHours: timeStats.median,
    },
    evidenceCompleteness: {
      sampleCount: completenessScores.length,
      avgScorePct: avgCompletenessPct,
      fullComplianceCount,
      fullComplianceRatePct,
    },
    failureFixRate: {
      totalFailureEpisodes: episodeResult.totalFailureEpisodes,
      resolvedFailureEpisodes: episodeResult.resolvedFailureEpisodes,
      fixRatePct,
    },
    patternJudgmentTransfer: {
      pilotPatternSubmissionCount: pilotPatternSubmissions.length,
      pilotLearnerCount: pilotLearnerIds.size,
      pilotLearnersWithTransfer: transferredLearners.size,
      transferRatePct,
      rationaleDocumentedCount,
      rationaleDocumentedRatePct,
    },
    reviewTurnaround: {
      sampleCount: turnaroundStats.sampleCount,
      avgHours: turnaroundStats.avg,
      medianHours: turnaroundStats.median,
      pendingReviewCount,
    },
    pilotProjectTracks: {
      realBusiness,
      generalAgent,
    },
    iterationDecision: {
      curriculumExpansionStatus,
      curriculumExpansionLabel,
      automationRunnerStatus,
      automationRunnerLabel,
      summaryRationale,
      nextRecommendedActions,
    },
  };
}
