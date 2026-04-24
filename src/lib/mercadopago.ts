import { createHmac, timingSafeEqual } from "crypto";

export type CreatePreferenceInput = {
  bookingId: string;
  serviceName: string;
  amount: number;
  payerEmail?: string;
};

export type MercadoPagoPayment = {
  id: string | number;
  status: string;
  date_approved?: string | null;
  transaction_amount?: number;
  external_reference?: string | null;
  metadata?: Record<string, unknown>;
};

const MP_API_BASE = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN");
  return token;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";
}

export async function createPreference(input: CreatePreferenceInput) {
  const accessToken = getAccessToken();
  const appUrl = getAppUrl();

  const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `booking-${input.bookingId}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: input.bookingId,
          title: `Abono ${input.serviceName}`,
          quantity: 1,
          unit_price: input.amount,
          currency_id: "CLP",
        },
      ],
      external_reference: input.bookingId,
      payer: input.payerEmail ? { email: input.payerEmail } : undefined,
      back_urls: {
        success: `${appUrl}/checkout/success?bookingId=${input.bookingId}`,
        failure: `${appUrl}/checkout/failure?bookingId=${input.bookingId}`,
        pending: `${appUrl}/checkout/pending?bookingId=${input.bookingId}`,
      },
      notification_url: `${appUrl}/api/payments/webhooks/mercadopago`,
      auto_return: "approved",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Mercado Pago preference: ${error}`);
  }

  return (await response.json()) as { id: string; init_point: string; sandbox_init_point?: string };
}

export async function getMPPayment(providerPaymentId: string) {
  const accessToken = getAccessToken();
  const response = await fetch(`${MP_API_BASE}/v1/payments/${providerPaymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Mercado Pago payment ${providerPaymentId}: ${error}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

export function verifyMPSignature(signature: string | null, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const digest = createHmac("sha256", secret).update(body).digest("hex");
  const left = Buffer.from(digest, "utf8");
  const right = Buffer.from(signature, "utf8");

  return left.length === right.length && timingSafeEqual(left, right);
}

export async function createDepositCheckout({
  bookingId,
  serviceName,
  depositAmount,
  code,
}: {
  bookingId: string;
  code: string;
  serviceName: string;
  depositAmount: number;
}) {
  const preference = await createPreference({
    bookingId,
    serviceName: `${serviceName} #${code}`,
    amount: depositAmount,
  });

  return preference.init_point;
}
