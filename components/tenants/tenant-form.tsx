"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Field, SelectField, SubmitButton, TextField } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { createTenantAction } from "@/lib/actions/tenants";
import { formatMoney } from "@/lib/format";

export type VacantUnit = {
  id: string;
  code: string;
  locationName: string;
  category: string;
  tenancy: string;
  rent: number;
  owner: string;
};

export function TenantForm({ units, today }: { units: VacantUnit[]; today: string }) {
  const router = useRouter();
  const [state, action] = useActionState(createTenantAction, null);
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [paymentMode, setPaymentMode] = useState("pdc");

  useActionToast(state, () => {
    if (state?.id) router.push(`/tenants/${state.id}`);
    else router.push("/tenants");
  });

  const unit = useMemo(() => units.find((item) => item.id === unitId), [units, unitId]);
  const contractType = unit?.tenancy === "long-term" ? "Residential lease (annual)" : "Accommodation (short-term)";
  const termMonths = unit?.tenancy === "long-term" ? 12 : 1;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="bg-panel" padding="md">
        <div className="grid gap-5">
          <Field label="Full name">
            <TextField name="name" placeholder="Maricel Samaniego Espiritu" required />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <TextField name="email" type="email" placeholder="tenant@example.com" required />
            </Field>
            <Field label="Contact number">
              <TextField name="phone" placeholder="0917 123 4567" />
            </Field>
          </div>
          <Field label="Home address" hint="Permanent address (for the contract)">
            <TextField name="homeAddress" placeholder="Brgy. Ugac Sur, Tuguegarao City" />
          </Field>

          <Field label="Assign unit">
            <SelectField name="unitId" value={unitId} onChange={(event) => setUnitId(event.target.value)} required>
              {units.length === 0 ? <option value="">No vacant units available</option> : null}
              {units.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.locationName} · Unit {item.code} — {item.category}/{item.tenancy} — {formatMoney(item.rent)}/mo
                </option>
              ))}
            </SelectField>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Lease start">
              <TextField name="leaseStart" type="date" defaultValue={today} required />
            </Field>
            <Field label="Rent due day" hint="Day of the month">
              <TextField name="dueDay" type="number" min="1" max="28" defaultValue={15} required />
            </Field>
          </div>

          <Field label="Payment mode" hint="Post-dated cheque auto-generates a cheque schedule for the term.">
            <SelectField name="paymentMode" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
              <option value="pdc">Post-dated cheque (PDC)</option>
              <option value="gcash">GCash</option>
              <option value="bank-transfer">Bank transfer</option>
              <option value="cash">Cash</option>
            </SelectField>
          </Field>
        </div>
      </Card>

      <Card className="bg-[#e9f5f3]" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">Contract preview</h3>
        <p className="mt-1 text-sm text-text-muted">
          A {contractType.toLowerCase()} contract is generated automatically on save.
        </p>

        {unit ? (
          <dl className="mt-5 grid gap-3 text-sm">
            <Row k="Location" v={unit.locationName} />
            <Row k="Unit" v={`${unit.code} (${unit.category})`} />
            <Row k="Owner / Lessor" v={unit.owner} />
            <Row k="Contract type" v={contractType} />
            <Row k="Term" v={`${termMonths} month(s)`} />
            <Row k="Monthly rent" v={formatMoney(unit.rent)} />
            <Row k="Advance (1 mo)" v={formatMoney(unit.rent)} />
            <Row k="Deposit (1 mo)" v={formatMoney(unit.rent)} />
            <div className="flex justify-between border-t border-border/40 pt-2 text-base">
              <dt className="font-semibold text-text-primary">Move-in total</dt>
              <dd className="font-semibold text-text-primary">{formatMoney(unit.rent * 2)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-text-muted">Select a unit to preview the contract.</p>
        )}

        <div className="mt-6">
          <SubmitButton pendingLabel="Onboarding…" {...(units.length === 0 ? { disabled: true } : {})}>
            Onboard tenant &amp; generate contract
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/30 pb-2">
      <dt className="text-text-muted">{k}</dt>
      <dd className="font-semibold text-text-primary">{v}</dd>
    </div>
  );
}
