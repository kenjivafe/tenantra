import { BarChart, ChartLegend, DonutChart } from "@/components/charts";
import { BillingTable } from "@/components/billing/billing-table";
import { BulkReminder } from "@/components/billing/bulk-reminder";
import { PeriodSelect } from "@/components/billing/period-select";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { currentPeriod, getInvoiceRows, getPeriods, getPeriodSeries, getProperties, summarisePeriod } from "@/lib/data";
import { formatMoney, formatPercent, formatPeriod, formatPeriodShort } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const periods = getPeriods(6);
  const period = params.period && periods.includes(params.period) ? params.period : (periods.at(-1) ?? currentPeriod());

  const summary = summarisePeriod(period);
  const rows = getInvoiceRows(period);
  const properties = getProperties();
  const series = getPeriodSeries(6);

  const overdueRows = rows.filter((row) => row.status === "overdue");
  const upcoming = rows.filter((row) => row.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelect periods={periods} value={period} />
          <span className="text-sm text-text-muted">
            {summary.invoiceCount} invoices issued for {formatPeriod(period)}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/billing/run">Run Billing Cycle</ButtonLink>
          <ButtonLink href="/billing/create" variant="secondary">
            Create Manual Invoice
          </ButtonLink>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Billed"
          value={formatMoney(summary.billed)}
          hint={`${summary.invoiceCount} invoices`}
          badge={formatPeriodShort(period)}
        />
        <StatCard
          label="Collected"
          value={formatMoney(summary.collected)}
          hint={`${summary.paidCount} invoices settled`}
          badge={formatPercent(summary.collectionRate, 0)}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.outstanding)}
          hint={`${summary.overdueCount} overdue invoices`}
          badge={String(summary.overdueCount)}
          tone="danger"
        />
        <StatCard
          label="Upcoming Due"
          value={formatMoney(upcoming.reduce((sum, row) => sum + row.amount, 0))}
          hint={`${upcoming.length} tenants not yet due`}
          badge="Pending"
          tone="warning"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Collections Overview</h3>
          <BarChart
            height="h-48"
            formatValue={formatMoney}
            data={series.map((entry) => ({
              label: formatPeriodShort(entry.period),
              bars: [
                { name: "Total Billed", value: entry.billed, className: "bg-border/30" },
                { name: "Paid", value: entry.collected, className: "bg-status-success" },
                { name: "Overdue", value: entry.overdue, className: "bg-status-danger" },
              ],
            }))}
          />
          <ChartLegend
            items={[
              { name: "Total Billed", className: "bg-border/30" },
              { name: "Paid", className: "bg-status-success" },
              { name: "Overdue", className: "bg-status-danger" },
            ]}
          />
        </Card>

        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Collection Rate</h3>
          <div className="flex h-48 items-center justify-center">
            <DonutChart
              segments={[
                { label: "Collected", value: summary.collected, className: "text-status-success" },
                { label: "Overdue", value: summary.overdue, className: "text-status-danger" },
                {
                  label: "Not yet due",
                  value: Math.max(summary.outstanding - summary.overdue, 0),
                  className: "text-accent",
                },
              ]}
              centerValue={formatPercent(summary.collectionRate, 0)}
              centerLabel="Collected"
            />
          </div>
          <ChartLegend
            items={[
              { name: "Collected", className: "bg-status-success" },
              { name: "Overdue", className: "bg-status-danger" },
              { name: "Not yet due", className: "bg-accent" },
            ]}
          />
        </Card>
      </section>

      <BillingTable rows={rows} properties={properties.map(({ id, name }) => ({ id, name }))} />

      <BulkReminder
        period={period}
        count={overdueRows.length}
        amount={overdueRows.reduce((sum, row) => sum + row.amount, 0)}
      />
    </div>
  );
}
