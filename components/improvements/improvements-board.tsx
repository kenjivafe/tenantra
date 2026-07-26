"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, SubmitButton, TextAreaField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { useActionToast } from "@/components/ui/toast";
import { decideImprovementAction } from "@/lib/actions/improvements";
import type { ImprovementRow } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

type Filter = "all" | "pending" | "approved" | "rejected" | "completed";

export function ImprovementsBoard({ rows }: { rows: ImprovementRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [deciding, setDeciding] = useState<{ row: ImprovementRow; decision: "approved" | "rejected" | "completed" } | null>(null);
  const [state, action] = useActionState(decideImprovementAction, null);
  useActionToast(state, () => setDeciding(null));

  const counts = useMemo(
    () => ({
      all: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      approved: rows.filter((r) => r.status === "approved").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      completed: rows.filter((r) => r.status === "completed").length,
    }),
    [rows],
  );

  const visible = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);

  return (
    <>
      <Card className="bg-panel" padding="sm">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "approved", label: "Approved", count: counts.approved },
            { value: "rejected", label: "Rejected", count: counts.rejected },
            { value: "completed", label: "Completed", count: counts.completed },
          ]}
        />
      </Card>

      {visible.length === 0 ? (
        <Card className="bg-panel" padding="md">
          <p className="py-8 text-center text-sm text-text-muted">No improvement requests match this filter.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visible.map((row) => (
            <Card key={row.id} className="bg-panel" padding="md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold font-display text-text-primary">{row.title}</h3>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    <Link href={`/tenants/${row.tenantId}`} className="text-accent hover:underline">
                      {row.tenantName}
                    </Link>{" "}
                    · Unit {row.unitCode}, {row.locationName} · {formatDate(row.createdAt.slice(0, 10))}
                  </p>
                  <p className="mt-3 text-sm text-text-secondary">{row.description}</p>
                  {row.ownerResponse ? (
                    <p className="mt-3 rounded-card bg-surface/60 px-4 py-3 text-sm text-text-secondary">
                      <span className="font-semibold text-text-primary">Owner: </span>
                      {row.ownerResponse}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                  <span className="text-sm font-semibold text-text-primary">Est. {formatMoney(row.estimatedCost)}</span>
                  <a href={`/improvements/${row.id}/letter`} className="text-sm font-semibold text-accent hover:underline">
                    ⬇ Download letter
                  </a>
                  <div className="flex flex-wrap gap-2">
                    {row.status === "pending" ? (
                      <>
                        <Button size="sm" onClick={() => setDeciding({ row, decision: "approved" })}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setDeciding({ row, decision: "rejected" })}>
                          Reject
                        </Button>
                      </>
                    ) : null}
                    {row.status === "approved" ? (
                      <Button size="sm" onClick={() => setDeciding({ row, decision: "completed" })}>
                        Mark completed
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={deciding !== null}
        onClose={() => setDeciding(null)}
        title={
          deciding
            ? deciding.decision === "approved"
              ? "Approve Request"
              : deciding.decision === "rejected"
                ? "Reject Request"
                : "Mark Completed"
            : ""
        }
        description={deciding ? deciding.row.title : undefined}
      >
        {deciding ? (
          <form action={action} className="grid gap-4">
            <input type="hidden" name="improvementId" value={deciding.row.id} />
            <input type="hidden" name="decision" value={deciding.decision} />
            <Field label="Owner's response" hint="Included on the downloadable letter.">
              <TextAreaField
                name="ownerResponse"
                placeholder={
                  deciding.decision === "approved"
                    ? "Approved provided the work is professional and reversible…"
                    : deciding.decision === "rejected"
                      ? "Not approved at this time because…"
                      : "Completed and inspected…"
                }
              />
            </Field>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeciding(null)}>
                Cancel
              </Button>
              <SubmitButton
                variant={deciding.decision === "rejected" ? "destructive" : "primary"}
                pendingLabel="Saving…"
              >
                Confirm
              </SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
