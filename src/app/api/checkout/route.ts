import { NextResponse } from "next/server";
import { z } from "zod";
import { createDepositCheckout } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

const schema = z.object({ bookingId: z.string() });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bookingId requerido" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { service: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const checkoutUrl = await createDepositCheckout({
    bookingId: booking.id,
    code: booking.code,
    serviceName: booking.service.name,
    depositAmount: booking.depositAmount,
  });

  return NextResponse.json({ checkoutUrl });
}
