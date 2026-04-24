import type { Metadata } from 'next';
import { type LucideIcon, Building2, ConciergeBell, Sparkles, Star, Waves } from 'lucide-react';
import HeroSection from '@/components/sections/HeroSection';
import TrustSection from '@/components/sections/TrustSection';
import ServicesSection from '@/components/sections/ServicesSection';
import CTASection from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Reverencia Majestad - Luxury Hair & Spa',
  description: 'Servicios de belleza premium a domicilio en Santiago',
};

const experienceCards: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Sparkles,
    title: 'Ritual editorial',
    body: 'Diagnóstico, ambientación y protocolo de lujo desde el primer contacto.',
  },
  {
    icon: Waves,
    title: 'Wellness in-room',
    body: 'Masajes, faciales y haircare sin abandonar la habitación o el hogar.',
  },
  {
    icon: Building2,
    title: 'Modelo hotelero',
    body: 'Concierge friendly, comisión por servicio y sin costo fijo para el hotel.',
  },
  {
    icon: ConciergeBell,
    title: 'Automatización',
    body: 'Confirmaciones, recordatorios y flujo post-servicio con recompra.',
  },
];

const testimonials = [
  {
    name: 'Valentina G.',
    role: 'Suite privada, Vitacura',
    quote:
      'Nunca había vivido una experiencia beauty tan impecable en casa. El nivel de detalle parece hotel cinco estrellas.',
  },
  {
    name: 'Guest Relations · Hotel partner',
    role: 'Concierge premium',
    quote:
      'Nos permitió activar wellness in-room sin CAPEX, mejorando experiencia de huésped e ingresos complementarios.',
  },
  {
    name: 'María J.',
    role: 'Clienta recurrente',
    quote:
      'La reserva es clarísima, el precio se entiende y el seguimiento post-servicio se siente realmente exclusivo.',
  },
];

export default function HomePage() {
  return (
    <main className="bg-cream">

      <HeroSection />

      <TrustSection />

      <ServicesSection />

      {/* Experiencia */}
      <section id="experiencia" className="border-y border-stone-200 bg-[#faf7f2]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Atención domicilio / hotel
            </p>
            <h2 className="font-serif text-5xl text-stone-900">
              Una experiencia tipo spa diseñada para convertir y fidelizar
            </h2>
            <p className="max-w-2xl text-base leading-8 text-stone-600">
              El sitio prioriza reserva visible, pricing transparente, contacto directo y una
              experiencia visual aspiracional, principios consistentes con mejores prácticas de
              booking hospitality y UX de alto valor.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {experienceCards.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm"
              >
                <Icon className="size-5 text-amber-600" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_20px_60px_rgba(28,25,23,0.05)]"
            >
              <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              <p className="mt-5 text-lg leading-8 text-stone-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-8 border-t border-stone-100 pt-5">
                <p className="font-medium text-stone-900">{t.name}</p>
                <p className="text-sm text-stone-500">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CTASection />

    </main>
  );
}
