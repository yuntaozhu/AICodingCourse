import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Compass,
  FileCode2,
  GraduationCap,
  HelpCircle,
  Layers,
  Sparkles,
  Wrench,
} from "lucide-react";
import Slide from "@/components/Slide";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";
import { getModuleTeachingPackage } from "@/data/moduleTeachingPackages";
import {
  getKnowledgeEntriesForModule,
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  type KnowledgeModuleCode,
} from "@/data/teamKnowledgeBase";

export interface LoopCaseBlock {
  title: string;
  scenario: string;
  steps: string[];
  snippetLabel?: string;
  snippet?: string;
  verdict: string;
}

export interface LoopDodItem {
  id: string;
  label: string;
  verifyHint: string;
}

export interface ModuleLoopStudioProps {
  moduleCode: string;
  eyebrow: string;
  title: string;
  notes: string;
  backgroundColor?: string;
  objective: string;
  boundary: string;
  positiveCase: LoopCaseBlock;
  failureCase: LoopCaseBlock;
  dodItems: LoopDodItem[];
  artifactTitle: string;
  artifactFilename: string;
  artifactContent: string;
  reflectionQuestion: string;
  reflectionHint: string;
  practiceTitle: string;
  practicePassedCount: number;
  practiceTotalCount: number;
  renderPractice: (helpers: {
    checkedDodIds: string[];
    toggleDod: (id: string) => void;
  }) => React.ReactNode;
}

type StudioTab = "cases" | "practice" | "artifact" | "transfer";
type CasesSubView = "examples" | "compare";
type PracticeSideView = "dod" | "rubric";
type TransferSubView = "homework" | "instructor";

export default function ModuleLoopStudio({
  moduleCode,
  eyebrow,
  title,
  notes,
  backgroundColor = "#040711",
  objective,
  boundary,
  positiveCase,
  failureCase,
  dodItems,
  artifactTitle,
  artifactFilename,
  artifactContent,
  reflectionQuestion,
  reflectionHint,
  practiceTitle,
  practicePassedCount,
  practiceTotalCount,
  renderPractice,
}: ModuleLoopStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("cases");
  const [casesSubView, setCasesSubView] = useState<CasesSubView>("examples");
  const [practiceSideView, setPracticeSideView] = useState<PracticeSideView>("dod");
  const [transferSubView, setTransferSubView] = useState<TransferSubView>("homework");
  const [checkedDodIds, setCheckedDodIds] = useState<string[]>([]);
  const [showReflectionHint, setShowReflectionHint] = useState(false);

  const teachingPkg = getModuleTeachingPackage(moduleCode);
  const moduleKbEntries = getKnowledgeEntriesForModule(
    moduleCode.toUpperCase() as KnowledgeModuleCode
  );

  const toggleDod = (id: string) => {
    setCheckedDodIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenTeamKb = () => {
    window.dispatchEvent(
      new CustomEvent("course:open-team-kb", {
        detail: { moduleCode: moduleCode.toUpperCase() },
      })
    );
  };

  const dodDoneCount = checkedDodIds.length;
  const allDodDone = dodDoneCount === dodItems.length && practicePassedCount >= practiceTotalCount;

  return (
    <Slide backgroundColor={backgroundColor} notes={notes}>
      <div
        className="w-full max-w-6xl mx-auto h-full flex flex-col justify-center gap-2.5 text-left"
        onKeyDown={stopRevealKey}
        onWheel={stopRevealWheel}
      >
        {/* Top Header + Tabs */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono text-gemini-cyan uppercase tracking-wider">
              {moduleCode} · {eyebrow}
            </div>
            <h2 className="text-2xl md:text-[26px] font-bold text-white leading-tight mt-0.5">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10"
              role="tablist"
              aria-label={`${moduleCode} 学习闭环导航`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "cases"}
                onClick={() => setActiveTab("cases")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "cases"
                    ? "bg-white text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Compass className="w-3 h-3" />
                <span>01 案例与对比</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "practice"}
                onClick={() => setActiveTab("practice")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "practice"
                    ? "bg-gemini-cyan text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Wrench className="w-3 h-3" />
                <span>
                  02 演练与 Rubric ({practicePassedCount}/{practiceTotalCount})
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "artifact"}
                onClick={() => setActiveTab("artifact")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "artifact"
                    ? "bg-gemini-purple text-white font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <FileCode2 className="w-3 h-3" />
                <span>03 产物与知识库</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "transfer"}
                onClick={() => setActiveTab("transfer")}
                className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "transfer"
                    ? "bg-emerald-400 text-slate-950 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>04 迁移与备课</span>
              </button>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono tabular-nums whitespace-nowrap flex items-center gap-1.5 ${
                allDodDone
                  ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-slate-300"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                DoD {dodDoneCount}/{dodItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Always-Visible Learning Objective & Boundary Strip */}
        <div className="grid grid-cols-12 gap-3 text-xs">
          <div className="col-span-6 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="font-mono text-[10px] text-gemini-cyan uppercase tracking-wider mr-2">
              可观察目标
            </span>
            <span className="text-slate-200 leading-snug">{objective}</span>
          </div>
          <div className="col-span-6 px-3.5 py-2.5 rounded-xl bg-amber-500/[0.07] border border-amber-400/25">
            <span className="font-mono text-[10px] text-amber-300 uppercase tracking-wider mr-2">
              适用边界
            </span>
            <span className="text-slate-200 leading-snug">{boundary}</span>
          </div>
        </div>

        {/* Main Stage */}
        <div className="h-[395px] flex flex-col">
          {activeTab === "cases" && (
            <div className="flex flex-col gap-2.5 h-full">
              {teachingPkg && (
                <div className="flex items-center justify-between gap-2 text-[11px] shrink-0">
                  <span className="font-mono text-slate-400 truncate">
                    核心问题：{teachingPkg.coreQuestion}
                  </span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCasesSubView("examples")}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        casesSubView === "examples"
                          ? "bg-white text-slate-950 font-semibold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      正反案例与根因
                    </button>
                    <button
                      type="button"
                      onClick={() => setCasesSubView("compare")}
                      className={`px-2 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                        casesSubView === "compare"
                          ? "bg-gemini-cyan text-slate-950 font-semibold"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      传统 vs AI 与人机分工
                    </button>
                  </div>
                </div>
              )}

              {casesSubView === "examples" || !teachingPkg ? (
                <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                  {/* Positive Case */}
                  <div className="col-span-6 p-4 rounded-2xl bg-[#0b0f19] border border-emerald-400/35 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          正向案例 · {positiveCase.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("practice")}
                          className="text-[11px] font-mono text-gemini-cyan hover:underline cursor-pointer whitespace-nowrap"
                        >
                          去课堂演练 →
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {positiveCase.scenario}
                      </p>
                      <ol className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                        {positiveCase.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="font-mono text-emerald-400 shrink-0 tabular-nums">
                              0{idx + 1}.
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      {positiveCase.snippet && (
                        <div className="mt-1">
                          {positiveCase.snippetLabel && (
                            <div className="text-[10px] font-mono text-slate-400 mb-1">
                              {positiveCase.snippetLabel}
                            </div>
                          )}
                          <pre className="p-2.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-emerald-200 whitespace-pre-wrap leading-relaxed">
                            {positiveCase.snippet}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-mono">
                      结论：{positiveCase.verdict}
                    </div>
                  </div>

                  {/* Failure Case + Root Cause */}
                  <div className="col-span-6 p-4 rounded-2xl bg-[#0b0f19] border border-rose-400/35 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          失败案例 · {failureCase.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("artifact")}
                          className="text-[11px] font-mono text-gemini-purple hover:underline cursor-pointer whitespace-nowrap"
                        >
                          拿带走产物 →
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {failureCase.scenario}
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                        {failureCase.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="font-mono text-rose-400 shrink-0">×</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                      {failureCase.snippet && (
                        <div className="mt-1">
                          {failureCase.snippetLabel && (
                            <div className="text-[10px] font-mono text-slate-400 mb-1">
                              {failureCase.snippetLabel}
                            </div>
                          )}
                          <pre className="p-2.5 rounded-xl bg-black/55 border border-rose-400/20 font-mono text-[11px] text-rose-200 whitespace-pre-wrap leading-relaxed">
                            {failureCase.snippet}
                          </pre>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-rose-300 font-mono">
                      根因：{failureCase.verdict}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                  {/* Left: Traditional vs AI Coding Comparison */}
                  <div className="col-span-7 p-4 rounded-2xl bg-[#0b0f19] border border-white/15 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-2.5">
                    <div className="text-xs font-mono text-gemini-cyan flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>传统编程 vs AI Coding 工程对照</span>
                    </div>
                    <div className="space-y-2">
                      {teachingPkg.traditionalVsAi.rows.map((row, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] space-y-1"
                        >
                          <div className="font-semibold text-white">{row.dimension}</div>
                          <div className="text-slate-400">
                            <span className="font-mono text-slate-300">传统：</span>
                            {row.traditionalWay}
                          </div>
                          <div className="text-slate-200">
                            <span className="font-mono text-gemini-cyan">AI 时代：</span>
                            {row.aiCodingWay}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 leading-relaxed">
                      瓶颈转移：{teachingPkg.traditionalVsAi.bottleneckShift}
                    </div>
                  </div>

                  {/* Right: Human vs AI Split & Subtle Failure */}
                  <div className="col-span-5 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-2.5">
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-gemini-purple">
                        人机协同分工与不可委托决策
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/25 text-[11px] space-y-1">
                        <div className="font-semibold text-emerald-300">必须由人把关决策</div>
                        {teachingPkg.humanAiSplit.humanMustDecide.map((item, i) => (
                          <div key={i} className="text-slate-200">
                            · {item}
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] space-y-1">
                        <div className="font-semibold text-gemini-cyan">AI 适合接手起草</div>
                        {teachingPkg.humanAiSplit.aiCanDraft.map((item, i) => (
                          <div key={i} className="text-slate-300">
                            · {item}
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-500/[0.07] border border-rose-400/25 text-[11px] space-y-1">
                        <div className="font-semibold text-rose-300">“看起来对但实际错”隐蔽坑</div>
                        <div className="text-slate-200 leading-relaxed">
                          {teachingPkg.failureModesDeepDive.looksRightButWrong}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 pt-1 border-t border-white/10">
                      协作闭环：{teachingPkg.humanAiSplit.collaborativeLoop}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "practice" && (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Interactive Drill Area */}
              <div className="col-span-8 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/30 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-mono text-gemini-cyan flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{practiceTitle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    已完成 {practicePassedCount}/{practiceTotalCount} 项判定
                  </span>
                </div>
                <div className="flex-1">{renderPractice({ checkedDodIds, toggleDod })}</div>
                {teachingPkg && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-slate-300 space-y-0.5">
                    <div>
                      <span className="font-mono text-emerald-300">课堂最小版：</span>
                      {teachingPkg.exerciseVariants.minimalClassroom}
                    </div>
                    <div className="text-slate-400">
                      <span className="font-mono text-amber-300">无 Key 离线备选：</span>
                      {teachingPkg.exerciseVariants.offlineSafeFallback}
                    </div>
                  </div>
                )}
              </div>

              {/* Verifiable DoD Checklist / Rubric Toggle */}
              <div className="col-span-4 p-4 rounded-2xl bg-[#0b0f19] border border-white/15 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono text-emerald-400">
                      {practiceSideView === "dod" ? "DoD 验收清单" : "多维评价 Rubric"}
                    </span>
                    {teachingPkg && (
                      <div className="flex items-center gap-1 p-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPracticeSideView("dod")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                            practiceSideView === "dod"
                              ? "bg-white text-slate-950 font-semibold"
                              : "text-slate-300"
                          }`}
                        >
                          DoD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPracticeSideView("rubric")}
                          className={`px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                            practiceSideView === "rubric"
                              ? "bg-emerald-400 text-slate-950 font-semibold"
                              : "text-slate-300"
                          }`}
                        >
                          Rubric
                        </button>
                      </div>
                    )}
                  </div>

                  {practiceSideView === "dod" || !teachingPkg ? (
                    <div className="space-y-2">
                      {dodItems.map((item) => {
                        const checked = checkedDodIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleDod(item.id)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                              checked
                                ? "bg-emerald-500/15 border-emerald-400/45"
                                : "bg-white/[0.03] border-white/10 hover:border-white/25"
                            }`}
                          >
                            <div className="flex items-start gap-2 text-xs">
                              <span
                                className={`font-mono mt-0.5 shrink-0 ${
                                  checked ? "text-emerald-300" : "text-slate-400"
                                }`}
                              >
                                {checked ? "[✓]" : "[ ]"}
                              </span>
                              <div>
                                <div className="font-semibold text-white leading-snug">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                  验证：{item.verifyHint}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 text-[11px]">
                      {teachingPkg.rubric.map((r, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1"
                        >
                          <div className="font-semibold text-white">{r.dimension}</div>
                          <div className="text-emerald-300 leading-snug">通过：{r.passCriteria}</div>
                          <div className="text-slate-400 leading-snug">证据：{r.evidence}</div>
                          <div className="text-rose-300 leading-snug">红线：{r.redFlag}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("artifact")}
                  className="mt-3 w-full py-2 rounded-xl bg-gemini-purple/20 border border-gemini-purple/40 text-xs font-mono text-gemini-purple hover:bg-gemini-purple/30 transition-colors cursor-pointer whitespace-nowrap"
                >
                  下一步：带走产物与知识库 →
                </button>
              </div>
            </div>
          )}

          {activeTab === "artifact" && (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Reusable Artifact */}
              <div className="col-span-7 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-mono text-gemini-purple">
                      可带走复用产物 · {artifactFilename}
                    </div>
                    <div className="text-sm font-bold text-white">{artifactTitle}</div>
                  </div>
                  <CopySnippetButton text={artifactContent} label="复制完整模板" />
                </div>
                <pre
                  onWheel={stopRevealWheel}
                  className="flex-1 p-3 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap overflow-y-auto custom-scrollbar leading-relaxed"
                >
                  {artifactContent}
                </pre>
              </div>

              {/* Reflection + Team KB Mapping */}
              <div className="col-span-5 flex flex-col gap-2.5 justify-between overflow-hidden">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-gemini-cyan/30 space-y-2 overflow-y-auto custom-scrollbar">
                  <div className="text-xs font-mono text-gemini-cyan flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>课后复盘与迁移问题</span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-relaxed">
                    {reflectionQuestion}
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowReflectionHint((v) => !v)}
                      className="text-[11px] font-mono text-gemini-cyan hover:underline cursor-pointer"
                    >
                      {showReflectionHint ? "收起参考迁移思路" : "查看参考迁移思路 →"}
                    </button>
                    {showReflectionHint && (
                      <div className="mt-1.5 p-2.5 rounded-xl bg-black/50 border border-white/10 text-[11px] text-slate-200 leading-relaxed">
                        {reflectionHint}
                      </div>
                    )}
                  </div>
                </div>

                {/* Real Team KB Anchors */}
                <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-purple-200 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>团队知识库真实沉淀 ({moduleKbEntries.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleOpenTeamKb}
                        className="text-[11px] font-mono text-gemini-cyan hover:underline cursor-pointer whitespace-nowrap"
                      >
                        打开侧栏检索 →
                      </button>
                    </div>
                    {moduleKbEntries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] space-y-0.5"
                      >
                        <div className="font-semibold text-white leading-snug">{entry.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {KNOWLEDGE_CATEGORY_LABELS[entry.category]} ·{" "}
                          {KNOWLEDGE_STATUS_LABELS[entry.validationStatus]} · {entry.version} ·{" "}
                          {entry.repoPath}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-300 tabular-nums">
                    <span>
                      课堂判定 {practicePassedCount}/{practiceTotalCount}
                    </span>
                    <span className="text-emerald-400">
                      DoD {dodDoneCount}/{dodItems.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transfer" && teachingPkg && (
            <div className="flex flex-col gap-2.5 h-full">
              <div className="flex items-center justify-between gap-2 text-[11px] shrink-0">
                <div className="font-mono text-slate-400 truncate">
                  灵活授课：{teachingPkg.deliveryModes.map((dm) => dm.label).join(" · ")}
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTransferSubView("homework")}
                    className={`px-2.5 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                      transferSubView === "homework"
                        ? "bg-emerald-400 text-slate-950 font-semibold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    三档迁移任务
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferSubView("instructor")}
                    className={`px-2.5 py-0.5 rounded cursor-pointer whitespace-nowrap ${
                      transferSubView === "instructor"
                        ? "bg-gemini-cyan text-slate-950 font-semibold"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    教师演示与排课脚本
                  </button>
                </div>
              </div>

              {transferSubView === "homework" ? (
                <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
                  {teachingPkg.homeworkTiers.map((hw) => (
                    <div
                      key={hw.tier}
                      className="col-span-4 p-3.5 rounded-2xl bg-[#0b0f19] border border-white/15 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-2"
                    >
                      <div className="space-y-1.5 text-[11px]">
                        <div className="font-mono text-[10px] text-emerald-300">{hw.label}</div>
                        <div className="text-xs font-bold text-white leading-snug">{hw.title}</div>
                        <p className="text-slate-300 leading-relaxed">
                          <span className="font-mono text-slate-400">目标：</span>
                          {hw.goal}
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                          <span className="font-mono text-slate-400">约束：</span>
                          {hw.inputsAndLimits}
                        </p>
                        <p className="text-slate-200 leading-relaxed">
                          <span className="font-mono text-gemini-cyan">交付：</span>
                          {hw.deliverable}
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                          <span className="font-mono text-emerald-300">验证：</span>
                          {hw.verifyMethod}
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          <span className="font-mono text-purple-200">沉淀：</span>
                          {hw.kbContribution}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-white/10 text-[10px] text-amber-300 leading-snug">
                        人工审查卡点：{hw.humanReviewGate}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
                  {/* Left: Multi-step Live Demo with Intentional AI Flaw -> Constraint -> Fix */}
                  <div className="col-span-7 p-3.5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/30 overflow-y-auto custom-scrollbar space-y-2">
                    <div className="text-xs font-mono text-gemini-cyan">
                      讲师现场演示闭环（故意暴露 AI 缺陷 → 加约束修复 → 命令验真）
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <span className="font-mono text-slate-400">课前准备：</span>
                      {teachingPkg.instructorDemo.prepAndEnv}
                    </div>
                    <div className="space-y-2">
                      {teachingPkg.instructorDemo.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] space-y-1"
                        >
                          <div className="font-semibold text-white">{st.phase}</div>
                          <div className="text-slate-300">动作：{st.action}</div>
                          <div className="text-amber-200">
                            AI 表现/证据：{st.aiBehaviorOrEvidence}
                          </div>
                          <div className="text-emerald-300">人类把关：{st.humanControl}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Delivery Timing, Stuck Prompts & Alternative Acceptable Answers */}
                  <div className="col-span-5 p-3.5 rounded-2xl bg-[#0b0f19] border border-white/15 overflow-y-auto custom-scrollbar space-y-2.5 text-[11px]">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-gemini-purple">
                        5 种课型排课与裁剪点
                      </div>
                      {teachingPkg.deliveryModes.map((dm) => (
                        <div key={dm.mode} className="text-slate-300 leading-snug">
                          <span className="font-mono text-white">{dm.label}：</span>
                          {dm.focusPlan}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="font-semibold text-amber-300">学员卡住引导 &amp; 离线降级</div>
                      {teachingPkg.instructorDemo.stuckStudentPrompts.map((p, idx) => (
                        <div key={idx} className="text-slate-300 leading-snug">
                          {p}
                        </div>
                      ))}
                      <div className="text-slate-400 leading-snug">
                        无 Key 替代：{teachingPkg.instructorDemo.noKeyOfflineFallback}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="font-semibold text-emerald-300">可接受的多元解法</div>
                      {teachingPkg.instructorDemo.acceptableAlternatives.map((alt, idx) => (
                        <div key={idx} className="text-slate-300 leading-snug">
                          · {alt}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Slide>
  );
}
