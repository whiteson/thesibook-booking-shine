import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/booking/auth";
import { getControlPlanePool } from "@/lib/booking/db";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  if (!email || !password) {
    return NextResponse.json({ error: "Email και κωδικός απαιτούνται" }, { status: 400 });
  }

  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, name, password_hash FROM cp_users WHERE email = ? LIMIT 1",
    [email],
  );
  const user = rows[0];
  if (!user || !(await verifyPassword(password, String(user.password_hash)))) {
    return NextResponse.json({ error: "Λάθος email ή κωδικός" }, { status: 401 });
  }

  const token = await createSessionToken({
    id: Number(user.id),
    email: String(user.email),
    name: String(user.name),
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
