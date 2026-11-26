import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  FileCode2,
  FolderGit2,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  ShieldAlert,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  buildPatternPilotEvidenceMarkdown,
  evaluateFaultDrill,
  getPilotGroupForModule,
  STAGE1_PILOT_RUBRIC,
  type DesignPatternPilotGroup,
  type FaultDrillEvaluationResult,
} from "@/data/designPatternPilots";
import type { InstructorPatternPilotScriptPayload } from "@/lib/apiClient";

type StudioTab = "patterns" | "drill" | "rubric" | "script";

interface DesignPatternPilotStudioProps {
  moduleId: string;
  moduleCode: string;
  isInstructorView: boolean;
  patternPilotScript?: InstructorPatternPilotScriptPayload | null;
  onApplyDraftToPractice: (markdownDraft: string) => void;
  onOpenProjectHub?: (tab: "workspace" | "eval" | "tutor" | "exam", moduleId?: string) => void;
}

export default function DesignPatternPilotStudio(props: DesignPatternPilotStudioProps) {
  const group = getPilotGroupForModule(props.moduleId);
  if (!group) return null;
  return <DesignPatternPilotStudioInner key={group.id} group={group} {...props} />;
}

function DesignPatternPilotStudioInner({
  group,
  moduleId,
  moduleCode,
  isInstructorView,
  patternPilotScript,
  onApplyDraftToPractice,
  onOpenProjectHub,
}: DesignPatternPilotStudioProps & { group: DesignPatternPilotGroup }) {
  const [activeTab, setActiveTab] = useState<StudioTab>("patterns");
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    () => group.patterns[0]?.id ?? ""
  );
  const [selectedSmellIds, setSelectedSmellIds] = useState<string[]>([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [antiOverAbstractionNote, setAntiOverAbstractionNote] = useState<string>("");
  const [evaluation, setEvaluation] = useState<FaultDrillEvaluationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const canShowScriptTab = Boolean(isInstructorView && patternPilotScript);
  const effectiveTab: StudioTab =
    activeTab === "script" && !canShowScriptTab ? "patterns" : activeTab;

  const selectedPattern =
    group.patterns.find((p) => p.id === selectedPatternId) ?? group.patterns[0];
  const drill = group.faultDrill;
  const selectedDecision =
    drill.decisionOptions.find((d) => d.id === selectedDecisionId) ?? null;

  const selectedSmellLabels = drill.smellOptions
    .filter((s) => selectedSmellIds.includes(s.id))
    .map((s) => s.label);

  function handleToggleSmell(smellId: string) {
    setSelectedSmellIds((prev) =>
      prev.includes(smellId) ? prev.filter((id) => id !== smellId) : [...prev, smellId]
    );
    setEvaluation(null);
  }

  function handleRunDrillEvaluation() {
    const result = evaluateFaultDrill({
      drill,
      selectedSmellIds,
      selectedDecisionId,
      antiOverAbstractionNote,
    });
    setEvaluation(result);
  }

  function handleResetDrill() {
    setSelectedSmellIds([]);
    setSelectedDecisionId(null);
    setAntiOverAbstractionNote("");
    setEvaluation(null);
    setAppliedNotice(false);
  }

  async function handleCopyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 1800);
    } catch {
      // Ignore clipboard failures in restricted browsers
    }
  }

  function buildCurrentDraftMarkdown(): string {
    const currentEval =
      evaluation ??
      evaluateFaultDrill({
        drill,
        selectedSmellIds,
        selectedDecisionId,
        antiOverAbstractionNote,
      });
    return buildPatternPilotEvidenceMarkdown({
      moduleCode,
      group,
      selectedPattern,
      selectedSmellLabels,
      selectedDecision,
      evaluation: currentEval,
      antiOverAbstractionNote,
    });
  }

  function handleApplyDraft() {
    onApplyDraftToPractice(buildCurrentDraftMarkdown());
    setAppliedNotice(true);
    window.setTimeout(() => setAppliedNotice(false), 2600);
  }

  const isStage1Pilot =
    moduleId === "m3" || moduleId === "m5" || moduleId === "m8" || moduleId === "m9";

  return (
    <section
      aria-label={`${moduleCode} 设计模式与架构边界工作台`}
      className="p-5 sm:p-6 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
            <span className="text-gemini-cyan font-semibold inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isStage1Pilot
                  ? "Stage 1 设计模式先导试点"
                  : "核心课 · 软件设计模式与架构边界实战"}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{group.moduleLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{group.patterns.length} 张模式卡 · 1 套故障演练 · 4 维 Rubric</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
            {group.title}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            核心判断：{group.coreQuestion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenProjectHub && (
            <button
              type="button"
              onClick={() => onOpenProjectHub("workspace", moduleId)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>在 Project Studio 中联调</span>
            </button>
          )}
          {onOpenProjectHub && (
            <button
              type="button"
              onClick={() => onOpenProjectHub("tutor", moduleId)}
              className="px-3 py-1.5 rounded-lg bg-gemini-purple/15 hover:bg-gemini-purple/25 border border-gemini-purple/40 text-xs text-purple-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>问 Tutor 模式边界</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div
        role="tablist"
        aria-label="设计模式试点视图切换"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={effectiveTab === "patterns"}
          onClick={() => setActiveTab("patterns")}
          className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            effectiveTab === "patterns"
              ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
              : "bg-[#070b14] border-white/12 text-slate-300 hover:border-white/25 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>01 模式卡（7 步决策法）</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={effectiveTab === "drill"}
          onClick={() => setActiveTab("drill")}
          className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            effectiveTab === "drill"
              ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
              : "bg-[#070b14] border-white/12 text-slate-300 hover:border-white/25 hover:text-white"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>
            02 故障演练台
            {evaluation ? (evaluation.passed ? " [已通过]" : " [待收敛]") : ""}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={effectiveTab === "rubric"}
          onClick={() => setActiveTab("rubric")}
          className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
            effectiveTab === "rubric"
              ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
              : "bg-[#070b14] border-white/12 text-slate-300 hover:border-white/25 hover:text-white"
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>03 工程四维 Rubric</span>
        </button>

        {isInstructorView && patternPilotScript && (
          <button
            type="button"
            role="tab"
            aria-selected={effectiveTab === "script"}
            onClick={() => setActiveTab("script")}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
              effectiveTab === "script"
                ? "bg-gemini-purple text-white border-gemini-purple font-semibold"
                : "bg-gemini-purple/15 border-gemini-purple/45 text-purple-200 hover:bg-gemini-purple/25"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>04 90 分钟教师带教脚本</span>
          </button>
        )}
      </div>

      {/* Tab 1: 7-Step Pattern Cards */}
      {effectiveTab === "patterns" && selectedPattern && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {group.patterns.map((pat, idx) => {
              const active = pat.id === selectedPattern.id;
              return (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => setSelectedPatternId(pat.id)}
                  className={`px-3 py-2 rounded-xl border text-left text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-white/12 border-gemini-cyan text-white font-semibold"
                      : "bg-[#070b14] border-white/10 text-slate-300 hover:border-white/25"
                  }`}
                >
                  <span className="font-mono text-gemini-cyan mr-1.5">
                    0{idx + 1}
                  </span>
                  <span>{pat.name}</span>
                  <span className="text-slate-400 font-mono ml-1.5">
                    ({pat.moduleCodes.join("/")})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#070b14] border border-white/12 space-y-4 text-xs">
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <div className="font-mono text-[11px] text-gemini-cyan">
                  {selectedPattern.englishName} · 覆盖 {selectedPattern.moduleCodes.join(" / ")}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedPattern.name}
                </h3>
                <p className="text-slate-300 mt-1">{selectedPattern.focusGoal}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("drill")}
                className="px-3 py-1.5 rounded-lg bg-gemini-cyan/15 hover:bg-gemini-cyan/25 border border-gemini-cyan/40 text-gemini-cyan font-mono text-[11px] cursor-pointer whitespace-nowrap shrink-0"
              >
                前往故障演练实战 →
              </button>
            </div>

            {/* 1. 问题与变化方向 */}
            <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 space-y-1">
              <div className="font-mono text-[11px] text-amber-300 font-semibold">
                1. 问题与变化方向（先找哪里会变，再决定要不要抽象）
              </div>
              <p className="text-slate-200 leading-relaxed">
                {selectedPattern.problemAndChangeAxis}
              </p>
            </div>

            {/* 2 & 3. 最简单实现 vs 模式方案 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-black/45 border border-white/10 space-y-2">
                <div className="font-mono text-[11px] text-slate-300 font-semibold">
                  2. 最简单实现（能跑且够用时优先保持简单）
                </div>
                <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedPattern.simplestImplementation}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-400/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-emerald-300 font-semibold">
                    3. 模式方案（受控收敛写法）
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopyText(
                        `pat-${selectedPattern.id}`,
                        selectedPattern.patternSolution
                      )
                    }
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === `pat-${selectedPattern.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-gemini-cyan" />
                        <span>复制骨架</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[11px] text-emerald-100 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {selectedPattern.patternSolution}
                </pre>
              </div>
            </div>

            {/* 4 & 5. 代价与反例 + AI 协作约束 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-rose-500/[0.04] border border-rose-400/25 space-y-1.5">
                <div className="font-mono text-[11px] text-rose-300 font-semibold">
                  4. 代价与反例（滥用该模式长什么样）
                </div>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedPattern.tradeoffsAndAntiExamples}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gemini-purple/[0.07] border border-gemini-purple/30 space-y-1.5">
                <div className="font-mono text-[11px] text-purple-200 font-semibold">
                  5. AI 协作约束（Prompt 写名词不够，必须落到 Rules 与目录边界）
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {selectedPattern.aiCollabProtocol}
                </p>
              </div>
            </div>

            {/* 6 & 7. 测试验证 + 何时不该使用 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 space-y-1.5">
                <div className="font-mono text-[11px] text-gemini-cyan font-semibold">
                  6. 确定性测试验证（证明结构没有被绕过）
                </div>
                <ul className="space-y-1 text-slate-200">
                  {selectedPattern.verificationChecks.map((chk, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{chk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-400/35 space-y-1.5">
                <div className="font-mono text-[11px] text-amber-300 font-semibold inline-flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>7. 何时不该使用（KISS / YAGNI 反过度抽象底线）</span>
                </div>
                <p className="text-amber-100/95 leading-relaxed">
                  {selectedPattern.whenNotToUse}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Fault Drill */}
      {effectiveTab === "drill" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {drill.title}
              </h3>
              <button
                type="button"
                onClick={handleResetDrill}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置演练</span>
              </button>
            </div>
            <p className="text-slate-300 leading-relaxed">{drill.scenarioContext}</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-7 space-y-1.5">
                <div className="font-mono text-[11px] text-amber-300">
                  {drill.buggyTitle}
                </div>
                <pre className="p-3 rounded-xl bg-black/65 border border-white/10 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                  {drill.buggyCode}
                </pre>
              </div>

              <div className="lg:col-span-5 p-3 rounded-xl bg-rose-500/[0.05] border border-rose-400/25 space-y-2">
                <div className="font-mono text-[11px] text-rose-300 font-semibold inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>故障复现轨迹与证据</span>
                </div>
                <ul className="space-y-2 text-slate-200 font-mono text-[11px] leading-relaxed">
                  {drill.reproductionTrace.map((line, idx) => (
                    <li key={idx} className="p-2 rounded bg-black/50 border border-white/10">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Step A: Identify Smells */}
          <div className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-white">
                步骤 1 · 诊断坏味道（勾选导致故障的结构问题，排除过度设计诱饵）
              </span>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                已勾选 {selectedSmellIds.length} 项
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {drill.smellOptions.map((smell) => {
                const checked = selectedSmellIds.includes(smell.id);
                return (
                  <button
                    key={smell.id}
                    type="button"
                    onClick={() => handleToggleSmell(smell.id)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer space-y-1 ${
                      checked
                        ? "bg-gemini-cyan/12 border-gemini-cyan text-white"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`font-mono shrink-0 ${
                          checked ? "text-gemini-cyan" : "text-slate-500"
                        }`}
                      >
                        {checked ? "[✓]" : "[ ]"}
                      </span>
                      <span className="font-medium leading-snug">{smell.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step B: Choose Right-Sized Pattern Solution */}
          <div className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-2.5">
            <div className="font-semibold text-white">
              步骤 2 · 选择或拒绝设计模式方案（对比“欠设计补丁 / 过度抽象 / 克制模式”）
            </div>
            <div className="space-y-2">
              {drill.decisionOptions.map((opt) => {
                const picked = selectedDecisionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedDecisionId(opt.id);
                      setEvaluation(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      picked
                        ? "bg-gemini-cyan/12 border-gemini-cyan text-white"
                        : "bg-white/[0.02] border-white/10 text-slate-300 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`font-mono shrink-0 ${
                          picked ? "text-gemini-cyan" : "text-slate-500"
                        }`}
                      >
                        {picked ? "(●)" : "( )"}
                      </span>
                      <span className="font-semibold leading-snug">{opt.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 pl-6 leading-relaxed">
                      {opt.summary}
                    </div>
                    <pre className="ml-6 p-2 rounded bg-black/55 border border-white/10 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                      {opt.patchPreview}
                    </pre>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step C: Explain Anti-Over-Abstraction */}
          <div className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={`anti-over-${moduleId}`} className="font-semibold text-white">
                步骤 3 · {drill.antiOverAbstractionPrompt}
              </label>
              <button
                type="button"
                onClick={() => {
                  setAntiOverAbstractionNote(drill.antiOverAbstractionSample);
                  setEvaluation(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] font-mono text-gemini-cyan cursor-pointer whitespace-nowrap"
              >
                载入参考切入角度
              </button>
            </div>
            <textarea
              id={`anti-over-${moduleId}`}
              rows={3}
              value={antiOverAbstractionNote}
              onChange={(e) => {
                setAntiOverAbstractionNote(e.target.value);
                setEvaluation(null);
              }}
              placeholder="至少 16 字：说明当前拒绝了哪类多余抽象层，以及未来业务增长到什么明确阈值才值得拆分。"
              className="w-full p-2.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleRunDrillEvaluation}
                className="px-4 py-2 rounded-xl bg-gemini-cyan text-slate-950 font-semibold text-xs hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" />
                <span>运行故障诊断与验收检查</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void handleCopyText("drill-md", buildCurrentDraftMarkdown())
                  }
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-mono text-[11px] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedKey === "drill-md" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>已复制决策记录</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gemini-cyan" />
                      <span>复制决策记录</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleApplyDraft}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/45 text-emerald-200 font-semibold text-[11px] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{appliedNotice ? "已写入本模块交付草稿" : "写入本模块交付草稿"}</span>
                </button>
              </div>
            </div>

            {evaluation && (
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  evaluation.passed
                    ? "bg-emerald-500/10 border-emerald-400/45"
                    : "bg-amber-500/10 border-amber-400/45"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`font-semibold inline-flex items-center gap-1.5 ${
                      evaluation.passed ? "text-emerald-200" : "text-amber-200"
                    }`}
                  >
                    {evaluation.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{evaluation.summaryMessage}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                    命中坏味道 {evaluation.smellMatchedCount}/{evaluation.actualSmellCount} · 误选诱饵{" "}
                    {evaluation.falseSmellPickedCount}
                  </span>
                </div>

                {evaluation.assertions.length > 0 && (
                  <div className="space-y-1.5">
                    {evaluation.assertions.map((as) => (
                      <div
                        key={as.id}
                        className="p-2 rounded-lg bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]"
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            as.passed ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {as.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          <span>{as.label}</span>
                        </span>
                        <span className="text-slate-300">{as.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Stage 1 4-Criterion Rubric */}
      {effectiveTab === "rubric" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {STAGE1_PILOT_RUBRIC.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#070b14] border border-white/12 space-y-2"
            >
              <div className="font-mono text-gemini-cyan font-semibold">
                {item.dimension}
              </div>
              <p className="text-slate-100 leading-relaxed">{item.passCriteria}</p>
              <div className="text-[11px] text-emerald-300/90">
                验收证据：{item.evidence}
              </div>
              <div className="text-[11px] text-rose-300/90">
                扣分红旗：{item.redFlag}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Server-Gated 90-Min Instructor Script */}
      {effectiveTab === "script" && isInstructorView && patternPilotScript && (
        <div className="p-4 sm:p-5 rounded-xl bg-gemini-purple/[0.08] border border-gemini-purple/45 space-y-4 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gemini-purple/30">
            <div className="space-y-1">
              <div className="font-mono text-[11px] text-purple-200 inline-flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-gemini-purple" />
                <span>仅教师视图可见 · {patternPilotScript.pairTitle}</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {patternPilotScript.lessonTitle}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                课前材料定位：{patternPilotScript.preClassMaterialsNote}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-gemini-purple/40 font-mono text-purple-100 inline-flex items-center gap-1.5 tabular-nums whitespace-nowrap shrink-0">
              <Clock className="w-3.5 h-3.5 text-gemini-purple" />
              <span>总时长 {patternPilotScript.totalMinutes} 分钟（5 阶段）</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {patternPilotScript.phases.map((phase) => (
              <div
                key={phase.phaseIndex}
                className="p-3.5 rounded-xl bg-[#070b14] border border-white/12 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-white">
                    <span className="font-mono text-gemini-cyan mr-2">
                      阶段 {phase.phaseIndex}
                    </span>
                    <span>{phase.title}</span>
                  </div>
                  <span className="font-mono text-[11px] text-purple-200 tabular-nums">
                    {phase.durationMinutes} 分钟
                  </span>
                </div>
                <div className="text-slate-300 leading-relaxed">
                  <span className="font-mono text-slate-400">目标：</span>
                  {phase.goal}
                </div>
                <div className="text-slate-200 leading-relaxed">
                  <span className="font-mono text-emerald-300">教师操作：</span>
                  {phase.instructorAction}
                </div>
                <div className="text-slate-300 leading-relaxed">
                  <span className="font-mono text-gemini-cyan">现场 Repo 锚点：</span>
                  {phase.liveRepoCue}
                </div>
                <div className="text-amber-200/95 leading-relaxed">
                  <span className="font-mono text-amber-300">课堂追问：</span>
                  {phase.facilitationPrompt}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-400/30 space-y-1.5">
              <div className="font-mono text-[11px] text-rose-300 font-semibold">
                课堂反过度抽象红线（发现即叫停做减法）
              </div>
              <ul className="space-y-1 text-slate-200 leading-relaxed">
                {patternPilotScript.overAbstractionRedFlags.map((flag, idx) => (
                  <li key={idx}>· {flag}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/12 space-y-1.5">
              <div className="font-mono text-[11px] text-gemini-cyan font-semibold">
                收尾口头答辩核验提问
              </div>
              <ul className="space-y-1 text-slate-200 leading-relaxed">
                {patternPilotScript.oralDefenseQuestions.map((q, idx) => (
                  <li key={idx}>· {q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
