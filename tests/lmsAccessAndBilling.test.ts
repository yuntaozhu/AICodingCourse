import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../src/data/courseWorkspaceStore";
import { resolvePostgresPoolConfig } from "../src/db/index.ts";
import type { AuthContext } from "../src/server/auth.ts";
import { verifyWebhookSignature } from "../src/server/services/billingService.ts";
import {
  canViewInstructorMaterials,
  getAuthorizedModuleDetail,
  getPublicCurriculumOverview,
  getSanitizedModuleQuiz,
} from "../src/server/services/curriculumService.ts";

const mockLearnerAuth: AuthContext = {
  user: {
    id: 101,
    uid: "learner-uid-1",
    email: "learner@example.com",
    displayName: "Learner",
    avatarUrl: "",
  },
  authMethod: "email_otp",
  roles: ["learner"],
  isAdmin: false,
  isInstructorOrTa: false,
  assignedCohortIds: [],
};

const mockInstructorAuth: AuthContext = {
  user: {
    id: 202,
    uid: "instructor-uid-1",
    email: "instructor@example.com",
    displayName: "Instructor",
    avatarUrl: "",
  },
  authMethod: "email_otp",
  roles: ["instructor"],
  isAdmin: false,
  isInstructorOrTa: true,
  assignedCohortIds: [1],
};

test("getPublicCurriculumOverview locks M2–M13-Eng when unpaid and opens M1 as free trial", () => {
  const unpaid = getPublicCurriculumOverview(false);
  assert.equal(unpaid.modules.length, 14);
  const m1 = unpaid.modules.find((m) => m.id === "m1");
  const m2 = unpaid.modules.find((m) => m.id === "m2");
  const m13Gov = unpaid.modules.find((m) => m.id === "m13-gov");
  assert.equal(m1?.isFreeTrial, true);
  assert.equal(m1?.unlocked, true);
  assert.equal(m2?.isFreeTrial, false);
  assert.equal(m2?.unlocked, false);
  assert.equal(m13Gov?.unlocked, false);

  const paid = getPublicCurriculumOverview(true);
  assert.ok(paid.modules.every((m) => m.unlocked === true));
});

test("getAuthorizedModuleDetail gates paid modules and strips teacherMaterials for non-instructors", () => {
  // Unauthenticated M1 free trial still strips teacher materials
  const m1Anon = getAuthorizedModuleDetail("m1", undefined, false);
  assert.equal(m1Anon.found, true);
  if (m1Anon.found && m1Anon.allowed) {
    assert.equal(m1Anon.instructorAuthorized, false);
    assert.equal(m1Anon.teachingPackage, null);
    for (const unit of m1Anon.module.units) {
      assert.equal(unit.teacherMaterials.teachingTips, "");
      assert.deepEqual(unit.teacherMaterials.referenceAnswers, []);
      assert.deepEqual(unit.teacherMaterials.commonPitfalls, []);
    }
  } else {
    assert.fail("M1 free trial should be accessible anonymously");
  }

  // Unpaid learner requesting M2 gets denied
  const m2Unpaid = getAuthorizedModuleDetail("m2", mockLearnerAuth, false);
  assert.equal(m2Unpaid.found, true);
  assert.equal(m2Unpaid.allowed, false);

  // Paid learner requesting M2 gets access with teacherMaterials stripped
  const m2PaidLearner = getAuthorizedModuleDetail("m2", mockLearnerAuth, true);
  assert.equal(m2PaidLearner.found, true);
  if (m2PaidLearner.found && m2PaidLearner.allowed) {
    assert.equal(m2PaidLearner.instructorAuthorized, false);
    assert.equal(m2PaidLearner.teachingPackage, null);
    for (const unit of m2PaidLearner.module.units) {
      assert.equal(unit.teacherMaterials.teachingTips, "");
      assert.deepEqual(unit.teacherMaterials.referenceAnswers, []);
    }
  } else {
    assert.fail("Paid learner should access M2");
  }

  // Assigned instructor receives full teacherMaterials & teachingPackage
  const m2Instructor = getAuthorizedModuleDetail("m2", mockInstructorAuth, true);
  assert.equal(m2Instructor.found, true);
  if (m2Instructor.found && m2Instructor.allowed) {
    assert.equal(m2Instructor.instructorAuthorized, true);
    assert.ok(m2Instructor.teachingPackage !== null);
    assert.ok(
      m2Instructor.module.units.some(
        (u) => u.teacherMaterials.teachingTips.trim().length > 0
      )
    );
  } else {
    assert.fail("Instructor should access M2 with teaching materials");
  }

  // Verbatim M13-Gov disclaimer preserved
  const m13Gov = getAuthorizedModuleDetail("m13-gov", mockLearnerAuth, true);
  assert.equal(m13Gov.found, true);
  if (m13Gov.found && m13Gov.allowed) {
    assert.equal(m13Gov.simulationDisclaimer, M13_GOV_SIMULATION_DISCLAIMER);
  } else {
    assert.fail("Paid learner should access M13-Gov");
  }
});

test("canViewInstructorMaterials rejects anonymous and learner contexts", () => {
  assert.equal(canViewInstructorMaterials(undefined), false);
  assert.equal(canViewInstructorMaterials(mockLearnerAuth), false);
  assert.equal(canViewInstructorMaterials(mockInstructorAuth), true);
});

test("getSanitizedModuleQuiz gates M2+ when unpaid and omits correctIndex/explanation", () => {
  const m1Quiz = getSanitizedModuleQuiz("m1", false);
  assert.equal(m1Quiz.found, true);
  if (m1Quiz.found && m1Quiz.allowed) {
    assert.ok(m1Quiz.quiz.questions.length >= 3);
    for (const q of m1Quiz.quiz.questions) {
      assert.equal("correctIndex" in q, false);
      assert.equal("explanation" in q, false);
      assert.equal(q.options.length, 4);
    }
  } else {
    assert.fail("M1 quiz should be accessible in free trial");
  }

  const m2Unpaid = getSanitizedModuleQuiz("m2", false);
  assert.equal(m2Unpaid.found, true);
  assert.equal(m2Unpaid.allowed, false);

  const m2Paid = getSanitizedModuleQuiz("m2", true);
  assert.equal(m2Paid.found, true);
  if (m2Paid.found && m2Paid.allowed) {
    for (const q of m2Paid.quiz.questions) {
      assert.equal("correctIndex" in q, false);
      assert.equal("explanation" in q, false);
    }
  } else {
    assert.fail("Paid M2 quiz should be accessible");
  }
});

test("verifyWebhookSignature validates HMAC-SHA256 signatures and rejects tampering or missing secrets", () => {
  const prevSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  const payload = JSON.stringify({
    provider: "stripe",
    externalEventId: "evt_test_123",
    orderNo: "ORD-123",
    eventType: "payment.succeeded",
  });

  try {
    delete process.env.PAYMENT_WEBHOOK_SECRET;
    assert.equal(verifyWebhookSignature(payload, "deadbeef"), false);

    process.env.PAYMENT_WEBHOOK_SECRET = "test-webhook-secret-987654";
    const expectedHex = crypto
      .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    assert.equal(verifyWebhookSignature(payload, expectedHex), true);
    assert.equal(verifyWebhookSignature(payload, `sha256=${expectedHex}`), true);
    assert.equal(verifyWebhookSignature(payload, undefined), false);
    assert.equal(verifyWebhookSignature(payload, "0".repeat(expectedHex.length)), false);
    assert.equal(verifyWebhookSignature(`${payload} `, expectedHex), false);
  } finally {
    if (prevSecret === undefined) {
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    } else {
      process.env.PAYMENT_WEBHOOK_SECRET = prevSecret;
    }
  }
});

test("resolvePostgresPoolConfig prioritizes Cloud SQL sockets without TLS and enables strict TLS for remote Vercel/Neon hosts", () => {
  const cloudSql = resolvePostgresPoolConfig({
    SQL_HOST: "/cloudsql/proj:europe-west1:inst",
    SQL_USER: "appuser",
    SQL_PASSWORD: "pw",
    SQL_DB_NAME: "appdb",
    PGHOST: "ep-remote.neon.tech",
  });
  assert.equal(cloudSql.host, "/cloudsql/proj:europe-west1:inst");
  assert.equal(cloudSql.user, "appuser");
  assert.equal(cloudSql.database, "appdb");
  assert.equal(cloudSql.ssl, undefined);
  assert.equal(cloudSql.max, 10);

  const neon = resolvePostgresPoolConfig({
    PGHOST: "ep-example-pooler.ap-southeast-1.aws.neon.tech",
    PGUSER: "neondb_owner",
    PGPASSWORD: "pw",
    PGDATABASE: "neondb",
  });
  assert.equal(neon.host, "ep-example-pooler.ap-southeast-1.aws.neon.tech");
  assert.equal(neon.user, "neondb_owner");
  assert.equal(neon.database, "neondb");
  assert.deepEqual(neon.ssl, { rejectUnauthorized: true });
  assert.equal(neon.max, 5);

  const neonUrl = resolvePostgresPoolConfig({
    DATABASE_URL:
      "postgresql://neondb_owner:pw@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  });
  assert.equal(
    neonUrl.connectionString,
    "postgresql://neondb_owner:pw@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  );
  assert.deepEqual(neonUrl.ssl, { rejectUnauthorized: true });
  assert.equal(neonUrl.max, 5);

  const cloudSqlWins = resolvePostgresPoolConfig({
    SQL_HOST: "/cloudsql/proj:europe-west1:inst",
    SQL_USER: "appuser",
    SQL_PASSWORD: "pw",
    SQL_DB_NAME: "appdb",
    DATABASE_URL: "postgresql://neondb_owner:pw@ep-remote.neon.tech/neondb",
  });
  assert.equal(cloudSqlWins.host, "/cloudsql/proj:europe-west1:inst");
  assert.equal(cloudSqlWins.ssl, undefined);
});

test("emailOtpService hashes/verifies 6-digit codes safely and enforces 60s cooldown", async () => {
  const {
    hashEmailOtpCode,
    isOtpCooldownActive,
    normalizeEmailAddress,
    verifyEmailOtpHash,
  } = await import("../src/server/services/emailOtpService.ts");

  assert.equal(normalizeEmailAddress("  User@Example.COM "), "user@example.com");

  const storedHash = hashEmailOtpCode("User@Example.com", "482913", "salt-abc-123");
  assert.equal(verifyEmailOtpHash("user@example.com", "482913", storedHash), true);
  assert.equal(verifyEmailOtpHash("other@example.com", "482913", storedHash), false);
  assert.equal(verifyEmailOtpHash("user@example.com", "000000", storedHash), false);
  assert.equal(verifyEmailOtpHash("user@example.com", "482913", "badhashformat"), false);
  const tamperedLastChar = storedHash.endsWith("0") ? "1" : "0";
  assert.equal(
    verifyEmailOtpHash(
      "user@example.com",
      "482913",
      `${storedHash.slice(0, -1)}${tamperedLastChar}`
    ),
    false
  );

  const baseTime = new Date("2026-11-23T12:00:00.000Z");
  const duringCooldown = isOtpCooldownActive(baseTime, new Date("2026-11-23T12:00:45.000Z"));
  assert.equal(duringCooldown.active, true);
  assert.equal(duringCooldown.retryAfterSeconds, 15);

  const afterCooldown = isOtpCooldownActive(baseTime, new Date("2026-11-23T12:01:01.000Z"));
  assert.equal(afterCooldown.active, false);
  assert.equal(afterCooldown.retryAfterSeconds, 0);
});

test("tokenService uses non-hardcoded secret and rejects tampered session tokens", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { getSessionSigningSecret, signToken } = await import(
    "../src/server/services/tokenService.ts"
  );

  const tokenSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/server/services/tokenService.ts"),
    "utf8"
  );
  assert.equal(
    tokenSrc.includes("aicoding-dev-secret"),
    false,
    "tokenService must never contain hardcoded fallback literal secret"
  );
  assert.ok(getSessionSigningSecret().length >= 32);

  const token = signToken({ userId: 42, email: "student@example.com" });
  const parts = token.split(".");
  assert.equal(parts.length, 3);
  const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
    userId: number;
    email: string;
    exp: number;
  };
  assert.equal(decoded.userId, 42);
  assert.equal(decoded.email, "student@example.com");
  assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
});

test("server grading endpoints gate M2+ single-question checks and return M1/skill previews", async () => {
  const {
    buildFullCourseInstructorHandbookMarkdown,
    buildInstructorLessonPlanMarkdown,
    gradePreviewM1Quiz,
    gradePreviewSkillDiagnostic,
    gradeSingleQuizQuestion,
  } = await import("../src/server/services/curriculumService.ts");
  const { MODULE_QUIZZES } = await import("../src/server/data/privateQuizBank.ts");
  const { COURSE_SKILLS } = await import("../src/server/data/privateSkills.ts");

  const m1FirstQ = MODULE_QUIZZES.m1.questions[0];
  const m1Preview = gradePreviewM1Quiz({ [m1FirstQ.id]: m1FirstQ.correctIndex });
  assert.equal(m1Preview.moduleId, "m1");
  assert.equal(m1Preview.correctCount, 1);
  assert.equal(m1Preview.questionResults[0].isCorrect, true);

  const m2SingleUnpaid = gradeSingleQuizQuestion({
    moduleId: "m2",
    questionId: MODULE_QUIZZES.m2.questions[0].id,
    selectedIndex: 0,
    hasPaidAccess: false,
  });
  assert.equal(m2SingleUnpaid.ok, false);
  if (!m2SingleUnpaid.ok) {
    assert.equal(m2SingleUnpaid.status, 403);
  }

  const m2Q = MODULE_QUIZZES.m2.questions[0];
  const m2SinglePaid = gradeSingleQuizQuestion({
    moduleId: "m2",
    questionId: m2Q.id,
    selectedIndex: m2Q.correctIndex,
    hasPaidAccess: true,
  });
  assert.equal(m2SinglePaid.ok, true);
  if (m2SinglePaid.ok) {
    assert.equal(m2SinglePaid.isCorrect, true);
    assert.ok(m2SinglePaid.explanation.length > 5);
  }

  const skill = COURSE_SKILLS.find((s) => s.diagnosticQuestions.length > 0)!;
  const diagRight = gradePreviewSkillDiagnostic({
    skillId: skill.id,
    answers: Object.fromEntries(skill.diagnosticQuestions.map((dq) => [dq.id, dq.correctIndex])),
  });
  assert.equal(diagRight.ok, true);
  if (diagRight.ok) {
    assert.equal(diagRight.passed, true);
  }

  const m1PlanMd = buildInstructorLessonPlanMarkdown("m1", "m1-plan-short");
  assert.ok(m1PlanMd && m1PlanMd.includes("分单元备课指南与参考答案"));
  const handbookMd = buildFullCourseInstructorHandbookMarkdown({});
  assert.ok(handbookMd.includes("AICodingCourse 全课 14 模块教师备课总手册"));
});

test("client src/data modules strip quiz answers, skill answers, and instructor materials", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const clientFiles = [
    "src/data/moduleQuizzes.ts",
    "src/data/moduleTeachingPackages.ts",
    "src/data/courseUnitsModel.ts",
    "src/data/courseSkills.ts",
    "src/data/courseWorkspaceStore.ts",
  ];
  const forbiddenPatterns = [
    /\bcorrectIndex\s*:/,
    /\breferenceAnswers\s*:\s*\[[^\]]+/,
    /\bstuckStudentPrompts\s*:\s*\[[^\]]+/,
    /\bacceptableAlternatives\s*:\s*\[[^\]]+/,
    /\bnoKeyOfflineFallback\s*:\s*"[^"]+/,
    /\bteachingTips\s*:\s*"[^"]+/,
    /\btrimAndMergeNote\s*:\s*"[^"]+/,
  ];

  for (const relPath of clientFiles) {
    const content = fs.readFileSync(path.resolve(process.cwd(), relPath), "utf8");
    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `${relPath} must not contain secret pattern ${pattern}`
      );
    }
  }
});

test("domestic access readiness: index.html avoids Google Fonts CDN and BillingModal routes to email OTP", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf8");
  assert.equal(html.includes("fonts.googleapis.com"), false);
  assert.equal(html.includes("fonts.gstatic.com"), false);

  const billingModal = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/lms/BillingModal.tsx"),
    "utf8"
  );
  assert.equal(billingModal.includes("signInWithGoogle"), false);
  assert.equal(billingModal.includes("app:open-login"), true);
});

test("Stage 0: evaluateAccessPolicy enforces product tiers, module/track scopes, validity windows, and cohort isolation", async () => {
  const {
    doesScopeCoverModule,
    evaluateAccessPolicy,
  } = await import("../src/server/services/entitlementService.ts");

  assert.equal(doesScopeCoverModule("module_list", "m3,m9", "m3"), true);
  assert.equal(doesScopeCoverModule("module_list", "m3,m9", "m12"), false);
  assert.equal(doesScopeCoverModule("track", "foundation", "m9"), true);
  assert.equal(doesScopeCoverModule("track", "foundation", "m12"), false);

  const now = new Date("2026-11-25T12:00:00.000Z");
  const past = new Date("2026-11-01T00:00:00.000Z");
  const future = new Date("2026-12-30T00:00:00.000Z");

  // 1. Self-paced user with track scope: foundation modules unlocked, M12 locked, cohort submission denied
  const selfPacedPolicy = evaluateAccessPolicy({
    authContext: mockLearnerAuth,
    entitlements: [
      {
        id: 1,
        productId: 1,
        productType: "self_paced",
        scopeType: "track",
        scopeRef: "foundation",
        status: "active",
        validFrom: past,
        validUntil: future,
      },
    ],
    enrolledCohortIds: [1],
    cohortCodeById: new Map([[1, "COHORT-2026-Q4"]]),
    now,
  });
  assert.equal(selfPacedPolicy.accessTier, "self_paced");
  assert.equal(selfPacedPolicy.hasModuleAccess("m9"), true);
  assert.equal(selfPacedPolicy.hasModuleAccess("m12"), false);
  assert.equal(selfPacedPolicy.canSubmitToCohort(null).allowed, true);
  assert.equal(selfPacedPolicy.canSubmitToCohort(1).allowed, false);

  // 2. Cohort mentored entitlement strictly scoped to COHORT-2026-Q4 (id=1), blocked from other cohort (id=2)
  const cohortPolicy = evaluateAccessPolicy({
    authContext: mockLearnerAuth,
    entitlements: [
      {
        id: 2,
        productId: 2,
        productType: "cohort_mentored",
        scopeType: "cohort_track",
        scopeRef: "COHORT-2026-Q4",
        status: "active",
        validFrom: past,
        validUntil: future,
        cohortId: 1,
        cohortCode: "COHORT-2026-Q4",
      },
    ],
    enrolledCohortIds: [1, 2],
    cohortCodeById: new Map([
      [1, "COHORT-2026-Q4"],
      [2, "COHORT-2026-OTHER"],
    ]),
    now,
  });
  assert.equal(cohortPolicy.accessTier, "cohort_mentored");
  assert.equal(cohortPolicy.hasModuleAccess("m12"), true);
  assert.equal(cohortPolicy.canSubmitToCohort(1).allowed, true);
  assert.equal(cohortPolicy.canSubmitToCohort(2).allowed, false);

  // 3. Enterprise training scoped to ENT-2026-ACME:m3,m9 + expired/refunded entitlements rejected
  const enterprisePolicy = evaluateAccessPolicy({
    authContext: mockLearnerAuth,
    entitlements: [
      {
        id: 3,
        productId: 3,
        productType: "enterprise_training",
        scopeType: "enterprise_cohort",
        scopeRef: "ENT-2026-ACME:m3,m9",
        status: "active",
        validFrom: past,
        validUntil: future,
        cohortId: 9,
        cohortCode: "ENT-2026-ACME",
      },
      {
        id: 4,
        productId: 1,
        productType: "self_paced",
        scopeType: "all_modules",
        scopeRef: "m1-m13-eng",
        status: "refunded",
        validFrom: past,
        validUntil: future,
      },
    ],
    enrolledCohortIds: [9],
    cohortCodeById: new Map([[9, "ENT-2026-ACME"]]),
    now,
  });
  assert.equal(enterprisePolicy.accessTier, "enterprise_training");
  assert.equal(enterprisePolicy.hasModuleAccess("m3"), true);
  assert.equal(enterprisePolicy.hasModuleAccess("m12"), false);
  assert.equal(enterprisePolicy.canSubmitToCohort(9).allowed, true);
});

test("Stage 0: evaluateAdminBootstrapCheck and validateWebhookOrderConsistency enforce controlled security boundaries", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { evaluateAdminBootstrapCheck } = await import("../src/server/auth.ts");
  const { validateWebhookOrderConsistency } = await import(
    "../src/server/services/billingService.ts"
  );

  // Token-gated bootstrap
  assert.equal(
    evaluateAdminBootstrapCheck({
      userEmail: "ops@example.com",
      providedToken: "wrong-token",
      env: { NODE_ENV: "production", ADMIN_BOOTSTRAP_TOKEN: "secret-boot-999" },
    }).allowed,
    false
  );
  assert.equal(
    evaluateAdminBootstrapCheck({
      userEmail: "ops@example.com",
      providedToken: "secret-boot-999",
      env: { NODE_ENV: "production", ADMIN_BOOTSTRAP_TOKEN: "secret-boot-999" },
    }).allowed,
    true
  );

  // Email whitelist + production block when unconfigured
  assert.equal(
    evaluateAdminBootstrapCheck({
      userEmail: "stranger@example.com",
      env: { NODE_ENV: "production", ADMIN_EMAIL: "admin@example.com" },
    }).allowed,
    false
  );
  assert.equal(
    evaluateAdminBootstrapCheck({
      userEmail: "admin@example.com",
      env: { NODE_ENV: "production", ADMIN_EMAIL: "admin@example.com" },
    }).allowed,
    true
  );
  assert.equal(
    evaluateAdminBootstrapCheck({
      userEmail: "anyone@example.com",
      env: { NODE_ENV: "production" },
    }).allowed,
    false
  );

  // Webhook consistency checks
  assert.equal(
    validateWebhookOrderConsistency(
      { provider: "stripe", amountCents: 69900, currency: "CNY", status: "pending" },
      { provider: "wechat", eventType: "payment.succeeded" }
    ).valid,
    false
  );
  assert.equal(
    validateWebhookOrderConsistency(
      { provider: "stripe", amountCents: 69900, currency: "CNY", status: "pending" },
      {
        provider: "stripe",
        eventType: "payment.succeeded",
        summaryJson: { amountCents: 100, currency: "CNY" },
      }
    ).valid,
    false
  );
  assert.equal(
    validateWebhookOrderConsistency(
      { provider: "stripe", amountCents: 69900, currency: "CNY", status: "cancelled" },
      { provider: "stripe", eventType: "payment.succeeded" }
    ).valid,
    false
  );
  assert.equal(
    validateWebhookOrderConsistency(
      { provider: "stripe", amountCents: 69900, currency: "CNY", status: "pending" },
      {
        provider: "stripe",
        eventType: "payment.succeeded",
        summaryJson: { amountCents: 69900, currency: "CNY" },
      }
    ).valid,
    true
  );

  // Session token hygiene & .env.example completeness
  const tokenStoreSrc = fs.readFileSync(
    path.resolve(process.cwd(), "src/lib/authTokenStore.ts"),
    "utf8"
  );
  assert.equal(tokenStoreSrc.includes("localStorage"), false);
  assert.equal(tokenStoreSrc.includes("sessionStorage"), false);

  const envExample = fs.readFileSync(path.resolve(process.cwd(), ".env.example"), "utf8");
  assert.ok(envExample.includes("ADMIN_BOOTSTRAP_TOKEN="));
});
