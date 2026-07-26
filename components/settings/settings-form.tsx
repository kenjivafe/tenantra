"use client";

import { useActionState } from "react";

import { Card } from "@/components/ui/card";
import { Field, SubmitButton, TextField } from "@/components/ui/form";
import { useActionToast, useToast } from "@/components/ui/toast";
import { addLocationAction, resetDemoDataAction, updateSettingsAction } from "@/lib/actions/settings";
import type { Location, Settings } from "@/lib/types";

export function SettingsForm({
  settings,
  locations,
}: {
  settings: Settings;
  locations: Array<Location & { units: number }>;
}) {
  const { push } = useToast();
  const [state, action] = useActionState(updateSettingsAction, null);
  const [locationState, locationAction] = useActionState(addLocationAction, null);
  const [resetState, resetAction] = useActionState(async () => resetDemoDataAction(), null);

  useActionToast(state);
  useActionToast(locationState);
  useActionToast(resetState);

  return (
    <div className="space-y-6">
      <form action={action}>
        <Card className="bg-panel" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary">Organisation Profile</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Organisation name" className="sm:col-span-2">
              <TextField name="orgName" defaultValue={settings.orgName} required />
            </Field>
            <Field label="Administrator name">
              <TextField name="adminName" defaultValue={settings.adminName} required />
            </Field>
            <Field label="Administrator email">
              <TextField name="adminEmail" type="email" defaultValue={settings.adminEmail} required />
            </Field>
          </div>

          <h3 className="mt-8 text-lg font-semibold font-display text-text-primary">Billing Rules</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Rent due day" hint="Day of the month (1–28)">
              <TextField name="billingDueDay" type="number" min="1" max="28" defaultValue={settings.billingDueDay} required />
            </Field>
            <Field label="Late fee (%)" hint="Applied to payments delayed by over a month">
              <TextField name="lateFeePercent" type="number" min="0" max="25" step="0.5" defaultValue={settings.lateFeePercent} required />
            </Field>
          </div>

          <h3 className="mt-8 text-lg font-semibold font-display text-text-primary">Default Notification Channels</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["email", "sms"] as const).map((channel) => (
              <label key={channel} className="flex items-center gap-3 rounded-card border border-border/50 px-4 py-3 text-sm text-text-secondary">
                <input type="checkbox" name={channel} defaultChecked={settings.channels[channel]} className="h-4 w-4 accent-[color:var(--color-accent)]" />
                {channel === "sms" ? "SMS" : "Email"}
              </label>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
          </div>
        </Card>
      </form>

      <Card className="bg-panel" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">Locations</h3>
        <p className="mt-1 text-sm text-text-muted">Sites where your units are located.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {locations.map((location) => (
            <span key={location.id} className="rounded-control border border-border/60 bg-surface px-4 py-2 text-sm">
              <span className="font-semibold text-text-primary">{location.name}</span>
              <span className="ml-2 text-text-muted">{location.units} units</span>
            </span>
          ))}
        </div>
        <form action={locationAction} className="mt-5 flex flex-wrap items-end gap-3">
          <Field label="Add a location" className="flex-1">
            <TextField name="name" placeholder="e.g. Ilagan" />
          </Field>
          <SubmitButton variant="secondary" pendingLabel="Adding…">
            Add location
          </SubmitButton>
        </form>
      </Card>

      <Card className="border border-status-danger/30 bg-status-danger/5" padding="md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold font-display text-text-primary">Reset demo data</h3>
            <p className="mt-1 text-sm text-text-muted">
              Regenerates every location, unit, tenant, bill, cheque, and log from the seed dataset.
            </p>
          </div>
          <form
            action={resetAction}
            onSubmit={(event) => {
              if (!window.confirm("Regenerate all demo data? Current changes will be discarded.")) {
                event.preventDefault();
                push("Reset cancelled.", "error");
              }
            }}
          >
            <SubmitButton variant="destructive" pendingLabel="Resetting…">
              Reset demo data
            </SubmitButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
