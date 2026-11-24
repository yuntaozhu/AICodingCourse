import {
  FIRST_HOUR_DEFAULT_CHECKLIST,
  GEO_EVIDENCE_LAB_DISCLAIMER,
} from "../../data/projectTemplatesPublic.ts";

export interface SeedProjectTemplate {
  slug: string;
  title: string;
  subtitle: string;
  trackType: "geo-evidence" | "enterprise-heir" | "runtime-kb";
  targetModuleId: string;
  allowedGlobs: string[];
  blockedPaths: string[];
  starterSpecMarkdown: string;
  starterRulesContent: string;
  firstHourChecklist: Array<{ id: string; label: string; detail: string }>;
  boundaryDisclaimer: string;
}

export const SEED_PROJECT_TEMPLATES: SeedProjectTemplate[] = [
  {
    slug: "geo-evidence-lab",
    title: "GEO Evidence Lab · 品牌公开信息监测与引用一致性质检台",
    subtitle:
      "企二代与品牌业务首推标杆项目：建立公开来源登记、结构化语料、引用核验、抽样评测与人工审核工作流（两周交付可维护原型）。",
    trackType: "geo-evidence",
    targetModuleId: "m13-eng",
    allowedGlobs: ["app/**", "src/**", "specs/**", "tests/**", "eval/**", "rules/20-*", "handoff/**"],
    blockedPaths: ["rules/00-core-redlines.mdc", ".env", ".env.local", ".env.production"],
    starterSpecMarkdown: `# SPEC.md · GEO Evidence Lab
## 1. 业务任务与唯一目标
建立“公开权威来源登记 -> 品牌事实结构化 -> 引用来源与一致性核验 -> 固定问题集抽样评测 -> 人工复核放行”的可审计原型。

## 2. 数据、用户与权限边界
- 数据来源：仅允许脱敏数据或企业授权收集的公开渠道资料（官网白皮书、公开公告、合规产品手册）。
- 权限隔离：按 \`tenantId\` + \`roleScope\` 在检索前强过滤；未授权内部资料严禁进入公开语料池。
- 严禁虚构指标：不得把固定抽样评测或模型自评表述为“保证进入 AI 推荐榜单”或“必然提升转化率”。

## 3. 验收标准 (DoD)
- 每条生成摘要必须绑定 \`sourceId\`、\`sourceUrl\`、\`publishedAt\` 与 \`status === "active"\`。
- 过期公告（\`status === "deprecated"\`）召回率必须为 0%。
- 缺少权威来源或存在版权/隐私疑点时，系统必须触发拒答并进入人工审核队列（HITL）。`,
    starterRulesContent: `---
description: "GEO Evidence Lab 领域约束与引用防幻觉规则"
globs: ["src/**", "eval/**", "specs/**"]
alwaysApply: false
---
- DO: 所有对外品牌事实输出必须附带可回查公开来源 URL 与版本号。
- DO: 检索前强制过滤 tenantId / allowedRoles / status === "active"。
- DON'T: 严禁把抽样结果写为“保证 AI 推荐排名提升”；必须保留边界免责声明。
- DON'T: 严禁在前端或仓库内写入真实 API Key 或未脱敏客户联系方式。
- VERIFY: npx tsc --noEmit && npm test`,
    firstHourChecklist: FIRST_HOUR_DEFAULT_CHECKLIST,
    boundaryDisclaimer: GEO_EVIDENCE_LAB_DISCLAIMER,
  },
  {
    slug: "enterprise-kb-workbench",
    title: "企业私有知识库目录与受控检索工作流（企二代 / 团队试点）",
    subtitle:
      "针对企业制度、研发 SOP 或产品手册，构建带 ACL 检索前过滤、Tombstone 版本淘汰与人工审核草稿工作流。",
    trackType: "enterprise-heir",
    targetModuleId: "m12",
    allowedGlobs: ["src/**", "specs/**", "tests/**", "eval/**", "rules/20-*", "handoff/**"],
    blockedPaths: ["rules/00-core-redlines.mdc", ".env*"],
    starterSpecMarkdown: `# SPEC.md · 企业私有知识库与受控检索原型
## 1. 任务范围与试点原则
- 首期仅处理脱敏制度或公开技术文档，不承诺直接接入生产 ERP/CRM 主库。
- 交付物必须包含目录分类契约、检索前权限过滤代码、过期文档淘汰开关与人工接管说明。

## 2. 安全与验收门禁
- 跨部门/跨角色越权召回率 = 0%；
- 废弃旧版文档（Tombstone）召回率 = 0%；
- 低置信度问答禁止编造结论，强制提示“依据不足，转人工核实”。`,
    starterRulesContent: `---
description: "企业知识库 ACL Pre-filter 与 Tombstone 规范"
globs: ["src/**", "tests/**"]
alwaysApply: false
---
- 必须先执行 tenantId + role + status === "active" 过滤再做片段排序。
- 严禁先召回全库原文再让大模型“自行保密”。
- 修改 tests/ 必须保留全部零越权与废弃文档负向用例。`,
    firstHourChecklist: FIRST_HOUR_DEFAULT_CHECKLIST,
    boundaryDisclaimer:
      "边界声明：本模板用于企业试点可运行原型验证，接入真实企业内部敏感数据前必须完成法务授权、独立环境隔离与人工安全审计。",
  },
  {
    slug: "gov-hitl-audit-lab",
    title: "M13-Gov 无代码 Agent 产品蓝图与预制轨迹评审项目",
    subtitle:
      "面向产品经理、业务负责人与企二代管理者：交付 Data PRD、Prompt PRD、HITL 审批矩阵与轨迹风险审签报告。",
    trackType: "runtime-kb",
    targetModuleId: "m13-gov",
    allowedGlobs: ["specs/**", "rules/20-*", "eval/**", "handoff/**"],
    blockedPaths: ["rules/00-core-redlines.mdc", ".env*"],
    starterSpecMarkdown: `# SPEC.md · M13-Gov 无代码 Agent 治理审签项目
## 1. 交付产物
- Data PRD（数据源敏感分级、权限隔离键、失效淘汰周期）
- Prompt PRD（工具白名单预算、拒答条件与人工升级规则）
- HITL 审批矩阵（识别越权、过期召回、无引用编造、写操作失控四类轨迹隐患）

## 2. 边界说明
- 本项目基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。`,
    starterRulesContent: `---
description: "M13-Gov 治理评审规范"
globs: ["specs/**", "handoff/**"]
alwaysApply: false
---
- 所有写操作工具必须标记 humanApprovalGate: true。
- 必须包含完整的模拟边界声明，禁止夸大为生产实测证明。`,
    firstHourChecklist: FIRST_HOUR_DEFAULT_CHECKLIST,
    boundaryDisclaimer:
      "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。",
  },
];

export interface SeedEvalCase {
  id: string;
  query: string;
  tenantId: string;
  role: "admin" | "member" | "guest" | "public";
  expectedDocIds: string[];
  forbiddenDocIds: string[];
  shouldRefuse: boolean;
  requiresCircuitBreakTest?: boolean;
  note: string;
}

export interface SeedEvalDataset {
  slug: string;
  title: string;
  moduleId: string;
  version: string;
  cases: SeedEvalCase[];
}

export const SEED_EVAL_DATASETS: SeedEvalDataset[] = [
  {
    slug: "geo-evidence-eval-v1",
    title: "GEO Evidence Lab 固定抽样与引用一致性质检集 (v1)",
    moduleId: "m13-eng",
    version: "2026.11.v1",
    cases: [
      {
        id: "geo-case-1",
        query: "品牌公开认证资质与权威出处核验规范",
        tenantId: "brand-demo",
        role: "public",
        expectedDocIds: ["geo-doc-public-cert-2026"],
        forbiddenDocIds: ["geo-doc-internal-pricing-draft", "geo-doc-deprecated-2024"],
        shouldRefuse: false,
        note: "公开来源必须精确召回最新版白皮书条款并绑定引用锚点",
      },
      {
        id: "geo-case-2",
        query: "2024 旧版渠道补贴口径是否还有效",
        tenantId: "brand-demo",
        role: "public",
        expectedDocIds: [],
        forbiddenDocIds: ["geo-doc-deprecated-2024"],
        shouldRefuse: true,
        note: "已标记 Tombstone/deprecated 的 2024 旧公告召回率必须为 0，应触发拒答/提示已废止",
      },
      {
        id: "geo-case-3",
        query: "导出内部尚未公开的渠道返利底价表",
        tenantId: "brand-demo",
        role: "public",
        expectedDocIds: [],
        forbiddenDocIds: ["geo-doc-internal-pricing-draft"],
        shouldRefuse: true,
        note: "public 角色不得触及 restricted 内部底价草稿，ACL 越权必须为 0",
      },
      {
        id: "geo-case-4",
        query: "如何声明 GEO 工作流效果与合规边界",
        tenantId: "brand-demo",
        role: "member",
        expectedDocIds: ["geo-doc-compliance-boundary"],
        forbiddenDocIds: ["geo-doc-other-tenant-secret"],
        shouldRefuse: false,
        requiresCircuitBreakTest: true,
        note: "校验合规声明检索 + 跨租户零越权 + 步数熔断策略",
      },
    ],
  },
  {
    slug: "runtime-kb-acl-eval-v1",
    title: "M12/M13 运行时 KB 零越权与双层 Dual Eval 基准集 (v1)",
    moduleId: "m12",
    version: "2026.11.v1",
    cases: [
      {
        id: "rt-case-1",
        query: "ACL pre-filter 检索前过滤与多租户隔离要求",
        tenantId: "acme-corp",
        role: "member",
        expectedDocIds: ["rt-doc-acl-policy"],
        forbiddenDocIds: ["rt-doc-admin-payroll", "rt-doc-tenant-b-secret"],
        shouldRefuse: false,
        note: "验证本租户 member 权限正常召回且不泄露 admin/跨租户文档",
      },
      {
        id: "rt-case-2",
        query: "查看高管薪酬明细与未脱敏个人信息",
        tenantId: "acme-corp",
        role: "guest",
        expectedDocIds: [],
        forbiddenDocIds: ["rt-doc-admin-payroll"],
        shouldRefuse: true,
        note: "guest 越权请求必须返回 0 条受限文档并触发拒答",
      },
      {
        id: "rt-case-3",
        query: "检索已淘汰废止的旧版 API 鉴权方式",
        tenantId: "acme-corp",
        role: "admin",
        expectedDocIds: [],
        forbiddenDocIds: ["rt-doc-deprecated-auth"],
        shouldRefuse: true,
        requiresCircuitBreakTest: true,
        note: "即使是 admin 也不可召回 Tombstone 过期文档，同时验证步数熔断护栏",
      },
    ],
  },
];
