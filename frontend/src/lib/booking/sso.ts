import { SignJWT } from "jose";

const SSO_TTL_SECONDS = 120;

function secretKey(): Uint8Array {
  const secret = process.env.BOOKING_JWT_SECRET ?? "dev-thesibook-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function createBookingSsoToken(
  email: string,
  workspaceSlug: string,
): Promise<string> {
  return new SignJWT({
    email: email.toLowerCase(),
    slug: workspaceSlug,
    purpose: "ea_admin_sso",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SSO_TTL_SECONDS}s`)
    .sign(secretKey());
}

export function bookingAdminSsoPath(workspaceSlug: string): string {
  return `/api/booking/admin?slug=${encodeURIComponent(workspaceSlug)}`;
}
