import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const paymentId = body?.data?.id ?? body?.id;

  if (!paymentId || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    return NextResponse.json({ received: true });
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ received: true });
  }

  const payment = await response.json();
  const bookingId = payment.external_reference;

  if (payment.status === "approved" && bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        isDepositPaid: true,
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  return NextResponse.json({ received: true });
}
