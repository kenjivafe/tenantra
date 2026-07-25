import Link from "next/link";

import { InvoiceForm } from "@/components/billing/invoice-form";
import { currentPeriod, getPeriods, getSettings, getUnitRows } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function CreateInvoicePage() {
  const settings = getSettings();
  const period = currentPeriod();
  const periods = Array.from(new Set([...getPeriods(6), period])).sort();

  const units = getUnitRows()
    .filter((unit) => unit.status !== "maintenance")
    .map((unit) => ({
      id: unit.id,
      code: unit.code,
      propertyName: unit.propertyName,
      residentName: unit.residentName,
      rent: unit.rent,
      dues: unit.dues,
    }));

  const dueDate = `${period}-${String(settings.billingDueDay).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <Link href="/billing" className="inline-flex text-sm font-semibold text-accent hover:underline">
        ← Back to billing
      </Link>
      <InvoiceForm units={units} periods={periods} defaultPeriod={period} defaultDueDate={dueDate} />
    </div>
  );
}
