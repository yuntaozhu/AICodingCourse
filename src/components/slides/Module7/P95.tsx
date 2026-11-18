import Slide from "@/components/Slide";

export default function P95() {
  return (
    <Slide backgroundColor="#020205" notes="从手写代码者、补全使用者，到 Cursor 时代的“全栈产品架构师”——核心竞争力在于定义 Spec、编写 Rules 与验收质量门禁。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-white">产品人与开发者的角色演进</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs font-mono text-slate-400 mb-3 tabular-nums">2020 · 手写实现时代</div>
            <h3 className="text-xl font-bold mb-2 text-slate-300">语法与切图执行者</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              大量时间耗在环境配置、样式对齐、手写 CRUD 与重复样板代码上。
            </p>
          </div>
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-xs font-mono text-gemini-cyan mb-3 tabular-nums">2024 · Tab 辅助时代</div>
            <h3 className="text-xl font-bold mb-2 text-white">Tab 加速编码者</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              利用行内补全与局部对话提速 30%，但架构把关、测试与调试仍靠人工串联。
            </p>
          </div>
          <div className="p-6 bg-gemini-purple/15 rounded-2xl border border-gemini-purple/45">
            <div className="text-xs font-mono text-gemini-cyan mb-3 tabular-nums">2026+ · Cursor 意图架构师</div>
            <h3 className="text-xl font-bold mb-2 text-gemini-cyan">一人全栈产品指挥官</h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              精通 Plan 拆解、.cursor/rules 治理、MCP 生态联调与 Bugbot 门禁，直接从想法交付完整商业产品。
            </p>
          </div>
        </div>
        <div className="mt-8 text-center space-y-2">
          <p className="text-lg font-bold text-gemini-cyan italic">
            “核心护城河不是背诵语法，而是用五大软件工程基本功驾驶 AI 在七维权衡中做出正确取舍。”
          </p>
          <p className="text-xs font-mono text-slate-400">
            复盘基础心法：全栈构建 · 数据与 Agent 基建 · 动态演进架构 · 安全左移韧性 · 生产扩展运维（见 M1 · P2b）
          </p>
        </div>
      </div>
    </Slide>
  );
}
