import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";
import { getSession } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-stone-900">
            <Crown className="size-5" />
          </div>
          <div>
            <p className="font-serif text-2xl tracking-wide text-stone-900">Reverencia Majestad</p>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Luxury Hair & Spa Mobile
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-stone-700 lg:flex">
          <Link href="/#servicios">Servicios</Link>
          <Link href="/#experiencia">Experiencia</Link>
          <Link href="/alianzas">Hoteles</Link>
          <Link href="/reservas">Reservas</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "56912345678"}?text=Hola%20Reverencia%20Majestad%2C%20quiero%20reservar%20una%20experiencia.`}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-900 hover:text-stone-900 md:inline-flex"
          >
            WhatsApp
          </a>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-[0_16px_40px_rgba(28,25,23,0.18)] transition hover:bg-stone-700"
          >
            <Sparkles className="size-4" />
            {session ? "Dashboard" : "Acceso"}
          </Link>
        </div>
      </div>
    </header>
  );
}
