import { ImprovementsBoard } from "@/components/improvements/improvements-board";
import { StatCard } from "@/components/ui/stat-card";
import { getImprovementRows } from "@/lib/data";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function ImprovementsPage() {
  const rows = getImprovementRows();
  const pending = rows.filter((row) => row.status === "pending");
  const approved = rows.filter((row) => row.status === "approved");
  const committed = rows
    .filter((row) => row.status === "approved" || row.status === "completed")
    .reduce((sum, row) => sum + row.estimatedCost, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Requests" value={formatNumber(rows.length)} hint="All time" badge="All" />
        <StatCard
          label="Awaiting Decision"
          value={formatNumber(pending.length)}
          hint="Owner review needed"
          badge={String(pending.length)}
          tone={pending.length > 0 ? "warning" : "success"}
        />
        <StatCard label="Approved / In Progress" value={formatNumber(approved.length)} hint="Cleared to proceed" badge="Approved" tone="success" />
        <StatCard label="Approved Spend" value={formatMoney(committed)} hint="Estimated cost of approved work" badge="Est." />
      </section>

      <ImprovementsBoard rows={rows} />
    </div>
  );
}
