import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getSessionUser } from "@/lib/booking/auth";
import { listBillingOrdersForWorkspace } from "@/lib/booking/billing";
import { getControlPlanePool, getTenantAttendantCount } from "@/lib/booking/db";
import { bookingUrls } from "@/lib/booking/provision";
import { planLimit, type PlanId, type Workspace } from "@/types/booking";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT w.id, w.slug, w.display_name, w.status, w.plan, w.attendant_limit, w.attendant_count,
            w.plan_expires_at, w.ea_base_url,
            d.db_host, d.db_name, d.db_user, d.db_password_enc
     FROM cp_workspaces w
     INNER JOIN cp_workspace_members m ON m.workspace_id = w.id
     LEFT JOIN cp_workspace_databases d ON d.workspace_id = w.id
     WHERE m.user_id = ? AND w.status != 'deleted'
     ORDER BY w.created_at DESC`,
    [user.id],
  );

  const workspaces: Workspace[] = [];
  for (const row of rows) {
    const plan = row.plan as PlanId;
    let attendantCount = Number(row.attendant_count ?? 0);
    if (row.db_name && row.db_user && row.db_password_enc) {
      attendantCount = await getTenantAttendantCount(
        String(row.db_name),
        String(row.db_host ?? "localhost"),
        String(row.db_user),
        String(row.db_password_enc),
      );
      await pool.query(
        "UPDATE cp_workspaces SET attendant_count = ? WHERE id = ?",
        [attendantCount, row.id],
      );
    }
    const urls = bookingUrls(String(row.slug));
    const billingOrders = await listBillingOrdersForWorkspace(Number(row.id));
    workspaces.push({
      id: Number(row.id),
      slug: String(row.slug),
      displayName: String(row.display_name),
      status: row.status,
      plan,
      attendantLimit: planLimit(plan),
      attendantCount,
      planExpiresAt: row.plan_expires_at ? String(row.plan_expires_at) : null,
      eaBaseUrl: urls.eaBaseUrl,
      bookingAdminUrl: urls.bookingAdminUrl,
      bookingPublicUrl: urls.bookingPublicUrl,
      billingOrders,
    });
  }

  return NextResponse.json({ user, workspaces });
}
