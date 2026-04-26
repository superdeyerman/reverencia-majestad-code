import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ConciergeBell,
  CreditCard,
  MessageCircle,
  Smartphone,
  Sparkles,
  Star,
  Waves,
} from 'lucide-react';
import HeroSection from '@/components/sections/HeroSection';
import TrustSection from '@/components/sections/TrustSection';
import ServicesSection from '@/components/sections/ServicesSection';
import DiscountLadderSection from '@/components/sections/DiscountLadderSection';
import PackagesSection from '@/components/sections/PackagesSection';
import HotelExperiencesSection from '@/components/sections/HotelExperiencesSection';
import FounderSection from '@/components/sections/FounderSection';
import CTASection from '@/components/sections/CTASection';
import { Button } from '@/components/ui';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reverencia Majestad · Luxury Hair & Spa Mobile Santiago',
  description:
    'Servicios premium de hair, spa y wellness a domicilio y en hoteles de Santiago. Reserva online, agenda concierge y experiencia editorial.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'Reverencia Majestad · Luxury Hair & Spa Mobile',
    description: 'Beauty, hair y wellness premium para hogar, hotel y eventos en Santiago.',
  },
};

const howItWorks = [
  {
    step: '01',
    icon: Smartphone,
    title: 'Explora y elige',
    body: 'Catálogo curado, precios claros y una navegación pensada para decidir rápido.',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Bloquea tu agenda',
    body: 'Confirma con 20% de abono y recibe validación inmediata para tu franja horaria.',
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Vive la experiencia',
    body: 'El profesional llega preparado con protocolo premium y atención personalizada.',
  },
];

const experienceCards = [
  {
    icon: Sparkles,
    title: 'Ritual editorial',
    body: 'Cada encuentro se siente pulido: visualmente aspiracional, operacionalmente simple.',
  },
  {
    icon: Waves,
    title: 'Wellness privado',
    body: 'Masajes, faciales y beauty care sin traslados ni tiempos muertos.',
  },
  {
    icon: Building2,
    title: 'Flujo hotelero',
    body: 'Diseñado para suites, concierge y alianzas B2B con experiencia consistente.',
  },
  {
    icon: ConciergeBell,
    title: 'Marca que fideliza',
    body: 'Confirmaciones, recordatorios y post-servicio que invitan a repetir.',
  },
];

const proofPoints = [
  {
    title: 'Reserva visible',
    body: 'El CTA principal aparece temprano y con suficiente contexto para mover a decisión.',
  },
  {
    title: 'Confianza premium',
    body: 'Se comunica estándar de marca, certificación y claridad comercial sin parecer rígido.',
  },
  {
    title: 'Fricción mínima',
    body: 'Menos pasos mentales, menos incertidumbre, más intención convertida en agenda real.',
  },
];

const testimonials = [
  {
    name: 'Valentina G.',
    role: 'Suite privada, Vitacura',
    quote:
      'La reserva se sintió refinada desde el primer clic. El servicio llegó puntual, impecable y con una energía muy editorial.',
  },
  {
    name: 'Guest Relations · Hotel partner',
    role: 'Concierge premium',
    quote:
      'Nos permitió activar wellness in-room sin complejidad operativa. La percepción del huésped subió de inmediato.',
  },
  {
    name: 'María J.',
    role: 'Clienta recurrente',
    quote:
      'Pricing claro, seguimiento elegante y una atención que de verdad se siente de lujo. Ya se volvió parte de mi rutina.',
  },
];

export default async function HomePage() {
  const featuredServices = await prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ category: 'asc' }, { basePrice: 'asc' }],
    take: 8,
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      isFeatured: true,
    },
  });

  return (
    <main className="bg-[#f8f4ed]">
      <HeroSection />

      <TrustSection />

      <ServicesSection services={featuredServices} />

      <section className="border-y border-stone-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-14 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Reserva en 3 pasos
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
              Un flujo de compra limpio para una experiencia que merece verse premium.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map(({ step, icon: Icon, title, body }) => (
              <article key={step} className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-8">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#b98f53] shadow-sm">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-stone-400">Paso {step}</span>
                </div>
                <h3 className="mt-8 font-serif text-2xl text-stone-950">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-stone-600">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12">
            <Button variant="dark" size="lg" asChild>
              <Link href="/reservar">Ir a reservar</Link>
            </Button>
          </div>
        </div>
      </section>

      <DiscountLadderSection />

      <section className="bg-[#f8f4ed] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
                <span className="h-px w-8 bg-[#c9a96e]" />
                Conversión premium
              </span>
              <h2 className="font-serif text-5xl leading-tight text-stone-950">
                Un sitio bonito no basta. Tiene que vender con calma, claridad y deseo.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-stone-600">
                Esta propuesta mezcla look aspiracional, reserva visible, pricing entendible y
                soporte directo. El resultado es una experiencia que inspira y convierte.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="dark" size="md" asChild>
                  <Link href="/reservar">Reservar ahora</Link>
                </Button>
                <Button variant="outline" size="md" asChild>
                  <Link href="/alianzas">Ver formato hotelero</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {experienceCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="rounded-[1.8rem] border border-stone-200 bg-white p-6 shadow-[0_16px_45px_rgba(63,47,36,0.06)]"
                >
                  <Icon className="size-5 text-[#b98f53]" aria-hidden="true" />
                  <h3 className="mt-4 font-serif text-2xl text-stone-950">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#171311] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-10 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.02fr_0.98fr] lg:p-12">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#d9bb8b]">
                <span className="h-px w-8 bg-[#c9a96e]" />
                AI Style Engine
              </span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-white lg:text-5xl">
                Diagnóstico visual para mover curiosidad a intención.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-8 text-white/68">
                El motor de estilo da un motivo elegante para interactuar, descubrir servicios y
                avanzar hacia una reserva con contexto personal.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['Diagnóstico de cabello', 'Paleta recomendada', 'Servicios sugeridos', 'Sin registro'].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs text-white/72"
                  >
                    <CheckCircle2 size={12} aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/estilo" className="inline-flex items-center gap-2">
                    Iniciar diagnóstico <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Tipo de cabello', value: 'Ondulado natural' },
                { label: 'Tonalidad de piel', value: 'Media cálida' },
                { label: 'Estilo deseado', value: 'Elegancia soft glam' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/7 px-5 py-4"
                >
                  <span className="text-xs text-white/58">{label}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
                </div>
              ))}

              <div className="rounded-[1.8rem] border border-[#c9a96e]/30 bg-[#c9a96e]/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">
                  Servicio recomendado
                </p>
                <p className="mt-2 font-serif text-3xl text-white">Color Signature + Brushing Couture</p>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Una recomendación presentada con tono premium, utilidad real y conexión directa al catálogo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PackagesSection />

      <HotelExperiencesSection />

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Señales de decisión
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
              Lo que hace que la intención no se enfríe.
            </h2>
            <p className="mt-5 text-sm leading-8 text-stone-600">
              El proyecto ahora empuja mejor en percepción, estructura y operatividad: más valor
              visible para cliente final, hotel partner y equipo interno.
            </p>
          </div>

          <div className="grid gap-4">
            {proofPoints.map(({ title, body }) => (
              <article
                key={title}
                className="rounded-[1.7rem] border border-stone-200 bg-white px-6 py-6 shadow-[0_14px_40px_rgba(63,47,36,0.05)]"
              >
                <h3 className="font-serif text-2xl text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
                <span className="h-px w-8 bg-[#c9a96e]" />
                Testimonios
              </span>
              <h2 className="mt-4 font-serif text-4xl text-stone-950 lg:text-5xl">
                Prueba social para cliente y partner.
              </h2>
            </div>
            <a
              href={`https://wa.me/56963929354?text=${encodeURIComponent('Hola, quiero reservar una experiencia premium')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-stone-950"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Hablar con concierge
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7"
              >
                <div className="flex gap-1 text-[#c9a96e]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} className="fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-5 text-base leading-8 text-stone-700">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-8 border-t border-stone-200 pt-5">
                  <p className="font-serif text-xl text-stone-950">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-stone-500">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FounderSection />

      <section className="bg-[#f8f4ed] py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center lg:px-12">
          <div>
            <p className="font-serif text-3xl text-stone-950">Experiencias privadas, agenda online y trato concierge.</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
              Para cliente final, suite de hotel o evento: el sitio ahora comunica mejor el valor antes de pedir la reserva.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="dark" size="lg" asChild>
              <Link href="/reservar">Reservar ahora</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/servicios">Ver servicios</Link>
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
