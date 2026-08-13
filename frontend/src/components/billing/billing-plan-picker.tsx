"use client";

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { usePayPalReady } from "@/components/billing/paypal-provider";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/types/booking";

type UpgradePlan = "small" | "unlimited";

type Props = {
  workspaceId: number;
  currentPlan: PlanId;
  className?: string;
};

const UPGRADE_OPTIONS: Array<{
  plan: UpgradePlan;
  title: string;
  price: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    plan: "small",
    title: "Μικρό",
    price: "€84",
    features: [
      "Απεριόριστες κρατήσεις",
      "Admin panel",
      "Δημόσια σελίδα κρατήσεων",
    ],
    highlight: true,
  },
];

function PayPalSubscribeButton({
  workspaceId,
  plan,
  disabled,
}: {
  workspaceId: number;
  plan: UpgradePlan;
  disabled?: boolean;
}) {
  const paypalReady = usePayPalReady();

  if (disabled) {
    return (
      <p className="text-xs text-muted-foreground">Τρέχον πλάνο — ενεργό</p>
    );
  }

  if (!paypalReady) {
    return (
      <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Φόρτωση PayPal…
      </div>
    );
  }

  return (
    <PayPalSubscribeButtonInner workspaceId={workspaceId} plan={plan} />
  );
}

function PayPalSubscribeButtonInner({
  workspaceId,
  plan,
}: {
  workspaceId: number;
  plan: UpgradePlan;
}) {
  const router = useRouter();
  const [{ isPending }] = usePayPalScriptReducer();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const customIdRef = useRef<string | null>(null);

  if (isPending) {
    return (
      <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Φόρτωση PayPal…
      </div>
    );
  }

  return (
    <div className="relative">
      {processing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-card/90">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : null}
      {error ? (
        <p className="mb-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <PayPalButtons
        disabled={processing}
        style={{
          layout: "vertical",
          color: plan === "unlimited" ? "blue" : "gold",
          shape: "rect",
          label: "subscribe",
          height: 45,
          tagline: false,
        }}
        createSubscription={async (_, actions) => {
          setError(null);
          setProcessing(true);
          try {
            const res = await fetch("/api/billing/paypal/create-subscription", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ workspaceId, plan }),
            });
            const data = (await res.json()) as {
              paypalPlanId?: string;
              customId?: string;
              error?: string;
            };
            if (!res.ok || !data.paypalPlanId || !data.customId) {
              const msg = data.error ?? "Αποτυχία δημιουργίας συνδρομής";
              setError(msg);
              throw new Error(msg);
            }
            customIdRef.current = data.customId;
            const origin = window.location.origin;
            return actions.subscription.create({
              plan_id: data.paypalPlanId,
              custom_id: data.customId,
              application_context: {
                brand_name: "ThesiBook",
                locale: "el-GR",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
                return_url: `${origin}/dashboard?billing=success`,
                cancel_url: `${origin}/dashboard?billing=cancelled`,
              },
            });
          } finally {
            setProcessing(false);
          }
        }}
        onApprove={async (data) => {
          setProcessing(true);
          setError(null);
          try {
            const res = await fetch(
              "/api/billing/paypal/activate-subscription",
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  customId: customIdRef.current,
                }),
              },
            );
            const result = (await res.json()) as {
              ok?: boolean;
              error?: string;
              plan?: string;
            };
            if (!res.ok) {
              setError(result.error ?? "Αποτυχία ενεργοποίησης συνδρομής");
              return;
            }
            router.push(
              `/dashboard?billing=success&plan=${encodeURIComponent(result.plan ?? plan)}`,
            );
            router.refresh();
          } finally {
            setProcessing(false);
          }
        }}
        onCancel={() => {
          setError("Η πληρωμή ακυρώθηκε.");
        }}
        onError={(err) => {
          console.error("PayPal error", err);
          setError("Σφάλμα PayPal — δοκιμάστε ξανά ή άλλη κάρτα / λογαριασμό.");
        }}
      />
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        PayPal ή κάρτα μέσω PayPal · αυτόματη ανανέωση κάθε χρόνο
      </p>
    </div>
  );
}

export function BillingPlanPicker({
  workspaceId,
  currentPlan,
  className,
}: Props) {
  const visiblePlans = UPGRADE_OPTIONS.filter((opt) => {
    if (currentPlan === "free") return opt.plan === "small";
    return false;
  });

  if (currentPlan === "small" || currentPlan === "unlimited") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-green-200 bg-green-50/80 px-4 py-3 text-sm text-green-800",
          className,
        )}
      >
        Έχετε το απεριόριστο ετήσιο πλάνο — ανανεώνεται αυτόματα κάθε χρόνο.
      </div>
    );
  }

  if (visiblePlans.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold">Αναβάθμιση πλάνου</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ετήσια συνδρομή PayPal · αυτόματη ανανέωση κάθε χρόνο
        </p>
      </div>
      <div
        className={cn(
          "grid gap-4",
          visiblePlans.length > 1 ? "md:grid-cols-2" : "max-w-sm",
        )}
      >
        {visiblePlans.map((opt) => {
          const isCurrent =
            currentPlan !== "free" && opt.plan === currentPlan;

          return (
            <div
              key={opt.plan}
              className={cn(
                "flex flex-col rounded-2xl border p-5 shadow-sm",
                opt.highlight
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-lg font-bold">{opt.title}</h4>
                <p className="text-2xl font-bold text-primary">
                  {opt.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /έτος
                  </span>
                </p>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                {opt.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <PayPalSubscribeButton
                  workspaceId={workspaceId}
                  plan={opt.plan}
                  disabled={isCurrent}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
