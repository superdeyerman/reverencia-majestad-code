import {
  BookingStatus,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { createPreference } from "@/lib/mercadopago";
import { createPreferenceSchema } from "@/lib/validations";

type Method =
  | "MERCADOPAGO"
  | "WEBPAY"
  | "TRANSFER"
  | "KHIPU"
  | "APPLE_PAY"
  | "GOOGLE_PAY";

function isMethod(value: unknown): value is Method {
  return (
    value === "MERCADOPAGO" ||
    value === "WEBPAY" ||
    value === "TRANSFER" ||
    value === "KHIPU" ||
    value === "APPLE_PAY" ||
    value === "GOOGLE_PAY"
  );
}

function mapProvider(method?: Method): PaymentProvider {
  switch (method) {
    case "MERCADOPAGO":
      return PaymentProvider.MERCADO_PAGO;
    default:
      return PaymentProvider.MERCADO_PAGO;
  }
}

function getRequestMeta(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "";

  const userAgent = req.headers.get("user-agent") || "";

  return { ip, userAgent };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = createPreferenceSchema.safeParse(body);

    if (!payload.success) {
      return NextResponse.json(
        { error: "Solicitud inválida", issues: payload.error.flatten() },
        { status: 400 }
      );
    }

    const bookingId = payload.data.bookingId;
    const method: Method = isMethod(body.method) ? body.method : "MERCADOPAGO";

    const provider = mapProvider(method);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        service: true,
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.ARCHIVED
    ) {
      return NextResponse.json(
        { error: "La reserva no admite pagos" },
        { status: 409 }
      );
    }

    if (booking.isDepositPaid) {
      return NextResponse.json(
        { error: "La reserva ya tiene su abono confirmado" },
        { status: 409 }
      );
    }

    const existingPayment = booking.payments.find(
      (p) =>
        p.provider === provider &&
        p.type === PaymentType.DEPOSIT &&
        p.status === PaymentStatus.PENDING &&
        p.providerPreferenceId
    );

    const amount = booking.depositAmount;

    if (existingPayment && existingPayment.providerPreferenceId) {
      await createAuditLog({
        userId: booking.customerId,
        action: "PAYMENT_PREFERENCE_REUSED",
        entity: "Booking",
        entityId: booking.id,
        metadata: {
          provider,
          preferenceId: existingPayment.providerPreferenceId,
          amount,
          method,
        },
      });

      return NextResponse.json({
        bookingId: booking.id,
        bookingCode: booking.code,
        amount,
        init_point: null,
        providerPreferenceId: existingPayment.providerPreferenceId,
        reused: true,
      });
    }

    let initPoint: string | null = null;
    let sandboxInitPoint: string | null = null;
    let preferenceId: string | null = null;
    let rawPayload: Prisma.InputJsonValue | undefined = undefined;

    if (provider === PaymentProvider.MERCADO_PAGO) {
      const preference = await createPreference({
        bookingId: booking.id,
        bookingCode: booking.code,
        serviceName: booking.service.name,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        amount,
      });

      initPoint = preference.initPoint;
      sandboxInitPoint = preference.sandboxInitPoint;
      preferenceId = preference.preferenceId;
      rawPayload = preference.rawPayload as Prisma.InputJsonValue;
    }

    await prisma.payment.upsert({
      where: {
        provider_externalReference_type: {
          provider,
          externalReference: booking.id,
          type: PaymentType.DEPOSIT,
        },
      },
      update: {
        status: PaymentStatus.PENDING,
        providerPreferenceId: preferenceId,
        amount,
        rawCreatePayload: rawPayload,
      },
      create: {
        bookingId: booking.id,
        provider,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.PENDING,
        externalReference: booking.id,
        providerPreferenceId: preferenceId,
        amount,
        description: `Abono reserva ${booking.code}`,
        rawCreatePayload: rawPayload,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.PENDING_PAYMENT,
        paymentProvider: provider,
        externalReference: booking.id,
      },
    });

    const { ip, userAgent } = getRequestMeta(request);

    await createAuditLog({
      userId: booking.customerId,
      action: "PAYMENT_PREFERENCE_CREATED",
      entity: "Booking",
      entityId: booking.id,
      metadata: {
        provider,
        preferenceId,
        amount,
        ip,
        userAgent,
        method,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      bookingCode: booking.code,
      amount,
      provider,
      method,
      init_point: initPoint,
      sandbox_init_point: sandboxInitPoint,
      providerPreferenceId: preferenceId,
    });
  } catch (error) {
    console.error("create-preference error", error);

    return NextResponse.json(
      { error: "No fue posible crear la preferencia de pago" },
      { status: 500 }
    );
  }
}