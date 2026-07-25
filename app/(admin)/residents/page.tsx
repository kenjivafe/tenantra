import { ResidentsTable } from "@/components/residents/residents-table";
import { StatCard } from "@/components/ui/stat-card";
import { getResidentRows, getUnitRows, today } from "@/lib/data";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function ResidentsPage() {
  const rows = getResidentRows();
  const vacantUnits = getUnitRows()
    .filter((unit) => unit.status === "vacant" || (unit.status === "reserved" && !unit.residentId))
    .map((unit) => ({ id: unit.id, label: `${unit.propertyName} · Unit ${unit.code} — ${formatMoney(unit.rent)}/mo` }));

  const active = rows.filter((row) => row.status === "active" || row.status === "expiring");
  const outstanding = rows.reduce((sum, row) => sum + row.balance, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Tenants"
          value={formatNumber(active.length)}
          hint="Currently leased"
          badge={String(active.length)}
          tone="success"
        />
        <StatCard
          label="Pending Applications"
          value={formatNumber(rows.filter((row) => row.status === "pending").length)}
          hint="Awaiting approval"
          badge="Review"
          tone="warning"
        />
        <StatCard
          label="Expiring Leases"
          value={formatNumber(rows.filter((row) => row.status === "expiring").length)}
          hint="Within 30 days"
          badge="Renew"
          tone="danger"
        />
        <StatCard
          label="Outstanding Balances"
          value={formatMoney(outstanding)}
          hint={`${rows.filter((row) => row.balance > 0).length} residents with a balance`}
          badge={String(rows.filter((row) => row.status === "blacklisted").length) + " blacklisted"}
        />
      </section>

      <ResidentsTable rows={rows} vacantUnits={vacantUnits} today={today()} />
    </div>
  );
}
