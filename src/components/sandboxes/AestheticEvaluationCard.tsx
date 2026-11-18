import { useMemo, useState } from "react";
import { BarChart3, Code2, Plus, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { UI_REFERENCE_SITES } from "@/data/uiReferenceSites";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

export type AestheticCategoryTag =
  | "布局结构"
  | "色彩方案"
  | "动效交互"
  | "字体与留白"
  | "局部导航/页脚";

const CATEGORY_OPTIONS: AestheticCategoryTag[] = [
  "布局结构",
  "色彩方案",
  "动效交互",
  "字体与留白",
  "局部导航/页脚",
];

const CATEGORY_MDC_RULES: Record<AestheticCategoryTag, string> = {
  布局结构:
    "- [布局结构] 采用 12 列/Bento 栅格与清晰留白节奏，单屏核心视觉层级不超过 3 级。",
  色彩方案:
    "- [色彩方案] 严格遵循 60/30/10 主次配色与 WCAG 对比度，禁止高饱和杂色渐变。",
  动效交互:
    "- [动效交互] 使用 150-220ms 轻量 transition 反馈状态变化，禁止装饰性 animate-pulse。",
  字体与留白:
    "- [字体与留白] 数据指标强制 tabular-nums，按钮与标签强制 whitespace-nowrap 防折行。",
  "局部导航/页脚":
    "- [局部组件] 导航/页脚收口布局层级，明确支持 Esc 关闭、焦点可见与移动端自适应。",
};

const TARGET_SCOPE_PRESETS = [
  { id: "landing", label: "LandingPage", globs: '["src/pages/**/*.tsx", "src/components/Hero*.tsx"]' },
  { id: "dashboard", label: "Dashboard", globs: '["src/components/dashboard/**/*.tsx", "src/components/charts/**/*.tsx"]' },
  { id: "nav", label: "Navbar/Shell", globs: '["src/components/layout/**/*.tsx", "src/components/Navbar*.tsx"]' },
];

interface EvaluationRecord {
  categories: AestheticCategoryTag[];
  scores: {
    layout: number;
    color: number;
    motion: number;
  };
  note: string;
}

const DEFAULT_ACTIVE_IDS = [
  "lapa-ninja",
  "siteinspire",
  "godly",
  "navbar-gallery",
  "react-bits",
  "cult-ui",
];

const DEFAULT_PRESET_MAP: Record<string, EvaluationRecord> = {
  "lapa-ninja": {
    categories: ["布局结构", "字体与留白"],
    scores: { layout: 5, color: 3, motion: 3 },
    note: "首屏→中段→CTA 叙事递进与大字重字体节奏",
  },
  siteinspire: {
    categories: ["布局结构", "字体与留白"],
    scores: { layout: 5, color: 4, motion: 2 },
    note: "图文占比与克制留白落点，各区域互不抢戏",
  },
  godly: {
    categories: ["布局结构", "动效交互"],
    scores: { layout: 4, color: 4, motion: 4 },
    note: "桌面端与 375px 移动端分块降维切换方案",
  },
  "navbar-gallery": {
    categories: ["局部导航/页脚", "布局结构"],
    scores: { layout: 5, color: 3, motion: 3 },
    note: "展开态 Mega Menu 分类+图片并列排布不拥挤",
  },
  "react-bits": {
    categories: ["动效交互", "色彩方案"],
    scores: { layout: 3, color: 4, motion: 5 },
    note: "低速微弱氛围背景参数 + Copy for AI 源码",
  },
  "cult-ui": {
    categories: ["动效交互", "布局结构"],
    scores: { layout: 4, color: 3, motion: 5 },
    note: "常态精简 + hover 上推揭示技术规格细节",
  },
};

const STORAGE_KEY = "cursor_course_aesthetics_eval_v1";

function buildDefaultRecord(siteId: string): EvaluationRecord {
  if (DEFAULT_PRESET_MAP[siteId]) {
    return {
      categories: [...DEFAULT_PRESET_MAP[siteId].categories],
      scores: { ...DEFAULT_PRESET_MAP[siteId].scores },
      note: DEFAULT_PRESET_MAP[siteId].note,
    };
  }
  const site = UI_REFERENCE_SITES.find((s) => s.id === siteId);
  if (!site) {
    return {
      categories: ["布局结构"],
      scores: { layout: 4, color: 3, motion: 3 },
      note: "",
    };
  }
  const categories: AestheticCategoryTag[] =
    site.category === "partial"
      ? ["局部导航/页脚", "布局结构"]
      : site.category === "implementation"
      ? ["动效交互"]
      : ["布局结构", "字体与留白"];

  return {
    categories,
    scores:
      site.category === "implementation"
        ? { layout: 3, color: 4, motion: 5 }
        : { layout: 4, color: 4, motion: 3 },
    note: site.caseHighlight,
  };
}

function createInitialState(): {
  activeIds: string[];
  evaluations: Record<string, EvaluationRecord>;
} {
  const evaluations: Record<string, EvaluationRecord> = {};
  DEFAULT_ACTIVE_IDS.forEach((id) => {
    evaluations[id] = buildDefaultRecord(id);
  });
  return {
    activeIds: [...DEFAULT_ACTIVE_IDS],
    evaluations,
  };
}

function loadStoredState(): {
  activeIds: string[];
  evaluations: Record<string, EvaluationRecord>;
} {
  const fallback = createInitialState();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as {
      activeIds?: string[];
      evaluations?: Record<string, EvaluationRecord>;
    };
    if (!Array.isArray(parsed.activeIds) || parsed.activeIds.length === 0 || !parsed.evaluations) {
      return fallback;
    }
    const validIds = parsed.activeIds.filter((id) =>
      UI_REFERENCE_SITES.some((site) => site.id === id)
    );
    if (validIds.length === 0) return fallback;
    const mergedEvaluations: Record<string, EvaluationRecord> = {};
    validIds.forEach((id) => {
      mergedEvaluations[id] = parsed.evaluations?.[id] ?? buildDefaultRecord(id);
    });
    return { activeIds: validIds, evaluations: mergedEvaluations };
  } catch {
    return fallback;
  }
}

function persistState(activeIds: string[], evaluations: Record<string, EvaluationRecord>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeIds, evaluations }));
  } catch {
    // Ignore storage errors
  }
}

export default function AestheticEvaluationCard() {
  const [initialState] = useState(() => loadStoredState());
  const [activeIds, setActiveIds] = useState<string[]>(initialState.activeIds);
  const [selectedId, setSelectedId] = useState<string>(initialState.activeIds[0]);
  const [evaluations, setEvaluations] = useState<Record<string, EvaluationRecord>>(
    initialState.evaluations
  );

  const availableToAdd = useMemo(
    () => UI_REFERENCE_SITES.filter((site) => !activeIds.includes(site.id)),
    [activeIds]
  );
  const [siteToAdd, setSiteToAdd] = useState<string>("");
  const [simScopeId, setSimScopeId] = useState<string>(TARGET_SCOPE_PRESETS[0].id);
  const [simOutputTab, setSimOutputTab] = useState<"mdc" | "prompt">("mdc");

  const activeTargets = useMemo(
    () =>
      activeIds
        .map((id) => UI_REFERENCE_SITES.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [activeIds]
  );

  const selectedTarget = useMemo(
    () => activeTargets.find((t) => t.id === selectedId) || activeTargets[0],
    [activeTargets, selectedId]
  );

  const currentEval = evaluations[selectedTarget.id] ?? buildDefaultRecord(selectedTarget.id);

  const updateEvaluations = (
    updater: (prev: Record<string, EvaluationRecord>) => Record<string, EvaluationRecord>
  ) => {
    setEvaluations((prev) => {
      const next = updater(prev);
      persistState(activeIds, next);
      return next;
    });
  };

  const handleAddSite = (idToAdd: string) => {
    const targetId = idToAdd || availableToAdd[0]?.id;
    if (!targetId || activeIds.includes(targetId)) return;
    const nextIds = [...activeIds, targetId];
    const nextRecord = evaluations[targetId] ?? buildDefaultRecord(targetId);
    const nextEvaluations = { ...evaluations, [targetId]: nextRecord };
    setActiveIds(nextIds);
    setEvaluations(nextEvaluations);
    setSelectedId(targetId);
    setSiteToAdd("");
    persistState(nextIds, nextEvaluations);
  };

  const toggleCategory = (cat: AestheticCategoryTag) => {
    updateEvaluations((prev) => {
      const target = prev[selectedTarget.id] ?? buildDefaultRecord(selectedTarget.id);
      const exists = target.categories.includes(cat);
      const nextCategories = exists
        ? target.categories.filter((c) => c !== cat)
        : [...target.categories, cat];
      return {
        ...prev,
        [selectedTarget.id]: {
          ...target,
          categories: nextCategories,
        },
      };
    });
  };

  const setDimensionScore = (
    dimension: keyof EvaluationRecord["scores"],
    value: number
  ) => {
    updateEvaluations((prev) => {
      const target = prev[selectedTarget.id] ?? buildDefaultRecord(selectedTarget.id);
      return {
        ...prev,
        [selectedTarget.id]: {
          ...target,
          scores: {
            ...target.scores,
            [dimension]: value,
          },
        },
      };
    });
  };

  const updateNote = (note: string) => {
    updateEvaluations((prev) => {
      const target = prev[selectedTarget.id] ?? buildDefaultRecord(selectedTarget.id);
      return {
        ...prev,
        [selectedTarget.id]: {
          ...target,
          note,
        },
      };
    });
  };

  const handleReset = () => {
    const fresh = createInitialState();
    setActiveIds(fresh.activeIds);
    setEvaluations(fresh.evaluations);
    setSelectedId(fresh.activeIds[0]);
    setSiteToAdd("");
    persistState(fresh.activeIds, fresh.evaluations);
  };

  const summary = useMemo(() => {
    const entries = activeTargets.map((t) => ({
      target: t,
      eval: evaluations[t.id] ?? buildDefaultRecord(t.id),
    }));

    const count = entries.length || 1;
    const sumLayout = entries.reduce((acc, e) => acc + e.eval.scores.layout, 0);
    const sumColor = entries.reduce((acc, e) => acc + e.eval.scores.color, 0);
    const sumMotion = entries.reduce((acc, e) => acc + e.eval.scores.motion, 0);

    const avgLayout = sumLayout / count;
    const avgColor = sumColor / count;
    const avgMotion = sumMotion / count;
    const overallAvg = (avgLayout + avgColor + avgMotion) / 3;

    const categoryCounts: Record<AestheticCategoryTag, number> = {
      布局结构: 0,
      色彩方案: 0,
      动效交互: 0,
      字体与留白: 0,
      "局部导航/页脚": 0,
    };
    entries.forEach((e) => {
      e.eval.categories.forEach((cat) => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const dimensionAverages = [
      { label: "布局结构", avg: avgLayout },
      { label: "色彩方案", avg: avgColor },
      { label: "动效交互", avg: avgMotion },
    ].sort((a, b) => b.avg - a.avg);

    const topRatedTarget = [...entries].sort((a, b) => {
      const aTotal = a.eval.scores.layout + a.eval.scores.color + a.eval.scores.motion;
      const bTotal = b.eval.scores.layout + b.eval.scores.color + b.eval.scores.motion;
      return bTotal - aTotal;
    })[0];

    return {
      count: entries.length,
      avgLayout,
      avgColor,
      avgMotion,
      overallAvg,
      categoryCounts,
      topDimension: dimensionAverages[0],
      topRatedTarget,
    };
  }, [activeTargets, evaluations]);

  const generatedPrompt = useMemo(() => {
    const { scores, categories, note } = currentEval;
    const adoptDims: string[] = [];
    const ignoreDims: string[] = [];

    if (scores.layout >= 4) adoptDims.push(`布局结构(${scores.layout}/5)`);
    else if (scores.layout <= 2) ignoreDims.push(`布局结构(${scores.layout}/5)`);

    if (scores.color >= 4) adoptDims.push(`色彩方案(${scores.color}/5)`);
    else if (scores.color <= 2) ignoreDims.push(`色彩方案(${scores.color}/5)`);

    if (scores.motion >= 4) adoptDims.push(`动效交互(${scores.motion}/5)`);
    else if (scores.motion <= 2) ignoreDims.push(`动效交互(${scores.motion}/5)`);

    const catText =
      categories.length > 0 ? categories.join(" · ") : "未指定重点分类（请至少勾选 1 项）";
    const adoptText =
      adoptDims.length > 0
        ? adoptDims.join(" + ")
        : "基础结构参考（无 >=4 分项，建议只作思路灵感）";
    const ignoreText =
      ignoreDims.length > 0
        ? `\n- 明确忽略（低分屏蔽）：${ignoreDims.join("、")}，保留我方现有项目 Token 与规范。`
        : `\n- 视觉收敛：字体、间距与次要配色须统一收口至当前 Tailwind 主题变量。`;

    return `@src/pages/${
      TARGET_SCOPE_PRESETS.find((s) => s.id === simScopeId)?.label ?? "LandingPage"
    }.tsx [附 ${selectedTarget.name} - ${selectedTarget.caseHighlight} 截图]
# 审美评估归类：${catText}
- 仅重点借鉴：${adoptText}
- 人工备注要点：${note.trim() || "请补充具体喜欢的页面细节"}${ignoreText}`;
  }, [currentEval, selectedTarget, simScopeId]);

  const uiEfficiencySim = useMemo(() => {
    const { categories, scores, note } = currentEval;
    const scope =
      TARGET_SCOPE_PRESETS.find((s) => s.id === simScopeId) ?? TARGET_SCOPE_PRESETS[0];

    const adoptList: string[] = [];
    const shieldList: string[] = [];
    const scoreItems: { label: string; score: number }[] = [
      { label: "布局结构", score: scores.layout },
      { label: "色彩方案", score: scores.color },
      { label: "动效交互", score: scores.motion },
    ];
    scoreItems.forEach((item) => {
      if (item.score >= 4) adoptList.push(`${item.label}(${item.score}/5)`);
      else if (item.score <= 2) shieldList.push(`${item.label}(${item.score}/5)`);
    });

    const selectedRuleLines =
      categories.length > 0
        ? categories.map((cat) => CATEGORY_MDC_RULES[cat])
        : ["- [警告] 尚未勾选审美维度，AI 将回退为泛化默认样式（高漂移风险）。"];

    const hasNote = note.trim().length >= 6;
    const clarityRaw =
      38 +
      Math.min(categories.length, 4) * 10 +
      Math.min(adoptList.length + shieldList.length, 3) * 5 +
      (hasNote ? 8 : 0);
    const firstPassRate = Math.min(95, clarityRaw);
    const reworkRounds = Number((Math.max(1.2, 4.6 - firstPassRate / 28)).toFixed(1));
    const driftRisk = firstPassRate >= 80 ? "低漂移" : firstPassRate >= 62 ? "中漂移" : "高漂移";

    const mdcCode = `---
description: UI 审美约束规则（基于 ${selectedTarget.name} 评估生成）
globs: ${scope.globs}
alwaysApply: false
---

# 选定审美维度 (${categories.length}/${CATEGORY_OPTIONS.length})
${selectedRuleLines.join("\n")}

# 分维取舍指令
- 重点复刻（≥4分）：${adoptList.length > 0 ? adoptList.join("、") : "暂无（建议至少标定 1 项核心亮点）"}
- 明确屏蔽（≤2分）：${shieldList.length > 0 ? shieldList.join("、") : "保持当前项目 Design Token，拒绝模板花哨装饰"}
- 关键细节备注：${note.trim() || "请在左侧补充具体视觉锚点"}`;

    return {
      firstPassRate,
      reworkRounds,
      driftRisk,
      mdcCode,
    };
  }, [currentEval, selectedTarget, simScopeId]);

  const dimensions: {
    key: keyof EvaluationRecord["scores"];
    label: string;
    hint: string;
  }[] = [
    { key: "layout", label: "布局结构", hint: "栅格占比、留白与信息顺序" },
    { key: "color", label: "色彩方案", hint: "60-30-10 主次与对比度" },
    { key: "motion", label: "动效交互", hint: "微反馈、悬停层次与流畅度" },
  ];

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-xs font-mono text-gemini-purple tracking-wide">
            审美评估指标 · 23 站通用个人打分档案库（自动保存）
          </div>
          <h3 className="text-lg font-bold text-white">
            精准参考输入训练台：对参考 Case 分维打分与分类，只把高分优点喂给 AI
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {availableToAdd.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={siteToAdd || availableToAdd[0].id}
                onChange={(e) => setSiteToAdd(e.target.value)}
                onKeyDown={stopRevealKey}
                aria-label="从 23 站中追加参考"
                className="rounded-lg bg-black/60 border border-white/15 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-gemini-cyan max-w-[180px]"
              >
                {availableToAdd.map((site) => (
                  <option key={site.id} value={site.id} className="bg-[#0b0f19]">
                    {site.index} · {site.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddSite(siteToAdd || availableToAdd[0].id)}
                className="px-2.5 py-1.5 rounded-lg bg-gemini-cyan text-slate-950 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>加入评估</span>
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gemini-cyan" />
            <span>重置样本</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 7 cols: Reference Selector + Aesthetic Evaluation Card */}
        <div className="col-span-7 flex flex-col gap-2.5">
          {/* Reference Selector Grid */}
          <div
            className="grid grid-cols-3 gap-2 max-h-[124px] overflow-y-auto custom-scrollbar pr-0.5"
            onWheel={stopRevealWheel}
          >
            {activeTargets.map((item) => {
              const evalItem = evaluations[item.id] ?? buildDefaultRecord(item.id);
              const avg =
                (evalItem.scores.layout + evalItem.scores.color + evalItem.scores.motion) / 3;
              const isSelected = item.id === selectedTarget.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-gemini-cyan/12 border-gemini-cyan/60 text-white"
                      : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold truncate">
                      <span className="font-mono text-gemini-cyan tabular-nums mr-1">
                        {item.index}
                      </span>
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300 tabular-nums shrink-0">
                      {avg.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.categoryLabel} · {item.caseHighlight}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Rating & Category Classification Card */}
          <div className="p-3.5 rounded-xl bg-black/45 border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-white flex items-center gap-1.5 min-w-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
                <span className="truncate">
                  审美评估指标：{selectedTarget.name}（{selectedTarget.caseHighlight}）
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                1 = 需屏蔽 · 4–5 = 重点参考
              </span>
            </div>

            {/* Dimension Category Tags */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400">
                1. 归类该参考最值得借鉴的维度（可多选）
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const active = currentEval.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? "bg-gemini-purple/25 border-gemini-purple text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1-5 Ratings for Layout, Color, Motion */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400">
                2. 分维度评分（≥4 分写入借鉴，≤2 分写入屏蔽项）
              </div>
              <div className="space-y-1.5">
                {dimensions.map((dim) => {
                  const score = currentEval.scores[dim.key];
                  return (
                    <div
                      key={dim.key}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.03] border border-white/10"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-white">{dim.label}</span>
                        <span className="text-[11px] text-slate-400 ml-2">{dim.hint}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 tabular-nums">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDimensionScore(dim.key, val)}
                            aria-label={`${dim.label} ${val} 分`}
                            className={`w-7 h-7 rounded-md text-xs font-mono transition-colors cursor-pointer border ${
                              score === val
                                ? val >= 4
                                  ? "bg-gemini-cyan text-slate-950 font-bold border-gemini-cyan"
                                  : val <= 2
                                  ? "bg-amber-500/25 text-amber-200 font-bold border-amber-400"
                                  : "bg-white/20 text-white font-bold border-white/40"
                                : "bg-black/40 text-slate-400 border-white/10 hover:text-white"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specific Remark Input */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                收藏备注:
              </span>
              <input
                type="text"
                value={currentEval.note}
                onChange={(e) => updateNote(e.target.value)}
                onKeyDown={stopRevealKey}
                placeholder="备注你具体喜欢这一页的什么（如：字图比例、展开导航）"
                className="flex-1 rounded-lg bg-black/60 border border-white/15 px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-gemini-cyan"
              />
            </div>
          </div>
        </div>

        {/* Right 5 cols: Summary Stats + UI 效能模拟器 */}
        <div
          className="col-span-5 flex flex-col gap-2.5 max-h-[435px] overflow-y-auto custom-scrollbar pr-0.5"
          onWheel={stopRevealWheel}
        >
          {/* Compact Summary Stats Box */}
          <div className="p-3 rounded-xl bg-black/55 border border-white/10 space-y-2">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>汇总统计（{summary.count}/{UI_REFERENCE_SITES.length} 站）</span>
              </span>
              <span className="font-mono text-gemini-cyan font-bold tabular-nums">
                总均分 {summary.overallAvg.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 tabular-nums">
              {[
                { label: "布局结构", val: summary.avgLayout, barColor: "bg-gemini-cyan" },
                { label: "色彩方案", val: summary.avgColor, barColor: "bg-gemini-purple" },
                { label: "动效交互", val: summary.avgMotion, barColor: "bg-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300">{stat.label}</span>
                    <span className="font-mono text-white font-semibold">
                      {stat.val.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${stat.barColor} transition-all duration-200`}
                      style={{ width: `${(stat.val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed pt-1 border-t border-white/10">
              偏好重心 <strong className="text-gemini-cyan">{summary.topDimension.label}</strong> · 最高分{" "}
              <strong className="text-white">{summary.topRatedTarget?.target.name}</strong> · 分类：
              {CATEGORY_OPTIONS.map((c) => `${c}(${summary.categoryCounts[c]})`).join(" ")}
            </div>
          </div>

          {/* UI Efficiency Simulator */}
          <div className="flex-1 p-3.5 rounded-xl bg-[#070b14] border border-gemini-cyan/40 flex flex-col justify-between gap-2.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white inline-flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
                  <span>UI 效能模拟器</span>
                </span>

                <div className="flex items-center gap-1">
                  {TARGET_SCOPE_PRESETS.map((scope) => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setSimScopeId(scope.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        simScopeId === scope.id
                          ? "bg-gemini-purple/25 border-gemini-purple text-white"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {scope.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Efficiency Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
                <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/8">
                  <div className="text-[10px] text-slate-400">首稿可用率</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {uiEfficiencySim.firstPassRate}%
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/8">
                  <div className="text-[10px] text-slate-400">预估返工</div>
                  <div className="text-sm font-bold font-mono text-gemini-cyan">
                    {uiEfficiencySim.reworkRounds} 轮
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/8">
                  <div className="text-[10px] text-slate-400">样式漂移</div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      uiEfficiencySim.driftRisk === "低漂移"
                        ? "text-emerald-400"
                        : uiEfficiencySim.driftRisk === "中漂移"
                        ? "text-amber-300"
                        : "text-red-400"
                    }`}
                  >
                    {uiEfficiencySim.driftRisk}
                  </div>
                </div>
              </div>

              {/* Output Mode Tabs + Copy Button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSimOutputTab("mdc")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simOutputTab === "mdc"
                        ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                        : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                    }`}
                  >
                    .cursor/rules .mdc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimOutputTab("prompt")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      simOutputTab === "prompt"
                        ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                        : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>@Prompt 指导</span>
                  </button>
                </div>

                <CopySnippetButton
                  text={simOutputTab === "mdc" ? uiEfficiencySim.mdcCode : generatedPrompt}
                  label={simOutputTab === "mdc" ? "复制 .mdc" : "复制 Prompt"}
                />
              </div>

              <pre className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[168px] overflow-y-auto custom-scrollbar">
                <code>{simOutputTab === "mdc" ? uiEfficiencySim.mdcCode : generatedPrompt}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
