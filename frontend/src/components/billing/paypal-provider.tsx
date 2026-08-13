"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const PayPalReadyContext = createContext(false);

export function usePayPalReady(): boolean {
  return useContext(PayPalReadyContext);
}

type PayPalRuntimeConfig = {
  configured: boolean;
  clientId: string | null;
  mode: "sandbox" | "live";
  businessEmail: string;
};

type Props = {
  children: ReactNode;
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
          businessEmail: "johnbeazoglous@gmail.com",
        }),
      );
  }, []);

  if (!config || !config.configured || !config.clientId) {
    return (
      <PayPalReadyContext.Provider value={false}>
        {children}
      </PayPalReadyContext.Provider>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: config.clientId,
        currency: "EUR",
        intent: "subscription",
        vault: true,
        locale: "el_GR",
        components: "buttons",
        enableFunding: "card",
        disableFunding: "paylater,credit,venmo",
        dataPageType: "checkout",
      }}
    >
      <PayPalReadyContext.Provider value={true}>
        {children}
      </PayPalReadyContext.Provider>
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
