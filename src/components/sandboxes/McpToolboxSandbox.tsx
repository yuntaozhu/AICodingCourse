import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Plug,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { MCP_SERVERS, type McpServerConfig } from "@/data/cursorPresets";
import { auditMcpConfigJson, MCP_LAB_GUIDE } from "@/data/mcpLabGuide";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";

type SecurityPosture = "readonly" | "confirm-write";
type ScenarioId = "figma-browser" | "db-github" | "template-taskmaster";
type RightTabId = "json" | "trace" | "guide";

const DOD_STORAGE_KEY = "cursor_course_m4_mcp_dod_v1";

function loadCheckedDod(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DOD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function saveCheckedDod(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DOD_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("course:lab-progress-updated"));
  } catch {
    // Ignore storage quota errors
  }
}

export default function McpToolboxSandbox() {
  const [enabledIds, setEnabledIds] = useState<McpServerConfig["id"][]>([
    "figma",
    "playwright",
    "postgres",
  ]);
  const [posture, setPosture] = useState<SecurityPosture>("readonly");
  const [scenario, setScenario] = useState<ScenarioId>("figma-browser");
  const [rightTab, setRightTab] = useState<RightTabId>("json");
  const [checkedDodIds, setCheckedDodIds] = useState<string[]>(() => loadCheckedDod());

  const toggleDodItem = (id: string) => {
    setCheckedDodIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveCheckedDod(next);
      return next;
    });
  };

  const resetDodChecklist = () => {
    setCheckedDodIds([]);
    saveCheckedDod([]);
  };

  const toggleServer = (id: McpServerConfig["id"]) => {
    setEnabledIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const mcpJson = useMemo(() => {
    const mcpServers: Record<string, { command: string; args: string[]; env?: Record<string, string> }> = {};
    MCP_SERVERS.filter((s) => enabledIds.includes(s.id)).forEach((s) => {
      const env: Record<string, string> = {};
      s.envKeys.forEach((k) => {
        env[k] = `\${env:${k}}`;
      });
      mcpServers[s.id] = {
        command: s.command,
        args: s.args,
        ...(Object.keys(env).length > 0 ? { env } : {}),
      };
    });
    return JSON.stringify({ mcpServers }, null, 2);
  }, [enabledIds]);

  const tracePreview = useMemo(() => {
    if (scenario === "figma-browser") {
      const hasFigma = enabledIds.includes("figma");
      const hasBrowser = enabledIds.includes("playwright");
      return [
        `[Agent Plan] 从 Figma 设计稿还原定价页并在浏览器自检`,
        hasFigma
          ? `1. [MCP: figma.get_figma_data] 提取 3 栏定价卡片间距、字体与高亮边框 Token`
          : `1. [Fallback] 未启用 Figma MCP，将仅依赖手动截图近似推断布局`,
        `2. [Cursor Agent] 生成 src/components/PricingSection.tsx 并对齐 Tailwind 主题色`,
        hasBrowser
          ? `3. [MCP: playwright.browser_navigate + snapshot] 检查 1280px 与 375px 视口无遮挡、无 Console 报错`
          : `3. [Warning] 未启用 Playwright MCP，需人工切回浏览器目测排版`,
        `[Gate: ${posture === "readonly" ? "只读工具自动放行" : "写操作等待人工确认"}] 完成闭环`,
      ].join("\n\n");
    }

    if (scenario === "template-taskmaster") {
      const hasContext7 = enabledIds.includes("context7");
      const hasMemory = enabledIds.includes("memory");
      const hasTaskmaster = enabledIds.includes("taskmaster");
      const hasGithub = enabledIds.includes("github");
      return [
        `[Agent Plan] PRD 定稿 → GitHub Issue 唯一真相 → 分步拆解并防过期 API 幻觉`,
        hasGithub
          ? `1. [MCP: github.${posture === "readonly" ? "get_issue (建单已拦截)" : "create_issue (人工确认后建单)"}] 将 PRD 写入 GitHub Issue #12，并删除本地 .taskmaster/docs/prd.txt 草稿`
          : `1. [Fallback] 未启用 GitHub MCP，建议手动执行 gh issue create 并清理本地 PRD 草稿`,
        hasTaskmaster
          ? `2. [MCP: taskmaster.${posture === "readonly" ? "next_task (只读拉取下一子任务)" : "parse_prd + expand_task (收到明确拆解指令后执行)"}] 拆解开发切片`
          : `2. [Warning] 未启用 TaskMaster MCP，需人工拆分需求清单`,
        hasContext7
          ? `3. [MCP: context7.resolve-library-id → get-library-docs] 两步强制拉取最新 SDK 文档与代码示例`
          : `3. [Warning] 未启用 Context7 MCP，模型易混淆旧版 API 签名`,
        hasMemory
          ? `4. [MCP: memory.${posture === "readonly" ? "search_nodes (仅检索记忆图谱)" : "create_entities (经用户明确确认后持久化架构决策)"}]`
          : `4. [Fallback] 未启用 Memory MCP，跨会话架构约定仅存 .cursor/rules/90-self-improve.mdc`,
      ].join("\n\n");
    }

    const hasDb = enabledIds.includes("postgres");
    const hasGitHub = enabledIds.includes("github");
    return [
      `[Agent Plan] 排查生产慢查询并提交含迁移脚本的 PR`,
      hasDb
        ? `1. [MCP: postgres.describe_table] 探测 orders 表真实字段与缺失索引（零幻觉）`
        : `1. [Warning] 未启用 PostgreSQL MCP，模型可能猜错列名`,
      `2. [Cursor Agent] 编写参数化查询补丁与索引迁移 SQL，运行 npx tsc --noEmit`,
      hasGitHub
        ? `3. [MCP: github.${posture === "readonly" ? "get_issue (写入已拦截)" : "create_pull_request (人工确认后执行)"}] 关联 Issue 上下文生成规范 PR 说明`
        : `3. [Fallback] 未启用 GitHub MCP，需手动执行 git push 与创建 PR`,
    ].join("\n\n");
  }, [enabledIds, posture, scenario]);

  const configAudit = useMemo(
    () => auditMcpConfigJson(mcpJson, posture),
    [mcpJson, posture]
  );
  const passedAuditCount = configAudit.checks.filter((c) => c.passed).length;

  return (
    <div
      className="w-full max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-4 flex flex-col gap-3"
      onKeyDown={stopRevealKey}
      onWheel={stopRevealWheel}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div>
          <div className="text-[11px] font-mono text-gemini-cyan uppercase tracking-wider">
            Interactive Lab 03 · .cursor/mcp.json &amp; Agent Tool Governance · 模拟环境
          </div>
          <h3 className="text-lg font-bold text-white">
            Cursor MCP 生态配置与安全调用轨迹模拟器
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <button
            type="button"
            onClick={() => setRightTab("guide")}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
              rightTab === "guide"
                ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
            }`}
            title="打开本实验操作步骤与 DoD 验收清单"
          >
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              DoD {checkedDodIds.length}/{MCP_LAB_GUIDE.dodCriteria.length}
            </span>
          </button>
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            已挂载 <span className="text-gemini-cyan font-bold">{enabledIds.length}</span>/{MCP_SERVERS.length} 服务
          </div>
          <CopySnippetButton text={mcpJson} label="复制 mcp.json" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 items-stretch">
        {/* Left 60% */}
        <div className="col-span-7 flex flex-col gap-2.5">
          <div
            className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1"
            onWheel={stopRevealWheel}
          >
            {MCP_SERVERS.map((server) => {
              const active = enabledIds.includes(server.id);
              return (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => toggleServer(server.id)}
                  className={`p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                    active
                      ? "bg-gemini-cyan/10 border-gemini-cyan/50 text-white"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold flex items-center gap-1.5 truncate">
                      <Plug className="w-3.5 h-3.5 text-gemini-cyan shrink-0" />
                      <span className="truncate">{server.name}</span>
                    </span>
                    <span className={`text-[10px] font-mono shrink-0 ${active ? "text-emerald-400" : "text-slate-500"}`}>
                      {active ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-snug line-clamp-2">{server.role}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-12 gap-2.5 p-2.5 rounded-xl bg-black/35 border border-white/10">
            <div className="col-span-5">
              <div className="text-[11px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>最小特权安全策略</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPosture("readonly")}
                  className={`flex-1 py-1 px-2 rounded text-[11px] font-mono cursor-pointer border whitespace-nowrap ${
                    posture === "readonly"
                      ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-300"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  仅放行只读
                </button>
                <button
                  type="button"
                  onClick={() => setPosture("confirm-write")}
                  className={`flex-1 py-1 px-2 rounded text-[11px] font-mono cursor-pointer border whitespace-nowrap ${
                    posture === "confirm-write"
                      ? "bg-gemini-purple/20 border-gemini-purple text-white"
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}
                >
                  写入人工审批
                </button>
              </div>
            </div>

            <div className="col-span-7">
              <div className="text-[11px] font-mono text-slate-400 mb-1.5">演练任务流</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setScenario("figma-browser");
                    setRightTab("trace");
                  }}
                  className={`py-1 px-2 rounded text-[11px] cursor-pointer border whitespace-nowrap ${
                    scenario === "figma-browser"
                      ? "bg-gemini-cyan text-slate-950 font-semibold border-gemini-cyan"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}
                >
                  Figma+浏览器
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScenario("db-github");
                    setRightTab("trace");
                  }}
                  className={`py-1 px-2 rounded text-[11px] cursor-pointer border whitespace-nowrap ${
                    scenario === "db-github"
                      ? "bg-gemini-cyan text-slate-950 font-semibold border-gemini-cyan"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}
                >
                  DB 排障+PR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScenario("template-taskmaster");
                    setRightTab("trace");
                  }}
                  className={`py-1 px-2 rounded text-[11px] cursor-pointer border whitespace-nowrap ${
                    scenario === "template-taskmaster"
                      ? "bg-gemini-cyan text-slate-950 font-semibold border-gemini-cyan"
                      : "bg-white/5 border-white/10 text-slate-300"
                  }`}
                >
                  PRD+TaskMaster
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 40% */}
        <div className="col-span-5 flex flex-col rounded-xl bg-black/60 border border-white/10 overflow-hidden">
          <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setRightTab("json")}
              className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer whitespace-nowrap shrink-0 ${
                rightTab === "json"
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              .cursor/mcp.json
            </button>
            <button
              type="button"
              onClick={() => setRightTab("trace")}
              className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer whitespace-nowrap shrink-0 ${
                rightTab === "trace"
                  ? "bg-gemini-purple text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              模拟调用轨迹
            </button>
            <button
              type="button"
              onClick={() => setRightTab("guide")}
              className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer whitespace-nowrap shrink-0 ${
                rightTab === "guide"
                  ? "bg-emerald-400 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              练习与 DoD ({passedAuditCount}/4)
            </button>
          </div>

          {rightTab === "guide" ? (
            <div
              className="flex-1 p-3 overflow-y-auto custom-scrollbar max-h-[320px] space-y-3 text-[11px] text-slate-200"
              onWheel={stopRevealWheel}
            >
              {/* Objective & Deliverable */}
              <div className="space-y-1">
                <div className="font-mono text-gemini-cyan font-semibold">
                  {MCP_LAB_GUIDE.title}
                </div>
                <div className="text-[10.5px] text-slate-400">
                  适用：{MCP_LAB_GUIDE.audience}
                </div>
                <div className="text-[10.5px] text-slate-300">
                  <strong className="text-white">产出物：</strong>
                  {MCP_LAB_GUIDE.deliverable}
                </div>
              </div>

              {/* Automated Config Audit */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10.5px]">
                  <span className="text-white font-semibold">
                    当前 .cursor/mcp.json 自动体检
                  </span>
                  <span
                    className={`tabular-nums ${
                      passedAuditCount === configAudit.checks.length
                        ? "text-emerald-300"
                        : "text-amber-300"
                    }`}
                  >
                    {passedAuditCount}/{configAudit.checks.length} 通过
                  </span>
                </div>
                <div className="space-y-1">
                  {configAudit.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-start justify-between gap-2 text-[10.5px]"
                    >
                      <span className="inline-flex items-center gap-1.5 text-slate-200">
                        {chk.passed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                        )}
                        <span>{chk.label}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 text-right shrink-0">
                        {chk.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Steps */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="font-mono text-[10.5px] text-white font-semibold">
                  操作步骤
                </div>
                <div className="space-y-1 text-[10.5px] text-slate-300 leading-snug">
                  {MCP_LAB_GUIDE.steps.map((step) => (
                    <div key={step}>{step}</div>
                  ))}
                </div>
              </div>

              {/* Persistent DoD Checklist */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] text-emerald-300 font-semibold">
                    Definition of Done 验收清单 ({checkedDodIds.length}/{MCP_LAB_GUIDE.dodCriteria.length})
                  </span>
                  {checkedDodIds.length > 0 && (
                    <button
                      type="button"
                      onClick={resetDodChecklist}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>清空</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {MCP_LAB_GUIDE.dodCriteria.map((item) => {
                    const checked = checkedDodIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-start gap-2 p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDodItem(item.id)}
                          className="mt-0.5 accent-emerald-400 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-[10.5px] leading-snug ${
                              checked ? "text-emerald-300 line-through" : "text-slate-200"
                            }`}
                          >
                            {item.label}
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400">
                            核验：{item.verifyHint}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Local Verification Commands */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="font-mono text-[10.5px] text-white font-semibold">
                  本地验证命令
                </div>
                {MCP_LAB_GUIDE.verificationCommands.map((cmd) => (
                  <div key={cmd.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span>{cmd.label}</span>
                      <CopySnippetButton text={cmd.command} label="复制命令" />
                    </div>
                    <pre className="p-1.5 rounded bg-black/55 font-mono text-[9.5px] text-gemini-cyan whitespace-pre-wrap break-all">
                      {cmd.command}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Troubleshooting */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="font-mono text-[10.5px] text-amber-300 font-semibold">
                  常见失败现象与排查
                </div>
                {MCP_LAB_GUIDE.troubleshooting.map((t) => (
                  <div key={t.symptom} className="text-[10px] text-slate-300 leading-snug">
                    <span className="text-white font-medium">现象：</span>
                    {t.symptom} → <span className="text-emerald-300">排查：</span>
                    {t.resolution}
                  </div>
                ))}
              </div>

              {/* Boundary & Security Notice */}
              <div className="pt-2 border-t border-white/10 flex items-start gap-1.5 text-[10px] text-slate-400 leading-snug">
                <Info className="w-3.5 h-3.5 text-gemini-cyan shrink-0 mt-0.5" />
                <span>{MCP_LAB_GUIDE.boundaryNotice}</span>
              </div>
            </div>
          ) : (
            <pre
              className="flex-1 p-3 text-[11px] font-mono text-slate-200 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed max-h-[320px]"
              onWheel={stopRevealWheel}
            >
              {rightTab === "json" ? mcpJson : tracePreview}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
