import Slide from "@/components/Slide";

export default function P1() {
  return (
    <Slide backgroundColor="#020205" notes="欢迎来到 2026 年。今天我们不谈代码补全，我们谈的是“架构意志”的全面托管。语法红利已经消失，如果你还在纠结于分号和括号，你已经被时代抛弃了。我们要定义的是“意图架构师”的新纪元。">
      <div className="flex flex-col justify-center h-full">
        <h1 className="text-8xl mb-4 leading-none">AI Coding<br /><span className="text-gemini-purple">研发范式革命</span></h1>
        <p className="text-2xl font-mono text-gemini-cyan opacity-80 mb-8">未来软件架构与开发的确定性演进路径</p>
        <div className="h-1 w-32 bg-gemini-cyan mb-8"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gemini-purple flex items-center justify-center font-bold">2026</div>
          <div>
            <p className="text-sm uppercase tracking-widest opacity-50">Presenter</p>
            <p className="text-xl font-bold italic">全球顶级研发效能架构师 & Gemini 3.1 首席布道师</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}
