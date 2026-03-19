import Slide from "@/components/Slide";

export default function P91() {
  return (
    <Slide backgroundColor="#020205" notes="欢迎来到最后一个模块。我们要讨论的是 AI Native 的终局：ROI（投资回报率）与进化。在 2026 年，我们不再用传统的代码行数来衡量效能，而是用‘意图转化率’。同时，我们将探讨‘AI 架构大脑’如何成为企业的核心资产。">
      <div className="flex flex-col justify-center h-full">
        <div className="text-gemini-purple text-sm font-mono mb-4 tracking-widest uppercase opacity-70">Module 7</div>
        <h1 className="text-7xl mb-6 leading-tight font-bold">ROI 与进化：<br /><span className="text-gemini-cyan italic">效能度量与架构大脑</span></h1>
        <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
        <p className="text-2xl opacity-80 max-w-2xl">
          从“代码产出”到“意图价值”：定义 AI Native 时代的成功标准。
        </p>
      </div>
    </Slide>
  );
}
