import { BookingModality, BookingStatus, HairDensity, HairLength, PaymentProvider, PaymentStatus, PaymentType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createPreference } from "@/lib/mercadopago";
import { calculateBookingPricing } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { bookingCode } from "@/lib/utils";

const createBookingSchema = z.object({
  customerName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  serviceId: z.string().min(1),
  modality: z.nativeEnum(BookingModality),
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  address: z.string().optional().default(""),
  district: z.string().optional().default(""),
  hotelName: z.string().optional().nullable(),
  roomNumber: z.string().optional().nullable(),
  hairLength: z.nativeEnum(HairLength).optional().nullable(),
  hairDensity: z.nativeEnum(HairDensity).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });

  const appointmentAt = new Date(`${data.date}T${data.time}:00`);

  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.customerName, phone: data.phone },
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
    modality: data.modality,
  });

  const booking = await prisma.booking.create({
    data: {
      code: bookingCode(),
      customerId: user.id,
      serviceId: service.id,
      modality: data.modality,
      appointmentAt,
      status: BookingStatus.PAYMENT_PENDING,
      address: data.address,
      district: data.district,
      hotelName: data.hotelName,
      roomNumber: data.roomNumber,
      hairLength: data.hairLength,
      hairDensity: data.hairDensity,
      notes: data.notes,
      subtotal: pricing.subtotal,
      distanceFee: pricing.distanceFee,
      totalAmount: pricing.totalAmount,
      depositAmount: pricing.depositAmount,
      externalReference: `booking-${user.id}-${Date.now()}`,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: PaymentProvider.MERCADO_PAGO,
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
      externalReference: booking.id,
      currency: "CLP",
      amount: booking.depositAmount,
    },
  });

  const preference = await createPreference({
    bookingId: booking.id,
    serviceName: service.name,
    amount: booking.depositAmount,
    payerEmail: user.email,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerPreferenceId: preference.id },
  });

  return NextResponse.json({
    bookingId: booking.id,
    paymentId: payment.id,
    initPoint: preference.init_point,
    status: booking.status,
  });
}
