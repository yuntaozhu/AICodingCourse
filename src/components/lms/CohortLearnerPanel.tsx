import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileCheck2,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useAuth } from "@/context/authContextCore";
import { COURSE_MODULES } from "@/data/courseCurriculum";
import {
  fetchMyCohorts,
  submitCohortWork,
  uploadSubmissionAttachment,
  type LearnerCohortItem,
  type SubmissionRecord,
  type SubmissionReviewRecord,
} from "@/lib/apiClient";
import { runLocalBugbotCheck } from "@/lib/gemini";

interface CohortLearnerPanelProps {
  onOpenBilling: () => void;
  onJumpToModule: (moduleId: string) => void;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  submitted: { label: "待老师批改", cls: "text-gemini-cyan" },
  changes_requested: { label: "已退回待重交", cls: "text-amber-300" },
  approved: { label: "已审核通过", cls: "text-emerald-300" },
};

export default function CohortLearnerPanel({
  onOpenBilling,
  onJumpToModule,
}: CohortLearnerPanelProps) {
  const { session, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [blobUploadEnabled, setBlobUploadEnabled] = useState(false);
  const [cohorts, setCohorts] = useState<LearnerCohortItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [reviewsBySub, setReviewsBySub] = useState<Record<number, SubmissionReviewRecord[]>>({});

  // Submission composer
  const [selectedCohortId, setSelectedCohortId] = useState<number | "">("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | "">("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("m3");
  const [artifactTitle, setArtifactTitle] = useState("");
  const [artifactText, setArtifactText] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [uploadingBlob, setUploadingBlob] = useState(false);
  const [attachBugbotAudit, setAttachBugbotAudit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const loadCohorts = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await fetchMyCohorts();
      setEnrolled(data.enrolled);
      setBlobUploadEnabled(Boolean(data.blobUploadEnabled));
      setCohorts(data.cohorts);
      setSubmissions(data.submissions);
      setReviewsBySub(data.reviewsBySubmissionId);
      if (data.cohorts[0] && selectedCohortId === "") {
        setSelectedCohortId(data.cohorts[0].id);
        const firstMs = data.cohorts[0].milestones[0];
        if (firstMs) {
          setSelectedMilestoneId(firstMs.id);
          setSelectedModuleId(firstMs.moduleId);
        }
      }
    } catch {
      // ignore cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">登录后查看您的班级课表与作业批改记录</h2>
        <p className="text-xs text-slate-400">
          自助学习账号也可在此查看已提交的模块作业与实验记录。
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs cursor-pointer"
        >
          Google 账号登录
        </button>
      </div>
    );
  }

  const activeCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  const handleSelectMilestone = (msId: number, modId: string, msTitle: string) => {
    setSelectedMilestoneId(msId);
    setSelectedModuleId(modId);
    if (!artifactTitle.trim()) {
      setArtifactTitle(`${msTitle} · 作业交付`);
    }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setNotice(null);
    if (file.size > 3 * 1024 * 1024) {
      setNotice({ ok: false, text: "附件超过 3MB 上限，请压缩后再试或改填 GitHub 链接。" });
      return;
    }
    setUploadingBlob(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const contentBase64 = btoa(binary);
      const uploaded = await uploadSubmissionAttachment({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        contentBase64,
      });
      setArtifactUrl(uploaded.url);
      setNotice({ ok: true, text: `已上传附件 ${file.name} 并自动填入下方链接。` });
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : "附件上传失败。",
      });
    } finally {
      setUploadingBlob(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);
    setSubmitting(true);
    try {
      const findings = attachBugbotAudit
        ? runLocalBugbotCheck(artifactText, [
            "TypeScript 严格类型与鉴权边界",
            "禁止泄露服务端密钥",
          ])
        : [];
      const staticAuditJson = attachBugbotAudit
        ? {
            auditedAt: new Date().toISOString(),
            findingsCount: findings.length,
            criticalCount: findings.filter((f) => f.severity === "critical").length,
            summary: findings.map((f) => `${f.severity}:${f.title}`).slice(0, 5),
          }
        : null;

      await submitCohortWork({
        cohortId: activeCohort?.id ?? null,
        milestoneId: selectedMilestoneId ? Number(selectedMilestoneId) : null,
        moduleId: selectedModuleId,
        artifactTitle,
        artifactText,
        artifactUrl: artifactUrl.trim() || null,
        staticAuditJson,
      });

      setArtifactTitle("");
      setArtifactText("");
      setArtifactUrl("");
      setNotice({
        ok: true,
        text: "作业已提交（含静态自检快照），指导老师将在批改台查收。",
      });
      await loadCohorts();
    } catch (err) {
      setNotice({
        ok: false,
        text: err instanceof Error ? err.message : "提交失败，请检查权限或字段后重试。",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-xs">
      <div className="p-5 rounded-2xl border border-white/10 bg-[#0b0f19] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-mono text-[11px] text-gemini-cyan">
            COHORT MILESTONES &amp; ARTIFACT SUBMISSIONS
          </div>
          <h1 className="text-xl font-bold text-white">我的班级课表、里程碑与作业交付</h1>
          <p className="text-slate-400">
            {enrolled
              ? `当前已加入 ${cohorts.length} 个指导班期，可按里程碑提交或重交产物并查看老师批改反馈。`
              : "您当前暂未加入带班期次（自助账号可继续学习已解锁模块，或升级深度指导班）。"}
          </p>
        </div>
        {!enrolled && (
          <button
            type="button"
            onClick={onOpenBilling}
            className="px-4 py-2 rounded-xl bg-gemini-purple text-white font-semibold cursor-pointer"
          >
            激活入班兑换码 / 升级带班
          </button>
        )}
      </div>

      {loading && cohorts.length === 0 ? (
        <div className="p-8 text-center text-slate-400">正在加载班级与作业记录...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Enrolled Cohorts + Milestones */}
          <div className="lg:col-span-5 space-y-4">
            {cohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] text-emerald-300">{cohort.code}</div>
                    <h2 className="text-base font-bold text-white">{cohort.title}</h2>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400 inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {cohort.startDate} ~ {cohort.endDate}
                  </span>
                </div>

                <div className="space-y-2">
                  {cohort.milestones.map((ms) => {
                    const statusInfo = ms.latestSubmissionStatus
                      ? STATUS_LABEL[ms.latestSubmissionStatus]
                      : null;
                    const picked = selectedMilestoneId === ms.id;
                    return (
                      <div
                        key={ms.id}
                        className={`p-3 rounded-xl border space-y-2 ${
                          picked
                            ? "border-gemini-cyan bg-gemini-cyan/10"
                            : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{ms.title}</span>
                          {statusInfo ? (
                            <span className={`font-mono text-[11px] ${statusInfo.cls}`}>
                              {statusInfo.label}
                            </span>
                          ) : ms.isOverdue ? (
                            <span className="font-mono text-[11px] text-rose-400 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> 已逾期
                            </span>
                          ) : (
                            <span className="font-mono text-[11px] text-slate-400 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 待提交
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>
                            模块 {ms.moduleId.toUpperCase()} · 截止 {ms.dueDate}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onJumpToModule(ms.moduleId)}
                              className="text-slate-300 hover:text-white cursor-pointer"
                            >
                              去学习
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectMilestone(ms.id, ms.moduleId, ms.title)}
                              className="text-gemini-cyan hover:underline cursor-pointer"
                            >
                              {ms.latestSubmissionStatus ? "重新提交" : "提交此作业"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Submission & Review History */}
            <div className="p-4 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-3">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-gemini-cyan" />
                <span>我的提交与老师批改记录 ({submissions.length})</span>
              </div>
              {submissions.length === 0 ? (
                <div className="text-slate-500 py-3">尚未提交任何里程碑或模块产物。</div>
              ) : (
                <div className="space-y-2.5">
                  {submissions.map((sub) => {
                    const st = STATUS_LABEL[sub.status] || {
                      label: sub.status,
                      cls: "text-slate-300",
                    };
                    const reviews = reviewsBySub[sub.id] || [];
                    return (
                      <div
                        key={sub.id}
                        className="p-3 rounded-xl border border-white/10 bg-black/35 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">{sub.artifactTitle}</span>
                          <span className={`font-mono text-[11px] ${st.cls}`}>{st.label}</span>
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {sub.moduleId.toUpperCase()} · 更新于 {sub.updatedAt.slice(0, 10)}
                        </div>
                        {reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-2.5 rounded-lg border border-gemini-purple/35 bg-gemini-purple/10 space-y-1"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-purple-200">
                              <span>
                                教师审校：{rev.decision === "approved" ? "审核通过" : "退回修改"}
                              </span>
                              <span>{rev.createdAt.slice(0, 10)}</span>
                            </div>
                            <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                              {rev.feedbackMarkdown}
                            </div>
                            {rev.grantedSkillId && (
                              <div className="text-[11px] font-mono text-emerald-300 inline-flex items-center gap-1 pt-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                已授予认证技能：{rev.grantedSkillId}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Artifact Submission Composer */}
          <form
            onSubmit={handleSubmitWork}
            className="lg:col-span-7 p-5 rounded-2xl border border-white/12 bg-[#0b0f19] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="font-mono text-[11px] text-gemini-purple">
                  ARTIFACT SUBMISSION · 含静态自检快照
                </div>
                <h2 className="text-base font-bold text-white">提交 / 重交工程产物与验收证据</h2>
              </div>
              {selectedMilestoneId && (
                <button
                  type="button"
                  onClick={() => setSelectedMilestoneId("")}
                  className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  取消绑定里程碑
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">对应课程模块</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                >
                  {COURSE_MODULES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} · {m.title.replace(/^Module\s+[\w-]+:\s*/i, "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">作业标题 *</label>
                <input
                  type="text"
                  required
                  value={artifactTitle}
                  onChange={(e) => setArtifactTitle(e.target.value)}
                  placeholder="例如：M3 Auth 路由鉴权与 Webhook 验签实现"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-medium">
                关键代码片段 / PRD 契约 / 测试与 DoD 命令输出 *
              </label>
              <textarea
                rows={8}
                required
                value={artifactText}
                onChange={(e) => setArtifactText(e.target.value)}
                placeholder="粘贴你的 Starter 核心代码片段、Plan Mode 契约摘要，或 npx tsc --noEmit / npm test 验证输出（至少 10 字）..."
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-slate-300 font-medium">
                  GitHub PR / 附件链接（选填，需以 https:// 开头）
                </label>
                {blobUploadEnabled && (
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gemini-cyan/40 bg-gemini-cyan/10 text-gemini-cyan cursor-pointer hover:bg-gemini-cyan/20">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingBlob ? "上传中..." : "上传作业附件 (≤3MB)"}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".md,.txt,.pdf,.json,.zip,.png,.jpg,.jpeg,.webp"
                      disabled={uploadingBlob}
                      onChange={(e) => {
                        void handleFileUpload(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              <input
                type="url"
                value={artifactUrl}
                onChange={(e) => setArtifactUrl(e.target.value)}
                placeholder="https://github.com/username/repo/pull/1"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 font-mono text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={attachBugbotAudit}
                onChange={(e) => setAttachBugbotAudit(e.target.checked)}
              />
              <span>提交时自动附带本地 Bugbot 静态安全/DoD 检查快照（供老师快速初筛）</span>
            </label>

            {notice && (
              <div
                className={`p-3 rounded-xl border ${
                  notice.ok
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-400/40 bg-rose-500/10 text-rose-200"
                }`}
              >
                {notice.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "正在提交..." : "提交作业给指导老师"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
