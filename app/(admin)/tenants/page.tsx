import { TenantsTable } from "@/components/tenants/tenants-table";
import { StatCard } from "@/components/ui/stat-card";
import { getLocations, getTenantRows } from "@/lib/data";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function TenantsPage() {
  const rows = getTenantRows();
  const locations = getLocations();

  const active = rows.filter((row) => row.status !== "ended");
  const overdue = rows.filter((row) => row.status === "overdue");
  const outstanding = rows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Tenants" value={formatNumber(active.length)} hint="Currently leasing" badge="Active" tone="success" />
        <StatCard
          label="Overdue Tenants"
          value={formatNumber(overdue.length)}
          hint="Have an unpaid, past-due bill"
          badge={String(overdue.length)}
          tone={overdue.length > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Total Outstanding"
          value={formatMoney(outstanding)}
          hint={`${rows.filter((row) => row.balance > 0).length} tenants with a balance`}
          badge="Balance"
          tone="warning"
        />
        <StatCard label="Locations" value={formatNumber(locations.length)} hint={locations.map((l) => l.name).join(", ")} badge="Sites" />
      </section>

      <TenantsTable rows={rows} locations={locations.map(({ id, name }) => ({ id, name }))} />
    </div>
  );
}
