import type { RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { getControlPlanePool } from "./db";

export type DbPoolSlot = {
  id: number;
  db_host: string;
  db_name: string;
  db_user: string;
  db_password_enc: string;
};

export async function countAvailablePoolSlots(): Promise<number> {
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM cp_db_pool WHERE status = 'available'",
  );
  return Number(rows[0]?.c ?? 0);
}

export async function claimPoolSlot(workspaceId: number): Promise<DbPoolSlot> {
  const pool = getControlPlanePool();
  const conn: PoolConnection = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, db_host, db_name, db_user, db_password_enc
       FROM cp_db_pool
       WHERE status = 'available'
       ORDER BY id ASC
       LIMIT 1
       FOR UPDATE`,
    );
    if (rows.length === 0) {
      throw new Error("NO_POOL_AVAILABLE");
    }
    const slot = rows[0] as DbPoolSlot;
    await conn.query(
      `UPDATE cp_db_pool
       SET status = 'assigned', workspace_id = ?, assigned_at = NOW(), last_error = NULL
       WHERE id = ?`,
      [workspaceId, slot.id],
    );
    await conn.commit();
    return slot;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function releasePoolSlot(poolId: number, error?: string): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    `UPDATE cp_db_pool
     SET status = 'available', workspace_id = NULL, assigned_at = NULL, last_error = ?
     WHERE id = ? AND status = 'assigned'`,
    [error?.slice(0, 2000) ?? null, poolId],
  );
}

export async function disablePoolSlot(poolId: number, error: string): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    `UPDATE cp_db_pool SET status = 'disabled', last_error = ? WHERE id = ?`,
    [error.slice(0, 2000), poolId],
  );
}

export function isPoolProvisionMode(): boolean {
  return process.env.EA_PROVISION_MODE === "pool";
}
