import { and, eq } from "drizzle-orm";
import { COURSE_MODULES, COURSE_TRACKS } from "../../data/courseCurriculum.ts";
import { db } from "../../db/index.ts";
import {
  cohortEnrollments,
  cohorts,
  entitlements,
  orders,
  products,
} from "../../db/schema.ts";
import type { AuthContext } from "../auth.ts";

export type ProductTierType =
  | "self_paced"
  | "cohort_mentored"
  | "enterprise_training";

export type AccessTierLabel =
  | "free"
  | "self_paced"
  | "cohort_mentored"
  | "enterprise_training"
  | "staff";

export interface EntitlementPolicyRecord {
  id: number;
  productId: number;
  productType: string;
  productTitle?: string;
  skuCode?: string;
  scopeType: string;
  scopeRef: string;
  status: string;
  validFrom: Date;
  validUntil: Date;
  cohortId?: number | null;
  cohortCode?: string | null;
}

export interface EvaluatedAccessPolicy {
  hasPaidAccess: boolean;
  accessTier: AccessTierLabel;
  unlockedModuleIds: string[];
  canSubmitToCohortAny: boolean;
  allowedCohortCodes: string[];
  hasModuleAccess: (moduleId: string) => boolean;
  canSubmitToCohort: (cohortId?: number | null) => {
    allowed: boolean;
    reason?: string;
  };
}

const ALL_MODULE_IDS = COURSE_MODULES.map((m) => m.id);
const MODULE_ORDER_INDEX = new Map(COURSE_MODULES.map((m, i) => [m.id, i]));

export function isEntitlementCurrentlyValid(
  ent: Pick<EntitlementPolicyRecord, "status" | "validFrom" | "validUntil">,
  now = new Date()
): boolean {
  return (
    ent.status === "active" &&
    ent.validFrom.getTime() <= now.getTime() &&
    ent.validUntil.getTime() > now.getTime()
  );
}

function parseModuleListExpression(expr: string): Set<string> {
  const result = new Set<string>();
  const tokens = expr
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  for (const tok of tokens) {
    if (tok === "*" || tok === "all" || tok === "m1-m13-eng") {
      for (const id of ALL_MODULE_IDS) result.add(id);
      continue;
    }

    const rangeMatch = tok.match(/^(m\d+|m13-gov|m13-eng)\s*\.\.\s*(m\d+|m13-gov|m13-eng)$/) ||
      tok.match(/^(m\d+)\s*-\s*(m\d+)$/);
    if (rangeMatch) {
      const startIdx = MODULE_ORDER_INDEX.get(rangeMatch[1]);
      const endIdx = MODULE_ORDER_INDEX.get(rangeMatch[2]);
      if (startIdx !== undefined && endIdx !== undefined) {
        const lo = Math.min(startIdx, endIdx);
        const hi = Math.max(startIdx, endIdx);
        for (let i = lo; i <= hi; i += 1) {
          result.add(COURSE_MODULES[i].id);
        }
        continue;
      }
    }

    if (MODULE_ORDER_INDEX.has(tok)) {
      result.add(tok);
    }
  }
  return result;
}

export function doesScopeCoverModule(
  scopeType: string,
  scopeRef: string,
  moduleId: string
): boolean {
  const normalizedModuleId = moduleId.trim().toLowerCase();
  if (normalizedModuleId === "m1") return true;

  const ref = scopeRef.trim();
  const normalizedScope = scopeType.trim().toLowerCase();

  if (normalizedScope === "all_modules") {
    if (!ref || ref === "*" || ref.toLowerCase() === "m1-m13-eng") {
      return MODULE_ORDER_INDEX.has(normalizedModuleId);
    }
    return parseModuleListExpression(ref).has(normalizedModuleId);
  }

  if (normalizedScope === "module_list" || normalizedScope === "modules") {
    return parseModuleListExpression(ref).has(normalizedModuleId);
  }

  if (normalizedScope === "track") {
    const requestedTracks = ref
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    for (const trackId of requestedTracks) {
      const track = COURSE_TRACKS.find((t) => t.id.toLowerCase() === trackId);
      if (track && track.moduleIds.includes(normalizedModuleId)) {
        return true;
      }
    }
    return false;
  }

  if (
    normalizedScope === "cohort_track" ||
    normalizedScope === "enterprise_cohort"
  ) {
    // Format supports either "COHORT-CODE" (all modules) or "COHORT-CODE:m1,m3,m9"
    const colonIdx = ref.indexOf(":");
    if (colonIdx !== -1) {
      const modSpec = ref.slice(colonIdx + 1).trim();
      if (modSpec) {
        return parseModuleListExpression(modSpec).has(normalizedModuleId);
      }
    }
    return MODULE_ORDER_INDEX.has(normalizedModuleId);
  }

  return false;
}

function extractCohortScopeCode(scopeRef: string): string {
  const colonIdx = scopeRef.indexOf(":");
  const raw = colonIdx === -1 ? scopeRef : scopeRef.slice(0, colonIdx);
  return raw.trim().toUpperCase();
}

export function doesEntitlementCoverCohort(
  ent: EntitlementPolicyRecord,
  targetCohortId: number,
  targetCohortCode: string | null | undefined,
  now = new Date()
): boolean {
  if (!isEntitlementCurrentlyValid(ent, now)) return false;
  if (
    ent.productType !== "cohort_mentored" &&
    ent.productType !== "enterprise_training"
  ) {
    return false;
  }

  if (ent.cohortId && ent.cohortId === targetCohortId) {
    return true;
  }

  const scopedCode = extractCohortScopeCode(ent.scopeRef);
  if (!scopedCode || scopedCode === "*" || scopedCode === "ALL_COHORTS") {
    return true;
  }

  if (targetCohortCode && scopedCode === targetCohortCode.trim().toUpperCase()) {
    return true;
  }

  return false;
}

export function evaluateAccessPolicy(input: {
  authContext?: Pick<
    AuthContext,
    "isAdmin" | "isInstructorOrTa" | "assignedCohortIds"
  >;
  entitlements: EntitlementPolicyRecord[];
  enrolledCohortIds: number[];
  cohortCodeById?: Map<number, string>;
  now?: Date;
}): EvaluatedAccessPolicy {
  const now = input.now ?? new Date();
  const isStaff = Boolean(
    input.authContext?.isAdmin || input.authContext?.isInstructorOrTa
  );

  const activeEntitlements = input.entitlements.filter((ent) =>
    isEntitlementCurrentlyValid(ent, now)
  );

  const unlockedSet = new Set<string>(["m1"]);
  if (isStaff) {
    for (const id of ALL_MODULE_IDS) unlockedSet.add(id);
  } else {
    for (const modId of ALL_MODULE_IDS) {
      if (
        activeEntitlements.some((ent) =>
          doesScopeCoverModule(ent.scopeType, ent.scopeRef, modId)
        )
      ) {
        unlockedSet.add(modId);
      }
    }
  }

  const cohortCapableEntitlements = activeEntitlements.filter(
    (ent) =>
      ent.productType === "cohort_mentored" ||
      ent.productType === "enterprise_training"
  );

  const allowedCohortCodes = Array.from(
    new Set(
      cohortCapableEntitlements
        .map((ent) => ent.cohortCode || extractCohortScopeCode(ent.scopeRef))
        .filter((code) => Boolean(code) && code !== "*")
    )
  );

  let accessTier: AccessTierLabel = "free";
  if (isStaff) {
    accessTier = "staff";
  } else if (
    activeEntitlements.some((e) => e.productType === "enterprise_training")
  ) {
    accessTier = "enterprise_training";
  } else if (
    activeEntitlements.some((e) => e.productType === "cohort_mentored")
  ) {
    accessTier = "cohort_mentored";
  } else if (activeEntitlements.length > 0) {
    accessTier = "self_paced";
  }

  const hasPaidAccess = isStaff || activeEntitlements.length > 0;
  const canSubmitToCohortAny =
    Boolean(input.authContext?.isAdmin) ||
    cohortCapableEntitlements.length > 0;

  return {
    hasPaidAccess,
    accessTier,
    unlockedModuleIds: ALL_MODULE_IDS.filter((id) => unlockedSet.has(id)),
    canSubmitToCohortAny,
    allowedCohortCodes,
    hasModuleAccess(moduleId: string) {
      const normalized = moduleId.trim().toLowerCase();
      if (normalized === "m1") return true;
      return unlockedSet.has(normalized);
    },
    canSubmitToCohort(cohortId?: number | null) {
      if (input.authContext?.isAdmin) {
        return { allowed: true };
      }
      if (!cohortId) {
        return { allowed: true };
      }

      if (input.authContext?.assignedCohortIds.includes(cohortId)) {
        return { allowed: true };
      }

      if (!input.enrolledCohortIds.includes(cohortId)) {
        return {
          allowed: false,
          reason: "您未加入该班级，无法向该班级提交作业。",
        };
      }

      if (cohortCapableEntitlements.length === 0) {
        return {
          allowed: false,
          reason:
            "自学版权益仅支持个人工作台与自测；提交至指导班人工批改需开通指导班或企业培训权益。",
        };
      }

      const targetCode = input.cohortCodeById?.get(cohortId) ?? null;
      const matched = cohortCapableEntitlements.some((ent) =>
        doesEntitlementCoverCohort(ent, cohortId, targetCode, now)
      );

      if (!matched) {
        return {
          allowed: false,
          reason:
            "您的指导班或企业培训权益作用域不包含目标班期（Cohort），请核对所属班级后再提交。",
        };
      }

      return { allowed: true };
    },
  };
}

export async function loadUserEntitlementRecords(
  userId: number
): Promise<{
  entitlements: EntitlementPolicyRecord[];
  enrolledCohortIds: number[];
  cohortCodeById: Map<number, string>;
}> {
  const [entRows, enrollmentRows, allCohorts] = await Promise.all([
    db
      .select({
        id: entitlements.id,
        productId: entitlements.productId,
        productType: products.productType,
        productTitle: products.title,
        skuCode: products.skuCode,
        scopeType: entitlements.scopeType,
        scopeRef: entitlements.scopeRef,
        status: entitlements.status,
        validFrom: entitlements.validFrom,
        validUntil: entitlements.validUntil,
        orderCohortId: orders.cohortId,
      })
      .from(entitlements)
      .innerJoin(products, eq(entitlements.productId, products.id))
      .leftJoin(orders, eq(entitlements.sourceOrderId, orders.id))
      .where(eq(entitlements.userId, userId)),
    db
      .select({ cohortId: cohortEnrollments.cohortId })
      .from(cohortEnrollments)
      .where(
        and(
          eq(cohortEnrollments.userId, userId),
          eq(cohortEnrollments.status, "active")
        )
      ),
    db.select({ id: cohorts.id, code: cohorts.code }).from(cohorts),
  ]);

  const cohortCodeById = new Map(allCohorts.map((c) => [c.id, c.code]));

  const records: EntitlementPolicyRecord[] = entRows.map((row) => ({
    id: row.id,
    productId: row.productId,
    productType: row.productType,
    productTitle: row.productTitle,
    skuCode: row.skuCode,
    scopeType: row.scopeType,
    scopeRef: row.scopeRef,
    status: row.status,
    validFrom: row.validFrom,
    validUntil: row.validUntil,
    cohortId: row.orderCohortId ?? null,
    cohortCode: row.orderCohortId
      ? cohortCodeById.get(row.orderCohortId) ?? null
      : null,
  }));

  return {
    entitlements: records,
    enrolledCohortIds: enrollmentRows.map((e) => e.cohortId),
    cohortCodeById,
  };
}

export async function resolveUserEntitlementSnapshot(
  authContext: AuthContext | undefined
): Promise<
  EvaluatedAccessPolicy & { entitlements: EntitlementPolicyRecord[] }
> {
  if (!authContext) {
    const policy = evaluateAccessPolicy({
      authContext: undefined,
      entitlements: [],
      enrolledCohortIds: [],
    });
    return { ...policy, entitlements: [] };
  }

  const loaded = await loadUserEntitlementRecords(authContext.user.id);
  const policy = evaluateAccessPolicy({
    authContext,
    entitlements: loaded.entitlements,
    enrolledCohortIds: loaded.enrolledCohortIds,
    cohortCodeById: loaded.cohortCodeById,
  });

  return {
    ...policy,
    entitlements: loaded.entitlements,
  };
}
