import { addHours } from "date-fns";
import { BookingModality, HairDensity, HairLength, NotificationChannel, NotificationType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assignProfessional } from "@/lib/availability";
import { calculateBookingPricing } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { bookingCode } from "@/lib/utils";

const schema = z.object({
  customerName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  serviceId: z.string().min(1),
  modality: z.nativeEnum(BookingModality),
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  address: z.string().min(4),
  district: z.string().min(2),
  hotelName: z.string().optional().nullable(),
  roomNumber: z.string().optional().nullable(),
  hairLength: z.nativeEnum(HairLength).optional().nullable(),
  hairDensity: z.nativeEnum(HairDensity).optional().nullable(),
  notes: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de reserva incompletos." }, { status: 400 });
  }

  const data = parsed.data;
  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });

  if (!service) {
    return NextResponse.json({ error: "Servicio no disponible." }, { status: 404 });
  }

  const appointmentAt = new Date(`${data.date}T${data.time}:00`);
  const professionalId = await assignProfessional(service.id, appointmentAt);

  if (!professionalId) {
    return NextResponse.json({ error: "No hay profesionales disponibles para esa franja." }, { status: 409 });
  }

  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.customerName,
      phone: data.phone,
    },
    create: {
      email: data.email,
      name: data.customerName,
      phone: data.phone,
      role: Role.CLIENT,
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  const pricing = calculateBookingPricing({
    basePrice: service.basePrice,
    hairLength: data.hairLength,
    hairDensity: data.hairDensity,
    latitude: data.latitude,
    longitude: data.longitude,
  });

  const booking = await prisma.booking.create({
    data: {
      code: bookingCode(),
      customerId: user.id,
      professionalId,
      serviceId: service.id,
      modality: data.modality,
      appointmentAt,
      address: data.address,
      district: data.district,
      latitude: data.latitude,
      longitude: data.longitude,
      hotelName: data.hotelName,
      roomNumber: data.roomNumber,
      hairLength: data.hairLength,
      hairDensity: data.hairDensity,
      notes: data.notes,
      subtotal: pricing.subtotal,
      distanceFee: pricing.distanceFee,
      totalAmount: pricing.totalAmount,
      depositAmount: pricing.depositAmount,
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
        type: NotificationType.BOOKING_CONFIRMED,
        scheduledFor: new Date(),
      },
      {
        bookingId: booking.id,
        channel: NotificationChannel.EMAIL,
        type: NotificationType.BOOKING_REMINDER,
        scheduledFor: addHours(appointmentAt, -6),
      },
    ],
  });

  return NextResponse.json({
    booking: {
      id: booking.id,
      code: booking.code,
      depositAmount: booking.depositAmount,
      totalAmount: booking.totalAmount,
      status: booking.status,
    },
  });
}
