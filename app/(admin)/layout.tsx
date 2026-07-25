import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin-shell";
import { effectiveStatus, getSettings, today } from "@/lib/data";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const db = getDb();
  const settings = getSettings();
  const asOf = today();

  const badges = {
    "/billing": db.invoices.filter((invoice) => effectiveStatus(invoice, asOf) === "overdue").length,
    "/facilities": db.bookings.filter((booking) => booking.status === "pending").length,
    "/residents": db.residents.filter((resident) => resident.status === "pending").length,
  };

  return (
    <AdminShell adminName={settings.adminName} orgName={settings.orgName} badges={badges}>
      {children}
    </AdminShell>
  );
}
