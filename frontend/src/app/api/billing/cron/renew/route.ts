import { NextResponse } from "next/server";
import {
  createBillingOrder,
  listDueVivaSubscriptions,
  markBillingOrderPaid,
  upsertSubscription,
} from "@/lib/booking/billing";
import { createVivaRecurringCharge } from "@/lib/booking/viva";
import { planAmountCents, planLabel } from "@/lib/booking/plans";

function authorized(request: Request): boolean {
  const secret = process.env.BILLING_CRON_SECRET ?? "";
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await listDueVivaSubscriptions();
  const results: Array<{ workspaceId: number; ok: boolean; error?: string }> =
    [];

  for (const row of due) {
    const workspaceId = Number(row.workspace_id);
    const planId = row.plan_id as "small" | "unlimited";
    const parentTxn = String(row.viva_parent_transaction_id);
    const merchantTrns = `TB-RENEW-${workspaceId}-${Date.now()}`;

    try {
      const charge = await createVivaRecurringCharge({
        parentTransactionId: parentTxn,
        amountCents: planAmountCents(planId),
        merchantTrns,
        customerTrns: `${planLabel(planId)} — yearly renewal`,
      });

      const billingOrderId = await createBillingOrder({
        workspaceId,
        userId: Number(row.user_id),
        planId,
        amountCents: planAmountCents(planId),
        merchantTrns,
        paymentProvider: "viva",
        isRenewal: true,
      });

      await markBillingOrderPaid({
        billingOrderId,
        planId,
        workspaceId,
        vivaTransactionId: charge.transactionId || parentTxn,
        vivaOrderCode: row.viva_order_code ? String(row.viva_order_code) : undefined,
        billingProvider: "viva",
      });

      await upsertSubscription({
        workspaceId,
        userId: Number(row.user_id),
        planId,
        provider: "viva",
        vivaParentTransactionId: parentTxn,
        vivaOrderCode: row.viva_order_code ? String(row.viva_order_code) : undefined,
      });

      results.push({ workspaceId, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "renew failed";
      console.error("[billing/cron]", workspaceId, message);
      results.push({ workspaceId, ok: false, error: message });
    }
  }

  return NextResponse.json({ ok: true, renewed: results.length, results });
}
