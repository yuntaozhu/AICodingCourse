import Slide from "@/components/Slide";
import CursorRulesSandbox from "@/components/sandboxes/CursorRulesSandbox";

export default function P31c() {
  return (
    <section>
      {/* Main Slide: .cursor/rules (.mdc) & AGENTS.md Governance */}
      <Slide backgroundColor="#020205" notes="介绍 Cursor .cursor/rules/*.mdc 的三种触发机制（alwaysApply、globs 按路径匹配、description 智能触发）与 AGENTS.md 协作规范。">
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <h2 className="text-4xl mb-6 font-bold text-white">
            上下文治理：<span className="text-gemini-cyan">.cursor/rules (.mdc)</span> &amp; AGENTS.md
          </h2>
          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35">
              <div className="text-[11px] font-mono text-gemini-cyan mb-2">
                .cursor/rules/10-ui-tailwind.mdc
              </div>
              <pre className="text-xs font-mono text-slate-200 bg-black/50 p-4 rounded-xl border border-white/10 whitespace-pre-wrap leading-relaxed">{`---
description: UI component & Tailwind layout rules
globs: src/components/**/*.tsx
alwaysApply: false
---

# UI Rules
- Use Tailwind CSS utilities; avoid inline styles.
- Ensure Loading / Empty / Error UI states.
- Check 375px mobile & 1280px desktop fit.`}</pre>
              <div className="mt-3 text-right text-[11px] font-mono text-gemini-purple">
                ↓ 向下进入交互式 Rules 演练沙盘
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gemini-cyan mb-1">策略 1 · alwaysApply: true</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  仅用于全局技术栈与绝对红线（如 TypeScript 严格模式、目录约定），保持简短精炼（&lt; 40 行）。
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gemini-purple mb-1">策略 2 · globs 路径精确匹配</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  只有当你正在修改 <code className="text-white">server/**/*.ts</code> 时才注入后端安全规则，写前端时零干扰、零 Token 浪费。
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-emerald-400 mb-1">策略 3 · AGENTS.md 跨工具基线</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  根目录 <code className="text-white">AGENTS.md</code> 记录构建测试命令与仓库地图，Cursor 与 CLI Agent 均可直接读取。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Interactive Sub Slide: CursorRulesSandbox */}
      <Slide backgroundColor="#040711" notes="交互实验：切换不同产品模板与模拟编辑文件，观察 globs 与 alwaysApply 如何实时命中对应 .mdc 规则。">
        <div className="flex flex-col justify-center h-full">
          <CursorRulesSandbox />
        </div>
      </Slide>

      {/* Sub Slide 2: Template Bootstrap & Self-Improving Meta-Rules (jpke/cursor-vibe-coding-template) */}
      <Slide
        backgroundColor="#050814"
        notes="吸纳 jpke/cursor-vibe-coding-template 开源工程模板规范：一句指令完成项目冷启动初始化、隔离模板与业务环境变量，并通过 self_improve.mdc 与 rule_management.mdc 实现规则自迭代。"
      >
        <div className="flex flex-col justify-center h-full max-w-6xl mx-auto">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            TEMPLATE BOOTSTRAP &amp; SELF-IMPROVING .MDC META-RULES
          </div>
          <h3 className="text-3xl mb-6 font-bold text-white">
            工程化冷启动：<span className="text-gemini-cyan">一句话初始化模板</span> × 自我进化规则底座
          </h3>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-white/10 space-y-3">
              <div className="font-mono text-gemini-cyan">
                01 · template_setup.mdc：Agent 驱动零手工冷启动
              </div>
              <p className="text-slate-300 leading-relaxed">
                克隆开源 Cursor Vibe 模板后，无需手动改十几个配置文件；只需向 Agent 下达一句触发语，即由 <code className="text-white">repository_initialization.mdc</code> 自动串联完成：
              </p>
              <pre className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">{`Prompt: "initialize this project as my-saas-mvp"
1. 复制 .cursor/.mcp.json.example -> .cursor/.mcp.json
2. 替换 README 占位元信息，启用 gh api main 分支保护
3. 严格隔离：模板 .env.example (AI CLI Keys) vs 应用运行时 .env`}</pre>
            </div>

            <div className="p-5 bg-[#0b0f19] rounded-2xl border border-gemini-purple/35 space-y-3">
              <div className="font-mono text-gemini-purple">
                02 · self_improve.mdc &amp; rule_management.mdc 元规则
              </div>
              <div className="space-y-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">三大规则自进化触发点：</strong>同一编码范式跨 <span className="font-mono text-gemini-cyan tabular-nums">3+</span> 文件出现、PR 评审意见反复提醒、或同类 Bug 再次发生时，主动提炼新 <code className="text-white">.mdc</code>。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">标准书写格式：</strong>使用 <code className="text-gemini-cyan">[file](mdc:path/to/file)</code> 跨文件互链，并配真实代码片段的 <span className="text-emerald-300">DO</span> / <span className="text-amber-300">DON&apos;T</span> 正反例对照。
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-white">规则防膨胀修剪：</strong>当共性约束已下沉为类型或公共 Helper 函数后，及时清理过时规则条目。
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
