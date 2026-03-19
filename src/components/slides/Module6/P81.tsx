import Slide from "@/components/Slide";

export default function P81() {
  return (
    <Slide backgroundColor="#020205" notes="欢迎来到第六模块。如果说第五模块是关于‘评估’，那么第六模块就是关于‘执行’。我们要将评估闭环集成到 CI/CD 流水线中，构建一个从 Issue 提出到 PR 提交完全自动化的流水线。这是研发效能的终极飞跃。">
      <div className="flex flex-col justify-center h-full">
        <div className="text-gemini-purple text-sm font-mono mb-4 tracking-widest uppercase opacity-70">Module 6</div>
        <h1 className="text-7xl mb-6 leading-tight font-bold">CI/CD 革命：<br /><span className="text-gemini-cyan italic">Issue-to-PR 零干预流水线</span></h1>
        <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
        <p className="text-2xl opacity-80 max-w-2xl">
          从“手动集成”到“自主进化”：构建 AI Native 的全自动研发工厂。
        </p>
      </div>
    </Slide>
  );
}
