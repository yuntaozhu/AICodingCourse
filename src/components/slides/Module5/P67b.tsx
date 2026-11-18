import { useMemo, useState } from "react";
import Slide from "@/components/Slide";
import { CopySnippetButton } from "@/components/sandboxes/SandboxFrame";
import { stopRevealKey, stopRevealWheel } from "@/components/sandboxes/revealEvents";

interface QualityGateToggle {
  id: string;
  source: string;
  label: string;
  ruleLine: string;
}

const QUALITY_GATE_TOGGLES: QualityGateToggle[] = [
  {
    id: "sonar-accountable",
    source: "Sonar #1/#7",
    label: "人类总编责任与架构级 Review",
    ruleLine:
      "- 每份 PR 必须附带变更影响摘要；拒绝未理解的整段粘贴，Review 重点审计架构耦合、权限与业务边界。",
  },
  {
    id: "sonar-simplicity",
    source: "Sonar #3 & IASalut",
    label: "低认知复杂度 & 圈复杂度/Halstead 门禁",
    ruleLine:
      "- 严格限制单函数认知复杂度与圈复杂度（建议 <= 10），遵循 SOLID 单一职责，禁止嵌套回调和过度炫技。",
  },
  {
    id: "sonar-no-stray",
    source: "Sonar #4",
    label: "绝对零残留代码（No Stray Code）",
    ruleLine:
      "- 提交前清扫所有未使用导入、死代码分支、废弃 helper、console.log 调试打印及空 catch {} 静默吞错。",
  },
  {
    id: "sonar-reward-hack",
    source: "Sonar #6 & 2410.02156",
    label: "严防测试作弊（Reward Hacking）与静默错误",
    ruleLine:
      "- 严禁 expect(true).toBe(true) 或 test.skip 凑绿灯；所有计算与状态流转须由独立基准输入与异常分支验证。",
  },
  {
    id: "iasalut-pyramid",
    source: "IASalut 5-Layer",
    label: "高合规五层测试金字塔（单元 ➔ 回归）",
    ruleLine:
      "- 按风险等级逐层覆盖：单元测试 → 模块集成（Implementation）→ 系统端到端 → 业务验收（UAT）→ 回归测试。",
  },
  {
    id: "iasalut-audit",
    source: "IASalut Compliance",
    label: "命名秩序、自解释文档与合规可追溯性",
    ruleLine:
      "- 核心算法与接口遵循统一命名规范并补充参数/边界契约文档，确保关键决策路径具备日志追踪与可审计性。",
  },
];

export default function P67b() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "sonar-simplicity",
    "sonar-no-stray",
    "sonar-reward-hack",
    "iasalut-pyramid",
  ]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const generatedMdc = useMemo(() => {
    const activeLines = QUALITY_GATE_TOGGLES.filter((item) =>
      selectedIds.includes(item.id)
    ).map((item) => item.ruleLine);

    return `---
description: AI 代码质量门禁（融合 Sonar 7 Habits 与 IASalut 工程规范）
globs: ["src/**/*.{ts,tsx}", "server/**/*.ts", "tests/**/*"]
alwaysApply: false
---

# 质量与高合规验证守则（已启用 ${activeLines.length}/${QUALITY_GATE_TOGGLES.length} 项）
${activeLines.length > 0 ? activeLines.join("\n") : "- 请至少勾选 1 项质量门禁规则。"}

# 交付前必跑终端门禁
- npx tsc --noEmit && npm run lint && npm test`;
  }, [selectedIds]);

  return (
    <section>
      {/* Main Slide: Sonar 7 Habits of Highly Effective AI Coding */}
      <Slide
        backgroundColor="#040711"
        notes="结合 SonarSource《7 Habits of Highly Effective AI Coding》：AI 写代码极快，但若跳过习惯约束，Review 与调试会彻底堵死生产力。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-cyan mb-2">
            SONAR EBOOK · 7 HABITS OF HIGHLY EFFECTIVE AI CODING
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            打破“生产力悖论”：高效 AI 编码的{" "}
            <span className="text-gemini-cyan">Sonar 七大铁律</span>
          </h2>
          <p className="text-xs text-slate-300 mb-5 max-w-4xl leading-relaxed">
            AI 让代码产量呈指数上升，却常让整体交付变慢——因为瓶颈转移到了代码审查与除错。Sonar 提出的解决方案不是写得更快，而是以更严苛的工程标准扮演高级审稿人。
          </p>

          <div className="grid grid-cols-12 gap-3 text-xs">
            <div className="col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-cyan">01. 开发者永远负全责</div>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">git blame 永远指向你</strong>，不会指向 AI。合入主分支的每一行代码，安全与正确性责任归人类。
              </p>
            </div>

            <div className="col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-purple">02. 过度文档化上下文</div>
              <p className="text-slate-300 leading-relaxed">
                用 User Story、架构边界与 <code className="text-white">.mdc</code> 喂饱上下文，别用模糊口头要求逼 AI 瞎猜。
              </p>
            </div>

            <div className="col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-emerald-400">03. Keep It Simple</div>
              <p className="text-slate-300 leading-relaxed">
                拒绝 AI 炫技写“聪明但晦涩”的巨型函数，强制压低认知复杂度（Cognitive Complexity），保持函数短小可读。
              </p>
            </div>

            <div className="col-span-3 p-4 rounded-2xl bg-[#0b0f19] border border-amber-400/35 space-y-1.5">
              <div className="font-mono text-amber-300">04. No Stray Code</div>
              <p className="text-slate-300 leading-relaxed">
                坚决清扫 AI 遗留的死代码、多余导入、占位注释与无用辅助函数，防止隐形技术债蔓延。
              </p>
            </div>

            <div className="col-span-3 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-cyan">05. Analyze Everything</div>
              <p className="text-slate-300 leading-relaxed">
                对 AI 代码执行比手写代码<strong className="text-white">更高规格的 SAST 扫描</strong>，追踪污点数据流与并发隐患。
              </p>
            </div>

            <div className="col-span-3 p-4 rounded-2xl bg-[#0b0f19] border border-rose-400/35 space-y-1.5">
              <div className="font-mono text-rose-300">06. 防测试 Reward Hacking</div>
              <p className="text-slate-300 leading-relaxed">
                AI 擅长写 Happy Path 单测，但极易篡改弱断言自欺欺人；必须由人把关异常分支与失败模式。
              </p>
            </div>

            <div className="col-span-3 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-mono text-gemini-purple">07. 高价值人工 Review</div>
              <p className="text-slate-300 leading-relaxed">
                把格式/语法交给自动扫描工具，人类 Review 专注架构演进、安全边界与真实业务逻辑对齐。
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono text-gemini-cyan">
            <span>↓ 向下看 IASalut 高合规 AI 工程规范（五层测试金字塔 &amp; 复杂度量化指标）</span>
            <span className="text-slate-400">07 / 07 铁律完整落地 Cursor DoD</span>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 1: IASalut Good Practice Guide for AI Code */}
      <Slide
        backgroundColor="#050814"
        notes="吸纳 Fundació TIC Salut Social (IASalut)《Good Practice Guide for Code Development in AI Solutions in Health》：在医疗、金融、支付等高风险业务中，用量化复杂度指标与五层测试金字塔守住安全底线。"
      >
        <div className="max-w-6xl mx-auto h-full flex flex-col justify-center">
          <div className="text-xs font-mono text-gemini-purple mb-2">
            IASALUT · GOOD PRACTICE GUIDE FOR AI SOLUTIONS IN HEALTH
          </div>
          <h2 className="text-3xl font-bold text-white mb-5">
            高风险域 AI 编码准绳：从静态复杂度门禁到五层测试金字塔
          </h2>

          <div className="grid grid-cols-12 gap-5 text-xs items-stretch">
            <div className="col-span-5 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="font-bold text-gemini-cyan text-sm">
                一、代码秩序、标准与复杂度量化控制
              </div>
              <div className="space-y-2.5 text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-white">命名与结构秩序（Nomenclature &amp; Order）：</strong>
                  强制执行语言规范（如 PEP 8 / Google Style / Strict TS）与 <strong className="text-white">SOLID 原则</strong>，让代码自身可读胜过冗长注释。
                </div>
                <div>
                  <strong className="text-white">两大静态量化红线：</strong>
                  用 <strong className="text-gemini-cyan">圈复杂度（Cyclomatic）</strong> 控制分支路径数，用 <strong className="text-gemini-purple">Halstead 复杂度</strong> 度量操作符与运算负荷，防止 AI 生成难以测试的巨型模块。
                </div>
                <div>
                  <strong className="text-white">合规与可审计性（ISO / AI Act）：</strong>
                  当产品涉足医疗、金融或自动化决策时，代码与测试记录必须可复现、可追溯。
                </div>
              </div>
            </div>

            <div className="col-span-7 p-5 rounded-2xl bg-[#0b0f19] border border-gemini-cyan/35 flex flex-col justify-between gap-3">
              <div>
                <div className="font-bold text-emerald-400 text-sm mb-3">
                  二、IASalut 五层递进测试金字塔（不可仅停留在单测）
                </div>
                <div className="space-y-2">
                  {[
                    {
                      step: "01. Unit Tests（单元测试）",
                      desc: "验证最小函数与纯逻辑边界，严禁弱断言或跳过用例。",
                    },
                    {
                      step: "02. Implementation Tests（实现集成测试）",
                      desc: "验证 API 路由、ORM、缓存与外部服务衔接契约。",
                    },
                    {
                      step: "03. System Tests（系统测试）",
                      desc: "完整端到端流程（Playwright / 真实载荷）与性能压力检验。",
                    },
                    {
                      step: "04. Acceptance Tests（验收测试）",
                      desc: "对照 PRD / 临床或商业需求逐条核对真实业务预期。",
                    },
                    {
                      step: "05. Regression Tests（回归测试）",
                      desc: "防止修复一个 Bug 时破坏既有功能（对抗“退两步”魔咒）。",
                    },
                  ].map((layer) => (
                    <div
                      key={layer.step}
                      className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <span className="font-mono text-white font-semibold shrink-0">
                        {layer.step}
                      </span>
                      <span className="text-slate-300 text-right">{layer.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[11px] font-mono text-gemini-cyan">
                ↓ 向下交互装配你的项目质量门禁 .mdc 规则文件
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* Sub Slide 2: Interactive .mdc Quality Gate Assembler */}
      <Slide
        backgroundColor="#02050e"
        notes="将 Sonar 7 Habits 与 IASalut 规范实时勾选组装为可直接放进 Cursor .cursor/rules/30-quality-gate.mdc 的可执行规则。"
      >
        <div
          className="max-w-6xl mx-auto rounded-2xl bg-[#0b0f19] border border-white/10 p-5 flex flex-col gap-3"
          onKeyDown={stopRevealKey}
          onWheel={stopRevealWheel}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
            <div>
              <div className="text-xs font-mono text-emerald-400">
                Quality Gate Builder · Sonar 7 Habits × IASalut × arXiv:2410.02156
              </div>
              <h3 className="text-lg font-bold text-white">
                一键装配高可靠项目 DoD 质量门禁（导出 .cursor/rules/30-quality-gate.mdc）
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-400 tabular-nums">
              已启用 {selectedIds.length} / {QUALITY_GATE_TOGGLES.length} 项门禁
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-stretch text-xs">
            <div className="col-span-6 space-y-2">
              {QUALITY_GATE_TOGGLES.map((item) => {
                const active = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? "bg-gemini-cyan/12 border-gemini-cyan/60 text-white"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-semibold">{item.label}</span>
                      <span className="font-mono text-[11px] text-gemini-purple shrink-0">
                        {item.source}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {item.ruleLine}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="col-span-6 rounded-xl bg-black/55 border border-white/15 p-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-gemini-cyan">
                    .cursor/rules/30-quality-gate.mdc
                  </span>
                  <CopySnippetButton text={generatedMdc} label="复制 .mdc 规则" />
                </div>
                <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                  {generatedMdc}
                </pre>
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
                提示：将该规则放进仓库后，在 Cursor Bugbot（Lab 04）与终端 DoD 闭环中将自动生效。
              </div>
            </div>
          </div>
        </div>
      </Slide>
    </section>
  );
}
