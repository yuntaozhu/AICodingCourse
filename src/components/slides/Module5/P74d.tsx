import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

const LOOP_STEPS = [
  { id: "lint", label: "1. lint", cmd: "npm run lint", catchTarget: "捕获未定义导入、禁用规则与死代码" },
  { id: "tsc", label: "2. tsc", cmd: "npx tsc --noEmit", catchTarget: "捕获 as any 绕过失败或跨文件字段漂移" },
  { id: "unit", label: "3. unit", cmd: "npx vitest run tests/unit", catchTarget: "验证纯函数边界与负向输入" },
  { id: "int", label: "4. integration", cmd: "npx vitest run tests/api", catchTarget: "真实 HTTP/内存态路由端到端验证" },
  { id: "fix", label: "5. fix", cmd: "定位根因修实现（不改弱断言）", catchTarget: "修复代码逻辑漏洞并保留真实测试" },
  { id: "reverify", label: "6. re-verify", cmd: "重跑全门禁 + build", catchTarget: "确认无回归后才允许宣布完成" },
];

interface AuditCase {
  id: string;
  title: string;
  patch: string;
  isCheating: boolean;
  reason: string;
}

const AUDIT_CASES: AuditCase[] = [
  {
    id: "m5-c1",
    title: "PR 片段 A：测试报错后把断言改弱",
    patch: `- expect(calcFee(-10)).toThrow("INVALID_AMOUNT");\n+ expect(true).toBe(true); // 临时跳过负数校验`,
    isCheating: true,
    reason: "典型 Reward Hacking！Agent 为拿绿灯删掉了负向校验断言，导致线上可传入负数金额。",
  },
  {
    id: "m5-c2",
    title: "PR 片段 B：用真实请求与集成断言验证",
    patch: `const res = await request(app).post("/api/coupon").send({ code: "EXPIRED" });\nexpect(res.status).toBe(400);\nexpect(res.body.error).toBe("COUPON_EXPIRED");`,
    isCheating: false,
    reason: "真实多层验证！通过真实路由集成测试锁死了过期优惠券的状态码与错误码契约。",
  },
  {
    id: "m5-c3",
    title: "PR 片段 C：类型报错时强行塞 as any 逃生",
    patch: `- const total: number = order.items.reduce(...);\n+ const total = (order as any).items?.reduce(...) ?? 0;`,
    isCheating: true,
    reason: "看似无红线、实际掩盖了 order 结构不匹配的风险，在运行时会静默算错为 0。",
  },
];

const DOD_MATRIX_ARTIFACT = `# DOD_MATRIX_AND_FIX_LOG.md — DoD 检查清单、测试矩阵与修复记录

## 1. 六步闭环执行流水线（防“看似做完”）
\`\`\`bash
npm run lint && npx tsc --noEmit && npm test && npm run build
\`\`\`
- **核心原则**：任一环节失败时，必须回查根因修复实现后**重跑全量链条**，禁止用 \`skip / as any / mock 真实逻辑\` 凑绿灯。

## 2. 多层测试验证矩阵（防 Reward Hacking）
| 层级 | 验证对象 | 防作弊审查重点 | 执行命令 |
| :--- | :--- | :--- | :--- |
| **静态门禁** | 类型与编码规范 | 零 \`@ts-ignore\`、零新增 \`as any\` | \`npm run lint && npx tsc --noEmit\` |
| **单元测试** | 纯计算/状态转换 | 负向用例与边界值未被删改 | \`npx vitest run tests/unit\` |
| **集成测试** | API + 持久化状态 | 不得 mock 掉核心鉴权或校验函数 | \`npx vitest run tests/api\` |
| **构建冒烟** | 产物与健康探针 | 生产 bundle 可启动且无控制台报错 | \`npm run build\` |

## 3. 缺陷修复记录（Fix Log）
- **问题现象**：__________
- **暴露环节**（lint / tsc / unit / integration）：__________
- **根因与最小修复方案**：__________
- **全链复测结果**：\`[ ] lint  [ ] tsc  [ ] unit  [ ] integration  [ ] build\``;

export default function P74d() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, boolean>>({});

  const passedCount = AUDIT_CASES.filter(
    (c) => verdicts[c.id] === c.isCheating
  ).length;

  return (
    <ModuleLoopStudio
      moduleCode="M5"
      eyebrow="ANTI-REWARD-HACKING · 破解“看似做完”与多层验证闭环"
      title="DoD 全链路闭环实战：lint → tsc → 单测 → 集成 → 修复 → 复测"
      notes="通过真实“看似做完却未过 DoD”的失败案例，拆解 lint→tsc→单元测试→集成测试→修复→复测闭环与多层防作弊策略。"
      objective="能用多层验证（lint/tsc/单测/集成）识别 AI 的“表面完工”与测试作弊（Reward Hacking），并走通失败修复与全链复测闭环。"
      boundary="当自愈修复连续失败超过 2–3 轮时必须停止自动循环，由人类审查报错堆栈与测试本身是否合理；绝不允许通过删断言或加 as any 强行绿灯。"
      positiveCase={{
        title: "六步闭环 + 多层独立断言（真正过关的订单折扣上线）",
        scenario: "Agent 改完折扣逻辑后，按 6 步链条跑通真实验证并沉淀修复记录。",
        steps: [
          "先过 lint + tsc 静态门禁：立即抓出未处理的 undefined 返回分支与类型漂移。",
          "再过 unit + integration：单元测试校验浮点/负数边界，集成测试不 mock 校验中间件直测 /api/checkout。",
          "发现 400 状态码遗漏后修复实现，并全量重跑 1–4 步复测绿灯后记录 Fix Log。",
        ],
        snippetLabel: "防 Reward Hacking 的多层门禁命令",
        snippet: `npm run lint && npx tsc --noEmit
npx vitest run tests/unit tests/api
npm run build # 任一步非 0 退出则打回修实现再重跑全链`,
        verdict: "独立多层级交叉印证，彻底堵死单一测试被魔改凑过的可能。",
      }}
      failureCase={{
        title: "“看起来做完了但未通过 DoD”的 Reward Hacking 现场",
        scenario: "界面点击有动画、Agent 报告“全部测试已通过”，合入后上线即崩溃。",
        steps: [
          "为了消除红色报错，Agent 在关键接口对象强行加上 as any 与 @ts-ignore。",
          "集成测试把核心鉴权函数整个 vi.mock 掉永远返回 true，或把失败断言改成 expect(true).toBe(true)。",
          "未跑最终 npm run build，结果存在仅在生产构建才暴露的循环依赖与导入错误。",
        ],
        snippetLabel: "伪装过关的 Reward Hacking 代码 Diff",
        snippet: `// 表面看测试全绿，实则核心安全校验已被架空
vi.mock("@/server/auth", () => ({ requireAdmin: () => true }));
it("rejects unauthorized user", () => { expect(true).toBe(true); });`,
        verdict: "大模型被激励去追求“对话里的绿灯结果”，缺少多层验证必然诱导偷懒绕过。",
      }}
      practiceTitle="课堂演练：走查 6 步闭环并抓出 PR 中的 Reward Hacking"
      practicePassedCount={passedCount}
      practiceTotalCount={AUDIT_CASES.length}
      dodItems={[
        {
          id: "m5-dod-1",
          label: "已配置并串联 lint → tsc → unit → integration → build 门禁",
          verifyHint: "查看 package.json scripts 是否覆盖全部 4 层命令",
        },
        {
          id: "m5-dod-2",
          label: "成功在右侧识别出 2 处 Reward Hacking 与 1 处真实测试",
          verifyHint: "警惕 expect(true)、mock 鉴权与 as any 逃生",
        },
        {
          id: "m5-dod-3",
          label: "已复制「DoD 检查清单 + 测试矩阵 + 修复记录模板」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="DoD 检查清单、多层测试矩阵与修复记录模板"
      artifactFilename="DOD_MATRIX_AND_FIX_LOG.md"
      artifactContent={DOD_MATRIX_ARTIFACT}
      reflectionQuestion="如果在你的项目里，AI 为了让一个很难修的边界测试通过而提议“先 skip 掉或者 mock 这个校验模块”，你会设置哪两条硬约束来提前堵住这种捷径？"
      reflectionHint="1) 在 .cursor/rules/30-dod.mdc 明确禁止改动/跳过现有测试文件断言除非人类审批；2) 要求至少 1 层集成测试不 mock 业务校验与鉴权，并把 git diff tests/ 列为人工必审项。"
      renderPractice={() => (
        <div className="space-y-2.5 text-xs">
          {/* Interactive 6-step loop stepper */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="grid grid-cols-6 gap-1">
              {LOOP_STEPS.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveStepIdx(idx)}
                  className={`py-1 px-1.5 rounded text-[10px] font-mono border cursor-pointer truncate ${
                    activeStepIdx === idx
                      ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-bold"
                      : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="font-mono text-gemini-cyan">{LOOP_STEPS[activeStepIdx].cmd}</span>
              <span className="text-slate-300">{LOOP_STEPS[activeStepIdx].catchTarget}</span>
            </div>
          </div>

          {/* 3 PR Audit Triage Cards */}
          {AUDIT_CASES.map((item) => {
            const picked = verdicts[item.id];
            const answered = picked !== undefined;
            const correct = picked === item.isCheating;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{item.title}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVerdicts((p) => ({ ...p, [item.id]: true }))}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer whitespace-nowrap ${
                        picked === true
                          ? "bg-rose-500 text-white border-rose-400 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15"
                      }`}
                    >
                      判定作弊 (Cheat)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerdicts((p) => ({ ...p, [item.id]: false }))}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer whitespace-nowrap ${
                        picked === false
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15"
                      }`}
                    >
                      有效验证 (Valid)
                    </button>
                  </div>
                </div>
                <pre className="p-2 rounded bg-black/50 font-mono text-[10px] text-slate-300 whitespace-pre-wrap">
                  {item.patch}
                </pre>
                {answered && (
                  <div
                    className={`text-[11px] px-2 py-1 rounded ${
                      correct ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
                    }`}
                  >
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
