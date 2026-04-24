import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
} from "@prisma/client";
import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  data?: { id?: string | number };
};

type MercadoPagoPayment = {
  id?: string | number;
  status?: string;
  transaction_amount?: number;
  date_approved?: string | null;
  external_reference?: string | null;
  metadata?: { booking_id?: string };
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: { type?: string; number?: string };
  };
};

function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string,
): boolean {
  if (!xSignature) return false;

  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const eq = part.indexOf("=");
    if (eq > 0) parts[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }

  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts}`;
  const hmac = createHmac("sha256", secret).update(manifest).digest("hex");
  return hmac === v1;
}

function mpStatusToPaymentStatus(status?: string): PaymentStatus {
  switch (status) {
    case "approved":      return PaymentStatus.APPROVED;
    case "pending":
    case "in_process":   return PaymentStatus.PENDING;
    case "rejected":      return PaymentStatus.REJECTED;
    case "cancelled":     return PaymentStatus.CANCELLED;
    case "refunded":      return PaymentStatus.REFUNDED;
    case "charged_back":  return PaymentStatus.CHARGED_BACK;
    default:              return PaymentStatus.FAILED;
  }
}

export async function POST(request: Request) {
  let body: MercadoPagoWebhookBody;

  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return NextResponse.json({ received: true, error: "invalid_json" }, { status: 400 });
  }

  try {
    const paymentId = body?.data?.id ?? body?.id ?? null;
    const topic = body?.type ?? body?.topic ?? null;
    const notificationId = body?.id ? String(body.id) : null;

    // Ignorar notificaciones que no sean de pagos
    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true, ignored: true });
    }

    // Validación de firma MP (opcional: activa si MP_WEBHOOK_SECRET está definido)
    const mpSecret = process.env.MP_WEBHOOK_SECRET;
    if (mpSecret) {
      const valid = validateWebhookSignature(
        request.headers.get("x-signature"),
        request.headers.get("x-request-id"),
        String(body.data?.id ?? ""),
        mpSecret,
      );
      if (!valid) {
        console.error("Firma inválida en webhook MP", { notificationId });
        return NextResponse.json({ received: true, error: "invalid_signature" }, { status: 401 });
      }
    } else {
      console.warn("MP_WEBHOOK_SECRET no configurado — validación de firma desactivada");
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Falta MP_ACCESS_TOKEN");
      return NextResponse.json({ received: true, error: "missing_token" }, { status: 500 });
    }

    // Idempotencia por notificationId: si ya fue procesado, cortar antes de llamar a MP
    if (notificationId) {
      const existingEvent = await prisma.paymentEvent.findUnique({
        where: {
          provider_notificationId: {
            provider: PaymentProvider.MERCADO_PAGO,
            notificationId,
          },
        },
        select: { id: true, isProcessed: true },
      });

      if (existingEvent?.isProcessed) {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }
    }

    // Registrar evento antes de procesar (audit trail + idempotencia)
    let paymentEventId: string | null = null;
    if (notificationId) {
      const event = await prisma.paymentEvent.upsert({
        where: {
          provider_notificationId: {
            provider: PaymentProvider.MERCADO_PAGO,
            notificationId,
          },
        },
        update: { payload: JSON.parse(JSON.stringify(body)) },
        create: {
          provider: PaymentProvider.MERCADO_PAGO,
          notificationId,
          topic: topic ?? null,
          action: body.action ?? null,
          resourceId: String(paymentId),
          payload: JSON.parse(JSON.stringify(body)),
        },
      });
      paymentEventId = event.id;
    }

    // Consultar pago real en Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Error consultando pago MP:", errorText, { paymentId });
      return NextResponse.json({ received: true, error: "mp_fetch_failed" });
    }

    const payment = (await mpResponse.json()) as MercadoPagoPayment;

    const bookingId =
      payment.external_reference?.trim() ||
      payment.metadata?.booking_id?.trim() ||
      null;

    if (!bookingId) {
      console.warn("Webhook sin bookingId", {
        paymentId: payment.id,
        external_reference: payment.external_reference,
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, isDepositPaid: true, status: true },
    });

    if (!booking) {
      console.warn("Booking no encontrado para webhook", { bookingId, paymentId: payment.id });
      return NextResponse.json({ received: true, ignored: true });
    }

    const mpPaymentId = String(payment.id);
    const paymentStatus = mpStatusToPaymentStatus(payment.status);
    const amount = Math.round(payment.transaction_amount ?? 0);
    const approvedAt = payment.date_approved
      ? new Date(payment.date_approved)
      : new Date();

    // Transacción atómica: Payment upsert + Booking update
    await prisma.$transaction(async (tx) => {
      const upsertedPayment = await tx.payment.upsert({
        where: {
          provider_externalReference_type: {
            provider: PaymentProvider.MERCADO_PAGO,
            externalReference: booking.id,
            type: PaymentType.DEPOSIT,
          },
        },
        update: {
          status: paymentStatus,
          providerPaymentId: mpPaymentId,
          amount,
          paidAt: payment.status === "approved" ? approvedAt : null,
          rawProviderPayment: JSON.parse(JSON.stringify(payment)),
          processedAt: new Date(),
          payerEmail: payment.payer?.email ?? null,
          payerFirstName: payment.payer?.first_name ?? null,
          payerLastName: payment.payer?.last_name ?? null,
          payerIdentificationType: payment.payer?.identification?.type ?? null,
          payerIdentificationNumber: payment.payer?.identification?.number ?? null,
        },
        create: {
          bookingId: booking.id,
          provider: PaymentProvider.MERCADO_PAGO,
          type: PaymentType.DEPOSIT,
          status: paymentStatus,
          externalReference: booking.id,
          providerPaymentId: mpPaymentId,
          currency: "CLP",
          amount,
          paidAt: payment.status === "approved" ? approvedAt : null,
          rawProviderPayment: JSON.parse(JSON.stringify(payment)),
          processedAt: new Date(),
          payerEmail: payment.payer?.email ?? null,
          payerFirstName: payment.payer?.first_name ?? null,
          payerLastName: payment.payer?.last_name ?? null,
          payerIdentificationType: payment.payer?.identification?.type ?? null,
          payerIdentificationNumber: payment.payer?.identification?.number ?? null,
        },
      });

      if (payment.status === "approved") {
        // Idempotencia: no sobreescribir si ya estaba confirmado
        if (!booking.isDepositPaid) {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              isDepositPaid: true,
              status: BookingStatus.CONFIRMED,
              paymentProvider: PaymentProvider.MERCADO_PAGO,
              paidAmountTotal: amount,
              paidAt: approvedAt,
              lastPaymentId: upsertedPayment.id,
            },
          });
        }
      } else if (payment.status === "pending" || payment.status === "in_process") {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.PAYMENT_PENDING,
            lastPaymentId: upsertedPayment.id,
          },
        });
      } else if (
        payment.status === "rejected" ||
        payment.status === "cancelled" ||
        payment.status === "refunded" ||
        payment.status === "charged_back"
      ) {
        // No revertir si el depósito ya fue acreditado correctamente
        if (!booking.isDepositPaid) {
          await tx.booking.update({
            where: { id: booking.id },
            data: {
              status: BookingStatus.PAYMENT_FAILED,
              lastPaymentId: upsertedPayment.id,
            },
          });
        }
      }

      // Marcar evento como procesado
      if (paymentEventId) {
        await tx.paymentEvent.update({
          where: { id: paymentEventId },
          data: {
            isProcessed: true,
            processedAt: new Date(),
            paymentId: upsertedPayment.id,
            externalReference: bookingId,
          },
        });
      }
    });

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);
    return NextResponse.json({ received: true, error: "internal_error" }, { status: 500 });
  }
}
