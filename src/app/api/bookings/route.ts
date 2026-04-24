import { addHours } from "date-fns";
import {
  BookingStatus,
  NotificationChannel,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  Prisma,
  Role,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { assignProfessional } from "@/lib/availability";
import { createAuditLog } from "@/lib/audit";
import { createPreference } from "@/lib/mercadopago";
import { calculateBookingPricing } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { bookingCode } from "@/lib/utils";
import { bookingRequestSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (
    !session ||
    (session.role !== Role.ADMIN && session.role !== Role.PROFESSIONAL && session.role !== Role.STAFF)
  ) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const statusParam = searchParams.get("status") as BookingStatus | null;

  const where: Prisma.BookingWhereInput = {
    ...(statusParam ? { status: statusParam } : {}),
    ...(q
      ? {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { service: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { appointmentAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, durationMinutes: true } },
        payments: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { status: true, amount: true, providerPreferenceId: true },
        },
      },
    }),
  ]);

  return NextResponse.json({
    data,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  try {
    const payload = bookingRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json(
        { error: "Datos de reserva inválidos", issues: payload.error.flatten() },
        { status: 400 },
      );
    }

    const data = payload.data;
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Servicio no disponible" }, { status: 404 });
    }

    const appointmentAt = new Date(`${data.date}T${data.time}:00`);
    if (Number.isNaN(appointmentAt.getTime())) {
      return NextResponse.json({ error: "Fecha u hora inválida" }, { status: 400 });
    }

    const professionalId = await assignProfessional(service.id, appointmentAt);
    if (!professionalId) {
      return NextResponse.json(
        { error: "No hay profesionales disponibles para el horario seleccionado" },
        { status: 409 },
      );
    }

    const customer = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.customerName,
        phone: data.phone,
      },
      create: {
        email: data.email,
        name: data.customerName,
        phone: data.phone,
        role: Role.CUSTOMER,
      },
    });

    await prisma.customerProfile.upsert({
      where: { userId: customer.id },
      update: { phone: data.phone },
      create: { userId: customer.id, phone: data.phone },
    });

    const pricing = calculateBookingPricing({
      basePrice: service.basePrice,
      hairLength: data.hairLength,
      hairDensity: data.hairDensity,
      modality: data.modality,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const booking = await prisma.booking.create({
      data: {
        code: bookingCode(),
        customerId: customer.id,
        professionalId,
        serviceId: service.id,
        hotelPartnerId: data.hotelPartnerId ?? null,
        status: BookingStatus.PENDING_PAYMENT,
        modality: data.modality,
        appointmentAt,
        address: data.address ?? null,
        district: data.district ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        hotelName: data.hotelName ?? null,
        roomNumber: data.roomNumber ?? null,
        hairLength: data.hairLength ?? null,
        hairDensity: data.hairDensity ?? null,
        notes: data.notes ?? null,
        subtotal: pricing.subtotal,
        surchargeLength: pricing.surchargeLength,
        surchargeAbundance: pricing.surchargeAbundance,
        surchargeDomicile: pricing.surchargeDomicile,
        distanceFee: pricing.distanceFee,
        totalAmount: pricing.totalAmount,
        depositAmount: pricing.depositAmount,
        balanceAmount: pricing.totalAmount - pricing.depositAmount,
        externalReference: `booking_${customer.id}_${Date.now()}`,
      },
      include: {
        customer: true,
      },
    });

    await prisma.notificationLog.createMany({
      data: [
        {
          bookingId: booking.id,
          channel: NotificationChannel.EMAIL,
          type: NotificationType.BOOKING_CONFIRMED,
          scheduledFor: new Date(),
        },
        {
          bookingId: booking.id,
          channel: NotificationChannel.WHATSAPP,
          type: NotificationType.BOOKING_REMINDER,
          scheduledFor: addHours(appointmentAt, -6),
        },
      ],
    });

    const preference = await createPreference({
      bookingId: booking.id,
      bookingCode: booking.code,
      serviceName: service.name,
      customerName: customer.name,
      customerEmail: customer.email,
      amount: booking.depositAmount,
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        provider: PaymentProvider.MERCADO_PAGO,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        externalReference: booking.id,
        providerPreferenceId: preference.preferenceId,
        amount: booking.depositAmount,
        description: `Abono reserva ${booking.code}`,
        rawCreatePayload: preference.rawPayload,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { lastPaymentId: payment.id },
    });

    await createAuditLog({
      userId: customer.id,
      action: "BOOKING_CREATED",
      entity: "Booking",
      entityId: booking.id,
      metadata: {
        modality: data.modality,
        appointmentAt: appointmentAt.toISOString(),
        serviceId: service.id,
        paymentId: payment.id,
      },
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        code: booking.code,
        status: booking.status,
        totalAmount: booking.totalAmount,
        depositAmount: booking.depositAmount,
      },
      payment: {
        id: payment.id,
        status: payment.status,
        providerPreferenceId: payment.providerPreferenceId,
      },
      init_point: preference.initPoint,
      sandbox_init_point: preference.sandboxInitPoint,
    });
  } catch (error) {
    console.error("booking create error", error);
    return NextResponse.json({ error: "No fue posible crear la reserva" }, { status: 500 });
  }
}
