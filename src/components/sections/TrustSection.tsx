import { Award, CheckCircle2, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Pillar {
  icon: LucideIcon;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const pillars: Pillar[] = [
  {
    icon: Award,
    title: 'Profesionales Certificados',
    description:
      'Todos nuestros especialistas cuentan con certificación vigente, seguro de responsabilidad civil y más de 3 años de experiencia comprobada en salones de primer nivel.',
    stat: '100%',
    statLabel: 'certificados',
  },
  {
    icon: CheckCircle2,
    title: 'Productos Premium',
    description:
      "Trabajamos exclusivamente con marcas dermofarmacéuticas de primera línea: L'Oréal Professionnel, Wella, Kérastase y Comfort Zone. Sin compromiso en calidad.",
    stat: '+12',
    statLabel: 'marcas premium',
  },
  {
    icon: Users,
    title: 'Satisfacción Garantizada',
    description:
      'Si el servicio no cumple tus expectativas, lo repetimos sin costo adicional o te devolvemos el dinero. Tu confianza es nuestra prioridad.',
    stat: '4.9★',
    statLabel: 'satisfacción',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="max-w-xl mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-4">
            <span className="h-px w-8 bg-gold" />
            ¿Por qué elegirnos?
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl text-char leading-tight">
            Estándares que marcan<br className="hidden sm:block" /> la diferencia
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {pillars.map(({ icon: Icon, title, description, stat, statLabel }, i) => (
            <div key={title} className="flex flex-col">

              {/* Icon row with numbered divider */}
              <div className="flex items-center gap-4 mb-7">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-gold/10">
                  <Icon size={22} className="text-gold" />
                </div>
                <span className="h-px flex-1 bg-border" />
                <span className="font-sans text-[11px] font-medium tracking-widest text-gray uppercase">
                  0{i + 1}
                </span>
              </div>

              <h3 className="font-serif text-xl lg:text-2xl text-gold mb-3 leading-snug">
                {title}
              </h3>

              <p className="font-sans text-sm text-gray leading-relaxed flex-1 mb-8">
                {description}
              </p>

              {/* Stat */}
              <div className="flex items-baseline gap-2 pt-5 border-t border-border">
                <span className="font-serif text-2xl font-medium text-gold">{stat}</span>
                <span className="font-sans text-xs text-gray">{statLabel}</span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
