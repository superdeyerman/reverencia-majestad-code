import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  id?: string | number;
  type?: string;
  topic?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MercadoPagoWebhookBody;

    const paymentId = body?.data?.id ?? body?.id ?? null;
    const topic = body?.type ?? body?.topic ?? null;

    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("Falta MP_ACCESS_TOKEN");
      return NextResponse.json({ received: true, error: "missing_token" });
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
      payment.external_reference ??
      payment.metadata?.booking_id ??
      null;

    if (!bookingId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: String(bookingId) },
      select: {
        id: true,
        isDepositPaid: true,
        externalReference: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (
      payment.status === "approved" &&
      (!booking.isDepositPaid ||
        booking.externalReference !== String(payment.id))
    ) {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          isDepositPaid: true,
          status: BookingStatus.CONFIRMED,
          paymentStatus: "PAID",
          paymentProvider: "MERCADOPAGO",
          externalReference: String(payment.id),
          paidAmount: Math.round(payment.transaction_amount ?? 0),
          paidAt: payment.date_approved ? new Date(payment.date_approved) : new Date(),
        },
      });
    }

    if (payment.status === "pending" || payment.status === "in_process") {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          paymentStatus: "PENDING",
          paymentProvider: "MERCADOPAGO",
          externalReference: String(payment.id),
        },
      });
    }

    if (
      payment.status === "rejected" ||
      payment.status === "cancelled" ||
      payment.status === "refunded" ||
      payment.status === "charged_back"
    ) {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          paymentStatus: "REJECTED",
          paymentProvider: "MERCADOPAGO",
          externalReference: String(payment.id),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook Mercado Pago:", error);
    return NextResponse.json({ received: true, error: "internal_error" });
  }
}