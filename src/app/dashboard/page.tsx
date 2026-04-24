'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import {
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  Crown,
  Download,
  DollarSign,
  Inbox,
  MessageCircle,
  Percent,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import {
  ClientCard,
  MetricCard,
  ProLevelCard,
  ReservaCard,
  type Client,
  type Professional,
  type Reserva,
  type ReservaStatus,
} from '@/components/sections/business';
import { formatCLP } from '@/lib/utils';

type Tab = 'resumen' | 'reservas' | 'clientes';
type StatusFilter = ReservaStatus | 'all';

type DashboardKpis = {
  totalRevenue: number;
  activeBookings: number;
  vipClients: number;
  occupationRate: number;
};

type DashboardData = {
  kpis: DashboardKpis;
  reservas: (Reserva & { code?: string; rawStatus?: string })[];
  clients: Client[];
  professionals: Professional[];
};

const EMPTY_RESERVAS: DashboardData['reservas'] = [];
const EMPTY_CLIENTS: DashboardData['clients'] = [];
const EMPTY_PROFESSIONALS: DashboardData['professionals'] = [];

function EmptyState({
  icon,
  title,
  message,
  onClear,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-stone-200 bg-white py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
        {icon}
      </div>
      <h3 className="font-serif text-2xl text-stone-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-7 text-stone-600">{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
        >
          <X size={14} aria-hidden="true" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [reservaSearch, setReservaSearch] = useState('');
  const [reservaFilter, setReservaFilter] = useState<StatusFilter>('all');
  const [clientSearch, setClientSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setDataLoading(true);
    }

    setDataError(null);

    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (!response.ok) {
        setDataError('No se pudo cargar la información del dashboard.');
        return;
      }

      const json = (await response.json()) as DashboardData;
      setData(json);
    } catch {
      setDataError('Error de conexión. Intenta nuevamente.');
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) {
            setDataError('No se pudo cargar la información del dashboard.');
            setDataLoading(false);
          }
          return;
        }

        const json = (await response.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setDataLoading(false);
        }
      } catch {
        if (!cancelled) {
          setDataError('Error de conexión. Intenta nuevamente.');
          setDataLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const reservas = data?.reservas ?? EMPTY_RESERVAS;
  const clients = data?.clients ?? EMPTY_CLIENTS;
  const professionals = data?.professionals ?? EMPTY_PROFESSIONALS;
  const kpis = data?.kpis;

  const filteredReservas = useMemo(() => {
    const query = reservaSearch.trim().toLowerCase();

    return reservas.filter((reserva) => {
      const matchesStatus = reservaFilter === 'all' || reserva.status === reservaFilter;
      const matchesSearch =
        !query ||
        reserva.clienteName.toLowerCase().includes(query) ||
        reserva.serviceName.toLowerCase().includes(query) ||
        (reserva.clienteEmail?.toLowerCase().includes(query) ?? false) ||
        (reserva.code?.toLowerCase().includes(query) ?? false);

      return matchesStatus && matchesSearch;
    });
  }, [reservas, reservaFilter, reservaSearch]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    return clients.filter((client) => {
      return (
        !query ||
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        (client.phone?.includes(clientSearch) ?? false)
      );
    });
  }, [clients, clientSearch]);

  const recentReservas = useMemo(() => {
    return reservas
      .filter((reserva) => reserva.status === 'pending' || reserva.status === 'confirmed')
      .slice(0, 3);
  }, [reservas]);

  const priorityReservas = useMemo(() => {
    return [...reservas]
      .filter((reserva) => reserva.status === 'pending' || reserva.paymentPending || reserva.isVIP)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [reservas]);

  const vipRadar = useMemo(() => {
    return [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3);
  }, [clients]);

  const chartData = useMemo(() => {
    const now = new Date();
    const baseDays = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      return {
        key,
        label: date.toLocaleDateString('es-CL', { weekday: 'short' }).replace('.', ''),
        value: 0,
      };
    });

    const revenueByDay = new Map(baseDays.map((day) => [day.key, day]));

    reservas.forEach((reserva) => {
      if (reserva.status === 'cancelled') return;
      const day = revenueByDay.get(reserva.date);
      if (!day) return;
      day.value += reserva.amount;
    });

    return baseDays.map(({ label, value }) => ({ label, value }));
  }, [reservas]);

  const statusSummary = useMemo(() => {
    return [
      {
        label: 'Pendientes',
        count: reservas.filter((reserva) => reserva.status === 'pending').length,
        tone: 'text-amber-700 bg-amber-50 border-amber-200',
      },
      {
        label: 'Confirmadas',
        count: reservas.filter((reserva) => reserva.status === 'confirmed').length,
        tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        label: 'Completadas',
        count: reservas.filter((reserva) => reserva.status === 'completed').length,
        tone: 'text-sky-700 bg-sky-50 border-sky-200',
      },
      {
        label: 'Canceladas',
        count: reservas.filter((reserva) => reserva.status === 'cancelled').length,
        tone: 'text-rose-700 bg-rose-50 border-rose-200',
      },
    ];
  }, [reservas]);

  const topPro = professionals[0];

  const bookingAction = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadData(true);
    },
    [loadData],
  );

  const handleRefresh = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      setShowExportMenu(false);

      const rows: Record<string, unknown>[] =
        activeTab === 'clientes'
          ? (filteredClients as unknown as Record<string, unknown>[])
          : (filteredReservas as unknown as Record<string, unknown>[]);

      if (rows.length === 0) return;

      const filename = `reverencia-${activeTab}-${Date.now()}`;
      let content = '';
      let mimeType = '';
      let extension = '';

      if (format === 'json') {
        content = JSON.stringify(rows, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        const keys = Object.keys(rows[0]);
        content = [keys.join(','), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? '')).join(','))].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [activeTab, filteredClients, filteredReservas],
  );

  const onView = useCallback((id: string) => window.open(`/reservas?bookingId=${id}`, '_blank'), []);
  const onConfirm = useCallback((id: string) => bookingAction(id, { action: 'confirm' }), [bookingAction]);
  const onCancel = useCallback((id: string) => bookingAction(id, { action: 'cancel' }), [bookingAction]);
  const onReschedule = useCallback((id: string) => window.open(`/reservas?reschedule=${id}`, '_blank'), []);
  const onRemind = useCallback((id: string) => console.info('[dashboard] remind', id), []);
  const onReview = useCallback((id: string) => console.info('[dashboard] review', id), []);
  const onRepeat = useCallback((id: string) => window.open(`/reservas?repeat=${id}`, '_blank'), []);
  const onReactivate = useCallback((id: string) => bookingAction(id, { action: 'confirm' }), [bookingAction]);
  const onArchive = useCallback((id: string) => bookingAction(id, { action: 'complete' }), [bookingAction]);

  const onReserve = useCallback((id: string) => window.open(`/reservas?clientId=${id}`, '_blank'), []);
  const onContact = useCallback((id: string) => console.info('[dashboard] contact', id), []);
  const onEdit = useCallback((id: string) => console.info('[dashboard] edit', id), []);

  const onEditProfile = useCallback((id: string) => console.info('[dashboard] editProfile', id), []);
  const onViewSchedule = useCallback((id: string) => console.info('[dashboard] viewSchedule', id), []);
  const onViewClients = useCallback((id: string) => console.info('[dashboard] viewClients', id), []);

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'reservas', label: 'Reservas', count: reservas.length },
    { key: 'clientes', label: 'Clientes', count: clients.length },
  ];

  if (dataLoading) {
    return (
      <DashboardLayout userName="Admin Reverencia" userRole="admin">
        <div className="flex items-center justify-center py-40">
          <div className="space-y-3 text-center">
            <RefreshCw size={24} className="mx-auto animate-spin text-[#b98f53]" aria-hidden="true" />
            <p className="text-sm text-stone-500">Cargando dashboard ejecutivo...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (dataError) {
    return (
      <DashboardLayout userName="Admin Reverencia" userRole="admin">
        <div className="flex items-center justify-center py-40">
          <div className="rounded-[2rem] border border-rose-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-rose-600">{dataError}</p>
            <button
              onClick={() => void loadData()}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Admin Reverencia" userRole="admin">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/30 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8e6b3d]">
            <Sparkles size={12} aria-hidden="true" />
            Operations cockpit
          </div>
          <h1 className="mt-4 font-serif text-4xl text-stone-950 lg:text-5xl">Dashboard ejecutivo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
            Una vista más clara del ritmo comercial, las reservas que requieren atención y los clientes
            con mayor valor para el negocio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={clsx(isRefreshing && 'animate-spin')} aria-hidden="true" />
            Actualizar
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu((open) => !open)}
              aria-expanded={showExportMenu}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-sm text-white transition-colors hover:bg-stone-800"
            >
              <Download size={14} aria-hidden="true" />
              Exportar
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_18px_50px_rgba(63,47,36,0.14)]">
                {(['csv', 'json'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-[#faf7f2] hover:text-stone-950"
                  >
                    Descargar .{format.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Ingresos totales"
          value={formatCLP(kpis?.totalRevenue ?? 0)}
          subtext="pagos aprobados"
          variant="highlight"
          icon={<DollarSign size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Reservas activas"
          value={kpis?.activeBookings ?? 0}
          subtext="pendientes y confirmadas"
          icon={<CalendarCheck size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Clientes VIP"
          value={kpis?.vipClients ?? 0}
          subtext="alto valor acumulado"
          icon={<Crown size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Ocupación"
          value={`${kpis?.occupationRate ?? 0}%`}
          trend={kpis && kpis.occupationRate >= 70 ? 'ritmo saludable' : 'hay espacio para crecer'}
          trendUp={Boolean(kpis && kpis.occupationRate >= 70)}
          variant="success"
          icon={<Percent size={18} aria-hidden="true" />}
        />
      </div>

      <div className="mb-7 flex overflow-x-auto border-b border-stone-200">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx(
              'inline-flex flex-shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm transition-colors',
              activeTab === key
                ? 'border-stone-950 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-950',
            )}
          >
            {label}
            {count !== undefined && (
              <span
                className={clsx(
                  'inline-flex min-w-[1.35rem] items-center justify-center rounded-full px-1 text-[10px]',
                  activeTab === key ? 'bg-[#c9a96e]/14 text-[#8e6b3d]' : 'bg-stone-100 text-stone-500',
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'resumen' && (
        <section className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Últimos 7 días</p>
                  <h2 className="mt-2 font-serif text-3xl text-stone-950">Pulso comercial</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  <TrendingUp size={12} aria-hidden="true" />
                  seguimiento en tiempo real
                </span>
              </div>
              <div className="mt-6">
                <RevenueChart data={chartData} />
              </div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Enfoque operativo</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Qué mirar primero hoy</h2>
              <div className="mt-6 grid gap-3">
                {statusSummary.map((item) => (
                  <div
                    key={item.label}
                    className={clsx('flex items-center justify-between rounded-2xl border px-4 py-4', item.tone)}
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="font-serif text-2xl">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#c9a96e]/12 text-[#8e6b3d]">
                    <ShieldCheck size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl text-stone-950">Lectura rápida</h3>
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      El tablero ya no solo reporta. También prioriza: reservas sensibles, valor
                      de clientes y ritmo de operación.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Top profesional</p>
                    <h2 className="mt-2 font-serif text-3xl text-stone-950">Momentum del equipo</h2>
                  </div>
                </div>
                <div className="mt-6">
                  {topPro ? (
                    <ProLevelCard
                      professional={topPro}
                      onEditProfile={onEditProfile}
                      onViewSchedule={onViewSchedule}
                      onViewClients={onViewClients}
                    />
                  ) : (
                    <p className="text-sm text-stone-600">Aún no hay datos de profesionales para mostrar.</p>
                  )}
                </div>
              </article>

              <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Radar VIP</p>
                <h2 className="mt-2 font-serif text-3xl text-stone-950">Clientes de mayor valor</h2>
                <div className="mt-6 space-y-4">
                  {vipRadar.length > 0 ? (
                    vipRadar.map((client) => (
                      <div
                        key={client.id}
                        className="rounded-[1.4rem] border border-stone-200 bg-[#faf7f2] px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-serif text-2xl text-stone-950">{client.name}</p>
                            <p className="mt-1 text-sm text-stone-500">{client.email}</p>
                          </div>
                          <span className="rounded-full bg-[#c9a96e]/14 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#8e6b3d]">
                            VIP
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-5 text-sm text-stone-600">
                          <span>Total {formatCLP(client.totalSpent)}</span>
                          <span>{client.visits} visitas</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-600">Todavía no hay clientes para destacar.</p>
                  )}
                </div>
              </article>
            </div>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">Acción prioritaria</p>
                  <h2 className="mt-2 font-serif text-3xl text-stone-950">Reservas que merecen foco</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  <AlertCircle size={12} aria-hidden="true" />
                  revisar hoy
                </span>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {(priorityReservas.length > 0 ? priorityReservas : recentReservas).map((reserva) => (
                  <ReservaCard
                    key={reserva.id}
                    reserva={reserva}
                    onView={onView}
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                    onReschedule={onReschedule}
                    onRemind={onRemind}
                    onReview={onReview}
                    onRepeat={onRepeat}
                    onReactivate={onReactivate}
                    onArchive={onArchive}
                  />
                ))}
              </div>
            </article>
          </div>
        </section>
      )}

      {activeTab === 'reservas' && (
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={reservaSearch}
                onChange={(event) => setReservaSearch(event.target.value)}
                placeholder="Buscar por cliente, servicio, email o código..."
                className="w-full rounded-full border border-stone-300 bg-white py-3 pl-10 pr-10 text-sm text-stone-900 outline-none transition-colors focus:border-stone-950"
              />
              {reservaSearch && (
                <button
                  onClick={() => setReservaSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-900"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={reservaFilter}
                onChange={(event) => setReservaFilter(event.target.value as StatusFilter)}
                className="appearance-none rounded-full border border-stone-300 bg-white py-3 pl-4 pr-10 text-sm text-stone-900 outline-none transition-colors focus:border-stone-950"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {(reservaSearch || reservaFilter !== 'all') && (
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">
              {filteredReservas.length} resultado{filteredReservas.length !== 1 ? 's' : ''}
            </p>
          )}

          {filteredReservas.length === 0 ? (
            <EmptyState
              icon={<Inbox size={22} aria-hidden="true" />}
              title="Sin coincidencias"
              message={
                reservaSearch || reservaFilter !== 'all'
                  ? 'No encontramos reservas con ese criterio. Prueba otro filtro o limpia la búsqueda.'
                  : 'Todavía no hay reservas registradas en el sistema.'
              }
              onClear={
                reservaSearch || reservaFilter !== 'all'
                  ? () => {
                      setReservaSearch('');
                      setReservaFilter('all');
                    }
                  : undefined
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredReservas.map((reserva) => (
                <ReservaCard
                  key={reserva.id}
                  reserva={reserva}
                  onView={onView}
                  onCancel={onCancel}
                  onConfirm={onConfirm}
                  onReschedule={onReschedule}
                  onRemind={onRemind}
                  onReview={onReview}
                  onRepeat={onRepeat}
                  onReactivate={onReactivate}
                  onArchive={onArchive}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'clientes' && (
        <section>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
                placeholder="Buscar por nombre, email o teléfono..."
                className="w-full rounded-full border border-stone-300 bg-white py-3 pl-10 pr-10 text-sm text-stone-900 outline-none transition-colors focus:border-stone-950"
              />
              {clientSearch && (
                <button
                  onClick={() => setClientSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-900"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-500">
              {clients.length} clientes cargados
            </div>
          </div>

          {clientSearch && (
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-stone-500">
              {filteredClients.length} resultado{filteredClients.length !== 1 ? 's' : ''}
            </p>
          )}

          {filteredClients.length === 0 ? (
            <EmptyState
              icon={<Users size={22} aria-hidden="true" />}
              title="Sin coincidencias"
              message={
                clientSearch
                  ? 'No encontramos clientes con ese criterio. Ajusta la búsqueda e intenta nuevamente.'
                  : 'Todavía no hay clientes cargados en la plataforma.'
              }
              onClear={clientSearch ? () => setClientSearch('') : undefined}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onReserve={onReserve}
                  onContact={onContact}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="rounded-[2rem] border border-stone-200 bg-[#171311] px-6 py-6 text-white shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d9bb8b]">Siguiente capa</p>
              <h2 className="mt-2 font-serif text-3xl">Dashboard pensado para operar y vender mejor.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                Ya no es solo un tablero de consulta: ahora comunica foco, prioridad y lectura comercial.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <ShieldCheck size={14} aria-hidden="true" />
                lectura operativa
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                <MessageCircle size={14} aria-hidden="true" />
                prioridad por valor
              </span>
            </div>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
