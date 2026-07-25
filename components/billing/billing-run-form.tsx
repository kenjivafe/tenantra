"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Field, SelectField, SubmitButton, TextField } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { runBillingCycleAction } from "@/lib/actions/billing";
import { formatMoney, formatPeriod } from "@/lib/format";

export type RunPreview = Record<string, { units: number; rent: number; dues: number }>;

export function BillingRunForm({
  periods,
  properties,
  preview,
  defaultPeriod,
  defaultDueDay,
}: {
  periods: string[];
  properties: Array<{ id: string; name: string }>;
  preview: RunPreview;
  defaultPeriod: string;
  defaultDueDay: number;
}) {
  const router = useRouter();
  const [state, action] = useActionState(runBillingCycleAction, null);
  const [period, setPeriod] = useState(defaultPeriod);
  const [propertyId, setPropertyId] = useState("all");
  const [includeDues, setIncludeDues] = useState(true);
  const [includeParking, setIncludeParking] = useState(false);
  const [parkingFee, setParkingFee] = useState(1500);

  useActionToast(state, () => router.push("/billing"));

  const entry = preview[`${propertyId}|${period}`] ?? { units: 0, rent: 0, dues: 0 };
  const estimate =
    entry.rent + (includeDues ? entry.dues : 0) + (includeParking ? entry.units * (parkingFee || 0) : 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card className="bg-panel" padding="md">
        <form action={action} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Billing period">
              <SelectField name="period" value={period} onChange={(event) => setPeriod(event.target.value)}>
                {periods.map((option) => (
                  <option key={option} value={option}>
                    {formatPeriod(option)}
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field label="Property scope">
              <SelectField name="propertyId" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
                <option value="all">All properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field label="Due day of month" hint="Invoices fall due on this day of the billing month.">
              <TextField name="dueDay" type="number" min="1" max="28" defaultValue={defaultDueDay} required />
            </Field>

            <Field label="Parking fee" hint="Applied only when parking is included.">
              <TextField
                name="parkingFee"
                type="number"
                min="0"
                step="50"
                value={parkingFee}
                onChange={(event) => setParkingFee(Number(event.target.value))}
                disabled={!includeParking}
              />
            </Field>
          </div>

          <div className="grid gap-3 rounded-card border border-border/50 p-4">
            <label className="flex items-center gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={includeDues}
                onChange={(event) => setIncludeDues(event.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-accent)]"
              />
              Include association dues
            </label>
            <label className="flex items-center gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={includeParking}
                onChange={(event) => setIncludeParking(event.target.checked)}
                className="h-4 w-4 accent-[color:var(--color-accent)]"
              />
              Include parking slot charge
            </label>
          </div>

          <input type="hidden" name="includeDues" value={String(includeDues)} />
          <input type="hidden" name="includeParking" value={String(includeParking)} />

          <div className="flex flex-wrap justify-end gap-3">
            <SubmitButton pendingLabel="Generating invoices…" {...(entry.units === 0 ? { disabled: true } : {})}>
              Generate {entry.units} invoice{entry.units === 1 ? "" : "s"}
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card className="bg-[#e9f5f3]" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">Run preview</h3>
        <p className="mt-1 text-sm text-text-muted">
          Units that already have an invoice for {formatPeriod(period)} are skipped automatically.
        </p>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex justify-between border-b border-border/30 pb-2">
            <dt className="text-text-muted">Eligible occupied units</dt>
            <dd className="font-semibold text-text-primary">{entry.units}</dd>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <dt className="text-text-muted">Rent subtotal</dt>
            <dd className="font-semibold text-text-primary">{formatMoney(entry.rent)}</dd>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <dt className="text-text-muted">Association dues</dt>
            <dd className="font-semibold text-text-primary">
              {includeDues ? formatMoney(entry.dues) : "Excluded"}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border/30 pb-2">
            <dt className="text-text-muted">Parking</dt>
            <dd className="font-semibold text-text-primary">
              {includeParking ? formatMoney(entry.units * (parkingFee || 0)) : "Excluded"}
            </dd>
          </div>
          <div className="flex justify-between pt-1 text-base">
            <dt className="font-semibold text-text-primary">Estimated total</dt>
            <dd className="font-semibold text-text-primary">{formatMoney(estimate)}</dd>
          </div>
        </dl>

        {entry.units === 0 ? (
          <p className="mt-5 rounded-card bg-status-warning/15 px-4 py-3 text-sm text-text-secondary">
            Every eligible unit in this scope already has an invoice for {formatPeriod(period)}.
          </p>
        ) : null}
      </Card>
    </div>
  );
}
