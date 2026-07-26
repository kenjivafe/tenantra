import { UnitsTable } from "@/components/units/units-table";
import { StatCard } from "@/components/ui/stat-card";
import { getLocations, getUnitRows } from "@/lib/data";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function UnitsPage() {
  const rows = getUnitRows();
  const locations = getLocations();

  const occupied = rows.filter((row) => row.status === "occupied");
  const vacant = rows.filter((row) => row.status === "vacant");
  const contracted = occupied.reduce((sum, row) => sum + row.rent, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Units" value={formatNumber(rows.length)} hint={`${locations.length} locations`} badge="All" />
        <StatCard
          label="Occupied"
          value={formatNumber(occupied.length)}
          hint={`${rows.filter((r) => r.category === "commercial").length} commercial · ${rows.filter((r) => r.category === "residential").length} residential`}
          badge="Leased"
          tone="success"
        />
        <StatCard label="Vacant" value={formatNumber(vacant.length)} hint="Available to lease" badge={String(vacant.length)} tone="warning" />
        <StatCard label="Contracted Rent / mo" value={formatMoney(contracted)} hint="From occupied units" badge="Monthly" tone="success" />
      </section>

      <UnitsTable rows={rows} locations={locations.map(({ id, name }) => ({ id, name }))} />
    </div>
  );
}
