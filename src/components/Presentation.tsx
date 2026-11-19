import { useEffect, useRef, useState } from "react";
import Reveal from "reveal.js";
import { BookOpen, Check, ChevronDown, FlaskConical, PanelLeft } from "lucide-react";
import CourseNavSidebar from "@/components/CourseNavSidebar";
import KnowledgeBaseSidebar from "@/components/KnowledgeBaseSidebar";
import SidebarPerformanceMonitor from "@/components/SidebarPerformanceMonitor";
import { AI_BOOKS_KNOWLEDGE_BASE } from "@/data/aiBooksKnowledgeBase";
import {
  probeServerHealth,
  recordInteractionLatency,
  resetSandboxTelemetryScore,
} from "@/lib/performanceTelemetry";

export interface ModuleNavItem {
  id: string;
  label: string;
  title: string;
  startIndex: number;
  slideCount?: number;
}

export interface LabJumpItem {
  id: string;
  label: string;
  h: number;
  v: number;
}

interface PresentationProps {
  children: React.ReactNode;
  modules?: ModuleNavItem[];
  labs?: LabJumpItem[];
}

type RevealInstance = InstanceType<typeof Reveal>;

const COMPLETED_MODULES_STORAGE_KEY = "cursor_course_completed_modules_v1";

function loadCompletedModules(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPLETED_MODULES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function saveCompletedModules(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETED_MODULES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

export default function Presentation({
  children,
  modules = [],
  labs = [],
}: PresentationProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealInstanceRef = useRef<RevealInstance | null>(null);
  const labsRef = useRef<LabJumpItem[]>(labs);
  const modulesRef = useRef<ModuleNavItem[]>(modules);

  useEffect(() => {
    labsRef.current = labs;
  }, [labs]);

  useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);

  const [currentH, setCurrentH] = useState(0);
  const [totalH, setTotalH] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [labMenuOpen, setLabMenuOpen] = useState(false);
  const [kbSidebarOpen, setKbSidebarOpen] = useState(false);
  const [courseSidebarOpen, setCourseSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() =>
    loadCompletedModules()
  );

  useEffect(() => {
    const container = deckRef.current;
    if (!container) return;

    let cancelled = false;
    let readyDone = false;

    container
      .querySelectorAll(
        ":scope > .controls, :scope > .progress, :scope > .backgrounds, :scope > .pause-overlay, :scope > .aria-status, :scope > .slide-number"
      )
      .forEach((el) => el.remove());

    const deck = new Reveal(container, {
      hash: true,
      center: true,
      transition: "slide",
      controls: true,
      progress: true,
      mouseWheel: true,
      slideNumber: "c/t",
      width: 1280,
      height: 720,
      margin: 0.04,
      minScale: 0.2,
      maxScale: 2.0,
    });

    const handleSlideChange = () => {
      if (cancelled) return;
      const indices = deck.getIndices();
      const nextH = indices.h ?? 0;
      const nextTotalH = deck.getHorizontalSlides().length;
      setCurrentH(nextH);
      setTotalH(nextTotalH);

      const currentModules = modulesRef.current;
      if (currentModules.length > 0) {
        const modIdx = currentModules.reduce((acc, mod, idx) => {
          return nextH >= mod.startIndex ? idx : acc;
        }, 0);

        setCompletedModuleIds((prev) => {
          const next = new Set(prev);
          for (let i = 0; i < modIdx; i += 1) {
            if (currentModules[i]) {
              next.add(currentModules[i].id);
            }
          }
          const activeMod = currentModules[modIdx];
          if (activeMod && nextTotalH > 0) {
            const nextMod = currentModules[modIdx + 1];
            const modEndIndex = nextMod ? nextMod.startIndex - 1 : nextTotalH - 1;
            if (nextH >= modEndIndex) {
              next.add(activeMod.id);
            }
          }
          const nextArr = Array.from(next);
          if (nextArr.length === prev.length && nextArr.every((id, i) => id === prev[i])) {
            return prev;
          }
          saveCompletedModules(nextArr);
          return nextArr;
        });
      }
    };

    const handleJumpEvent = (event: Event) => {
      const custom = event as CustomEvent<{ h: number; v?: number }>;
      if (typeof custom.detail?.h === "number") {
        deck.slide(custom.detail.h, custom.detail.v ?? 0);
      }
    };

    const handleJumpLabEvent = (event: Event) => {
      const custom = event as CustomEvent<{ labId: string }>;
      const target = labsRef.current.find((item) => item.id === custom.detail?.labId);
      if (target && target.h >= 0) {
        deck.slide(target.h, target.v);
      }
    };

    const handleJumpModuleEvent = (event: Event) => {
      const custom = event as CustomEvent<{ moduleId: string; v?: number }>;
      const targetId = custom.detail?.moduleId?.toLowerCase();
      const target = modulesRef.current.find((item) => item.id.toLowerCase() === targetId);
      if (target) {
        deck.slide(target.startIndex, custom.detail?.v ?? 0);
      }
    };

    const handleOpenResourcesEvent = () => {
      setKbSidebarOpen(true);
      setLabMenuOpen(false);
    };

    window.addEventListener("reveal:jump", handleJumpEvent);
    window.addEventListener("reveal:jump-lab", handleJumpLabEvent);
    window.addEventListener("reveal:jump-module", handleJumpModuleEvent);
    window.addEventListener("course:open-resources", handleOpenResourcesEvent);

    const resizeObserver = new ResizeObserver(() => {
      if (!cancelled && readyDone) {
        try {
          deck.layout();
        } catch {
          // Ignore layout errors during teardown
        }
      }
    });
    resizeObserver.observe(container);

    deck
      .initialize()
      .then(() => {
        readyDone = true;
        if (cancelled) {
          try {
            deck.destroy();
          } catch {
            // Ignore cleanup errors on aborted StrictMode mount
          }
          return;
        }
        revealInstanceRef.current = deck;
        deck.sync();
        deck.layout();
        handleSlideChange();
        deck.on("slidechanged", handleSlideChange);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Reveal.js initialization failed", err);
        }
      });

    return () => {
      cancelled = true;
      revealInstanceRef.current = null;
      resizeObserver.disconnect();
      window.removeEventListener("reveal:jump", handleJumpEvent);
      window.removeEventListener("reveal:jump-lab", handleJumpLabEvent);
      window.removeEventListener("reveal:jump-module", handleJumpModuleEvent);
      window.removeEventListener("course:open-resources", handleOpenResourcesEvent);
      if (readyDone) {
        try {
          deck.off("slidechanged", handleSlideChange);
          deck.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        revealInstanceRef.current?.layout();
      } catch {
        // Ignore layout errors
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [courseSidebarOpen]);

  // Real interaction-to-frame response timing + initial server readiness probe
  useEffect(() => {
    void probeServerHealth();

    const measureInteraction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const isInteractiveTarget = Boolean(
        target?.closest("button, a, input, select, textarea, [role='button']")
      );
      if (!isInteractiveTarget) return;

      const start = performance.now();
      const insideSandboxSlide = Boolean(target?.closest(".slides"));
      window.requestAnimationFrame(() => {
        const elapsed = performance.now() - start;
        recordInteractionLatency(elapsed, insideSandboxSlide);
      });
    };

    window.addEventListener("pointerdown", measureInteraction, { passive: true });
    window.addEventListener("keydown", measureInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", measureInteraction);
      window.removeEventListener("keydown", measureInteraction);
    };
  }, []);

  const activeModuleIndex = modules.reduce((acc, mod, idx) => {
    return currentH >= mod.startIndex ? idx : acc;
  }, 0);

  const handleJumpTo = (h: number, v = 0) => {
    const deck = revealInstanceRef.current;
    if (deck) {
      deck.slide(h, v);
    }
    setLabMenuOpen(false);
  };

  const handleSelectSidebarModule = (startIndex: number) => {
    handleJumpTo(startIndex);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCourseSidebarOpen(false);
    }
  };

  const handleResetProgress = () => {
    setCompletedModuleIds([]);
    saveCompletedModules([]);
    resetSandboxTelemetryScore();
    handleJumpTo(0, 0);
  };

  const handleToggleOverview = () => {
    const deck = revealInstanceRef.current;
    if (deck) {
      deck.toggleOverview();
    }
    setLabMenuOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#020205]">
      {modules.length > 0 && (
        <CourseNavSidebar
          isOpen={courseSidebarOpen}
          onClose={() => setCourseSidebarOpen(false)}
          modules={modules}
          activeModuleIndex={activeModuleIndex}
          completedModuleIds={completedModuleIds}
          currentH={currentH}
          totalH={totalH}
          onSelectModule={handleSelectSidebarModule}
          onResetProgress={handleResetProgress}
        />
      )}

      {modules.length > 0 && !courseSidebarOpen && (
        <SidebarPerformanceMonitor
          completedModulesCount={
            modules.filter((m) => completedModuleIds.includes(m.id)).length
          }
          totalModulesCount={modules.length}
          sidebarOpen={false}
        />
      )}

      <div className="relative flex-1 min-w-0 h-screen overflow-hidden">
        {modules.length > 0 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[96%]">
            <div className="flex items-center gap-1.5 rounded-xl bg-[#0b0f19]/92 backdrop-blur-md border border-white/10 px-2.5 py-1.5 shadow-lg max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setCourseSidebarOpen((prev) => !prev)}
                aria-expanded={courseSidebarOpen}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                  courseSidebarOpen
                    ? "bg-white/12 text-gemini-cyan"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title="展开或收起左侧课程进度导航栏"
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span>目录</span>
              </button>

              {navVisible ? (
                <>
                  <div className="h-4 w-px bg-white/15 mx-0.5 shrink-0" />
                  <div className="flex items-center gap-1">
                    {modules.map((mod, idx) => {
                      const isActive = idx === activeModuleIndex;
                      const isCompleted = completedModuleIds.includes(mod.id);
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => handleJumpTo(mod.startIndex)}
                          title={mod.title}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                            isActive
                              ? "bg-gemini-cyan text-slate-950 font-semibold"
                              : isCompleted
                              ? "text-emerald-300 hover:text-white hover:bg-white/10"
                              : "text-slate-300 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {isCompleted && !isActive && (
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          <span>{mod.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-4 w-px bg-white/15 mx-1 shrink-0" />
                  {labs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLabMenuOpen((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                        labMenuOpen
                          ? "bg-gemini-purple text-white"
                          : "text-gemini-cyan hover:bg-white/10"
                      }`}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>沙盘 ({labs.length})</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setKbSidebarOpen((prev) => !prev);
                      setLabMenuOpen(false);
                    }}
                    aria-expanded={kbSidebarOpen}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                      kbSidebarOpen
                        ? "bg-gemini-cyan text-slate-950 font-semibold"
                        : "text-slate-200 hover:text-white hover:bg-white/10"
                    }`}
                    title={`展开或收起 ${AI_BOOKS_KNOWLEDGE_BASE.length} 册 AI 书籍知识库侧栏`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="tabular-nums">书库 ({AI_BOOKS_KNOWLEDGE_BASE.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleOverview}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    title="快捷键 O 打开/关闭全览"
                  >
                    全览
                  </button>
                  <span className="px-2 text-xs font-mono text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                    {totalH > 0 ? `${currentH + 1}/${totalH}` : "加载中"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNavVisible(false);
                      setLabMenuOpen(false);
                    }}
                    className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    收起
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNavVisible(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                  >
                    顶部导航 · {totalH > 0 ? `${currentH + 1}/${totalH}` : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => setKbSidebarOpen((prev) => !prev)}
                    aria-expanded={kbSidebarOpen}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1 ${
                      kbSidebarOpen
                        ? "bg-gemini-cyan text-slate-950 font-semibold"
                        : "text-gemini-cyan hover:bg-white/10"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="tabular-nums">书库</span>
                  </button>
                </div>
              )}
            </div>

            {navVisible && labMenuOpen && labs.length > 0 && (
              <div className="mt-1.5 rounded-xl bg-[#0b0f19]/95 backdrop-blur-md border border-white/15 p-1.5 shadow-xl flex flex-wrap gap-1.5 max-w-full">
                {labs.map((lab) => (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => handleJumpTo(lab.h, lab.v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 hover:text-slate-950 hover:bg-gemini-cyan transition-colors cursor-pointer"
                  >
                    {lab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="reveal cyber-grid h-full w-full" ref={deckRef}>
          <div className="slides">{children}</div>
        </div>
      </div>

      <KnowledgeBaseSidebar
        isOpen={kbSidebarOpen}
        onClose={() => setKbSidebarOpen(false)}
      />
    </div>
  );
}
