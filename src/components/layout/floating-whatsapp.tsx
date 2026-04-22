export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "56912345678"}?text=Hola%2C%20quiero%20coordinar%20una%20experiencia%20Reverencia%20Majestad.`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_60px_rgba(37,211,102,0.35)] transition hover:translate-y-[-2px]"
    >
      WhatsApp concierge
    </a>
  );
}
