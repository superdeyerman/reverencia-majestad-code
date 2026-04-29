'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCLP, formatDuration } from '@/lib/utils';

type Service = {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  durationMinutes: number;
  isFeatured: boolean;
};

export default function MultiServiceSelector({
  services,
}: {
  services: Service[];
}) {
  const router = useRouter();

  const [selected, setSelected] = useState<Service[]>([]);
  const [detail, setDetail] = useState<Service | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const subtotal = useMemo(
    () => selected.reduce((sum, s) => sum + s.basePrice, 0),
    [selected]
  );

  const discount = selected.length >= 4 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const isSelected = (id: string) =>
    selected.some((s) => s.id === id);

  const toggleService = (service: Service) => {
    setSelected((current) =>
      current.some((s) => s.id === service.id)
        ? current.filter((s) => s.id !== service.id)
        : [...current, service]
    );
  };

  const continueBooking = () => {
    if (selected.length === 0) return;

    const ids = selected.map((s) => s.id).join(',');

    router.push(`/reservar/confirmar?services=${ids}`);
  };

  return (
    <>
      {/* CART FLOAT */}
      {selected.length > 0 && (
        <div className="fixed right-8 top-28 z-50">
          <button
            type="button"
            onClick={() => setCartOpen((v) => !v)}
            className="group flex items-center gap-4 rounded-full border border-gold/30 bg-white/95 px-5 py-3 shadow-2xl backdrop-blur transition hover:border-gold hover:-translate-y-0.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-char text-white">
              🛍
            </span>

            <span className="text-left">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                Tu selección
              </span>
              <span className="block font-sans text-sm font-semibold text-char">
                {selected.length} servicio{selected.length > 1 ? 's' : ''} · {formatCLP(total)}
              </span>
            </span>

            <span className="text-gold transition group-hover:translate-x-0.5">
              →
            </span>
          </button>

          {cartOpen && (
            <div className="mt-3 w-[380px] rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
              <h3 className="mb-3 font-serif text-2xl text-char">
                Resumen
              </h3>

              <div className="max-h-52 overflow-auto space-y-2 text-sm">
                {selected.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between gap-3 border-b border-stone-100 pb-2"
                  >
                    <span>{s.name}</span>

                    <button
                      type="button"
                      onClick={() => toggleService(s)}
                      className="text-xs text-red-500"
                    >
                      quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
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

                <div className="flex justify-between text-base font-semibold">
                  <span>Total estimado</span>
                  <span>{formatCLP(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={continueBooking}
                className="mt-5 w-full rounded-xl bg-char py-4 font-medium text-white"
              >
                Continuar reserva
              </button>
            </div>
          )}
        </div>
      )}

      {/* GRID SERVICIOS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const active = isSelected(service.id);

          return (
            <article
              key={service.id}
              className={`group relative flex min-h-[400px] flex-col rounded-[28px] border bg-white p-8 transition ${
                active
                  ? 'border-gold bg-gold/5'
                  : 'border-stone-200 hover:border-gold/40'
              }`}
            >
              {service.isFeatured && (
                <span className="absolute -top-3 left-8 rounded-full border border-gold/30 bg-white px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
                  ✦ Destacado
                </span>
              )}

              <button
                type="button"
                onClick={() => setDetail(service)}
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-lg text-gold"
              >
                ✂
              </button>

              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
                {service.category?.replaceAll('_', ' & ')}
              </p>

              <button
                type="button"
                onClick={() => setDetail(service)}
                className="text-left"
              >
                <h2 className="mb-3 font-serif text-2xl text-char transition hover:text-gold">
                  {service.name}
                </h2>
              </button>

              <p className="mb-6 line-clamp-4 text-sm text-gray">
                {service.description}
              </p>

              <div className="mt-auto border-t border-stone-200 pt-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl text-char">
                      {formatCLP(service.basePrice)}
                    </p>
                    <p className="mt-1 text-xs text-gray">
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
                      active
                        ? 'border-gold bg-gold text-white'
                        : 'border-stone-200 text-char hover:border-gold hover:text-gold'
                    }`}
                  >
                    {active ? 'Elegido' : 'Elegir →'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setDetail(service)}
                  className="mt-4 text-xs text-gray underline underline-offset-4 hover:text-gold"
                >
                  Ver detalle
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* MODAL DETALLE */}
      {detail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-6">
          <div className="max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
              {detail.category?.replaceAll('_', ' & ')}
            </p>

            <h2 className="mb-4 font-serif text-4xl text-char">
              {detail.name}
            </h2>

            <p className="mb-6 text-sm text-gray">
              {detail.description}
            </p>

            <div className="mb-6 rounded-2xl bg-cream p-5 text-sm">
              <p><strong>Precio:</strong> {formatCLP(detail.basePrice)}</p>
              <p><strong>Duración:</strong> {formatDuration(detail.durationMinutes)}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="flex-1 rounded-xl border border-stone-200 py-4"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleService(detail);
                  setDetail(null);
                  setCartOpen(true);
                }}
                className="flex-1 rounded-xl bg-char py-4 text-white"
              >
                {isSelected(detail.id)
                  ? 'Quitar servicio'
                  : 'Elegir servicio'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}