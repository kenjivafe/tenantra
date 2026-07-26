import { SettingsForm } from "@/components/settings/settings-form";
import { getLocations, getSettings } from "@/lib/data";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const db = getDb();
  const locations = getLocations().map((location) => ({
    ...location,
    units: db.units.filter((unit) => unit.locationId === location.id).length,
  }));

  return <SettingsForm settings={getSettings()} locations={locations} />;
}
