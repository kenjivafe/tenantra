import Link from "next/link";

import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { getProperties, getSettings } from "@/lib/data";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function NewAnnouncementPage() {
  const db = getDb();
  const properties = getProperties();
  const settings = getSettings();

  const occupied = db.units.filter((unit) => unit.status === "occupied" && unit.residentId);
  const counts = {
    all: occupied.length,
    byProperty: Object.fromEntries(
      properties.map((property) => [
        property.id,
        occupied.filter((unit) => unit.propertyId === property.id).length,
      ]),
    ),
  };

  return (
    <div className="space-y-6">
      <Link href="/announcements" className="inline-flex text-sm font-semibold text-accent hover:underline">
        ← Back to announcements
      </Link>
      <AnnouncementForm
        properties={properties.map(({ id, name }) => ({ id, name }))}
        counts={counts}
        defaultChannels={settings.channels}
      />
    </div>
  );
}
