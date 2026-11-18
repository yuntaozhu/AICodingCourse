import Slide from "@/components/Slide";

export default function P10() {
  return (
    <section>
      {/* Main Slide */}
      <Slide notes="AI Coding 工具从被动补全进化到 Cursor 原生代理工作流，彻底释放了独立开发者和产品经理的创造力。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-8 font-bold tracking-tight text-white">
            AI Coding 演进路径：从补全插件到 Cursor 研发工厂
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-slate-400 mb-2">STAGE 01 · 2021-2023</div>
              <h3 className="text-xl mb-2 font-bold text-white">行内代码补全时代</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                AI 只是被动的“幽灵文字补全器”。跨文件修改、终端排错、测试验证仍全部依赖人肉复制粘贴。
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">STAGE 02 · 2024-2025</div>
              <h3 className="text-xl mb-2 font-bold text-gemini-cyan">Tab 连击 + Composer 时代</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cursor Tab 预测下一处跳转编辑，Composer / Agent 开始协同改写多个文件，人机进入结对编程状态。
              </p>
            </div>
            <div className="p-6 bg-gemini-purple/15 rounded-2xl border border-gemini-purple/50">
              <div className="text-xs font-mono text-gemini-purple mb-2">STAGE 03 · 2026+</div>
              <h3 className="text-xl mb-2 font-bold text-white">确定性 Agent 研发工厂</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-white">Plan + .mdc 规则 + MCP + 异步后台代理 + Bugbot</strong> 形成闭环，独立产品经理也能主导全栈上线。
              </p>
            </div>
          </div>
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-right text-xs font-mono text-gemini-purple">
            ↓ 向下查看“写代码”到“交付产品”的思维切换
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Paradigm Comparison */}
      <Slide backgroundColor="#050505" notes="对比传统局部补全与 Cursor Agent 任务级交付的本质区别。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-[11px] font-mono text-gemini-purple mb-2">PARADIGM SHIFT</div>
          <h3 className="text-3xl mb-6 font-bold text-white">从“写几行代码”到“交付一个完整产品能力”</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-slate-400 uppercase mb-2">PASSIVE AUTOCOMPLETE</div>
              <p className="text-base text-slate-200 mb-3">
                “帮我写一个邮箱校验正则函数。”
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                结果：仅生成 10 行孤立片段，你仍需自己补全前端表单提示、后端二次校验、数据库索引与端到端测试。
              </p>
            </div>
            <div className="p-6 bg-gemini-purple/10 rounded-2xl border border-gemini-purple/35">
              <div className="text-xs font-mono text-gemini-purple uppercase mb-2">CURSOR DETERMINISTIC AGENT</div>
              <p className="text-base text-white mb-3">
                “Plan Mode：基于 @auth.ts 为注册流程增加邮箱验证码，遵循 @20-api-security.mdc，通过单测后汇报。”
              </p>
              <p className="text-xs text-slate-200 leading-relaxed">
                结果：Cursor 先出可审阅计划，随后同步更新前后端、校验逻辑并跑通终端验证，直接达到上线标准。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Grounded in Classic Books & Papers */}
      <Slide
        backgroundColor="#040711"
        notes="结合知识库中的 O'Reilly《Beyond Vibe Coding》、Chip Huyen《AI Engineering》与 OpenAI《Let's Verify Step by Step》，说明为什么结构化研发一定会战胜盲写。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            KNOWLEDGE BASE BACKING · 经典专著与论文理论支撑
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            为什么“Beyond Vibe Coding”成为 Cursor 时代的必然？
          </h3>
          <div className="grid grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-2">O&apos;REILLY · BEYOND VIBE CODING</div>
              <h4 className="text-base font-bold text-white mb-2">从 Coder 升级为 AI-Era Developer</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                早期 Vibe Coding 只解决 10 分钟出原型；进入维护期必须用系统边界、契约清单与自动化校验守住可演进性。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-2">CHIP HUYEN · AI ENGINEERING</div>
              <h4 className="text-base font-bold text-white mb-2">上下文与评估决定系统上限</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                与其盲目切换模型，不如把精力放在 <code className="text-white">@Files</code> 精准上下文构造、Prompt 结构化与可重复 Eval 门禁上。
              </p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-2">ARXIV:2305.20050 · PROCESS SUPERVISION</div>
              <h4 className="text-base font-bold text-white mb-2">《Let&apos;s Verify Step by Step》</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                过程监督显著优于只看最终结果！这正是 Cursor 强调「Plan 分步审核 ➔ 逐文件小步运行验证」的数学与实证依据。
              </p>
            </div>
          </div>
          <div className="mt-5 text-xs font-mono text-gemini-cyan text-right">
            ↓ 向下继续拆解《Beyond Vibe Coding》70% 困境与 arXiv:2410.02156 五步流
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: Addy Osmani Beyond Vibe Coding Deep Dive */}
      <Slide
        backgroundColor="#040711"
        notes="深入剖析 Addy Osmani《Beyond Vibe Coding》的三大核心警世模型：70% 困境（进一退二循环）、知识悖论，以及从 Bootstrapping 原型到 Iterating 生产的模式切换。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            ADDY OSMANI · BEYOND VIBE CODING（O&apos;REILLY）
          </div>
          <h3 className="text-3xl mb-5 font-bold text-white">
            警惕“70% 困境”与“知识悖论”：从代码搬运工升级为总编
          </h3>
          <div className="grid grid-cols-12 gap-4 text-xs">
            <div className="col-span-6 p-5 bg-[#0b0f19] rounded-2xl border border-amber-400/35 space-y-2.5">
              <div className="font-bold text-amber-300 text-sm">
                一、The 70% Problem（最后 30% 的进一退二魔咒）
              </div>
              <p className="text-slate-300 leading-relaxed">
                AI 能在几分钟内完成前 <strong className="text-white">70%</strong> 的脚手架、页面与快乐路径（Happy Path）；但剩下 <strong className="text-white">30%</strong> 的边缘异常处理、鉴权并发与模块集成，若盲目“再让 AI 修一下”，极易陷入<strong className="text-rose-300">修好 A 却改坏 B/C（Two Steps Back）</strong>的死循环。
              </p>
              <div className="pt-2 border-t border-white/10 text-slate-400">
                破局之道：用 Cursor Plan 切分小步、Git Checkpoint 及时止损，严防无边界连改。
              </div>
            </div>

            <div className="col-span-6 p-5 bg-[#0b0f19] rounded-2xl border border-gemini-cyan/35 space-y-2.5">
              <div className="font-bold text-gemini-cyan text-sm">
                二、The Knowledge Paradox（知识悖论）与双模式切换
              </div>
              <p className="text-slate-300 leading-relaxed">
                过度依赖无脑生成会跳过“理解为什么能跑”的认知形成；一旦在 70% 处撞墙，开发者因缺乏心智模型而彻底卡死。
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-mono text-emerald-400 mb-0.5">Bootstrapper（冷启动）</div>
                  <div className="text-slate-300">允许轻装 Vibe 快速验证点子是否成立，随时可抛弃重写。</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="font-mono text-gemini-purple mb-0.5">Iterator（总编迭代）</div>
                  <div className="text-slate-300">一旦上线收费，立刻切换 Context Engineering (CHOP) + Diff 审查。</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between gap-4">
            <span>
              <strong className="text-white">总编心法（Editor-in-Chief）：</strong>把 AI 当作高产但需严审的撰稿团队，你的职责是定选题、给参考料、控结构、做终审。
            </span>
            <span className="font-mono text-gemini-cyan shrink-0">↓ 向下看 arXiv:2410.02156 六助五步法</span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: arXiv:2410.02156 Why / What (6 Types) / How (5 Steps) */}
      <Slide
        backgroundColor="#050814"
        notes="吸纳论文 arXiv:2410.02156《The why, what, and how of AI-based coding in scientific research》：为非科班与跨领域开发者提供对抗知识悖论的 6 类辅助用途与 5 步严格验证流。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-emerald-400 mb-2">
            ARXIV:2410.02156 · THE WHY, WHAT &amp; HOW OF AI-BASED CODING
          </div>
          <h3 className="text-3xl mb-5 font-bold text-white">
            跨领域构建者的标准作业图：6 类 AI 编程辅助 × 5 步闭环流
          </h3>
          <div className="grid grid-cols-12 gap-5 text-xs">
            <div className="col-span-6 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="font-bold text-gemini-cyan text-sm">
                What：不只是“帮我写代码”——用好 AI 的 6 大职能
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["01. 代码生成", "自然语言转可运行原型脚本与组件"],
                  ["02. 跨语言翻译", "旧脚本（MATLAB/Python）迁移至 TS/生产栈"],
                  ["03. 解释与学习", "逐行拆解算法逻辑，反制「知识悖论」"],
                  ["04. 排错与诊断", "结合报错堆栈定位根因而非盲试"],
                  ["05. 重构与优化", "压缩性能瓶颈并整理结构模块化"],
                  ["06. 文档与注释", "自动补齐 README、接口说明与可复现指南"],
                ].map(([title, desc]) => (
                  <div key={title} className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                    <div className="font-semibold text-white mb-0.5">{title}</div>
                    <div className="text-slate-400 leading-snug">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-6 p-5 rounded-2xl bg-[#0b0f19] border border-emerald-400/35 flex flex-col justify-between gap-2">
              <div className="font-bold text-emerald-400 text-sm">
                How：防“静默逻辑错误（Silent Errors）”的 5 步迭代工作流
              </div>
              <div className="space-y-1.5">
                {[
                  "1. Project Preparation：开工前先写清目标、数据边界与运行约束",
                  "2. Initiating Session：在 Cursor 中明确技术栈、依赖版本与角色设定",
                  "3. Generating & Reviewing：小步生成并逐段逻辑核查，不整段盲信",
                  "4. Testing & Debugging：用基准测试集（Gold Data）拦截“不报错但算错”的静默错误",
                  "5. Refining & Documenting：提炼复杂逻辑并生成文档，确保长期可复现",
                ].map((step) => (
                  <div
                    key={step}
                    className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-slate-200"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
