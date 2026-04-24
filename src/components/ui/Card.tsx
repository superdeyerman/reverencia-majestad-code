'use client';

import { forwardRef, HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  floating?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section' | 'li';
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      hoverable = false,
      floating = false,
      padding = 'md',
      as: Tag = 'div',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Tag
        ref={ref as never}
        className={clsx(
          'bg-white border border-border rounded-md',
          floating ? 'shadow-lg' : 'shadow-xs',
          hoverable && [
            'transition-all duration-200 cursor-pointer',
            'hover:shadow-sm hover:-translate-y-0.5 hover:border-gold/30',
          ],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Card.displayName = 'Card';

/* ── Sub-components ─────────────────────────────────────────── */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('flex items-start justify-between gap-4 mb-5', className)}
      {...props}
    >
      <div>
        <h3 className="font-serif text-base font-medium text-char leading-snug">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-gray">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardDivider = () => (
  <hr className="border-t border-border my-4" />
);

export default Card;
