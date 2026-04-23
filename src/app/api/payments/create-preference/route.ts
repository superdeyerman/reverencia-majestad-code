import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, bookingId } = body;

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: "amount y bookingId son obligatorios" },
        { status: 400 }
      );
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Falta MP_ACCESS_TOKEN en variables de entorno" },
        { status: 500 }
      );
    }

    if (!process.env.APP_URL) {
      return NextResponse.json(
        { error: "Falta APP_URL en variables de entorno" },
        { status: 500 }
      );
    }

    const preferencePayload = {
      items: [
        {
          title: "Reserva Reverencia Majestad",
          description: "Abono de reserva",
          quantity: 1,
          currency_id: "CLP",
          unit_price: Number(amount),
        },
      ],

      payer: {
        name: "Cliente Reverencia",
        email: "test_user_123456@testuser.com",
      },

      external_reference: String(bookingId),

      metadata: {
        booking_id: String(bookingId),
        source: "reverencia-majestad",
      },

      back_urls: {
        success: `${process.env.APP_URL}/checkout/success`,
        failure: `${process.env.APP_URL}/checkout/failure`,
        pending: `${process.env.APP_URL}/checkout/pending`,
      },

      auto_return: "approved",
      notification_url: `${process.env.APP_URL}/api/webhooks/mercadopago`,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(preferencePayload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago error:", data);
      return NextResponse.json(
        { error: "Error creando preferencia", detail: data },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point ?? null,
    });
  } catch (error) {
    console.error("Error creando pago:", error);
    return NextResponse.json(
      { error: "Error creando pago" },
      { status: 500 }
    );
  }
}