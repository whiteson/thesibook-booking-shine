import { NextResponse } from "next/server";
import {
  createBillingOrder,
  findBillingOrderByMerchantTrns,
  findBillingOrderByPayPalId,
  findBillingOrderByPayPalSubscription,
  findSubscriptionByPayPalId,
  markBillingOrderPaid,
  markSubscriptionStatus,
  upsertSubscription,
  attachPayPalSubscriptionId,
} from "@/lib/booking/billing";
import {
  getPayPalConfig,
  verifyPayPalWebhook,
  type PayPalWebhookEvent,
} from "@/lib/booking/paypal";
import { planAmountCents } from "@/lib/booking/plans";
import type { PlanId } from "@/types/booking";

/**
 * PayPal webhook.
 * URL: https://www.thesibook.gr/api/billing/paypal/webhook
 * Events: BILLING.SUBSCRIPTION.*, PAYMENT.SALE.COMPLETED, PAYMENT.CAPTURE.COMPLETED
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const config = getPayPalConfig();
    if (config.webhookId) {
      const valid = await verifyPayPalWebhook({
        headers: request.headers,
        body: rawBody,
        webhookId: config.webhookId,
      });
      if (!valid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
  } catch {
    if (process.env.PAYPAL_MODE === "live") {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }
  }

  const eventType = event.event_type;

  if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
    const customId = event.resource.custom_id;
    const orderId =
      event.resource.supplementary_data?.related_ids?.order_id ?? undefined;
    const captureId = event.resource.id;

    if (!customId) {
      return NextResponse.json({ ok: true, skipped: "no custom_id" });
    }

    const billingOrder =
      (await findBillingOrderByMerchantTrns(customId)) ??
      (orderId ? await findBillingOrderByPayPalId(orderId) : null);

    if (!billingOrder || billingOrder.status === "paid") {
      return NextResponse.json({ ok: true });
    }

    await markBillingOrderPaid({
      billingOrderId: Number(billingOrder.id),
      planId: billingOrder.plan_id as PlanId,
      workspaceId: Number(billingOrder.workspace_id),
      paypalOrderId: orderId,
      paypalCaptureId: captureId,
      billingProvider: "paypal",
    });

    return NextResponse.json({ ok: true });
  }

  if (eventType === "BILLING.SUBSCRIPTION.CREATED") {
    const subscriptionId = event.resource.id;
    const customId = event.resource.custom_id;
    if (subscriptionId && customId) {
      const billingOrder = await findBillingOrderByMerchantTrns(customId);
      if (billingOrder) {
        await attachPayPalSubscriptionId(
          Number(billingOrder.id),
          subscriptionId,
        );
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
    eventType === "BILLING.SUBSCRIPTION.UPDATED"
  ) {
    const subscriptionId = event.resource.id;
    const customId = event.resource.custom_id;
    if (!subscriptionId) {
      return NextResponse.json({ ok: true, skipped: "no subscription" });
    }

    const billingOrder =
      (customId ? await findBillingOrderByMerchantTrns(customId) : null) ??
      (await findBillingOrderByPayPalSubscription(subscriptionId));

    if (billingOrder && billingOrder.status !== "paid") {
      await markBillingOrderPaid({
        billingOrderId: Number(billingOrder.id),
        planId: billingOrder.plan_id as PlanId,
        workspaceId: Number(billingOrder.workspace_id),
        paypalSubscriptionId: subscriptionId,
        payerEmail: event.resource.subscriber?.email_address,
        billingProvider: "paypal",
      });
      await upsertSubscription({
        workspaceId: Number(billingOrder.workspace_id),
        userId: Number(billingOrder.user_id),
        planId: billingOrder.plan_id as "small" | "unlimited",
        provider: "paypal",
        paypalSubscriptionId: subscriptionId,
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (
    eventType === "PAYMENT.SALE.COMPLETED" ||
    eventType === "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED"
  ) {
    const subscriptionId =
      event.resource.billing_agreement_id ?? event.resource.id;
    if (!subscriptionId) {
      return NextResponse.json({ ok: true, skipped: "no agreement" });
    }
    return NextResponse.json(
      await applyPaypalSubscriptionPayment(subscriptionId),
    );
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
    eventType === "BILLING.SUBSCRIPTION.EXPIRED"
  ) {
    const subscriptionId = event.resource.id;
    if (subscriptionId) {
      await markSubscriptionStatus(subscriptionId, "cancelled");
    }
    return NextResponse.json({ ok: true });
  }

  if (
    eventType === "BILLING.SUBSCRIPTION.SUSPENDED" ||
    eventType === "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
  ) {
    const subscriptionId =
      event.resource.id ?? event.resource.billing_agreement_id;
    if (subscriptionId) {
      await markSubscriptionStatus(subscriptionId, "past_due");
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: eventType });
}

async function applyPaypalSubscriptionPayment(subscriptionId: string) {
  const sub = await findSubscriptionByPayPalId(subscriptionId);
  const existing = await findBillingOrderByPayPalSubscription(subscriptionId);
  if (!sub && !existing) {
    return { ok: true, skipped: "unknown subscription" };
  }

  const workspaceId = Number(sub?.workspace_id ?? existing?.workspace_id);
  const userId = Number(sub?.user_id ?? existing?.user_id);
  const planId = String(sub?.plan_id ?? existing?.plan_id) as
    | "small"
    | "unlimited";

  if (existing && existing.status !== "paid") {
    await markBillingOrderPaid({
      billingOrderId: Number(existing.id),
      planId,
      workspaceId,
      paypalSubscriptionId: subscriptionId,
      billingProvider: "paypal",
    });
  } else {
    const periodEnd = sub?.current_period_end
      ? new Date(String(sub.current_period_end)).getTime()
      : 0;
    const alreadyCovered = periodEnd > Date.now() + 60 * 24 * 60 * 60 * 1000;
    if (alreadyCovered) {
      return { ok: true, skipped: "already active" };
    }

    const merchantTrns = `TB-PP-${workspaceId}-${Date.now()}`;
    const billingOrderId = await createBillingOrder({
      workspaceId,
      userId,
      planId,
      amountCents: planAmountCents(planId),
      merchantTrns,
      paymentProvider: "paypal",
      isRenewal: true,
    });
    await markBillingOrderPaid({
      billingOrderId,
      planId,
      workspaceId,
      paypalSubscriptionId: subscriptionId,
      billingProvider: "paypal",
    });
  }

  await upsertSubscription({
    workspaceId,
    userId,
    planId,
    provider: "paypal",
    paypalSubscriptionId: subscriptionId,
  });

  return { ok: true, renewed: true };
}
