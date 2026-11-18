import Slide from "@/components/Slide";

export default function P98() {
  return (
    <Slide
      backgroundColor="#020205"
      notes="提问与交流环节：欢迎围绕 Cursor 工程化实践、easy-vibe 融合方法论或个人独立产品落地细节展开讨论。"
    >
      <div className="flex flex-col justify-center items-center h-full text-center max-w-5xl mx-auto">
        <div className="text-xs font-mono text-gemini-purple uppercase tracking-widest mb-3">
          Discussion &amp; Live Workshop
        </div>
        <h2 className="text-5xl md:text-6xl mb-6 font-bold text-gemini-cyan">
          Q &amp; A 实战答疑
        </h2>
        <div className="h-1 w-28 bg-gemini-purple mb-6" />
        <p className="text-lg text-slate-300 max-w-2xl mb-10">
          带上一句你的产品创意或正在卡壳的报错截图，现场拆解 Plan 蓝图与 .mdc 护栏。
        </p>
        <div className="grid grid-cols-3 gap-6 w-full max-w-3xl text-left">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-gemini-cyan mb-1">01 · 产品立项</div>
            <div className="text-sm font-bold text-white">如何切出可验证最小 MVP？</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-gemini-purple mb-1">02 · 工程卡点</div>
            <div className="text-sm font-bold text-white">为何 Agent 总是改坏旧功能？</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs font-mono text-emerald-400 mb-1">03 · 上线收费</div>
            <div className="text-sm font-bold text-white">AI Studio 原型如何平稳迁入全栈？</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
