import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Sparkles, Target } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type DimensionId = "context" | "dod" | "bugbot" | "accountability";

interface AssessmentOption {
  score: 1 | 2 | 3 | 4;
  label: string;
  desc: string;
}

interface AssessmentQuestion {
  id: string;
  dimension: DimensionId;
  prompt: string;
  sonarHabitRef: string;
  options: AssessmentOption[];
}

interface DimensionMeta {
  id: DimensionId;
  label: string;
  shortLabel: string;
  sonarHabits: string;
  targetLabId: string;
  targetLabLabel: string;
}

const DIMENSIONS: DimensionMeta[] = [
  {
    id: "context",
    label: "上下文构建",
    shortLabel: "上下文",
    sonarHabits: "Habit #2 Over-Document Context",
    targetLabId: "cursor-rules",
    targetLabLabel: "Lab 02 .mdc",
  },
  {
    id: "dod",
    label: "DoD 定义与验证",
    shortLabel: "DoD 定义",
    sonarHabits: "Habit #3 Keep It Simple · #6 Mandatory Unit Tests",
    targetLabId: "plan-prompt",
    targetLabLabel: "Lab 01 Plan+DoD",
  },
  {
    id: "bugbot",
    label: "Bugbot 协作与洁癖",
    shortLabel: "Bugbot 协作",
    sonarHabits: "Habit #4 No Stray Code · #5 Analyze Everything",
    targetLabId: "bugbot-review",
    targetLabLabel: "Lab 04 Bugbot",
  },
  {
    id: "accountability",
    label: "主权与架构审校",
    shortLabel: "架构审校",
    sonarHabits: "Habit #1 Accountability · #7 Rigorous Reviews",
    targetLabId: "agent-harness",
    targetLabLabel: "Lab 06 Harness",
  },
];

const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q-context-1",
    dimension: "context",
    prompt: "启动一个跨模块新需求时，你如何向 Cursor 提供上下文？",
    sonarHabitRef: "Sonar Habit #2",
    options: [
      { score: 1, label: "L1 一句话盲开", desc: "直接粘贴需求描述，让 AI 自己猜文件结构和接口。" },
      { score: 2, label: "L2 临时 @ 文件", desc: "报错或偏题后，再补 @ 一两个相关文件或截图。" },
      { score: 3, label: "L3 结构化引用", desc: "先用 @Files / @Docs 锚定契约，再说明边界限制。" },
      { score: 4, label: "L4 Rules + MCP 协同", desc: "通过 AGENTS.md、globs .mdc 分域隔离与 Context7 精准喂料。" },
    ],
  },
  {
    id: "q-context-2",
    dimension: "context",
    prompt: "跨会话迭代或多人协作时，如何防止 AI 反复遗忘架构规范？",
    sonarHabitRef: "Sonar Habit #2",
    options: [
      { score: 1, label: "L1 每次重写口头嘱咐", desc: "开新会话就从头打一遍“别用 any、别改旧接口”。" },
      { score: 2, label: "L2 复制长 Prompt 模板", desc: "桌面存一段超长提示词，每次全量粘贴进对话框。" },
      { score: 3, label: "L3 维护根目录规范", desc: "把核心约定写入 AGENTS.md 或项目 README 供引用。" },
      { score: 4, label: "L4 分层记忆与按需加载", desc: "用 .cursor/rules/*.mdc 按路径按需挂载，并用 PROGRESS.md 交接。" },
    ],
  },
  {
    id: "q-dod-1",
    dimension: "dod",
    prompt: "让 Agent 自主修改代码前，你的「完成定义（DoD）」处于什么状态？",
    sonarHabitRef: "Sonar Habit #3",
    options: [
      { score: 1, label: "L1 肉眼看效果", desc: "页面大致能打开就算完成，不设定可量化验收标准。" },
      { score: 2, label: "L2 仅检查构建", desc: "能跑通 dev server 不白屏即可，忽略类型或边界异常。" },
      { score: 3, label: "L3 明确命令门禁", desc: "要求跑通 tsc --noEmit、lint 和核心流程验证才汇报完成。" },
      { score: 4, label: "L4 契约 + 五层验收闭环", desc: "Plan 先行锁定接口契约与圈复杂度阈值，终端自愈循环验证异常分支。" },
    ],
  },
  {
    id: "q-dod-2",
    dimension: "dod",
    prompt: "面对 AI 顺手生成的单元测试，你如何防范「Test Reward Hacking」？",
    sonarHabitRef: "Sonar Habit #6",
    options: [
      { score: 1, label: "L1 不写或直接跳过", desc: "先跑业务功能，测试等以后有空再补。" },
      { score: 2, label: "L2 只看绿灯结果", desc: "看到 npm test 全绿就合入，未检查断言是否空洞。" },
      { score: 3, label: "L3 抽查断言与 Mock", desc: "排查是否有 expect(true).toBe(true)、.skip 或过度 Mock。" },
      { score: 4, label: "L4 独立基准 + 负向用例", desc: "人工定义边界/失败路径测试用例，并禁止 AI 通过改弱断言凑绿灯。" },
    ],
  },
  {
    id: "q-bugbot-1",
    dimension: "bugbot",
    prompt: "AI 多轮改错之后，你如何处理代码里的残留调试与死代码？",
    sonarHabitRef: "Sonar Habit #4",
    options: [
      { score: 1, label: "L1 留着以后再说", desc: "注释掉的旧逻辑、console.log 和废弃函数留在仓库里。" },
      { score: 2, label: "L2 偶尔手动删除", desc: "只有报错或文件太乱时，才会顺手删掉几行显眼残留。" },
      { score: 3, label: "L3 提交前清扫检查", desc: "通过 ESLint/unused 检查和 git diff 清理多余导入和调试语句。" },
      { score: 4, label: "L4 零残留门禁（No Stray Code）", desc: "在 .mdc 中禁止空 catch、TODO 占位与死分支，每次交付强制零残留。" },
    ],
  },
  {
    id: "q-bugbot-2",
    dimension: "bugbot",
    prompt: "你的工作流中，Bugbot 与静态分析（SAST）承担什么角色？",
    sonarHabitRef: "Sonar Habit #5",
    options: [
      { score: 1, label: "L1 仅靠 IDE 红线", desc: "没使用 Bugbot 或 PR 自动化扫描，全靠本地编辑器提示。" },
      { score: 2, label: "L2 出线上故障才查", desc: "遇到崩溃或报错后，才把错误贴给 AI 排查安全与逻辑问题。" },
      { score: 3, label: "L3 关键模块跑审查", desc: "涉及鉴权、支付、并发时主动触发 Bugbot 扫描高危漏洞。" },
      { score: 4, label: "L4 全量自动化第一道防线", desc: "所有 PR 必经 Bugbot + SAST 全量扫描，阻断竞态、注入与硬编码密钥。" },
    ],
  },
  {
    id: "q-acc-1",
    dimension: "accountability",
    prompt: "当 AI 一次生成 300+ 行跨文件 Diff 时，你的审校策略是什么？",
    sonarHabitRef: "Sonar Habit #7",
    options: [
      { score: 1, label: "L1 全部 Accept", desc: "只要界面看起来正常，不看 Diff 直接点击 Accept All。" },
      { score: 2, label: "L2 只看报错文件", desc: "只浏览改动最大的 1 个文件，其余默认信任 AI。" },
      { score: 3, label: "L3 按模块审核心逻辑", desc: "逐文件检查数据流、状态边界与类型定义，忽略复杂细节再问 AI。" },
      { score: 4, label: "L4 主编式拆批审校", desc: "主动限制单次改动粒度，用架构/安全/复杂度清单逐块签核每一行变更。" },
    ],
  },
  {
    id: "q-acc-2",
    dimension: "accountability",
    prompt: "对 AI 写出但自己没完全看懂的代码，你通常如何处理？",
    sonarHabitRef: "Sonar Habit #1",
    options: [
      { score: 1, label: "L1 黑盒能跑就行", desc: "反正是 AI 写的，只要当前不报错就不深究内部实现。" },
      { score: 2, label: "L2 出问题再问 AI", desc: "先留着使用，真出 Bug 时再把整段丢回去让 AI 自己改。" },
      { score: 3, label: "L3 要求逐行解释", desc: "利用解释对话弄清关键路径与副作用后再决定是否保留。" },
      { score: 4, label: "L4 git blame 责任制", desc: "牢记 git blame 永远指向自己，未彻底理解或超出复杂度阈值的代码绝不合入。" },
    ],
  },
];

const STORAGE_KEY = "cursor_course_efficiency_assessment_v1";

const DEFAULT_ANSWERS: Record<string, 1 | 2 | 3 | 4> = {
  "q-context-1": 2,
  "q-context-2": 2,
  "q-dod-1": 2,
  "q-dod-2": 1,
  "q-bugbot-1": 2,
  "q-bugbot-2": 2,
  "q-acc-1": 2,
  "q-acc-2": 2,
};

const PRESET_PROFILES: Record<string, { label: string; answers: Record<string, 1 | 2 | 3 | 4> }> = {
  vibe: {
    label: "新手 Vibe 档",
    answers: {
      "q-context-1": 1,
      "q-context-2": 1,
      "q-dod-1": 1,
      "q-dod-2": 1,
      "q-bugbot-1": 1,
      "q-bugbot-2": 1,
      "q-acc-1": 1,
      "q-acc-2": 1,
    },
  },
  intermediate: {
    label: "进阶工程档",
    answers: {
      "q-context-1": 3,
      "q-context-2": 3,
      "q-dod-1": 3,
      "q-dod-2": 2,
      "q-bugbot-1": 3,
      "q-bugbot-2": 2,
      "q-acc-1": 3,
      "q-acc-2": 3,
    },
  },
  architect: {
    label: "高阶主编档",
    answers: {
      "q-context-1": 4,
      "q-context-2": 4,
      "q-dod-1": 4,
      "q-dod-2": 4,
      "q-bugbot-1": 4,
      "q-bugbot-2": 4,
      "q-acc-1": 4,
      "q-acc-2": 4,
    },
  },
};

function loadStoredAnswers(): Record<string, 1 | 2 | 3 | 4> {
  if (typeof window === "undefined") return { ...DEFAULT_ANSWERS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ANSWERS };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const valid: Record<string, 1 | 2 | 3 | 4> = { ...DEFAULT_ANSWERS };
    for (const q of QUESTIONS) {
      const val = parsed[q.id];
      if (val === 1 || val === 2 || val === 3 || val === 4) {
        valid[q.id] = val;
      }
    }
    return valid;
  } catch {
    return { ...DEFAULT_ANSWERS };
  }
}

function saveStoredAnswers(answers: Record<string, 1 | 2 | 3 | 4>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // Ignore storage errors
  }
}

interface HabitPrescription {
  dimension: DimensionId;
  habitTitle: string;
  severity: "critical" | "improve" | "strong";
  diagnosis: string;
  action: string;
  mdcRuleLine: string;
}

function buildPrescription(dim: DimensionId, pct: number): HabitPrescription {
  if (dim === "context") {
    if (pct < 75) {
      return {
        dimension: dim,
        habitTitle: "Habit #2 · Over-Document Context",
        severity: pct < 50 ? "critical" : "improve",
        diagnosis: "依赖临场口头对话提示，跨会话极易触发失忆与架构漂移。",
        action: "将目录职责与 API 契约固化进 AGENTS.md，按 globs 拆分 .cursor/rules/*.mdc 并挂载 Context7 MCP。",
        mdcRuleLine: "- [Habit #2] 修改前先检索 AGENTS.md 与对应域 .mdc 契约，禁止跨模块猜测未声明接口。",
      };
    }
    return {
      dimension: dim,
      habitTitle: "Habit #2 · Context 体系稳健",
      severity: "strong",
      diagnosis: "已建立分层上下文规则与外部文档挂载能力。",
      action: "持续修剪冗余规则，保持单份 .mdc 聚焦单一职责与精确 globs 命中率。",
      mdcRuleLine: "- [Habit #2] 保持规则按目录 globs 按需激活，禁止把全量历史对话塞入上下文。",
    };
  }

  if (dim === "dod") {
    if (pct < 75) {
      return {
        dimension: dim,
        habitTitle: "Habit #3 Simplicity & #6 No Reward Hacking",
        severity: pct < 50 ? "critical" : "improve",
        diagnosis: "缺乏可执行终端 DoD 门禁，存在接受弱断言、跳过用例或高复杂度代码的隐患。",
        action: "在 Plan 阶段锁定 tsc + lint + 负向测试验收清单，严查 expect(true).toBe(true) / .skip 假绿灯。",
        mdcRuleLine: "- [Habit #3/#6] 禁止 test.skip 或弱断言凑绿灯；所有新函数保持低圈复杂度并附带边界异常测试。",
      };
    }
    return {
      dimension: dim,
      habitTitle: "Habit #3 & #6 · 验证闭环稳健",
      severity: "strong",
      diagnosis: "已具备明确的 DoD 终端校验与反测试作弊意识。",
      action: "建议向关键模块引入 IASalut 五层测试金字塔与复杂度定量门禁。",
      mdcRuleLine: "- [Habit #3/#6] 交付前必须通过 tsc --noEmit、eslint 与独立基准测试用例验证。",
    };
  }

  if (dim === "bugbot") {
    if (pct < 75) {
      return {
        dimension: dim,
        habitTitle: "Habit #4 No Stray Code & #5 Analyze Everything",
        severity: pct < 50 ? "critical" : "improve",
        diagnosis: "AI 多轮改错后易残留调试日志、未使用导入或未经 SAST 扫描的安全盲区。",
        action: "提交前运行 Bugbot（Lab 04）与静态扫描，彻底清扫 console.log、死分支与空 catch {}。",
        mdcRuleLine: "- [Habit #4/#5] 提交前清扫所有死代码、调试输出与空 catch {}，并执行 Bugbot/SAST 安全复核。",
      };
    }
    return {
      dimension: dim,
      habitTitle: "Habit #4 & #5 · 自动化守门稳健",
      severity: "strong",
      diagnosis: "已养成零残留代码与自动化 SAST/Bugbot 协同习惯。",
      action: "可将 Bugbot 评审挂载至 PR 流水线，阻断并发竞态与密钥泄露回归。",
      mdcRuleLine: "- [Habit #4/#5] 保持 PR 级零死代码标准与自动化安全扫描门禁。",
    };
  }

  if (pct < 75) {
    return {
      dimension: dim,
      habitTitle: "Habit #1 Accountability & #7 Rigorous Review",
      severity: pct < 50 ? "critical" : "improve",
      diagnosis: "存在整段盲贴倾向；一旦触发 Beyond Vibe Coding 的「70% 困境」将难以排障。",
      action: "牢记 git blame 指向人类：拆分 <150 行可审阅变更，要求 AI 逐块解释副作用后再签核合入。",
      mdcRuleLine: "- [Habit #1/#7] 单次变更控制在可审阅粒度，重点人工审计数据流、权限边界与状态一致性。",
    };
  }

  return {
    dimension: dim,
    habitTitle: "Habit #1 & #7 · 主编级主权稳健",
    severity: "strong",
    diagnosis: "你已具备 Editor-in-Chief 心态，牢牢掌控架构决策与质量责任。",
    action: "可进一步沉淀个人 Eval 基准集，用数据量化团队在 Cursor 下的真实交付 ROI。",
    mdcRuleLine: "- [Habit #1/#7] 保持小步 Diff 审校与架构决策可追溯性。",
  };
}

export default function AiEfficiencyAssessmentSandbox() {
  const [activeDimension, setActiveDimension] = useState<DimensionId>("context");
  const [answers, setAnswers] = useState<Record<string, 1 | 2 | 3 | 4>>(() =>
    loadStoredAnswers()
  );

  const handleSelectOption = (questionId: string, score: 1 | 2 | 3 | 4) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: score };
      saveStoredAnswers(next);
      return next;
    });
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESET_PROFILES[presetKey];
    if (!preset) return;
    const next = { ...preset.answers };
    setAnswers(next);
    saveStoredAnswers(next);
  };

  const handleReset = () => {
    const next = { ...DEFAULT_ANSWERS };
    setAnswers(next);
    saveStoredAnswers(next);
  };

  const metrics = useMemo(() => {
    const dimensionStats = DIMENSIONS.map((dim) => {
      const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim.id);
      const rawScore = dimQuestions.reduce((acc, q) => acc + (answers[q.id] ?? 1), 0);
      const maxScore = dimQuestions.length * 4;
      const minScore = dimQuestions.length * 1;
      const pct = Math.round(((rawScore - minScore) / (maxScore - minScore)) * 100);
      return {
        ...dim,
        rawScore,
        maxScore,
        pct,
      };
    });

    const totalRaw = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] ?? 1), 0);
    const totalMin = QUESTIONS.length * 1;
    const totalMax = QUESTIONS.length * 4;
    const overallPct = Math.round(((totalRaw - totalMin) / (totalMax - totalMin)) * 100);

    let levelLabel = "Lv.1 盲目 Vibe 阶段";
    let levelColor = "text-red-400";
    let levelBorder = "border-red-500/35 bg-red-500/10";
    if (overallPct >= 85) {
      levelLabel = "Lv.4 Editor-in-Chief 架构师";
      levelColor = "text-emerald-400";
      levelBorder = "border-emerald-500/35 bg-emerald-500/10";
    } else if (overallPct >= 65) {
      levelLabel = "Lv.3 工程闭环实战者";
      levelColor = "text-gemini-cyan";
      levelBorder = "border-gemini-cyan/35 bg-gemini-cyan/10";
    } else if (overallPct >= 45) {
      levelLabel = "Lv.2 提示词修补阶段";
      levelColor = "text-amber-300";
      levelBorder = "border-amber-500/35 bg-amber-500/10";
    }

    const sortedByWeakest = [...dimensionStats].sort((a, b) => a.pct - b.pct);
    const prescriptions = sortedByWeakest.map((item) => ({
      stat: item,
      advice: buildPrescription(item.id, item.pct),
    }));

    const coachMdc = `---
description: 个人 AI 编码效能自测改进守则（基于 Sonar 7 Habits，当前综合成熟度 ${overallPct}%）
globs: ["src/**/*", "server/**/*", "tests/**/*"]
alwaysApply: false
---

# 优先补强维度：${sortedByWeakest[0]?.label ?? ""}（${sortedByWeakest[0]?.pct ?? 0}%）
${prescriptions.map((p) => p.advice.mdcRuleLine).join("\n")}

# 提交前必跑自检清单
- npx tsc --noEmit && npm run lint`;

    return {
      dimensionStats,
      overallPct,
      levelLabel,
      levelColor,
      levelBorder,
      prescriptions,
      coachMdc,
    };
  }, [answers]);

  const activeQuestions = QUESTIONS.filter((q) => q.dimension === activeDimension);

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl"
    >
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wider uppercase">
            LAB 09 · AI 编码效能自测 × SONAR 7 HABITS 成熟度诊断
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            AI 编码效能自测工作台：定位瓶颈与 7 Habits 改进处方
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(PRESET_PROFILES).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-white/12 text-slate-200 border border-white/10 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 hover:bg-white/12 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            title="重置为初始基线答卷"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Main 12-Col Layout */}
      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left: Dimension Tabs + Questionnaire (7 cols) */}
        <div className="col-span-7 flex flex-col gap-3">
          {/* 4 Dimension Switcher Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {metrics.dimensionStats.map((dim) => {
              const isTabActive = dim.id === activeDimension;
              return (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setActiveDimension(dim.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isTabActive
                      ? "bg-gemini-cyan/15 border-gemini-cyan/60 text-white"
                      : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                    <span className={isTabActive ? "text-gemini-cyan font-semibold" : "text-slate-400"}>
                      {dim.shortLabel}
                    </span>
                    <span className="tabular-nums text-white font-bold">{dim.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dim.pct >= 75
                          ? "bg-emerald-400"
                          : dim.pct >= 45
                          ? "bg-gemini-cyan"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${dim.pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Questions for Active Dimension */}
          <div className="space-y-3 max-h-[390px] overflow-y-auto custom-scrollbar pr-1">
            {activeQuestions.map((question, qIndex) => {
              const selectedScore = answers[question.id] ?? 1;
              return (
                <div
                  key={question.id}
                  className="p-3.5 rounded-xl bg-white/[0.035] border border-white/10 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-white leading-snug">
                      <span className="text-gemini-cyan font-mono mr-1.5">
                        0{qIndex + 1}.
                      </span>
                      {question.prompt}
                    </div>
                    <span className="text-[10px] font-mono text-gemini-purple whitespace-nowrap shrink-0">
                      {question.sonarHabitRef}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((opt) => {
                      const isSelected = selectedScore === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleSelectOption(question.id, opt.score)}
                          className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-gemini-cyan/15 border-gemini-cyan/60 text-white"
                              : "bg-black/25 border-white/8 text-slate-300 hover:bg-white/[0.06] hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-[11px] font-bold ${
                                isSelected ? "text-gemini-cyan" : "text-slate-200"
                              }`}
                            >
                              {opt.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                              {opt.score}/4
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Maturity Summary + Sonar 7 Habits Personalized Advice (5 cols) */}
        <div className="col-span-5 flex flex-col gap-3">
          {/* Overall Maturity Score Card */}
          <div className={`p-3.5 rounded-xl border ${metrics.levelBorder}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono text-slate-300 uppercase">
                  综合工程成熟度（Maturity Index）
                </div>
                <div className={`text-sm font-bold mt-0.5 ${metrics.levelColor}`}>
                  {metrics.levelLabel}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black font-mono tabular-nums ${metrics.levelColor}`}>
                  {metrics.overallPct}%
                </div>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-[10px] font-mono">
              {metrics.dimensionStats.map((d) => (
                <div key={d.id} className="bg-black/30 rounded-lg px-2 py-1 text-center">
                  <div className="text-slate-400 truncate">{d.shortLabel}</div>
                  <div className="text-white font-bold tabular-nums">{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Sonar 7 Habits Recommendations */}
          <div className="flex-1 rounded-xl bg-[#0b0f19] border border-white/10 p-3.5 flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Sparkles className="w-3.5 h-3.5 text-gemini-purple shrink-0" />
                <span>Sonar 7 Habits 个性化改进处方</span>
              </div>
              <CopySnippetButton
                text={metrics.coachMdc}
                label="复制改进 .mdc"
              />
            </div>

            <div className="space-y-2 max-h-[268px] overflow-y-auto custom-scrollbar pr-1">
              {metrics.prescriptions.map(({ stat, advice }) => (
                <div
                  key={stat.id}
                  className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {advice.severity === "strong" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : advice.severity === "critical" ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <Target className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      )}
                      <span className="text-[11px] font-mono font-semibold text-white truncate">
                        {advice.habitTitle}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("reveal:jump-lab", {
                            detail: { labId: stat.targetLabId },
                          })
                        )
                      }
                      className="text-[10px] font-mono text-gemini-cyan hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      练 {stat.targetLabLabel} ↗
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">{stat.label}（{stat.pct}%）：</strong>
                    {advice.diagnosis}
                  </p>
                  <p className="text-[10px] text-emerald-300/90 leading-relaxed flex items-start gap-1">
                    <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{advice.action}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
