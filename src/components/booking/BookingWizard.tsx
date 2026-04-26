"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { BookingModality, HairDensity, HairLength, ServiceCategory } from "@prisma/client";
import {
  Accessibility,
  Baby,
  Gift,
  Heart,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";
import { useBookingWizardStore } from "@/store/booking-wizard";
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

type QuoteLineItem = {
  serviceId: string;
  name: string;
  basePrice: number;
  durationMinutes: number;
  surchargeLength: number;
  surchargeAbundance: number;
  surchargeDomicile: number;
  distanceFee: number;
  subtotal: number;
  total: number;
};

type QuoteResult = {
  serviceCount: number;
  discountRate: number;
  discountAmount: number;
  lineItems: QuoteLineItem[];
  rawTotal: number;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  totalDurationMinutes: number;
};

const steps = [
  "Servicio",
  "Perfil capilar",
  "Modalidad",
  "Fecha y hora",
  "Datos",
  "Resumen",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  BEAUTY: "Hair & Beauty",
  WELLNESS: "Wellness",
  SKINCARE: "Skincare",
  NAILS: "Nails & Manicura",
  MAKEUP: "Maquillaje",
  BODY_TREATMENTS: "Tratamientos Corporales",
};

type ForWhom = "self" | "couple" | "mother" | "reduced" | "gift";

const forWhomOptions: Array<{ value: ForWhom; label: string; icon: typeof User }> = [
  { value: "self", label: "Para mí", icon: User },
  { value: "couple", label: "Pareja", icon: Heart },
  { value: "mother", label: "Madre reciente", icon: Baby },
  { value: "reduced", label: "Movilidad reducida", icon: Accessibility },
  { value: "gift", label: "Regalo", icon: Gift },
];

const suggestionByProfile: Record<ForWhom, string[]> = {
  self: ["Masaje Relajante · Ideal para hoy", "Skin ritual express", "Hair gloss + peinado"],
  couple: ["Spa parejas", "Ritual romance en hotel", "Wellness + styling"],
  mother: ["Postparto delicado", "Masaje reconfortante", "Skincare calmante"],
  reduced: ["Atención adaptada domicilio", "Wellness suave", "Protocolo accesible"],
  gift: ["Gift experience premium", "Ritual sorpresa", "Pack deluxe"],
};

export default function BookingWizard({
  services,
  preselectedSlug,
}: {
  services: ServiceOption[];
  preselectedSlug?: string | null;
}) {
  const state = useBookingWizardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [slots, setSlots] = useState<Array<{ slot: string; available: boolean; professionals: number }>>([]);
  const [forWhom, setForWhom] = useState<ForWhom>("self");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  // Initialise multi-selection from preselectedSlug (runs once)
  const initialIds = useMemo(() => {
    if (!preselectedSlug) return [];
    const match = services.find((s) => s.slug === preselectedSlug);
    return match ? [match.id] : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(initialIds);

  useEffect(() => {
    if (initialIds.length > 0) {
      state.patch({ serviceId: initialIds[0] ?? null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === state.serviceId) ?? null,
    [services, state.serviceId],
  );

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds],
  );

  const filteredServices = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[s.category] ?? "").toLowerCase().includes(q),
    );
  }, [deferredSearch, services]);

  const visibleSlots = selectedService && state.date ? slots : [];

  // Fetch availability when date changes
  useEffect(() => {
    let cancelled = false;
    if (!selectedService || !state.date) return;

    void fetch(`/api/availability?serviceId=${selectedService.id}&date=${state.date}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((payload: { slots?: typeof slots }) => {
        if (!cancelled) setSlots(payload.slots ?? []);
      })
      .catch(() => { if (!cancelled) setSlots([]); });

    return () => { cancelled = true; };
  }, [selectedService, state.date]);

  // Fetch quote from server whenever selection or pricing inputs change
  useEffect(() => {
    const primaryId = selectedServiceIds[0];
    if (!primaryId) {
      setQuoteResult(null);
      return;
    }

    const controller = new AbortController();
    setIsQuoting(true);

    void fetch("/api/pricing/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: primaryId,
        modality: state.modality,
        hairLength: state.hairLength ?? null,
        hairDensity: state.hairDensity ?? null,
        latitude: state.latitude ?? null,
        longitude: state.longitude ?? null,
        extraServices: selectedServiceIds.slice(1),
      }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: QuoteResult) => { setQuoteResult(data); setIsQuoting(false); })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") setIsQuoting(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceIds, state.modality, state.hairLength, state.hairDensity, state.latitude, state.longitude]);

  const primaryLineItem = quoteResult?.lineItems[0] ?? null;

  const canAdvance = useMemo(() => {
    switch (state.step) {
      case 1: return selectedServiceIds.length > 0;
      case 2: return Boolean(selectedService);
      case 3: return state.modality !== undefined;
      case 4: return Boolean(state.date && state.time);
      case 5: return Boolean(
        state.customerName.length >= 3 &&
        state.email.includes("@") &&
        state.phone.length >= 8 &&
        (state.modality === BookingModality.STUDIO || (state.address.length >= 4 && state.district.length >= 2)) &&
        (state.modality !== BookingModality.HOTEL || state.roomNumber.length >= 1),
      );
      default: return true;
    }
  }, [selectedService, selectedServiceIds.length, state]);

  async function calculateDistance() {
    if (!state.address || !state.district) return;
    const r = await fetch(
      `/api/geocode?address=${encodeURIComponent(`${state.address}, ${state.district}, Santiago, Chile`)}`,
      { cache: "no-store" },
    );
    const data = (await r.json()) as { latitude?: number; longitude?: number };
    state.patch({ latitude: data.latitude ?? null, longitude: data.longitude ?? null });
  }

  async function submitBooking() {
    if (!selectedService || !quoteResult) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const payload = (await r.json()) as { error?: string; init_point?: string };
      if (!r.ok || !payload.init_point) throw new Error(payload.error ?? "No fue posible crear la reserva.");

      state.reset();
      window.location.href = payload.init_point;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleService(id: string) {
    setSelectedServiceIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      state.patch({ serviceId: next[0] ?? null });
      return next;
    });
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
      {/* ── Main panel ── */}
      <section className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.06)]">

        {/* Step indicators */}
        <div className="mb-8 flex flex-wrap gap-3">
          {steps.map((label, i) => {
            const isActive = state.step === i + 1;
            const isDone = state.step > i + 1;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm ${
                  isActive ? "border-stone-950 bg-stone-950 text-white"
                  : isDone ? "border-[#c9a96e] bg-[#c9a96e] text-white"
                  : "border-stone-200 bg-white text-stone-500"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${isActive ? "text-stone-950" : "text-stone-500"}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Service selection ── */}
        {state.step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 1</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Elige tus experiencias</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                Selección multi-servicio con descuento progresivo automático: 2 servicios −5%, 3 servicios −10%, 4+ servicios −15%.
              </p>
            </div>

            {/* For whom */}
            <div className="rounded-3xl border border-stone-200 bg-[#faf7f2] p-4">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#9e7a3f]">
                <Sparkles size={14} />
                ¿Para quién es esta experiencia?
              </p>
              <div className="flex flex-wrap gap-2">
                {forWhomOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForWhom(value)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition ${
                      forWhom === value
                        ? "border-stone-950 bg-stone-950 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                    }`}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[#e8d5b0] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#9e7a3f]">Sugerencias</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestionByProfile[forWhom].map((s) => (
                    <span key={s} className="rounded-full border border-stone-200 bg-[#faf7f2] px-3 py-1 text-xs text-stone-700">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar servicio, categoría o tratamiento"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition focus:border-[#c9a96e]"
            />

            <div className="grid gap-4 md:grid-cols-2">
              {filteredServices.map((service) => {
                const selected = selectedServiceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`rounded-3xl border p-5 text-left transition ${
                      selected ? "border-[#c9a96e] bg-[#faf7f2]" : "border-stone-200 bg-white hover:border-stone-400"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#9e7a3f]">
                          {CATEGORY_LABELS[service.category] ?? service.category}
                        </p>
                        <h3 className="mt-2 font-serif text-2xl text-stone-950">{service.name}</h3>
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                        {formatDuration(service.durationMinutes)}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-stone-500">{service.description}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-950">{formatCLP(service.basePrice)}</span>
                      <span className="text-stone-400">
                        {selected ? "✓ Añadido" : service.isFeatured ? "Destacado" : "Disponible"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2: Hair profile ── */}
        {state.step === 2 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 2</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Perfil capilar</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
                El precio se recalcula en vivo según largo y abundancia.
              </p>
            </div>
            {selectedService.supportsHairMetrics ? (
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Largo del cabello
                  <select
                    value={state.hairLength}
                    onChange={(e) => state.patch({ hairLength: e.target.value as HairLength })}
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
                    onChange={(e) => state.patch({ hairDensity: e.target.value as HairDensity })}
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
                Este servicio no requiere variables capilares. El precio ya está calculado.
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Modality ── */}
        {state.step === 3 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 3</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Modalidad</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { value: BookingModality.STUDIO, title: "Estudio", text: "Experiencia privada en nuestro espacio curado. Sin recargo." },
                { value: BookingModality.HOME, title: "Domicilio", text: "Profesional a tu hogar. Recargo según distancia." },
                { value: BookingModality.HOTEL, title: "Hotel in-room", text: "Atención en suite con flujo de concierge premium." },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => state.patch({ modality: opt.value })}
                  disabled={
                    (opt.value === BookingModality.HOME && !selectedService.supportsHome) ||
                    (opt.value === BookingModality.HOTEL && !selectedService.supportsHotel)
                  }
                  className={`rounded-3xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    state.modality === opt.value ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white"
                  }`}
                >
                  <h3 className="font-serif text-2xl">{opt.title}</h3>
                  <p className="mt-3 text-sm leading-7">{opt.text}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Date & time ── */}
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
                  onChange={(e) => state.patch({ date: e.target.value, time: "" })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Horario
                <select
                  value={state.time}
                  onChange={(e) => state.patch({ time: e.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]"
                >
                  <option value="">Selecciona franja</option>
                  {visibleSlots.map((s) => (
                    <option key={s.slot} value={s.slot} disabled={!s.available}>
                      {s.slot} {s.available ? `· ${s.professionals} profesionales` : "· no disponible"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {/* ── Step 5: Contact data ── */}
        {state.step === 5 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 5</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Datos de contacto</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Nombre completo
                <input value={state.customerName} onChange={(e) => state.patch({ customerName: e.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
              </label>
              <label className="grid gap-2 text-sm">
                Teléfono
                <input value={state.phone} onChange={(e) => state.patch({ phone: e.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                Email
                <input type="email" value={state.email} onChange={(e) => state.patch({ email: e.target.value })}
                  className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
              </label>
              {state.modality !== BookingModality.STUDIO && (
                <>
                  <label className="grid gap-2 text-sm">
                    Comuna
                    <input value={state.district} onChange={(e) => state.patch({ district: e.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Dirección
                    <div className="flex gap-3">
                      <input value={state.address} onChange={(e) => state.patch({ address: e.target.value })}
                        className="min-w-0 flex-1 rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
                      <button type="button" onClick={() => void calculateDistance()}
                        className="rounded-2xl border border-stone-200 px-4 py-3 text-xs uppercase tracking-[0.25em] text-stone-700 transition hover:border-[#c9a96e]">
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
                    <input value={state.hotelName} onChange={(e) => state.patch({ hotelName: e.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Habitación
                    <input value={state.roomNumber} onChange={(e) => state.patch({ roomNumber: e.target.value })}
                      className="rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
                  </label>
                </>
              )}
              <label className="grid gap-2 text-sm md:col-span-2">
                Notas especiales
                <textarea rows={3} value={state.notes} onChange={(e) => state.patch({ notes: e.target.value })}
                  className="rounded-3xl border border-stone-200 px-4 py-3 outline-none transition focus:border-[#c9a96e]" />
              </label>
            </div>
          </div>
        )}

        {/* ── Step 6: Summary & confirm ── */}
        {state.step === 6 && selectedService && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Paso 6</p>
              <h2 className="mt-2 font-serif text-4xl text-stone-950">Confirmar y pagar</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                Precio calculado por el servidor. Al confirmar se crea la reserva y se genera el pago con Mercado Pago.
              </p>
            </div>

            {isQuoting ? (
              <div className="flex items-center gap-3 rounded-3xl border border-stone-200 bg-[#faf7f2] px-6 py-8 text-sm text-stone-500">
                <Loader2 size={16} className="animate-spin text-[#c9a96e]" />
                Calculando precio final…
              </div>
            ) : primaryLineItem && quoteResult ? (
              <div className="rounded-3xl border border-stone-200 bg-[#faf7f2] p-6 text-sm text-stone-700">
                <div className="flex justify-between py-2">
                  <span>Servicio principal</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Modalidad</span>
                  <span>{state.modality}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Fecha y hora</span>
                  <span>{state.date} · {state.time}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Precio base</span>
                  <span>{formatCLP(primaryLineItem.basePrice)}</span>
                </div>
                {primaryLineItem.surchargeLength > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Recargo largo</span>
                    <span>+{formatCLP(primaryLineItem.surchargeLength)}</span>
                  </div>
                )}
                {primaryLineItem.surchargeAbundance > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Recargo abundancia</span>
                    <span>+{formatCLP(primaryLineItem.surchargeAbundance)}</span>
                  </div>
                )}
                {(primaryLineItem.surchargeDomicile + primaryLineItem.distanceFee) > 0 && (
                  <div className="flex justify-between py-2">
                    <span>Recargo modalidad / distancia</span>
                    <span>+{formatCLP(primaryLineItem.surchargeDomicile + primaryLineItem.distanceFee)}</span>
                  </div>
                )}
                {quoteResult.serviceCount > 1 && (
                  <>
                    <div className="mt-2 border-t border-stone-200 pt-3 pb-1 text-[10px] uppercase tracking-[0.22em] text-stone-400">
                      Servicios adicionales ({quoteResult.serviceCount - 1})
                    </div>
                    {quoteResult.lineItems.slice(1).map((item) => (
                      <div key={item.serviceId} className="flex justify-between py-1.5">
                        <span>{item.name}</span>
                        <span>{formatCLP(item.total)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 text-green-700">
                      <span>Descuento {Math.round(quoteResult.discountRate * 100)}%</span>
                      <span>−{formatCLP(quoteResult.discountAmount)}</span>
                    </div>
                  </>
                )}
                <div className="mt-3 flex justify-between border-t border-stone-200 pt-4 font-semibold text-stone-950">
                  <span>Total</span>
                  <span>{formatCLP(quoteResult.totalAmount)}</span>
                </div>
                <div className="mt-2 flex justify-between text-[#9e7a3f]">
                  <span>Abono a pagar ahora (30%)</span>
                  <span className="font-medium">{formatCLP(quoteResult.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Saldo restante</span>
                  <span>{formatCLP(quoteResult.balanceAmount)}</span>
                </div>
              </div>
            ) : null}

            {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={state.step === 1}
            className="rounded-full border border-stone-200 px-5 py-3 text-sm text-stone-700 transition hover:border-stone-400 disabled:opacity-40"
          >
            Volver
          </button>
          {state.step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canAdvance}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm text-white transition hover:bg-stone-800 disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submitBooking()}
              disabled={isSubmitting || isQuoting || !quoteResult}
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a96e] px-6 py-3 text-sm text-white transition hover:bg-[#b98f53] disabled:opacity-40"
            >
              {isSubmitting
                ? <><Loader2 size={14} className="animate-spin" /> Procesando…</>
                : isQuoting
                ? <><Loader2 size={14} className="animate-spin" /> Calculando…</>
                : "Confirmar y pagar"}
            </button>
          )}
        </div>
      </section>

      {/* ── Sticky sidebar ── */}
      <aside className="h-fit rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-white lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.35em] text-[#c9a96e]">Tu selección</p>
        <h3 className="mt-3 font-serif text-3xl">
          {selectedServices.length > 0 ? `${selectedServices.length} servicio${selectedServices.length > 1 ? "s" : ""}` : "Selecciona servicios"}
        </h3>

        {/* Service list */}
        <div className="mt-6 space-y-2">
          {selectedServices.length === 0 ? (
            <p className="text-sm text-stone-400">Aún no has añadido servicios.</p>
          ) : (
            selectedServices.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-stone-400">{CATEGORY_LABELS[s.category] ?? s.category}</p>
                  </div>
                  <span className="text-[#e8d5b0]">{formatCLP(s.basePrice)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing summary */}
        <div className={`mt-8 space-y-3 border-t border-white/10 pt-5 text-sm transition-opacity ${isQuoting ? "opacity-50" : "opacity-100"}`}>
          {isQuoting && (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Loader2 size={12} className="animate-spin" /> Recalculando…
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-stone-400">Subtotal</span>
            <span>{quoteResult ? formatCLP(quoteResult.rawTotal) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Descuento</span>
            <span className={quoteResult && quoteResult.discountAmount > 0 ? "text-green-300" : "text-stone-500"}>
              {quoteResult && quoteResult.discountAmount > 0
                ? `−${Math.round(quoteResult.discountRate * 100)}% (${formatCLP(quoteResult.discountAmount)})`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Modalidad</span>
            <span className="text-stone-300">{state.modality}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-stone-300">Total</span>
            <span>{quoteResult ? formatCLP(quoteResult.totalAmount) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Abono (30%)</span>
            <span className="text-[#e8d5b0]">{quoteResult ? formatCLP(quoteResult.depositAmount) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Saldo restante</span>
            <span className="text-stone-400">{quoteResult ? formatCLP(quoteResult.balanceAmount) : "—"}</span>
          </div>
          {quoteResult && quoteResult.totalDurationMinutes > 0 && (
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-stone-400">Duración total</span>
              <span className="text-stone-300">{formatDuration(quoteResult.totalDurationMinutes)}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
