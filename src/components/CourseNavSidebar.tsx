import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  Copy,
  FlaskConical,
  PanelLeftClose,
  RotateCcw,
} from "lucide-react";
import type { ModuleNavItem } from "@/components/Presentation";
import SidebarPerformanceMonitor from "@/components/SidebarPerformanceMonitor";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";
import {
  COURSE_LABS,
  COURSE_MODULES,
  LEARNER_PATHS,
  type LearnerPersonaId,
  type ModuleShortCode,
} from "@/data/courseCurriculum";
import {
  buildEngineeringHandoffMarkdown,
  getCompletedLabIds,
  loadAllLabDodProgress,
  loadLabArtifacts,
} from "@/data/labPracticeEngine";
import { getModuleTeachingPackage } from "@/data/moduleTeachingPackages";
import { getKnowledgeEntriesForModule } from "@/data/teamKnowledgeBase";
import { getRuntimeKnowledgeEntriesForModule } from "@/data/runtimeKnowledgeBase";

interface CourseNavSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleNavItem[];
  activeModuleIndex: number;
  completedModuleIds: string[];
  currentH: number;
  totalH: number;
  onSelectModule: (startIndex: number) => void;
  onResetProgress: () => void;
}

type PathFilter = "all" | LearnerPersonaId;

const PATH_STORAGE_KEY = "cursor_course_learner_path_v1";

function loadSavedPath(): PathFilter {
  if (typeof window === "undefined") return "all";
  try {
    const val = window.localStorage.getItem(PATH_STORAGE_KEY);
    if (
      val === "all" ||
      val === "indie-dev" ||
      val === "eng-team" ||
      val === "non-tech" ||
      val === "cs-student"
    ) {
      return val;
    }
    return "all";
  } catch {
    return "all";
  }
}

function savePath(val: PathFilter) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PATH_STORAGE_KEY, val);
  } catch {
    // Ignore storage errors
  }
}

export default function CourseNavSidebar({
  isOpen,
  onClose,
  modules,
  activeModuleIndex,
  completedModuleIds,
  currentH,
  totalH,
  onSelectModule,
  onResetProgress,
}: CourseNavSidebarProps) {
  const [selectedPath, setSelectedPath] = useState<PathFilter>(() => loadSavedPath());
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [completedLabIds, setCompletedLabIds] = useState<string[]>(() =>
    getCompletedLabIds(loadAllLabDodProgress())
  );
  const [copiedHandoff, setCopiedHandoff] = useState(false);

  useEffect(() => {
    const syncLabs = () => {
      setCompletedLabIds(getCompletedLabIds(loadAllLabDodProgress()));
    };
    window.addEventListener("course:lab-progress-updated", syncLabs);
    window.addEventListener("storage", syncLabs);
    return () => {
      window.removeEventListener("course:lab-progress-updated", syncLabs);
      window.removeEventListener("storage", syncLabs);
    };
  }, []);

  const totalModules = modules.length;
  const currentModule = modules[activeModuleIndex];
  const modulePercent =
    totalModules > 0 ? Math.round(((activeModuleIndex + 1) / totalModules) * 100) : 0;
  const completedCount = modules.filter((m) => completedModuleIds.includes(m.id)).length;

  const activePathDef =
    selectedPath === "all"
      ? null
      : LEARNER_PATHS.find((p) => p.id === selectedPath) ?? null;

  const handleSelectPath = (path: PathFilter) => {
    setSelectedPath(path);
    savePath(path);
  };

  const handleJumpLab = (labId: string) => {
    window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId } }));
  };

  const handleOpenModuleResources = (moduleCode: ModuleShortCode) => {
    window.dispatchEvent(
      new CustomEvent("course:open-resources", { detail: { moduleCode } })
    );
  };

  const handleOpenModuleTeamKb = (moduleCode: ModuleShortCode) => {
    window.dispatchEvent(
      new CustomEvent("course:open-team-kb", { detail: { moduleCode } })
    );
  };

  const pathOrderMap = new Map<string, number>();
  if (activePathDef) {
    activePathDef.recommendedModuleIds.forEach((modId, index) => {
      pathOrderMap.set(modId, index + 1);
    });
  }

  const orderedModules = activePathDef
    ? [
        ...modules
          .filter((m) => pathOrderMap.has(m.id))
          .sort((a, b) => (pathOrderMap.get(a.id) ?? 99) - (pathOrderMap.get(b.id) ?? 99)),
        ...modules.filter((m) => !pathOrderMap.has(m.id)),
      ]
    : modules;

  const firstPathModule = activePathDef
    ? modules.find((m) => m.id === activePathDef.recommendedModuleIds[0])
    : undefined;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="课程模块侧边栏导航"
        aria-hidden={!isOpen}
        onWheel={stopRevealWheel}
        onKeyDown={stopRevealKey}
        className={`fixed lg:relative inset-y-0 left-0 z-40 lg:z-20 shrink-0 bg-[#070a12]/96 backdrop-blur-md border-white/10 flex flex-col transition-all duration-200 ease-out overflow-hidden ${
          isOpen
            ? "w-76 border-r translate-x-0"
            : "w-76 lg:w-0 -translate-x-full lg:translate-x-0 border-r-0 pointer-events-none"
        }`}
      >
        <div className="w-76 h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="text-xs font-mono tracking-wider text-gemini-cyan">
                课程导航与学习路径
              </div>
              <h2 className="text-sm font-semibold text-white truncate">
                AI Coding 工程化目录
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="收起侧边栏导航"
              aria-label="收起侧边栏导航"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Course Progress Bar */}
          <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] shrink-0">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-xs text-slate-300 font-medium">
                当前模块课程占比
              </span>
              <span className="text-base font-bold font-mono text-gemini-cyan tabular-nums">
                {modulePercent}%
              </span>
            </div>

            <div
              className="h-2 w-full rounded-full bg-white/10 overflow-hidden"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={modulePercent}
              aria-label="当前所属模块在整个课程中的百分比"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gemini-cyan to-gemini-purple transition-all duration-300 ease-out"
                style={{ width: `${modulePercent}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
              <span>
                模块 {completedCount}/{totalModules}
              </span>
              <span>
                实操验收 {completedLabIds.length}/{COURSE_LABS.length}
              </span>
            </div>

            {currentModule && (
              <div className="mt-1 text-[11px] text-slate-400 truncate" title={currentModule.title}>
                当前：{currentModule.label}
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                const md = buildEngineeringHandoffMarkdown({
                  pathLabel: activePathDef?.label,
                  completedModuleIds,
                  completedLabIds,
                  artifacts: loadLabArtifacts(),
                });
                try {
                  await navigator.clipboard.writeText(md);
                  setCopiedHandoff(true);
                  window.setTimeout(() => setCopiedHandoff(false), 2000);
                } catch {
                  setCopiedHandoff(false);
                }
              }}
              title="汇总 Lab 01–03 的规格蓝图、.mdc 规则、.cursor/mcp.json 与 DoD 清单"
              className={`mt-2 w-full px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                copiedHandoff
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                  : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {copiedHandoff ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已复制工程交付包 (.md)</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                  <span>复制我的工程交付包 (.md)</span>
                </>
              )}
            </button>
          </div>

          {/* Learner Persona Path Switcher */}
          <div className="px-3 py-2.5 border-b border-white/10 bg-[#090d16] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1 font-medium">
                <Compass className="w-3.5 h-3.5 text-gemini-cyan" />
                按学习者角色筛选路径
              </span>
              {activePathDef && (
                <button
                  type="button"
                  onClick={() => handleSelectPath("all")}
                  className="text-[11px] text-slate-400 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                >
                  恢复全部
                </button>
              )}
            </div>

            <div
              className="grid grid-cols-5 gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/10"
              role="tablist"
              aria-label="学习者角色路径切换"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedPath === "all"}
                onClick={() => handleSelectPath("all")}
                className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
                  selectedPath === "all"
                    ? "bg-white text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                全部
              </button>
              {LEARNER_PATHS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedPath === p.id}
                  onClick={() => handleSelectPath(p.id)}
                  title={p.label}
                  className={`px-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap truncate ${
                    selectedPath === p.id
                      ? "bg-gemini-cyan text-slate-950 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {p.id === "indie-dev"
                    ? "独立"
                    : p.id === "eng-team"
                    ? "团队"
                    : p.id === "non-tech"
                    ? "PM"
                    : "学生"}
                </button>
              ))}
            </div>

            {activePathDef && (
              <div className="rounded-lg bg-white/[0.03] border border-gemini-cyan/25 p-2 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{activePathDef.label}</span>
                  <span className="font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                    {activePathDef.recommendedModuleIds.length} 模块 · {activePathDef.estimatedTotalHours}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{activePathDef.goal}</p>
                <p className="text-amber-300/90 leading-relaxed">
                  安全边界：{activePathDef.focusBoundary}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {firstPathModule && (
                    <button
                      type="button"
                      onClick={() => onSelectModule(firstPathModule.startIndex)}
                      className="flex-1 px-2 py-1 rounded bg-gemini-cyan text-slate-950 font-semibold text-[11px] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap truncate"
                    >
                      从首站 {firstPathModule.id.toUpperCase()} 开始
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleJumpLab(activePathDef.starterLabId)}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    起点沙盘
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Module List */}
          <nav
            aria-label="课程模块列表"
            className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2.5 space-y-1.5"
          >
            {orderedModules.map((mod, renderIdx) => {
              const originalIndex = modules.findIndex((m) => m.id === mod.id);
              const isActive = originalIndex === activeModuleIndex;
              const isCompleted = completedModuleIds.includes(mod.id);
              const shortTitle = mod.title.replace(/^Module\s+[\w-]+:\s*/i, "");
              const meta = COURSE_MODULES.find((cm) => cm.id === mod.id);
              const pathStep = pathOrderMap.get(mod.id);
              const isOutOfPath = Boolean(activePathDef && !pathStep);
              const prevMod = renderIdx > 0 ? orderedModules[renderIdx - 1] : null;
              const showOutOfPathDivider = Boolean(
                activePathDef && isOutOfPath && prevMod && pathOrderMap.has(prevMod.id)
              );
              const isExpanded = expandedModuleId === mod.id;
              const moduleLabs = meta
                ? COURSE_LABS.filter((lab) => meta.labIds.includes(lab.id))
                : [];
              const teachingPkg = meta ? getModuleTeachingPackage(meta.id) : undefined;
              const isRuntimeMeta = meta?.trackId === "agent-runtime";
              const teamKbCount = meta
                ? (isRuntimeMeta
                    ? getRuntimeKnowledgeEntriesForModule(meta.code)
                    : getKnowledgeEntriesForModule(meta.code)
                  ).length
                : 0;

              return (
                <div key={mod.id}>
                  {showOutOfPathDivider && (
                    <div className="px-2 pt-2 pb-1 text-[10px] font-mono text-slate-500 border-t border-white/10 mt-1">
                      路径外可扩展阅读模块
                    </div>
                  )}

                  <div
                    className={`rounded-xl border transition-colors ${
                      isActive
                        ? "bg-gemini-cyan/12 border-gemini-cyan/45 text-white"
                        : isCompleted
                        ? "bg-white/[0.025] border-white/8 text-slate-200"
                        : isOutOfPath
                        ? "bg-transparent border-transparent text-slate-500"
                        : "bg-transparent border-white/5 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-1.5 px-2.5 py-2">
                      <button
                        type="button"
                        onClick={() => onSelectModule(mod.startIndex)}
                        title={mod.title}
                        aria-current={isActive ? "step" : undefined}
                        className="flex-1 min-w-0 text-left flex items-start gap-2 cursor-pointer"
                      >
                        <span className="mt-0.5 shrink-0" aria-hidden="true">
                          {isCompleted ? (
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                isActive ? "text-gemini-cyan" : "text-emerald-400"
                              }`}
                            />
                          ) : isActive ? (
                            <span className="inline-flex items-center justify-center w-4 h-4">
                              <span className="w-2.5 h-2.5 rounded-full bg-gemini-cyan shadow-[0_0_8px_rgba(76,221,236,0.75)]" />
                            </span>
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-xs font-semibold truncate ${
                                isActive
                                  ? "text-gemini-cyan"
                                  : isOutOfPath
                                  ? "text-slate-400"
                                  : "text-slate-200"
                              }`}
                            >
                              {pathStep ? `第${pathStep}站 · ` : ""}
                              {mod.label}
                            </span>
                            <span
                              className={`text-[10px] font-mono whitespace-nowrap shrink-0 tabular-nums ${
                                isActive
                                  ? "text-gemini-cyan"
                                  : isCompleted
                                  ? "text-emerald-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {isActive
                                ? "学习中"
                                : isCompleted
                                ? "已完成"
                                : meta
                                ? `${meta.estimatedMinutes}m`
                                : ""}
                            </span>
                          </div>
                          <div
                            className={`text-[11px] truncate mt-0.5 ${
                              isOutOfPath ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            {shortTitle}
                          </div>
                          {meta && (
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums truncate">
                              {meta.slideCount} 节 · {meta.labIds.length} 沙盘 ·{" "}
                              {meta.status === "needs-review" ? "待复核" : "已核验"}
                            </div>
                          )}
                        </div>
                      </button>

                      {meta && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedModuleId((prev) => (prev === mod.id ? null : mod.id))
                          }
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "收起" : "展开"}${mod.label}大纲与交付物`}
                          title="查看先修知识、目标、交付物与关联沙盘"
                          className="mt-0.5 p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {isExpanded && meta && (
                      <div className="px-2.5 pb-2.5 pt-2 border-t border-white/10 space-y-2 text-[11px]">
                        <div className="text-slate-400 font-mono tabular-nums">
                          {meta.estimatedMinutes} 分钟 · {meta.slideCount} 节 · 核验 {meta.lastReviewedAt} ·{" "}
                          <span
                            className={
                              meta.status === "needs-review" ? "text-amber-300" : "text-emerald-300"
                            }
                          >
                            {meta.status === "needs-review" ? "部分内容待复核" : "结构已核验"}
                          </span>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium mb-0.5">先修要求</div>
                          <div className="text-slate-300 leading-relaxed">
                            {meta.prerequisites.join("；")}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium mb-0.5">可验证学习目标</div>
                          <ul className="space-y-1 text-slate-200 leading-relaxed">
                            {meta.learningObjectives.map((obj, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-gemini-cyan font-mono shrink-0">
                                  {idx + 1}.
                                </span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-slate-400 font-medium mb-0.5">模块交付物</div>
                          <ul className="space-y-0.5 text-slate-300 leading-relaxed">
                            {meta.deliverables.map((d, idx) => (
                              <li key={idx}>· {d}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-amber-300/90 leading-relaxed">
                          边界与安全：{meta.boundaryNote}
                        </div>

                        {teachingPkg && (
                          <div className="pt-1 border-t border-white/10 space-y-1">
                            <div className="text-slate-400 font-medium">灵活授课模式与迁移</div>
                            <div className="text-[10px] font-mono text-slate-300 leading-relaxed">
                              {teachingPkg.deliveryModes.map((dm) => `${dm.label}`).join(" · ")}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-relaxed">
                              裁剪建议：{teachingPkg.trimAndMergeNote}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {moduleLabs.map((lab) => {
                            const labDone = completedLabIds.includes(lab.id);
                            return (
                              <button
                                key={lab.id}
                                type="button"
                                onClick={() => handleJumpLab(lab.id)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                  labDone
                                    ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25"
                                    : "bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 text-slate-200"
                                }`}
                              >
                                <FlaskConical className="w-3 h-3" />
                                <span>
                                  Lab {lab.code}
                                  {labDone ? " · 已验收" : ""}
                                </span>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => handleOpenModuleTeamKb(meta.code)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gemini-purple/15 hover:bg-gemini-purple/30 border border-gemini-purple/35 text-purple-200 hover:text-white font-mono text-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>
                              {isRuntimeMeta ? "运行时工坊" : "工程知识库"} ({teamKbCount})
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModuleResources(meta.code)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white font-mono text-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>来源索引 ({meta.resourceIds.length})</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Floating Performance & Efficiency Monitor */}
          <SidebarPerformanceMonitor
            completedModulesCount={completedCount}
            totalModulesCount={totalModules}
            sidebarOpen={true}
          />

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 shrink-0">
            <span className="tabular-nums">
              幻灯片 {totalH > 0 ? `${currentH + 1}/${totalH}` : "0/0"}
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={onResetProgress}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="清除已完成模块状态标记"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置进度</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
