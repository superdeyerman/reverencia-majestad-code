import Link from 'next/link';
import { ArrowRight, Scissors, Palette, Hand, Sparkles, Flower2, Star } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import type { ServiceCategory } from '@prisma/client';

const CATEGORY_ICON: Record<ServiceCategory, typeof Scissors> = {
  BEAUTY: Scissors,
  WELLNESS: Hand,
  SKINCARE: Sparkles,
  NAILS: Star,
  MAKEUP: Palette,
  BODY_TREATMENTS: Flower2,
};

function formatCLP(cents: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(cents);
}

export default async function ServicesSection() {
  const services = await prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { basePrice: 'asc' },
    take: 4,
  });

  const fallback = [
    { id: 'corte', slug: 'corte-styling', name: 'Corte & Styling', description: 'Corte personalizado, lavado y peinado profesional adaptado a tu tipo de cabello.', basePrice: 25000, durationMinutes: 60, isFeatured: true, category: 'BEAUTY' as ServiceCategory },
    { id: 'colorimetria', slug: 'colorimetria', name: 'Colorimetría', description: 'Coloración, mechas y técnicas de balayage con productos de primera línea sin daño.', basePrice: 55000, durationMinutes: 120, isFeatured: true, category: 'BEAUTY' as ServiceCategory },
    { id: 'masaje', slug: 'masaje-relajante', name: 'Masaje Relajante', description: 'Masaje sueco o de tejido profundo para liberar tensiones en la comodidad de tu hogar.', basePrice: 35000, durationMinutes: 60, isFeatured: false, category: 'WELLNESS' as ServiceCategory },
    { id: 'facial', slug: 'facial-glow', name: 'Tratamiento Facial', description: 'Limpieza profunda, hidratación y revitalización con cosmética dermofarmacéutica.', basePrice: 40000, durationMinutes: 75, isFeatured: false, category: 'SKINCARE' as ServiceCategory },
  ];

  const items = services.length > 0 ? services : fallback;

  return (
    <section id="servicios" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 max-w-xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
            <span className="h-px w-8 bg-[#c9a96e]" />
            Nuestros Servicios
          </span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
            Experiencias diseñadas para ti
          </h2>
          <p className="mt-4 text-sm leading-8 text-stone-600">
            Cada servicio incluye productos premium, profesionales certificados y la
            comodidad de tu propio espacio.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s) => {
            const Icon = CATEGORY_ICON[s.category] ?? Scissors;
            return (
              <article
                key={s.id}
                className="relative flex flex-col rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7 shadow-[0_14px_40px_rgba(63,47,36,0.05)] transition-shadow hover:shadow-lg"
              >
                {s.isFeatured && (
                  <span className="absolute -top-3 left-6 inline-flex items-center rounded-full border border-[#c9a96e]/30 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#b98f53]">
                    Popular
                  </span>
                )}

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a96e]/10">
                  <Icon size={20} className="text-[#b98f53]" aria-hidden="true" />
                </div>

                <h3 className="font-serif text-2xl text-stone-950">{s.name}</h3>
                <p className="mt-1 text-xs text-stone-400">{s.durationMinutes} min</p>
                <p className="mt-3 flex-1 text-sm leading-7 text-stone-600">{s.description}</p>

                <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
                  <span className="font-serif text-base text-stone-950">
                    Desde {formatCLP(s.basePrice)}
                  </span>
                  <Link
                    href={`/reservar?servicio=${s.slug}`}
                    aria-label={`Reservar ${s.name}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#b98f53] transition-colors hover:text-[#8e6b3d]"
                  >
                    Reservar <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/servicios"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm font-medium text-stone-700 transition hover:border-[#c9a96e] hover:text-[#b98f53]"
          >
            Ver todos los servicios <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
