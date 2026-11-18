import Slide from "@/components/Slide";

export default function P92() {
  return (
    <Slide backgroundColor="#020205" notes="对于独立开发者与产品经理，代码行数毫无意义；真正重要的指标是：从创意到可上线产品的时间（MTTV）、首次生成通过率以及返工耗时。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-purple">
          效能度量新标准：从代码量到“上线确定性”
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-lg font-bold mb-4 text-red-400">旧指标与盲目 Vibe Coding 陷阱</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li>• 日均生成代码行数（写得多 ≠ 跑得通）</li>
              <li>• “一分钟生成 10 个页面”但不敢改第二版</li>
              <li>• 缺乏 DoD 门禁导致的反复返工调试工时</li>
              <li>• 无规则约束造成的多端兼容与安全漏洞</li>
            </ul>
          </div>
          <div className="p-6 bg-gemini-cyan/10 rounded-2xl border border-gemini-cyan/30">
            <h3 className="text-lg font-bold mb-4 text-gemini-cyan">Cursor 工程化度量新标准</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li>• <strong className="text-white">首轮一次通过率：</strong>Plan 审批后 Agent 一次编译通过的比例。</li>
              <li>• <strong className="text-white">终端自愈率：</strong>Agent 读取 lint/tsc 报错自行修通无需人介入的比例。</li>
              <li>• <strong className="text-white">Bugbot 拦截密度：</strong>上线前自动发现的权限与 N+1 隐患数量。</li>
              <li>• <strong className="text-white">MTTV（想法到上线）：</strong>MVP 从写 Spec 到浏览器可访问的周期。</li>
            </ul>
          </div>
        </div>
      </div>
    </Slide>
  );
}
