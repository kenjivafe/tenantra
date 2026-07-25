"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { effectiveStatus, today } from "@/lib/data";
import { periodDueDate } from "@/lib/seed";
import { formatMoney, formatPeriod } from "@/lib/format";
import type { ActionResult, Database, Invoice, InvoiceLine, PaymentMethod } from "@/lib/types";

const METHODS: PaymentMethod[] = ["cash", "bank-transfer", "gcash", "card", "check"];

function nextInvoiceNumber(db: Database, period: string, offset = 0) {
  const sequence = db.invoices.length + 1 + offset;
  return `INV-${period.replace("-", "")}-${String(sequence).padStart(4, "0")}`;
}

function newInvoiceId(db: Database, offset = 0) {
  return `inv-${String(db.invoices.length + 1 + offset).padStart(5, "0")}-${Date.now().toString(36)}`;
}

export async function recordPaymentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const invoiceId = readString(formData, "invoiceId");
  const method = readString(formData, "method") as PaymentMethod;
  const amount = readNumber(formData, "amount");
  const reference = readString(formData, "reference");

  if (!METHODS.includes(method)) return fail("Choose a valid payment method.");
  if (amount <= 0) return fail("Payment amount must be greater than zero.");

  try {
    return withAudit("update", "Billing", (db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found.");
      if (invoice.status === "paid") throw new Error(`${invoice.number} is already settled.`);

      invoice.status = "paid";
      invoice.payment = {
        amount,
        method,
        reference: reference || `PMT-${Date.now().toString().slice(-6)}`,
        at: new Date().toISOString(),
      };

      return {
        result: ok(`Payment of ${formatMoney(amount)} recorded for ${invoice.number}.`),
        description: `Payment ${formatMoney(amount)} recorded for ${invoice.number} (${method})`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not record the payment.");
  }
}

export async function sendReminderAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const invoiceId = readString(formData, "invoiceId");

  try {
    return withAudit("update", "Billing", (db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found.");
      if (invoice.status === "paid") throw new Error(`${invoice.number} is already paid.`);

      invoice.remindersSent += 1;
      invoice.lastReminderAt = new Date().toISOString();
      const resident = db.residents.find((item) => item.id === invoice.residentId);

      return {
        result: ok(`Reminder #${invoice.remindersSent} sent to ${resident?.name ?? "resident"}.`),
        description: `Payment reminder sent for ${invoice.number} to ${resident?.email ?? "resident"}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not send the reminder.");
  }
}

export async function sendBulkRemindersAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const period = readString(formData, "period");
  const asOf = today();

  try {
    return withAudit("update", "Billing", (db) => {
      const targets = db.invoices.filter(
        (invoice) =>
          effectiveStatus(invoice, asOf) === "overdue" && (period ? invoice.period === period : true),
      );
      if (targets.length === 0) throw new Error("No overdue invoices to remind.");

      const now = new Date().toISOString();
      let amount = 0;
      for (const invoice of targets) {
        invoice.remindersSent += 1;
        invoice.lastReminderAt = now;
        amount += invoice.amount;
      }

      return {
        result: ok(`Reminders sent for ${targets.length} overdue invoices (${formatMoney(amount)}).`),
        description: `Bulk reminder sent for ${targets.length} overdue invoices totalling ${formatMoney(amount)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not send reminders.");
  }
}

export async function runBillingCycleAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const period = readString(formData, "period");
  const propertyId = readString(formData, "propertyId");
  const dueDay = Math.min(Math.max(readNumber(formData, "dueDay", 5), 1), 28);
  const includeDues = readString(formData, "includeDues") !== "false";
  const includeParking = readString(formData, "includeParking") === "true";
  const parkingFee = readNumber(formData, "parkingFee", 1500);

  if (!/^\d{4}-\d{2}$/.test(period)) return fail("Select a billing period.");

  try {
    return withAudit("create", "Billing", (db) => {
      const scoped = db.units.filter(
        (unit) =>
          unit.status === "occupied" &&
          unit.residentId !== null &&
          (propertyId && propertyId !== "all" ? unit.propertyId === propertyId : true),
      );

      const alreadyBilled = new Set(
        db.invoices.filter((invoice) => invoice.period === period).map((invoice) => invoice.unitId),
      );
      const pending = scoped.filter((unit) => !alreadyBilled.has(unit.id));

      if (pending.length === 0) {
        throw new Error(`Every eligible unit already has an invoice for ${formatPeriod(period)}.`);
      }

      const dueDate = periodDueDate(period, dueDay);
      const issuedAt = new Date().toISOString();
      let total = 0;

      pending.forEach((unit, index) => {
        const lines: InvoiceLine[] = [{ label: "Monthly rent", amount: unit.rent }];
        if (includeDues) lines.push({ label: "Association dues", amount: unit.dues });
        if (includeParking) lines.push({ label: "Parking slot", amount: parkingFee });
        const amount = lines.reduce((sum, line) => sum + line.amount, 0);
        total += amount;

        const invoice: Invoice = {
          id: newInvoiceId(db, index),
          number: nextInvoiceNumber(db, period, index),
          residentId: unit.residentId,
          unitId: unit.id,
          propertyId: unit.propertyId,
          period,
          lines,
          amount,
          dueDate,
          status: "pending",
          issuedAt,
          payment: null,
          remindersSent: 0,
          lastReminderAt: null,
          note: null,
        };
        db.invoices.push(invoice);
      });

      const scopeLabel =
        propertyId && propertyId !== "all"
          ? (db.properties.find((property) => property.id === propertyId)?.name ?? "selected property")
          : "all properties";

      return {
        result: ok(`Generated ${pending.length} invoices for ${formatPeriod(period)} — ${formatMoney(total)}.`),
        description: `Billing cycle generated for ${formatPeriod(period)} (${scopeLabel}) — ${pending.length} invoices, ${formatMoney(total)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not run the billing cycle.");
  }
}

export async function createInvoiceAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const unitId = readString(formData, "unitId");
  const period = readString(formData, "period");
  const dueDate = readString(formData, "dueDate");
  const note = readString(formData, "note");

  const labels = formData.getAll("lineLabel").map((value) => String(value).trim());
  const amounts = formData.getAll("lineAmount").map((value) => Number(value));
  const lines: InvoiceLine[] = labels
    .map((label, index) => ({ label, amount: amounts[index] }))
    .filter((line) => line.label.length > 0 && Number.isFinite(line.amount) && line.amount > 0);

  if (!unitId) return fail("Select a unit to bill.");
  if (!/^\d{4}-\d{2}$/.test(period)) return fail("Select a billing period.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return fail("Select a due date.");
  if (lines.length === 0) return fail("Add at least one line item with an amount.");

  try {
    return withAudit("create", "Billing", (db) => {
      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");

      const amount = lines.reduce((sum, line) => sum + line.amount, 0);
      const invoice: Invoice = {
        id: newInvoiceId(db),
        number: nextInvoiceNumber(db, period),
        residentId: unit.residentId,
        unitId: unit.id,
        propertyId: unit.propertyId,
        period,
        lines,
        amount,
        dueDate,
        status: "pending",
        issuedAt: new Date().toISOString(),
        payment: null,
        remindersSent: 0,
        lastReminderAt: null,
        note: note || null,
      };
      db.invoices.push(invoice);
      const resident = db.residents.find((item) => item.id === unit.residentId);

      return {
        result: ok(`${invoice.number} created for Unit ${unit.code} — ${formatMoney(amount)}.`),
        description: `Created manual invoice ${invoice.number} for ${resident?.name ?? `Unit ${unit.code}`} — ${formatMoney(amount)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create the invoice.");
  }
}

export async function voidInvoiceAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const invoiceId = readString(formData, "invoiceId");

  try {
    return withAudit("update", "Billing", (db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found.");
      if (invoice.status === "paid") throw new Error("Paid invoices cannot be voided.");

      invoice.status = "void";
      return {
        result: ok(`${invoice.number} voided.`),
        description: `Voided invoice ${invoice.number}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not void the invoice.");
  }
}
