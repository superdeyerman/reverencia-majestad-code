import { PaymentStatus } from "@prisma/client";
import { createHmac, randomUUID } from "crypto";

type MPPreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  currency_id: "CLP";
  unit_price: number;
  description?: string;
};

type MPPreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string | null;
};

export type CreatePreferenceInput = {
  bookingId: string;
  bookingCode: string;
  serviceName: string;
  customerName?: string | null;
  customerEmail?: string | null;
  amount: number;
};

export type MercadoPagoPayment = {
  id: number | string;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  net_received_amount?: number;
  fee_details?: Array<{ amount?: number }>;
  date_approved?: string | null;
  external_reference?: string | null;
  metadata?: Record<string, unknown>;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
};

function getBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN ?? process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing Mercado Pago access token");
  }
  return token;
}

export function mapMPStatus(status?: string): PaymentStatus {
  switch (status) {
    case "approved":
      return PaymentStatus.APPROVED;
    case "pending":
      return PaymentStatus.PENDING;
    case "in_process":
      return PaymentStatus.IN_PROCESS;
    case "rejected":
      return PaymentStatus.REJECTED;
    case "cancelled":
      return PaymentStatus.CANCELLED;
    case "refunded":
      return PaymentStatus.REFUNDED;
    case "charged_back":
      return PaymentStatus.CHARGED_BACK;
    default:
      return PaymentStatus.FAILED;
  }
}

export async function createPreference(input: CreatePreferenceInput) {
  const accessToken = getAccessToken();
  const baseUrl = getBaseUrl();

  const item: MPPreferenceItem = {
    id: input.bookingId,
    title: `Abono ${input.serviceName}`,
    description: `Reserva ${input.bookingCode}`,
    quantity: 1,
    currency_id: "CLP",
    unit_price: input.amount,
  };

  const payload = {
    items: [item],
    external_reference: input.bookingId,
    metadata: {
      booking_id: input.bookingId,
      booking_code: input.bookingCode,
      source: "reverencia-majestad",
    },
    payer: input.customerEmail
      ? {
          name: input.customerName ?? "Cliente Reverencia",
          email: input.customerEmail,
        }
      : undefined,
    back_urls: {
      success: `${baseUrl}/checkout/success?bookingId=${input.bookingId}`,
      failure: `${baseUrl}/checkout/failure?bookingId=${input.bookingId}`,
      pending: `${baseUrl}/checkout/pending?bookingId=${input.bookingId}`,
    },
    notification_url: `${baseUrl}/api/payments/webhooks/mercadopago`,
    auto_return: "approved",
    statement_descriptor: "REVERENCIA SPA",
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Pago preference error: ${detail}`);
  }

  const data = (await response.json()) as MPPreferenceResponse;

  return {
    preferenceId: data.id,
    initPoint: data.init_point,
    sandboxInitPoint: data.sandbox_init_point ?? null,
    rawPayload: payload,
  };
}

export async function createDepositCheckout({
  bookingId,
  code,
  serviceName,
  depositAmount,
}: {
  bookingId: string;
  code: string;
  serviceName: string;
  depositAmount: number;
}) {
  const preference = await createPreference({
    bookingId,
    bookingCode: code,
    serviceName,
    amount: depositAmount,
  });

  return preference.initPoint;
}

export async function getMPPayment(providerPaymentId: string) {
  const accessToken = getAccessToken();
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${providerPaymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mercado Pago payment lookup error: ${detail}`);
  }

  return (await response.json()) as MercadoPagoPayment;
}

export function verifyMPSignature(
  signature: string | null,
  requestId: string | null,
  dataId: string,
  body: string,
) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim() ?? "", value?.trim() ?? ""];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};${body}`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === v1;
}
