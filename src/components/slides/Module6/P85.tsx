import Slide from "@/components/Slide";

export default function P85() {
  return (
    <Slide backgroundColor="#020205" notes="在 Cursor 中，代码评审不再只是等人类同事抽空看 PR。Bugbot 在每次提交后对照仓库规则自动给出漏洞与性能隐患注释，并支持一键拉回 Cursor 修复。">
      <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
        <h2 className="text-4xl mb-8 font-bold text-gemini-cyan">
          Bugbot 驱动的 PR 自动审查（Code Review）
        </h2>
        <div className="bg-[#0b0f19] p-7 rounded-2xl border border-white/10 space-y-5">
          <div className="flex flex-wrap gap-6 items-center text-xs font-mono pb-4 border-b border-white/10">
            <div className="px-3 py-1 bg-gemini-purple/20 text-gemini-purple rounded-lg">PR #128</div>
            <div className="text-slate-300">Branch: feat/stripe-webhook</div>
            <div className="text-slate-400">Reviewer: Cursor Bugbot · Rules Aligned</div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
              <div className="font-bold text-red-400 text-sm mb-1">
                [Critical · Security] SQL 字符串拼接 &amp; 缺少 Webhook 签名校验
              </div>
              <p className="text-xs text-slate-300">
                违背 <code className="text-white">20-api-security.mdc</code>：第 45 行直接拼接用户输入构造 SQL，请改为参数化查询并启用签名验证。
              </p>
            </div>
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div className="font-bold text-amber-300 text-sm mb-1">
                [Warning · Performance] 循环内 N+1 阻塞查询
              </div>
              <p className="text-xs text-slate-300">
                在用户数组遍历中逐条执行 <code className="text-white">db.execute</code>，建议合并为 <code className="text-white">LEFT JOIN</code> 或批量 <code className="text-white">IN</code> 查询。
              </p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <div className="font-bold text-emerald-400 text-sm mb-1">
                [Pass · Architecture] 共享类型与目录边界合规
              </div>
              <p className="text-xs text-slate-300">
                通过 <code className="text-white">00-project-dna.mdc</code> 核查，接口输入已定义 Zod Schema，无前端密钥泄露。
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>产品经理与独立开发者只需聚焦 Critical 项，点击 Fix in Cursor 秒级收敛。</span>
            <span className="font-mono text-gemini-cyan">→ 下一页实时体验 Bugbot 审查台</span>
          </div>
        </div>
      </div>
    </Slide>
  );
}
