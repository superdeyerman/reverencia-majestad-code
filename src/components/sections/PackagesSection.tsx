import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const packages = [
  {
    slug: 'ritual-romance',
    name: 'Ritual Romance',
    tagline: 'Para dos personas',
    description: 'Masajes sincrónicos, facial express, ambientación con velas y brindis de cierre. Ideal para suites y aniversarios.',
    includes: ['2 masajes relajantes 60 min', 'Facial Glow para ambos', 'Aromaterapia y velas', 'Brindis de cierre'],
    price: 248000,
    duration: '3 h',
    featured: false,
    href: '/reservar?servicio=couples-ritual',
  },
  {
    slug: 'escape-wellness',
    name: 'Escape Wellness',
    tagline: 'Bienestar total',
    description: 'Tres tratamientos pensados para desconectar: masaje deep tissue, exfoliación corporal y sesión de aromaterapia.',
    includes: ['Masaje Deep Relief 75 min', 'Exfoliación corporal premium', 'Sesión de aromaterapia', 'Hidratación post-tratamiento'],
    price: 169000,
    duration: '3.5 h',
    featured: true,
    href: '/reservar?servicio=deep-tissue-massage',
  },
  {
    slug: 'novia-perfecta',
    name: 'Novia Perfecta',
    tagline: 'Para el gran día',
    description: 'Color o brushing couture, maquillaje nupcial airbrush y manicura de gel. Todo en un solo booking.',
    includes: ['Color o brushing couture', 'Maquillaje nupcial airbrush HD', 'Manicura gel premium', 'Consulta de look previa'],
    price: 195000,
    duration: '4 h',
    featured: false,
    href: '/reservar?servicio=bridal-makeup',
  },
  {
    slug: 'ejecutivo-premium',
    name: 'Ejecutivo Premium',
    tagline: 'Eficiencia & cuidado',
    description: 'Brushing express, masaje cervical y facial de hidratación rápida. Recuperación y presencia en sesión compacta.',
    includes: ['Brushing & finishing 45 min', 'Masaje cervical express 30 min', 'Facial hidratación rápida', 'Sin traslado ni espera'],
    price: 89000,
    duration: '2 h',
    featured: false,
    href: '/reservar?servicio=brushing-premium',
  },
];

export default function PackagesSection() {
  return (
    <section className="border-y border-stone-200 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Paquetes curados
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
              Experiencias completas,<br />listas para reservar.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-stone-500">
            Combinaciones diseñadas para maximizar bienestar y valor en una sola sesión.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => (
            <article
              key={pkg.slug}
              className={`relative flex flex-col rounded-[2rem] border p-7 transition-shadow hover:shadow-lg ${
                pkg.featured
                  ? 'border-[#c9a96e] bg-[#fdf9f2] shadow-[0_20px_60px_rgba(201,169,110,0.12)]'
                  : 'border-stone-200 bg-[#faf7f2] shadow-[0_14px_40px_rgba(63,47,36,0.05)]'
              }`}
            >
              {pkg.featured && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full border border-[#c9a96e]/30 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#b98f53]">
                  <Sparkles size={9} aria-hidden="true" /> Más popular
                </span>
              )}
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#b98f53]">{pkg.tagline}</p>
              <h3 className="mt-2 font-serif text-2xl text-stone-950">{pkg.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-stone-600">{pkg.description}</p>
              <ul className="mt-5 space-y-2">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-stone-600">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-stone-200 pt-5">
                <div className="mb-4 flex items-baseline gap-1.5">
                  <span className="font-serif text-2xl text-stone-950">
                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(pkg.price)}
                  </span>
                  <span className="text-xs text-stone-400">{pkg.duration}</span>
                </div>
                <Link
                  href={pkg.href}
                  className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:border-[#c9a96e] hover:text-[#b98f53]"
                >
                  Reservar paquete
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
