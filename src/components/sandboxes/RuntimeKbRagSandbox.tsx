import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, ShieldAlert, ShieldCheck } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";
import { loadLabChecklist, saveLabChecklist } from "@/data/labPracticeEngine";
import {
  retrieveAuthorizedRuntimeChunks,
  type RuntimeChunkRecord,
} from "@/data/runtimeKnowledgeBase";

interface RuntimeChunk {
  chunkId: string;
  docId: string;
  version: string;
  section: string;
  tenantId: string;
  allowedRoles: string[];
  status: "active" | "deprecated";
  snippet: string;
  score: number;
}

const RUNTIME_KB_CORPUS: RuntimeChunk[] = [
  {
    chunkId: "chunk-reimburse-2026-1",
    docId: "kb-reimburse-2026",
    version: "v3.1",
    section: "§2.1 差旅报销上限",
    tenantId: "tenant-acme",
    allowedRoles: ["intern", "finance", "admin"],
    status: "active",
    snippet: "Acme 2026 新规：一线城市住宿报销上限 650 元/晚，超额须部门负责人预批。",
    score: 0.94,
  },
  {
    chunkId: "chunk-reimburse-2023-1",
    docId: "kb-reimburse-2023",
    version: "v1.0",
    section: "§2.1 历史差旅标准",
    tenantId: "tenant-acme",
    allowedRoles: ["intern", "finance", "admin"],
    status: "deprecated",
    snippet: "[已废弃 Tombstone] 2023 旧规：一线城市住宿报销上限 900 元/晚。",
    score: 0.96,
  },
  {
    chunkId: "chunk-acme-salary-1",
    docId: "kb-acme-salary-audit",
    version: "v2.4",
    section: "§4.2 薪酬审计口径",
    tenantId: "tenant-acme",
    allowedRoles: ["finance", "admin"],
    status: "active",
    snippet: "机密（仅限财务/管理员）：Q4 奖金池测算系数与高管股权归属调整明细。",
    score: 0.89,
  },
  {
    chunkId: "chunk-beta-clinical-1",
    docId: "kb-beta-clinical",
    version: "v1.8",
    section: "§1.3 跨租户临床样本",
    tenantId: "tenant-beta",
    allowedRoles: ["admin", "clinician"],
    status: "active",
    snippet: "[Tenant-Beta 机密] Beta 医院心血管患者回访加密索引与异常对照批注。",
    score: 0.92,
  },
];

const RUNTIME_CHUNK_INDEX: RuntimeChunkRecord[] = RUNTIME_KB_CORPUS.map((c) => ({
  chunkId: c.chunkId,
  docId: c.docId,
  tenantId: c.tenantId,
  allowedRoles: c.allowedRoles,
  version: c.version,
  status: c.status,
  section: c.section,
  text: c.snippet,
  semanticScore: c.score,
}));

const CALLER_IDENTITIES = [
  {
    id: "acme-intern",
    label: "tenant-acme / intern（实习生）",
    tenantId: "tenant-acme",
    role: "intern",
  },
  {
    id: "acme-finance",
    label: "tenant-acme / finance（财务）",
    tenantId: "tenant-acme",
    role: "finance",
  },
  {
    id: "beta-admin",
    label: "tenant-beta / admin（Beta 管理员）",
    tenantId: "tenant-beta",
    role: "admin",
  },
];

const PRE_FILTER_CODE = `export function retrieveAuthorizedChunks(
  corpus: DomainDocChunk[],
  caller: { tenantId: string; role: string },
  query: string
) {
  // 1. 检索查询前强制执行 ACL + Tombstone 淘汰过滤
  const authorized = corpus.filter(
    (c) =>
      c.status === "active" &&
      c.tenantId === caller.tenantId &&
      c.allowedRoles.includes(caller.role)
  );
  // 2. 仅在已授权子集内做混合召回并绑定 docId+version 引用
  return hybridRank(authorized, query).slice(0, 3);
}`;

export default function RuntimeKbRagSandbox() {
  const [strategy, setStrategy] = useState<"post-prompt" | "acl-prefilter">("post-prompt");
  const [callerIdx, setCallerIdx] = useState(0);
  const [dodDone, setDodDone] = useState<boolean>(() => Boolean(loadLabChecklist("runtime-kb-rag")[0]));

  const caller = CALLER_IDENTITIES[callerIdx];

  const evaluation = useMemo(() => {
    const sorted = [...RUNTIME_KB_CORPUS].sort((a, b) => b.score - a.score);
    if (strategy === "post-prompt") {
      // Unfiltered Top-3 leaks deprecated and unauthorized/cross-tenant chunks into LLM context
      const recalled = sorted.slice(0, 3);
      const leakedCrossTenant = recalled.some((c) => c.tenantId !== caller.tenantId);
      const leakedDeprecated = recalled.some((c) => c.status === "deprecated");
      const leakedRole = recalled.some(
        (c) => c.tenantId === caller.tenantId && !c.allowedRoles.includes(caller.role)
      );
      return {
        recalled,
        blocked: [] as { chunk: RuntimeChunk; reason: string }[],
        leakedCrossTenant,
        leakedDeprecated,
        leakedRole,
        safe: !leakedCrossTenant && !leakedDeprecated && !leakedRole,
      };
    }

    const corpusByDocId = new Map(RUNTIME_KB_CORPUS.map((c) => [c.docId, c]));
    const safeResult = retrieveAuthorizedRuntimeChunks(
      RUNTIME_CHUNK_INDEX,
      { tenantId: caller.tenantId, role: caller.role },
      [],
      { topK: 4, allowEmptyQueryBaseline: true }
    );
    const recalled = safeResult.citations
      .map((cit) => corpusByDocId.get(cit.docId))
      .filter((c): c is RuntimeChunk => Boolean(c));
    const blocked = safeResult.blocked
      .map((b) => {
        const chunk = corpusByDocId.get(b.docId);
        return chunk ? { chunk, reason: b.reason } : null;
      })
      .filter((item): item is { chunk: RuntimeChunk; reason: string } => Boolean(item));

    return {
      recalled,
      blocked,
      leakedCrossTenant: false,
      leakedDeprecated: false,
      leakedRole: false,
      safe: true,
    };
  }, [strategy, caller]);

  const handleMarkVerified = () => {
    setStrategy("acl-prefilter");
    setDodDone(true);
    saveLabChecklist("runtime-kb-rag", { 0: true });
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 18 · MODULE 12 · RUNTIME DOMAIN KB PIPELINE
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            运行时 KB：ACL Pre-filter、Tombstone 淘汰与引用溯源沙盘
          </h2>
        </div>
        <div className="text-[11px] font-mono text-amber-300">
          教学内存模拟：演示检索过滤边界（非生产向量库部署）
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-2.5 rounded-xl bg-[#0b0f19] border border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStrategy("post-prompt")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
              strategy === "post-prompt"
                ? "bg-rose-500 text-white font-semibold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            反例：先全量召回 + Prompt 掩盖
          </button>
          <button
            type="button"
            onClick={() => setStrategy("acl-prefilter")}
            onKeyDown={stopRevealKey}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
              strategy === "acl-prefilter"
                ? "bg-emerald-400 text-slate-950 font-semibold"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            正例：ACL Pre-filter + Tombstone 拦截
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-mono text-slate-400">模拟调用身份：</span>
          {CALLER_IDENTITIES.map((idObj, idx) => (
            <button
              key={idObj.id}
              type="button"
              onClick={() => setCallerIdx(idx)}
              onKeyDown={stopRevealKey}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] cursor-pointer whitespace-nowrap ${
                callerIdx === idx
                  ? "bg-gemini-cyan text-slate-950 font-semibold"
                  : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              {idObj.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[395px]">
        {/* Left: Retrieved Chunks & Blocked Trace */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-7 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-3"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gemini-cyan inline-flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>送入 LLM 生成器的检索切片 ({evaluation.recalled.length} 条)</span>
              </span>
              {evaluation.safe ? (
                <span className="text-emerald-300 inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 0 越权 · 0 过期召回
                </span>
              ) : (
                <span className="text-rose-400 inline-flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 检测到敏感越权或过期混入！
                </span>
              )}
            </div>

            {evaluation.recalled.length === 0 ? (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                当前身份在 {caller.tenantId} 无可召回的匹配条款，模型将按拒答契约返回「依据不足」。
              </div>
            ) : (
              <div className="space-y-2">
                {evaluation.recalled.map((chunk) => {
                  const isUnauthorized =
                    chunk.tenantId !== caller.tenantId || !chunk.allowedRoles.includes(caller.role);
                  const isStale = chunk.status === "deprecated";
                  return (
                    <div
                      key={chunk.docId}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        isUnauthorized || isStale
                          ? "bg-rose-500/10 border-rose-400/45"
                          : "bg-emerald-500/10 border-emerald-400/35"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
                        <span className="text-white">
                          [{chunk.docId} · {chunk.version} · {chunk.section}]
                        </span>
                        <span className={isUnauthorized || isStale ? "text-rose-300" : "text-emerald-300"}>
                          {chunk.tenantId} · roles:[{chunk.allowedRoles.join(",")}] · {chunk.status}
                        </span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{chunk.snippet}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {evaluation.blocked.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono text-slate-400">
                  Pre-filter 阶段已拦截的候选（未进入 LLM 上下文）：
                </div>
                {evaluation.blocked.map(({ chunk, reason }) => (
                  <div
                    key={chunk.docId}
                    className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-[11px] font-mono flex items-center justify-between gap-2 text-slate-400"
                  >
                    <span>{chunk.docId}</span>
                    <span className="text-amber-300">{reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!evaluation.safe && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                危险：靠 System Prompt 嘱咐“不要泄露”无法阻止 Prompt Injection 套出已召回的原文！
              </span>
            </div>
          )}
        </div>

        {/* Right: Code Contract & Verification Button */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-5 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-3"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-gemini-purple">
                检索前权限过滤骨架 (TypeScript)
              </span>
              <CopySnippetButton text={PRE_FILTER_CODE} label="复制骨架" />
            </div>
            <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
              {PRE_FILTER_CODE}
            </pre>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-white">与研发工程 KB 的区别：</strong>
              研发 KB 帮助人类/Coding Agent 读懂仓库规则；运行时 KB 必须按调用方 <code className="text-gemini-cyan">tenantId + role + active</code> 动态过滤并输出可点击引用锚点。
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkVerified}
            onKeyDown={stopRevealKey}
            className={`w-full py-2 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 ${
              dodDone
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200"
                : "bg-gemini-cyan text-slate-950 hover:opacity-90"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {dodDone ? "Lab 18 ACL Pre-filter 验收已完成 [✓]" : "切换 ACL 安全路径并完成 Lab 18 验收"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
