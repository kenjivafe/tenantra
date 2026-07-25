import { AnnouncementsTable } from "@/components/announcements/announcements-table";
import { ChannelSettings } from "@/components/announcements/channel-settings";
import { StatCard } from "@/components/ui/stat-card";
import { getAnnouncementRows, getProperties, getSettings } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function AnnouncementsPage() {
  const rows = getAnnouncementRows();
  const properties = getProperties();
  const settings = getSettings();

  const sent = rows.filter((row) => row.status === "sent");
  const totalRecipients = sent.reduce((sum, row) => sum + row.recipients, 0);
  const totalReads = sent.reduce((sum, row) => sum + row.reads, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Announcements" value={formatNumber(rows.length)} hint="All time" badge="All" />
        <StatCard
          label="Sent"
          value={formatNumber(sent.length)}
          hint={`${formatNumber(totalRecipients)} recipients reached`}
          badge="Delivered"
          tone="success"
        />
        <StatCard
          label="Drafts"
          value={formatNumber(rows.filter((row) => row.status === "draft").length)}
          hint="Not yet published"
          badge="Draft"
          tone="warning"
        />
        <StatCard
          label="Average Read Rate"
          value={formatPercent(totalRecipients === 0 ? 0 : (totalReads / totalRecipients) * 100, 0)}
          hint={`${formatNumber(totalReads)} read receipts`}
          badge="Engagement"
        />
      </section>

      <AnnouncementsTable rows={rows} properties={properties.map(({ id, name }) => ({ id, name }))} />

      <ChannelSettings channels={settings.channels} />
    </div>
  );
}
