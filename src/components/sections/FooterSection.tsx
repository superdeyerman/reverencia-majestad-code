import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '+56912345678';
const EMAIL = 'hola@reverenciamajestad.cl';
const CURRENT_YEAR = new Date().getFullYear();

const columns = [
  {
    heading: 'Servicios',
    links: [
      { label: 'Corte & Styling',       href: '/servicios/corte' },
      { label: 'Colorimetría',           href: '/servicios/colorimetria' },
      { label: 'Masaje Relajante',       href: '/servicios/masaje' },
      { label: 'Tratamiento Facial',     href: '/servicios/facial' },
      { label: 'Todos los servicios',    href: '/servicios' },
    ],
  },
  {
    heading: 'Empresa',
    links: [
      { label: 'Nosotros',               href: '/nosotros' },
      { label: 'Para hoteles',           href: '/hoteles' },
      { label: 'Profesionales',          href: '/profesionales' },
      { label: 'Blog',                   href: '/blog' },
      { label: 'Trabaja con nosotros',   href: '/careers' },
    ],
  },
  {
    heading: 'Contacto',
    links: [
      { label: EMAIL,                    href: `mailto:${EMAIL}` },
      { label: WHATSAPP_NUMBER,          href: `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}` },
      { label: '@reverenciamajestad',    href: 'https://instagram.com/reverenciamajestad', external: true },
    ],
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Main grid */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <span className="font-serif text-xl text-char tracking-wide">
                Reverencia<br />
                <em className="not-italic text-gold">Majestad</em>
              </span>
            </Link>
            <p className="font-sans text-xs text-gray leading-relaxed mb-6 max-w-[200px]">
              Beauty &amp; wellness a domicilio en Santiago de Chile.
              Lujo, comodidad y profesionalismo.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/reverenciamajestad"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-gray hover:border-gold hover:text-gold transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-gray hover:border-gold hover:text-gold transition-colors"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-sans text-[10px] font-semibold tracking-widest text-char uppercase mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {'external' in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sans text-xs text-gray hover:text-char transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : link.href.startsWith('mailto:') || link.href.startsWith('https://wa.me') ? (
                      <a
                        href={link.href}
                        className="font-sans text-xs text-gray hover:text-char transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-sans text-xs text-gray hover:text-char transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-gray">
            © {CURRENT_YEAR} Reverencia Majestad. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            <Link href="/privacidad" className="font-sans text-[11px] text-gray hover:text-char transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="font-sans text-[11px] text-gray hover:text-char transition-colors">
              Términos
            </Link>
            <Link href="/cookies" className="font-sans text-[11px] text-gray hover:text-char transition-colors">
              Cookies
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
