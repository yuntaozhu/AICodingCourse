import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";
import { CopySnippetButton } from "./SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "./revealEvents";
import { loadLabChecklist, saveLabChecklist } from "@/data/labPracticeEngine";

const M13_GOV_DISCLAIMER =
  "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。";

interface TrajectoryCase {
  id: string;
  title: string;
  scenario: string;
  riskTag: string;
  steps: { label: string; detail: string; flagged: boolean }[];
  expectedRisks: string[];
  recommendedFix: string;
}

const PREBAKED_TRAJECTORIES: TrajectoryCase[] = [
  {
    id: "campus-meeting",
    title: "轨迹 01 · 校园会议纪要助手",
    scenario: "学生会成员查询跨院系闭门会议预算审批细节，Agent 未核验部门隔离直接总结。",
    riskTag: "ACL 越权风险 + 无引用编造",
    steps: [
      { label: "Step 1 · 检索调用", detail: "kb_search('经费审批 预算') 未传入 departmentId 与 role", flagged: true },
      { label: "Step 2 · 召回结果", detail: "误命中财务处机密草稿 [fin-draft-09] 并在回答中引用数字", flagged: true },
      { label: "Step 3 · 输出响应", detail: "回答末尾未附 docId 与版本号，直接口头定论", flagged: true },
    ],
    expectedRisks: ["未执行 ACL Pre-filter 导致跨部门越权", "关键结论缺少 docId + version 引用锚点"],
    recommendedFix: "退回研发在 Data PRD 补齐 departmentId + role pre-filter，并开启无引用拒答阈值。",
  },
  {
    id: "medical-kb",
    title: "轨迹 02 · 医疗合规检索助手",
    scenario: "临床医生询问最新用药禁忌，检索却命中使用已被废止的 2022 版旧指南切片。",
    riskTag: "过期版本召回（缺失 Tombstone）",
    steps: [
      { label: "Step 1 · 检索调用", detail: "按语义相似度召回 Top-1：2022 版旧条款（score 0.95）", flagged: true },
      { label: "Step 2 · 版本检查", detail: "文档元数据 status='deprecated' 未在检索前过滤", flagged: true },
      { label: "Step 3 · 输出结论", detail: "向医生输出已废止剂量建议，存在高危合规隐患", flagged: true },
    ],
    expectedRisks: ["deprecated 版本未执行 Tombstone 淘汰拦截", "高危场景未设人工复核警示"],
    recommendedFix: "在 Data PRD 强制要求 status='active' pre-filter，并对医疗禁忌类回答标注必须由主治医师复核。",
  },
  {
    id: "expense-agent",
    title: "轨迹 03 · 费用报销 Agent",
    scenario: "员工提交模糊发票后，Agent 自动绕过审批链直接调用财务拨款接口。",
    riskTag: "写操作缺失 HITL 人工审批门禁",
    steps: [
      { label: "Step 1 · OCR 识别", detail: "提取金额 ¥4,800，置信度仅 0.62", flagged: false },
      { label: "Step 2 · 规则判定", detail: "超过自动通过线 ¥500，但 Prompt 未声明暂停挂起", flagged: true },
      { label: "Step 3 · 工具执行", detail: "直接调用 execute_payout() 完成打款请求", flagged: true },
    ],
    expectedRisks: ["高风险财务写操作缺乏 HITL 审批门禁", "OCR 低置信度未触发人工转接"],
    recommendedFix: "在 Prompt PRD 与 HITL 审批矩阵写死：金额 >500 或 OCR <0.85 强制挂起，不得自动拨款。",
  },
];

export default function GovTrajectoryEvalSandbox() {
  const [caseIdx, setCaseIdx] = useState(0);
  const [flaggedChoices, setFlaggedChoices] = useState<Record<string, boolean>>({});
  const [verdict, setVerdict] = useState<"No-Go" | "Conditional" | "Go">("No-Go");
  const [prdTicket, setPrdTicket] = useState("");
  const [dodDone, setDodDone] = useState<boolean>(() => Boolean(loadLabChecklist("gov-trajectory-eval")[0]));

  const currentCase = PREBAKED_TRAJECTORIES[caseIdx];
  const checkedCount = currentCase.expectedRisks.filter((r) => flaggedChoices[`${currentCase.id}:${r}`]).length;
  const readyToSign = checkedCount === currentCase.expectedRisks.length && prdTicket.trim().length >= 8;

  const toggleRisk = (risk: string) => {
    const key = `${currentCase.id}:${risk}`;
    setFlaggedChoices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reportMarkdown = useMemo(() => {
    return `# M13-Gov 无代码 Agent 模拟治理评审报告
> **声明**：${M13_GOV_DISCLAIMER}

- 评审轨迹：${currentCase.title}
- 裁决结论：${verdict}
- 已核查风险项：${checkedCount}/${currentCase.expectedRisks.length}
- 需研发整改工单：${prdTicket.trim() || currentCase.recommendedFix}`;
  }, [currentCase, verdict, checkedCount, prdTicket]);

  const handleCompleteSignoff = () => {
    setDodDone(true);
    saveLabChecklist("gov-trajectory-eval", { 0: true });
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-left">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <div className="text-xs font-mono text-gemini-cyan tracking-widest uppercase">
            LAB 20 · MODULE 13-GOV · NO-CODE GOVERNANCE CAPSTONE
          </div>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            无代码 Agent 预制轨迹风险评估与上线治理评审台
          </h2>
        </div>
        <span className="text-xs font-mono text-amber-300">PM / 非技术治理验收专用</span>
      </div>

      {/* Mandatory verbatim disclaimer */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/50 text-xs text-amber-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
        <span className="font-medium">{M13_GOV_DISCLAIMER}</span>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[395px]">
        {/* Left: Trajectory Picker & Step Inspector */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-6 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-2.5"
        >
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-1.5">
              {PREBAKED_TRAJECTORIES.map((tc, idx) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setCaseIdx(idx)}
                  onKeyDown={stopRevealKey}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer whitespace-nowrap ${
                    caseIdx === idx
                      ? "bg-gemini-cyan text-slate-950 font-semibold"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {tc.title}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-1">
              <div className="font-mono text-[10px] text-rose-300">{currentCase.riskTag}</div>
              <div className="text-slate-200 leading-relaxed">{currentCase.scenario}</div>
            </div>

            <div className="space-y-1.5">
              {currentCase.steps.map((st) => (
                <div
                  key={st.label}
                  className={`p-2.5 rounded-xl border text-xs ${
                    st.flagged
                      ? "bg-rose-500/10 border-rose-400/35"
                      : "bg-white/[0.025] border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-white">{st.label}</span>
                    {st.flagged && (
                      <span className="text-rose-300 inline-flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> 高危异常步骤
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-200 mt-1">{st.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            建议整改方向：{currentCase.recommendedFix}
          </div>
        </div>

        {/* Right: Risk Triage, Verdict & Report Export */}
        <div
          onWheel={stopRevealWheel}
          className="col-span-6 bg-[#0b0f19] rounded-2xl border border-white/10 p-4 flex flex-col justify-between overflow-y-auto space-y-2.5"
        >
          <div className="space-y-2.5">
            <div className="text-xs font-mono text-gemini-purple inline-flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>勾选该轨迹暴露的高危风险（{checkedCount}/{currentCase.expectedRisks.length}）</span>
            </div>
            <div className="space-y-1.5">
              {currentCase.expectedRisks.map((risk) => {
                const picked = Boolean(flaggedChoices[`${currentCase.id}:${risk}`]);
                return (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => toggleRisk(risk)}
                    onKeyDown={stopRevealKey}
                    className={`w-full text-left p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                      picked
                        ? "bg-emerald-500/15 border-emerald-400/45 text-emerald-100"
                        : "bg-white/[0.03] border-white/10 text-slate-300"
                    }`}
                  >
                    <span className="font-mono">{picked ? "[✓]" : "[ ]"}</span>
                    <span>{risk}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-mono">治理审签结论：</span>
              <div className="flex items-center gap-1.5">
                {(["No-Go", "Conditional", "Go"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVerdict(v)}
                    onKeyDown={stopRevealKey}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] cursor-pointer ${
                      verdict === v
                        ? v === "No-Go"
                          ? "bg-rose-500 text-white font-semibold"
                          : v === "Conditional"
                          ? "bg-amber-400 text-slate-950 font-semibold"
                          : "bg-emerald-400 text-slate-950 font-semibold"
                        : "bg-white/5 text-slate-300 border border-white/10"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={prdTicket}
              onChange={(e) => setPrdTicket(e.target.value)}
              onKeyDown={stopRevealKey}
              placeholder="输入给研发团队的 Data/Prompt PRD 修正要求（至少 8 字）..."
              className="w-full p-2 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gemini-cyan"
            />
          </div>

          <div className="flex items-center gap-2">
            <CopySnippetButton text={reportMarkdown} label="复制审签报告" />
            <button
              type="button"
              onClick={() => {
                if (!prdTicket.trim()) {
                  setPrdTicket(currentCase.recommendedFix);
                }
                for (const risk of currentCase.expectedRisks) {
                  setFlaggedChoices((prev) => ({ ...prev, [`${currentCase.id}:${risk}`]: true }));
                }
                handleCompleteSignoff();
              }}
              onKeyDown={stopRevealKey}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                dodDone
                  ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-200"
                  : readyToSign
                  ? "bg-gemini-cyan text-slate-950 hover:opacity-90"
                  : "bg-white/10 text-slate-200 hover:bg-white/15"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {dodDone
                  ? "Lab 20 模拟治理评审已完成 [✓]"
                  : "一键核验并签署模拟治理评审（Lab 20）"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
