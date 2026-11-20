import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { auditMcpConfigJson, MCP_LAB_GUIDE } from "../src/data/mcpLabGuide";
import { getQuizReviewSummary, MODULE_QUIZZES } from "../src/data/moduleQuizzes";
import {
  buildRetryWrongAnswersState,
  getQuestionRemediation,
  MODULE_OBJECTIVES,
  QUIZ_REMEDIATION_MAP,
} from "../src/data/quizRemediation";
import { MCP_SERVERS } from "../src/data/cursorPresets";

test("auditMcpConfigJson passes for scoped ${env:...} config", () => {
  const validConfig = JSON.stringify(
    {
      mcpServers: {
        github: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-github"],
          env: {
            GITHUB_PERSONAL_ACCESS_TOKEN: "${env:GITHUB_PERSONAL_ACCESS_TOKEN}",
          },
        },
        postgres: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"],
          env: {
            DATABASE_URL: "${env:DATABASE_URL}",
          },
        },
      },
    },
    null,
    2
  );

  const result = auditMcpConfigJson(validConfig, "confirm-write");
  assert.equal(result.validJson, true);
  assert.equal(result.serverCount, 2);
  assert.equal(result.warnings.length, 0);
  assert.ok(result.checks.every((c) => c.passed));
});

test("auditMcpConfigJson detects hardcoded secrets and unreferenced env values", () => {
  const leakyConfig = JSON.stringify({
    mcpServers: {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_1234567890abcdef1234567890",
        },
      },
    },
  });

  const result = auditMcpConfigJson(leakyConfig, "readonly");
  assert.equal(result.validJson, true);
  const secretCheck = result.checks.find((c) => c.id === "no-secrets");
  assert.ok(secretCheck);
  assert.equal(secretCheck.passed, false);
  assert.ok(result.warnings.length >= 1);
});

test("auditMcpConfigJson handles malformed JSON and empty mcpServers", () => {
  const badJson = auditMcpConfigJson("{ invalid json", "readonly");
  assert.equal(badJson.validJson, false);
  assert.equal(badJson.serverCount, 0);
  assert.ok(badJson.checks.every((c) => !c.passed));

  const emptyServers = auditMcpConfigJson(JSON.stringify({ mcpServers: {} }), "readonly");
  assert.equal(emptyServers.validJson, true);
  assert.equal(emptyServers.serverCount, 0);
  const scopeCheck = emptyServers.checks.find((c) => c.id === "scope-budget");
  assert.equal(scopeCheck?.passed, false);
});

test("MODULE_QUIZZES covers modules 1..10 with valid options, explanations, and review targets", () => {
  const appSource = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  const registeredLabIds = new Set(
    Array.from(appSource.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:/g)).map((m) => m[1])
  );

  for (let mod = 1; mod <= 10; mod += 1) {
    const quiz = MODULE_QUIZZES[mod];
    assert.ok(quiz, `Module ${mod} quiz should exist`);
    assert.ok(quiz.questions.length >= 3, `Module ${mod} should have >= 3 questions`);
    for (const q of quiz.questions) {
      assert.equal(q.options.length, 4, `${q.id} must have 4 options`);
      assert.ok(
        q.correctIndex >= 0 && q.correctIndex < q.options.length,
        `${q.id} correctIndex out of range`
      );
      assert.ok(q.explanation.trim().length > 10, `${q.id} requires explanation`);
      assert.ok(q.topic.trim().length > 0, `${q.id} requires topic`);
      assert.ok(q.reviewTarget, `${q.id} requires reviewTarget`);
      assert.ok(q.reviewTarget.label.trim().length > 0, `${q.id} reviewTarget requires label`);
      if (q.reviewTarget.labId) {
        assert.ok(
          registeredLabIds.has(q.reviewTarget.labId),
          `${q.id} labId '${q.reviewTarget.labId}' not registered in src/App.tsx`
        );
      } else if (q.reviewTarget.moduleId) {
        assert.match(q.reviewTarget.moduleId, /^m([1-9]|10)$/);
      } else {
        assert.fail(`${q.id} reviewTarget must specify labId or moduleId`);
      }
    }
  }
});

test("getQuizReviewSummary computes missed questions and deduplicated review targets", () => {
  const m1 = MODULE_QUIZZES[1];
  // q1 and q3 both point to labId 'plan-prompt'; mark both wrong and q2/q4 right
  const answers: Record<string, number> = {
    [m1.questions[0].id]: (m1.questions[0].correctIndex + 1) % 4,
    [m1.questions[1].id]: m1.questions[1].correctIndex,
    [m1.questions[2].id]: (m1.questions[2].correctIndex + 1) % 4,
    [m1.questions[3].id]: m1.questions[3].correctIndex,
  };

  const summary = getQuizReviewSummary(m1, answers);
  assert.equal(summary.answeredCount, 4);
  assert.equal(summary.correctCount, 2);
  assert.equal(summary.accuracyPct, 50);
  assert.equal(summary.missedQuestions.length, 2);
  assert.equal(summary.recommendedTargets.length, 1);
  assert.equal(summary.recommendedTargets[0].labId, "plan-prompt");
});

test("QUIZ_REMEDIATION_MAP and MODULE_OBJECTIVES cover all modules and questions", () => {
  for (let mod = 1; mod <= 10; mod += 1) {
    assert.ok(MODULE_OBJECTIVES[mod], `Missing MODULE_OBJECTIVES[${mod}]`);
    for (const q of MODULE_QUIZZES[mod].questions) {
      assert.ok(QUIZ_REMEDIATION_MAP[q.id], `Missing QUIZ_REMEDIATION_MAP[${q.id}]`);
      const resolved = getQuestionRemediation(q.id, mod);
      assert.equal(resolved.moduleId, `m${mod}`);
      assert.ok(resolved.learningObjective.trim().length > 0);
      assert.ok(resolved.reviewAction.trim().length > 0);
    }
  }
});

test("buildRetryWrongAnswersState keeps only correct answers and finds first wrong index", () => {
  const m1Questions = MODULE_QUIZZES[1].questions;
  const sampleAnswers: Record<string, number> = {
    [m1Questions[0].id]: m1Questions[0].correctIndex,
    [m1Questions[1].id]: (m1Questions[1].correctIndex + 1) % 4,
    [m1Questions[2].id]: m1Questions[2].correctIndex,
    [m1Questions[3].id]: (m1Questions[3].correctIndex + 2) % 4,
  };

  const retryState = buildRetryWrongAnswersState(m1Questions, sampleAnswers);
  assert.equal(retryState.wrongCount, 2);
  assert.equal(retryState.firstWrongIndex, 1);
  assert.deepEqual(Object.keys(retryState.keptAnswers), [
    m1Questions[0].id,
    m1Questions[2].id,
  ]);
});

test("MCP_SERVERS and MCP_LAB_GUIDE preserve required baseline fields", () => {
  assert.ok(MCP_SERVERS.length >= 6);
  for (const srv of MCP_SERVERS) {
    assert.ok(srv.id && srv.name && srv.command);
    assert.ok(Array.isArray(srv.readOnlyTools) && srv.readOnlyTools.length > 0);
  }
  assert.equal(MCP_LAB_GUIDE.dodCriteria.length, 4);
  assert.ok(MCP_LAB_GUIDE.boundaryNotice.includes("模拟"));
});

test("quizRemediation covers all modules/questions and retries wrong answers cleanly", () => {
  for (let mod = 1; mod <= 10; mod += 1) {
    const obj = MODULE_OBJECTIVES[mod];
    assert.ok(obj && obj.observableOutcome.length > 5, `Module ${mod} objective missing`);
    for (const q of MODULE_QUIZZES[mod].questions) {
      assert.ok(QUIZ_REMEDIATION_MAP[q.id], `Missing remediation entry for ${q.id}`);
      const rem = getQuestionRemediation(q.id, mod);
      assert.equal(rem.moduleId, `m${mod}`);
    }
  }

  const fallback = getQuestionRemediation("nonexistent-id", 4);
  assert.equal(fallback.moduleId, "m4");

  const m4 = MODULE_QUIZZES[4];
  const retry = buildRetryWrongAnswersState(m4.questions, {
    [m4.questions[0].id]: m4.questions[0].correctIndex,
    [m4.questions[1].id]: (m4.questions[1].correctIndex + 1) % 4,
    [m4.questions[2].id]: m4.questions[2].correctIndex,
  });
  assert.equal(retry.wrongCount, 1);
  assert.equal(retry.firstWrongIndex, 1);
  assert.equal(Object.keys(retry.keptAnswers).length, 2);
});

test("courseCurriculum aligns 10 modules, 16 labs, 4 learner paths, and verified resource index", async () => {
  const {
    COURSE_LABS,
    COURSE_MODULES,
    COURSE_RESOURCES,
    getCourseModuleById,
    getLabsForModule,
    getResourcesForModule,
    LEARNER_PATHS,
  } = await import("../src/data/courseCurriculum");

  const appSource = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  const registeredLabIds = new Set(
    Array.from(appSource.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:\s*[^,]+,\s*h:/g)).map((m) => m[1])
  );
  const registeredModuleIds = Array.from(
    appSource.matchAll(/\{\s*id:\s*"(m\d+)",\s*label:/g)
  ).map((m) => m[1]);

  assert.deepEqual(
    COURSE_MODULES.map((m) => m.id),
    registeredModuleIds,
    "COURSE_MODULES IDs should match src/App.tsx order"
  );
  assert.equal(COURSE_LABS.length, registeredLabIds.size, "COURSE_LABS should cover all 16 App.tsx labs");

  const resourceIds = new Set(COURSE_RESOURCES.map((r) => r.id));
  const labIds = new Set(COURSE_LABS.map((l) => l.id));

  const expectedSlideCounts: Record<string, number> = {
    m1: 13,
    m2: 14,
    m3: 14,
    m4: 16,
    m5: 20,
    m6: 21,
    m7: 16,
    m8: 5,
    m9: 11,
    m10: 8,
  };

  for (const mod of COURSE_MODULES) {
    assert.equal(mod.slideCount, expectedSlideCounts[mod.id], `${mod.id} slideCount mismatch`);
    const moduleIndexPath = path.resolve(process.cwd(), `src/components/slides/Module${mod.order}/index.ts`);
    assert.ok(fs.existsSync(moduleIndexPath), `Missing Module${mod.order}/index.ts`);
    const indexSrc = fs.readFileSync(moduleIndexPath, "utf8");
    const arrayMatch = indexSrc.match(/export const (?:Module\d+Slides|VibeCodingAestheticsSlides)\s*=\s*\[([\s\S]*?)\];/);
    assert.ok(arrayMatch, `Missing slide array export in Module${mod.order}/index.ts`);
    const slideEntries = arrayMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    assert.equal(
      slideEntries.length,
      mod.slideCount,
      `Module${mod.order}/index.ts exports ${slideEntries.length} slides, expected ${mod.slideCount}`
    );
    assert.ok(mod.learningObjectives.length >= 2, `${mod.id} needs >=2 observable objectives`);
    assert.ok(mod.deliverables.length >= 1, `${mod.id} needs deliverables`);
    assert.ok(mod.boundaryNote.trim().length > 5, `${mod.id} needs boundaryNote`);
    assert.match(mod.lastReviewedAt, /^\d{4}-\d{2}-\d{2}$/);

    for (const lid of mod.labIds) {
      assert.ok(labIds.has(lid), `${mod.id} references unknown labId '${lid}'`);
      assert.ok(registeredLabIds.has(lid), `${mod.id} labId '${lid}' missing from src/App.tsx`);
    }
    for (const rid of mod.resourceIds) {
      assert.ok(resourceIds.has(rid), `${mod.id} references unknown resourceId '${rid}'`);
    }
    const quizQuestionIds = MODULE_QUIZZES[mod.order].questions.map((q) => q.id);
    assert.deepEqual(mod.quizIds, quizQuestionIds, `${mod.id} quizIds mismatch MODULE_QUIZZES`);

    assert.equal(getCourseModuleById(mod.id)?.id, mod.id);
    assert.equal(getLabsForModule(mod.id).length, mod.labIds.length);
    assert.ok(getResourcesForModule(mod.code).length >= 1, `${mod.id} should map to >=1 resource`);
  }

  for (const res of COURSE_RESOURCES) {
    assert.match(res.url, /^https:\/\//, `${res.id} URL must be HTTPS`);
    assert.ok(res.organization.trim().length > 0, `${res.id} needs organization`);
    assert.ok(res.useInCourse.trim().length > 10, `${res.id} needs useInCourse`);
    assert.match(res.reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
    if (!res.licenseVerified) {
      assert.equal(res.license, "待核验", `${res.id} unverified license must say 待核验`);
    }
  }

  assert.equal(LEARNER_PATHS.length, 4);
  for (const lp of LEARNER_PATHS) {
    assert.ok(lp.recommendedModuleIds.length >= 4, `${lp.id} needs recommended modules`);
    for (const mid of lp.recommendedModuleIds) {
      assert.ok(getCourseModuleById(mid), `${lp.id} unknown module ${mid}`);
    }
    assert.ok(registeredLabIds.has(lp.starterLabId), `${lp.id} unknown starterLabId ${lp.starterLabId}`);
  }
});

test("labPracticeEngine audits Plan prompts, .mdc rules, and computes DoD lab completion", async () => {
  const {
    auditCursorRules,
    auditPlanPrompt,
    getCompletedLabIds,
  } = await import("../src/data/labPracticeEngine");
  const { RULE_TEMPLATES } = await import("../src/data/cursorPresets");

  const cleanPlan = auditPlanPrompt({
    idea: "实现按团队隔离的 SaaS 账单订阅路由与服务端 Webhook 验签",
    mode: "Plan",
    selectedTags: ["@Codebase", "@Files"],
    selectedDod: ["tsc", "lint", "security"],
  });
  assert.equal(cleanPlan.score, 100);
  assert.equal(cleanPlan.warnings.length, 0);

  const leakyPlan = auditPlanPrompt({
    idea: "随便写写 sk-1234567890abcdef1234567890",
    mode: "Agent",
    selectedTags: [],
    selectedDod: [],
  });
  assert.ok(leakyPlan.score < 50);
  assert.ok(leakyPlan.warnings.length >= 4);

  const defaultRulesAudit = auditCursorRules(RULE_TEMPLATES);
  assert.equal(defaultRulesAudit.score, 50);
  assert.equal(defaultRulesAudit.warnings.length, 2);

  const tunedRules = RULE_TEMPLATES.map((r) =>
    r.id === "self-improve"
      ? { ...r, alwaysApply: false }
      : r.id === "workflow-git"
      ? { ...r, globs: [".github/**/*.yml", "package.json"] }
      : r
  );
  const cleanRules = auditCursorRules(tunedRules);
  assert.equal(cleanRules.score, 100);
  assert.equal(cleanRules.warnings.length, 0);

  const noisyRules = auditCursorRules(
    RULE_TEMPLATES.map((r) => ({ ...r, alwaysApply: true, globs: ["**/*"] }))
  );
  assert.ok(noisyRules.score < 100);
  assert.ok(noisyRules.warnings.length >= 1);

  const completed = getCompletedLabIds({
    "plan-prompt": { 0: true, 1: true, 2: true },
    "cursor-rules": { 0: true },
  });
  assert.deepEqual(completed, ["plan-prompt"]);

  const { auditBugbotSession, buildEngineeringHandoffMarkdown } = await import(
    "../src/data/labPracticeEngine"
  );
  const bugbotWait = auditBugbotSession({
    enabledRulesCount: 1,
    ranLocalCheck: false,
    findingsCount: 0,
    usedAiReview: false,
  });
  assert.ok(bugbotWait.score < 100);
  assert.ok(bugbotWait.warnings.length >= 2);

  const bugbotReady = auditBugbotSession({
    enabledRulesCount: 3,
    ranLocalCheck: true,
    findingsCount: 4,
    usedAiReview: false,
  });
  assert.equal(bugbotReady.score, 100);
  assert.equal(bugbotReady.warnings.length, 0);

  const handoff = buildEngineeringHandoffMarkdown({
    pathLabel: "独立开发者",
    completedModuleIds: ["m1", "m4"],
    completedLabIds: ["plan-prompt"],
    artifacts: {
      planPrompt: "Intent: 验证订单支付回退",
      mdcRuleSlug: "20-api-security",
      mdcRuleContent: "Always validate webhooks",
      mcpConfigJson: "{ \"mcpServers\": {} }",
      updatedAt: "2026-11-18",
    },
  });
  assert.ok(handoff.includes("独立开发者"));
  assert.ok(handoff.includes("Intent: 验证订单支付回退"));
  assert.ok(handoff.includes(".cursor/rules/20-api-security.mdc"));
  assert.ok(handoff.includes("npx tsc --noEmit"));
});

test("MODULE_TEACHING_PACKAGES covers all 10 modules with flexible delivery, demo flaw-fix loop, rubric, and 3-tier homework", async () => {
  const { MODULE_TEACHING_PACKAGES } = await import("../src/data/moduleTeachingPackages");
  const { COURSE_MODULES } = await import("../src/data/courseCurriculum");

  const vagueVerbRegex = /理解|认识|掌握/;

  for (const mod of COURSE_MODULES) {
    const pkg = MODULE_TEACHING_PACKAGES[mod.id];
    assert.ok(pkg, `Missing teaching package for ${mod.id}`);
    assert.equal(pkg.moduleCode, mod.code);
    assert.ok(pkg.deliveryModes.length >= 5, `${mod.id} should define 5 flexible delivery modes`);
    assert.ok(pkg.traditionalVsAi.rows.length >= 3, `${mod.id} needs >=3 Traditional vs AI rows`);
    assert.ok(pkg.traditionalVsAi.nonDelegableCases.length >= 2);
    assert.ok(pkg.humanAiSplit.humanMustDecide.length >= 2);
    assert.ok(pkg.humanAiSplit.aiCanDraft.length >= 2);
    assert.ok(pkg.instructorDemo.steps.length >= 3, `${mod.id} needs multi-step demo with flaw & fix`);
    assert.ok(pkg.instructorDemo.noKeyOfflineFallback.trim().length > 10);
    assert.ok(pkg.instructorDemo.acceptableAlternatives.length >= 1);
    assert.ok(pkg.rubric.length >= 3, `${mod.id} needs >=3 rubric dimensions`);
    assert.equal(pkg.homeworkTiers.length, 3, `${mod.id} needs 3-tier transfer homework`);

    for (const obj of mod.learningObjectives) {
      assert.equal(
        vagueVerbRegex.test(obj),
        false,
        `${mod.id} objective uses non-observable verb: ${obj}`
      );
    }
    for (const r of pkg.rubric) {
      assert.equal(
        vagueVerbRegex.test(r.passCriteria),
        false,
        `${mod.id} rubric uses non-observable verb: ${r.passCriteria}`
      );
    }
  }

  for (let mod = 1; mod <= 10; mod += 1) {
    assert.equal(
      vagueVerbRegex.test(MODULE_OBJECTIVES[mod].observableOutcome),
      false,
      `MODULE_OBJECTIVES[${mod}] should avoid non-observable verbs`
    );
  }
  for (const [qid, rem] of Object.entries(QUIZ_REMEDIATION_MAP)) {
    assert.equal(
      vagueVerbRegex.test(rem.learningObjective),
      false,
      `QUIZ_REMEDIATION_MAP[${qid}] should avoid non-observable verbs`
    );
  }
});

test("TEAM_KNOWLEDGE_BASE covers all 10 modules, all 9 knowledge types, and points to real docs files", async () => {
  const {
    KB_GOVERNANCE_RULES,
    KNOWLEDGE_CATEGORY_LABELS,
    TEAM_KNOWLEDGE_BASE,
  } = await import("../src/data/teamKnowledgeBase");

  assert.ok(fs.existsSync(path.resolve(process.cwd(), KB_GOVERNANCE_RULES.repoRootPath)));

  const coveredModules = new Set<string>();
  const coveredCategories = new Set<string>();
  const realisticSecretRegex = /(?:ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})/;

  for (const entry of TEAM_KNOWLEDGE_BASE) {
    assert.ok(entry.owner.trim().length > 0, `${entry.id} needs owner`);
    assert.ok(entry.scope.trim().length > 0, `${entry.id} needs scope`);
    assert.ok(entry.feedbackLoop.trim().length > 5, `${entry.id} needs feedbackLoop`);
    assert.match(entry.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(
      fs.existsSync(path.resolve(process.cwd(), entry.repoPath)),
      `${entry.id} references missing repoPath '${entry.repoPath}'`
    );
    assert.equal(
      realisticSecretRegex.test(entry.copyableSnippet),
      false,
      `${entry.id} copyableSnippet must not include realistic live credentials`
    );

    coveredCategories.add(entry.category);
    entry.modules.forEach((m) => coveredModules.add(m));
  }

  for (const cat of Object.keys(KNOWLEDGE_CATEGORY_LABELS)) {
    assert.ok(coveredCategories.has(cat), `TEAM_KNOWLEDGE_BASE missing category '${cat}'`);
  }
  for (let i = 1; i <= 10; i += 1) {
    assert.ok(coveredModules.has(`M${i}`), `TEAM_KNOWLEDGE_BASE missing module M${i}`);
  }
});

test("courseUnitsModel provides M1 10-unit exemplar, M2-M10 compatible adapter, and composable DeliveryPlans", async () => {
  const {
    COURSE_MODULE_RECORDS,
    COURSE_UNIT_TYPE_LABELS,
    getDeliveryPlanMinutes,
    getModuleRecordById,
    getUnitsForPlan,
  } = await import("../src/data/courseUnitsModel");

  assert.equal(COURSE_MODULE_RECORDS.length, 10);

  const m1 = getModuleRecordById("m1");
  assert.ok(m1);
  assert.equal(m1.exemplarLevel, "complete-exemplar");
  assert.equal(m1.units.length, 10);
  assert.equal(m1.deliveryPlans.length, 4);

  const m1Types = new Set(m1.units.map((u) => u.type));
  for (const t of Object.keys(COURSE_UNIT_TYPE_LABELS)) {
    assert.ok(m1Types.has(t as keyof typeof COURSE_UNIT_TYPE_LABELS), `M1 exemplar missing unit type '${t}'`);
  }

  const vagueVerbRegex = /理解|认识|掌握/;
  const realisticSecretRegex = /(?:ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})/;

  for (const mod of COURSE_MODULE_RECORDS) {
    if (mod.id !== "m1") {
      assert.equal(mod.exemplarLevel, "compatible-adapter");
    }
    assert.ok(mod.units.length >= 6, `${mod.id} should have >=6 units`);
    assert.ok(mod.deliveryPlans.length >= 4, `${mod.id} should have 4 configurable plans`);

    const unitIds = new Set(mod.units.map((u) => u.id));
    for (const plan of mod.deliveryPlans) {
      assert.ok(plan.unitIds.length >= 3, `${plan.id} needs >=3 unitIds`);
      for (const uid of plan.unitIds) {
        assert.ok(unitIds.has(uid), `${plan.id} references unknown unitId '${uid}'`);
      }
      const resolved = getUnitsForPlan(mod, plan.id);
      assert.equal(resolved.length, plan.unitIds.length);
      const mins = getDeliveryPlanMinutes(mod, plan);
      assert.ok(mins > 0);
    }

    for (const unit of mod.units) {
      assert.ok(unit.completionCriteria.length >= 3, `${unit.id} needs >=3 completionCriteria`);
      assert.ok(unit.teacherMaterials.teachingTips.trim().length > 5);
      assert.ok(unit.teacherMaterials.referenceAnswers.length >= 1);
      assert.ok(unit.teacherMaterials.commonPitfalls.length >= 1);
      assert.match(unit.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(
        vagueVerbRegex.test(unit.learningObjective),
        false,
        `${unit.id} learningObjective uses non-observable verb: ${unit.learningObjective}`
      );
      if (unit.learnerArtifact) {
        assert.equal(
          realisticSecretRegex.test(unit.learnerArtifact.templateContent),
          false,
          `${unit.id} artifact template must not include live secrets`
        );
      }
    }
  }
});

test("courseWorkspaceStore computes progress stats and exports clean Markdown offline", async () => {
  const {
    buildWorkspaceMarkdownExport,
    createInitialWorkspaceState,
    getCourseOverallStats,
    getModuleCompletionStats,
  } = await import("../src/data/courseWorkspaceStore");
  const { getModuleRecordById } = await import("../src/data/courseUnitsModel");

  const state = createInitialWorkspaceState();
  assert.equal(state.viewMode, "learner");

  const m1 = getModuleRecordById("m1")!;
  state.selectedPlanByModule.m1 = "m1-plan-short";
  const shortUnits = m1.deliveryPlans.find((p) => p.id === "m1-plan-short")!.unitIds;
  state.completedUnitIds[shortUnits[0]] = true;
  state.dodCheckedByUnit[shortUnits[0]] = [m1.units[0].completionCriteria[0]];
  state.practiceNotes[shortUnits[0]] = {
    artifactDraft: "Intent: 验证 Plan 模式边界\nDoD: npm test",
    reflectionNote: "先锁文件白名单再让 AI 动手。",
    selectedTransferTier: "A 个人即时",
    updatedAt: "2026-11-19",
  };
  state.customKbEntries.push({
    id: "custom-1",
    title: "Plan 白名单模板",
    moduleCode: "M1",
    category: "starter-rule",
    scope: "React SPA",
    content: "Allowlist: src/components/course/**",
    cautionNote: "不要带入无关目录",
    updatedAt: "2026-11-19",
  });

  const m1Stats = getModuleCompletionStats(m1, state);
  assert.equal(m1Stats.completedCount, 1);
  assert.equal(m1Stats.totalCount, shortUnits.length);

  const overall = getCourseOverallStats(state);
  assert.equal(overall.completedUnits, 1);
  assert.equal(overall.savedPracticeCount, 1);
  assert.equal(overall.customKbCount, 1);

  const md = buildWorkspaceMarkdownExport(state);
  assert.ok(md.includes("AICodingCourse 学员学习产物与知识沉淀导出"));
  assert.ok(md.includes("Intent: 验证 Plan 模式边界"));
  assert.ok(md.includes("先锁文件白名单再让 AI 动手。"));
  assert.ok(md.includes("Plan 白名单模板"));
});
