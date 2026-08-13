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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? url.origin
  ).replace(/\/$/, "");
  const transactionId = url.searchParams.get("t") ?? "";
  const orderCode = url.searchParams.get("s") ?? "";
  const merchantTrns = url.searchParams.get("merchantTrns") ?? "";

  const fail = new URL("/dashboard?billing=failed", siteUrl);

  try {
    if (!transactionId) {
      return NextResponse.redirect(fail);
    }

    const txn = await getVivaTransaction(transactionId);
    if (!isVivaTransactionPaid(txn.statusId)) {
      return NextResponse.redirect(fail);
    }

    const billingOrder =
      (merchantTrns
        ? await findBillingOrderByMerchantTrns(merchantTrns)
        : null) ??
      (orderCode ? await findBillingOrderByVivaOrderCode(orderCode) : null) ??
      (txn.orderCode
        ? await findBillingOrderByVivaOrderCode(String(txn.orderCode))
        : null);

    if (!billingOrder) {
      return NextResponse.redirect(fail);
    }

    if (billingOrder.status !== "paid") {
      await markBillingOrderPaid({
        billingOrderId: Number(billingOrder.id),
        planId: billingOrder.plan_id as PlanId,
        workspaceId: Number(billingOrder.workspace_id),
        vivaOrderCode: String(txn.orderCode ?? orderCode),
        vivaTransactionId: transactionId,
        payerEmail: txn.email,
        billingProvider: "viva",
      });
    }

    await upsertSubscription({
      workspaceId: Number(billingOrder.workspace_id),
      userId: Number(billingOrder.user_id),
      planId: billingOrder.plan_id as "small" | "unlimited",
      provider: "viva",
      vivaParentTransactionId: transactionId,
      vivaOrderCode: String(txn.orderCode ?? orderCode),
    });

    return NextResponse.redirect(
      `${siteUrl}/dashboard?billing=success&plan=${encodeURIComponent(String(billingOrder.plan_id))}&provider=viva`,
    );
  } catch (err) {
    console.error("[viva/return]", err);
    return NextResponse.redirect(fail);
  }
}
