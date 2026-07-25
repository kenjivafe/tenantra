"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { CustomSelect } from "@/components/ui/select";
import { formatPeriod } from "@/lib/format";

export function PeriodSelect({ periods, value }: { periods: string[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <CustomSelect
      aria-label="Billing period"
      value={value}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value;
        startTransition(() => router.push(`${pathname}?period=${next}`));
      }}
    >
      {periods.map((period) => (
        <option key={period} value={period}>
          {formatPeriod(period)}
        </option>
      ))}
    </CustomSelect>
  );
}
