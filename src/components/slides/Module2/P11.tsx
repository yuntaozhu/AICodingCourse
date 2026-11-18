import Slide from "@/components/Slide";

export default function P11() {
  return (
    <Slide backgroundColor="#050510" notes="Module 2: 在 Cursor 中高效管理全量代码库上下文——@Codebase 索引、精准 @ 引用、.cursorignore 降噪与 AGENTS.md 分层记忆。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-gemini-cyan text-xs font-mono uppercase tracking-widest mb-3">Module 2</div>
        <h1 className="text-5xl md:text-6xl mb-4 leading-none text-white font-bold">
          全量代码库理解与<span className="text-gemini-purple">上下文工程</span>
        </h1>
        <p className="text-lg font-mono text-gemini-purple/90 mb-6">
          Cursor @Codebase 语义索引 · @Files/@Git 精准锚定 · .cursorignore 降噪 · AGENTS.md
        </p>
        <div className="h-1 w-24 bg-gemini-purple mb-6" />
        <p className="text-sm text-slate-300 max-w-2xl">
          给 AI 塞入 10 万行噪音只会稀释注意力；真正的高手懂得用 Cursor 分层上下文机制，让模型在最低 Token 成本下获得 100% 关键约束。
        </p>
      </div>
    </Slide>
  );
}
