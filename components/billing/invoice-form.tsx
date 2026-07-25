"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { createInvoiceAction } from "@/lib/actions/billing";
import { formatMoney, formatPeriod } from "@/lib/format";

export type BillableUnit = {
  id: string;
  code: string;
  propertyName: string;
  residentName: string | null;
  rent: number;
  dues: number;
};

type Line = { id: number; label: string; amount: string };

export function InvoiceForm({
  units,
  periods,
  defaultPeriod,
  defaultDueDate,
}: {
  units: BillableUnit[];
  periods: string[];
  defaultPeriod: string;
  defaultDueDate: string;
}) {
  const router = useRouter();
  const [state, action] = useActionState(createInvoiceAction, null);
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [lines, setLines] = useState<Line[]>([{ id: 1, label: "Monthly rent", amount: "" }]);
  const [nextLineId, setNextLineId] = useState(2);

  useActionToast(state, () => router.push("/billing"));

  const unit = useMemo(() => units.find((item) => item.id === unitId), [units, unitId]);
  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  const updateLine = (id: number, patch: Partial<Line>) =>
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));

  const prefill = () => {
    if (!unit) return;
    setLines([
      { id: nextLineId, label: "Monthly rent", amount: String(unit.rent) },
      { id: nextLineId + 1, label: "Association dues", amount: String(unit.dues) },
    ]);
    setNextLineId(nextLineId + 2);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card className="bg-panel" padding="md">
        <form action={action} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Unit" className="sm:col-span-2">
              <SelectField name="unitId" value={unitId} onChange={(event) => setUnitId(event.target.value)} required>
                {units.length === 0 ? <option value="">No units available</option> : null}
                {units.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.propertyName} · Unit {item.code}
                    {item.residentName ? ` — ${item.residentName}` : " — vacant"}
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field label="Billing period">
              <SelectField name="period" defaultValue={defaultPeriod}>
                {periods.map((period) => (
                  <option key={period} value={period}>
                    {formatPeriod(period)}
                  </option>
                ))}
              </SelectField>
            </Field>

            <Field label="Due date">
              <TextField name="dueDate" type="date" defaultValue={defaultDueDate} required />
            </Field>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Line items</span>
              <button
                type="button"
                onClick={prefill}
                className="text-xs font-semibold text-accent transition hover:underline disabled:opacity-40"
                disabled={!unit}
              >
                Prefill from unit rate
              </button>
            </div>

            {lines.map((line) => (
              <div key={line.id} className="flex items-center gap-2">
                <input
                  name="lineLabel"
                  value={line.label}
                  onChange={(event) => updateLine(line.id, { label: event.target.value })}
                  placeholder="Description"
                  className="h-11 flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted"
                />
                <input
                  name="lineAmount"
                  value={line.amount}
                  onChange={(event) => updateLine(line.id, { amount: event.target.value })}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="h-11 w-32 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                  disabled={lines.length === 1}
                  className="px-2 text-text-muted transition hover:text-status-danger disabled:opacity-30"
                  aria-label="Remove line item"
                >
                  ✕
                </button>
              </div>
            ))}

            <Button
              variant="secondary"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                setLines((current) => [...current, { id: nextLineId, label: "", amount: "" }]);
                setNextLineId(nextLineId + 1);
              }}
            >
              + Add line item
            </Button>
          </div>

          <Field label="Internal note" hint="Optional — visible to staff only.">
            <TextAreaField name="note" placeholder="Reason for this manual invoice…" />
          </Field>

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Creating invoice…">Create invoice — {formatMoney(total)}</SubmitButton>
          </div>
        </form>
      </Card>

      <Card className="bg-[#e9f5f3]" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">Summary</h3>
        {unit ? (
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-border/30 pb-2">
              <dt className="text-text-muted">Property</dt>
              <dd className="font-semibold text-text-primary">{unit.propertyName}</dd>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <dt className="text-text-muted">Unit</dt>
              <dd className="font-semibold text-text-primary">{unit.code}</dd>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <dt className="text-text-muted">Billed to</dt>
              <dd className="font-semibold text-text-primary">{unit.residentName ?? "Unassigned"}</dd>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <dt className="text-text-muted">Standard rent</dt>
              <dd className="font-semibold text-text-primary">{formatMoney(unit.rent)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base">
              <dt className="font-semibold text-text-primary">Invoice total</dt>
              <dd className="font-semibold text-text-primary">{formatMoney(total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-text-muted">Select a unit to see its details.</p>
        )}
      </Card>
    </div>
  );
}
