import { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileCode2,
  FileText,
  Layers,
  ShieldAlert,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  buildOfflineCursorConfig,
  craftCursorConfig,
  type RuleTargetType,
} from "@/lib/gemini";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

interface TaskPreset {
  id: string;
  label: string;
  targetType: RuleTargetType;
  globs: string;
  alwaysApply: boolean;
  task: string;
  constraints: string[];
}

const TASK_PRESETS: TaskPreset[] = [
  {
    id: "api-stripe",
    label: "SaaS 支付接口安全规则",
    targetType: "mdc",
    globs: "src/app/api/**/*.ts",
    alwaysApply: false,
    task: "规范 Next.js App Router 支付回调与订单写入路由，确保服务端价格校验、幂等防重放、Zod 校验与参数化 SQL 查询。",
    constraints: [
      "服务端写接口必须校验 Session/JWT 并采用 Zod 解析入参",
      "严禁拼接 SQL 字符串或信任客户端传入的金额/折扣字段",
      "Webhook 验签必须使用 rawBody 并落库幂等去重",
    ],
  },
  {
    id: "react-ui",
    label: "React 数据看板防竞态",
    targetType: "mdc",
    globs: "src/components/**/*.tsx",
    alwaysApply: false,
    task: "规范前端交互式数据分析组件：统一 Loading/Empty/Error 三态、AbortController 异步防竞态、Tailwind CSS 响应式与可访问性。",
    constraints: [
      "useEffect 发起异步请求必须绑定 AbortController 清理过期响应",
      "所有组件必须完整覆盖 Loading / Empty / Error 边界态",
      "数字指标强制使用 tabular-nums 对齐并禁止内联 style",
    ],
  },
  {
    id: "agents-fullstack",
    label: "全栈仓库 AGENTS.md 基线",
    targetType: "agents_md",
    globs: "**/*",
    alwaysApply: true,
    task: "为 React + Express + Drizzle 全栈产品建立根目录 AGENTS.md，统一目录边界、Gemini 服务端代理红线与 DoD 验证命令。",
    constraints: [
      "严禁在前端暴露 API Key，所有大模型与第三方密钥仅走服务端 /api/*",
      "跨文件修改前先进入 Plan Mode 输出数据契约与变更范围",
      "严禁跳过测试 (.skip) 或残留 console.log / TODO 占位",
    ],
  },
];

const CONSTRAINT_POOL = [
  "TypeScript 严格模式（严禁 as any 类型逃逸）",
  "服务端写接口必须校验 Session/JWT 并采用 Zod 解析入参",
  "严禁在前端暴露 API Key，所有大模型与第三方密钥仅走服务端 /api/*",
  "useEffect 发起异步请求必须绑定 AbortController 清理过期响应",
  "严禁拼接 SQL 字符串或信任客户端传入的金额/折扣字段",
  "严禁跳过测试 (.skip) 或残留 console.log / TODO 占位",
];

export default function PromptCraftingSandbox() {
  const initialPreset = TASK_PRESETS[0];
  const [targetType, setTargetType] = useState<RuleTargetType>(initialPreset.targetType);
  const [task, setTask] = useState<string>(initialPreset.task);
  const [globs, setGlobs] = useState<string>(initialPreset.globs);
  const [alwaysApply, setAlwaysApply] = useState<boolean>(initialPreset.alwaysApply);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>(
    initialPreset.constraints
  );
  const [outputCode, setOutputCode] = useState<string>(() =>
    buildOfflineCursorConfig({
      task: initialPreset.task,
      targetType: initialPreset.targetType,
      globs: initialPreset.globs,
      alwaysApply: initialPreset.alwaysApply,
      constraints: initialPreset.constraints,
    })
  );
  const [sourceLabel, setSourceLabel] = useState<string>("离线工程模板预览");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleConstraint = (item: string) => {
    setSelectedConstraints((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const applyPreset = (preset: TaskPreset) => {
    setTargetType(preset.targetType);
    setTask(preset.task);
    setGlobs(preset.globs);
    setAlwaysApply(preset.alwaysApply);
    setSelectedConstraints(preset.constraints);
    setError(null);
    setOutputCode(
      buildOfflineCursorConfig({
        task: preset.task,
        targetType: preset.targetType,
        globs: preset.globs,
        alwaysApply: preset.alwaysApply,
        constraints: preset.constraints,
      })
    );
    setSourceLabel("离线工程模板预览");
  };

  const handleOfflineCraft = () => {
    setError(null);
    const crafted = buildOfflineCursorConfig({
      task,
      targetType,
      globs,
      alwaysApply,
      constraints: selectedConstraints,
    });
    setOutputCode(crafted);
    setSourceLabel("确定性模板即时装配");
  };

  const handleAiCraft = async () => {
    if (!task.trim()) {
      setError("请先在左侧输入您的目标开发任务描述。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await craftCursorConfig({
        task,
        targetType,
        globs,
        alwaysApply,
        constraints: selectedConstraints,
      });
      setOutputCode(result.content);
      setSourceLabel(`AI 智能生成 (${result.model})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "调用 AI 配置生成接口失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quality rubric self-check on the current generated configuration
  const rubric = useMemo(() => {
    const lineCount = outputCode.split("\n").length;
    const hasFrontmatterOrHeader =
      targetType === "mdc"
        ? outputCode.trimStart().startsWith("---") && /globs:/i.test(outputCode)
        : /^#\s*AGENTS\.md/im.test(outputCode);
    const hasProhibition = /(禁止|严禁|NEVER|DON'T|avoid)/i.test(outputCode);
    const hasDoDCommand = /(tsc|lint|build|test|playwright)/i.test(outputCode);
    const isConcise = lineCount <= 65;

    const passedCount = [
      hasFrontmatterOrHeader,
      hasProhibition,
      hasDoDCommand,
      isConcise,
    ].filter(Boolean).length;

    return {
      lineCount,
      hasFrontmatterOrHeader,
      hasProhibition,
      hasDoDCommand,
      isConcise,
      passedCount,
    };
  }, [outputCode, targetType]);

  const suggestedFilename =
    targetType === "mdc"
      ? `.cursor/rules/${
          globs.includes("api")
            ? "20-api-security.mdc"
            : globs.includes("components")
            ? "10-ui-components.mdc"
            : "30-task-guardrails.mdc"
        }`
      : "AGENTS.md";

  return (
    <div
      onWheel={stopRevealWheel}
      onKeyDown={stopRevealKey}
      className="max-w-6xl mx-auto w-full rounded-2xl bg-[#070b14]/95 border border-white/12 p-5 shadow-2xl flex flex-col gap-3"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan tracking-wide">
            Module 4 · Prompt Crafting Sandbox · .cursor/rules &amp; AGENTS.md 智能生成台
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
            Prompt Crafting Sandbox：从目标任务生成可落地的工程规则配置
          </h2>
        </div>

        {/* Target Format Segmented Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => setTargetType("mdc")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              targetType === "mdc"
                ? "bg-gemini-cyan text-slate-950 font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 shrink-0" />
            <span>.cursor/rules (.mdc)</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetType("agents_md")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              targetType === "agents_md"
                ? "bg-gemini-purple text-white font-bold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>AGENTS.md</span>
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
        {/* Left 5 cols: Task Input, Presets, Globs & Constraints */}
        <div className="col-span-5 p-3.5 rounded-xl bg-[#0b0f19] border border-white/10 flex flex-col justify-between gap-2.5">
          <div className="space-y-2.5">
            {/* Quick Task Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400">场景模板:</span>
              {TASK_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/12 border border-white/10 text-[10px] text-slate-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Target Task Textarea */}
            <div>
              <label
                htmlFor="craft-task-input"
                className="block text-[11px] font-mono text-gemini-cyan mb-1"
              >
                1. 输入目标开发任务 / 模块职责：
              </label>
              <textarea
                id="craft-task-input"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={stopRevealKey}
                onWheel={stopRevealWheel}
                rows={3}
                placeholder="例如：为订阅制 SaaS 的 Stripe Webhook 与订单表编写幂等保护规则，杜绝金额篡改..."
                className="w-full p-2.5 rounded-xl bg-black/50 border border-white/12 text-xs text-slate-100 focus:outline-none focus:border-gemini-cyan resize-none leading-relaxed"
              />
            </div>

            {/* Globs & AlwaysApply (only for .mdc mode) */}
            {targetType === "mdc" && (
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-8">
                  <label
                    htmlFor="craft-globs-input"
                    className="block text-[10px] font-mono text-slate-400 mb-1"
                  >
                    命中路径 globs：
                  </label>
                  <input
                    id="craft-globs-input"
                    type="text"
                    value={globs}
                    onChange={(e) => setGlobs(e.target.value)}
                    onKeyDown={stopRevealKey}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/12 font-mono text-[11px] text-gemini-cyan focus:outline-none focus:border-gemini-cyan"
                  />
                </div>
                <div className="col-span-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setAlwaysApply((prev) => !prev)}
                    className={`w-full py-1.5 px-2 rounded-lg border font-mono text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                      alwaysApply
                        ? "bg-amber-500/15 border-amber-400/45 text-amber-300"
                        : "bg-white/5 border-white/10 text-slate-300"
                    }`}
                  >
                    alwaysApply: {alwaysApply ? "true" : "false"}
                  </button>
                </div>
              </div>
            )}

            {/* Engineering Guardrail Constraints */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-gemini-purple">
                2. 勾选必选工程红线（{selectedConstraints.length} 项）：
              </div>
              <div className="space-y-1 max-h-[126px] overflow-y-auto pr-0.5" onWheel={stopRevealWheel}>
                {CONSTRAINT_POOL.map((item) => {
                  const active = selectedConstraints.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleConstraint(item)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-left text-[10.5px] transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        active
                          ? "bg-gemini-purple/15 border-gemini-purple/45 text-white"
                          : "bg-white/[0.02] border-white/8 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="truncate">{item}</span>
                      <span className="font-mono text-[10px] shrink-0">
                        {active ? "✓" : "+"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="pt-2.5 border-t border-white/10 flex items-center gap-2">
            <button
              type="button"
              onClick={handleOfflineCraft}
              className="px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 border border-white/12 text-[11px] font-mono text-slate-200 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-gemini-cyan" />
              <span>离线模板装配</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleAiCraft}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 transition-colors ${
                loading
                  ? "bg-white/10 text-slate-400 cursor-not-allowed"
                  : "bg-gemini-purple hover:bg-gemini-purple/90 text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{loading ? "AI 正在生成规则..." : "AI 智能生成配置"}</span>
            </button>
          </div>
        </div>

        {/* Right 7 cols: Generated Output Preview + One-Click Copy + Quality Gate */}
        <div className="col-span-7 rounded-xl bg-[#0b0f19] border border-white/10 overflow-hidden flex flex-col">
          {/* File Toolbar with One-Click Copy */}
          <div className="px-3.5 py-2 bg-white/[0.04] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
              <span className="font-mono text-xs font-semibold text-white truncate">
                {suggestedFilename}
              </span>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                · {sourceLabel}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                {rubric.lineCount} 行
              </span>
              <CopySnippetButton text={outputCode} label="一键复制配置" />
            </div>
          </div>

          {/* Error Banner (explicit, never masked) */}
          {error && (
            <div className="mx-3.5 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/35 text-[11px] text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Editable Generated Config View */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-gemini-purple">
              <div className="w-8 h-8 border-2 border-gemini-purple/30 border-t-gemini-purple rounded-full animate-spin" />
              <div className="text-xs font-mono">
                正在通过服务端 Gemini 模型定制高信噪比 {suggestedFilename}...
              </div>
            </div>
          ) : (
            <textarea
              value={outputCode}
              onChange={(e) => setOutputCode(e.target.value)}
              onKeyDown={stopRevealKey}
              onWheel={stopRevealWheel}
              aria-label="生成的 Cursor 规则配置代码"
              spellCheck={false}
              className="flex-1 p-3.5 bg-transparent font-mono text-[11.5px] text-emerald-300/95 focus:outline-none resize-none leading-relaxed min-h-[250px]"
            />
          )}

          {/* Bottom Rule Quality Rubric Strip */}
          <div className="px-3.5 py-2.5 bg-white/[0.03] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 ${
                  rubric.hasFrontmatterOrHeader ? "text-emerald-300" : "text-slate-500"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{targetType === "mdc" ? "YAML + globs" : "# AGENTS.md 结构"}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  rubric.hasProhibition ? "text-emerald-300" : "text-slate-500"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>显式禁令 (DON&apos;T)</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  rubric.hasDoDCommand ? "text-emerald-300" : "text-slate-500"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>DoD 校验命令</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  rubric.isConcise ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>{rubric.isConcise ? "精简不膨胀 (<65行)" : "偏长建议精简"}</span>
              </span>
            </div>

            <span className="text-gemini-cyan font-semibold tabular-nums">
              规范完备度 {rubric.passedCount} / 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
