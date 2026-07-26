import Link from "next/link";

import { TenantForm } from "@/components/tenants/tenant-form";
import { getUnitRows, today } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function NewTenantPage() {
  const units = getUnitRows()
    .filter((unit) => unit.status === "vacant")
    .map((unit) => ({
      id: unit.id,
      code: unit.code,
      locationName: unit.locationName,
      category: unit.category,
      tenancy: unit.tenancy,
      rent: unit.rent,
      owner: unit.owner,
    }));

  return (
    <div className="space-y-6">
      <Link href="/tenants" className="inline-flex text-sm font-semibold text-accent hover:underline">
        ← Back to tenants
      </Link>
      <TenantForm units={units} today={today()} />
    </div>
  );
}
