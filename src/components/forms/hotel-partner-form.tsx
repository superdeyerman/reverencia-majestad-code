"use client";

import { useState } from "react";
import { formatCLP } from "@/lib/utils";

export function HotelPartnerForm() {
  const [rooms, setRooms] = useState(60);
  const [takeRate, setTakeRate] = useState(0.14);
  const [averageTicket, setAverageTicket] = useState(89000);
  const [conversion, setConversion] = useState(0.08);
  const [success, setSuccess] = useState<string | null>(null);

  const monthlyBookings = Math.round(rooms * 30 * conversion * 0.12);
  const hotelIncome = Math.round(monthlyBookings * averageTicket * takeRate);

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/hotel-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelName: formData.get("hotelName"),
        contactName: formData.get("contactName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        rooms,
        averageTicket,
        notes: formData.get("notes"),
      }),
    });

    if (response.ok) {
      setSuccess("Solicitud enviada. El equipo B2B recibirá el lead en el panel de hoteles.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <form action={handleSubmit} className="space-y-5 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">B2B hospitality</p>
          <h3 className="mt-2 font-serif text-4xl text-stone-900">Alianzas con hoteles</h3>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-stone-700 md:col-span-2">
            Hotel
            <input name="hotelName" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Nombre de contacto
            <input name="contactName" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Email
            <input name="email" type="email" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Teléfono
            <input name="phone" required className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Notas
            <input name="notes" className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-stone-900" />
          </label>
        </div>
        {success ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        <button className="w-full rounded-full bg-stone-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-stone-700">
          Solicitar alianza
        </button>
      </form>

      <div className="space-y-5 rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Simulador de ingresos</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-900">Revenue share sin costo fijo</h3>
        </div>
        <div className="space-y-5 rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(28,25,23,0.06)]">
          <label className="grid gap-2 text-sm text-stone-700">
            Habitaciones
            <input type="range" min="20" max="200" value={rooms} onChange={(e) => setRooms(Number(e.target.value))} />
            <span>{rooms} habitaciones</span>
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Ticket promedio
            <input type="range" min="50000" max="180000" step="5000" value={averageTicket} onChange={(e) => setAverageTicket(Number(e.target.value))} />
            <span>{formatCLP(averageTicket)}</span>
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Comisión hotel
            <input type="range" min="0.08" max="0.2" step="0.01" value={takeRate} onChange={(e) => setTakeRate(Number(e.target.value))} />
            <span>{Math.round(takeRate * 100)}%</span>
          </label>
          <label className="grid gap-2 text-sm text-stone-700">
            Intensidad de adopción
            <input type="range" min="0.03" max="0.16" step="0.01" value={conversion} onChange={(e) => setConversion(Number(e.target.value))} />
            <span>{Math.round(conversion * 100)}%</span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] bg-white p-5">
            <p className="text-sm text-stone-500">Servicios estimados / mes</p>
            <p className="mt-2 text-3xl font-semibold text-stone-900">{monthlyBookings}</p>
          </div>
          <div className="rounded-[1.75rem] bg-stone-900 p-5 text-white">
            <p className="text-sm text-stone-300">Ingreso hotel / mes</p>
            <p className="mt-2 text-3xl font-semibold">{formatCLP(hotelIncome)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
