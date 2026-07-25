import { AuditTable } from "@/components/audit/audit-table";
import { StatCard } from "@/components/ui/stat-card";
import { getAuditLogs, getAuditStats } from "@/lib/data";
import { formatDateTime, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AuditLogsPage() {
  const logs = getAuditLogs(400);
  const stats = getAuditStats();

  const rows = logs.map((log) => ({
    id: log.id,
    at: log.at,
    timestamp: formatDateTime(log.at),
    actor: log.actor,
    action: log.action,
    module: log.module,
    description: log.description,
    ip: log.ip,
    success: log.success,
  }));

  return (
    <div className="space-y-6">
      <AuditTable rows={rows} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Activities (30 days)" value={formatNumber(stats.total30d)} padding="sm" />
        <StatCard label="Successful Actions" value={formatNumber(stats.successful)} tone="success" padding="sm" />
        <StatCard
          label="Failed Attempts"
          value={formatNumber(stats.failed)}
          tone={stats.failed > 0 ? "danger" : "success"}
          padding="sm"
        />
        <StatCard label="Active Users" value={formatNumber(stats.actors)} padding="sm" />
      </div>
    </div>
  );
}
