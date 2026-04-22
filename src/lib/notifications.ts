import { NotificationChannel, NotificationType } from "@prisma/client";

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
        subject: `Reserva confirmada ${bookingCode}`,
        text: `Hola ${customerName}, tu reserva ${bookingCode} para ${serviceName} fue recibida. Fecha: ${formattedDate}.`,
      };
    case NotificationType.BOOKING_REMINDER:
      return {
        subject: `Recordatorio ${bookingCode}`,
        text: `Te esperamos en tu experiencia ${serviceName}. Recordatorio de cita: ${formattedDate}.`,
      };
    case NotificationType.REVIEW_REQUEST:
      return {
        subject: `¿Cómo estuvo tu experiencia ${bookingCode}?`,
        text: `Gracias por elegir Reverencia Majestad. Queremos tu reseña sobre ${serviceName}.`,
      };
    case NotificationType.REBOOKING_OFFER:
      return {
        subject: `Tu próximo ritual premium`,
        text: `Tenemos disponibilidad prioritaria para tu próxima experiencia ${serviceName}. Responde este mensaje para reagendar.`,
      };
    default:
      return {
        subject: `Actualización de tu experiencia ${bookingCode}`,
        text: `Hola ${customerName}, tenemos una actualización sobre ${serviceName}.`,
      };
  }
}

export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return false;

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
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return false;

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
  return sendWhatsApp({ to: destination, text });
}
