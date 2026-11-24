export type SkillId =
  | "skill-cli-basics"
  | "skill-git-pr-ci"
  | "skill-fullstack-boundary"
  | "skill-backend-api-auth"
  | "skill-ai-project-exp";

export type SkillVerificationMethod =
  | "module-lab-quiz"
  | "starter-repo-evidence"
  | "diagnostic-check"
  | "baseline-waiver";

export interface SkillDiagnosticQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
}

export interface SkillDefinition {
  id: SkillId;
  title: string;
  shortLabel: string;
  description: string;
  acceptedMethods: SkillVerificationMethod[];
  autoGrantedByModuleCompletion: boolean;
  evidencePrompt: string;
  remediationGuide: string;
  remediationModuleId?: string;
  remediationLabId?: string;
  diagnosticQuestions: SkillDiagnosticQuestion[];
}

export const COURSE_SKILLS: SkillDefinition[] = [
  {
    "id": "skill-cli-basics",
    "title": "命令行与构建/测试退出码解读能力",
    "shortLabel": "CLI 与退出码",
    "description": "能在本地终端运行 tsc / eslint / test 命令，定位非零退出码首行根因与环境变量缺失报错。",
    "acceptedMethods": [
      "diagnostic-check",
      "baseline-waiver"
    ],
    "autoGrantedByModuleCompletion": false,
    "evidencePrompt": "贴出一次运行 `npx tsc --noEmit`、`npm run lint` 或 `npm test` 的退出码与定位根因摘要，或通过 2 题命令行诊断。",
    "remediationGuide": "先完成终端基础预备检查：学会区分进程退出码 0/非0、读取首行报错堆栈并核对 .env.example 变量名。",
    "remediationLabId": "vibe-stack-map",
    "diagnosticQuestions": [
      {
        "id": "diag-cli-1",
        "prompt": "运行 `npx tsc --noEmit && npm test` 时，如果 `tsc` 返回退出码 2，会发生什么？",
        "options": [
          "继续执行 `npm test` 并忽略类型报错",
          "`&&` 短路停止，不会执行 `npm test`，终端整体返回非零退出码",
          "自动修复所有 TypeScript 类型错误",
          "退出码 2 代表警告通过，不影响后续步骤"
        ]
      },
      {
        "id": "diag-cli-2",
        "prompt": "本地启动后端报错 `Error: Missing DATABASE_URL` 时，最规范的排查起点是什么？",
        "options": [
          "把数据库密码直接硬编码进前端组件",
          "对照 `.env.example` 检查本地服务端 `.env` 是否缺失该变量，而非修改前端代码",
          "把报错堆栈全文发给公开群聊请求盲修",
          "删除读取 `process.env.DATABASE_URL` 的校验代码"
        ]
      }
    ]
  },
  {
    "id": "skill-git-pr-ci",
    "title": "Git 分支协作、Pull Request 与 CI 基础",
    "shortLabel": "Git / PR / CI",
    "description": "能创建独立特性分支、阅读 `git diff --stat`、处理合并冲突并理解 CI 状态检查门禁。",
    "acceptedMethods": [
      "diagnostic-check",
      "baseline-waiver"
    ],
    "autoGrantedByModuleCompletion": false,
    "evidencePrompt": "提供分支隔离工作流说明（特性分支名 + diff 审查重点）或通过 Git/PR/CI 入门诊断。",
    "remediationGuide": "进入 M6 前需掌握特性分支隔离（禁止直接提交 main）、查看 PR Diff 与分支保护检查。",
    "diagnosticQuestions": [
      {
        "id": "diag-git-1",
        "prompt": "为什么不应让后台 Agent 直接向 `main` 分支强制推送提交？",
        "options": [
          "`main` 分支不支持多人协作",
          "会绕过 Pull Request 独立上下文审查与 CI 自动化门禁，直接污染稳定主干",
          "Git 不允许向 `main` 提交自动生成代码",
          "后台 Agent 在 `main` 分支运行得更慢"
        ]
      },
      {
        "id": "diag-git-2",
        "prompt": "评审 AI 生成的 PR 时，为什么应先看 `git diff --stat`？",
        "options": [
          "统计谁写的代码行数最多",
          "快速识别是否越界改动了不在需求范围内的共享模块或测试断言",
          "可以自动压缩历史 commit",
          "用于美化 PR 描述排版"
        ]
      }
    ]
  },
  {
    "id": "skill-fullstack-boundary",
    "title": "前端 / 服务端 / 数据库三层职责与边界认知",
    "shortLabel": "三层全栈边界",
    "description": "能准确区分客户端展示状态、服务端权威鉴权/业务规则、数据库持久化与环境变量边界。",
    "acceptedMethods": [
      "module-lab-quiz",
      "diagnostic-check",
      "baseline-waiver"
    ],
    "autoGrantedByModuleCompletion": false,
    "evidencePrompt": "完成 M9 全栈图谱（Lab 07 + Lab 11）且 M9 测验准确率 ≥ 75%，或通过三层架构诊断。",
    "remediationGuide": "请先学习 M9（Vibe 全栈图谱与白盒排错）或完成三层边界诊断，明确“前端不可信、密钥仅存服务端”。",
    "remediationModuleId": "m9",
    "remediationLabId": "vibe-stack-map",
    "diagnosticQuestions": [
      {
        "id": "diag-fs-1",
        "prompt": "在 Vite React 应用中，如果把第三方管理 API Key 放进 `VITE_SECRET_KEY` 会导致什么后果？",
        "options": [
          "Key 会被 Vite 自动加密存储在服务端",
          "Key 会被打包进浏览器端 JS 产物，任何访客均可通过开发者工具直接提取",
          "只有管理员登录后才会加载该变量",
          "构建时会报错并自动转移到 Express 代理"
        ]
      },
      {
        "id": "diag-fs-2",
        "prompt": "浏览器控制台出现 `401 Unauthorized` 访问 `/api/orders`，最合理的责任归属定位是？",
        "options": [
          "Tailwind CSS 样式类名写错",
          "服务端鉴权中间件拒绝了请求（未携带有效会话凭证或 Token 过期）",
          "浏览器不支持 JSON 解析",
          "数据库磁盘已满"
        ]
      }
    ]
  },
  {
    "id": "skill-backend-api-auth",
    "title": "服务端鉴权、输入校验与防越权写库能力",
    "shortLabel": "服务端鉴权与数据隔离",
    "description": "能独立编写或核验带 Schema 校验、服务端会话/Webhook 验签及最小权限数据隔离的后端路由，而非只停留在静态前端原型。",
    "acceptedMethods": [
      "starter-repo-evidence",
      "diagnostic-check",
      "baseline-waiver"
    ],
    "autoGrantedByModuleCompletion": false,
    "evidencePrompt": "严禁仅因勾选完 M3 就自动发放！需提交可核验的 Starter 后端鉴权/Webhook 验签实现记录（含 401/403 异常测试用例结果），或通过服务端安全诊断测评。",
    "remediationGuide": "完成 M3 真实后端鉴权 Starter 验证任务（提交验签与 401/403 拒绝测试证据），或完成下方能力诊断。",
    "remediationModuleId": "m3",
    "remediationLabId": "bugbot-review",
    "diagnosticQuestions": [
      {
        "id": "diag-auth-1",
        "prompt": "用户从第三方支付页跳回 `/checkout/success?paid=true` 时，服务端应如何更新会员权限？",
        "options": [
          "前端读取 `?paid=true` 后请求 `/api/upgrade` 立即开通",
          "只认带有有效加密签名的服务端 Webhook 事件（校验签名 + 事件幂等锁后再写库），前端仅轮询状态",
          "在 `localStorage` 写入 `isPro=true` 即可",
          "在 URL 参数附带订单金额由后端直接信任"
        ]
      },
      {
        "id": "diag-auth-2",
        "prompt": "构建多租户知识库查询接口 `/api/kb/query` 时，应在哪个环节执行租户/角色权限过滤？",
        "options": [
          "先向量召回全库前 10 条，再在 Prompt 里嘱咐 LLM“不要说出不属于该用户的内容”",
          "在检索查询阶段强制注入 `tenantId` / `role` 元数据 pre-filter，从数据源头隔离无权文档",
          "在前端页面隐藏无权卡片的 DOM 节点",
          "只对管理员开放搜索框即可"
        ]
      }
    ]
  },
  {
    "id": "skill-ai-project-exp",
    "title": "真实 AI 辅助项目多轮迭代与返工治理经验",
    "shortLabel": "AI 迭代实战经验",
    "description": "至少经历过 1 轮完整的 AI 辅助代码项目迭代（包含上下文失控或测试回退的返工与修复过程），能读懂真实的返工成本。",
    "acceptedMethods": [
      "starter-repo-evidence",
      "diagnostic-check",
      "baseline-waiver"
    ],
    "autoGrantedByModuleCompletion": false,
    "evidencePrompt": "严禁仅因勾选完 M3 就自动发放！需填写至少 1 份真实/Starter 项目的迭代记录（仓库切片范围、真实遭遇的 1 次返工原因与最终验证命令输出），或通过迭代治理诊断。",
    "remediationGuide": "请补充 1 轮真实或 Starter 仓库的多步迭代复盘记录（含一次返工定位与回归验证证据），或完成能力诊断。",
    "remediationModuleId": "m3",
    "remediationLabId": "plan-prompt",
    "diagnosticQuestions": [
      {
        "id": "diag-exp-1",
        "prompt": "判断一个团队引入 AI Coding 后是否真正提升 ROI，最可靠的组合指标是什么？",
        "options": [
          "每周 AI 生成总代码行数（LoC）与 Tab 补全次数",
          "MTTV（修改到 CI 全绿耗时）、首次评审通过率与 7 天缺陷返工率",
          "Prompt 平均字数长度",
          "开发者每天发起的对话次数"
        ]
      },
      {
        "id": "diag-exp-2",
        "prompt": "某功能用 AI 连续自动修错 3 轮仍未通过测试，反而越改越乱，正确止损动作是？",
        "options": [
          "提高重试上限到 20 轮让它继续试",
          "立即中止自愈循环，回退至最近通过检查点并拆小切片人工排查根因",
          "删掉失败的测试用例让 CI 变绿",
          "把所有文件全部 `@` 进同一个新对话让模型重写一遍"
        ]
      }
    ]
  }
];

export function getSkillById(skillId: SkillId): SkillDefinition | undefined {
  return COURSE_SKILLS.find((s) => s.id === skillId);
}

export interface ModuleGraphNodeLike {
  id: string;
  labIds: string[];
  prerequisiteModuleIds: string[];
  prerequisiteSkillIds: SkillId[];
  grantsSkillIds: SkillId[];
}

export interface LearnerPathLike {
  id: string;
  recommendedModuleIds: string[];
  assumedBaselineIds: string[];
  assumedBaselineSkillIds: SkillId[];
  starterLabId: string;
  capstoneTargetId: "m13-gov" | "m13-eng";
}

export interface CurriculumIntegrityReport {
  valid: boolean;
  errors: string[];
}

export function validateCurriculumGraph(input: {
  modules: ModuleGraphNodeLike[];
  labs: { id: string; moduleId: string }[];
  paths: LearnerPathLike[];
  skills?: SkillDefinition[];
}): CurriculumIntegrityReport {
  const errors: string[] = [];
  const skills = input.skills ?? COURSE_SKILLS;
  const skillMap = new Map(skills.map((s) => [s.id, s]));
  const moduleMap = new Map<string, ModuleGraphNodeLike>();
  const labMap = new Map<string, { id: string; moduleId: string }>();

  // 1. Unique IDs
  for (const mod of input.modules) {
    if (moduleMap.has(mod.id)) {
      errors.push(`Duplicate module ID: ${mod.id}`);
    }
    moduleMap.set(mod.id, mod);
  }
  for (const lab of input.labs) {
    if (labMap.has(lab.id)) {
      errors.push(`Duplicate lab ID: ${lab.id}`);
    }
    labMap.set(lab.id, lab);
  }
  const seenSkillIds = new Set<string>();
  for (const sk of skills) {
    if (seenSkillIds.has(sk.id)) {
      errors.push(`Duplicate skill ID: ${sk.id}`);
    }
    seenSkillIds.add(sk.id);
    if (sk.autoGrantedByModuleCompletion) {
      errors.push(
        `Skill ${sk.id} must not set autoGrantedByModuleCompletion=true; require verifiable evidence or diagnostic/waiver`
      );
    }
  }

  // 2. Reference checks on modules
  for (const mod of input.modules) {
    for (const prereqMod of mod.prerequisiteModuleIds) {
      if (!moduleMap.has(prereqMod)) {
        errors.push(`Module ${mod.id} references unknown prerequisiteModuleId '${prereqMod}'`);
      }
    }
    for (const prereqSkill of mod.prerequisiteSkillIds) {
      if (!skillMap.has(prereqSkill)) {
        errors.push(`Module ${mod.id} references unknown prerequisiteSkillId '${prereqSkill}'`);
      }
    }
    for (const grantSkill of mod.grantsSkillIds) {
      if (!skillMap.has(grantSkill)) {
        errors.push(`Module ${mod.id} references unknown grantsSkillId '${grantSkill}'`);
      }
    }
    for (const lid of mod.labIds) {
      if (!labMap.has(lid)) {
        errors.push(`Module ${mod.id} references unknown labId '${lid}'`);
      }
    }
  }

  // 3. DAG acyclicity check (3-color DFS)
  const visitState = new Map<string, "visiting" | "visited">();
  const hasCycle = (nodeId: string, stack: string[]): boolean => {
    const state = visitState.get(nodeId);
    if (state === "visiting") {
      errors.push(`Cycle detected in prerequisiteModuleIds: ${[...stack, nodeId].join(" -> ")}`);
      return true;
    }
    if (state === "visited") return false;
    visitState.set(nodeId, "visiting");
    const node = moduleMap.get(nodeId);
    if (node) {
      for (const dep of node.prerequisiteModuleIds) {
        if (hasCycle(dep, [...stack, nodeId])) return true;
      }
    }
    visitState.set(nodeId, "visited");
    return false;
  };
  for (const mod of input.modules) {
    hasCycle(mod.id, []);
  }

  // Ensure starter-repo-evidence skills are never auto-granted via grantsSkillIds
  for (const mod of input.modules) {
    for (const grantSkillId of mod.grantsSkillIds) {
      const skDef = skillMap.get(grantSkillId);
      if (skDef && skDef.acceptedMethods.includes("starter-repo-evidence")) {
        errors.push(
          `Module ${mod.id} grantsSkillIds must not auto-grant evidence-gated skill '${grantSkillId}'`
        );
      }
    }
  }

  // 4. Learner path sequential closure, assumedBaseline closure, starterLab & capstone checks
  for (const pathDef of input.paths) {
    const availableModules = new Set<string>();
    const availableSkills = new Set<SkillId>(pathDef.assumedBaselineSkillIds);
    const reachableEvidenceSkills = new Set<SkillId>(pathDef.assumedBaselineSkillIds);

    // Check unknown IDs in baselines
    for (const baseSkill of pathDef.assumedBaselineSkillIds) {
      if (!skillMap.has(baseSkill)) {
        errors.push(`Path ${pathDef.id} declares unknown assumedBaselineSkillId '${baseSkill}'`);
      }
    }

    // Check assumedBaselineIds module closure
    for (const baseModId of pathDef.assumedBaselineIds) {
      const baseMod = moduleMap.get(baseModId);
      if (!baseMod) {
        errors.push(`Path ${pathDef.id} declares unknown assumedBaselineId '${baseModId}'`);
        continue;
      }
      for (const reqMod of baseMod.prerequisiteModuleIds) {
        if (!pathDef.assumedBaselineIds.includes(reqMod)) {
          errors.push(
            `Path ${pathDef.id} assumedBaselineId '${baseModId}' is missing its prerequisite '${reqMod}' in assumedBaselineIds`
          );
        }
      }
      for (const reqSkill of baseMod.prerequisiteSkillIds) {
        if (!availableSkills.has(reqSkill)) {
          errors.push(
            `Path ${pathDef.id} assumedBaselineId '${baseModId}' requires skill '${reqSkill}' not in assumedBaselineSkillIds`
          );
        }
      }
      availableModules.add(baseModId);
      for (const granted of baseMod.grantsSkillIds) {
        availableSkills.add(granted);
        reachableEvidenceSkills.add(granted);
      }
      for (const sk of skills) {
        if (sk.remediationModuleId === baseModId) {
          reachableEvidenceSkills.add(sk.id);
        }
      }
    }

    // Sequential topological & skill closure check across recommendedModuleIds
    const seenInPath = new Set<string>();
    for (const modId of pathDef.recommendedModuleIds) {
      if (seenInPath.has(modId)) {
        errors.push(`Path ${pathDef.id} lists duplicate module '${modId}'`);
      }
      seenInPath.add(modId);

      const mod = moduleMap.get(modId);
      if (!mod) {
        errors.push(`Path ${pathDef.id} references unknown module '${modId}'`);
        continue;
      }

      for (const reqMod of mod.prerequisiteModuleIds) {
        if (!availableModules.has(reqMod)) {
          errors.push(
            `Path ${pathDef.id} module '${modId}' requires prerequisite module '${reqMod}' earlier in path or assumedBaselineIds`
          );
        }
      }
      for (const reqSkill of mod.prerequisiteSkillIds) {
        const skDef = skillMap.get(reqSkill);
        const canSatisfyViaEvidenceGate =
          Boolean(skDef?.acceptedMethods.includes("starter-repo-evidence")) &&
          reachableEvidenceSkills.has(reqSkill);
        if (!availableSkills.has(reqSkill) && !canSatisfyViaEvidenceGate) {
          errors.push(
            `Path ${pathDef.id} module '${modId}' requires skill '${reqSkill}' before it is unlocked, evidence-gated, or waived`
          );
        }
      }

      availableModules.add(mod.id);
      for (const granted of mod.grantsSkillIds) {
        availableSkills.add(granted);
        reachableEvidenceSkills.add(granted);
      }
      for (const sk of skills) {
        if (sk.remediationModuleId === mod.id) {
          reachableEvidenceSkills.add(sk.id);
        }
      }
    }

    // Capstone target alignment check
    if (!seenInPath.has(pathDef.capstoneTargetId)) {
      errors.push(
        `Path ${pathDef.id} capstoneTargetId '${pathDef.capstoneTargetId}' is missing from recommendedModuleIds`
      );
    }

    // starterLabId existence, module ownership & prerequisite satisfaction check
    const starterLab = labMap.get(pathDef.starterLabId);
    if (!starterLab) {
      errors.push(`Path ${pathDef.id} starterLabId '${pathDef.starterLabId}' does not exist`);
    } else {
      const starterMod = moduleMap.get(starterLab.moduleId);
      if (!starterMod || !starterMod.labIds.includes(starterLab.id)) {
        errors.push(
          `Path ${pathDef.id} starterLabId '${starterLab.id}' is not attached to module '${starterLab.moduleId}'`
        );
      } else if (!seenInPath.has(starterMod.id)) {
        errors.push(
          `Path ${pathDef.id} starterLabId '${starterLab.id}' belongs to '${starterMod.id}' which is not in recommendedModuleIds`
        );
      } else {
        const idx = pathDef.recommendedModuleIds.indexOf(starterMod.id);
        if (idx !== 0) {
          errors.push(
            `Path ${pathDef.id} starterLabId '${starterLab.id}' belongs to '${starterMod.id}' at index ${idx}, expected index 0 (${pathDef.recommendedModuleIds[0]})`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface ModuleReadinessEvaluation {
  ready: boolean;
  missingModuleIds: string[];
  missingSkillIds: SkillId[];
}

export function evaluateModuleReadiness(input: {
  module: Pick<ModuleGraphNodeLike, "prerequisiteModuleIds" | "prerequisiteSkillIds">;
  completedModuleIds: Set<string>;
  verifiedSkillIds: Set<SkillId>;
  assumedBaselineIds?: string[];
  assumedBaselineSkillIds?: SkillId[];
}): ModuleReadinessEvaluation {
  const effectiveModules = new Set([
    ...input.completedModuleIds,
    ...(input.assumedBaselineIds ?? []),
  ]);
  const effectiveSkills = new Set<SkillId>([
    ...input.verifiedSkillIds,
    ...(input.assumedBaselineSkillIds ?? []),
  ]);

  const missingModuleIds = input.module.prerequisiteModuleIds.filter(
    (id) => !effectiveModules.has(id)
  );
  const missingSkillIds = input.module.prerequisiteSkillIds.filter(
    (id) => !effectiveSkills.has(id)
  );

  return {
    ready: missingModuleIds.length === 0 && missingSkillIds.length === 0,
    missingModuleIds,
    missingSkillIds,
  };
}

/**
 * Helper verifying whether completing a module is allowed to auto-grant a skill.
 * By curriculum rule, NO skill is ever auto-granted solely by ticking module completion.
 */
export function computeAutoGrantedSkillsOnModuleComplete(
  moduleId: string
): SkillId[] {
  void moduleId;
  return [];
}

export interface ModuleTopologicalSortResult {
  acyclic: boolean;
  topologicalOrder: string[];
  cyclicModuleIds: string[];
}

/**
 * Computes a deterministic Kahn topological ordering for the module prerequisite DAG.
 * Every edge `prereqModId -> mod.id` requires `prereqModId` to precede `mod.id`.
 */
export function computeModuleTopologicalOrder(
  modules: ModuleGraphNodeLike[]
): ModuleTopologicalSortResult {
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  const moduleIds = new Set(modules.map((m) => m.id));

  for (const mod of modules) {
    inDegree.set(mod.id, 0);
    dependents.set(mod.id, []);
  }

  for (const mod of modules) {
    const uniquePrereqs = new Set(mod.prerequisiteModuleIds);
    for (const prereqId of uniquePrereqs) {
      if (!moduleIds.has(prereqId)) continue;
      inDegree.set(mod.id, (inDegree.get(mod.id) ?? 0) + 1);
      dependents.get(prereqId)!.push(mod.id);
    }
  }

  const queue: string[] = [];
  for (const mod of modules) {
    if ((inDegree.get(mod.id) ?? 0) === 0) {
      queue.push(mod.id);
    }
  }

  const topologicalOrder: string[] = [];
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    topologicalOrder.push(currentId);
    for (const nextId of dependents.get(currentId) ?? []) {
      const nextDegree = (inDegree.get(nextId) ?? 0) - 1;
      inDegree.set(nextId, nextDegree);
      if (nextDegree === 0) {
        queue.push(nextId);
      }
    }
  }

  const orderedSet = new Set(topologicalOrder);
  const cyclicModuleIds = modules
    .map((m) => m.id)
    .filter((id) => !orderedSet.has(id));

  return {
    acyclic: cyclicModuleIds.length === 0 && topologicalOrder.length === modules.length,
    topologicalOrder,
    cyclicModuleIds,
  };
}

