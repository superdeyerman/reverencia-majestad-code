'use client';

import { forwardRef, ButtonHTMLAttributes, cloneElement, isValidElement, Children } from 'react';
import type { ReactElement } from 'react';
import clsx from 'clsx';

type Variant = 'dark' | 'gold' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  /** Render as the child element, merging all button styles onto it. */
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  dark:    'bg-char text-white hover:bg-char/85 active:scale-[0.98]',
  gold:    'bg-gold text-white hover:bg-gold-dark active:scale-[0.98]',
  outline: 'border border-border text-char hover:border-gold hover:text-gold bg-transparent',
  ghost:   'text-char hover:bg-gray-light bg-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'dark',
      size = 'md',
      loading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = clsx(
      'inline-flex items-center justify-center font-sans font-medium tracking-wide',
      'rounded-sm transition-all duration-150 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    const inner = (
      <>
        {loading && (
          <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
        {children}
      </>
    );

    if (asChild) {
      if (Children.count(children) === 1) {
        const child = Children.only(children);
        if (isValidElement(child)) {
          const childProps = child.props as Record<string, unknown>;
          return cloneElement(child as ReactElement<Record<string, unknown>>, {
            ...props,
            ref,
            'aria-disabled': disabled || loading ? true : undefined,
            className: clsx(classes, childProps.className as string),
            children: inner,
          });
        }
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('Button with asChild expects exactly one child element.');
      }
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {inner}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
