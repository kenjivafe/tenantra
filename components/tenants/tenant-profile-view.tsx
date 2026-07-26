"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, InlineSubmit, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import { markChequeAction, recordPaymentAction, updateBillAction } from "@/lib/actions/billing";
import { createImprovementAction } from "@/lib/actions/improvements";
import { endTenancyAction, renewLeaseAction, updateTenantAction } from "@/lib/actions/tenants";
import type { TenantProfile } from "@/lib/data";
import { formatDate, formatMoney, formatPeriod, titleCase } from "@/lib/format";

const METHODS = ["cash", "gcash", "pdc", "bank-transfer"] as const;

export function TenantProfileView({ profile }: { profile: TenantProfile }) {
  const { tenant, unit, locationName, bills, cheques, improvements, balance, totalPaid, nextDue, currentBill } = profile;

  const [payBill, setPayBill] = useState<TenantProfile["bills"][number] | null>(null);
  const [editBill, setEditBill] = useState<TenantProfile["bills"][number] | null>(null);
  const [manage, setManage] = useState<"none" | "renew" | "edit" | "end" | "improve">("none");

  const [payState, payAction] = useActionState(recordPaymentAction, null);
  const [billState, billAction] = useActionState(updateBillAction, null);
  const [chequeState, chequeAction] = useActionState(markChequeAction, null);
  const [renewState, renewAction] = useActionState(renewLeaseAction, null);
  const [editState, editAction] = useActionState(updateTenantAction, null);
  const [endState, endAction] = useActionState(endTenancyAction, null);
  const [improveState, improveAction] = useActionState(createImprovementAction, null);

  const closeManage = () => setManage("none");
  useActionToast(payState, () => setPayBill(null));
  useActionToast(billState, () => setEditBill(null));
  useActionToast(chequeState);
  useActionToast(renewState, closeManage);
  useActionToast(editState, closeManage);
  useActionToast(endState, closeManage);
  useActionToast(improveState, closeManage);

  const moveInTotal = tenant.depositAmount + tenant.advanceAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-sidebar" padding="md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/tenants" className="text-sm font-semibold text-accent hover:underline">
              ← All tenants
            </Link>
            <h2 className="mt-2 text-3xl font-semibold font-display text-text-primary">{tenant.name}</h2>
            <p className="mt-1 text-sm text-text-muted">
              {unit ? `Unit ${unit.code}, ${locationName}` : "No unit assigned"} · Lessor: {tenant.lessor}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tenant.status} />
            <a
              href={`/contracts/${tenant.id}`}
              className="inline-flex h-11 items-center rounded-control border border-border bg-panel px-5 text-sm font-semibold text-text-primary transition hover:bg-accentSoft"
            >
              ⬇ Download contract
            </a>
            <Button variant="secondary" onClick={() => setManage("edit")}>
              Edit
            </Button>
          </div>
        </div>
      </Card>

      {/* Key figures the client asked to see at a glance */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Monthly Rent" value={formatMoney(tenant.monthlyRent)} sub={`Due every ${tenant.dueDay}th`} />
        <Tile
          label="Lease Due"
          value={nextDue ? formatMoney(nextDue.amount) : "₱0"}
          sub={nextDue ? `Due ${formatDate(nextDue.date)}` : "Fully paid"}
          tone={nextDue ? "danger" : "success"}
        />
        <Tile label="Electric Bill" value={formatMoney(currentBill?.electric ?? 0)} sub={unit ? `Meter ${unit.electricMeterNo}` : ""} />
        <Tile label="Water Bill" value={formatMoney(currentBill?.water ?? 0)} sub={unit ? `Meter ${unit.waterMeterNo}` : ""} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Left column — information */}
        <div className="space-y-6">
          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Tenant Information</h3>
            <dl className="grid gap-2.5 text-sm">
              <Info k="Email" v={tenant.email} />
              <Info k="Contact" v={tenant.phone} />
              <Info k="Home Address" v={tenant.homeAddress} />
              <Info k="Tenant Since" v={formatDate(tenant.leaseStart)} />
              <Info k="Mode of Payment" v={titleCase(tenant.paymentMode)} />
            </dl>
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Lease Information</h3>
            <dl className="grid gap-2.5 text-sm">
              <Info k="Contract Type" v={tenant.contractType === "residential" ? "Residential (Long-term)" : "Accommodation (Short-term)"} />
              <Info k="Lease Start" v={formatDate(tenant.leaseStart)} />
              <Info k="Lease End" v={formatDate(tenant.leaseEnd)} />
              <Info k="Term" v={`${tenant.termMonths} month(s)`} />
              <Info k="Category" v={unit ? titleCase(unit.category) : "—"} />
            </dl>
            <div className="mt-4 flex gap-3">
              <Button size="sm" variant="secondary" onClick={() => setManage("renew")}>
                Renew lease
              </Button>
              {tenant.unitId ? (
                <Button size="sm" variant="ghost" onClick={() => setManage("end")}>
                  End tenancy
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Security Deposit &amp; Advance</h3>
            <dl className="grid gap-2.5 text-sm">
              <Info k="Advance Rental (1 mo)" v={formatMoney(tenant.advanceAmount)} />
              <Info k="Security Deposit (1 mo)" v={formatMoney(tenant.depositAmount)} />
              <div className="flex justify-between border-t border-border/40 pt-2 font-semibold">
                <dt className="text-text-primary">Total Paid at Move-in</dt>
                <dd className="text-status-success">{formatMoney(moveInTotal)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="bg-panel" padding="md">
            <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Payment Summary</h3>
            <dl className="grid gap-2.5 text-sm">
              <Info k="Total Paid to Date" v={formatMoney(totalPaid)} />
              <Info k="Total Outstanding" v={formatMoney(balance)} />
              <div className="flex justify-between border-t border-border/40 pt-2 font-semibold">
                <dt className="text-text-primary">Account Balance</dt>
                <dd className={balance > 0 ? "text-status-danger" : "text-status-success"}>{formatMoney(balance)}</dd>
              </div>
            </dl>
          </Card>

          {tenant.inventory.length > 0 ? (
            <Card className="bg-panel" padding="md">
              <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Leased Premises &amp; Inventory</h3>
              <ul className="grid gap-2 text-sm text-text-secondary">
                {tenant.inventory.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>

        {/* Right column — ledger, PDC, improvements */}
        <div className="space-y-6">
          <Card className="bg-panel" padding="md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold font-display text-text-primary">Bills &amp; Account Ledger</h3>
              {nextDue ? (
                <span className="text-sm text-text-muted">
                  Next due {formatDate(nextDue.date)} · {formatMoney(nextDue.amount)}
                </span>
              ) : null}
            </div>
            <TableShell className="min-w-0">
              <thead>
                <tr className="border-b border-border/40">
                  <Th>Bill</Th>
                  <Th>Rent</Th>
                  <Th>Elec</Th>
                  <Th>Water</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <EmptyRow colSpan={7} message="No bills yet." />
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="border-b border-border/20">
                      <Td className="font-medium">
                        {formatPeriod(bill.period)}
                        <span className="block text-xs text-text-muted">{bill.number}</span>
                      </Td>
                      <Td>{formatMoney(bill.rent)}</Td>
                      <Td>{formatMoney(bill.electric)}</Td>
                      <Td>{formatMoney(bill.water)}</Td>
                      <Td className="font-semibold">{formatMoney(bill.amount)}</Td>
                      <Td>
                        <StatusBadge status={bill.status} />
                      </Td>
                      <Td>
                        {bill.status === "paid" || bill.status === "void" ? (
                          <span className="text-xs text-text-muted">{bill.payment ? titleCase(bill.payment.method) : "—"}</span>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setEditBill(bill)}
                              className="text-sm font-medium text-accent transition hover:underline"
                            >
                              Utilities
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayBill(bill)}
                              className="text-sm font-medium text-accent transition hover:underline"
                            >
                              Pay
                            </button>
                          </div>
                        )}
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableShell>
          </Card>

          {cheques.length > 0 ? (
            <Card className="bg-panel" padding="md">
              <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">
                Post-Dated Cheque Schedule ({tenant.paymentMode === "pdc" ? cheques.length : 0})
              </h3>
              <TableShell className="min-w-0">
                <thead>
                  <tr className="border-b border-border/40">
                    <Th>Deposit On</Th>
                    <Th>For</Th>
                    <Th>Cheque #</Th>
                    <Th>Bank</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {cheques.map((cheque) => (
                    <tr key={cheque.id} className="border-b border-border/20">
                      <Td>{formatDate(cheque.dueDate)}</Td>
                      <Td>{formatPeriod(cheque.period)}</Td>
                      <Td className="font-medium">{cheque.chequeNo}</Td>
                      <Td>{cheque.bank}</Td>
                      <Td>{formatMoney(cheque.amount)}</Td>
                      <Td>
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
                        ) : cheque.status === "deposited" ? (
                          <span className="text-xs text-status-success">Cleared</span>
                        ) : (
                          <form action={chequeAction} className="inline">
                            <input type="hidden" name="chequeId" value={cheque.id} />
                            <input type="hidden" name="status" value="deposited" />
                            <InlineSubmit pendingLabel="…">Re-deposit</InlineSubmit>
                          </form>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </Card>
          ) : null}

          <Card className="bg-panel" padding="md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold font-display text-text-primary">Improvement Requests</h3>
              {tenant.unitId ? (
                <Button size="sm" variant="secondary" onClick={() => setManage("improve")}>
                  New request
                </Button>
              ) : null}
            </div>
            {improvements.length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">No improvement requests yet.</p>
            ) : (
              <ul className="space-y-3">
                {improvements.map((request) => (
                  <li key={request.id} className="rounded-card border border-border/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{request.title}</p>
                        <p className="mt-1 text-sm text-text-muted">{request.description}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                      <span>Est. {formatMoney(request.estimatedCost)}</span>
                      <a href={`/improvements/${request.id}/letter`} className="font-semibold text-accent hover:underline">
                        ⬇ Download letter
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Record payment */}
      <Modal
        open={payBill !== null}
        onClose={() => setPayBill(null)}
        title="Record Payment"
        description={payBill ? `${payBill.number} · ${formatMoney(payBill.amount)}` : undefined}
      >
        {payBill ? (
          <form action={payAction} className="grid gap-4">
            <input type="hidden" name="billId" value={payBill.id} />
            <Field label="Payment method">
              <SelectField name="method" defaultValue={tenant.paymentMode}>
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {titleCase(method)}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Reference / cheque no." hint="Optional — generated automatically when left blank.">
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

      {/* Edit utilities */}
      <Modal
        open={editBill !== null}
        onClose={() => setEditBill(null)}
        title="Electric & Water"
        description={editBill ? `${editBill.number} · rent ${formatMoney(editBill.rent)}` : undefined}
      >
        {editBill ? (
          <form action={billAction} className="grid gap-4">
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
                <TextField name="otherLabel" placeholder="Parking, repairs…" defaultValue={editBill.otherLabel ?? ""} />
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

      {/* Renew */}
      <Modal open={manage === "renew"} onClose={closeManage} title="Renew Lease" description={tenant.name}>
        <form action={renewAction} className="grid gap-4">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <Field label="Extend by">
            <SelectField name="months" defaultValue="12">
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
            </SelectField>
          </Field>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeManage}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Renewing…">Renew lease</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Edit contact */}
      <Modal open={manage === "edit"} onClose={closeManage} title="Edit Tenant" description={tenant.name}>
        <form action={editAction} className="grid gap-4">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <Field label="Email">
            <TextField name="email" type="email" defaultValue={tenant.email} required />
          </Field>
          <Field label="Contact number">
            <TextField name="phone" defaultValue={tenant.phone} />
          </Field>
          <Field label="Home address">
            <TextField name="homeAddress" defaultValue={tenant.homeAddress} />
          </Field>
          <Field label="Payment mode">
            <SelectField name="paymentMode" defaultValue={tenant.paymentMode}>
              {METHODS.map((method) => (
                <option key={method} value={method}>
                  {titleCase(method)}
                </option>
              ))}
            </SelectField>
          </Field>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeManage}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* End tenancy */}
      <Modal open={manage === "end"} onClose={closeManage} title="End Tenancy" description={tenant.name}>
        <p className="text-sm text-text-secondary">
          This releases {unit ? `Unit ${unit.code}` : "the unit"} back to vacant and voids any pending post-dated cheques.
          This can be reversed by re-onboarding the tenant.
        </p>
        <form action={endAction} className="mt-4 flex justify-end gap-3">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <Button variant="secondary" onClick={closeManage}>
            Cancel
          </Button>
          <SubmitButton variant="destructive" pendingLabel="Processing…">
            End tenancy
          </SubmitButton>
        </form>
      </Modal>

      {/* New improvement */}
      <Modal open={manage === "improve"} onClose={closeManage} title="Request Improvement" description="Requires owner approval before any work.">
        <form action={improveAction} className="grid gap-4">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <Field label="Title">
            <TextField name="title" placeholder="Install exhaust hood" required />
          </Field>
          <Field label="Description">
            <TextAreaField name="description" placeholder="Describe the improvement and why it's needed…" required />
          </Field>
          <Field label="Estimated cost">
            <TextField name="estimatedCost" type="number" min="0" step="100" defaultValue={0} />
          </Field>
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={closeManage}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Submitting…">Submit request</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "danger" | "success" }) {
  return (
    <Card className="bg-panel" padding="sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p
        className={`mt-3 text-2xl font-semibold font-display ${
          tone === "danger" ? "text-status-danger" : tone === "success" ? "text-status-success" : "text-text-primary"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-text-muted">{sub}</p> : null}
    </Card>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-muted">{k}</dt>
      <dd className="text-right font-medium text-text-primary">{v}</dd>
    </div>
  );
}
