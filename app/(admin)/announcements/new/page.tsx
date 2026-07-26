import Link from "next/link";

import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { getLocations } from "@/lib/data";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function NewAnnouncementPage() {
  const db = getDb();
  const locations = getLocations();
  const occupied = db.units.filter((unit) => unit.status === "occupied" && unit.tenantId);

  const counts = {
    all: occupied.length,
    byLocation: Object.fromEntries(
      locations.map((location) => [location.id, occupied.filter((unit) => unit.locationId === location.id).length]),
    ),
  };

  return (
    <div className="space-y-6">
      <Link href="/announcements" className="inline-flex text-sm font-semibold text-accent hover:underline">
        ← Back to announcements
      </Link>
      <AnnouncementForm locations={locations.map(({ id, name }) => ({ id, name }))} counts={counts} />
    </div>
  );
}
