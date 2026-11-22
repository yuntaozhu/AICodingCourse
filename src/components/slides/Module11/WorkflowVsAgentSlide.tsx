import Slide from "@/components/Slide";
import { AlertTriangle, CheckCircle2, PauseCircle } from "lucide-react";

export default function WorkflowVsAgentSlide() {
  return (
    <Slide
      backgroundColor="#050814"
      notes="通过决策树对照说明何时采用固定 Workflow、何时引入受控 Agent 循环，以及高风险动作的 HITL 挂起审批设计。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-cyan mb-2">
          01. WORKFLOW VS AGENT DECISION TREE · 确定性编排与自主边界
        </div>
        <h2 className="text-3xl font-bold text-white mb-5">
          能用确定性 Workflow 解决的任务，绝不上自由循环 Agent
        </h2>

        <div className="grid grid-cols-12 gap-5 items-stretch text-xs">
          <div className="col-span-6 p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-400/30 space-y-3">
            <div className="flex items-center gap-2 font-mono text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>优先选择 Workflow（步骤可枚举 · 强合规）</span>
            </div>
            <ul className="space-y-2 text-slate-200 leading-relaxed">
              <li>
                · <strong className="text-white">判据 1：</strong>流程分支可在白板上穷举（如“提取发票 → 校验字段 → 查库存 → 生成审批单”）。
              </li>
              <li>
                · <strong className="text-white">判据 2：</strong>每一步延迟、Token 成本与错误率必须可预测且可审计回放。
              </li>
              <li>
                · <strong className="text-white">典型落地：</strong>Router + Prompt Chaining + 并行分片汇总，LLM 仅作受约束的结构化 JSON 转换器。
              </li>
            </ul>
          </div>

          <div className="col-span-6 p-5 rounded-2xl bg-gemini-purple/10 border border-gemini-purple/35 space-y-3">
            <div className="flex items-center gap-2 font-mono text-purple-200 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>启用受控 Agent（动态工具路由 · 必须加熔断）</span>
            </div>
            <ul className="space-y-2 text-slate-200 leading-relaxed">
              <li>
                · <strong className="text-white">判据 1：</strong>需要依据上一步工具返回结果决定下一步检索关键词或调用序列（如跨表排障 / 复杂问答）。
              </li>
              <li>
                · <strong className="text-white">判据 2：</strong>必须显式写死 <code className="text-white">maxSteps</code>（例 ≤ 6 步）、单请求费用上限与只读工具默认集。
              </li>
              <li>
                · <strong className="text-white">反模式：</strong>“为了显得智能”给固定审批流强塞自主 Agent，导致延迟翻 4 倍且偶发跳过校验步骤。
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-[#0b0f19] border border-amber-400/35 text-xs space-y-2">
          <div className="flex items-center gap-2 font-mono text-amber-300 font-semibold">
            <PauseCircle className="w-4 h-4" />
            <span>高风险写操作 Human-in-the-Loop (HITL) 门禁分级矩阵</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="font-semibold text-emerald-300 mb-1">Tier 0 · 只读检索（自动放行）</div>
              查询带 <code className="text-white">tenantId + role</code> 过滤后的知识切片、只读订单详情。
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="font-semibold text-amber-300 mb-1">Tier 1 · 草稿生成（二次确认）</div>
              生成退款草稿、待发邮件、数据库更新预览，由人类点确认后再提交。
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="font-semibold text-rose-300 mb-1">Tier 2 · 资金/权限/删除（硬阻断）</div>
              禁止自主执行删库、改权限或直接放款；必须人工独立鉴权审批。
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
