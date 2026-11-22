import { useState } from "react";
import { AlertTriangle, CheckCircle2, Play, RotateCcw, ShieldAlert, PauseCircle } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";
import { loadLabChecklist, saveLabChecklist } from "@/data/labPracticeEngine";

type WorkflowMode = "workflow" | "guarded-agent" | "unbounded-loop";

interface TraceStep {
  step: number;
  actor: string;
  action: string;
  status: "ok" | "hitl-pause" | "halted" | "runaway";
  tokensUsed: number;
  note: string;
}

const TRACE_BY_MODE: Record<WorkflowMode, { title: string; maxSteps: number; steps: TraceStep[] }> = {
  workflow: {
    title: "模式 A · 确定性 Workflow（步骤固定可枚举，成本可预测）",
    maxSteps: 3,
    steps: [
      {
        step: 1,
        actor: "Router",
        action: "Zod 校验退款申请单 -> 查订单金额与签收时间",
        status: "ok",
        tokensUsed: 650,
        note: "确定性 API 调用，不消耗 LLM 推理规划预算。",
      },
      {
        step: 2,
        actor: "Policy Check",
        action: "匹配 < 7 天且金额 ≤ 200 元规则 -> 无需多轮 Agent 循环",
        status: "ok",
        tokensUsed: 1100,
        note: "规则命中清晰时优先 Workflow，延迟与故障面最小。",
      },
      {
        step: 3,
        actor: "HITL Gate",
        action: "生成退款工单草案 -> 挂起等待财务确认后执行入账",
        status: "hitl-pause",
        tokensUsed: 1450,
        note: "高风险写操作严格受控。",
      },
    ],
  },
  "guarded-agent": {
    title: "模式 B · 受控 Agent（maxSteps=4 预算熔断 + 写操作 HITL）",
    maxSteps: 4,
    steps: [
      {
        step: 1,
        actor: "Agent · Plan",
        action: "kb_search('tenant-acme', '跨境退税异常条款')",
        status: "ok",
        tokensUsed: 1800,
        note: "命中 [kb-tax-2026 §3.2]，白名单只读工具。",
      },
      {
        step: 2,
        actor: "Agent · Tool",
        action: "fetch_invoice('INV-9021') -> 返回 503 超时",
        status: "ok",
        tokensUsed: 3200,
        note: "第 1 次工具失败，记录退避重试计数 retry=1/2。",
      },
      {
        step: 3,
        actor: "Agent · Retry",
        action: "fetch_invoice('INV-9021') -> 成功返回明细并绑定引用",
        status: "ok",
        tokensUsed: 5100,
        note: "在预算阈值（4 步 / 10k tok）内收敛出完整证据链。",
      },
      {
        step: 4,
        actor: "HITL · Pause",
        action: "申请调用 issue_refund()（写操作）-> 挂起审批",
        status: "hitl-pause",
        tokensUsed: 6400,
        note: "写操作未自动放行，必须点击「人工批准」才可执行或终止。",
      },
    ],
  },
  "unbounded-loop": {
    title: "模式 C · 无护栏失控循环（无 maxSteps / 无白名单 / 跳过 HITL）",
    maxSteps: 99,
    steps: [
      {
        step: 1,
        actor: "Agent",
        action: "调用未白名单工具 exec_sql('SELECT * FROM users')",
        status: "runaway",
        tokensUsed: 3400,
        note: "未裁剪工具 Schema，模型自行探索高危库表。",
      },
      {
        step: 2,
        actor: "Agent",
        action: "参数格式报错 -> 相同无效参数第 4 次重复重试",
        status: "runaway",
        tokensUsed: 11200,
        note: "缺少 2-3 次错误熔断，Token 指数膨胀。",
      },
      {
        step: 3,
        actor: "Agent",
        action: "第 11 轮幻觉通过并直接触发 batch_refund() 全量写入",
        status: "halted",
        tokensUsed: 28900,
        note: "事故发生：既烧光预算又产生不可逆脏写！",
      },
    ],
  },
};

const CONTROL_POLICY_SNIPPET = `export const AGENT_RUNTIME_POLICY = {
  maxSteps: 4,
  maxTokenBudget: 10000,
  maxToolRetries: 2,
  allowedTools: ["kb_search", "fetch_invoice", "ticket_draft"],
  hitlRequiredTools: ["issue_refund", "update_permissions"],
} as const;`;

export default function AgentWorkflowSandbox() {
  const [mode, setMode] = useState<WorkflowMode>("guarded-agent");
  const [visibleCount, setVisibleCount] = useState<number>(4);
  const [hitlApproved, setHitlApproved] = useState<boolean>(false);
  const [dodDone, setDodDone] = useState<boolean>(() => Boolean(loadLabChecklist("agent-workflow-sim")[0]));

  const currentTrace = TRACE_BY_MODE[mode];
  const shownSteps = currentTrace.steps.slice(0, visibleCount);
  const lastStep = shownSteps[shownSteps.length - 1];
  const requiresHitl = lastStep?.status === "hitl-pause" && !hitlApproved;

  const handleModeChange = (next: WorkflowMode) => {
    setMode(next);
    setVisibleCount(TRACE_BY_MODE[next].steps.length);
    setHitlApproved(false);
  };

  const handleConfirmDod = () => {
    setDodDone(true);
    saveLabChecklist("agent-workflow-sim", { 0: true });
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 19 · MODULE 12 · RUNTIME AGENT LOOP &amp; CIRCUIT BREAKER
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            运行时 Agent 工具循环、预算熔断与 HITL 审批沙盘
          </h2>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          确定性状态机模拟 · 对比 Workflow / 受控 Agent / 失控循环
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 p-2 rounded-xl bg-[#0b0f19] border border-white/10">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "workflow", label: "A. 确定性 Workflow" },
              { id: "guarded-agent", label: "B. 受控 Agent (maxSteps=4 + HITL)" },
              { id: "unbounded-loop", label: "C. 无护栏失控循环" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleModeChange(item.id)}
              onKeyDown={stopRevealKey}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                mode === item.id
                  ? item.id === "unbounded-loop"
                    ? "bg-rose-500 text-white font-semibold"
                    : "bg-gemini-cyan text-slate-950 font-semibold"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setVisibleCount(1);
              setHitlApproved(false);
            }}
            onKeyDown={stopRevealKey}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono text-slate-300 cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>从第 1 步步进</span>
          </button>
          <button
            type="button"
            disabled={visibleCount >= currentTrace.steps.length}
            onClick={() => setVisibleCount((c) => Math.min(currentTrace.steps.length, c + 1))}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ${
              visibleCount < currentTrace.steps.length
                ? "bg-gemini-purple text-white font-semibold"
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>执行下一步 ({visibleCount}/{currentTrace.steps.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[395px]">
        {/* Left: Trajectory Timeline */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-2.5"
        >
          <div className="space-y-2">
            <div className="text-xs font-mono text-white font-semibold">{currentTrace.title}</div>
            {shownSteps.map((st) => (
              <div
                key={st.step}
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  st.status === "runaway" || st.status === "halted"
                    ? "bg-rose-500/10 border-rose-400/40"
                    : st.status === "hitl-pause"
                    ? "bg-amber-500/10 border-amber-400/40"
                    : "bg-white/[0.03] border-white/12"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                  <span className="text-gemini-cyan">
                    Step {st.step} · {st.actor}
                  </span>
                  <span className="text-slate-400">累计 {st.tokensUsed.toLocaleString()} tok</span>
                </div>
                <div className="font-mono text-white text-[11px]">{st.action}</div>
                <div className="text-slate-300 text-[11px] leading-relaxed">{st.note}</div>
              </div>
            ))}
          </div>

          {requiresHitl && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <PauseCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>写操作已挂起（HITL Gate）：等待人工确认后方可执行</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setHitlApproved(true);
                  handleConfirmDod();
                }}
                onKeyDown={stopRevealKey}
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer whitespace-nowrap"
              >
                人工批准执行写操作
              </button>
            </div>
          )}

          {hitlApproved && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>人工已签字批准并记录审计轨迹，写操作安全落盘。</span>
            </div>
          )}

          {mode === "unbounded-loop" && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/45 text-xs text-rose-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>失控原因：未限制工具白名单、缺少 maxSteps 熔断且跳过人工确认！</span>
            </div>
          )}
        </div>

        {/* Right: Policy Config & DoD */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-3"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-gemini-purple">
                运行时预算与 HITL 策略骨架
              </span>
              <CopySnippetButton text={CONTROL_POLICY_SNIPPET} label="复制策略" />
            </div>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
              {CONTROL_POLICY_SNIPPET}
            </pre>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span>
                工程底线：能用确定性 Workflow 解决的 80% 流程绝不套多轮自由 Agent；需要 Agent 时必须同时设置步数上限、重试上限与写操作 HITL 暂停点。
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmDod}
            onKeyDown={stopRevealKey}
            className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              dodDone
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200"
                : "bg-gemini-cyan text-slate-950 hover:opacity-90"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {dodDone ? "Lab 19 循环与熔断验收已完成 [✓]" : "确认完成预算熔断与 HITL，签署 Lab 19 验收"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
