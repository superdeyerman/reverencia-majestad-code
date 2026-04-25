import {
  BookingModality,
  HairDensity,
  HairLength,
  NotificationChannel,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  ProfessionalKind,
  ProfLevel,
  Role,
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import { serviceCatalog } from "../src/lib/catalog";
import { prisma } from "../src/lib/prisma";

async function main() {
  for (const service of serviceCatalog) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@reverenciamajestad.cl" },
    update: {
      name: "Dirección Reverencia Majestad",
      phone: "+56963929354",
      role: Role.ADMIN,
    },
    create: {
      email: "admin@reverenciamajestad.cl",
      passwordHash: await hashPassword("Majestad2026!"),
      name: "Dirección Reverencia Majestad",
      phone: "+56963929354",
      role: Role.ADMIN,
    },
  });

  const stylistUser = await prisma.user.upsert({
    where: { email: "isidora@reverenciamajestad.cl" },
    update: { role: Role.PROFESSIONAL },
    create: {
      email: "isidora@reverenciamajestad.cl",
      passwordHash: await hashPassword("Isidora2026!"),
      name: "Isidora Véliz",
      phone: "+56922222222",
      role: Role.PROFESSIONAL,
    },
  });

  const therapistUser = await prisma.user.upsert({
    where: { email: "amelia@reverenciamajestad.cl" },
    update: { role: Role.PROFESSIONAL },
    create: {
      email: "amelia@reverenciamajestad.cl",
      passwordHash: await hashPassword("Amelia2026!"),
      name: "Amelia Durán",
      phone: "+56933333333",
      role: Role.PROFESSIONAL,
    },
  });

  const stylistProfile = await prisma.professionalProfile.upsert({
    where: { userId: stylistUser.id },
    update: {
      level: ProfLevel.GOLD,
      rating: 4.9,
      reviews: 138,
    },
    create: {
      userId: stylistUser.id,
      kind: ProfessionalKind.STYLIST,
      level: ProfLevel.GOLD,
      specialties: ["Balayage", "Color premium", "Brushing editorial", "Extensiones"],
      bio: "Especialista en color premium, styling editorial y transformación capilar de alto ticket.",
      rating: 4.9,
      reviews: 138,
      commissionRate: 0.22,
      commissionPercentage: 22,
      completedBookings: 185,
      totalEarnings: 4800000,
      isActive: true,
    },
  });

  const therapistProfile = await prisma.professionalProfile.upsert({
    where: { userId: therapistUser.id },
    update: {
      level: ProfLevel.SILVER,
      rating: 4.8,
      reviews: 97,
    },
    create: {
      userId: therapistUser.id,
      kind: ProfessionalKind.THERAPIST,
      level: ProfLevel.SILVER,
      specialties: ["Masaje wellness", "Faciales glow", "Experiencia hotel in-room"],
      bio: "Terapeuta premium enfocada en recuperación, descanso profundo y atención in-room.",
      rating: 4.8,
      reviews: 97,
      commissionRate: 0.2,
      commissionPercentage: 20,
      completedBookings: 124,
      totalEarnings: 2900000,
      isActive: true,
    },
  });

  const stylistServices = await prisma.service.findMany({
    where: { category: { in: ["BEAUTY", "NAILS", "MAKEUP"] } },
  });
  const therapistServices = await prisma.service.findMany({
    where: { category: { in: ["WELLNESS", "SKINCARE", "BODY_TREATMENTS"] } },
  });

  for (const service of stylistServices) {
    await prisma.professionalService.upsert({
      where: {
        professionalId_serviceId: {
          professionalId: stylistProfile.id,
          serviceId: service.id,
        },
      },
      update: {},
      create: {
        professionalId: stylistProfile.id,
        serviceId: service.id,
      },
    });
  }

  for (const service of therapistServices) {
    await prisma.professionalService.upsert({
      where: {
        professionalId_serviceId: {
          professionalId: therapistProfile.id,
          serviceId: service.id,
        },
      },
      update: {},
      create: {
        professionalId: therapistProfile.id,
        serviceId: service.id,
      },
    });
  }

  for (const professionalId of [stylistProfile.id, therapistProfile.id]) {
    for (const weekday of [1, 2, 3, 4, 5, 6]) {
      await prisma.availability.upsert({
        where: {
          id: `${professionalId}-${weekday}`,
        },
        update: {
          weekday,
          startTime: "09:00",
          endTime: "19:00",
          isAvailable: true,
        },
        create: {
          id: `${professionalId}-${weekday}`,
          professionalId,
          weekday,
          startTime: "09:00",
          endTime: "19:00",
          isAvailable: true,
        },
      });
    }
  }

  const hotel = await prisma.hotelPartner.upsert({
    where: { email: "concierge@grandorbe.cl" },
    update: {},
    create: {
      name: "Grand Orbe Hotel",
      contactName: "Concierge Premium",
      email: "concierge@grandorbe.cl",
      phone: "+56225550000",
      address: "Av. Apoquindo 3900, Las Condes, Santiago",
      district: "Las Condes",
      commissionRate: 0.12,
      notes: "Piloto B2B para huéspedes corporativos y suites premium.",
    },
  });

  await prisma.hotelPartner.upsert({
    where: { email: "spa@magnoliahotel.cl" },
    update: {},
    create: {
      name: "Hotel Magnolia",
      contactName: "Director de Spa",
      email: "spa@magnoliahotel.cl",
      phone: "+56225561234",
      address: "Av. Santa María 1742, Providencia, Santiago",
      district: "Providencia",
      commissionRate: 0.14,
      notes: "Alianza premium para huéspedes VIP y paquetes in-room.",
    },
  });

  await prisma.hotelPartner.upsert({
    where: { email: "concierge@ritz-carlton.cl" },
    update: {},
    create: {
      name: "The Ritz-Carlton Santiago",
      contactName: "Head Concierge",
      email: "concierge@ritz-carlton.cl",
      phone: "+56225509500",
      address: "El Alcalde 15, Las Condes, Santiago",
      district: "Las Condes",
      commissionRate: 0.15,
      notes: "Hotel cinco estrellas. Servicios in-room exclusivos para huéspedes.",
    },
  });

  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "María José Fernández",
        text: "Reservé color y brushing en hotel. La ejecución fue impecable y la puntualidad perfecta.",
        rating: 5,
        isActive: true,
      },
      {
        clientName: "Valentina Guzmán",
        text: "El nivel de servicio a domicilio superó por mucho lo que esperaba de una experiencia premium.",
        rating: 5,
        isActive: true,
      },
      {
        clientName: "Camila R.",
        text: "El masaje prenatal fue una experiencia increíble. Profesional preparada, técnica impecable y muchísima calidez.",
        rating: 5,
        isActive: true,
      },
      {
        clientName: "Daniela S.",
        text: "El ritual de pareja en el hotel fue el mejor regalo de aniversario. Todo pensado al detalle.",
        rating: 5,
        isActive: true,
      },
      {
        clientName: "Constanza M.",
        text: "El maquillaje nupcial superó mis expectativas. Duró toda la noche y se veía perfecto en las fotos.",
        rating: 5,
        isActive: true,
      },
      {
        clientName: "Guest Relations · Hotel Magnolia",
        text: "La percepción de nuestros huéspedes subió notablemente desde que incorporamos Reverencia Majestad al concierge.",
        rating: 5,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  const customer = await prisma.user.upsert({
    where: { email: "cliente.vip@reverenciamajestad.cl" },
    update: {},
    create: {
      email: "cliente.vip@reverenciamajestad.cl",
      passwordHash: await hashPassword("Cliente2026!"),
      name: "Catalina Ramos",
      phone: "+56999887766",
      role: Role.CUSTOMER,
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customer.id },
    update: {
      totalSpent: 240000,
      visits: 6,
      visitCount: 6,
    },
    create: {
      userId: customer.id,
      phone: customer.phone,
      totalSpent: 240000,
      visits: 6,
      visitCount: 6,
    },
  });

  const signatureColor = await prisma.service.findUniqueOrThrow({
    where: { slug: "signature-color" },
  });

  const booking = await prisma.booking.create({
    data: {
      code: "RM-SEED01",
      customerId: customer.id,
      professionalId: stylistUser.id,
      serviceId: signatureColor.id,
      hotelPartnerId: hotel.id,
      status: "CONFIRMED",
      modality: BookingModality.HOTEL,
      appointmentAt: new Date("2026-05-10T16:00:00-04:00"),
      address: hotel.address,
      district: hotel.district,
      hotelName: hotel.name,
      roomNumber: "1204",
      hairLength: HairLength.LONG,
      hairDensity: HairDensity.ABUNDANT,
      subtotal: 89000,
      surchargeLength: 6000,
      surchargeAbundance: 4000,
      surchargeDomicile: 12000,
      totalAmount: 101000,
      depositAmount: 30300,
      balanceAmount: 70700,
      paidAmountTotal: 30300,
      isDepositPaid: true,
      paidAt: new Date("2026-04-20T12:30:00-04:00"),
      paymentProvider: PaymentProvider.MERCADO_PAGO,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: PaymentProvider.MERCADO_PAGO,
      type: PaymentType.DEPOSIT,
      status: PaymentStatus.APPROVED,
      externalReference: booking.id,
      providerPaymentId: "seed-payment-approved-1",
      providerPreferenceId: "seed-preference-1",
      amount: 30300,
      paidAt: new Date("2026-04-20T12:30:00-04:00"),
      description: "Abono semilla Reserva RM-SEED01",
    },
  });

  await prisma.notification.create({
    data: {
      userId: customer.id,
      channel: NotificationChannel.IN_APP,
      type: NotificationType.BOOKING_CONFIRMED,
      title: "Reserva confirmada",
      message: "Tu reserva RM-SEED01 quedó confirmada para hotel Grand Orbe.",
    },
  });

  console.log("Seed completado", {
    admin: admin.email,
    customer: customer.email,
    professionals: [stylistUser.email, therapistUser.email],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
