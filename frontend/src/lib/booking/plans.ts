import type { PlanId } from "@/types/booking";

export function planAmountCents(planId: "small" | "unlimited"): number {
  if (planId === "small") return 700;
  return 1500;
}

export function planAmountEur(planId: "small" | "unlimited"): string {
  return (planAmountCents(planId) / 100).toFixed(2);
}

export function planLabel(planId: "small" | "unlimited"): string {
  return planId === "small"
    ? "ThesiBook Μικρό πλάνο (€7/μήνα)"
    : "ThesiBook Απεριόριστο πλάνο (€15/μήνα)";
}

export function planLimitFromId(planId: PlanId): number {
  if (planId === "free") return 5;
  if (planId === "small") return 10;
  return Number.MAX_SAFE_INTEGER;
}
