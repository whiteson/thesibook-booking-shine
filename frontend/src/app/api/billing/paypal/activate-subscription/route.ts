import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/booking/auth";
import {
  attachPayPalSubscriptionId,
  findBillingOrderByMerchantTrns,
  markBillingOrderPaid,
  upsertSubscription,
} from "@/lib/booking/billing";
import { getPayPalSubscription } from "@/lib/booking/paypal";
import type { PlanId } from "@/types/booking";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { subscriptionID?: string; customId?: string };
  try {
    body = (await request.json()) as {
      subscriptionID?: string;
      customId?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.subscriptionID) {
    return NextResponse.json({ error: "Missing subscription" }, { status: 400 });
  }

  const subscription = await getPayPalSubscription(body.subscriptionID);
  const customId = body.customId || subscription.customId;
  if (!customId) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
  }

  const billingOrder = await findBillingOrderByMerchantTrns(customId);
  if (!billingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (Number(billingOrder.user_id) !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const active =
    subscription.status === "ACTIVE" || subscription.status === "APPROVED";
  if (!active) {
    return NextResponse.json(
      { error: "Η συνδρομή PayPal δεν ενεργοποιήθηκε." },
      { status: 402 },
    );
  }

  await attachPayPalSubscriptionId(Number(billingOrder.id), body.subscriptionID);

  if (billingOrder.status !== "paid") {
    await markBillingOrderPaid({
      billingOrderId: Number(billingOrder.id),
      planId: billingOrder.plan_id as PlanId,
      workspaceId: Number(billingOrder.workspace_id),
      paypalSubscriptionId: body.subscriptionID,
      payerEmail: subscription.subscriberEmail,
      billingProvider: "paypal",
    });
  }

  await upsertSubscription({
    workspaceId: Number(billingOrder.workspace_id),
    userId: Number(billingOrder.user_id),
    planId: billingOrder.plan_id as "small" | "unlimited",
    provider: "paypal",
    paypalSubscriptionId: body.subscriptionID,
  });

  return NextResponse.json({
    ok: true,
    plan: billingOrder.plan_id,
  });
}
