import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCode2, Filter, RotateCcw } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";
import { loadLabChecklist, saveLabChecklist } from "@/data/labPracticeEngine";

interface CandidateFile {
  path: string;
  tokens: number;
  kind: "core" | "noise" | "legacy" | "secret";
  reason: string;
}

const CANDIDATE_FILES: CandidateFile[] = [
  {
    path: "src/types/billing.ts",
    tokens: 680,
    kind: "core",
    reason: "共享结算 DTO 与货币基点类型契约（必挂）",
  },
  {
    path: "src/server/routes/checkout.ts",
    tokens: 1850,
    kind: "core",
    reason: "目标修改服务端路由与签名校验入口（必挂）",
  },
  {
    path: "tests/checkout.test.ts",
    tokens: 1120,
    kind: "core",
    reason: "400/401/409 边界用例与验收契约（必挂）",
  },
  {
    path: "src/components/CheckoutPanel.tsx",
    tokens: 1450,
    kind: "core",
    reason: "消费服务端错误码与空态的前端展示组件（按需）",
  },
  {
    path: "legacy-v1/old-checkout.ts",
    tokens: 4600,
    kind: "legacy",
    reason: "已废弃 v1 计费旧逻辑，挂载后会诱导 Agent 沿用过期字段名",
  },
  {
    path: "dist/assets/index-8a91f.js",
    tokens: 18400,
    kind: "noise",
    reason: "编译混淆产物，严重稀释模型注意力并触发 Context Rot",
  },
  {
    path: "package-lock.json",
    tokens: 14200,
    kind: "noise",
    reason: "自动生成的锁文件，对业务逻辑理解毫无增益",
  },
  {
    path: ".env.local",
    tokens: 180,
    kind: "secret",
    reason: "包含本地数据库与 Stripe 凭证！严禁挂载进入模型上下文",
  },
];

const BUDGET_LIMIT = 12000;

export default function ContextSliceSandbox() {
  const [selectedPaths, setSelectedPaths] = useState<string[]>([
    "src/types/billing.ts",
    "src/server/routes/checkout.ts",
    "legacy-v1/old-checkout.ts",
    "dist/assets/index-8a91f.js",
  ]);
  const [dodDone, setDodDone] = useState<boolean>(() => Boolean(loadLabChecklist("context-slice")[0]));

  const togglePath = (path: string) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const metrics = useMemo(() => {
    const picked = CANDIDATE_FILES.filter((f) => selectedPaths.includes(f.path));
    const totalTokens = picked.reduce((sum, f) => sum + f.tokens, 0);
    const coreTokens = picked
      .filter((f) => f.kind === "core")
      .reduce((sum, f) => sum + f.tokens, 0);
    const hasSecret = picked.some((f) => f.kind === "secret");
    const hasNoiseOrLegacy = picked.some((f) => f.kind === "noise" || f.kind === "legacy");
    const coreCount = picked.filter((f) => f.kind === "core").length;
    const snr = totalTokens > 0 ? Math.round((coreTokens / totalTokens) * 100) : 0;
    const budgetPct = Math.min(100, Math.round((totalTokens / BUDGET_LIMIT) * 100));
    const contextRot = totalTokens > BUDGET_LIMIT || snr < 65;
    const passed = coreCount >= 3 && !hasSecret && !hasNoiseOrLegacy && totalTokens <= BUDGET_LIMIT;
    return {
      picked,
      totalTokens,
      coreCount,
      hasSecret,
      hasNoiseOrLegacy,
      snr,
      budgetPct,
      contextRot,
      passed,
    };
  }, [selectedPaths]);

  const generatedSpec = useMemo(() => {
    const allowed = selectedPaths
      .filter((p) => !p.endsWith(".env.local") && !p.startsWith("dist/") && p !== "package-lock.json")
      .map((p) => `@${p}`)
      .join(" ");
    return `# .cursorignore 建议\ndist/\nnode_modules/\nlegacy-v1/\n*.lock\n*.log\n.env*\n\n# 本次任务最小上下文切片 (${metrics.totalTokens} tokens · SNR ${metrics.snr}%)\n${allowed || "(请先勾选核心文件)"}\n\n# 验证命令\nnpx tsc --noEmit && npx vitest run tests/checkout.test.ts`;
  }, [selectedPaths, metrics.totalTokens, metrics.snr]);

  const handleConfirmCleanSlice = () => {
    setSelectedPaths([
      "src/types/billing.ts",
      "src/server/routes/checkout.ts",
      "tests/checkout.test.ts",
    ]);
    setDodDone(true);
    saveLabChecklist("context-slice", { 0: true });
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 17 · MODULE 2 · CONTEXT SLICING &amp; TOKEN BUDGET
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            上下文切片与 Token 预算沙盘（Context Rot 诊断台）
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirmCleanSlice}
            onKeyDown={stopRevealKey}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-mono text-emerald-200 cursor-pointer whitespace-nowrap"
          >
            一键装配最小高信噪切片
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedPaths([
                "src/types/billing.ts",
                "src/server/routes/checkout.ts",
                "legacy-v1/old-checkout.ts",
                "dist/assets/index-8a91f.js",
              ])
            }
            onKeyDown={stopRevealKey}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-300 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复污染现场</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[440px]">
        {/* Left: Candidate Files Selector */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-2.5"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-mono text-gemini-cyan inline-flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>勾选挂载至本轮 Composer 的文件（任务：升级结算折扣校验）</span>
            </span>
            <span className="font-mono text-slate-400 tabular-nums">
              已选 {selectedPaths.length} 个文件
            </span>
          </div>

          <div className="space-y-1.5">
            {CANDIDATE_FILES.map((file) => {
              const checked = selectedPaths.includes(file.path);
              const kindLabel =
                file.kind === "core"
                  ? "核心切片"
                  : file.kind === "secret"
                  ? "高危密钥"
                  : file.kind === "legacy"
                  ? "过期旧版"
                  : "构建噪音";
              const kindTone =
                file.kind === "core"
                  ? "text-emerald-300"
                  : file.kind === "secret"
                  ? "text-rose-400"
                  : "text-amber-300";

              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => togglePath(file.path)}
                  onKeyDown={stopRevealKey}
                  className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    checked
                      ? file.kind === "core"
                        ? "bg-emerald-500/10 border-emerald-400/40"
                        : "bg-rose-500/10 border-rose-400/40"
                      : "bg-white/[0.025] border-white/10 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="font-mono text-xs mt-0.5 text-slate-300">
                      {checked ? "[✓]" : "[ ]"}
                    </span>
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-white truncate flex items-center gap-2">
                        <FileCode2 className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{file.reason}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px] tabular-nums">
                    <div className={kindTone}>{kindLabel}</div>
                    <div className="text-slate-400">{file.tokens.toLocaleString()} tok</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Token Budget Meter, Context Rot Monitor & Copyable Spec */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-3"
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-slate-300">单任务切片预算 ({BUDGET_LIMIT.toLocaleString()} tok)</span>
                <span
                  className={
                    metrics.totalTokens > BUDGET_LIMIT ? "text-rose-400 font-bold" : "text-emerald-300 font-bold"
                  }
                >
                  {metrics.totalTokens.toLocaleString()} tok
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metrics.totalTokens > BUDGET_LIMIT
                      ? "bg-rose-500"
                      : metrics.snr >= 80
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${metrics.budgetPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                <span className="text-slate-400">有效信噪比 (SNR)</span>
                <span className={metrics.snr >= 80 ? "text-emerald-300" : "text-amber-300"}>
                  {metrics.snr}%
                </span>
              </div>
            </div>

            {metrics.hasSecret && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/50 text-xs text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>安全红线：检测到挂载了 `.env.local`，必须写入 `.cursorignore` 立即移除！</span>
              </div>
            )}

            {metrics.contextRot && (
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  Context Rot 告警：噪音文件或过期代码挤占注意力，Agent 极易混用 v1 旧字段名。
                </span>
              </div>
            )}

            {metrics.passed && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>切片达标：仅包含契约、入口与验证测试，预算可控且 0 敏感文件泄露。</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-gemini-purple">
                  可复制 .cursorignore 与切片配置
                </span>
                <CopySnippetButton text={generatedSpec} label="复制配置" />
              </div>
              <pre className="p-2.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {generatedSpec}
              </pre>
            </div>
          </div>

          <button
            type="button"
            disabled={!metrics.passed}
            onClick={() => {
              setDodDone(true);
              saveLabChecklist("context-slice", { 0: true });
            }}
            onKeyDown={stopRevealKey}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              dodDone
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200"
                : metrics.passed
                ? "bg-gemini-cyan text-slate-950 hover:opacity-90"
                : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
            }`}
          >
            {dodDone
              ? "Lab 17 验收已同步完成 [✓]"
              : metrics.passed
              ? "验证通过，标记完成 Lab 17 验收"
              : "请先剔除噪音/密钥并保留 ≥3 个核心切片文件"}
          </button>
        </div>
      </div>
    </div>
  );
}
