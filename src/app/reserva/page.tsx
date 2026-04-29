import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ConciergeBell,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BookingWizard from '@/components/booking/BookingWizard';
import { Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reservar | Reverencia Majestad · Luxury Hair & Spa',
  description:
    'Reserva tu experiencia premium de hair, spa y wellness a domicilio u hotel en Santiago. Agenda online, abono claro y soporte concierge.',
  alternates: { canonical: '/reservar' },
  openGraph: {
    url: '/reservar',
    title: 'Reservar · Reverencia Majestad',
    description: 'Agenda online con pricing transparente, abono del 30% y concierge humano.',
  },
};

const bookingBenefits = [
  'Confirmación online con 30% de abono',
  'Modalidades hogar, hotel y private studio',
  'Precios visibles y recargos transparentes',
  'Soporte por WhatsApp para casos especiales',
];

const reassuranceBlocks = [
  {
    icon: ShieldCheck,
    title: 'Proceso claro',
    body: 'Diseñado para decidir rápido sin perder sensación premium. Cotización real al instante.',
  },
  {
    icon: ConciergeBell,
    title: 'Acompañamiento concierge',
    body: 'Si tu caso es especial, el canal directo por WhatsApp sigue disponible en todo momento.',
  },
  {
    icon: Sparkles,
    title: 'Experiencia consistente',
    body: 'Desde la reserva hasta el post-servicio, todo busca coherencia de marca editorial.',
  },
];

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const preselectedSlug = params.servicio ?? null;

  // Datos reales desde Prisma — la única fuente de verdad para el wizard.
  const [services, testimonialAgg, completedCount] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { category: 'asc' }, { basePrice: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        description: true,
        basePrice: true,
        durationMinutes: true,
        supportsHome: true,
        supportsHotel: true,
        supportsHairMetrics: true,
        isFeatured: true,
      },
    }),
    prisma.testimonial.aggregate({
      where: { isActive: true },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.reserva.count({ where: { status: 'COMPLETED' } }),
  ]);

  const featuredCount = services.filter((s) => s.isFeatured).length;
  const homeCount = services.filter((s) => s.supportsHome).length;
  const hotelCount = services.filter((s) => s.supportsHotel).length;
  const avgRating = testimonialAgg._avg.rating
    ? Number(testimonialAgg._avg.rating).toFixed(1)
    : '5.0';
  const reviewsCount = testimonialAgg._count._all ?? 0;

  const trustStats = [
    { icon: Users, value: completedCount > 0 ? `${completedCount}+` : 'Santiago', label: 'experiencias completadas' },
    { icon: Star, value: `${avgRating}/5`, label: reviewsCount > 0 ? `${reviewsCount} reseñas verificadas` : 'experiencia premium' },
    { icon: MapPin, value: 'Santiago', label: 'domicilio · hotel · studio' },
  ];

  return (
    <main className="bg-[#f8f4ed]">
      {/* ─── HERO (mismo lenguaje visual que la home) ─────────────────── */}
      <section className="relative overflow-hidden bg-[#f6f1e8]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(201,169,110,0.18), transparent 28%), radial-gradient(circle at 85% 10%, rgba(26,26,26,0.08), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.52), transparent 40%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-white/60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-[#d9bb8b]/20 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-white/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8e6b3d] backdrop-blur">
              <Sparkles size={12} />
              Reserva Concierge
            </div>

            <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.97] text-stone-950 sm:text-6xl lg:text-[72px]">
              Tu experiencia premium,
              <span className="block text-[#b98f53]">lista para agendar.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
              Selecciona el servicio, personaliza tu caso y confirma tu horario con pricing
              transparente, abono seguro por Mercado Pago y acompañamiento humano. Catálogo vivo
              desde nuestra base de datos, no una maqueta.
            </p>

            <div className="mt-8 grid gap-3 sm:max-w-xl">
              {bookingBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/70 px-4 py-3 backdrop-blur"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-stone-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button variant="dark" size="lg" asChild>
                <a href="#wizard" className="inline-flex items-center gap-2">
                  Empezar reserva <ArrowRight size={16} aria-hidden="true" />
                </a>
              </Button>
              <Link
                href={`https://wa.me/56963929354?text=${encodeURIComponent('Hola, quiero reservar una experiencia premium')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-950"
              >
                <MessageCircle size={16} aria-hidden="true" />
                Hablar con concierge
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-stone-200/70 pt-8 sm:max-w-xl">
              {trustStats.map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 text-[#8e6b3d]">
                    <Icon size={14} aria-hidden="true" />
                    <span className="font-serif text-2xl text-stone-950">{value}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel decorativo con datos reales */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#171311] shadow-[0_35px_90px_rgba(28,25,23,0.22)]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 80% 0%, rgba(217,187,139,0.28), transparent 45%), radial-gradient(circle at 10% 100%, rgba(201,169,110,0.18), transparent 40%)',
                  }}
                />
                <div className="relative flex flex-col gap-8 px-7 py-10 text-white sm:px-10 sm:py-12">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#d9bb8b]">
                      Panorama del catálogo en vivo
                    </p>
                    <p className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl">
                      {services.length} experiencias premium disponibles hoy.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                      <p className="font-serif text-3xl text-white">{services.length}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                        servicios
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                      <p className="font-serif text-3xl text-white">{featuredCount}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                        destacados
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
                      <p className="font-serif text-3xl text-white">{homeCount + hotelCount}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/60">
                        modalidades
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                        Signature arrival
                      </p>
                      <p className="mt-2 max-w-xs font-serif text-xl text-white">
                        Ritual editorial con llegada, montaje y cierre impecable.
                      </p>
                    </div>
                    <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur sm:block">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Desde</p>
                      <p className="mt-1 font-serif text-2xl text-white">
                        {services[0]?.basePrice
                          ? new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                              maximumFractionDigits: 0,
                            }).format(services[0].basePrice)
                          : '$25.000'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card 1 */}
              <div className="absolute -left-4 top-7 rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4 shadow-[0_20px_50px_rgba(63,47,36,0.12)] sm:-left-8 sm:px-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-400">
                  Concierge timing
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                    <Clock3 size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-serif text-xl text-stone-900">30% abono</p>
                    <p className="text-xs text-stone-500">Bloquea agenda en minutos</p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -bottom-5 right-4 max-w-[250px] rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 shadow-[0_24px_60px_rgba(63,47,36,0.16)] sm:right-8">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-400">
                  Pago seguro
                </p>
                <div className="mt-2 flex items-center gap-1 text-[#c9a96e]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={13} className="fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Abono con Mercado Pago. Saldo al día del servicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WIZARD funcional (Prisma + /api/pricing/quote + /api/availability + /api/bookings) ──── */}
      <section id="wizard" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14 lg:px-10">
        <BookingWizard services={services} preselectedSlug={preselectedSlug} />
      </section>

      {/* ─── Reassurance (estilo del index) ───────────────────────────── */}
      <section className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Lo que mejora la decisión
            </span>
            <h2 className="mt-4 font-serif text-4xl text-stone-950 lg:text-5xl">
              Más contexto, más confianza, menos abandono.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {reassuranceBlocks.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7 shadow-[0_10px_40px_rgba(63,47,36,0.04)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b98f53] shadow-sm">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-serif text-2xl text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-stone-200 bg-[#171311] px-7 py-7 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">
                ¿Caso especial?
              </p>
              <p className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                Eventos, suites de hotel y horarios fuera de rango — hablemos directo.
              </p>
            </div>
            <Link
              href={`https://wa.me/56963929354?text=${encodeURIComponent('Hola, necesito una reserva especial')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#c9a96e] px-6 py-3 text-sm font-medium text-stone-950 transition hover:bg-[#d9bb8b]"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Abrir WhatsApp concierge
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
