import type { PlanId } from "@/types/booking";

export function planAmountCents(planId: "small" | "unlimited"): number {
  if (planId === "small") return 8400;
  return 18000;
}

export function planAmountEur(planId: "small" | "unlimited"): string {
  return (planAmountCents(planId) / 100).toFixed(2);
}

export function planLabel(planId: "small" | "unlimited"): string {
  return planId === "small"
    ? "ThesiBook Μικρό πλάνο (€84/έτος)"
    : "ThesiBook Απεριόριστο πλάνο (€180/έτος)";
}

export function planLimitFromId(planId: PlanId): number {
  if (planId === "free") return 5;
  return Number.MAX_SAFE_INTEGER;
}
