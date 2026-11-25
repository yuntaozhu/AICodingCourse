import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  cohortMilestones,
  cohorts,
  evalDatasets,
  prices,
  products,
  projectTemplates,
} from "../../db/schema.ts";
import {
  SEED_EVAL_DATASETS,
  SEED_PROJECT_TEMPLATES,
} from "../data/projectTemplates.ts";

let catalogSeededPromise: Promise<void> | null = null;

export async function ensureCatalogSeeded(): Promise<void> {
  if (!catalogSeededPromise) {
    catalogSeededPromise = runSeed().catch((err) => {
      catalogSeededPromise = null;
      throw err;
    });
  }
  return catalogSeededPromise;
}

async function seedProjectTemplatesAndEvals(): Promise<void> {
  for (const tpl of SEED_PROJECT_TEMPLATES) {
    await db
      .insert(projectTemplates)
      .values({
        slug: tpl.slug,
        title: tpl.title,
        subtitle: tpl.subtitle,
        trackType: tpl.trackType,
        targetModuleId: tpl.targetModuleId,
        allowedGlobsJson: tpl.allowedGlobs,
        blockedPathsJson: tpl.blockedPaths,
        starterSpecMarkdown: tpl.starterSpecMarkdown,
        starterRulesContent: tpl.starterRulesContent,
        firstHourChecklistJson: tpl.firstHourChecklist,
        boundaryDisclaimer: tpl.boundaryDisclaimer,
        active: true,
      })
      .onConflictDoNothing();
  }

  for (const ds of SEED_EVAL_DATASETS) {
    await db
      .insert(evalDatasets)
      .values({
        slug: ds.slug,
        title: ds.title,
        moduleId: ds.moduleId,
        version: ds.version,
        casesJson: ds.cases as unknown as Array<Record<string, unknown>>,
        active: true,
      })
      .onConflictDoNothing();
  }
}

async function runSeed(): Promise<void> {
  await seedProjectTemplatesAndEvals();

  const [selfPaced] = await db
    .insert(products)
    .values({
      skuCode: "self-paced-pass",
      title: "Coding Everything 全课自助畅学卡",
      subtitle:
        "面向独立开发者、产品经理与业务实践者，解锁全 14 模块、Starter Kit 项目交付、Eval 基准与只读引用 Tutor（不含班级人工批改）",
      productType: "self_paced",
      scopeType: "all_modules",
      scopeRef: "m1-m13-eng",
      featuresJson: [
        "解锁 M1–M13-Eng 全部 14 模块与 149 教学单元",
        "3 套标准 Starter Kit 模板 + 服务端 422 静态审计门禁与 Handoff 归档",
        "20 个交互式沙盘 + 标准化 Eval 检索/ACL/熔断评测台",
        "只读引文 Course Tutor 助教与后端逐题认证 Exam 考场",
        "云端多端进度同步、个人双链路知识库与 Markdown 导出",
      ],
      active: true,
    })
    .onConflictDoNothing()
    .returning();

  const [cohortCamp] = await db
    .insert(products)
    .values({
      skuCode: "cohort-mentored-camp",
      title: "Coding Everything 企二代与小班实战营",
      subtitle:
        "基于真实授权业务场景开展项目交付，含 Starter Kit 双门禁审校、AI 预审草稿、人工批准与三锁技能认证",
      productType: "cohort_mentored",
      scopeType: "cohort_track",
      scopeRef: "COHORT-2026-Q4",
      featuresJson: [
        "包含「Coding Everything 全课自助畅学卡」全部课程、沙盘、Eval 与 Tutor 权限",
        "首推 GEO Evidence Lab 与企业私有知识库等脱敏业务实战项目",
        "服务端静态审计门禁 + 教师 AI 预审参考 + 人工终审退回重交闭环",
        "通过测验、实操证据与导师批准三锁门禁后核发 5 项能力认证账本",
        "支持 M13-Gov 无代码治理或 M13-Eng 工程双轨结业与 Handoff 交接归档",
      ],
      active: true,
    })
    .onConflictDoNothing()
    .returning();

  const [enterpriseCohort] = await db
    .insert(products)
    .values({
      skuCode: "enterprise-training-cohort",
      title: "Coding Everything 企业内训与专班方案",
      subtitle:
        "面向研发团队与业务部门的隔离专班交付，含专属 Cohort 批改驾驶舱、团队规范治理与组织级项目验收",
      productType: "enterprise_training",
      scopeType: "enterprise_cohort",
      scopeRef: "ENT-2026-CUSTOM",
      featuresJson: [
        "严格隔离的组织专属 Cohort 学习空间与成员入班管理",
        "包含全课 14 模块、企业知识库 ACL/Tombstone Eval 与项目工作台",
        "专属带班导师/助教驾驶舱：团队 Diff 审查、Rules 门禁与三锁授证",
        "按企业内训班期与有效期统一管控授权名额与交接归档",
      ],
      active: true,
    })
    .onConflictDoNothing()
    .returning();

  const resolvedSelf =
    selfPaced ||
    (
      await db
        .select()
        .from(products)
        .where(eq(products.skuCode, "self-paced-pass"))
        .limit(1)
    )[0];

  const resolvedCohort =
    cohortCamp ||
    (
      await db
        .select()
        .from(products)
        .where(eq(products.skuCode, "cohort-mentored-camp"))
        .limit(1)
    )[0];

  const resolvedEnterprise =
    enterpriseCohort ||
    (
      await db
        .select()
        .from(products)
        .where(eq(products.skuCode, "enterprise-training-cohort"))
        .limit(1)
    )[0];

  if (resolvedSelf) {
    const existingPrices = await db
      .select()
      .from(prices)
      .where(eq(prices.productId, resolvedSelf.id))
      .limit(1);

    if (existingPrices.length === 0) {
      await db.insert(prices).values([
        {
          productId: resolvedSelf.id,
          billingInterval: "month",
          amountCents: 12900,
          currency: "CNY",
          durationDays: 30,
          active: true,
        },
        {
          productId: resolvedSelf.id,
          billingInterval: "quarter",
          amountCents: 32900,
          currency: "CNY",
          durationDays: 90,
          active: true,
        },
        {
          productId: resolvedSelf.id,
          billingInterval: "year",
          amountCents: 69900,
          currency: "CNY",
          durationDays: 365,
          active: true,
        },
      ]);
    }
  }

  if (resolvedCohort) {
    const existingCohortPrices = await db
      .select()
      .from(prices)
      .where(eq(prices.productId, resolvedCohort.id))
      .limit(1);

    if (existingCohortPrices.length === 0) {
      await db.insert(prices).values({
        productId: resolvedCohort.id,
        billingInterval: "one_time",
        amountCents: 249900,
        currency: "CNY",
        durationDays: 120,
        active: true,
      });
    }
  }

  if (resolvedEnterprise) {
    const existingEnterprisePrices = await db
      .select()
      .from(prices)
      .where(eq(prices.productId, resolvedEnterprise.id))
      .limit(1);

    if (existingEnterprisePrices.length === 0) {
      await db.insert(prices).values({
        productId: resolvedEnterprise.id,
        billingInterval: "one_time",
        amountCents: 1980000,
        currency: "CNY",
        durationDays: 180,
        active: true,
      });
    }
  }

  if (resolvedCohort) {
    const existingCohorts = await db
      .select()
      .from(cohorts)
      .where(eq(cohorts.code, "COHORT-2026-Q4"))
      .limit(1);

    if (existingCohorts.length === 0) {
      const [createdCohort] = await db
        .insert(cohorts)
        .values({
          code: "COHORT-2026-Q4",
          title: "2026 Q4 · Coding Everything 企二代与可控 Agent 项目营第 1 期",
          productId: resolvedCohort.id,
          description:
            "6 周阶段式项目交付带练：从 Intent/SPEC 边界、Starter Kit 首小时闭环，到 Eval 评测与双轨 Capstone 人工终审。",
          startDate: "2026-11-25",
          endDate: "2027-01-10",
          maxSeats: 30,
          status: "active",
        })
        .returning();

      if (createdCohort) {
        await db.insert(cohortMilestones).values([
          {
            cohortId: createdCohort.id,
            title: "Checkpoint 1 · 需求蓝图与三层鉴权基线（M1 / M3）",
            moduleId: "m3",
            dueDate: "2026-12-05",
            sortOrder: 1,
          },
          {
            cohortId: createdCohort.id,
            title: "Checkpoint 2 · Rules / DoD 与长程 Harness 规范（M4 / M8）",
            moduleId: "m8",
            dueDate: "2026-12-20",
            sortOrder: 2,
          },
          {
            cohortId: createdCohort.id,
            title: "Checkpoint 3 · 双轨 Capstone 结业交付（M13-Gov / M13-Eng）",
            moduleId: "m13-eng",
            dueDate: "2027-01-08",
            sortOrder: 3,
          },
        ]);
      }
    }
  }
}
