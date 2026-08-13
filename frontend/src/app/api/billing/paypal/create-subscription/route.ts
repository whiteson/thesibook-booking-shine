import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/booking/auth";
import {
  createBillingOrder,
  markBillingOrderFailed,
  userOwnsWorkspace,
} from "@/lib/booking/billing";
import { getControlPlanePool } from "@/lib/booking/db";
import { getPayPalYearlyPlanId } from "@/lib/booking/paypal";
import { planAmountCents } from "@/lib/booking/plans";
import type { RowDataPacket } from "mysql2";
import type { PlanId } from "@/types/booking";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { workspaceId?: number; plan?: string };
  try {
    body = (await request.json()) as { workspaceId?: number; plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const workspaceId = Number(body.workspaceId);
  const plan = body.plan;
  if (!workspaceId || plan !== "small") {
    return NextResponse.json(
      { error: "Διαθέσιμο μόνο το ετήσιο πλάνο €84." },
      { status: 400 },
    );
  }

  if (!(await userOwnsWorkspace(user.id, workspaceId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pool = getControlPlanePool();
  const [wsRows] = await pool.query<RowDataPacket[]>(
    "SELECT slug, plan FROM cp_workspaces WHERE id = ? LIMIT 1",
    [workspaceId],
  );
  const workspace = wsRows[0];
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const currentPlan = workspace.plan as PlanId;
  if (currentPlan === "unlimited") {
    return NextResponse.json(
      { error: "Το workspace έχει ήδη το απεριόριστο πλάνο." },
      { status: 400 },
    );
  }
  if (currentPlan === "small" && plan === "small") {
    return NextResponse.json(
      { error: "Έχετε ήδη το μικρό πλάνο." },
      { status: 400 },
    );
  }

  const merchantTrns = `TB-${workspaceId}-${plan}-${Date.now()}`;
  const billingOrderId = await createBillingOrder({
    workspaceId,
    userId: user.id,
    planId: plan,
    amountCents: planAmountCents(plan),
    merchantTrns,
    paymentProvider: "paypal",
  });

  try {
    const paypalPlanId = await getPayPalYearlyPlanId(plan);
    return NextResponse.json({
      paypalPlanId,
      billingOrderId,
      customId: merchantTrns,
    });
  } catch (err) {
    await markBillingOrderFailed(billingOrderId);
    const message = err instanceof Error ? err.message : "PayPal plan failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
