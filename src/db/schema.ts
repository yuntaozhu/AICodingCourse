import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull().default(""),
  avatarUrl: text("avatar_url").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    role: text("role").notNull(), // 'learner' | 'ta' | 'instructor' | 'admin'
    grantedByUserId: integer("granted_by_user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_roles_user_role_uidx").on(t.userId, t.role)]
);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  skuCode: text("sku_code").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  productType: text("product_type").notNull(), // 'self_paced' | 'cohort_mentored'
  scopeType: text("scope_type").notNull(), // 'all_modules' | 'cohort_track'
  scopeRef: text("scope_ref").notNull(),
  featuresJson: jsonb("features_json").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  billingInterval: text("billing_interval").notNull(), // 'month' | 'quarter' | 'year' | 'one_time'
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("CNY"),
  durationDays: integer("duration_days").notNull(),
  active: boolean("active").notNull().default(true),
});

export const cohorts = pgTable("cohorts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  productId: integer("product_id").references(() => products.id),
  description: text("description").notNull().default(""),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  maxSeats: integer("max_seats").notNull().default(30),
  status: text("status").notNull().default("active"), // 'upcoming' | 'active' | 'completed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  priceId: integer("price_id")
    .references(() => prices.id)
    .notNull(),
  cohortId: integer("cohort_id").references(() => cohorts.id),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("CNY"),
  provider: text("provider").notNull(), // 'redeem_code' | 'stripe' | 'alipay' | 'wechat' | 'admin_grant'
  status: text("status").notNull().default("pending"), // 'pending' | 'paid' | 'refunded' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    orderId: integer("order_id").references(() => orders.id),
    eventType: text("event_type").notNull(),
    summaryJson: jsonb("summary_json").$type<Record<string, unknown>>().notNull().default({}),
    processedAt: timestamp("processed_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("payment_events_provider_ext_uidx").on(t.provider, t.externalEventId)]
);

export const redeemCodes = pgTable("redeem_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  priceId: integer("price_id")
    .references(() => prices.id)
    .notNull(),
  cohortId: integer("cohort_id").references(() => cohorts.id),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdByUserId: integer("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entitlements = pgTable("entitlements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  sourceOrderId: integer("source_order_id").references(() => orders.id),
  scopeType: text("scope_type").notNull(),
  scopeRef: text("scope_ref").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'expired' | 'refunded' | 'revoked'
  validFrom: timestamp("valid_from").defaultNow().notNull(),
  validUntil: timestamp("valid_until").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const unitProgress = pgTable(
  "unit_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    moduleId: text("module_id").notNull(),
    unitId: text("unit_id").notNull(),
    planId: text("plan_id").notNull(),
    curriculumVersion: text("curriculum_version").notNull(),
    completed: boolean("completed").notNull().default(false),
    dodCheckedJson: jsonb("dod_checked_json").$type<string[]>().notNull().default([]),
    artifactDraft: text("artifact_draft").notNull().default(""),
    reflectionNote: text("reflection_note").notNull().default(""),
    selectedTransferTier: text("selected_transfer_tier"),
    untrustedLegacy: boolean("untrusted_legacy").notNull().default(false),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("unit_progress_user_unit_uidx").on(t.userId, t.unitId)]
);

export const customKbEntries = pgTable(
  "custom_kb_entries",
  {
    id: serial("id").primaryKey(),
    clientEntryId: text("client_entry_id").notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    title: text("title").notNull(),
    moduleCode: text("module_code").notNull(),
    category: text("category").notNull(),
    scope: text("scope").notNull(),
    content: text("content").notNull(),
    cautionNote: text("caution_note").notNull().default(""),
    updatedAt: text("updated_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("custom_kb_user_client_uidx").on(t.userId, t.clientEntryId)]
);

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  moduleId: text("module_id").notNull(),
  quizVersion: text("quiz_version").notNull(),
  answersJson: jsonb("answers_json").$type<Record<string, number>>().notNull(),
  scorePct: integer("score_pct").notNull(),
  correctCount: integer("correct_count").notNull(),
  totalCount: integer("total_count").notNull(),
  weakTopicsJson: jsonb("weak_topics_json").$type<string[]>().notNull().default([]),
  passed: boolean("passed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skillGrants = pgTable("skill_grants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  skillId: text("skill_id").notNull(),
  curriculumVersion: text("curriculum_version").notNull(),
  method: text("method").notNull(),
  evidenceSummary: text("evidence_summary").notNull(),
  evidenceSubmissionId: integer("evidence_submission_id"),
  grantedByUserId: integer("granted_by_user_id"),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const cohortInstructors = pgTable(
  "cohort_instructors",
  {
    id: serial("id").primaryKey(),
    cohortId: integer("cohort_id")
      .references(() => cohorts.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    staffRole: text("staff_role").notNull().default("instructor"), // 'instructor' | 'ta'
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("cohort_instructors_cohort_user_uidx").on(t.cohortId, t.userId)]
);

export const cohortEnrollments = pgTable(
  "cohort_enrollments",
  {
    id: serial("id").primaryKey(),
    cohortId: integer("cohort_id")
      .references(() => cohorts.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    targetPathId: text("target_path_id").notNull().default("indie-dev"),
    status: text("status").notNull().default("active"), // 'active' | 'completed' | 'dropped'
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("cohort_enrollments_cohort_user_uidx").on(t.cohortId, t.userId)]
);

export const cohortMilestones = pgTable("cohort_milestones", {
  id: serial("id").primaryKey(),
  cohortId: integer("cohort_id")
    .references(() => cohorts.id)
    .notNull(),
  title: text("title").notNull(),
  moduleId: text("module_id").notNull(),
  dueDate: text("due_date").notNull(),
  sortOrder: integer("sort_order").notNull().default(1),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  cohortId: integer("cohort_id").references(() => cohorts.id),
  milestoneId: integer("milestone_id").references(() => cohortMilestones.id),
  moduleId: text("module_id").notNull(),
  labId: text("lab_id"),
  curriculumVersion: text("curriculum_version").notNull(),
  artifactTitle: text("artifact_title").notNull(),
  artifactText: text("artifact_text").notNull(),
  artifactUrl: text("artifact_url"),
  staticAuditJson: jsonb("static_audit_json").$type<Record<string, unknown> | null>(),
  status: text("status").notNull().default("submitted"), // 'submitted' | 'changes_requested' | 'approved'
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const submissionReviews = pgTable("submission_reviews", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => submissions.id)
    .notNull(),
  reviewerUserId: integer("reviewer_user_id")
    .references(() => users.id)
    .notNull(),
  decision: text("decision").notNull(), // 'changes_requested' | 'approved'
  feedbackMarkdown: text("feedback_markdown").notNull(),
  grantedSkillId: text("granted_skill_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  endpoint: text("endpoint").notNull(),
  modelId: text("model_id").notNull(),
  status: text("status").notNull(), // 'ok' | 'error' | 'rate_limited'
  latencyMs: integer("latency_ms").notNull().default(0),
  errorCode: text("error_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadInquiries = pgTable("lead_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  organization: text("organization").notNull().default(""),
  inquiryType: text("inquiry_type").notNull(), // 'cohort' | 'enterprise' | 'school'
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // 'new' | 'contacted' | 'closed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
