import crypto from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.ts";
import {
  cohortEnrollments,
  cohorts,
  entitlements,
  orders,
  paymentEvents,
  prices,
  products,
  redeemCodes,
} from "../../db/schema.ts";
import { ensureCatalogSeeded } from "./catalogSeed.ts";

export function formatBillingIntervalLabel(interval: string, durationDays: number): string {
  switch (interval) {
    case "month":
      return "月卡体验";
    case "quarter":
      return "季卡进阶";
    case "year":
      return "年卡完整版";
    case "one_time":
      return durationDays >= 60 ? "深度实战营" : "当期实战营";
    default:
      return `${durationDays} 天方案`;
  }
}

export async function getPublicCatalogProducts() {
  await ensureCatalogSeeded();
  const [productRows, priceRows, cohortRows] = await Promise.all([
    db.select().from(products).where(eq(products.active, true)),
    db.select().from(prices).where(eq(prices.active, true)),
    db.select().from(cohorts).where(eq(cohorts.status, "active")),
  ]);

  return {
    products: productRows.map((p) => ({
      ...p,
      slug: p.skuCode,
      description: p.subtitle,
      prices: priceRows
        .filter((pr) => pr.productId === p.id)
        .map((pr) => ({
          ...pr,
          label: formatBillingIntervalLabel(pr.billingInterval, pr.durationDays),
          billingCycle: pr.billingInterval,
        })),
    })),
    activeCohorts: cohortRows,
  };
}

export async function createPendingOrder(input: {
  userId: number;
  priceId: number;
  provider: "stripe" | "alipay" | "wechat" | "redeem_code";
  cohortId?: number;
}) {
  await ensureCatalogSeeded();
  const priceRows = await db
    .select()
    .from(prices)
    .where(and(eq(prices.id, input.priceId), eq(prices.active, true)))
    .limit(1);
  const price = priceRows[0];
  if (!price) {
    return { ok: false as const, status: 404, error: "所选价格方案不存在或已下架。" };
  }

  const productRows = await db
    .select()
    .from(products)
    .where(and(eq(products.id, price.productId), eq(products.active, true)))
    .limit(1);
  const product = productRows[0];
  if (!product) {
    return { ok: false as const, status: 404, error: "对应课程商品不可用。" };
  }

  let resolvedCohortId: number | null = null;
  if (product.productType === "cohort_mentored") {
    if (input.cohortId) {
      const cRows = await db
        .select()
        .from(cohorts)
        .where(eq(cohorts.id, input.cohortId))
        .limit(1);
      if (!cRows[0]) {
        return { ok: false as const, status: 404, error: "指定的实战班期不存在。" };
      }
      resolvedCohortId = cRows[0].id;
    } else {
      const activeCohort = await db
        .select()
        .from(cohorts)
        .where(eq(cohorts.status, "active"))
        .limit(1);
      resolvedCohortId = activeCohort[0]?.id ?? null;
    }
  }

  const orderNo = `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const [order] = await db
    .insert(orders)
    .values({
      orderNo,
      userId: input.userId,
      productId: product.id,
      priceId: price.id,
      cohortId: resolvedCohortId,
      amountCents: price.amountCents,
      currency: price.currency,
      provider: input.provider,
      status: "pending",
    })
    .returning();

  return { ok: true as const, order, product, price };
}

export async function redeemActivationCode(input: {
  userId: number;
  rawCode: string;
}) {
  await ensureCatalogSeeded();
  const normalizedCode = input.rawCode.trim().toUpperCase();
  if (!normalizedCode) {
    return { ok: false as const, status: 400, error: "请输入有效的兑换码。" };
  }

  return await db.transaction(async (tx) => {
    const codeRows = await tx
      .select()
      .from(redeemCodes)
      .where(eq(redeemCodes.code, normalizedCode))
      .limit(1);
    const codeRecord = codeRows[0];
    if (!codeRecord) {
      return { ok: false as const, status: 404, error: "兑换码不存在或已失效。" };
    }
    if (codeRecord.expiresAt && codeRecord.expiresAt <= new Date()) {
      return { ok: false as const, status: 400, error: "该兑换码已过期。" };
    }
    if (codeRecord.usedCount >= codeRecord.maxUses) {
      return { ok: false as const, status: 409, error: "该兑换码已达到使用上限。" };
    }

    const updatedCodes = await tx
      .update(redeemCodes)
      .set({ usedCount: sql`${redeemCodes.usedCount} + 1` })
      .where(
        and(
          eq(redeemCodes.id, codeRecord.id),
          sql`${redeemCodes.usedCount} < ${redeemCodes.maxUses}`
        )
      )
      .returning();

    if (updatedCodes.length === 0) {
      return { ok: false as const, status: 409, error: "兑换码已被其他账号抢先兑换。" };
    }

    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, codeRecord.productId))
      .limit(1);
    const [price] = await tx
      .select()
      .from(prices)
      .where(eq(prices.id, codeRecord.priceId))
      .limit(1);

    if (!product || !price) {
      throw new Error("Redeem code references missing product or price.");
    }

    const orderNo = `RDM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + price.durationDays * 86400 * 1000);

    const [order] = await tx
      .insert(orders)
      .values({
        orderNo,
        userId: input.userId,
        productId: product.id,
        priceId: price.id,
        cohortId: codeRecord.cohortId,
        amountCents: price.amountCents,
        currency: price.currency,
        provider: "redeem_code",
        status: "paid",
        paidAt: now,
      })
      .returning();

    const [entitlement] = await tx
      .insert(entitlements)
      .values({
        userId: input.userId,
        productId: product.id,
        sourceOrderId: order.id,
        scopeType: product.scopeType,
        scopeRef: product.scopeRef,
        status: "active",
        validFrom: now,
        validUntil,
      })
      .returning();

    let enrollment = null;
    if (codeRecord.cohortId) {
      const [enrolled] = await tx
        .insert(cohortEnrollments)
        .values({
          cohortId: codeRecord.cohortId,
          userId: input.userId,
          targetPathId: "indie-dev",
          status: "active",
        })
        .onConflictDoNothing()
        .returning();
      enrollment = enrolled ?? null;
    }

    return {
      ok: true as const,
      order,
      entitlement,
      enrollment,
      product,
    };
  });
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined
): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return false;
  }
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const provided = signatureHeader.replace(/^sha256=/i, "").trim();
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function processPaymentWebhookEvent(input: {
  provider: string;
  externalEventId: string;
  orderNo: string;
  eventType: "payment.succeeded" | "payment.refunded" | "subscription.cancelled";
  summaryJson?: Record<string, unknown>;
}) {
  return await db.transaction(async (tx) => {
    const orderRows = await tx
      .select()
      .from(orders)
      .where(eq(orders.orderNo, input.orderNo))
      .limit(1);
    const order = orderRows[0];

    const insertedEvent = await tx
      .insert(paymentEvents)
      .values({
        provider: input.provider,
        externalEventId: input.externalEventId,
        orderId: order?.id ?? null,
        eventType: input.eventType,
        summaryJson: input.summaryJson ?? { orderNo: input.orderNo },
      })
      .onConflictDoNothing()
      .returning();

    if (insertedEvent.length === 0) {
      return { ok: true as const, deduplicated: true };
    }

    if (!order) {
      return {
        ok: false as const,
        status: 404,
        error: "Webhook 指向的订单编号不存在。",
      };
    }

    if (input.eventType === "payment.succeeded") {
      const [price] = await tx
        .select()
        .from(prices)
        .where(eq(prices.id, order.priceId))
        .limit(1);
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, order.productId))
        .limit(1);
      if (!price || !product) {
        throw new Error("Order references missing price or product.");
      }

      const now = new Date();
      const validUntil = new Date(now.getTime() + price.durationDays * 86400 * 1000);

      await tx
        .update(orders)
        .set({ status: "paid", paidAt: now })
        .where(eq(orders.id, order.id));

      await tx.insert(entitlements).values({
        userId: order.userId,
        productId: product.id,
        sourceOrderId: order.id,
        scopeType: product.scopeType,
        scopeRef: product.scopeRef,
        status: "active",
        validFrom: now,
        validUntil,
      });

      if (order.cohortId) {
        await tx
          .insert(cohortEnrollments)
          .values({
            cohortId: order.cohortId,
            userId: order.userId,
            targetPathId: "indie-dev",
            status: "active",
          })
          .onConflictDoNothing();
      }
    } else if (
      input.eventType === "payment.refunded" ||
      input.eventType === "subscription.cancelled"
    ) {
      const nextStatus = input.eventType === "payment.refunded" ? "refunded" : "revoked";
      await tx
        .update(orders)
        .set({ status: input.eventType === "payment.refunded" ? "refunded" : "cancelled" })
        .where(eq(orders.id, order.id));

      await tx
        .update(entitlements)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(eq(entitlements.sourceOrderId, order.id));
    }

    return { ok: true as const, deduplicated: false, orderNo: order.orderNo };
  });
}

export async function getUserBillingHistory(userId: number) {
  const [userOrders, userEntitlements] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt)),
    db
      .select()
      .from(entitlements)
      .where(eq(entitlements.userId, userId))
      .orderBy(desc(entitlements.createdAt)),
  ]);
  return { orders: userOrders, entitlements: userEntitlements };
}

export async function adminGrantEntitlement(input: {
  targetUserId: number;
  productId: number;
  durationDays: number;
  cohortId?: number;
}) {
  return await db.transaction(async (tx) => {
    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1);
    if (!product) {
      return { ok: false as const, status: 404, error: "商品不存在。" };
    }

    const [price] = await tx
      .select()
      .from(prices)
      .where(eq(prices.productId, product.id))
      .limit(1);
    if (!price) {
      return { ok: false as const, status: 404, error: "商品缺少默认价格记录。" };
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + input.durationDays * 86400 * 1000);
    const orderNo = `ADM-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const [order] = await tx
      .insert(orders)
      .values({
        orderNo,
        userId: input.targetUserId,
        productId: product.id,
        priceId: price.id,
        cohortId: input.cohortId ?? null,
        amountCents: 0,
        currency: price.currency,
        provider: "admin_grant",
        status: "paid",
        paidAt: now,
      })
      .returning();

    const [entitlement] = await tx
      .insert(entitlements)
      .values({
        userId: input.targetUserId,
        productId: product.id,
        sourceOrderId: order.id,
        scopeType: product.scopeType,
        scopeRef: product.scopeRef,
        status: "active",
        validFrom: now,
        validUntil,
      })
      .returning();

    if (input.cohortId) {
      await tx
        .insert(cohortEnrollments)
        .values({
          cohortId: input.cohortId,
          userId: input.targetUserId,
          targetPathId: "indie-dev",
          status: "active",
        })
        .onConflictDoNothing();
    }

    return { ok: true as const, order, entitlement };
  });
}

export async function adminRevokeEntitlement(entitlementId: number, status: "refunded" | "revoked") {
  const updated = await db
    .update(entitlements)
    .set({ status, updatedAt: new Date() })
    .where(eq(entitlements.id, entitlementId))
    .returning();
  if (updated.length === 0) {
    return { ok: false as const, status: 404, error: "未找到对应权益记录。" };
  }
  if (updated[0].sourceOrderId && status === "refunded") {
    await db
      .update(orders)
      .set({ status: "refunded" })
      .where(eq(orders.id, updated[0].sourceOrderId));
  }
  return { ok: true as const, entitlement: updated[0] };
}

export async function adminCreateRedeemCode(input: {
  productId: number;
  priceId: number;
  cohortId?: number;
  maxUses: number;
  createdByUserId: number;
}) {
  const code = `AICC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const [created] = await db
    .insert(redeemCodes)
    .values({
      code,
      productId: input.productId,
      priceId: input.priceId,
      cohortId: input.cohortId ?? null,
      maxUses: input.maxUses,
      createdByUserId: input.createdByUserId,
    })
    .returning();
  return created;
}

export async function adminConfirmOrderPayment(orderId: number) {
  return await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return { ok: false as const, status: 404, error: "订单不存在。" };
    }
    if (order.status !== "pending") {
      return {
        ok: false as const,
        status: 409,
        error: `仅待支付（pending）订单可核销，当前状态为 ${order.status}。`,
      };
    }

    const updatedOrders = await tx
      .update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(orders.id, order.id), eq(orders.status, "pending")))
      .returning();

    if (updatedOrders.length === 0) {
      return { ok: false as const, status: 409, error: "订单已被其他操作处理。" };
    }

    const [price] = await tx
      .select()
      .from(prices)
      .where(eq(prices.id, order.priceId))
      .limit(1);
    const [product] = await tx
      .select()
      .from(products)
      .where(eq(products.id, order.productId))
      .limit(1);

    if (!price || !product) {
      throw new Error("Order references missing price or product.");
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + price.durationDays * 86400 * 1000);

    const [entitlement] = await tx
      .insert(entitlements)
      .values({
        userId: order.userId,
        productId: product.id,
        sourceOrderId: order.id,
        scopeType: product.scopeType,
        scopeRef: product.scopeRef,
        status: "active",
        validFrom: now,
        validUntil,
      })
      .returning();

    if (order.cohortId) {
      await tx
        .insert(cohortEnrollments)
        .values({
          cohortId: order.cohortId,
          userId: order.userId,
          targetPathId: "indie-dev",
          status: "active",
        })
        .onConflictDoNothing();
    }

    return { ok: true as const, order: updatedOrders[0], entitlement };
  });
}

export async function adminCancelOrder(orderId: number) {
  const updated = await db
    .update(orders)
    .set({ status: "cancelled" })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")))
    .returning();

  if (updated.length === 0) {
    return {
      ok: false as const,
      status: 409,
      error: "订单不存在或非待支付状态，无法取消。",
    };
  }
  return { ok: true as const, order: updated[0] };
}
