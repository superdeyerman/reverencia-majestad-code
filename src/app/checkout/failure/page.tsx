"use client";

import { useState } from "react";

export default function FailurePage() {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('bookingId');
    }
    return null;
  });

  async function handleRetry() {
    if (!bookingId) return;

    setRetrying(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No fue posible reiniciar el pago.");
        setRetrying(false);
        return;
      }

      window.location.href = data.init_point;
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setRetrying(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          ✕
        </div>
        <h1 className="font-serif text-3xl text-stone-900">Pago rechazado</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          El pago no pudo procesarse. Puedes intentarlo nuevamente con el mismo
          u otro método de pago. Tu reserva sigue activa.
        </p>

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3">
          {bookingId ? (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="block w-full rounded-full bg-stone-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
            >
              {retrying ? "Redirigiendo..." : "Reintentar pago"}
            </button>
          ) : null}
          <a
            href="/reservas"
            className="block w-full rounded-full border border-stone-200 px-6 py-4 text-center text-sm font-medium text-stone-700 transition hover:border-stone-900"
          >
            Hacer nueva reserva
          </a>
        </div>
      </div>
    </main>
  );
}
