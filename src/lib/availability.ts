import { addMinutes, endOfDay, setHours, setMinutes, startOfDay } from "date-fns";
import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

export async function getAvailabilityForDate(serviceId: string, date: Date) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const professionals = await prisma.professionalService.findMany({
    where: {
      serviceId,
      professional: { isActive: true },
    },
    include: {
      professional: {
        include: { user: true },
      },
    },
  });

  const professionalUserIds = professionals.map((item) => item.professional.userId);

  const bookings = await prisma.booking.findMany({
    where: {
      professionalId: { in: professionalUserIds },
      status: { not: BookingStatus.CANCELLED },
      appointmentAt: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
    include: { service: true },
  });

  const startHour = 9;
  const endHour = 20;
  const slots: Array<{ slot: string; available: boolean; professionals: number }> = [];

  for (let hour = startHour; hour <= endHour; hour += 1) {
    const slotStart = setMinutes(setHours(new Date(date), hour), 0);
    const slotEnd = addMinutes(slotStart, service.durationMinutes);

    let freePros = 0;

    for (const professional of professionals) {
      const professionalBookings = bookings.filter((booking) => booking.professionalId === professional.professional.userId);
      const busy = professionalBookings.some((booking) =>
        overlaps(slotStart, slotEnd, booking.appointmentAt, addMinutes(booking.appointmentAt, booking.service.durationMinutes)),
      );

      if (!busy) freePros += 1;
    }

    slots.push({
      slot: `${String(hour).padStart(2, "0")}:00`,
      available: freePros > 0,
      professionals: freePros,
    });
  }

  return slots;
}

export async function assignProfessional(serviceId: string, appointmentAt: Date) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return null;

  const candidates = await prisma.professionalService.findMany({
    where: {
      serviceId,
      professional: { isActive: true },
    },
    include: { professional: { include: { user: true } } },
  });

  const dayBookings = await prisma.booking.findMany({
    where: {
      professionalId: { in: candidates.map((candidate) => candidate.professional.userId) },
      status: { not: BookingStatus.CANCELLED },
      appointmentAt: {
        gte: startOfDay(appointmentAt),
        lte: endOfDay(appointmentAt),
      },
    },
    include: { service: true },
  });

  const endAt = addMinutes(appointmentAt, service.durationMinutes);

  for (const candidate of candidates) {
    const busy = dayBookings
      .filter((booking) => booking.professionalId === candidate.professional.userId)
      .some((booking) =>
        overlaps(appointmentAt, endAt, booking.appointmentAt, addMinutes(booking.appointmentAt, booking.service.durationMinutes)),
      );

    if (!busy) return candidate.professional.userId;
  }

  return null;
}
