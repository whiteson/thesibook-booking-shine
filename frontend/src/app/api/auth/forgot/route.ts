import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getControlPlanePool } from "@/lib/booking/db";
import { sendPlatformMail } from "@/lib/booking/mail";

const GENERIC = {
  ok: true,
  message:
    "Αν υπάρχει λογαριασμός με αυτό το email, στάλθηκε σύνδεσμος επαναφοράς.",
};

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Συμπληρώστε ένα έγκυρο email" },
      { status: 400 },
    );
  }

  const pool = getControlPlanePool();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, name FROM cp_users WHERE email = ? LIMIT 1",
    [email],
  );
  const user = rows[0];

  if (!user) {
    return NextResponse.json(GENERIC);
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const userId = Number(user.id);

  await pool.query(
    "UPDATE cp_password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
    [userId],
  );
  await pool.query(
    `INSERT INTO cp_password_resets (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
    [userId, tokenHash],
  );

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010").replace(
    /\/$/,
    "",
  );
  const link = `${site}/reset-password?token=${token}`;
  const name = String(user.name || "").trim();

  await sendPlatformMail({
    to: String(user.email),
    subject: "Επαναφορά κωδικού ThesiBook",
    text: [
      name ? `Γεια σου ${name},` : "Γεια σου,",
      "",
      "Ζητήθηκε επαναφορά του κωδικού σου στο ThesiBook.",
      "Ο σύνδεσμος ισχύει για 1 ώρα και χρησιμοποιείται μία φορά:",
      link,
      "",
      "Αν δεν το ζήτησες εσύ, αγνόησε αυτό το μήνυμα.",
    ].join("\n"),
  });

  return NextResponse.json(GENERIC);
}
