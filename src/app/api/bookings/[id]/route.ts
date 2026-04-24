import { BookingStatus, PaymentType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
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

// ─── PATCH — Admin status actions ─────────────────────────────────────────────

const VALID_TRANSITIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.PENDING]:         [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.PAYMENT_FAILED]:  [BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]:       [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]:     [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
};

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("confirm") }),
  z.object({ action: z.literal("cancel"),      reason: z.string().optional() }),
  z.object({ action: z.literal("complete") }),
  z.object({ action: z.literal("in_progress") }),
  z.object({
    action:  z.literal("reschedule"),
    newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    newTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
]);

const ACTION_TO_STATUS: Record<string, BookingStatus> = {
  confirm:     BookingStatus.CONFIRMED,
  cancel:      BookingStatus.CANCELLED,
  complete:    BookingStatus.COMPLETED,
  in_progress: BookingStatus.IN_PROGRESS,
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.PROFESSIONAL)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción inválida", detail: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where:  { id },
    select: { id: true, status: true, customerId: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const cmd = parsed.data;

  if (cmd.action === "reschedule") {
    const newAppointmentAt = new Date(`${cmd.newDate}T${cmd.newTime}:00`);
    if (isNaN(newAppointmentAt.getTime())) {
      return NextResponse.json({ error: "Fecha/hora inválida" }, { status: 400 });
    }
    const updated = await prisma.booking.update({
      where: { id },
      data:  { appointmentAt: newAppointmentAt, status: BookingStatus.CONFIRMED },
    });
    return NextResponse.json({ booking: { id: updated.id, status: updated.status, appointmentAt: updated.appointmentAt } });
  }

  const targetStatus = ACTION_TO_STATUS[cmd.action];
  if (!targetStatus) {
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  }

  const allowed = VALID_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(targetStatus)) {
    return NextResponse.json(
      { error: `No se puede pasar de ${booking.status} a ${targetStatus}` },
      { status: 409 },
    );
  }

  const updated = await prisma.booking.update({
    where: { id },
    data:  { status: targetStatus },
  });

  // Increment visitCount and totalSpent when completing a booking
  if (targetStatus === BookingStatus.COMPLETED) {
    const booking2 = await prisma.booking.findUnique({
      where:  { id },
      select: { customerId: true, totalAmount: true },
    });
    if (booking2) {
      await prisma.customerProfile.updateMany({
        where: { userId: booking2.customerId },
        data: {
          visitCount:  { increment: 1 },
          totalSpent:  { increment: booking2.totalAmount },
          lastVisitAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({ booking: { id: updated.id, status: updated.status } });
}
