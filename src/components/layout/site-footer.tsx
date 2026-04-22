import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#faf7f2]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-10">
        <div className="space-y-4">
          <h3 className="font-serif text-3xl text-stone-900">Reverencia Majestad</h3>
          <p className="max-w-md text-sm leading-7 text-stone-600">
            Plataforma premium de belleza y bienestar móvil para clientes particulares, suites
            hoteleras y alianzas B2B en Santiago de Chile.
          </p>
        </div>
        <div className="space-y-3 text-sm text-stone-600">
          <p className="font-medium uppercase tracking-[0.3em] text-stone-500">Navegación</p>
          <div className="grid gap-2">
            <Link href="/reservas">Reservas</Link>
            <Link href="/alianzas">Hoteles</Link>
            <Link href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="space-y-3 text-sm text-stone-600">
          <p className="font-medium uppercase tracking-[0.3em] text-stone-500">Contacto</p>
          <div className="grid gap-2">
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "56912345678"}`}>WhatsApp concierge</a>
            <a href="mailto:reservas@reverenciamajestad.cl">reservas@reverenciamajestad.cl</a>
            <p>Santiago de Chile · Atención a domicilio y hoteles</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
