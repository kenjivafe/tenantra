"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, InlineSubmit, SelectField, SubmitButton, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { PeriodSelect } from "@/components/billing/period-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import {
  createBillAction,
  markChequeAction,
  recordPaymentAction,
  runBillingCycleAction,
  updateBillAction,
  voidBillAction,
} from "@/lib/actions/billing";
import type { BillRow, ChequeRow } from "@/lib/data";
import { formatDate, formatMoney, formatPeriod, titleCase } from "@/lib/format";

const PAGE_SIZE = 12;
const METHODS = ["cash", "gcash", "pdc", "bank-transfer"] as const;

type BillFilter = "all" | "paid" | "pending" | "overdue";
type ChequeFilter = "all" | "pending" | "deposited" | "bounced";

export function BillingView({
  bills,
  cheques,
  tenants,
  locations,
  periods,
  period,
  initialTab,
}: {
  bills: BillRow[];
  cheques: ChequeRow[];
  tenants: Array<{ id: string; name: string; unitCode: string; rent: number }>;
  locations: Array<{ id: string; name: string }>;
  periods: string[];
  period: string;
  initialTab: "bills" | "cheques";
}) {
  const [tab, setTab] = useState<"bills" | "cheques">(initialTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PeriodSelect periods={periods} value={period} />
          <span className="text-sm text-text-muted">{formatPeriod(period)}</span>
        </div>
        <div className="inline-flex rounded-control border border-border/60 bg-panel p-1">
          {(["bills", "cheques"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={`rounded-control px-4 py-1.5 text-sm font-semibold transition ${
                tab === option ? "bg-accent text-white" : "text-text-muted hover:text-text-primary"
              }`}
            >
              {option === "bills" ? "Bills" : "Cheques (PDC)"}
            </button>
          ))}
        </div>
      </div>

      {tab === "bills" ? (
        <BillsTab bills={bills} tenants={tenants} locations={locations} period={period} periods={periods} />
      ) : (
        <ChequesTab cheques={cheques} />
      )}
    </div>
  );
}

function BillsTab({
  bills,
  tenants,
  locations,
  period,
  periods,
}: {
  bills: BillRow[];
  tenants: Array<{ id: string; name: string; unitCode: string; rent: number }>;
  locations: Array<{ id: string; name: string }>;
  period: string;
  periods: string[];
}) {
  const [status, setStatus] = useState<BillFilter>("all");
  const [location, setLocation] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [running, setRunning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payBill, setPayBill] = useState<BillRow | null>(null);
  const [editBill, setEditBill] = useState<BillRow | null>(null);
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");

  const [runState, runAction] = useActionState(runBillingCycleAction, null);
  const [createState, createAction] = useActionState(createBillAction, null);
  const [payState, payAction] = useActionState(recordPaymentAction, null);
  const [editState, editAction] = useActionState(updateBillAction, null);
  const [voidState, voidAction] = useActionState(voidBillAction, null);

  useActionToast(runState, () => setRunning(false));
  useActionToast(createState, () => setCreating(false));
  useActionToast(payState, () => setPayBill(null));
  useActionToast(editState, () => setEditBill(null));
  useActionToast(voidState);

  const counts = useMemo(
    () => ({
      all: bills.length,
      paid: bills.filter((b) => b.status === "paid").length,
      pending: bills.filter((b) => b.status === "pending").length,
      overdue: bills.filter((b) => b.status === "overdue").length,
    }),
    [bills],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bills.filter((bill) => {
      if (status !== "all" && bill.status !== status) return false;
      if (location !== "all" && bill.locationName !== location) return false;
      if (!needle) return true;
      return (
        bill.tenantName.toLowerCase().includes(needle) ||
        bill.unitCode.toLowerCase().includes(needle) ||
        bill.number.toLowerCase().includes(needle)
      );
    });
  }, [bills, status, location, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedTenant = tenants.find((t) => t.id === tenantId);

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setRunning(true)}>Run Billing Cycle</Button>
          <Button variant="secondary" onClick={() => setCreating(true)}>
            Create Bill
          </Button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => reset(setQuery)(event.target.value)}
          placeholder="Search tenant, unit, or bill #"
          className="h-11 min-w-[15rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted sm:max-w-xs sm:flex-none"
        />
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <FilterChips
            value={status}
            onChange={reset(setStatus)}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "paid", label: "Paid", count: counts.paid },
              { value: "pending", label: "Pending", count: counts.pending },
              { value: "overdue", label: "Overdue", count: counts.overdue },
            ]}
          />
          <select
            aria-label="Filter by location"
            value={location}
            onChange={(event) => reset(setLocation)(event.target.value)}
            className="h-11 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Bill</Th>
              <Th>Tenant</Th>
              <Th>Rent</Th>
              <Th>Elec</Th>
              <Th>Water</Th>
              <Th>Total</Th>
              <Th>Due</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={9} message="No bills for this period yet — run the billing cycle." />
            ) : (
              visible.map((bill) => (
                <tr key={bill.id} className="border-b border-border/20">
                  <Td label="Bill" className="font-medium">
                    {bill.number}
                    <span className="block text-xs text-text-muted">{bill.locationName}</span>
                  </Td>
                  <Td label="Tenant">
                    <Link href={`/tenants/${bill.tenantId}`} className="text-accent hover:underline">
                      {bill.tenantName}
                    </Link>
                    <span className="block text-xs text-text-muted">Unit {bill.unitCode}</span>
                  </Td>
                  <Td label="Rent">{formatMoney(bill.rent)}</Td>
                  <Td label="Electric">{formatMoney(bill.electric)}</Td>
                  <Td label="Water">{formatMoney(bill.water)}</Td>
                  <Td label="Total" className="font-semibold">{formatMoney(bill.amount)}</Td>
                  <Td label="Due">{formatDate(bill.dueDate)}</Td>
                  <Td label="Status">
                    <StatusBadge status={bill.status} />
                  </Td>
                  <Td>
                    {bill.status === "paid" || bill.status === "void" ? (
                      <span className="text-xs text-text-muted">{bill.method ? titleCase(bill.method) : "—"}</span>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setEditBill(bill)} className="text-sm font-medium text-accent hover:underline">
                          Utilities
                        </button>
                        <button type="button" onClick={() => setPayBill(bill)} className="text-sm font-medium text-accent hover:underline">
                          Pay
                        </button>
                        <form action={voidAction} className="inline">
                          <input type="hidden" name="billId" value={bill.id} />
                          <InlineSubmit tone="danger" pendingLabel="…">
                            Void
                          </InlineSubmit>
                        </form>
                      </div>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
        <Pagination page={safePage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {/* Run cycle */}
      <Modal open={running} onClose={() => setRunning(false)} title="Run Billing Cycle" description="Generate rent bills for occupied units.">
        <form action={runAction} className="grid gap-4">
          <Field label="Period">
            <SelectField name="period" defaultValue={period}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
            </SelectField>
          </Field>
          <Field label="Location">
            <SelectField name="locationId" defaultValue="all">
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </SelectField>
          </Field>
          <p className="rounded-card bg-accentSoft px-4 py-3 text-sm text-text-secondary">
            Bills start with rent only. Add electric and water amounts per bill afterward.
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setRunning(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Generating…">Generate bills</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Create bill */}
      <Modal open={creating} onClose={() => setCreating(false)} title="Create Bill" description="Bill a single tenant.">
        <form action={createAction} className="grid gap-4">
          <Field label="Tenant">
            <SelectField name="tenantId" value={tenantId} onChange={(event) => setTenantId(event.target.value)} required>
              {tenants.length === 0 ? <option value="">No active tenants</option> : null}
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — Unit {t.unitCode}
                </option>
              ))}
            </SelectField>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Period">
              <SelectField name="period" defaultValue={period}>
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriod(p)}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Rent">
              <TextField name="rent" type="number" min="0" step="100" defaultValue={selectedTenant?.rent ?? 0} required />
            </Field>
            <Field label="Electric">
              <TextField name="electric" type="number" min="0" step="10" defaultValue={0} />
            </Field>
            <Field label="Water">
              <TextField name="water" type="number" min="0" step="10" defaultValue={0} />
            </Field>
            <Field label="Other charge">
              <TextField name="other" type="number" min="0" step="10" defaultValue={0} />
            </Field>
            <Field label="Other label">
              <TextField name="otherLabel" placeholder="Parking, repairs…" />
            </Field>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Creating…">Create bill</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Pay */}
      <Modal open={payBill !== null} onClose={() => setPayBill(null)} title="Record Payment" description={payBill ? `${payBill.number} · ${formatMoney(payBill.amount)}` : undefined}>
        {payBill ? (
          <form action={payAction} className="grid gap-4">
            <input type="hidden" name="billId" value={payBill.id} />
            <Field label="Method">
              <SelectField name="method" defaultValue="gcash">
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {titleCase(method)}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Reference / cheque no." hint="Optional.">
              <TextField name="reference" placeholder="REF-123456" />
            </Field>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPayBill(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Recording…">Record {formatMoney(payBill.amount)}</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Utilities */}
      <Modal open={editBill !== null} onClose={() => setEditBill(null)} title="Electric & Water" description={editBill ? `${editBill.number} · rent ${formatMoney(editBill.rent)}` : undefined}>
        {editBill ? (
          <form action={editAction} className="grid gap-4">
            <input type="hidden" name="billId" value={editBill.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Electric amount">
                <TextField name="electric" type="number" min="0" step="10" defaultValue={editBill.electric} />
              </Field>
              <Field label="Water amount">
                <TextField name="water" type="number" min="0" step="10" defaultValue={editBill.water} />
              </Field>
              <Field label="Other charge">
                <TextField name="other" type="number" min="0" step="10" defaultValue={editBill.other} />
              </Field>
              <Field label="Other label">
                <TextField name="otherLabel" placeholder="Parking, repairs…" />
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditBill(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Saving…">Save charges</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}

function ChequesTab({ cheques }: { cheques: ChequeRow[] }) {
  const [filter, setFilter] = useState<ChequeFilter>("all");
  const [chequeState, chequeAction] = useActionState(markChequeAction, null);
  useActionToast(chequeState);

  const counts = useMemo(
    () => ({
      all: cheques.length,
      pending: cheques.filter((c) => c.status === "pending").length,
      deposited: cheques.filter((c) => c.status === "deposited").length,
      bounced: cheques.filter((c) => c.status === "bounced").length,
    }),
    [cheques],
  );

  const visible = useMemo(
    () => (filter === "all" ? cheques : cheques.filter((c) => c.status === filter)).slice(0, 60),
    [cheques, filter],
  );

  return (
    <Card className="bg-panel" padding="md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold font-display text-text-primary">Post-Dated Cheques</h3>
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "pending", label: "Pending", count: counts.pending },
            { value: "deposited", label: "Deposited", count: counts.deposited },
            { value: "bounced", label: "Bounced", count: counts.bounced },
          ]}
        />
      </div>
      <TableShell>
        <thead>
          <tr className="border-b border-border/40">
            <Th>Deposit On</Th>
            <Th>Tenant</Th>
            <Th>Unit</Th>
            <Th>Cheque #</Th>
            <Th>Bank</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <EmptyRow colSpan={8} message="No cheques match this filter." />
          ) : (
            visible.map((cheque) => (
              <tr key={cheque.id} className="border-b border-border/20">
                <Td label="Deposit on">{formatDate(cheque.dueDate)}</Td>
                <Td label="Tenant" className="font-medium">
                  <Link href={`/tenants/${cheque.tenantId}`} className="text-accent hover:underline">
                    {cheque.tenantName}
                  </Link>
                </Td>
                <Td label="Unit">{cheque.unitCode}</Td>
                <Td label="Cheque #">{cheque.chequeNo}</Td>
                <Td label="Bank">{cheque.bank}</Td>
                <Td label="Amount">{formatMoney(cheque.amount)}</Td>
                <Td label="Status">
                  <StatusBadge status={cheque.status} />
                </Td>
                <Td>
                  {cheque.status === "pending" ? (
                    <div className="flex gap-3">
                      <form action={chequeAction} className="inline">
                        <input type="hidden" name="chequeId" value={cheque.id} />
                        <input type="hidden" name="status" value="deposited" />
                        <InlineSubmit pendingLabel="…">Deposited</InlineSubmit>
                      </form>
                      <form action={chequeAction} className="inline">
                        <input type="hidden" name="chequeId" value={cheque.id} />
                        <input type="hidden" name="status" value="bounced" />
                        <InlineSubmit tone="danger" pendingLabel="…">
                          Bounced
                        </InlineSubmit>
                      </form>
                    </div>
                  ) : cheque.status === "bounced" ? (
                    <form action={chequeAction} className="inline">
                      <input type="hidden" name="chequeId" value={cheque.id} />
                      <input type="hidden" name="status" value="deposited" />
                      <InlineSubmit pendingLabel="…">Re-deposit</InlineSubmit>
                    </form>
                  ) : (
                    <span className="text-xs text-status-success">Cleared</span>
                  )}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableShell>
    </Card>
  );
}
