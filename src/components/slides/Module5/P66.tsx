import Slide from "@/components/Slide";

export default function P66() {
  return (
    <Slide backgroundColor="#020205" notes="欢迎来到第五模块。在 AI Native 时代，最危险的行为就是继续用人力去‘验收’ AI 的产出。如果你在给 AI 当 QA，你就是在用最昂贵的人力去填补最廉价的算力缺口。我们要构建的是一个自动化的、确定性的评估闭环。">
      <div className="flex flex-col justify-center h-full">
        <div className="text-gemini-purple text-sm font-mono mb-4 tracking-widest uppercase opacity-70">Module 5</div>
        <h1 className="text-7xl mb-6 leading-tight font-bold">评估闭环：<br /><span className="text-gemini-cyan">拒绝给 AI 当 QA</span></h1>
        <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
        <p className="text-2xl opacity-80 max-w-2xl">
          从“人工抽检”到“确定性架构”：构建 AI Native 的质量护城河。
        </p>
      </div>
    </Slide>
  );
}
