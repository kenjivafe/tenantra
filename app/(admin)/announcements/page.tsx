import { AnnouncementsTable } from "@/components/announcements/announcements-table";
import { StatCard } from "@/components/ui/stat-card";
import { getAnnouncementRows } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AnnouncementsPage() {
  const rows = getAnnouncementRows();
  const sent = rows.filter((row) => row.status === "sent");
  const recipients = sent.reduce((sum, row) => sum + row.recipients, 0);
  const reads = sent.reduce((sum, row) => sum + row.reads, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={formatNumber(rows.length)} hint="All announcements" badge="All" />
        <StatCard label="Sent" value={formatNumber(sent.length)} hint={`${formatNumber(recipients)} recipients`} badge="Delivered" tone="success" />
        <StatCard
          label="Drafts"
          value={formatNumber(rows.filter((row) => row.status === "draft").length)}
          hint="Not yet published"
          badge="Draft"
          tone="warning"
        />
        <StatCard
          label="Average Read Rate"
          value={formatPercent(recipients === 0 ? 0 : (reads / recipients) * 100, 0)}
          hint={`${formatNumber(reads)} read receipts`}
          badge="Engagement"
        />
      </section>

      <AnnouncementsTable rows={rows} />
    </div>
  );
}
