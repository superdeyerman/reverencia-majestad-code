import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    title: 'Curaduría profesional',
    description:
      'Cada especialista trabaja con protocolo, presentación y experiencia compatibles con una marca premium, no solo con una agenda de servicios.',
    stat: '100%',
    statLabel: 'equipo certificado',
  },
  {
    icon: CheckCircle2,
    title: 'Pricing claro y premium',
    description:
      'Desde el primer clic se entiende qué incluye cada servicio, cuánto cuesta el abono y cómo funciona la modalidad domicilio, hotel o studio.',
    stat: '+12',
    statLabel: 'marcas y partners',
  },
  {
    icon: ShieldCheck,
    title: 'Confianza operativa',
    description:
      'Confirmaciones, recordatorios y seguimiento posterior convierten la reserva en una experiencia elegante, ordenada y fácil de repetir.',
    stat: '4.9/5',
    statLabel: 'satisfacción media',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Built to convert with elegance
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
              Una marca premium necesita confianza visible, no solo buen diseño.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-stone-600">
            El proyecto ya tenía una base sólida; esta capa pone énfasis en percepción, decisión y
            repetición: lo que hace que una reserva se sienta segura antes de que ocurra.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description, stat, statLabel }, index) => (
            <article
              key={title}
              className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-8 shadow-[0_16px_50px_rgba(63,47,36,0.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#b98f53] shadow-sm">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-8 font-serif text-2xl text-stone-950">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-600">{description}</p>

              <div className="mt-8 border-t border-stone-200 pt-5">
                <p className="font-serif text-3xl text-[#b98f53]">{stat}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-stone-500">{statLabel}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
