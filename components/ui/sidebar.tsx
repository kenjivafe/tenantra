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
        "flex sticky top-0 flex-col px-7 py-8 max-h-screen border-r border-border/50 bg-sidebar",
        className,
      )}
    >
      {children}
    </aside>
  );
}

type SidebarNavProps = {
  items: Array<{ label: string; href: string }>;
  onItemClick?: () => void;
};

export function SidebarNav({ items, onItemClick }: SidebarNavProps) {
  return (
    <nav className="grid gap-1 mt-8">
      {items.map((item) => (
        <SidebarNavItem key={item.href} href={item.href} onClick={onItemClick}>
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
  onClick?: () => void;
};

export function SidebarNavItem({ href, children, className, onClick }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex justify-between items-center px-4 py-3 text-sm font-medium rounded-xl transition group text-text-secondary hover:bg-panel/70 hover:text-text-primary",
        className,
      )}
      onClick={onClick}
    >
      <span className="relative">
        <span className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent/0 transition-colors group-hover:bg-accent/70" />
        {children}
      </span>
      <span className="opacity-0 transition-opacity text-text-muted group-hover:opacity-100">→</span>
    </Link>
  );
}
