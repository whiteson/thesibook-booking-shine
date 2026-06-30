"use client";

import { BillingHistory } from "@/components/billing/billing-history";
import { BillingPlanPicker } from "@/components/billing/billing-plan-picker";
import {
  PayPalModeBadge,
  PayPalSetupNotice,
} from "@/components/billing/paypal-provider";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlatformUser, Workspace } from "@/types/booking";
import { PLANS } from "@/types/booking";

function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DashboardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingNotice, setBillingNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    const billing = searchParams.get("billing");
    const plan = searchParams.get("plan");
    if (billing === "success") {
      const planName = plan
        ? PLANS.find((p) => p.id === plan)?.nameEl ?? plan
        : null;
      setBillingNotice({
        type: "success",
        message: planName
          ? `Η πληρωμή ολοκληρώθηκε — ενεργοποιήθηκε το πλάνο «${planName}» για 30 ημέρες.`
          : "Η πληρωμή ολοκληρώθηκε — το πλάνο σας ενημερώθηκε.",
      });
    } else if (billing === "failed" || billing === "cancelled") {
      setBillingNotice({
        type: "error",
        message: "Η πληρωμή ακυρώθηκε ή απέτυχε.",
      });
    } else if (billing === "pending") {
      setBillingNotice({
        type: "info",
        message: "Η πληρωμή είναι σε εκκρεμότητα.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = (await res.json()) as {
          user: PlatformUser;
          workspaces: Workspace[];
        };
        setUser(data.user);
        setWorkspaces(data.workspaces);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
        <p className="text-muted-foreground">Φόρτωση…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold text-primary">
            ThesiBook
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <PayPalModeBadge />
            <span className="text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Αποσύνδεση
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">Το dashboard σας</h1>
        <p className="mt-2 text-muted-foreground">
          Διαχειριστείτε το booking workspace και αναβαθμίστε με PayPal.
        </p>

        <div className="mt-4">
          <PayPalSetupNotice />
        </div>

        {billingNotice ? (
          <p
            className={cn(
              "mt-4 rounded-xl border px-4 py-3 text-sm",
              billingNotice.type === "success" &&
                "border-green-200 bg-green-50 text-green-900",
              billingNotice.type === "error" &&
                "border-red-200 bg-red-50 text-red-900",
              billingNotice.type === "info" &&
                "border-border bg-card text-foreground",
            )}
            role="status"
          >
            {billingNotice.message}
          </p>
        ) : null}

        {workspaces.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
            <p>Δεν βρέθηκε workspace.</p>
            <Link href="/register" className="mt-4 inline-block text-primary">
              Δημιουργία workspace
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {workspaces.map((ws) => {
              const plan = PLANS.find((p) => p.id === ws.plan);
              const atLimit =
                ws.plan !== "unlimited" &&
                ws.attendantCount >= ws.attendantLimit;
              const expiry = formatExpiry(ws.planExpiresAt);

              return (
                <article
                  key={ws.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{ws.displayName}</h2>
                      <p className="text-sm text-muted-foreground">/{ws.slug}</p>
                      <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                        {plan?.nameEl ?? ws.plan} —{" "}
                        {plan?.priceEur === 0
                          ? "Δωρεάν"
                          : `€${plan?.priceEur}/μήνα`}
                      </span>
                      {expiry && ws.plan !== "free" ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Ενεργό έως {expiry}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={
                        ws.status === "active"
                          ? "text-sm font-medium text-green-600"
                          : "text-sm text-amber-600"
                      }
                    >
                      {ws.status === "active" ? "Ενεργό" : ws.status}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm">
                      <span>Κρατήσεις (attendants)</span>
                      <span className="font-medium">
                        {ws.attendantCount}
                        {ws.plan !== "unlimited"
                          ? ` / ${ws.attendantLimit}`
                          : ""}
                      </span>
                    </div>
                    {ws.plan !== "unlimited" ? (
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-brand transition-all"
                          style={{
                            width: `${Math.min(100, (ws.attendantCount / ws.attendantLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    ) : null}
                    {atLimit ? (
                      <p className="mt-2 text-sm text-coral">
                        Φτάσατε το όριο του πλάνου. Αναβαθμίστε για περισσότερες
                        κρατήσεις.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-8">
                    <BillingPlanPicker
                      workspaceId={ws.id}
                      currentPlan={ws.plan}
                    />
                  </div>

                  <BillingHistory orders={ws.billingOrders} />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={ws.bookingAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "default" }))}
                    >
                      Διαχείριση booking
                    </a>
                    <a
                      href={ws.bookingPublicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Δημόσια σελίδα κρατήσεων
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="font-semibold">Πληρωμές με PayPal</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Δωρεάν — έως 5 κρατήσεις</li>
            <li>Μικρό €7/μήνα — PayPal ή κάρτα</li>
            <li>Απεριόριστο €15/μήνα — PayPal ή κάρτα</li>
            <li>30 ημέρες πρόσβαση ανά πληρωμή · ανανέωση από το dashboard</li>
            <li>Λογαριασμός: johnbeazoglou@gmail.com</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
