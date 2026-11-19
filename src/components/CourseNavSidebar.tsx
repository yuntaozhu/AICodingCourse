import { CheckCircle2, Circle, PanelLeftClose, RotateCcw } from "lucide-react";
import type { ModuleNavItem } from "@/components/Presentation";
import SidebarPerformanceMonitor from "@/components/SidebarPerformanceMonitor";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

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
  const totalModules = modules.length;
  const currentModule = modules[activeModuleIndex];
  const modulePercent =
    totalModules > 0 ? Math.round(((activeModuleIndex + 1) / totalModules) * 100) : 0;
  const completedCount = modules.filter((m) => completedModuleIds.includes(m.id)).length;

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
            ? "w-68 border-r translate-x-0"
            : "w-68 lg:w-0 -translate-x-full lg:translate-x-0 border-r-0 pointer-events-none"
        }`}
      >
        <div className="w-68 h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <div className="text-xs font-mono uppercase tracking-wider text-gemini-cyan">
                Curriculum Map
              </div>
              <h2 className="text-sm font-semibold text-white truncate">
                课程目录与学习进度
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
          <div className="px-4 py-3.5 border-b border-white/10 bg-white/[0.02] shrink-0">
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
                第 {totalModules > 0 ? activeModuleIndex + 1 : 0}/{totalModules} 模块
              </span>
              <span>
                已完成 {completedCount}/{totalModules}
              </span>
            </div>

            {currentModule && (
              <div className="mt-1.5 text-[11px] text-slate-400 truncate" title={currentModule.title}>
                当前：{currentModule.label}
              </div>
            )}
          </div>

          {/* Module List */}
          <nav
            aria-label="课程模块列表"
            className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-2.5 space-y-1"
          >
            {modules.map((mod, idx) => {
              const isActive = idx === activeModuleIndex;
              const isCompleted = completedModuleIds.includes(mod.id);
              const shortTitle = mod.title.replace(/^Module\s+\d+:\s*/i, "");

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => onSelectModule(mod.startIndex)}
                  title={mod.title}
                  aria-current={isActive ? "step" : undefined}
                  className={`w-full text-left px-2.5 py-2 rounded-xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                    isActive
                      ? "bg-gemini-cyan/12 border-gemini-cyan/45 text-white"
                      : isCompleted
                      ? "bg-white/[0.025] border-white/8 text-slate-200 hover:bg-white/[0.06] hover:border-white/15"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
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
                          isActive ? "text-gemini-cyan" : "text-slate-200"
                        }`}
                      >
                        {mod.label}
                      </span>
                      <span
                        className={`text-[10px] font-mono whitespace-nowrap shrink-0 ${
                          isActive
                            ? "text-gemini-cyan"
                            : isCompleted
                            ? "text-emerald-400"
                            : "text-slate-500 tabular-nums"
                        }`}
                      >
                        {isActive
                          ? "学习中"
                          : isCompleted
                          ? "已完成"
                          : mod.slideCount
                          ? `${mod.slideCount} 节`
                          : ""}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {shortTitle}
                    </div>
                  </div>
                </button>
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
