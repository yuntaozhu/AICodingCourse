import Slide from "@/components/Slide";

export default function P80() {
  return (
    <Slide backgroundColor="#020205" notes="有了评估闭环，我们就可以放心地让 AI 进入我们的 CI/CD 流水线。下一模块，我们将探讨如何构建一个‘零人工干预’的 Issue-to-PR 流水线。准备好迎接 CI/CD 的革命了吗？">
      <div className="flex flex-col justify-center items-center h-full text-center">
        <div className="text-gemini-purple text-sm font-mono mb-4 tracking-widest uppercase opacity-70">Next Module</div>
        <h2 className="text-6xl mb-8 font-bold">CI/CD 革命：<br /><span className="text-gemini-cyan italic">Issue-to-PR 的零干预流水线</span></h2>
        <div className="h-1 w-32 bg-gemini-purple mb-12"></div>
        <div className="p-8 bg-white/5 rounded-full border border-white/10 animate-pulse">
          <p className="text-xl opacity-60">正在加载模块 6...</p>
        </div>
      </div>
    </Slide>
  );
}
