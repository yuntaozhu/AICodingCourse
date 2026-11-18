import Slide from "@/components/Slide";

export default function P33() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="解决模型知识截止时间（Cutoff）与库版本幻觉的核心方案：在 Cursor 中使用 @Web、@Docs 与 Context7 MCP 拉取实时官方文档。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            REAL-TIME CONTEXT · 消除过时 API 幻觉
          </div>
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white text-center">
            MCP + @Docs：<span className="text-gemini-cyan">让 Cursor 实时读取最新文档</span>
          </h2>
          <div className="grid grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col justify-center gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-cyan">为什么模型常写错 Tailwind v4 / Next 16？</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  前端与 AI SDK 迭代极快，模型训练权重停留在几个月前。直接开写往往会混用旧版配置文件、废弃钩子或不存在的 SDK 方法名。
                </p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-base mb-1.5 font-bold text-gemini-purple">Context7 MCP + @Docs + @Web 三连击</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  通过 <strong className="text-white">Context7 MCP</strong> 按版本号实时拉取最新版库文档片段，结合 Cursor 内置 <code className="text-white">@Docs</code> 索引与 <code className="text-white">@Web</code> 搜索，让生成代码一次命中最新 API。
                </p>
              </div>
            </div>
            <div className="bg-[#0b0f19] border border-gemini-cyan/30 rounded-2xl p-5 flex flex-col justify-between font-mono text-xs text-slate-200">
              <div>
                <div className="text-gemini-cyan mb-2"># 实战：强锚定最新版文档再生成</div>
                <pre className="whitespace-pre-wrap leading-relaxed">{`# Use Context7 MCP + @package.json
我要升级 @google/genai 到最新版本并接入服务端代理：

1. 先调用 Context7 查询 @google/genai 最新 TypeScript SDK 写法
2. 禁止使用已废弃的旧包名 @google/generative-ai
3. 按最新官方文档生成 server.ts 路由与错误处理`}</pre>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 text-right">
                ↓ 向下查看公共文档锚定与私有业务知识注入
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: @Web & Context7 */}
      <Slide backgroundColor="#050814" notes="对比零散网页复制粘贴与 MCP 结构化文档拉取的效率差异。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">REAL-TIME SDK ANCHORING</div>
          <h3 className="text-3xl mb-6 font-bold text-white">外部文档注入的三种标准方式</h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">@Docs 自定义索引</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                在 Cursor Settings 添加常用框架文档 URL（如 Supabase、Stripe、Tailwind），输入 <code className="text-white">@Docs</code> 即可秒级引用最新接口签名。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">Context7 MCP</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                开源高人气 MCP 服务，自动按 <code className="text-white">package.json</code> 中的精准版本号获取对应 API 代码示例，大幅消除版本错配。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">@Web 实时排错</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                遇到全新工具报错或 Vercel/Cloudflare 最新变更时，在对话框输入 <code className="text-white">@Web</code> 检索最新 Issue 解决方案。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Private Repo Knowledge */}
      <Slide backgroundColor="#050814" notes="如何让 Cursor 读懂你的业务私有规范与历史决策。">
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">PRIVATE KNOWLEDGE ANCHORING</div>
          <h3 className="text-3xl mb-6 font-bold text-white">私有业务知识：让团队经验沉淀进仓库</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-gemini-cyan">docs/specs 与 ADR 决策记录</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                把历史踩坑、数据表设计意图与合规要求写成仓库内的 Markdown 文档，用 <code className="text-white">@docs/specs</code> 引用或写入 <code className="text-white">AGENTS.md</code>，新开对话也能一秒继承全部背景。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold mb-2 text-gemini-purple">Obsidian / 私有 MCP 串联</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                独立开发者还可以将 Notion、Linear、GitHub Issues 通过 MCP 接入 Cursor，无需手动复制需求文档即可直接排期与编码。
              </p>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
