import { useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldAlert, XCircle } from "lucide-react";
import { COURSE_LABS } from "@/data/courseCurriculum";
import {
  loadLabChecklist,
  saveLabChecklist,
  type LabAuditReport,
} from "@/data/labPracticeEngine";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface LabPracticePanelProps {
  labId: string;
  auditReport: LabAuditReport;
  auditTitle: string;
}

export default function LabPracticePanel({
  labId,
  auditReport,
  auditTitle,
}: LabPracticePanelProps) {
  const lab = COURSE_LABS.find((l) => l.id === labId);
  const [checklist, setChecklist] = useState<Record<number, boolean>>(() =>
    loadLabChecklist(labId)
  );

  if (!lab) {
    return null;
  }

  const toggleItem = (idx: number) => {
    setChecklist((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      saveLabChecklist(labId, next);
      return next;
    });
  };

  const completedCount = lab.acceptanceCriteria.filter((_, idx) => Boolean(checklist[idx])).length;
  const totalCount = lab.acceptanceCriteria.length;
  const auditPassedCount = auditReport.checks.filter((c) => c.passed).length;

  return (
    <div
      className="grid grid-cols-12 gap-4 items-stretch text-xs"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Left 7 cols: Real-time Audit + Practice Brief + Failure Modes */}
      <div className="col-span-7 flex flex-col gap-2.5">
        <div className="rounded-xl bg-black/45 border border-white/10 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-gemini-cyan font-semibold">{auditTitle}</span>
            <span className="font-mono tabular-nums text-slate-300">
              自动审计 {auditPassedCount}/{auditReport.checks.length} · 得分{" "}
              <strong
                className={
                  auditReport.score >= 80
                    ? "text-emerald-300"
                    : auditReport.score >= 60
                    ? "text-amber-300"
                    : "text-rose-300"
                }
              >
                {auditReport.score}
              </strong>
              /100
            </span>
          </div>

          <div className="space-y-1.5">
            {auditReport.checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start justify-between gap-2 text-[11px] leading-snug"
              >
                <div className="flex items-start gap-1.5 min-w-0">
                  {check.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className={check.passed ? "text-slate-200" : "text-rose-200"}>
                    {check.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {check.passed ? "通过" : "待修"} · {check.detail}
                </span>
              </div>
            ))}
          </div>

          {auditReport.warnings.length > 0 && (
            <div className="pt-1.5 border-t border-white/10 space-y-1">
              {auditReport.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-1.5 text-[11px] text-amber-300 leading-relaxed"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-black/35 border border-white/10 p-2.5 space-y-1">
            <div className="font-mono text-[11px] text-slate-400">
              实验目标与交付物 · {lab.estimatedMinutes} 分钟 ·{" "}
              {lab.cost === "free" ? "零外部费用" : "可选调用 API"}
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{lab.goal}</p>
            <div className="text-[11px] text-gemini-cyan/90 pt-0.5">
              交付：{lab.deliverables.join("；")}
            </div>
          </div>

          <div className="rounded-xl bg-black/35 border border-white/10 p-2.5 space-y-1">
            <div className="font-mono text-[11px] text-amber-300">常见失败模式与排查</div>
            <ul className="space-y-1 text-[11px] text-slate-300 leading-relaxed">
              {lab.failureModes.map((fm, idx) => (
                <li key={idx}>· {fm}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right 5 cols: Persistent DoD Acceptance Checklist */}
      <div className="col-span-5 flex flex-col rounded-xl bg-black/55 border border-white/10 p-3 justify-between gap-2.5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <ClipboardCheck className="w-4 h-4 text-emerald-400" />
              <span>DoD 验收清单</span>
            </div>
            <span className="font-mono text-[11px] tabular-nums text-emerald-300">
              {completedCount}/{totalCount} 已完成
            </span>
          </div>

          <div className="space-y-1.5">
            {lab.acceptanceCriteria.map((criterion, idx) => {
              const checked = Boolean(checklist[idx]);
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "bg-emerald-500/10 border-emerald-400/35 text-emerald-100"
                      : "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(idx)}
                    className="mt-0.5 accent-[#34d399] rounded shrink-0"
                  />
                  <span className="text-[11px] leading-relaxed">{criterion}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.03] border border-white/10 p-2 text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
          <span>
            {lab.safetyNotes.join(" ")} 验收勾选状态仅保存在当前浏览器 localStorage。
          </span>
        </div>
      </div>
    </div>
  );
}
