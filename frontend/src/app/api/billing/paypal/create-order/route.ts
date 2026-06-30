import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/booking/auth";
import {
  attachPayPalOrderId,
  createBillingOrder,
  markBillingOrderFailed,
  userOwnsWorkspace,
} from "@/lib/booking/billing";
import { getControlPlanePool } from "@/lib/booking/db";
import { createPayPalOrder, getPayPalConfig } from "@/lib/booking/paypal";
import {
  planAmountCents,
  planAmountEur,
  planLabel,
} from "@/lib/booking/plans";
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
  if (!workspaceId || (plan !== "small" && plan !== "unlimited")) {
    return NextResponse.json({ error: "Invalid workspace or plan" }, { status: 400 });
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

  try {
    getPayPalConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal not configured";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const merchantTrns = `TB-${workspaceId}-${plan}-${Date.now()}`;
  const billingOrderId = await createBillingOrder({
    workspaceId,
    userId: user.id,
    planId: plan,
    amountCents: planAmountCents(plan),
    merchantTrns,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";

  try {
    const paypalOrder = await createPayPalOrder({
      amountEur: planAmountEur(plan),
      description: planLabel(plan),
      merchantTrns,
      siteUrl,
      workspaceSlug: String(workspace.slug),
    });

    await attachPayPalOrderId(billingOrderId, paypalOrder.id);

    return NextResponse.json({
      id: paypalOrder.id,
      billingOrderId,
    });
  } catch (err) {
    await markBillingOrderFailed(billingOrderId);
    const message = err instanceof Error ? err.message : "PayPal order failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
