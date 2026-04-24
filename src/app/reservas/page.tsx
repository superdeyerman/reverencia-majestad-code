import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ConciergeBell, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import BookingWizard from '@/components/booking/BookingWizard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reservar | Reverencia Majestad · Luxury Hair & Spa',
  description:
    'Reserva tu experiencia premium de hair, spa y wellness a domicilio u hotel en Santiago. Agenda online, abono claro y soporte concierge.',
};

const bookingBenefits = [
  'Confirmación online con 20% de abono',
  'Modalidades hogar, hotel y private studio',
  'Precios visibles y recargos transparentes',
  'Soporte por WhatsApp para casos especiales',
];

const reassuranceBlocks = [
  {
    icon: ShieldCheck,
    title: 'Proceso claro',
    body: 'Diseñado para decidir rápido sin perder sensación premium.',
  },
  {
    icon: ConciergeBell,
    title: 'Acompañamiento concierge',
    body: 'Si tu caso es especial, el canal directo sigue disponible en todo momento.',
  },
  {
    icon: Sparkles,
    title: 'Experiencia consistente',
    body: 'Desde la reserva hasta el post-servicio, todo busca coherencia de marca.',
  },
];

export default async function ReservasPage() {
  const services = await prisma.service.findMany({
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
  });

  const featuredCount = services.filter((service) => service.isFeatured).length;
  const homeCount = services.filter((service) => service.supportsHome).length;
  const hotelCount = services.filter((service) => service.supportsHotel).length;

  return (
    <main className="bg-[#f8f4ed]">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Reserva en línea
            </span>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-stone-950 lg:text-6xl">
              Tu experiencia premium,
              <span className="block text-[#b98f53]">lista para agendar.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">
              Selecciona el servicio, personaliza tu caso y confirma tu horario con una interfaz más
              clara, más confiable y mejor alineada con una marca de alto valor.
            </p>

            <div className="mt-8 grid gap-3 sm:max-w-2xl">
              {bookingBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#faf7f2] px-4 py-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                    <CheckCircle2 size={16} aria-hidden="true" />
                  </span>
                  <span className="text-sm text-stone-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7 shadow-[0_16px_50px_rgba(63,47,36,0.06)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Panorama comercial</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="font-serif text-3xl text-stone-950">{services.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">servicios activos</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-stone-950">{featuredCount}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">destacados</p>
                </div>
                <div>
                  <p className="font-serif text-3xl text-stone-950">{homeCount + hotelCount}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">modalidades premium</p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_16px_50px_rgba(63,47,36,0.06)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Canal directo</p>
                  <h2 className="mt-2 font-serif text-3xl text-stone-950">Concierge disponible</h2>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a96e]/12 text-[#8e6b3d]">
                  <MessageCircle size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Si necesitas hotel partner, evento, horario especial o recomendación guiada, puedes
                combinar esta reserva con atención humana.
              </p>
              <div className="mt-5">
                <Link
                  href="https://wa.me/56963929354?text=Hola,%20quiero%20reservar%20una%20experiencia%20premium"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-stone-700 transition-colors hover:text-stone-950"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Abrir WhatsApp concierge
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <BookingWizard services={services} />
      </section>

      <section className="border-t border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Lo que mejora la decisión
            </span>
            <h2 className="mt-4 font-serif text-4xl text-stone-950">Más contexto, más confianza, menos abandono.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {reassuranceBlocks.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-[1.8rem] border border-stone-200 bg-[#faf7f2] p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b98f53] shadow-sm">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-serif text-2xl text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
