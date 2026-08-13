export type PlanId = "free" | "small" | "unlimited";

export type WorkspaceStatus =
  | "pending"
  | "provisioning"
  | "active"
  | "suspended"
  | "deleted";

export type PlatformUser = {
  id: number;
  email: string;
  name: string;
};

export type Workspace = {
  id: number;
  slug: string;
  displayName: string;
  status: WorkspaceStatus;
  plan: PlanId;
  attendantLimit: number;
  attendantCount: number;
  planExpiresAt: string | null;
  eaBaseUrl: string;
  bookingAdminUrl: string;
  bookingPublicUrl: string;
  billingOrders: BillingOrderSummary[];
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  slug?: string;
};

export type PlanInfo = {
  id: PlanId;
  nameEl: string;
  priceEur: number;
  maxAttendants: number | null;
};

export type BillingOrderSummary = {
  id: number;
  planId: "small" | "unlimited";
  amountCents: number;
  status: string;
  paymentProvider: string;
  paidAt: string | null;
  createdAt: string;
};

export const PLANS: PlanInfo[] = [
  { id: "free", nameEl: "Δωρεάν", priceEur: 0, maxAttendants: 5 },
  { id: "small", nameEl: "Μικρή", priceEur: 84, maxAttendants: null },
  { id: "unlimited", nameEl: "Απεριόριστη", priceEur: 180, maxAttendants: null },
];

export const BILLING_INTERVAL_DAYS = 365;

export function planLimit(plan: PlanId): number {
  if (plan === "free") return 5;
  return Number.MAX_SAFE_INTEGER;
}
