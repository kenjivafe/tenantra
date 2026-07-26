"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { effectiveStatus, today } from "@/lib/data";
import { periodDueDate } from "@/lib/seed";
import { formatMoney, formatPeriod } from "@/lib/format";
import type { ActionResult, Bill, Database, PaymentMethod } from "@/lib/types";

const METHODS: PaymentMethod[] = ["cash", "gcash", "pdc", "bank-transfer"];

function newBillId(db: Database, offset = 0) {
  return `bill-${String(db.bills.length + 1 + offset).padStart(5, "0")}-${Date.now().toString(36)}`;
}

function billNumber(db: Database, period: string, offset = 0) {
  return `BILL-${period.replace("-", "")}-${String(db.bills.length + 1 + offset).padStart(4, "0")}`;
}

export async function runBillingCycleAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const period = readString(formData, "period");
  const locationId = readString(formData, "locationId");

  if (!/^\d{4}-\d{2}$/.test(period)) return fail("Select a billing period.");

  try {
    return withAudit("create", "Billing", (db) => {
      const scoped = db.units.filter(
        (unit) =>
          unit.status === "occupied" &&
          unit.tenantId !== null &&
          (locationId && locationId !== "all" ? unit.locationId === locationId : true),
      );

      const alreadyBilled = new Set(db.bills.filter((bill) => bill.period === period).map((bill) => bill.unitId));
      const pending = scoped.filter((unit) => !alreadyBilled.has(unit.id));
      if (pending.length === 0) throw new Error(`Every occupied unit already has a bill for ${formatPeriod(period)}.`);

      const issuedAt = new Date().toISOString();
      let total = 0;

      pending.forEach((unit, index) => {
        const tenant = db.tenants.find((item) => item.id === unit.tenantId);
        if (!tenant) return;
        const dueDate = periodDueDate(period, tenant.dueDay);
        const bill: Bill = {
          id: newBillId(db, index),
          number: billNumber(db, period, index),
          tenantId: tenant.id,
          unitId: unit.id,
          locationId: unit.locationId,
          period,
          rent: tenant.monthlyRent,
          electric: 0,
          water: 0,
          other: 0,
          otherLabel: null,
          amount: tenant.monthlyRent,
          dueDate,
          issuedAt,
          status: "pending",
          payment: null,
          note: "Rent only — add electric/water readings before sending.",
        };
        db.bills.push(bill);
        total += bill.amount;
      });

      const scopeLabel =
        locationId && locationId !== "all"
          ? (db.locations.find((location) => location.id === locationId)?.name ?? "location")
          : "all locations";

      return {
        result: ok(`Generated ${pending.length} rent bills for ${formatPeriod(period)} — add utilities per unit.`),
        description: `Ran billing cycle for ${formatPeriod(period)} (${scopeLabel}) — ${pending.length} bills, ${formatMoney(total)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not run the billing cycle.");
  }
}

export async function createBillAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");
  const period = readString(formData, "period");
  const rent = readNumber(formData, "rent");
  const electric = readNumber(formData, "electric");
  const water = readNumber(formData, "water");
  const other = readNumber(formData, "other");
  const otherLabel = readString(formData, "otherLabel");

  if (!tenantId) return fail("Select a tenant to bill.");
  if (!/^\d{4}-\d{2}$/.test(period)) return fail("Select a billing period.");
  if (rent < 0 || electric < 0 || water < 0 || other < 0) return fail("Amounts cannot be negative.");
  if (rent + electric + water + other <= 0) return fail("Enter at least one charge.");

  try {
    return withAudit("create", "Billing", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant || !tenant.unitId) throw new Error("Tenant has no assigned unit.");
      const unit = db.units.find((item) => item.id === tenant.unitId);
      if (!unit) throw new Error("Unit not found.");

      const amount = rent + electric + water + other;
      const bill: Bill = {
        id: newBillId(db),
        number: billNumber(db, period),
        tenantId: tenant.id,
        unitId: unit.id,
        locationId: unit.locationId,
        period,
        rent,
        electric,
        water,
        other,
        otherLabel: other > 0 ? otherLabel || "Other charge" : null,
        amount,
        dueDate: periodDueDate(period, tenant.dueDay),
        issuedAt: new Date().toISOString(),
        status: "pending",
        payment: null,
        note: null,
      };
      db.bills.push(bill);

      return {
        result: ok(`${bill.number} created for ${tenant.name} — ${formatMoney(amount)}.`),
        description: `Created bill ${bill.number} for ${tenant.name} — rent ${formatMoney(rent)}, electric ${formatMoney(
          electric,
        )}, water ${formatMoney(water)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create the bill.");
  }
}

export async function updateBillAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const billId = readString(formData, "billId");
  const electric = readNumber(formData, "electric");
  const water = readNumber(formData, "water");
  const other = readNumber(formData, "other");
  const otherLabel = readString(formData, "otherLabel");

  if (electric < 0 || water < 0 || other < 0) return fail("Amounts cannot be negative.");

  try {
    return withAudit("update", "Billing", (db) => {
      const bill = db.bills.find((item) => item.id === billId);
      if (!bill) throw new Error("Bill not found.");
      if (bill.status === "paid") throw new Error(`${bill.number} is already settled.`);

      bill.electric = electric;
      bill.water = water;
      bill.other = other;
      bill.otherLabel = other > 0 ? otherLabel || "Other charge" : null;
      bill.amount = bill.rent + electric + water + other;
      bill.note = null;

      return {
        result: ok(`${bill.number} updated — ${formatMoney(bill.amount)}.`),
        description: `Updated utilities on ${bill.number}: electric ${formatMoney(electric)}, water ${formatMoney(water)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the bill.");
  }
}

export async function recordPaymentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const billId = readString(formData, "billId");
  const method = readString(formData, "method") as PaymentMethod;
  const reference = readString(formData, "reference");

  if (!METHODS.includes(method)) return fail("Choose a payment method.");

  try {
    return withAudit("update", "Billing", (db) => {
      const bill = db.bills.find((item) => item.id === billId);
      if (!bill) throw new Error("Bill not found.");
      if (bill.status === "paid") throw new Error(`${bill.number} is already settled.`);

      bill.status = "paid";
      bill.payment = {
        method,
        reference: reference || `${method === "pdc" ? "CHK" : "REF"}-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        chequeId: null,
      };
      const tenant = db.tenants.find((item) => item.id === bill.tenantId);
      // Clearing all dues lifts the tenant out of overdue.
      if (tenant && !db.bills.some((item) => item.tenantId === tenant.id && effectiveStatus(item, today()) === "overdue")) {
        tenant.status = "current";
      }

      return {
        result: ok(`Payment of ${formatMoney(bill.amount)} recorded for ${bill.number}.`),
        description: `Payment ${formatMoney(bill.amount)} recorded for ${bill.number} (${method})`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not record the payment.");
  }
}

export async function voidBillAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const billId = readString(formData, "billId");

  try {
    return withAudit("update", "Billing", (db) => {
      const bill = db.bills.find((item) => item.id === billId);
      if (!bill) throw new Error("Bill not found.");
      if (bill.status === "paid") throw new Error("Paid bills cannot be voided.");
      bill.status = "void";
      return { result: ok(`${bill.number} voided.`), description: `Voided bill ${bill.number}` };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not void the bill.");
  }
}

export async function markChequeAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const chequeId = readString(formData, "chequeId");
  const status = readString(formData, "status") as "deposited" | "bounced";

  if (status !== "deposited" && status !== "bounced") return fail("Choose deposited or bounced.");

  try {
    return withAudit("update", "Billing", (db) => {
      const cheque = db.cheques.find((item) => item.id === chequeId);
      if (!cheque) throw new Error("Cheque not found.");
      const tenant = db.tenants.find((item) => item.id === cheque.tenantId);
      cheque.status = status;

      // Settle or reopen the matching period's bill.
      const bill = db.bills.find(
        (item) => item.tenantId === cheque.tenantId && item.period === cheque.period && item.status !== "void",
      );
      if (status === "deposited" && bill && bill.status !== "paid") {
        bill.status = "paid";
        bill.payment = { method: "pdc", reference: `CHK-${cheque.chequeNo}`, date: new Date().toISOString(), chequeId: cheque.id };
      }
      if (status === "bounced") {
        if (bill && bill.payment?.chequeId === cheque.id) {
          bill.status = "overdue";
          bill.payment = null;
        }
        if (tenant) tenant.status = "overdue";
      }

      return {
        result: ok(`Cheque ${cheque.chequeNo} marked ${status}.`),
        description: `Cheque ${cheque.chequeNo} (${cheque.bank}) marked ${status} for ${tenant?.name ?? "tenant"} — ${formatMoney(
          cheque.amount,
        )}`,
        // Bounced cheques are recorded as a failed action for visibility in the log.
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the cheque.");
  }
}
