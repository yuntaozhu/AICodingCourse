import { AI_BOOKS_KNOWLEDGE_BASE } from "./aiBooksKnowledgeBase.ts";
import {
  COURSE_MODULE_RECORDS,
  COURSE_UNIT_TYPE_LABELS,
} from "./courseUnitsModel.ts";
import type { CustomKnowledgeDraft } from "./courseWorkspaceStore.ts";
import {
  KNOWLEDGE_CATEGORY_LABELS,
  KNOWLEDGE_STATUS_LABELS,
  KNOWLEDGE_TRACK_LABELS,
  TEAM_KNOWLEDGE_BASE,
  type KnowledgeBaseTrack,
} from "./teamKnowledgeBase.ts";
import {
  RUNTIME_PIPELINE_STAGE_LABELS,
  RUNTIME_WORKSHOP_KNOWLEDGE_BASE,
} from "./runtimeKnowledgeBase.ts";

export type GlobalSearchResultKind =
  | "module"
  | "unit"
  | "custom-kb"
  | "team-kb"
  | "runtime-kb"
  | "book";

export interface GlobalSearchResult {
  id: string;
  kind: GlobalSearchResultKind;
  title: string;
  subtitle: string;
  snippet: string;
  moduleId: string;
  moduleCode: string;
  unitId?: string;
  kbQuery?: string;
  kbSection?: "all" | "rules" | "books";
  kbTrack?: KnowledgeBaseTrack;
  score: number;
}

export interface GlobalSearchResponse {
  results: GlobalSearchResult[];
  counts: Record<GlobalSearchResultKind, number>;
  totalCount: number;
}

export const SEARCH_KIND_LABELS: Record<GlobalSearchResultKind, string> = {
  module: "课程模块",
  unit: "教学单元",
  "custom-kb": "自建知识库",
  "team-kb": "研发工程 KB",
  "runtime-kb": "运行时工作坊",
  book: "AI 书籍库",
};

function buildMatchSnippet(fields: string[], terms: string[], fallback: string): string {
  const cleanFields = fields.map((f) => f.replace(/\s+/g, " ").trim()).filter(Boolean);
  for (const field of cleanFields) {
    const lower = field.toLowerCase();
    const hitIdx = terms.reduce((best, term) => {
      const idx = lower.indexOf(term);
      if (idx === -1) return best;
      return best === -1 ? idx : Math.min(best, idx);
    }, -1);

    if (hitIdx !== -1) {
      if (field.length <= 96) return field;
      const start = Math.max(0, hitIdx - 28);
      const end = Math.min(field.length, start + 96);
      const prefix = start > 0 ? "…" : "";
      const suffix = end < field.length ? "…" : "";
      return `${prefix}${field.slice(start, end)}${suffix}`;
    }
  }
  const cleanFallback = fallback.replace(/\s+/g, " ").trim();
  return cleanFallback.length <= 96 ? cleanFallback : `${cleanFallback.slice(0, 95)}…`;
}

function scoreMatch(primaryTitle: string, secondaryMeta: string, bodyFields: string[], terms: string[]): number | null {
  const titleLower = primaryTitle.toLowerCase();
  const metaLower = secondaryMeta.toLowerCase();
  const fullHaystack = `${titleLower}\n${metaLower}\n${bodyFields.join("\n").toLowerCase()}`;

  for (const term of terms) {
    if (!fullHaystack.includes(term)) {
      return null;
    }
  }

  let score = 0;
  for (const term of terms) {
    if (titleLower === term) score += 120;
    else if (titleLower.includes(term)) score += 60;

    if (metaLower.includes(term)) score += 35;

    for (const field of bodyFields) {
      if (field.toLowerCase().includes(term)) {
        score += 12;
        break;
      }
    }
  }
  return score;
}

export function searchCourseWorkspace(
  query: string,
  options: {
    customKbEntries: CustomKnowledgeDraft[];
    includeInstructorMaterials?: boolean;
    limit?: number;
  }
): GlobalSearchResponse {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const emptyCounts: Record<GlobalSearchResultKind, number> = {
    module: 0,
    unit: 0,
    "custom-kb": 0,
    "team-kb": 0,
    "runtime-kb": 0,
    book: 0,
  };

  if (terms.length === 0) {
    return { results: [], counts: emptyCounts, totalCount: 0 };
  }

  const allMatches: GlobalSearchResult[] = [];
  const includeInstructor = Boolean(options.includeInstructorMaterials);

  // 1. Search Course Modules
  for (const mod of COURSE_MODULE_RECORDS) {
    const bodyFields = [
      mod.boundaryNote,
      ...mod.learningObjectives,
      ...mod.prerequisites,
      ...mod.audience,
      ...mod.deliveryPlans.map((p) => `${p.name} ${p.description}`),
    ];
    const score = scoreMatch(mod.title, `${mod.code} ${mod.audience.join(" ")}`, bodyFields, terms);
    if (score !== null) {
      allMatches.push({
        id: `mod-${mod.id}`,
        kind: "module",
        title: `${mod.code} · ${mod.title.replace(/^Module\s+[\w-]+:\s*/i, "")}`,
        subtitle: `${mod.units.length} 个教学单元 · ${mod.audience.slice(0, 2).join(" / ")}`,
        snippet: buildMatchSnippet(bodyFields, terms, mod.learningObjectives[0] || mod.boundaryNote),
        moduleId: mod.id,
        moduleCode: mod.code,
        score: score + 15,
      });
    }

    // 2. Search Units inside each Module
    for (const unit of mod.units) {
      const unitTypeLabel = COURSE_UNIT_TYPE_LABELS[unit.type];
      const unitBodyFields = [
        unit.learningObjective,
        unit.summary,
        ...unit.contentBlocks,
        unit.knowledgeSedimentNote,
        unit.afterClassNote || "",
        ...unit.completionCriteria,
        ...(unit.learnerTask
          ? [
              unit.learnerTask.goal,
              ...unit.learnerTask.steps,
              ...unit.learnerTask.humanResponsibilities,
              ...unit.learnerTask.aiResponsibilities,
            ]
          : []),
        ...(unit.demoSteps
          ? unit.demoSteps.flatMap((s) => [s.phase, s.action, s.aiBehaviorOrEvidence, s.humanControl])
          : []),
        ...(unit.failureAnalysis
          ? [
              unit.failureAnalysis.mistakeScenario,
              ...unit.failureAnalysis.analysisQuestions,
              ...(includeInstructor
                ? [unit.failureAnalysis.rootCause, unit.failureAnalysis.fixGuidance]
                : []),
            ]
          : []),
        ...(unit.learnerArtifact
          ? [unit.learnerArtifact.title, unit.learnerArtifact.filename, unit.learnerArtifact.templateContent]
          : []),
      ];

      const unitScore = scoreMatch(
        unit.title,
        `${mod.code} ${unitTypeLabel}`,
        unitBodyFields,
        terms
      );
      if (unitScore !== null) {
        allMatches.push({
          id: `unit-${unit.id}`,
          kind: "unit",
          title: unit.title,
          subtitle: `${mod.code} · ${unitTypeLabel} · 约 ${unit.estimatedMinutes} 分钟`,
          snippet: buildMatchSnippet(unitBodyFields, terms, unit.summary || unit.learningObjective),
          moduleId: mod.id,
          moduleCode: mod.code,
          unitId: unit.id,
          score: unitScore,
        });
      }
    }
  }

  // 3. Search Learner Custom Knowledge Base Entries
  for (const entry of options.customKbEntries) {
    const categoryLabel = KNOWLEDGE_CATEGORY_LABELS[entry.category];
    const bodyFields = [entry.scope, entry.content, entry.cautionNote];
    const score = scoreMatch(
      entry.title,
      `${entry.moduleCode} ${categoryLabel} 自定义知识`,
      bodyFields,
      terms
    );
    if (score !== null) {
      allMatches.push({
        id: `ckb-${entry.id}`,
        kind: "custom-kb",
        title: entry.title,
        subtitle: `${entry.moduleCode} · ${categoryLabel} · 本地自建 (${entry.updatedAt})`,
        snippet: buildMatchSnippet(bodyFields, terms, entry.content),
        moduleId: entry.moduleCode.toLowerCase(),
        moduleCode: entry.moduleCode,
        kbQuery: entry.title,
        kbSection: "all",
        kbTrack: "engineering",
        score: score + 20,
      });
    }
  }

  // 4. Search Built-in Engineering Team Knowledge Base Entries (Link A)
  for (const entry of TEAM_KNOWLEDGE_BASE) {
    const categoryLabel = KNOWLEDGE_CATEGORY_LABELS[entry.category];
    const statusLabel = KNOWLEDGE_STATUS_LABELS[entry.validationStatus];
    const trackLabel = KNOWLEDGE_TRACK_LABELS.engineering;
    const bodyFields = [
      trackLabel,
      entry.summary,
      entry.scope,
      entry.whenToUse,
      entry.antiPatternOrWarning,
      entry.copyableSnippet,
      entry.owner,
    ];
    const score = scoreMatch(
      entry.title,
      `${entry.modules.join(" ")} ${categoryLabel} ${statusLabel} ${trackLabel}`,
      bodyFields,
      terms
    );
    if (score !== null) {
      const firstMod = entry.modules[0] || "M1";
      allMatches.push({
        id: `tkb-${entry.id}`,
        kind: "team-kb",
        title: entry.title,
        subtitle: `${entry.modules.join("/")} · 研发工程 KB · ${categoryLabel} · ${statusLabel}`,
        snippet: buildMatchSnippet(bodyFields, terms, entry.summary),
        moduleId: firstMod.toLowerCase(),
        moduleCode: firstMod,
        kbQuery: entry.title,
        kbSection: "rules",
        kbTrack: "engineering",
        score: score + 5,
      });
    }
  }

  // 4b. Search Agent Runtime Workshop Knowledge Base Entries (Link B)
  for (const entry of RUNTIME_WORKSHOP_KNOWLEDGE_BASE) {
    const stageLabel = RUNTIME_PIPELINE_STAGE_LABELS[entry.pipelineStage];
    const statusLabel = KNOWLEDGE_STATUS_LABELS[entry.validationStatus];
    const trackLabel = KNOWLEDGE_TRACK_LABELS["runtime-domain"];
    const bodyFields = [
      trackLabel,
      stageLabel,
      entry.summary,
      entry.scope,
      entry.evalGate,
      entry.whenToUse,
      entry.antiPatternOrWarning,
      entry.copyableSnippet,
      entry.owner,
    ];
    const score = scoreMatch(
      entry.title,
      `${entry.modules.join(" ")} ${stageLabel} ${statusLabel} ${trackLabel}`,
      bodyFields,
      terms
    );
    if (score !== null) {
      const firstMod = entry.modules[0] || "M11";
      allMatches.push({
        id: `rkb-${entry.id}`,
        kind: "runtime-kb",
        title: entry.title,
        subtitle: `${entry.modules.join("/")} · 运行时工作坊 · ${stageLabel} · ${statusLabel}`,
        snippet: buildMatchSnippet(bodyFields, terms, entry.summary),
        moduleId: firstMod.toLowerCase(),
        moduleCode: firstMod,
        kbQuery: entry.title,
        kbTrack: "runtime-domain",
        score: score + 5,
      });
    }
  }

  // 5. Search AI-pdf-books & Reference Library
  for (const book of AI_BOOKS_KNOWLEDGE_BASE) {
    const bodyFields = [
      book.coreTakeaways,
      book.courseApplication,
      book.keywords.join(" "),
      book.repoPath,
      book.authorOrSource,
    ];
    const score = scoreMatch(
      book.title,
      `${book.targetModules.join(" ")} ${book.category} ${book.authorOrSource} AI-pdf-books`,
      bodyFields,
      terms
    );
    if (score !== null) {
      const firstMod = book.targetModules[0] || "M8";
      allMatches.push({
        id: `book-${book.id}`,
        kind: "book",
        title: book.title,
        subtitle: `${book.targetModules.join("/")} · ${book.category} · ${book.authorOrSource}`,
        snippet: buildMatchSnippet(bodyFields, terms, book.coreTakeaways),
        moduleId: firstMod.toLowerCase(),
        moduleCode: firstMod,
        kbQuery: book.title,
        kbSection: "books",
        score: score + 4,
      });
    }
  }

  allMatches.sort((a, b) => b.score - a.score);

  const counts: Record<GlobalSearchResultKind, number> = { ...emptyCounts };
  for (const item of allMatches) {
    counts[item.kind] += 1;
  }

  const limit = options.limit ?? 16;
  return {
    results: allMatches.slice(0, limit),
    counts,
    totalCount: allMatches.length,
  };
}
