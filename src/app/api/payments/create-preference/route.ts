import { BookingStatus, PaymentProvider, PaymentStatus, PaymentType } from "@prisma/client";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { createPreference } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { createPreferenceSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const payload = createPreferenceSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Solicitud inválida", issues: payload.error.flatten() },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: payload.data.bookingId },
      include: {
        customer: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.ARCHIVED
    ) {
      return NextResponse.json({ error: "La reserva no admite pagos" }, { status: 409 });
    }

    if (booking.isDepositPaid) {
      return NextResponse.json({ error: "La reserva ya tiene su abono confirmado" }, { status: 409 });
    }

    const amount = booking.depositAmount;
    const preference = await createPreference({
      bookingId: booking.id,
      bookingCode: booking.code,
      serviceName: booking.service.name,
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      amount,
    });

    await prisma.payment.upsert({
      where: {
        provider_externalReference_type: {
          provider: PaymentProvider.MERCADO_PAGO,
          externalReference: booking.id,
          type: PaymentType.DEPOSIT,
        },
      },
      update: {
        status: PaymentStatus.PENDING,
        providerPreferenceId: preference.preferenceId,
        amount,
        rawCreatePayload: preference.rawPayload,
      },
      create: {
        bookingId: booking.id,
        provider: PaymentProvider.MERCADO_PAGO,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        externalReference: booking.id,
        providerPreferenceId: preference.preferenceId,
        amount,
        description: `Abono reserva ${booking.code}`,
        rawCreatePayload: preference.rawPayload,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.PENDING_PAYMENT },
    });

    await createAuditLog({
      userId: booking.customerId,
      action: "PAYMENT_PREFERENCE_CREATED",
      entity: "Booking",
      entityId: booking.id,
      metadata: {
        provider: PaymentProvider.MERCADO_PAGO,
        preferenceId: preference.preferenceId,
        amount,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      bookingCode: booking.code,
      amount,
      init_point: preference.initPoint,
      sandbox_init_point: preference.sandboxInitPoint,
      providerPreferenceId: preference.preferenceId,
    });
  } catch (error) {
    console.error("create-preference error", error);
    return NextResponse.json({ error: "No fue posible crear la preferencia de pago" }, { status: 500 });
  }
}
