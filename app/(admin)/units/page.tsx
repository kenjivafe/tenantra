import { UnitsTable } from "@/components/units/units-table";
import { StatCard } from "@/components/ui/stat-card";
import { getProperties, getUnitBreakdown, getUnitRows } from "@/lib/data";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function UnitsPage() {
  const rows = getUnitRows();
  const properties = getProperties();
  const breakdown = getUnitBreakdown();
  const byStatus = Object.fromEntries(breakdown.items.map((item) => [item.status, item]));

  const potentialRent = rows.reduce((sum, unit) => sum + unit.rent, 0);
  const contractedRent = rows
    .filter((unit) => unit.status === "occupied")
    .reduce((sum, unit) => sum + unit.rent, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Units"
          value={formatNumber(breakdown.total)}
          hint={`${properties.length} properties`}
          badge="Total"
        />
        <StatCard
          label="Occupied"
          value={formatNumber(byStatus.occupied?.count ?? 0)}
          hint={`${formatPercent((byStatus.occupied?.share ?? 0) * 100, 0)} occupancy`}
          badge={formatPercent((byStatus.occupied?.share ?? 0) * 100, 0)}
          tone="success"
        />
        <StatCard
          label="Vacant"
          value={formatNumber(byStatus.vacant?.count ?? 0)}
          hint="Available for lease"
          badge={String(byStatus.vacant?.count ?? 0)}
          tone="warning"
        />
        <StatCard
          label="Under Maintenance"
          value={formatNumber(byStatus.maintenance?.count ?? 0)}
          hint="Temporarily unavailable"
          badge={String(byStatus.maintenance?.count ?? 0)}
          tone="danger"
        />
        <StatCard
          label="Reserved"
          value={formatNumber(byStatus.reserved?.count ?? 0)}
          hint="Pending move-in"
          badge={String(byStatus.reserved?.count ?? 0)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Contracted Monthly Rent"
          value={formatMoney(contractedRent)}
          hint="From currently occupied units"
          badge="Active"
          tone="success"
          padding="sm"
        />
        <StatCard
          label="Rent At Full Occupancy"
          value={formatMoney(potentialRent)}
          hint={`${formatMoney(potentialRent - contractedRent)} currently unrealised`}
          badge="Potential"
          padding="sm"
        />
      </section>

      <UnitsTable rows={rows} properties={properties.map(({ id, name }) => ({ id, name }))} />
    </div>
  );
}
