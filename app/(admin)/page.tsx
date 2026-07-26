import Link from "next/link";

import { BarChart, ChartLegend } from "@/components/charts";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { getAuditLogs, getDashboardMetrics } from "@/lib/data";
import {
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
  formatPercent,
  formatPeriod,
  formatPeriodShort,
  formatRelative,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const m = getDashboardMetrics();
  const logs = getAuditLogs(40);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/units" className="block">
          <StatCard
            label="Occupied Units"
            value={`${formatNumber(m.occupiedUnits)} / ${formatNumber(m.totalUnits)}`}
            hint={`${formatPercent(m.occupancyRate, 0)} occupancy · ${m.vacantUnits} vacant`}
            badge={formatPercent(m.occupancyRate, 0)}
            tone="success"
            className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
          />
        </Link>
        <Link href="/tenants" className="block">
          <StatCard
            label="Active Tenants"
            value={formatNumber(m.totalTenants)}
            hint={`${m.overdueTenants} with overdue balance`}
            badge={m.overdueTenants > 0 ? `${m.overdueTenants} overdue` : "All current"}
            tone={m.overdueTenants > 0 ? "warning" : "success"}
            className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
          />
        </Link>
        <Link href="/billing" className="block">
          <StatCard
            label={`Collected (${formatPeriodShort(m.currentPeriod)})`}
            value={formatMoneyCompact(m.collected)}
            hint={`${formatMoney(m.billed)} billed · ${formatPercent(m.collectionRate, 0)} rate`}
            badge={formatPercent(m.collectionRate, 0)}
            tone="success"
            className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
          />
        </Link>
        <Link href="/billing" className="block">
          <StatCard
            label="Outstanding This Month"
            value={formatMoneyCompact(m.outstanding)}
            hint={`${m.overdueCount} overdue bills`}
            badge={`${m.overdueCount}`}
            tone="danger"
            className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
          />
        </Link>
      </section>

      {(m.bouncedCheques > 0 || m.pendingImprovements > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {m.bouncedCheques > 0 ? (
            <Card className="border border-status-danger/30 bg-status-danger/5" padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{m.bouncedCheques} bounced cheque(s)</p>
                  <p className="text-sm text-text-muted">Follow up on failed post-dated cheques.</p>
                </div>
                <Link href="/billing?tab=cheques" className="text-sm font-semibold text-accent hover:underline">
                  Review →
                </Link>
              </div>
            </Card>
          ) : null}
          {m.pendingImprovements > 0 ? (
            <Card className="border border-status-warning/30 bg-status-warning/5" padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{m.pendingImprovements} improvement request(s)</p>
                  <p className="text-sm text-text-muted">Tenants are waiting for the owner&apos;s decision.</p>
                </div>
                <Link href="/improvements" className="text-sm font-semibold text-accent hover:underline">
                  Review →
                </Link>
              </div>
            </Card>
          ) : null}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Collections — last 6 months</h3>
          <BarChart
            height="h-44"
            formatValue={formatMoney}
            data={m.series.map((entry) => ({
              label: formatPeriodShort(entry.period),
              bars: [
                { name: "Collected", value: entry.collected, className: "bg-status-success" },
                { name: "Outstanding", value: entry.outstanding, className: "bg-status-danger" },
              ],
            }))}
          />
          <ChartLegend
            items={[
              { name: "Collected", className: "bg-status-success" },
              { name: "Outstanding", className: "bg-status-danger" },
            ]}
          />
        </Card>

        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">
            Upcoming &amp; overdue dues
          </h3>
          <TableShell className="min-w-0">
            <thead>
              <tr className="border-b border-border/40">
                <Th>Tenant</Th>
                <Th>Unit</Th>
                <Th>Due</Th>
                <Th>Amount</Th>
              </tr>
            </thead>
            <tbody>
              {m.upcomingDues.length === 0 ? (
                <EmptyRow colSpan={4} message="No outstanding dues — everyone is paid up." />
              ) : (
                m.upcomingDues.map((due) => (
                  <tr key={due.id} className="border-b border-border/20">
                    <Td className="font-medium">{due.tenantName}</Td>
                    <Td>{due.unitCode}</Td>
                    <Td>{formatDate(due.dueDate)}</Td>
                    <Td className="font-semibold">{formatMoney(due.amount)}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableShell>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">
            By location ({formatPeriod(m.currentPeriod)})
          </h3>
          <TableShell className="min-w-0">
            <thead>
              <tr className="border-b border-border/40">
                <Th>Location</Th>
                <Th>Occupied</Th>
                <Th>Billed</Th>
                <Th>Collected</Th>
              </tr>
            </thead>
            <tbody>
              {m.byLocation.map((location) => (
                <tr key={location.name} className="border-b border-border/20">
                  <Td className="font-medium">{location.name}</Td>
                  <Td>
                    {location.occupied}/{location.units}
                  </Td>
                  <Td>{formatMoney(location.billed)}</Td>
                  <Td className="text-status-success">{formatMoney(location.collected)}</Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card className="bg-panel" padding="md">
          <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Recent activity</h3>
          <ActivityTimeline
            items={logs.map((log) => ({
              id: log.id,
              relative: formatRelative(log.at),
              module: log.module,
              description: log.description,
              actor: log.actor,
              action: log.action,
              success: log.success,
            }))}
          />
        </Card>
      </section>
    </div>
  );
}
