import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceFiltersSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = serviceFiltersSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { category, q, minPrice, maxPrice, featured, page, pageSize } = parsed.data;

  const where = {
    isActive: true,
    ...(category ? { category: category as never } : {}),
    ...(featured !== undefined ? { isFeatured: featured } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { basePrice: { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) } }
      : {}),
    ...(q
      ? { OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ] }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ isFeatured: "desc" }, { category: "asc" }, { basePrice: "asc" }],
      select: {
        id: true, slug: true, name: true, category: true, description: true,
        basePrice: true, durationMinutes: true, supportsHome: true,
        supportsHotel: true, supportsHairMetrics: true, isFeatured: true,
      },
    }),
  ]);

  return NextResponse.json({ data, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}
