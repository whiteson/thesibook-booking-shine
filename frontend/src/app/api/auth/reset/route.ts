import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { hashPassword } from "@/lib/booking/auth";
import { getControlPlanePool } from "@/lib/booking/db";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = (await request.json()) as { token?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = body.token?.trim() ?? "";
  const password = body.password ?? "";

  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "Ο σύνδεσμος δεν είναι έγκυρος ή ο κωδικός είναι μικρός (min 8)." },
      { status: 400 },
    );
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, user_id
     FROM cp_password_resets
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );
  const reset = rows[0];

  if (!reset) {
    return NextResponse.json(
      { error: "Ο σύνδεσμος δεν είναι έγκυρος ή έχει λήξει." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);
  await pool.query("UPDATE cp_users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    reset.user_id,
  ]);
  await pool.query(
    "UPDATE cp_password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
    [reset.user_id],
  );

  return NextResponse.json({ ok: true });
}
