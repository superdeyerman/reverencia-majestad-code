import { BookingModality, HairDensity, HairLength } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateBookingPricing } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

const quoteSchema = z.object({
  serviceId: z.string().trim().min(1),
  modality: z.nativeEnum(BookingModality),
  hairLength: z.nativeEnum(HairLength).optional().nullable(),
  hairDensity: z.nativeEnum(HairDensity).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  extraServices: z.array(z.string()).optional(),
});

const DISCOUNT_LADDER = [0, 0, 0.05, 0.10, 0.15];

function discountRate(count: number) {
  return DISCOUNT_LADDER[Math.min(count, DISCOUNT_LADDER.length - 1)] ?? 0.15;
}

export async function POST(request: Request) {
  try {
    const parsed = quoteSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.flatten() }, { status: 400 });
    }

    const { serviceId, modality, hairLength, hairDensity, latitude, longitude, extraServices } = parsed.data;
    const allIds = [serviceId, ...(extraServices ?? [])];

    const services = await prisma.service.findMany({
      where: { id: { in: allIds }, isActive: true },
      select: { id: true, name: true, basePrice: true, durationMinutes: true, supportsHairMetrics: true },
    });

    if (!services.find((s) => s.id === serviceId)) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const serviceCount = services.length;
    const discount = discountRate(serviceCount);

    const lineItems = services.map((service) => {
      const pricing = calculateBookingPricing({
        basePrice: service.basePrice,
        hairLength: service.supportsHairMetrics ? (hairLength ?? null) : null,
        hairDensity: service.supportsHairMetrics ? (hairDensity ?? null) : null,
        modality,
        latitude,
        longitude,
      });
      return {
        serviceId: service.id,
        name: service.name,
        basePrice: service.basePrice,
        durationMinutes: service.durationMinutes,
        surchargeLength: pricing.surchargeLength,
        surchargeAbundance: pricing.surchargeAbundance,
        surchargeDomicile: pricing.surchargeDomicile,
        distanceFee: pricing.distanceFee,
        subtotal: pricing.subtotal,
        total: pricing.totalAmount,
      };
    });

    const rawTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = Math.round(rawTotal * discount);
    const totalAmount = rawTotal - discountAmount;
    const depositAmount = Math.max(5000, Math.round(totalAmount * 0.3));
    const balanceAmount = totalAmount - depositAmount;
    const totalDurationMinutes = lineItems.reduce((sum, item) => sum + item.durationMinutes, 0);

    return NextResponse.json({
      serviceCount,
      discountRate: discount,
      discountAmount,
      lineItems,
      rawTotal,
      totalAmount,
      depositAmount,
      balanceAmount,
      totalDurationMinutes,
    });
  } catch (error) {
    console.error("pricing quote error", error);
    return NextResponse.json({ error: "Error al calcular el precio" }, { status: 500 });
  }
}
