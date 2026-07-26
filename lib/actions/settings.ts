"use server";

import { revalidateAll, fail, ok, readBoolean, readNumber, readString, withAudit } from "@/lib/actions/common";
import { resetDb } from "@/lib/store";
import type { ActionResult } from "@/lib/types";

export async function updateSettingsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const orgName = readString(formData, "orgName");
  const adminName = readString(formData, "adminName");
  const adminEmail = readString(formData, "adminEmail");
  const billingDueDay = readNumber(formData, "billingDueDay", 15);
  const lateFeePercent = readNumber(formData, "lateFeePercent", 10);

  if (orgName.length < 2) return fail("Organisation name is required.");
  if (adminName.length < 2) return fail("Administrator name is required.");
  if (!/^\S+@\S+\.\S+$/.test(adminEmail)) return fail("Enter a valid administrator email.");
  if (billingDueDay < 1 || billingDueDay > 28) return fail("Billing due day must be between 1 and 28.");
  if (lateFeePercent < 0 || lateFeePercent > 25) return fail("Late fee must be between 0% and 25%.");

  try {
    return withAudit("update", "Settings", (db) => {
      db.settings = {
        ...db.settings,
        orgName,
        adminName,
        adminEmail,
        billingDueDay,
        lateFeePercent,
        channels: { email: readBoolean(formData, "email"), sms: readBoolean(formData, "sms") },
      };
      return { result: ok("Settings saved."), description: "Updated system settings" };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save settings.");
  }
}

export async function addLocationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const name = readString(formData, "name");
  if (name.length < 2) return fail("Enter a location name.");

  try {
    return withAudit("create", "Settings", (db) => {
      if (db.locations.some((location) => location.name.toLowerCase() === name.toLowerCase())) {
        throw new Error(`${name} already exists.`);
      }
      const code = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "") || `L${db.locations.length + 1}`;
      db.locations.push({ id: `loc-${Date.now().toString(36)}`, name, code });
      return { result: ok(`${name} added.`), description: `Added location ${name}` };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not add the location.");
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  resetDb();
  revalidateAll();
  return ok("Demo data regenerated from the seed dataset.");
}
