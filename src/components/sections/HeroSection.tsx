import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui';

const trust = [
  { icon: Users,  value: '500+',  label: 'Clientes' },
  { icon: Star,   value: '4.9★',  label: 'Calificación' },
  { icon: MapPin, value: 'SCL',   label: 'Santiago' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-60px)] bg-cream flex items-center overflow-hidden">
      {/* subtle grain texture overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — content */}
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-6">
              <span className="h-px w-8 bg-gold" />
              Beauty &amp; Wellness
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[68px] leading-[1.05] text-char mb-6">
              Lujo<br />
              <em className="not-italic text-gold">a tu puerta</em>
            </h1>

            <p className="font-sans text-base text-gray max-w-md leading-relaxed mb-10">
              Profesionales certificados en hair &amp; spa que llegan a tu hogar o
              habitación de hotel en Santiago. Sin desplazamientos, sin esperas.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Button variant="dark" size="lg" asChild>
                <Link href="/reservar">Reservar Ahora</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#servicios">Ver Servicios</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-8">
              {trust.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-sm bg-gold/10">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-serif text-base font-medium text-char leading-none">{value}</p>
                    <p className="text-[11px] font-sans text-gray mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md aspect-[3/4] rounded-md overflow-hidden shadow-lg">
              <Image
                src="/images/hero.jpg"
                alt="Servicio de belleza a domicilio en Santiago"
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* floating rating card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-md px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white bg-gold/20 flex items-center justify-center text-[10px] font-sans font-semibold text-gold-dark"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className="fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-[11px] font-sans text-gray truncate">
                    +500 clientes satisfechos
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
