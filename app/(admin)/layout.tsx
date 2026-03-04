"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Sidebar, SidebarNav } from "@/components/ui/sidebar";
import { CustomSelect } from "@/components/ui/select";
import { usePathname } from "next/navigation";

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

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/":
      return { title: "Operations Dashboard", description: "Monitor collections, occupancy, facility usage, and communications" };
    case "/billing":
      return { title: "Billing Management", description: "Manage invoices, collections, and billing cycles" };
    case "/units":
      return { title: "Units Management", description: "View and manage property units" };
    case "/residents":
      return { title: "Residents", description: "Manage tenant information and communications" };
    case "/announcements":
      return { title: "Announcements", description: "Send and manage community announcements" };
    case "/facilities":
      return { title: "Facilities", description: "Manage facility bookings and maintenance" };
    case "/analytics":
      return { title: "Analytics", description: "View property performance insights" };
    case "/audit-logs":
      return { title: "Audit Logs", description: "View system activity and changes" };
    default:
      return { title: "Tenantra", description: "Property Management System" };
  }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { title, description } = getPageTitle(pathname);
  
  return (
    <div className="grid min-h-screen grid-cols-[300px_1fr] bg-surface">
      <Sidebar className="">
        <div className="flex flex-col items-start text-left">
          <div className="flex gap-3 items-center">
            <Image src="/tenantra-logo.png" alt="Tenantra" width={30} height={30} priority />
            <span className="text-3xl font-bold font-valera text-accent">Tenantra</span>
          </div>
        </div>
        <SidebarNav items={navItems} />
        <div className="pt-6 mt-auto border-t border-border/40">
          <div className="flex flex-col items-start text-left">
            <div className="flex gap-3 items-center">
              <span className="text-lg font-semibold font-display text-text-primary">Admin User</span>
              <Badge variant="accent">Admin</Badge>
            </div>
            <span className="mt-1 text-xs font-medium text-text-muted">Property Manager</span>
          </div>
          <Link href="/settings" className="inline-flex mt-3 text-xs font-semibold text-accent hover:underline">
            Manage account →
          </Link>
        </div>
      </Sidebar>
      <main className="px-10 py-10 rounded-bl-card rounded-tl-card bg-panel">
        <div className="flex flex-col gap-6">
          <Card className="shadow-amber-900/25 bg-sidebar" padding="md">
            <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-semibold font-display text-text-primary">{title}</h1>
                <p className="mt-2 text-sm text-text-muted">{description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {pathname === "/" && (
                  <>
                    <ButtonLink href="/billing/run">Run billing cycle</ButtonLink>
                    <ButtonLink href="/announcements/new" variant="secondary">
                      New announcement
                    </ButtonLink>
                  </>
                )}
                {pathname === "/billing" && (
                  <>
                    <CustomSelect>
                      <option>May 2026</option>
                      <option>April 2026</option>
                      <option>March 2026</option>
                    </CustomSelect>
                    <ButtonLink href="/billing/run">Run Billing Cycle</ButtonLink>
                    <ButtonLink href="/billing/create" variant="secondary">
                      Create Manual Invoice
                    </ButtonLink>
                  </>
                )}
              </div>
            </header>
          </Card>
          {children}
        </div>
      </main>
    </div>
  );
}
