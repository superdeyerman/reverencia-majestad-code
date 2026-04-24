import { BookingStatus, PaymentStatus, Role } from "@prisma/client";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Mapping helpers ───────────────────────────────────────────────────────────

type UiStatus = "pending" | "confirmed" | "completed" | "cancelled";

function mapStatus(s: BookingStatus): UiStatus {
  switch (s) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.IN_PROGRESS:
      return "confirmed";
    case BookingStatus.COMPLETED:
      return "completed";
    case BookingStatus.CANCELLED:
      return "cancelled";
    default:
      return "pending";
  }
}

function isPaymentPending(s: BookingStatus) {
  return s === BookingStatus.PAYMENT_PENDING || s === BookingStatus.PAYMENT_FAILED;
}

type Tier = "bronze" | "silver" | "gold" | "platinum";

function loyaltyTier(totalSpent: number, visits: number): Tier {
  if (totalSpent >= 2_000_000 || visits >= 30) return "platinum";
  if (totalSpent >= 800_000  || visits >= 15) return "gold";
  if (totalSpent >= 300_000  || visits >= 7)  return "silver";
  return "bronze";
}

function proLevel(completed: number): Tier {
  if (completed >= 200) return "platinum";
  if (completed >= 100) return "gold";
  if (completed >= 40)  return "silver";
  return "bronze";
}

function nextProLevel(level: Tier): Tier | null {
  return level === "platinum" ? null : ({ bronze: "silver", silver: "gold", gold: "platinum" } as Record<Tier, Tier>)[level];
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.PROFESSIONAL)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [bookingRows, customerRows, revResult, profRows] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { appointmentAt: "desc" },
      take: 150,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            customer: { select: { totalSpent: true, visitCount: true } },
          },
        },
        professional: { select: { name: true } },
        service:      { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where:   { role: Role.CLIENT },
      orderBy: { createdAt: "desc" },
      take:    200,
      include: { customer: true },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.APPROVED },
      _sum:  { amount: true },
    }),
    prisma.user.findMany({
      where:   { role: Role.PROFESSIONAL },
      include: { professional: true },
    }),
  ]);

  // ── Map bookings → UI Reserva shape ───────────────────────────────────────
  const reservas = bookingRows.map((b) => {
    const location = b.hotelName
      ? `${b.hotelName}${b.roomNumber ? `, Suite ${b.roomNumber}` : ""}`
      : b.address
      ? `${b.address}${b.district ? `, ${b.district}` : ""}`
      : b.district ?? "Santiago";

    return {
      id:           b.id,
      code:         b.code,
      clienteName:  b.customer?.name  ?? "Cliente",
      clienteEmail: b.customer?.email ?? undefined,
      serviceName:  b.service?.name   ?? "",
      date:         format(b.appointmentAt, "yyyy-MM-dd"),
      time:         format(b.appointmentAt, "HH:mm"),
      location,
      amount:         b.totalAmount,
      status:         mapStatus(b.status),
      rawStatus:      b.status,
      professional:   b.professional?.name ?? undefined,
      notes:          b.notes ?? undefined,
      isVIP:          (b.customer?.customer?.totalSpent ?? 0) >= 500_000,
      paymentPending: isPaymentPending(b.status),
    };
  });

  // ── Map customers → UI Client shape ───────────────────────────────────────
  const clients = customerRows
    .filter((u) => u.customer)
    .map((u) => ({
      id:            u.id,
      name:          u.name,
      email:         u.email,
      phone:         u.phone ?? undefined,
      totalSpent:    u.customer!.totalSpent,
      visits:        u.customer!.visitCount,
      lastVisitDate: u.customer!.lastVisitAt
        ? format(u.customer!.lastVisitAt, "yyyy-MM-dd")
        : undefined,
      preferences:  u.customer!.preferences
        ? (u.customer!.preferences as string).split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      loyaltyTier: loyaltyTier(u.customer!.totalSpent, u.customer!.visitCount),
    }));

  // ── Map professionals → UI Professional shape ─────────────────────────────
  const professionals = profRows
    .filter((u) => u.professional)
    .map((u) => {
      const prof      = u.professional!;
      const completed = bookingRows.filter(
        (b) => b.professionalId === u.id && b.status === BookingStatus.COMPLETED,
      ).length;
      const earnings = bookingRows
        .filter((b) => b.professionalId === u.id && b.status === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + Math.round(b.totalAmount * prof.commissionRate), 0);
      const level = proLevel(completed);

      return {
        id:                  u.id,
        name:                u.name,
        level,
        completedBookings:   completed,
        totalEarnings:       earnings,
        rating:              4.8,
        reviews:             Math.max(0, Math.floor(completed * 0.75)),
        commissionPercentage: Math.round(prof.commissionRate * 100),
        specialties:         prof.specialties,
        nextLevel:           nextProLevel(level),
      };
    })
    .sort((a, b) => b.completedBookings - a.completedBookings);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevenue    = revResult._sum.amount ?? 0;
  const activeBookings  = bookingRows.filter(
    (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING || b.status === BookingStatus.PAYMENT_PENDING,
  ).length;
  const vipClients      = customerRows.filter(
    (u) => (u.customer?.totalSpent ?? 0) >= 500_000,
  ).length;
  const total           = bookingRows.length;
  const nonCancelled    = bookingRows.filter((b) => b.status !== BookingStatus.CANCELLED).length;
  const occupationRate  = total > 0 ? Math.round((nonCancelled / total) * 100) : 0;

  return NextResponse.json({
    kpis: { totalRevenue, activeBookings, vipClients, occupationRate },
    reservas,
    clients,
    professionals,
  });
}
