"use client";

import { useActionState, useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { InlineSubmit, SubmitButton } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import { deleteAnnouncementAction, sendAnnouncementAction } from "@/lib/actions/announcements";
import type { AnnouncementRow } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

type StatusFilter = "all" | "draft" | "sent";

export function AnnouncementsTable({
  rows,
  properties,
}: {
  rows: AnnouncementRow[];
  properties: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [propertyId, setPropertyId] = useState("all");
  const [viewing, setViewing] = useState<AnnouncementRow | null>(null);

  const [sendState, sendAction] = useActionState(sendAnnouncementAction, null);
  const [deleteState, deleteAction] = useActionState(deleteAnnouncementAction, null);

  useActionToast(sendState, () => setViewing(null));
  useActionToast(deleteState);

  const counts = useMemo(
    () => ({
      all: rows.length,
      draft: rows.filter((row) => row.status === "draft").length,
      sent: rows.filter((row) => row.status === "sent").length,
    }),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (status !== "all" && row.status !== status) return false;
        if (propertyId === "all") return true;
        return row.audience.scope === "all" || row.audience.propertyId === propertyId;
      }),
    [rows, status, propertyId],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/announcements/new">New Announcement</ButtonLink>
        </div>
        <select
          aria-label="Filter by property"
          value={propertyId}
          onChange={(event) => setPropertyId(event.target.value)}
          className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
        >
          <option value="all">All Properties</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display text-text-primary">Communications</h3>
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "draft", label: "Draft", count: counts.draft },
              { value: "sent", label: "Sent", count: counts.sent },
            ]}
          />
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Title</Th>
              <Th>Target</Th>
              <Th>Sent</Th>
              <Th>Created By</Th>
              <Th>Status</Th>
              <Th>Read Receipts</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <EmptyRow colSpan={7} message="No announcements match these filters." />
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="font-medium">{row.title}</Td>
                  <Td>{row.audienceLabel}</Td>
                  <Td>{row.sentAt ? formatDateTime(row.sentAt) : <span className="text-text-muted">—</span>}</Td>
                  <Td>{row.createdBy}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    {row.status === "sent" ? (
                      `${row.reads}/${row.recipients} (${row.recipients ? Math.round((row.reads / row.recipients) * 100) : 0}%)`
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewing(row)}
                        className="text-sm font-medium text-accent transition hover:underline"
                      >
                        View
                      </button>
                      <form action={sendAction} className="inline">
                        <input type="hidden" name="announcementId" value={row.id} />
                        <InlineSubmit pendingLabel="Sending…">{row.status === "sent" ? "Resend" : "Send"}</InlineSubmit>
                      </form>
                      <form action={deleteAction} className="inline">
                        <input type="hidden" name="announcementId" value={row.id} />
                        <InlineSubmit tone="danger" pendingLabel="Deleting…">
                          Delete
                        </InlineSubmit>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </Card>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? "Announcement"}
        description={viewing ? `${viewing.audienceLabel} · ${viewing.createdBy}` : undefined}
      >
        {viewing ? (
          <div className="grid gap-4">
            <p className="whitespace-pre-wrap rounded-card border border-border/50 p-4 text-sm text-text-secondary">
              {viewing.body}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-text-muted">
              {(["email", "push", "sms"] as const)
                .filter((channel) => viewing.channels[channel])
                .map((channel) => (
                  <span key={channel} className="rounded-full bg-accentSoft px-3 py-1 font-semibold text-accent">
                    {channel.toUpperCase()}
                  </span>
                ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
              <form action={sendAction}>
                <input type="hidden" name="announcementId" value={viewing.id} />
                <SubmitButton pendingLabel="Sending…">
                  {viewing.status === "sent" ? "Resend now" : "Send now"}
                </SubmitButton>
              </form>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
