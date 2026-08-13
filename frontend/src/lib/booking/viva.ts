/**
 * Viva.com Smart Checkout — yearly plans with allowRecurring for auto-renew.
 * @see https://developer.viva.com/smart-checkout/smart-checkout-integration
 * @see https://developer.viva.com/tutorials/payments/create-a-recurring-payment/
 */

export type VivaMode = "demo" | "live";

export type VivaConfig = {
  mode: VivaMode;
  clientId: string;
  clientSecret: string;
  sourceCode: string;
};

export type VivaPublicConfig = {
  configured: boolean;
  mode: VivaMode;
};

export function isVivaConfigured(): boolean {
  return Boolean(process.env.VIVA_CLIENT_ID && process.env.VIVA_CLIENT_SECRET);
}

export function getVivaConfig(): VivaConfig {
  const clientId = process.env.VIVA_CLIENT_ID ?? "";
  const clientSecret = process.env.VIVA_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) {
    throw new Error(
      "Viva not configured — set VIVA_CLIENT_ID and VIVA_CLIENT_SECRET",
    );
  }
  return {
    mode: process.env.VIVA_MODE === "demo" ? "demo" : "live",
    clientId,
    clientSecret,
    sourceCode: process.env.VIVA_SOURCE_CODE ?? "0000",
  };
}

export function getPublicVivaConfig(): VivaPublicConfig {
  return {
    configured: isVivaConfigured(),
    mode: process.env.VIVA_MODE === "demo" ? "demo" : "live",
  };
}

function accountsBase(mode: VivaMode): string {
  return mode === "demo"
    ? "https://demo-accounts.vivapayments.com"
    : "https://accounts.vivapayments.com";
}

function apiBase(mode: VivaMode): string {
  return mode === "demo"
    ? "https://demo-api.vivapayments.com"
    : "https://api.vivapayments.com";
}

function checkoutBase(mode: VivaMode): string {
  return mode === "demo"
    ? "https://demo.vivapayments.com"
    : "https://www.vivapayments.com";
}

let cachedToken: { token: string; expiresAt: number; mode: VivaMode } | null =
  null;

export async function getVivaAccessToken(config: VivaConfig): Promise<string> {
  if (
    cachedToken &&
    cachedToken.mode === config.mode &&
    cachedToken.expiresAt > Date.now() + 30_000
  ) {
    return cachedToken.token;
  }

  const basic = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
  ).toString("base64");

  const res = await fetch(`${accountsBase(config.mode)}/connect/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Viva OAuth failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    mode: config.mode,
  };
  return data.access_token;
}

export function vivaCheckoutUrl(orderCode: string): string {
  const mode = process.env.VIVA_MODE === "demo" ? "demo" : "live";
  return `${checkoutBase(mode)}/web/checkout?ref=${encodeURIComponent(orderCode)}`;
}

export async function createVivaPaymentOrder(params: {
  amountCents: number;
  merchantTrns: string;
  customerTrns: string;
  email: string;
  fullName: string;
  successUrl: string;
  failUrl: string;
}): Promise<{ orderCode: string }> {
  const config = getVivaConfig();
  const token = await getVivaAccessToken(config);

  const res = await fetch(`${apiBase(config.mode)}/checkout/v2/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountCents,
      customerTrns: params.customerTrns,
      merchantTrns: params.merchantTrns,
      sourceCode: config.sourceCode,
      allowRecurring: true,
      paymentTimeout: 1800,
      customer: {
        email: params.email,
        fullName: params.fullName,
        countryCode: "GR",
        requestLang: "el-GR",
      },
      successUrl: params.successUrl,
      failureUrl: params.failUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`Viva create order failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { orderCode: number | string };
  return { orderCode: String(data.orderCode) };
}

export type VivaTransaction = {
  statusId: string;
  amount: number;
  orderCode?: string | number;
  email?: string;
  transactionId?: string;
};

export async function getVivaTransaction(
  transactionId: string,
): Promise<VivaTransaction> {
  const config = getVivaConfig();
  const token = await getVivaAccessToken(config);
  const res = await fetch(
    `${apiBase(config.mode)}/checkout/v2/transactions/${transactionId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(`Viva get transaction failed (${res.status})`);
  }
  return (await res.json()) as VivaTransaction;
}

export function isVivaTransactionPaid(statusId: string): boolean {
  return statusId === "F" || statusId === "f";
}

export async function createVivaRecurringCharge(params: {
  parentTransactionId: string;
  amountCents: number;
  merchantTrns: string;
  customerTrns: string;
}): Promise<{ transactionId: string; statusId?: string }> {
  const config = getVivaConfig();
  const token = await getVivaAccessToken(config);
  const res = await fetch(
    `${checkoutBase(config.mode)}/api/transactions/${params.parentTransactionId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amountCents,
        merchantTrns: params.merchantTrns,
        customerTrns: params.customerTrns,
        sourceCode: config.sourceCode,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(
      `Viva recurring charge failed (${res.status}): ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    transactionId?: string;
    TransactionId?: string;
    statusId?: string;
  };
  return {
    transactionId: String(data.transactionId ?? data.TransactionId ?? ""),
    statusId: data.statusId,
  };
}
