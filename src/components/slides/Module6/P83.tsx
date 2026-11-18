import Slide from "@/components/Slide";

export default function P83() {
  return (
    <Slide backgroundColor="#020205" notes="Issue-to-PR 是 2026 年最令人兴奋的工作流。当你创建一个 Issue 时，AI 代理会自动分析需求，定位代码，生成修复或新功能，运行测试，并通过评估闭环，最后直接提交一个高质量的 PR。整个过程，人类只需要在最后点一下‘合并’。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-gemini-cyan italic">Issue-to-PR 工作流</h2>
        <div className="flex justify-between items-center bg-white/5 p-12 rounded-3xl border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center text-3xl border border-red-500/40">📝</div>
            <div className="text-sm font-mono">Issue Created</div>
          </div>
          <div className="text-gemini-purple/80 text-4xl">→</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gemini-purple/20 rounded-full flex items-center justify-center text-4xl border border-gemini-purple/40">🤖</div>
            <div className="text-sm font-mono text-gemini-purple">AI Agent</div>
          </div>
          <div className="text-gemini-purple/80 text-4xl">→</div>
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-gemini-cyan/20 rounded-2xl flex items-center justify-center text-3xl border border-gemini-cyan/40">🚀</div>
            <div className="text-sm font-mono text-gemini-cyan">PR Submitted</div>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm opacity-60">
          <div>需求分析与定位</div>
          <div>代码生成与验证</div>
          <div>评估闭环与提交</div>
        </div>
      </div>
    </Slide>
  );
}
