"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sidebar, SidebarNav } from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Tenants", href: "/tenants" },
  { label: "Units", href: "/units" },
  { label: "Billing", href: "/billing" },
  { label: "Calendar", href: "/calendar" },
  { label: "Improvements", href: "/improvements" },
  { label: "Announcements", href: "/announcements" },
  { label: "Audit Logs", href: "/audit-logs" },
];

const PAGES: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Tenants, units, and collections at a glance" },
  "/tenants": { title: "Tenants", description: "Profiles, lease dues, and utility bills" },
  "/tenants/new": { title: "New Tenant", description: "Onboard a tenant and auto-generate their contract" },
  "/units": { title: "Units", description: "Commercial and residential units by location, with meter numbers" },
  "/billing": { title: "Billing", description: "Rent, electric, and water — cash, GCash, cheque, and bank transfer" },
  "/calendar": { title: "Calendar", description: "Rent dues, cheque deposits, and lease dates" },
  "/improvements": { title: "Improvement Requests", description: "Tenant requests to improve or upgrade a unit" },
  "/announcements": { title: "Announcements", description: "Send and manage tenant announcements" },
  "/announcements/new": { title: "New Announcement", description: "Compose and target a message to tenants" },
  "/audit-logs": { title: "Audit Logs", description: "System activity and changes" },
  "/settings": { title: "Settings", description: "Organisation profile, locations, and billing rules" },
};

/** Nested routes (e.g. a tenant profile) fall back to their section header. */
function pageFor(pathname: string) {
  if (PAGES[pathname]) return PAGES[pathname];
  if (pathname.startsWith("/tenants/")) return PAGES["/tenants"];
  if (pathname.startsWith("/billing")) return PAGES["/billing"];
  if (pathname.startsWith("/improvements")) return PAGES["/improvements"];
  return { title: "Tenantra", description: "Property Management System" };
}

type Props = {
  children: ReactNode;
  adminName: string;
  orgName: string;
  badges: Record<string, number>;
};

export function AdminShell({ children, adminName, orgName, badges }: Props) {
  const pathname = usePathname();
  const page = pageFor(pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeDrawer = () => setIsSidebarOpen(false);

  const identity = (
    <div className="mt-auto border-t border-border/40 pt-6">
      <div className="flex flex-col items-start text-left">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold font-display text-text-primary">{adminName}</span>
          <Badge variant="accent">Admin</Badge>
        </div>
        <span className="mt-1 text-xs font-medium text-text-muted">{orgName}</span>
      </div>
      <Link
        href="/settings"
        onClick={closeDrawer}
        className="mt-3 inline-flex text-xs font-semibold text-accent hover:underline"
      >
        Manage account →
      </Link>
    </div>
  );

  const brand = (size: "lg" | "sm") => (
    <div className="flex items-center gap-3">
      <Image src="/tenantra-logo.png" alt="Tenantra" width={30} height={30} priority />
      <span className={`font-bold font-valera text-accent ${size === "lg" ? "text-3xl" : "text-2xl"}`}>Tenantra</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[300px_1fr]">
      <Sidebar className="hidden lg:flex">
        {brand("lg")}
        <SidebarNav items={navItems} activeHref={pathname} badges={badges} />
        {identity}
      </Sidebar>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="relative z-50 h-full">
            <Sidebar className="h-full w-72 max-w-[80vw] border-r border-border/50 bg-sidebar shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                {brand("sm")}
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation menu">
                  ✕
                </Button>
              </div>
              <SidebarNav
                items={navItems}
                activeHref={pathname}
                badges={badges}
                onItemClick={() => setIsSidebarOpen(false)}
              />
              {identity}
            </Sidebar>
          </div>
        </div>
      )}

      <main className="flex min-h-screen flex-col rounded-bl-card rounded-tl-card bg-panel">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 rounded-tl-card border-b border-border/60 bg-sidebar/85 px-5 py-4 backdrop-blur-md md:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0 px-3 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <span className="inline-flex h-3 w-4 flex-col justify-between">
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
              </span>
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold font-display text-text-primary md:text-2xl">{page.title}</h1>
              <p className="mt-0.5 hidden truncate text-sm text-text-muted sm:block">{page.description}</p>
            </div>
          </div>
          {pathname === "/" ? (
            <div className="flex shrink-0 flex-wrap justify-end gap-3">
              <ButtonLink href="/tenants/new">Add tenant</ButtonLink>
              <ButtonLink href="/billing" variant="secondary" className="hidden sm:inline-flex">
                Go to billing
              </ButtonLink>
            </div>
          ) : null}
        </header>

        <div className="flex flex-1 flex-col gap-6 px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
