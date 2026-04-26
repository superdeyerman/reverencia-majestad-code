'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookingStatus,
} from '@prisma/client';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  RefreshCw,
  Star,
  TrendingUp,
} from 'lucide-react';
import { formatCLP, formatCLPCompact, statusColor, statusLabel } from '@/lib/utils';

type BookingItem = {
  id: string;
  code: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  durationMinutes: number;
  date: string;
  time: string;
  modality: string;
  address?: string;
  district?: string;
  hotelName?: string;
  roomNumber?: string;
  status: BookingStatus;
  totalAmount: number;
};

type ProfessionalInfo = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  kind: string;
  level: string;
  specialties: string[];
  bio?: string;
  rating: number;
  reviews: number;
  commissionRate: number;
  commissionPercentage: number;
  isActive: boolean;
};

type Stats = {
  totalCompleted: number;
  totalEarnings: number;
  activeBookings: number;
  rating: number;
};

type DashboardData = {
  professional: ProfessionalInfo;
  stats: Stats;
  todayBookings: BookingItem[];
  upcomingBookings: BookingItem[];
  recentCompleted: BookingItem[];
};

const MODALITY_LABELS: Record<string, string> = {
  STUDIO: 'Estudio',
  HOME: 'Domicilio',
  HOTEL: 'Hotel',
  PRIVATE_STUDIO: 'Estudio privado',
};

const LEVEL_LABELS: Record<string, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Silver',
  GOLD: 'Gold',
  PLATINUM: 'Platinum',
};

function BookingCard({ booking }: { booking: BookingItem }) {
  const location = booking.hotelName
    ? `${booking.hotelName}${booking.roomNumber ? ` · Suite ${booking.roomNumber}` : ''}`
    : booking.address
    ? `${booking.address}${booking.district ? `, ${booking.district}` : ''}`
    : (booking.district ?? 'Santiago');

  return (
    <article className="rounded-[1.8rem] border border-stone-200 bg-white p-5 shadow-[0_10px_30px_rgba(63,47,36,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-serif text-xl text-stone-950">{booking.clientName}</p>
          <p className="mt-0.5 text-sm text-stone-500">{booking.serviceName}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(booking.status)}`}
        >
          {statusLabel(booking.status)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={13} aria-hidden="true" />
          {booking.date} · {booking.time}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} aria-hidden="true" />
          {booking.durationMinutes} min
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <MapPin size={13} aria-hidden="true" />
          <span className="truncate">
            {MODALITY_LABELS[booking.modality] ?? booking.modality} · {location}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="text-xs text-stone-400">Código {booking.code}</span>
        <span className="text-sm font-medium text-[#8e6b3d]">{formatCLP(booking.totalAmount)}</span>
      </div>
    </article>
  );
}

export default function ProfessionalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/professional/dashboard', { cache: 'no-store' });
      if (!response.ok) {
        setError('No se pudo cargar tu panel.');
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
        const response = await fetch('/api/professional/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) { setError('No se pudo cargar tu panel.'); setLoading(false); }
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

  const commissionEarnings = useMemo(() => {
    if (!data) return 0;
    return data.stats.totalEarnings;
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <RefreshCw size={24} className="mx-auto animate-spin text-[#b98f53]" aria-hidden="true" />
          <p className="text-sm text-stone-500">Cargando tu panel...</p>
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
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:border-stone-950 hover:text-stone-950"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { professional: prof, stats, todayBookings, upcomingBookings, recentCompleted } = data;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8e6b3d]">
            <Star size={12} className="fill-current" aria-hidden="true" />
            Panel profesional · {LEVEL_LABELS[prof.level] ?? prof.level}
          </div>
          <h1 className="mt-4 font-serif text-4xl text-stone-950">Hola, {prof.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-stone-500">{prof.specialties.join(' · ')}</p>
        </div>
        <button
          onClick={() => void load(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 self-start rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: 'Servicios completados',
            value: stats.totalCompleted,
            sub: 'en total',
            icon: <CheckCircle2 size={18} aria-hidden="true" />,
          },
          {
            label: 'Ganancias acumuladas',
            value: formatCLPCompact(commissionEarnings),
            sub: `comisión ${prof.commissionPercentage}%`,
            icon: <DollarSign size={18} aria-hidden="true" />,
          },
          {
            label: 'Reservas activas',
            value: stats.activeBookings,
            sub: 'confirmadas y pendientes',
            icon: <CalendarCheck size={18} aria-hidden="true" />,
          },
          {
            label: 'Calificación',
            value: stats.rating.toFixed(1),
            sub: 'promedio de clientes',
            icon: <Star size={18} className="fill-current text-[#c9a96e]" aria-hidden="true" />,
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
          <h2 className="font-serif text-3xl text-stone-950">Hoy</h2>
          <span className="rounded-full bg-[#c9a96e]/14 px-3 py-1 text-xs text-[#8e6b3d]">
            {todayBookings.length} servicio{todayBookings.length !== 1 ? 's' : ''}
          </span>
        </div>
        {todayBookings.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-center">
            <TrendingUp size={20} className="mx-auto text-stone-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-stone-500">No tienes servicios programados para hoy.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {todayBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-serif text-3xl text-stone-950">Próximos</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
            {upcomingBookings.length}
          </span>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-stone-500">No hay reservas futuras confirmadas.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Recent completed */}
      {recentCompleted.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-3xl text-stone-950">Historial reciente</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentCompleted.slice(0, 6).map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {/* Profile card */}
      <section className="mt-10 rounded-[2rem] border border-stone-200 bg-[#171311] px-6 py-6 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">Tu perfil</p>
            <h2 className="mt-2 font-serif text-3xl">{prof.name}</h2>
            {prof.bio && (
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{prof.bio}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {prof.specialties.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        {!prof.isActive && (
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-xs text-amber-300">
              Tu perfil está pendiente de activación. El equipo te contactará pronto.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
