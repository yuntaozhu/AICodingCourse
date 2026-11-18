import Slide from "@/components/Slide";

export default function P21() {
  return (
    <Slide backgroundColor="#100505" notes="Module 3: 面向独立开发者与产品经理的 Cursor 研发实战——Tab 预测编辑、Cmd+K 精准微调、性能手术、PBT 属性测试与全栈上线。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <div className="text-gemini-cyan text-xs font-mono uppercase tracking-widest mb-3">Module 3</div>
        <h1 className="text-5xl md:text-6xl mb-4 leading-none text-white font-bold">
          Cursor 实战工坊：<span className="text-gemini-purple">0-to-1 全栈演练</span>
        </h1>
        <p className="text-lg font-mono text-gemini-purple/90 mb-6">
          Cursor Tab 预测连击 · Cmd+K 行内手术 · 多模态 UI 还原 · PBT 与边界测试自动生成
        </p>
        <div className="h-1 w-24 bg-gemini-purple mb-6" />
        <div className="grid grid-cols-3 gap-4 max-w-4xl text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-gemini-cyan mb-1">Tab 预测编辑</div>
            <div className="text-slate-300">多行重构与跨行跳转自动预测，按 Tab 连击完成重复适配</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-gemini-purple mb-1">Cmd+K 精准手术</div>
            <div className="text-slate-300">选中特定函数或组件局部修改，不惊动周围已有逻辑</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="font-mono text-emerald-400 mb-1">Agent 闭环测试</div>
            <div className="text-slate-300">自动生成边界用例与 PBT 属性测试，跑通终端绿灯</div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
