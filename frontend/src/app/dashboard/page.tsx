import { Suspense } from "react";
import { PayPalProvider } from "@/components/billing/paypal-provider";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Dashboard | ThesiBook",
};

export default function DashboardPage() {
  return (
    <PayPalProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
            <p className="text-muted-foreground">Φόρτωση…</p>
          </div>
        }
      >
        <DashboardView />
      </Suspense>
    </PayPalProvider>
  );
}
