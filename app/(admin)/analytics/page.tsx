import { BarChart, ChartLegend, DonutChart, LineChart } from "@/components/charts";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TableShell, Td, Th, EmptyRow } from "@/components/ui/table";
import { getAnalytics } from "@/lib/data";
import { formatMoney, formatNumber, formatPercent, formatPeriod, formatPeriodShort } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const data = getAnalytics();
  const current = data.series[data.series.length - 1];
  const previous = data.series[data.series.length - 2] ?? current;
  const revenueDelta =
    previous.billed === 0 ? 0 : ((current.billed - previous.billed) / previous.billed) * 100;

  const occupancyPoints = data.occupancy.map((entry) => ({
    label: formatPeriodShort(entry.period),
    value: entry.rate,
  }));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Billed This Period"
          value={formatMoney(current.billed)}
          hint={formatPeriod(current.period)}
          badge={`${revenueDelta >= 0 ? "+" : ""}${revenueDelta.toFixed(1)}%`}
          tone={revenueDelta >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Collection Rate"
          value={formatPercent(current.collectionRate)}
          hint={`${current.paidCount} of ${current.invoiceCount} invoices settled`}
          badge={current.collectionRate >= 85 ? "Healthy" : "Watch"}
          tone={current.collectionRate >= 85 ? "success" : "warning"}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(current.outstanding)}
          hint={`${current.overdueCount} overdue invoices`}
          badge={formatMoney(current.overdue)}
          tone="danger"
        />
        <StatCard
          label="Occupancy"
          value={formatPercent(occupancyPoints[occupancyPoints.length - 1]?.value ?? 0, 1)}
          hint="Share of units billed this period"
          badge="Live"
          tone="success"
        />
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold font-display text-text-primary">Financial Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Billed vs Collected</h3>
            <BarChart
              height="h-48"
              formatValue={formatMoney}
              data={data.series.map((entry) => ({
                label: formatPeriodShort(entry.period),
                bars: [
                  { name: "Billed", value: entry.billed, className: "bg-border/30" },
                  { name: "Collected", value: entry.collected, className: "bg-status-success" },
                ],
              }))}
            />
            <ChartLegend
              items={[
                { name: "Billed", className: "bg-border/30" },
                { name: "Collected", className: "bg-status-success" },
              ]}
            />
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Collection Rate</h3>
            <div className="flex h-48 items-center justify-center">
              <DonutChart
                segments={[
                  { label: "Collected", value: current.collected, className: "text-status-success" },
                  { label: "Outstanding", value: current.outstanding, className: "text-status-danger" },
                ]}
                centerValue={formatPercent(current.collectionRate, 0)}
                centerLabel="Collected"
              />
            </div>
            <p className="mt-4 text-center text-sm text-text-muted">
              {current.collectionRate >= 85
                ? "Above the 85% industry benchmark."
                : "Below the 85% industry benchmark — prioritise overdue follow-ups."}
            </p>
          </Card>
        </div>

        <Card className="mt-6 bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Outstanding Trend</h3>
          <BarChart
            height="h-32"
            formatValue={formatMoney}
            data={data.series.map((entry) => ({
              label: formatPeriodShort(entry.period),
              bars: [{ name: "Outstanding", value: entry.outstanding, className: "bg-status-danger" }],
            }))}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold font-display text-text-primary">Operational Insights</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Occupancy Trend</h3>
            <LineChart points={occupancyPoints} suffix="%" />
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Collections by Property</h3>
            <TableShell className="min-w-0">
              <thead>
                <tr className="border-b border-border/40">
                  <Th>Property</Th>
                  <Th>Billed</Th>
                  <Th>Collected</Th>
                  <Th>Rate</Th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByProperty.map((row) => (
                  <tr key={row.name} className="border-b border-border/20">
                    <Td className="font-medium">{row.name}</Td>
                    <Td>{formatMoney(row.billed)}</Td>
                    <Td>{formatMoney(row.collected)}</Td>
                    <Td className={row.rate >= 85 ? "text-status-success" : "text-status-warning"}>
                      {formatPercent(row.rate, 0)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Top Outstanding Accounts</h3>
            <TableShell className="min-w-0">
              <thead>
                <tr className="border-b border-border/40">
                  <Th>Resident</Th>
                  <Th>Unit</Th>
                  <Th>Invoices</Th>
                  <Th>Amount</Th>
                </tr>
              </thead>
              <tbody>
                {data.topOverdue.length === 0 ? (
                  <EmptyRow colSpan={4} message="No overdue accounts — collections are current." />
                ) : (
                  data.topOverdue.map((row) => (
                    <tr key={`${row.residentName}-${row.unitCode}`} className="border-b border-border/20">
                      <Td className="font-medium">{row.residentName}</Td>
                      <Td>
                        {row.unitCode}
                        <span className="block text-xs text-text-muted">{row.propertyName}</span>
                      </Td>
                      <Td>{row.invoices}</Td>
                      <Td className="font-semibold text-status-danger">{formatMoney(row.amount)}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableShell>
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Facility Utilisation</h3>
            <TableShell className="min-w-0">
              <thead>
                <tr className="border-b border-border/40">
                  <Th>Facility</Th>
                  <Th>Property</Th>
                  <Th>Bookings</Th>
                  <Th>Fees</Th>
                </tr>
              </thead>
              <tbody>
                {data.facilityUsage.map((row) => (
                  <tr key={`${row.name}-${row.propertyName}`} className="border-b border-border/20">
                    <Td className="font-medium">{row.name}</Td>
                    <Td>{row.propertyName}</Td>
                    <Td>{row.bookings}</Td>
                    <Td>{formatMoney(row.revenue)}</Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Unit Mix</h3>
          <TableShell className="min-w-0">
            <thead>
              <tr className="border-b border-border/40">
                <Th>Type</Th>
                <Th>Units</Th>
                <Th>Average Rent</Th>
              </tr>
            </thead>
            <tbody>
              {data.unitMix.map((row) => (
                <tr key={row.type} className="border-b border-border/20">
                  <Td className="font-medium">{row.type}</Td>
                  <Td>{formatNumber(row.count)}</Td>
                  <Td>{formatMoney(row.averageRent)}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Announcement Engagement</h3>
          <TableShell className="min-w-0">
            <thead>
              <tr className="border-b border-border/40">
                <Th>Announcement</Th>
                <Th>Reach</Th>
                <Th>Read Rate</Th>
              </tr>
            </thead>
            <tbody>
              {data.announcementEngagement.length === 0 ? (
                <EmptyRow colSpan={3} message="No announcements have been sent yet." />
              ) : (
                data.announcementEngagement.map((row) => (
                  <tr key={row.title} className="border-b border-border/20">
                    <Td className="font-medium">{row.title}</Td>
                    <Td>{formatNumber(row.recipients)}</Td>
                    <Td>{formatPercent(row.rate, 0)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableShell>
        </Card>
      </section>
    </div>
  );
}
