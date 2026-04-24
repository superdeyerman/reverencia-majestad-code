'use client';

import { forwardRef, HTMLAttributes, LabelHTMLAttributes, useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

/* ── Label ──────────────────────────────────────────────────── */

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: string;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, hint, className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx('block text-xs font-medium text-char tracking-wide mb-1', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-status-pending">*</span>}
      {hint && <span className="ml-1.5 font-normal text-gray">({hint})</span>}
    </label>
  )
);
Label.displayName = 'Label';

/* ── Tag ────────────────────────────────────────────────────── */

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  color?: 'gold' | 'gray' | 'green' | 'rose' | 'blue';
}

const tagColorClasses = {
  gold:  'bg-gold/10  text-gold-dark  border-gold/20',
  gray:  'bg-gray-light text-gray    border-border',
  green: 'bg-green/10 text-green     border-green/20',
  rose:  'bg-rose/10  text-rose      border-rose/20',
  blue:  'bg-blue/10  text-blue      border-blue/20',
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ color = 'gray', onRemove, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx(
        'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5',
        'rounded-sm border font-sans',
        tagColorClasses[color],
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar"
          className="hover:opacity-70 transition-opacity leading-none"
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
);
Tag.displayName = 'Tag';

/* ── Divider ────────────────────────────────────────────────── */

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ label, orientation = 'horizontal', className, ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={clsx('self-stretch w-px bg-border mx-2', className)}
          {...props}
        />
      );
    }
    if (label) {
      return (
        <div
          ref={ref}
          className={clsx('flex items-center gap-3 my-4', className)}
          {...props}
        >
          <span className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-sans text-gray tracking-widest uppercase">
            {label}
          </span>
          <span className="flex-1 h-px bg-border" />
        </div>
      );
    }
    return (
      <hr
        ref={ref as never}
        className={clsx('border-t border-border my-4', className)}
        {...props}
      />
    );
  }
);
Divider.displayName = 'Divider';

/* ── Toast ──────────────────────────────────────────────────── */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const toastConfig: Record<ToastVariant, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle size={16} />,
    classes: 'bg-status-confirmed/10 border-status-confirmed/30 text-status-confirmed',
  },
  error: {
    icon: <AlertCircle size={16} />,
    classes: 'bg-status-cancelled/10 border-status-cancelled/30 text-status-cancelled',
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    classes: 'bg-orange/10 border-orange/30 text-orange',
  },
  info: {
    icon: <Info size={16} />,
    classes: 'bg-blue/10 border-blue/30 text-blue',
  },
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ variant = 'info', title, message, duration = 4000, onClose, className, ...props }, ref) => {
    const [visible, setVisible] = useState(true);
    const config = toastConfig[variant];

    useEffect(() => {
      if (!duration) return;
      const t = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(t);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          'flex items-start gap-3 px-4 py-3 rounded-md border shadow-sm',
          'font-sans text-sm min-w-[260px] max-w-sm',
          config.classes,
          className
        )}
        {...props}
      >
        <span className="mt-0.5 flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold leading-snug">{title}</p>}
          <p className={clsx('leading-snug', title && 'mt-0.5 opacity-80')}>{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => { setVisible(false); onClose(); }}
            aria-label="Cerrar"
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

/* ── LiveDot ────────────────────────────────────────────────── */

interface LiveDotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'green' | 'gold' | 'red' | 'gray';
  size?: 'sm' | 'md';
  label?: string;
}

const liveDotColor = {
  green: 'bg-green',
  gold:  'bg-gold',
  red:   'bg-red',
  gray:  'bg-gray',
};

export const LiveDot = forwardRef<HTMLSpanElement, LiveDotProps>(
  ({ color = 'green', size = 'md', label, className, ...props }, ref) => (
    <span
      ref={ref}
      className={clsx('inline-flex items-center gap-1.5', className)}
      {...props}
    >
      <span
        className={clsx(
          'rounded-full animate-pulse',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          liveDotColor[color]
        )}
      />
      {label && (
        <span className="text-xs font-sans font-medium text-gray">{label}</span>
      )}
    </span>
  )
);
LiveDot.displayName = 'LiveDot';

/* ── EmptyState ─────────────────────────────────────────────── */

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="mb-4 text-gray-light [&>svg]:h-10 [&>svg]:w-10">
          {icon}
        </span>
      )}
      <p className="font-serif text-lg text-char font-medium">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-gray max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
);
EmptyState.displayName = 'EmptyState';
