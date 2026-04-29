import Link from 'next/link';
import { ArrowRight, Clock3, MapPin, ShieldCheck, Sparkles, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui';

const trustStats = [
  { icon: Users, value: '500+', label: 'clientes atendidos' },
  { icon: Star, value: '4.9/5', label: 'experiencia promedio' },
  { icon: MapPin, value: 'Santiago', label: 'domicilio y hotel' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="mx-auto grid min-h-[calc(100vh-60px)] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-2 lg:px-12">
        <div>
          <p className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-[#C9A96E]">
            <span className="h-px w-10 bg-[#C9A96E]" />
            Luxury Hair & Spa Mobile
          </p>

          <h1 className="max-w-3xl font-serif text-5xl font-light leading-[1.02] text-[#1A1A1A] sm:text-6xl lg:text-[82px]">
            Belleza privada,
            <span className="block italic text-[#C9A96E]">agenda concierge</span>
            y experiencia premium.
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-8 text-[#6B6B6B]">
            Servicios capilares, spa y wellness a domicilio, en estudio privado u hoteles.
            Reserva online, confirma con abono y vive una atención diseñada para sentirse de lujo.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/reservar">
              <Button variant="dark" size="lg" className="inline-flex items-center gap-2">
                Reservar experiencia
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>

            <a href="#servicios">
              <Button variant="outline" size="lg">
                Explorar servicios
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-[#E2DDD6] pt-8">
            {trustStats.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-[#C9A96E]" />
                  <span className="font-serif text-3xl text-[#1A1A1A]">{value}</span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#6B6B6B]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2.7rem] border border-white bg-[#EDE5DB] shadow-[0_35px_100px_rgba(63,47,36,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,169,110,0.40),transparent_34%),linear-gradient(145deg,#F7F1E8_0%,#D3B783_100%)]" />

            <div className="absolute left-1/2 top-[52%] h-[390px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-t-[11rem] rounded-b-[2.5rem] bg-[#1A1A1A]/90 shadow-2xl" />
            <div className="absolute left-1/2 top-[49%] h-[310px] w-[235px] -translate-x-1/2 -translate-y-1/2 rounded-t-[9rem] rounded-b-[7rem] bg-[#F2D3B8]" />
            <div className="absolute left-1/2 top-[44%] h-[250px] w-[175px] -translate-x-1/2 -translate-y-1/2 rounded-t-[7rem] rounded-b-[5rem] bg-[#4B3426]" />
            <div className="absolute left-1/2 top-[66%] h-[210px] w-[240px] -translate-x-1/2 rounded-t-[5rem] bg-white/82 backdrop-blur" />

            <div className="absolute left-8 top-8 rounded-[1.5rem] border border-[#E2DDD6] bg-white/94 px-5 py-4 shadow-[0_20px_50px_rgba(63,47,36,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#9B9288]">Concierge timing</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F5] text-[#9E7A3F]">
                  <Clock3 size={16} />
                </span>
                <div>
                  <p className="font-serif text-xl text-[#1A1A1A]">20% abono</p>
                  <p className="text-xs text-[#6B6B6B]">Bloquea agenda en minutos</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[1.7rem] border border-white/50 bg-white/78 p-6 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.30em] text-[#C9A96E]">
                Signature arrival
              </p>
              <p className="mt-2 font-serif text-3xl text-[#1A1A1A]">
                Ritual editorial con llegada, montaje y cierre impecable.
              </p>
            </div>

            <div className="absolute right-8 top-8 rounded-[1.3rem] border border-white/60 bg-white/88 px-5 py-4 shadow-[0_20px_50px_rgba(63,47,36,0.10)]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#9B9288]">Disponible hoy</p>
              <div className="mt-3 space-y-2 text-sm text-[#1A1A1A]">
                <p><span className="text-[#4A7C59]">●</span> Color</p>
                <p><span className="text-[#4A7C59]">●</span> Spa capilar</p>
                <p><span className="text-[#C9873A]">●</span> Alisado</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 right-6 max-w-[260px] rounded-[1.5rem] border border-[#E2DDD6] bg-white px-5 py-4 shadow-[0_24px_60px_rgba(63,47,36,0.16)]">
            <div className="flex items-center gap-1 text-[#C9A96E]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={13} className="fill-current" />
              ))}
            </div>
            <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
              “La reserva se siente premium desde la primera interacción.”
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}