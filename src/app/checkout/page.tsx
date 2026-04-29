import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import Link from "next/link";
import PaymentMethods from "@/components/checkout/PaymentMethods";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { reserva?: string };
}) {
  const reservaId = searchParams.reserva;

  if (!reservaId) {
    return (
      <main className="min-h-screen bg-cream px-6 py-20">
        <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-serif text-char mb-4">
            Reserva no encontrada
          </h1>

          <p className="text-sm text-gray mb-6">
            No se pudo cargar la reserva. Intenta nuevamente.
          </p>

          <Link
            href="/reservar"
            className="inline-block rounded-xl bg-char px-6 py-4 text-white"
          >
            Volver a reservar
          </Link>
        </section>
      </main>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: reservaId },
    include: {
      items: true,
      customer: true,
      service: true,
    },
  });

  if (!booking) {
    return (
      <main className="min-h-screen bg-cream px-6 py-20">
        <section className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-serif text-char mb-4">
            Reserva no encontrada
          </h1>

          <Link
            href="/reservar"
            className="inline-block rounded-xl bg-char px-6 py-4 text-white"
          >
            Volver
          </Link>
        </section>
      </main>
    );
  }

  // 🔥 Protección mínima por si viene raro desde DB
  const subtotal = booking.subtotal ?? 0;
  const discount = booking.discount ?? 0;
  const total = Math.max(booking.totalAmount ?? 0, 0);
  const deposit = Math.max(booking.depositAmount ?? 0, 0);

  return (
    <main className="min-h-screen bg-cream px-6 py-20">
      <section className="mx-auto max-w-6xl grid lg:grid-cols-[1.2fr_420px] gap-12">

        {/* RESUMEN */}
        <div className="rounded-3xl border border-stone-200 bg-white p-10 shadow-sm">
          <h1 className="text-4xl font-serif text-char mb-6">
            Confirma y paga
          </h1>

          <div className="space-y-4">
            {booking.items?.length > 0 ? (
              booking.items.map((item) => (
                <div key={item.id} className="border-b border-stone-100 pb-3">
                  <p className="font-medium text-char">
                    {item.nameSnapshot}
                  </p>
                  <p className="text-sm text-gray">
                    {formatCLP(item.priceSnapshot)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray">
                No hay ítems asociados a esta reserva.
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2 border-t border-stone-200 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCLP(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Descuento</span>
                <span>-{formatCLP(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCLP(total)}</span>
            </div>

            <div className="flex justify-between text-gold font-medium mt-2">
              <span>Abono ahora</span>
              <span>{formatCLP(deposit)}</span>
            </div>
          </div>

          {/* INFO EXTRA */}
          <div className="mt-6 text-xs text-gray space-y-1">
            <p>✔ Cancelación gratuita hasta 24h antes</p>
            <p>✔ Profesionales certificados</p>
            <p>✔ Confirmación por WhatsApp</p>
          </div>
        </div>

        {/* PAGO */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-serif mb-4">
            Método de pago
          </h2>

          <p className="text-sm text-gray mb-6">
            Selecciona cómo quieres pagar tu abono.
          </p>

          {/* 🔥 COMPONENTE FUNCIONAL */}
          <PaymentMethods
            bookingId={booking.id}
            amount={deposit}
          />

          <p className="mt-4 text-xs text-gray text-center">
            Pago 100% seguro · SSL · Soporte internacional
          </p>
        </div>

      </section>
    </main>
  );
}