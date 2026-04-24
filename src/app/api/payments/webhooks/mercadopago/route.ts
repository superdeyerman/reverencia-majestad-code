import { BookingStatus, PaymentProvider, PaymentStatus, PaymentType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getMPPayment, verifyMPSignature } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

function mapMPStatus(status: string): PaymentStatus {
  if (status === "approved") return PaymentStatus.APPROVED;
  if (status === "pending" || status === "in_process") return PaymentStatus.PENDING;
  if (status === "refunded") return PaymentStatus.REFUNDED;
  if (status === "rejected") return PaymentStatus.REJECTED;
  if (status === "cancelled") return PaymentStatus.CANCELLED;
  return PaymentStatus.FAILED;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifyMPSignature(req.headers.get("x-signature"), rawBody)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = JSON.parse(rawBody) as { data?: { id?: string | number } };
  const providerPaymentId = String(body.data?.id ?? "");

  if (!providerPaymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { providerPaymentId },
    select: { id: true, status: true, bookingId: true },
  });

  if (existingPayment?.status === PaymentStatus.APPROVED) {
    return new NextResponse("Already processed", { status: 200 });
  }

  const mpPayment = await getMPPayment(providerPaymentId);
  const bookingId = String(mpPayment.external_reference ?? mpPayment.metadata?.booking_id ?? "");

  if (!bookingId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "missing_booking_reference" });
  }

  const payment = await prisma.payment.upsert({
    where: {
      provider_externalReference_type: {
        provider: PaymentProvider.MERCADO_PAGO,
        externalReference: bookingId,
        type: PaymentType.DEPOSIT,
      },
    },
    update: {
      providerPaymentId,
      status: mapMPStatus(mpPayment.status),
      paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
      rawProviderPayment: JSON.parse(JSON.stringify(mpPayment)),
      processedAt: new Date(),
    },
    create: {
      bookingId,
      provider: PaymentProvider.MERCADO_PAGO,
      type: PaymentType.DEPOSIT,
      externalReference: bookingId,
      providerPaymentId,
      status: mapMPStatus(mpPayment.status),
      currency: "CLP",
      amount: Math.round(mpPayment.transaction_amount ?? 0),
      paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved) : null,
      rawProviderPayment: JSON.parse(JSON.stringify(mpPayment)),
      processedAt: new Date(),
    },
  });

  if (mpPayment.status === "approved") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        isDepositPaid: true,
        paidAt: payment.paidAt ?? new Date(),
        paymentProvider: PaymentProvider.MERCADO_PAGO,
        paidAmountTotal: payment.amount,
        lastPaymentId: payment.id,
      },
    });
  }

  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      provider: PaymentProvider.MERCADO_PAGO,
      eventType: "webhook_processed",
      resourceId: providerPaymentId,
      externalReference: bookingId,
      payload: JSON.parse(rawBody),
      isProcessed: true,
      processedAt: new Date(),
    },
  });

  return new NextResponse("OK", { status: 200 });
}
