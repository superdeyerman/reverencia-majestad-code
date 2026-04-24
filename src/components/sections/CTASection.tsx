import Link from 'next/link';
import { ArrowRight, Mail, MessageCircle, ShieldCheck, Sparkles, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui';

const WHATSAPP_NUMBER = '+56963929354';
const EMAIL = 'reverenciamajestad@gmail.com';

const assurances = [
  {
    icon: ShieldCheck,
    title: 'Abono claro y seguro',
    body: 'Reserva con 20% y recibe confirmación inmediata por canales directos.',
  },
  {
    icon: TimerReset,
    title: 'Respuesta rápida',
    body: 'WhatsApp concierge para dudas de agenda, hoteles, eventos o servicios a medida.',
  },
  {
    icon: Sparkles,
    title: 'Experiencia repetible',
    body: 'El objetivo no es solo vender una vez: es dejar una impresión que invite a volver.',
  },
];

export default function CTASection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero reservar una experiencia premium')}`;

  return (
    <section className="relative overflow-hidden bg-[#171311] py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#c9a96e]/14 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-white/8 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
        <div className="grid gap-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.28)] backdrop-blur lg:grid-cols-[1.08fr_0.92fr] lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#d9bb8b]">
              Oferta de bienvenida
            </span>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-white sm:text-5xl">
              Convierte la intención en una reserva elegante, clara y memorable.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/68">
              Primera reserva con 20% de descuento, soporte por WhatsApp y experiencia diseñada
              para que el proceso se sienta tan premium como el servicio.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/reservar" className="inline-flex items-center gap-2">
                  Reservar con descuento <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:border-[#c9a96e] hover:text-[#d9bb8b]"
                asChild
              >
                <Link href="/servicios">Ver catálogo completo</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-white/70">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <MessageCircle size={16} aria-hidden="true" />
                WhatsApp concierge
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail size={16} aria-hidden="true" />
                {EMAIL}
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            {assurances.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c9a96e]/15 text-[#d9bb8b]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-serif text-2xl text-white">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
