import { NextResponse } from "next/server";
import path from "node:path";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/booking/auth";
import { getControlPlanePool } from "@/lib/booking/db";
import {
  claimPoolSlot,
  countAvailablePoolSlots,
  disablePoolSlot,
  releasePoolSlot,
  isPoolProvisionMode,
} from "@/lib/booking/db-pool";
import { validateRegistrationEmail } from "@/lib/booking/email";
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
  if (!name?.trim() || !password || password.length < 8) {
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

  const emailCheck = await validateRegistrationEmail(email ?? "");
  if (!emailCheck.ok) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }
  const normalizedEmail = emailCheck.email;

  let pool;
  try {
    pool = getControlPlanePool();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database not configured";
    console.error("[register] pool:", message);
    return NextResponse.json(
      { error: "Η βάση δεδομένων δεν είναι ρυθμισμένη. Επικοινωνήστε με την υποστήριξη." },
      { status: 503 },
    );
  }

  if (isPoolProvisionMode()) {
    const available = await countAvailablePoolSlots();
    if (available === 0) {
      return NextResponse.json(
        {
          error:
            "Δεν υπάρχουν διαθέσιμα booking slots αυτή τη στιγμή. Δοκιμάστε αργότερα ή επικοινωνήστε μαζί μας.",
        },
        { status: 503 },
      );
    }
  }

  try {
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM cp_users WHERE email = ? LIMIT 1",
      [normalizedEmail],
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
      [normalizedEmail, passwordHash, name.trim()],
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

    const bookRoot = process.env.BOOK_ROOT ?? path.join(process.cwd(), "../book");
    let poolSlot: Awaited<ReturnType<typeof claimPoolSlot>> | undefined;

    try {
      if (isPoolProvisionMode()) {
        poolSlot = await claimPoolSlot(workspaceId);
      }

      await provisionWorkspace(
        {
          slug,
          displayName: companyName.trim(),
          adminEmail: normalizedEmail,
          adminPassword: password,
        },
        poolSlot,
      );

      const dbRecord = poolSlot
        ? {
            db_host: poolSlot.db_host,
            db_name: poolSlot.db_name,
            db_user: poolSlot.db_user,
            db_password: poolSlot.db_password_enc,
          }
        : JSON.parse(
            await import("node:fs/promises").then((fs) =>
              fs.readFile(`${bookRoot}/tenants/${slug}/meta.json`, "utf8"),
            ),
          ) as {
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
          dbRecord.db_host,
          dbRecord.db_name,
          dbRecord.db_user,
          dbRecord.db_password,
        ],
      );

      await syncWorkspaceProvisioning(workspaceId, "active");
      await pool.query(
        "UPDATE cp_workspaces SET status = 'active' WHERE id = ?",
        [workspaceId],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Provisioning failed";
      console.error("[register] provision:", message);
      if (poolSlot) {
        if (/already exist|duplicate|corrupt/i.test(message)) {
          await disablePoolSlot(poolSlot.id, message);
        } else {
          await releasePoolSlot(poolSlot.id, message);
        }
      }
      await syncWorkspaceProvisioning(workspaceId, "failed", message);
      await pool.query(
        "UPDATE cp_workspaces SET status = 'pending' WHERE id = ?",
        [workspaceId],
      );
    }

    const token = await createSessionToken({
      id: userId,
      email: normalizedEmail,
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
  } catch (err) {
    console.error("[register]", err);
    const message = err instanceof Error ? err.message : "Registration failed";
    if (
      message.includes("cp_users") ||
      message.includes("ECONNREFUSED") ||
      message.includes("Access denied")
    ) {
      return NextResponse.json(
        {
          error:
            "Η πλατφόρμα booking δεν έχει ρυθμιστεί ακόμα στο server (βάση δεδομένων).",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
