import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/booking/auth";
import {
  findBillingOrderByPayPalId,
  markBillingOrderFailed,
  markBillingOrderPaid,
} from "@/lib/booking/billing";
import { capturePayPalOrder } from "@/lib/booking/paypal";
import type { PlanId } from "@/types/booking";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { orderID?: string };
  try {
    body = (await request.json()) as { orderID?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderID = body.orderID;
  if (!orderID) {
    return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
  }

  const billingOrder = await findBillingOrderByPayPalId(orderID);
  if (!billingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (Number(billingOrder.user_id) !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (billingOrder.status === "paid") {
    return NextResponse.json({
      ok: true,
      plan: billingOrder.plan_id,
      alreadyPaid: true,
    });
  }

  try {
    const captured = await capturePayPalOrder(orderID);
    if (captured.status !== "COMPLETED") {
      await markBillingOrderFailed(Number(billingOrder.id));
      return NextResponse.json(
        { error: "Η πληρωμή δεν ολοκληρώθηκε" },
        { status: 402 },
      );
    }

    await markBillingOrderPaid({
      billingOrderId: Number(billingOrder.id),
      planId: billingOrder.plan_id as PlanId,
      workspaceId: Number(billingOrder.workspace_id),
      paypalOrderId: orderID,
      paypalCaptureId: captured.captureId,
      payerEmail: captured.payerEmail,
    });

    return NextResponse.json({
      ok: true,
      plan: billingOrder.plan_id,
      amountEur: captured.amountEur,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
