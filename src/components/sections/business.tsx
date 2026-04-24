'use client';

import { useMemo, useState, memo } from 'react';
import clsx from 'clsx';
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Bell,
  Star,
  RotateCcw,
  Archive,
  Phone,
  Mail,
  Edit3,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Check,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { Badge, Card, Tag } from '@/components/ui';
import type { BadgeStatus } from '@/components/ui/Badge';

/* ══════════════════════════════════════════════════════════════
   TYPES & INTERFACES
══════════════════════════════════════════════════════════════ */

export type ReservaStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type LoyaltyTier   = 'bronze' | 'silver' | 'gold' | 'platinum';
export type ProLevel      = 'bronze' | 'silver' | 'gold' | 'platinum';
export type MetricVariant = 'normal' | 'highlight' | 'alert' | 'success';

export interface Reserva {
  id: string;
  clienteName: string;
  clienteEmail?: string;
  serviceName: string;
  date: string;
  time: string;
  location: string;
  amount: number;
  status: ReservaStatus;
  professional?: string;
  notes?: string;
  isVIP?: boolean;
  paymentPending?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalSpent: number;
  visits: number;
  lastVisitDate?: string;
  preferences?: string[];
  loyaltyTier?: LoyaltyTier;
  notes?: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar?: string;
  level: ProLevel;
  completedBookings: number;
  totalEarnings: number;
  rating: number;
  reviews: number;
  commissionPercentage: number;
  specialties: string[];
  nextLevel?: ProLevel | null;
}

export interface ReservaCardProps {
  reserva: Reserva;
  onView?: (id: string) => void;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onRemind?: (id: string) => void;
  onReview?: (id: string) => void;
  onRepeat?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export interface ClientCardProps {
  client: Client;
  onReserve?: (id: string) => void;
  onContact?: (id: string) => void;
  onEdit?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export interface ProLevelCardProps {
  professional: Professional;
  onEditProfile?: (id: string) => void;
  onViewSchedule?: (id: string) => void;
  onViewClients?: (id: string) => void;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  subtext?: string;
  variant?: MetricVariant;
}

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */

const STATUS_TO_BADGE: Record<ReservaStatus, BadgeStatus> = {
  pending:   'pending',
  confirmed: 'confirmed',
  completed: 'done',
  cancelled: 'cancelled',
};

const TIER_CONFIG: Record<LoyaltyTier, { label: string; emoji: string; color: string; bg: string; min: number }> = {
  bronze:   { label: 'Bronze',   emoji: '🥉', color: 'text-orange',    bg: 'bg-orange/10',  min: 0 },
  silver:   { label: 'Silver',   emoji: '🥈', color: 'text-gray',      bg: 'bg-gray-light', min: 500_000 },
  gold:     { label: 'Gold',     emoji: '🥇', color: 'text-gold-dark', bg: 'bg-gold/10',    min: 1_000_000 },
  platinum: { label: 'Platinum', emoji: '👑', color: 'text-blue',      bg: 'bg-blue/10',    min: 2_500_000 },
};

const LEVEL_CONFIG: Record<ProLevel, {
  label: string; emoji: string;
  color: string; bg: string; border: string;
  bookingsNeeded: number;
}> = {
  bronze:   { label: 'Bronze',   emoji: '🥉', color: 'text-orange',    bg: 'bg-orange/10',  border: 'border-orange/20',  bookingsNeeded: 50  },
  silver:   { label: 'Silver',   emoji: '🥈', color: 'text-gray',      bg: 'bg-gray-light', border: 'border-border',     bookingsNeeded: 150 },
  gold:     { label: 'Gold',     emoji: '🥇', color: 'text-gold-dark', bg: 'bg-gold/10',    border: 'border-gold/20',    bookingsNeeded: 300 },
  platinum: { label: 'Platinum', emoji: '👑', color: 'text-blue',      bg: 'bg-blue/10',    border: 'border-blue/20',    bookingsNeeded: Infinity },
};

const LEVEL_BENEFITS: Record<ProLevel, string[]> = {
  bronze:   ['Comisión 50%', 'Perfil destacado'],
  silver:   ['Comisión 60%', 'Prioridad en hoteles', 'Perfil destacado'],
  gold:     ['Comisión 70%', 'Capacitación gratuita', 'Zona premium', 'Prioridad en hoteles'],
  platinum: ['Comisión 75%', 'Manager dedicado', 'Bonus anual', 'Zona premium', 'Capacitación gratuita'],
};

const METRIC_VARIANT_CLASSES: Record<MetricVariant, { icon: string; title: string; border: string }> = {
  normal:    { icon: 'text-gold',               title: 'text-gold',              border: 'border-border' },
  highlight: { icon: 'text-gold',               title: 'text-gold',              border: 'border-gold/30' },
  alert:     { icon: 'text-red',                title: 'text-red',               border: 'border-red/20'  },
  success:   { icon: 'text-status-confirmed',   title: 'text-status-confirmed',  border: 'border-status-confirmed/20' },
};

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */

function formatCLP(amount: number): string {
  return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
}

function calcTier(spent: number): LoyaltyTier {
  if (spent >= 2_500_000) return 'platinum';
  if (spent >= 1_000_000) return 'gold';
  if (spent >= 500_000)   return 'silver';
  return 'bronze';
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase();
}

/* ── Small shared sub-components ───────────────────────────── */

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-sans text-gray">
      <span className="flex-shrink-0 text-gray/60">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

function ActionButton({
  onClick,
  variant = 'outline',
  children,
  ariaLabel,
}: {
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const cls = clsx(
    'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-sans font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
    {
      'bg-gold text-white hover:bg-gold-dark':                                  variant === 'primary',
      'border border-border text-char hover:border-gold hover:text-gold':       variant === 'outline',
      'text-gray hover:text-char hover:bg-gray-light':                          variant === 'ghost',
      'border border-red/20 text-red hover:bg-red/5':                           variant === 'danger',
    }
  );
  return (
    <button onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════
   1. RESERVA CARD
══════════════════════════════════════════════════════════════ */

export const ReservaCard = memo(function ReservaCard({
  reserva,
  onView,
  onCancel,
  onReschedule,
  onConfirm,
  onRemind,
  onReview,
  onRepeat,
  onReactivate,
  onArchive,
}: ReservaCardProps) {
  const {
    id, clienteName, clienteEmail, serviceName,
    date, time, location, amount, status,
    professional, notes, isVIP, paymentPending,
  } = reserva;

  const badgeStatus = STATUS_TO_BADGE[status];

  return (
    <article className="bg-white border border-border rounded-lg shadow-xs hover:shadow-sm hover:border-gold/20 transition-all duration-200 overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-serif text-base font-medium text-char truncate">{clienteName}</h3>
            {isVIP && (
              <Badge status="vip" size="sm" label="VIP" dot={false} />
            )}
          </div>
          <p className="text-xs font-sans text-gray truncate">{serviceName}</p>
        </div>
        <Badge status={badgeStatus} size="sm" />
      </div>

      {/* Info grid */}
      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <InfoRow icon={<Calendar size={13} />}>
          {formatDate(date)} · {time}
        </InfoRow>
        <InfoRow icon={<MapPin size={13} />}>{location}</InfoRow>
        <InfoRow icon={<DollarSign size={13} />}>{formatCLP(amount)}</InfoRow>
        {professional && (
          <InfoRow icon={<User size={13} />}>{professional}</InfoRow>
        )}
        {clienteEmail && (
          <InfoRow icon={<Mail size={13} />}>{clienteEmail}</InfoRow>
        )}
      </div>

      {/* Conditional badges */}
      {(paymentPending) && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {paymentPending && (
            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-1 rounded-sm bg-orange/10 text-orange border border-orange/20">
              <CreditCard size={10} /> Pago Pendiente
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mx-5 mb-4 px-3 py-2 bg-cream rounded-sm border border-border">
          <p className="text-[11px] font-sans text-gray leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Actions */}
      <div className="px-5 py-3 flex flex-wrap gap-2">
        {status === 'pending' && (
          <>
            <ActionButton variant="primary" onClick={() => onConfirm?.(id)} ariaLabel="Confirmar reserva">
              <CheckCircle size={13} /> Confirmar
            </ActionButton>
            <ActionButton variant="outline" onClick={() => onReschedule?.(id)} ariaLabel="Reprogramar">
              <RefreshCw size={13} /> Reprogramar
            </ActionButton>
            <ActionButton variant="danger" onClick={() => onCancel?.(id)} ariaLabel="Cancelar reserva">
              <XCircle size={13} /> Cancelar
            </ActionButton>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <ActionButton variant="outline" onClick={() => onView?.(id)} ariaLabel="Ver detalles">
              <Eye size={13} /> Ver Detalles
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => onRemind?.(id)} ariaLabel="Enviar recordatorio">
              <Bell size={13} /> Recordar
            </ActionButton>
            <ActionButton variant="danger" onClick={() => onCancel?.(id)} ariaLabel="Cancelar reserva">
              <XCircle size={13} /> Cancelar
            </ActionButton>
          </>
        )}
        {status === 'completed' && (
          <>
            <ActionButton variant="primary" onClick={() => onReview?.(id)} ariaLabel="Dejar reseña">
              <Star size={13} /> Dejar Reseña
            </ActionButton>
            <ActionButton variant="outline" onClick={() => onRepeat?.(id)} ariaLabel="Repetir servicio">
              <RotateCcw size={13} /> Repetir Servicio
            </ActionButton>
          </>
        )}
        {status === 'cancelled' && (
          <>
            <ActionButton variant="outline" onClick={() => onReactivate?.(id)} ariaLabel="Reactivar reserva">
              <CheckCircle size={13} /> Reactivar
            </ActionButton>
            <ActionButton variant="ghost" onClick={() => onArchive?.(id)} ariaLabel="Archivar">
              <Archive size={13} /> Archivar
            </ActionButton>
          </>
        )}
      </div>
    </article>
  );
});

/* ══════════════════════════════════════════════════════════════
   2. CLIENT CARD
══════════════════════════════════════════════════════════════ */

export const ClientCard = memo(function ClientCard({
  client,
  onReserve,
  onContact,
  onEdit,
  isSelected = false,
  onSelect,
}: ClientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    id, name, email, phone,
    avatar, totalSpent, visits,
    lastVisitDate, preferences, notes,
  } = client;

  const tier = useMemo(() => client.loyaltyTier ?? calcTier(totalSpent), [client.loyaltyTier, totalSpent]);
  const tierCfg = TIER_CONFIG[tier];
  const isVIP = totalSpent >= 500_000;
  const visiblePrefs = preferences?.slice(0, 5) ?? [];

  return (
    <article
      className={clsx(
        'bg-white border rounded-lg shadow-xs transition-all duration-200 overflow-hidden',
        isSelected ? 'border-gold shadow-sm' : 'border-border hover:shadow-sm hover:border-gold/20'
      )}
    >
      {/* Selectable top bar */}
      {onSelect && (
        <div className="px-5 pt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id={`select-client-${id}`}
            checked={isSelected}
            onChange={(e) => onSelect(id, e.target.checked)}
            className="h-4 w-4 rounded-sm border-border accent-gold cursor-pointer"
            aria-label={`Seleccionar ${name}`}
          />
          <label htmlFor={`select-client-${id}`} className="text-xs font-sans text-gray cursor-pointer">
            Seleccionar
          </label>
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border">
            {avatar ? (
              <Image
                src={avatar}
                alt={`Foto de ${name}`}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gold/10 text-gold-dark font-serif text-lg font-medium">
                {getInitials(name)}
              </span>
            )}
          </div>
          {isVIP && (
            <span className="absolute -bottom-1 -right-1 text-base leading-none" title="Cliente VIP">⭐</span>
          )}
        </div>

        {/* Name + email + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-serif text-base font-medium text-char truncate">{name}</h3>
            {isVIP && <Badge status="vip" size="sm" label="VIP" dot={false} />}
          </div>
          <p className="text-xs font-sans text-gray truncate">{email}</p>
          {phone && <p className="text-xs font-sans text-gray/70 mt-0.5">{phone}</p>}
        </div>

        {/* More menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`Más opciones para ${name}`}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="p-1.5 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-border rounded-md shadow-sm z-10">
              {[
                { label: 'Ver perfil',   icon: <Eye size={13} />,   action: () => onEdit?.(id) },
                { label: 'Editar',       icon: <Edit3 size={13} />, action: () => onEdit?.(id) },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-sans text-char hover:bg-gray-light transition-colors"
                >
                  <span className="text-gray">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mx-5 mb-4 grid grid-cols-3 divide-x divide-border border border-border rounded-md overflow-hidden">
        {[
          { label: 'Total Gastado', value: formatCLP(totalSpent) },
          { label: 'Visitas',       value: visits.toString() },
          { label: 'Última Visita', value: lastVisitDate ? formatRelativeDate(lastVisitDate) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="px-3 py-2.5 text-center bg-cream">
            <p className="font-serif text-sm font-medium text-char leading-none">{value}</p>
            <p className="text-[10px] font-sans text-gray mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Preferences */}
      {visiblePrefs.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {visiblePrefs.map((p) => (
            <Tag key={p} color="gold">{p}</Tag>
          ))}
          {(preferences?.length ?? 0) > 5 && (
            <Tag color="gray">+{(preferences?.length ?? 0) - 5}</Tag>
          )}
        </div>
      )}

      {/* Loyalty tier */}
      <div className="px-5 pb-4">
        <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-xs font-sans font-medium', tierCfg.bg, tierCfg.color, 'border-current/20')}>
          <span>{tierCfg.emoji}</span>
          <span>{tierCfg.label}</span>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mx-5 mb-4 px-3 py-2 bg-cream rounded-sm border border-border">
          <p className="text-[11px] font-sans text-gray leading-relaxed">{notes}</p>
        </div>
      )}

      {/* Divider + actions */}
      <div className="border-t border-border" />
      <div className="px-5 py-3 flex flex-wrap gap-2">
        <ActionButton variant="primary" onClick={() => onReserve?.(id)} ariaLabel={`Nueva reserva para ${name}`}>
          <Calendar size={13} /> Nueva Reserva
        </ActionButton>
        <ActionButton variant="outline" onClick={() => onContact?.(id)} ariaLabel={`Contactar a ${name}`}>
          {phone ? <Phone size={13} /> : <Mail size={13} />} Contactar
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => onEdit?.(id)} ariaLabel="Ver perfil completo">
          <Eye size={13} /> Ver Perfil
        </ActionButton>
      </div>
    </article>
  );
});

/* ══════════════════════════════════════════════════════════════
   3. PRO LEVEL CARD
══════════════════════════════════════════════════════════════ */

export const ProLevelCard = memo(function ProLevelCard({
  professional,
  onEditProfile,
  onViewSchedule,
  onViewClients,
}: ProLevelCardProps) {
  const {
    id, name, avatar, level,
    completedBookings, totalEarnings,
    rating, reviews, commissionPercentage,
    specialties, nextLevel,
  } = professional;

  const levelCfg = LEVEL_CONFIG[level];
  const isPlatinum = level === 'platinum';
  const benefits = LEVEL_BENEFITS[level];
  const visibleSpecialties = specialties.slice(0, 4);

  const progress = useMemo(() => {
    if (isPlatinum) return 100;
    if (!nextLevel) return 100;
    const currentMin = LEVEL_CONFIG[level].bookingsNeeded;
    const base       = level === 'bronze' ? 0 : LEVEL_CONFIG[
      level === 'silver' ? 'bronze' : level === 'gold' ? 'silver' : 'gold'
    ].bookingsNeeded;
    const pct = Math.min(100, Math.round(((completedBookings - base) / (currentMin - base)) * 100));
    return Math.max(0, pct);
  }, [level, nextLevel, completedBookings, isPlatinum]);

  const bookingsToNext = useMemo(() => {
    if (isPlatinum || !nextLevel) return 0;
    return Math.max(0, LEVEL_CONFIG[nextLevel].bookingsNeeded - completedBookings);
  }, [isPlatinum, nextLevel, completedBookings]);

  const levelBarColors: Record<string, string> = {
    bronze:   'bg-orange',
    silver:   'bg-gray',
    gold:     'bg-gold',
    platinum: 'bg-blue',
  };

  return (
    <article className="bg-white border border-border rounded-lg shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden">

      {/* Level header */}
      <div className={clsx('px-5 pt-5 pb-4 border-b border-border', levelCfg.bg)}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/80 shadow-xs">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`Foto de ${name}`}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              ) : (
                <span className={clsx('flex h-full w-full items-center justify-center font-serif text-lg font-medium', levelCfg.bg, levelCfg.color)}>
                  {getInitials(name)}
                </span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 text-base leading-none">{levelCfg.emoji}</span>
          </div>

          {/* Name + level badge */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base font-medium text-char truncate">{name}</h3>
            <span className={clsx(
              'mt-1 inline-flex items-center gap-1 text-[11px] font-sans font-semibold px-2 py-0.5 rounded-sm border',
              levelCfg.color, levelCfg.bg, levelCfg.border
            )}>
              {levelCfg.emoji} {levelCfg.label}
            </span>
          </div>
        </div>

        {/* Progress toward next level */}
        <div className="mt-4">
          {isPlatinum ? (
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-blue" />
              <span className="text-xs font-sans font-medium text-blue">Nivel máximo alcanzado ✨</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-sans text-gray">
                  Hacia nivel {nextLevel ? LEVEL_CONFIG[nextLevel].label : '—'}
                </span>
                <span className="text-[11px] font-sans font-medium text-char">
                  {completedBookings} / {nextLevel ? LEVEL_CONFIG[nextLevel].bookingsNeeded : '—'} servicios
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/40">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    levelBarColors[level] ?? 'bg-blue',
                  )}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-[10px] font-sans text-gray/70 mt-1">
                {bookingsToNext} servicio{bookingsToNext !== 1 ? 's' : ''} para el siguiente nivel
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border border-b border-border">
        {[
          { label: 'Servicios',        value: completedBookings.toLocaleString('es-CL') },
          { label: 'Rating',           value: `⭐ ${rating.toFixed(1)} (${reviews})` },
          { label: 'Ingresos Totales', value: formatCLP(totalEarnings) },
          { label: 'Comisión',         value: `${commissionPercentage}%` },
        ].map(({ label, value }) => (
          <div key={label} className="px-4 py-3">
            <p className="font-serif text-sm font-medium text-char leading-none">{value}</p>
            <p className="text-[10px] font-sans text-gray mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Specialties */}
      {visibleSpecialties.length > 0 && (
        <div className="px-5 pt-4 pb-3 flex flex-wrap gap-1.5">
          {visibleSpecialties.map((s) => (
            <Tag key={s} color="gold">{s}</Tag>
          ))}
          {specialties.length > 4 && (
            <Tag color="gray">+{specialties.length - 4}</Tag>
          )}
        </div>
      )}

      {/* Benefits */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-sans font-semibold text-char uppercase tracking-widest mb-2">
          Beneficios del nivel
        </p>
        <ul className="space-y-1">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-2 text-xs font-sans text-gray">
              <Check size={11} className={levelCfg.color} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="border-t border-border px-5 py-3 flex flex-wrap gap-2">
        <ActionButton variant="outline" onClick={() => onViewSchedule?.(id)} ariaLabel="Ver agenda">
          <Calendar size={13} /> Ver Agenda
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => onViewClients?.(id)} ariaLabel="Mis clientes">
          <User size={13} /> Mis Clientes
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => onEditProfile?.(id)} ariaLabel="Editar perfil">
          <Edit3 size={13} /> Editar Perfil
        </ActionButton>
      </div>
    </article>
  );
});

/* ══════════════════════════════════════════════════════════════
   4. METRIC CARD
══════════════════════════════════════════════════════════════ */

export const MetricCard = memo(function MetricCard({
  title,
  value,
  trend,
  trendUp,
  icon,
  subtext,
  variant = 'normal',
}: MetricCardProps) {
  const v = METRIC_VARIANT_CLASSES[variant];

  return (
    <Card
      padding="md"
      className={clsx('border', v.border)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Stats */}
        <div className="flex-1 min-w-0">
          <p className={clsx('text-[10px] font-sans font-semibold uppercase tracking-widest mb-2', v.title)}>
            {title}
          </p>
          <p className="font-serif text-3xl font-light text-char leading-none tracking-tight">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {trend && (
              <span className={clsx(
                'inline-flex items-center gap-0.5 text-xs font-sans font-medium',
                trendUp ? 'text-status-confirmed' : 'text-red'
              )}>
                {trendUp
                  ? <TrendingUp size={12} />
                  : <TrendingDown size={12} />
                }
                {trend}
              </span>
            )}
            {subtext && (
              <span className="text-[11px] font-sans text-gray">{subtext}</span>
            )}
          </div>
        </div>

        {/* Icon */}
        {icon && (
          <div className={clsx('flex-shrink-0 p-2.5 rounded-sm bg-cream', v.icon)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
});
