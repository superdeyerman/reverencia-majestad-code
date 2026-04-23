import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreatePreferenceBody = {
  bookingId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePreferenceBody;
    const bookingId = body.bookingId?.trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId es obligatorio" },
        { status: 400 }
      );
    }

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    const appUrl = process.env.APP_URL;

    if (!mpAccessToken) {
      return NextResponse.json(
        { error: "Falta MP_ACCESS_TOKEN en variables de entorno" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "Falta APP_URL en variables de entorno" },
        { status: 500 }
      );
    }

    // Buscar la reserva real en base de datos
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

    // Si ya está pagado el abono, evita duplicar
    if (booking.isDepositPaid) {
      return NextResponse.json(
        { error: "La reserva ya tiene el abono pagado" },
        { status: 409 }
      );
    }

    const amount = Number(booking.depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido para la reserva" },
        { status: 400 }
      );
    }

    const preferencePayload = {
      items: [
        {
          id: booking.id,
          title: `Reserva Reverencia Majestad ${booking.code}`,
          description: "Abono de reserva",
          quantity: 1,
          currency_id: "CLP",
          unit_price: amount,
        },
      ],

      payer: booking.customer?.email
        ? {
            name: booking.customer.name ?? "Cliente Reverencia",
            email: booking.customer.email,
          }
        : undefined,

      external_reference: booking.id,

      metadata: {
        booking_id: booking.id,
        booking_code: booking.code,
        source: "reverencia-majestad",
        payment_type: "deposit",
      },

      back_urls: {
        success: `${appUrl}/checkout/success?bookingId=${booking.id}`,
        failure: `${appUrl}/checkout/failure?bookingId=${booking.id}`,
        pending: `${appUrl}/checkout/pending?bookingId=${booking.id}`,
      },

      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    };

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
      console.error("Mercado Pago error:", data);
      return NextResponse.json(
        {
          error: "Error creando preferencia",
          detail: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point ?? null,
      bookingId: booking.id,
      bookingCode: booking.code,
      amount,
    });
  } catch (error) {
    console.error("Error creando preferencia:", error);
    return NextResponse.json(
      { error: "Error interno creando preferencia" },
      { status: 500 }
    );
  }
}