'use client';

import { forwardRef, HTMLAttributes, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface SidebarItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'gold' | 'red' | 'green' | 'gray';
  children?: SidebarItem[];
}

interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  activeKey?: string;
  collapsed?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onItemClick?: (item: SidebarItem) => void;
}

const badgeVariantClasses = {
  gold:  'bg-gold/10 text-gold-dark',
  red:   'bg-red/10 text-red',
  green: 'bg-green/10 text-green',
  gray:  'bg-gray-light text-gray',
};

interface SidebarItemRowProps {
  item: SidebarItem;
  activeKey?: string;
  depth?: number;
  collapsed?: boolean;
  onItemClick?: (item: SidebarItem) => void;
}

function SidebarItemRow({
  item,
  activeKey,
  depth = 0,
  collapsed = false,
  onItemClick,
}: SidebarItemRowProps) {
  const hasChildren = !!item.children?.length;
  const isActive = activeKey === item.key;
  const [open, setOpen] = useState(
    // auto-expand if a child is active
    hasChildren && item.children!.some((c) => c.key === activeKey)
  );

  const handleClick = () => {
    if (hasChildren) {
      setOpen((prev) => !prev);
    } else {
      onItemClick?.(item);
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        title={collapsed ? item.label : undefined}
        className={clsx(
          'group w-full flex items-center gap-2.5 rounded-sm transition-all duration-150',
          'text-left font-sans text-sm',
          depth === 0 ? 'px-3 py-2.5' : 'pl-9 pr-3 py-2',
          isActive
            ? 'bg-gold/10 text-gold-dark font-medium'
            : 'text-gray hover:bg-gray-light hover:text-char',
          collapsed && 'justify-center px-0'
        )}
      >
        {item.icon && (
          <span
            className={clsx(
              'flex-shrink-0',
              isActive ? 'text-gold' : 'text-gray group-hover:text-char',
              collapsed ? 'mx-auto' : ''
            )}
          >
            {item.icon}
          </span>
        )}

        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>

            {item.badge !== undefined && (
              <span
                className={clsx(
                  'ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-sm leading-none',
                  badgeVariantClasses[item.badgeVariant ?? 'gray']
                )}
              >
                {item.badge}
              </span>
            )}

            {hasChildren && (
              <ChevronDown
                size={14}
                className={clsx(
                  'text-gray transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            )}
          </>
        )}
      </button>

      {hasChildren && open && !collapsed && (
        <ul className="mt-0.5 space-y-0.5">
          {item.children!.map((child) => (
            <SidebarItemRow
              key={child.key}
              item={child}
              activeKey={activeKey}
              depth={depth + 1}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      activeKey,
      collapsed = false,
      header,
      footer,
      onItemClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={clsx(
          'fixed top-nav left-0 bottom-0 z-30 flex flex-col',
          'bg-white border-r border-border',
          'transition-all duration-200',
          collapsed ? 'w-16' : 'w-sidebar',
          className
        )}
        {...props}
      >
        {header && (
          <div className={clsx('px-3 py-4 border-b border-border', collapsed && 'px-0')}>
            {header}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {items.map((item) => (
              <SidebarItemRow
                key={item.key}
                item={item}
                activeKey={activeKey}
                collapsed={collapsed}
                onItemClick={onItemClick}
              />
            ))}
          </ul>
        </nav>

        {footer && (
          <div className={clsx('px-3 py-4 border-t border-border', collapsed && 'px-0')}>
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export default Sidebar;
