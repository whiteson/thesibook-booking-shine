import { NextResponse } from "next/server";
import {
  findBillingOrderByMerchantTrns,
  findBillingOrderByVivaOrderCode,
  markBillingOrderPaid,
  upsertSubscription,
} from "@/lib/booking/billing";
import {
  getVivaTransaction,
  isVivaTransactionPaid,
} from "@/lib/booking/viva";
import type { PlanId } from "@/types/booking";

type VivaWebhookBody = {
  EventTypeId?: number;
  EventData?: {
    TransactionId?: string;
    OrderCode?: number | string;
    MerchantTrns?: string;
    Email?: string;
    StatusId?: string;
  };
};

export async function POST(request: Request) {
  const body = (await request.json()) as VivaWebhookBody;
  const eventType = body.EventTypeId;
  const data = body.EventData;
  if (eventType !== 1796 && eventType !== 0) {
    return NextResponse.json({ ok: true, ignored: eventType });
  }
  if (!data?.TransactionId) {
    return NextResponse.json({ ok: true, skipped: "no transaction" });
  }

  try {
    const txn = await getVivaTransaction(data.TransactionId);
    if (!isVivaTransactionPaid(txn.statusId ?? data.StatusId ?? "")) {
      return NextResponse.json({ ok: true, skipped: "not paid" });
    }

    const billingOrder =
      (data.MerchantTrns
        ? await findBillingOrderByMerchantTrns(data.MerchantTrns)
        : null) ??
      (data.OrderCode
        ? await findBillingOrderByVivaOrderCode(String(data.OrderCode))
        : null);

    if (!billingOrder || billingOrder.status === "paid") {
      return NextResponse.json({ ok: true });
    }

    await markBillingOrderPaid({
      billingOrderId: Number(billingOrder.id),
      planId: billingOrder.plan_id as PlanId,
      workspaceId: Number(billingOrder.workspace_id),
      vivaOrderCode: String(data.OrderCode ?? ""),
      vivaTransactionId: data.TransactionId,
      payerEmail: data.Email ?? txn.email,
      billingProvider: "viva",
    });

    await upsertSubscription({
      workspaceId: Number(billingOrder.workspace_id),
      userId: Number(billingOrder.user_id),
      planId: billingOrder.plan_id as "small" | "unlimited",
      provider: "viva",
      vivaParentTransactionId: data.TransactionId,
      vivaOrderCode: String(data.OrderCode ?? ""),
    });
  } catch (err) {
    console.error("[viva/webhook]", err);
    return NextResponse.json({ error: "webhook failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
