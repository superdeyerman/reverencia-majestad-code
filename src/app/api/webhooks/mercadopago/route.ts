import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  id?: string | number;
  type?: string;
  topic?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

type MercadoPagoPayment = {
  id?: string | number;
  status?: string;
  transaction_amount?: number;
  date_approved?: string | null;
  external_reference?: string | null;
  metadata?: {
    booking_id?: string;
  };
};

function normalizePaymentStatus(status?: string) {
  switch (status) {
    case "approved":
      return "PAID";
    case "pending":
    case "in_process":
      return "PENDING";
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return "REJECTED";
    default:
      return "UNKNOWN";
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MercadoPagoWebhookBody;

    const paymentId = body?.data?.id ?? body?.id ?? null;
    const topic = body?.type ?? body?.topic ?? null;

    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      console.error("Falta MP_ACCESS_TOKEN");
      return NextResponse.json(
        { received: true, error: "missing_token" },
        { status: 500 }
      );
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Error consultando pago MP:", errorText);
      return NextResponse.json({ received: true, error: "mp_fetch_failed" });
    }

    const payment = (await mpResponse.json()) as MercadoPagoPayment;

    const bookingId =
      payment.external_reference?.trim() ||
      payment.metadata?.booking_id?.trim() ||
      null;

    if (!bookingId) {
      console.warn("Webhook sin bookingId asociado", {
        paymentId: payment.id,
        external_reference: payment.external_reference,
        metadata: payment.metadata,
      });

      return NextResponse.json({ received: true, ignored: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: String(bookingId) },
      select: {
        id: true,
        isDepositPaid: true,
      },
    });

    if (!booking) {
      console.warn("No se encontró booking para webhook", {
        bookingId,
        paymentId: payment.id,
      });

      return NextResponse.json({ received: true, ignored: true });
    }

    const normalizedStatus = normalizePaymentStatus(payment.status);
    const approvedAt = payment.date_approved
      ? new Date(payment.date_approved)
      : new Date();

    // -----------------------------
    // APROBADO
    // -----------------------------
    if (payment.status === "approved") {
      // Idempotencia básica:
      // si ya estaba marcado como pagado, no vuelvas a actualizar
      if (booking.isDepositPaid) {
        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          isDepositPaid: true,
          status: BookingStatus.CONFIRMED,

          // Estos campos solo funcionan si existen en tu schema actual:
          // paymentStatus: normalizedStatus,
          // paymentProvider: "MERCADOPAGO",
          // externalReference: String(payment.external_reference ?? booking.id),
          // paidAmount: Math.round(payment.transaction_amount ?? 0),
          // paidAt: approvedAt,
        },
      });

      return NextResponse.json({ received: true, processed: true });
    }

    // -----------------------------
    // PENDIENTE
    // -----------------------------
    if (payment.status === "pending" || payment.status === "in_process") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          // Si tienes PAYMENT_PENDING en tu enum úsalo.
          // Si no, déjalo comentado o usa PENDING según tu modelo real.
          // status: BookingStatus.PAYMENT_PENDING,

          // paymentStatus: normalizedStatus,
          // paymentProvider: "MERCADOPAGO",
          // externalReference: String(payment.external_reference ?? booking.id),
        },
      });

      return NextResponse.json({ received: true, processed: true });
    }

    // -----------------------------
    // RECHAZADO / CANCELADO / ETC
    // -----------------------------
    if (
      payment.status === "rejected" ||
      payment.status === "cancelled" ||
      payment.status === "refunded" ||
      payment.status === "charged_back"
    ) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          // Si tienes PAYMENT_FAILED en tu enum, úsalo.
          // Si no, probablemente no quieras tocar el status principal todavía.
          // status: BookingStatus.PAYMENT_FAILED,

          // paymentStatus: normalizedStatus,
          // paymentProvider: "MERCADOPAGO",
          // externalReference: String(payment.external_reference ?? booking.id),
        },
      });

      return NextResponse.json({ received: true, processed: true });
    }

    return NextResponse.json({
      received: true,
      ignored: true,
      reason: "unhandled_status",
    });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);
    return NextResponse.json(
      { received: true, error: "internal_error" },
      { status: 500 }
    );
  }
}