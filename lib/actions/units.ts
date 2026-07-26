"use server";

import { fail, ok, readBoolean, readNumber, readString, withAudit } from "@/lib/actions/common";
import { formatMoney, titleCase } from "@/lib/format";
import type { ActionResult, Unit, UnitCategory, UnitStatus, Tenancy } from "@/lib/types";

const CATEGORIES: UnitCategory[] = ["commercial", "residential"];
const TENANCIES: Tenancy[] = ["short-term", "long-term"];
const STATUSES: UnitStatus[] = ["occupied", "vacant", "maintenance"];

const RESIDENTIAL_INVENTORY = [
  "One (1) Smart Television",
  "One (1) Inverter Air Conditioner",
  "One (1) Refrigerator",
  "One (1) Bed",
  "One (1) Table and Chair Set",
];

export async function createUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const code = readString(formData, "code").toUpperCase();
  const locationId = readString(formData, "locationId");
  const category = readString(formData, "category") as UnitCategory;
  const tenancy = readString(formData, "tenancy") as Tenancy;
  const rent = readNumber(formData, "rent");
  const electricMeterNo = readString(formData, "electricMeterNo");
  const waterMeterNo = readString(formData, "waterMeterNo");
  const furnished = readBoolean(formData, "furnished");

  if (!code) return fail("Unit code is required.");
  if (!CATEGORIES.includes(category)) return fail("Choose a unit category.");
  if (!TENANCIES.includes(tenancy)) return fail("Choose short-term or long-term.");
  if (rent <= 0) return fail("Monthly rent must be greater than zero.");

  try {
    return withAudit("create", "Units", (db) => {
      const location = db.locations.find((item) => item.id === locationId);
      if (!location) throw new Error("Choose a location.");
      if (db.units.some((unit) => unit.locationId === locationId && unit.code === code)) {
        throw new Error(`Unit ${code} already exists in ${location.name}.`);
      }

      const unit: Unit = {
        id: `unit-${location.code}-${code}-${Date.now().toString(36)}`,
        code,
        locationId,
        category,
        tenancy,
        owner: readString(formData, "owner") || "Property Owner",
        rent,
        electricMeterNo: electricMeterNo || `${location.code}-E-${code}`,
        waterMeterNo: waterMeterNo || `${location.code}-W-${code}`,
        depositMonths: 1,
        advanceMonths: 1,
        furnished,
        inventory: category === "residential" && furnished ? RESIDENTIAL_INVENTORY : [],
        status: "vacant",
        tenantId: null,
      };
      db.units.push(unit);

      return {
        result: ok(`Unit ${code} added to ${location.name}.`),
        description: `Added ${category} unit ${code} (${tenancy}, ${formatMoney(rent)}/mo) to ${location.name}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add the unit.");
  }
}

export async function updateUnitAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const unitId = readString(formData, "unitId");
  const rent = readNumber(formData, "rent");
  const status = readString(formData, "status") as UnitStatus;
  const electricMeterNo = readString(formData, "electricMeterNo");
  const waterMeterNo = readString(formData, "waterMeterNo");
  const owner = readString(formData, "owner");

  if (!STATUSES.includes(status)) return fail("Choose a valid status.");
  if (rent <= 0) return fail("Monthly rent must be greater than zero.");

  try {
    return withAudit("update", "Units", (db) => {
      const unit = db.units.find((item) => item.id === unitId);
      if (!unit) throw new Error("Unit not found.");
      if (status === "occupied" && !unit.tenantId) {
        throw new Error("Assign a tenant before marking the unit occupied.");
      }

      const changes: string[] = [];
      if (unit.rent !== rent) changes.push(`rent ${formatMoney(unit.rent)} → ${formatMoney(rent)}`);
      if (unit.status !== status) changes.push(`status ${titleCase(unit.status)} → ${titleCase(status)}`);
      if (electricMeterNo && unit.electricMeterNo !== electricMeterNo) changes.push("electric meter");
      if (waterMeterNo && unit.waterMeterNo !== waterMeterNo) changes.push("water meter");

      // Vacating or taking a unit offline releases the current tenant.
      if ((status === "vacant" || status === "maintenance") && unit.tenantId) {
        const tenant = db.tenants.find((item) => item.id === unit.tenantId);
        if (tenant) {
          tenant.unitId = null;
          tenant.status = "ended";
        }
        unit.tenantId = null;
      }

      unit.rent = rent;
      unit.status = status;
      if (electricMeterNo) unit.electricMeterNo = electricMeterNo;
      if (waterMeterNo) unit.waterMeterNo = waterMeterNo;
      if (owner) unit.owner = owner;

      if (changes.length === 0) return { result: ok(`Unit ${unit.code} saved.`), description: `Reviewed unit ${unit.code}` };
      return { result: ok(`Unit ${unit.code} updated.`), description: `Updated unit ${unit.code}: ${changes.join(", ")}` };
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
      if (unit.tenantId) throw new Error(`Unit ${unit.code} still has a tenant — move them out first.`);

      const openBills = db.bills.filter(
        (bill) => bill.unitId === unitId && bill.status !== "paid" && bill.status !== "void",
      );
      if (openBills.length > 0) throw new Error(`Unit ${unit.code} has ${openBills.length} unsettled bill(s).`);

      db.units = db.units.filter((item) => item.id !== unitId);
      const location = db.locations.find((item) => item.id === unit.locationId);
      return { result: ok(`Unit ${unit.code} removed.`), description: `Deleted unit ${unit.code} from ${location?.name ?? "location"}` };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete the unit.");
  }
}
