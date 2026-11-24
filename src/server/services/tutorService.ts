import { COURSE_LABS, COURSE_MODULES } from "../../data/courseCurriculum.ts";
import { RUNTIME_WORKSHOP_KNOWLEDGE_BASE } from "../../data/runtimeKnowledgeBase.ts";
import { TEAM_KNOWLEDGE_BASE } from "../../data/teamKnowledgeBase.ts";
import { SEED_PROJECT_TEMPLATES } from "../data/projectTemplates.ts";
import { COURSE_MODULE_RECORDS } from "../data/privateCourseUnits.ts";
import { checkAndRunGuardedAiCall } from "./aiService.ts";

export interface TutorCitation {
  sourceId: string;
  label: string;
  moduleId: string;
  unitId?: string;
  labId?: string;
  excerpt: string;
}

export interface TutorResponsePayload {
  ok: true;
  refused: boolean;
  refusalReason?: string;
  answer: string;
  citations: TutorCitation[];
  nextPractice: {
    label: string;
    moduleId: string;
    labId?: string;
    actionHint: string;
  } | null;
  usedAiModel: boolean;
  remainingToday?: number;
}

const SENSITIVE_OR_BYPASS_INTENT =
  /(quiz.*answer|correctIndex|正确答案|考试答案|直接给我答案|帮我通过考试|直接授予.*技能|grant.*skill|teacherMaterials|参考答案原文|GEMINI_API_KEY|PAYMENT_WEBHOOK_SECRET|SESSION_SIGNING_SECRET)/i;

export function retrieveUnlockedTutorCitations(input: {
  question: string;
  moduleId?: string;
  hasPaidAccess: boolean;
}): {
  lockedModuleRequested: string | null;
  citations: TutorCitation[];
  recommendedLab: { id: string; title: string; moduleId: string } | null;
} {
  const unlockedModules = COURSE_MODULE_RECORDS.filter(
    (m) => m.id === "m1" || input.hasPaidAccess
  );
  const unlockedIds = new Set(unlockedModules.map((m) => m.id));

  if (input.moduleId && !unlockedIds.has(input.moduleId)) {
    const requestedMod = COURSE_MODULES.find((m) => m.id === input.moduleId);
    if (requestedMod) {
      return {
        lockedModuleRequested: requestedMod.code,
        citations: [],
        recommendedLab: null,
      };
    }
  }

  // Also detect if user explicitly asks about an unpurchased module code e.g. M12 / M8 / M3 when unpaid
  if (!input.hasPaidAccess) {
    const modCodeMatch = input.question.match(/\bM(2|3|4|5|6|7|8|9|10|11|12|13-Gov|13-Eng)\b/i);
    if (modCodeMatch) {
      return {
        lockedModuleRequested: modCodeMatch[0].toUpperCase(),
        citations: [],
        recommendedLab: null,
      };
    }
  }

  const tokens = input.question
    .toLowerCase()
    .split(/[\s,，。？?！!、/]+/)
    .filter((t) => t.length >= 2);

  const candidates: Array<{ score: number; citation: TutorCitation }> = [];

  for (const mod of unlockedModules) {
    if (input.moduleId && mod.id !== input.moduleId) continue;

    // Intentionally exclude teacherMaterials & quiz correctIndex
    for (const unit of mod.units) {
      const safeText = [
        unit.title,
        unit.learningObjective,
        unit.summary,
        ...(unit.contentBlocks || []),
        unit.learnerTask?.goal || "",
      ]
        .join(" ")
        .toLowerCase();

      let score = mod.id === input.moduleId ? 2 : 0;
      for (const tok of tokens) {
        if (safeText.includes(tok)) score += 3;
      }
      if (score > 0) {
        candidates.push({
          score,
          citation: {
            sourceId: `${mod.id}:${unit.id}`,
            label: `${mod.code} · ${unit.title}`,
            moduleId: mod.id,
            unitId: unit.id,
            excerpt: `${unit.learningObjective}。${unit.summary}`.slice(0, 180),
          },
        });
      }
    }
  }

  // Engineering & Runtime KB strictly scoped to unlocked modules
  for (const kb of TEAM_KNOWLEDGE_BASE) {
    const kbModUnlocked = kb.modules.some((code) =>
      unlockedModules.some((m) => m.code.toLowerCase() === code.toLowerCase())
    );
    if (!kbModUnlocked) continue;
    const text = `${kb.title} ${kb.summary} ${kb.whenToUse} ${kb.scope}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (text.includes(tok)) score += 3;
    }
    if (score > 0) {
      const firstUnlocked = unlockedModules.find((m) =>
        kb.modules.some((code) => code.toLowerCase() === m.code.toLowerCase())
      );
      candidates.push({
        score,
        citation: {
          sourceId: kb.id,
          label: `链路 A 工程库 · ${kb.title}`,
          moduleId: firstUnlocked?.id || "m1",
          excerpt: kb.summary.slice(0, 180),
        },
      });
    }
  }

  if (input.hasPaidAccess) {
    for (const rkb of RUNTIME_WORKSHOP_KNOWLEDGE_BASE) {
      const text = `${rkb.title} ${rkb.summary} ${rkb.evalGate}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (text.includes(tok)) score += 3;
      }
      if (score > 0) {
        candidates.push({
          score,
          citation: {
            sourceId: rkb.id,
            label: `链路 B 运行时工坊 · ${rkb.title}`,
            moduleId: "m12",
            excerpt: rkb.summary.slice(0, 180),
          },
        });
      }
    }

    for (const tpl of SEED_PROJECT_TEMPLATES) {
      const text = `${tpl.title} ${tpl.subtitle} ${tpl.starterSpecMarkdown}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (text.includes(tok)) score += 2;
      }
      if (score > 0) {
        candidates.push({
          score,
          citation: {
            sourceId: `tpl:${tpl.slug}`,
            label: `项目模板 · ${tpl.title}`,
            moduleId: tpl.targetModuleId,
            excerpt: tpl.subtitle.slice(0, 180),
          },
        });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const topCitations = candidates.slice(0, 4).map((c) => c.citation);

  const focusModuleId = input.moduleId || topCitations[0]?.moduleId || "m1";
  const focusMod = COURSE_MODULES.find((m) => m.id === focusModuleId) ?? COURSE_MODULES[0];
  const recommendedLab =
    COURSE_LABS.find((l) => l.moduleId === focusMod.id) ??
    COURSE_LABS.find((l) => l.id === "plan-prompt") ??
    null;

  return {
    lockedModuleRequested: null,
    citations: topCitations,
    recommendedLab: recommendedLab
      ? { id: recommendedLab.id, title: recommendedLab.title, moduleId: recommendedLab.moduleId }
      : null,
  };
}

export async function askCourseGroundedTutor(input: {
  userId?: number | null;
  question: string;
  moduleId?: string;
  hasPaidAccess: boolean;
  requestId?: string;
}): Promise<TutorResponsePayload> {
  const question = input.question.trim();

  // 1. Refuse sensitive config leaks, quiz answer harvesting, or skill bypass requests
  if (SENSITIVE_OR_BYPASS_INTENT.test(question)) {
    return {
      ok: true,
      refused: true,
      refusalReason: "SENSITIVE_OR_BYPASS_REFUSED",
      answer:
        "Tutor 仅用于基于已解锁课程单元引导学习与定位下一步实操，严禁透露测验标准答案、教师参考答案、环境变量密钥，也不具备修改进度或直接授予技能认证的权限。请前往「分步 Exam」独立作答或提交项目证据。",
      citations: [],
      nextPractice: {
        label: "进入 M1 Plan → Agent 练习沙盘",
        moduleId: "m1",
        labId: "plan-prompt",
        actionHint: "通过写规格与自检规则验证掌握度",
      },
      usedAiModel: false,
    };
  }

  const retrieval = retrieveUnlockedTutorCitations({
    question,
    moduleId: input.moduleId,
    hasPaidAccess: input.hasPaidAccess,
  });

  // 2. Refuse unpurchased / locked module inquiries
  if (retrieval.lockedModuleRequested) {
    return {
      ok: true,
      refused: true,
      refusalReason: "MODULE_LOCKED",
      answer: `模块 ${retrieval.lockedModuleRequested} 属于需开通学习权益的高阶模块，当前仅检索已解锁的课程资料（目前可免费体验 M1）。请先开通学习或训练营权益后再针对该模块提问。`,
      citations: [],
      nextPractice: {
        label: "先完成 M1 免费体验闭环",
        moduleId: "m1",
        labId: "plan-prompt",
        actionHint: "完成 M1 规格蓝图与 4 题评测",
      },
      usedAiModel: false,
    };
  }

  // 3. Refuse out-of-scope questions with insufficient course evidence
  if (retrieval.citations.length === 0) {
    return {
      ok: true,
      refused: true,
      refusalReason: "OUT_OF_SCOPE_NO_EVIDENCE",
      answer:
        "在您当前已解锁的课程章节与知识库中未检索到足够支撑该问题的依据。为避免幻觉编造，Tutor 拒绝跨纲作答；请尝试结合具体模块主题（如 Plan/SDD、上下文边界、ACL Pre-filter、DoD、GEO Evidence Lab）提问。",
      citations: [],
      nextPractice: retrieval.recommendedLab
        ? {
            label: `打开 ${retrieval.recommendedLab.title}`,
            moduleId: retrieval.recommendedLab.moduleId,
            labId: retrieval.recommendedLab.id,
            actionHint: "结合沙盘完成一次可验证检查",
          }
        : null,
      usedAiModel: false,
    };
  }

  const nextPractice = retrieval.recommendedLab
    ? {
        label: `下一步可验证练习：${retrieval.recommendedLab.title}`,
        moduleId: retrieval.recommendedLab.moduleId,
        labId: retrieval.recommendedLab.id,
        actionHint: "在沙盘或项目工作台完成边界修改并通过静态门禁校验",
      }
    : null;

  // 4. Optional guarded AI synthesis (strictly grounded in retrieved unlocked citations)
  if (input.userId && process.env.GEMINI_API_KEY) {
    const contextBlock = retrieval.citations
      .map((c, idx) => `[${idx + 1}] (${c.label}) ${c.excerpt}`)
      .join("\n");

    const systemInstruction = `你是 Coding Everything 项目学院的 Course-grounded Tutor。
铁律：
1. 只能根据下方提供的【已解锁课程检索依据】回答，严禁编造外部事实。
2. 回答必须使用方括号标明来源索引如 [1]、[2]。
3. 最后必须给出 1 条可验证的下一步动手练习建议。
4. 绝对不能答应修改学员进度、不能授予技能认证、不能透露任何测验正确答案。
5. 控制在 320 字以内，结构清晰。`;

    const aiRes = await checkAndRunGuardedAiCall({
      userId: input.userId,
      requestId: input.requestId,
      endpoint: "/api/tutor/ask",
      prompt: `学员问题：${question}\n\n【已解锁课程检索依据】：\n${contextBlock}`,
      systemInstruction,
      onEmptyFallbackError: "",
    });

    if (aiRes.ok && aiRes.text.trim()) {
      return {
        ok: true,
        refused: false,
        answer: aiRes.text.trim(),
        citations: retrieval.citations,
        nextPractice,
        usedAiModel: true,
        remainingToday: aiRes.remainingToday,
      };
    }
  }

  // 5. Deterministic cited response fallback (works cleanly without Gemini key)
  const citedSummary = retrieval.citations
    .map((c, idx) => `[${idx + 1}] **${c.label}**：${c.excerpt}`)
    .join("\n\n");

  const answer = [
    `基于您当前已解锁课程资料，整理核心要点如下（Tutor 仅作学习引导，不修改进度或授证）：`,
    ``,
    citedSummary,
    ``,
    nextPractice
      ? `建议下一步验证动作：前往「${nextPractice.label}」，${nextPractice.actionHint}。`
      : ``,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    refused: false,
    answer,
    citations: retrieval.citations,
    nextPractice,
    usedAiModel: false,
  };
}
