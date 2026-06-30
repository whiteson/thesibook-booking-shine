import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getControlPlanePool } from "./db";
import { planLimit, type PlanId, type BillingOrderSummary } from "@/types/booking";

export async function createBillingOrder(params: {
  workspaceId: number;
  userId: number;
  planId: "small" | "unlimited";
  amountCents: number;
  merchantTrns: string;
}): Promise<number> {
  const pool = getControlPlanePool();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO cp_billing_orders
      (workspace_id, user_id, plan_id, amount_cents, merchant_trns, payment_provider, status)
     VALUES (?, ?, ?, ?, ?, 'paypal', 'pending')`,
    [
      params.workspaceId,
      params.userId,
      params.planId,
      params.amountCents,
      params.merchantTrns,
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
  payerEmail?: string;
}): Promise<void> {
  const pool = getControlPlanePool();
  const limit = planLimit(params.planId);

  await pool.query(
    `UPDATE cp_billing_orders
     SET status = 'paid',
         paypal_order_id = COALESCE(?, paypal_order_id),
         paypal_capture_id = COALESCE(?, paypal_capture_id),
         payer_email = COALESCE(?, payer_email),
         paid_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [
      params.paypalOrderId ?? null,
      params.paypalCaptureId ?? null,
      params.payerEmail ?? null,
      params.billingOrderId,
    ],
  );

  await pool.query(
    `UPDATE cp_workspaces
     SET plan = ?, attendant_limit = ?, plan_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
     WHERE id = ?`,
    [params.planId, limit, params.workspaceId],
  );
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
