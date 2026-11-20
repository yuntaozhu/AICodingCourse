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
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
  type KnowledgeModuleCode,
} from "./teamKnowledgeBase";

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

export interface CourseWorkspaceState {
  viewMode: CourseViewMode;
  selectedPlanByModule: Record<string, string>;
  completedUnitIds: Record<string, boolean>;
  dodCheckedByUnit: Record<string, string[]>;
  practiceNotes: Record<string, PracticeNoteRecord>;
  customKbEntries: CustomKnowledgeDraft[];
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
      lastVisited:
        parsed.lastVisited && typeof parsed.lastVisited === "object" ? parsed.lastVisited : null,
    };
  } catch {
    return base;
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

export function buildWorkspaceMarkdownExport(state: CourseWorkspaceState): string {
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
      if (
        note &&
        (note.artifactDraft.trim().length > 0 || note.reflectionNote.trim().length > 0)
      ) {
        hasPractice = true;
        lines.push(`### ${mod.code} · ${unit.title}`);
        lines.push(
          `- 完成状态：${state.completedUnitIds[unit.id] ? "已完成" : "进行中"} | 完成标准勾选：${dodChecked.length}/${unit.completionCriteria.length}`
        );
        if (note.selectedTransferTier) {
          lines.push(`- 选定课后迁移档位：${note.selectedTransferTier}`);
        }
        if (note.artifactDraft.trim()) {
          lines.push(``);
          lines.push(`#### 学员产物草稿`);
          lines.push("```markdown");
          lines.push(note.artifactDraft.trim());
          lines.push("```");
        }
        if (note.reflectionNote.trim()) {
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

  return lines.join("\n");
}
