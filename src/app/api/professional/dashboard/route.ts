import { BookingStatus, Role } from '@prisma/client';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== Role.PROFESSIONAL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [profile, allBookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: {
        professional: {
          include: {
            services: { include: { service: true } },
            availability: { orderBy: { weekday: 'asc' } },
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: { professionalId: session.id },
      orderBy: { appointmentAt: 'desc' },
      take: 100,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true, durationMinutes: true } },
      },
    }),
  ]);

  if (!profile?.professional) {
    return NextResponse.json({ error: 'Perfil de profesional no encontrado' }, { status: 404 });
  }

  const prof = profile.professional;

  const todayBookings = allBookings.filter((b) => {
    const d = new Date(b.appointmentAt);
    return d >= today && d < tomorrow;
  });

  const upcomingBookings = allBookings
    .filter((b) => {
      const d = new Date(b.appointmentAt);
      return (
        d >= tomorrow &&
        b.status !== BookingStatus.CANCELLED &&
        b.status !== BookingStatus.COMPLETED
      );
    })
    .slice(0, 10);

  const completedBookings = allBookings
    .filter((b) => b.status === BookingStatus.COMPLETED)
    .slice(0, 20);

  const totalCompleted = allBookings.filter((b) => b.status === BookingStatus.COMPLETED).length;
  const totalEarnings = allBookings
    .filter((b) => b.status === BookingStatus.COMPLETED)
    .reduce((sum, b) => sum + Math.round(b.totalAmount * prof.commissionRate), 0);

  const activeCount = allBookings.filter(
    (b) =>
      b.status === BookingStatus.CONFIRMED ||
      b.status === BookingStatus.PENDING ||
      b.status === BookingStatus.IN_PROGRESS,
  ).length;

  function mapBooking(b: (typeof allBookings)[0]) {
    return {
      id: b.id,
      code: b.code,
      clientName: b.customer.name,
      clientPhone: b.customer.phone ?? undefined,
      serviceName: b.service.name,
      durationMinutes: b.service.durationMinutes,
      date: format(b.appointmentAt, 'yyyy-MM-dd'),
      time: format(b.appointmentAt, 'HH:mm'),
      modality: b.modality,
      address: b.address ?? undefined,
      district: b.district ?? undefined,
      hotelName: b.hotelName ?? undefined,
      roomNumber: b.roomNumber ?? undefined,
      status: b.status,
      totalAmount: b.totalAmount,
    };
  }

  return NextResponse.json({
    professional: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? undefined,
      kind: prof.kind,
      level: prof.level,
      specialties: prof.specialties,
      bio: prof.bio ?? undefined,
      rating: prof.rating,
      reviews: prof.reviews,
      commissionRate: prof.commissionRate,
      commissionPercentage: prof.commissionPercentage,
      isActive: prof.isActive,
    },
    stats: {
      totalCompleted,
      totalEarnings,
      activeBookings: activeCount,
      rating: prof.rating,
    },
    todayBookings: todayBookings.map(mapBooking),
    upcomingBookings: upcomingBookings.map(mapBooking),
    recentCompleted: completedBookings.map(mapBooking),
    services: prof.services.map((ps) => ({
      id: ps.service.id,
      name: ps.service.name,
      category: ps.service.category,
    })),
    availability: prof.availability,
  });
}
