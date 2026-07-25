"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { formatMoney } from "@/lib/format";
import { titleCase } from "@/lib/format";
import type { ActionResult, Unit, UnitStatus, UnitType } from "@/lib/types";

const STATUSES: UnitStatus[] = ["occupied", "vacant", "reserved", "maintenance"];
const TYPES: UnitType[] = ["Studio", "1BR", "2BR", "3BR"];

export async function createUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = readString(formData, "code").toUpperCase();
  const propertyId = readString(formData, "propertyId");
  const type = readString(formData, "type") as UnitType;
  const floor = readNumber(formData, "floor");
  const rent = readNumber(formData, "rent");
  const dues = readNumber(formData, "dues");

  if (!code) return fail("Unit code is required.");
  if (!TYPES.includes(type)) return fail("Choose a unit type.");
  if (floor < 1) return fail("Floor must be 1 or higher.");
  if (rent <= 0) return fail("Monthly rent must be greater than zero.");

  try {
    return withAudit("create", "Units", (db) => {
      const property = db.properties.find((item) => item.id === propertyId);
      if (!property) throw new Error("Choose a property.");
      if (db.units.some((unit) => unit.propertyId === propertyId && unit.code === code)) {
        throw new Error(`Unit ${code} already exists in ${property.name}.`);
      }

      const unit: Unit = {
        id: `unit-${property.code}-${code}-${Date.now().toString(36)}`,
        code,
        propertyId,
        type,
        floor,
        rent,
        dues: dues > 0 ? dues : Math.round((rent * 0.08) / 50) * 50,
        status: "vacant",
        residentId: null,
      };
      db.units.push(unit);

      return {
        result: ok(`Unit ${code} added to ${property.name}.`),
        description: `Added unit ${code} (${type}, ${formatMoney(rent)}/mo) to ${property.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add the unit.");
  }
}

export async function updateUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const unitId = readString(formData, "unitId");
  const rent = readNumber(formData, "rent");
  const dues = readNumber(formData, "dues");
  const status = readString(formData, "status") as UnitStatus;

  if (!STATUSES.includes(status)) return fail("Choose a valid status.");
  if (rent <= 0) return fail("Monthly rent must be greater than zero.");

  try {
    return withAudit("update", "Units", (db) => {
      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");

      const changes: string[] = [];
      if (unit.rent !== rent) changes.push(`rent ${formatMoney(unit.rent)} → ${formatMoney(rent)}`);
      if (unit.dues !== dues) changes.push(`dues ${formatMoney(unit.dues)} → ${formatMoney(dues)}`);
      if (unit.status !== status) changes.push(`status ${titleCase(unit.status)} → ${titleCase(status)}`);

      if (changes.length === 0) throw new Error("Nothing to update.");

      // Vacating or taking a unit offline releases the current occupant.
      if ((status === "vacant" || status === "maintenance") && unit.residentId) {
        const resident = db.residents.find((item) => item.id === unit.residentId);
        if (resident) {
          resident.unitId = null;
          resident.status = "moved-out";
        }
        unit.residentId = null;
      }

      unit.rent = rent;
      unit.dues = dues >= 0 ? dues : unit.dues;
      unit.status = status;

      return {
        result: ok(`Unit ${unit.code} updated.`),
        description: `Updated unit ${unit.code}: ${changes.join(", ")}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the unit.");
  }
}

export async function deleteUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const unitId = readString(formData, "unitId");

  try {
    return withAudit("delete", "Units", (db) => {
      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");
      if (unit.residentId) throw new Error(`Unit ${unit.code} still has an occupant — move them out first.`);

      const openInvoices = db.invoices.filter(
        (invoice) => invoice.unitId === unitId && invoice.status !== "paid" && invoice.status !== "void",
      );
      if (openInvoices.length > 0) {
        throw new Error(`Unit ${unit.code} has ${openInvoices.length} unsettled invoice(s).`);
      }

      db.units = db.units.filter((item) => item.id !== unitId);
      const property = db.properties.find((item) => item.id === unit.propertyId);

      return {
        result: ok(`Unit ${unit.code} removed.`),
        description: `Deleted unit ${unit.code} from ${property?.name ?? "property"}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete the unit.");
  }
}
