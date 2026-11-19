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
    m1: 12,
    m2: 13,
    m3: 13,
    m4: 15,
    m5: 19,
    m6: 20,
    m7: 15,
    m8: 4,
    m9: 10,
    m10: 7,
  };

  for (const mod of COURSE_MODULES) {
    assert.equal(mod.slideCount, expectedSlideCounts[mod.id], `${mod.id} slideCount mismatch`);
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


