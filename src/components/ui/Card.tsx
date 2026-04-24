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

const Card = forwardRef<HTMLDivElement | HTMLLIElement, CardProps>(
  (props, ref) => {
    return <div ref={ref} {...props} />;
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
