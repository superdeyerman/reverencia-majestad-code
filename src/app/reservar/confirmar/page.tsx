import { prisma } from '@/lib/prisma';
import { formatCLP, formatDuration } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ConfirmarReservaPage({
  searchParams,
}: {
  searchParams: Promise<{ services?: string }>;
}) {
  const params = await searchParams;
  const ids = params.services?.split(',').filter(Boolean) ?? [];

  if (ids.length === 0) {
    return (
      <main className="bg-cream min-h-screen px-6 py-20">
        <section className="mx-auto max-w-3xl rounded-[32px] border border-stone-200 bg-white p-10 shadow-sm">
          <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
            Reverencia Majestad
          </p>

          <h1 className="mb-4 font-serif text-4xl text-char">
            No hay servicios seleccionados
          </h1>

          <p className="mb-8 font-sans text-sm leading-relaxed text-gray">
            Para continuar con tu solicitud, primero selecciona uno o varios servicios.
          </p>

          <Link
            href="/reservar"
            className="inline-flex rounded-2xl bg-char px-6 py-4 text-sm font-medium text-white"
          >
            Volver a elegir servicios
          </Link>
        </section>
      </main>
    );
  }
  const services = await prisma.service.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
  });

  if (services.length === 0) {
    return (
      <main className="bg-cream min-h-screen px-6 py-20">
        <section className="mx-auto max-w-3xl rounded-[32px] border bg-white p-10 shadow-sm">
          <h1 className="font-serif text-3xl text-char">
            No hay servicios disponibles
          </h1>

          <p className="mt-4 text-sm text-gray">
            Los servicios seleccionados ya no están activos.
          </p>

          <Link
            href="/reservar"
            className="mt-6 inline-block rounded-2xl bg-char px-6 py-4 text-white"
          >
            Volver
          </Link>
        </section>
      </main>
    );
  }

  // ✅ VALIDACIÓN CORRECTA (DESPUÉS DE DEFINIR services)
  if (services.length !== ids.length) {
    return (
      <main className="bg-cream min-h-screen px-6 py-20">
        <section className="mx-auto max-w-3xl rounded-[32px] border bg-white p-10 shadow-sm">
          <h1 className="font-serif text-3xl text-char">
            Servicios no disponibles
          </h1>

          <p className="mt-4 text-sm text-gray">
            Algunos servicios ya no están activos o no existen.
          </p>

          <Link
            href="/reservar"
            className="mt-6 inline-block rounded-2xl bg-char px-6 py-4 text-white"
          >
            Volver
          </Link>
        </section>
      </main>
    );
  }

  const hasHotelPackage = services.some(
    (service) =>
      service.supportsHotel ||
      service.category === 'HOTEL' ||
      service.slug?.includes('hotel')
  );

  const subtotal = services.reduce((sum, s) => sum + s.basePrice, 0);
  const discount = services.length >= 4 ? Math.round(subtotal * 0.1) : 0;

  // ✅ PROTECCIÓN
  const total = Math.max(subtotal - discount, 0);

  return (
    <main className="bg-cream min-h-screen px-6 py-20">
      <section className="mx-auto max-w-7xl">
        <div className="mb-14">
          <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
            Experiencia Reverencia
          </p>

          <h1 className="mb-4 font-serif text-5xl leading-tight text-char">
            Confirma tu experiencia personalizada
          </h1>

          <p className="max-w-2xl font-sans text-sm leading-relaxed text-gray">
            Ya sabemos qué servicios quieres. Ahora necesitamos saber dónde, cuándo y cómo
            coordinaremos tu experiencia.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.2fr_420px]">
          <form
            action="/api/reserva"
            method="POST"
            className="rounded-[32px] border border-stone-200 bg-white p-10 shadow-sm"
          >
            <input type="hidden" name="serviceIds" value={ids.join(',')} />
            <input type="hidden" name="subtotal" value={subtotal} />
            <input type="hidden" name="discount" value={discount} />
            <input type="hidden" name="total" value={total} />

            <div className="space-y-10">
              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Paso 1
                </p>

                <h2 className="font-serif text-3xl text-char">
                  ¿Cuándo quieres el servicio?
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    type="time"
                    name="time"
                    required
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Paso 2
                </p>

                <h2 className="font-serif text-3xl text-char">
                  ¿Dónde quieres el servicio?
                </h2>

                <p className="mt-2 text-sm text-gray">
                  Elige la modalidad para coordinar disponibilidad y logística.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="cursor-pointer rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-gold">
                    <input
                      type="radio"
                      name="modality"
                      value="HOME"
                      required
                      className="peer sr-only"
                    />

                    <div className="rounded-2xl border border-stone-100 p-4 peer-checked:border-gold peer-checked:bg-gold/10">
                      <p className="font-serif text-xl text-char">A domicilio</p>

                      <p className="mt-2 text-xs leading-relaxed text-gray">
                        Vamos a tu casa, departamento u oficina.
                      </p>
                    </div>
                  </label>

                  <label className="cursor-pointer rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-gold">
                    <input
                      type="radio"
                      name="modality"
                      value="PRIVATE_STUDIO"
                      required
                      className="peer sr-only"
                    />

                    <div className="rounded-2xl border border-stone-100 p-4 peer-checked:border-gold peer-checked:bg-gold/10">
                      <p className="font-serif text-xl text-char">Estudio privado</p>

                      <p className="mt-2 text-xs leading-relaxed text-gray">
                        Vienes a nuestro espacio privado con reserva.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`rounded-3xl border bg-white p-5 transition ${
                      hasHotelPackage
                        ? 'cursor-pointer border-stone-200 hover:border-gold'
                        : 'cursor-not-allowed border-stone-100 opacity-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modality"
                      value="HOTEL"
                      required
                      disabled={!hasHotelPackage}
                      className="peer sr-only"
                    />

                    <div className="rounded-2xl border border-stone-100 p-4 peer-checked:border-gold peer-checked:bg-gold/10">
                      <p className="font-serif text-xl text-char">Hotel / habitación</p>

                      <p className="mt-2 text-xs leading-relaxed text-gray">
                        Disponible para paquetes in-room o convenios hoteleros.
                      </p>
                    </div>
                  </label>
                </div>

                {!hasHotelPackage && (
                  <p className="mt-3 text-xs text-gray">
                    La opción hotel se activa al elegir un paquete hotelero o experiencia in-room.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Paso 3
                </p>

                <h2 className="font-serif text-3xl text-char">
                  Dirección o referencia
                </h2>

                <p className="mt-2 text-sm text-gray">
                  Si eliges estudio privado, te enviaremos la dirección exacta en la confirmación final.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <input
                    name="region"
                    placeholder="Región"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="city"
                    placeholder="Ciudad"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="commune"
                    placeholder="Comuna"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="street"
                    placeholder="Calle"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="streetNumber"
                    placeholder="Número"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="unit"
                    placeholder="Depto / casa / oficina / referencia"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />
                </div>

                {hasHotelPackage && (
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <input
                      name="hotelName"
                      placeholder="Nombre del hotel"
                      className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                    />

                    <input
                      name="roomNumber"
                      placeholder="Habitación / suite"
                      className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Paso 4
                </p>

                <h2 className="font-serif text-3xl text-char">
                  Datos de contacto
                </h2>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <input
                    name="firstName"
                    required
                    placeholder="Nombre"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="lastName"
                    required
                    placeholder="Apellido"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="phone"
                    required
                    placeholder="WhatsApp / Teléfono"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Correo electrónico"
                    className="w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
                  Paso 5
                </p>

                <h2 className="font-serif text-3xl text-char">
                  Detalles adicionales
                </h2>

                <textarea
                  name="notes"
                  placeholder="Cuéntanos detalles importantes: ocasión, preferencias, alergias, referencias, cantidad de personas, etc."
                  className="mt-6 min-h-36 w-full rounded-2xl border border-stone-200 p-4 text-sm transition focus:border-gold focus:outline-none"
                />

                <button
                  type="submit"
                  className="mt-6 w-full rounded-2xl bg-char py-5 font-medium tracking-wide text-white transition hover:bg-black"
                >
                  Enviar solicitud y continuar al pago de reserva
                </button>
              </div>
            </div>
          </form>

          <aside className="sticky top-32 h-fit rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
              Resumen
            </p>

            <h2 className="mb-6 font-serif text-3xl text-char">
              Tu selección
            </h2>

            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.id} className="border-b border-stone-100 pb-4 last:border-0">
                  <p className="font-sans text-sm font-medium text-char">{s.name}</p>
                  <p className="mt-1 text-xs text-gray">{formatDuration(s.durationMinutes)}</p>
                  <p className="mt-2 font-serif text-lg text-char">{formatCLP(s.basePrice)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCLP(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Descuento 10%</span>
                  <span>-{formatCLP(discount)}</span>
                </div>
              )}

              <div className="flex justify-between pt-3 text-lg font-semibold text-char">
                <span>Total estimado</span>
                <span>{formatCLP(total)}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-cream p-5">
              <p className="text-xs leading-relaxed text-gray">
                El pago inicial asegura la coordinación. La confirmación final depende de disponibilidad,
                modalidad y aceptación de profesionales.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}