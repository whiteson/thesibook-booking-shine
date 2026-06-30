"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";

type PayPalRuntimeConfig = {
  configured: boolean;
  clientId: string | null;
  mode: "sandbox" | "live";
  businessEmail: string;
};

type Props = {
  children: React.ReactNode;
};

export function PayPalProvider({ children }: Props) {
  const [config, setConfig] = useState<PayPalRuntimeConfig | null>(null);

  useEffect(() => {
    fetch("/api/billing/paypal/config")
      .then((res) => res.json())
      .then((data: PayPalRuntimeConfig) => setConfig(data))
      .catch(() =>
        setConfig({
          configured: false,
          clientId: null,
          mode: "sandbox",
          businessEmail: "johnbeazoglou@gmail.com",
        }),
      );
  }, []);

  if (!config) {
    return <>{children}</>;
  }

  if (!config.configured || !config.clientId) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: config.clientId,
        currency: "EUR",
        intent: "capture",
        locale: "el_GR",
        components: "buttons",
        enableFunding: "card,venmo",
        disableFunding: "paylater,credit",
        dataPageType: "checkout",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}

export function PayPalSetupNotice() {
  const [config, setConfig] = useState<PayPalRuntimeConfig | null>(null);

  useEffect(() => {
    fetch("/api/billing/paypal/config")
      .then((res) => res.json())
      .then((data: PayPalRuntimeConfig) => setConfig(data))
      .catch(() => null);
  }, []);

  if (!config || config.configured) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">PayPal δεν είναι ρυθμισμένο ακόμα</p>
      <p className="mt-1 text-amber-800">
        Προσθέστε <code className="text-xs">PAYPAL_CLIENT_ID</code>,{" "}
        <code className="text-xs">PAYPAL_CLIENT_SECRET</code> και{" "}
        <code className="text-xs">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> στο{" "}
        <code className="text-xs">frontend/.env.local</code> (λογαριασμός{" "}
        {config.businessEmail}).
      </p>
    </div>
  );
}

export function PayPalModeBadge() {
  const [mode, setMode] = useState<"sandbox" | "live" | null>(null);

  useEffect(() => {
    fetch("/api/billing/paypal/config")
      .then((res) => res.json())
      .then((data: PayPalRuntimeConfig) => setMode(data.mode))
      .catch(() => null);
  }, []);

  if (!mode || mode === "live") return null;

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      PayPal Sandbox — δοκιμαστικές πληρωμές
    </span>
  );
}
