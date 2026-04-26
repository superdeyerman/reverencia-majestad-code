import type { Metadata } from 'next';
import { CheckCircle2, Sparkles, TrendingUp, Users } from 'lucide-react';
import ProfessionalApplicationForm from './ProfessionalApplicationForm';

export const metadata: Metadata = {
  title: 'Únete como profesional | Reverencia Majestad',
  description:
    'Postula para unirte al equipo de Reverencia Majestad. Profesionales certificados en hair, wellness y skincare para servicios premium a domicilio y en hoteles de Santiago.',
};

const benefits = [
  {
    icon: TrendingUp,
    title: 'Comisiones competitivas',
    body: 'Estructura de comisión clara, pagos puntuales y bonos por rendimiento. Tu trabajo tiene recompensa real.',
  },
  {
    icon: Users,
    title: 'Clientes de alto valor',
    body: 'Trabajas con clientela premium en hoteles, suites privadas y domicilios de alto ticket en Santiago.',
  },
  {
    icon: Sparkles,
    title: 'Respaldo de marca',
    body: 'Acceso a herramientas, materiales y protocolo de marca que elevan tu presencia profesional.',
  },
];

const requirements = [
  '3+ años de experiencia en salón o spa premium',
  'Certificación vigente en tu especialidad',
  'Seguro de responsabilidad civil o disposición a obtenerlo',
  'Disponibilidad mínima de 3 días por semana',
  'Profesionalismo y orientación al detalle',
];

export default function PostularPage() {
  return (
    <main className="min-h-screen bg-[#f8f4ed]">
      {/* Hero */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
            <span className="h-px w-8 bg-[#c9a96e]" />
            Equipo Reverencia
          </span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight text-stone-950 lg:text-6xl">
            Trabaja con la marca de luxury beauty más enfocada en operación premium.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">
            Buscamos profesionales certificados que quieran elevar su práctica con clientes de alto
            valor, protocolo editorial y un sistema de reservas pensado para operar sin fricción.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
            <span className="h-px w-8 bg-[#c9a96e]" />
            ¿Por qué Reverencia?
          </span>
          <h2 className="mt-3 font-serif text-4xl text-stone-950">
            Beneficios reales para tu carrera
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-[0_14px_40px_rgba(63,47,36,0.05)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a96e]/12 text-[#8e6b3d]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif text-2xl text-stone-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Requirements + Form */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Requirements */}
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8">
            <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-stone-400">
              Perfil buscado
            </p>
            <h3 className="font-serif text-3xl text-stone-950">Requisitos mínimos</h3>
            <div className="mt-6 space-y-3">
              {requirements.map((req) => (
                <div key={req} className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-[#b98f53]"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-6 text-stone-600">{req}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-[#faf7f2] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e6b3d]">
                Proceso de incorporación
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  'Revisión de tu postulación en 2-3 días',
                  'Entrevista con el equipo operativo',
                  'Sesión práctica de evaluación',
                  'Onboarding con protocolo de marca',
                ].map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-stone-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-[#8e6b3d] shadow-sm">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_25px_80px_rgba(28,25,23,0.06)]">
            <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-stone-400">
              Postulación
            </p>
            <h2 className="mb-6 font-serif text-3xl text-stone-950">Envía tu solicitud</h2>
            <ProfessionalApplicationForm />
          </div>
        </div>
      </section>
    </main>
  );
}
