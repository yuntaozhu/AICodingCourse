import { useEffect, useRef, useState } from "react";
import Reveal from "reveal.js";

export interface ModuleNavItem {
  id: string;
  label: string;
  title: string;
  startIndex: number;
}

interface PresentationProps {
  children: React.ReactNode;
  modules?: ModuleNavItem[];
}

type RevealInstance = InstanceType<typeof Reveal>;

export default function Presentation({ children, modules = [] }: PresentationProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealInstanceRef = useRef<RevealInstance | null>(null);
  const [currentH, setCurrentH] = useState(0);
  const [totalH, setTotalH] = useState(0);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const container = deckRef.current;
    if (!container) return;

    let cancelled = false;
    let readyDone = false;

    // Clean any leftover Reveal-injected chrome from prior StrictMode mount
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
      setCurrentH(indices.h ?? 0);
      setTotalH(deck.getHorizontalSlides().length);
    };

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

  const activeModuleIndex = modules.reduce((acc, mod, idx) => {
    return currentH >= mod.startIndex ? idx : acc;
  }, 0);

  const handleJumpTo = (index: number) => {
    const deck = revealInstanceRef.current;
    if (deck) {
      deck.slide(index, 0);
    }
  };

  const handleToggleOverview = () => {
    const deck = revealInstanceRef.current;
    if (deck) {
      deck.toggleOverview();
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020205]">
      {modules.length > 0 && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-xl bg-[#0b0f19]/90 backdrop-blur-md border border-white/10 px-2.5 py-1.5 shadow-lg max-w-[96vw] overflow-x-auto">
          {navVisible ? (
            <>
              <div className="flex items-center gap-1">
                {modules.map((mod, idx) => {
                  const isActive = idx === activeModuleIndex;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleJumpTo(mod.startIndex)}
                      title={mod.title}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? "bg-gemini-cyan text-slate-950 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>
              <div className="h-4 w-px bg-white/15 mx-1 shrink-0" />
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
                onClick={() => setNavVisible(false)}
                className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                收起
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setNavVisible(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              课程目录 · {totalH > 0 ? `${currentH + 1}/${totalH}` : ""}
            </button>
          )}
        </div>
      )}

      <div className="reveal cyber-grid h-screen w-screen" ref={deckRef}>
        <div className="slides">{children}</div>
      </div>
    </div>
  );
}
