import { useEffect, useRef } from "react";
import Reveal from "reveal.js";

interface PresentationProps {
  children: React.ReactNode;
}

export default function Presentation({ children }: PresentationProps) {
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!deckRef.current) return;

    const deck = new Reveal(deckRef.current, {
      hash: true,
      center: true,
      transition: "slide",
      controls: true,
      progress: true,
      mouseWheel: true,
    });

    deck.initialize().catch((err) => {
      console.error("Reveal.js initialization failed", err);
    });

    return () => {
      try {
        if (deck) {
          deck.destroy();
        }
      } catch (e) {
        console.warn("Reveal.js destroy failed", e);
      }
    };
  }, []);

  return (
    <div className="reveal cyber-grid h-screen w-screen" ref={deckRef}>
      <div className="slides">
        {children}
      </div>
    </div>
  );
}
