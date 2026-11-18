import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { stopRevealKey } from "./revealEvents";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopySnippetButton({ text, label = "复制", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      onKeyDown={stopRevealKey}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
        copied
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
          : "bg-white/10 text-slate-200 hover:bg-white/15 border border-white/15"
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "已复制" : label}</span>
    </button>
  );
}
