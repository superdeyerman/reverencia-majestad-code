import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';

export default function FounderSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-12 rounded-[2.5rem] border border-stone-200 bg-[#faf7f2] p-8 lg:grid-cols-[1fr_1.2fr] lg:p-14">
          {/* Left: founder identity */}
          <div className="flex flex-col justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#b98f53]">
                <span className="h-px w-8 bg-[#c9a96e]" />
                Fundador
              </span>
              <h2 className="mt-4 font-serif text-5xl leading-tight text-stone-950 lg:text-6xl">
                Deyerman<br />Rivero
              </h2>
              <p className="mt-4 text-sm leading-8 text-stone-600">
                Director creativo y fundador de Reverencia Majestad. Construyó la plataforma para
                cerrar la brecha entre el lujo real y la accesibilidad digital: misma calidad,
                proceso más claro.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '8+', label: 'años en la industria' },
                { value: '500+', label: 'clientes atendidos' },
                { value: '5★', label: 'calificación promedio' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="font-serif text-3xl text-stone-950">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: quote + CTA */}
          <div className="flex flex-col justify-between gap-8">
            <div className="relative rounded-[2rem] border border-[#c9a96e]/25 bg-white p-8 shadow-[0_16px_50px_rgba(63,47,36,0.06)]">
              <Quote size={32} className="mb-5 text-[#c9a96e]/40" aria-hidden="true" />
              <p className="font-serif text-2xl leading-relaxed text-stone-950 lg:text-3xl">
                "El lujo no debería requerir intermediarios. Diseñé este sistema para que la
                experiencia de reservar sea tan premium como el servicio mismo."
              </p>
              <div className="mt-8 flex items-center gap-4 border-t border-stone-100 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c9a96e]/15 font-serif text-lg text-[#8e6b3d]">
                  DR
                </div>
                <div>
                  <p className="font-serif text-lg text-stone-950">Deyerman Rivero</p>
                  <p className="text-xs text-stone-500">Fundador · Director Creativo</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/reservar"
                className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              >
                Reservar ahora <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/56963929354?text=Hola%2C%20quiero%20hablar%20con%20el%20equipo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-6 py-3 text-sm text-stone-700 transition hover:border-[#c9a96e] hover:text-[#b98f53]"
              >
                Hablar con el equipo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
