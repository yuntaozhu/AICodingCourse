import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface ContextFaultCase {
  id: string;
  faultType: string;
  symptom: string;
  options: { id: string; label: string; isCorrect: boolean; feedback: string }[];
}

const FAULT_CASES: ContextFaultCase[] = [
  {
    id: "missing-context",
    faultType: "故障 A · 上下文不足（缺少类型契约）",
    symptom:
      "让 Agent 给结算页加折扣展示，结果前端写了 user.discountRate，而后端实际字段是 discountBps（基点整数），运行报错 NaN。",
    options: [
      {
        id: "a1",
        label: "只把组件代码再贴一遍让它猜字段名",
        isCorrect: false,
        feedback: "盲贴单文件仍然看不到后端 DTO，还是会猜错单位。",
      },
      {
        id: "a2",
        label: "同时 @src/types/billing.ts 与 @server/routes/checkout.ts",
        isCorrect: true,
        feedback: "正确！跨模块任务必须显式挂载共享契约与调用端文件，消除字段名与单位漂移。",
      },
    ],
  },
  {
    id: "noisy-context",
    faultType: "故障 B · 上下文过多/噪音淹没",
    symptom:
      "用 @Codebase 检索权限逻辑时，命中了 dist/bundle.js 和 4 万行 package-lock.json，Agent 注意力被稀释，漏改了真实路由。",
    options: [
      {
        id: "b1",
        label: "在 .cursorignore 加入 dist/、*.lock、*.log 后缩小到 @server/middleware/",
        isCorrect: true,
        feedback: "正确！先通过 .cursorignore 屏蔽编译产物和锁文件，再用 @Folders 锁定真源码目录。",
      },
      {
        id: "b2",
        label: "把整个仓库打包成超大 txt 全量喂进单次对话",
        isCorrect: false,
        feedback: "噪音越多的全量打包反而触发 Context Rot，关键约束被淹没。",
      },
    ],
  },
  {
    id: "stale-context",
    faultType: "故障 C · 过时上下文污染",
    symptom:
      "同一个聊天窗口连续改了 35 轮，刚才把 API 从 REST 改成 tRPC 后，Agent 还在按第 3 轮的旧 REST 路径打补丁。",
    options: [
      {
        id: "c1",
        label: "在原长对话里继续骂它“别用旧路径了”",
        isCorrect: false,
        feedback: "历史长上下文里仍残留几十轮旧代码片段，注意力权重依然会被旧范式拉偏。",
      },
      {
        id: "c2",
        label: "提交阶段快照 ➔ 新开 Chat ➔ 只注入最新契约文件与当前目标",
        isCorrect: true,
        feedback: "正确！新任务或架构切换后立即重置干净对话，配合短摘要彻底清空过时记忆。",
      },
    ],
  },
];

const CONTEXT_ARTIFACT = `# CONTEXT_CHECKLIST_AND_LOG.md — 任务-文件-上下文-约束检查表

## 1. 上下文投喂四项核对表（每次跨模块任务前 60 秒自检）
| 检查维度 | 本次实际填写（示例：订单退款状态跨模块改动） | 排除项（防噪音） |
| :--- | :--- | :--- |
| **任务目标** | 新增退款状态 \`refunded\` 并更新列表徽章与对账接口 | 不顺带重构无关分页组件 |
| **必挂核心文件** | \`@src/types/order.ts\` \`@server/routes/orders.ts\` \`@tests/orders.test.ts\` | 不挂 \`dist/\` 与打包产物 |
| **上下文约束** | 遵守 \`.cursorignore\` 屏蔽 \`*.lock / *.log / .env*\`；已新开干净会话 | 不沿用 >20 轮含旧报错的长对话 |
| **验证命令** | \`npx tsc --noEmit && npx vitest run tests/orders.test.ts\` | 严禁跳过类型检查直接交付 |

## 2. 上下文验证记录（Verification Log）
- **核对人 / 日期**：__________
- **索引命中是否干净**（无 \`dist/\`、\`coverage/\` 干扰）：[ ] 是
- **跨端字段名/枚举是否对齐契约文件**：[ ] 是
- **遗留风险备注**：__________`;

export default function P12d() {
  const [selectedFixes, setSelectedFixes] = useState<Record<string, string>>({});

  const solvedCount = FAULT_CASES.filter((c) => {
    const picked = selectedFixes[c.id];
    return c.options.find((o) => o.id === picked)?.isCorrect;
  }).length;

  return (
    <ModuleLoopStudio
      moduleCode="M2"
      eyebrow="CROSS-MODULE CONTEXT · 跨模块定位、降噪与上下文修复"
      title="跨模块文件选择与三类上下文故障修复演练"
      notes="补充跨模块精准文件定位与噪音排除案例，并对比上下文不足、过多与过时三类常见故障及修复练习。"
      objective="能为跨前端/后端/测试的任务精准筛选必挂文件、用 .cursorignore 剔除无关噪音，并识别与修复不足/过多/过时三类上下文故障。"
      boundary="不要迷信“把全仓库都塞进对话框”；永远只挂载「共享类型契约 + 目标改动文件 + 对应测试」，并用 .cursorignore 排除构建产物与锁文件。"
      positiveCase={{
        title: "跨模块精准选文件 + 排除噪音（订单退款状态升级）",
        scenario: "需要在前后端与单元测试同步支持 `refunded` 状态。",
        steps: [
          "确认根目录 .cursorignore 已屏蔽 dist/、node_modules/、*.lock、.env*，保证 @Codebase 召回纯净。",
          "新开一条独立对话，精准 @ 挂载 3 个核心文件：共享类型 + 服务端路由 + 回归测试文件。",
          "先让 Agent 对齐枚举值再改 UI 展示，最后运行 tsc 与对应单测验证零遗漏。",
        ],
        snippetLabel: "高信噪比跨模块投喂指令",
        snippet: `[New Chat] @src/types/order.ts @server/routes/orders.ts @tests/orders.test.ts
需求: 为 OrderStatus 增加 'refunded'，同步前端状态展示与服务端状态流转校验。
禁止: 不修改支付网关配置；完成后运行 npx tsc --noEmit && npm test`,
        verdict: "Token 消耗下降 60%+，三层字段命名与状态流转一次性对齐。",
      }}
      failureCase={{
        title: "三类高频上下文故障（不足 / 噪音 / 过时）",
        scenario: "不清理上下文边界直接跨模块修改，典型症状表现：",
        steps: [
          "上下文不足：只 @ 了前端组件没 @ 后端路由，AI 凭空臆造接口字段（如把 discountBps 猜成 discountRate）。",
          "上下文过多/噪音：未配置 .cursorignore 或一次挂载 30 个文件，锁文件与打包日志挤爆预算导致遗漏关键约束。",
          "上下文过时：在 40 轮老对话里继续重构，Agent 被前 20 轮的已废弃路径与旧报错带偏。",
        ],
        snippetLabel: "典型错误对话特征",
        snippet: `@Codebase (未忽略 dist/ 与 package-lock.json)
在同一超长会话第 38 轮: "顺便把退款状态也加上，怎么又报 undefined？"`,
        verdict: "缺乏契约锚点、噪音过高或历史残留污染了模型注意力分布。",
      }}
      practiceTitle="课堂故障修复练习：为三类上下文事故选择正确的修复动作"
      practicePassedCount={solvedCount}
      practiceTotalCount={FAULT_CASES.length}
      dodItems={[
        {
          id: "m2-dod-1",
          label: "仓库根目录已配置 .cursorignore 排除 dist/、*.lock、.env*",
          verifyHint: "用 @Codebase 搜索关键词时确认返回结果不含编译产物",
        },
        {
          id: "m2-dod-2",
          label: "完成右侧 3 类上下文故障修复判定",
          verifyHint: "覆盖不足（补契约）、过多（降噪）、过时（新开会话）",
        },
        {
          id: "m2-dod-3",
          label: "带走并填写「任务-文件-上下文-约束检查表」",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制",
        },
      ]}
      artifactTitle="跨模块任务-文件-上下文-约束检查表与验证记录"
      artifactFilename="CONTEXT_CHECKLIST_AND_LOG.md"
      artifactContent={CONTEXT_ARTIFACT}
      reflectionQuestion="如果一个模块跨越了 6 个目录且你接手时并不熟悉，你会按什么顺序挑选第一批给 AI 看的文件，防止一上来就上下文过载？"
      reflectionHint="遵循「入口 + 契约 + 测试」三件套顺序：1) 路由/页面入口文件确定调用链；2) 共享 Types/Schema 锁定数据结构；3) 现有单测摸清预期行为。先读懂这三类再决定是否展开子模块。"
      renderPractice={() => (
        <div className="space-y-2.5 text-xs">
          {FAULT_CASES.map((item) => {
            const pickedId = selectedFixes[item.id];
            const pickedOpt = item.options.find((o) => o.id === pickedId);
            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2"
              >
                <div className="font-mono text-[11px] text-amber-300">{item.faultType}</div>
                <div className="text-slate-200 leading-snug">{item.symptom}</div>
                <div className="grid grid-cols-2 gap-2">
                  {item.options.map((opt) => {
                    const active = pickedId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSelectedFixes((prev) => ({ ...prev, [item.id]: opt.id }))
                        }
                        className={`p-2 rounded-lg text-left text-[11px] border cursor-pointer transition-colors ${
                          active
                            ? opt.isCorrect
                              ? "bg-emerald-500/15 border-emerald-400/45 text-emerald-100"
                              : "bg-rose-500/15 border-rose-400/45 text-rose-100"
                            : "bg-white/5 border-white/10 text-slate-300 hover:border-white/25"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {pickedOpt && (
                  <div
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg ${
                      pickedOpt.isCorrect ? "text-emerald-300 bg-emerald-500/10" : "text-rose-300 bg-rose-500/10"
                    }`}
                  >
                    {pickedOpt.feedback}
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
