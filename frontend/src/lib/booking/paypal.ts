/**
 * PayPal Checkout (Orders v2) — plan upgrades for ThesiBook.
 * @see https://developer.paypal.com/docs/checkout/
 * @see https://developer.paypal.com/docs/api/webhooks/v1/
 */

export type PayPalMode = "sandbox" | "live";

export type PayPalConfig = {
  mode: PayPalMode;
  clientId: string;
  clientSecret: string;
  businessEmail: string;
  webhookId: string | null;
};

export type PayPalPublicConfig = {
  configured: boolean;
  clientId: string | null;
  mode: PayPalMode;
  businessEmail: string;
};

export function getPayPalConfig(): PayPalConfig {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET ?? "";
  const mode: PayPalMode =
    process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in frontend/.env.local",
    );
  }

  return {
    mode,
    clientId,
    clientSecret,
    businessEmail:
      process.env.PAYPAL_BUSINESS_EMAIL ?? "johnbeazoglou@gmail.com",
    webhookId: process.env.PAYPAL_WEBHOOK_ID ?? null,
  };
}

export function getPublicPayPalConfig(): PayPalPublicConfig {
  const clientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ??
    process.env.PAYPAL_CLIENT_ID ??
    null;
  const mode: PayPalMode =
    process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";

  return {
    configured: Boolean(clientId && process.env.PAYPAL_CLIENT_SECRET),
    clientId,
    mode,
    businessEmail:
      process.env.PAYPAL_BUSINESS_EMAIL ?? "johnbeazoglou@gmail.com",
  };
}

function apiBase(mode: PayPalMode): string {
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { token: string; expiresAt: number; mode: PayPalMode } | null =
  null;

export async function getPayPalAccessToken(
  config: PayPalConfig,
): Promise<string> {
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

  const res = await fetch(`${apiBase(config.mode)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(
      `PayPal OAuth failed (${res.status}): ${await res.text()}`,
    );
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

/** User-facing Greek message from PayPal API error JSON */
export function parsePayPalError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as {
      message?: string;
      details?: Array<{ issue?: string; description?: string }>;
    };
    const detail = parsed.details?.[0];
    if (detail?.issue === "INSTRUMENT_DECLINED") {
      return "Η κάρτα ή ο λογαριασμός PayPal απορρίφθηκε. Δοκιμάστε άλλο τρόπο πληρωμής.";
    }
    if (detail?.description) return detail.description;
    if (parsed.message) return parsed.message;
  } catch {
    /* not JSON */
  }
  if (raw.includes("INSTRUMENT_DECLINED")) {
    return "Η πληρωμή απορρίφθηκε. Δοκιμάστε ξανά ή χρησιμοποιήστε άλλη κάρτα.";
  }
  return "Σφάλμα PayPal — δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.";
}

export async function createPayPalOrder(params: {
  amountEur: string;
  description: string;
  merchantTrns: string;
  siteUrl: string;
  workspaceSlug: string;
}): Promise<{ id: string }> {
  const config = getPayPalConfig();
  const token = await getPayPalAccessToken(config);

  const res = await fetch(`${apiBase(config.mode)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.merchantTrns,
          amount: {
            currency_code: "EUR",
            value: params.amountEur,
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: params.amountEur,
              },
            },
          },
          description: params.description,
          custom_id: params.merchantTrns,
          items: [
            {
              name: params.description,
              quantity: "1",
              unit_amount: {
                currency_code: "EUR",
                value: params.amountEur,
              },
              category: "DIGITAL_GOODS",
            },
          ],
        },
      ],
      application_context: {
        brand_name: "ThesiBook",
        locale: "el-GR",
        landing_page: "BILLING",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${params.siteUrl}/dashboard?billing=success&workspace=${encodeURIComponent(params.workspaceSlug)}`,
        cancel_url: `${params.siteUrl}/dashboard?billing=cancelled&workspace=${encodeURIComponent(params.workspaceSlug)}`,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parsePayPalError(text));
  }

  return (await res.json()) as { id: string };
}

export type PayPalCaptureResult = {
  id: string;
  status: string;
  captureId?: string;
  payerEmail?: string;
  amountEur?: string;
};

export async function capturePayPalOrder(
  orderId: string,
): Promise<PayPalCaptureResult> {
  const config = getPayPalConfig();
  const token = await getPayPalAccessToken(config);

  const res = await fetch(
    `${apiBase(config.mode)}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parsePayPalError(text));
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    payer?: { email_address?: string };
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount?: { value: string };
        }>;
      };
    }>;
  };

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    id: data.id,
    status: data.status,
    captureId: capture?.id,
    payerEmail: data.payer?.email_address,
    amountEur: capture?.amount?.value,
  };
}

export async function getPayPalOrder(
  orderId: string,
): Promise<{ status: string; customId?: string }> {
  const config = getPayPalConfig();
  const token = await getPayPalAccessToken(config);

  const res = await fetch(`${apiBase(config.mode)}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`PayPal get order failed (${res.status})`);
  }

  const data = (await res.json()) as {
    status: string;
    purchase_units?: Array<{ custom_id?: string }>;
  };

  return {
    status: data.status,
    customId: data.purchase_units?.[0]?.custom_id,
  };
}

export type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    status?: string;
    custom_id?: string;
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
    amount?: { value?: string; currency_code?: string };
  };
};

export async function verifyPayPalWebhook(params: {
  headers: Headers;
  body: string;
  webhookId: string;
}): Promise<boolean> {
  const config = getPayPalConfig();
  const token = await getPayPalAccessToken(config);

  const res = await fetch(
    `${apiBase(config.mode)}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: params.headers.get("paypal-auth-algo"),
        cert_url: params.headers.get("paypal-cert-url"),
        transmission_id: params.headers.get("paypal-transmission-id"),
        transmission_sig: params.headers.get("paypal-transmission-sig"),
        transmission_time: params.headers.get("paypal-transmission-time"),
        webhook_id: params.webhookId,
        webhook_event: JSON.parse(params.body),
      }),
    },
  );

  if (!res.ok) return false;

  const data = (await res.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}
