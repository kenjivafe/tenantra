"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, InlineSubmit, SelectField, SubmitButton, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import { recordPaymentAction, sendReminderAction, voidInvoiceAction } from "@/lib/actions/billing";
import type { InvoiceRow } from "@/lib/data";
import { formatDate, formatMoney, titleCase } from "@/lib/format";

const PAGE_SIZE = 12;
const METHODS = ["gcash", "bank-transfer", "card", "cash", "check"] as const;

type StatusFilter = "all" | "paid" | "pending" | "overdue" | "void";

export function BillingTable({
  rows,
  properties,
}: {
  rows: InvoiceRow[];
  properties: Array<{ id: string; name: string }>;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [propertyId, setPropertyId] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [paying, setPaying] = useState<InvoiceRow | null>(null);
  const [viewing, setViewing] = useState<InvoiceRow | null>(null);

  const [payState, payAction] = useActionState(recordPaymentAction, null);
  const [reminderState, reminderAction] = useActionState(sendReminderAction, null);
  const [voidState, voidAction] = useActionState(voidInvoiceAction, null);

  useActionToast(payState, () => setPaying(null));
  useActionToast(reminderState);
  useActionToast(voidState);

  const counts = useMemo(
    () => ({
      all: rows.length,
      paid: rows.filter((row) => row.status === "paid").length,
      pending: rows.filter((row) => row.status === "pending").length,
      overdue: rows.filter((row) => row.status === "overdue").length,
      void: rows.filter((row) => row.status === "void").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (propertyId !== "all" && row.propertyId !== propertyId) return false;
      if (!needle) return true;
      return (
        row.residentName.toLowerCase().includes(needle) ||
        row.unitCode.toLowerCase().includes(needle) ||
        row.number.toLowerCase().includes(needle)
      );
    });
  }, [rows, status, propertyId, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <Card className="bg-panel" padding="md">
        <div className="flex flex-wrap items-center gap-4">
          <FilterChips
            value={status}
            onChange={resetPage(setStatus)}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "paid", label: "Paid", count: counts.paid },
              { value: "pending", label: "Pending", count: counts.pending },
              { value: "overdue", label: "Overdue", count: counts.overdue },
              ...(counts.void > 0 ? [{ value: "void" as const, label: "Void", count: counts.void }] : []),
            ]}
          />
          <select
            aria-label="Filter by property"
            value={propertyId}
            onChange={(event) => resetPage(setPropertyId)(event.target.value)}
            className="rounded-control border border-border/60 bg-panel px-3 py-1.5 text-sm text-text-primary"
          >
            <option value="all">All Properties</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={query}
            onChange={(event) => resetPage(setQuery)(event.target.value)}
            placeholder="Search tenant, unit, or invoice #"
            className="min-w-[16rem] flex-1 rounded-control border border-border/60 bg-panel px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>
      </Card>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold font-display text-text-primary">Invoices</h3>
          <p className="text-sm text-text-muted">
            {filtered.length} of {rows.length} shown ·{" "}
            {formatMoney(filtered.reduce((sum, row) => sum + row.amount, 0))} total
          </p>
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Invoice #</Th>
              <Th>Tenant</Th>
              <Th>Unit</Th>
              <Th>Amount</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={7} message="No invoices match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="font-medium">{row.number}</Td>
                  <Td>{row.residentName}</Td>
                  <Td>
                    {row.unitCode}
                    <span className="block text-xs text-text-muted">{row.propertyName}</span>
                  </Td>
                  <Td>{formatMoney(row.amount)}</Td>
                  <Td>{formatDate(row.dueDate)}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                    {row.remindersSent > 0 && row.status !== "paid" ? (
                      <span className="ml-2 text-xs text-text-muted">{row.remindersSent} reminder(s)</span>
                    ) : null}
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
                      {row.status === "paid" || row.status === "void" ? null : (
                        <>
                          <button
                            type="button"
                            onClick={() => setPaying(row)}
                            className="text-sm font-medium text-accent transition hover:underline"
                          >
                            Record Payment
                          </button>
                          <form action={reminderAction} className="inline">
                            <input type="hidden" name="invoiceId" value={row.id} />
                            <InlineSubmit pendingLabel="Sending…">Remind</InlineSubmit>
                          </form>
                          <form action={voidAction} className="inline">
                            <input type="hidden" name="invoiceId" value={row.id} />
                            <InlineSubmit tone="danger" pendingLabel="Voiding…">
                              Void
                            </InlineSubmit>
                          </form>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>

        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </Card>

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title="Record Payment"
        description={paying ? `${paying.number} · ${paying.residentName} · Unit ${paying.unitCode}` : undefined}
      >
        {paying ? (
          <form action={payAction} className="grid gap-4">
            <input type="hidden" name="invoiceId" value={paying.id} />
            <Field label="Amount received">
              <TextField name="amount" type="number" min="1" step="1" defaultValue={paying.amount} required />
            </Field>
            <Field label="Payment method">
              <SelectField name="method" defaultValue="gcash">
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {titleCase(method)}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Reference number" hint="Optional — generated automatically when left blank.">
              <TextField name="reference" placeholder="PMT-123456" />
            </Field>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPaying(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Recording…">Record payment</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.number ?? "Invoice"}
        description={viewing ? `${viewing.residentName} · Unit ${viewing.unitCode} · ${viewing.propertyName}` : undefined}
      >
        {viewing ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Status</p>
                <div className="mt-1">
                  <StatusBadge status={viewing.status} />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Due date</p>
                <p className="mt-1 text-text-primary">{formatDate(viewing.dueDate)}</p>
              </div>
              {viewing.paidAt ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Paid on</p>
                    <p className="mt-1 text-text-primary">{formatDate(viewing.paidAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Method</p>
                    <p className="mt-1 text-text-primary">{titleCase(viewing.paymentMethod ?? "—")}</p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-card border border-border/50">
              {viewing.lines.map((line) => (
                <div
                  key={line.label}
                  className="flex justify-between border-b border-border/30 px-4 py-2.5 text-sm last:border-b-0"
                >
                  <span className="text-text-secondary">{line.label}</span>
                  <span className="font-medium text-text-primary">{formatMoney(line.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between bg-accentSoft px-4 py-3 text-sm font-semibold">
                <span>Total</span>
                <span>{formatMoney(viewing.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
