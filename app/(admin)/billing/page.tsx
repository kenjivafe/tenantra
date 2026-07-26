import { BillingView } from "@/components/billing/billing-view";
import { StatCard } from "@/components/ui/stat-card";
import { currentPeriod, getBillRows, getChequeRows, getLocations, getPeriods, getTenantRows, summarisePeriod } from "@/lib/data";
import { formatMoney, formatPercent, formatPeriod } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const periods = getPeriods(6).slice(-6);
  const period = params.period && periods.includes(params.period) ? params.period : (periods.at(-1) ?? currentPeriod());
  const initialTab = params.tab === "cheques" ? "cheques" : "bills";

  const summary = summarisePeriod(period);
  const bills = getBillRows(period);
  const cheques = getChequeRows();
  const locations = getLocations();
  const tenants = getTenantRows()
    .filter((tenant) => tenant.status !== "ended" && tenant.unitId)
    .map((tenant) => ({ id: tenant.id, name: tenant.name, unitCode: tenant.unitCode ?? "—", rent: tenant.monthlyRent }));

  const bounced = cheques.filter((cheque) => cheque.status === "bounced").length;
  const collectionRate = summary.billed ? (summary.collected / summary.billed) * 100 : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Billed (${formatPeriod(period)})`} value={formatMoney(summary.billed)} hint="Rent + utilities" badge="Total" />
        <StatCard
          label="Collected"
          value={formatMoney(summary.collected)}
          hint={`${formatPercent(collectionRate, 0)} collection rate`}
          badge={formatPercent(collectionRate, 0)}
          tone="success"
        />
        <StatCard label="Outstanding" value={formatMoney(summary.outstanding)} hint="Unpaid this period" badge="Due" tone="warning" />
        <StatCard
          label="Bounced Cheques"
          value={String(bounced)}
          hint="Across all periods"
          badge={String(bounced)}
          tone={bounced > 0 ? "danger" : "success"}
        />
      </section>

      <BillingView
        bills={bills}
        cheques={cheques}
        tenants={tenants}
        locations={locations.map(({ id, name }) => ({ id, name }))}
        periods={periods}
        period={period}
        initialTab={initialTab}
      />
    </div>
  );
}
