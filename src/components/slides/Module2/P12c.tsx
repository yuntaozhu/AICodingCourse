import Slide from "@/components/Slide";

export default function P12c() {
  return (
    <section>
      <Slide backgroundColor="#020205" notes="在某大型金融项目中，我们需要将 100 多个文件从 JS 迁移到 TS。RAG 无法处理这种跨文件的类型推断，因为类型定义往往分散在各个文件中。而通过全量上下文，AI 能够一次性分析所有文件，推断出准确的接口定义，并自动完成所有文件的重构，且保持类型一致性。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-bold text-white">案例：全量上下文下的复杂重构</h2>
          <div className="grid grid-cols-12 gap-8 items-center">
            <div className="col-span-7 space-y-5">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold mb-3 text-gemini-cyan">项目背景：100+ 文件 JS 转 TS</h3>
                <ul className="text-xs space-y-2 text-slate-300">
                  <li>· <strong className="text-white">挑战：</strong>跨文件的类型依赖、复杂的状态树与共享接口</li>
                  <li>· <strong className="text-white">传统 RAG 表现：</strong>只能看碎片片段，跨文件类型推断容易遗漏调用方</li>
                  <li>· <strong className="text-white">Cursor @Files + Plan：</strong>先读全量类型源头再分批实施，大幅降低编译返工</li>
                </ul>
              </div>
              <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35">
                <h3 className="text-base font-bold mb-3 text-gemini-purple">重构工作流</h3>
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-slate-200">
                    01 · 全局扫描
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-gemini-cyan">
                    02 · 契约推断
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-emerald-400">
                    03 · 批量重构 + tsc
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-5 flex flex-col justify-center items-center p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="text-6xl font-bold font-mono tabular-nums text-gemini-cyan mb-3">95%</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Automation Rate</div>
              <p className="mt-5 text-xs text-slate-300 text-center leading-relaxed">
                “全量上下文让 Cursor 具备跨文件架构级重构能力。”
              </p>
            </div>
          </div>
          <div className="mt-6 p-3.5 bg-white/5 rounded-xl border border-white/10 text-right text-xs font-mono text-gemini-cyan">
            ↓ 向下查看 arXiv:2603.05344 对上下文膨胀与 5 阶压缩的实证数据
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: arXiv:2603.05344 Context Pressure Empirical Evidence */}
      <Slide
        backgroundColor="#040711"
        notes="结合 arXiv:2603.05344 (OPENDEV) 数据，说明全量上下文不等于无脑把命令输出与全部 MCP Schema 塞进会话；按预算裁剪工具输出可降峰 54%。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            ARXIV:2603.05344 EMPIRICAL INSIGHT · 上下文预算控制
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            OPENDEV 实证：为什么「工具噪音治理」决定重构成功率？
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold font-mono tabular-nums text-amber-400 mb-2">70–80%</div>
              <div className="text-sm font-bold text-white mb-1.5">工具输出吞噬主预算</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                在长程编码会话中，占满窗口的不是对话，而是冗长 <code className="text-white">read_file</code> 与终端全量报错日志。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold font-mono tabular-nums text-gemini-cyan mb-2">40% ➔ &lt;5%</div>
              <div className="text-sm font-bold text-white mb-1.5">Lazy MCP 惰性按需加载</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                开局挂载全量 MCP Tool Schema 会白白消耗 40% 首轮预算；仅加载索引摘要、按需展开可压低至 5% 以内。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400 mb-2">-54%</div>
              <div className="text-sm font-bold text-white mb-1.5">5 阶 ACC 自适应压缩</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                通过 70/80/85/90/99% 分级掩码、快速剪枝与 Artifact Index 归档，避免 30 轮后“指令遗忘”和失忆重写。（可在 Lab 06 亲自推演）
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
