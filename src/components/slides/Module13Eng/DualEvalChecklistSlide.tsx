import Slide from "@/components/Slide";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";

const DUAL_EVAL_DELIVERY = `# ENG_CAPSTONE_DELIVERY.md
## 1. 检索侧评测证据 (Retrieval Eval)
- Recall@5: >= 0.90（Golden Q&A 集）
- 跨租户越权召回率 (ACL Leak Rate): 0 / 20 负向探针
- 过期文档召回率 (Stale Tombstone Hit): 0 / 10 废弃文档

## 2. Agent 端到端评测证据 (E2E Agent Eval)
- 工具选型与参数 Schema 通过率: 100%
- 步数与费用预算熔断: maxSteps=6 超限自动停止并返回可审计摘要
- 引用忠实度: 回答事实 100% 绑定有效 [docId#version]；无命中触发拒答

## 3. 命令行验证门禁
npx tsc --noEmit && npm run lint && npm test`;

export default function DualEvalChecklistSlide() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="对照检索侧评测与 Agent 端到端评测两套指标体系，防止“向量搜不到怪 Prompt、幻觉胡说怪模型”的盲目调参。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-purple mb-2">
          01. DUAL EVAL ARCHITECTURE · 检索侧与端到端双层验收检查表
        </div>
        <h2 className="text-3xl font-bold text-white mb-5">
          用 <span className="text-gemini-cyan">Dual Eval</span> 拆清“检索出错”与“推理出错”
        </h2>

        <div className="grid grid-cols-12 gap-5 items-stretch text-xs">
          <div className="col-span-6 space-y-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-gemini-cyan/35 space-y-1.5">
              <div className="font-mono text-gemini-cyan font-semibold">
                层 1 · 检索侧 Eval（不经过 LLM 直接测数据源）
              </div>
              <ul className="space-y-1.5 text-slate-200 leading-relaxed">
                <li>· Recall@K / MRR：正确文档切片是否进入候选 Top-K？</li>
                <li>· 零越权探针：低权限 Token 能否查出机密切片（必须 0 命中）？</li>
                <li>· 零过期探针：已标记 <code className="text-white">deprecated</code> 的版本是否彻底消失？</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-gemini-purple/35 space-y-1.5">
              <div className="font-mono text-purple-200 font-semibold">
                层 2 · Agent 端到端 Eval（测工具、预算与忠实度）
              </div>
              <ul className="space-y-1.5 text-slate-200 leading-relaxed">
                <li>· 工具调用精确度：参数类型、白名单过滤与 HITL 挂起是否触发？</li>
                <li>· 忠实度与引用锚点：结论是否严格忠于召回上下文而非外部幻觉？</li>
                <li>· 拒答与止损：工具持续失败或空检索时是否按 <code className="text-white">maxSteps</code> 安全停机？</li>
              </ul>
            </div>
          </div>

          <div className="col-span-6 p-4 rounded-2xl bg-[#0b0f19] border border-white/15 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-emerald-300 font-semibold">
                工程版验收单 · ENG_CAPSTONE_DELIVERY.md
              </span>
              <CopySnippetButton text={DUAL_EVAL_DELIVERY} label="复制验收清单" />
            </div>
            <pre className="p-3.5 rounded-xl bg-black/55 border border-white/10 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed flex-1">
              {DUAL_EVAL_DELIVERY}
            </pre>
            <div className="text-[11px] text-slate-400">
              → 右滑完成 M13-Eng 终极工程测验。
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
