import { useState } from "react";
import Slide from "@/components/Slide";
import Markdown from "react-markdown";
import { ShieldAlert, Sparkles, Terminal } from "lucide-react";
import { BUGBOT_CODE_PRESETS } from "@/data/cursorPresets";
import {
  reviewCode,
  runLocalBugbotCheck,
  type BugbotFinding,
} from "@/lib/gemini";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

const RULE_OPTIONS = [
  "20-api-security.mdc (禁止 SQL 拼接、写接口强制鉴权与 Zod 校验)",
  "10-ui-tailwind.mdc (禁用前端硬编码 Key、useEffect 必须防竞态)",
  "30-dod-checks.mdc (异步调用必须含 try/catch 与结构化错误边界)",
];

export default function P85d() {
  const [presetId, setPresetId] = useState(BUGBOT_CODE_PRESETS[0].id);
  const [code, setCode] = useState(BUGBOT_CODE_PRESETS[0].code);
  const [enabledRules, setEnabledRules] = useState<string[]>(RULE_OPTIONS);
  const [localFindings, setLocalFindings] = useState<BugbotFinding[] | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPreset = (id: string) => {
    setPresetId(id);
    const preset = BUGBOT_CODE_PRESETS.find((p) => p.id === id);
    if (preset) {
      setCode(preset.code);
      setLocalFindings(null);
      setAiFeedback(null);
      setError(null);
    }
  };

  const toggleRule = (rule: string) => {
    setEnabledRules((prev) =>
      prev.includes(rule) ? prev.filter((item) => item !== rule) : [...prev, rule]
    );
  };

  const handleLocalBugbot = () => {
    setError(null);
    setAiFeedback(null);
    const findings = runLocalBugbotCheck(code, enabledRules);
    setLocalFindings(findings);
  };

  const handleServerAiReview = async () => {
    setLoading(true);
    setError(null);
    setAiFeedback(null);
    try {
      const result = await reviewCode(code, {
        rules: enabledRules,
        mode: "bugbot",
      });
      setAiFeedback(result.feedback);
      setModelUsed(result.model);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "调用 AI 评审失败";
      setError(msg);
      setLocalFindings(runLocalBugbotCheck(code, enabledRules));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Slide
      backgroundColor="#020205"
      notes="实战演练：结合 .cursor/rules 对代码执行双重审查。既可点击本地 Bugbot 静态规则毫秒级离线自检，也可调用服务端 Gemini 模型进行深度语义与架构点评。"
    >
      <div
        className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center gap-3"
        onKeyDown={stopRevealKey}
        onWheel={stopRevealWheel}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono text-gemini-cyan uppercase tracking-wider">
              Interactive Lab 04 · Cursor Bugbot &amp; Server-Side AI Reviewer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Cursor Bugbot 规则对齐与实时代码审查台
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {BUGBOT_CODE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer border transition-colors ${
                  presetId === p.id
                    ? "bg-gemini-cyan text-slate-950 font-semibold border-gemini-cyan"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-mono text-slate-400">挂载 .cursor/rules:</span>
          {RULE_OPTIONS.map((rule) => {
            const active = enabledRules.includes(rule);
            return (
              <button
                key={rule}
                type="button"
                onClick={() => toggleRule(rule)}
                className={`px-2.5 py-1 rounded-lg font-mono cursor-pointer border transition-colors ${
                  active
                    ? "bg-gemini-purple/20 border-gemini-purple text-white"
                    : "bg-white/[0.03] border-white/10 text-slate-400"
                }`}
              >
                {rule.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Two-Zone 60/40 Split */}
        <div className="grid grid-cols-12 gap-4 h-[390px]">
          {/* Left 60%: Code Editor */}
          <div className="col-span-6 bg-[#0b0f19] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-white/5 px-3 py-2 border-b border-white/10 flex flex-wrap justify-between items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                待审 PR 代码片段
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLocalBugbot}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-white/10 text-gemini-cyan hover:bg-white/15 border border-gemini-cyan/30 cursor-pointer flex items-center gap-1"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>本地规则秒检</span>
                </button>
                <button
                  type="button"
                  onClick={handleServerAiReview}
                  disabled={loading}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                    loading
                      ? "bg-white/10 text-slate-400 cursor-not-allowed"
                      : "bg-gemini-purple text-white hover:bg-gemini-purple/90"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? "AI 分析中..." : "AI 深度评审"}</span>
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={stopRevealKey}
              onWheel={stopRevealWheel}
              className="flex-1 p-3.5 bg-transparent font-mono text-xs text-gemini-cyan/90 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Right 40%: Findings & AI Review */}
          <div className="col-span-6 bg-[#0b0f19] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="bg-white/5 px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
                {aiFeedback
                  ? `服务端 AI 评审结果 (${modelUsed || "gemini-4-hydrogen"})`
                  : localFindings
                  ? `本地 Bugbot 规则扫描 (${localFindings.length} 项)`
                  : "Bugbot 审查报告面板"}
              </span>
              {aiFeedback && <CopySnippetButton text={aiFeedback} label="复制报告" />}
            </div>

            <div
              className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3"
              onWheel={stopRevealWheel}
            >
              {loading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gemini-purple">
                  <div className="w-8 h-8 border-2 border-gemini-purple/30 border-t-gemini-purple rounded-full animate-spin" />
                  <div className="text-xs font-mono">正在通过服务端路由校验规则与安全隐患...</div>
                </div>
              )}

              {!loading && error && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{error}（已自动为您切换为本地确定性 Bugbot 规则诊断结果）</span>
                </div>
              )}

              {!loading && aiFeedback && (
                <div className="text-xs text-slate-200 leading-relaxed space-y-2">
                  <Markdown>{aiFeedback}</Markdown>
                </div>
              )}

              {!loading && localFindings && (
                <div className="space-y-2.5">
                  {localFindings.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs ${
                        item.severity === "critical"
                          ? "bg-red-500/10 border-red-500/35"
                          : item.severity === "warning"
                          ? "bg-amber-500/10 border-amber-500/35"
                          : "bg-emerald-500/10 border-emerald-500/35"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-white">{item.title}</span>
                        <span className="font-mono text-[10px] uppercase text-slate-300">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed mb-2">{item.detail}</p>
                      <div className="p-2 rounded bg-black/45 font-mono text-[11px] text-gemini-cyan flex items-center justify-between gap-2">
                        <span className="truncate">{item.fixInCursorPrompt}</span>
                        <CopySnippetButton text={item.fixInCursorPrompt} label="复制指令" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && !aiFeedback && !localFindings && (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-xs space-y-2">
                  <div>点击左侧「本地规则秒检」可 0ms 离线定位 SQLi / N+1 / 竞态 / 密钥隐患；</div>
                  <div>点击「AI 深度评审」将通过 Express 服务端路由调用实时模型分析。</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
