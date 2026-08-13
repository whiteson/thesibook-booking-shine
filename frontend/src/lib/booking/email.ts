import { promises as dns } from "node:dns";

const EMAIL_FORMAT =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.org",
  "test.com",
  "localhost",
  "invalid",
]);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function formatError(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

export function validateEmailFormat(email: string): { ok: true; email: string } | { ok: false; error: string } {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return formatError("Το email είναι υποχρεωτικό");
  }
  if (normalized.length > 254) {
    return formatError("Το email είναι πολύ μακρύ");
  }
  if (!EMAIL_FORMAT.test(normalized)) {
    return formatError("Μη έγκυρη διεύθυνση email");
  }

  const at = normalized.lastIndexOf("@");
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);

  if (!local || !domain || local.length > 64) {
    return formatError("Μη έγκυρη διεύθυνση email");
  }
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return formatError("Μη έγκυρη διεύθυνση email");
  }
  if (domain.startsWith("-") || domain.endsWith("-") || domain.includes("..")) {
    return formatError("Μη έγκυρη διεύθυνση email");
  }
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2) {
    return formatError("Μη έγκυρη διεύθυνση email");
  }
  if (BLOCKED_DOMAINS.has(domain)) {
    return formatError("Χρησιμοποιήστε πραγματικό email (όχι test/example)");
  }

  return { ok: true, email: normalized };
}

async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const mx = await dns.resolveMx(domain);
    return mx.length > 0;
  } catch {
    try {
      const a = await dns.resolve4(domain);
      return a.length > 0;
    } catch {
      return false;
    }
  }
}

export async function validateRegistrationEmail(
  email: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const format = validateEmailFormat(email);
  if (!format.ok) return format;

  const domain = format.email.split("@")[1] ?? "";
  const strictMx = process.env.BOOKING_STRICT_EMAIL_MX !== "false";
  if (strictMx) {
    const reachable = await hasMxRecords(domain);
    if (!reachable) {
      return formatError(
        "Το domain του email δεν δέχεται email (έλεγχος MX). Χρησιμοποιήστε έγκυρο email.",
      );
    }
  }

  return { ok: true, email: format.email };
}
