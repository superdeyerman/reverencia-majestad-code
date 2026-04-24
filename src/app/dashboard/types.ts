/* ─────────────────────────────────────────────────────────────────────────────
   Reverencia Majestad – Dashboard types
   Aligned with prisma/schema.prisma enums so swapping mock → real data
   requires only changing the data source, never the component contracts.
───────────────────────────────────────────────────────────────────────────── */

// ── Domain enums (mirror Prisma) ─────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED';

export type BookingModality = 'HOME' | 'HOTEL' | 'PRIVATE_STUDIO';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'CHARGED_BACK'
  | 'FAILED';

export type ServiceCategory = 'BEAUTY' | 'WELLNESS' | 'SKINCARE';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// ── Dashboard-level roles (superset of Prisma Role) ──────────────────────────

export type DashboardRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'PROFESSIONAL';

// ── UI state ─────────────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc';
export type DateRange = '7d' | '30d' | '90d' | 'custom';
export type ExportFormat = 'csv' | 'json' | 'clipboard' | 'print';
export type DashboardTab = 'overview' | 'reservations' | 'clients' | 'analytics';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ── Core data shapes ─────────────────────────────────────────────────────────

export interface DashboardBooking {
  id: string;
  code: string;
  status: BookingStatus;
  modality: BookingModality;
  /** ISO 8601 */
  appointmentAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  professionalName?: string;
  district?: string;
  address?: string;
  hotelName?: string;
  roomNumber?: string;
  /** CLP integer */
  totalAmount: number;
  depositAmount: number;
  isDepositPaid: boolean;
  paidAmountTotal: number;
  paymentStatus?: PaymentStatus;
  notes?: string;
  isVIP?: boolean;
  /** ISO 8601 */
  createdAt: string;
}

export interface DashboardClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  visitCount: number;
  lastVisitAt?: string;
  loyaltyTier: LoyaltyTier;
  notes?: string;
  preferences?: string[];
  createdAt: string;
}

export interface DashboardService {
  id: string;
  name: string;
  category: ServiceCategory;
  basePrice: number;
  durationMinutes: number;
  bookingCount: number;
  revenue: number;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface RevenueByDay {
  /** 'dd/MM' for display */
  date: string;
  revenue: number;
  bookings: number;
}

export interface DashboardMetrics {
  revenueTotal: number;
  revenueLast7Days: number;
  revenuePrev7Days: number;
  revenueSparkline: number[];

  bookingsTotal: number;
  bookingsPending: number;
  bookingsConfirmed: number;
  bookingsCompleted: number;
  bookingsCancelled: number;
  bookingsActive: number;
  bookingsSparkline: number[];

  clientsTotal: number;
  clientsVIP: number;

  averageTicket: number;
  depositConversionRate: number;
  cancellationRate: number;
  occupancyRate: number;

  revenueByDay: RevenueByDay[];
  topServices: Array<{ name: string; count: number; revenue: number }>;
  bookingsByStatus: Array<{ status: BookingStatus; count: number }>;
  occupancyHeatmap: Array<{ day: number; hour: number; count: number }>;
}

// ── Alerts & audit ────────────────────────────────────────────────────────────

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
}

export type AuditAction =
  | 'CONFIRM'
  | 'CANCEL'
  | 'COMPLETE'
  | 'RESCHEDULE'
  | 'REMIND'
  | 'VIEW'
  | 'EXPORT'
  | 'BULK_CONFIRM'
  | 'BULK_CANCEL'
  | 'BULK_EXPORT'
  | 'UNDO';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: 'booking' | 'client' | 'service';
  entityId: string;
  entityLabel: string;
  performedBy: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

// ── Table controls ────────────────────────────────────────────────────────────

export interface SortConfig {
  field: keyof DashboardBooking | 'default';
  direction: SortDirection;
}

export interface FilterState {
  search: string;
  status: BookingStatus | 'ALL';
  modality: BookingModality | 'ALL';
  service: string;
  dateFrom: string;
  dateTo: string;
  amountMin: number | '';
  amountMax: number | '';
}

export interface PaginationState {
  page: number;
  pageSize: 10 | 25 | 50;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Preferences (persisted to localStorage) ──────────────────────────────────

export interface DashboardPreferences {
  activeTab: DashboardTab;
  pageSize: 10 | 25 | 50;
  filtersCollapsed: boolean;
  auditLogExpanded: boolean;
  dateRange: DateRange;
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'normal';
  onConfirm: () => void;
  onCancel?: () => void;
}

// ── API shapes (ready for real endpoints) ────────────────────────────────────

export interface DashboardData {
  bookings: DashboardBooking[];
  clients: DashboardClient[];
  services: DashboardService[];
  metrics: DashboardMetrics;
  alerts: DashboardAlert[];
}

export interface ApiResponse<T> {
  data: T;
  meta?: { total: number; page: number; pageSize: number };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
