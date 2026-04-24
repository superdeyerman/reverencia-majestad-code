import { PaymentType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;

    if (!id?.trim()) {
      return NextResponse.json({ error: "ID de reserva requerido" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        status: true,
        isDepositPaid: true,
        depositAmount: true,
        totalAmount: true,
        paidAmountTotal: true,
        paidAt: true,
        paymentProvider: true,
        appointmentAt: true,
        modality: true,
        address: true,
        district: true,
        service: {
          select: { id: true, name: true, durationMinutes: true },
        },
        payments: {
          where: { type: PaymentType.DEPOSIT },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            amount: true,
            paidAt: true,
            provider: true,
            providerPreferenceId: true,
            providerPaymentId: true,
            payerEmail: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const lastPayment = booking.payments[0] ?? null;

    return NextResponse.json({
      id: booking.id,
      code: booking.code,
      status: booking.status,
      isDepositPaid: booking.isDepositPaid,
      depositAmount: booking.depositAmount,
      totalAmount: booking.totalAmount,
      paidAmountTotal: booking.paidAmountTotal,
      paidAt: booking.paidAt,
      paymentProvider: booking.paymentProvider,
      appointmentAt: booking.appointmentAt,
      modality: booking.modality,
      address: booking.address,
      district: booking.district,
      service: booking.service,
      lastPayment,
    });
  } catch (error) {
    console.error("Error en GET /api/bookings/[id]:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
