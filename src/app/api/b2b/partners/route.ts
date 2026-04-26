import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const partners = await prisma.hotelPartner.findMany({
    where: { active: true },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: { _count: { select: { bookings: true } } },
  });

  return NextResponse.json({ data: partners });
}
