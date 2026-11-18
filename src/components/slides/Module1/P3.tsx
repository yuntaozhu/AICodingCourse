import Slide from "@/components/Slide";

export default function P3() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="独立开发者与产品经理在 Cursor 时代最核心的三项能力：意图抽象、上下文治噪、以及建立 DoD 验收闭环。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold tracking-tight text-white">
            Cursor 时代的<span className="text-gemini-cyan">“超级单兵架构师”</span>
          </h2>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-cyan/40 transition-colors">
              <div className="text-xs font-mono text-gemini-cyan mb-2">01 · ABSTRACTION</div>
              <h3 className="text-xl font-bold mb-2 text-white">规格抽象能力</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                用 Cursor <strong className="text-white">Plan Mode</strong> 把模糊产品需求拆解为数据表、API 契约与页面状态清单，把试错留在写代码前。
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-gemini-purple/40 transition-colors">
              <div className="text-xs font-mono text-gemini-purple mb-2">02 · EVALUATION</div>
              <h3 className="text-xl font-bold mb-2 text-white">门禁验收能力</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                编写可执行的 <strong className="text-white">.cursor/rules</strong> 与 DoD 检查脚本，配合 <strong className="text-white">Bugbot</strong> 拦截安全漏洞与隐性回归。
              </p>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-colors">
              <div className="text-xs font-mono text-emerald-400 mb-2">03 · ORCHESTRATION</div>
              <h3 className="text-xl font-bold mb-2 text-white">Agent 编排能力</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                串联 <strong className="text-white">@ 上下文</strong>、Figma/DB <strong className="text-white">MCP</strong> 与 <strong className="text-white">Background Agents</strong>，让一个人高效运转出完整产品团队。
              </p>
            </div>
          </div>

          <div className="p-5 bg-gemini-cyan/5 rounded-2xl border border-gemini-cyan/25 flex items-center justify-between gap-4">
            <p className="text-lg italic font-light tracking-tight text-gemini-cyan">
              "Code is the <span className="font-bold">artifact</span>, Spec &amp; Rules are the <span className="font-bold">source</span>."
            </p>
            <span className="text-xs font-mono text-slate-400 shrink-0">
              ↓ 写代码前先用 Easy-Vibe 需求验证三板斧
            </span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Pre-Code Product Validation (inspired by datawhalechina/easy-vibe Stage 1) */}
      <Slide
        backgroundColor="#050814"
        notes="借鉴开源项目 datawhalechina/easy-vibe 第一阶段：在打开 Cursor Plan Mode 之前，产品经理和独立开发者必须先验证真需求，避免用 AI 高效写出没人要的产品。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            01. PRE-CODE DISCOVERY · EASY-VIBE 产品发现前置闭环
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            打开 Cursor 之前：用三套工具锁定真需求
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">DOUBLE DIAMOND · 双钻模型</div>
              <h4 className="text-base font-bold text-white mb-2">先发散痛点，再收敛 MVP</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                第一钻探索真实用户场景，第二钻只挑 1 个高频核心痛点砍掉 80% 枝叶。推荐先用「复刻喜爱应用 (Clone App)」快速出交互原型。
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                产出：1 页 PRD.md + 核心页面草图
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">JTBD · 待完成任务</div>
              <h4 className="text-base font-bold text-white mb-2">用户雇佣产品完成什么事？</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                别罗列“需要后台+导出+标签”，改写成：<strong className="text-white">“当[场景]发生时，我想[动作]，从而获得[结果]”</strong>，Cursor Plan 会据此设计出更简洁的状态流。
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                产出：3 条核心用户旅程 User Flow
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">THE MOM TEST · 需求访谈</div>
              <h4 className="text-base font-bold text-white mb-2">不问观点，只问过去事实</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                永远不问“你会用这个 AI 工具吗？”（礼貌谎言）。改问：“你上周处理这件事花了多久？现在用什么替代方案？为此付过多少钱？”
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-white/10">
                产出：真实付费/留存验证信号
              </div>
            </div>
          </div>
          <div className="mt-5 p-4 bg-[#0b0f19] rounded-xl border border-gemini-cyan/25 text-xs text-slate-300">
            <strong className="text-gemini-cyan">实战衔接：</strong>先在 Google AI Studio 或单文件 HTML 快速跑通上述 MVP 原型验证（Fast First Win），确认有人用后再导入 Cursor 工程化。
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Progressive Learning Map */}
      <Slide
        backgroundColor="#040711"
        notes="参考 easy-vibe 渐进式学习地图：不同背景的学员可按三条路线循序渐进掌握 Cursor 与独立产品上线。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            02. LEARNING MAP · 独立开发者与产品经理学习路径
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            三阶渐进地图：从第一个可用 Demo 到全栈收费上线
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-2">STAGE 1 · 产品原型与排障直觉</div>
                <h4 className="text-lg font-bold text-white mb-2">30 分钟做出可演示 MVP</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>· 痛点发现 + PRD.md 清晰表达</li>
                  <li>· 截图 / 报错信息喂给 Cursor 排错</li>
                  <li>· AI Studio 原型快速验证核心交互</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gemini-cyan">
                对应模块：M1 · M2 · M5
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-purple mb-2">STAGE 2 · 全栈工程、支付与部署</div>
                <h4 className="text-lg font-bold text-white mb-2">打造可收费的线上产品</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>· Figma MCP / UI 组件库高保真还原</li>
                  <li>· Supabase Auth/DB + OpenAPI 契约</li>
                  <li>· Stripe Webhook 收费 + Vercel 上线</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-gemini-purple">
                对应模块：M3 · M4 · Lab 01–03
              </div>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-400 mb-2">STAGE 3 · 长时自治与团队治理</div>
                <h4 className="text-lg font-bold text-white mb-2">把一个人变成自动化产线</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>· .cursor/rules (.mdc) &amp; SKILL.md 复用</li>
                  <li>· Long-Running 清单护栏与 Git 回滚</li>
                  <li>· Background Agent + Bugbot 自动审查</li>
                </ul>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-emerald-400">
                对应模块：M6–M10 · Lab 04–10
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
