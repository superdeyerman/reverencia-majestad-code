'use client';

import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import {
  DollarSign,
  CalendarCheck,
  Users,
  Percent,
  RefreshCw,
  Download,
  Search,
  X,
  ChevronDown,
  Inbox,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  MetricCard,
  ReservaCard,
  ClientCard,
  ProLevelCard,
  type Reserva,
  type Client,
  type Professional,
  type ReservaStatus,
} from '@/components/sections/business';
import { formatCLP } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */

type Tab          = 'resumen' | 'reservas' | 'clientes';
type StatusFilter = ReservaStatus | 'all';

/* ══════════════════════════════════════════════════════════
   MOCK DATA — swap each array for an API call when ready
══════════════════════════════════════════════════════════ */

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'pro-1',
    name: 'Sofía Reyes',
    level: 'platinum',
    completedBookings: 412,
    totalEarnings: 8_240_000,
    rating: 5.0,
    reviews: 324,
    commissionPercentage: 75,
    specialties: ['Colorimetría', 'Extensiones', 'Peinados de Novia', 'Tratamientos Premium'],
    nextLevel: null,
  },
  {
    id: 'pro-2',
    name: 'Catalina Martínez',
    level: 'gold',
    completedBookings: 243,
    totalEarnings: 4_860_000,
    rating: 4.9,
    reviews: 187,
    commissionPercentage: 70,
    specialties: ['Colorimetría', 'Balayage', 'Corte', 'Tratamientos'],
    nextLevel: 'platinum',
  },
  {
    id: 'pro-3',
    name: 'Andrea Rojas',
    level: 'gold',
    completedBookings: 198,
    totalEarnings: 3_960_000,
    rating: 4.8,
    reviews: 142,
    commissionPercentage: 70,
    specialties: ['Facial Premium', 'Peeling', 'Hidratación', 'Dermapen'],
    nextLevel: 'platinum',
  },
  {
    id: 'pro-4',
    name: 'Valentina Lagos',
    level: 'silver',
    completedBookings: 112,
    totalEarnings: 2_240_000,
    rating: 4.7,
    reviews: 89,
    commissionPercentage: 60,
    specialties: ['Masajes', 'Faciales', 'Aromaterapia'],
    nextLevel: 'gold',
  },
  {
    id: 'pro-5',
    name: 'Carlos Herrera',
    level: 'bronze',
    completedBookings: 34,
    totalEarnings: 680_000,
    rating: 4.5,
    reviews: 28,
    commissionPercentage: 50,
    specialties: ['Corte Masculino', 'Barba', 'Styling'],
    nextLevel: 'silver',
  },
];

const MOCK_RESERVAS: Reserva[] = [
  {
    id: 'rsv-001',
    clienteName: 'María José Fernández',
    clienteEmail: 'mj.fernandez@email.cl',
    serviceName: 'Colorimetría Premium',
    date: '2026-04-25',
    time: '10:00',
    location: 'Las Condes, Santiago',
    amount: 65_000,
    status: 'confirmed',
    professional: 'Catalina Martínez',
    isVIP: true,
    notes: 'Solicita productos sin amoníaco. Alergia a tintes convencionales.',
  },
  {
    id: 'rsv-002',
    clienteName: 'Ana Valdés',
    clienteEmail: 'ana.v@gmail.com',
    serviceName: 'Masaje Relajante 90 min',
    date: '2026-04-25',
    time: '14:30',
    location: 'Vitacura, Santiago',
    amount: 48_000,
    status: 'pending',
    professional: 'Valentina Lagos',
    paymentPending: true,
  },
  {
    id: 'rsv-003',
    clienteName: 'Gabriela Moreno',
    clienteEmail: 'gmoreno@corp.cl',
    serviceName: 'Tratamiento Facial Express',
    date: '2026-04-24',
    time: '09:00',
    location: 'Hotel W Santiago, Suite 1204',
    amount: 42_000,
    status: 'completed',
    professional: 'Andrea Rojas',
    isVIP: true,
  },
  {
    id: 'rsv-004',
    clienteName: 'Sofía Contreras',
    clienteEmail: 'sofia.c@mail.com',
    serviceName: 'Corte & Styling',
    date: '2026-04-26',
    time: '11:00',
    location: 'Providencia, Santiago',
    amount: 28_000,
    status: 'pending',
    professional: 'Catalina Martínez',
  },
  {
    id: 'rsv-005',
    clienteName: 'Valentina Guzmán',
    clienteEmail: 'vguzman@hotmail.com',
    serviceName: 'Balayage + Corte',
    date: '2026-04-23',
    time: '15:00',
    location: 'Ñuñoa, Santiago',
    amount: 85_000,
    status: 'completed',
    professional: 'Catalina Martínez',
    isVIP: true,
  },
  {
    id: 'rsv-006',
    clienteName: 'Camila Ortiz',
    clienteEmail: 'c.ortiz@empresa.cl',
    serviceName: 'Manicure Spa',
    date: '2026-04-27',
    time: '16:00',
    location: 'Santiago Centro',
    amount: 22_000,
    status: 'confirmed',
    professional: 'Sofía Reyes',
  },
  {
    id: 'rsv-007',
    clienteName: 'Isidora Rojas',
    serviceName: 'Masaje Tejido Profundo',
    date: '2026-04-22',
    time: '10:30',
    location: 'Hotel Marriott, Hab. 812',
    amount: 55_000,
    status: 'cancelled',
    professional: 'Valentina Lagos',
    notes: 'Cancelado por viaje de emergencia.',
  },
  {
    id: 'rsv-008',
    clienteName: 'Paloma Díaz',
    clienteEmail: 'paloma.d@icloud.com',
    serviceName: 'Peeling Facial + Hidratación',
    date: '2026-04-28',
    time: '12:00',
    location: 'Lo Barnechea, Santiago',
    amount: 58_000,
    status: 'pending',
    professional: 'Andrea Rojas',
    paymentPending: true,
    isVIP: true,
  },
  {
    id: 'rsv-009',
    clienteName: 'Renata Castro',
    clienteEmail: 'renata.c@yahoo.com',
    serviceName: 'Corte + Blow Dry',
    date: '2026-04-21',
    time: '09:30',
    location: 'Maipú, Santiago',
    amount: 32_000,
    status: 'completed',
    professional: 'Carlos Herrera',
  },
  {
    id: 'rsv-010',
    clienteName: 'Javiera Muñoz',
    clienteEmail: 'jmuñoz@live.cl',
    serviceName: 'Extensiones Premium',
    date: '2026-04-29',
    time: '10:00',
    location: 'Las Condes, Santiago',
    amount: 120_000,
    status: 'confirmed',
    professional: 'Sofía Reyes',
    isVIP: true,
    paymentPending: true,
  },
  {
    id: 'rsv-011',
    clienteName: 'Martina López',
    serviceName: 'Aromaterapia + Masaje',
    date: '2026-04-20',
    time: '14:00',
    location: 'Providencia, Santiago',
    amount: 44_000,
    status: 'completed',
    professional: 'Valentina Lagos',
  },
  {
    id: 'rsv-012',
    clienteName: 'Francisca Vega',
    clienteEmail: 'fvega@empresa.cl',
    serviceName: 'Peinado de Novia',
    date: '2026-05-03',
    time: '07:00',
    location: 'Hotel Intercontinental, Salón B',
    amount: 95_000,
    status: 'confirmed',
    professional: 'Sofía Reyes',
    isVIP: true,
    notes: 'Día de matrimonio. Llegada 30 min antes para prueba final.',
  },
  {
    id: 'rsv-013',
    clienteName: 'Antonia Pérez',
    clienteEmail: 'antonia.p@gmail.com',
    serviceName: 'Colorimetría + Mechas',
    date: '2026-04-19',
    time: '11:30',
    location: 'Vitacura, Santiago',
    amount: 72_000,
    status: 'cancelled',
    professional: 'Catalina Martínez',
    notes: 'Cancelado con 2 días de anticipación.',
  },
  {
    id: 'rsv-014',
    clienteName: 'Daniela Herrera',
    clienteEmail: 'dherrera@hotmail.com',
    serviceName: 'Facial Premium 90 min',
    date: '2026-04-30',
    time: '15:30',
    location: 'Ñuñoa, Santiago',
    amount: 62_000,
    status: 'pending',
    professional: 'Andrea Rojas',
  },
  {
    id: 'rsv-015',
    clienteName: 'Valeria Soto',
    clienteEmail: 'vsoto@corp.cl',
    serviceName: 'Masaje + Aromaterapia',
    date: '2026-04-18',
    time: '09:00',
    location: 'Las Condes, Santiago',
    amount: 50_000,
    status: 'completed',
    professional: 'Valentina Lagos',
    isVIP: true,
  },
  {
    id: 'rsv-016',
    clienteName: 'Catalina Ramos',
    clienteEmail: 'cramos@email.cl',
    serviceName: 'Corte Masculino + Barba',
    date: '2026-04-24',
    time: '13:00',
    location: 'Providencia, Santiago',
    amount: 26_000,
    status: 'confirmed',
    professional: 'Carlos Herrera',
  },
];

const MOCK_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    name: 'María José Fernández',
    email: 'mj.fernandez@email.cl',
    phone: '+56 9 8712 3456',
    totalSpent: 1_340_000,
    visits: 24,
    lastVisitDate: '2026-04-20',
    preferences: ['Colorimetría', 'Sin amoníaco', 'Tarde libre', 'Hotel W'],
    loyaltyTier: 'gold',
    notes: 'Prefiere citas en la tarde. Alérgica a tintes convencionales.',
  },
  {
    id: 'cli-002',
    name: 'Valentina Guzmán',
    email: 'vguzman@hotmail.com',
    phone: '+56 9 9234 5678',
    totalSpent: 2_780_000,
    visits: 38,
    lastVisitDate: '2026-04-23',
    preferences: ['Balayage', 'Premium', 'Domicilio', 'Vitacura'],
    loyaltyTier: 'platinum',
  },
  {
    id: 'cli-003',
    name: 'Gabriela Moreno',
    email: 'gmoreno@corp.cl',
    phone: '+56 9 6543 2109',
    totalSpent: 840_000,
    visits: 15,
    lastVisitDate: '2026-04-24',
    preferences: ['Facial', 'Hotel', 'Mañana'],
    loyaltyTier: 'silver',
  },
  {
    id: 'cli-004',
    name: 'Paloma Díaz',
    email: 'paloma.d@icloud.com',
    phone: '+56 9 7890 1234',
    totalSpent: 1_650_000,
    visits: 29,
    lastVisitDate: '2026-04-15',
    preferences: ['Peeling', 'Hidratación', 'Lo Barnechea', 'Orgánico'],
    loyaltyTier: 'gold',
    notes: 'Piel sensible. Solo productos orgánicos certificados.',
  },
  {
    id: 'cli-005',
    name: 'Javiera Muñoz',
    email: 'jmuñoz@live.cl',
    phone: '+56 9 5678 9012',
    totalSpent: 3_200_000,
    visits: 45,
    lastVisitDate: '2026-04-10',
    preferences: ['Extensiones', 'Premium', 'Las Condes', 'Sofía Reyes'],
    loyaltyTier: 'platinum',
  },
  {
    id: 'cli-006',
    name: 'Ana Valdés',
    email: 'ana.v@gmail.com',
    phone: '+56 9 4321 0987',
    totalSpent: 320_000,
    visits: 7,
    lastVisitDate: '2026-04-05',
    preferences: ['Masajes', 'Relajante'],
    loyaltyTier: 'bronze',
  },
  {
    id: 'cli-007',
    name: 'Francisca Vega',
    email: 'fvega@empresa.cl',
    phone: '+56 9 3456 7890',
    totalSpent: 1_890_000,
    visits: 32,
    lastVisitDate: '2026-03-28',
    preferences: ['Novias', 'Eventos', 'Hotel', 'Sofía Reyes'],
    loyaltyTier: 'gold',
    notes: 'Matrimonio programado mayo 2026. Prueba confirmada.',
  },
  {
    id: 'cli-008',
    name: 'Isidora Rojas',
    email: 'irojas@personal.cl',
    phone: '+56 9 2109 8765',
    totalSpent: 540_000,
    visits: 11,
    lastVisitDate: '2026-04-01',
    preferences: ['Masaje Profundo', 'Hotel'],
    loyaltyTier: 'silver',
  },
  {
    id: 'cli-009',
    name: 'Renata Castro',
    email: 'renata.c@yahoo.com',
    phone: '+56 9 1234 5678',
    totalSpent: 210_000,
    visits: 6,
    lastVisitDate: '2026-04-21',
    preferences: ['Corte', 'Styling', 'Maipú'],
    loyaltyTier: 'bronze',
  },
  {
    id: 'cli-010',
    name: 'Camila Ortiz',
    email: 'c.ortiz@empresa.cl',
    phone: '+56 9 8901 2345',
    totalSpent: 480_000,
    visits: 19,
    lastVisitDate: '2026-03-15',
    preferences: ['Manicure', 'Spa', 'Centro'],
    loyaltyTier: 'bronze',
  },
  {
    id: 'cli-011',
    name: 'Martina López',
    email: 'mlopez@email.com',
    phone: '+56 9 7654 3210',
    totalSpent: 760_000,
    visits: 14,
    lastVisitDate: '2026-04-20',
    preferences: ['Aromaterapia', 'Masaje', 'Relajación'],
    loyaltyTier: 'silver',
  },
  {
    id: 'cli-012',
    name: 'Sofía Contreras',
    email: 'sofia.c@mail.com',
    phone: '+56 9 6789 0123',
    totalSpent: 150_000,
    visits: 4,
    lastVisitDate: '2026-03-10',
    preferences: ['Corte', 'Providencia'],
    loyaltyTier: 'bronze',
  },
  {
    id: 'cli-013',
    name: 'Antonia Pérez',
    email: 'antonia.p@gmail.com',
    phone: '+56 9 5432 1098',
    totalSpent: 920_000,
    visits: 17,
    lastVisitDate: '2026-03-25',
    preferences: ['Colorimetría', 'Mechas', 'Vitacura'],
    loyaltyTier: 'silver',
    notes: 'Canceló última cita. Dar seguimiento para reactivar.',
  },
  {
    id: 'cli-014',
    name: 'Valeria Soto',
    email: 'vsoto@corp.cl',
    phone: '+56 9 4567 8901',
    totalSpent: 1_120_000,
    visits: 22,
    lastVisitDate: '2026-04-18',
    preferences: ['Masaje', 'Aromaterapia', 'Las Condes', 'Premium'],
    loyaltyTier: 'gold',
  },
  {
    id: 'cli-015',
    name: 'Daniela Herrera',
    email: 'dherrera@hotmail.com',
    phone: '+56 9 3210 9876',
    totalSpent: 390_000,
    visits: 8,
    lastVisitDate: '2026-03-05',
    preferences: ['Facial', 'Ñuñoa'],
    loyaltyTier: 'bronze',
  },
  {
    id: 'cli-016',
    name: 'Catalina Ramos',
    email: 'cramos@email.cl',
    phone: '+56 9 2345 6789',
    totalSpent: 280_000,
    visits: 10,
    lastVisitDate: '2026-04-24',
    preferences: ['Corte Masculino', 'Barba', 'Providencia'],
    loyaltyTier: 'bronze',
  },
];

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════════════════════ */

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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
        {icon}
      </div>
      <h3 className="font-serif text-xl text-char mb-2">{title}</h3>
      <p className="font-sans text-sm text-gray max-w-xs leading-relaxed mb-6">{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-sans text-sm text-char hover:border-gold hover:text-gold transition-colors"
        >
          <X size={14} aria-hidden="true" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  /* ── State ── */
  const [activeTab,      setActiveTab]      = useState<Tab>('resumen');
  const [reservaSearch,  setReservaSearch]  = useState('');
  const [reservaFilter,  setReservaFilter]  = useState<StatusFilter>('all');
  const [clientSearch,   setClientSearch]   = useState('');
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  /* ── Derived data (memoized) ── */

  const filteredReservas = useMemo(() => {
    const q = reservaSearch.toLowerCase();
    return MOCK_RESERVAS.filter((r) => {
      const matchStatus = reservaFilter === 'all' || r.status === reservaFilter;
      const matchSearch =
        !q ||
        r.clienteName.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        (r.clienteEmail?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchSearch;
    });
  }, [reservaSearch, reservaFilter]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase();
    return MOCK_CLIENTS.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.includes(clientSearch) ?? false)
    );
  }, [clientSearch]);

  const recentReservas = useMemo(
    () => MOCK_RESERVAS.filter((r) => r.status === 'confirmed' || r.status === 'pending').slice(0, 3),
    []
  );

  const metrics = useMemo(() => {
    const ingreso  = MOCK_RESERVAS
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.amount, 0);
    const activas  = MOCK_RESERVAS.filter(
      (r) => r.status === 'confirmed' || r.status === 'pending'
    ).length;
    const vips     = MOCK_CLIENTS.filter((c) => (c.totalSpent ?? 0) >= 500_000).length;
    const total    = MOCK_RESERVAS.length;
    const noCancel = MOCK_RESERVAS.filter((r) => r.status !== 'cancelled').length;
    const ocupacion = total > 0 ? Math.round((noCancel / total) * 100) : 0;
    return { ingreso, activas, vips, ocupacion };
  }, []);

  const topPro = MOCK_PROFESSIONALS[0];

  /* ── Handlers (memoized) ── */

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  }, []);

  const handleExport = useCallback(
    (format: 'csv' | 'json') => {
      setShowExportMenu(false);
      const data: Record<string, unknown>[] =
        activeTab === 'clientes'
          ? (filteredClients as unknown as Record<string, unknown>[])
          : (filteredReservas as unknown as Record<string, unknown>[]);
      if (data.length === 0) return;

      const filename = `reverencia-${activeTab}-${Date.now()}`;
      let content: string;
      let mimeType: string;
      let ext: string;

      if (format === 'json') {
        content  = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        ext      = 'json';
      } else {
        const keys = Object.keys(data[0]);
        content  = [keys.join(','), ...data.map((row) => keys.map((k) => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        ext      = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${filename}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [activeTab, filteredClients, filteredReservas]
  );

  /* Reserva action stubs — replace with API calls */
  const onView       = useCallback((id: string) => console.log('[dashboard] view',       id), []);
  const onCancel     = useCallback((id: string) => console.log('[dashboard] cancel',     id), []);
  const onConfirm    = useCallback((id: string) => console.log('[dashboard] confirm',    id), []);
  const onReschedule = useCallback((id: string) => console.log('[dashboard] reschedule', id), []);
  const onRemind     = useCallback((id: string) => console.log('[dashboard] remind',     id), []);
  const onReview     = useCallback((id: string) => console.log('[dashboard] review',     id), []);
  const onRepeat     = useCallback((id: string) => console.log('[dashboard] repeat',     id), []);
  const onReactivate = useCallback((id: string) => console.log('[dashboard] reactivate', id), []);
  const onArchive    = useCallback((id: string) => console.log('[dashboard] archive',    id), []);

  /* Client action stubs */
  const onReserve = useCallback((id: string) => console.log('[dashboard] reserve', id), []);
  const onContact = useCallback((id: string) => console.log('[dashboard] contact', id), []);
  const onEdit    = useCallback((id: string) => console.log('[dashboard] edit',    id), []);

  /* Pro action stubs */
  const onEditProfile  = useCallback((id: string) => console.log('[dashboard] editProfile',  id), []);
  const onViewSchedule = useCallback((id: string) => console.log('[dashboard] viewSchedule', id), []);
  const onViewClients  = useCallback((id: string) => console.log('[dashboard] viewClients',  id), []);

  /* ── Tab config ── */
  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'resumen',  label: 'Resumen'  },
    { key: 'reservas', label: 'Reservas', count: MOCK_RESERVAS.length },
    { key: 'clientes', label: 'Clientes', count: MOCK_CLIENTS.length  },
  ];

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <DashboardLayout userName="Admin Reverencia" userRole="admin">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl text-char leading-tight">Dashboard</h1>
          <p className="font-sans text-sm text-gray mt-1">
            Vista general del negocio · Abril 2026
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Actualizar datos"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3.5 py-2 font-sans text-sm text-char hover:border-gold hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={14}
              aria-hidden="true"
              className={clsx('transition-transform', isRefreshing && 'animate-spin')}
            />
            Actualizar
          </button>

          {/* Export with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              aria-label="Exportar datos"
              aria-expanded={showExportMenu}
              aria-haspopup="true"
              className="inline-flex items-center gap-2 rounded-sm bg-char px-3.5 py-2 font-sans text-sm text-white hover:bg-char/85 transition-colors"
            >
              <Download size={14} aria-hidden="true" />
              Exportar
            </button>
            {showExportMenu && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-40 bg-white border border-border rounded-md shadow-sm z-20"
              >
                {(['csv', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    role="menuitem"
                    onClick={() => handleExport(fmt)}
                    className="w-full px-4 py-2.5 text-left font-sans text-sm text-char hover:bg-cream transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    Descargar .{fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Ingresos Mes"
          value={formatCLP(metrics.ingreso)}
          trend="+18%"
          trendUp
          subtext="vs mes anterior"
          variant="highlight"
          icon={<DollarSign size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Reservas Activas"
          value={metrics.activas}
          trend={`${metrics.activas} abiertas`}
          trendUp
          subtext="confirmadas + pendientes"
          icon={<CalendarCheck size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Clientes VIP"
          value={metrics.vips}
          subtext="≥ $500.000 acumulado"
          icon={<Users size={18} aria-hidden="true" />}
        />
        <MetricCard
          title="Ocupación"
          value={`${metrics.ocupacion}%`}
          trend="+12%"
          trendUp
          subtext="promedio semanal"
          variant="success"
          icon={<Percent size={18} aria-hidden="true" />}
        />
      </div>

      {/* ── Tabs ── */}
      <div
        role="tablist"
        aria-label="Secciones del dashboard"
        className="flex border-b border-border mb-7 overflow-x-auto"
      >
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            id={`tab-${key}`}
            onClick={() => setActiveTab(key)}
            className={clsx(
              'flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 font-sans text-sm transition-colors border-b-2 -mb-px',
              activeTab === key
                ? 'text-char border-char font-medium'
                : 'text-gray border-transparent hover:text-char'
            )}
          >
            {label}
            {count !== undefined && (
              <span
                className={clsx(
                  'flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full text-[10px] font-semibold font-sans transition-colors',
                  activeTab === key ? 'bg-gold/15 text-gold-dark' : 'bg-gray-light text-gray'
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB: RESUMEN
      ════════════════════════════════════════════════════ */}
      {activeTab === 'resumen' && (
        <section
          id="tabpanel-resumen"
          role="tabpanel"
          aria-labelledby="tab-resumen"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Top professional */}
          <div className="lg:col-span-1">
            <h2 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gray mb-4">
              Top Profesional del Mes
            </h2>
            <ProLevelCard
              professional={topPro}
              onEditProfile={onEditProfile}
              onViewSchedule={onViewSchedule}
              onViewClients={onViewClients}
            />
          </div>

          {/* Recent reservas */}
          <div className="lg:col-span-2">
            <h2 className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gray mb-4">
              Reservas Recientes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentReservas.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
                  onView={onView}
                  onCancel={onCancel}
                  onConfirm={onConfirm}
                  onReschedule={onReschedule}
                  onRemind={onRemind}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          TAB: RESERVAS
      ════════════════════════════════════════════════════ */}
      {activeTab === 'reservas' && (
        <section
          id="tabpanel-reservas"
          role="tabpanel"
          aria-labelledby="tab-reservas"
        >
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">

            {/* Search input */}
            <div className="relative flex-1">
              <Search
                size={15}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray pointer-events-none"
              />
              <label htmlFor="reserva-search" className="sr-only">
                Buscar reservas por cliente, servicio o email
              </label>
              <input
                id="reserva-search"
                type="search"
                value={reservaSearch}
                onChange={(e) => setReservaSearch(e.target.value)}
                placeholder="Buscar por cliente, servicio o email…"
                className="w-full pl-9 pr-9 py-2 rounded-sm border border-border bg-white font-sans text-sm text-char placeholder:text-gray focus:outline-none focus:border-gold transition-colors"
              />
              {reservaSearch && (
                <button
                  onClick={() => setReservaSearch('')}
                  aria-label="Limpiar búsqueda de reservas"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray hover:text-char transition-colors"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <label htmlFor="reserva-filter" className="sr-only">
                Filtrar reservas por estado
              </label>
              <select
                id="reserva-filter"
                value={reservaFilter}
                onChange={(e) => setReservaFilter(e.target.value as StatusFilter)}
                className="appearance-none pl-4 pr-9 py-2 rounded-sm border border-border bg-white font-sans text-sm text-char focus:outline-none focus:border-gold transition-colors cursor-pointer"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray pointer-events-none"
              />
            </div>
          </div>

          {/* Results count */}
          {(reservaSearch || reservaFilter !== 'all') && (
            <p className="font-sans text-xs text-gray mb-4" aria-live="polite">
              {filteredReservas.length} resultado{filteredReservas.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Grid or empty state */}
          {filteredReservas.length === 0 ? (
            <EmptyState
              icon={<Inbox size={22} aria-hidden="true" />}
              title="Sin resultados"
              message={
                reservaSearch || reservaFilter !== 'all'
                  ? 'No hay reservas que coincidan con tu búsqueda o filtros.'
                  : 'Aún no hay reservas registradas.'
              }
              onClear={
                reservaSearch || reservaFilter !== 'all'
                  ? () => { setReservaSearch(''); setReservaFilter('all'); }
                  : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredReservas.map((r) => (
                <ReservaCard
                  key={r.id}
                  reserva={r}
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

      {/* ════════════════════════════════════════════════════
          TAB: CLIENTES
      ════════════════════════════════════════════════════ */}
      {activeTab === 'clientes' && (
        <section
          id="tabpanel-clientes"
          role="tabpanel"
          aria-labelledby="tab-clientes"
        >
          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search
              size={15}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray pointer-events-none"
            />
            <label htmlFor="client-search" className="sr-only">
              Buscar clientes por nombre, email o teléfono
            </label>
            <input
              id="client-search"
              type="search"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono…"
              className="w-full pl-9 pr-9 py-2 rounded-sm border border-border bg-white font-sans text-sm text-char placeholder:text-gray focus:outline-none focus:border-gold transition-colors"
            />
            {clientSearch && (
              <button
                onClick={() => setClientSearch('')}
                aria-label="Limpiar búsqueda de clientes"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray hover:text-char transition-colors"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Results count */}
          {clientSearch && (
            <p className="font-sans text-xs text-gray mb-4" aria-live="polite">
              {filteredClients.length} resultado{filteredClients.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Grid or empty state */}
          {filteredClients.length === 0 ? (
            <EmptyState
              icon={<Users size={22} aria-hidden="true" />}
              title="Sin resultados"
              message="No hay clientes que coincidan con tu búsqueda."
              onClear={() => setClientSearch('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {filteredClients.map((c) => (
                <ClientCard
                  key={c.id}
                  client={c}
                  onReserve={onReserve}
                  onContact={onContact}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </section>
      )}

    </DashboardLayout>
  );
}
