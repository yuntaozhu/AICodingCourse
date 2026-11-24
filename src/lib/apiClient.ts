import type {
  ModuleProgressStage,
  ProjectLifecycleState,
} from "@/data/projectTemplatesPublic";
import { getAuthHeaders } from "@/lib/authTokenStore";

export class ApiError extends Error {
  status: number;
  code?: string;
  audit?: StaticAuditResultPayload;

  constructor(
    message: string,
    status: number,
    code?: string,
    audit?: StaticAuditResultPayload
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.audit = audit;
  }
}

async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const baseHeaders: Record<string, string> = {};
  if (init.body && typeof init.body === "string") {
    baseHeaders["Content-Type"] = "application/json";
  }
  const authHeaders = await getAuthHeaders(baseHeaders);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  const payload = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    audit?: StaticAuditResultPayload;
  } & T;

  if (!res.ok) {
    throw new ApiError(
      payload.error || `请求失败 (HTTP ${res.status})`,
      res.status,
      payload.code,
      payload.audit
    );
  }
  return payload as T;
}

export interface CatalogPrice {
  id: number;
  productId: number;
  label: string;
  billingCycle: string;
  amountCents: number;
  currency: string;
  durationDays: number;
  active: boolean;
}

export interface CatalogProduct {
  id: number;
  slug: string;
  title: string;
  description: string;
  productType: string;
  scopeType: string;
  scopeRef: string;
  active: boolean;
  prices: CatalogPrice[];
}

export interface PublicModuleOverview {
  id: string;
  code: string;
  order: number;
  trackId: string;
  title: string;
  audience: string;
  prerequisites: string[];
  prerequisiteModuleIds: string[];
  prerequisiteSkillIds: string[];
  grantsSkillIds: string[];
  learningObjectives: string[];
  estimatedMinutes: number;
  slideCount: number;
  labIds: string[];
  deliverables: string[];
  boundaryNote: string;
  isFreeTrial: boolean;
  unlocked: boolean;
}

export interface CatalogResponse {
  products: CatalogProduct[];
  activeCohorts: Array<{
    id: number;
    code: string;
    title: string;
    startDate: string;
    endDate: string;
    maxSeats: number;
    status: string;
  }>;
  curriculum: {
    curriculumVersion: string;
    quizVersion: string;
    modules: PublicModuleOverview[];
  };
  hasPaidAccess: boolean;
}

export interface AuthSessionData {
  user: {
    id: number;
    firebaseUid: string;
    email: string;
    displayName: string;
    photoUrl: string | null;
  };
  roles: string[];
  isAdmin: boolean;
  isInstructorOrTa: boolean;
  assignedCohortIds: number[];
  canClaimInitialAdmin: boolean;
  hasPaidAccess: boolean;
  entitlements: Array<{
    id: number;
    productId: number;
    scopeType: string;
    scopeRef: string;
    status: string;
    validFrom: string;
    validUntil: string | null;
  }>;
  cohortEnrolled: boolean;
  cohorts: LearnerCohortItem[];
}

export interface LearnerCohortMilestone {
  id: number;
  cohortId: number;
  moduleId: string;
  title: string;
  dueDate: string;
  sortOrder: number;
  latestSubmissionStatus: string | null;
  isOverdue: boolean;
}

export interface LearnerCohortItem {
  id: number;
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  enrollment?: {
    id: number;
    targetPathId: string;
    status: string;
  };
  milestones: LearnerCohortMilestone[];
}

export interface SubmissionRecord {
  id: number;
  userId: number;
  cohortId: number | null;
  milestoneId: number | null;
  moduleId: string;
  labId: string | null;
  curriculumVersion: string;
  artifactTitle: string;
  artifactText: string;
  artifactUrl: string | null;
  staticAuditJson: Record<string, unknown> | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionReviewRecord {
  id: number;
  submissionId: number;
  reviewerUserId: number;
  decision: string;
  feedbackMarkdown: string;
  grantedSkillId: string | null;
  createdAt: string;
}

export interface SanitizedQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  reviewTarget?: {
    label: string;
    labId?: string;
    moduleId?: string;
  };
}

export interface QuizGradeResponse {
  ok: true;
  quizVersion: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  weakTopics: string[];
  questionResults: Array<{
    questionId: string;
    topic: string;
    selectedIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
    reviewTarget?: {
      label: string;
      labId?: string;
      moduleId?: string;
    };
    remediationAction: string;
  }>;
}

export function fetchCatalog() {
  return apiFetch<CatalogResponse>("/api/catalog");
}

export function submitInquiry(payload: {
  name: string;
  contact: string;
  organization?: string;
  inquiryType: "cohort" | "enterprise" | "school";
  message: string;
}) {
  return apiFetch<{ ok: true; id: number }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchMySession() {
  return apiFetch<AuthSessionData>("/api/auth/me");
}

export function claimFirstAdminApi() {
  return apiFetch<{ ok: true; role: string }>("/api/auth/claim-admin", {
    method: "POST",
  });
}

export interface EmailOtpRequestResponse {
  ok: true;
  deliveryMode: "email" | "dev_preview";
  expiresInSeconds: number;
  cooldownSeconds: number;
  devPreviewCode?: string;
}

export function requestEmailOtpApi(email: string) {
  return apiFetch<EmailOtpRequestResponse>("/api/auth/email/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyEmailOtpApi(email: string, code: string) {
  return apiFetch<{
    ok: true;
    token: string;
    user: {
      id: number;
      email: string;
      displayName: string;
      avatarUrl: string;
    };
  }>("/api/auth/email/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function fetchAuthorizedModuleDetail(moduleId: string) {
  return apiFetch<{
    found: true;
    allowed: true;
    curriculumVersion: string;
    instructorAuthorized: boolean;
    simulationDisclaimer?: string;
    module: Record<string, unknown>;
    teachingPackage: Record<string, unknown> | null;
  }>(`/api/curriculum/modules/${encodeURIComponent(moduleId)}`);
}

export function fetchInstructorLessonPlanMarkdownApi(moduleId: string, planId?: string) {
  const qs = planId ? `?planId=${encodeURIComponent(planId)}` : "";
  return apiFetch<{ ok: true; filename: string; markdown: string }>(
    `/api/curriculum/modules/${encodeURIComponent(moduleId)}/lesson-plan${qs}`
  );
}

export function fetchInstructorHandbookMarkdownApi(selectedPlanByModule?: Record<string, string>) {
  const qs =
    selectedPlanByModule && Object.keys(selectedPlanByModule).length > 0
      ? `?plans=${encodeURIComponent(JSON.stringify(selectedPlanByModule))}`
      : "";
  return apiFetch<{ ok: true; filename: string; markdown: string }>(
    `/api/curriculum/instructor-handbook${qs}`
  );
}

export function fetchSanitizedQuiz(moduleId: string) {
  return apiFetch<{
    found: true;
    allowed: true;
    quizVersion: string;
    quiz: {
      moduleId: string;
      moduleNumber: number;
      moduleTitle: string;
      subtitle: string;
      questions: SanitizedQuizQuestion[];
    };
  }>(`/api/quizzes/${encodeURIComponent(moduleId)}`);
}

export interface SingleQuestionCheckResponse {
  ok: true;
  moduleId: string;
  questionId: string;
  topic: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  reviewTarget?: {
    label: string;
    labId?: string;
    moduleId?: string;
  };
  remediationAction: string;
}

export function checkSingleQuizQuestionApi(
  moduleId: string,
  questionId: string,
  selectedIndex: number
) {
  return apiFetch<SingleQuestionCheckResponse>(
    `/api/quizzes/${encodeURIComponent(moduleId)}/check-question`,
    {
      method: "POST",
      body: JSON.stringify({ questionId, selectedIndex }),
    }
  );
}

export interface PreviewM1QuizResponse {
  ok: true;
  moduleId: "m1";
  answeredCount: number;
  correctCount: number;
  totalCount: number;
  scorePct: number;
  questionResults: Array<{
    questionId: string;
    topic: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
    reviewTarget?: {
      label: string;
      labId?: string;
      moduleId?: string;
    };
    remediationAction: string;
  }>;
}

export function previewM1QuizApi(answers: Record<string, number>) {
  return apiFetch<PreviewM1QuizResponse>("/api/quizzes/m1/preview-grade", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function submitQuizAnswers(moduleId: string, answers: Record<string, number>) {
  return apiFetch<QuizGradeResponse>(`/api/quizzes/${encodeURIComponent(moduleId)}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export function fetchWorkspaceCloudState() {
  return apiFetch<{
    curriculumVersion: string;
    completedUnitIds: Record<string, boolean>;
    dodCheckedByUnit: Record<string, string[]>;
    selectedPlanByModule: Record<string, string>;
    practiceNotes: Record<
      string,
      {
        artifactDraft: string;
        reflectionNote: string;
        selectedTransferTier?: string;
        updatedAt: string;
        untrustedLegacy?: boolean;
      }
    >;
    customKbEntries: Array<{
      id: string;
      title: string;
      moduleCode: string;
      category: string;
      scope: string;
      content: string;
      cautionNote: string;
      updatedAt: string;
    }>;
    latestQuizByModule: Record<
      string,
      {
        moduleId: string;
        quizVersion: string;
        scorePct: number;
        correctCount: number;
        totalCount: number;
        passed: boolean;
        weakTopics: string[];
        answers: Record<string, number>;
        createdAt: string;
      }
    >;
    verifiedSkills: Record<
      string,
      {
        skillId: string;
        method: string;
        evidenceSummary: string;
        curriculumVersion: string;
        verifiedAt: string;
      }
    >;
    moduleStageById?: Record<string, ModuleProgressStage>;
  }>("/api/workspace/state");
}

export function saveWorkspaceUnitProgress(payload: {
  moduleId: string;
  unitId: string;
  planId: string;
  completed?: boolean;
  dodChecked?: string[];
  artifactDraft?: string;
  reflectionNote?: string;
  selectedTransferTier?: string | null;
}) {
  return apiFetch<{ ok: true }>("/api/workspace/progress", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function importLegacyWorkspace(payload: {
  completedUnitIds: Record<string, boolean>;
  dodCheckedByUnit: Record<string, string[]>;
  practiceNotes: Record<
    string,
    {
      artifactDraft?: string;
      reflectionNote?: string;
      selectedTransferTier?: string;
    }
  >;
  customKbEntries: Array<{
    id: string;
    title: string;
    moduleCode: string;
    category: string;
    scope: string;
    content: string;
    cautionNote: string;
    updatedAt: string;
  }>;
}) {
  return apiFetch<{
    ok: true;
    importedUnits: number;
    importedKb: number;
    note: string;
  }>("/api/workspace/import-legacy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveCustomKbEntry(payload: {
  clientEntryId: string;
  title: string;
  moduleCode: string;
  category: string;
  scope: string;
  content: string;
  cautionNote: string;
}) {
  return apiFetch<{ ok: true }>("/api/workspace/kb", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomKbEntry(clientEntryId: string) {
  return apiFetch<{ ok: true }>(`/api/workspace/kb/${encodeURIComponent(clientEntryId)}`, {
    method: "DELETE",
  });
}

export function previewSkillDiagnosticApi(skillId: string, answers: Record<string, number>) {
  return apiFetch<{
    ok: true;
    passed: boolean;
    results: Array<{ id: string; isCorrect: boolean; explanation: string }>;
  }>("/api/skills/diagnostic/preview", {
    method: "POST",
    body: JSON.stringify({ skillId, answers }),
  });
}

export function submitSkillDiagnostic(skillId: string, answers: Record<string, number>) {
  return apiFetch<{
    ok: true;
    passed: boolean;
    results: Array<{ id: string; isCorrect: boolean; explanation: string }>;
    grant: {
      skillId: string;
      method: string;
      evidenceSummary: string;
      grantedAt: string;
    } | null;
  }>("/api/skills/diagnostic", {
    method: "POST",
    body: JSON.stringify({ skillId, answers }),
  });
}

export function fetchBillingHistory() {
  return apiFetch<{
    orders: Array<{
      id: number;
      orderNo: string;
      productId: number;
      priceId: number;
      cohortId: number | null;
      amountCents: number;
      currency: string;
      provider: string;
      status: string;
      paidAt: string | null;
      createdAt: string;
    }>;
    entitlements: Array<{
      id: number;
      productId: number;
      scopeType: string;
      scopeRef: string;
      status: string;
      validFrom: string;
      validUntil: string | null;
    }>;
  }>("/api/billing/me");
}

export function createOrder(payload: {
  priceId: number;
  provider?: "stripe" | "alipay" | "wechat" | "redeem_code";
  cohortId?: number;
}) {
  return apiFetch<{
    ok: true;
    order: {
      id: number;
      orderNo: string;
      amountCents: number;
      currency: string;
      status: string;
      provider: string;
    };
  }>("/api/billing/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function redeemCode(code: string) {
  return apiFetch<{
    ok: true;
    product: CatalogProduct;
    entitlement: { id: number; validUntil: string | null };
  }>("/api/billing/redeem", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export interface StaticAuditFindingItem {
  id: string;
  ruleId: string;
  severity: "blocking" | "warning";
  title: string;
  detail: string;
}

export interface StaticAuditResultPayload {
  passed: boolean;
  blockingCount: number;
  warningCount: number;
  findings: StaticAuditFindingItem[];
  changedFiles: string[];
  auditedAt: string;
}

export interface StaticAuditRunRecord {
  id: number;
  userId: number;
  workspaceId: number | null;
  submissionId: number | null;
  moduleId: string;
  passed: boolean;
  blockingCount: number;
  warningCount: number;
  findingsJson: StaticAuditFindingItem[];
  changedFilesJson: string[];
  createdAt: string;
}

export interface AiPrereviewPayload {
  advisoryOnly: boolean;
  generatedAt: string;
  generatedByUserId: number;
  usedAiModel: boolean;
  staticPassed: boolean;
  warningCount: number;
  draftMarkdown: string;
}

export interface SubmissionEvidenceRecord {
  id: number;
  submissionId: number;
  workspaceId: number | null;
  specSnapshot: string;
  rulesSnapshot: string;
  changedFilesJson: string[];
  diffSummary: string;
  testCommandLog: string;
  handoffSummary: string;
  evalRunId: number | null;
  staticAuditRunId: number | null;
  aiPrereviewJson: AiPrereviewPayload | null;
  createdAt: string;
}

export function fetchMyCohorts() {
  return apiFetch<{
    enrolled: boolean;
    blobUploadEnabled?: boolean;
    cohorts: LearnerCohortItem[];
    submissions: SubmissionRecord[];
    reviewsBySubmissionId: Record<number, SubmissionReviewRecord[]>;
    evidenceBySubmissionId?: Record<number, SubmissionEvidenceRecord>;
    auditBySubmissionId?: Record<number, StaticAuditRunRecord>;
  }>("/api/cohorts/my");
}

export function uploadSubmissionAttachment(payload: {
  filename: string;
  contentType: string;
  contentBase64: string;
}) {
  return apiFetch<{
    ok: true;
    url: string;
    pathname: string;
    size: number;
  }>("/api/submissions/upload", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function submitCohortWork(payload: {
  cohortId?: number | null;
  milestoneId?: number | null;
  moduleId: string;
  labId?: string | null;
  artifactTitle: string;
  artifactText: string;
  artifactUrl?: string | null;
  workspaceId?: number | null;
  specSnapshot?: string;
  rulesSnapshot?: string;
  changedFiles?: string[];
  diffSummary?: string;
  testCommandLog?: string;
  handoffSummary?: string;
  evalRunId?: number | null;
}) {
  return apiFetch<{
    ok: true;
    submission: SubmissionRecord;
    audit?: StaticAuditRunRecord;
  }>("/api/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface InstructorCockpitSubmission extends SubmissionRecord {
  learnerEmail: string;
  learnerName: string;
  cohortTitle: string;
  milestoneTitle: string;
  reviews: SubmissionReviewRecord[];
  evidence?: SubmissionEvidenceRecord | null;
  latestAudit?: StaticAuditRunRecord | null;
  simulationDisclaimer?: string;
}

export interface InstructorCockpitOverdueItem {
  cohortId: number;
  cohortTitle: string;
  milestoneId: number;
  milestoneTitle: string;
  moduleId: string;
  dueDate: string;
  userId: number;
  learnerName: string;
  learnerEmail: string;
}

export interface InstructorCockpitResponse {
  scopedCohortCount: number;
  cohorts: Array<{
    id: number;
    code: string;
    title: string;
    startDate: string;
    endDate: string;
    learnerCount: number;
    milestones: Array<{
      id: number;
      moduleId: string;
      title: string;
      dueDate: string;
    }>;
  }>;
  queues: {
    submitted: InstructorCockpitSubmission[];
    overdue: InstructorCockpitOverdueItem[];
    changes_requested: InstructorCockpitSubmission[];
    approved: InstructorCockpitSubmission[];
  };
  skills: Array<{ id: string; title: string; shortLabel: string }>;
}

export function fetchInstructorCockpit() {
  return apiFetch<InstructorCockpitResponse>("/api/instructor/cockpit");
}

export function reviewSubmission(
  submissionId: number,
  payload: {
    decision: "changes_requested" | "approved";
    feedbackMarkdown: string;
    grantSkillId?: string | null;
  }
) {
  return apiFetch<{ ok: true; submission: SubmissionRecord }>(
    `/api/instructor/submissions/${submissionId}/review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export interface AdminOverviewResponse {
  users: Array<{
    id: number;
    email: string;
    displayName: string;
    roles: string[];
    createdAt: string;
  }>;
  products: CatalogProduct[];
  prices: CatalogPrice[];
  entitlements: Array<{
    id: number;
    userId: number;
    productId: number;
    scopeType: string;
    scopeRef: string;
    status: string;
    validFrom: string;
    validUntil: string | null;
  }>;
  orders: Array<{
    id: number;
    orderNo: string;
    userId: number;
    productId: number;
    amountCents: number;
    currency: string;
    provider: string;
    status: string;
    createdAt: string;
  }>;
  redeemCodes: Array<{
    id: number;
    code: string;
    productId: number;
    priceId: number;
    cohortId: number | null;
    maxUses: number;
    usedCount: number;
    expiresAt: string | null;
  }>;
  cohorts: Array<{
    id: number;
    code: string;
    title: string;
    startDate: string;
    endDate: string;
    maxSeats: number;
    status: string;
    milestones: Array<{ id: number; title: string; moduleId: string; dueDate: string }>;
    instructors: Array<{ id: number; userId: number; staffRole: string }>;
    enrollments: Array<{ id: number; userId: number; targetPathId: string; status: string }>;
  }>;
  inquiries: Array<{
    id: number;
    name: string;
    contact: string;
    organization: string;
    inquiryType: string;
    message: string;
    status: string;
    createdAt: string;
  }>;
}

export function fetchAdminOverview() {
  return apiFetch<AdminOverviewResponse>("/api/admin/overview");
}

export function adminUpdateRole(payload: {
  email: string;
  role: "learner" | "ta" | "instructor" | "admin";
  action: "add" | "remove";
}) {
  return apiFetch<{ ok: true }>("/api/admin/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminGrantEntitlementApi(payload: {
  email: string;
  productId: number;
  durationDays: number;
  cohortId?: number;
}) {
  return apiFetch<{ ok: true }>("/api/admin/entitlements/grant", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminRevokeEntitlementApi(
  entitlementId: number,
  status: "refunded" | "revoked"
) {
  return apiFetch<{ ok: true }>(
    `/api/admin/entitlements/${entitlementId}/revoke`,
    {
      method: "POST",
      body: JSON.stringify({ status }),
    }
  );
}

export function adminCreateRedeemCodeApi(payload: {
  productId: number;
  priceId: number;
  cohortId?: number;
  maxUses: number;
}) {
  return apiFetch<{
    ok: true;
    redeemCode: { id: number; code: string; maxUses: number };
  }>("/api/admin/redeem-codes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminCreateCohortApi(payload: {
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  maxSeats: number;
}) {
  return apiFetch<{ ok: true }>("/api/admin/cohorts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminAssignInstructorApi(
  cohortId: number,
  payload: { email: string; staffRole: "instructor" | "ta" }
) {
  return apiFetch<{ ok: true }>(
    `/api/admin/cohorts/${cohortId}/instructors`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function adminEnrollLearnerApi(
  cohortId: number,
  payload: {
    email: string;
    targetPathId: "non-tech" | "indie-dev" | "eng-team" | "cs-student";
  }
) {
  return apiFetch<{ ok: true }>(`/api/admin/cohorts/${cohortId}/enroll`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminConfirmOrderApi(orderId: number) {
  return apiFetch<{ ok: true }>(`/api/admin/orders/${orderId}/confirm`, {
    method: "POST",
  });
}

export function adminCancelOrderApi(orderId: number) {
  return apiFetch<{ ok: true }>(`/api/admin/orders/${orderId}/cancel`, {
    method: "POST",
  });
}

export function adminCreateMilestoneApi(
  cohortId: number,
  payload: {
    title: string;
    moduleId: string;
    dueDate: string;
    sortOrder?: number;
  }
) {
  return apiFetch<{ ok: true }>(`/api/admin/cohorts/${cohortId}/milestones`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminUpdateInquiryStatusApi(
  inquiryId: number,
  status: "new" | "contacted" | "closed"
) {
  return apiFetch<{ ok: true }>(`/api/admin/inquiries/${inquiryId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Coding Everything: Starter Kits, Project Workspaces & Server Static Audit
export interface ProjectTemplateRecord {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  trackType: string;
  targetModuleId: string;
  allowedGlobsJson: string[];
  blockedPathsJson: string[];
  firstHourChecklistJson: string[];
  starterSpecMarkdown: string;
  starterRulesContent: string;
  boundaryDisclaimer: string;
  active: boolean;
}

export interface ProjectWorkspaceRecord {
  id: number;
  userId: number;
  templateId: number;
  cohortId: number | null;
  title: string;
  repoUrl: string;
  specMarkdown: string;
  rulesMarkdown: string;
  handoffMarkdown: string;
  firstHourCheckedJson: string[];
  lifecycleState: ProjectLifecycleState;
  createdAt: string;
  updatedAt: string;
  template?: ProjectTemplateRecord | null;
  latestAudit?: StaticAuditRunRecord | null;
  latestEval?: EvalRunRecord | null;
  submissionCount?: number;
}

export interface EvalCaseReport {
  id: string;
  query: string;
  retrievedDocIds: string[];
  passed: boolean;
  note: string;
  reason?: string;
}

export interface EvalSuiteReport {
  datasetSlug: string;
  datasetTitle: string;
  datasetVersion: string;
  moduleId: string;
  recallAtK: number;
  citationPrecision: number;
  aclLeakCount: number;
  staleRecallCount: number;
  refusalAccuracy: number;
  loopCircuitBreakRate: number;
  passed: boolean;
  caseReports: EvalCaseReport[];
  simulationDisclaimer?: string;
}

export interface EvalRunRecord {
  id: number;
  userId: number;
  workspaceId: number | null;
  datasetSlug: string;
  moduleId: string;
  recallAtK: number;
  citationPrecision: number;
  aclLeakCount: number;
  staleRecallCount: number;
  refusalAccuracy: number;
  loopCircuitBreakRate: number;
  passed: boolean;
  reportJson: {
    datasetTitle?: string;
    datasetVersion?: string;
    caseReports?: EvalCaseReport[];
    simulationDisclaimer?: string | null;
  };
  createdAt: string;
}

export interface TutorCitationItem {
  sourceId: string;
  label: string;
  moduleId: string;
  unitId?: string;
  labId?: string;
  excerpt: string;
}

export interface TutorAskResponse {
  ok: true;
  refused: boolean;
  refusalReason?: string;
  answer: string;
  citations: TutorCitationItem[];
  nextPractice: {
    label: string;
    moduleId: string;
    labId?: string;
    actionHint: string;
  } | null;
  usedAiModel: boolean;
  remainingToday?: number;
}

export interface ExamQuestionPrompt {
  id: string;
  topic: string;
  question: string;
  options: [string, string, string, string];
  index: number;
}

export interface ExamSessionRecord {
  id: number;
  userId: number;
  moduleId: string;
  quizVersion: string;
  questionIdsJson: string[];
  currentIndex: number;
  answersJson: Record<string, number>;
  scorePct: number;
  passed: boolean;
  weakTopicsJson: string[];
  status: string;
  startedAt: string;
  completedAt: string | null;
}

export interface AdminPilotMetrics {
  totalWorkspaces: number;
  completedProjects: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  changesRequestedSubmissions: number;
  submissionPassRatePct: number;
  totalAudits: number;
  blockedAudits: number;
  staticBlockRatePct: number;
  totalReviews: number;
  totalEvalRuns: number;
  passedEvalRuns: number;
  completedExams: number;
  passedExams: number;
  totalAiCalls: number;
  prereviewCalls: number;
  tutorCalls: number;
}

export function fetchProjectTemplatesApi() {
  return apiFetch<{ ok: true; templates: ProjectTemplateRecord[] }>(
    "/api/projects/templates"
  );
}

export function fetchProjectWorkspacesApi() {
  return apiFetch<{
    ok: true;
    templates: ProjectTemplateRecord[];
    workspaces: ProjectWorkspaceRecord[];
    recentAudits: StaticAuditRunRecord[];
    recentEvals: EvalRunRecord[];
  }>("/api/projects/workspaces");
}

export function createProjectWorkspaceApi(payload: {
  templateSlug: string;
  title?: string;
  cohortId?: number | null;
  repoUrl?: string;
}) {
  return apiFetch<{
    ok: true;
    workspace: ProjectWorkspaceRecord;
    template: ProjectTemplateRecord;
  }>("/api/projects/workspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProjectWorkspaceApi(
  workspaceId: number,
  payload: {
    title?: string;
    repoUrl?: string;
    specMarkdown?: string;
    rulesMarkdown?: string;
    handoffMarkdown?: string;
    firstHourChecked?: string[];
    markArchived?: boolean;
  }
) {
  return apiFetch<{ ok: true; workspace: ProjectWorkspaceRecord }>(
    `/api/projects/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export function fetchProjectArchiveApi(workspaceId: number) {
  return apiFetch<{ ok: true; filename: string; markdown: string }>(
    `/api/projects/workspaces/${workspaceId}/archive`
  );
}

export function runServerStaticAuditApi(payload: {
  workspaceId?: number | null;
  moduleId: string;
  codeOrArtifactText: string;
  specText?: string;
  rulesText?: string;
  diffSummary?: string;
  testCommandLog?: string;
  changedFiles?: string[];
  allowedGlobs?: string[];
  blockedPaths?: string[];
  requireProjectStructure?: boolean;
}) {
  return apiFetch<{
    ok: true;
    audit: StaticAuditResultPayload;
    savedRunId: number;
  }>("/api/projects/static-audit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchEvalRunsApi() {
  return apiFetch<{ ok: true; runs: EvalRunRecord[] }>("/api/eval/runs");
}

export function runEvalSuiteApi(payload: {
  workspaceId?: number | null;
  datasetSlug: string;
  specMarkdown?: string;
  rulesMarkdown?: string;
  testCommandLog?: string;
  simulateBrokenAcl?: boolean;
  simulateStaleLeak?: boolean;
}) {
  return apiFetch<{ ok: true; run: EvalRunRecord; report: EvalSuiteReport }>(
    "/api/eval/runs",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function askTutorApi(payload: {
  question: string;
  moduleId?: string;
  requestId?: string;
}) {
  return apiFetch<TutorAskResponse>("/api/tutor/ask", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchExamSessionsApi() {
  return apiFetch<{ ok: true; sessions: ExamSessionRecord[] }>("/api/exam/sessions");
}

export function startExamSessionApi(moduleId: string) {
  return apiFetch<{
    ok: true;
    session: ExamSessionRecord;
    moduleTitle: string;
    totalCount: number;
    currentQuestion: ExamQuestionPrompt | null;
  }>("/api/exam/sessions", {
    method: "POST",
    body: JSON.stringify({ moduleId }),
  });
}

export function submitExamAnswerApi(
  sessionId: number,
  payload: { questionId: string; selectedIndex: number }
) {
  return apiFetch<{
    ok: true;
    session: ExamSessionRecord;
    stepFeedback: {
      questionId: string;
      topic: string;
      isCorrect: boolean;
      correctIndex: number;
      explanation: string;
      reviewTarget?: { label: string; labId?: string; moduleId?: string };
      remediationAction: string;
    };
    nextQuestion: ExamQuestionPrompt | null;
    remediationPlan: Array<{ topic: string; recommendation: string }>;
  }>(`/api/exam/sessions/${sessionId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateInstructorAiPrereviewApi(
  submissionId: number,
  requestId?: string
) {
  return apiFetch<{ ok: true; prereview: AiPrereviewPayload }>(
    `/api/instructor/submissions/${submissionId}/ai-prereview`,
    {
      method: "POST",
      body: JSON.stringify({ requestId }),
    }
  );
}

export function fetchAdminPilotMetricsApi() {
  return apiFetch<{ ok: true; metrics: AdminPilotMetrics }>("/api/admin/metrics");
}
