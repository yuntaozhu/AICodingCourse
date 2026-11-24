import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import {
  fetchInstructorCockpit,
  generateInstructorAiPrereviewApi,
  reviewSubmission,
  type InstructorCockpitResponse,
  type InstructorCockpitSubmission,
} from "@/lib/apiClient";

type QueueTab = "submitted" | "overdue" | "changes_requested" | "approved";

export default function InstructorCockpit() {
  const { session } = useAuth();
  const [data, setData] = useState<InstructorCockpitResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QueueTab>("submitted");
  const [selectedSub, setSelectedSub] = useState<InstructorCockpitSubmission | null>(null);

  // Review composer
  const [feedbackMarkdown, setFeedbackMarkdown] = useState("");
  const [grantSkillId, setGrantSkillId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingPrereview, setGeneratingPrereview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadCockpit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchInstructorCockpit();
      setData(res);
      const firstSub = res.queues[activeTab];
      if (activeTab !== "overdue" && Array.isArray(firstSub) && firstSub.length > 0) {
        setSelectedSub(firstSub[0] as InstructorCockpitSubmission);
      } else {
        setSelectedSub(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "无法加载教师批改台。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCockpit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const handleReview = async (decision: "changes_requested" | "approved") => {
    if (!selectedSub) return;
    setReviewMsg(null);
    setSubmitting(true);
    try {
      await reviewSubmission(selectedSub.id, {
        decision,
        feedbackMarkdown,
        grantSkillId: decision === "approved" && grantSkillId ? grantSkillId : null,
      });
      setFeedbackMarkdown("");
      setGrantSkillId("");
      setReviewMsg({
        ok: true,
        text:
          decision === "approved"
            ? "已审核通过并记录评语！"
            : "已退回学员修改，学员端将立即看到修改建议。",
      });
      await loadCockpit();
    } catch (err) {
      setReviewMsg({
        ok: false,
        text: err instanceof Error ? err.message : "提交批改失败。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAiPrereview = async () => {
    if (!selectedSub) return;
    setGeneratingPrereview(true);
    setReviewMsg(null);
    try {
      await generateInstructorAiPrereviewApi(selectedSub.id, `pre-${selectedSub.id}-${Date.now()}`);
      setReviewMsg({
        ok: true,
        text: "已生成 AI 预审初筛草稿（仅供参考，最终通过与技能授予须由您人工确认）。",
      });
      await loadCockpit();
    } catch (err) {
      setReviewMsg({
        ok: false,
        text: err instanceof Error ? err.message : "生成 AI 预审草稿失败。",
      });
    } finally {
      setGeneratingPrereview(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        正在加载带班队列...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 text-xs text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: QueueTab; label: string; count: number }> = [
    { id: "submitted", label: "待批改", count: data?.queues.submitted.length ?? 0 },
    { id: "overdue", label: "已逾期未交", count: data?.queues.overdue.length ?? 0 },
    {
      id: "changes_requested",
      label: "已退回待重交",
      count: data?.queues.changes_requested.length ?? 0,
    },
    { id: "approved", label: "已完成", count: data?.queues.approved.length ?? 0 },
  ];

  const activeList =
    activeTab === "overdue" ? [] : data?.queues[activeTab] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5 text-xs">
      {/* Header */}
      <div className="p-5 rounded-2xl border border-gemini-purple/40 bg-[#0b0f19] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-purple-200">
            COHORT-SCOPED INSTRUCTOR COCKPIT
          </div>
          <h1 className="text-xl font-bold text-white">
            教师带班与作业审校工作台
          </h1>
          <p className="text-slate-400">
            {session?.isAdmin
              ? `管理员全局视角：可审校全部 ${data?.scopedCohortCount ?? 0} 个班级作业。`
              : `分班隔离视角：仅显示已指派给您的 ${data?.scopedCohortCount ?? 0} 个班级。`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {data?.cohorts.map((c) => (
            <div
              key={c.id}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] font-mono text-[11px] text-slate-200 inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-gemini-purple" />
              <span>
                {c.code} · {c.learnerCount} 人
              </span>
            </div>
          ))}
        </div>
      </div>

      {data && data.scopedCohortCount === 0 ? (
        <div className="p-8 rounded-2xl border border-white/10 bg-[#0b0f19] text-center text-slate-400">
          您当前尚未被分配到任何具体班期（cohort_instructors），请联系教务管理员分配负责班级。
        </div>
      ) : (
        <>
          {/* 4-Queue Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "overdue" && data) {
                    const nextList = data.queues[tab.id];
                    setSelectedSub(nextList[0] ?? null);
                  } else {
                    setSelectedSub(null);
                  }
                  setReviewMsg(null);
                }}
                className={`px-3.5 py-2 rounded-xl font-medium inline-flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "bg-gemini-purple text-white font-semibold"
                    : "bg-[#0b0f19] border border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono tabular-nums text-[11px] opacity-85">
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {activeTab === "overdue" ? (
            <div className="rounded-2xl border border-white/12 bg-[#0b0f19] overflow-hidden">
              {data?.queues.overdue.length === 0 ? (
                <div className="p-8 text-center text-slate-400">当前无已逾期未提交里程碑。</div>
              ) : (
                <div className="divide-y divide-white/10">
                  {data?.queues.overdue.map((item) => (
                    <div
                      key={`${item.cohortId}-${item.milestoneId}-${item.userId}`}
                      className="p-4 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-white">
                          {item.learnerName}{" "}
                          <span className="font-mono text-slate-400 font-normal">
                            ({item.learnerEmail})
                          </span>
                        </div>
                        <div className="text-slate-300">
                          {item.cohortTitle} · {item.milestoneTitle} (
                          {item.moduleId.toUpperCase()})
                        </div>
                      </div>
                      <span className="font-mono text-rose-300 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> 截止日期 {item.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Queue List */}
              <div className="lg:col-span-5 space-y-2">
                {activeList.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-white/10 bg-[#0b0f19] text-center text-slate-400">
                    当前队列暂无作业记录。
                  </div>
                ) : (
                  activeList.map((sub) => {
                    const active = selectedSub?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSub(sub);
                          setFeedbackMarkdown("");
                          setGrantSkillId("");
                          setReviewMsg(null);
                        }}
                        className={`w-full text-left p-4 rounded-xl border space-y-1.5 cursor-pointer transition-colors ${
                          active
                            ? "border-gemini-purple bg-gemini-purple/15"
                            : "border-white/10 bg-[#0b0f19] hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white truncate">
                            {sub.artifactTitle}
                          </span>
                          <span className="font-mono text-[10px] text-gemini-cyan shrink-0">
                            {sub.moduleId.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-slate-300">
                          {sub.learnerName} · {sub.milestoneTitle}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>{sub.cohortTitle}</span>
                          <span>{sub.updatedAt.slice(0, 10)}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Review Inspector */}
              <div className="lg:col-span-7">
                {!selectedSub ? (
                  <div className="p-8 rounded-2xl border border-white/10 bg-[#0b0f19] text-center text-slate-400">
                    请从左侧队列选择一份学员作业查看详情并批改。
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="space-y-1">
                        <div className="font-mono text-[11px] text-gemini-cyan">
                          #{selectedSub.id} · {selectedSub.moduleId.toUpperCase()} ·{" "}
                          {selectedSub.cohortTitle}
                        </div>
                        <h2 className="text-lg font-bold text-white">
                          {selectedSub.artifactTitle}
                        </h2>
                        <div className="text-slate-400">
                          提交人：{selectedSub.learnerName} ({selectedSub.learnerEmail})
                        </div>
                      </div>
                      {selectedSub.artifactUrl && (
                        <a
                          href={selectedSub.artifactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-gemini-cyan inline-flex items-center gap-1 font-mono"
                        >
                          <span>查看外链</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {selectedSub.simulationDisclaimer && (
                      <div className="p-3 rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-100">
                        {selectedSub.simulationDisclaimer}
                      </div>
                    )}

                    {/* Authoritative Server Audit + Evidence */}
                    {(selectedSub.latestAudit || selectedSub.staticAuditJson) && (
                      <div className="p-3 rounded-xl border border-white/10 bg-black/40 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                          <span
                            className={
                              selectedSub.latestAudit?.passed === false
                                ? "text-rose-300 font-semibold"
                                : "text-emerald-300 font-semibold"
                            }
                          >
                            服务端静态门禁：
                            {selectedSub.latestAudit
                              ? selectedSub.latestAudit.passed
                                ? `PASSED（警告 ${selectedSub.latestAudit.warningCount}）`
                                : `BLOCKED（阻塞 ${selectedSub.latestAudit.blockingCount}）`
                              : "已记录审计快照"}
                          </span>
                          <button
                            type="button"
                            disabled={generatingPrereview}
                            onClick={() => void handleGenerateAiPrereview()}
                            className="px-2.5 py-1 rounded-lg bg-gemini-purple/20 border border-gemini-purple/45 text-purple-100 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            <span>
                              {generatingPrereview
                                ? "生成预审草稿中..."
                                : "生成 AI 预审草稿 (仅供参考)"}
                            </span>
                          </button>
                        </div>
                        {selectedSub.evidence?.aiPrereviewJson && (
                          <div className="p-2.5 rounded-lg border border-gemini-purple/35 bg-gemini-purple/10 text-[11px] text-slate-100 whitespace-pre-wrap leading-relaxed">
                            {selectedSub.evidence.aiPrereviewJson.draftMarkdown}
                          </div>
                        )}
                        {selectedSub.evidence && (
                          <div className="space-y-2 text-[11px] font-mono text-slate-300 pt-1">
                            {selectedSub.evidence.changedFilesJson.length > 0 && (
                              <div>
                                变更文件：{selectedSub.evidence.changedFilesJson.join(", ")}
                                {selectedSub.evidence.evalRunId
                                  ? ` · 关联 Eval Run #${selectedSub.evidence.evalRunId}`
                                  : ""}
                              </div>
                            )}
                            {selectedSub.evidence.diffSummary && (
                              <details open className="rounded-lg border border-white/10 bg-black/50 p-2">
                                <summary className="cursor-pointer text-gemini-cyan font-semibold">
                                  Diff 变更摘要
                                </summary>
                                <pre className="mt-1.5 text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                                  {selectedSub.evidence.diffSummary}
                                </pre>
                              </details>
                            )}
                            {selectedSub.evidence.testCommandLog && (
                              <pre className="p-2 rounded bg-black/50 border border-white/10 text-emerald-200 whitespace-pre-wrap">
                                {selectedSub.evidence.testCommandLog}
                              </pre>
                            )}
                            {(selectedSub.evidence.specSnapshot ||
                              selectedSub.evidence.rulesSnapshot ||
                              selectedSub.evidence.handoffSummary) && (
                              <details className="rounded-lg border border-white/10 bg-black/50 p-2 space-y-2">
                                <summary className="cursor-pointer text-purple-200 font-semibold">
                                  展开查看 SPEC.md / .cursorrules / HANDOFF.md 提交快照
                                </summary>
                                {selectedSub.evidence.specSnapshot && (
                                  <div className="pt-1.5 space-y-1">
                                    <div className="text-slate-400">specs/SPEC.md</div>
                                    <pre className="p-2 rounded bg-black/60 border border-white/10 text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                                      {selectedSub.evidence.specSnapshot}
                                    </pre>
                                  </div>
                                )}
                                {selectedSub.evidence.rulesSnapshot && (
                                  <div className="space-y-1">
                                    <div className="text-slate-400">rules/.cursorrules</div>
                                    <pre className="p-2 rounded bg-black/60 border border-white/10 text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                                      {selectedSub.evidence.rulesSnapshot}
                                    </pre>
                                  </div>
                                )}
                                {selectedSub.evidence.handoffSummary && (
                                  <div className="space-y-1">
                                    <div className="text-slate-400">handoff/HANDOFF.md</div>
                                    <pre className="p-2 rounded bg-black/60 border border-white/10 text-slate-200 whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                                      {selectedSub.evidence.handoffSummary}
                                    </pre>
                                  </div>
                                )}
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="font-mono text-[11px] text-slate-400">学员提交内容：</div>
                      <pre className="p-3.5 rounded-xl bg-black/55 border border-white/10 font-mono text-slate-100 whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar leading-relaxed">
                        {selectedSub.artifactText}
                      </pre>
                    </div>

                    {/* Past reviews */}
                    {selectedSub.reviews.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="font-mono text-[11px] text-slate-400">历史批改记录：</div>
                        {selectedSub.reviews.map((r) => (
                          <div
                            key={r.id}
                            className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02] text-slate-300"
                          >
                            <span className="font-mono text-purple-200 mr-2">
                              [{r.decision}]
                            </span>
                            {r.feedbackMarkdown}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Review Form */}
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div className="space-y-1">
                        <label className="block text-slate-300 font-medium">
                          批改评语（支持 Markdown）*
                        </label>
                        <textarea
                          rows={4}
                          value={feedbackMarkdown}
                          onChange={(e) => setFeedbackMarkdown(e.target.value)}
                          placeholder="指出架构边界、可改进之处或验收通过理由..."
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-300 font-medium inline-flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>审核通过时可选授予认证技能 (SkillGrant · 三锁门禁)：</span>
                        </label>
                        <div className="p-2.5 rounded-lg border border-white/10 bg-black/35 font-mono text-[11px] text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span
                            className={
                              selectedSub.latestAudit?.passed === false
                                ? "text-rose-300"
                                : "text-emerald-300"
                            }
                          >
                            锁 1 静态门禁：
                            {selectedSub.latestAudit?.passed === false ? "BLOCKED" : "PASSED"}
                          </span>
                          <span
                            className={
                              selectedSub.evidence?.testCommandLog?.trim() ||
                              selectedSub.evidence?.evalRunId ||
                              selectedSub.artifactText.trim().length >= 20
                                ? "text-emerald-300"
                                : "text-amber-300"
                            }
                          >
                            锁 2 实操证据：
                            {selectedSub.evidence?.testCommandLog?.trim() ||
                            selectedSub.evidence?.evalRunId
                              ? "已附命令日志/Eval"
                              : selectedSub.artifactText.trim().length >= 20
                              ? "已附交付正文"
                              : "待补充"}
                          </span>
                          <span className="text-gemini-cyan">锁 3 人工批复：当前导师决断</span>
                        </div>
                        <select
                          value={grantSkillId}
                          onChange={(e) => setGrantSkillId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                        >
                          <option value="">不额外授予新技能</option>
                          {data?.skills.map((sk) => (
                            <option key={sk.id} value={sk.id}>
                              {sk.shortLabel} — {sk.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {reviewMsg && (
                        <div
                          className={`p-2.5 rounded-lg border ${
                            reviewMsg.ok
                              ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                              : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                          }`}
                        >
                          {reviewMsg.text}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={submitting || feedbackMarkdown.trim().length < 3}
                          onClick={() => void handleReview("changes_requested")}
                          className="px-4 py-2 rounded-xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>打回修改 (Changes Requested)</span>
                        </button>
                        <button
                          type="button"
                          disabled={submitting || feedbackMarkdown.trim().length < 3}
                          onClick={() => void handleReview("approved")}
                          className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>审核通过 (Approve)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
