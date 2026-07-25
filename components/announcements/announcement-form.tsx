"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Field, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/ui/form";
import { useActionToast } from "@/components/ui/toast";
import { saveAnnouncementAction } from "@/lib/actions/announcements";
import type { AnnouncementChannels } from "@/lib/types";

export type AudienceCounts = { all: number; byProperty: Record<string, number> };

export function AnnouncementForm({
  properties,
  counts,
  defaultChannels,
}: {
  properties: Array<{ id: string; name: string }>;
  counts: AudienceCounts;
  defaultChannels: AnnouncementChannels;
}) {
  const router = useRouter();
  const [state, action] = useActionState(saveAnnouncementAction, null);
  const [scope, setScope] = useState<"all" | "property" | "units">("all");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [unitCodes, setUnitCodes] = useState("");
  const [body, setBody] = useState("");

  useActionToast(state, () => router.push("/announcements"));

  const estimated =
    scope === "all"
      ? counts.all
      : scope === "property"
        ? (counts.byProperty[propertyId] ?? 0)
        : unitCodes.split(/[,\s]+/).filter(Boolean).length;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card className="bg-panel" padding="md">
        <div className="grid gap-5">
          <Field label="Title">
            <TextField name="title" placeholder="Water interruption notice" required />
          </Field>

          <Field label="Message" hint={`${body.length} characters`}>
            <TextAreaField
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Describe what residents need to know…"
              className="min-h-40"
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Audience">
              <SelectField
                name="scope"
                value={scope}
                onChange={(event) => setScope(event.target.value as typeof scope)}
              >
                <option value="all">All residents</option>
                <option value="property">A single property</option>
                <option value="units">Specific units</option>
              </SelectField>
            </Field>

            {scope === "property" ? (
              <Field label="Property">
                <SelectField name="propertyId" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </SelectField>
              </Field>
            ) : null}

            {scope === "units" ? (
              <Field label="Unit codes" hint="Comma separated, e.g. 12B, 14A, 8C">
                <TextField
                  name="unitCodes"
                  value={unitCodes}
                  onChange={(event) => setUnitCodes(event.target.value)}
                  placeholder="12B, 14A"
                />
              </Field>
            ) : null}
          </div>

          <fieldset className="grid gap-3 rounded-card border border-border/50 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Channels</legend>
            {(["email", "push", "sms"] as const).map((channel) => (
              <label key={channel} className="flex items-center gap-3 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  name={channel}
                  defaultChecked={defaultChannels[channel]}
                  className="h-4 w-4 accent-[color:var(--color-accent)]"
                />
                {channel === "sms" ? "SMS" : channel[0].toUpperCase() + channel.slice(1)}
              </label>
            ))}
          </fieldset>
        </div>
      </Card>

      <Card className="bg-[#e9f5f3]" padding="md">
        <h3 className="text-lg font-semibold font-display text-text-primary">Delivery</h3>
        <p className="mt-1 text-sm text-text-muted">
          Only occupied units with a registered resident receive announcements.
        </p>

        <div className="mt-5 rounded-card bg-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Estimated recipients</p>
          <p className="mt-2 text-3xl font-semibold font-display text-text-primary">{estimated}</p>
        </div>

        <div className="mt-6 grid gap-3">
          <SubmitButton name="intent" value="send" pendingLabel="Sending…">
            Send now
          </SubmitButton>
          <SubmitButton name="intent" value="draft" variant="secondary" pendingLabel="Saving…">
            Save as draft
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}
