"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import {
  approveResidentAction,
  assignUnitAction,
  blacklistResidentAction,
  createResidentAction,
  messageResidentsAction,
  moveOutResidentAction,
  renewLeaseAction,
} from "@/lib/actions/residents";
import type { ResidentRow } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

const PAGE_SIZE = 12;

type StatusFilter = "all" | "active" | "pending" | "expiring" | "blacklisted" | "moved-out";

export type VacantUnit = { id: string; label: string };

export function ResidentsTable({
  rows,
  vacantUnits,
  today,
}: {
  rows: ResidentRow[];
  vacantUnits: VacantUnit[];
  today: string;
}) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState<ResidentRow | null>(null);
  const [messaging, setMessaging] = useState<ResidentRow[] | null>(null);

  const [createState, createAction] = useActionState(createResidentAction, null);
  const [renewState, renewAction] = useActionState(renewLeaseAction, null);
  const [assignState, assignAction] = useActionState(assignUnitAction, null);
  const [approveState, approveAction] = useActionState(approveResidentAction, null);
  const [moveOutState, moveOutAction] = useActionState(moveOutResidentAction, null);
  const [blacklistState, blacklistAction] = useActionState(blacklistResidentAction, null);
  const [messageState, messageAction] = useActionState(messageResidentsAction, null);

  const closeManage = () => setManaging(null);
  useActionToast(createState, () => setAdding(false));
  useActionToast(renewState, closeManage);
  useActionToast(assignState, closeManage);
  useActionToast(approveState, closeManage);
  useActionToast(moveOutState, closeManage);
  useActionToast(blacklistState, closeManage);
  useActionToast(messageState, () => {
    setMessaging(null);
    setSelected([]);
  });

  const counts = useMemo(
    () => ({
      all: rows.length,
      active: rows.filter((row) => row.status === "active").length,
      pending: rows.filter((row) => row.status === "pending").length,
      expiring: rows.filter((row) => row.status === "expiring").length,
      blacklisted: rows.filter((row) => row.status === "blacklisted").length,
      "moved-out": rows.filter((row) => row.status === "moved-out").length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        row.email.toLowerCase().includes(needle) ||
        (row.unitCode?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [rows, status, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allVisibleSelected = visible.length > 0 && visible.every((row) => selected.includes(row.id));

  const selectedRows = rows.filter((row) => selected.includes(row.id));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setAdding(true)}>Add Resident</Button>
          <Button
            variant="secondary"
            onClick={() => setMessaging(selectedRows)}
            {...(selectedRows.length === 0 ? { disabled: true } : {})}
          >
            Send Bulk Message{selectedRows.length > 0 ? ` (${selectedRows.length})` : ""}
          </Button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search name, email, or unit"
          className="h-11 min-w-[14rem] flex-1 rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted sm:max-w-xs sm:flex-none"
        />
      </div>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display text-text-primary">Tenant Management</h3>
          <FilterChips
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "active", label: "Active", count: counts.active },
              { value: "pending", label: "Pending", count: counts.pending },
              { value: "expiring", label: "Expiring", count: counts.expiring },
              { value: "blacklisted", label: "Blacklisted", count: counts.blacklisted },
              { value: "moved-out", label: "Moved out", count: counts["moved-out"] },
            ]}
          />
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all visible residents"
                  checked={allVisibleSelected}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? Array.from(new Set([...current, ...visible.map((row) => row.id)]))
                        : current.filter((id) => !visible.some((row) => row.id === id)),
                    )
                  }
                  className="h-4 w-4 accent-[color:var(--color-accent)]"
                />
              </Th>
              <Th>Name</Th>
              <Th>Unit</Th>
              <Th>Lease Start</Th>
              <Th>Lease End</Th>
              <Th>Balance</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={8} message="No residents match these filters." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${row.name}`}
                      checked={selected.includes(row.id)}
                      onChange={(event) =>
                        setSelected((current) =>
                          event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id),
                        )
                      }
                      className="h-4 w-4 accent-[color:var(--color-accent)]"
                    />
                  </Td>
                  <Td className="font-medium">
                    {row.name}
                    <span className="block text-xs text-text-muted">{row.email}</span>
                  </Td>
                  <Td>
                    {row.unitCode ?? <span className="text-text-muted">—</span>}
                    {row.propertyName ? <span className="block text-xs text-text-muted">{row.propertyName}</span> : null}
                  </Td>
                  <Td>{formatDate(row.leaseStart)}</Td>
                  <Td>{formatDate(row.leaseEnd)}</Td>
                  <Td className={row.balance > 0 ? "font-semibold text-status-danger" : ""}>
                    {formatMoney(row.balance)}
                  </Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setManaging(row)}
                        className="text-sm font-medium text-accent transition hover:underline"
                      >
                        Manage
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessaging([row])}
                        className="text-sm font-medium text-accent transition hover:underline"
                      >
                        Message
                      </button>
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

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Resident" description="Register a tenant and optionally assign a unit.">
        <form action={createAction} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2">
              <TextField name="name" placeholder="Juan Dela Cruz" required />
            </Field>
            <Field label="Email">
              <TextField name="email" type="email" placeholder="juan@example.com" required />
            </Field>
            <Field label="Mobile number">
              <TextField name="phone" placeholder="+63 917 123 4567" />
            </Field>
            <Field label="Assign unit" hint="Optional — leave unassigned to create a pending applicant." className="sm:col-span-2">
              <SelectField name="unitId" defaultValue="">
                <option value="">No unit yet (pending)</option>
                {vacantUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Lease start">
              <TextField name="leaseStart" type="date" defaultValue={today} />
            </Field>
            <Field label="Lease term (months)">
              <SelectField name="leaseMonths" defaultValue="12">
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </SelectField>
            </Field>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Adding…">Add resident</SubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        open={managing !== null}
        onClose={closeManage}
        title={managing?.name ?? "Resident"}
        description={
          managing
            ? `${managing.email} · ${managing.unitCode ? `Unit ${managing.unitCode}` : "No unit assigned"} · Balance ${formatMoney(managing.balance)}`
            : undefined
        }
      >
        {managing ? (
          <div className="grid gap-5">
            {managing.status === "pending" ? (
              <form action={approveAction} className="grid gap-3 rounded-card border border-border/50 p-4">
                <p className="text-sm font-semibold text-text-primary">Approve application</p>
                <p className="text-sm text-text-muted">
                  Activates the lease{managing.unitCode ? ` and marks Unit ${managing.unitCode} occupied.` : "."}
                </p>
                <input type="hidden" name="residentId" value={managing.id} />
                <SubmitButton size="sm" className="justify-self-start" pendingLabel="Approving…">
                  Approve
                </SubmitButton>
              </form>
            ) : null}

            {managing.unitId ? (
              <form action={renewAction} className="grid gap-3 rounded-card border border-border/50 p-4">
                <p className="text-sm font-semibold text-text-primary">Renew lease</p>
                <input type="hidden" name="residentId" value={managing.id} />
                <Field label="Extend by">
                  <SelectField name="months" defaultValue="12">
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                  </SelectField>
                </Field>
                <SubmitButton size="sm" className="justify-self-start" pendingLabel="Renewing…">
                  Renew lease
                </SubmitButton>
              </form>
            ) : managing.status !== "blacklisted" ? (
              <form action={assignAction} className="grid gap-3 rounded-card border border-border/50 p-4">
                <p className="text-sm font-semibold text-text-primary">Assign a unit</p>
                <input type="hidden" name="residentId" value={managing.id} />
                <Field label="Vacant unit">
                  <SelectField name="unitId" required defaultValue={vacantUnits[0]?.id ?? ""}>
                    {vacantUnits.length === 0 ? <option value="">No vacant units</option> : null}
                    {vacantUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.label}
                      </option>
                    ))}
                  </SelectField>
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Lease start">
                    <TextField name="leaseStart" type="date" defaultValue={today} required />
                  </Field>
                  <Field label="Term (months)">
                    <SelectField name="leaseMonths" defaultValue="12">
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                    </SelectField>
                  </Field>
                </div>
                <SubmitButton size="sm" className="justify-self-start" pendingLabel="Assigning…">
                  Assign unit
                </SubmitButton>
              </form>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {managing.unitId ? (
                <form action={moveOutAction}>
                  <input type="hidden" name="residentId" value={managing.id} />
                  <SubmitButton variant="secondary" size="sm" pendingLabel="Processing…">
                    Move out
                  </SubmitButton>
                </form>
              ) : null}
              {managing.status !== "blacklisted" ? (
                <form action={blacklistAction} className="grid gap-2">
                  <input type="hidden" name="residentId" value={managing.id} />
                  <input
                    name="reason"
                    placeholder="Reason (optional)"
                    className="h-11 w-full rounded-control border border-border/60 bg-panel px-4 text-sm text-text-primary placeholder:text-text-muted"
                  />
                  <SubmitButton variant="destructive" size="sm" pendingLabel="Updating…">
                    Blacklist resident
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={messaging !== null}
        onClose={() => setMessaging(null)}
        title="Send Message"
        description={
          messaging
            ? messaging.length === 1
              ? `To ${messaging[0].name}`
              : `To ${messaging.length} selected residents`
            : undefined
        }
      >
        {messaging ? (
          <form action={messageAction} className="grid gap-4">
            {messaging.map((resident) => (
              <input key={resident.id} type="hidden" name="residentId" value={resident.id} />
            ))}
            <Field label="Subject">
              <TextField name="subject" placeholder="Reminder: association dues" required />
            </Field>
            <Field label="Message">
              <TextAreaField name="body" placeholder="Write your message…" required />
            </Field>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setMessaging(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
