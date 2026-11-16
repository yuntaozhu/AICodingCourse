import Slide from "@/components/Slide";

export default function P12c() {
  return (
    <Slide backgroundColor="#020205" notes="在某大型金融项目中，我们需要将 100 多个文件从 JS 迁移到 TS。RAG 无法处理这种跨文件的类型推断，因为类型定义往往分散在各个文件中。而通过全量上下文，AI 能够一次性分析所有文件，推断出准确的接口定义，并自动完成所有文件的重构，且保持类型一致性。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white italic">案例：全量上下文下的复杂重构</h2>
        <div className="flex gap-12">
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">项目背景：100+ 文件 JS 转 TS</h3>
              <ul className="text-sm space-y-3 opacity-70">
                <li>• <strong className="text-white">挑战：</strong> 跨文件的类型依赖、复杂的 Redux 状态树。</li>
                <li>• <strong className="text-white">RAG 表现：</strong> 只能处理单个文件，类型推断错误率高达 60%。</li>
                <li>• <strong className="text-white">全量上下文表现：</strong> 一次性装载 120 个文件，错误率降至 5%。</li>
              </ul>
            </div>
            <div className="p-6 bg-gemini-purple/20 rounded-2xl border border-gemini-purple/40">
              <h3 className="text-xl font-bold mb-4 text-gemini-cyan">重构工作流</h3>
              <div className="flex justify-between items-center text-center text-xs">
                <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-2xl mb-1">🔍</div>
                  <div>全局扫描</div>
                </div>
                <div className="text-gemini-cyan">→</div>
                <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-2xl mb-1">🧠</div>
                  <div>类型推断</div>
                </div>
                <div className="text-gemini-cyan">→</div>
                <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10 mx-1">
                  <div className="text-2xl mb-1">🛠️</div>
                  <div>批量重构</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="text-8xl font-bold text-gemini-cyan mb-4">95%</div>
            <div className="text-xl opacity-50 uppercase tracking-widest">Automation Rate</div>
            <p className="mt-8 text-sm opacity-60 italic text-center">“全量上下文让 AI 具备了真正的架构级重构能力。”</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
