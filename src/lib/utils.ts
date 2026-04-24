import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BookingStatus } from "@prisma/client";

// ─── Styling ────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Status ─────────────────────────────────────────────────────────────────

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.PENDING:         return "pendiente";
    case BookingStatus.PAYMENT_PENDING: return "pago en proceso";
    case BookingStatus.CONFIRMED:       return "confirmado";
    case BookingStatus.IN_PROGRESS:     return "en servicio";
    case BookingStatus.COMPLETED:       return "realizado";
    case BookingStatus.CANCELLED:       return "cancelado";
    case BookingStatus.PAYMENT_FAILED:  return "pago fallido";
    default:                            return status;
  }
}

export function statusColor(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.PENDING:         return "bg-stone-100 text-stone-600";
    case BookingStatus.PAYMENT_PENDING: return "bg-amber-50 text-amber-700";
    case BookingStatus.CONFIRMED:       return "bg-emerald-50 text-emerald-700";
    case BookingStatus.IN_PROGRESS:     return "bg-blue-50 text-blue-700";
    case BookingStatus.COMPLETED:       return "bg-teal-50 text-teal-700";
    case BookingStatus.CANCELLED:       return "bg-red-50 text-red-600";
    case BookingStatus.PAYMENT_FAILED:  return "bg-rose-50 text-rose-700";
    default:                            return "bg-stone-100 text-stone-600";
  }
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCLPCompact(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} M`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1_000)} mil`;
  return formatCLP(value);
}

export function formatCommission(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

// ─── Dates ───────────────────────────────────────────────────────────────────

function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatAppointment(date: Date | string): string {
  return format(toDate(date), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es });
}

export function formatDateShort(date: Date | string): string {
  return format(toDate(date), "dd/MM/yyyy HH:mm");
}

export function formatTimeOnly(date: Date | string): string {
  return format(toDate(date), "HH:mm");
}

export function formatRelative(date: Date | string): string {
  const d = toDate(date);
  const diffMs = Date.now() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return "justo ahora";
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ayer";
  if (diffDays < 30) return `hace ${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `hace ${diffMonths === 1 ? "1 mes" : `${diffMonths} meses`}`;
  return format(d, "dd/MM/yyyy");
}

// ─── Phone ───────────────────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("56") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("9") && digits.length === 9) return `+56${digits}`;
  if (digits.length === 8) return `+569${digits}`;
  return `+56${digits}`;
}

// ─── Duration ────────────────────────────────────────────────────────────────

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Text ────────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export function bookingCode(): string {
  return `RM-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
