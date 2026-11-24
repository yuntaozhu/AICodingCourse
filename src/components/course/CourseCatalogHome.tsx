import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Compass,
  Download,
  FileCode2,
  FolderGit2,
  GraduationCap,
  Layers,
  Play,
  Presentation as PresentationIcon,
} from "lucide-react";
import {
  MODULE_STAGE_LABELS,
  type ModuleProgressStage,
} from "@/data/projectTemplatesPublic";
import { MODULE_QUIZZES } from "@/data/moduleQuizzes";
import { getModuleTeachingPackage } from "@/data/moduleTeachingPackages";
import {
  COURSE_LABS,
  COURSE_TRACKS,
  LEARNER_PATHS,
  type LearnerPersonaId,
  type TrackId,
} from "@/data/courseCurriculum";
import { COURSE_SKILLS, getSkillById } from "@/data/courseSkills";
import {
  COURSE_MODULE_RECORDS,
  getDeliveryPlanMinutes,
  type CourseModuleRecord,
} from "@/data/courseUnitsModel";
import {
  formatModuleCodeFromId,
  getCourseOverallStats,
  getModuleCompletionStats,
  type CourseWorkspaceState,
  type WorkspaceQuizScoreSummary,
} from "@/data/courseWorkspaceStore";
import { fetchInstructorHandbookMarkdownApi } from "@/lib/apiClient";
import { RUNTIME_WORKSHOP_KNOWLEDGE_BASE } from "@/data/runtimeKnowledgeBase";
import { TEAM_KNOWLEDGE_BASE, type KnowledgeBaseTrack } from "@/data/teamKnowledgeBase";

interface CourseCatalogHomeProps {
  workspaceState: CourseWorkspaceState;
  completedLabIds: string[];
  quizAnswersByModule: Record<string, Record<string, number>>;
  latestQuizByModule?: Record<string, WorkspaceQuizScoreSummary>;
  moduleStageById?: Record<string, ModuleProgressStage>;
  hasPaidAccess?: boolean;
  isInstructorAuthorized?: boolean;
  onOpenBilling?: () => void;
  onOpenProjects?: () => void;
  onOpenModule: (moduleId: string, unitId?: string, planId?: string) => void;
  onApplyPlanPresetAll: (preset: "double" | "short" | "workshop" | "self") => void;
  onOpenKnowledgeBase: (moduleCode?: string, track?: KnowledgeBaseTrack) => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string }) => void;
}

export default function CourseCatalogHome({
  workspaceState,
  completedLabIds,
  quizAnswersByModule,
  latestQuizByModule = {},
  moduleStageById = {},
  hasPaidAccess = false,
  isInstructorAuthorized = false,
  onOpenBilling,
  onOpenProjects,
  onOpenModule,
  onApplyPlanPresetAll,
  onOpenKnowledgeBase,
  onSwitchToReveal,
}: CourseCatalogHomeProps) {
  const [selectedPathId, setSelectedPathId] = useState<LearnerPersonaId | "all">("all");
  const [selectedTrackId, setSelectedTrackId] = useState<TrackId | "all">("all");
  const [exportingHandbook, setExportingHandbook] = useState(false);
  const [handbookNotice, setHandbookNotice] = useState<string | null>(null);
  const canShowInstructor = isInstructorAuthorized && workspaceState.viewMode === "instructor";

  const overall = getCourseOverallStats(workspaceState);
  const overallPercent =
    overall.totalUnits > 0 ? Math.round((overall.completedUnits / overall.totalUnits) * 100) : 0;

  const activePath =
    selectedPathId === "all"
      ? null
      : LEARNER_PATHS.find((p) => p.id === selectedPathId) ?? null;

  const pathSet = activePath ? new Set(activePath.recommendedModuleIds) : null;
  const pathOrderMap = new Map<string, number>();
  if (activePath) {
    activePath.recommendedModuleIds.forEach((modId, index) => {
      pathOrderMap.set(modId, index + 1);
    });
  }

  const pathOrderedModules: CourseModuleRecord[] = pathSet
    ? [
        ...COURSE_MODULE_RECORDS.filter((m) => pathSet.has(m.id)).sort(
          (a, b) => (pathOrderMap.get(a.id) ?? 99) - (pathOrderMap.get(b.id) ?? 99)
        ),
        ...COURSE_MODULE_RECORDS.filter((m) => !pathSet.has(m.id)),
      ]
    : COURSE_MODULE_RECORDS;

  const orderedModules: CourseModuleRecord[] =
    selectedTrackId === "all"
      ? pathOrderedModules
      : pathOrderedModules.filter((m) => m.trackId === selectedTrackId);

  const verifiedSkillCount = COURSE_SKILLS.filter((sk) =>
    Boolean(workspaceState.verifiedSkills?.[sk.id])
  ).length;

  const lastVisitedModule = workspaceState.lastVisited
    ? COURSE_MODULE_RECORDS.find((m) => m.id === workspaceState.lastVisited?.moduleId)
    : undefined;

  const resumeLabel = lastVisitedModule
    ? `继续学习：${lastVisitedModule.code} ${lastVisitedModule.title.replace(/^Module\s+[\w-]+:\s*/i, "")}`
    : "从 M1 完整样板开始学习";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero + Resume Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gemini-cyan">
            <span>CODING EVERYTHING 项目学院 · 项目型编程工作台</span>
            <span className="text-slate-400">
              当前视角：{workspaceState.viewMode === "instructor" ? "教师备课视图" : "学员学习视图"}
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              业务问题 → 系统边界 → AI 协作 → 确定性验证 → 可维护数字资产
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              按「AI Coding 基本功（Track 1）→ 长程软件 Harness（Track 2）→ Agent 蓝图、运行时 KB 与双轨 Capstone（Track 3）」组织 14 个课程模块，并与 Starter Kit 项目交付、服务端静态审计、Eval 评测、只读助教 Tutor 与逐题 Exam 无缝联动。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (workspaceState.lastVisited) {
                  onOpenModule(
                    workspaceState.lastVisited.moduleId,
                    workspaceState.lastVisited.unitId,
                    workspaceState.lastVisited.planId
                  );
                } else {
                  onOpenModule("m1");
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs sm:text-sm hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              <span>{resumeLabel}</span>
            </button>

            {onOpenProjects && (
              <button
                type="button"
                onClick={onOpenProjects}
                className="px-4 py-2.5 rounded-xl bg-emerald-400/15 border border-emerald-400/45 text-emerald-200 hover:bg-emerald-400/25 transition-colors text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
              >
                <FolderGit2 className="w-4 h-4" />
                <span>进入项目学院 (Starter Kit / Eval / Tutor)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenKnowledgeBase()}
              className="px-4 py-2.5 rounded-xl bg-gemini-purple/20 border border-gemini-purple/40 text-purple-100 hover:bg-gemini-purple/30 transition-colors text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <BookMarked className="w-4 h-4 text-gemini-purple" />
              <span className="tabular-nums">
                进入知识库中心 (工程 {TEAM_KNOWLEDGE_BASE.length + workspaceState.customKbEntries.length} · 运行时 {RUNTIME_WORKSHOP_KNOWLEDGE_BASE.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchToReveal({ moduleId: lastVisitedModule?.id || "m1" })}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-slate-200 hover:bg-white/10 transition-colors text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <PresentationIcon className="w-4 h-4 text-gemini-cyan" />
              <span>打开 Reveal.js 幻灯片模式</span>
            </button>
          </div>
        </div>

        {/* Local Progress Summary */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gemini-cyan">本地学习进度概览</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {overallPercent}%
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={overallPercent}
              aria-label="课程整体单元完成率"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gemini-cyan to-gemini-purple transition-all duration-300"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            <dl className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <dt className="text-slate-400">教学单元完成</dt>
                <dd className="text-base font-bold font-mono text-white tabular-nums mt-0.5">
                  {overall.completedUnits}/{overall.totalUnits}
                </dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <dt className="text-slate-400">交互沙盘验收</dt>
                <dd className="text-base font-bold font-mono text-emerald-300 tabular-nums mt-0.5">
                  {completedLabIds.length}/{COURSE_LABS.length}
                </dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <dt className="text-slate-400">已保存产物/复盘</dt>
                <dd className="text-base font-bold font-mono text-gemini-cyan tabular-nums mt-0.5">
                  {overall.savedPracticeCount} 份
                </dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <dt className="text-slate-400">自建知识沉淀</dt>
                <dd className="text-base font-bold font-mono text-purple-200 tabular-nums mt-0.5">
                  {overall.customKbCount} 条
                </dd>
              </div>
            </dl>
          </div>
          <div className="text-[11px] font-mono text-slate-400 leading-relaxed">
            {hasPaidAccess
              ? "已开通云端账号同步：学习进度、测验记录与技能档案自动持久化到云端数据库。"
              : "未登录/免费体验状态下支持 M1 完整试学；登录并开通会员或小班权益后自动解锁 M2–M13-Eng 及云端同步。"}
          </div>
        </div>
      </section>

      {/* Skill Readiness Summary Bar */}
      <section className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-semibold text-white">
            前置技能就绪度与能力核验门禁 ({verifiedSkillCount}/{COURSE_SKILLS.length} 已核验)
          </div>
          <span className="font-mono text-[11px] text-amber-300">
            完成 M3 不会自动授予后端鉴权或项目迭代技能，须提交可核验 Starter 证据、通过 2 题诊断或路径基线豁免
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          {COURSE_SKILLS.map((sk) => {
            const verified = workspaceState.verifiedSkills?.[sk.id];
            const waivedByPath = activePath?.assumedBaselineSkillIds.includes(sk.id);
            const skillTargetModuleMap: Record<string, string> = {
              "skill-cli-basics": "m5",
              "skill-git-pr-ci": "m6",
              "skill-fullstack-boundary": "m9",
              "skill-backend-api-auth": "m3",
              "skill-ai-project-exp": "m3",
            };
            const targetMod = sk.remediationModuleId || skillTargetModuleMap[sk.id] || "m5";
            return (
              <button
                key={sk.id}
                type="button"
                onClick={() => onOpenModule(targetMod)}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer space-y-1 ${
                  verified
                    ? "bg-emerald-500/10 border-emerald-400/35 text-emerald-100"
                    : waivedByPath
                    ? "bg-gemini-cyan/10 border-gemini-cyan/35 text-slate-100"
                    : "bg-white/[0.025] border-white/10 text-slate-300 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                  <span className="truncate">{sk.shortLabel}</span>
                  <span
                    className={
                      verified
                        ? "text-emerald-300 shrink-0"
                        : waivedByPath
                        ? "text-gemini-cyan shrink-0"
                        : "text-amber-300 shrink-0"
                    }
                  >
                    {verified ? "已核验" : waivedByPath ? "路径豁免" : "待核验"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  点击前往 {formatModuleCodeFromId(targetMod)} 核验 →
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Learner Paths Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="w-4 h-4 text-gemini-cyan" />
            <span>按学习者背景与角色筛选推荐路径（已通过 DAG + 双层能力闭合验证）</span>
          </div>
          {activePath && (
            <button
              type="button"
              onClick={() => setSelectedPathId("all")}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              显示全部 {COURSE_MODULE_RECORDS.length} 模块顺序
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPathId("all")}
            className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
              selectedPathId === "all"
                ? "bg-white/10 border-gemini-cyan text-white"
                : "bg-[#0b0f19] border-white/10 text-slate-300 hover:border-white/25"
            }`}
          >
            <div className="text-xs font-semibold">完整全栈路径 (M1–M13-Eng)</div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              浏览全部 {COURSE_MODULE_RECORDS.length} 个模块、{COURSE_LABS.length} 个沙盘与双轨 Capstone。
            </div>
          </button>

          {LEARNER_PATHS.map((lp) => {
            const isActive = selectedPathId === lp.id;
            return (
              <button
                key={lp.id}
                type="button"
                onClick={() => setSelectedPathId(lp.id)}
                className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                  isActive
                    ? "bg-gemini-cyan/12 border-gemini-cyan text-white"
                    : "bg-[#0b0f19] border-white/10 text-slate-300 hover:border-white/25"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{lp.label}</span>
                  <span className="text-[10px] font-mono text-gemini-cyan tabular-nums">
                    {lp.recommendedModuleIds.length} 模块
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {lp.goal}
                </div>
              </button>
            );
          })}
        </div>

        {activePath && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-gemini-cyan/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1.5">
              <div className="font-semibold text-white">
                {activePath.label}推荐路线 · 建议时长 {activePath.estimatedTotalHours} · 目标终点：
                {activePath.capstoneTargetId === "m13-gov"
                  ? "M13-Gov（无代码产品与治理 Capstone）"
                  : "M13-Eng（生产级工程 Capstone）"}
              </div>
              <div className="text-slate-300">里程碑：{activePath.keyMilestone}</div>
              <div className="text-slate-400 font-mono text-[11px]">
                默认入场基线模块：
                {activePath.assumedBaselineIds.length > 0
                  ? activePath.assumedBaselineIds.map((id) => id.toUpperCase()).join(", ")
                  : "无（从零修习）"}{" "}
                · 默认技能基线：
                {activePath.assumedBaselineSkillIds.length > 0
                  ? activePath.assumedBaselineSkillIds
                      .map((sid) => getSkillById(sid)?.shortLabel || sid)
                      .join(" / ")
                  : "无（全量核验）"}
              </div>
              <div className="text-amber-300/90">安全红线：{activePath.focusBoundary}</div>
            </div>
            <button
              type="button"
              onClick={() => onSwitchToReveal({ labId: activePath.starterLabId })}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 text-white font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              直达起点沙盘 →
            </button>
          </div>
        )}
      </section>

      {/* Track 3 Dual-Capstone Comparison Strip */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-amber-400/30 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono text-amber-300 font-semibold">
              Track 3 分流 A · M13-Gov（无代码产品与治理 Capstone）
            </div>
            <p className="text-slate-300 leading-relaxed">
              面向产品经理与非技术学习者，基于 M11 双 PRD 与预制执行轨迹完成模拟治理评审，不强求先修 M12 工程实现。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenModule("m13-gov")}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            进入 M13-Gov
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b0f19] border border-emerald-400/30 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono text-emerald-300 font-semibold">
              Track 3 分流 B · M13-Eng（生产级 Agent 与 KB 工程 Capstone）
            </div>
            <p className="text-slate-300 leading-relaxed">
              面向独立开发者、工程团队与高校学生，打通 M8 长程 Coding Harness + M12 ACL/Tombstone 运行时服务 + Dual Eval。
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenModule("m13-eng")}
            className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-semibold cursor-pointer whitespace-nowrap shrink-0"
          >
            进入 M13-Eng
          </button>
        </div>
      </section>

      {/* Module Catalog Grid */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-gemini-purple" />
            <span>
              课程模块目录（全 {COURSE_MODULE_RECORDS.length} 模块均配备教学闭环单元）
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Track 仅为学习视图分组，不改变模块级真实先修 DAG 依赖
          </span>
        </div>

        {/* Track Filter Pills (Display View Only) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTrackId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              selectedTrackId === "all"
                ? "bg-gemini-cyan text-slate-950 font-semibold"
                : "bg-[#0b0f19] border border-white/12 text-slate-300 hover:bg-white/10"
            }`}
          >
            全部 14 模块
          </button>
          {COURSE_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => setSelectedTrackId(track.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                selectedTrackId === track.id
                  ? "bg-gemini-purple text-white font-semibold"
                  : "bg-[#0b0f19] border border-white/12 text-slate-300 hover:bg-white/10"
              }`}
            >
              {track.title} ({track.moduleIds.length})
            </button>
          ))}
        </div>

        {/* Batch Delivery Rhythm Preset Bar */}
        <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-mono text-slate-300">
            全局授课/学习方案一键预设：
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "double", label: "双课时完整版" },
                { id: "short", label: "短讲精要" },
                { id: "workshop", label: "工作坊实战" },
                { id: "self", label: "自主学习" },
              ] as const
            ).map((preset) => {
              const allMatch = COURSE_MODULE_RECORDS.every((m) => {
                const chosen =
                  workspaceState.selectedPlanByModule[m.id] || m.deliveryPlans[0]?.id;
                return chosen?.endsWith(`-plan-${preset.id}`);
              });
              const totalMinutes = COURSE_MODULE_RECORDS.reduce((sum, m) => {
                const plan = m.deliveryPlans.find((p) => p.id.endsWith(`-plan-${preset.id}`));
                return sum + (plan ? getDeliveryPlanMinutes(m, plan) : 0);
              }, 0);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPlanPresetAll(preset.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                    allMatch
                      ? "bg-gemini-cyan/20 border-gemini-cyan text-white font-semibold"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {preset.label} · 约 {totalMinutes}m
                </button>
              );
            })}
            {canShowInstructor && (
              <button
                type="button"
                disabled={exportingHandbook}
                onClick={async () => {
                  setExportingHandbook(true);
                  setHandbookNotice(null);
                  try {
                    const res = await fetchInstructorHandbookMarkdownApi(
                      workspaceState.selectedPlanByModule
                    );
                    try {
                      const blob = new Blob([res.markdown], { type: "text/markdown;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = res.filename || `AICodingCourse-全课教师备课手册-${new Date().toISOString().slice(0, 10)}.md`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch {
                      await navigator.clipboard?.writeText(res.markdown);
                    }
                  } catch (err) {
                    setHandbookNotice(
                      err instanceof Error ? err.message : "导出全课备课手册失败，请确认讲师权限。"
                    );
                  } finally {
                    setExportingHandbook(false);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-gemini-purple/20 hover:bg-gemini-purple/30 border border-gemini-purple/45 text-xs text-purple-100 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
                title={`按当前各模块已选授课方案导出全课 ${COURSE_MODULE_RECORDS.length} 模块备课手册 (.md)`}
              >
                <Download className="w-3.5 h-3.5 text-gemini-purple" />
                <span>{exportingHandbook ? "导出中..." : "导出全课备课手册 (.md)"}</span>
              </button>
            )}
          </div>
        </div>
        {handbookNotice && (
          <div className="text-xs text-amber-300 font-mono">{handbookNotice}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderedModules.map((mod) => {
            const isRecommended = !pathSet || pathSet.has(mod.id);
            const activePlanId =
              workspaceState.selectedPlanByModule[mod.id] || mod.deliveryPlans[0]?.id;
            const activePlan =
              mod.deliveryPlans.find((p) => p.id === activePlanId) || mod.deliveryPlans[0];
            const stats = getModuleCompletionStats(mod, workspaceState, activePlan?.id);
            const cleanTitle = mod.title.replace(/^Module\s+[\w-]+:\s*/i, "");
            const modLabsDone = mod.labIds.filter((lid) => completedLabIds.includes(lid)).length;
            const teachingPkg = getModuleTeachingPackage(mod.id);
            const modQuiz = MODULE_QUIZZES[mod.id];
            const modQuizAnswers =
              quizAnswersByModule[mod.id] ??
              (mod.order <= 10 ? quizAnswersByModule[String(mod.order)] : undefined) ??
              {};
            const latestGrade = latestQuizByModule[mod.id];
            const answeredQuizCount = modQuiz
              ? modQuiz.questions.filter((q) => typeof modQuizAnswers[q.id] === "number").length
              : 0;

            return (
              <article
                key={mod.id}
                className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between gap-4 ${
                  mod.exemplarLevel === "complete-exemplar"
                    ? "bg-[#0d1322] border-gemini-cyan/45"
                    : isRecommended
                    ? "bg-[#0b0f19] border-white/12 hover:border-white/25"
                    : "bg-[#080b12] border-white/5 opacity-75"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Inline Text (No static pill badges) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span className="text-gemini-cyan font-semibold">
                      {pathOrderMap.has(mod.id) ? `第${pathOrderMap.get(mod.id)}站 · ` : ""}
                      {mod.code} ·{" "}
                      {mod.exemplarLevel === "complete-exemplar"
                        ? "专项精修样板"
                        : "全闭环教学包映射"}
                    </span>
                    <span className="text-slate-400">
                      {mod.units.length} 单元 ·{" "}
                      {activePlan ? `${getDeliveryPlanMinutes(mod, activePlan)} 分钟` : ""} ·{" "}
                      <span
                        className={
                          mod.status === "needs-review" ? "text-amber-300" : "text-emerald-300"
                        }
                      >
                        {mod.status === "needs-review" ? "随版本待复核" : "已核验"}
                      </span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {cleanTitle}
                    </h2>
                    <div className="text-xs text-slate-400 mt-1">
                      先修：{mod.prerequisites.join("；")}
                      {mod.prerequisiteSkillIds.length > 0 && (
                        <span className="text-amber-300/90">
                          {" "}
                          · 能力门禁：
                          {mod.prerequisiteSkillIds
                            .map((sid) => getSkillById(sid)?.shortLabel || sid)
                            .join(" / ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Observable Learning Objectives */}
                  <ul className="space-y-1 text-xs text-slate-200 leading-relaxed">
                    {mod.learningObjectives.slice(0, 2).map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Delivery Plan Preview */}
                  <div className="text-[11px] text-slate-400 font-mono">
                    可选授课方案：{mod.deliveryPlans.map((p) => p.shortLabel).join(" / ")}
                  </div>

                  {/* Instructor Prep Quick Strip (Strictly hidden unless authorized instructor/admin) */}
                  {canShowInstructor && teachingPkg && (
                    <div className="p-2.5 rounded-xl bg-gemini-purple/10 border border-gemini-purple/35 text-[11px] space-y-1">
                      <div className="font-mono text-purple-200 inline-flex items-center gap-1 font-semibold">
                        <GraduationCap className="w-3.5 h-3.5 text-gemini-purple" />
                        <span>教师备课速览 · 核心问题：{teachingPkg.coreQuestion}</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        授课节奏：{teachingPkg.deliveryModes.map((dm) => dm.label).join(" · ")}（进入模块后可导出完整教师讲义）
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress + Actions */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-300 tabular-nums">
                    <span>
                      当前方案进度 ({activePlan?.shortLabel})：{stats.completedCount}/
                      {stats.totalCount} 单元
                      {moduleStageById[mod.id] && moduleStageById[mod.id] !== "not_started"
                        ? ` · ${MODULE_STAGE_LABELS[moduleStageById[mod.id]]}`
                        : ""}
                    </span>
                    <span className="text-slate-400">
                      {mod.id !== "m1" && !hasPaidAccess ? (
                        <span className="text-amber-300">会员/班级权益解锁</span>
                      ) : mod.labIds.length > 0 ? (
                        `沙盘 ${modLabsDone}/${mod.labIds.length}`
                      ) : (
                        "无外挂沙盘（蓝图练习单）"
                      )}
                      {modQuiz && (mod.id === "m1" || hasPaidAccess)
                        ? latestGrade
                          ? ` · 测验 ${latestGrade.correctCount}/${latestGrade.totalCount}`
                          : answeredQuizCount > 0
                          ? ` · 测验已答 ${answeredQuizCount}/${modQuiz.questions.length}`
                          : ""
                        : ""}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {mod.id === "m1" || hasPaidAccess ? (
                      <button
                        type="button"
                        onClick={() => onOpenModule(mod.id, undefined, activePlan?.id)}
                        className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <span>{mod.id === "m1" && !hasPaidAccess ? "免费试学本模块" : "进入学习单元"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => (onOpenBilling ? onOpenBilling() : onOpenModule(mod.id))}
                        className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-gemini-purple/25 border border-gemini-purple/50 text-purple-100 font-semibold text-xs hover:bg-gemini-purple/35 transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <span>开通权益 / 兑换解锁</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onOpenKnowledgeBase(
                          mod.code,
                          mod.trackId === "agent-runtime" ? "runtime-domain" : "engineering"
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-gemini-purple" />
                      <span>{mod.trackId === "agent-runtime" ? "运行时工作坊" : "工程知识库"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSwitchToReveal({ moduleId: mod.id })}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-medium cursor-pointer whitespace-nowrap"
                    >
                      Reveal 幻灯片
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
