"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { periodDueDate } from "@/lib/seed";
import { formatDate, formatMoney } from "@/lib/format";
import type { ActionResult, Cheque, Database, PaymentMethod, Tenant } from "@/lib/types";

const METHODS: PaymentMethod[] = ["cash", "gcash", "pdc", "bank-transfer"];

function addMonthsIso(iso: string, months: number) {
  const date = new Date(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function periodOf(iso: string) {
  return iso.slice(0, 7);
}

/** Issues the post-dated cheque schedule for a PDC tenant across the lease term. */
function issueCheques(db: Database, tenant: Tenant) {
  if (tenant.paymentMode !== "pdc" || !tenant.unitId || !tenant.leaseStart) return 0;
  const bank = readBank();
  for (let i = 0; i < tenant.termMonths; i += 1) {
    const monthIso = addMonthsIso(tenant.leaseStart, i);
    const cheque: Cheque = {
      id: `chk-${String(db.cheques.length + 1).padStart(5, "0")}-${Date.now().toString(36)}${i}`,
      tenantId: tenant.id,
      unitId: tenant.unitId,
      chequeNo: `${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`,
      bank,
      amount: tenant.monthlyRent,
      dueDate: periodDueDate(periodOf(monthIso), tenant.dueDay),
      period: periodOf(monthIso),
      status: "pending",
      billId: null,
    };
    db.cheques.push(cheque);
  }
  return tenant.termMonths;
}

function readBank() {
  return ["BDO", "BPI", "Metrobank", "Landbank", "UnionBank"][Math.floor(Math.random() * 5)];
}

export async function createTenantAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const phone = readString(formData, "phone");
  const homeAddress = readString(formData, "homeAddress");
  const unitId = readString(formData, "unitId");
  const leaseStart = readString(formData, "leaseStart");
  const paymentMode = readString(formData, "paymentMode") as PaymentMethod;
  const dueDay = Math.min(Math.max(readNumber(formData, "dueDay", 15), 1), 28);

  if (name.length < 2) return fail("Enter the tenant's full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (!unitId) return fail("Select a unit to assign.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(leaseStart)) return fail("Select a lease start date.");
  if (!METHODS.includes(paymentMode)) return fail("Choose a payment mode.");

  try {
    const result = withAudit("create", "Tenants", (db) => {
      if (db.tenants.some((tenant) => tenant.email.toLowerCase() === email.toLowerCase())) {
        throw new Error(`${email} is already registered.`);
      }
      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");
      if (unit.tenantId) throw new Error(`Unit ${unit.code} is already occupied.`);

      // Long-term units use a residential lease; short-term use an accommodation agreement.
      const contractType = unit.tenancy === "long-term" ? "residential" : "accommodation";
      const termMonths = unit.tenancy === "long-term" ? 12 : 1;

      const tenant: Tenant = {
        id: `ten-${String(db.tenants.length + 1).padStart(4, "0")}-${Date.now().toString(36)}`,
        name,
        email,
        phone: phone || "—",
        homeAddress: homeAddress || "—",
        unitId: unit.id,
        lessor: unit.owner,
        contractType,
        leaseStart,
        leaseEnd: addMonthsIso(leaseStart, termMonths),
        termMonths,
        monthlyRent: unit.rent,
        dueDay,
        depositAmount: unit.rent * unit.depositMonths,
        advanceAmount: unit.rent * unit.advanceMonths,
        paymentMode,
        inventory: unit.inventory,
        status: "current",
        createdAt: new Date().toISOString(),
      };

      db.tenants.push(tenant);
      unit.tenantId = tenant.id;
      unit.status = "occupied";

      const chequeCount = issueCheques(db, tenant);
      const contractLabel = contractType === "residential" ? "residential lease" : "accommodation agreement";

      return {
        result: { ...ok(`${name} onboarded to Unit ${unit.code}. Contract generated.`), id: tenant.id },
        description: `Onboarded ${name} to Unit ${unit.code}, generated ${contractLabel}${
          chequeCount ? ` and ${chequeCount} PDCs` : ""
        }`,
      };
    });
    return result;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not onboard the tenant.");
  }
}

export async function updateTenantAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");
  const phone = readString(formData, "phone");
  const email = readString(formData, "email");
  const homeAddress = readString(formData, "homeAddress");
  const paymentMode = readString(formData, "paymentMode") as PaymentMethod;

  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (!METHODS.includes(paymentMode)) return fail("Choose a payment mode.");

  try {
    return withAudit("update", "Tenants", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant) throw new Error("Tenant not found.");

      tenant.phone = phone || tenant.phone;
      tenant.email = email;
      tenant.homeAddress = homeAddress || tenant.homeAddress;
      tenant.paymentMode = paymentMode;

      return { result: ok(`${tenant.name}'s details updated.`), description: `Updated contact details for ${tenant.name}` };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the tenant.");
  }
}

export async function renewLeaseAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");
  const months = readNumber(formData, "months", 12);

  if (months < 1) return fail("Renewal term must be at least one month.");

  try {
    return withAudit("update", "Tenants", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant) throw new Error("Tenant not found.");
      if (!tenant.unitId || !tenant.leaseEnd) throw new Error(`${tenant.name} has no active lease to renew.`);

      const base = tenant.leaseEnd < new Date().toISOString().slice(0, 10) ? new Date().toISOString().slice(0, 10) : tenant.leaseEnd;
      const previousEnd = tenant.leaseEnd;
      tenant.leaseEnd = addMonthsIso(base, months);
      tenant.status = "current";

      return {
        result: ok(`${tenant.name}'s lease extended to ${formatDate(tenant.leaseEnd)}.`),
        description: `Renewed lease for ${tenant.name}: ${formatDate(previousEnd)} → ${formatDate(tenant.leaseEnd)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not renew the lease.");
  }
}

export async function endTenancyAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");

  try {
    return withAudit("update", "Tenants", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant) throw new Error("Tenant not found.");

      const unit = tenant.unitId ? db.units.find((item) => item.id === tenant.unitId) : null;
      if (unit) {
        unit.tenantId = null;
        unit.status = "vacant";
      }
      // Void the tenant's remaining pending cheques.
      for (const cheque of db.cheques) {
        if (cheque.tenantId === tenant.id && cheque.status === "pending") cheque.status = "bounced";
      }
      tenant.unitId = null;
      tenant.status = "ended";

      return {
        result: ok(`${tenant.name}'s tenancy ended${unit ? ` — Unit ${unit.code} is now vacant.` : "."}`),
        description: unit ? `Ended tenancy for ${tenant.name}; Unit ${unit.code} released` : `Ended tenancy for ${tenant.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not end the tenancy.");
  }
}

export async function messageTenantsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantIds = formData.getAll("tenantId").map(String).filter(Boolean);
  const subject = readString(formData, "subject");
  const body = readString(formData, "body");

  if (!subject) return fail("Add a subject line.");
  if (body.length < 5) return fail("Message body is too short.");
  if (tenantIds.length === 0) return fail("Select at least one recipient.");

  try {
    return withAudit("create", "Tenants", (db) => {
      const names = tenantIds
        .map((id) => db.tenants.find((tenant) => tenant.id === id)?.name)
        .filter(Boolean) as string[];
      if (names.length === 0) throw new Error("No matching tenants found.");
      return {
        result: ok(`"${subject}" queued for ${names.length} tenant${names.length === 1 ? "" : "s"}.`),
        description: `Message "${subject}" sent to ${names.length} tenant(s)`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not send the message.");
  }
}

export async function recordDepositAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const tenantId = readString(formData, "tenantId");

  try {
    return withAudit("update", "Tenants", (db) => {
      const tenant = db.tenants.find((item) => item.id === tenantId);
      if (!tenant) throw new Error("Tenant not found.");
      const total = tenant.depositAmount + tenant.advanceAmount;
      return {
        result: ok(`Move-in payment of ${formatMoney(total)} acknowledged for ${tenant.name}.`),
        description: `Recorded move-in advance + deposit ${formatMoney(total)} for ${tenant.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not record the deposit.");
  }
}
