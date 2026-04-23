import { ProfessionalKind, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";
import { serviceCatalog } from "../src/lib/catalog";
import { prisma } from "../src/lib/prisma";

async function main() {
  for (const item of serviceCatalog) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  const adminPassword = await hashPassword("Majestad2026!");
  const admin = await prisma.user.upsert({
    where: { email: "reverenciamajestad@gmail.com" },
    update: {},
    create: {
      email: "admin@reverenciamajestad.cl",
      passwordHash: 123456,
      name: "Dirección Reverencia",
      phone: "+56963929354",
      role: Role.ADMIN,
    },
  });

  const stylist = await prisma.user.upsert({
    where: { email: "stylist@reverenciamajestad.cl" },
    update: {},
    create: {
      email: "stylist@reverenciamajestad.cl",
      passwordHash: await hashPassword("Stylist2026!"),
      name: "Isidora Véliz",
      phone: "+56922222222",
      role: Role.PROFESSIONAL,
    },
  });

  const therapist = await prisma.user.upsert({
    where: { email: "therapist@reverenciamajestad.cl" },
    update: {},
    create: {
      email: "therapist@reverenciamajestad.cl",
      passwordHash: await hashPassword("Therapy2026!"),
      name: "Amelia Durán",
      phone: "+56933333333",
      role: Role.PROFESSIONAL,
    },
  });

  const stylistProfile = await prisma.professionalProfile.upsert({
    where: { userId: stylist.id },
    update: {},
    create: {
      userId: stylist.id,
      kind: ProfessionalKind.STYLIST,
      bio: "Especialista en color premium, extensiones y restauración capilar hotel-ready.",
      specialties: ["Color", "Extensiones", "Restauración"],
      commissionRate: 0.38,
    },
  });

  const therapistProfile = await prisma.professionalProfile.upsert({
    where: { userId: therapist.id },
    update: {},
    create: {
      userId: therapist.id,
      kind: ProfessionalKind.THERAPIST,
      bio: "Terapeuta wellness para masaje, facial y rituales de habitación.",
      specialties: ["Masajes", "Faciales", "Spa in-room"],
      commissionRate: 0.4,
    },
  });

  const beautyServices = await prisma.service.findMany({
    where: { category: { in: ["BEAUTY", "SKINCARE"] } },
  });
  const wellnessServices = await prisma.service.findMany({
    where: { category: { in: ["WELLNESS", "SKINCARE"] } },
  });

  for (const service of beautyServices) {
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

  for (const service of wellnessServices) {
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

  await prisma.hotelPartner.upsert({
    where: { email: "concierge@grandorbe.cl" },
    update: {},
    create: {
      name: "Grand Orbe Hotel",
      contactName: "Concierge Premium",
      email: "concierge@grandorbe.cl",
      phone: "+56225550000",
      address: "Av. Apoquindo 3900, Las Condes, Santiago",
      district: "Las Condes",
      commissionRate: 0.14,
      notes: "Piloto de experiencia in-room para suites y huéspedes corporativos.",
    },
  });

  console.log("Seed completado", { admin: admin.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
