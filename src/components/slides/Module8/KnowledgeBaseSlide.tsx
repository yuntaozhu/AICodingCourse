import Slide from "@/components/Slide";
import BookKnowledgeBaseSandbox from "@/components/sandboxes/BookKnowledgeBaseSandbox";
import { AI_BOOKS_KNOWLEDGE_BASE } from "@/data/aiBooksKnowledgeBase";

export default function KnowledgeBaseSlide() {
  const bookCount = AI_BOOKS_KNOWLEDGE_BASE.length;
  return (
    <section>
      {/* Main Interactive Knowledge Base Slide (Lab 05) */}
      <Slide
        backgroundColor="#040711"
        notes={`已完整收录 GitHub 开源仓库 MinhNguyenDS/AI-pdf-books 及前沿工程专著共 ${bookCount} 册，支持检索精读并直接组合生成 Cursor 课程大纲、.mdc 规则与实战实验。`}
      >
        <div className="flex flex-col justify-center h-full">
          <BookKnowledgeBaseSandbox />
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Reading-to-Curriculum Mapping */}
      <Slide
        backgroundColor="#050814"
        notes={`展示这 ${bookCount} 册书籍与论文如何为本课程 14 个核心模块提供学术与工程理论底座（由知识库中心链路 A 统一调度）。`}
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            KNOWLEDGE-TO-CURRICULUM MAP · 以书建课映射图谱
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            {bookCount} 册馆藏如何通过自动标签实质性增强课程模块？
          </h2>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-gemini-cyan mb-1.5">M1 &amp; M7 · 范式与 70% 突围</div>
              <div className="font-bold text-white mb-1.5">《Beyond Vibe Coding》</div>
              <p className="text-slate-300 leading-relaxed">
                配《arXiv:2410.02156》6 助 5 步法与《AI Engineering》，破解 70% 困境、知识悖论与静默错误。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-gemini-purple mb-1.5">M2 &amp; M4 · 上下文与 Harness</div>
              <div className="font-bold text-white mb-1.5">《OPENDEV (2603.05344)》</div>
              <p className="text-slate-300 leading-relaxed">
                配《GraphRAG 综述》《Hands-On LLMs》与 GoF 设计模式，解释依赖图 + 5 阶压缩如何击退上下文膨胀。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-emerald-400 mb-1.5">M3 / M9 / M10 · 全栈与审美</div>
              <div className="font-bold text-white mb-1.5">《Vibe Coder&apos;s Handbook》</div>
              <p className="text-slate-300 leading-relaxed">
                配《Database Internals》与 23 站 UI 审美库，打通 14 岗全栈图谱、报错解码与高信噪比视觉喂料。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="font-mono text-amber-400 mb-1.5">M5 &amp; M6 · 质量与安全门禁</div>
              <div className="font-bold text-white mb-1.5">《Sonar 7 Habits · IASalut》</div>
              <p className="text-slate-300 leading-relaxed">
                配《LLM-as-a-Judge》与《Sleeper Agents》，落地零死代码、防测试作弊、5 层测试与 Bugbot 审计。
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-[#0b0f19] border border-white/15 flex items-center justify-between text-xs text-slate-300">
            <span>
              向上返回 <strong className="text-white">Lab 05 知识库工作台</strong>，点击「架构设计」「算法原理」「工程实践」等自动标签即可秒级过滤并导出新章节或 <code className="text-gemini-cyan">.mdc</code> 规则。
            </span>
            <span className="font-mono text-gemini-cyan shrink-0 tabular-nums">{bookCount} 册全部收录</span>
          </div>
        </div>
      </Slide>
    </section>
  );
}
