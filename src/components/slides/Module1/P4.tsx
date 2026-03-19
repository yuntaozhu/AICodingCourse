import Slide from "@/components/Slide";

export default function P4() {
  return (
    <Slide notes="Gemini 3.1 的 2M+ 上下文窗口彻底改变了游戏规则。RAG 只是权宜之计，全量上下文才是终极答案。">
      <h2 className="text-6xl mb-8">Gemini 3.1: 架构意志的载体</h2>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 bg-gemini-purple/20 rounded-lg border border-gemini-purple/50">
            <h3 className="text-2xl mb-2">2M+ Context Window</h3>
            <p className="text-sm opacity-80">全量代码库直接注入，无需复杂 RAG。</p>
          </div>
          <div className="p-4 bg-gemini-cyan/20 rounded-lg border border-gemini-cyan/50">
            <h3 className="text-2xl mb-2">Multi-modal Reasoning</h3>
            <p className="text-sm opacity-80">理解 UI 设计稿、架构图、甚至视频演示。</p>
          </div>
          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <h3 className="text-2xl mb-2">Spec-Driven Logic</h3>
            <p className="text-sm opacity-80">严格遵循逻辑约束，生成确定性代码。</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-gemini-purple to-gemini-cyan animate-pulse flex items-center justify-center">
            <span className="text-4xl font-black">2,000,000+</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
