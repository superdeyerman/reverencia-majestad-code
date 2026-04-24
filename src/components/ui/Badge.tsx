'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

type BadgeStatus = 'pending' | 'confirmed' | 'done' | 'cancelled' | 'vip' | 'live';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: BadgeStatus;
  size?: BadgeSize;
  dot?: boolean;
  label?: string;
}

const statusClasses: Record<BadgeStatus, string> = {
  pending:   'bg-status-pending/10   text-status-pending   border-status-pending/20',
  confirmed: 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20',
  done:      'bg-status-done/10      text-status-done      border-status-done/20',
  cancelled: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20',
  vip:       'bg-gold/10             text-gold-dark        border-gold/20',
  live:      'bg-green/10            text-green            border-green/20',
};

const dotClasses: Record<BadgeStatus, string> = {
  pending:   'bg-status-pending',
  confirmed: 'bg-status-confirmed',
  done:      'bg-status-done',
  cancelled: 'bg-status-cancelled',
  vip:       'bg-gold',
  live:      'bg-green',
};

const defaultLabels: Record<BadgeStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  done:      'Completado',
  cancelled: 'Cancelado',
  vip:       'VIP',
  live:      'En vivo',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ status, size = 'md', dot = true, label, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center font-sans font-medium rounded-sm border',
          statusClasses[status],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={clsx(
              'rounded-full flex-shrink-0',
              size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
              dotClasses[status],
              status === 'live' && 'animate-pulse'
            )}
          />
        )}
        {label ?? defaultLabels[status]}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
