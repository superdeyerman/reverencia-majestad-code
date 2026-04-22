import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const bookings = await prisma.booking.findMany({
    where: {
      appointmentAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    },
    include: { service: true, customer: true, professional: true },
    orderBy: { appointmentAt: "desc" },
  });

  const header = ["code", "customer", "service", "professional", "status", "modality", "appointmentAt", "totalAmount"];
  const rows = bookings.map((booking) => [
    booking.code,
    booking.customer.name,
    booking.service.name,
    booking.professional?.name ?? "",
    booking.status,
    booking.modality,
    booking.appointmentAt.toISOString(),
    booking.totalAmount,
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="reverencia-bookings.csv"',
    },
  });
}
