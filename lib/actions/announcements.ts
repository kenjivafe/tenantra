"use server";

import { fail, ok, readBoolean, readString, withAudit } from "@/lib/actions/common";
import type { ActionResult, Announcement, Database } from "@/lib/types";

function audienceOf(formData: FormData, db: Database) {
  const scope = readString(formData, "scope") as Announcement["audience"]["scope"];
  const propertyId = readString(formData, "propertyId");
  const unitCodes = readString(formData, "unitCodes")
    .split(/[,\s]+/)
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  if (scope === "property") {
    const property = db.properties.find((item) => item.id === propertyId);
    if (!property) throw new Error("Choose a property to target.");
    return { audience: { scope, propertyId, unitCodes: [] }, label: property.name };
  }

  if (scope === "units") {
    if (unitCodes.length === 0) throw new Error("List at least one unit code.");
    return { audience: { scope, propertyId: null, unitCodes }, label: `${unitCodes.length} unit(s)` };
  }

  return { audience: { scope: "all" as const, propertyId: null, unitCodes: [] }, label: "all residents" };
}

function countRecipients(db: Database, audience: Announcement["audience"]) {
  const occupied = db.units.filter((unit) => unit.status === "occupied" && unit.residentId);
  if (audience.scope === "all") return occupied.length;
  if (audience.scope === "property") return occupied.filter((unit) => unit.propertyId === audience.propertyId).length;
  return occupied.filter((unit) => audience.unitCodes.includes(unit.code)).length;
}

export async function saveAnnouncementAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const title = readString(formData, "title");
  const body = readString(formData, "body");
  const intent = readString(formData, "intent") === "send" ? "send" : "draft";

  if (title.length < 3) return fail("Give the announcement a title.");
  if (body.length < 10) return fail("The announcement body is too short.");

  try {
    return withAudit("create", "Announcements", (db) => {
      const { audience, label } = audienceOf(formData, db);
      const recipients = countRecipients(db, audience);
      if (intent === "send" && recipients === 0) throw new Error("That audience has no occupied units.");

      const now = new Date().toISOString();
      const announcement: Announcement = {
        id: `ann-${String(db.announcements.length + 1).padStart(3, "0")}-${Date.now().toString(36)}`,
        title,
        body,
        audience,
        channels: {
          email: readBoolean(formData, "email"),
          push: readBoolean(formData, "push"),
          sms: readBoolean(formData, "sms"),
        },
        status: intent === "send" ? "sent" : "draft",
        createdBy: db.settings.adminName,
        createdAt: now,
        sentAt: intent === "send" ? now : null,
        recipients: intent === "send" ? recipients : 0,
        reads: 0,
      };
      db.announcements.push(announcement);

      return {
        result: ok(
          intent === "send"
            ? `"${title}" sent to ${recipients} resident${recipients === 1 ? "" : "s"}.`
            : `"${title}" saved as a draft.`,
        ),
        description:
          intent === "send"
            ? `Announcement "${title}" sent to ${label} (${recipients} recipients)`
            : `Announcement "${title}" saved as draft for ${label}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save the announcement.");
  }
}

export async function sendAnnouncementAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = readString(formData, "announcementId");

  try {
    return withAudit("update", "Announcements", (db) => {
      const announcement = db.announcements.find((item) => item.id === id);
      if (!announcement) throw new Error("Announcement not found.");

      const recipients = countRecipients(db, announcement.audience);
      if (recipients === 0) throw new Error("That audience has no occupied units.");

      const resend = announcement.status === "sent";
      announcement.status = "sent";
      announcement.sentAt = new Date().toISOString();
      announcement.recipients = recipients;
      if (!resend) announcement.reads = 0;

      return {
        result: ok(`"${announcement.title}" ${resend ? "resent" : "sent"} to ${recipients} residents.`),
        description: `Announcement "${announcement.title}" ${resend ? "resent" : "sent"} to ${recipients} residents`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not send the announcement.");
  }
}

export async function deleteAnnouncementAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const id = readString(formData, "announcementId");

  try {
    return withAudit("delete", "Announcements", (db) => {
      const announcement = db.announcements.find((item) => item.id === id);
      if (!announcement) throw new Error("Announcement not found.");

      db.announcements = db.announcements.filter((item) => item.id !== id);
      return {
        result: ok(`"${announcement.title}" deleted.`),
        description: `Deleted ${announcement.status} announcement "${announcement.title}"`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete the announcement.");
  }
}
