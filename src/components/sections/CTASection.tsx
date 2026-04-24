import Link from 'next/link';
import { MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

const WHATSAPP_NUMBER = '+56912345678';
const EMAIL = 'hola@reverenciamajestad.cl';

export default function CTASection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, quiero reservar un servicio')}`;

  return (
    <section className="bg-char py-24 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center">

        {/* Discount badge */}
        <span className="inline-flex items-center gap-2 text-xs font-sans font-medium tracking-widest text-gold uppercase mb-8 border border-gold/30 px-4 py-2 rounded-sm">
          Oferta de bienvenida
        </span>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-white leading-tight mb-4">
          Tu primera reserva
          <span className="block text-gold">20% de descuento</span>
        </h2>

        <p className="font-sans text-sm text-white/60 max-w-md mx-auto leading-relaxed mb-12">
          Válido para nuevos clientes. Sin código necesario, el descuento se aplica
          automáticamente al confirmar tu primera reserva.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          <Button variant="gold" size="lg" asChild>
            <Link href="/reservar" className="inline-flex items-center gap-2">
              Reservar con Descuento <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="border-white/20 text-white hover:border-gold hover:text-gold" asChild>
            <Link href="/servicios">Ver Servicios</Link>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="h-px w-16 bg-white/10" />
          <span className="text-[11px] font-sans text-white/30 tracking-widest uppercase">
            o contáctanos directo
          </span>
          <span className="h-px w-16 bg-white/10" />
        </div>

        {/* Contact */}
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar por WhatsApp al ${WHATSAPP_NUMBER}`}
            className="inline-flex items-center gap-2.5 font-sans text-sm text-white/70 hover:text-white transition-colors"
          >
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/5 border border-white/10">
              <MessageCircle size={16} />
            </span>
            <span>{WHATSAPP_NUMBER}</span>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            aria-label={`Enviar email a ${EMAIL}`}
            className="inline-flex items-center gap-2.5 font-sans text-sm text-white/70 hover:text-white transition-colors"
          >
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/5 border border-white/10">
              <Mail size={16} />
            </span>
            <span>{EMAIL}</span>
          </a>
        </div>

      </div>
    </section>
  );
}
