import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock, Home, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCLP, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug, isActive: true } });
  if (!service) return { title: 'Servicio no encontrado' };
  return {
    title: `${service.name} | Reverencia Majestad`,
    description: service.description,
    openGraph: {
      title: `${service.name} · Reverencia Majestad`,
      description: service.description,
      type: 'website',
    },
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  BEAUTY: 'Hair & Beauty',
  WELLNESS: 'Wellness & Spa',
  SKINCARE: 'Skincare',
};

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({ where: { slug, isActive: true } });
  if (!service) notFound();

  const related = await prisma.service.findMany({
    where: { isActive: true, slug: { not: slug } },
    orderBy: [{ isFeatured: 'desc' }, { category: 'asc' }],
    take: 6,
  });

  const sameCategory = related.filter((s) => s.category === service.category).slice(0, 3);
  const displayRelated = sameCategory.length >= 2 ? sameCategory : related.slice(0, 3);

  const waText = encodeURIComponent(`Hola, quiero información sobre: ${service.name}`);

  return (
    <main className="min-h-screen bg-[#f8f4ed]">
      {/* Breadcrumb */}
      <div className="border-b border-stone-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-950"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Ver todos los servicios
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-14 lg:px-12 lg:py-24">
          {/* Left: title + info */}
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
                <span className="h-px w-8 bg-[#c9a96e]" />
                {CATEGORY_LABELS[service.category] ?? service.category}
              </span>
              {service.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-sm border border-[#c9a96e]/20 bg-[#c9a96e]/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8e6b3d]">
                  <Sparkles size={9} aria-hidden="true" /> Destacado
                </span>
              )}
            </div>

            <h1 className="mb-5 font-serif text-5xl leading-tight text-stone-950 lg:text-6xl">
              {service.name}
            </h1>

            <p className="mb-8 max-w-xl text-base leading-8 text-stone-600">
              {service.description}
            </p>

            <div className="mb-10 flex flex-wrap items-center gap-6">
              <div>
                <p className="mb-1 text-xs uppercase tracking-[0.25em] text-stone-400">Precio base</p>
                <p className="font-serif text-4xl text-stone-950">{formatCLP(service.basePrice)}</p>
              </div>
              <div className="h-10 w-px bg-stone-200" />
              <div className="flex items-center gap-2 text-stone-600">
                <Clock size={18} aria-hidden="true" />
                <span className="text-lg">{formatDuration(service.durationMinutes)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="dark" size="lg" asChild>
                <Link
                  href={`/reservar?servicio=${service.slug}`}
                  className="inline-flex items-center gap-2"
                >
                  Reservar este servicio
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href={`https://wa.me/56963929354?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Consultar por WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Right: info cards */}
          <div className="mt-12 space-y-4 lg:mt-0">
            <div className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7">
              <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-stone-400">
                Modalidades disponibles
              </p>
              <div className="space-y-3">
                {service.supportsHome && (
                  <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                    <Home size={16} className="mt-0.5 shrink-0 text-[#b98f53]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-stone-950">Domicilio</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Profesional llega a tu hogar. Recargo por distancia aplica.
                      </p>
                    </div>
                  </div>
                )}
                {service.supportsHotel && (
                  <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                    <Building2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#b98f53]"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-stone-950">Hotel in-room</p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Atención en habitación con protocolo concierge premium.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#b98f53]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-950">Estudio privado</p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      Espacio curado en Santiago. Sin recargo adicional.
                    </p>
                  </div>
                </div>
              </div>

              {service.supportsHairMetrics && (
                <div className="mt-4 rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/8 p-4">
                  <div className="flex items-center gap-2 text-[#8e6b3d]">
                    <Sparkles size={14} aria-hidden="true" />
                    <p className="text-xs font-medium">Precio capilar personalizado</p>
                  </div>
                  <p className="mt-1.5 text-xs text-stone-600">
                    El precio final ajusta según largo y abundancia de tu cabello.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-7">
              <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-stone-400">
                Garantía de calidad
              </p>
              {[
                'Profesionales certificados con seguro civil',
                'Productos de primera línea incluidos',
                'Confirmación inmediata con 20% de abono',
                'Pago seguro con Mercado Pago',
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 border-b border-stone-100 py-2.5 last:border-0"
                >
                  <CheckCircle2 size={14} className="shrink-0 text-[#b98f53]" aria-hidden="true" />
                  <span className="text-sm text-stone-600">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related services */}
      {displayRelated.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              También te puede interesar
            </span>
            <h2 className="mt-3 font-serif text-4xl text-stone-950">Otros servicios premium</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayRelated.map((s) => (
              <Link
                key={s.id}
                href={`/servicios/${s.slug}`}
                className="group rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_14px_40px_rgba(63,47,36,0.05)] transition-all duration-200 hover:border-[#c9a96e]/40 hover:shadow-[0_18px_50px_rgba(63,47,36,0.09)]"
              >
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#b98f53]">
                  {CATEGORY_LABELS[s.category] ?? s.category}
                </p>
                <h3 className="mb-2 font-serif text-2xl text-stone-950">{s.name}</h3>
                <p className="line-clamp-2 text-sm leading-7 text-stone-500">{s.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-950">{formatCLP(s.basePrice)}</span>
                  <span className="inline-flex items-center gap-1 text-[#b98f53] transition-all group-hover:gap-2">
                    Ver <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-[#171311] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 font-serif text-4xl text-white">
            Lista para vivir la experiencia?
          </h2>
          <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-white/60">
            Confirma con 20% de abono y recibe atención personalizada de nuestros profesionales
            certificados.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link
              href={`/reservar?servicio=${service.slug}`}
              className="inline-flex items-center gap-2"
            >
              Reservar {service.name}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
