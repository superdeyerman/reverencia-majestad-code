import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  { count: '1', label: 'servicio', discount: '0%', caption: 'Precio base', highlight: false },
  { count: '2', label: 'servicios', discount: '5%', caption: 'Ahorro real', highlight: false },
  { count: '3', label: 'servicios', discount: '10%', caption: 'Sesión premium', highlight: false },
  { count: '4+', label: 'servicios', discount: '15%', caption: 'Paquete VIP', highlight: true },
];

export default function DiscountLadderSection() {
  return (
    <section className="bg-[#f8f4ed] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
            <span className="h-px w-8 bg-[#c9a96e]" />
            Descuentos por volumen
          </span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-stone-950 lg:text-5xl">
            Más servicios,{' '}
            <span className="text-[#b98f53]">mejor precio.</span>
          </h2>
          <p className="mt-5 text-sm leading-8 text-stone-600">
            Combina tratamientos en una misma sesión y obtén un descuento automático
            que crece con cada servicio que agregas. Se aplica en el resumen de compra.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.count}
              className={`relative flex flex-col rounded-[2rem] border p-8 transition-all ${
                step.highlight
                  ? 'border-[#c9a96e] bg-[#171311] shadow-[0_20px_60px_rgba(201,169,110,0.18)]'
                  : 'border-stone-200 bg-white shadow-[0_14px_40px_rgba(63,47,36,0.05)]'
              }`}
            >
              {step.highlight && (
                <span className="absolute -top-3 left-6 inline-flex items-center rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#d9bb8b]">
                  Mayor ahorro
                </span>
              )}
              <div className="mb-6 flex items-end gap-2">
                <span className={`font-serif text-6xl leading-none ${step.highlight ? 'text-[#d9bb8b]' : 'text-stone-950'}`}>
                  {step.count}
                </span>
                <span className={`mb-2 text-sm ${step.highlight ? 'text-white/58' : 'text-stone-500'}`}>
                  {step.label}
                </span>
              </div>
              <div className={`mb-3 font-serif text-4xl ${step.highlight ? 'text-[#d9bb8b]' : 'text-[#b98f53]'}`}>
                {step.discount}
              </div>
              <p className={`text-xs uppercase tracking-[0.22em] ${step.highlight ? 'text-white/50' : 'text-stone-400'}`}>
                {step.caption}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-5">
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Reservar con descuento <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <p className="text-xs text-stone-400">El descuento se aplica automáticamente al agregar servicios.</p>
        </div>
      </div>
    </section>
  );
}
