import Link from 'next/link';
import { ArrowRight, Clock, Scissors, Hand, Sparkles, Palette, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatCLP, formatDuration } from '@/lib/utils';

export interface FeaturedService {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  isFeatured: boolean;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BEAUTY: Scissors,
  WELLNESS: Hand,
  SKINCARE: Sparkles,
  NAILS: Scissors,
  MAKEUP: Palette,
  BODY_TREATMENTS: Waves,
};

const CATEGORY_LABELS: Record<string, string> = {
  BEAUTY: 'Hair & Beauty',
  WELLNESS: 'Wellness',
  SKINCARE: 'Skincare',
  NAILS: 'Nails',
  MAKEUP: 'Maquillaje',
  BODY_TREATMENTS: 'Cuerpo',
};

export default function ServicesSection({ services }: { services: FeaturedService[] }) {
  return (
    <section id="servicios" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        <div className="max-w-xl mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-[#b98f53] uppercase mb-4">
            <span className="h-px w-8 bg-[#c9a96e]" />
            Nuestros Servicios
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-stone-950 leading-tight mb-4">
            Experiencias diseñadas para ti
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Cada servicio incluye productos premium, profesionales certificados y la
            comodidad de tu propio espacio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => {
            const Icon = CATEGORY_ICONS[service.category] ?? Sparkles;
            const categoryLabel = CATEGORY_LABELS[service.category] ?? service.category;

            return (
              <article
                key={service.id}
                className="relative flex flex-col rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_12px_35px_rgba(63,47,36,0.05)] hover:shadow-[0_28px_80px_rgba(63,47,36,0.12)] hover:-translate-y-1 transition-all duration-300"
              >
                {service.isFeatured && (
                  <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full border border-[#c9a96e]/30 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#b98f53]">
                    <Sparkles size={9} aria-hidden="true" /> Destacado
                  </span>
                )}

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#b98f53] shadow-sm">
                  <Icon size={18} aria-hidden="true" />
                </div>

                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b98f53] mb-2">
                  {categoryLabel}
                </p>

               <h3 className="font-serif text-[22px] tracking-tight text-stone-950">
                  {service.name}
                </h3>

                <p className="text-[14px] text-stone-600 leading-[1.7] ...">                  {service.description}
                </p>

                <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                  <div>
                    <p className="font-serif text-xl text-stone-950">{formatCLP(service.basePrice)}</p>
                    <p className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                      <Clock size={11} aria-hidden="true" />
                      {formatDuration(service.durationMinutes)}
                    </p>
                  </div>
                  <Link
                    href={`/reservar?servicio=${service.slug}`}
                    aria-label={`Reservar ${service.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition-colors hover:border-[#c9a96e] hover:text-[#b98f53]"
                  >
                    Reservar <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

       <Link href="/servicios">
        <Button variant="outline" size="md">
          Ver todos los servicios
        </Button>
        </Link>

      </div>
    </section>
  );
}
