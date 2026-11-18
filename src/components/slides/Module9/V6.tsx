import Slide from "@/components/Slide";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileDown,
  Terminal,
} from "lucide-react";

interface LiteratureResource {
  id: string;
  tag: string;
  title: string;
  author: string;
  keyTakeaway: string;
  pdfUrl: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  moduleRef: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
}

const LITERATURE_RESOURCES: LiteratureResource[] = [
  {
    id: "beyond-vibe-coding",
    tag: "BOOK · O'REILLY",
    title: "Beyond Vibe Coding: From Coder to AI-Era Developer",
    author: "Addy Osmani",
    keyTakeaway: "70% 困境、Two Steps Back、知识悖论、CHOP 与 Editor-in-Chief 心智模型",
    pdfUrl:
      "https://ytx-readings.github.io/AI/books/programming/Beyond%20Vibe%20Coding%20From%20Coder%20to%20AI-Era%20Developer%20(Addy%20Osmani)%20(Z-Library).pdf",
    secondaryUrl: "https://beyond.addy.ie",
    secondaryLabel: "配套官网",
    moduleRef: "M1 · M7",
    accent: "cyan",
  },
  {
    id: "sonarsource-7-habits",
    tag: "EBOOK · SONARSOURCE",
    title: "7 Habits of Highly Effective AI Coding",
    author: "Sonar (SonarSource)",
    keyTakeaway: "git blame 责任制、No Stray Code、全量 SAST 与严防 Test Reward Hacking",
    pdfUrl: "https://www.sonarsource.com/7-habits-of-highly-effective-ai-coding-ebook.pdf",
    moduleRef: "M5 · M6 · Lab 09",
    accent: "amber",
  },
  {
    id: "arxiv-2410-02156",
    tag: "PAPER · ARXIV:2410.02156",
    title: "The Why, What, and How of AI-Based Coding in Scientific Research",
    author: "Tonghe Zhuang & Zhicheng Lin",
    keyTakeaway: "6 类 AI 编码辅助矩阵与 5 步抗静默逻辑/数值错误工作流",
    pdfUrl: "https://arxiv.org/pdf/2410.02156",
    moduleRef: "M1 · M5",
    accent: "purple",
  },
  {
    id: "iasalut-good-practice",
    tag: "GUIDE · IASALUT / EU",
    title: "Good Practice Guide for Code Development in AI Solutions in Health",
    author: "Fundació TIC Salut Social",
    keyTakeaway: "SOLID、圈复杂度 + Halstead 定量门禁与五层测试金字塔",
    pdfUrl:
      "https://iasalut.cat/wp-content/uploads/2023/05/Good-practice-guide-for-code-development-in-Artificial-Intelligence-solutions-in-health.pdf",
    moduleRef: "M5 · P67b",
    accent: "emerald",
  },
  {
    id: "arxiv-2603-05344",
    tag: "PAPER · ARXIV:2603.05344",
    title: "OPENDEV: Scaffolding, Harness & Context Engineering",
    author: "Nghi D. Q. Bui (2026)",
    keyTakeaway: "5 阶自适应压缩 (ACC)、Schema Gating 与惰性 MCP 发现",
    pdfUrl: "https://arxiv.org/pdf/2603.05344",
    moduleRef: "M2 · M4 · Lab 06",
    accent: "cyan",
  },
  {
    id: "vibe-coders-handbook",
    tag: "HANDBOOK · 2026 EDITION",
    title: "The Vibe Coder's Handbook: Understanding Every Tool Your AI Just Used",
    author: "Nasser AlNasser & Harsimran",
    keyTakeaway: "餐厅三层架构、14 岗全栈工具图谱、8 类报错解码与安全清查",
    pdfUrl: "/assets/aistudio/TheVibeCodersHandbook_cd703cf8.pdf",
    secondaryUrl: "https://vibecodershandbook.pages.dev/chapters/introduction",
    secondaryLabel: "在线章节",
    moduleRef: "M9 · Lab 07",
    accent: "purple",
  },
];

const WORKFLOW_CHEAT_SHEET_MD = `# AI-Era Developer Workflows · Quick-Reference Cheat Sheet

## 1. Plan Before Code (Addy Osmani · Stage 1)
- [ ] 用 JTBD 一句话锁定核心需求；先用 Cursor Plan Mode 生成接口契约与里程碑。
- [ ] 区分 Bootstrapper（分钟级原型验证）与 Iterator（小步生产迭代）。

## 2. Context Engineering & CHOP (arXiv:2410.02156 & 2603.05344)
- [ ] 根目录维护 AGENTS.md；按路径 globs 拆分 .cursor/rules/*.mdc。
- [ ] 用 @Files / @Docs / Context7 MCP 锚定真实依赖，UI 提示使用整站+局部+源码三层视觉参照。

## 3. Quality Gate & Zero Stray Code (Sonar 7 Habits & IASalut)
- [ ] Habit #1/#7: git blame 永远指向人类；单次 Diff <150 行，逐块审查后再合入。
- [ ] Habit #3/#4: 控制圈复杂度 <= 10；彻底清除 console.log、死代码、TODO 占位与空 catch {}。
- [ ] Habit #6 & 5-Layer: 严禁 expect(true).toBe(true) / test.skip；用基准输入验证边界与异常分支。

## 4. Terminal & Bugbot Release Gate
- [ ] npx tsc --noEmit && npm run lint && npm run build
- [ ] Bugbot / SAST 全量扫描并发竞态、XSS/SQLi 注入与硬编码密钥。`;

const ACCENT_STYLES: Record<LiteratureResource["accent"], string> = {
  cyan: "text-gemini-cyan border-gemini-cyan/30",
  purple: "text-gemini-purple border-gemini-purple/30",
  emerald: "text-emerald-400 border-emerald-400/30",
  amber: "text-amber-300 border-amber-400/30",
};

function jumpToLab(labId: string) {
  window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId } }));
}

export default function V6() {
  return (
    <section>
      {/* Main Slide: Downloadable Literature PDFs & AI-Era Workflow Quick-Reference */}
      <Slide
        backgroundColor="#040711"
        notes="Module 9 Resources & Cheat Sheets：汇总本课程核心分析的 6 部原版文献 PDF 下载直链（Beyond Vibe Coding、Sonar 7 Habits、arXiv:2410.02156、IASalut、OPENDEV 2603.05344、Vibe Coder's Handbook），以及 AI 时代开发者 5 步核心工作流速查卡。"
      >
        <div
          onWheel={stopRevealWheel}
          onKeyDown={stopRevealKey}
          className="max-w-6xl mx-auto h-full flex flex-col justify-center"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="text-xs font-mono text-gemini-cyan tracking-widest">
              MODULE 9 · RESOURCES &amp; CHEAT SHEETS · 文献直链与工作流速查
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <button
                type="button"
                onClick={() => jumpToLab("book-kb")}
                className="text-gemini-cyan hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>打开 Lab 05 书库 (78册)</span>
              </button>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => jumpToLab("efficiency-assessment")}
                className="text-gemini-purple hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>去做 Lab 09 效能自测</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Resources &amp; Cheat Sheets：
            <span className="text-gemini-cyan">原版文献 PDF</span> 与{" "}
            <span className="text-gemini-purple">AI 时代工作流速查卡</span>
          </h2>

          {/* 12-Col Split */}
          <div className="grid grid-cols-12 gap-4 items-stretch">
            {/* Left: 6 Core Analyzed Literature PDFs (7 cols) */}
            <div className="col-span-7 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-0.5">
                <span>CORE ANALYZED LITERATURE · 6 部深度解析文献直连下载</span>
                <span className="tabular-nums">6 PDFs / Guides</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {LITERATURE_RESOURCES.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl bg-white/[0.04] border flex flex-col justify-between gap-2 ${ACCENT_STYLES[item.accent]}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono mb-1">
                        <span className="truncate">{item.tag}</span>
                        <span className="text-slate-400 shrink-0">{item.moduleRef}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.author}</div>
                      <p className="text-[10px] text-slate-300 leading-relaxed mt-1.5">
                        {item.keyTakeaway}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gemini-cyan hover:text-slate-950 text-[11px] font-mono font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>下载 PDF</span>
                      </a>

                      {item.secondaryUrl && (
                        <a
                          href={item.secondaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-300 hover:text-white hover:underline whitespace-nowrap shrink-0"
                        >
                          <span>{item.secondaryLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quick-Reference Guide for AI-Era Developer Workflows (5 cols) */}
            <div className="col-span-5 p-4 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-gemini-cyan uppercase">
                      AI-ERA DEVELOPER WORKFLOWS
                    </div>
                    <h3 className="text-base font-bold text-white">
                      五阶工程闭环速查卡（Cheat Sheet）
                    </h3>
                  </div>
                  <CopySnippetButton text={WORKFLOW_CHEAT_SHEET_MD} label="复制 MD 速查卡" />
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                    <div className="font-mono text-gemini-cyan font-semibold">
                      01 · Plan Before Code（先契约后编码）
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      先用 <code className="text-white">Plan Mode</code> 锁定接口/Schema 与 14 岗选型，分离 Bootstrapper 原型与 Iterator 迭代。
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                    <div className="font-mono text-gemini-purple font-semibold">
                      02 · Context &amp; CHOP（结构化喂料）
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      <code className="text-white">AGENTS.md</code> + <code className="text-white">globs .mdc</code> 分域加载 + <code className="text-white">@Files</code>；UI 使用三层参考网站输入。
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                    <div className="font-mono text-emerald-400 font-semibold">
                      03 · Sonar 7 Habits（零死代码 &amp; 反测试作弊）
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      清除 <code className="text-white">console.log</code> / 空 <code className="text-white">catch</code>，禁止 <code className="text-white">.skip</code> 或空断言，守住圈复杂度 &le; 10。
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/8">
                    <div className="font-mono text-amber-300 font-semibold">
                      04 · Verify &amp; Bugbot（终检门禁）
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      执行 <code className="text-white">tsc --noEmit &amp;&amp; lint &amp;&amp; build</code> + Bugbot/SAST 扫描，以主编身份逐块签核 Diff。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>↓ 向下查看「反模式 vs 最佳实践对照表 &amp; 指令速查」</span>
                <span className="text-gemini-cyan">Sub-Slide ↓</span>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Anti-Patterns vs AI-Era Best Practices & Command Cheat Sheet */}
      <Slide
        backgroundColor="#050814"
        notes="纵深速查表：对比「盲目 Vibe 陷阱」与「AI 时代工程实践」，汇总 Cursor 高频指令与 Sonar/IASalut 质量核对单。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            CHEAT SHEET APPENDIX · 反模式纠偏与 Cursor / 质量门禁指令速查
          </div>
          <h2 className="text-3xl font-bold text-white mb-5">
            AI 时代开发者：避坑速查矩阵与终端核对单
          </h2>

          <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
            {/* Left: Trap vs AI-Era Fix (7 cols) */}
            <div className="col-span-7 p-4 rounded-2xl bg-white/[0.035] border border-white/10 space-y-2.5">
              <div className="text-[11px] font-mono text-gemini-cyan">
                VIBE TRAPS VS AI-ERA WORKFLOWS（基于 Beyond Vibe Coding &amp; Sonar）
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/25">
                  <div className="text-[11px] font-bold text-red-300 mb-1">
                    ✗ 70% 困境 &amp; Two Steps Back
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    无架构理解下连环追问“帮我修好”，导致上下文腐烂、改 A 坏 B。
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                  <div className="text-[11px] font-bold text-emerald-300 mb-1">
                    ✓ Plan + 小步 Git 断点 + ACC
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    遇阻立即 <code className="text-white">git reset</code> 回退断点，新开干净会话并喂入最小复现与契约。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/25">
                  <div className="text-[11px] font-bold text-red-300 mb-1">
                    ✗ 静默数值/逻辑错误 &amp; Reward Hacking
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    AI 用伪断言、<code className="text-white">.skip</code> 或静默吞错凑过测试，上线才暴露计算偏差。
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                  <div className="text-[11px] font-bold text-emerald-300 mb-1">
                    ✓ 独立基准校验 + 五层测试金字塔
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    人类定义边界与负向输入基准，按 单元→集成→系统→验收→回归 逐层验证。
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/25">
                  <div className="text-[11px] font-bold text-red-300 mb-1">
                    ✗ 形容词式 UI 提示（Garbage In）
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    只写“做一个现代高端科技感页面”，结果必然产出千篇一律的 AI 模板脸。
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
                  <div className="text-[11px] font-bold text-emerald-300 mb-1">
                    ✓ 23 站视觉基准 + 反面约束清单
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    附带整站结构 + 局部组件 + 实现源码参数喂料，并显式禁止冗余动效与假标签。
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Cursor & Terminal Release Gate Cheat Sheet (5 cols) */}
            <div className="col-span-5 p-4 rounded-2xl bg-[#0b0f19] border border-white/12 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gemini-purple">
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>CURSOR &amp; QUALITY GATE COMMANDS</span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-gemini-cyan">Shift + Tab / Plan</span>
                    <span className="text-slate-300">先出规范与里程碑再改代码</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-gemini-cyan">@Files · @Docs · #</span>
                    <span className="text-slate-300">精准锚定契约，避免全仓瞎搜</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-gemini-cyan">npx tsc --noEmit</span>
                    <span className="text-slate-300">零容忍拦截类型漂移</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5">
                    <span className="text-gemini-cyan">npm run lint &amp;&amp; build</span>
                    <span className="text-slate-300">清理 Stray Code 与打包验证</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Sonar Habit #1 终极自问</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  “如果这段代码明天凌晨 3 点在生产环境报错，我能看懂 <code className="text-white">git blame</code> 指向我的每一行并迅速修复吗？”
                </p>
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
