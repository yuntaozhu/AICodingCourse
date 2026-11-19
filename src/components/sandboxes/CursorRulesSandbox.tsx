import { useMemo, useState } from "react";
import { FileCode2, ShieldCheck } from "lucide-react";
import {
  compileMdcFile,
  doesGlobMatch,
  PRODUCT_ARCHETYPES,
  RULE_TEMPLATES,
  type RuleTemplate,
} from "@/data/cursorPresets";
import { CopySnippetButton } from "./SandboxFrame";
import LabPracticePanel from "./LabPracticePanel";
import { auditCursorRules } from "@/data/labPracticeEngine";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

export default function CursorRulesSandbox() {
  const [archetypeId, setArchetypeId] = useState(PRODUCT_ARCHETYPES[0].id);
  const [rules, setRules] = useState<RuleTemplate[]>(RULE_TEMPLATES);
  const [activeRuleId, setActiveRuleId] = useState(RULE_TEMPLATES[1].id);
  const [simulatedFile, setSimulatedFile] = useState(PRODUCT_ARCHETYPES[0].defaultFiles[0]);
  const [previewTab, setPreviewTab] = useState<"mdc" | "agents">("mdc");
  const [viewMode, setViewMode] = useState<"workbench" | "practice">("workbench");

  const activeArchetype = useMemo(
    () => PRODUCT_ARCHETYPES.find((a) => a.id === archetypeId) || PRODUCT_ARCHETYPES[0],
    [archetypeId]
  );

  const selectedRule = useMemo(
    () => rules.find((r) => r.id === activeRuleId) || rules[0],
    [activeRuleId, rules]
  );

  const handleSelectArchetype = (id: string) => {
    setArchetypeId(id);
    const next = PRODUCT_ARCHETYPES.find((a) => a.id === id);
    if (next) {
      setSimulatedFile(next.defaultFiles[0]);
    }
  };

  const toggleAlwaysApply = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, alwaysApply: !r.alwaysApply } : r))
    );
  };

  const updateRuleBody = (id: string, body: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, body } : r)));
  };

  const updateRuleGlobs = (id: string, raw: string) => {
    const globs = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, globs } : r)));
  };

  const injectionAnalysis = useMemo(() => {
    return rules.map((r) => {
      const hitByAlways = r.alwaysApply;
      const hitByGlob = doesGlobMatch(simulatedFile, r.globs);
      const hitByDescription = !r.alwaysApply && r.globs.length === 0;
      const status = hitByAlways
        ? "全局强制注入"
        : hitByGlob
        ? "路径 Glob 精准命中"
        : hitByDescription
        ? "Agent 按需语义召回"
        : "未触发（零 Token 噪音）";
      return {
        rule: r,
        active: hitByAlways || hitByGlob,
        status,
      };
    });
  }, [rules, simulatedFile]);

  const activeCount = injectionAnalysis.filter((item) => item.active).length;
  const mdcOutput = useMemo(() => compileMdcFile(selectedRule), [selectedRule]);
  const copyOutput = previewTab === "mdc" ? mdcOutput : activeArchetype.agentsSummary;
  const auditReport = useMemo(() => auditCursorRules(rules), [rules]);
  const auditPassedCount = auditReport.checks.filter((c) => c.passed).length;

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-purple uppercase tracking-wider">
            Interactive Lab 02 · .cursor/rules (.mdc) &amp; AGENTS.md Simulator
          </div>
          <h3 className="text-lg font-bold text-white">
            Cursor 规则编译与精准上下文命中演练台
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <div
            className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10"
            role="tablist"
            aria-label="Lab 02 模式切换"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "workbench"}
              onClick={() => setViewMode("workbench")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                viewMode === "workbench"
                  ? "bg-white text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              规则编译与命中
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "practice"}
              onClick={() => setViewMode("practice")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                viewMode === "practice"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              练习与 DoD ({auditPassedCount}/{auditReport.checks.length})
            </button>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            命中规则 <span className="text-gemini-cyan font-bold">{activeCount}</span>/{rules.length}
          </div>
          <CopySnippetButton
            text={copyOutput}
            label={previewTab === "mdc" ? "复制 .mdc" : "复制 AGENTS.md"}
          />
        </div>
      </div>

      {viewMode === "practice" ? (
        <LabPracticePanel
          labId="cursor-rules"
          auditReport={auditReport}
          auditTitle=".mdc 规则隔离与 Token 预算审计"
        />
      ) : (
        <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left 60%: Rule Selector + Glob Simulator + Rule Body Editor */}
        <div className="col-span-7 flex flex-col gap-2.5">
          {/* Archetype + Simulated Active File */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1">选择产品模板</div>
              <select
                value={archetypeId}
                onChange={(e) => handleSelectArchetype(e.target.value)}
                onKeyDown={stopRevealKey}
                className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gemini-cyan"
              >
                {PRODUCT_ARCHETYPES.map((a) => (
                  <option key={a.id} value={a.id} className="bg-[#0b0f19]">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                <FileCode2 className="w-3 h-3 text-gemini-cyan" />
                <span>模拟当前正在编辑的文件</span>
              </div>
              <select
                value={simulatedFile}
                onChange={(e) => setSimulatedFile(e.target.value)}
                onKeyDown={stopRevealKey}
                className="w-full rounded-lg bg-black/50 border border-white/15 px-2.5 py-1.5 text-xs font-mono text-gemini-cyan focus:outline-none focus:border-gemini-cyan"
              >
                {activeArchetype.defaultFiles.map((file) => (
                  <option key={file} value={file} className="bg-[#0b0f19]">
                    {file}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rules Hit Matrix */}
          <div className="grid grid-cols-2 gap-2">
            {injectionAnalysis.map(({ rule, active, status }) => {
              const isSelected = rule.id === activeRuleId;
              return (
                <div
                  key={rule.id}
                  onClick={() => setActiveRuleId(rule.id)}
                  className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gemini-purple/15 border-gemini-purple/60"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-mono font-bold text-white truncate">
                      {rule.slug}.mdc
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        active ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      {active ? "已注入" : "待命"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{status}</div>
                </div>
              );
            })}
          </div>

          {/* Selected Rule Editor */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-gemini-cyan flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>编辑规则: {selectedRule.slug}.mdc</span>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRule.alwaysApply}
                  onChange={() => toggleAlwaysApply(selectedRule.id)}
                  className="accent-[#9b72cb]"
                />
                <span>alwaysApply: {String(selectedRule.alwaysApply)}</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 shrink-0">globs:</span>
              <input
                type="text"
                value={selectedRule.globs.join(", ")}
                onChange={(e) => updateRuleGlobs(selectedRule.id, e.target.value)}
                onKeyDown={stopRevealKey}
                placeholder="例如: src/components/**/*.tsx, server/**/*.ts"
                className="flex-1 rounded-lg bg-black/60 border border-white/15 px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-gemini-cyan"
              />
            </div>

            <textarea
              value={selectedRule.body}
              onChange={(e) => updateRuleBody(selectedRule.id, e.target.value)}
              onKeyDown={stopRevealKey}
              rows={3}
              className="w-full rounded-lg bg-black/60 border border-white/15 px-2.5 py-1.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-gemini-cyan resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right 40%: Compiled Preview */}
        <div className="col-span-5 flex flex-col rounded-xl bg-black/60 border border-white/10 overflow-hidden">
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewTab("mdc")}
                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                  previewTab === "mdc"
                    ? "bg-gemini-cyan text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                .cursor/rules/{selectedRule.slug}.mdc
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("agents")}
                className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                  previewTab === "agents"
                    ? "bg-gemini-purple text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AGENTS.md
              </button>
            </div>
          </div>
          <pre
            className="flex-1 p-3 text-[11px] font-mono text-slate-200 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed max-h-[340px]"
            onWheel={stopRevealWheel}
          >
            {copyOutput}
          </pre>
        </div>
      </div>
      )}
    </div>
  );
}
