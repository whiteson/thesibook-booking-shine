"use client";

import type { BillingOrderSummary } from "@/types/booking";
import { PLANS } from "@/types/booking";

type Props = {
  orders: BillingOrderSummary[];
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Πληρώθηκε",
  pending: "Εκκρεμεί",
  failed: "Απέτυχε",
  cancelled: "Ακυρώθηκε",
};

export function BillingHistory({ orders }: Props) {
  if (orders.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <h4 className="text-sm font-semibold">Πρόσφατες πληρωμές</h4>
      <ul className="mt-3 space-y-2">
        {orders.map((order) => {
          const plan = PLANS.find((p) => p.id === order.planId);
          const date = order.paidAt ?? order.createdAt;
          const formatted = new Date(date).toLocaleDateString("el-GR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
            >
              <span>
                {plan?.nameEl ?? order.planId} — €
                {(order.amountCents / 100).toFixed(2)}
              </span>
              <span className="text-muted-foreground">
                {formatted} · {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
