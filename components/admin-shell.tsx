"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sidebar, SidebarNav } from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Billing", href: "/billing" },
  { label: "Units", href: "/units" },
  { label: "Residents", href: "/residents" },
  { label: "Announcements", href: "/announcements" },
  { label: "Facilities", href: "/facilities" },
  { label: "Analytics", href: "/analytics" },
  { label: "Audit Logs", href: "/audit-logs" },
];

const PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Operations Dashboard",
    description: "Monitor collections, occupancy, facility usage, and communications",
  },
  "/billing": { title: "Billing Management", description: "Manage invoices, collections, and billing cycles" },
  "/billing/run": { title: "Run Billing Cycle", description: "Generate invoices for occupied units in a billing period" },
  "/billing/create": { title: "Create Manual Invoice", description: "Bill a single unit outside the regular cycle" },
  "/units": { title: "Units Management", description: "View and manage property units" },
  "/residents": { title: "Residents", description: "Manage tenant information and communications" },
  "/announcements": { title: "Announcements", description: "Send and manage community announcements" },
  "/announcements/new": { title: "New Announcement", description: "Compose and target a message to residents" },
  "/facilities": { title: "Facilities", description: "Manage facility bookings and maintenance" },
  "/analytics": { title: "Analytics", description: "View property performance insights" },
  "/audit-logs": { title: "Audit Logs", description: "View system activity and changes" },
  "/settings": { title: "Settings", description: "Organisation profile, billing rules, and notifications" },
};

type Props = {
  children: ReactNode;
  adminName: string;
  orgName: string;
  badges: Record<string, number>;
};

export function AdminShell({ children, adminName, orgName, badges }: Props) {
  const pathname = usePathname();
  const page = PAGES[pathname] ?? { title: "Tenantra", description: "Property Management System" };
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

      <main className="rounded-bl-card rounded-tl-card bg-panel px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <span className="inline-flex h-3 w-4 flex-col justify-between">
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
              </span>
              <span className="text-xs font-semibold">Menu</span>
            </Button>
          </div>

          <Card className="bg-sidebar shadow-amber-900/25" padding="md">
            <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold font-display text-text-primary">{page.title}</h1>
                <p className="mt-2 text-sm text-text-muted">{page.description}</p>
              </div>
              {pathname === "/" ? (
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href="/billing/run">Run billing cycle</ButtonLink>
                  <ButtonLink href="/announcements/new" variant="secondary">
                    New announcement
                  </ButtonLink>
                </div>
              ) : null}
            </header>
          </Card>
          {children}
        </div>
      </main>
    </div>
  );
}
