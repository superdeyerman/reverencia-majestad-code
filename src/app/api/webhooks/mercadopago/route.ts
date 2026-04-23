import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  id?: string | number;
  live_mode?: boolean;
  type?: string;
  topic?: string;
  data?: {
    id?: string | number;
  };
};

type MercadoPagoPayment = {
  id?: string | number;
  status?: string;
  external_reference?: string;
  metadata?: {
    booking_id?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MercadoPagoWebhookBody;

    const paymentId = body?.data?.id ?? body?.id ?? null;
    const topic = body?.type ?? body?.topic ?? null;

    // Ignora eventos que no sean pagos o que no traigan id
    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("Falta MP_ACCESS_TOKEN en variables de entorno");
      return NextResponse.json({ received: true, error: "missing_token" });
    }

    // Consulta el pago real en Mercado Pago
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
      console.error("Error consultando pago en Mercado Pago:", errorText);

      return NextResponse.json({
        received: true,
        error: "mp_payment_fetch_failed",
      });
    }

    const payment = (await mpResponse.json()) as MercadoPagoPayment;

    const bookingId =
      payment.external_reference ??
      payment.metadata?.booking_id ??
      null;

    if (!bookingId) {
      console.warn("El pago no trae bookingId en external_reference ni metadata");
      return NextResponse.json({ received: true, ignored: true });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: String(bookingId) },
      select: {
        id: true,
        isDepositPaid: true,
        status: true,
      },
    });

    if (!booking) {
      console.warn(`No existe Booking con id ${bookingId}`);
      return NextResponse.json({ received: true, ignored: true });
    }

    // approved = confirmar abono
    if (payment.status === "approved") {
      // Evita actualizar si ya estaba pagado
      if (!booking.isDepositPaid || booking.status !== BookingStatus.CONFIRMED) {
        await prisma.booking.update({
          where: { id: String(bookingId) },
          data: {
            isDepositPaid: true,
            status: BookingStatus.CONFIRMED,
          },
        });
      }

      return NextResponse.json({
        received: true,
        updated: true,
        bookingId: String(bookingId),
        paymentStatus: payment.status,
      });
    }

    // pending / in_process = recibido pero aún no confirmado
    if (payment.status === "pending" || payment.status === "in_process") {
      console.log(`Pago pendiente para booking ${bookingId}`);
      return NextResponse.json({
        received: true,
        updated: false,
        bookingId: String(bookingId),
        paymentStatus: payment.status,
      });
    }

    // rejected / cancelled / refunded / charged_back
    console.log(`Pago no aprobado para booking ${bookingId}: ${payment.status}`);

    return NextResponse.json({
      received: true,
      updated: false,
      bookingId: String(bookingId),
      paymentStatus: payment.status ?? "unknown",
    });
  } catch (error) {
    console.error("Error en webhook de Mercado Pago:", error);
    return NextResponse.json(
      { received: true, error: "webhook_internal_error" },
      { status: 200 }
    );
  }
}