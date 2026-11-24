export type ProjectLifecycleState =
  | "draft"
  | "static_audited"
  | "submitted"
  | "ai_prereviewed"
  | "human_review"
  | "changes_requested"
  | "approved"
  | "archived";

export interface ProjectLifecycleStageMeta {
  state: ProjectLifecycleState;
  label: string;
  shortLabel: string;
  description: string;
}

export const PROJECT_LIFECYCLE_STAGES: ProjectLifecycleStageMeta[] = [
  {
    state: "draft",
    label: "1. Draft（规格草稿）",
    shortLabel: "Draft",
    description: "创建项目工作区，明确 SPEC.md 与文件白名单边界",
  },
  {
    state: "static_audited",
    label: "2. Static Audit（服务端门禁通过）",
    shortLabel: "Static Audit",
    description: "服务端确定性规则审计通过（零密钥/SQLi/测试作弊/越界路径）",
  },
  {
    state: "submitted",
    label: "3. Submitted（已提交证据）",
    shortLabel: "Submitted",
    description: "附带 SPEC、Diff、测试日志与 Eval 报告提交审校",
  },
  {
    state: "ai_prereviewed",
    label: "4. AI Pre-review（AI 预审初筛）",
    shortLabel: "AI Pre-review",
    description: "仅生成风险与修改建议草稿，不构成最终通过或技能授予",
  },
  {
    state: "human_review",
    label: "5. Human Review（人工审校中）",
    shortLabel: "Human Review",
    description: "导师或企业评审人核查边界、证据与可接管性",
  },
  {
    state: "changes_requested",
    label: "6. Changes Requested（退回修订）",
    shortLabel: "Changes Req",
    description: "未达到验收标准，按审校批注修改后重新提交",
  },
  {
    state: "approved",
    label: "7. Approved（人工批准通过）",
    shortLabel: "Approved",
    description: "导师人工确认通过并核发对应能力认证（SkillGrant）",
  },
  {
    state: "archived",
    label: "8. Evidence Archived（归档可交接）",
    shortLabel: "Archived",
    description: "生成含 Handoff 运维边界与评测日志的完整数字资产包",
  },
];

export type ModuleProgressStage =
  | "not_started"
  | "viewed"
  | "practiced"
  | "submitted"
  | "auto_verified"
  | "human_reviewed"
  | "skill_granted";

export const MODULE_STAGE_LABELS: Record<ModuleProgressStage, string> = {
  not_started: "未开始",
  viewed: "Viewed（已阅读）",
  practiced: "Practiced（已演练）",
  submitted: "Submitted（已交证据）",
  auto_verified: "Auto Verified（自动门禁通过）",
  human_reviewed: "Human Reviewed（人工审校通过）",
  skill_granted: "Skill Granted（能力认证已授）",
};

export interface StarterKitTreeNode {
  path: string;
  purpose: string;
  writable: boolean;
}

export const STANDARD_STARTER_KIT_TREE: StarterKitTreeNode[] = [
  { path: "app/", purpose: "可运行演示前端与入口路由", writable: true },
  { path: "src/", purpose: "核心业务逻辑、检索过滤与工作流实现", writable: true },
  { path: "specs/SPEC.md", purpose: "需求边界、输入输出契约、禁用项与异常回退", writable: true },
  { path: "data/", purpose: "脱敏或公开抽样数据集（严禁导入未脱敏生产隐私数据）", writable: true },
  { path: "rules/00-core-redlines.mdc", purpose: "锁定系统底线规则（密钥/鉴权/防作弊，学员不可覆盖）", writable: false },
  { path: "rules/20-project-domain.mdc", purpose: "项目特定领域约束（globs 精确隔离）", writable: true },
  { path: "tests/", purpose: "自动化验收测试（严禁删断言或加 .skip 凑绿）", writable: true },
  { path: "eval/", purpose: "固定评测集与 Recall@K / Citation / ACL 指标配置", writable: true },
  { path: "evidence/", purpose: "执行日志、Diff 摘要、静态审计与 Eval 快照", writable: true },
  { path: "handoff/HANDOFF.md", purpose: "运维、权限边界、模型成本与人工接管说明", writable: true },
];

export const GEO_EVIDENCE_LAB_DISCLAIMER =
  "边界声明：GEO Evidence Lab 仅构建公开/授权品牌信息监测、结构化语料整理、引用溯源核验、抽样评测与人工审核原型；不承诺、亦不得对外表述为“保证品牌进入 AI 推荐排名或必然提升商业转化”。";

export const FIRST_HOUR_DEFAULT_CHECKLIST: Array<{
  id: string;
  label: string;
  detail: string;
}> = [
  {
    id: "fh-1-boot",
    label: "1. 启动项目工作区并核对文件白名单",
    detail: "阅读 specs/SPEC.md 与 rules/00-core-redlines.mdc，确认允许修改的目录范围。",
  },
  {
    id: "fh-2-change",
    label: "2. 在允许目录内修改一个受控字段或规则",
    detail: "例如在 src/ 或 rules/20-project-domain.mdc 补充来源引用校验规则。",
  },
  {
    id: "fh-3-fail-test",
    label: "3. 观察一次失败校验或阻断反馈",
    detail: "触发一次未绑定权威来源或未勾选边界声明的静态审计/测试失败。",
  },
  {
    id: "fh-4-fix-pass",
    label: "4. 修复并运行确定性验证通过",
    detail: "补齐引用字段或合规边界，通过服务端静态门禁与 Eval 基线。",
  },
  {
    id: "fh-5-diff",
    label: "5. 审查改动文件清单与 Diff 摘要",
    detail: "核对变更文件是否全部位于白名单目录，确认未触碰红线配置与测试断言。",
  },
  {
    id: "fh-6-evidence",
    label: "6. 归档首小时 Evidence & Handoff 报告",
    detail: "生成含 SPEC、Diff、测试日志与边界声明的交付包，验证入门门槛。",
  },
];
