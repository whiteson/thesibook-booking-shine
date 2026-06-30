import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import { getControlPlanePool } from "./db";

const execFileAsync = promisify(execFile);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  const pool = getControlPlanePool();
  const slug = slugify(base);
  let attempt = 0;
  while (attempt < 20) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM cp_workspaces WHERE slug = ? LIMIT 1",
      [candidate],
    );
    if (rows.length === 0) return candidate;
    attempt += 1;
  }
  return `${slug}-${Date.now()}`;
}

export async function provisionWorkspace(params: {
  slug: string;
  displayName: string;
  adminEmail: string;
  adminPassword: string;
}): Promise<void> {
  const root = path.resolve(process.cwd(), "..");
  const script = path.join(
    root,
    "services/booking/scripts/provision-tenant.sh",
  );

  await execFileAsync(script, [
    params.slug,
    "",
    params.displayName,
    params.adminEmail,
    params.adminPassword,
  ], {
    cwd: root,
    env: { ...process.env, PATH: process.env.PATH },
    timeout: 120_000,
  });
}

export function bookingUrls(slug: string) {
  const eaBase =
    process.env.NEXT_PUBLIC_EA_BASE_URL ?? "http://127.0.0.1:8090";
  const q = `thesibook_tenant=${encodeURIComponent(slug)}`;
  return {
    eaBaseUrl: eaBase,
    bookingAdminUrl: `${eaBase}/index.php/backend?${q}`,
    bookingPublicUrl: `${eaBase}/?${q}`,
  };
}

export async function syncWorkspaceProvisioning(
  workspaceId: number,
  status: "provisioning" | "active" | "failed",
  error?: string,
): Promise<void> {
  const pool = getControlPlanePool();
  await pool.query(
    "UPDATE cp_workspaces SET status = ?, updated_at = NOW() WHERE id = ?",
    [status === "failed" ? "pending" : status, workspaceId],
  );
  await pool.query(
    `INSERT INTO cp_provisioning_jobs (workspace_id, step, status, error_message, finished_at)
     VALUES (?, 'provision', ?, ?, NOW())`,
    [workspaceId, status === "failed" ? "failed" : "done", error ?? null],
  );
}
