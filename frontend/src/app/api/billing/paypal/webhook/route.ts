import { NextResponse } from "next/server";
import {
  findBillingOrderByMerchantTrns,
  findBillingOrderByPayPalId,
  markBillingOrderPaid,
} from "@/lib/booking/billing";
import {
  getPayPalConfig,
  verifyPayPalWebhook,
  type PayPalWebhookEvent,
} from "@/lib/booking/paypal";
import type { PlanId } from "@/types/booking";

/**
 * PayPal webhook — backup when client-side capture fails.
 * Register URL in PayPal Developer → Webhooks:
 *   {NEXT_PUBLIC_SITE_URL}/api/billing/paypal/webhook
 * Events: PAYMENT.CAPTURE.COMPLETED, CHECKOUT.ORDER.APPROVED
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
    /* dev without credentials — still try to process in sandbox only */
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
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: eventType });
}
