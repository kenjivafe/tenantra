"use server";

import { revalidateAll, fail, ok, readBoolean, readNumber, readString, withAudit } from "@/lib/actions/common";
import { resetDb } from "@/lib/store";
import type { ActionResult } from "@/lib/types";

export async function updateSettingsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const orgName = readString(formData, "orgName");
  const adminName = readString(formData, "adminName");
  const adminEmail = readString(formData, "adminEmail");
  const billingDueDay = readNumber(formData, "billingDueDay", 5);
  const gracePeriodDays = readNumber(formData, "gracePeriodDays", 3);
  const lateFeePercent = readNumber(formData, "lateFeePercent", 2);

  if (orgName.length < 2) return fail("Organisation name is required.");
  if (adminName.length < 2) return fail("Administrator name is required.");
  if (!/^\S+@\S+\.\S+$/.test(adminEmail)) return fail("Enter a valid administrator email.");
  if (billingDueDay < 1 || billingDueDay > 28) return fail("Billing due day must be between 1 and 28.");
  if (gracePeriodDays < 0 || gracePeriodDays > 30) return fail("Grace period must be between 0 and 30 days.");
  if (lateFeePercent < 0 || lateFeePercent > 25) return fail("Late fee must be between 0% and 25%.");

  try {
    return withAudit("update", "Settings", (db) => {
      const previous = { ...db.settings };
      db.settings = {
        ...db.settings,
        orgName,
        adminName,
        adminEmail,
        billingDueDay,
        gracePeriodDays,
        lateFeePercent,
        channels: {
          email: readBoolean(formData, "email"),
          push: readBoolean(formData, "push"),
          sms: readBoolean(formData, "sms"),
        },
      };

      const changes: string[] = [];
      if (previous.orgName !== orgName) changes.push(`organisation "${previous.orgName}" → "${orgName}"`);
      if (previous.billingDueDay !== billingDueDay) changes.push(`due day ${previous.billingDueDay} → ${billingDueDay}`);
      if (previous.lateFeePercent !== lateFeePercent) changes.push(`late fee ${previous.lateFeePercent}% → ${lateFeePercent}%`);

      return {
        result: ok("Settings saved."),
        description: `Updated system settings${changes.length ? `: ${changes.join(", ")}` : ""}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save settings.");
  }
}

export async function updateChannelsAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const channel = readString(formData, "channel") as "email" | "push" | "sms";
  const enabled = readBoolean(formData, "enabled");

  if (!["email", "push", "sms"].includes(channel)) return fail("Unknown notification channel.");

  try {
    return withAudit("update", "Settings", (db) => {
      db.settings.channels[channel] = enabled;
      return {
        result: ok(`${channel.toUpperCase()} notifications ${enabled ? "enabled" : "disabled"}.`),
        description: `${enabled ? "Enabled" : "Disabled"} ${channel} notifications`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update notification settings.");
  }
}

export async function resetDemoDataAction(): Promise<ActionResult> {
  resetDb();
  revalidateAll();
  return ok("Demo data regenerated from the seed dataset.");
}
