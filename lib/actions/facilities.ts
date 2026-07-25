"use server";

import { fail, ok, readNumber, readString, withAudit } from "@/lib/actions/common";
import { formatDate, formatTimeRange } from "@/lib/format";
import type { ActionResult, Booking, BookingStatus, Facility } from "@/lib/types";

const DECISIONS: BookingStatus[] = ["approved", "rejected", "cancelled", "completed"];

function overlaps(a: Booking, date: string, start: number, end: number) {
  return a.date === date && start < a.endHour && end > a.startHour;
}

export async function createBookingAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const facilityId = readString(formData, "facilityId");
  const residentId = readString(formData, "residentId");
  const date = readString(formData, "date");
  const startHour = readNumber(formData, "startHour", -1);
  const endHour = readNumber(formData, "endHour", -1);
  const note = readString(formData, "note");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Pick a booking date.");
  if (startHour < 0 || endHour < 0) return fail("Pick a start and end time.");
  if (endHour <= startHour) return fail("End time must be after the start time.");

  try {
    return withAudit("create", "Facilities", (db) => {
      const facility = db.facilities.find((item) => item.id === facilityId);
      if (!facility) throw new Error("Facility not found.");
      if (facility.status !== "active") throw new Error(`${facility.name} is under maintenance.`);

      const resident = db.residents.find((item) => item.id === residentId);
      if (!resident) throw new Error("Choose a resident.");
      if (resident.status === "blacklisted") throw new Error(`${resident.name} is not eligible to book facilities.`);

      if (startHour < facility.openHour || endHour > facility.closeHour) {
        throw new Error(`${facility.name} is open ${formatTimeRange(facility.openHour, facility.closeHour)}.`);
      }

      const clash = db.bookings.find(
        (booking) =>
          booking.facilityId === facilityId &&
          (booking.status === "approved" || booking.status === "pending") &&
          overlaps(booking, date, startHour, endHour),
      );
      if (clash) {
        throw new Error(`That slot clashes with an existing ${clash.status} booking (${formatTimeRange(clash.startHour, clash.endHour)}).`);
      }

      const hours = endHour - startHour;
      const booking: Booking = {
        id: `bkg-${String(db.bookings.length + 1).padStart(4, "0")}-${Date.now().toString(36)}`,
        facilityId,
        residentId,
        date,
        startHour,
        endHour,
        status: facility.requiresApproval ? "pending" : "approved",
        fee: facility.rateType === "hourly" ? facility.rate * hours : facility.rateType === "monthly" ? facility.rate : 0,
        note: note || null,
        createdAt: new Date().toISOString(),
        decidedAt: facility.requiresApproval ? null : new Date().toISOString(),
        decidedBy: facility.requiresApproval ? null : db.settings.adminName,
      };
      db.bookings.push(booking);

      return {
        result: ok(
          `${facility.name} booked for ${resident.name} on ${formatDate(date)}${
            booking.status === "pending" ? " — awaiting approval." : "."
          }`,
        ),
        description: `Booking created for ${facility.name} by ${resident.name} on ${formatDate(date)} ${formatTimeRange(startHour, endHour)} (${booking.status})`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create the booking.");
  }
}

export async function decideBookingAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const bookingId = readString(formData, "bookingId");
  const decision = readString(formData, "decision") as BookingStatus;

  if (!DECISIONS.includes(decision)) return fail("Unknown booking decision.");

  try {
    return withAudit("update", "Facilities", (db) => {
      const booking = db.bookings.find((item) => item.id === bookingId);
      if (!booking) throw new Error("Booking not found.");
      if (booking.status === decision) throw new Error(`Booking is already ${decision}.`);

      const facility = db.facilities.find((item) => item.id === booking.facilityId);
      const resident = db.residents.find((item) => item.id === booking.residentId);

      booking.status = decision;
      booking.decidedAt = new Date().toISOString();
      booking.decidedBy = db.settings.adminName;

      return {
        result: ok(`${facility?.name ?? "Booking"} for ${resident?.name ?? "resident"} marked ${decision}.`),
        description: `Booking for ${facility?.name ?? "facility"} by ${resident?.name ?? "resident"} marked ${decision}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the booking.");
  }
}

export async function updateFacilityAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const facilityId = readString(formData, "facilityId");
  const capacity = readNumber(formData, "capacity");
  const rate = readNumber(formData, "rate");
  const status = readString(formData, "status") as Facility["status"];

  if (capacity < 1) return fail("Capacity must be at least 1.");
  if (status !== "active" && status !== "maintenance") return fail("Choose a valid status.");

  try {
    return withAudit("update", "Facilities", (db) => {
      const facility = db.facilities.find((item) => item.id === facilityId);
      if (!facility) throw new Error("Facility not found.");

      const changes: string[] = [];
      if (facility.capacity !== capacity) changes.push(`capacity ${facility.capacity} → ${capacity}`);
      if (facility.rate !== rate) changes.push(`rate ${facility.rate} → ${rate}`);
      if (facility.status !== status) changes.push(`status ${facility.status} → ${status}`);
      if (changes.length === 0) throw new Error("Nothing to update.");

      facility.capacity = capacity;
      facility.rate = rate;
      facility.status = status;

      return {
        result: ok(`${facility.name} updated.`),
        description: `Updated facility ${facility.name}: ${changes.join(", ")}`,
      };
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not update the facility.");
  }
}
