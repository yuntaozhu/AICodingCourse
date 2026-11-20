import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface ReviewSnippet {
  id: string;
  label: string;
  code: string;
  mustBlock: boolean;
  explanation: string;
}

const REVIEW_SNIPPETS: ReviewSnippet[] = [
  {
    id: "m3-r1",
    label: "片段 1：前端 URL 参数直接开通会员",
    code: `if (searchParams.get("paid") === "true") {\n  await fetch("/api/unlock-pro", { method: "POST" });\n}`,
    mustBlock: true,
    explanation: "高危拦截！任何用户都能手工访问 ?paid=true 触发解锁；必须由服务端校验模拟/真实 Webhook 签名后落库。",
  },
  {
    id: "m3-r2",
    label: "片段 2：服务端环境变量引用模拟密钥",
    code: `const secret = process.env.MOCK_PAY_WEBHOOK_SECRET;\nconst sigValid = verifyHmac(rawBody, req.headers["x-pay-sig"], secret);`,
    mustBlock: false,
    explanation: "符合规范：密钥只存服务端 process.env，并使用原始请求体做签名校验。",
  },
  {
    id: "m3-r3",
    label: "片段 3：将私有凭证放进 VITE_ 前端变量",
    code: `// .env\nVITE_PAYMENT_ADMIN_TOKEN=mock_demo_token_do_not_expose`,
    mustBlock: true,
    explanation: "高危拦截！VITE_ 前缀变量会被打包进浏览器 JS bundle，所有人打开开发者工具可见。",
  },
  {
    id: "m3-r4",
    label: "片段 4：订单表写入使用幂等事件 ID 去重",
    code: `await db.insert(processedEvents).values({ id: evt.id }).onConflictDoNothing();`,
    mustBlock: false,
    explanation: "符合规范：防止支付回调重试导致同一笔模拟订单重复增加用户额度。",
  },
];

const E2E_SLICE_ARTIFACT = `# E2E_VERTICAL_SLICE_BLUEPRINT.md — 端到端垂直切片交付清单

## 1. 轻量三层架构草图（人工 Review 锚点）
\`\`\`text
[Browser UI (Mock Order)]
   │  POST /api/mock-checkout (只传 planId，不传价格/状态)
   ▼
[Express API (/api/*)] ──▶ 1. Zod 入参校验 + Session 鉴权
   │                       2. 从服务端读取 MOCK_PAY_WEBHOOK_SECRET 验签
   ▼
[Persistence (DB/SQLite)] ─▶ processed_events(id PK) 幂等防重放 + 更新会员状态
\`\`\`

## 2. 六步垂直切片闭环
1. **需求 Spec**：明确免费/付费权限边界与模拟测试卡数据（仅使用 \`test_usr_001\` 等脱敏测试账号）
2. **UI 层**：覆盖 提交中 Loading / 空列表 / 失败重试 Error 状态
3. **API 层**：服务端计算金额并校验身份，严禁前端直传 \`price\` 或 \`paid=true\`
4. **数据层**：使用参数化 ORM 写入并记录 \`event_id\` 幂等键
5. **测试层**：Vitest 覆盖正常回调、伪造签名 401、重复回调幂等 200
6. **部署前人工 Review（不可跳过）**：
   - [ ] 搜索代码中无 \`VITE_\` 泄露服务端 Secret
   - [ ] 人工逐行复核鉴权中间件、Webhook 验签与 DB 写入权限`;

export default function P27b() {
  const [decisions, setDecisions] = useState<Record<string, boolean>>({});

  const correctCount = REVIEW_SNIPPETS.filter(
    (s) => decisions[s.id] === s.mustBlock
  ).length;

  return (
    <ModuleLoopStudio
      moduleCode="M3"
      eyebrow="VERTICAL SLICE · 端到端闭环与人工代码 Review"
      title="端到端垂直切片：安全模拟支付与人工 Review 卡点"
      notes="完整贯通 需求→UI→API→数据→测试→部署，全部使用脱敏模拟数据并明确标注人工 Review 不可跳过步骤。"
      objective="能用 AI 协作完成从需求到测试部署的单条垂直切片，并在鉴权、密钥隔离与支付回调环节执行严格的人工代码 Review。"
      boundary="教学与开发联调一律使用脱敏模拟账号（如 test_usr_001）与 MOCK_PAY_SECRET；真实上线前必须由人类复核鉴权、验签与环境变量，绝不把 AI 输出当免检产品。"
      positiveCase={{
        title: "端到端垂直切片闭环（模拟订阅开通链路）",
        scenario: "把「点击试用升级 ➔ 服务端模拟回调验签 ➔ 权限落库 ➔ 回归测试」打通为一条可验证切片。",
        steps: [
          "需求与契约：仅允许前端传 planId，价格与用户 ID 一律从服务端 Session/配置表查取。",
          "人工 Review 核心 30 行：逐行核对服务端 HMAC 验签、processed_events 幂等主键、以及无 VITE_ 秘密变量。",
          "本地跑通 Vitest 异常用例（伪造签名返回 401、重复回调不叠加额度）后通过构建门禁部署。",
        ],
        snippetLabel: "安全模拟回调切片（教学示例）",
        snippet: `// server/routes/mockBilling.ts
if (!verifySig(rawBody, sig, process.env.MOCK_PAY_SECRET)) {
  return res.status(401).json({ error: "Invalid signature" });
}
await grantPlanIdempotent(evt.id, evt.userId, evt.planId);`,
        verdict: "前后端契约一致、无敏感数据暴露、即使无外部真实支付网关也能 100% 闭环自测。",
      }}
      failureCase={{
        title: "绕过服务端鉴权 + 跳过人工 Review 直接上线",
        scenario: "为了让 AI 快速演示“购买成功”效果，直接让前端跳转并信任 URL 参数。",
        steps: [
          "AI 为图省事生成 /success?paid=true 页面逻辑，前端读到参数即调用无鉴权接口升级会员。",
          "把测试 Token 写进 VITE_PAY_TOKEN 并直接提交，构建后明文暴露在浏览器静态资源中。",
          "开发只测了正常点击路径（Happy Path），没做人工 Diff Review 就直接发布。",
        ],
        snippetLabel: "高危错误实现（严禁出现）",
        snippet: `// 危险！用户改地址栏即可白嫖，且 Token 泄露到浏览器端
fetch("/api/set-pro?user=" + userId, {
  headers: { "x-admin": import.meta.env.VITE_PAY_TOKEN }
});`,
        verdict: "AI 默认偏向让界面“看起来能跑通”，极易省略服务端防篡改与边界防御。",
      }}
      practiceTitle="课堂人工 Code Review 排雷练习：判断以下 4 段代码应该「放行」还是「拦截打回」"
      practicePassedCount={correctCount}
      practiceTotalCount={REVIEW_SNIPPETS.length}
      dodItems={[
        {
          id: "m3-dod-1",
          label: "所有敏感密钥仅存服务端环境变量，前端零 VITE_* 私有秘钥",
          verifyHint: "全局搜索 VITE_ 与硬编码 sk_/ghp_ 确认 0 命中",
        },
        {
          id: "m3-dod-2",
          label: "完成右侧 4 段垂直切片代码的 Review 拦截判定",
          verifyHint: "识别前端传 paid=true 绕过与密钥泄露",
        },
        {
          id: "m3-dod-3",
          label: "已导出「端到端垂直切片交付清单与三层架构草图」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="端到端垂直切片交付清单与轻量架构草图"
      artifactFilename="E2E_VERTICAL_SLICE_BLUEPRINT.md"
      artifactContent={E2E_SLICE_ARTIFACT}
      reflectionQuestion="为什么 AI 写独立产品时，最容易在「UI 和正常跳转」上表现满分，却在「鉴权、环境变量和重复回调」上翻车？你的 Review 检查顺序是什么？"
      reflectionHint="因为 UI 问题肉眼可见、Prompt 常描述正常路径，而安全和并发边界属于非功能需求。建议固定 Review 顺序：1) 环境变量与密钥 2) 路由鉴权与入参校验 3) 幂等与错误处理 4) 测试用例是否真实覆盖失败分支。"
      renderPractice={() => (
        <div className="space-y-2 text-xs">
          {REVIEW_SNIPPETS.map((item) => {
            const picked = decisions[item.id];
            const answered = picked !== undefined;
            const correct = picked === item.mustBlock;
            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{item.label}</span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDecisions((p) => ({ ...p, [item.id]: false }))}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer whitespace-nowrap ${
                        picked === false
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15"
                      }`}
                    >
                      放行
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisions((p) => ({ ...p, [item.id]: true }))}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer whitespace-nowrap ${
                        picked === true
                          ? "bg-rose-500 text-white border-rose-400 font-semibold"
                          : "bg-white/5 text-slate-300 border-white/15"
                      }`}
                    >
                      拦截打回
                    </button>
                  </div>
                </div>
                <pre className="p-2 rounded-lg bg-black/50 font-mono text-[10px] text-slate-300 whitespace-pre-wrap">
                  {item.code}
                </pre>
                {answered && (
                  <div
                    className={`text-[11px] px-2 py-1 rounded ${
                      correct ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
                    }`}
                  >
                    {item.explanation}
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
