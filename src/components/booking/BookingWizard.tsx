"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { BookingModality, HairDensity, HairLength, ServiceCategory } from "@prisma/client";
import { useBookingWizardStore } from "@/store/booking-wizard";
import { calculateBookingPricing } from "@/lib/pricing";
import { formatCLP, formatDuration } from "@/lib/utils";

type ServiceOption = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  durationMinutes: number;
  supportsHome: boolean;
  supportsHotel: boolean;
  supportsHairMetrics: boolean;
  isFeatured: boolean;
};

const steps = [
  "Servicio",
  "Perfil capilar",
  "Modalidad",
  "Fecha y hora",
  "Datos",
  "Resumen",
] as const;

const categoryLabel: Record<ServiceCategory, string> = {
  BEAUTY: "Hair & Beauty",
  WELLNESS: "Wellness",
  SKINCARE: "Skincare",
};

export default function BookingWizard({ services }: { services: ServiceOption[] }) {
  const state = useBookingWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [slots, setSlots] = useState<Array<{ slot: string; available: boolean; professionals: number }>>([]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === state.serviceId) ?? null,
    [services, state.serviceId],
  );

  const filteredServices = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        categoryLabel[service.category].toLowerCase().includes(query)
      );
    });
  }, [deferredSearch, services]);

  const visibleSlots = selectedService && state.date ? slots : [];

  useEffect(() => {
    let cancelled = false;

    if (!selectedService || !state.date) {
      return;
    }

    void fetch(`/api/availability?serviceId=${selectedService.id}&date=${state.date}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { slots?: Array<{ slot: string; available: boolean; professionals: number }> }) => {
        if (!cancelled) {
          setSlots(payload.slots ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedService, state.date]);

  const pricing = useMemo(() => {
    if (!selectedService) return null;
    return calculateBookingPricing({
      basePrice: selectedService.basePrice,
      hairLength: selectedService.supportsHairMetrics ? state.hairLength : null,
      hairDensity: selectedService.supportsHairMetrics ? state.hairDensity : null,
      modality: state.modality,
      latitude: state.latitude,
      longitude: state.longitude,
    });
  }, [selectedService, state.hairDensity, state.hairLength, state.latitude, state.longitude, state.modality]);

  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 1:
        return Boolean(selectedService);
      case 2:
        return Boolean(selectedService);
      case 3:
        return state.modality !== undefined;
      case 4:
        return Boolean(state.date && state.time);
      case 5:
        return Boolean(
          state.customerName.length >= 3 &&
            state.email.includes("@") &&
            state.phone.length >= 8 &&
            (state.modality === BookingModality.STUDIO || (state.address.length >= 4 && state.district.length >= 2)) &&
            (state.modality !== BookingModality.HOTEL || state.roomNumber.length >= 1),
        );
      default:
        return true;
    }
  }, [selectedService, state]);

  async function calculateDistance() {
    if (!state.address || !state.district) return;

    const response = await fetch(
      `/api/geocode?address=${encodeURIComponent(`${state.address}, ${state.district}, Santiago, Chile`)}`,
      { cache: "no-store" },
    );
    const data = (await response.json()) as { latitude?: number; longitude?: number };

    state.patch({
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    });
  }

  async function submitBooking() {
    if (!selectedService || !pricing) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: state.customerName,
          email: state.email,
          phone: state.phone,
          serviceId: selectedService.id,
          modality: state.modality,
          date: state.date,
          time: state.time,
          address: state.address || null,
          district: state.district || null,
          hotelPartnerId: state.hotelPartnerId,
          hotelName: state.hotelName || null,
          roomNumber: state.roomNumber || null,
          hairLength: selectedService.supportsHairMetrics ? state.hairLength : null,
          hairDensity: selectedService.supportsHairMetrics ? state.hairDensity : null,
          notes: state.notes || null,
          latitude: state.latitude,
          longitude: state.longitude,
        }),
      });

      const payload = (await response.json()) as { error?: string; init_point?: string };
      if (!response.ok || !payload.init_point) {
        throw new Error(payload.error ?? "No fue posible crear la reserva.");
      }

      state.reset();
      window.location.href = payload.init_point;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function nextStep() {
    if (!canAdvance || state.step >= 6) return;
    startTransition(() => state.setStep((state.step + 1) as 2 | 3 | 4 | 5 | 6));
  }

  function prevStep() {
    if (state.step <= 1) return;
    startTransition(() => state.setStep((state.step - 1) as 1 | 2 | 3 | 4 | 5));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.06)]">
        <div className="mb-8 flex flex-wrap gap-3">
          {steps.map((label, index) => {
            const isActive = state.step === index + 1;
            const isDone = state.step > index + 1;
            return (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                    isActive
                      ? "border-stone-950 bg-stone-950 text-white"
                      : isDone
                        ? "border-[#c9a96e] bg-[#c9a96e] text-white"
                        : "border-stone-200 bg-white text-stone-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${isActive ? "text-stone-950" : "text-stone-500"}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {state.step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 1</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Elige tu experiencia</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                Convertimos el catálogo premium en una selección operable en tiempo real. Cada servicio está conectado a pricing, disponibilidad y checkout.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar servicio, categoría o resultado"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
            />

            <div className="grid gap-4 md:grid-cols-2">
              {filteredServices.map((service) => {
                const selected = service.id === state.serviceId;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => state.patch({ serviceId: service.id })}
                    className={`rounded-3xl border p-5 text-left transition ${
                      selected ? "border-[#c9a96e] bg-[#faf7f2]" : "border-stone-200 bg-white hover:border-stone-400"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#9e7a3f]">{categoryLabel[service.category]}</p>
                        <h3 className="mt-2 font-serif text-2xl text-stone-950">{service.name}</h3>
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                        {formatDuration(service.durationMinutes)}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-stone-500">{service.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-950">{formatCLP(service.basePrice)}</span>
                      <span className="text-stone-400">{service.isFeatured ? "Destacado" : "Disponible"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {state.step === 2 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 2</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Perfil capilar</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                El pricing se recalcula en vivo según largo y abundancia. Si el servicio no usa variables capilares, mantenemos el paso como confirmación contextual.
              </p>
            </div>

            {selectedService.supportsHairMetrics ? (
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Largo del cabello
                  <select
                    value={state.hairLength}
                    onChange={(event) => state.patch({ hairLength: event.target.value as HairLength })}
                    className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                  >
                    <option value={HairLength.SHORT}>Corto</option>
                    <option value={HairLength.MEDIUM}>Medio</option>
                    <option value={HairLength.LONG}>Largo</option>
                    <option value={HairLength.EXTRA_LONG}>Extra largo</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  Abundancia
                  <select
                    value={state.hairDensity}
                    onChange={(event) => state.patch({ hairDensity: event.target.value as HairDensity })}
                    className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                  >
                    <option value={HairDensity.THIN}>Fino</option>
                    <option value={HairDensity.NORMAL}>Normal</option>
                    <option value={HairDensity.ABUNDANT}>Abundante</option>
                    <option value={HairDensity.VERY_ABUNDANT}>Muy abundante</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="rounded-3xl border border-stone-200 bg-[#faf7f2] p-6 text-sm leading-7 text-stone-600">
                Este servicio no requiere variables capilares. Pasamos al siguiente paso manteniendo el mismo motor de cotización.
              </div>
            )}
          </div>
        )}

        {state.step === 3 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 3</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Modalidad</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { value: BookingModality.STUDIO, title: "Studio", text: "Experiencia privada en nuestro espacio curado." },
                { value: BookingModality.HOME, title: "Domicilio", text: "Operación premium en tu hogar con recargo transparente." },
                { value: BookingModality.HOTEL, title: "Hotel", text: "Atención in-room con flujo adaptado para concierge y suite." },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => state.patch({ modality: option.value })}
                  disabled={
                    (option.value === BookingModality.HOME && !selectedService.supportsHome) ||
                    (option.value === BookingModality.HOTEL && !selectedService.supportsHotel)
                  }
                  className={`rounded-3xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    state.modality === option.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white"
                  }`}
                >
                  <h3 className="font-serif text-2xl">{option.title}</h3>
                  <p className="mt-3 text-sm leading-7">{option.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {state.step === 4 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 4</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Fecha y horario</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Fecha
                <input
                  type="date"
                  value={state.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => state.patch({ date: event.target.value, time: "" })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Horario
                <select
                  value={state.time}
                  onChange={(event) => state.patch({ time: event.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                >
                  <option value="">Selecciona franja</option>
                  {visibleSlots.map((slot) => (
                    <option key={slot.slot} value={slot.slot} disabled={!slot.available}>
                      {slot.slot} {slot.available ? `· ${slot.professionals} profesionales` : "· no disponible"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {state.step === 5 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 5</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Datos de contacto</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Nombre completo
                <input
                  value={state.customerName}
                  onChange={(event) => state.patch({ customerName: event.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Teléfono
                <input
                  value={state.phone}
                  onChange={(event) => state.patch({ phone: event.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                Email
                <input
                  type="email"
                  value={state.email}
                  onChange={(event) => state.patch({ email: event.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>

              {state.modality !== BookingModality.STUDIO && (
                <>
                  <label className="grid gap-2 text-sm">
                    Comuna
                    <input
                      value={state.district}
                      onChange={(event) => state.patch({ district: event.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Dirección
                    <div className="flex gap-3">
                      <input
                        value={state.address}
                        onChange={(event) => state.patch({ address: event.target.value })}
                        className="min-w-0 flex-1 rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                      />
                      <button
                        type="button"
                        onClick={() => void calculateDistance()}
                        className="rounded-2xl border border-stone-200 px-4 py-3 text-xs uppercase tracking-[0.25em] text-stone-700"
                      >
                        Geo
                      </button>
                    </div>
                  </label>
                </>
              )}

              {state.modality === BookingModality.HOTEL && (
                <>
                  <label className="grid gap-2 text-sm">
                    Hotel
                    <input
                      value={state.hotelName}
                      onChange={(event) => state.patch({ hotelName: event.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Habitación
                    <input
                      value={state.roomNumber}
                      onChange={(event) => state.patch({ roomNumber: event.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                    />
                  </label>
                </>
              )}

              <label className="grid gap-2 text-sm md:col-span-2">
                Notas
                <textarea
                  rows={4}
                  value={state.notes}
                  onChange={(event) => state.patch({ notes: event.target.value })}
                  className="rounded-3xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>
            </div>
          </div>
        )}

        {state.step === 6 && selectedService && pricing && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 6</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Confirmar y pagar</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                Este resumen está conectado al servidor. Al confirmar se crea `Booking`, `Payment` y la preferencia de Mercado Pago antes de redirigir al checkout.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-[#faf7f2] p-6 text-sm text-stone-700">
              <div className="flex justify-between py-2">
                <span>Servicio</span>
                <span>{selectedService.name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Modalidad</span>
                <span>{state.modality}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Fecha</span>
                <span>{state.date} · {state.time}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>{formatCLP(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Recargo largo</span>
                <span>{formatCLP(pricing.surchargeLength)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Recargo abundancia</span>
                <span>{formatCLP(pricing.surchargeAbundance)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Recargo modalidad</span>
                <span>{formatCLP(pricing.surchargeDomicile + pricing.distanceFee)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-stone-200 pt-4 font-semibold text-stone-950">
                <span>Total</span>
                <span>{formatCLP(pricing.totalAmount)}</span>
              </div>
              <div className="mt-2 flex justify-between text-[#9e7a3f]">
                <span>Abono a pagar ahora</span>
                <span>{formatCLP(pricing.depositAmount)}</span>
              </div>
            </div>
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={state.step === 1}
            className="rounded-full border border-stone-200 px-5 py-3 text-sm text-stone-700 disabled:opacity-40"
          >
            Volver
          </button>
          {state.step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canAdvance}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm text-white disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submitBooking()}
              disabled={isSubmitting}
              className="rounded-full bg-[#c9a96e] px-6 py-3 text-sm text-white disabled:opacity-40"
            >
              {isSubmitting ? "Procesando..." : "Confirmar y pagar"}
            </button>
          )}
        </div>
      </section>

      <aside className="h-fit rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-white lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c9a96e]">Resumen vivo</p>
        <h3 className="mt-3 font-serif text-3xl">{selectedService?.name ?? "Selecciona un servicio"}</h3>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          El panel lateral refleja pricing, modalidad y depósito usando las reglas del backend.
        </p>
        <div className="mt-8 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-400">Categoría</span>
            <span>{selectedService ? categoryLabel[selectedService.category] : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Duración</span>
            <span>{selectedService ? formatDuration(selectedService.durationMinutes) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Modalidad</span>
            <span>{state.modality}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Total</span>
            <span>{pricing ? formatCLP(pricing.totalAmount) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Depósito</span>
            <span className="text-[#e8d5b0]">{pricing ? formatCLP(pricing.depositAmount) : "—"}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
