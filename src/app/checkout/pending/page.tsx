export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
          ⏳
        </div>
        <h1 className="font-serif text-3xl text-stone-900">Pago pendiente</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Tu pago está siendo procesado. Algunos métodos de pago pueden tardar
          hasta 24 horas en confirmarse.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Te notificaremos por email y WhatsApp cuando tu reserva quede
          confirmada.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="/"
            className="block w-full rounded-full bg-stone-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Volver al inicio
          </a>
          <a
            href="/reservas"
            className="block w-full rounded-full border border-stone-200 px-6 py-4 text-center text-sm font-medium text-stone-700 transition hover:border-stone-900"
          >
            Hacer otra reserva
          </a>
        </div>
      </div>
    </main>
  );
}
