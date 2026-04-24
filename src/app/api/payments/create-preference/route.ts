import { BookingStatus, PaymentProvider, PaymentStatus, PaymentType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreatePreferenceBody = {
  bookingId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePreferenceBody;
    const bookingId = body.bookingId?.trim();

    // =========================
    // VALIDACIÓN INPUT
    // =========================
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId es obligatorio" },
        { status: 400 }
      );
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    const appUrl = process.env.APP_URL;

    if (!mpAccessToken) {
      console.error("❌ MP_ACCESS_TOKEN faltante");
      return NextResponse.json(
        { error: "Configuración de pagos incompleta" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      console.error("❌ APP_URL faltante");
      return NextResponse.json(
        { error: "Configuración de aplicación incompleta" },
        { status: 500 }
      );
    }

    // =========================
    // BUSCAR RESERVA
    // =========================
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        code: true,
        totalAmount: true,
        depositAmount: true,
        isDepositPaid: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // =========================
    // VALIDACIONES DE NEGOCIO
    // =========================
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      return NextResponse.json(
        { error: "La reserva no permite pagos" },
        { status: 409 }
      );
    }

    if (booking.isDepositPaid) {
      return NextResponse.json(
        { error: "La reserva ya tiene el abono pagado" },
        { status: 409 }
      );
    }

    const amount = Number(booking.depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      );
    }

    // =========================
    // PAYLOAD MERCADO PAGO
    // =========================
    const preferencePayload = {
      items: [
        {
          id: booking.id,
          title: `Reserva ${booking.code}`,
          description: "Abono Reverencia Majestad",
          quantity: 1,
          currency_id: "CLP",
          unit_price: amount,
        },
      ],

      payer: booking.customer?.email
        ? {
            name: booking.customer.name ?? "Cliente",
            email: booking.customer.email,
          }
        : undefined,

      external_reference: booking.id,

      metadata: {
        booking_id: booking.id,
        booking_code: booking.code,
        source: "reverencia-majestad",
      },

      back_urls: {
        success: `${appUrl}/checkout/success?bookingId=${booking.id}`,
        failure: `${appUrl}/checkout/failure?bookingId=${booking.id}`,
        pending: `${appUrl}/checkout/pending?bookingId=${booking.id}`,
      },

      auto_return: "approved",

      notification_url: `${appUrl}/api/webhooks/mercadopago`,

      statement_descriptor: "REVERENCIA SPA",
    };

    // =========================
    // LLAMADA A MERCADO PAGO
    // =========================
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpAccessToken}`,
        },
        body: JSON.stringify(preferencePayload),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error Mercado Pago:", data);

      return NextResponse.json(
        {
          error: "Error creando preferencia",
          detail: data,
        },
        { status: response.status || 500 }
      );
    }

    // =========================
    // REGISTRAR PAYMENT (CREATED)
    // =========================
    // Upsert: si ya existe (retry), actualiza preferenceId y resetea a CREATED
    // Solo si no está APPROVED (no podría llegar aquí, pero doble seguro)
    await prisma.payment.upsert({
      where: {
        provider_externalReference_type: {
          provider: PaymentProvider.MERCADO_PAGO,
          externalReference: booking.id,
          type: PaymentType.DEPOSIT,
        },
      },
      update: {
        status: PaymentStatus.CREATED,
        providerPreferenceId: data.id,
        providerPaymentId: null,
        amount,
      },
      create: {
        bookingId: booking.id,
        provider: PaymentProvider.MERCADO_PAGO,
        type: PaymentType.DEPOSIT,
        status: PaymentStatus.CREATED,
        externalReference: booking.id,
        providerPreferenceId: data.id,
        currency: "CLP",
        amount,
        description: `Abono reserva ${booking.code}`,
      },
    });

    // =========================
    // RESPUESTA FINAL
    // =========================
    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point ?? null,
      bookingId: booking.id,
      bookingCode: booking.code,
      amount,
    });
  } catch (error) {
    console.error("🔥 Error interno create-preference:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}