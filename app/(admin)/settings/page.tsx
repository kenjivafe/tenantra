import { SettingsForm } from "@/components/settings/settings-form";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return <SettingsForm settings={getSettings()} />;
}
