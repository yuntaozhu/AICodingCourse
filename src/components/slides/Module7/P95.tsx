import Slide from "@/components/Slide";

export default function P95() {
  return (
    <Slide backgroundColor="#020205" notes="开发者的角色正在发生深刻的演进。从‘代码编写者’到‘意图架构师’，再到‘评估闭环的构建者’。在 2026 年，最顶级的开发者不是写代码最快的，而是最擅长定义意图、构建机制和管理 AI 代理的人。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-5xl mb-12 font-bold text-white">开发者角色的演进</h2>
        <div className="flex justify-between items-stretch gap-8">
          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-white/10 opacity-40">
            <div className="text-sm font-mono mb-4">2020</div>
            <h3 className="text-2xl font-bold mb-4">代码编写者</h3>
            <p className="text-sm">关注语法、框架、算法实现。</p>
          </div>
          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-white/10 opacity-70">
            <div className="text-sm font-mono mb-4">2023</div>
            <h3 className="text-2xl font-bold mb-4">Copilot 使用者</h3>
            <p className="text-sm">利用 AI 辅助编写代码，提升效率。</p>
          </div>
          <div className="flex-1 p-8 bg-gemini-purple/20 rounded-2xl border border-gemini-purple/40">
            <div className="text-sm font-mono mb-4 text-gemini-cyan">2026</div>
            <h3 className="text-2xl font-bold mb-4 text-gemini-cyan">意图架构师</h3>
            <p className="text-sm">定义意图、构建机制、管理 AI 代理。</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xl font-bold text-gemini-cyan italic">“不要害怕被 AI 取代，要害怕被‘会用 AI 的人’取代。”</p>
        </div>
      </div>
    </Slide>
  );
}
