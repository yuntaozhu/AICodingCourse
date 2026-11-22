import {
  COURSE_MODULE_RECORDS,
  getUnitsForPlan,
  type CourseModuleRecord,
} from "./courseUnitsModel";
import {
  LAB_ARTIFACTS_STORAGE_KEY,
  LAB_DOD_STORAGE_KEY,
  LEGACY_M4_MCP_DOD_KEY,
} from "./labPracticeEngine";
import {
  getBookGithubUrl,
  type KnowledgeBookItem,
} from "./aiBooksKnowledgeBase";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  KNOWLEDGE_TRACK_LABELS,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
  type TeamKnowledgeEntry,
} from "./teamKnowledgeBase";
import {
  RUNTIME_KB_WORKSHOP_RULES,
  RUNTIME_PIPELINE_STAGE_LABELS,
  type RuntimeKnowledgeEntry,
} from "./runtimeKnowledgeBase";
import { COURSE_SKILLS, type SkillId, type SkillVerificationMethod } from "./courseSkills";
import { getQuizReviewSummary, MODULE_QUIZZES } from "./moduleQuizzes";

export const M13_GOV_SIMULATION_DISCLAIMER =
  "本验收基于预制轨迹与固定评测集进行模拟治理评审，不构成对生产运行系统的实测验证。";

export type CourseViewMode = "learner" | "instructor";

export interface PracticeNoteRecord {
  artifactDraft: string;
  reflectionNote: string;
  selectedTransferTier?: string;
  updatedAt: string;
}

export interface CustomKnowledgeDraft {
  id: string;
  title: string;
  moduleCode: KnowledgeModuleCode;
  category: KnowledgeCategory;
  scope: string;
  content: string;
  cautionNote: string;
  updatedAt: string;
}

export interface LastVisitedRecord {
  moduleId: string;
  unitId: string;
  planId: string;
  updatedAt: string;
}

export interface SkillVerificationRecord {
  skillId: SkillId;
  method: SkillVerificationMethod;
  evidenceSummary: string;
  verifiedAt: string;
}

export interface CourseWorkspaceState {
  viewMode: CourseViewMode;
  selectedPlanByModule: Record<string, string>;
  completedUnitIds: Record<string, boolean>;
  dodCheckedByUnit: Record<string, string[]>;
  practiceNotes: Record<string, PracticeNoteRecord>;
  customKbEntries: CustomKnowledgeDraft[];
  verifiedSkills: Record<string, SkillVerificationRecord>;
  lastVisited: LastVisitedRecord | null;
}

export const COURSE_WORKSPACE_STORAGE_KEY = "aicoding_course_workspace_v1";
export const QUIZ_ANSWERS_STORAGE_KEY = "cursor_course_quiz_v1";
export const COMPLETED_MODULES_STORAGE_KEY = "cursor_course_completed_modules_v1";

export function createInitialWorkspaceState(): CourseWorkspaceState {
  return {
    viewMode: "learner",
    selectedPlanByModule: {},
    completedUnitIds: {},
    dodCheckedByUnit: {},
    practiceNotes: {},
    customKbEntries: [],
    verifiedSkills: {},
    lastVisited: null,
  };
}

export function loadWorkspaceState(): CourseWorkspaceState {
  const base = createInitialWorkspaceState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(COURSE_WORKSPACE_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<CourseWorkspaceState>;
    if (!parsed || typeof parsed !== "object") return base;
    return {
      viewMode: parsed.viewMode === "instructor" ? "instructor" : "learner",
      selectedPlanByModule:
        parsed.selectedPlanByModule && typeof parsed.selectedPlanByModule === "object"
          ? parsed.selectedPlanByModule
          : {},
      completedUnitIds:
        parsed.completedUnitIds && typeof parsed.completedUnitIds === "object"
          ? parsed.completedUnitIds
          : {},
      dodCheckedByUnit:
        parsed.dodCheckedByUnit && typeof parsed.dodCheckedByUnit === "object"
          ? parsed.dodCheckedByUnit
          : {},
      practiceNotes:
        parsed.practiceNotes && typeof parsed.practiceNotes === "object"
          ? parsed.practiceNotes
          : {},
      customKbEntries: Array.isArray(parsed.customKbEntries) ? parsed.customKbEntries : [],
      verifiedSkills:
        parsed.verifiedSkills && typeof parsed.verifiedSkills === "object"
          ? parsed.verifiedSkills
          : {},
      lastVisited:
        parsed.lastVisited && typeof parsed.lastVisited === "object" ? parsed.lastVisited : null,
    };
  } catch {
    return base;
  }
}

export function formatModuleCodeFromId(moduleId: string): string {
  const trimmed = moduleId.trim().toLowerCase();
  if (trimmed === "m13-gov") return "M13-Gov";
  if (trimmed === "m13-eng") return "M13-Eng";
  return trimmed.toUpperCase();
}

export function normalizeQuizAnswersRecord(
  rawMap: unknown
): Record<string, Record<string, number>> {
  if (!rawMap || typeof rawMap !== "object") return {};
  const result: Record<string, Record<string, number>> = {};
  const entries = Object.entries(rawMap as Record<string, unknown>);

  // Pass 1: apply legacy numeric keys ("1".."10")
  for (const [rawKey, value] of entries) {
    if (!value || typeof value !== "object") continue;
    const trimmed = rawKey.trim();
    if (!/^\d+$/.test(trimmed)) continue;
    const normalizedKey = `m${trimmed}`;
    result[normalizedKey] = {
      ...(result[normalizedKey] || {}),
      ...(value as Record<string, number>),
    };
  }

  // Pass 2: canonical keys ("m1", "m13-gov", ...) take precedence
  for (const [rawKey, value] of entries) {
    if (!value || typeof value !== "object") continue;
    const trimmed = rawKey.trim();
    if (/^\d+$/.test(trimmed)) continue;
    const normalizedKey = trimmed.toLowerCase();
    result[normalizedKey] = {
      ...(result[normalizedKey] || {}),
      ...(value as Record<string, number>),
    };
  }

  return result;
}

export function loadAllQuizAnswers(): Record<string, Record<string, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(QUIZ_ANSWERS_STORAGE_KEY);
    if (!raw) return {};
    return normalizeQuizAnswersRecord(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveWorkspaceState(state: CourseWorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COURSE_WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

export function clearAllCourseLearningData(): CourseWorkspaceState {
  const fresh = createInitialWorkspaceState();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(COURSE_WORKSPACE_STORAGE_KEY);
      window.localStorage.removeItem(LAB_DOD_STORAGE_KEY);
      window.localStorage.removeItem(LAB_ARTIFACTS_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_M4_MCP_DOD_KEY);
      window.localStorage.removeItem(QUIZ_ANSWERS_STORAGE_KEY);
      window.localStorage.removeItem(COMPLETED_MODULES_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("course:lab-progress-updated"));
    } catch {
      // Ignore storage errors
    }
  }
  return fresh;
}

export function getModuleCompletionStats(
  moduleRecord: CourseModuleRecord,
  state: CourseWorkspaceState,
  overridePlanId?: string
): {
  completedCount: number;
  totalCount: number;
  percent: number;
} {
  const planId = overridePlanId || state.selectedPlanByModule[moduleRecord.id];
  const activeUnits = getUnitsForPlan(moduleRecord, planId);
  const totalCount = activeUnits.length;
  const completedCount = activeUnits.filter((u) => Boolean(state.completedUnitIds[u.id])).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completedCount, totalCount, percent };
}

export function getCourseOverallStats(state: CourseWorkspaceState): {
  completedUnits: number;
  totalUnits: number;
  completedModules: number;
  totalModules: number;
  savedPracticeCount: number;
  customKbCount: number;
} {
  let completedUnits = 0;
  let totalUnits = 0;
  let completedModules = 0;

  for (const mod of COURSE_MODULE_RECORDS) {
    const stats = getModuleCompletionStats(mod, state);
    completedUnits += stats.completedCount;
    totalUnits += stats.totalCount;
    if (stats.totalCount > 0 && stats.completedCount === stats.totalCount) {
      completedModules += 1;
    }
  }

  const savedPracticeCount = Object.values(state.practiceNotes).filter(
    (n) => n.artifactDraft.trim().length > 0 || n.reflectionNote.trim().length > 0
  ).length;

  return {
    completedUnits,
    totalUnits,
    completedModules,
    totalModules: COURSE_MODULE_RECORDS.length,
    savedPracticeCount,
    customKbCount: state.customKbEntries.length,
  };
}

export function buildWorkspaceMarkdownExport(
  state: CourseWorkspaceState,
  quizAnswersByModule: Record<string, Record<string, number>> = loadAllQuizAnswers()
): string {
  const overall = getCourseOverallStats(state);
  const dateStr = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    `# AICodingCourse 学员学习产物与知识沉淀导出`,
    ``,
    `- 导出日期：${dateStr}`,
    `- 完成模块：${overall.completedModules}/${overall.totalModules}（按各模块当前所选授课方案计）`,
    `- 完成教学单元：${overall.completedUnits}/${overall.totalUnits}`,
    `- 练习产物与复盘记录：${overall.savedPracticeCount} 份`,
    `- 新增个人/团队知识条目：${overall.customKbCount} 条`,
    ``,
    `---`,
    ``,
    `## 一、模块练习产物与复盘记录`,
    ``,
  ];

  let hasPractice = false;
  for (const mod of COURSE_MODULE_RECORDS) {
    for (const unit of mod.units) {
      const note = state.practiceNotes[unit.id];
      const dodChecked = state.dodCheckedByUnit[unit.id] || [];
      const hasNoteText = Boolean(
        note && (note.artifactDraft.trim().length > 0 || note.reflectionNote.trim().length > 0)
      );
      const hasTransferTier = Boolean(note?.selectedTransferTier);
      const hasDodProgress = dodChecked.length > 0;

      if (hasNoteText || hasTransferTier || hasDodProgress) {
        hasPractice = true;
        lines.push(`### ${mod.code} · ${unit.title}`);
        lines.push(
          `- 完成状态：${state.completedUnitIds[unit.id] ? "已完成" : "进行中"} | 完成标准勾选：${dodChecked.length}/${unit.completionCriteria.length}`
        );
        if (note?.selectedTransferTier) {
          lines.push(`- 选定课后迁移档位：${note.selectedTransferTier}`);
        }
        if (dodChecked.length > 0) {
          lines.push(`- 已勾选验收项：${dodChecked.join("；")}`);
        }
        if (note?.artifactDraft.trim()) {
          lines.push(``);
          lines.push(`#### 学员产物草稿`);
          lines.push("```markdown");
          lines.push(note.artifactDraft.trim());
          lines.push("```");
        }
        if (note?.reflectionNote.trim()) {
          lines.push(``);
          lines.push(`#### 复盘与问题记录`);
          lines.push(note.reflectionNote.trim());
        }
        lines.push(``);
      }
    }
  }

  if (!hasPractice) {
    lines.push(`> 暂无已保存的练习产物或复盘笔记。可在任意模块练习单元撰写并保存后重新导出。`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 二、学员沉淀的知识库条目`);
  lines.push(``);

  if (state.customKbEntries.length === 0) {
    lines.push(`> 暂无自定义知识条目。可在各模块「知识库沉淀」单元或「知识库中心」添加。`);
    lines.push(``);
  } else {
    for (const item of state.customKbEntries) {
      lines.push(
        `### [${item.moduleCode}] ${item.title}（${KNOWLEDGE_CATEGORY_LABELS[item.category]}）`
      );
      lines.push(`- 适用范围：${item.scope || "待补充"} | 更新时间：${item.updatedAt}`);
      if (item.cautionNote.trim()) {
        lines.push(`- 注意事项：${item.cautionNote.trim()}`);
      }
      lines.push("```markdown");
      lines.push(item.content.trim());
      lines.push("```");
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 三、各模块巩固测验成绩汇总`);
  lines.push(``);

  const normalizedQuizzes = normalizeQuizAnswersRecord(quizAnswersByModule);
  let hasQuiz = false;
  let touchesM13Gov = false;

  for (const mod of COURSE_MODULE_RECORDS) {
    const quiz = MODULE_QUIZZES[mod.id];
    const answers = normalizedQuizzes[mod.id] || {};
    if (quiz && Object.keys(answers).length > 0) {
      hasQuiz = true;
      if (mod.id === "m13-gov") touchesM13Gov = true;
      const summary = getQuizReviewSummary(quiz, answers);
      lines.push(
        `- ${mod.code} (${quiz.moduleTitle})：已答 ${summary.answeredCount}/${quiz.questions.length} 题，正确 ${summary.correctCount} 题（正确率 ${summary.accuracyPct}%）`
      );
    }
    if (
      mod.id === "m13-gov" &&
      mod.units.some(
        (u) =>
          Boolean(state.completedUnitIds[u.id]) ||
          (state.dodCheckedByUnit[u.id]?.length ?? 0) > 0 ||
          Boolean(
            state.practiceNotes[u.id] &&
              (state.practiceNotes[u.id].artifactDraft.trim() ||
                state.practiceNotes[u.id].reflectionNote.trim() ||
                state.practiceNotes[u.id].selectedTransferTier)
          )
      )
    ) {
      touchesM13Gov = true;
    }
  }

  if (!hasQuiz) {
    lines.push(`> 暂无已保存的模块测验作答记录。`);
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 四、已核验前置技能门禁（可核验证据 / 诊断 / 基线豁免）`);
  lines.push(``);
  const verifiedList = Object.values(state.verifiedSkills || {});
  if (verifiedList.length === 0) {
    lines.push(`> 尚未登记通过核验的先修技能（仅勾选模块完成不自动发放技能）。`);
  } else {
    for (const rec of verifiedList) {
      const sk = COURSE_SKILLS.find((s) => s.id === rec.skillId);
      lines.push(
        `- ${sk?.title ?? rec.skillId}：方式 \`${rec.method}\` ｜ 核验日期 ${rec.verifiedAt} ｜ 摘要：${rec.evidenceSummary}`
      );
    }
  }
  lines.push(``);

  if (touchesM13Gov) {
    lines.push(`---`);
    lines.push(``);
    lines.push(`> **M13-Gov 模拟治理评审边界声明**：${M13_GOV_SIMULATION_DISCLAIMER}`);
    lines.push(``);
  }

  return lines.join("\n");
}

export function buildInstructorLessonPlanMarkdown(
  moduleRecord: CourseModuleRecord,
  planId?: string
): string {
  const plan =
    moduleRecord.deliveryPlans.find((p) => p.id === planId) || moduleRecord.deliveryPlans[0];
  const units = getUnitsForPlan(moduleRecord, plan?.id);
  const totalMinutes = units.reduce((sum, u) => sum + u.estimatedMinutes, 0);

  const lines: string[] = [
    `# ${moduleRecord.code} 教师备课讲义 · ${moduleRecord.title}`,
    ``,
    `- 所选授课方案：${plan ? `${plan.name}（${plan.shortLabel}）` : "全部单元"}`,
    `- 适用对象：${plan?.targetAudience || moduleRecord.audience.join(" / ")}`,
    `- 预计授课总时长：约 ${totalMinutes} 分钟（共 ${units.length} 个教学单元）`,
    `- 先修要求：${moduleRecord.prerequisites.join("；")}`,
    `- 边界提示：${moduleRecord.boundaryNote}`,
    ``,
    `## 学习目标`,
    ...moduleRecord.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`),
    ``,
    `---`,
    ``,
    `## 分单元备课指南与参考答案`,
    ``,
  ];

  units.forEach((unit, idx) => {
    lines.push(`### ${String(idx + 1).padStart(2, "0")}. ${unit.title}（约 ${unit.estimatedMinutes} 分钟）`);
    lines.push(`- 单元目标：${unit.learningObjective}`);
    lines.push(`- 组织提示：${unit.teacherMaterials.teachingTips}`);
    lines.push(`- 时间裁剪建议：${unit.teacherMaterials.timeTrimNote}`);

    if (unit.demoSteps && unit.demoSteps.length > 0) {
      lines.push(`- 演示步骤：`);
      for (const st of unit.demoSteps) {
        lines.push(`  - **${st.phase}**：${st.action} ｜ 人类把关：${st.humanControl}`);
      }
    }

    if (unit.teacherMaterials.referenceAnswers.length > 0) {
      lines.push(`- 参考答案与可接受解法：`);
      for (const ans of unit.teacherMaterials.referenceAnswers) {
        lines.push(`  - ${ans}`);
      }
    }

    if (unit.teacherMaterials.commonPitfalls.length > 0) {
      lines.push(`- 课堂翻车预警：`);
      for (const pit of unit.teacherMaterials.commonPitfalls) {
        lines.push(`  - ${pit}`);
      }
    }

    lines.push(``);
  });

  return lines.join("\n");
}

export function buildFullCourseInstructorHandbookMarkdown(
  state: CourseWorkspaceState
): string {
  let totalCourseMinutes = 0;
  let totalCourseUnits = 0;

  const moduleSections: string[] = [];

  for (const mod of COURSE_MODULE_RECORDS) {
    const planId = state.selectedPlanByModule[mod.id];
    const plan =
      mod.deliveryPlans.find((p) => p.id === planId) || mod.deliveryPlans[0];
    const units = getUnitsForPlan(mod, plan?.id);
    const mins = units.reduce((sum, u) => sum + u.estimatedMinutes, 0);
    totalCourseMinutes += mins;
    totalCourseUnits += units.length;

    moduleSections.push(
      [
        `## ${mod.code} · ${mod.title}`,
        `- 方案：${plan ? `${plan.name}（${plan.shortLabel}）` : "全部单元"} ｜ 单元数：${units.length} ｜ 预计：${mins} 分钟`,
        `- 先修：${mod.prerequisites.join("；")}`,
        `- 边界：${mod.boundaryNote}`,
        ``,
        ...units.map(
          (u, idx) =>
            `${idx + 1}. **${u.title}** (${u.estimatedMinutes}m) — 组织提示：${u.teacherMaterials.teachingTips} ｜ 裁剪：${u.teacherMaterials.timeTrimNote}`
        ),
        ``,
      ].join("\n")
    );
  }

  return [
    `# AICodingCourse 全课 ${COURSE_MODULE_RECORDS.length} 模块教师备课总手册`,
    ``,
    `- 生成日期：${new Date().toISOString().slice(0, 10)}`,
    `- 覆盖模块：${COURSE_MODULE_RECORDS.length} 个模块 ｜ 合计单元：${totalCourseUnits} 个 ｜ 总预计课时：约 ${totalCourseMinutes} 分钟`,
    ``,
    `---`,
    ``,
    ...moduleSections,
  ].join("\n");
}

export function buildKnowledgeBaseMarkdownExport(options: {
  builtInEntries: TeamKnowledgeEntry[];
  customEntries: CustomKnowledgeDraft[];
  books?: KnowledgeBookItem[];
  filterSummary?: string;
}): string {
  const { builtInEntries, customEntries, books = [], filterSummary } = options;
  const dateStr = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    `# AICodingCourse 工程知识库资产导出`,
    ``,
    `- 导出日期：${dateStr}`,
    `- 筛选条件：${filterSummary || "全部条目"}`,
    `- 仓库内置规范：${builtInEntries.length} 条 ｜ 个人/团队自建草稿：${customEntries.length} 条 ｜ AI-pdf-books 书目：${books.length} 册`,
    ``,
    `---`,
    ``,
    `## 一、个人/团队自建知识草稿`,
    ``,
  ];

  if (customEntries.length === 0) {
    lines.push(`> 当前筛选条件下无自建知识草稿。`);
    lines.push(``);
  } else {
    for (const item of customEntries) {
      lines.push(
        `### [${item.moduleCode}] ${item.title}（${KNOWLEDGE_CATEGORY_LABELS[item.category]}）`
      );
      lines.push(`- 适用范围：${item.scope} ｜ 更新时间：${item.updatedAt}`);
      if (item.cautionNote.trim()) {
        lines.push(`- 注意事项：${item.cautionNote.trim()}`);
      }
      lines.push("```markdown");
      lines.push(item.content.trim());
      lines.push("```");
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`## 二、内置团队研发工程规范条目（${KNOWLEDGE_TRACK_LABELS.engineering} · ${builtInEntries.length} 条）`);
  lines.push(``);

  if (builtInEntries.length === 0) {
    lines.push(`> 当前筛选条件下无工程规范条目。`);
    lines.push(``);
  } else {
    for (const entry of builtInEntries) {
      lines.push(
        `### [${entry.modules.join("/")}] ${entry.title}（${KNOWLEDGE_CATEGORY_LABELS[entry.category]} · ${KNOWLEDGE_STATUS_LABELS[entry.validationStatus]}）`
      );
      lines.push(`- 适用范围：${entry.scope}`);
      lines.push(`- 来源与维护：${entry.source} · ${entry.owner} · 版本 ${entry.version} · 更新 ${entry.updatedAt}`);
      lines.push(`- 警示与边界：${entry.antiPatternOrWarning}`);
      lines.push("```markdown");
      lines.push(entry.copyableSnippet.trim());
      lines.push("```");
      lines.push(``);
    }
  }

  if (books.length > 0) {
    lines.push(`---`);
    lines.push(``);
    lines.push(`## 三、AI-pdf-books 开源书库与参考专著（${books.length} 册 · 归属研发工程知识库备课）`);
    lines.push(``);
    for (const book of books) {
      lines.push(
        `### [${book.targetModules.join("/")}] ${book.title}（${book.category}）`
      );
      lines.push(`- 作者/出版方：${book.authorOrSource} ｜ 文件体积：${book.sizeMB.toFixed(1)} MB`);
      lines.push(`- 核心要点：${book.coreTakeaways}`);
      lines.push(`- 课程应用：${book.courseApplication}`);
      lines.push(`- 原文链接：${getBookGithubUrl(book)}`);
      lines.push(``);
    }
  }

  return lines.join("\n");
}

export function buildRuntimeWorkshopMarkdownExport(options: {
  runtimeEntries: RuntimeKnowledgeEntry[];
  filterSummary?: string;
}): string {
  const { runtimeEntries, filterSummary } = options;
  const dateStr = new Date().toISOString().slice(0, 10);

  const lines: string[] = [
    `# AICodingCourse 运行时领域知识库工坊规范导出`,
    ``,
    `- 导出日期：${dateStr}`,
    `- 归属链路：${RUNTIME_KB_WORKSHOP_RULES.trackName}`,
    `- 筛选条件：${filterSummary || "全部运行时阶段"}`,
    `- 收录规范与契约：${runtimeEntries.length} 条（与研发工程 KB 及 AI-pdf-books 严格隔离）`,
    `- 边界说明：${RUNTIME_KB_WORKSHOP_RULES.simulationNotice}`,
    ``,
    `---`,
    ``,
    `## 运行时检索六步链路与验收契约`,
    ``,
  ];

  if (runtimeEntries.length === 0) {
    lines.push(`> 当前筛选条件下无运行时工作坊条目。`);
    lines.push(``);
  } else {
    for (const entry of runtimeEntries) {
      lines.push(
        `### [${entry.modules.join("/")}] ${entry.title}（${RUNTIME_PIPELINE_STAGE_LABELS[entry.pipelineStage]} · ${KNOWLEDGE_STATUS_LABELS[entry.validationStatus]}）`
      );
      lines.push(`- 适用范围：${entry.scope}`);
      lines.push(`- 验收门禁：${entry.evalGate}`);
      lines.push(`- 来源与维护：${entry.source} · ${entry.owner} · 版本 ${entry.version} · 更新 ${entry.updatedAt}`);
      lines.push(`- 风险警示：${entry.antiPatternOrWarning}`);
      lines.push("```markdown");
      lines.push(entry.copyableSnippet.trim());
      lines.push("```");
      lines.push(``);
    }
  }

  return lines.join("\n");
}

