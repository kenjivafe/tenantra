import Link from "next/link";

import { BillingRunForm, type RunPreview } from "@/components/billing/billing-run-form";
import { currentPeriod, getPeriods, getProperties, getSettings } from "@/lib/data";
import { getDb } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Next month is offered so a cycle can be run ahead of time. */
function nextPeriod(period: string) {
  const [year, month] = period.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function BillingRunPage() {
  const db = getDb();
  const settings = getSettings();
  const properties = getProperties();
  const periods = [...getPeriods(3).slice(-3), nextPeriod(currentPeriod())];

  const preview: RunPreview = {};
  const scopes = ["all", ...properties.map((property) => property.id)];

  for (const period of periods) {
    const billed = new Set(db.invoices.filter((invoice) => invoice.period === period).map((invoice) => invoice.unitId));
    for (const scope of scopes) {
      const units = db.units.filter(
        (unit) =>
          unit.status === "occupied" &&
          unit.residentId !== null &&
          !billed.has(unit.id) &&
          (scope === "all" || unit.propertyId === scope),
      );
      preview[`${scope}|${period}`] = {
        units: units.length,
        rent: units.reduce((sum, unit) => sum + unit.rent, 0),
        dues: units.reduce((sum, unit) => sum + unit.dues, 0),
      };
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/billing" className="inline-flex text-sm font-semibold text-accent hover:underline">
        ← Back to billing
      </Link>
      <BillingRunForm
        periods={periods}
        properties={properties.map(({ id, name }) => ({ id, name }))}
        preview={preview}
        defaultPeriod={periods.at(-1) ?? currentPeriod()}
        defaultDueDay={settings.billingDueDay}
      />
    </div>
  );
}
