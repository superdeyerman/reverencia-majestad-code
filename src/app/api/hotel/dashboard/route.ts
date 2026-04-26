import { BookingStatus, PaymentStatus, Role } from '@prisma/client';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== Role.HOTEL_MANAGER) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const hotel = await prisma.hotelPartner.findUnique({ where: { email: session.email } });
  if (!hotel) {
    return NextResponse.json({ error: 'Hotel no encontrado para este usuario' }, { status: 404 });
  }

  const bookings = await prisma.booking.findMany({
    where: { hotelPartnerId: hotel.id },
    orderBy: { appointmentAt: 'desc' },
    take: 100,
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      service: { select: { name: true, basePrice: true } },
      professional: { select: { name: true } },
      payments: {
        where: { status: PaymentStatus.APPROVED },
        select: { amount: true },
      },
    },
  });

  const totalRevenue = bookings
    .filter((b) => b.status === BookingStatus.COMPLETED)
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const commissionEarned = Math.round(totalRevenue * hotel.commissionRate);

  const activeBookings = bookings.filter(
    (b) =>
      b.status === BookingStatus.CONFIRMED ||
      b.status === BookingStatus.PENDING ||
      b.status === BookingStatus.IN_PROGRESS,
  ).length;

  const completedCount = bookings.filter((b) => b.status === BookingStatus.COMPLETED).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = bookings.filter((b) => {
    const d = new Date(b.appointmentAt);
    return d >= today && d < tomorrow;
  });

  const upcoming = bookings
    .filter((b) => {
      const d = new Date(b.appointmentAt);
      return (
        d >= tomorrow &&
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.COMPLETED
      );
    })
    .slice(0, 10);

  function mapBooking(b: (typeof bookings)[0]) {
    return {
      id: b.id,
      code: b.code,
      clientName: b.customer.name,
      clientPhone: b.customer.phone ?? undefined,
      serviceName: b.service.name,
      roomNumber: b.roomNumber ?? undefined,
      professional: b.professional?.name ?? undefined,
      date: format(b.appointmentAt, 'yyyy-MM-dd'),
      time: format(b.appointmentAt, 'HH:mm'),
      status: b.status,
      totalAmount: b.totalAmount,
      depositAmount: b.depositAmount,
      isDepositPaid: b.isDepositPaid,
    };
  }

  return NextResponse.json({
    hotel: {
      id: hotel.id,
      name: hotel.name,
      contactName: hotel.contactName,
      email: hotel.email,
      district: hotel.district ?? undefined,
      commissionRate: hotel.commissionRate,
      commissionPercentage: Math.round(hotel.commissionRate * 100),
    },
    stats: {
      totalRevenue,
      commissionEarned,
      activeBookings,
      completedCount,
      totalBookings: bookings.length,
    },
    todayBookings: todayBookings.map(mapBooking),
    upcomingBookings: upcoming.map(mapBooking),
    recentBookings: bookings.slice(0, 20).map(mapBooking),
  });
}
