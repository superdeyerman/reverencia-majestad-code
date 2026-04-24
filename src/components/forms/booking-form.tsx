"use client";

import { useEffect, useMemo, useState } from "react";
import { HairDensity, HairLength, ServiceCategory } from "@prisma/client";
import { formatCLP } from "@/lib/utils";

type ServiceOption = {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  durationMinutes: number;
  supportsHairMetrics: boolean;
  supportsHome: boolean;
  supportsHotel: boolean;
};

const HAIR_LENGTH_MULTIPLIER: Record<HairLength, number> = {
  SHORT: 1,
  MEDIUM: 1.12,
  LONG: 1.28,
  XL: 1.45,
};

const HAIR_DENSITY_MULTIPLIER: Record<HairDensity, number> = {
  LIGHT: 1,
  NORMAL: 1.08,
  ABUNDANT: 1.2,
};

export function BookingForm({ services }: { services: ServiceOption[] }) {
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [modality, setModality] = useState<"HOME" | "HOTEL">("HOME");
  const [hairLength, setHairLength] = useState<HairLength>(HairLength.MEDIUM);
  const [hairDensity, setHairDensity] = useState<HairDensity>(HairDensity.NORMAL);
  const [date, setDate] = useState("");
  const [availability, setAvailability] = useState<Array<{ slot: string; available: boolean; professionals: number }>>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [distanceFee, setDistanceFee] = useState(0);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"booking" | "payment">("booking");
  const [result, setResult] = useState<{ code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? services[0],
    [services, selectedServiceId],
  );

  const subtotal = useMemo(() => {
    if (!selectedService) return 0;
    if (!selectedService.supportsHairMetrics) return selectedService.basePrice;

    return Math.round(
      selectedService.basePrice *
        HAIR_LENGTH_MULTIPLIER[hairLength] *
        HAIR_DENSITY_MULTIPLIER[hairDensity],
    );
  }, [selectedService, hairDensity, hairLength]);

  const total = subtotal + distanceFee;
  const deposit = Math.max(5000, Math.round(total * 0.2));

  useEffect(() => {
    if (!selectedServiceId || !date) return;

    fetch(`/api/availability?serviceId=${selectedServiceId}&date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        setAvailability(data.slots ?? []);
        setSelectedSlot("");
      })
      .catch(() => setAvailability([]));
  }, [selectedServiceId, date]);

  async function calculateDistance(address: string) {
    if (!address) return;
    const district = (document.querySelector('input[name="district"]') as HTMLInputElement)?.value;

    const response = await fetch(`/api/geocode?address=${encodeURIComponent(`${address}, ${district}, Santiago, Chile`)}`);
    const data = await response.json();
    setLatitude(data.latitude ?? null);
    setLongitude(data.longitude ?? null);
    setDistanceFee(data.distanceFee ?? 0);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setLoadingStep("booking");
    setError(null);
    setResult(null);

    const payload = {
      customerName: formData.get("customerName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceId: selectedServiceId,
      modality,
      date,
      time: selectedSlot,
      address: formData.get("address"),
      district: formData.get("district"),
      hotelName: formData.get("hotelName"),
      roomNumber: formData.get("roomNumber"),
      hairLength: selectedService?.supportsHairMetrics ? hairLength : null,
      hairDensity: selectedService?.supportsHairMetrics ? hairDensity : null,
      notes: formData.get("notes"),
      latitude,
      longitude,
    };

    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      setLoading(false);
      setError(bookingData.error ?? "No fue posible crear la reserva.");
      return;
    }

    const bookingId: string = bookingData.booking.id;
    const bookingCode: string = bookingData.booking.code;
    setResult({ code: bookingCode });

    setLoadingStep("payment");

    const prefRes = await fetch("/api/payments/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const prefData = await prefRes.json();
    setLoading(false);

    if (!prefRes.ok) {
      setError(prefData.error ?? "No fue posible iniciar el pago. Tu reserva fue creada con código " + bookingCode + ".");
      return;
    }

    window.location.href = prefData.init_point;
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <form action={handleSubmit} className="space-y-5 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Sistema de reservas inteligente</p>
          <h2 className="font-serif text-4xl text-stone-900">Reserva tu experiencia</h2>
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            Selecciona servicio, modalidad, variables capilares y disponibilidad real. El abono se calcula automáticamente con mínimo de $5.000 CLP.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-700 md:col-span-2">
            Servicio
            <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900">
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {formatCLP(service.basePrice)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-2 text-sm text-stone-700">
            <span>Modalidad</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setModality("HOME")} className={`rounded-full border px-4 py-3 ${modality === "HOME" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200"}`}>
                Domicilio
              </button>
              <button type="button" onClick={() => setModality("HOTEL")} className={`rounded-full border px-4 py-3 ${modality === "HOTEL" ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200"}`}>
                Hotel
              </button>
            </div>
          </div>

          <label className="grid gap-2 text-sm text-stone-700">
            Fecha
            <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>

          <label className="grid gap-2 text-sm text-stone-700 md:col-span-2">
            Franja horaria disponible
            <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900">
              <option value="">Selecciona horario</option>
              {availability.map((slot) => (
                <option key={slot.slot} value={slot.slot} disabled={!slot.available}>
                  {slot.slot} {slot.available ? `· ${slot.professionals} profesionales disponibles` : "· completo"}
                </option>
              ))}
            </select>
          </label>

          {selectedService?.supportsHairMetrics ? (
            <>
              <label className="grid gap-2 text-sm text-stone-700">
                Largo del cabello
                <select value={hairLength} onChange={(e) => setHairLength(e.target.value as HairLength)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900">
                  <option value="SHORT">Corto</option>
                  <option value="MEDIUM">Medio</option>
                  <option value="LONG">Largo</option>
                  <option value="XL">Extra largo</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                Abundancia
                <select value={hairDensity} onChange={(e) => setHairDensity(e.target.value as HairDensity)} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900">
                  <option value="LIGHT">Ligera</option>
                  <option value="NORMAL">Normal</option>
                  <option value="ABUNDANT">Abundante</option>
                </select>
              </label>
            </>
          ) : null}

          <label className="grid gap-2 text-sm text-stone-700">
            Nombre y apellido
            <input name="customerName" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Teléfono
            <input name="phone" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Email
            <input name="email" type="email" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Comuna / distrito
            <input name="district" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700 md:col-span-2">
            {modality === "HOTEL" ? "Dirección del hotel" : "Dirección"}
            <div className="flex gap-2">
              <input name="address" required className="min-w-0 flex-1 rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
              <button type="button" onClick={() => calculateDistance((document.querySelector('input[name="address"]') as HTMLInputElement)?.value)} className="rounded-full border border-stone-900 px-4 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white">
                Calcular trayecto
              </button>
            </div>
          </label>

          {modality === "HOTEL" ? (
            <>
              <label className="grid gap-2 text-sm text-stone-700">
                Hotel
                <input name="hotelName" className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
              </label>
              <label className="grid gap-2 text-sm text-stone-700">
                Habitación / suite
                <input name="roomNumber" className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
              </label>
            </>
          ) : null}

          <label className="grid gap-2 text-sm text-stone-700 md:col-span-2">
            Notas internas
            <textarea name="notes" rows={4} className="rounded-3xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
        </div>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {result ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Reserva creada con código <strong>{result.code}</strong>. Redirigiendo a Mercado Pago...
          </div>
        ) : null}

        <button disabled={loading || !selectedSlot} className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60">
          {loading && loadingStep === "booking"
            ? "Creando reserva..."
            : loading && loadingStep === "payment"
              ? "Iniciando pago..."
              : `Reservar con abono desde ${formatCLP(deposit)}`}
        </button>
      </form>

      <aside className="space-y-6 rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Resumen dinámico</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-900">Tu cotización premium</h3>
        </div>
        <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(28,25,23,0.06)]">
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <p className="text-sm text-stone-500">Servicio</p>
              <p className="font-medium text-stone-900">{selectedService?.name}</p>
            </div>
            <p className="font-medium text-stone-900">{formatCLP(selectedService?.basePrice ?? 0)}</p>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Variables capilares</span>
            <span>{selectedService?.supportsHairMetrics ? `${hairLength} · ${hairDensity}` : "No aplica"}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Recargo por distancia</span>
            <span>{formatCLP(distanceFee)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span>{formatCLP(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-base font-semibold text-stone-900">
            <span>Total estimado</span>
            <span>{formatCLP(total)}</span>
          </div>
          <div className="rounded-2xl bg-[#f5efe5] p-4 text-sm leading-7 text-stone-700">
            <p className="font-medium text-stone-900">Abono mínimo automatizado</p>
            <p>{formatCLP(deposit)} para bloquear agenda, disparar notificaciones y asignar profesional.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-7 text-stone-600">
          <p className="font-medium text-stone-900">Lo que ocurre después de reservar</p>
          <ul className="grid gap-2">
            <li>• Confirmación automática por email y WhatsApp</li>
            <li>• Recordatorio previo a la cita</li>
            <li>• Seguimiento post-servicio para reseña y recompra</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
