import Slide from "@/components/Slide";

export default function Module8() {
  return (
    <section>
      {/* Main Slide */}
      <Slide
        backgroundColor="#040711"
        notes="第八模块聚焦 2026 最新 AI Coding 技术演进与课程升级计划，并规划如何将您在 Google AI Studio 创建的实战项目系统化地融入课程案例库。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
            Module 8 · 课程演进与案例体系
          </div>
          <h1 className="text-5xl md:text-6xl mb-4 leading-tight text-white font-bold">
            2026 课程更新计划 &amp;{" "}
            <span className="text-gemini-purple">AI Studio 实战案例库</span>
          </h1>
          <p className="text-lg font-mono text-gemini-cyan/80 mb-6 max-w-3xl">
            对齐 CLI / Cloud Agents · MCP &amp; Skills · Context Engineering · Eval-Driven 工程闭环
          </p>
          <div className="h-1 w-24 bg-gemini-purple mb-8"></div>
          <div className="grid grid-cols-3 gap-4 max-w-4xl">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-gemini-cyan mb-1">01 · 技术对齐</div>
              <div className="text-sm text-white/85 font-semibold">追踪 2026 Agentic Engineering 前沿</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-gemini-purple mb-1">02 · 结构重构</div>
              <div className="text-sm text-white/85 font-semibold">四阶段升级现有 M1–M7 课程模块</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xs font-mono text-emerald-400 mb-1">03 · 案例落地</div>
              <div className="text-sm text-white/85 font-semibold">AI Studio 真实项目拆解与复盘</div>
            </div>
          </div>
          <p className="mt-8 text-xs text-white/50">↓ 向下翻页查看完整更新计划与 AI Studio 案例设计</p>
        </div>
      </Slide>

      {/* Sub Slide 1: 2026 AI Coding Tech Radar */}
      <Slide
        backgroundColor="#050814"
        notes="梳理 2026 年 AI Coding 的四大核心技术突破：CLI/异步云端 Agent、Context Engineering（MCP/Skills/AGENTS.md）、SDD+Eval 确定性工程、以及从快速原型到生产全栈的闭环。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">01. 技术雷达更新</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            2026 AI Coding 四大核心演进方向
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm font-bold text-gemini-cyan mb-2">
                1. CLI Agent 与异步云端代理 (Background Agents)
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                从 IDE 对话框走向终端与云端沙盒自主执行（Gemini CLI、Claude Code、Codex / GitHub Coding Agent）。支持在独立分支中自主完成“读库 → 改码 → 跑测 → 修错 → 提交 PR”。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm font-bold text-gemini-purple mb-2">
                2. Context Engineering 2.0（MCP + Skills + AGENTS.md）
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                上下文工程标准化：用 <code className="text-gemini-cyan">AGENTS.md</code> 固化仓库约束，用 <code className="text-gemini-cyan">SKILL.md</code> 封装领域工作流，用 <code className="text-gemini-cyan">MCP</code> 连接数据库、设计稿与线上监控，结合 Context Caching 降低 80%+ 成本。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm font-bold text-emerald-400 mb-2">
                3. SDD + Eval-Driven + Trajectory 评测
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                不仅测最终输出代码，还对 Agent 的工具调用轨迹（Trajectory）、回归率、Token 成本与安全边界建立自动化 Eval 套件，配合浏览器端到端自验证（Playwright / Computer Use）。
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-sm font-bold text-amber-400 mb-2">
                4. Vibe-to-Production：原型直达全栈生产
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                借助 AI Studio 等快速构建平台，单人即可在分钟级生成具备真实 API、数据库与认证体系的原型；课程重点转向“如何把快速原型工程化为可维护、可测试的生产系统”。
              </p>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Module-by-Module Update Plan */}
      <Slide
        backgroundColor="#040711"
        notes="面向现有 Module 1 至 Module 7 的分阶段更新路线图：去重整合、工具升级、评测深化与实战案例嵌入。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">02. 课程升级路线图</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            现有课程（M1–M7）四阶段更新计划
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gemini-cyan">阶段一 · 基础概念精简与对齐</span>
                <span className="text-xs font-mono text-white/50 tabular-nums">M1 - M2</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/75">
                <li>• 清理 M1 与早期冗余页面，强化“Context Engineering”主线</li>
                <li>• M2 升级：从纯 Repomix 扩展到 Context Caching + 代码图谱 + AGENTS.md 编写规范</li>
                <li>• 新增“何时用全量上下文 vs 何时用精确索引/Grep 工具”决策矩阵</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gemini-purple">阶段二 · Agent 工具链与 MCP 实战</span>
                <span className="text-xs font-mono text-white/50 tabular-nums">M3 - M4</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/75">
                <li>• M3 实战新增：CLI Agent 日常开发流、多模态设计稿还原与浏览器视觉自检</li>
                <li>• M4 升级：加入 MCP Server 实战（连接 GitHub/DB/Figma）与 SKILL.md 技能沉淀</li>
                <li>• 新增沙盒权限控制（Least Privilege）与防 Prompt Injection 工程实践</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-emerald-400">阶段三 · Eval 体系与异步流水线</span>
                <span className="text-xs font-mono text-white/50 tabular-nums">M5 - M6</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/75">
                <li>• M5 深化：加入 Agent 行为轨迹评测（Trajectory Eval）与回归数据集版本化</li>
                <li>• M6 升级：演示“Issue → 异步云端 Agent → 自动化 E2E → 人类 2 分钟 Review”完整闭环</li>
                <li>• 更新旧版模型引用与示例代码，统一采用最新稳定工程实践</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-amber-400">阶段四 · 真实项目案例库与 ROI 度量</span>
                <span className="text-xs font-mono text-white/50 tabular-nums">M7 - M8</span>
              </div>
              <ul className="space-y-1.5 text-xs text-white/75">
                <li>• M7 新增 AI 研发效能真实度量指标：首轮通过率、人工返工率、Token/PR 成本</li>
                <li>• M8 打造“AI Studio 真实项目案例工坊”，每个核心方法论配 1 个真实可运行案例</li>
                <li>• 配套可下载的 SDD 模板、DoD 检查表与 AGENTS.md 脚手架</li>
              </ul>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 3: How to Turn AI Studio Projects into Course Case Studies */}
      <Slide
        backgroundColor="#050814"
        notes="将用户在 AI Studio 创建的项目转化为高教学价值的课程案例，建议遵循四维拆解框架：意图与 SDD、跨模态与 UI、全栈工程边界、以及踩坑与 DoD 沉淀。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">03. 案例设计方法论</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            AI Studio 项目转化为课程案例的 4 大拆解维度
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-cyan mb-2">维度 01</div>
                <h3 className="text-base font-bold text-white mb-2">从模糊想法到 SDD</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  展示最初的几句 Prompt 如何演化为明确的数据结构、页面路由与模块边界，对比“直接瞎写”与“先出 Spec”的返工差距。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gemini-cyan/80">
                对应课程：M1 P7 · M4 SDD
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-gemini-purple mb-2">维度 02</div>
                <h3 className="text-base font-bold text-white mb-2">UI 与交互工程化</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  拆解 AI Studio 生成的高保真前端界面：如何收敛字体排版、响应式布局、无障碍对比度以及组件复用结构。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gemini-purple/80">
                对应课程：M1 P6 · M3 跨模态
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-emerald-400 mb-2">维度 03</div>
                <h3 className="text-base font-bold text-white mb-2">全栈集成与安全线</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  解析项目如何接入真实后端、数据库（Firebase / Cloud SQL）、OAuth 鉴权与 API Key 服务端代理，跨过“Demo 玩具”门槛。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-400/80">
                对应课程：M3 实战 · M4 Security
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono text-amber-400 mb-2">维度 04</div>
                <h3 className="text-base font-bold text-white mb-2">踩坑复盘与 DoD</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  最珍贵的教学素材是“翻车现场”：样式覆盖、状态竞态、组件未挂载等真实 Bug 如何变成自动化 DoD 与自检规则。
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-amber-400/80">
                对应课程：M1 P8 · M5 评估闭环
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 4: Ready-to-Import AI Studio Case Slots */}
      <Slide
        backgroundColor="#040711"
        notes="预留的 AI Studio 真实项目案例接入位。收集用户的 AI Studio 项目清单后，可按此结构逐一扩写为可演示、可互动的专题教学页。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">04. 案例接入矩阵（待填充您的项目）</div>
          <h2 className="text-3xl font-bold text-white mb-6">
            AI Studio 项目案例规划槽位
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/15">
              <div className="text-xs font-mono text-gemini-cyan mb-1">案例槽位 A · 本课件项目本身（元案例）</div>
              <h3 className="text-lg font-bold text-white mb-2">AI Native Web 课件系统迭代实录</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                用真实发生的排版溢出修复、Reveal.js 垂直栈重构与样式级联排障，现场演示“问题定位 → 规则固化 → 编译与 Lint DoD 验证”全过程。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-gemini-cyan/40">
              <div className="text-xs font-mono text-gemini-cyan mb-1">案例槽位 B · 数据/可视化/交易分析类项目</div>
              <h3 className="text-lg font-bold text-white mb-2">复杂前端架构与多状态协同</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                适合讲授 M2 全量上下文重构与 M3 性能优化：展示 AI 如何一次性统筹多面板状态、图表渲染与类型安全。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-gemini-purple/40">
              <div className="text-xs font-mono text-gemini-purple mb-1">案例槽位 C · 全栈业务系统（含数据库 / Auth）</div>
              <h3 className="text-lg font-bold text-white mb-2">SDD 驱动的端到端应用落地</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                适合讲授 M4 SDD 与 Security Agent：如何先定 Schema 与权限规则，再让 AI 生成前后端与安全校验。
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-dashed border-emerald-400/40">
              <div className="text-xs font-mono text-emerald-400 mb-1">案例槽位 D · AI Agent / 多模态自动化工具</div>
              <h3 className="text-lg font-bold text-white mb-2">Prompt 评测与闭环自愈实战</h3>
              <p className="text-xs text-white/75 leading-relaxed">
                适合讲授 M5 Eval 与 M6 CI/CD：展示如何构建领域 Benchmark、对比提示词版本并接入自动验收。
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/25 text-xs text-white/85">
            下一步：只需将您的 AI Studio 项目名称、简介、核心亮点或仓库内容发给我，我将直接把它们编写进对应模块的实战案例页面。
          </div>
        </div>
      </Slide>
    </section>
  );
}
