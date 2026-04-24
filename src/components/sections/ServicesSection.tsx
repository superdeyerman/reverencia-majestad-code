import Link from 'next/link';
import { Scissors, Palette, Hand, Sparkles, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';

interface Service {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  price: string;
  duration: string;
  popular?: boolean;
}

const services: Service[] = [
  {
    id: 'corte',
    icon: Scissors,
    name: 'Corte & Styling',
    description: 'Corte personalizado, lavado y peinado profesional adaptado a tu tipo de cabello.',
    price: 'Desde $25.000',
    duration: '60 min',
  },
  {
    id: 'colorimetria',
    icon: Palette,
    name: 'Colorimetría',
    description: 'Coloración, mechas y técnicas de balayage con productos de primera línea sin daño.',
    price: 'Desde $55.000',
    duration: '120 min',
    popular: true,
  },
  {
    id: 'masaje',
    icon: Hand,
    name: 'Masaje Relajante',
    description: 'Masaje sueco o de tejido profundo para liberar tensiones en la comodidad de tu hogar.',
    price: 'Desde $35.000',
    duration: '60 min',
  },
  {
    id: 'facial',
    icon: Sparkles,
    name: 'Tratamiento Facial',
    description: 'Limpieza profunda, hidratación y revitalización con cosmética dermofarmacéutica.',
    price: 'Desde $40.000',
    duration: '75 min',
  },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="max-w-xl mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-4">
            <span className="h-px w-8 bg-gold" />
            Nuestros Servicios
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-char leading-tight mb-4">
            Experiencias diseñadas para ti
          </h2>
          <p className="font-sans text-sm text-gray leading-relaxed">
            Cada servicio incluye productos premium, profesionales certificados y la
            comodidad de tu propio espacio.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.id}
                hoverable
                padding="md"
                className="relative flex flex-col"
              >
                {s.popular && (
                  <span className="absolute -top-3 left-4">
                    <Badge status="vip" label="Popular" size="sm" />
                  </span>
                )}

                {/* Icon */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-sm bg-gold/10">
                  <Icon size={20} className="text-gold" />
                </div>

                <CardHeader
                  title={s.name}
                  subtitle={s.duration}
                  className="mb-3"
                />

                <p className="font-sans text-sm text-gray leading-relaxed flex-1 mb-5">
                  {s.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-serif text-base font-medium text-char">
                    {s.price}
                  </span>
                  <Link
                    href={`/reservar?servicio=${s.id}`}
                    aria-label={`Reservar ${s.name}`}
                    className="text-xs font-sans font-medium text-gold hover:text-gold-dark inline-flex items-center gap-1 transition-colors"
                  >
                    Reservar <ArrowRight size={12} aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="md" asChild>
            <Link href="/servicios">Ver todos los servicios</Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
