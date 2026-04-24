"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type BookingData = {
  id: string;
  code: string;
  status: string;
  isDepositPaid: boolean;
  depositAmount: number;
  totalAmount: number;
  appointmentAt: string;
  service: { name: string };
};

type PageState = "loading" | "confirmed" | "pending" | "error";

const MAX_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 3000;

export default function SuccessPage() {
  const [pageState, setPageState] = useState<PageState>(() => {
    if (typeof window === 'undefined') return 'loading';
    return new URLSearchParams(window.location.search).get('bookingId') ? 'loading' : 'error';
  });
  const [booking, setBooking] = useState<BookingData | null>(null);
  const attemptsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* SSR-safe: polling only starts on client when bookingId is present */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');

    if (!bookingId) return;

    const checkStatus = async () => {
      attemptsRef.current += 1;

      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("fetch_failed");

        const data: BookingData = await res.json();

        if (data.isDepositPaid) {
          setBooking(data);
          setPageState("confirmed");
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setPageState("pending");
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setPageState("error");
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900" />
          <h2 className="font-serif text-2xl text-stone-900">Verificando pago...</h2>
          <p className="mt-2 text-sm text-stone-500">Esto puede tardar unos segundos.</p>
        </div>
      </main>
    );
  }

  if (pageState === "confirmed" && booking) {
    const appointmentDate = new Date(booking.appointmentAt);
    const formattedDate = appointmentDate.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-10 shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h1 className="font-serif text-3xl text-stone-900">Reserva confirmada</h1>
          <p className="mt-2 text-sm text-stone-500">Recibirás confirmación por email y WhatsApp.</p>

          <div className="mt-8 space-y-3 rounded-2xl bg-[#faf7f2] p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Código</span>
              <span className="font-mono font-semibold text-stone-900">{booking.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Servicio</span>
              <span className="text-stone-900">{booking.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Fecha</span>
              <span className="text-right text-stone-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Hora</span>
              <span className="text-stone-900">{formattedTime}</span>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3">
              <span className="text-stone-500">Abono pagado</span>
              <span className="font-semibold text-stone-900">
                {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(booking.depositAmount)}
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-gold px-6 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-gold-dark min-h-[44px]"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (pageState === "pending") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
            ⏳
          </div>
          <h1 className="font-serif text-3xl text-stone-900">Pago en proceso</h1>
          <p className="mt-3 text-sm text-stone-600">
            Tu pago está siendo procesado. Te notificaremos por email y WhatsApp cuando se confirme.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-gold px-6 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-gold-dark min-h-[44px]"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-[0_25px_80px_rgba(28,25,23,0.08)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          !</div>
        <h1 className="font-serif text-3xl text-stone-900">Error al verificar</h1>
        <p className="mt-3 text-sm text-stone-600">
          No pudimos verificar el estado de tu pago. Si realizaste el pago, te contactaremos pronto.
        </p>
        <Link
          href="/reservas"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-gold px-6 py-3.5 font-sans text-sm font-medium text-white transition-colors hover:bg-gold-dark min-h-[44px]"
        >
          Volver a reservas
        </Link>
      </div>
    </main>
  );
}
