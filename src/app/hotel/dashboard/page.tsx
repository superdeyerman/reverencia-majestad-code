'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookingStatus } from '@prisma/client';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  DollarSign,
  Hotel,
  Inbox,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatCLP, formatCLPCompact, statusColor, statusLabel } from '@/lib/utils';

type BookingItem = {
  id: string;
  code: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  roomNumber?: string;
  professional?: string;
  date: string;
  time: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  isDepositPaid: boolean;
};

type HotelInfo = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  district?: string;
  commissionRate: number;
  commissionPercentage: number;
};

type Stats = {
  totalRevenue: number;
  commissionEarned: number;
  activeBookings: number;
  completedCount: number;
  totalBookings: number;
};

type DashboardData = {
  hotel: HotelInfo;
  stats: Stats;
  todayBookings: BookingItem[];
  upcomingBookings: BookingItem[];
  recentBookings: BookingItem[];
};

function BookingRow({ booking }: { booking: BookingItem }) {
  return (
    <tr className="border-b border-stone-100 last:border-0">
      <td className="py-3 pr-4">
        <p className="text-sm font-medium text-stone-950">{booking.clientName}</p>
        {booking.clientPhone && (
          <p className="text-xs text-stone-400">{booking.clientPhone}</p>
        )}
      </td>
      <td className="py-3 pr-4 text-sm text-stone-700">{booking.serviceName}</td>
      <td className="py-3 pr-4 text-sm text-stone-500">
        {booking.roomNumber ? `Hab. ${booking.roomNumber}` : '—'}
      </td>
      <td className="py-3 pr-4 text-sm text-stone-500">
        {booking.date} · {booking.time}
      </td>
      <td className="py-3 pr-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(booking.status)}`}>
          {statusLabel(booking.status)}
        </span>
      </td>
      <td className="py-3 text-right text-sm font-medium text-[#8e6b3d]">
        {formatCLP(booking.totalAmount)}
      </td>
    </tr>
  );
}

function BookingCard({ booking }: { booking: BookingItem }) {
  return (
    <article className="rounded-[1.8rem] border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-xl text-stone-950">{booking.clientName}</p>
          <p className="mt-0.5 text-sm text-stone-500">{booking.serviceName}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(booking.status)}`}>
          {statusLabel(booking.status)}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-500">
        <span>{booking.date} · {booking.time}</span>
        {booking.roomNumber && <span>Hab. {booking.roomNumber}</span>}
        {booking.professional && <span>Prof. {booking.professional}</span>}
        <span>{formatCLP(booking.totalAmount)}</span>
      </div>
    </article>
  );
}

export default function HotelDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hotel/dashboard', { cache: 'no-store' });
      if (!response.ok) {
        setError('No se pudo cargar el panel del hotel.');
        return;
      }
      setData((await response.json()) as DashboardData);
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const response = await fetch('/api/hotel/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) { setError('No se pudo cargar el panel.'); setLoading(false); }
          return;
        }
        const json = (await response.json()) as DashboardData;
        if (!cancelled) { setData(json); setLoading(false); }
      } catch {
        if (!cancelled) { setError('Error de conexión.'); setLoading(false); }
      }
    };
    void init();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <RefreshCw size={24} className="mx-auto animate-spin text-[#b98f53]" aria-hidden="true" />
          <p className="text-sm text-stone-500">Cargando panel del hotel...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-[2rem] border border-rose-200 bg-white p-8 text-center">
          <p className="text-sm text-rose-600">{error ?? 'Error desconocido'}</p>
          <button
            onClick={() => void load()}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:border-stone-950"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { hotel, stats, todayBookings, upcomingBookings, recentBookings } = data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8e6b3d]">
            <Hotel size={12} aria-hidden="true" />
            Panel de hotel partner
          </div>
          <h1 className="mt-4 font-serif text-4xl text-stone-950">{hotel.name}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {hotel.district} · Comisión {hotel.commissionPercentage}%
          </p>
        </div>
        <button
          onClick={() => void load(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-700 transition-colors hover:border-stone-950 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: 'Revenue total',
            value: formatCLPCompact(stats.totalRevenue),
            sub: 'servicios completados',
            icon: <DollarSign size={18} aria-hidden="true" />,
          },
          {
            label: 'Comisión ganada',
            value: formatCLPCompact(stats.commissionEarned),
            sub: `${hotel.commissionPercentage}% del revenue`,
            icon: <TrendingUp size={18} aria-hidden="true" />,
          },
          {
            label: 'Reservas activas',
            value: stats.activeBookings,
            sub: 'en curso o confirmadas',
            icon: <CalendarCheck size={18} aria-hidden="true" />,
          },
          {
            label: 'Completados',
            value: stats.completedCount,
            sub: `de ${stats.totalBookings} total`,
            icon: <CheckCircle2 size={18} aria-hidden="true" />,
          },
        ].map(({ label, value, sub, icon }) => (
          <div
            key={label}
            className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_14px_40px_rgba(63,47,36,0.04)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c9a96e]/12 text-[#8e6b3d]">
              {icon}
            </div>
            <p className="mt-4 font-serif text-3xl text-stone-950">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">{label}</p>
            <p className="mt-0.5 text-xs text-stone-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Today */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-serif text-3xl text-stone-950">Servicios de hoy</h2>
          <span className="rounded-full bg-[#c9a96e]/14 px-3 py-1 text-xs text-[#8e6b3d]">
            {todayBookings.length}
          </span>
        </div>
        {todayBookings.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-center">
            <Inbox size={20} className="mx-auto text-stone-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-stone-500">No hay servicios programados para hoy.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingBookings.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-serif text-3xl text-stone-950">Próximas reservas</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
              {upcomingBookings.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {/* All bookings table */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-stone-950">Historial completo</h2>
          <span className="text-sm text-stone-400">{recentBookings.length} registros</span>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white shadow-[0_14px_40px_rgba(63,47,36,0.04)]">
          {recentBookings.length === 0 ? (
            <div className="px-8 py-14 text-center">
              <Users size={20} className="mx-auto text-stone-300" aria-hidden="true" />
              <p className="mt-3 text-sm text-stone-500">
                Todavía no hay reservas registradas para este hotel.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="px-6 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Huésped
                    </th>
                    <th className="pr-4 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Servicio
                    </th>
                    <th className="pr-4 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Hab.
                    </th>
                    <th className="pr-4 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Fecha
                    </th>
                    <th className="pr-4 py-4 text-left text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Estado
                    </th>
                    <th className="pr-6 py-4 text-right text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="px-6">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-stone-50 px-6 last:border-0">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-stone-950">{b.clientName}</p>
                        {b.clientPhone && (
                          <p className="text-xs text-stone-400">{b.clientPhone}</p>
                        )}
                      </td>
                      <td className="pr-4 py-3 text-sm text-stone-700">{b.serviceName}</td>
                      <td className="pr-4 py-3 text-sm text-stone-500">
                        {b.roomNumber ? `Hab. ${b.roomNumber}` : '—'}
                      </td>
                      <td className="pr-4 py-3 text-sm text-stone-500">
                        {b.date} · {b.time}
                      </td>
                      <td className="pr-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(b.status)}`}>
                          {statusLabel(b.status)}
                        </span>
                      </td>
                      <td className="pr-6 py-3 text-right text-sm font-medium text-[#8e6b3d]">
                        {formatCLP(b.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Commission note */}
      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-[#171311] px-6 py-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">Modelo de comisión</p>
            <h2 className="mt-2 font-serif text-3xl">{hotel.commissionPercentage}% sobre servicios completados</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">
              Reverencia factura directamente al huésped. La liquidación mensual refleja el revenue
              share acordado sobre los servicios completados en {hotel.name}.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center">
            <p className="font-serif text-3xl text-[#d9bb8b]">{formatCLPCompact(stats.commissionEarned)}</p>
            <p className="mt-1 text-xs text-white/50">comisión acumulada</p>
          </div>
        </div>
      </section>
    </div>
  );
}
