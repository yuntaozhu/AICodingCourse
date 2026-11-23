import { useState, type KeyboardEvent, type MouseEvent, type WheelEvent } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenCheck,
  Compass,
  RefreshCw,
  Target,
} from "lucide-react";
import Slide from "@/components/Slide";
import {
  getQuizReviewSummary,
  type ModuleQuiz,
  type QuizReviewTarget,
} from "@/data/moduleQuizzes";
import {
  buildRetryWrongAnswersState,
  getQuestionRemediation,
  MODULE_OBJECTIVES,
} from "@/data/quizRemediation";
import { formatModuleCodeFromId } from "@/data/courseWorkspaceStore";
import { cn } from "@/lib/utils";

interface QuizSlideProps {
  quiz: ModuleQuiz;
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

const STORAGE_KEY = "cursor_course_quiz_v1";

function loadStoredModuleAnswers(
  moduleId: string,
  legacyModuleNumber: number
): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, number>>;
    return (
      parsed[moduleId] ??
      (legacyModuleNumber <= 10 ? parsed[String(legacyModuleNumber)] : undefined) ??
      {}
    );
  } catch {
    return {};
  }
}

function saveStoredModuleAnswers(
  moduleId: string,
  legacyModuleNumber: number,
  moduleAnswers: Record<string, number>
) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, number>>) : {};
    if (Object.keys(moduleAnswers).length === 0) {
      delete parsed[moduleId];
      delete parsed[String(legacyModuleNumber)];
    } else {
      parsed[moduleId] = moduleAnswers;
      delete parsed[String(legacyModuleNumber)];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent("course:quiz-progress-updated"));
  } catch {
    // Ignore storage quota or serialization errors
  }
}

import { useAuth } from "@/context/authContextCore";
import { submitQuizAnswers } from "@/lib/apiClient";

export default function QuizSlide({ quiz }: QuizSlideProps) {
  const { session } = useAuth();
  const isFreeTrial = quiz.moduleId === "m1";
  const hasPaidAccess = Boolean(session?.hasPaidAccess);
  const canTakeQuiz = isFreeTrial || hasPaidAccess;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    loadStoredModuleAnswers(quiz.moduleId, quiz.moduleNumber)
  );
  const [showSummary, setShowSummary] = useState(false);

  const questions = quiz.questions;
  const totalCount = questions.length;
  const currentQuestion = questions[currentIndex];

  const selectedOption = answers[currentQuestion.id];
  const isAnswered = selectedOption !== undefined;
  const isCurrentCorrect = isAnswered && selectedOption === currentQuestion.correctIndex;

  const summary = getQuizReviewSummary(quiz, answers);
  const { answeredCount, correctCount, accuracyPct } = summary;
  const allAnswered = answeredCount === totalCount;

  const handleJumpToReviewTarget = (target: QuizReviewTarget, e: MouseEvent) => {
    e.stopPropagation();
    if (target.labId) {
      window.dispatchEvent(
        new CustomEvent("reveal:jump-lab", {
          detail: { labId: target.labId },
        })
      );
    } else if (target.moduleId) {
      window.dispatchEvent(
        new CustomEvent("reveal:jump-module", {
          detail: { moduleId: target.moduleId, v: 0 },
        })
      );
    }
  };

  const stopRevealPropagation = (e: MouseEvent | WheelEvent) => {
    e.stopPropagation();
  };

  const handleSelectOption = (optionIndex: number, e?: MouseEvent) => {
    e?.stopPropagation();
    if (!canTakeQuiz || isAnswered) return;
    setAnswers((prev) => {
      const next = {
        ...prev,
        [currentQuestion.id]: optionIndex,
      };
      saveStoredModuleAnswers(quiz.moduleId, quiz.moduleNumber, next);
      if (session && Object.keys(next).length === totalCount) {
        void submitQuizAnswers(quiz.moduleId, next).catch(() => {});
      }
      return next;
    });
  };

  if (!canTakeQuiz) {
    return (
      <Slide
        backgroundColor={quiz.backgroundColor ?? "#020205"}
        notes={`${formatModuleCodeFromId(quiz.moduleId)} 测验需要登录并开通课程权益后解锁。`}
      >
        <div className="max-w-3xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300">
            ENTITLEMENT REQUIRED · {formatModuleCodeFromId(quiz.moduleId)}
          </div>
          <h3 className="text-3xl font-bold text-white">{quiz.moduleTitle} · 模块验收测验</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            M1 模块测验开放免费体验；M2–M13-Eng 完整题库与服务端判分记录需登录账号并开通自助学习卡或小班权益后作答。
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!session) {
                window.dispatchEvent(new CustomEvent("app:open-login"));
              } else {
                window.dispatchEvent(new CustomEvent("app:open-billing"));
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gemini-purple text-white text-sm font-semibold cursor-pointer"
          >
            {session ? "开通权益或兑换激活码" : "登录账号解锁测验"}
          </button>
        </div>
      </Slide>
    );
  }

  const handlePrev = (e: MouseEvent) => {
    e.stopPropagation();
    if (showSummary) {
      setShowSummary(false);
      setCurrentIndex(totalCount - 1);
      return;
    }
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleJumpToQuestion = (idx: number, e: MouseEvent) => {
    e.stopPropagation();
    setShowSummary(false);
    setCurrentIndex(idx);
  };

  const handleReset = (e: MouseEvent) => {
    e.stopPropagation();
    setAnswers({});
    saveStoredModuleAnswers(quiz.moduleId, quiz.moduleNumber, {});
    setCurrentIndex(0);
    setShowSummary(false);
  };

  const handleRetryWrongOnly = (e: MouseEvent) => {
    e.stopPropagation();
    const { keptAnswers, firstWrongIndex } = buildRetryWrongAnswersState(questions, answers);
    setAnswers(keptAnswers);
    saveStoredModuleAnswers(quiz.moduleId, quiz.moduleNumber, keptAnswers);
    setCurrentIndex(firstWrongIndex);
    setShowSummary(false);
  };

  const currentRemediation = getQuestionRemediation(currentQuestion.id, quiz.moduleId);
  const moduleObjective = MODULE_OBJECTIVES[quiz.moduleId];
  const displayModuleCode = formatModuleCodeFromId(quiz.moduleId);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (showSummary) return;
    const keyMap: Record<string, number> = {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    };
    if (e.key in keyMap) {
      e.stopPropagation();
      e.preventDefault();
      handleSelectOption(keyMap[e.key]);
    }
  };

  const getMasteryTier = () => {
    if (accuracyPct === 100) {
      return {
        label: "掌握极佳 · 架构通关",
        colorClass: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        summaryText: "你已完整掌握本模块的核心概念与工程实践原则，可继续推进下一模块。",
      };
    }
    if (accuracyPct >= 66) {
      return {
        label: "基础扎实 · 建议复盘错题",
        colorClass: "text-gemini-cyan border-gemini-cyan/40 bg-gemini-cyan/10",
        summaryText: "核心链路理解清晰，点击下方未答对题目的卡片即可回看详细解析。",
      };
    }
    return {
      label: "需加强巩固 · 建议重温本节",
      colorClass: "text-amber-400 border-amber-500/40 bg-amber-500/10",
      summaryText: "建议回顾本模块关键幻灯片后点击“重新测试”，巩固确定性研发方法论。",
    };
  };

  const mastery = getMasteryTier();

  return (
    <Slide
      backgroundColor={quiz.backgroundColor ?? "#020205"}
      notes={`${displayModuleCode} 课后测验：${quiz.moduleTitle}。共 ${totalCount} 道单选巩固题，检验学习掌握度。`}
    >
      <div
        className="max-w-6xl mx-auto h-full flex flex-col justify-center select-none"
        onKeyDown={handleKeyDown}
        onWheel={stopRevealPropagation}
      >
        {/* Top Module & Progress Bar */}
        <div className="flex items-end justify-between border-b border-white/10 pb-3.5 mb-4">
          <div>
            <div className="text-[11px] font-mono tracking-[0.18em] text-gemini-cyan uppercase mb-1">
              {displayModuleCode} · 课后知识测验
            </div>
            <div className="text-2xl font-bold text-white tracking-tight leading-tight">
              {quiz.moduleTitle}
              <span className="text-white/40 font-normal text-base ml-3">{quiz.subtitle}</span>
            </div>
            {moduleObjective && (
              <div className="text-xs text-slate-400 mt-1">
                <span className="text-emerald-300/90 font-mono">验收目标：</span>
                {moduleObjective.observableOutcome}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
                已完成 / 总题数
              </div>
              <div className="text-lg font-mono font-bold text-white tabular-nums">
                {answeredCount} / {totalCount}
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase tracking-wider text-white/45">
                当前得分
              </div>
              <div className="text-lg font-mono font-bold text-gemini-cyan tabular-nums">
                {correctCount} / {totalCount} ({accuracyPct}%)
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Content */}
        {!showSummary ? (
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Left Zone: Question + Options + Immediate Feedback */}
            <div className="col-span-8 flex flex-col justify-between bg-[#080911] border border-white/10 rounded-2xl p-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gemini-purple tracking-wider uppercase">
                    第 {currentIndex + 1} 题 · {currentQuestion.topic}
                  </span>
                  {isAnswered ? (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        isCurrentCorrect ? "text-emerald-400" : "text-rose-400"
                      )}
                    >
                      {isCurrentCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>回答正确</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>
                            回答有误 · 正确答案 {OPTION_LABELS[currentQuestion.correctIndex]}
                          </span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-white/45">
                      点击选项或按数字键 1-4 作答
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-white leading-snug mb-1.5">
                  {currentQuestion.question}
                </h4>
                <div className="text-[11px] font-mono text-slate-400 mb-3">
                  考察目标：{currentRemediation.learningObjective}
                </div>

                {/* 4 Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((optionText, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrectOption = currentQuestion.correctIndex === idx;

                    let cardStyle =
                      "bg-white/[0.03] border-white/10 text-white/85 hover:bg-white/[0.07] hover:border-gemini-cyan/50";
                    let keyBadgeStyle = "bg-white/10 text-white/70 border-white/15";

                    if (isAnswered) {
                      if (isCorrectOption) {
                        cardStyle =
                          "bg-emerald-500/12 border-emerald-500/60 text-white";
                        keyBadgeStyle =
                          "bg-emerald-500 text-black border-emerald-400 font-bold";
                      } else if (isSelected && !isCorrectOption) {
                        cardStyle =
                          "bg-rose-500/12 border-rose-500/60 text-white/90";
                        keyBadgeStyle =
                          "bg-rose-500 text-white border-rose-400 font-bold";
                      } else {
                        cardStyle =
                          "bg-white/[0.015] border-white/5 text-white/40 opacity-75";
                        keyBadgeStyle = "bg-white/5 text-white/30 border-white/10";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={(e) => handleSelectOption(idx, e)}
                        className={cn(
                          "w-full min-h-[46px] px-4 py-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer disabled:cursor-default",
                          cardStyle
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-md border text-xs font-mono flex items-center justify-center shrink-0 transition-colors",
                              keyBadgeStyle
                            )}
                          >
                            {OPTION_LABELS[idx]}
                          </span>
                          <span className="text-sm leading-snug">{optionText}</span>
                        </div>

                        {isAnswered && isCorrectOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>正确</span>
                          </span>
                        )}
                        {isAnswered && isSelected && !isCorrectOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400 shrink-0">
                            <XCircle className="w-4 h-4" />
                            <span>你的选择</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanation Panel */}
              <div
                className={cn(
                  "mt-4 rounded-xl border px-4 py-3 transition-colors",
                  isAnswered
                    ? isCurrentCorrect
                      ? "bg-emerald-950/25 border-emerald-500/30"
                      : "bg-gemini-purple/10 border-gemini-purple/35"
                    : "bg-white/[0.02] border-white/10"
                )}
              >
                {isAnswered ? (
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <BookOpenCheck className="w-4 h-4 text-gemini-cyan shrink-0 mt-0.5" />
                      <div className="text-[13px] leading-relaxed text-white/85">
                        <span className="font-semibold text-gemini-cyan mr-1.5">
                          核心解析：
                        </span>
                        {currentQuestion.explanation}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <span className="text-[11px] font-mono text-white/65">
                        {isCurrentCorrect ? "关联巩固：" : "复习建议："}
                        <span className="text-slate-300 font-sans ml-1">
                          {currentRemediation.reviewAction}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) =>
                          handleJumpToReviewTarget(
                            currentQuestion.reviewTarget ?? {
                              label: currentRemediation.labLabel ?? `${displayModuleCode} 首页`,
                              labId: currentRemediation.labId,
                              moduleId: currentRemediation.moduleId,
                            },
                            e
                          )
                        }
                        className={cn(
                          "px-2.5 py-1 rounded-lg border text-[11px] font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0",
                          isCurrentCorrect
                            ? "bg-white/5 border-white/15 text-slate-200 hover:border-gemini-cyan/50 hover:text-gemini-cyan"
                            : "bg-amber-500/15 border-amber-400/45 text-amber-200 hover:bg-amber-500/25"
                        )}
                      >
                        <Compass className="w-3 h-3 shrink-0" />
                        <span>
                          {currentQuestion.reviewTarget?.label ??
                            currentRemediation.labLabel ??
                            `回看 ${displayModuleCode} 首页`}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[13px] text-white/45">
                    <Target className="w-4 h-4 text-white/35 shrink-0" />
                    <span>选择一个答案后，系统将立即给出判定与架构原理剖析。</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Zone: Navigator, Mastery Gauge & Actions */}
            <div className="col-span-4 flex flex-col justify-between bg-[#080911] border border-white/10 rounded-2xl p-5">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                  题目导航 · 共 {totalCount} 题
                </div>
                <div className="space-y-2 mb-5">
                  {questions.map((q, idx) => {
                    const ans = answers[q.id];
                    const answered = ans !== undefined;
                    const correct = answered && ans === q.correctIndex;
                    const active = idx === currentIndex;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={(e) => handleJumpToQuestion(idx, e)}
                        className={cn(
                          "w-full min-h-[44px] px-3.5 py-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer",
                          active
                            ? "bg-gemini-cyan/12 border-gemini-cyan/60 text-white"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.06]"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-white/45">
                            Q{idx + 1}
                          </div>
                          <div className="text-xs font-medium truncate">{q.topic}</div>
                        </div>

                        {answered ? (
                          correct ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>正确</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 shrink-0">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>待复盘</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] font-mono text-white/35 shrink-0">
                            未作答
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/60">作答进度</span>
                    <span className="font-mono text-white tabular-nums">
                      {answeredCount}/{totalCount}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gemini-purple to-gemini-cyan transition-all duration-300"
                      style={{
                        width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation & Control Actions */}
              <div className="space-y-2.5 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="min-h-[42px] px-3 py-2 rounded-xl border border-white/15 bg-white/[0.03] text-xs font-medium text-white/85 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>上一题</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className={cn(
                      "min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors",
                      currentIndex === totalCount - 1
                        ? "bg-gemini-cyan text-black hover:bg-gemini-cyan/90"
                        : "bg-gemini-purple/25 border border-gemini-purple/50 text-white hover:bg-gemini-purple/35"
                    )}
                  >
                    <span>
                      {currentIndex === totalCount - 1 ? "查看评估结果" : "下一题"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!allAnswered}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSummary(true);
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/75 hover:bg-white/[0.07] disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-gemini-cyan" />
                    <span>成绩总览</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[40px] px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/75 hover:bg-white/[0.07] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重置测验</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Summary & Review View */
          <div className="grid grid-cols-12 gap-6 items-stretch">
            <div className="col-span-5 bg-[#080911] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-gemini-cyan mb-2">
                  本节评估报告
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-5xl font-bold text-white tabular-nums">
                    {accuracyPct}%
                  </span>
                  <span className="text-sm font-mono text-white/60 tabular-nums">
                    ({correctCount} / {totalCount} 题正确)
                  </span>
                </div>

                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold mb-4",
                    mastery.colorClass
                  )}
                >
                  <Award className="w-4 h-4" />
                  <span>{mastery.label}</span>
                </div>

                <div className="text-sm text-white/75 leading-relaxed">
                  {mastery.summaryText}
                </div>

                {summary.recommendedTargets.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-mono text-amber-300">
                      针对错题直达复习（共 {summary.missedQuestions.length} 处待巩固）：
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.recommendedTargets.map((target) => (
                        <button
                          key={`${target.labId ?? ""}-${target.moduleId ?? ""}-${target.label}`}
                          type="button"
                          onClick={(e) => handleJumpToReviewTarget(target, e)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/12 hover:bg-amber-500/22 border border-amber-400/40 text-[11px] font-mono text-amber-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Compass className="w-3 h-3 shrink-0" />
                          <span>{target.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-5 border-t border-white/10">
                {correctCount < totalCount && answeredCount > 0 && (
                  <button
                    type="button"
                    onClick={handleRetryWrongOnly}
                    className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-xs font-semibold text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>仅重练错题/未答 ({totalCount - correctCount} 题)</span>
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.03] text-xs font-medium text-white hover:bg-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>返回复盘题目</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-gemini-cyan text-black text-xs font-semibold hover:bg-gemini-cyan/90 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>全部重测</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-7 bg-[#080911] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                  逐题复盘清单（点击任意卡片可回看详细解析）
                </div>
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const userChoice = answers[q.id];
                    const isAnsweredItem = userChoice !== undefined;
                    const isRight = isAnsweredItem && userChoice === q.correctIndex;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={(e) => handleJumpToQuestion(idx, e)}
                        className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.025] hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-xs font-mono text-gemini-purple">
                            Q{idx + 1} · {q.topic}
                          </span>
                          {isRight ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>回答正确</span>
                            </span>
                          ) : isAnsweredItem ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-400">
                              <XCircle className="w-4 h-4" />
                              <span>
                                选了 {OPTION_LABELS[userChoice]} · 正解{" "}
                                {OPTION_LABELS[q.correctIndex]}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-white/45">尚未作答</span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-white/90 line-clamp-1">
                          {q.question}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-white/50">
                <span>
                  {session
                    ? "已同步至云端学习档案与本地浏览器（可按模块持久化成绩）"
                    : "免费试学作答暂存当前浏览器，登录后可云端持久化"}
                </span>
                <span className="font-mono tabular-nums shrink-0">
                  {displayModuleCode} COMPLETE
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Slide>
  );
}
