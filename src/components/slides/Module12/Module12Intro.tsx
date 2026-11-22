import Slide from "@/components/Slide";
import { Database, Lock, ShieldCheck } from "lucide-react";

export default function Module12Intro() {
  return (
    <Slide
      backgroundColor="#040711"
      notes="Module 12 彻底区分研发工程知识库与运行时领域知识库，拆解 Ingestion、ACL Pre-filter、Hybrid/Wiki Retrieval、Citation Grounding、Tombstone 与 Dual Eval 六步工程链路。"
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
        <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
          Module 12 · Track 3 工程实现 · Runtime Agent &amp; Domain Knowledge Base
        </div>
        <h1 className="text-4xl sm:text-5xl mb-4 leading-tight text-white font-bold">
          运行时 Agent 工作流与{" "}
          <span className="text-gemini-purple">领域知识库工程实现</span>
        </h1>
        <p className="text-base font-mono text-gemini-cyan/85 mb-6 max-w-4xl">
          彻底分离“给 Coding Agent 看的工程规范库”与“供线上应用检索的运行时领域知识库”
        </p>
        <div className="h-1 w-24 bg-gemini-purple mb-6" />

        <div className="grid grid-cols-12 gap-4 text-xs mb-4">
          <div className="col-span-5 p-4 rounded-2xl bg-white/5 border border-white/15 space-y-2">
            <div className="font-mono text-slate-300 font-semibold">
              链路 A · 研发工程知识库（给开发期 Coding Agent）
            </div>
            <p className="text-slate-300 leading-relaxed">
              存放 <code className="text-white">.cursor/rules/*.mdc</code>、<code className="text-white">AGENTS.md</code>、ADR 与 78 册 AI 专著，面向开发者在编写软件时约束代码规范。
            </p>
          </div>

          <div className="col-span-7 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/40 space-y-2">
            <div className="flex items-center gap-1.5 font-mono text-gemini-cyan font-semibold">
              <Database className="w-4 h-4" />
              <span>链路 B · 运行时领域知识库六步工程链路（给生产程序中的用户）</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-200">
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <strong className="text-white">1. Ingestion 切分</strong>
                <div>带版本/租户/角色元数据入库</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-emerald-400/35">
                <strong className="text-emerald-300">2. ACL Pre-filter</strong>
                <div>检索前强过滤 tenantId + role</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <strong className="text-white">3. 混合 / Wiki 检索</strong>
                <div>BM25 + 向量 + 结构化索引</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <strong className="text-white">4. 引用溯源 Grounding</strong>
                <div>逐句绑定 docId 与版本锚点</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-amber-400/35">
                <strong className="text-amber-300">5. Tombstone 淘汰</strong>
                <div>废弃旧版立即阻断召回</div>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <strong className="text-white">6. Dual Eval</strong>
                <div>检索指标 + 端到端忠实度</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/[0.08] border border-amber-400/30 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              课堂沙盘边界：接下来 Lab 18 与 Lab 19 为本地确定性教学模拟，用于亲手暴露越权与死循环隐患；真实系统须部署带检索前过滤的向量/关系存储与服务端鉴权。
            </span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-gemini-cyan shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>→ 右滑进入 Lab 18</span>
          </span>
        </div>
      </div>
    </Slide>
  );
}
