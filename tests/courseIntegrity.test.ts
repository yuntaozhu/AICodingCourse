import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { auditMcpConfigJson, MCP_LAB_GUIDE } from "../src/data/mcpLabGuide";
import {
  getQuizReviewSummary,
  MODULE_QUIZZES,
} from "../src/server/data/privateQuizBank";
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

const ALL_MODULE_IDS = [
  "m1",
  "m2",
  "m3",
  "m4",
  "m5",
  "m6",
  "m7",
  "m8",
  "m9",
  "m10",
  "m11",
  "m12",
  "m13-gov",
  "m13-eng",
] as const;

test("MODULE_QUIZZES covers all 14 modules with valid options, explanations, and review targets", () => {
  const appSource = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  const registeredLabIds = new Set(
    Array.from(appSource.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:/g)).map((m) => m[1])
  );

  for (const modId of ALL_MODULE_IDS) {
    const quiz = MODULE_QUIZZES[modId];
    assert.ok(quiz, `Module ${modId} quiz should exist`);
    assert.ok(quiz.questions.length >= 3, `Module ${modId} should have >= 3 questions`);
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
        assert.match(q.reviewTarget.moduleId, /^m([1-9]|1[0-2]|13-gov|13-eng)$/);
      } else {
        assert.fail(`${q.id} reviewTarget must specify labId or moduleId`);
      }
    }
  }
});

test("getQuizReviewSummary computes missed questions and deduplicated review targets", () => {
  const m1 = MODULE_QUIZZES.m1;
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

test("QUIZ_REMEDIATION_MAP and MODULE_OBJECTIVES cover all 14 modules and questions", () => {
  for (const modId of ALL_MODULE_IDS) {
    assert.ok(MODULE_OBJECTIVES[modId], `Missing MODULE_OBJECTIVES[${modId}]`);
    for (const q of MODULE_QUIZZES[modId].questions) {
      assert.ok(QUIZ_REMEDIATION_MAP[q.id], `Missing QUIZ_REMEDIATION_MAP[${q.id}]`);
      const resolved = getQuestionRemediation(q.id, modId);
      assert.equal(resolved.moduleId, modId);
      assert.ok(resolved.learningObjective.trim().length > 0);
      assert.ok(resolved.reviewAction.trim().length > 0);
    }
  }
});

test("buildRetryWrongAnswersState keeps only correct answers and finds first wrong index", () => {
  const m1Questions = MODULE_QUIZZES.m1.questions;
  const sampleAnswers: Record<string, number> = {
    [m1Questions[0].id]: m1Questions[0].correctIndex,
    [m1Questions[1].id]: (m1Questions[1].correctIndex + 1) % 4,
    [m1Questions[2].id]: m1Questions[2].correctIndex,
    [m1Questions[3].id]: (m1Questions[3].correctIndex + 2) % 4,
  };

  const retryState = buildRetryWrongAnswersState(
    m1Questions,
    sampleAnswers,
    new Set([m1Questions[0].id, m1Questions[2].id])
  );
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

test("quizRemediation covers all modules/questions, legacy numeric lookup, and retries wrong answers cleanly", () => {
  for (const modId of ALL_MODULE_IDS) {
    const obj = MODULE_OBJECTIVES[modId];
    assert.ok(obj && obj.observableOutcome.length > 5, `Module ${modId} objective missing`);
    for (const q of MODULE_QUIZZES[modId].questions) {
      assert.ok(QUIZ_REMEDIATION_MAP[q.id], `Missing remediation entry for ${q.id}`);
      const rem = getQuestionRemediation(q.id, modId);
      assert.equal(rem.moduleId, modId);
    }
  }

  // Backward numeric module order lookup still resolves cleanly
  const fallback = getQuestionRemediation("nonexistent-id", 4);
  assert.equal(fallback.moduleId, "m4");
  const m13Fallback = getQuestionRemediation("nonexistent-id", "m13-gov");
  assert.equal(m13Fallback.moduleId, "m13-gov");

  const m4 = MODULE_QUIZZES.m4;
  const retry = buildRetryWrongAnswersState(
    m4.questions,
    {
      [m4.questions[0].id]: m4.questions[0].correctIndex,
      [m4.questions[1].id]: (m4.questions[1].correctIndex + 1) % 4,
      [m4.questions[2].id]: m4.questions[2].correctIndex,
    },
    new Set([m4.questions[0].id, m4.questions[2].id])
  );
  assert.equal(retry.wrongCount, 1);
  assert.equal(retry.firstWrongIndex, 1);
  assert.equal(Object.keys(retry.keptAnswers).length, 2);
});

test("courseCurriculum aligns 14 modules, 20 labs, 3 tracks, dual-layer skill DAG, and verified resource index", async () => {
  const {
    COURSE_LABS,
    COURSE_MODULES,
    COURSE_RESOURCES,
    COURSE_TRACKS,
    getCourseModuleById,
    getLabsForModule,
    getResourcesForModule,
    LEARNER_PATHS,
  } = await import("../src/data/courseCurriculum");
  const {
    COURSE_SKILLS,
    computeAutoGrantedSkillsOnModuleComplete,
    evaluateModuleReadiness,
    validateCurriculumGraph,
  } = await import("../src/data/courseSkills");

  const appSource = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  const registeredLabIds = new Set(
    Array.from(appSource.matchAll(/\{\s*id:\s*"([^"]+)",\s*label:\s*[^,]+,\s*h:/g)).map((m) => m[1])
  );
  const registeredModuleIds = Array.from(
    appSource.matchAll(/\{\s*id:\s*"(m(?:\d+|13-gov|13-eng))",\s*label:/g)
  ).map((m) => m[1]);

  assert.equal(COURSE_MODULES.length, 14);
  assert.deepEqual(
    COURSE_MODULES.map((m) => m.id),
    registeredModuleIds,
    "COURSE_MODULES IDs should match src/App.tsx order"
  );
  assert.equal(COURSE_LABS.length, 20);
  assert.equal(COURSE_LABS.length, registeredLabIds.size, "COURSE_LABS should cover all 20 App.tsx labs");

  // Validate Tracks cover all 14 modules uniquely
  const trackModuleIds = COURSE_TRACKS.flatMap((t) => t.moduleIds);
  assert.equal(trackModuleIds.length, 14);
  assert.equal(new Set(trackModuleIds).size, 14);

  // Dual-layer graph integrity & closure gate
  const graphReport = validateCurriculumGraph({
    modules: COURSE_MODULES,
    labs: COURSE_LABS,
    paths: LEARNER_PATHS,
    skills: COURSE_SKILLS,
  });
  assert.deepEqual(graphReport, { valid: true, errors: [] });

  // Strict non-auto-granting check on skills & M3
  assert.ok(COURSE_SKILLS.every((s) => !s.autoGrantedByModuleCompletion));
  assert.deepEqual(computeAutoGrantedSkillsOnModuleComplete("m3"), []);
  const m3Mod = getCourseModuleById("m3")!;
  assert.deepEqual(m3Mod.grantsSkillIds, []);

  // Readiness gate check: M12 requires verified skill-backend-api-auth even after M3/M2/M5/M11
  const m12Mod = getCourseModuleById("m12")!;
  const blockedM12 = evaluateModuleReadiness({
    module: m12Mod,
    completedModuleIds: new Set(["m1", "m2", "m3", "m5", "m9", "m11"]),
    verifiedSkillIds: new Set(["skill-cli-basics"]),
  });
  assert.equal(blockedM12.ready, false);
  assert.deepEqual(blockedM12.missingSkillIds, ["skill-backend-api-auth"]);

  const unlockedM12 = evaluateModuleReadiness({
    module: m12Mod,
    completedModuleIds: new Set(["m2", "m5", "m11"]),
    verifiedSkillIds: new Set(["skill-cli-basics", "skill-backend-api-auth"]),
  });
  assert.equal(unlockedM12.ready, true);

  // M8 convergence & Knowledge Base Center decoupling check
  const m8Mod = getCourseModuleById("m8")!;
  assert.deepEqual(m8Mod.labIds, ["agent-harness"]);
  const bookLab = COURSE_LABS.find((l) => l.id === "book-kb");
  assert.equal(bookLab?.moduleId, "kb-center");

  const resourceIds = new Set(COURSE_RESOURCES.map((r) => r.id));
  const labIds = new Set(COURSE_LABS.map((l) => l.id));

  const expectedSlideCounts: Record<string, number> = {
    m1: 13,
    m2: 15,
    m3: 14,
    m4: 16,
    m5: 20,
    m6: 21,
    m7: 16,
    m8: 4,
    m9: 11,
    m10: 8,
    m11: 4,
    m12: 4,
    "m13-gov": 3,
    "m13-eng": 3,
  };

  const slideDirForModule = (id: string) => {
    if (id === "m13-gov") return "Module13Gov";
    if (id === "m13-eng") return "Module13Eng";
    return `Module${id.slice(1)}`;
  };

  for (const mod of COURSE_MODULES) {
    assert.equal(mod.slideCount, expectedSlideCounts[mod.id], `${mod.id} slideCount mismatch`);
    const dirName = slideDirForModule(mod.id);
    const moduleIndexPath = path.resolve(process.cwd(), `src/components/slides/${dirName}/index.ts`);
    assert.ok(fs.existsSync(moduleIndexPath), `Missing ${dirName}/index.ts`);
    const indexSrc = fs.readFileSync(moduleIndexPath, "utf8");
    const arrayMatch = indexSrc.match(
      /export const (?:Module(?:\d+|13Gov|13Eng)Slides|VibeCodingAestheticsSlides)\s*=\s*\[([\s\S]*?)\];/
    );
    assert.ok(arrayMatch, `Missing slide array export in ${dirName}/index.ts`);
    const slideEntries = arrayMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    assert.equal(
      slideEntries.length,
      mod.slideCount,
      `${dirName}/index.ts exports ${slideEntries.length} slides, expected ${mod.slideCount}`
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
    const quizQuestionIds = MODULE_QUIZZES[mod.id].questions.map((q) => q.id);
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

test("DAG topological order and dual-layer prerequisite closure hold across all 4 learner paths and reject illegal cycles/orderings", async () => {
  const { COURSE_LABS, COURSE_MODULES, LEARNER_PATHS } = await import(
    "../src/data/courseCurriculum"
  );
  const {
    COURSE_SKILLS,
    computeModuleTopologicalOrder,
    validateCurriculumGraph,
  } = await import("../src/data/courseSkills");

  // 1. Global Kahn topological sort verification across all 14 modules
  const topo = computeModuleTopologicalOrder(COURSE_MODULES);
  assert.equal(topo.acyclic, true, `Unexpected cycle in COURSE_MODULES: ${topo.cyclicModuleIds.join(", ")}`);
  assert.equal(topo.topologicalOrder.length, COURSE_MODULES.length);
  assert.deepEqual(topo.cyclicModuleIds, []);

  const topoIndex = new Map(topo.topologicalOrder.map((id, idx) => [id, idx]));
  for (const mod of COURSE_MODULES) {
    const modIdx = topoIndex.get(mod.id);
    assert.notEqual(modIdx, undefined, `${mod.id} missing from topological order`);
    for (const prereqModId of mod.prerequisiteModuleIds) {
      assert.notEqual(prereqModId, mod.id, `${mod.id} must not self-depend`);
      const prereqIdx = topoIndex.get(prereqModId);
      assert.notEqual(prereqIdx, undefined, `${mod.id} prerequisite '${prereqModId}' missing`);
      assert.ok(
        prereqIdx! < modIdx!,
        `Topological violation: '${prereqModId}' (idx ${prereqIdx}) must precede '${mod.id}' (idx ${modIdx})`
      );
    }
  }

  // 2. Verify all 4 learner personas (non-tech, indie-dev, eng-team, cs-student) close strictly on both layers
  const expectedCapstones: Record<string, "m13-gov" | "m13-eng"> = {
    "non-tech": "m13-gov",
    "indie-dev": "m13-eng",
    "eng-team": "m13-eng",
    "cs-student": "m13-eng",
  };
  assert.deepEqual(
    LEARNER_PATHS.map((p) => p.id).sort(),
    Object.keys(expectedCapstones).sort()
  );

  const moduleMap = new Map(COURSE_MODULES.map((m) => [m.id, m]));
  const skillMap = new Map(COURSE_SKILLS.map((s) => [s.id, s]));

  for (const pathDef of LEARNER_PATHS) {
    assert.equal(pathDef.capstoneTargetId, expectedCapstones[pathDef.id]);

    const baselineSet = new Set(pathDef.assumedBaselineIds);
    const availableModules = new Set<string>(pathDef.assumedBaselineIds);
    const availableSkills = new Set(pathDef.assumedBaselineSkillIds);
    const reachableEvidenceSkills = new Set(pathDef.assumedBaselineSkillIds);

    // Baseline modules must themselves be closed and grant any non-evidence baseline skills
    for (const baseId of pathDef.assumedBaselineIds) {
      const baseMod = moduleMap.get(baseId)!;
      for (const reqMod of baseMod.prerequisiteModuleIds) {
        assert.ok(
          baselineSet.has(reqMod),
          `Path '${pathDef.id}' baseline '${baseId}' missing prerequisite '${reqMod}'`
        );
      }
      for (const reqSkill of baseMod.prerequisiteSkillIds) {
        assert.ok(
          availableSkills.has(reqSkill),
          `Path '${pathDef.id}' baseline '${baseId}' missing baseline skill '${reqSkill}'`
        );
      }
      for (const g of baseMod.grantsSkillIds) availableSkills.add(g);
      for (const sk of COURSE_SKILLS) {
        if (sk.remediationModuleId === baseId) reachableEvidenceSkills.add(sk.id);
      }
    }

    // Walk recommendedModuleIds in exact sequence verifying topological & dual-layer closure
    for (const modId of pathDef.recommendedModuleIds) {
      assert.equal(
        baselineSet.has(modId),
        false,
        `Path '${pathDef.id}' should not repeat baseline module '${modId}' in recommendedModuleIds`
      );
      const mod = moduleMap.get(modId)!;
      for (const reqMod of mod.prerequisiteModuleIds) {
        assert.ok(
          availableModules.has(reqMod),
          `Path '${pathDef.id}' module '${modId}' precedes its prerequisite '${reqMod}'`
        );
      }
      for (const reqSkill of mod.prerequisiteSkillIds) {
        const skDef = skillMap.get(reqSkill)!;
        const satisfiedByWaiverOrGrant = availableSkills.has(reqSkill);
        const satisfiedByEarlierEvidence =
          skDef.acceptedMethods.includes("starter-repo-evidence") &&
          reachableEvidenceSkills.has(reqSkill);
        assert.ok(
          satisfiedByWaiverOrGrant || satisfiedByEarlierEvidence,
          `Path '${pathDef.id}' module '${modId}' lacks dual-layer skill closure for '${reqSkill}'`
        );
      }
      availableModules.add(mod.id);
      for (const g of mod.grantsSkillIds) availableSkills.add(g);
      for (const sk of COURSE_SKILLS) {
        if (sk.remediationModuleId === mod.id) reachableEvidenceSkills.add(sk.id);
      }
    }

    assert.equal(
      pathDef.recommendedModuleIds[pathDef.recommendedModuleIds.length - 1],
      pathDef.capstoneTargetId,
      `Path '${pathDef.id}' should culminate at capstone '${pathDef.capstoneTargetId}'`
    );
  }

  // 3. Adversarial checks: illegal cycles, out-of-order paths, skill gaps, and baseline gaps must fail machine check
  const cyclicModules = COURSE_MODULES.map((m) =>
    m.id === "m1" ? { ...m, prerequisiteModuleIds: ["m3"] } : m
  );
  const cyclicTopo = computeModuleTopologicalOrder(cyclicModules);
  assert.equal(cyclicTopo.acyclic, false);
  assert.ok(cyclicTopo.cyclicModuleIds.includes("m1"));
  assert.ok(cyclicTopo.cyclicModuleIds.includes("m3"));

  const cyclicReport = validateCurriculumGraph({
    modules: cyclicModules,
    labs: COURSE_LABS,
    paths: LEARNER_PATHS,
    skills: COURSE_SKILLS,
  });
  assert.equal(cyclicReport.valid, false);
  assert.ok(
    cyclicReport.errors.some((e) => e.includes("Cycle detected in prerequisiteModuleIds")),
    "validateCurriculumGraph must report multi-node prerequisite cycle"
  );

  const selfLoopModules = COURSE_MODULES.map((m) =>
    m.id === "m4" ? { ...m, prerequisiteModuleIds: [...m.prerequisiteModuleIds, "m4"] } : m
  );
  assert.equal(computeModuleTopologicalOrder(selfLoopModules).acyclic, false);
  assert.equal(
    validateCurriculumGraph({
      modules: selfLoopModules,
      labs: COURSE_LABS,
      paths: LEARNER_PATHS,
      skills: COURSE_SKILLS,
    }).valid,
    false
  );

  // Out-of-order non-tech path (putting m3 before m9) must fail topological closure
  const outOfOrderPaths = LEARNER_PATHS.map((p) =>
    p.id === "non-tech"
      ? { ...p, recommendedModuleIds: ["m1", "m3", "m9", "m10", "m11", "m13-gov"] }
      : p
  );
  const outOfOrderReport = validateCurriculumGraph({
    modules: COURSE_MODULES,
    labs: COURSE_LABS,
    paths: outOfOrderPaths,
    skills: COURSE_SKILLS,
  });
  assert.equal(outOfOrderReport.valid, false);
  assert.ok(
    outOfOrderReport.errors.some((e) => e.includes("non-tech") && e.includes("m3") && e.includes("m9")),
    "Must flag out-of-order module before its prerequisite"
  );

  // Removing skill-git-pr-ci from eng-team baseline must fail m6 skill closure
  const missingGitSkillPaths = LEARNER_PATHS.map((p) =>
    p.id === "eng-team"
      ? {
          ...p,
          assumedBaselineSkillIds: p.assumedBaselineSkillIds.filter(
            (s) => s !== "skill-git-pr-ci"
          ),
        }
      : p
  );
  const missingGitReport = validateCurriculumGraph({
    modules: COURSE_MODULES,
    labs: COURSE_LABS,
    paths: missingGitSkillPaths,
    skills: COURSE_SKILLS,
  });
  assert.equal(missingGitReport.valid, false);
  assert.ok(
    missingGitReport.errors.some(
      (e) => e.includes("eng-team") && e.includes("m6") && e.includes("skill-git-pr-ci")
    )
  );

  // Removing m3 from indie-dev path breaks both m7 module prereq and m12 starter-evidence reachability
  const brokenIndiePaths = LEARNER_PATHS.map((p) =>
    p.id === "indie-dev"
      ? { ...p, recommendedModuleIds: p.recommendedModuleIds.filter((id) => id !== "m3") }
      : p
  );
  const brokenIndieReport = validateCurriculumGraph({
    modules: COURSE_MODULES,
    labs: COURSE_LABS,
    paths: brokenIndiePaths,
    skills: COURSE_SKILLS,
  });
  assert.equal(brokenIndieReport.valid, false);
  assert.ok(
    brokenIndieReport.errors.some(
      (e) => e.includes("indie-dev") && e.includes("m12") && e.includes("skill-backend-api-auth")
    )
  );
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

test("MODULE_TEACHING_PACKAGES covers all 14 modules with flexible delivery, demo flaw-fix loop, rubric, and 3-tier homework", async () => {
  const { MODULE_TEACHING_PACKAGES } = await import("../src/server/data/privateTeachingPackages");
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

  for (const modId of ALL_MODULE_IDS) {
    assert.equal(
      vagueVerbRegex.test(MODULE_OBJECTIVES[modId].observableOutcome),
      false,
      `MODULE_OBJECTIVES[${modId}] should avoid non-observable verbs`
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

test("TEAM_KNOWLEDGE_BASE (engineering) and RUNTIME_WORKSHOP_KNOWLEDGE_BASE (runtime-domain) are strictly separated and cover all 14 modules", async () => {
  const {
    ENGINEERING_MODULE_CODES,
    KB_GOVERNANCE_RULES,
    KNOWLEDGE_CATEGORY_LABELS,
    TEAM_KNOWLEDGE_BASE,
    searchEngineeringKnowledgeBase,
  } = await import("../src/data/teamKnowledgeBase");
  const {
    RUNTIME_KB_WORKSHOP_RULES,
    RUNTIME_WORKSHOP_KNOWLEDGE_BASE,
    RUNTIME_WORKSHOP_MODULE_CODES,
    searchRuntimeKnowledgeBase,
  } = await import("../src/data/runtimeKnowledgeBase");

  assert.ok(fs.existsSync(path.resolve(process.cwd(), KB_GOVERNANCE_RULES.repoRootPath)));
  assert.ok(fs.existsSync(path.resolve(process.cwd(), RUNTIME_KB_WORKSHOP_RULES.repoRootPath)));

  const coveredEngModules = new Set<string>();
  const coveredRuntimeModules = new Set<string>();
  const coveredCategories = new Set<string>();
  const realisticSecretRegex = /(?:ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})/;

  // 1. Link A (teamKnowledgeBase.ts) must ONLY contain engineering entries
  for (const entry of TEAM_KNOWLEDGE_BASE) {
    assert.ok(entry.owner.trim().length > 0, `${entry.id} needs owner`);
    assert.ok(entry.scope.trim().length > 0, `${entry.id} needs scope`);
    assert.ok(entry.feedbackLoop.trim().length > 5, `${entry.id} needs feedbackLoop`);
    assert.match(entry.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(
      entry.kbTrack,
      "engineering",
      `${entry.id} in TEAM_KNOWLEDGE_BASE must strictly belong to engineering track`
    );
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
    entry.modules.forEach((m) => coveredEngModules.add(m));
  }

  // 2. Link B (runtimeKnowledgeBase.ts) must ONLY contain runtime-domain entries
  assert.ok(RUNTIME_WORKSHOP_KNOWLEDGE_BASE.length >= 4, "Need runtime workshop entries");
  for (const entry of RUNTIME_WORKSHOP_KNOWLEDGE_BASE) {
    assert.equal(
      entry.kbTrack,
      "runtime-domain",
      `${entry.id} in RUNTIME_WORKSHOP_KNOWLEDGE_BASE must strictly belong to runtime-domain`
    );
    assert.ok(entry.evalGate.trim().length > 5, `${entry.id} needs evalGate`);
    assert.ok(
      fs.existsSync(path.resolve(process.cwd(), entry.repoPath)),
      `${entry.id} references missing repoPath '${entry.repoPath}'`
    );
    entry.modules.forEach((m) => coveredRuntimeModules.add(m));
  }

  for (const cat of Object.keys(KNOWLEDGE_CATEGORY_LABELS)) {
    assert.ok(coveredCategories.has(cat), `TEAM_KNOWLEDGE_BASE missing category '${cat}'`);
  }
  for (const code of ENGINEERING_MODULE_CODES) {
    assert.ok(coveredEngModules.has(code), `TEAM_KNOWLEDGE_BASE missing engineering module ${code}`);
  }
  for (const code of RUNTIME_WORKSHOP_MODULE_CODES) {
    assert.ok(
      coveredRuntimeModules.has(code),
      `RUNTIME_WORKSHOP_KNOWLEDGE_BASE missing runtime module ${code}`
    );
  }

  // 3. Verify independent retrieval pipelines never leak entries across tracks
  const engHits = searchEngineeringKnowledgeBase({ query: "Tombstone" });
  assert.equal(engHits.length, 0, "Engineering KB retrieval must not return runtime-domain Tombstone entries");

  const runtimeHits = searchRuntimeKnowledgeBase({ query: "Tombstone" });
  assert.ok(runtimeHits.length >= 1, "Runtime workshop retrieval should return Tombstone entries");

  const runtimeMcpHits = searchRuntimeKnowledgeBase({ query: "Plan 白名单模板" });
  assert.equal(runtimeMcpHits.length, 0, "Runtime workshop retrieval must not return engineering entries");
});

test("courseUnitsModel provides 14 modules, complete exemplars for M1 & M11-M13-Eng, and composable DeliveryPlans", async () => {
  const {
    COURSE_MODULE_RECORDS,
    COURSE_UNIT_TYPE_LABELS,
    getDeliveryPlanMinutes,
    getModuleRecordById,
    getUnitsForPlan,
  } = await import("../src/server/data/privateCourseUnits");
  const { M13_GOV_SIMULATION_DISCLAIMER } = await import("../src/data/courseWorkspaceStore");

  assert.equal(COURSE_MODULE_RECORDS.length, 14);

  const exemplarIds = new Set(["m1", "m11", "m12", "m13-gov", "m13-eng"]);

  const m1 = getModuleRecordById("m1");
  assert.ok(m1);
  assert.equal(m1.exemplarLevel, "complete-exemplar");
  assert.equal(m1.units.length, 10);
  assert.equal(m1.deliveryPlans.length, 4);

  const m1Types = new Set(m1.units.map((u) => u.type));
  for (const t of Object.keys(COURSE_UNIT_TYPE_LABELS)) {
    assert.ok(m1Types.has(t as keyof typeof COURSE_UNIT_TYPE_LABELS), `M1 exemplar missing unit type '${t}'`);
  }

  const m13Gov = getModuleRecordById("m13-gov")!;
  assert.ok(
    m13Gov.units.some((u) => JSON.stringify(u).includes(M13_GOV_SIMULATION_DISCLAIMER)),
    "M13-Gov units must include verbatim simulation disclaimer"
  );

  const vagueVerbRegex = /理解|认识|掌握/;
  const realisticSecretRegex = /(?:ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,})/;

  const coreRequiredTypes = [
    "concept",
    "ai-vs-trad",
    "instructor-demo",
    "failure-case",
    "collab-practice",
    "discussion",
    "quiz",
    "knowledge-base",
    "transfer-task",
  ] as const;

  for (const mod of COURSE_MODULE_RECORDS) {
    if (exemplarIds.has(mod.id)) {
      assert.equal(mod.exemplarLevel, "complete-exemplar", `${mod.id} should be complete-exemplar`);
    } else {
      assert.equal(mod.exemplarLevel, "compatible-adapter", `${mod.id} should be compatible-adapter`);
    }
    assert.ok(mod.units.length >= 9, `${mod.id} should have >=9 units`);
    assert.ok(mod.deliveryPlans.length >= 4, `${mod.id} should have 4 configurable plans`);

    const modTypes = new Set(mod.units.map((u) => u.type));
    for (const requiredType of coreRequiredTypes) {
      assert.ok(modTypes.has(requiredType), `${mod.id} missing unit type '${requiredType}'`);
    }
    const sandboxCount = mod.units.filter((u) => u.type === "sandbox").length;
    assert.equal(
      sandboxCount,
      mod.labIds.length,
      `${mod.id} sandbox units (${sandboxCount}) must match mod.labIds (${mod.labIds.length})`
    );

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

  const artifactFilenames = COURSE_MODULE_RECORDS.flatMap((m) =>
    m.units.filter((u) => u.learnerArtifact).map((u) => u.learnerArtifact!.filename)
  );
  assert.equal(artifactFilenames.length, 14, "Each of 14 modules should expose a starter artifact");
  assert.equal(
    new Set(artifactFilenames).size,
    14,
    "All 14 modules should have distinct starter artifact filenames"
  );
});

test("courseWorkspaceStore computes progress stats, migrates quiz keys, and exports clean Markdown offline", async () => {
  const {
    buildWorkspaceMarkdownExport,
    createInitialWorkspaceState,
    formatModuleCodeFromId,
    getCourseOverallStats,
    getModuleCompletionStats,
    M13_GOV_SIMULATION_DISCLAIMER,
    normalizeQuizAnswersRecord,
  } = await import("../src/data/courseWorkspaceStore");
  const { getModuleRecordById } = await import("../src/data/courseUnitsModel");

  assert.equal(formatModuleCodeFromId("m1"), "M1");
  assert.equal(formatModuleCodeFromId("m13-gov"), "M13-Gov");
  assert.equal(formatModuleCodeFromId("m13-eng"), "M13-Eng");

  // Legacy numeric key migration check ("1" -> "m1") & canonical precedence
  const migrated = normalizeQuizAnswersRecord({
    "1": { "m1-q1": 1 },
    "m13-gov": { "m13-gov-q1": 0 },
  });
  assert.deepEqual(migrated.m1, { "m1-q1": 1 });
  assert.deepEqual(migrated["m13-gov"], { "m13-gov-q1": 0 });

  const canonicalPreferred = normalizeQuizAnswersRecord({
    m1: { "m1-q1": 2 },
    "1": { "m1-q1": 0, "m1-q2": 3 },
  });
  assert.deepEqual(canonicalPreferred.m1, { "m1-q1": 2, "m1-q2": 3 });

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
  state.verifiedSkills["skill-backend-api-auth"] = {
    skillId: "skill-backend-api-auth",
    method: "starter-repo-evidence",
    evidenceSummary: "Webhook HMAC 验签 + 401/403 单测通过",
    verifiedAt: "2026-11-20",
  };

  const m1Stats = getModuleCompletionStats(m1, state);
  assert.equal(m1Stats.completedCount, 1);
  assert.equal(m1Stats.totalCount, shortUnits.length);

  const overall = getCourseOverallStats(state);
  assert.equal(overall.completedUnits, 1);
  assert.equal(overall.savedPracticeCount, 1);
  assert.equal(overall.customKbCount, 1);
  assert.equal(overall.totalModules, 14);

  const transferUnitId = shortUnits[shortUnits.length - 1];
  if (transferUnitId && transferUnitId !== shortUnits[0]) {
    state.dodCheckedByUnit[transferUnitId] = ["确认任务客观验收方法"];
    state.practiceNotes[transferUnitId] = {
      artifactDraft: "",
      reflectionNote: "",
      selectedTransferTier: "B 模块实战",
      updatedAt: "2026-11-19",
    };
  }

  const md = buildWorkspaceMarkdownExport(
    state,
    {
      "1": {
        "m1-q1": 1,
        "m1-q2": 0,
        "m1-q3": 2,
        "m1-q4": 1,
      },
      "m13-gov": {
        "m13-gov-q1": 0,
      },
    },
    {
      m1: { correctCount: 4, totalCount: 4, scorePct: 100 },
      "m13-gov": { correctCount: 1, totalCount: 4, scorePct: 25 },
    }
  );
  assert.ok(md.includes("AICodingCourse 学员学习产物与知识沉淀导出"));
  assert.ok(md.includes("Intent: 验证 Plan 模式边界"));
  assert.ok(md.includes("先锁文件白名单再让 AI 动手。"));
  assert.ok(md.includes("Plan 白名单模板"));
  assert.ok(md.includes("确认任务客观验收方法"));
  assert.ok(md.includes("B 模块实战"));
  assert.ok(md.includes("各模块巩固测验成绩汇总"));
  assert.ok(md.includes("M1"));
  assert.ok(md.includes("已核验前置技能门禁"));
  assert.ok(md.includes("Webhook HMAC 验签"));
  assert.ok(md.includes(M13_GOV_SIMULATION_DISCLAIMER), "Markdown export must preserve verbatim M13-Gov disclaimer");

  const {
    buildFullCourseInstructorHandbookMarkdown,
    buildInstructorLessonPlanMarkdown,
  } = await import("../src/server/services/curriculumService");
  const m1PrepShort = buildInstructorLessonPlanMarkdown("m1", "m1-plan-short")!;
  assert.ok(m1PrepShort.includes("短讲精要"));
  assert.ok(m1PrepShort.includes("分单元备课指南与参考答案"));
  assert.ok(m1PrepShort.includes("参考答案与可接受解法"));

  const m4Prep = buildInstructorLessonPlanMarkdown("m4", "m4-plan-workshop")!;
  assert.ok(m4Prep.includes("M4 教师备课讲义"));
  assert.ok(m4Prep.includes("工作坊实战"));

  const {
    buildKnowledgeBaseMarkdownExport,
    buildRuntimeWorkshopMarkdownExport,
  } = await import("../src/data/courseWorkspaceStore");
  const { TEAM_KNOWLEDGE_BASE } = await import("../src/data/teamKnowledgeBase");
  const { RUNTIME_WORKSHOP_KNOWLEDGE_BASE } = await import("../src/data/runtimeKnowledgeBase");

  const fullHandbook = buildFullCourseInstructorHandbookMarkdown(state.selectedPlanByModule);
  assert.ok(fullHandbook.includes("AICodingCourse 全课 14 模块教师备课总手册"));
  assert.ok(fullHandbook.includes("短讲精要"));
  for (const code of [
    "M1",
    "M2",
    "M3",
    "M4",
    "M5",
    "M6",
    "M7",
    "M8",
    "M9",
    "M10",
    "M11",
    "M12",
    "M13-Gov",
    "M13-Eng",
  ]) {
    assert.ok(fullHandbook.includes(`## ${code} ·`), `Handbook missing ${code}`);
  }

  const kbMd = buildKnowledgeBaseMarkdownExport({
    builtInEntries: TEAM_KNOWLEDGE_BASE.slice(0, 1),
    customEntries: state.customKbEntries,
    filterSummary: "测试工程知识库导出",
  });
  assert.ok(kbMd.includes("AICodingCourse 工程知识库资产导出"));
  assert.ok(kbMd.includes("研发工程知识库"));
  assert.equal(kbMd.includes("应用运行时领域知识库工坊"), false);
  assert.ok(kbMd.includes("Plan 白名单模板"));
  assert.ok(kbMd.includes("测试工程知识库导出"));

  const runtimeMd = buildRuntimeWorkshopMarkdownExport({
    runtimeEntries: RUNTIME_WORKSHOP_KNOWLEDGE_BASE.slice(0, 2),
    filterSummary: "测试运行时工作坊导出",
  });
  assert.ok(runtimeMd.includes("AICodingCourse 运行时领域知识库工坊规范导出"));
  assert.ok(runtimeMd.includes("链路 B"));
  assert.equal(runtimeMd.includes("Plan 白名单模板"), false);
});

test("searchCourseWorkspace searches modules, unit content, custom KB, and gates instructor-only text", async () => {
  const { searchCourseWorkspace } = await import("../src/data/courseSearch");

  const customEntries = [
    {
      id: "ckb-search-1",
      title: "支付路由禁改小数舍入规则",
      moduleCode: "M4" as const,
      category: "starter-rule" as const,
      scope: "src/server/billing/**",
      content: "Never change rounding logic without finance test suite.",
      cautionNote: "不要在无单测时放开 Agent 权限",
      updatedAt: "2026-11-20",
    },
  ];

  // Empty query returns zero results
  const emptyRes = searchCourseWorkspace("   ", { customKbEntries: customEntries });
  assert.equal(emptyRes.totalCount, 0);
  assert.equal(emptyRes.results.length, 0);

  // Searches modules, units, and team KB
  const mcpRes = searchCourseWorkspace("MCP", { customKbEntries: customEntries });
  assert.ok(mcpRes.counts.module >= 1, "Should hit M4 module for MCP");
  assert.ok(mcpRes.counts.unit >= 1, "Should hit MCP units");
  assert.ok(mcpRes.counts["team-kb"] >= 1, "Should hit MCP team KB entries");

  // Searches learner custom KB entries
  const customRes = searchCourseWorkspace("小数舍入", { customKbEntries: customEntries });
  assert.equal(customRes.counts["custom-kb"], 1);
  assert.equal(customRes.results[0].moduleCode, "M4");
  assert.equal(customRes.results[0].kind, "custom-kb");

  // Multi-token AND query narrows results accurately
  const andRes = searchCourseWorkspace("四段式 蓝图", { customKbEntries: customEntries });
  assert.ok(andRes.totalCount >= 1);
  assert.ok(andRes.results.some((r) => r.kind === "unit" && r.moduleId === "m1"));

  // Client courseSearch must never contain stripped instructor-only text
  const learnerSecretSearch = searchCourseWorkspace("改坏代码的原因", {
    customKbEntries: customEntries,
    includeInstructorMaterials: false,
  });
  assert.equal(learnerSecretSearch.totalCount, 0);

  const clientInstructorSearch = searchCourseWorkspace("改坏代码的原因", {
    customKbEntries: customEntries,
    includeInstructorMaterials: true,
  });
  assert.equal(
    clientInstructorSearch.totalCount,
    0,
    "Client bundle courseSearch must never contain stripped teacherMaterials strings"
  );

  // Searches AI-pdf-books knowledge base
  const bookSearch = searchCourseWorkspace("Chip Huyen", { customKbEntries: customEntries });
  assert.ok(bookSearch.counts.book >= 1, "Should hit AI_BOOKS_KNOWLEDGE_BASE books");
  const bookHit = bookSearch.results.find((r) => r.kind === "book");
  assert.ok(bookHit, "Should return a book result");
  assert.equal(bookHit.kbSection, "books");

  // Searches Runtime Workshop KB (Link B) without leaking into Engineering KB (Link A)
  const runtimeSearch = searchCourseWorkspace("Tombstone", { customKbEntries: customEntries });
  assert.ok(runtimeSearch.counts["runtime-kb"] >= 1, "Should hit runtime-kb entries");
  assert.equal(runtimeSearch.counts["team-kb"], 0, "Runtime query must not hit engineering team-kb");
  const runtimeHit = runtimeSearch.results.find((r) => r.kind === "runtime-kb");
  assert.ok(runtimeHit, "Should return a runtime-kb result");
  assert.equal(runtimeHit.kbTrack, "runtime-domain");

  // Verify CourseKnowledgeView, ModuleLearningPage & KnowledgeBaseSidebar enforce Link A / Link B isolation
  const kbViewSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/course/CourseKnowledgeView.tsx"),
    "utf8"
  );
  assert.ok(kbViewSource.includes("searchEngineeringKnowledgeBase"));
  assert.ok(kbViewSource.includes("searchRuntimeKnowledgeBase"));
  assert.equal(
    /useState<KnowledgeBaseTrack\s*\|\s*"ALL">/.test(kbViewSource),
    false,
    "CourseKnowledgeView must enforce binary engineering vs runtime-domain tracks without mixed ALL state"
  );

  const modulePageSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/course/ModuleLearningPage.tsx"),
    "utf8"
  );
  assert.equal(
    modulePageSource.includes("[...TEAM_KNOWLEDGE_BASE, ...RUNTIME_WORKSHOP_KNOWLEDGE_BASE]"),
    false,
    "ModuleLearningPage must isolate Link A (TEAM_KNOWLEDGE_BASE) from Link B (RUNTIME_WORKSHOP_KNOWLEDGE_BASE) by track"
  );
  assert.ok(
    modulePageSource.includes("!isRuntimeModule"),
    "ModuleLearningPage must gate Link A custom drafts away from runtime modules"
  );

  const sidebarSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/KnowledgeBaseSidebar.tsx"),
    "utf8"
  );
  assert.ok(sidebarSource.includes("searchEngineeringKnowledgeBase"));
  assert.ok(sidebarSource.includes("searchRuntimeKnowledgeBase"));
  assert.ok(sidebarSource.includes("runtime-kb"));

  const catalogHomeSource = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/course/CourseCatalogHome.tsx"),
    "utf8"
  );
  assert.ok(
    catalogHomeSource.includes("pathOrderMap"),
    "CourseCatalogHome must sort pathOrderedModules by recommendedModuleIds DAG order"
  );
});

test("AI_BOOKS_KNOWLEDGE_BASE covers all 73 AI-pdf-books PDFs (78 total) and integrates with Markdown export", async () => {
  const { AI_BOOKS_KNOWLEDGE_BASE, getBookGithubUrl } = await import(
    "../src/data/aiBooksKnowledgeBase"
  );
  const { buildKnowledgeBaseMarkdownExport } = await import("../src/data/courseWorkspaceStore");
  const { TEAM_KNOWLEDGE_BASE } = await import("../src/data/teamKnowledgeBase");

  assert.equal(AI_BOOKS_KNOWLEDGE_BASE.length, 78);
  const repoBooks = AI_BOOKS_KNOWLEDGE_BASE.filter(
    (b) => !b.repoPath.startsWith("external/") && !b.repoPath.startsWith("assets/")
  );
  assert.equal(repoBooks.length, 73, "Should include all 73 PDFs from MinhNguyenDS/AI-pdf-books");

  const seenIds = new Set<string>();
  const seenRepoPaths = new Set<string>();
  for (const book of AI_BOOKS_KNOWLEDGE_BASE) {
    assert.ok(!seenIds.has(book.id), `Duplicate book id: ${book.id}`);
    seenIds.add(book.id);
    if (!book.repoPath.startsWith("external/") && !book.repoPath.startsWith("assets/")) {
      assert.ok(!seenRepoPaths.has(book.repoPath), `Duplicate repoPath: ${book.repoPath}`);
      seenRepoPaths.add(book.repoPath);
      assert.match(book.repoPath, /\.pdf$/i);
    }
    assert.ok(book.targetModules.length >= 1, `${book.id} needs targetModules`);
    assert.match(getBookGithubUrl(book), /^https:\/\//);
  }

  const kbMdWithBooks = buildKnowledgeBaseMarkdownExport({
    builtInEntries: TEAM_KNOWLEDGE_BASE.slice(0, 1),
    customEntries: [],
    books: AI_BOOKS_KNOWLEDGE_BASE.slice(0, 3),
    filterSummary: "AI-pdf-books 书库测试",
  });
  assert.ok(kbMdWithBooks.includes("AI-pdf-books 开源书库与参考专著"));
  assert.ok(kbMdWithBooks.includes(AI_BOOKS_KNOWLEDGE_BASE[0].title));
  assert.ok(kbMdWithBooks.includes(getBookGithubUrl(AI_BOOKS_KNOWLEDGE_BASE[0])));
});

test("runtimeKnowledgeBase enforces ACL pre-filter, tombstone invalidation, citation grounding, and zero-evidence refusal", async () => {
  const { evaluateRuntimeKbRetrieval, retrieveAuthorizedRuntimeChunks } = await import(
    "../src/data/runtimeKnowledgeBase"
  );

  const corpus = [
    {
      chunkId: "c-acme-2026",
      docId: "kb-reimburse-2026",
      tenantId: "tenant-acme",
      allowedRoles: ["intern", "finance", "admin"],
      version: "v3.1",
      status: "active" as const,
      section: "§2.1 差旅报销上限",
      text: "Acme 2026 新规：一线城市住宿报销上限 650 元/晚。",
      semanticScore: 0.9,
    },
    {
      chunkId: "c-acme-2023-old",
      docId: "kb-reimburse-2023",
      tenantId: "tenant-acme",
      allowedRoles: ["intern", "finance", "admin"],
      version: "v1.0",
      status: "deprecated" as const,
      supersededBy: "kb-reimburse-2026",
      section: "§2.1 历史差旅标准",
      text: "2023 旧规：一线城市住宿报销上限 900 元/晚。",
      semanticScore: 0.98,
    },
    {
      chunkId: "c-acme-salary",
      docId: "kb-acme-salary-audit",
      tenantId: "tenant-acme",
      allowedRoles: ["finance", "admin"],
      version: "v2.4",
      status: "active" as const,
      section: "§4.2 薪酬审计口径",
      text: "财务机密：Q4 奖金池测算系数与高管薪酬校准口径。",
      semanticScore: 0.91,
    },
    {
      chunkId: "c-beta-clinical",
      docId: "kb-beta-clinical",
      tenantId: "tenant-beta",
      allowedRoles: ["admin", "clinician"],
      version: "v1.8",
      status: "active" as const,
      section: "§1.3 跨租户临床样本",
      text: "Beta 医院心血管患者回访住宿与复诊记录。",
      semanticScore: 0.95,
    },
  ];

  // 1. Intern receives only active 2026 policy with immutable citation, never deprecated 2023 or salary/beta docs
  const internHotel = retrieveAuthorizedRuntimeChunks(
    corpus,
    { tenantId: "tenant-acme", role: "intern" },
    ["住宿", "报销"]
  );
  assert.equal(internHotel.grounded, true);
  assert.equal(internHotel.refusalReason, null);
  assert.deepEqual(
    internHotel.citations.map((c) => c.docId),
    ["kb-reimburse-2026"]
  );
  assert.equal(internHotel.citations[0].version, "v3.1");
  assert.equal(internHotel.citations[0].section, "§2.1 差旅报销上限");
  assert.ok(internHotel.blocked.some((b) => b.docId === "kb-reimburse-2023" && b.reasonCode === "tombstone"));
  assert.ok(internHotel.blocked.some((b) => b.docId === "kb-acme-salary-audit" && b.reasonCode === "unauthorized-role"));
  assert.ok(internHotel.blocked.some((b) => b.docId === "kb-beta-clinical" && b.reasonCode === "cross-tenant"));

  // 2. Unauthorized role probing salary doc must trigger safe refusal
  const internSalaryProbe = retrieveAuthorizedRuntimeChunks(
    corpus,
    { tenantId: "tenant-acme", role: "intern" },
    ["奖金池", "薪酬"]
  );
  assert.equal(internSalaryProbe.grounded, false);
  assert.equal(internSalaryProbe.citations.length, 0);
  assert.ok(internSalaryProbe.refusalReason);

  // 3. Cross-tenant probing from finance in tenant-acme must never see tenant-beta
  const crossTenantProbe = retrieveAuthorizedRuntimeChunks(
    corpus,
    { tenantId: "tenant-acme", role: "finance" },
    ["心血管", "临床"]
  );
  assert.equal(crossTenantProbe.grounded, false);
  assert.equal(crossTenantProbe.citations.length, 0);

  // 4. Dual-eval probe suite confirms 0% unauthorized leak & 0% deprecated recall
  const evalReport = evaluateRuntimeKbRetrieval(corpus, [
    {
      id: "probe-intern-reimburse",
      session: { tenantId: "tenant-acme", role: "intern" },
      queryTerms: ["住宿", "上限"],
      expectGrounded: true,
      expectedDocIds: ["kb-reimburse-2026"],
      forbiddenDocIds: ["kb-reimburse-2023", "kb-acme-salary-audit", "kb-beta-clinical"],
    },
    {
      id: "probe-intern-salary-denied",
      session: { tenantId: "tenant-acme", role: "intern" },
      queryTerms: ["奖金池"],
      expectGrounded: false,
      forbiddenDocIds: ["kb-acme-salary-audit"],
    },
    {
      id: "probe-finance-salary-allowed",
      session: { tenantId: "tenant-acme", role: "finance" },
      queryTerms: ["奖金池"],
      expectGrounded: true,
      expectedDocIds: ["kb-acme-salary-audit"],
    },
    {
      id: "probe-cross-tenant-denied",
      session: { tenantId: "tenant-acme", role: "admin" },
      queryTerms: ["心血管"],
      expectGrounded: false,
      forbiddenDocIds: ["kb-beta-clinical"],
    },
    {
      id: "probe-beta-admin-allowed",
      session: { tenantId: "tenant-beta", role: "admin" },
      queryTerms: ["心血管"],
      expectGrounded: true,
      expectedDocIds: ["kb-beta-clinical"],
      forbiddenDocIds: ["kb-reimburse-2026", "kb-acme-salary-audit"],
    },
  ]);
  assert.equal(evalReport.passed, true);
  assert.equal(evalReport.unauthorizedLeakCount, 0);
  assert.equal(evalReport.deprecatedRecallCount, 0);
  assert.equal(evalReport.refusalMismatchCount, 0);
  assert.equal(evalReport.passedProbes, 5);
});

test("courseMetrics provides single source of truth and website routes isolate /teens and /teams cleanly", async () => {
  const { getFreeTrialModulePreview, getPublicCourseMetrics } = await import(
    "../src/data/courseMetrics"
  );

  const metrics = getPublicCourseMetrics();
  assert.equal(metrics.moduleCount, 14);
  assert.equal(metrics.labCount, 20);
  assert.equal(metrics.trackCount, 3);
  assert.equal(metrics.unitCount, 149);
  assert.equal(metrics.slideCount, 152);
  assert.equal(metrics.quizQuestionCount, 49);

  const m1Preview = getFreeTrialModulePreview();
  assert.equal(m1Preview.moduleMeta.id, "m1");
  assert.equal(m1Preview.units.length, 10);

  const appSrc = fs.readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  assert.ok(appSrc.includes('"/teens"'), "App.tsx must route /teens");
  assert.ok(appSrc.includes('"/teams"'), "App.tsx must route /teams");

  const homeSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/website/OfficialHomePage.tsx"),
    "utf8"
  );
  const teensSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/website/TeensLandingPage.tsx"),
    "utf8"
  );
  const teamsSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/website/TeamsLandingPage.tsx"),
    "utf8"
  );
  const navSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/website/WebsiteNavbar.tsx"),
    "utf8"
  );

  assert.ok(homeSrc.includes("getPublicCourseMetrics"), "Homepage must consume dynamic courseMetrics");
  assert.ok(homeSrc.includes("PlanPromptSandbox"), "Homepage must embed live PlanPromptSandbox");
  assert.ok(teensSrc.includes("getPublicCourseMetrics"), "Teens landing page must consume dynamic courseMetrics");
  assert.ok(teensSrc.includes("HiMCM #19243"), "Teens landing page must present HiMCM workflow with honest boundaries");
  assert.ok(teensSrc.includes("AI Novel Studio"), "Teens landing page must include AI Novel Studio case");
  assert.ok(teensSrc.includes("医疗公司 GEO 系统"), "Teens landing page must include Medical GEO case");
  assert.ok(
    teensSrc.includes("-ECE-Brain-Meeting") && teensSrc.includes("哲学研究平台"),
    "Teens landing page must explicitly disclose secondary-adapted prototype sources"
  );
  assert.ok(
    teensSrc.includes("初中阶段") && teensSrc.includes("高中阶段"),
    "Teens landing page must provide Junior vs Senior progression comparison"
  );
  assert.ok(
    teensSrc.includes("合规使用软件工具") && teensSrc.includes("M13_GOV_SIMULATION_DISCLAIMER"),
    "Teens landing page must present all 4 parent/teacher transparency principles and M13-Gov disclaimer"
  );
  assert.ok(teamsSrc.includes("ECE-Brain-Meeting"), "Teams landing page must cover team engineering cases");
  assert.ok(navSrc.includes("青少年营") && navSrc.includes("团队内训"), "WebsiteNavbar must expose /teens and /teams links");

  const stalePattern = /10\s*个?\s*模块|16\s*个?\s*(?:交互)?沙盘|111\s*个?\s*单元/;
  for (const [name, content] of [
    ["OfficialHomePage", homeSrc],
    ["TeensLandingPage", teensSrc],
    ["TeamsLandingPage", teamsSrc],
    ["WebsiteNavbar", navSrc],
  ]) {
    assert.equal(stalePattern.test(content), false, `${name} must not contain stale course counts`);
  }
});
