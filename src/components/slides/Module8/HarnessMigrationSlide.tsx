import { useState } from "react";
import ModuleLoopStudio from "@/components/slides/common/ModuleLoopStudio";

interface MigrationStage {
  id: string;
  stage: string;
  goal: string;
  beforeSnippet: string;
  afterSnippet: string;
  harnessRule: string;
}

const MIGRATION_STAGES: MigrationStage[] = [
  {
    id: "stage-1",
    stage: "阶段 1：拆模块 & 立契约",
    goal: "把 600 行单文件原型拆为共享类型、API 客户端与 UI 展示组件。",
    beforeSnippet: `// Prototype.tsx (UI、Mock 数据、fetch 混在一个文件)\nconst [items, setItems] = useState([{ id: 1, name: "demo" }]);`,
    afterSnippet: `src/types/item.ts         // 共享 DTO 契约\nsrc/lib/itemsApi.ts       // 独立请求层\nsrc/components/ItemList.tsx // 纯展示 + 空/错态`,
    harnessRule: "Harness 边界：一次只迁 1 个子模块；规划阶段禁用写工具防误覆盖主干",
  },
  {
    id: "stage-2",
    stage: "阶段 2：补错误处理与测试",
    goal: "给接口加 Zod 校验与 ErrorBoundary，并补核心边界 Vitest 单测。",
    beforeSnippet: `const res = await fetch("/api/items");\nconst data = await res.json(); // 失败直接白屏`,
    afterSnippet: `const parsed = ItemSchema.safeParse(json);\nif (!parsed.success) return { ok: false, error: "INVALID_PAYLOAD" };\n// + vitest 验证 400/500 降级态`,
    harnessRule: "停止条件：tsc/vitest 连续修补失败 3 轮立即暂停，交回人工定位根因",
  },
  {
    id: "stage-3",
    stage: "阶段 3：替换 Mock 接入真实受控接口",
    goal: "清理硬编码测试数组，对接服务端鉴权路由与真实持久化存储。",
    beforeSnippet: `const MOCK_USER = { role: "admin", isPro: true }; // 假状态`,
    afterSnippet: `const session = await verifyServerSession(req);\nconst rows = await repo.listByOwner(session.userId);`,
    harnessRule: "人工审批：Schema 变更、权限中间件与真实写接口必须经人类逐行 Review",
  },
];

const MIGRATION_ARTIFACT = `# PROTOTYPE_MIGRATION_HARNESS_SOP.md — 原型转工程三步迁移 & Harness 护栏

## 一、从原型到可维护实现的分阶段清单
1. **阶段 1 · 模块拆分**：\`Prototype.tsx\` ➔ \`types/\`（契约）+ \`lib/\`（请求与状态）+ \`components/\`（纯 UI）
2. **阶段 2 · 错误与测试补全**：增加 Zod 校验、Loading/Empty/Error 三态、以及覆盖异常分支的 \`vitest\`
3. **阶段 3 · 清理并替换 Mock 数据**：移除写死数组与假登录态，接入服务端 \`/api/*\` 与持久化存储

## 二、Agent Harness 适用与人工可控边界
- **适用范围**：有明确输入输出与本地验证命令的多文件工程任务
- **上下文压缩保留锚点 (ACC)**：压缩长会话时**强制保留**「架构禁令 + 文件路径边界 + 未通过报错」
- **停止条件 (Stop Condition)**：单任务最大重试 \`3\` 轮；同一错误复现 \`2\` 次即中止并报告人类
- **人工审批边界 (Approval Gate)**：数据库 Schema 迁移、鉴权规则修改、外部写操作与删除指令必须人工确认`;

export default function HarnessMigrationSlide() {
  const [stageIdx, setStageIdx] = useState(0);
  const [reviewedStages, setReviewedStages] = useState<string[]>(["stage-1"]);

  const stage = MIGRATION_STAGES[stageIdx];

  const handleSelectStage = (idx: number) => {
    setStageIdx(idx);
    const id = MIGRATION_STAGES[idx].id;
    setReviewedStages((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <ModuleLoopStudio
      moduleCode="M8"
      eyebrow="OPTIONAL LONG-HORIZON SCENARIO · 原型转工程参考场景与可控边界"
      title="可选参考场景：原型转工程三步迁移 × 长程 Harness 护栏"
      notes="将原型迁入生产仓库作为长程 Coding Harness 的典型参考案例：拆模块、补验证、去 Mock，并显式设定停止条件、ACC 压缩锚点与人工审批边界。"
      objective="能将单文件快速原型分 3 步安全迁入可维护工程结构，并为长程 Agent 设定停止条件、上下文压缩锚点与人工审批边界。"
      boundary="切勿把原型代码整段覆盖现有生产目录；涉及鉴权、Schema 变更或连续自愈失败 3 次时，必须由人类介入审批或接管。"
      positiveCase={{
        title: "三阶段平滑迁移 + Harness 严格护栏",
        scenario: "把 AI Studio 生成的 500 行单文件看板迁移到现有全栈工程仓库。",
        steps: [
          "先拆模块（types + api client + UI 组件），在 Plan 阶段锁定禁止修改现有 auth.ts。",
          "再补 Zod 校验、ErrorBoundary 与 400/500 降级单元测试，跑通 tsc 与 build。",
          "最后替换 Mock 数组为受控 Express /api/* 接口，长会话压缩时保留架构红线锚点。",
        ],
        snippetLabel: "Harness 任务控制卡示例",
        snippet: `maxRetries: 3 | keepAnchors: ["不改 server/auth.ts", "禁用 VITE_ 秘钥"]
humanApprovalRequired: ["schema_migration", "delete_file", "prod_write"]`,
        verdict: "既保留了原型的快速交互体验，又获得了类型安全与可测试架构。",
      }}
      failureCase={{
        title: "整文件覆盖强行粘贴 + 无停止条件死循环",
        scenario: "为了图快，让 Agent 直接按原型重写整个页面并开启全自动循环修报错。",
        steps: [
          "Agent 直接删掉原有的权限守卫组件，把 Mock 假管理员状态保留在了生产页面里。",
          "长对话超过 30 轮后触发自动摘要截断，把最初“禁止引入外部重库”的约束压缩丢了。",
          "构建报错后无人监管继续循环修改了 12 轮，把无关测试也改写得面目全非。",
        ],
        snippetLabel: "失控的原型硬搬症状",
        snippet: `// 常见灾难：覆盖写掉了原有鉴权，且 Mock 数据混入线上打包
const isPaidUser = true; // prototype placeholder left in prod`,
        verdict: "缺乏分阶段拆分、停止阈值与压缩锚点，原型越搬越脆弱。",
      }}
      practiceTitle="课堂迁移演练：逐步查看三阶段迁移改造并核对 Harness 边界（查验全部 3 步）"
      practicePassedCount={reviewedStages.length}
      practiceTotalCount={MIGRATION_STAGES.length}
      dodItems={[
        {
          id: "m8-dod-1",
          label: "原型已拆分为类型/请求/组件三层，无单文件 500 行大杂烩",
          verifyHint: "检查目录职责边界是否清晰",
        },
        {
          id: "m8-dod-2",
          label: "Mock 数据已清理并替换为受控 API + Zod 校验与测试",
          verifyHint: "搜索 MOCK_ 确认生产路径已无占位假状态",
        },
        {
          id: "m8-dod-3",
          label: "已设置最大重试 3 轮停止条件与人工审批边界清单",
          verifyHint: "切换到「03 带走产物 & 复盘」一键复制 SOP",
        },
      ]}
      artifactTitle="原型工程化三步迁移与 Agent Harness 护栏清单"
      artifactFilename="PROTOTYPE_MIGRATION_HARNESS_SOP.md"
      artifactContent={MIGRATION_ARTIFACT}
      reflectionQuestion="如果长程编码 Agent 在同一任务跑了 25 轮后开始“忘了开头立下的禁止修改某接口的约定”，你会在上下文压缩阶段重点保留哪两类信息？"
      reflectionHint="保留「不可违背的红线约束与禁止改动清单」以及「当前未通过的客观验证命令与剩余任务列表」，而把早先已经跑通过的冗长 read_file / 终端日志压缩成文件路径索引。"
      renderPractice={() => (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            {MIGRATION_STAGES.map((st, idx) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStage(idx)}
                className={`p-2 rounded-xl text-left border cursor-pointer transition-colors ${
                  stageIdx === idx
                    ? "bg-gemini-cyan text-slate-950 border-gemini-cyan font-bold"
                    : reviewedStages.includes(st.id)
                    ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/35"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                <div className="font-mono text-[11px]">{st.stage}</div>
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="font-semibold text-white mb-1">{stage.goal}</div>
            <div className="text-[11px] font-mono text-amber-300">{stage.harnessRule}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/30">
              <div className="font-mono text-[10px] text-rose-300 mb-1">
                改造前 · 原型脆弱态
              </div>
              <pre className="font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {stage.beforeSnippet}
              </pre>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30">
              <div className="font-mono text-[10px] text-emerald-300 mb-1">
                改造后 · 可维护工程态
              </div>
              <pre className="font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                {stage.afterSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    />
  );
}
