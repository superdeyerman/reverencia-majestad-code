import { addHours, subHours } from "date-fns";
import { BookingStatus, NotificationChannel, NotificationType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildNotificationMessage, dispatchByChannel } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // Acepta CRON_SECRET vía Bearer token (para Vercel Cron Jobs)
  // o sesión válida de ADMIN para disparo manual desde el dashboard
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Autorizado por cron secret — continuar
  } else {
    const session = await getSession();
    if (!session || session.role !== Role.ADMIN) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }
  const now = new Date();

  const completedBookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.COMPLETED,
      appointmentAt: { lte: subHours(now, 2) },
      notifications: { none: { type: NotificationType.REVIEW_REQUEST } },
    },
  });

  if (completedBookings.length) {
    await prisma.notificationLog.createMany({
      data: completedBookings.flatMap((booking) => [
        {
          bookingId: booking.id,
          channel: NotificationChannel.EMAIL,
          type: NotificationType.REVIEW_REQUEST,
          scheduledFor: now,
        },
        {
          bookingId: booking.id,
          channel: NotificationChannel.WHATSAPP,
          type: NotificationType.REBOOKING_OFFER,
          scheduledFor: addHours(now, 1),
        },
      ]),
    });
  }

  const queue = await prisma.notificationLog.findMany({
    where: {
      sentAt: null,
      scheduledFor: { lte: now },
    },
    include: {
      booking: {
        include: {
          customer: true,
          service: true,
        },
      },
    },
    take: 50,
  });

  let sent = 0;
  for (const item of queue) {
    const message = buildNotificationMessage({
      type: item.type,
      customerName: item.booking.customer.name,
      bookingCode: item.booking.code,
      appointmentAt: item.booking.appointmentAt,
      serviceName: item.booking.service.name,
    });

    const destination = item.channel === NotificationChannel.EMAIL ? item.booking.customer.email : item.booking.customer.phone.replace(/\D/g, "");
    const ok = await dispatchByChannel({
      channel: item.channel,
      destination,
      subject: message.subject,
      text: message.text,
    });

    await prisma.notificationLog.update({
      where: { id: item.id },
      data: {
        status: ok ? "sent" : "skipped",
        sentAt: ok ? new Date() : null,
      },
    });

    if (ok) sent += 1;
  }

  return NextResponse.json({ queued: queue.length, sent, completedTriggered: completedBookings.length });
}
