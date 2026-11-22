import Slide from "@/components/Slide";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";

const BLUEPRINT_TEMPLATE = `# AGENT_PRODUCT_BLUEPRINT.md
## 1. 编排判定 (Workflow vs Agent)
- 选型结论: [受控 Agent / 确定性 Workflow]
- 单次预算上限: maxSteps = 5 | maxCostUSD = 0.08

## 2. Data PRD（运行时领域知识契约）
- 数据源与敏感度: 内部制度文档（按 tenantId + role 强隔离）
- 检索前过滤字段: tenantId, allowedRoles, status === "active"
- 更新与淘汰 (Tombstone): 旧版切换为 deprecated 即刻剔除召回

## 3. Prompt PRD（行为、工具与拒答规则）
- 只读工具白名单: ["kb_search", "order_lookup"]
- 写操作 HITL: create_refund_draft 须人工审批确认
- 忠实度与拒答: 未命中带 docId 引用切片 -> 固定拒答并转人工`;

export default function DataPromptPrdSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="展示如何把模糊的“做个客服 Agent”转化为工程与合规团队都能直接验收的 Data PRD + Prompt PRD 双蓝图文档。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-purple mb-2">
          02. DATA PRD + PROMPT PRD · 产研对齐的机器可检规格书
        </div>
        <h2 className="text-3xl font-bold text-white mb-5">
          把 Agent 需求写成 <span className="text-gemini-cyan">Data PRD + Prompt PRD</span>
        </h2>

        <div className="grid grid-cols-12 gap-5 items-stretch text-xs">
          <div className="col-span-6 space-y-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-cyan font-semibold">Data PRD · 管住输入与权限面</div>
              <p className="text-slate-300 leading-relaxed">
                定义接入哪些数据源、按什么主键切片、每个切片携带什么 <code className="text-white">tenantId / role / status</code> 元数据，以及旧版本如何标记 Tombstone 下线。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-purple font-semibold">Prompt PRD · 管住决策、工具与拒答</div>
              <p className="text-slate-300 leading-relaxed">
                定义允许调用的工具清单与参数 Schema、每类结论必须附带的引用格式（<code className="text-white">[docId#section]</code>），以及检索为空时的固定拒答话术与工单升级路径。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-400/30 space-y-1.5">
              <div className="font-mono text-amber-300 font-semibold">ROI 与商业兜底边界</div>
              <p className="text-slate-200 leading-relaxed">
                上线前先算清楚单任务平均步数 × 工具延迟 × 人工复核抽检比例；若自动化准确率低于复核成本阈值，回退为“辅助起草 + 人工发送”。
              </p>
            </div>
          </div>

          <div className="col-span-6 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-gemini-cyan font-semibold">
                可带走模板 · AGENT_PRODUCT_BLUEPRINT.md
              </span>
              <CopySnippetButton text={BLUEPRINT_TEMPLATE} label="复制蓝图模板" />
            </div>
            <pre className="p-3.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed flex-1">
              {BLUEPRINT_TEMPLATE}
            </pre>
            <div className="text-[11px] text-slate-400">
              → 右滑完成 M11 巩固测验；非技术/PM 可直达 M13-Gov，研发同学进入 M12 运行时工程实现。
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
