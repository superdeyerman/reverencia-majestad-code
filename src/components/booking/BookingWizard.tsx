"use client";

import { useState } from "react";
import { BookingWizardProvider, useBookingWizardContext } from "@/components/booking/booking-wizard-context";

export function BookingWizard({ services }: { services: { id: string; name: string }[] }) {
  return (
    <BookingWizardProvider>
      <BookingWizardInner services={services} />
    </BookingWizardProvider>
  );
}

function BookingWizardInner({ services }: { services: { id: string; name: string }[] }) {
  const { state: store, setField, nextStep, prevStep } = useBookingWizardContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: store.customerName,
          email: store.email,
          phone: store.phone,
          serviceId: store.serviceId,
          modality: store.modalidad === "STUDIO" ? "PRIVATE_STUDIO" : store.modalidad,
          date: store.date,
          time: store.time,
          address: "",
          district: "",
          hairLength: store.hair.length === "EXTRA_LONG" ? "XL" : store.hair.length,
          hairDensity:
            store.hair.abundance === "THIN"
              ? "LIGHT"
              : store.hair.abundance === "VERY_ABUNDANT"
                ? "ABUNDANT"
                : store.hair.abundance,
          notes: store.notes,
        }),
      });

      const payload = (await response.json()) as { initPoint?: string; error?: string };
      if (!response.ok || !payload.initPoint) {
        throw new Error(payload.error ?? "No se pudo crear la reserva");
      }

      window.location.href = payload.initPoint;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-neutral-950/70 p-6 text-white">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Reserva premium</p>
        <h2 className="text-2xl font-semibold">Paso {store.step} de 6</h2>
      </header>

      {store.step === 1 && (
        <select
          className="w-full rounded-xl border border-white/20 bg-neutral-900 p-3"
          value={store.serviceId}
          onChange={(e) => setField("serviceId", e.target.value)}
        >
          <option value="">Selecciona un servicio</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      )}

      {store.step === 2 && (
        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-xl border border-white/20 bg-neutral-900 p-3"
            value={store.hair.length}
            onChange={(e) =>
              setField("hair", { ...store.hair, length: e.target.value as typeof store.hair.length })
            }
          >
            <option value="SHORT">Corto</option>
            <option value="MEDIUM">Medio</option>
            <option value="LONG">Largo</option>
            <option value="EXTRA_LONG">Extra largo</option>
          </select>
          <select
            className="rounded-xl border border-white/20 bg-neutral-900 p-3"
            value={store.hair.abundance}
            onChange={(e) =>
              setField("hair", { ...store.hair, abundance: e.target.value as typeof store.hair.abundance })
            }
          >
            <option value="THIN">Fino</option>
            <option value="NORMAL">Normal</option>
            <option value="ABUNDANT">Abundante</option>
            <option value="VERY_ABUNDANT">Muy abundante</option>
          </select>
        </div>
      )}

      {store.step === 3 && (
        <div className="flex gap-3">
          {(["STUDIO", "HOME", "HOTEL"] as const).map((modalidad) => (
            <button
              key={modalidad}
              className="rounded-xl border border-white/20 px-4 py-2"
              onClick={() => setField("modalidad", modalidad)}
              type="button"
            >
              {modalidad}
            </button>
          ))}
        </div>
      )}

      {store.step === 4 && (
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-white/20 bg-neutral-900 p-3" type="date" value={store.date} onChange={(e) => setField("date", e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-neutral-900 p-3" type="time" value={store.time} onChange={(e) => setField("time", e.target.value)} />
        </div>
      )}

      {store.step === 5 && (
        <div className="grid gap-4">
          <input className="rounded-xl border border-white/20 bg-neutral-900 p-3" placeholder="Nombre" value={store.customerName} onChange={(e) => setField("customerName", e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-neutral-900 p-3" placeholder="Email" value={store.email} onChange={(e) => setField("email", e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-neutral-900 p-3" placeholder="Teléfono" value={store.phone} onChange={(e) => setField("phone", e.target.value)} />
          <textarea className="rounded-xl border border-white/20 bg-neutral-900 p-3" placeholder="Notas" value={store.notes} onChange={(e) => setField("notes", e.target.value)} />
        </div>
      )}

      {store.step === 6 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
          <p>Servicio: {services.find((service) => service.id === store.serviceId)?.name ?? "-"}</p>
          <p>Fecha: {store.date} {store.time}</p>
          <p>Cliente: {store.customerName}</p>
        </div>
      )}

      <footer className="flex items-center justify-between">
        <button type="button" className="rounded-xl border border-white/20 px-4 py-2" onClick={prevStep} disabled={store.step === 1}>
          Atrás
        </button>
        {store.step < 6 ? (
          <button type="button" className="rounded-xl bg-amber-300 px-4 py-2 font-semibold text-black" onClick={nextStep}>
            Continuar
          </button>
        ) : (
          <button type="button" className="rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-black" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Confirmar y pagar"}
          </button>
        )}
      </footer>
    </section>
  );
}
