'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { Bell, Search, Menu } from 'lucide-react';
import clsx from 'clsx';

interface Notification {
  id: string;
  message: string;
  unread?: boolean;
}

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  notifications?: Notification[];
  unreadCount?: number;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onAvatarClick?: () => void;
  actions?: React.ReactNode;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    {
      title,
      avatarUrl,
      avatarFallback = 'U',
      unreadCount = 0,
      onMenuClick,
      onSearchClick,
      onNotificationsClick,
      onAvatarClick,
      actions,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={clsx(
          'fixed top-0 left-0 right-0 z-40 h-nav',
          'bg-white/95 backdrop-blur-sm border-b border-border',
          'flex items-center px-4 gap-3',
          className
        )}
        {...props}
      >
        {/* Menu toggle (mobile) */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Title */}
        {title && (
          <span className="font-serif text-base font-medium text-char tracking-wide mr-auto">
            {title}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Search */}
          <button
            onClick={onSearchClick}
            aria-label="Buscar"
            className="p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
          >
            <Search size={17} />
          </button>

          {/* Notifications */}
          <button
            onClick={onNotificationsClick}
            aria-label={`${unreadCount} notificaciones`}
            className="relative p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-pending text-[9px] font-bold text-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Extra actions slot */}
          {actions}

          {/* Avatar */}
          <button
            onClick={onAvatarClick}
            aria-label="Perfil"
            className="ml-1 h-8 w-8 rounded-full overflow-hidden border border-border hover:border-gold transition-colors"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Foto de perfil"
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gold/10 text-gold-dark text-xs font-semibold font-sans">
                {avatarFallback.slice(0, 2).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </header>
    );
  }
);

Navbar.displayName = 'Navbar';

export default Navbar;
