import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Cpu,
  Download,
  FileCode2,
  FlaskConical,
  FolderGit2,
  Lock,
  Play,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { COURSE_MODULES } from "@/data/courseCurriculum";
import {
  buildStudioFlowReadiness,
  calculateSubmissionStats,
  EVAL_POLICY_VERSION,
  FIRST_HOUR_DEFAULT_CHECKLIST,
  GEO_EVIDENCE_LAB_DISCLAIMER,
  ISOLATED_RUNNER_CONTRACT,
  PROJECT_LIFECYCLE_STAGES,
  PROJECT_STUDIO_VERSION,
  STANDARD_STARTER_KIT_TREE,
  STATIC_AUDIT_RULE_VERSION,
  VERIFICATION_MODES,
  type StudioFlowStepStatus,
  type SubmissionHistoryStatItem,
} from "@/data/projectTemplatesPublic";
import {
  ApiError,
  askTutorApi,
  createProjectWorkspaceApi,
  fetchEvalRunsApi,
  fetchExamSessionsApi,
  fetchProjectArchiveApi,
  fetchProjectTemplatesApi,
  fetchProjectWorkspacesApi,
  runEvalSuiteApi,
  runServerStaticAuditApi,
  startExamSessionApi,
  submitCohortWork,
  submitExamAnswerApi,
  updateProjectWorkspaceApi,
  type EvalRunRecord,
  type EvalSuiteReport,
  type ExamQuestionPrompt,
  type ExamSessionRecord,
  type ProjectTemplateRecord,
  type ProjectWorkspaceRecord,
  type StaticAuditResultPayload,
  type TutorAskResponse,
} from "@/lib/apiClient";

export type ProjectHubTab = "workspace" | "eval" | "tutor" | "exam";

interface ProjectWorkspacePanelProps {
  initialTab?: ProjectHubTab;
  initialModuleId?: string;
  navSeq?: number;
  onOpenBilling?: () => void;
  onOpenModule: (moduleId: string, unitId?: string) => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string }) => void;
}

function downloadMarkdown(filename: string, markdown: string) {
  try {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    void navigator.clipboard?.writeText(markdown);
  }
}

export default function ProjectWorkspacePanel({
  initialTab = "workspace",
  initialModuleId,
  navSeq = 0,
  onOpenBilling,
  onOpenModule,
  onSwitchToReveal,
}: ProjectWorkspacePanelProps) {
  const { session } = useAuth();
  const hasPaidAccess = Boolean(session?.hasPaidAccess);
  const [activeTab, setActiveTab] = useState<ProjectHubTab>(initialTab);

  // Templates & Workspaces state
  const [curriculumVersion, setCurriculumVersion] = useState<string>(PROJECT_STUDIO_VERSION);
  const [staticAuditRuleVersion, setStaticAuditRuleVersion] = useState<string>(
    STATIC_AUDIT_RULE_VERSION
  );
  const [templates, setTemplates] = useState<ProjectTemplateRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<ProjectWorkspaceRecord[]>([]);
  const [submissionsHistory, setSubmissionsHistory] = useState<SubmissionHistoryStatItem[]>([]);
  const [selectedWsId, setSelectedWsId] = useState<number | null>(null);
  const [loadingWs, setLoadingWs] = useState(false);

  // Create workspace form
  const [createSlug, setCreateSlug] = useState<string>("geo-evidence-lab");
  const [createTitle, setCreateTitle] = useState<string>("");
  const [createRepoUrl, setCreateRepoUrl] = useState<string>("");
  const [creatingWs, setCreatingWs] = useState(false);

  // Editable workspace fields
  const [wsTitle, setWsTitle] = useState("");
  const [wsRepoUrl, setWsRepoUrl] = useState("");
  const [wsSpec, setWsSpec] = useState("");
  const [wsRules, setWsRules] = useState("");
  const [wsHandoff, setWsHandoff] = useState("");
  const [firstHourChecked, setFirstHourChecked] = useState<string[]>([]);
  const [changedFilesInput, setChangedFilesInput] = useState(
    "src/sourceRegistry.ts, specs/SPEC.md, handoff/HANDOFF.md"
  );
  const [diffSummaryInput, setDiffSummaryInput] = useState(
    "+ 补充公开来源引用 URL 与版本日期字段校验\n+ 增加未证实结论自动标记待人工复核逻辑"
  );
  const [testCommandLogInput, setTestCommandLogInput] = useState(
    "npx tsc --noEmit -> 0 errors\nnpm test -> 31 passed\n静态规则门禁 -> 待验证"
  );
  const [decisionRationaleInput, setDecisionRationaleInput] = useState("");
  const [knownLimitationsInput, setKnownLimitationsInput] = useState("");
  const [artifactTitleInput, setArtifactTitleInput] = useState("");

  const [wsSaving, setWsSaving] = useState(false);
  const [auditRunning, setAuditRunning] = useState(false);
  const [submittingWork, setSubmittingWork] = useState(false);
  const [latestAudit, setLatestAudit] = useState<StaticAuditResultPayload | null>(null);
  const [wsMessage, setWsMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Eval Workbench state
  const [evalSlug, setEvalSlug] = useState<
    "geo-evidence-eval-v1" | "runtime-kb-acl-eval-v1" | "general-agent-workflow-eval-v1"
  >("geo-evidence-eval-v1");
  const [simBrokenAcl, setSimBrokenAcl] = useState(false);
  const [simStaleLeak, setSimStaleLeak] = useState(false);
  const [evalRuns, setEvalRuns] = useState<EvalRunRecord[]>([]);
  const [activeEvalReport, setActiveEvalReport] = useState<EvalSuiteReport | null>(null);
  const [runningEval, setRunningEval] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Tutor state
  const [tutorModuleId, setTutorModuleId] = useState<string>(initialModuleId || "");
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorAsking, setTutorAsking] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<TutorAskResponse | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);

  // Exam state
  const [examModuleId, setExamModuleId] = useState<string>(initialModuleId || "m1");
  const [examSessions, setExamSessions] = useState<ExamSessionRecord[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialModuleId) {
      setTutorModuleId(initialModuleId);
      setExamModuleId(initialModuleId);
    }
  }, [initialTab, initialModuleId, navSeq]);
  const [activeExam, setActiveExam] = useState<{
    session: ExamSessionRecord;
    moduleTitle: string;
    totalCount: number;
    currentQuestion: ExamQuestionPrompt | null;
  } | null>(null);
  const [examSelectedIdx, setExamSelectedIdx] = useState<number | null>(null);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examStepFeedback, setExamStepFeedback] = useState<{
    questionId: string;
    topic: string;
    isCorrect: boolean;
    correctIndex: number;
    explanation: string;
    remediationAction: string;
  } | null>(null);
  const [examRemediationPlan, setExamRemediationPlan] = useState<
    Array<{ topic: string; recommendation: string }>
  >([]);
  const [examError, setExamError] = useState<string | null>(null);

  const applyWorkspaceToEditor = useCallback((ws: ProjectWorkspaceRecord | undefined) => {
    if (!ws) return;
    setWsTitle(ws.title);
    setWsRepoUrl(ws.repoUrl || "");
    setWsSpec(ws.specMarkdown || "");
    setWsRules(ws.rulesMarkdown || "");
    setWsHandoff(ws.handoffMarkdown || "");
    setFirstHourChecked(ws.firstHourCheckedJson || []);
    setArtifactTitleInput(`${ws.title} · 阶段验证交付`);
    if (ws.latestAudit) {
      setLatestAudit({
        passed: ws.latestAudit.passed,
        blockingCount: ws.latestAudit.blockingCount,
        warningCount: ws.latestAudit.warningCount,
        findings: ws.latestAudit.findingsJson || [],
        changedFiles: ws.latestAudit.changedFilesJson || [],
        auditedAt: ws.latestAudit.createdAt,
      });
    } else {
      setLatestAudit(null);
    }
  }, []);

  const loadWorkspaceData = useCallback(async () => {
    setLoadingWs(true);
    try {
      if (!session) {
        const res = await fetchProjectTemplatesApi();
        setTemplates(res.templates);
        setWorkspaces([]);
        setSubmissionsHistory([]);
        return;
      }
      const [wsData, evData, exData] = await Promise.all([
        fetchProjectWorkspacesApi(),
        fetchEvalRunsApi().catch(() => ({ ok: true as const, runs: [] })),
        fetchExamSessionsApi().catch(() => ({ ok: true as const, sessions: [] })),
      ]);
      setTemplates(wsData.templates);
      setWorkspaces(wsData.workspaces);
      setSubmissionsHistory(wsData.submissions ?? []);
      if (wsData.curriculumVersion) setCurriculumVersion(wsData.curriculumVersion);
      if (wsData.staticAuditRuleVersion) {
        setStaticAuditRuleVersion(wsData.staticAuditRuleVersion);
      }
      setEvalRuns(evData.runs);
      setExamSessions(exData.sessions);

      const current =
        wsData.workspaces.find((w) => w.id === selectedWsId) || wsData.workspaces[0];
      if (current) {
        setSelectedWsId(current.id);
        applyWorkspaceToEditor(current);
      }
    } catch {
      // Keep graceful UI if server fetch fails
    } finally {
      setLoadingWs(false);
    }
  }, [session, selectedWsId, applyWorkspaceToEditor]);

  useEffect(() => {
    void loadWorkspaceData();
  }, [loadWorkspaceData]);

  const activeWorkspace = workspaces.find((w) => w.id === selectedWsId) || workspaces[0];
  const activeTemplate =
    activeWorkspace?.template ||
    templates.find((t) => t.slug === createSlug) ||
    templates[0];

  const parseChangedFiles = () =>
    changedFilesInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      window.dispatchEvent(new CustomEvent("app:open-login"));
      return;
    }
    setCreatingWs(true);
    setWsMessage(null);
    try {
      const res = await createProjectWorkspaceApi({
        templateSlug: createSlug,
        title: createTitle.trim() || undefined,
        repoUrl: createRepoUrl.trim() || undefined,
        cohortId: session.cohorts[0]?.id ?? null,
      });
      setCreateTitle("");
      setCreateRepoUrl("");
      setSelectedWsId(res.workspace.id);
      setWsMessage({
        ok: true,
        text: `已创建项目工作区「${res.workspace.title}」，请先完成首小时 6 步核验。`,
      });
      await loadWorkspaceData();
    } catch (err) {
      setWsMessage({
        ok: false,
        text: err instanceof Error ? err.message : "创建项目工作区失败。",
      });
    } finally {
      setCreatingWs(false);
    }
  };

  const handleSaveWorkspace = async (markArchived = false) => {
    if (!activeWorkspace) return;
    setWsSaving(true);
    setWsMessage(null);
    try {
      await updateProjectWorkspaceApi(activeWorkspace.id, {
        title: wsTitle,
        repoUrl: wsRepoUrl,
        specMarkdown: wsSpec,
        rulesMarkdown: wsRules,
        handoffMarkdown: wsHandoff,
        firstHourChecked,
        markArchived,
      });
      setWsMessage({
        ok: true,
        text: markArchived
          ? "已标记为 Archived（证据已归档可交接）。"
          : "已保存 SPEC / Rules / Handoff 与首小时清单到云端工作区。",
      });
      await loadWorkspaceData();
    } catch (err) {
      setWsMessage({
        ok: false,
        text: err instanceof Error ? err.message : "保存项目工作区失败。",
      });
    } finally {
      setWsSaving(false);
    }
  };

  const handleToggleFirstHour = (stepId: string) => {
    const next = firstHourChecked.includes(stepId)
      ? firstHourChecked.filter((id) => id !== stepId)
      : [...firstHourChecked, stepId];
    setFirstHourChecked(next);
    if (activeWorkspace) {
      void updateProjectWorkspaceApi(activeWorkspace.id, {
        firstHourChecked: next,
      });
    }
  };

  const handleRunStaticAudit = async () => {
    if (!session) {
      window.dispatchEvent(new CustomEvent("app:open-login"));
      return;
    }
    setAuditRunning(true);
    setWsMessage(null);
    try {
      const targetMod = activeTemplate?.targetModuleId || "m13-eng";
      const res = await runServerStaticAuditApi({
        workspaceId: activeWorkspace?.id ?? null,
        moduleId: targetMod,
        codeOrArtifactText: `${wsSpec}\n${diffSummaryInput}`,
        specText: wsSpec,
        rulesText: wsRules,
        diffSummary: diffSummaryInput,
        testCommandLog: testCommandLogInput,
        changedFiles: parseChangedFiles(),
        allowedGlobs: activeTemplate?.allowedGlobsJson,
        blockedPaths: activeTemplate?.blockedPathsJson,
        requireProjectStructure: true,
      });
      setLatestAudit(res.audit);
      setWsMessage({
        ok: res.audit.passed,
        text: res.audit.passed
          ? `服务端静态门禁通过（0 阻塞项 · ${res.audit.warningCount} 警告）。`
          : `服务端静态门禁拦截：发现 ${res.audit.blockingCount} 项高危违规，请修复后再提交。`,
      });
      await loadWorkspaceData();
    } catch (err) {
      setWsMessage({
        ok: false,
        text: err instanceof Error ? err.message : "运行服务端静态审计失败。",
      });
    } finally {
      setAuditRunning(false);
    }
  };

  const handleSubmitWorkspaceArtifact = async () => {
    if (!session) {
      window.dispatchEvent(new CustomEvent("app:open-login"));
      return;
    }
    if (!activeWorkspace) return;
    setSubmittingWork(true);
    setWsMessage(null);
    try {
      const targetMod = activeTemplate?.targetModuleId || "m13-eng";
      const linkedEval = activeWorkspace.latestEval || evalRuns[0];
      await submitCohortWork({
        cohortId: activeWorkspace.cohortId ?? session.cohorts[0]?.id ?? null,
        moduleId: targetMod,
        artifactTitle: artifactTitleInput.trim() || `${wsTitle} · 工程原型交付`,
        artifactText: [
          `# ${wsTitle}`,
          `## SPEC 摘要\n${wsSpec.slice(0, 1500)}`,
          `## Diff 摘要\n${diffSummaryInput}`,
          `## 验证命令输出\n${testCommandLogInput}`,
        ].join("\n\n"),
        artifactUrl: wsRepoUrl.trim() || null,
        workspaceId: activeWorkspace.id,
        specSnapshot: wsSpec,
        rulesSnapshot: wsRules,
        changedFiles: parseChangedFiles(),
        diffSummary: diffSummaryInput,
        testCommandLog: testCommandLogInput,
        handoffSummary: wsHandoff,
        decisionRationale: decisionRationaleInput,
        knownLimitations: knownLimitationsInput,
        evalRunId: linkedEval?.id ?? null,
      });
      setWsMessage({
        ok: true,
        text: "已通过服务端静态门禁并提交结构化工程证据！状态已更新为 Submitted，等待导师审校。",
      });
      await loadWorkspaceData();
    } catch (err) {
      if (err instanceof ApiError && err.audit) {
        setLatestAudit(err.audit);
      }
      setWsMessage({
        ok: false,
        text: err instanceof Error ? err.message : "提交项目作业失败。",
      });
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleExportHandoffArchive = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchProjectArchiveApi(activeWorkspace.id);
      downloadMarkdown(res.filename, res.markdown);
      setWsMessage({
        ok: true,
        text: `已导出完整项目资产包 ${res.filename}（含 SPEC / Rules / 审计 / Eval / Handoff）。`,
      });
    } catch (err) {
      setWsMessage({
        ok: false,
        text: err instanceof Error ? err.message : "导出 Handoff 归档失败。",
      });
    }
  };

  const handleLoadViolatingDemo = () => {
    setChangedFilesInput("rules/00-core-redlines.mdc, .env.local, src/sourceRegistry.ts");
    setDiffSummaryInput(
      '+ const apiKey = "sk-demo1234567890abcdef1234";\n+ test.skip("should validate URL", () => {});'
    );
    setWsMessage({
      ok: false,
      text: "已填入故意违规的演练 Diff（触碰禁改规则与明文 Key），请点击「运行服务端静态门禁」体验 HTTP 422 阻断，然后点击「修复并恢复合规 Diff」修复验证。",
    });
  };

  const handleRestoreCleanDemo = () => {
    setChangedFilesInput("src/sourceRegistry.ts, specs/SPEC.md, handoff/HANDOFF.md");
    setDiffSummaryInput(
      "+ 补充公开来源引用 URL 与版本日期字段校验\n+ 增加未证实结论自动标记待人工复核逻辑"
    );
    setTestCommandLogInput(
      "npx tsc --noEmit -> 0 errors\nnpm test -> passed\n静态规则门禁 -> 待验证"
    );
    setWsMessage({
      ok: true,
      text: "已恢复合规目录白名单与干净 Diff，请重新点击「运行服务端静态门禁」完成红转绿验证。",
    });
  };

  const handleExportFirstHourEvidence = () => {
    const projectLabel = wsTitle || activeTemplate?.title || "Coding Everything Starter Kit";
    const stepsText = FIRST_HOUR_DEFAULT_CHECKLIST.map((step, idx) => {
      const done = firstHourChecked.includes(step.id);
      return `- [${done ? "x" : " "}] 0${idx + 1}. ${step.label} — ${step.detail}`;
    }).join("\n");

    const auditSummary = latestAudit
      ? `- 服务端静态审计：${latestAudit.passed ? "PASSED" : "BLOCKED"}（阻塞 ${latestAudit.blockingCount} · 警告 ${latestAudit.warningCount}）`
      : "- 服务端静态审计：尚未执行";

    const reportMd = [
      `# evidence/first-hour-report.md · Coding Everything 项目学院`,
      ``,
      `- 项目工作区：${projectLabel}`,
      `- 模板标识：${activeTemplate?.slug || "starter-kit"}`,
      `- 生成时间：${new Date().toISOString()}`,
      `- 第一小时完成度：${firstHourChecked.length}/${FIRST_HOUR_DEFAULT_CHECKLIST.length}`,
      ``,
      `## 1. 第一小时最小闭环检查清单`,
      stepsText,
      ``,
      `## 2. 变更文件范围与 Git Diff 摘要`,
      `- Changed Files: ${parseChangedFiles().join(", ") || "未填写"}`,
      ``,
      "```diff",
      diffSummaryInput || "(暂无 Diff)",
      "```",
      ``,
      `## 3. 验证命令输出与服务端静态门禁`,
      auditSummary,
      ``,
      "```text",
      testCommandLogInput || "(暂无命令输出)",
      "```",
      ``,
    ].join("\n");

    const filename = `first-hour-evidence-${activeWorkspace?.id ?? "preview"}-${new Date()
      .toISOString()
      .slice(0, 10)}.md`;
    downloadMarkdown(filename, reportMd);
    setWsMessage({
      ok: true,
      text: `已导出首小时验证报告 ${filename}。`,
    });
  };

  const handleRunEvalSuite = async () => {
    if (!session) {
      window.dispatchEvent(new CustomEvent("app:open-login"));
      return;
    }
    setRunningEval(true);
    setEvalError(null);
    try {
      const res = await runEvalSuiteApi({
        workspaceId: activeWorkspace?.id ?? null,
        datasetSlug: evalSlug,
        specMarkdown: wsSpec,
        rulesMarkdown: wsRules,
        testCommandLog: testCommandLogInput,
        simulateBrokenAcl: simBrokenAcl,
        simulateStaleLeak: simStaleLeak,
      });
      setActiveEvalReport(res.report);
      await loadWorkspaceData();
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : "执行 Eval 评测失败。");
    } finally {
      setRunningEval(false);
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim()) return;
    setTutorAsking(true);
    setTutorError(null);
    try {
      const res = await askTutorApi({
        question: tutorQuestion,
        moduleId: tutorModuleId || undefined,
        requestId: `tutor-${Date.now()}`,
      });
      setTutorResponse(res);
    } catch (err) {
      setTutorError(err instanceof Error ? err.message : "Tutor 请求失败。");
    } finally {
      setTutorAsking(false);
    }
  };

  const handleStartExam = async () => {
    if (!session) {
      window.dispatchEvent(new CustomEvent("app:open-login"));
      return;
    }
    setExamError(null);
    setExamStepFeedback(null);
    setExamRemediationPlan([]);
    setExamSelectedIdx(null);
    try {
      const res = await startExamSessionApi(examModuleId);
      setActiveExam({
        session: res.session,
        moduleTitle: res.moduleTitle,
        totalCount: res.totalCount,
        currentQuestion: res.currentQuestion,
      });
    } catch (err) {
      setExamError(err instanceof Error ? err.message : "开启 Exam 失败。");
    }
  };

  const handleSubmitExamStep = async () => {
    if (!activeExam?.currentQuestion || examSelectedIdx === null) return;
    setExamSubmitting(true);
    setExamError(null);
    try {
      const res = await submitExamAnswerApi(activeExam.session.id, {
        questionId: activeExam.currentQuestion.id,
        selectedIndex: examSelectedIdx,
      });
      setExamStepFeedback(res.stepFeedback);
      setExamSelectedIdx(null);
      setExamRemediationPlan(res.remediationPlan || []);
      setActiveExam({
        ...activeExam,
        session: res.session,
        currentQuestion: res.nextQuestion,
      });
      if (res.session.status === "completed") {
        await loadWorkspaceData();
      }
    } catch (err) {
      setExamError(err instanceof Error ? err.message : "提交单题答案失败。");
    } finally {
      setExamSubmitting(false);
    }
  };

  const submissionStats = useMemo(
    () => calculateSubmissionStats(submissionsHistory),
    [submissionsHistory]
  );

  const currentLifecycleIndex = activeWorkspace
    ? PROJECT_LIFECYCLE_STAGES.findIndex((s) => s.state === activeWorkspace.lifecycleState)
    : 0;

  const activeTargetModuleId = activeTemplate?.targetModuleId || initialModuleId || "m13-eng";

  const studioFlow = useMemo(
    () =>
      buildStudioFlowReadiness({
        hasWorkspace: Boolean(activeWorkspace),
        firstHourDoneCount: firstHourChecked.length,
        staticAuditPassed: latestAudit ? latestAudit.passed : null,
        hasPassedEval: evalRuns.some((r) => r.passed),
        submissionCount: activeWorkspace?.submissionCount ?? submissionsHistory.length,
        lifecycleState: activeWorkspace?.lifecycleState ?? null,
      }),
    [
      activeWorkspace,
      firstHourChecked.length,
      latestAudit,
      evalRuns,
      submissionsHistory.length,
    ]
  );

  const handleAskTutorFromContext = (questionText: string, modId?: string) => {
    const resolvedModId = modId || activeTargetModuleId || "";
    const unlockedSet = new Set(["m1", ...(session?.unlockedModuleIds ?? [])]);
    setTutorModuleId(hasPaidAccess || unlockedSet.has(resolvedModId) ? resolvedModId : "");
    setTutorQuestion(questionText);
    setTutorError(null);
    setTutorResponse(null);
    setActiveTab("tutor");
  };

  const handleStudioStepClick = (step: StudioFlowStepStatus) => {
    if (step.targetAction === "module") {
      onOpenModule(activeTargetModuleId);
      return;
    }
    if (step.targetAction === "archive") {
      setActiveTab("workspace");
      if (activeWorkspace) {
        void handleExportHandoffArchive();
      }
      return;
    }
    if (step.targetAction === "tutor") {
      const unlockedSet = new Set(["m1", ...(session?.unlockedModuleIds ?? [])]);
      if (!tutorModuleId && (hasPaidAccess || unlockedSet.has(activeTargetModuleId))) {
        setTutorModuleId(activeTargetModuleId);
      }
    }
    setActiveTab(step.targetAction);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-xs">
      {/* Header Strip */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-slate-300 tabular-nums">
              <span className="text-gemini-cyan font-semibold">
                CODING EVERYTHING · PROJECT STUDIO
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>课程版本 {curriculumVersion}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>静态规则 {staticAuditRuleVersion}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Eval 策略 {EVAL_POLICY_VERSION}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-purple-200">
                关联模块 {activeTargetModuleId.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Coding Everything Project Studio（任务 · 工作区 · 评测 · 归档）
            </h1>
            <p className="text-slate-300 max-w-4xl leading-relaxed">
              真实任务 → Spec 与边界 → AI 协作实现 → 静态材料检查 &amp; 模拟 Eval → Course Tutor 引文诊断 → 人工批准与 Handoff 归档。首推标杆项目为企二代授权真实问题原型{" "}
              <strong>GEO Evidence Lab</strong>。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenModule(activeTargetModuleId)}
              className="px-3.5 py-2 rounded-xl border border-gemini-cyan/40 bg-gemini-cyan/10 hover:bg-gemini-cyan/20 text-gemini-cyan font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>打开 {activeTargetModuleId.toUpperCase()} 任务与模式卡</span>
            </button>
            {!hasPaidAccess && session && (
              <button
                type="button"
                onClick={() => onOpenBilling?.()}
                className="px-4 py-2 rounded-xl bg-gemini-purple text-white font-semibold cursor-pointer whitespace-nowrap shrink-0"
              >
                开通全部模块与 Eval 评测权限
              </button>
            )}
          </div>
        </div>

        {/* Submissions History Summary Stats Widget */}
        <dl
          aria-label="Submissions history summary stats"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 tabular-nums"
        >
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <dt className="text-[11px] font-mono text-slate-400">
                Completed Tasks · 已完成任务
              </dt>
              <dd className="text-2xl font-bold font-mono text-white">
                {submissionStats.completedTasks}
              </dd>
              <div className="text-[11px] text-slate-400">
                {!session
                  ? "登录后自动统计历史提交记录"
                  : submissionStats.totalSubmissions > 0
                  ? `共 ${submissionStats.totalSubmissions} 次历史提交已进入流程`
                  : "暂无历史提交记录"}
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <dt className="text-[11px] font-mono text-slate-400">
                Static Audit Compliance Rate · 静态门禁合规率
              </dt>
              <dd className="text-2xl font-bold font-mono text-gemini-cyan">
                {submissionStats.staticAuditComplianceRate !== null
                  ? `${submissionStats.staticAuditComplianceRate}%`
                  : "—"}
              </dd>
              <div className="text-[11px] text-slate-400">
                {submissionStats.staticAuditedCount > 0
                  ? `${submissionStats.staticPassedCount}/${submissionStats.staticAuditedCount} 次提交通过静态门禁`
                  : "尚无关联静态门禁的历史提交"}
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-gemini-cyan shrink-0 mt-0.5" />
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <dt className="text-[11px] font-mono text-slate-400">
                AI Pre-Review Success Rate · AI 预审通过率
              </dt>
              <dd className="text-2xl font-bold font-mono text-purple-200">
                {submissionStats.aiPrereviewSuccessRate !== null
                  ? `${submissionStats.aiPrereviewSuccessRate}%`
                  : "—"}
              </dd>
              <div className="text-[11px] text-slate-400">
                {submissionStats.aiPrereviewedCount > 0
                  ? `${submissionStats.aiPrereviewPassedCount}/${submissionStats.aiPrereviewedCount} 次预审初筛达标`
                  : "尚无已完成 AI 预审的历史提交"}
              </div>
            </div>
            <Bot className="w-4 h-4 text-gemini-purple shrink-0 mt-0.5" />
          </div>
        </dl>

        {/* Continuous 6-Step Project Studio Flow */}
        <div className="pt-3 border-t border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-semibold text-white inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>Project Studio 连续交付闭环（点击任意环节直达）</span>
            </div>
            <span className="font-mono text-[11px] text-slate-300 tabular-nums">
              就绪度 {studioFlow.completedCount}/{studioFlow.totalSteps}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            {studioFlow.steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStudioStepClick(step)}
                title={step.detail}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer space-y-1 ${
                  step.completed
                    ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                    : step.recommendedNext
                    ? "border-gemini-cyan/55 bg-gemini-cyan/10 text-white"
                    : "border-white/10 bg-black/35 text-slate-300 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-1 font-mono text-[10px] tabular-nums">
                  <span className="text-gemini-cyan font-semibold">{step.indexLabel}</span>
                  <span className="inline-flex items-center gap-1">
                    {step.completed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        <span className="text-emerald-300">已达标</span>
                      </>
                    ) : step.recommendedNext ? (
                      <>
                        <ArrowRight className="w-3 h-3 text-gemini-cyan" />
                        <span className="text-gemini-cyan">建议下一步</span>
                      </>
                    ) : (
                      <span className="text-slate-400">待推进</span>
                    )}
                  </span>
                </div>
                <div className="font-semibold text-[11px] text-white truncate">
                  {step.title}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {step.verificationModeLabel}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explicit 4-Mode Verification Honesty Legend */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="font-mono text-[11px] text-slate-400">
            四类验证口径边界声明（严格区分静态检查 / 模拟评测 / 隔离沙盒待接入 / 人工批准）
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
              <div className="font-semibold text-gemini-cyan inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{VERIFICATION_MODES.static_material_check.label}</span>
              </div>
              <div className="text-slate-400 leading-relaxed">
                {VERIFICATION_MODES.static_material_check.boundaryNote}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
              <div className="font-semibold text-purple-200 inline-flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 shrink-0 text-gemini-purple" />
                <span>{VERIFICATION_MODES.simulated_eval.label}</span>
              </div>
              <div className="text-slate-400 leading-relaxed">
                {VERIFICATION_MODES.simulated_eval.boundaryNote}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
              <div className="font-semibold text-amber-200 inline-flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>{VERIFICATION_MODES.real_execution_pending_runner.shortLabel}</span>
              </div>
              <div className="text-slate-400 leading-relaxed">
                {VERIFICATION_MODES.real_execution_pending_runner.boundaryNote}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
              <div className="font-semibold text-emerald-200 inline-flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                <span>{VERIFICATION_MODES.human_approval.label}</span>
              </div>
              <div className="text-slate-400 leading-relaxed">
                {VERIFICATION_MODES.human_approval.boundaryNote}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Internal Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {(
            [
              { id: "workspace", label: "工作区与静态门禁", icon: FolderGit2 },
              { id: "eval", label: "模拟 Eval 评测台", icon: FlaskConical },
              { id: "tutor", label: "Course Tutor（只读引文）", icon: Bot },
              { id: "exam", label: "分步认证 Exam", icon: ClipboardCheck },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? "bg-gemini-cyan text-slate-950 font-semibold"
                    : "bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* TAB 1: WORKSPACE & STARTER KIT */}
      {activeTab === "workspace" && (
        <div className="space-y-5">
          {/* GEO Compliance Banner */}
          <div className="p-3.5 rounded-xl border border-amber-400/35 bg-amber-500/10 text-amber-100 leading-relaxed">
            {GEO_EVIDENCE_LAB_DISCLAIMER}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Starter Kits + Existing Workspaces + Directory Contract */}
            <div className="lg:col-span-4 space-y-4">
              {/* Create New Workspace */}
              <form
                onSubmit={handleCreateWorkspace}
                className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3"
              >
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-gemini-cyan" />
                  <span>从标准 Starter Kit 创建项目工作区</span>
                </div>

                <div className="space-y-2">
                  {templates.map((tpl) => {
                    const picked = createSlug === tpl.slug;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setCreateSlug(tpl.slug)}
                        className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-colors space-y-1 ${
                          picked
                            ? "border-gemini-cyan bg-gemini-cyan/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{tpl.title}</span>
                          <span className="font-mono text-[10px] text-gemini-cyan">
                            {tpl.targetModuleId.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 leading-relaxed">
                          {tpl.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="自定义项目名称（选填，例如：XX品牌 GEO 监测原型）"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                />
                <input
                  type="url"
                  value={createRepoUrl}
                  onChange={(e) => setCreateRepoUrl(e.target.value)}
                  placeholder="绑定仓库/PR 链接 https://...（选填）"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                />
                <button
                  type="submit"
                  disabled={creatingWs}
                  className="w-full py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {!session
                    ? "登录后创建个人项目工作区"
                    : creatingWs
                    ? "创建中..."
                    : "初始化项目工作区"}
                </button>
              </form>

              {/* Existing User Workspaces */}
              {session && (
                <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2.5">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>我的项目工作区 ({workspaces.length})</span>
                    {loadingWs && <span className="font-mono text-[10px] text-slate-400">同步中...</span>}
                  </div>
                  {workspaces.length === 0 ? (
                    <div className="text-slate-400 py-2">
                      暂未创建工作区，推荐先选择上方「GEO Evidence Lab」一键初始化。
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workspaces.map((ws) => {
                        const active = ws.id === activeWorkspace?.id;
                        return (
                          <button
                            key={ws.id}
                            type="button"
                            onClick={() => {
                              setSelectedWsId(ws.id);
                              applyWorkspaceToEditor(ws);
                              setWsMessage(null);
                            }}
                            className={`w-full text-left p-3 rounded-xl border cursor-pointer space-y-1 transition-colors ${
                              active
                                ? "border-gemini-purple bg-gemini-purple/15"
                                : "border-white/10 bg-black/35 hover:border-white/25"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-white truncate">
                                {ws.title}
                              </span>
                              <span className="font-mono text-[10px] text-gemini-cyan shrink-0">
                                {ws.lifecycleState}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-slate-400 tabular-nums">
                              首小时 {ws.firstHourCheckedJson.length}/6 · 提交{" "}
                              {ws.submissionCount ?? 0} 次
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Standard Starter Kit Directory Tree & File Boundaries */}
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-gemini-purple" />
                  <span>标准项目目录树与写入边界</span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {STANDARD_STARTER_KIT_TREE.map((node) => (
                    <div
                      key={node.path}
                      className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="text-white font-semibold flex items-center gap-1.5">
                          {!node.writable && <Lock className="w-3 h-3 text-rose-400" />}
                          <span>{node.path}</span>
                        </div>
                        <div className="text-[10px] font-sans text-slate-400">
                          {node.purpose}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] shrink-0 ${
                          node.writable ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {node.writable ? "可修改" : "锁定红线"}
                      </span>
                    </div>
                  ))}
                </div>

                {activeTemplate && (
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 space-y-1 font-mono text-[10px]">
                    <div className="text-emerald-300">
                      允许修改白名单：{activeTemplate.allowedGlobsJson.join(" , ")}
                    </div>
                    <div className="text-rose-300">
                      禁止改动红线：{activeTemplate.blockedPathsJson.join(" , ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Lifecycle, First-Hour Checklist, SPEC/Rules/Handoff, Static Audit Gate & Submit */}
            <div className="lg:col-span-8 space-y-4">
              {!activeWorkspace ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-mono text-gemini-cyan">
                        STARTER KIT TEMPLATE PREVIEW · {activeTemplate?.targetModuleId?.toUpperCase() || "M13-ENG"}
                      </div>
                      <h2 className="text-base font-bold text-white">
                        {activeTemplate?.title || "选择左侧 Starter Kit 预览标准项目规格与规则"}
                      </h2>
                      <p className="text-slate-300 leading-relaxed max-w-2xl">
                        {session
                          ? "点击左侧「初始化项目工作区」即可将该模板克隆为您的云端项目并开启首小时 6 步打卡与服务端静态门禁。"
                          : "当前处于公开模板预览态；点击右侧登录并初始化后，可编辑保存 SPEC / Rules / Handoff、运行服务端 422 静态门禁并导出归档。"}
                      </p>
                    </div>
                    {!session && (
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent("app:open-login"))}
                        className="px-4 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        邮箱登录并创建工作区 →
                      </button>
                    )}
                  </div>

                  {activeTemplate && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2">
                        <div className="font-mono text-[11px] text-gemini-cyan">
                          specs/SPEC.md（Starter Kit 初始规格）
                        </div>
                        <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                          {activeTemplate.starterSpecMarkdown}
                        </pre>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2">
                        <div className="font-mono text-[11px] text-gemini-purple">
                          rules/.cursorrules（可审查工程红线）
                        </div>
                        <pre className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                          {activeTemplate.starterRulesContent}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
                    <div className="font-semibold text-white">
                      开课第一小时必过 6 步（建立正反馈与验证基础工程能力）
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(activeTemplate?.firstHourChecklistJson || FIRST_HOUR_DEFAULT_CHECKLIST).map(
                        (step, idx) => (
                          <div
                            key={step.id}
                            className="p-2.5 rounded-xl border border-white/10 bg-black/35 flex items-start gap-2.5"
                          >
                            <span className="font-mono text-[11px] text-gemini-cyan shrink-0 mt-0.5">
                              0{idx + 1}
                            </span>
                            <div className="space-y-0.5">
                              <div className="font-medium text-white">{step.label}</div>
                              <div className="text-[11px] text-slate-400 leading-relaxed">
                                {step.detail}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* 8-State Lifecycle Strip */}
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        项目交付状态机（8 阶段证据闭环）
                      </span>
                      <div className="flex items-center gap-2">
                        {activeWorkspace.lifecycleState === "approved" && (
                          <button
                            type="button"
                            onClick={() => void handleSaveWorkspace(true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-mono text-[11px] cursor-pointer"
                          >
                            标记 Evidence Archived
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleExportHandoffArchive()}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-gemini-cyan" />
                          <span>导出完整 Handoff 资产 (.md)</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PROJECT_LIFECYCLE_STAGES.map((st, idx) => {
                        const isCurrent = st.state === activeWorkspace.lifecycleState;
                        const isPassed = currentLifecycleIndex > idx;
                        return (
                          <div
                            key={st.state}
                            className={`p-2.5 rounded-xl border text-[11px] space-y-0.5 ${
                              isCurrent
                                ? "border-gemini-cyan bg-gemini-cyan/15 text-white"
                                : isPassed
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                                : "border-white/10 bg-black/30 text-slate-400"
                            }`}
                          >
                            <div className="font-mono font-semibold truncate">
                              {st.label}
                            </div>
                            <div className="text-[10px] opacity-80 line-clamp-2">
                              {st.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* First-Hour 6-Step Checklist */}
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-white">
                        开课第一小时最小闭环核验清单（云端持久化）
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gemini-cyan tabular-nums">
                          {firstHourChecked.length}/{FIRST_HOUR_DEFAULT_CHECKLIST.length} 已完成
                        </span>
                        <button
                          type="button"
                          onClick={handleExportFirstHourEvidence}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-gemini-cyan" />
                          <span>导出 Evidence Report</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {FIRST_HOUR_DEFAULT_CHECKLIST.map((step) => {
                        const checked = firstHourChecked.includes(step.id);
                        return (
                          <label
                            key={step.id}
                            className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                              checked
                                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100"
                                : "border-white/10 bg-black/35 text-slate-300 hover:border-white/25"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleFirstHour(step.id)}
                              className="mt-0.5"
                            />
                            <div className="space-y-0.5">
                              <div className="font-medium">{step.label}</div>
                              <div className="text-[11px] text-slate-400 leading-relaxed">
                                {step.detail}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editable SPEC / Rules / Diff / Test Log / Handoff */}
                  <div className="p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">项目名称</label>
                        <input
                          type="text"
                          value={wsTitle}
                          onChange={(e) => setWsTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          仓库 / PR 链接 (https://)
                        </label>
                        <input
                          type="url"
                          value={wsRepoUrl}
                          onChange={(e) => setWsRepoUrl(e.target.value)}
                          placeholder="https://github.com/org/geo-evidence-lab/pull/1"
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          specs/SPEC.md（需求与系统边界）
                        </label>
                        <textarea
                          rows={7}
                          value={wsSpec}
                          onChange={(e) => setWsSpec(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          rules/20-project-domain.mdc（项目约束规则）
                        </label>
                        <textarea
                          rows={7}
                          value={wsRules}
                          onChange={(e) => setWsRules(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          变更文件清单 (changedFiles，逗号或换行分隔)
                        </label>
                        <textarea
                          rows={3}
                          value={changedFilesInput}
                          onChange={(e) => setChangedFilesInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          提交标题 (Artifact Title)
                        </label>
                        <input
                          type="text"
                          value={artifactTitleInput}
                          onChange={(e) => setArtifactTitleInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        />
                        <div className="text-[11px] text-slate-400 pt-1">
                          注意：若变更文件包含 rules/00-core-redlines.mdc、.env 或越界路径，服务端门禁将直接返回 HTTP 422 阻断。
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-1.5">
                          <button
                            type="button"
                            onClick={handleLoadViolatingDemo}
                            className="px-2.5 py-1 rounded-lg border border-amber-400/35 bg-amber-500/10 hover:bg-amber-500/20 text-[11px] font-mono text-amber-200 cursor-pointer"
                          >
                            演练失败红灯 (注入越界/Key)
                          </button>
                          <button
                            type="button"
                            onClick={handleRestoreCleanDemo}
                            className="px-2.5 py-1 rounded-lg border border-emerald-400/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-[11px] font-mono text-emerald-200 cursor-pointer"
                          >
                            修复并恢复合规 Diff
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          Git Diff 摘要（供审校审查最小化改动）
                        </label>
                        <textarea
                          rows={4}
                          value={diffSummaryInput}
                          onChange={(e) => setDiffSummaryInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          验证命令输出日志（学员自贴本地/CI 输出 · 真实隔离 Runner 待 Stage 3 接入）
                        </label>
                        <textarea
                          rows={4}
                          value={testCommandLogInput}
                          onChange={(e) => setTestCommandLogInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          模式选择理由与反过度设计说明（人工审校证据）
                        </label>
                        <textarea
                          rows={3}
                          value={decisionRationaleInput}
                          onChange={(e) => setDecisionRationaleInput(e.target.value)}
                          placeholder="说明为何选用/拒绝某设计模式、备选简单方案比较、以及边界放在哪里..."
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          已知限制与人工接管条件（Known Limitations）
                        </label>
                        <textarea
                          rows={3}
                          value={knownLimitationsInput}
                          onChange={(e) => setKnownLimitationsInput(e.target.value)}
                          placeholder="明确列出当前原型未覆盖的场景、故障降级方式与必须人工介入接管的条件..."
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-300 font-medium">
                        handoff/HANDOFF.md（运维、成本与人工接管边界）
                      </label>
                      <textarea
                        rows={4}
                        value={wsHandoff}
                        onChange={(e) => setWsHandoff(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
                      />
                    </div>

                    {/* Stage 3 Isolated Runner Boundary Contract */}
                    <div className="p-3 rounded-xl border border-white/10 bg-black/35 space-y-1 text-[11px]">
                      <div className="font-mono text-amber-200 font-semibold flex flex-wrap items-center justify-between gap-2 tabular-nums">
                        <span>
                          执行隔离契约 · {ISOLATED_RUNNER_CONTRACT.executionStatus}
                        </span>
                        <span className="text-slate-400">
                          公网 {ISOLATED_RUNNER_CONTRACT.networkEgress} · 密钥{" "}
                          {ISOLATED_RUNNER_CONTRACT.secretAccess} · 超时{" "}
                          {ISOLATED_RUNNER_CONTRACT.maxRuntimeSeconds}s · 内存{" "}
                          {ISOLATED_RUNNER_CONTRACT.maxMemoryMb}MB
                        </span>
                      </div>
                      <div className="text-slate-400 leading-relaxed">
                        {ISOLATED_RUNNER_CONTRACT.summary}
                      </div>
                    </div>

                    {/* Authoritative Server Static Audit Result Box */}
                    {latestAudit && (
                      <div
                        className={`p-3.5 rounded-xl border space-y-2 ${
                          latestAudit.passed
                            ? "border-emerald-400/40 bg-emerald-500/10"
                            : "border-rose-400/45 bg-rose-500/10"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                          <span
                            className={`font-semibold inline-flex items-center gap-1.5 ${
                              latestAudit.passed ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {latestAudit.passed ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <ShieldAlert className="w-4 h-4" />
                            )}
                            <span>
                              {VERIFICATION_MODES.static_material_check.label}（
                              {latestAudit.ruleVersion || staticAuditRuleVersion}）：
                              {latestAudit.passed ? "PASSED（允许提交审校）" : "BLOCKED（已阻断提交）"}
                            </span>
                          </span>
                          <span className="text-slate-300 tabular-nums">
                            不直接运行代码 · 阻塞 {latestAudit.blockingCount} · 警告{" "}
                            {latestAudit.warningCount}
                          </span>
                        </div>
                        {latestAudit.findings.length > 0 && (
                          <ul className="space-y-1.5 text-[11px]">
                            {latestAudit.findings.map((f, idx) => (
                              <li
                                key={`${f.id}-${idx}`}
                                className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <span
                                      className={`font-mono mr-2 ${
                                        f.severity === "blocking"
                                          ? "text-rose-300"
                                          : "text-amber-300"
                                      }`}
                                    >
                                      [{f.ruleId} · {f.severity}]
                                    </span>
                                    <span className="font-semibold text-white">{f.title}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAskTutorFromContext(
                                        `我在 ${activeTargetModuleId.toUpperCase()} 静态检查命中了 ${f.ruleId}（${f.title}）：${f.detail} 请结合已解锁课程材料说明正确边界与修复思路。`
                                      )
                                    }
                                    className="px-2 py-0.5 rounded border border-gemini-purple/40 bg-gemini-purple/15 text-purple-200 hover:bg-gemini-purple/25 font-mono text-[10px] cursor-pointer whitespace-nowrap shrink-0"
                                  >
                                    向 Tutor 诊断此问题 →
                                  </button>
                                </div>
                                <div className="text-slate-300">{f.detail}</div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {wsMessage && (
                      <div
                        className={`p-3 rounded-xl border ${
                          wsMessage.ok
                            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                        }`}
                      >
                        {wsMessage.text}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        disabled={wsSaving}
                        onClick={() => void handleSaveWorkspace(false)}
                        className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium cursor-pointer disabled:opacity-50"
                      >
                        {wsSaving ? "保存中..." : "保存工作区草稿"}
                      </button>
                      <button
                        type="button"
                        disabled={auditRunning}
                        onClick={() => void handleRunStaticAudit()}
                        className="px-4 py-2 rounded-xl border border-gemini-purple/50 bg-gemini-purple/20 hover:bg-gemini-purple/30 text-purple-100 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>{auditRunning ? "审计执行中..." : "运行服务端静态门禁"}</span>
                      </button>
                      <button
                        type="button"
                        disabled={submittingWork}
                        onClick={() => void handleSubmitWorkspaceArtifact()}
                        className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingWork ? "校验并提交中..." : "提交证据给导师审校"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Submission History & Curriculum Version Traceability */}
                  {submissionsHistory.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-white">
                          最近提交历史与版本追溯 ({submissionsHistory.length})
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {VERIFICATION_MODES.human_approval.label}才可正式授证
                        </span>
                      </div>
                      <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/35 overflow-hidden">
                        {submissionsHistory.slice(0, 6).map((sub) => (
                          <div
                            key={sub.id}
                            className="p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-medium text-white truncate">
                                #{sub.id} · {sub.artifactTitle}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400 tabular-nums">
                                模块 {sub.moduleId.toUpperCase()} · 课程版本{" "}
                                {sub.curriculumVersion || curriculumVersion} · 更新于{" "}
                                {sub.updatedAt.slice(0, 10)}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] shrink-0">
                              <span
                                className={
                                  sub.staticAuditPassed === true
                                    ? "text-emerald-300"
                                    : sub.staticAuditPassed === false
                                    ? "text-rose-300"
                                    : "text-slate-400"
                                }
                              >
                                静态检查:
                                {sub.staticAuditPassed === true
                                  ? "PASS"
                                  : sub.staticAuditPassed === false
                                  ? "FAIL"
                                  : "N/A"}
                              </span>
                              <span className="text-slate-300">
                                AI预审:{sub.hasAiPrereview ? "有草稿(仅供参考)" : "未运行"}
                              </span>
                              <span
                                className={
                                  sub.status === "approved"
                                    ? "text-emerald-300 font-semibold"
                                    : sub.status === "changes_requested"
                                    ? "text-amber-300 font-semibold"
                                    : "text-gemini-cyan"
                                }
                              >
                                {sub.status === "approved"
                                  ? "人工已批准"
                                  : sub.status === "changes_requested"
                                  ? "待修改重交"
                                  : "待导师审校"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STANDARDIZED EVAL WORKBENCH */}
      {activeTab === "eval" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-gemini-cyan">
                PROMPTFOO / DEEPEVAL STYLE DETERMINISTIC SUITE
              </div>
              <h2 className="text-base font-bold text-white">
                标准化检索、引用、ACL 零越权与熔断评测台
              </h2>
              <p className="text-slate-400 leading-relaxed">
                在固定数据集上跑客观指标：Recall@K、Citation Precision、ACL 越权数必须为 0、Tombstone 过期召回必须为 0，并支持注入故障开关检验评测台是否能真实抓出问题。
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-medium">选择固定评测数据集</label>
              <select
                value={evalSlug}
                onChange={(e) =>
                  setEvalSlug(
                    e.target.value as
                      | "geo-evidence-eval-v1"
                      | "runtime-kb-acl-eval-v1"
                      | "general-agent-workflow-eval-v1"
                  )
                }
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
              >
                <option value="geo-evidence-eval-v1">
                  geo-evidence-eval-v1 · GEO 公开来源与合规边界集 (M13-Eng 真实业务试点)
                </option>
                <option value="general-agent-workflow-eval-v1">
                  general-agent-workflow-eval-v1 · 通用 Agent 路由、HITL 与熔断集 (M11 通用 Agent 试点)
                </option>
                <option value="runtime-kb-acl-eval-v1">
                  runtime-kb-acl-eval-v1 · 运行时多租户 ACL 与 Tombstone 集 (M12/M13)
                </option>
              </select>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-black/35 space-y-2">
              <div className="font-mono text-[11px] text-amber-300">
                故障注入对比开关（用于验证 Eval 是否真的能抓出事故）
              </div>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simBrokenAcl}
                  onChange={(e) => setSimBrokenAcl(e.target.checked)}
                />
                <span>模拟关闭 ACL Pre-filter（预期触发跨租户越权告警并 Fail）</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simStaleLeak}
                  onChange={(e) => setSimStaleLeak(e.target.checked)}
                />
                <span>模拟召回已废止 Tombstone 文档（预期过期召回 &gt; 0 并 Fail）</span>
              </label>
            </div>

            {evalError && (
              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-200">
                {evalError}
              </div>
            )}

            <button
              type="button"
              disabled={runningEval}
              onClick={() => void handleRunEvalSuite()}
              className="w-full py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>
                {!session
                  ? "登录后运行标准化 Eval"
                  : runningEval
                  ? "评测运行中..."
                  : "运行 Eval 评测并保存证据"}
              </span>
            </button>

            {/* Eval History */}
            {evalRuns.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="font-semibold text-white">最近评测记录 ({evalRuns.length})</div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {evalRuns.map((run) => (
                    <div
                      key={run.id}
                      className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono text-white font-semibold">
                          {run.datasetSlug}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 tabular-nums">
                          Recall {run.recallAtK}% · Citation {run.citationPrecision}% · ACL漏{" "}
                          {run.aclLeakCount} · 过期 {run.staleRecallCount}
                        </div>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          run.passed ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {run.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            {!activeEvalReport ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <FlaskConical className="w-8 h-8 text-gemini-cyan mx-auto opacity-75" />
                <div className="text-white font-semibold">
                  选择左侧评测集并点击「运行 Eval 评测」查看客观指标矩阵
                </div>
                <div>
                  支持在 M13-Eng 提交作业时自动关联最新通过的 Eval 运行 ID，作为导师审核的确定性证据。
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="font-mono text-[11px] text-gemini-cyan tabular-nums">
                      {VERIFICATION_MODES.simulated_eval.label} · {activeEvalReport.datasetSlug} @{" "}
                      {activeEvalReport.datasetVersion} · 策略{" "}
                      {activeEvalReport.evalPolicyVersion || EVAL_POLICY_VERSION} · 课程版本{" "}
                      {activeEvalReport.curriculumVersion || curriculumVersion}
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {activeEvalReport.datasetTitle}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg font-mono font-bold ${
                      activeEvalReport.passed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                    }`}
                  >
                    {activeEvalReport.passed ? "SIMULATED GATE PASSED" : "SIMULATED GATE FAILED"}
                  </span>
                </div>

                {activeEvalReport.simulationDisclaimer && (
                  <div className="p-2.5 rounded-xl border border-amber-400/35 bg-amber-500/10 text-[11px] text-amber-100 leading-relaxed">
                    {activeEvalReport.simulationDisclaimer}
                  </div>
                )}

                {/* 6 KPI Cells */}
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 tabular-nums font-mono">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">Recall@K</dt>
                    <dd className="text-lg font-bold text-white mt-0.5">
                      {activeEvalReport.recallAtK}%
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">Citation Precision</dt>
                    <dd className="text-lg font-bold text-gemini-cyan mt-0.5">
                      {activeEvalReport.citationPrecision}%
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">ACL 越权泄漏数 (须=0)</dt>
                    <dd
                      className={`text-lg font-bold mt-0.5 ${
                        activeEvalReport.aclLeakCount === 0
                          ? "text-emerald-300"
                          : "text-rose-400"
                      }`}
                    >
                      {activeEvalReport.aclLeakCount}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">Tombstone 过期召回 (须=0)</dt>
                    <dd
                      className={`text-lg font-bold mt-0.5 ${
                        activeEvalReport.staleRecallCount === 0
                          ? "text-emerald-300"
                          : "text-rose-400"
                      }`}
                    >
                      {activeEvalReport.staleRecallCount}
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">拒答准确率 (Refusal)</dt>
                    <dd className="text-lg font-bold text-white mt-0.5">
                      {activeEvalReport.refusalAccuracy}%
                    </dd>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <dt className="text-[10px] text-slate-400">步数/预算熔断率</dt>
                    <dd className="text-lg font-bold text-white mt-0.5">
                      {activeEvalReport.loopCircuitBreakRate}%
                    </dd>
                  </div>
                </dl>

                {/* Case Breakdown */}
                <div className="space-y-2">
                  <div className="font-semibold text-white">逐 Case 验收明细</div>
                  {activeEvalReport.caseReports.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border space-y-1 ${
                        c.passed
                          ? "border-white/10 bg-black/35"
                          : "border-rose-400/40 bg-rose-500/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-white">{c.query}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {!c.passed && (
                            <button
                              type="button"
                              onClick={() =>
                                handleAskTutorFromContext(
                                  `在 ${activeEvalReport.datasetSlug} 评测中，Case「${c.query}」失败（${c.reason || c.note}）。请问应当如何调整 ACL Pre-filter、Tombstone 或 Pipeline 边界？`,
                                  activeEvalReport.moduleId
                                )
                              }
                              className="px-2 py-0.5 rounded border border-gemini-purple/40 bg-gemini-purple/15 text-purple-200 hover:bg-gemini-purple/25 font-mono text-[10px] cursor-pointer whitespace-nowrap"
                            >
                              用 Tutor 排查 →
                            </button>
                          )}
                          <span
                            className={`font-mono text-[10px] ${
                              c.passed ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {c.passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400">{c.note}</div>
                      <div className="font-mono text-[10px] text-slate-300">
                        召回文档：{c.retrievedDocIds.join(", ") || "（空 · 触发拒答）"}
                        {c.reason ? ` ｜ 失败原因：${c.reason}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COURSE-GROUNDED TUTOR */}
      {activeTab === "tutor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <form
            onSubmit={handleAskTutor}
            className="lg:col-span-5 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4"
          >
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-gemini-purple">
                READ-ONLY GROUNDED TUTOR · NO PROGRESS/SKILL MUTATION · v{curriculumVersion}
              </div>
              <h2 className="text-base font-bold text-white">
                Course-grounded 课程伴学助教（与 Exam 严格隔离）
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Tutor 仅检索当前账号已解锁的课程章节与知识库（未付费用户仅检索 M1），回答必附来源引用与下一步可验证实操；拒绝透露测验答案、越权访问未解锁模块或跨纲编造。
              </p>
            </div>

            {activeTemplate && (
              <div className="p-2.5 rounded-xl border border-gemini-cyan/30 bg-gemini-cyan/[0.06] space-y-1.5 text-[11px]">
                <div className="font-mono text-gemini-cyan">
                  当前联动项目：{activeWorkspace?.title || activeTemplate.title} (
                  {activeTargetModuleId.toUpperCase()})
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAskTutorFromContext(
                        `围绕当前项目「${activeWorkspace?.title || activeTemplate.title}」，如何检查 SPEC.md 边界、规则隔离与失败回退条件？`,
                        activeTargetModuleId
                      )
                    }
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-100 font-mono text-[10px] cursor-pointer whitespace-nowrap"
                  >
                    带入当前工作区边界提问
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenModule(activeTargetModuleId)}
                    className="px-2 py-1 rounded border border-white/15 text-slate-300 hover:text-white font-mono text-[10px] cursor-pointer whitespace-nowrap"
                  >
                    回到 {activeTargetModuleId.toUpperCase()} 模块
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">限定课程模块（可选）</label>
              <select
                value={tutorModuleId}
                onChange={(e) => setTutorModuleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
              >
                <option value="">自动检索全部已解锁模块</option>
                {COURSE_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} · {m.title.replace(/^Module\s+[\w-]+:\s*/i, "")}
                    {m.id !== "m1" && !hasPaidAccess ? " (需权益解锁)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">输入工程或课程问题 *</label>
              <textarea
                rows={5}
                required
                value={tutorQuestion}
                onChange={(e) => setTutorQuestion(e.target.value)}
                placeholder="例如：在 M1 中，为什么 Plan Mode 必须先明确系统边界与验收条件再写代码？"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "为什么 Plan Mode 要先写边界再生成代码？",
                "M12 为什么强调 ACL Pre-filter？",
                "直接给我 M1 测验的正确答案",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTutorQuestion(preset)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            {tutorError && (
              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-200">
                {tutorError}
              </div>
            )}

            <button
              type="submit"
              disabled={tutorAsking}
              className="w-full py-2.5 rounded-xl bg-gemini-purple text-white font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Bot className="w-4 h-4" />
              <span>{tutorAsking ? "检索已解锁资料中..." : "向 Course Tutor 提问"}</span>
            </button>
          </form>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            {!tutorResponse ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <Bot className="w-8 h-8 text-gemini-purple mx-auto opacity-80" />
                <div className="text-white font-semibold">
                  提问后将展示带出处引用的答疑与可验证练习入口
                </div>
                <div>
                  可以尝试点击左侧快捷问题中的「直接给我 M1 测验的正确答案」验证防作弊拒答门禁。
                </div>
              </div>
            ) : (
              <>
                {tutorResponse.refused && (
                  <div className="p-3.5 rounded-xl border border-amber-400/45 bg-amber-500/10 text-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-mono font-semibold text-[11px]">
                        合规拒答 ({tutorResponse.refusalReason})
                      </div>
                      <div className="leading-relaxed">{tutorResponse.answer}</div>
                    </div>
                  </div>
                )}

                {!tutorResponse.refused && (
                  <div className="p-4 rounded-xl bg-black/45 border border-white/10 text-slate-100 whitespace-pre-wrap leading-relaxed">
                    {tutorResponse.answer}
                  </div>
                )}

                {tutorResponse.citations.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-mono text-[11px] text-gemini-cyan">
                      引用课程依据（仅来自已解锁材料）
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tutorResponse.citations.map((cit, idx) => (
                        <button
                          key={cit.sourceId}
                          type="button"
                          onClick={() => onOpenModule(cit.moduleId, cit.unitId)}
                          className="text-left p-3 rounded-xl border border-white/10 bg-black/35 hover:border-gemini-cyan/50 cursor-pointer space-y-1 transition-colors"
                        >
                          <div className="font-mono text-[11px] text-gemini-cyan font-semibold">
                            [{idx + 1}] {cit.label}
                          </div>
                          <div className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {cit.excerpt}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tutorResponse.nextPractice && (
                  <div className="p-3.5 rounded-xl border border-emerald-400/35 bg-emerald-500/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-emerald-200">
                        {tutorResponse.nextPractice.label}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {tutorResponse.nextPractice.actionHint}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        tutorResponse.nextPractice?.labId
                          ? onSwitchToReveal({ labId: tutorResponse.nextPractice.labId })
                          : onOpenModule(tutorResponse.nextPractice?.moduleId || "m1")
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold inline-flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>去验证实操</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STEP-BY-STEP BACKEND-GRADED EXAM */}
      {activeTab === "exam" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-gemini-cyan tabular-nums">
                BACKEND-GRADED STEP EXAM · ZERO CLIENT ANSWERS · v{curriculumVersion}
              </div>
              <h2 className="text-base font-bold text-white">
                分步认证 Exam（服务端逐题判分）
              </h2>
              <p className="text-slate-400 leading-relaxed">
                前端不存储任何答案；每道题提交后由服务端实时判分、给出薄弱点复盘建议，交卷后自动写入云端成绩并参与三锁认证门禁核验。
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">选择考核模块</label>
              <select
                value={examModuleId}
                onChange={(e) => setExamModuleId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
              >
                {COURSE_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} · {m.title.replace(/^Module\s+[\w-]+:\s*/i, "")}
                    {m.id !== "m1" && !hasPaidAccess ? " (需权益)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => void handleStartExam()}
              className="w-full py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold cursor-pointer"
            >
              {!session ? "登录后开启分步 Exam" : "开启新一轮分步认证 Exam"}
            </button>

            {examError && (
              <div className="p-3 rounded-xl border border-rose-400/40 bg-rose-500/10 text-rose-200">
                {examError}
              </div>
            )}

            {examSessions.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="font-semibold text-white">历史 Exam 场次 ({examSessions.length})</div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {examSessions.map((es) => (
                    <div
                      key={es.id}
                      className="p-2.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-mono text-white font-semibold">
                          {es.moduleId.toUpperCase()} · {es.status}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {es.startedAt.slice(0, 10)}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          es.status !== "completed"
                            ? "text-slate-400"
                            : es.passed
                            ? "text-emerald-300"
                            : "text-amber-300"
                        }`}
                      >
                        {es.status === "completed" ? `${es.scorePct}%` : "进行中"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
            {!activeExam ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <ClipboardCheck className="w-8 h-8 text-gemini-cyan mx-auto opacity-80" />
                <div className="text-white font-semibold">
                  选择左侧模块并点击「开启新一轮分步认证 Exam」开始作答
                </div>
                <div>支持 M1 免费体验分步 Exam，75% 及以上判定通过。</div>
              </div>
            ) : activeExam.currentQuestion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
                  <span className="text-gemini-cyan font-semibold">
                    {activeExam.moduleTitle}
                  </span>
                  <span className="text-slate-300 tabular-nums">
                    第 {activeExam.currentQuestion.index + 1} / {activeExam.totalCount} 题
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-[11px] text-purple-200">
                    考察主题：{activeExam.currentQuestion.topic}
                  </div>
                  <div className="text-sm font-semibold text-white leading-relaxed">
                    {activeExam.currentQuestion.question}
                  </div>
                </div>

                <div className="space-y-2">
                  {activeExam.currentQuestion.options.map((opt, idx) => {
                    const picked = examSelectedIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setExamSelectedIdx(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          picked
                            ? "border-gemini-cyan bg-gemini-cyan/15 text-white"
                            : "border-white/10 bg-black/40 text-slate-200 hover:border-white/25"
                        }`}
                      >
                        <span className="font-mono text-gemini-cyan mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {examStepFeedback && (
                  <div
                    className={`p-3 rounded-xl border space-y-1 ${
                      examStepFeedback.isCorrect
                        ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                        : "border-amber-400/40 bg-amber-500/10 text-amber-100"
                    }`}
                  >
                    <div className="font-mono font-semibold text-[11px]">
                      上一题判分：{examStepFeedback.isCorrect ? "回答正确" : "回答有误"}（
                      {examStepFeedback.topic}）
                    </div>
                    <div>{examStepFeedback.explanation}</div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={examSelectedIdx === null || examSubmitting}
                    onClick={() => void handleSubmitExamStep()}
                    className="px-5 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {examSubmitting ? "判分中..." : "提交本题并进入下一题"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                    activeExam.session.passed
                      ? "border-emerald-400/45 bg-emerald-500/10"
                      : "border-amber-400/45 bg-amber-500/10"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-mono text-[11px] text-slate-300">
                      EXAM COMPLETED · BACKEND VERIFIED
                    </div>
                    <div className="text-lg font-bold text-white inline-flex items-center gap-2">
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          activeExam.session.passed ? "text-emerald-300" : "text-amber-300"
                        }`}
                      />
                      <span>
                        {activeExam.session.passed
                          ? "本次认证考核通过"
                          : "暂未达到 75% 通过线，请先复盘薄弱主题"}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums">
                    {activeExam.session.scorePct}%
                  </div>
                </div>

                {examStepFeedback && (
                  <div className="p-3 rounded-xl border border-white/10 bg-black/40 space-y-1">
                    <div className="font-mono text-[11px] text-slate-300">
                      末题解析（{examStepFeedback.topic}）：
                    </div>
                    <div className="text-slate-200">{examStepFeedback.explanation}</div>
                  </div>
                )}

                {examRemediationPlan.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-amber-200">
                      薄弱知识点复盘作业清单：
                    </div>
                    {examRemediationPlan.map((item) => (
                      <div
                        key={item.topic}
                        className="p-3 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-100"
                      >
                        <div className="font-semibold">{item.topic}</div>
                        <div className="text-[11px] mt-0.5">{item.recommendation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
