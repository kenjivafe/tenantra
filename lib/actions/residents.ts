"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { formatDate } from "@/lib/format";
import type { ActionResult, Resident } from "@/lib/types";

function addMonthsIso(iso: string, months: number) {
  const date = new Date(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

export async function createResidentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = readString(formData, "name");
  const email = readString(formData, "email");
  const phone = readString(formData, "phone");
  const unitId = readString(formData, "unitId");
  const leaseStart = readString(formData, "leaseStart");
  const leaseMonths = readNumber(formData, "leaseMonths", 12);

  if (name.length < 2) return fail("Enter the resident's full name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Enter a valid email address.");
  if (unitId && !/^\d{4}-\d{2}-\d{2}$/.test(leaseStart)) return fail("Select a lease start date.");

  try {
    return withAudit("create", "Residents", (db) => {
      if (db.residents.some((resident) => resident.email.toLowerCase() === email.toLowerCase())) {
        throw new Error(`${email} is already registered.`);
      }

      const unit = unitId ? db.units.find((item) => item.id === unitId) : null;
      if (unitId && !unit) throw new Error("Unit not found.");
      if (unit && unit.residentId) throw new Error(`Unit ${unit.code} is already occupied.`);

      const resident: Resident = {
        id: `res-${String(db.residents.length + 1).padStart(4, "0")}-${Date.now().toString(36)}`,
        name,
        email,
        phone: phone || "—",
        unitId: unit?.id ?? null,
        leaseStart: unit ? leaseStart : null,
        leaseEnd: unit ? addMonthsIso(leaseStart, leaseMonths) : null,
        status: unit ? "active" : "pending",
        createdAt: new Date().toISOString(),
      };

      db.residents.push(resident);
      if (unit) {
        unit.residentId = resident.id;
        unit.status = "occupied";
      }

      return {
        result: ok(unit ? `${name} added to Unit ${unit.code}.` : `${name} added without a unit assignment.`),
        description: unit ? `Added resident ${name} to Unit ${unit.code}` : `Added resident ${name} (no unit assigned)`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add the resident.");
  }
}

export async function assignUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentId = readString(formData, "residentId");
  const unitId = readString(formData, "unitId");
  const leaseStart = readString(formData, "leaseStart");
  const leaseMonths = readNumber(formData, "leaseMonths", 12);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(leaseStart)) return fail("Select a lease start date.");

  try {
    return withAudit("update", "Residents", (db) => {
      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Resident not found.");
      if (resident.status === "blacklisted") throw new Error(`${resident.name} is blacklisted and cannot lease a unit.`);

      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");
      if (unit.residentId && unit.residentId !== resident.id) throw new Error(`Unit ${unit.code} is already occupied.`);

      const previous = resident.unitId ? db.units.find((item) => item.id === resident.unitId) : null;
      if (previous && previous.id !== unit.id) {
        previous.residentId = null;
        previous.status = "vacant";
      }

      resident.unitId = unit.id;
      resident.leaseStart = leaseStart;
      resident.leaseEnd = addMonthsIso(leaseStart, leaseMonths);
      resident.status = "active";
      unit.residentId = resident.id;
      unit.status = "occupied";

      return {
        result: ok(`${resident.name} assigned to Unit ${unit.code}.`),
        description: `Assigned ${resident.name} to Unit ${unit.code} (lease ${formatDate(resident.leaseStart)} – ${formatDate(resident.leaseEnd)})`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not assign the unit.");
  }
}

export async function renewLeaseAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentId = readString(formData, "residentId");
  const months = readNumber(formData, "months", 12);

  if (months < 1) return fail("Renewal term must be at least one month.");

  try {
    return withAudit("update", "Residents", (db) => {
      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Resident not found.");
      if (!resident.unitId || !resident.leaseEnd) throw new Error(`${resident.name} has no active lease to renew.`);

      const base = resident.leaseEnd < new Date().toISOString().slice(0, 10)
        ? new Date().toISOString().slice(0, 10)
        : resident.leaseEnd;

      const previousEnd = resident.leaseEnd;
      resident.leaseEnd = addMonthsIso(base, months);
      resident.status = "active";

      return {
        result: ok(`${resident.name}'s lease extended to ${formatDate(resident.leaseEnd)}.`),
        description: `Renewed lease for ${resident.name}: ${formatDate(previousEnd)} → ${formatDate(resident.leaseEnd)}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not renew the lease.");
  }
}

export async function approveResidentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentId = readString(formData, "residentId");

  try {
    return withAudit("update", "Residents", (db) => {
      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Resident not found.");
      if (resident.status !== "pending") throw new Error(`${resident.name} is not awaiting approval.`);

      resident.status = "active";
      const unit = resident.unitId ? db.units.find((item) => item.id === resident.unitId) : null;
      if (unit) unit.status = "occupied";

      return {
        result: ok(`${resident.name}'s application approved.`),
        description: unit
          ? `Approved application for ${resident.name} — Unit ${unit.code} moved to Occupied`
          : `Approved application for ${resident.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not approve the application.");
  }
}

export async function moveOutResidentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentId = readString(formData, "residentId");

  try {
    return withAudit("update", "Residents", (db) => {
      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Resident not found.");

      const unit = resident.unitId ? db.units.find((item) => item.id === resident.unitId) : null;
      if (unit) {
        unit.residentId = null;
        unit.status = "vacant";
      }
      resident.unitId = null;
      resident.status = "moved-out";

      return {
        result: ok(`${resident.name} moved out${unit ? ` — Unit ${unit.code} is now vacant.` : "."}`),
        description: unit
          ? `Moved out ${resident.name}; Unit ${unit.code} released to Vacant`
          : `Moved out ${resident.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not process the move-out.");
  }
}

export async function blacklistResidentAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentId = readString(formData, "residentId");
  const reason = readString(formData, "reason");

  try {
    return withAudit("update", "Residents", (db) => {
      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Resident not found.");

      const unit = resident.unitId ? db.units.find((item) => item.id === resident.unitId) : null;
      if (unit) {
        unit.residentId = null;
        unit.status = "vacant";
      }
      resident.unitId = null;
      resident.status = "blacklisted";

      return {
        result: ok(`${resident.name} added to the blacklist.`),
        description: `Blacklisted ${resident.name}${reason ? ` — ${reason}` : ""}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not blacklist the resident.");
  }
}

export async function messageResidentsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const residentIds = formData.getAll("residentId").map(String).filter(Boolean);
  const subject = readString(formData, "subject");
  const body = readString(formData, "body");

  if (!subject) return fail("Add a subject line.");
  if (body.length < 5) return fail("Message body is too short.");
  if (residentIds.length === 0) return fail("Select at least one recipient.");

  try {
    return withAudit("create", "Residents", (db) => {
      const names = residentIds
        .map((id) => db.residents.find((resident) => resident.id === id)?.name)
        .filter(Boolean) as string[];
      if (names.length === 0) throw new Error("No matching residents found.");

      return {
        result: ok(`"${subject}" queued for ${names.length} resident${names.length === 1 ? "" : "s"}.`),
        description: `Message "${subject}" sent to ${names.length} resident(s): ${names.slice(0, 3).join(", ")}${names.length > 3 ? "…" : ""}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not send the message.");
  }
}
