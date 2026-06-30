import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/booking/auth";
import { getControlPlanePool } from "@/lib/booking/db";
import {
  bookingUrls,
  ensureUniqueSlug,
  provisionWorkspace,
  slugify,
  syncWorkspaceProvisioning,
} from "@/lib/booking/provision";
import { planLimit } from "@/types/booking";
import type { RegisterPayload } from "@/types/booking";

export async function POST(request: Request) {
  let body: RegisterPayload;
  try {
    body = (await request.json()) as RegisterPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, password, companyName, slug: requestedSlug } = body;
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Συμπληρώστε όνομα, email και κωδικό (min 8 χαρακτήρες)" },
      { status: 400 },
    );
  }
  if (!companyName?.trim()) {
    return NextResponse.json(
      { error: "Συμπληρώστε το όνομα της επιχείρησης" },
      { status: 400 },
    );
  }

  const pool = getControlPlanePool();
  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM cp_users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Υπάρχει ήδη λογαριασμός με αυτό το email" },
      { status: 409 },
    );
  }

  const slug = requestedSlug
    ? slugify(requestedSlug)
    : await ensureUniqueSlug(companyName);

  const [slugTaken] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM cp_workspaces WHERE slug = ? LIMIT 1",
    [slug],
  );
  if (slugTaken.length > 0) {
    return NextResponse.json(
      { error: "Το workspace URL είναι ήδη σε χρήση" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const [userResult] = await pool.query<ResultSetHeader>(
    `INSERT INTO cp_users (email, password_hash, name) VALUES (?, ?, ?)`,
    [email.trim().toLowerCase(), passwordHash, name.trim()],
  );
  const userId = userResult.insertId;

  const urls = bookingUrls(slug);
  const limit = planLimit("free");

  const [wsResult] = await pool.query<ResultSetHeader>(
    `INSERT INTO cp_workspaces
      (slug, display_name, status, plan, attendant_limit, owner_user_id, ea_base_url)
     VALUES (?, ?, 'provisioning', 'free', ?, ?, ?)`,
    [slug, companyName.trim(), limit, userId, urls.eaBaseUrl],
  );
  const workspaceId = wsResult.insertId;

  await pool.query(
    `INSERT INTO cp_workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')`,
    [workspaceId, userId],
  );

  try {
    await provisionWorkspace({
      slug,
      displayName: companyName.trim(),
      adminEmail: email.trim().toLowerCase(),
      adminPassword: password,
    });

    const meta = await import("node:fs/promises").then((fs) =>
      fs.readFile(
        `${process.cwd()}/../book/tenants/${slug}/meta.json`,
        "utf8",
      ),
    );
    const parsed = JSON.parse(meta) as {
      db_host: string;
      db_name: string;
      db_user: string;
      db_password: string;
    };

    await pool.query(
      `INSERT INTO cp_workspace_databases
        (workspace_id, db_host, db_name, db_user, db_password_enc)
       VALUES (?, ?, ?, ?, ?)`,
      [
        workspaceId,
        parsed.db_host,
        parsed.db_name,
        parsed.db_user,
        parsed.db_password,
      ],
    );

    await syncWorkspaceProvisioning(workspaceId, "active");
    await pool.query(
      "UPDATE cp_workspaces SET status = 'active' WHERE id = ?",
      [workspaceId],
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provisioning failed";
    await syncWorkspaceProvisioning(workspaceId, "failed", message);
    return NextResponse.json(
      { error: `Αποτυχία δημιουργίας booking: ${message}` },
      { status: 500 },
    );
  }

  const token = await createSessionToken({
    id: userId,
    email: email.trim().toLowerCase(),
    name: name.trim(),
  });
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    workspace: {
      slug,
      displayName: companyName.trim(),
      plan: "free",
      ...urls,
    },
  });
}
