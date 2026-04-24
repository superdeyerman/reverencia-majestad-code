import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock3, MapPin, ShieldCheck, Sparkles, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui';

const trustStats = [
  { icon: Users, value: '500+', label: 'clientes atendidos' },
  { icon: Star, value: '4.9/5', label: 'promedio de experiencia' },
  { icon: MapPin, value: 'Santiago', label: 'domicilio y hotel' },
];

const reassurancePoints = [
  'Agenda visible y confirmación inmediata',
  'Profesionales certificados y protocolo premium',
  'Atención privada para hogar, suite o evento',
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f6f1e8]">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(201,169,110,0.18), transparent 28%), radial-gradient(circle at 85% 10%, rgba(26,26,26,0.08), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.52), transparent 40%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-[-8rem] top-28 h-72 w-72 rounded-full bg-white/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-[#d9bb8b]/20 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-60px)] max-w-7xl items-center gap-16 px-6 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-white/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.32em] text-[#8e6b3d] backdrop-blur">
            <Sparkles size={12} />
            Concierge Beauty & Wellness
          </div>

          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[0.97] text-stone-950 sm:text-6xl lg:text-[78px]">
            Experiencias de
            <span className="block text-[#b98f53]">belleza privada</span>
            para hogar, hotel y ocasión especial.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
            Hair, spa y rituales premium con agenda online, pricing transparente y un equipo que
            llega donde estés en Santiago. Menos fricción, más deseo, más lujo.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="dark" size="lg" asChild>
              <Link href="/reservar">
                Reservar experiencia <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#servicios">Explorar servicios</a>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:max-w-xl">
            {reassurancePoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/75 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                  <ShieldCheck size={16} aria-hidden="true" />
                </span>
                <span className="text-sm text-stone-700">{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-stone-200 pt-8">
            {trustStats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="min-w-[120px]">
                <div className="flex items-center gap-2 text-[#b98f53]">
                  <Icon size={15} aria-hidden="true" />
                  <span className="font-serif text-2xl text-stone-950">{value}</span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute inset-x-10 top-10 h-full rounded-[2.5rem] border border-white/40 bg-white/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/55 p-3 shadow-[0_35px_100px_rgba(63,47,36,0.18)] backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#e9dcc8]">
                <Image
                  src="/images/hero.svg"
                  alt="Servicio premium de belleza a domicilio"
                  width={900}
                  height={1200}
                  preload
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="h-auto w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1f1a17]/82 via-[#1f1a17]/28 to-transparent p-6 sm:p-7">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                        Signature arrival
                      </p>
                      <p className="mt-2 max-w-xs font-serif text-3xl text-white">
                        Ritual editorial con llegada, montaje y cierre impecable.
                      </p>
                    </div>
                    <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur sm:block">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Desde</p>
                      <p className="mt-1 font-serif text-2xl text-white">$25.000</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-4 top-7 rounded-[1.5rem] border border-stone-200 bg-white px-4 py-4 shadow-[0_20px_50px_rgba(63,47,36,0.12)] sm:-left-8 sm:px-5">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-400">Concierge timing</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                    <Clock3 size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-serif text-xl text-stone-900">20% abono</p>
                    <p className="text-xs text-stone-500">Bloquea agenda en minutos</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 right-4 max-w-[250px] rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 shadow-[0_24px_60px_rgba(63,47,36,0.16)] sm:right-8">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-400">Guest & home loved</p>
                <div className="mt-2 flex items-center gap-1 text-[#c9a96e]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={13} className="fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  “La reserva se siente premium desde la primera interacción.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
