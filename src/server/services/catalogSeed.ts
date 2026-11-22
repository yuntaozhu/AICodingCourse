import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { cohortMilestones, cohorts, prices, products } from "../../db/schema.ts";

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

async function runSeed(): Promise<void> {
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length > 0) {
    return;
  }

  const [selfPaced] = await db
    .insert(products)
    .values({
      skuCode: "self-paced-pass",
      title: "自助学习账号 · 全模块与沙盘版",
      subtitle: "面向自驱动独立开发者、产品经理与学生，解锁 M1–M13-Eng 全部课程与云端进度",
      productType: "self_paced",
      scopeType: "all_modules",
      scopeRef: "m1-m13-eng",
      featuresJson: [
        "解锁 M1–M13-Eng 全部 14 模块与 149 教学单元",
        "20 个交互式沙盘与 0-Token 静态规则实时审计",
        "49 道随堂测验服务端判分与错题溯源复盘",
        "云端多端进度同步、个人双链路知识库草稿与 Markdown 导出",
        "M2–M13-Eng 限额内服务端 AI 代码/规则审查体验",
      ],
      active: true,
    })
    .onConflictDoNothing()
    .returning();

  const [cohortCamp] = await db
    .insert(products)
    .values({
      skuCode: "cohort-mentored-camp",
      title: "教师小班实战营 · 深度指导与作业批改",
      subtitle: "含完整课程访问权 + 当期固定课表、3 个里程碑作业批改与结业人工评审",
      productType: "cohort_mentored",
      scopeType: "cohort_track",
      scopeRef: "COHORT-2026-Q4",
      featuresJson: [
        "包含自助学习账号的全部课程、沙盘与测验权限",
        "加入当期固定 Cohort 班级与分阶段里程碑课表",
        "老师/助教逐份批改实操产物（支持退回修改与二次点评）",
        "通过前置实证后由指导老师核发 5 项能力认证账本",
        "支持 M13-Gov 无代码治理或 M13-Eng 工程双轨结业验收",
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
          title: "2026 Q4 · AI Coding 与可控 Agent 实战小班第 1 期",
          productId: resolvedCohort.id,
          description:
            "6 周阶段式小班带练：从 Intent/SDD 蓝图、全栈鉴权基线，到长程 Harness 与双轨 Capstone 人工评审。",
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
