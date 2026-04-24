import { BookingStatus, NotificationType, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { calculateCustomerSegment, calculateLoyaltyTier } from "@/lib/loyalty";
import { getMPPayment, mapMPStatus, verifyMPSignature } from "@/lib/mercadopago";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

type MercadoPagoWebhookBody = {
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
  topic?: string;
  type?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  let body: MercadoPagoWebhookBody;

  try {
    body = JSON.parse(rawBody) as MercadoPagoWebhookBody;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const providerPaymentId = String(body.data?.id ?? body.id ?? "");
  const topic = body.type ?? body.topic ?? "payment";

  if (!providerPaymentId || topic !== "payment") {
    return new Response("Ignored", { status: 200 });
  }

  const signatureOk = verifyMPSignature(
    request.headers.get("x-signature"),
    request.headers.get("x-request-id"),
    providerPaymentId,
    rawBody,
  );

  if (!signatureOk) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const existingPayment = await prisma.payment.findUnique({
      where: { providerPaymentId },
      include: { booking: true },
    });

    if (existingPayment?.status === PaymentStatus.APPROVED) {
      return new Response("Already processed", { status: 200 });
    }

    const mpPayment = await getMPPayment(providerPaymentId);
    const mpStatus = mapMPStatus(mpPayment.status);
    const externalReference =
      String(mpPayment.external_reference ?? mpPayment.metadata?.booking_id ?? existingPayment?.externalReference ?? "");

    const payment = existingPayment
      ? await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: mpStatus,
            paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
            amount: Math.round(mpPayment.transaction_amount ?? existingPayment.amount),
            netAmount: Math.round(mpPayment.net_received_amount ?? 0) || null,
            feeAmount:
              mpPayment.fee_details?.reduce((sum, item) => sum + Math.round(item.amount ?? 0), 0) || null,
            statusDetail: mpPayment.status_detail ?? null,
            providerPaymentId,
            rawWebhookPayload: JSON.parse(JSON.stringify(body)),
            rawProviderPayment: JSON.parse(JSON.stringify(mpPayment)),
            processedAt: new Date(),
          },
        })
      : await prisma.payment.create({
          data: {
            bookingId: externalReference,
            externalReference,
            providerPaymentId,
            status: mpStatus,
            amount: Math.round(mpPayment.transaction_amount ?? 0),
            paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
            rawWebhookPayload: JSON.parse(JSON.stringify(body)),
            rawProviderPayment: JSON.parse(JSON.stringify(mpPayment)),
            processedAt: new Date(),
          },
        });

    const booking = await prisma.booking.findUnique({
      where: { id: payment.bookingId },
    });

    if (!booking) {
      return new Response("Booking not found", { status: 404 });
    }

    if (mpStatus === PaymentStatus.APPROVED) {
      const approvedAmount = payment.amount;

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            isDepositPaid: true,
            paidAt: payment.paidAt ?? new Date(),
            paidAmountTotal: approvedAmount,
            paymentProvider: payment.provider,
          },
        });

        const currentProfile = await tx.customerProfile.findUnique({
          where: { userId: booking.customerId },
        });

        if (currentProfile) {
          const nextTotalSpent = currentProfile.totalSpent + approvedAmount;
          const nextVisits = currentProfile.visits + 1;
          await tx.customerProfile.update({
            where: { userId: booking.customerId },
            data: {
              totalSpent: nextTotalSpent,
              visits: nextVisits,
              visitCount: nextVisits,
              lastVisitAt: booking.appointmentAt,
              loyaltyTier: calculateLoyaltyTier(nextTotalSpent, nextVisits),
              segment: calculateCustomerSegment(nextTotalSpent, nextVisits),
            },
          });
        }
      });

      await createNotification(
        booking.customerId,
        NotificationType.BOOKING_CONFIRMED,
        "Reserva confirmada",
        `Tu reserva ${booking.code} fue confirmada correctamente.`,
      );
    }

    await createAuditLog({
      userId: booking.customerId,
      action: "PAYMENT_WEBHOOK_PROCESSED",
      entity: "Payment",
      entityId: payment.id,
      metadata: {
        providerPaymentId,
        status: mpPayment.status ?? "unknown",
        mappedStatus: mpStatus,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("mercadopago webhook error", error);
    return new Response("Internal Error", { status: 500 });
  }
}
