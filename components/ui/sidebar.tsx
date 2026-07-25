import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SidebarProps = {
  children: ReactNode;
  className?: string;
};

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex sticky top-0 flex-col px-7 py-8 max-h-screen overflow-y-auto border-r border-border/50 bg-sidebar",
        className,
      )}
    >
      {children}
    </aside>
  );
}

type SidebarNavProps = {
  items: Array<{ label: string; href: string }>;
  activeHref?: string;
  /** Optional counts keyed by href, e.g. pending approvals next to Facilities. */
  badges?: Record<string, number>;
  onItemClick?: () => void;
};

export function SidebarNav({ items, activeHref, badges, onItemClick }: SidebarNavProps) {
  return (
    <nav className="grid gap-1 mt-8">
      {items.map((item) => (
        <SidebarNavItem
          key={item.href}
          href={item.href}
          active={activeHref === item.href}
          badge={badges?.[item.href]}
          onClick={onItemClick}
        >
          {item.label}
        </SidebarNavItem>
      ))}
    </nav>
  );
}

type SidebarNavItemProps = {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
};

export function SidebarNavItem({ href, children, className, active, badge, onClick }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex justify-between items-center px-4 py-3 text-sm font-medium rounded-xl transition group",
        active
          ? "bg-panel text-text-primary shadow-card"
          : "text-text-secondary hover:bg-panel/70 hover:text-text-primary",
        className,
      )}
      onClick={onClick}
    >
      <span className="relative">
        <span
          className={cn(
            "absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-colors",
            active ? "bg-accent" : "bg-accent/0 group-hover:bg-accent/70",
          )}
        />
        {children}
      </span>
      {badge ? (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{badge}</span>
      ) : (
        <span className="opacity-0 transition-opacity text-text-muted group-hover:opacity-100">→</span>
      )}
    </Link>
  );
}
