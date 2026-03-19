import Slide from "@/components/Slide";

export default function P11() {
  return (
    <Slide backgroundColor="#050510" notes="Module 2: 全量代码库理解。这是 Gemini 3.1 的核心优势。">
      <div className="flex flex-col justify-center h-full">
        <h2 className="text-gemini-cyan text-sm uppercase tracking-widest mb-4">Module 2</h2>
        <h1 className="text-8xl mb-4 leading-none text-white">全量代码库理解</h1>
        <p className="text-2xl font-mono text-gemini-purple opacity-80 mb-8">2M+ Context Window: 彻底终结 RAG 时代</p>
        <div className="h-1 w-32 bg-gemini-purple mb-8"></div>
      </div>
    </Slide>
  );
}
