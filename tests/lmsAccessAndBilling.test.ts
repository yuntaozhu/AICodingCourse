import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { M13_GOV_SIMULATION_DISCLAIMER } from "../src/data/courseWorkspaceStore";
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
