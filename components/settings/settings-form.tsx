"use client";

import { useActionState } from "react";

import { Card } from "@/components/ui/card";
import { Field, SubmitButton, TextField } from "@/components/ui/form";
import { useActionToast, useToast } from "@/components/ui/toast";
import { resetDemoDataAction, updateSettingsAction } from "@/lib/actions/settings";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { push } = useToast();
  const [state, action] = useActionState(updateSettingsAction, null);
  const [resetState, resetAction] = useActionState(async () => resetDemoDataAction(), null);

  useActionToast(state);
  useActionToast(resetState);

  return (
    <div className="space-y-6">
      <form action={action}>
        <Card className="bg-panel" padding="md">
          <h3 className="text-lg font-semibold font-display text-text-primary">Organisation Profile</h3>
          <p className="mt-1 text-sm text-text-muted">Shown across the admin console and on generated documents.</p>
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
          <p className="mt-1 text-sm text-text-muted">Applied to new billing cycles and manual invoices.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Field label="Due day of month" hint="1–28">
              <TextField name="billingDueDay" type="number" min="1" max="28" defaultValue={settings.billingDueDay} required />
            </Field>
            <Field label="Grace period (days)" hint="Before an invoice is overdue">
              <TextField name="gracePeriodDays" type="number" min="0" max="30" defaultValue={settings.gracePeriodDays} required />
            </Field>
            <Field label="Late fee (%)">
              <TextField name="lateFeePercent" type="number" min="0" max="25" step="0.5" defaultValue={settings.lateFeePercent} required />
            </Field>
          </div>

          <h3 className="mt-8 text-lg font-semibold font-display text-text-primary">Default Notification Channels</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(["email", "push", "sms"] as const).map((channel) => (
              <label key={channel} className="flex items-center gap-3 rounded-card border border-border/50 px-4 py-3 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  name={channel}
                  defaultChecked={settings.channels[channel]}
                  className="h-4 w-4 accent-[color:var(--color-accent)]"
                />
                {channel === "sms" ? "SMS" : channel[0].toUpperCase() + channel.slice(1)}
              </label>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
          </div>
        </Card>
      </form>

      <Card className="border border-status-danger/30 bg-status-danger/5" padding="md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold font-display text-text-primary">Reset demo data</h3>
            <p className="mt-1 text-sm text-text-muted">
              Regenerates every property, unit, resident, invoice, booking, and log from the seed dataset.
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
