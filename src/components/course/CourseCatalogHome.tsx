import { useState } from "react";
import {
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Compass,
  FileCode2,
  Layers,
  Play,
  Presentation as PresentationIcon,
} from "lucide-react";
import {
  COURSE_LABS,
  LEARNER_PATHS,
  type LearnerPersonaId,
} from "@/data/courseCurriculum";
import {
  COURSE_MODULE_RECORDS,
  getDeliveryPlanMinutes,
  type CourseModuleRecord,
} from "@/data/courseUnitsModel";
import {
  getCourseOverallStats,
  getModuleCompletionStats,
  type CourseWorkspaceState,
} from "@/data/courseWorkspaceStore";
import { TEAM_KNOWLEDGE_BASE } from "@/data/teamKnowledgeBase";

interface CourseCatalogHomeProps {
  workspaceState: CourseWorkspaceState;
  completedLabIds: string[];
  onOpenModule: (moduleId: string, unitId?: string, planId?: string) => void;
  onOpenKnowledgeBase: (moduleCode?: string) => void;
  onSwitchToReveal: (target: { moduleId?: string; labId?: string }) => void;
}

export default function CourseCatalogHome({
  workspaceState,
  completedLabIds,
  onOpenModule,
  onOpenKnowledgeBase,
  onSwitchToReveal,
}: CourseCatalogHomeProps) {
  const [selectedPathId, setSelectedPathId] = useState<LearnerPersonaId | "all">("all");

  const overall = getCourseOverallStats(workspaceState);
  const overallPercent =
    overall.totalUnits > 0 ? Math.round((overall.completedUnits / overall.totalUnits) * 100) : 0;

  const activePath =
    selectedPathId === "all"
      ? null
      : LEARNER_PATHS.find((p) => p.id === selectedPathId) ?? null;

  const pathSet = activePath ? new Set(activePath.recommendedModuleIds) : null;

  const orderedModules: CourseModuleRecord[] = pathSet
    ? [
        ...COURSE_MODULE_RECORDS.filter((m) => pathSet.has(m.id)),
        ...COURSE_MODULE_RECORDS.filter((m) => !pathSet.has(m.id)),
      ]
    : COURSE_MODULE_RECORDS;

  const lastVisitedModule = workspaceState.lastVisited
    ? COURSE_MODULE_RECORDS.find((m) => m.id === workspaceState.lastVisited?.moduleId)
    : undefined;

  const resumeLabel = lastVisitedModule
    ? `继续学习：${lastVisitedModule.code} ${lastVisitedModule.title.replace(/^Module \d+:\s*/i, "")}`
    : "从 M1 完整样板开始学习";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero + Resume Card */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gemini-cyan">
            <span>AI CODING 工程化交互式课程系统 (MVP)</span>
            <span className="text-slate-400">
              当前视角：{workspaceState.viewMode === "instructor" ? "教师备课视图" : "学员学习视图"}
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              课程内容管理 · 课堂呈现 · 人机练习 · 知识沉淀
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              按「意图定义 → 人机边界 → 故意暴露错误与约束纠偏 → DoD/Rubric 验收 → 团队知识库沉淀」组织 10 个课程模块。支持按短讲、工作坊、双课时与自主学习动态重组单元顺序，并与原有 Reveal.js 幻灯片及 16 个交互沙盘无缝并存。
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

            <button
              type="button"
              onClick={() => onOpenKnowledgeBase()}
              className="px-4 py-2.5 rounded-xl bg-gemini-purple/20 border border-gemini-purple/40 text-purple-100 hover:bg-gemini-purple/30 transition-colors text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
            >
              <BookMarked className="w-4 h-4 text-gemini-purple" />
              <span className="tabular-nums">
                进入知识库中心 ({TEAM_KNOWLEDGE_BASE.length + workspaceState.customKbEntries.length} 条)
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
            所有学习进度、DoD 勾选、练习复盘与自建知识条目均存储在当前浏览器本地（无账号/无数据库要求，无 API Key 亦可完整学习）。
          </div>
        </div>
      </section>

      {/* Learner Paths Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Compass className="w-4 h-4 text-gemini-cyan" />
            <span>按学习者背景与角色筛选推荐路径</span>
          </div>
          {activePath && (
            <button
              type="button"
              onClick={() => setSelectedPathId("all")}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              显示全部 10 模块顺序
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
            <div className="text-xs font-semibold">完整全栈路径 (M1–M10)</div>
            <div className="text-[11px] text-slate-400 leading-relaxed">
              按课程标准顺序浏览全 10 个模块、16 个沙盘与完整闭环。
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
            <div className="space-y-1">
              <div className="font-semibold text-white">
                {activePath.label}推荐路线 · 建议时长 {activePath.estimatedTotalHours} · 核心里程碑：
                {activePath.keyMilestone}
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

      {/* Module Catalog Grid */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Layers className="w-4 h-4 text-gemini-purple" />
            <span>课程模块目录（M1 完整结构样板 · M2–M10 兼容适配）</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            每个模块均支持短讲 / 工作坊 / 双课时 / 自主学习方案动态切换
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orderedModules.map((mod) => {
            const isRecommended = !pathSet || pathSet.has(mod.id);
            const activePlanId =
              workspaceState.selectedPlanByModule[mod.id] || mod.deliveryPlans[0]?.id;
            const activePlan =
              mod.deliveryPlans.find((p) => p.id === activePlanId) || mod.deliveryPlans[0];
            const stats = getModuleCompletionStats(mod, workspaceState, activePlan?.id);
            const cleanTitle = mod.title.replace(/^Module \d+:\s*/i, "");
            const modLabsDone = mod.labIds.filter((lid) => completedLabIds.includes(lid)).length;

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
                      {mod.code} ·{" "}
                      {mod.exemplarLevel === "complete-exemplar"
                        ? "MVP 完整单元样板"
                        : "兼容课程模块"}
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
                </div>

                {/* Progress + Actions */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-300 tabular-nums">
                    <span>
                      当前方案进度 ({activePlan?.shortLabel})：{stats.completedCount}/
                      {stats.totalCount} 单元
                    </span>
                    <span className="text-slate-400">
                      沙盘 {modLabsDone}/{mod.labIds.length} · 资源 {mod.resourceIds.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenModule(mod.id, undefined, activePlan?.id)}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <span>进入学习单元</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenKnowledgeBase(mod.code)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-gemini-purple" />
                      <span>知识库</span>
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
