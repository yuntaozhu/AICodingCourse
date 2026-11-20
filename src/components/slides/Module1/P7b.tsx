import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface ScenarioItem {
  id: string;
  request: string;
  correctMode: "one-liner" | "clarify-plan";
  reason: string;
}

const MODE_SCENARIOS: ScenarioItem[] = [
  {
    id: "m1-s1",
    request: "把 PricingCard.tsx 的购买按钮文案从「立即开通」改为「开始 7 天试用」",
    correctMode: "one-liner",
    reason: "单文件纯文案改动、无数据契约变更且影响面封闭，用一句话或 Tab 补全即可，无需走重型 Plan。",
  },
  {
    id: "m1-s2",
    request: "给团队加一个匿名意见反馈箱，能提交、筛选并防恶意刷屏",
    correctMode: "clarify-plan",
    reason: "涉及数据库表结构、防刷限流、鉴权边界与前端异常态，必须先澄清 4 要素再进 Plan → Agent。",
  },
  {
    id: "m1-s3",
    request: "重构用户订阅状态枚举，同步影响前端定价页、后端 Webhook 与测试",
    correctMode: "clarify-plan",
    reason: "跨 3 层模块修改共享状态契约，跳过 Plan 极易导致字段名漂移与现有测试崩溃。",
  },
];

const CLARIFY_TEMPLATE = `# PLAN_SPEC_TEMPLATE.md — Cursor Plan Mode 澄清与交接模板

## 1. 澄清四要素（先问清，再编码）
- **目标 (Target)**：本次只解决什么业务问题？（例：上线团队反馈提交接口与列表页）
- **适用场景与范围 (Scope)**：仅改哪些文件？明确哪些现有模块**禁止修改**（如现有 Auth 路由）
- **约束红线 (Guardrails)**：
  - 输入必须用 Zod 校验；禁止引入新的重型依赖
  - 敏感配置仅读服务端环境变量，不写入 \`VITE_*\`
- **验收标准 (DoD)**：
  - [ ] \`npx tsc --noEmit\` 通过（0 error）
  - [ ] \`npm run lint\` 与 \`npm test\` 全绿
  - [ ] 页面覆盖 Loading / Empty / Error 三态及 375px 移动端

## 2. Plan 审批指令（可直接贴入 Cursor Plan Mode）
\`\`\`text
[Plan Mode] @src/types/feedback.ts @server/routes/feedback.ts
先不要修改任何代码。请根据以上四要素输出：
1. 数据结构与 API 错误码契约（含限流字段）
2. 分步文件改动清单（edit / new）
3. 每步结束后的可执行验证命令
待我确认 Plan 后再切 Agent 逐步实施。
\`\`\``;

export default function P7b() {
  const [answers, setAnswers] = useState<Record<string, "one-liner" | "clarify-plan">>({});

  const correctCount = MODE_SCENARIOS.filter(
    (item) => answers[item.id] === item.correctMode
  ).length;

  return (
    <ModuleLoopStudio
      moduleCode="M1"
      eyebrow="CLARIFY ➔ PLAN ➔ AGENT · 需求澄清与边界闭环"
      title="从模糊一句到可审批 Plan：正反对比与模式边界演练"
      notes="通过“团队匿名反馈箱”完整例子对比一句话盲写与四要素澄清→Plan→Agent，建立清晰的适用边界。"
      objective="能将一句模糊产品想法拆清目标、约束、场景与验收标准（DoD），并判断何时跳过 Plan、何时必须先出 Plan 再由 Agent 实施。"
      boundary="单文件局部文案/样式微调适合一句话或 Tab；跨文件、改数据结构、涉鉴权/外部接口时，严禁直接一句开写。"
      positiveCase={{
        title: "4 步澄清 ➔ Plan ➔ Agent（团队匿名反馈箱）",
        scenario: "产品经理原始诉求：「做个团队匿名反馈收集页」。",
        steps: [
          "先澄清四要素：目标=提交分类建议+管理端筛选；约束=单 IP 1 分钟最多 5 次、不改现有登录中间件；场景=桌面+手机端；DoD=tsc/lint/单测全绿。",
          "在 Cursor 按 Shift+Tab 进 Plan Mode，@ 现有路由与类型文件，生成包含 Schema、接口契约与 3 步文件清单的 Spec。",
          "人工确认 Spec 仅改 3 个文件后切 Agent 实施，Agent 自动跑完类型检查与单元测试。",
        ],
        snippetLabel: "结构化澄清后交给 Plan Mode 的指令",
        snippet: `目标: 新增反馈提交与筛选 API；约束: Zod 校验+内存限流，不改现有 Auth
范围: @server/app.ts @src/types/feedback.ts
验收: npx tsc --noEmit && npm test 全绿，含 400/429 边界单测`,
        verdict: "零返工一次命中需求，改动范围可控可审。",
      }}
      failureCase={{
        title: "一句话直接让 Agent 开写（盲写翻车现场）",
        scenario: "直接在 Agent Mode 输入：「帮我加个团队匿名反馈功能并存进数据库」。",
        steps: [
          "AI 未问存储方案，擅自新增重型 ORM 依赖并重写了全局数据库连接池配置。",
          "未声明不改现有认证，Agent 顺手把原有路由中间件改成了开放匿名写入，引发越权隐患。",
          "前后端字段命名不一致（content vs message），页面报错后反复粘贴报错进入死循环。",
        ],
        snippetLabel: "反面一句话指令（高返工风险）",
        snippet: `"帮我加个团队匿名反馈页面并连数据库，界面好看点，做完告诉我。"`,
        verdict: "缺少范围锁与验收契约，Agent 被迫靠“猜”补全架构，导致重写与隐患。",
      }}
      practiceTitle="课堂模式判断练习：以下 3 个需求该「一句话直接改」还是「先澄清出 Plan」？"
      practicePassedCount={correctCount}
      practiceTotalCount={MODE_SCENARIOS.length}
      dodItems={[
        {
          id: "m1-dod-1",
          label: "写清「目标 / 约束 / 范围 / DoD」四要素后再触发改动",
          verifyHint: "检查提示词中是否明确指出不改哪些现有模块",
        },
        {
          id: "m1-dod-2",
          label: "完成右侧 3 道模式边界诊断全部答对",
          verifyHint: "识别单文件微调 vs 跨模块契约改动的分界线",
        },
        {
          id: "m1-dod-3",
          label: "复制并保留 PLAN_SPEC_TEMPLATE.md 用于个人真实项目",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制模板",
        },
      ]}
      artifactTitle="可复用的 Plan 需求澄清与交接蓝图模板"
      artifactFilename="PLAN_SPEC_TEMPLATE.md"
      artifactContent={CLARIFY_TEMPLATE}
      reflectionQuestion="回想你最近一次 AI 帮倒忙（改崩现有代码）的经历：当时如果停 2 分钟补齐四要素里的哪一条，就能把返工直接掐灭？"
      reflectionHint="多数返工源于缺少「Scope（明确禁止触碰的文件）」与「DoD（可运行校验命令）」。下次跨文件改动前，先贴入 PLAN_SPEC_TEMPLATE.md 的 4 项约束并在 Plan Mode 审批文件列表。"
      renderPractice={() => (
        <div className="space-y-2.5 text-xs">
          {MODE_SCENARIOS.map((item, idx) => {
            const picked = answers[item.id];
            const isCorrect = picked === item.correctMode;
            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-white">
                    <span className="font-mono text-gemini-cyan mr-1.5">0{idx + 1}.</span>
                    {item.request}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [item.id]: "one-liner" }))
                      }
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer whitespace-nowrap transition-colors ${
                        picked === "one-liner"
                          ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15 hover:text-white"
                      }`}
                    >
                      一句话直接改
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [item.id]: "clarify-plan" }))
                      }
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border cursor-pointer whitespace-nowrap transition-colors ${
                        picked === "clarify-plan"
                          ? "bg-gemini-purple text-white border-gemini-purple font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15 hover:text-white"
                      }`}
                    >
                      先澄清出 Plan
                    </button>
                  </div>
                </div>
                {picked && (
                  <div
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] border ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-400/35 text-emerald-200"
                        : "bg-rose-500/10 border-rose-400/35 text-rose-200"
                    }`}
                  >
                    {isCorrect ? "判断准确：" : "再想一下："}
                    {item.reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    />
  );
}
