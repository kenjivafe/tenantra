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
    "/billing": db.bills.filter((bill) => effectiveStatus(bill, asOf) === "overdue").length,
    "/improvements": db.improvements.filter((item) => item.status === "pending").length,
  };

  return (
    <AdminShell adminName={settings.adminName} orgName={settings.orgName} badges={badges}>
      {children}
    </AdminShell>
  );
}
