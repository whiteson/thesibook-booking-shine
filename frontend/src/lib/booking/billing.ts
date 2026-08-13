import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getControlPlanePool } from "./db";
import { planLimit, type PlanId, type BillingOrderSummary } from "@/types/booking";

export async function createBillingOrder(params: {
  workspaceId: number;
  userId: number;
  planId: "small" | "unlimited";
  amountCents: number;
  merchantTrns: string;
  paymentProvider?: "paypal" | "viva";
  isRenewal?: boolean;
}): Promise<number> {
  const pool = getControlPlanePool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO cp_billing_orders
      (workspace_id, user_id, plan_id, amount_cents, billing_interval, is_renewal,
       merchant_trns, payment_provider, status)
     VALUES (?, ?, ?, ?, 'year', ?, ?, ?, 'pending')`,
    [
      params.workspaceId,
      params.userId,
      params.planId,
      params.amountCents,
      params.isRenewal ? 1 : 0,
      params.merchantTrns,
      params.paymentProvider ?? "paypal",
    ],
  );
  return result.insertId;
}

export async function attachPayPalOrderId(
  billingOrderId: number,
  paypalOrderId: string,
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    "UPDATE cp_billing_orders SET paypal_order_id = ? WHERE id = ?",
    [paypalOrderId, billingOrderId],
  );
}

export async function findBillingOrderByMerchantTrns(
  merchantTrns: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT bo.*, w.slug, w.plan AS current_plan
     FROM cp_billing_orders bo
     INNER JOIN cp_workspaces w ON w.id = bo.workspace_id
     WHERE bo.merchant_trns = ?
     LIMIT 1`,
    [merchantTrns],
  );
  return rows[0] ?? null;
}

export async function findBillingOrderByPayPalId(
  paypalOrderId: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT bo.*, w.slug, w.plan AS current_plan
     FROM cp_billing_orders bo
     INNER JOIN cp_workspaces w ON w.id = bo.workspace_id
     WHERE bo.paypal_order_id = ?
     LIMIT 1`,
    [paypalOrderId],
  );
  return rows[0] ?? null;
}

export async function markBillingOrderPaid(params: {
  billingOrderId: number;
  planId: PlanId;
  workspaceId: number;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalSubscriptionId?: string;
  vivaOrderCode?: string;
  vivaTransactionId?: string;
  payerEmail?: string;
  billingProvider?: "paypal" | "viva";
}): Promise<void> {
  const pool = getControlPlanePool();
  const limit = Math.min(planLimit(params.planId), 4_294_967_295);
  const provider = params.billingProvider ?? "paypal";

  await pool.query(
    `UPDATE cp_billing_orders
     SET status = 'paid',
         paypal_order_id = COALESCE(?, paypal_order_id),
         paypal_capture_id = COALESCE(?, paypal_capture_id),
         paypal_subscription_id = COALESCE(?, paypal_subscription_id),
         viva_order_code = COALESCE(?, viva_order_code),
         viva_transaction_id = COALESCE(?, viva_transaction_id),
         payer_email = COALESCE(?, payer_email),
         paid_at = NOW()
     WHERE id = ? AND status IN ('pending', 'paid')`,
    [
      params.paypalOrderId ?? null,
      params.paypalCaptureId ?? null,
      params.paypalSubscriptionId ?? null,
      params.vivaOrderCode ?? null,
      params.vivaTransactionId ?? null,
      params.payerEmail ?? null,
      params.billingOrderId,
    ],
  );

  await pool.query(
    `UPDATE cp_workspaces
     SET plan = ?,
         attendant_limit = ?,
         plan_expires_at = DATE_ADD(NOW(), INTERVAL 1 YEAR),
         billing_provider = ?
     WHERE id = ?`,
    [params.planId, limit, provider, params.workspaceId],
  );
}

export async function upsertSubscription(params: {
  workspaceId: number;
  userId: number;
  planId: "small" | "unlimited";
  provider: "paypal" | "viva";
  paypalSubscriptionId?: string;
  vivaParentTransactionId?: string;
  vivaOrderCode?: string;
}): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    `UPDATE cp_subscriptions SET status = 'cancelled'
     WHERE workspace_id = ? AND status = 'active' AND provider = ?`,
    [params.workspaceId, params.provider],
  );

  if (params.paypalSubscriptionId) {
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM cp_subscriptions WHERE paypal_subscription_id = ? LIMIT 1`,
      [params.paypalSubscriptionId],
    );
    if (existing.length > 0) {
      await pool.query(
        `UPDATE cp_subscriptions
         SET status = 'active', plan_id = ?, current_period_end = DATE_ADD(NOW(), INTERVAL 1 YEAR)
         WHERE id = ?`,
        [params.planId, existing[0].id],
      );
      return;
    }
  }

  await pool.query(
    `INSERT INTO cp_subscriptions
      (workspace_id, user_id, plan_id, provider, status,
       paypal_subscription_id, viva_parent_transaction_id, viva_order_code, current_period_end)
     VALUES (?, ?, ?, ?, 'active', ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 YEAR))`,
    [
      params.workspaceId,
      params.userId,
      params.planId,
      params.provider,
      params.paypalSubscriptionId ?? null,
      params.vivaParentTransactionId ?? null,
      params.vivaOrderCode ?? null,
    ],
  );
}

export async function findBillingOrderByVivaOrderCode(
  orderCode: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT bo.*, w.slug, w.plan AS current_plan
     FROM cp_billing_orders bo
     INNER JOIN cp_workspaces w ON w.id = bo.workspace_id
     WHERE bo.viva_order_code = ?
     LIMIT 1`,
    [orderCode],
  );
  return rows[0] ?? null;
}

export async function findBillingOrderByPayPalSubscription(
  subscriptionId: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT bo.*, w.slug, w.plan AS current_plan
     FROM cp_billing_orders bo
     INNER JOIN cp_workspaces w ON w.id = bo.workspace_id
     WHERE bo.paypal_subscription_id = ?
     ORDER BY bo.id DESC
     LIMIT 1`,
    [subscriptionId],
  );
  return rows[0] ?? null;
}

export async function attachPayPalSubscriptionId(
  billingOrderId: number,
  subscriptionId: string,
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    "UPDATE cp_billing_orders SET paypal_subscription_id = ? WHERE id = ?",
    [subscriptionId, billingOrderId],
  );
}

export async function attachVivaOrderCode(
  billingOrderId: number,
  orderCode: string,
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    "UPDATE cp_billing_orders SET viva_order_code = ? WHERE id = ?",
    [orderCode, billingOrderId],
  );
}

export async function findSubscriptionByPayPalId(
  subscriptionId: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM cp_subscriptions WHERE paypal_subscription_id = ? LIMIT 1`,
    [subscriptionId],
  );
  return rows[0] ?? null;
}

export async function listDueVivaSubscriptions(): Promise<RowDataPacket[]> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*, w.slug, w.plan, w.display_name
     FROM cp_subscriptions s
     INNER JOIN cp_workspaces w ON w.id = s.workspace_id
     WHERE s.provider = 'viva'
       AND s.status = 'active'
       AND s.viva_parent_transaction_id IS NOT NULL
       AND s.current_period_end <= DATE_ADD(NOW(), INTERVAL 1 DAY)`,
  );
  return rows;
}

export async function listBillingOrdersForWorkspace(
  workspaceId: number,
  limit = 5,
): Promise<BillingOrderSummary[]> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, plan_id, amount_cents, status, payment_provider, paid_at, created_at
     FROM cp_billing_orders
     WHERE workspace_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [workspaceId, limit],
  );

  return rows.map((row) => ({
    id: Number(row.id),
    planId: row.plan_id as "small" | "unlimited",
    amountCents: Number(row.amount_cents),
    status: String(row.status),
    paymentProvider: String(row.payment_provider ?? "paypal"),
    paidAt: row.paid_at ? String(row.paid_at) : null,
    createdAt: String(row.created_at),
  }));
}

export async function findBillingOrderByMerchantTrnsOrPayPalId(
  merchantTrns: string,
  paypalOrderId?: string,
): Promise<RowDataPacket | null> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT bo.*, w.slug, w.plan AS current_plan
     FROM cp_billing_orders bo
     INNER JOIN cp_workspaces w ON w.id = bo.workspace_id
     WHERE bo.merchant_trns = ?
        OR (? IS NOT NULL AND bo.paypal_order_id = ?)
     LIMIT 1`,
    [merchantTrns, paypalOrderId ?? null, paypalOrderId ?? null],
  );
  return rows[0] ?? null;
}

export async function markSubscriptionStatus(
  paypalSubscriptionId: string,
  status: "cancelled" | "past_due" | "paused" | "active",
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    `UPDATE cp_subscriptions SET status = ? WHERE paypal_subscription_id = ?`,
    [status, paypalSubscriptionId],
  );
}

export async function markBillingOrderFailed(
  billingOrderId: number,
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    "UPDATE cp_billing_orders SET status = 'failed' WHERE id = ? AND status = 'pending'",
    [billingOrderId],
  );
}

export async function userOwnsWorkspace(
  userId: number,
  workspaceId: number,
): Promise<boolean> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1 FROM cp_workspace_members WHERE user_id = ? AND workspace_id = ? LIMIT 1`,
    [userId, workspaceId],
  );
  return rows.length > 0;
}
