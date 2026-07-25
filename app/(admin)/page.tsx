import Link from "next/link";

import { BarChart, ChartLegend, DonutChart, LineChart } from "@/components/charts";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { getAuditLogs, getDashboardMetrics } from "@/lib/data";
import {
  formatDelta,
  formatMoney,
  formatMoneyCompact,
  formatNumber,
  formatPercent,
  formatPeriodShort,
  formatRelative,
} from "@/lib/format";

export const dynamic = "force-dynamic";

const UNIT_TONE: Record<string, string> = {
  occupied: "text-status-success",
  vacant: "text-accent",
  reserved: "text-status-warning",
  maintenance: "text-status-danger",
};

const UNIT_SWATCH: Record<string, string> = {
  occupied: "bg-status-success",
  vacant: "bg-accent",
  reserved: "bg-status-warning",
  maintenance: "bg-status-danger",
};

export default function AdminDashboardPage() {
  const metrics = getDashboardMetrics();
  const logs = getAuditLogs(60);

  const revenueData = metrics.series.map((entry) => ({
    label: formatPeriodShort(entry.period),
    bars: [
      { name: "Paid", value: entry.collected, className: "bg-status-success" },
      { name: "Due", value: Math.max(entry.outstanding - entry.overdue, 0), className: "bg-accent" },
      { name: "Overdue", value: entry.overdue, className: "bg-status-danger" },
    ],
  }));

  const occupancyPoints = metrics.occupancy.map((entry) => ({
    label: formatPeriodShort(entry.period),
    value: entry.rate,
  }));

  const occupancyStart = occupancyPoints[0]?.value ?? 0;
  const occupancyEnd = occupancyPoints[occupancyPoints.length - 1]?.value ?? 0;

  return (
    <>
      <section className="grid gap-6 px-3 py-2 md:grid-cols-2 md:gap-8 md:px-4">
        <div className="p-3 md:p-4">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-2xl font-semibold font-display">Monthly Revenue</h3>
            <Link href="/billing" className="text-xs font-semibold text-accent hover:underline">
              View billing →
            </Link>
          </div>
          <BarChart data={revenueData} height="h-32" formatValue={formatMoney} />
          <ChartLegend
            items={[
              { name: "Paid", className: "bg-status-success" },
              { name: "Due", className: "bg-accent" },
              { name: "Overdue", className: "bg-status-danger" },
            ]}
          />
        </div>

        <div className="p-3 md:p-4">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="text-2xl font-semibold font-display">Activity Timeline</h3>
            <Link href="/audit-logs" className="text-xs font-semibold text-accent hover:underline">
              All logs →
            </Link>
          </div>
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
        </div>
      </section>

      <div className="max-w-full overflow-x-hidden px-3 sm:px-4">
        <Card className="w-full bg-[#e9f5f3] p-4 shadow-inner sm:p-7" padding="md">
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Rent Collected (This Month)"
                value={formatMoneyCompact(metrics.collected)}
                hint={formatMoney(metrics.collected)}
                badge={formatDelta(metrics.collectedDelta)}
                tone={metrics.collectedDelta >= 0 ? "success" : "danger"}
                padding="sm"
              />
              <StatCard
                label="Overdue Amount"
                value={formatMoneyCompact(metrics.overdueAmount)}
                hint={`${metrics.overdueCount} overdue invoices`}
                badge={formatDelta(metrics.overdueDelta)}
                tone={metrics.overdueDelta > 0 ? "danger" : "success"}
                padding="sm"
              />
              <StatCard
                label="Collection Rate %"
                value={formatPercent(metrics.collectionRate)}
                hint="Current billing period"
                badge={`${metrics.collectionRateDelta >= 0 ? "+" : ""}${metrics.collectionRateDelta.toFixed(1)} pts`}
                tone={metrics.collectionRateDelta >= 0 ? "success" : "danger"}
                padding="sm"
              />
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Total Units"
                value={formatNumber(metrics.totalUnits)}
                badge="All"
                padding="sm"
              />
              <StatCard
                label="Occupied Units"
                value={formatNumber(metrics.occupiedUnits)}
                badge={formatPercent(metrics.occupancyRate, 0)}
                tone="success"
                padding="sm"
              />
              <StatCard
                label="Units Under Maintenance"
                value={formatNumber(metrics.maintenanceUnits)}
                badge={`${metrics.vacantUnits} vacant`}
                tone="warning"
                padding="sm"
              />
              <StatCard
                label="Active Leases"
                value={formatNumber(metrics.activeLeases)}
                badge={`${metrics.expiringLeases} expiring`}
                tone={metrics.expiringLeases > 0 ? "warning" : "success"}
                padding="sm"
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="bg-panel" padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold font-display text-text-primary">Unit Status Overview</h2>
                    <p className="mt-1 text-sm text-text-muted">Current unit distribution across all properties</p>
                  </div>
                  <Badge variant="subtle">Live</Badge>
                </div>
                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <DonutChart
                    segments={metrics.breakdown.items.map((item) => ({
                      label: item.label,
                      value: item.count,
                      className: UNIT_TONE[item.status],
                    }))}
                    centerValue={formatNumber(metrics.breakdown.total)}
                    centerLabel="Total Units"
                  />
                  <div className="grid flex-1 gap-3">
                    {metrics.breakdown.items.map((item) => (
                      <div key={item.status} className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded ${UNIT_SWATCH[item.status]}`} />
                        <span className="text-sm text-text-secondary">{item.label}</span>
                        <span className="ml-auto text-sm font-semibold text-text-primary">
                          {formatNumber(item.count)} ({Math.round(item.share * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-panel" padding="md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold font-display text-text-primary">Occupancy Trend</h2>
                    <p className="mt-1 text-sm text-text-muted">6-month billed-occupancy performance</p>
                  </div>
                  <Badge variant="subtle">Live</Badge>
                </div>
                <div className="mt-6">
                  <LineChart points={occupancyPoints} suffix="%" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-accent" />
                      <span className="text-xs text-text-muted">Occupancy Rate</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-primary">
                        {formatPercent(occupancyStart, 0)} → {formatPercent(occupancyEnd, 0)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {occupancyEnd >= occupancyStart ? "+" : ""}
                        {(occupancyEnd - occupancyStart).toFixed(1)} pts over 6 months
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Link href="/facilities" className="block">
                <StatCard
                  label="Pending Booking Approvals"
                  value={formatNumber(metrics.pendingApprovals)}
                  hint="Require review"
                  badge="Review"
                  tone={metrics.pendingApprovals > 0 ? "warning" : "success"}
                  padding="sm"
                  className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
                />
              </Link>
              <Link href="/facilities" className="block">
                <StatCard
                  label="Upcoming Bookings"
                  value={formatNumber(metrics.upcomingBookings)}
                  hint="Approved, not yet held"
                  badge="Scheduled"
                  tone="success"
                  padding="sm"
                  className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
                />
              </Link>
              <Link href="/billing" className="block">
                <StatCard
                  label="Outstanding This Period"
                  value={formatMoneyCompact(metrics.series[metrics.series.length - 1]?.outstanding ?? 0)}
                  hint="Unpaid across all properties"
                  badge="Collect"
                  tone="danger"
                  padding="sm"
                  className="h-full transition hover:-translate-y-[1px] hover:shadow-lg"
                />
              </Link>
            </section>
          </div>
        </Card>
      </div>
    </>
  );
}
