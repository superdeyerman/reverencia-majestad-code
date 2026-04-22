import Link from "next/link";
import { type LucideIcon, ArrowRight, Building2, ConciergeBell, Gem, Sparkles, Star, Waves } from "lucide-react";
import { serviceCatalog } from "@/lib/catalog";
import { formatCLP } from "@/lib/utils";

const experienceCards: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Sparkles,
    title: "Ritual editorial",
    body: "Diagnóstico, ambientación y protocolo de lujo desde el primer contacto.",
  },
  {
    icon: Waves,
    title: "Wellness in-room",
    body: "Masajes, faciales y haircare sin abandonar la habitación o el hogar.",
  },
  {
    icon: Building2,
    title: "Modelo hotelero",
    body: "Concierge friendly, comisión por servicio y sin costo fijo para el hotel.",
  },
  {
    icon: ConciergeBell,
    title: "Automatización",
    body: "Confirmaciones, recordatorios y flujo post-servicio con recompra.",
  },
];

const testimonials = [
  {
    name: "Valentina G.",
    role: "Suite privada, Vitacura",
    quote: "Nunca había vivido una experiencia beauty tan impecable en casa. El nivel de detalle parece hotel cinco estrellas.",
  },
  {
    name: "Guest Relations · Hotel partner",
    role: "Concierge premium",
    quote: "Nos permitió activar wellness in-room sin CAPEX, mejorando experiencia de huésped e ingresos complementarios.",
  },
  {
    name: "María J.",
    role: "Clienta recurrente",
    quote: "La reserva es clarísima, el precio se entiende y el seguimiento post-servicio se siente realmente exclusivo.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden border-b border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(245,233,208,0.55),transparent_35%),linear-gradient(180deg,#ffffff_0%,#fbf8f3_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-28">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.35em] text-stone-600 shadow-sm">
              Luxury Hair & Spa Mobile · Santiago de Chile
            </div>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-serif text-6xl leading-none tracking-tight text-stone-900 md:text-7xl">
                Belleza y bienestar de lujo en tu domicilio o suite hotelera.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-600">
                Reverencia Majestad combina peluquería premium, masajes, faciales y rituales spa
                in-room con una plataforma de reservas, CRM y operación B2B lista para escalar.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/reservas" className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-7 py-4 text-sm font-medium text-white shadow-[0_24px_70px_rgba(28,25,23,0.18)] transition hover:bg-stone-700">
                Reserva tu experiencia
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/alianzas" className="inline-flex items-center justify-center rounded-full border border-stone-300 px-7 py-4 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900">
                Modelo para hoteles
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["+20%", "abono automatizado y pricing dinámico"],
                ["3 capas", "landing, operaciones y CRM integrados"],
                ["B2B", "alianzas hoteleras sin costo fijo"],
              ].map(([stat, label]) => (
                <div key={label} className="rounded-[1.75rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
                  <p className="text-3xl font-semibold text-stone-900">{stat}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 self-end">
            <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
              <div className="flex items-center justify-between border-b border-stone-100 pb-5">
                <div>
                  <p className="text-sm text-stone-500">Experiencia signature</p>
                  <h2 className="font-serif text-3xl text-stone-900">Hotel Spa Experience</h2>
                </div>
                <Gem className="size-6 text-amber-600" />
              </div>
              <div className="space-y-4 py-6 text-sm leading-7 text-stone-600">
                <p>Reserva inteligente con agenda en tiempo real, cálculo dinámico de ticket y flujo de abono integrado.</p>
                <p>Asignación automática de estilista o terapeuta según modalidad, duración y disponibilidad.</p>
              </div>
              <div className="flex items-center justify-between rounded-[1.5rem] bg-[#faf7f2] px-5 py-4">
                <span className="text-sm text-stone-500">Desde</span>
                <strong className="text-xl text-stone-900">{formatCLP(129000)}</strong>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-stone-900 p-6 text-white">
                <Building2 className="size-5 text-amber-300" />
                <p className="mt-4 text-sm uppercase tracking-[0.3em] text-stone-300">Hoteles</p>
                <p className="mt-3 text-2xl font-semibold">Revenue share sin fee fijo</p>
              </div>
              <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6">
                <ConciergeBell className="size-5 text-stone-900" />
                <p className="mt-4 text-sm uppercase tracking-[0.3em] text-stone-500">Operación</p>
                <p className="mt-3 text-2xl font-semibold text-stone-900">WhatsApp + CRM + recordatorios</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Beauty / Wellness / Skin Care</p>
            <h2 className="mt-3 font-serif text-5xl text-stone-900">Servicios con narrativa premium y pricing claro</h2>
          </div>
          <Link href="/reservas" className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4">
            Ir al sistema de reservas
          </Link>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {serviceCatalog.map((service) => (
            <article key={service.slug} className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-7 transition hover:-translate-y-1 hover:shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-600">
                  {service.category}
                </span>
                {service.isFeatured ? <Star className="size-4 fill-amber-400 text-amber-400" /> : null}
              </div>
              <h3 className="mt-6 font-serif text-3xl text-stone-900">{service.name}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-600">{service.description}</p>
              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-sm text-stone-500">Desde</p>
                  <p className="text-2xl font-semibold text-stone-900">{formatCLP(service.basePrice)}</p>
                </div>
                <p className="text-sm text-stone-500">{service.durationMinutes} min</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="experiencia" className="border-y border-stone-200 bg-[#faf7f2]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Atención domicilio / hotel</p>
            <h2 className="font-serif text-5xl text-stone-900">Una experiencia tipo spa diseñada para convertir y fidelizar</h2>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              El sitio prioriza reserva visible, pricing transparente, contacto directo y una experiencia visual
              aspiracional, principios consistentes con mejores prácticas de booking hospitality y UX de alto valor.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {experienceCards.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
                <Icon className="size-5 text-amber-600" />
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_20px_60px_rgba(28,25,23,0.05)]">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <p className="mt-5 text-lg leading-8 text-stone-700">“{testimonial.quote}”</p>
              <div className="mt-8 border-t border-stone-100 pt-5">
                <p className="font-medium text-stone-900">{testimonial.name}</p>
                <p className="text-sm text-stone-500">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="rounded-[2.5rem] bg-stone-900 px-8 py-14 text-white lg:px-14">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-stone-300">Ultra conversión</p>
              <h2 className="mt-3 font-serif text-5xl">Convierte visitas en reservas y alianzas.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300">
                Desde un solo stack puedes captar clientes, gestionar agenda, automatizar operación y abrir el canal hotelero B2B.
              </p>
            </div>
            <Link href="/reservas" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-medium text-stone-900 transition hover:bg-stone-100">
              Reserva tu experiencia
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
