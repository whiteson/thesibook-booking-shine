import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getSessionUser } from "@/lib/booking/auth";
import { getControlPlanePool } from "@/lib/booking/db";
import { createBookingSsoToken } from "@/lib/booking/sso";
import { bookingUrls } from "@/lib/booking/provision";

function siteOrigin(request: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "";
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = siteOrigin(request);
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
    return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
  }

  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT w.id, w.status
     FROM cp_workspaces w
     INNER JOIN cp_workspace_members m ON m.workspace_id = w.id
     WHERE m.user_id = ? AND w.slug = ? AND w.status != 'deleted'
     LIMIT 1`,
    [user.id, slug],
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  if (rows[0].status !== "active") {
    return NextResponse.redirect(
      new URL(
        `/dashboard?booking=pending&workspace=${encodeURIComponent(slug)}`,
        origin,
      ),
    );
  }

  const token = await createBookingSsoToken(user.email, slug);
  const { eaBaseUrl } = bookingUrls(slug);
  const target = new URL(`${eaBaseUrl}/index.php/thesibook_sso/consume`);
  target.searchParams.set("thesibook_tenant", slug);
  target.searchParams.set("token", token);

  return NextResponse.redirect(target.toString());
}
