import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const q = searchParams.get("q")?.trim();

  const where = q
    ? { user: { OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ] } }
    : {};

  const [total, data] = await Promise.all([
    prisma.professionalProfile.count({ where }),
    prisma.professionalProfile.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { rating: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        services: { include: { service: { select: { id: true, name: true, category: true } } } },
      },
    }),
  ]);

  return NextResponse.json({ data, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}
