import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Home, Building2, Sparkles, CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatCLP, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Servicios | Reverencia Majestad · Luxury Hair & Spa',
  description:
    'Catálogo completo de servicios premium: colorimetría, extensiones, masajes, faciales y spa in-room para domicilio y hoteles en Santiago.',
  openGraph: {
    title: 'Servicios Premium · Reverencia Majestad',
    description: 'Hair, Spa & Wellness a domicilio y en hoteles de Santiago.',
    type: 'website',
  },
};

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  BEAUTY: {
    label: 'Hair & Beauty',
    description: 'Colorimetría, extensiones, corte y restauración capilar con diagnóstico editorial.',
  },
  WELLNESS: {
    label: 'Wellness & Spa',
    description: 'Masajes, rituales y experiencias in-room para bienestar profundo.',
  },
  SKINCARE: {
    label: 'Skincare',
    description: 'Tratamientos faciales con cosmética dermofarmacéutica de primera línea.',
  },
};

const MODALITY_ICONS = {
  home: <Home size={13} aria-hidden="true" />,
  hotel: <Building2 size={13} aria-hidden="true" />,
};

export default async function ServiciosPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: 'desc' }, { category: 'asc' }, { basePrice: 'asc' }],
  });

  const byCategory = services.reduce<Record<string, typeof services>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const categories = Object.keys(byCategory);

  return (
    <main className="bg-cream min-h-screen">

      {/* Hero */}
      <section className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12">
          <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-5">
            <span className="h-px w-8 bg-gold" />
            Catálogo Completo
          </span>
          <h1 className="font-serif text-5xl lg:text-6xl text-char leading-tight mb-5">
            Servicios diseñados<br className="hidden lg:block" />
            para tu espacio
          </h1>
          <p className="font-sans text-base text-gray max-w-xl leading-relaxed mb-8">
            Cada servicio incluye diagnóstico personalizado, productos premium y profesionales
            certificados que llegan a tu domicilio o habitación de hotel en Santiago.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="dark" size="lg" asChild>
              <Link href="/reservar">Reservar ahora</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/estilo">Diagnóstico de estilo AI</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle2 size={18} className="text-gold" />, title: 'Profesionales certificados', body: 'Todos con seguro de responsabilidad civil y 3+ años de experiencia en salones premium.' },
              { icon: <Sparkles size={18} className="text-gold" />, title: 'Productos de primera línea', body: "Kérastase, L'Oréal Professionnel, Wella y Comfort Zone. Sin compromiso en calidad." },
              { icon: <Building2 size={18} className="text-gold" />, title: 'Domicilio y hoteles', body: 'Modalidad in-room para suites y modalidad domicilio para la máxima comodidad.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-gold/10">
                  {icon}
                </div>
                <div>
                  <p className="font-sans text-sm font-semibold text-char mb-1">{title}</p>
                  <p className="font-sans text-xs text-gray leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services by category */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 space-y-20">
        {categories.map((cat) => {
          const catConfig = CATEGORY_LABELS[cat] ?? { label: cat, description: '' };
          const items = byCategory[cat] ?? [];
          return (
            <section key={cat} id={cat.toLowerCase()}>
              {/* Category header */}
              <div className="mb-10">
                <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-3">
                  <span className="h-px w-6 bg-gold" />
                  {catConfig.label}
                </span>
                <p className="font-sans text-sm text-gray max-w-lg">{catConfig.description}</p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((service) => (
                  <article
                    key={service.id}
                    className="relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm hover:border-gold/30 transition-all duration-200"
                  >
                    {service.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-1 rounded-sm bg-gold/15 text-gold-dark border border-gold/20 uppercase tracking-wide">
                          <Sparkles size={9} /> Destacado
                        </span>
                      </div>
                    )}

                    <div className="p-7 flex flex-col flex-1">
                      {/* Price + duration */}
                      <div className="flex items-center justify-between mb-5">
                        <p className="font-serif text-2xl font-medium text-char">
                          {formatCLP(service.basePrice)}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-sans text-gray">
                          <Clock size={13} aria-hidden="true" />
                          {formatDuration(service.durationMinutes)}
                        </div>
                      </div>

                      <h2 className="font-serif text-xl text-char mb-3 leading-snug">
                        {service.name}
                      </h2>

                      <p className="font-sans text-sm text-gray leading-relaxed flex-1 mb-6">
                        {service.description}
                      </p>

                      {/* Modality badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {service.supportsHome && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-sm bg-cream border border-border text-gray">
                            {MODALITY_ICONS.home} Domicilio
                          </span>
                        )}
                        {service.supportsHotel && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-sm bg-cream border border-border text-gray">
                            {MODALITY_ICONS.hotel} Hotel in-room
                          </span>
                        )}
                        {service.supportsHairMetrics && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans px-2.5 py-1 rounded-sm bg-gold/8 border border-gold/20 text-gold-dark">
                            <Sparkles size={9} /> Pricing capilar
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/reservar?servicio=${service.slug}`}
                        aria-label={`Reservar ${service.name}`}
                        className="mt-auto flex items-center justify-between w-full rounded-xl border border-stone-200 bg-white px-5 py-3 font-sans text-sm font-medium text-char hover:border-gold hover:text-gold transition-colors group"
                      >
                        <span>Reservar este servicio</span>
                        <ArrowRight size={15} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <section className="bg-char py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-6 border border-gold/30 px-4 py-2 rounded-sm">
            ¿No encuentras lo que buscas?
          </span>
          <h2 className="font-serif text-4xl text-white mb-4">
            Cuéntanos tu experiencia ideal
          </h2>
          <p className="font-sans text-sm text-white/60 max-w-md mx-auto leading-relaxed mb-10">
            Diseñamos experiencias personalizadas para clientes particulares, suites privadas y eventos corporativos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <a
                href={`https://wa.me/56963929354?text=${encodeURIComponent('Hola, quiero una experiencia personalizada')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp directo
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-white/20 text-white hover:border-gold hover:text-gold" asChild>
              <Link href="/estilo">Diagnóstico AI gratuito</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}
