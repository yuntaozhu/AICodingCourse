import Slide from "@/components/Slide";
import { ArrowUpRight, ExternalLink } from "lucide-react";

function jumpToLab07() {
  window.dispatchEvent(new CustomEvent("reveal:jump-lab", { detail: { labId: "vibe-stack-map" } }));
}

export default function V1() {
  return (
    <section>
      {/* Main Slide: Intro & Chapter 1 - How the Web Actually Works */}
      <Slide
        backgroundColor="#040711"
        notes="Module 9 开篇基于《The Vibe Coder's Handbook (2026年3月版)》：不讲晦涩语法，先帮独立开发者和产品经理建立看懂 AI 生成代码的完整全栈心智地图。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="text-xs font-mono text-gemini-cyan tracking-widest">
              MODULE 9 · THE VIBE CODER&apos;S HANDBOOK · WEB 底层心智模型
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <button
                type="button"
                onClick={jumpToLab07}
                className="text-gemini-purple hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>打开 Lab 07 全栈图谱</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <a
                href="/assets/aistudio/TheVibeCodersHandbook_cd703cf8.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white hover:underline inline-flex items-center gap-1"
              >
                <span>下载全书 PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            看懂 Cursor 刚刚生成的每一行工具：<br />
            <span className="text-gemini-cyan">餐厅三层架构</span>与三大原生语言
          </h1>
          <p className="text-sm text-slate-300 mb-6 max-w-4xl leading-relaxed">
            面对 AI 瞬间生成的 React、Next.js、Drizzle、Zustand、Zod 与 Vite，无需死记语法——只需记住：<strong className="text-white">全球任意 Web 应用都只有三层</strong>，且浏览器最终永远只认识三种语言。
          </p>

          <div className="grid grid-cols-3 gap-4 mb-5 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-cyan">01 · 前端 Frontend（餐厅大堂）</div>
              <div className="font-bold text-white text-sm">菜单、餐桌与一切用户交互</div>
              <p className="text-slate-300 leading-relaxed">
                运行在用户浏览器中，任何人都可通过 F12 查看并修改。<strong className="text-amber-300">铁律：绝不把安全校验与密钥留在浏览器。</strong>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-gemini-purple">02 · 后端 Backend（封闭后厨）</div>
              <div className="font-bold text-white text-sm">权限校验、算账与业务规则</div>
              <p className="text-slate-300 leading-relaxed">
                运行在云端机房，对用户完全不可见。由 HTTP（服务员）把前端点单送入后厨，再把 JSON 结果端回大堂。
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-mono text-emerald-400">03 · 数据库 Database（食材库）</div>
              <div className="font-bold text-white text-sm">账号、订单与状态持久化</div>
              <p className="text-slate-300 leading-relaxed">
                所有配方与永久食材（PostgreSQL / Supabase）。后厨查验权限后才能按规范读写食材库。
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b0f19] border border-gemini-cyan/35 flex items-center justify-between gap-4 text-xs">
            <div className="text-slate-200 leading-relaxed">
              <strong className="text-gemini-cyan">核心顿悟（Ch.1 Critical Insight）：</strong>
              浏览器根本看不懂 React、TypeScript 或 Tailwind —— 它们只是更好写的源头工具，最终都必须编译成{" "}
              <code className="text-white">HTML（建筑蓝图）</code> +{" "}
              <code className="text-white">CSS（室内装修）</code> +{" "}
              <code className="text-white">JavaScript（水电逻辑）</code>。
            </div>
            <span className="font-mono text-slate-400 shrink-0">↓ 向下看 TS 与 Tailwind 统治原因</span>
          </div>
        </div>
      </Slide>

      {/* Vertical Sub Slide 1: Chapter 2 & Chapter 5 - Why TypeScript & Tailwind Won AI Coding */}
      <Slide
        backgroundColor="#050814"
        notes="结合 Handbook 第 2 章与第 5 章：解释为什么 AI Coding 工具几乎默认全栈采用 TypeScript + Tailwind CSS。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            CHAPTER 2 &amp; CHAPTER 5 · 为什么 AI 默认选这两件套？
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">
            2026 工业共识：TypeScript（85%）× Tailwind CSS（55%）
          </h2>

          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-gemini-cyan">TYPESCRIPT · 静态类型安全网</span>
                <span className="font-mono text-slate-400 tabular-nums">~85% 专业新项目</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                在纯 JS 中，把数字价格误写成字符串 <code className="text-white">price = &quot;free&quot;</code> 会直到线上算税才崩出 <code className="text-rose-300">NaN</code>；而 TypeScript 在编辑器里 1 秒画红线拦下错误，且自 2025 年起 <strong className="text-white">Node.js 已原生直跑 .ts 文件</strong>。
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-slate-200 leading-relaxed">
                <strong className="text-emerald-400">对 Cursor 至关重要：</strong>类型即“永不过时的活文档”，让 AI 看清跨文件数据结构，大幅降低传参幻觉。
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-gemini-purple/35 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-gemini-purple">TAILWIND CSS · AI 最友好的样式系统</span>
                <span className="font-mono text-slate-400 tabular-nums">~55% 新项目占比</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                相比在 <code className="text-white">.css</code> 与组件文件间反复横跳或发生类名冲突，Tailwind 将 <code className="text-white">bg-blue-500 p-4 rounded</code> 直接内联在 JSX 中，生产构建自动剔除未用类名（常小于 10 KB）。
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 leading-relaxed">
                <strong className="text-gemini-cyan">对 Cursor 至关重要：</strong>每个实用类意图 100% 显性无歧义，AI 单文件即可精准控制样式而不破坏其它页面。
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
