import Slide from "@/components/Slide";
import { ArrowUpRight, BookOpen, GitBranch, Layers, ShieldCheck, Terminal, Workflow } from "lucide-react";

function jumpToLab(labId: string) {
  window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId } }));
}

export default function Module8() {
  return (
    <section>
      {/* Main Slide: Converged M8 Intro */}
      <Slide
        backgroundColor="#040711"
        notes="Module 8 聚焦「长程软件任务的 Harness 与多 Coding Agent 协同」，按统一五类 Harness 框架（指令、范围与权限、工具与环境、状态与交接、验证与反馈）收口全栈编码护栏。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan tracking-widest mb-3">
            Module 8 · Track 2 收官 · Long-Horizon Coding Harness
          </div>
          <h1 className="text-4xl sm:text-5xl mb-4 leading-tight text-white font-bold">
            长程软件任务的{" "}
            <span className="text-gemini-purple">Harness 与多 Coding Agent 协同</span>
          </h1>
          <p className="text-base font-mono text-gemini-cyan/85 mb-6 max-w-4xl">
            指令 · 范围与权限 · 工具与环境 · 状态与交接 · 验证与反馈（与 M6 云端 PR / M12 运行时 Agent 清晰边界）
          </p>
          <div className="h-1 w-24 bg-gemini-purple mb-6" />

          {/* Five Unified Harness Categories Mapping */}
          <div className="grid grid-cols-5 gap-3 mb-5">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-gemini-cyan">
                <Workflow className="w-3.5 h-3.5" />
                <span>01 指令</span>
              </div>
              <div className="text-sm text-white font-bold">Plan &amp; 约束声明</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                复用 M1 Plan 蓝图与 M4 <code className="text-white">AGENTS.md</code>，开局锁定架构红线与明确禁用项。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-gemini-purple">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>02 范围与权限</span>
              </div>
              <div className="text-sm text-white font-bold">目录所有权与隔离</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                以 M2 <code className="text-white">.cursorignore</code> 与 M4 <code className="text-white">.mdc</code> 限定读写面，多 Agent 互斥目录所有权。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <GitBranch className="w-3.5 h-3.5" />
                <span>03 工具与环境</span>
              </div>
              <div className="text-sm text-white font-bold">Worktree + Lazy MCP</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                并发 Coding Agent 必须独立 <code className="text-white">git worktree</code> 与 <code className="text-white">init.sh</code> 干净环境。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300">
                <Layers className="w-3.5 h-3.5" />
                <span>04 状态与交接</span>
              </div>
              <div className="text-sm text-white font-bold">feature_list + ACC</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                跨会话把进度落盘为结构化状态文件与交接摘要，对抗 30 轮上下文衰减。
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300">
                <Terminal className="w-3.5 h-3.5" />
                <span>05 验证与反馈</span>
              </div>
              <div className="text-sm text-white font-bold">有界 DoD + 停机线</div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                衔接 M5 真实命令行退出码与最大 3 轮自愈阈值，独立上下文交叉复核。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => jumpToLab("agent-harness")}
                className="px-4 py-2.5 rounded-xl bg-gemini-purple text-white font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>进入 Lab 06 · 长程 Coding Harness &amp; ACC 推演台</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => jumpToLab("book-kb")}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>前往知识库中心 Lab 05（78 册书库）</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              → 右滑体验 Lab 06 五类长程 Harness &amp; Worktree 沙盘 · ↓ 查看五类模块映射与工作区隔离对比
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: Cross-Module Mapping to 5 Harness Categories */}
      <Slide
        backgroundColor="#050814"
        notes="展示 M8 如何复用而不是重复 M1/M2/M4/M5/M6 的既有内容，并将原型迁移定位为长程 Harness 的可选参考场景。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            01. UNIFIED HARNESS TAXONOMY · 模块边界与既有能力映射
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            避免重复讲授：M8 只补“跨会话、并发 Worktree 与长程总装”
          </h2>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="font-mono text-gemini-cyan">已有模块承担的基础 Harness</div>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li>
                  · <strong className="text-white">M1 / M2：</strong>单轮意图规范、切片预算与 <code className="text-white">.cursorignore</code> 降噪
                </li>
                <li>
                  · <strong className="text-white">M4：</strong><code className="text-white">AGENTS.md</code>、路径 <code className="text-white">.mdc</code> 与最小特权 MCP 权限边界
                </li>
                <li>
                  · <strong className="text-white">M5：</strong>单任务 DoD、防测试作弊与终端有界自愈循环
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-purple/40 space-y-2.5">
              <div className="font-mono text-gemini-purple">M8 专属长程 Coding Harness 增量</div>
              <ul className="space-y-2 text-slate-200 leading-relaxed">
                <li>
                  · <strong className="text-white">跨会话状态锚点：</strong><code className="text-white">init.sh</code> 环境基线 + <code className="text-white">feature_list.json</code> 进度账本 + ACC 压缩保留红线
                </li>
                <li>
                  · <strong className="text-white">并发多 Agent 隔离：</strong>按接口契约拆单 + 独立 <code className="text-white">git worktree</code> + 写入文件互斥白名单
                </li>
                <li>
                  · <strong className="text-white">失败恢复与交接：</strong>保留报错退出码与未完成清单开新会话续跑
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="font-mono text-amber-300">与 M6 及 Track 3（M11–M13）严格分工</div>
              <ul className="space-y-2 text-slate-300 leading-relaxed">
                <li>
                  · <strong className="text-white">vs M6 异步 PR：</strong>M6 讲云端 Issue-to-PR 与 Bugbot；M8 讲本地长程多轮任务不断线不踩文件
                </li>
                <li>
                  · <strong className="text-white">vs M12 运行时 Agent：</strong>M8 面向开发者操控 Coding Agent 写软件；M12 面向把 Agent + RAG 写进应用产品
                </li>
                <li>
                  · <strong className="text-white">AI 书籍知识库：</strong>已独立迁出至「知识库中心 / Lab 05」供全课检索
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gemini-cyan/10 border border-gemini-cyan/25 text-xs text-slate-200">
            可选参考场景：若团队需把快速原型（如 AI Studio 导出包）长期迁入生产仓库，可继续右滑参考第三页的「原型转工程三步迁移 × Harness 护栏」演练。
          </div>
        </div>
      </Slide>
    </section>
  );
}
