import { NotificationChannel, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function buildNotificationMessage({
  type,
  customerName,
  bookingCode,
  appointmentAt,
  serviceName,
}: {
  type: NotificationType;
  customerName: string;
  bookingCode: string;
  appointmentAt: Date;
  serviceName: string;
}) {
  const formattedDate = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(appointmentAt);

  switch (type) {
    case NotificationType.BOOKING_CONFIRMED:
      return {
        title: "Reserva confirmada",
        subject: `Reserva confirmada ${bookingCode}`,
        text: `Hola ${customerName}, tu reserva ${bookingCode} para ${serviceName} fue confirmada para ${formattedDate}.`,
      };
    case NotificationType.BOOKING_REMINDER:
      return {
        title: "Recordatorio de servicio",
        subject: `Recordatorio ${bookingCode}`,
        text: `Te recordamos tu experiencia ${serviceName} agendada para ${formattedDate}.`,
      };
    case NotificationType.PAYMENT_UPDATE:
      return {
        title: "Actualización de pago",
        subject: `Pago actualizado ${bookingCode}`,
        text: `Tu pago de la reserva ${bookingCode} fue actualizado correctamente.`,
      };
    default:
      return {
        title: "Actualización Reverencia",
        subject: `Actualización ${bookingCode}`,
        text: `Tenemos una actualización sobre tu experiencia ${serviceName}.`,
      };
  }
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  channel: NotificationChannel = NotificationChannel.IN_APP,
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      channel,
    },
  });
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to,
      subject,
      text,
    }),
  });

  return response.ok;
}

export async function sendWhatsApp({ to, text }: { to: string; text: string }) {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return false;
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );

  return response.ok;
}

export async function dispatchByChannel({
  channel,
  destination,
  subject,
  text,
}: {
  channel: NotificationChannel;
  destination: string;
  subject: string;
  text: string;
}) {
  if (channel === NotificationChannel.EMAIL) {
    return sendEmail({ to: destination, subject, text });
  }
  if (channel === NotificationChannel.WHATSAPP) {
    return sendWhatsApp({ to: destination, text });
  }
  return true;
}
