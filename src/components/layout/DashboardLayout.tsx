'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  DollarSign,
  User,
  Heart,
  History,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Sidebar } from '@/components/ui';
import type { SidebarItem } from '@/components/ui';

/* ── Types ──────────────────────────────────────────────────── */

type Role = 'admin' | 'professional' | 'client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: Role;
}

interface NavLink {
  label: string;
  href: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

/* ── Static data ─────────────────────────────────────────────── */

const navLinks: Record<Role, NavLink[]> = {
  admin: [
    { label: 'Servicios',    href: '/admin/servicios' },
    { label: 'Experiencia',  href: '/admin/experiencia' },
    { label: 'Hoteles',      href: '/admin/hoteles' },
    { label: 'Reservas',     href: '/admin/reservas' },
  ],
  professional: [
    { label: 'Mi Agenda',    href: '/pro/agenda' },
    { label: 'Comisiones',   href: '/pro/comisiones' },
    { label: 'Mis Clientes', href: '/pro/clientes' },
    { label: 'Soporte',      href: '/soporte' },
  ],
  client: [
    { label: 'Mis Reservas', href: '/cliente/reservas' },
    { label: 'Mis Favoritos',href: '/cliente/favoritos' },
    { label: 'Mi Perfil',    href: '/cliente/perfil' },
    { label: 'Soporte',      href: '/soporte' },
  ],
};

const menuItems: Record<Role, SidebarItem[]> = {
  admin: [
    { key: '/admin',              label: 'Dashboard',      href: '/admin',              icon: <LayoutDashboard size={17} /> },
    { key: '/admin/reservas',     label: 'Reservas',       href: '/admin/reservas',     icon: <Calendar       size={17} />, badge: 12, badgeVariant: 'gold' },
    { key: '/admin/clientes',     label: 'Clientes',       href: '/admin/clientes',     icon: <Users          size={17} />, badge: 24, badgeVariant: 'gray' },
    { key: '/admin/profesionales',label: 'Profesionales',  href: '/admin/profesionales',icon: <UserCheck      size={17} /> },
    { key: '/admin/reportes',     label: 'Reportes',       href: '/admin/reportes',     icon: <BarChart3      size={17} /> },
    { key: '/admin/configuracion',label: 'Configuración',  href: '/admin/configuracion',icon: <Settings       size={17} /> },
  ],
  professional: [
    { key: '/pro',           label: 'Dashboard',      href: '/pro',           icon: <LayoutDashboard size={17} /> },
    { key: '/pro/agenda',    label: 'Mi Agenda',      href: '/pro/agenda',    icon: <Calendar        size={17} />, badge: 5, badgeVariant: 'gold' },
    { key: '/pro/comisiones',label: 'Mis Comisiones', href: '/pro/comisiones',icon: <DollarSign      size={17} /> },
    { key: '/pro/clientes',  label: 'Mis Clientes',   href: '/pro/clientes',  icon: <Users           size={17} /> },
    { key: '/pro/perfil',    label: 'Perfil',         href: '/pro/perfil',    icon: <User            size={17} /> },
  ],
  client: [
    { key: '/cliente/reservas',  label: 'Mis Reservas',  href: '/cliente/reservas',  icon: <Calendar size={17} />, badge: 2, badgeVariant: 'gold' },
    { key: '/cliente/historial', label: 'Historial',     href: '/cliente/historial', icon: <History  size={17} /> },
    { key: '/cliente/favoritos', label: 'Mis Favoritos', href: '/cliente/favoritos', icon: <Heart    size={17} /> },
    { key: '/cliente/perfil',    label: 'Mi Perfil',     href: '/cliente/perfil',    icon: <User     size={17} /> },
  ],
};

const roleLabel: Record<Role, string> = {
  admin:        'Administrador',
  professional: 'Profesional',
  client:       'Cliente',
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Nueva reserva',        body: 'María J. reservó Colorimetría para el viernes.',   time: 'hace 5 min',  unread: true  },
  { id: '2', title: 'Pago confirmado',       body: 'Se acreditaron $55.000 por reserva #1042.',        time: 'hace 1 h',    unread: true  },
  { id: '3', title: 'Valoración recibida',  body: 'Paula D. te dejó una reseña de 5 estrellas.',       time: 'hace 3 h',    unread: false },
];

/* ── Component ───────────────────────────────────────────────── */

export default function DashboardLayout({
  children,
  userName,
  userRole,
}: DashboardLayoutProps) {
  const pathname   = usePathname();
  const router     = useRouter();

  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [searchValue,      setSearchValue]      = useState('');
  const [searchOpen,       setSearchOpen]       = useState(false);

  const notifRef  = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* close notifications on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* focus search input when opened */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;

  /* find active sidebar key — longest matching prefix wins */
  const activeKey = menuItems[userRole]
    .filter((item) => item.href && pathname.startsWith(item.href))
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0]?.key ?? '';

  const handleSidebarItemClick = (item: SidebarItem) => {
    if (item.href) router.push(item.href);
  };

  const sidebarWidth = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-sidebar';

  /* ── Sidebar footer ── */
  const sidebarFooter = (
    <div className={clsx('flex items-center gap-2.5', sidebarCollapsed && 'justify-center')}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark text-xs font-semibold font-sans">
        {userName.slice(0, 2).toUpperCase()}
      </div>
      {!sidebarCollapsed && (
        <div className="min-w-0">
          <p className="text-xs font-sans font-medium text-char truncate">{userName}</p>
          <p className="text-[10px] font-sans text-gray">{roleLabel[userRole]}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-nav bg-white border-b border-border shadow-xs flex items-center px-4 gap-3">

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
        >
          <Menu size={18} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 font-serif text-[15px] text-char tracking-wide leading-tight">
          Reverencia<br className="hidden sm:block" />
          <em className="not-italic text-gold sm:ml-0"> Majestad</em>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {navLinks[userRole].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-3 py-1.5 rounded-sm font-sans text-[13px] transition-colors',
                pathname.startsWith(link.href)
                  ? 'text-char font-medium bg-gray-light'
                  : 'text-gray hover:text-char hover:bg-gray-light'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1">

          {/* Search — expandable */}
          <div className="relative flex items-center">
            {searchOpen && (
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Buscar…"
                className="absolute right-9 w-48 sm:w-64 h-8 pl-3 pr-2 border border-border rounded-sm bg-cream text-sm font-sans text-char placeholder:text-gray focus:outline-none focus:border-gold transition-all"
              />
            )}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
            >
              {searchOpen ? <X size={17} /> : <Search size={17} />}
            </button>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={`${unreadCount} notificaciones sin leer`}
              className="relative p-2 rounded-sm text-gray hover:text-char hover:bg-gray-light transition-colors"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-pending text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-md shadow-lg z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-serif text-sm text-char">Notificaciones</span>
                  <span className="text-[10px] font-sans text-gray">{unreadCount} sin leer</span>
                </div>
                <ul>
                  {DEMO_NOTIFICATIONS.map((n) => (
                    <li
                      key={n.id}
                      className={clsx(
                        'px-4 py-3 border-b border-border last:border-0 cursor-pointer',
                        'hover:bg-cream transition-colors',
                        n.unread && 'bg-gold/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && (
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />
                        )}
                        <div className={clsx(!n.unread && 'ml-3.5')}>
                          <p className="font-sans text-xs font-medium text-char">{n.title}</p>
                          <p className="font-sans text-[11px] text-gray mt-0.5 leading-snug">{n.body}</p>
                          <p className="font-sans text-[10px] text-gray/60 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2.5">
                  <button className="w-full text-center font-sans text-xs text-gold hover:text-gold-dark transition-colors">
                    Ver todas
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <button
            onClick={() => router.push(`/${userRole === 'admin' ? 'admin' : userRole === 'professional' ? 'pro' : 'cliente'}/perfil`)}
            aria-label="Mi perfil"
            className="ml-1 h-8 w-8 rounded-full border border-border hover:border-gold transition-colors overflow-hidden"
          >
            <span className="flex h-full w-full items-center justify-center bg-gold/10 text-gold-dark text-xs font-semibold font-sans">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={() => router.push('/logout')}
            aria-label="Cerrar sesión"
            className="ml-1 p-2 rounded-sm text-gray hover:text-red hover:bg-red/5 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── MOBILE OVERLAY ──────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-char/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <Sidebar
        items={menuItems[userRole]}
        activeKey={activeKey}
        collapsed={sidebarCollapsed}
        onItemClick={handleSidebarItemClick}
        footer={sidebarFooter}
        className={clsx(
          /* mobile: slide in/out */
          'translate-x-0 transition-transform duration-300',
          !sidebarOpen && '-translate-x-full lg:translate-x-0'
        )}
      />

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setSidebarCollapsed((v) => !v)}
        aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        className={clsx(
          'hidden lg:flex fixed z-40 items-center justify-center',
          'h-6 w-6 rounded-full bg-white border border-border shadow-xs',
          'text-gray hover:text-char hover:border-gold transition-all duration-200',
          'top-[calc(60px+20px)]',
          sidebarCollapsed ? 'left-[52px]' : 'left-[228px]'
        )}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main
        className={clsx(
          'min-h-screen pt-nav transition-all duration-300',
          sidebarWidth
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
