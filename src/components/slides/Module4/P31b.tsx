import Slide from "@/components/Slide";

export default function P31b() {
  return (
    <Slide backgroundColor="#020205" notes="在 Cursor 中，SDD 不是写完就积灰的 Word 文档，而是通过 Plan Mode 生成并沉淀在仓库中的可执行规格说明书。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
          SDD + AGENTS.md：独立产品的确定性蓝图
        </h2>
        <div className="grid grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-2 text-gemini-purple">
                Plan 模式产出结构化 SDD
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                在 Cursor 中通过 <code className="text-white">Shift+Tab</code> 进入 Plan 模式，先把需求翻译成数据模型、接口契约与文件改造路径，再一键交付 Agent 实施。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-mono text-gemini-cyan mb-1">01 · 目录骨架</div>
                <div className="text-slate-300">锁定模块边界与命名规范</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-mono text-gemini-purple mb-1">02 · 数据契约</div>
                <div className="text-slate-300">Schema 与 TS 类型共享</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-mono text-emerald-400 mb-1">03 · 权限红线</div>
                <div className="text-slate-300">鉴权、速率限制与密钥隔离</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-mono text-amber-400 mb-1">04 · DoD 命令</div>
                <div className="text-slate-300">可自动验证的构建测试门禁</div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/30 space-y-4">
            <h3 className="text-xl font-bold text-gemini-cyan">为什么产品经理更需要 SDD + AGENTS.md？</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">01</span>
                <span><strong className="text-white">消除口头歧义：</strong>把“做个会员页”变成明确的定价档位、支付回调与异常兜底清单。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">02</span>
                <span><strong className="text-white">跨对话不失忆：</strong>将核心约定写入根目录 <code className="text-gemini-cyan">AGENTS.md</code>，新开对话依然稳稳遵守。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="text-gemini-cyan font-mono">03</span>
                <span><strong className="text-white">跨工具通用：</strong><code className="text-white">AGENTS.md</code> 同时兼容 Cursor 与主流 CLI/云端 Agent，一次沉淀全链路复用。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
