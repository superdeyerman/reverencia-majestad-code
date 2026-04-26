import Link from 'next/link';
import { ArrowRight, Building2, MessageCircle } from 'lucide-react';

const hotels = [
  {
    name: 'The Ritz-Carlton Santiago',
    district: 'Las Condes',
    tagline: 'Suite de lujo in-room',
    description: 'Protocolo exclusivo para huéspedes VIP. Masajes, faciales y styling en suite con ambientación Ritz.',
    services: ['Hotel Spa Experience', 'Ritual de Pareja', 'Color & Brushing'],
    active: false,
  },
  {
    name: 'Hotel W Santiago',
    district: 'Las Condes',
    tagline: 'Lifestyle & wellness',
    description: 'Servicios on-demand para un perfil de huésped contemporáneo. Velocidad y estética premium.',
    services: ['Masaje Deep Relief', 'Maquillaje Express', 'Facial Glow'],
    active: false,
  },
  {
    name: 'Mandarin Oriental',
    district: 'Las Condes',
    tagline: 'Experiencia editorial',
    description: 'Rituales de bienestar integrados al estándar de la cadena. Atención en suite con protocolo curado.',
    services: ['Ritual Detox Corporal', 'Aromaterapia', 'Facial Antienvejecimiento'],
    active: false,
  },
  {
    name: 'The Singular Santiago',
    district: 'Lastarria',
    tagline: 'Diseño & exclusividad',
    description: 'Servicio premium para el hotel boutique más icónico de Santiago. Estética editorial impecable.',
    services: ['Balayage Editorial', 'Maquillaje Nupcial', 'Nail Art Editorial'],
    active: false,
  },
  {
    name: 'Grand Hyatt Santiago',
    district: 'Las Condes',
    tagline: 'Corporativo & VIP',
    description: 'Paquetes express y de bienestar para ejecutivos de alto ticket y viajeros de negocios.',
    services: ['Ejecutivo Express', 'Masaje Sueco', 'Keratina Couture'],
    active: false,
  },
  {
    name: 'Hotel Magnolia',
    district: 'Providencia',
    tagline: 'Boutique premium',
    description: 'Alianza activa para huéspedes VIP. Los primeros en incorporar el concierge Reverencia Majestad.',
    services: ['Hotel Spa Experience', 'Masaje Prenatal', 'Color Signature'],
    active: true,
  },
];

export default function HotelExperiencesSection() {
  return (
    <section className="bg-[#171311] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.32em] text-[#d9bb8b]">
              <span className="h-px w-8 bg-[#c9a96e]" />
              Alianzas hoteleras
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-white lg:text-5xl">
              Experiencias in-room en los mejores hoteles de Santiago.
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/60">
              Disponible para huéspedes en habitación. Sin traslados, sin interrupciones.
              El profesional llega directamente a tu suite.
            </p>
          </div>
          <a
            href="https://wa.me/56963929354?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20el%20programa%20hotelero"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-5 py-3 text-sm text-white/70 transition hover:border-[#c9a96e]/50 hover:text-white"
          >
            <MessageCircle size={15} aria-hidden="true" />
            Contactar para alianza B2B
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <article
              key={hotel.name}
              className={`flex flex-col rounded-[2rem] border p-7 transition-all ${
                hotel.active
                  ? 'border-[#c9a96e]/40 bg-[#c9a96e]/8 shadow-[0_20px_60px_rgba(201,169,110,0.10)]'
                  : 'border-white/8 bg-white/4 hover:border-white/15'
              }`}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-[#d9bb8b]">
                  <Building2 size={18} aria-hidden="true" />
                </div>
                {hotel.active && (
                  <span className="inline-flex items-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#d9bb8b]">
                    Activo
                  </span>
                )}
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#c9a96e]/70">{hotel.district}</p>
              <h3 className="mt-1 font-serif text-xl leading-snug text-white">{hotel.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-white/40">{hotel.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-white/55">{hotel.description}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {hotel.services.map((s) => (
                  <span key={s} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] text-white/50">{s}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-[2rem] border border-white/8 bg-white/4 p-8 lg:p-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">Programa B2B</p>
              <h3 className="mt-3 font-serif text-3xl text-white">¿Tu hotel no está aquí?</h3>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Nos asociamos con hoteles que comparten el estándar premium. Si eres gerente de
                spa, concierge o director de experiencia, podemos diseñar el programa juntos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/alianzas"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#c9a96e] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#b98f53]"
              >
                Ver programa de alianzas <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href="https://wa.me/56963929354?text=Hola%2C%20quiero%20una%20alianza%20hotelera"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-6 py-3 text-sm text-white/70 transition hover:text-white"
              >
                <MessageCircle size={14} aria-hidden="true" />
                WhatsApp directo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
