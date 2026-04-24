import Link from 'next/link';

export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="w-full max-w-md rounded-md border border-border bg-white p-10 text-center shadow-sm">

        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl">
          ⏳
        </div>

        <h1 className="font-serif text-3xl text-char">Pago pendiente</h1>
        <p className="mt-3 font-sans text-sm leading-7 text-gray">
          Tu pago está siendo procesado. Algunos métodos de pago pueden tardar
          hasta 24 horas en confirmarse.
        </p>
        <p className="mt-2 font-sans text-sm text-gray/70">
          Te notificaremos por email y WhatsApp cuando tu reserva quede confirmada.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-md bg-gold px-6 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-gold-dark min-h-[44px]"
          >
            Volver al inicio
          </Link>
          <Link
            href="/reservas"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-6 py-3.5 font-sans text-sm font-medium text-char transition-colors hover:border-gold hover:text-gold min-h-[44px]"
          >
            Hacer otra reserva
          </Link>
        </div>

      </div>
    </main>
  );
}
