'use client';

import {
  forwardRef,
  HTMLAttributes,
  ElementType,
  ReactNode,
} from 'react';
import clsx from 'clsx';

type CardAs = 'div' | 'article' | 'section' | 'li';

interface CardProps extends HTMLAttributes<HTMLElement> {
  hoverable?: boolean;
  floating?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: CardAs;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = forwardRef<HTMLElement, CardProps>(
  (
    {
      as = 'div',
      hoverable = false,
      floating = false,
      padding = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const Component = as as ElementType;

    return (
      <Component
        ref={ref}
        className={clsx(
          'rounded-2xl border border-border bg-white',
          paddingClasses[padding],
          floating && 'shadow-sm',
          hoverable && 'transition hover:-translate-y-0.5 hover:shadow-md',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('mb-5 flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div>
        <h3 className="font-serif text-base font-medium text-char leading-snug">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-gray">{subtitle}</p>}
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardDivider = () => (
  <hr className="my-4 border-t border-border" />
);

export default Card;