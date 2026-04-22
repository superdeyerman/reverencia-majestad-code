import { HotelPartnerForm } from "@/components/forms/hotel-partner-form";

export default function AlianzasPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-14 px-6 py-16 lg:px-10">
      <section className="rounded-[2.5rem] border border-stone-200 bg-[linear-gradient(180deg,#fff_0%,#faf7f2_100%)] px-8 py-14 lg:px-14">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Luxury hospitality B2B</p>
        <h1 className="mt-4 max-w-4xl font-serif text-6xl leading-none text-stone-900">
          Wellness in-room para hoteles sin costo fijo, con comisión por servicio.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
          Modelo pensado para elevar la experiencia del huésped, activar un nuevo revenue stream y operar con asignación profesional, agenda viva y seguimiento automatizado.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ["Sin CAPEX", "El hotel no necesita contratar nómina fija ni habilitar cabinas nuevas."],
          ["Comisión por servicio", "Reverencia factura y liquida el revenue share pactado con cada aliado."],
          ["Operación concierge-first", "Checklist, confirmaciones y experiencia in-room alineadas a hospitalidad premium."],
        ].map(([title, body]) => (
          <article key={title} className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <h2 className="font-serif text-3xl text-stone-900">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">{body}</p>
          </article>
        ))}
      </div>

      <HotelPartnerForm />
    </main>
  );
}
