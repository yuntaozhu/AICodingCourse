import Slide from "@/components/Slide";

export default function P92() {
  return (
    <Slide backgroundColor="#020205" notes="在 AI 时代，传统的效能度量标准已经失效。代码行数（LOC）不仅无用，甚至有害。我们需要新的度量标准：意图转化率、自动修复率、以及从想法到上线的 MTTV（Mean Time To Value）。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-purple">效能度量新标准</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold mb-4 text-red-400">旧标准 (Deprecated)</h3>
            <ul className="space-y-3 opacity-50 text-sm">
              <li>• 代码行数 (Lines of Code)</li>
              <li>• 提交次数 (Commits)</li>
              <li>• 工时统计 (Man-hours)</li>
              <li>• 单元测试覆盖率</li>
            </ul>
          </div>
          <div className="p-6 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30">
            <h3 className="text-xl font-bold mb-4 text-gemini-cyan">新标准 (AI Native)</h3>
            <ul className="space-y-3 text-sm">
              <li>• <strong className="text-white">意图转化率：</strong> 需求到代码的自动转化成功率。</li>
              <li>• <strong className="text-white">自动修复率：</strong> 无人干预下的 Bug 修复占比。</li>
              <li>• <strong className="text-white">MTTV：</strong> 从业务想法到价值交付的时间。</li>
              <li>• <strong className="text-white">架构对齐度：</strong> 代码符合架构规范的程度。</li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
