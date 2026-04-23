import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const paymentId = body?.data?.id ?? body?.id;
    const topic = body?.type ?? body?.topic;

    // 🔒 Ignorar eventos que no sean pagos
    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ received: true });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("Falta MP_ACCESS_TOKEN");
      return NextResponse.json({ received: true });
    }

    // 🔍 Consultar pago real en Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Error consultando pago MP");
      return NextResponse.json({ received: true });
    }

    const payment = await response.json();

    const bookingId =
      payment.external_reference ||
      payment.metadata?.booking_id;

    if (!bookingId) {
      console.warn("No viene bookingId en el pago");
      return NextResponse.json({ received: true });
    }

    // 🧠 Manejo de estados
    if (payment.status === "approved") {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          isDepositPaid: true,
          status: BookingStatus.CONFIRMED,
          paymentStatus: "PAID",
          paymentProvider: "MERCADOPAGO",
          externalReference: String(payment.id),
        },
      });
    } else if (
      payment.status === "pending" ||
      payment.status === "in_process"
    ) {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          paymentStatus: "PENDING",
          paymentProvider: "MERCADOPAGO",
        },
      });
    } else if (
      payment.status === "rejected" ||
      payment.status === "cancelled"
    ) {
      await prisma.booking.update({
        where: { id: String(bookingId) },
        data: {
          paymentStatus: "REJECTED",
          paymentProvider: "MERCADOPAGO",
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error en webhook:", error);
    return NextResponse.json({ received: true });
  }
}