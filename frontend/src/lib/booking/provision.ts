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

export async function provisionWorkspace(
  params: {
    slug: string;
    displayName: string;
    adminEmail: string;
    adminPassword: string;
  },
  poolSlot?: {
    db_host: string;
    db_name: string;
    db_user: string;
    db_password_enc: string;
  },
): Promise<void> {
  const root = path.resolve(process.cwd(), "..");
  const bookRoot = process.env.BOOK_ROOT ?? path.join(root, "book");
  const script = path.join(
    root,
    "services/booking/scripts/provision-tenant.sh",
  );
  const mode = process.env.EA_PROVISION_MODE ?? "separate";

  await execFileAsync(
    script,
    [
      params.slug,
      "",
      params.displayName,
      params.adminEmail,
      params.adminPassword,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        PATH: process.env.PATH,
        BOOK_ROOT: bookRoot,
        EA_PROVISION_MODE: mode,
        EA_BASE_URL: process.env.EA_BASE_URL ?? process.env.NEXT_PUBLIC_EA_BASE_URL,
        EA_DB_HOST: process.env.EA_DB_HOST ?? process.env.BOOKING_DB_HOST,
        EA_DB_USER: process.env.EA_DB_USER ?? process.env.BOOKING_DB_USER,
        EA_DB_PASSWORD:
          process.env.EA_DB_PASSWORD ?? process.env.BOOKING_DB_PASSWORD,
        EA_SHARED_DB_NAME:
          process.env.EA_SHARED_DB_NAME ?? process.env.BOOKING_DB_NAME,
        EA_POOL_DB_HOST: poolSlot?.db_host,
        EA_POOL_DB_NAME: poolSlot?.db_name,
        EA_POOL_DB_USER: poolSlot?.db_user,
        EA_POOL_DB_PASSWORD: poolSlot?.db_password_enc,
        BOOKING_DB_NAME: process.env.BOOKING_DB_NAME,
        BOOKING_DB_USER: process.env.BOOKING_DB_USER,
        BOOKING_DB_PASSWORD: process.env.BOOKING_DB_PASSWORD,
        EA_SYNC_ADMIN: "1",
      },
      timeout: 180_000,
    },
  );
}

import { bookingAdminSsoPath } from "@/lib/booking/sso";

export function bookingUrls(slug: string) {
  const eaBase =
    process.env.EA_BASE_URL ??
    process.env.NEXT_PUBLIC_EA_BASE_URL ??
    "http://127.0.0.1:8090";
  const q = `thesibook_tenant=${encodeURIComponent(slug)}`;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000";
  return {
    eaBaseUrl: eaBase,
    bookingAdminUrl: `${siteUrl.replace(/\/$/, "")}${bookingAdminSsoPath(slug)}`,
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
