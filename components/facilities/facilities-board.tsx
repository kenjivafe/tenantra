"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { Field, InlineSubmit, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyRow, TableShell, Td, Th } from "@/components/ui/table";
import { useActionToast } from "@/components/ui/toast";
import { createBookingAction, decideBookingAction, updateFacilityAction } from "@/lib/actions/facilities";
import type { BookingRow, FacilityRow } from "@/lib/data";
import { formatDate, formatHour, formatMoney, formatTimeRange } from "@/lib/format";

type BookingFilter = "all" | "pending" | "approved" | "completed" | "rejected" | "cancelled";

export type BookableResident = { id: string; name: string; unitCode: string | null };

function rateLabel(facility: FacilityRow) {
  if (facility.rateType === "free") return "Free";
  return facility.rateType === "hourly" ? `${formatMoney(facility.rate)}/hr` : `${formatMoney(facility.rate)}/month`;
}

export function FacilitiesBoard({
  facilities,
  bookings,
  residents,
  today,
}: {
  facilities: FacilityRow[];
  bookings: BookingRow[];
  residents: BookableResident[];
  today: string;
}) {
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [booking, setBooking] = useState<FacilityRow | null>(null);
  const [managing, setManaging] = useState<FacilityRow | null>(null);

  const [createState, createAction] = useActionState(createBookingAction, null);
  const [decideState, decideAction] = useActionState(decideBookingAction, null);
  const [facilityState, facilityAction] = useActionState(updateFacilityAction, null);

  useActionToast(createState, () => setBooking(null));
  useActionToast(decideState);
  useActionToast(facilityState, () => setManaging(null));

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter((row) => row.status === "pending").length,
      approved: bookings.filter((row) => row.status === "approved").length,
      completed: bookings.filter((row) => row.status === "completed").length,
      rejected: bookings.filter((row) => row.status === "rejected").length,
      cancelled: bookings.filter((row) => row.status === "cancelled").length,
    }),
    [bookings],
  );

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((row) => row.status === filter)).slice(0, 40),
    [bookings, filter],
  );

  const hours = booking
    ? Array.from({ length: booking.closeHour - booking.openHour + 1 }, (_, index) => booking.openHour + index)
    : [];

  return (
    <>
      <Card className="bg-panel" padding="md">
        <h3 className="mb-4 text-lg font-semibold font-display text-text-primary">Facilities Inventory</h3>
        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Facility</Th>
              <Th>Property</Th>
              <Th>Capacity</Th>
              <Th>Rate</Th>
              <Th>Upcoming</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((facility) => (
              <tr key={facility.id} className="border-b border-border/20">
                <Td className="font-medium">
                  {facility.name}
                  <span className="block text-xs text-text-muted">
                    Open {formatHour(facility.openHour)} – {formatHour(facility.closeHour)}
                  </span>
                </Td>
                <Td>{facility.propertyName}</Td>
                <Td>{facility.capacity} people</Td>
                <Td>{rateLabel(facility)}</Td>
                <Td>
                  {facility.upcomingBookings} approved
                  {facility.pendingBookings > 0 ? (
                    <span className="block text-xs text-status-warning">{facility.pendingBookings} pending</span>
                  ) : null}
                </Td>
                <Td>
                  <StatusBadge status={facility.status === "active" ? "active" : "maintenance"} />
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBooking(facility)}
                      disabled={facility.status !== "active"}
                      className="text-sm font-medium text-accent transition hover:underline disabled:opacity-40 disabled:hover:no-underline"
                    >
                      Book
                    </button>
                    <button
                      type="button"
                      onClick={() => setManaging(facility)}
                      className="text-sm font-medium text-accent transition hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>

      <Card className="bg-panel" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold font-display text-text-primary">Bookings</h3>
          <FilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All", count: counts.all },
              { value: "pending", label: "Pending", count: counts.pending },
              { value: "approved", label: "Approved", count: counts.approved },
              { value: "completed", label: "Completed", count: counts.completed },
              { value: "rejected", label: "Rejected", count: counts.rejected },
              { value: "cancelled", label: "Cancelled", count: counts.cancelled },
            ]}
          />
        </div>

        <TableShell>
          <thead>
            <tr className="border-b border-border/40">
              <Th>Resident</Th>
              <Th>Facility</Th>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Fee</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <EmptyRow colSpan={7} message="No bookings match this filter." />
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b border-border/20">
                  <Td className="font-medium">
                    {row.residentName}
                    {row.unitCode ? <span className="block text-xs text-text-muted">Unit {row.unitCode}</span> : null}
                  </Td>
                  <Td>
                    {row.facilityName}
                    <span className="block text-xs text-text-muted">{row.propertyName}</span>
                  </Td>
                  <Td>{formatDate(row.date)}</Td>
                  <Td>{formatTimeRange(row.startHour, row.endHour)}</Td>
                  <Td>{row.fee > 0 ? formatMoney(row.fee) : "Free"}</Td>
                  <Td>
                    <StatusBadge status={row.status} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-3">
                      {row.status === "pending" ? (
                        <>
                          <form action={decideAction} className="inline">
                            <input type="hidden" name="bookingId" value={row.id} />
                            <input type="hidden" name="decision" value="approved" />
                            <InlineSubmit pendingLabel="Approving…">Approve</InlineSubmit>
                          </form>
                          <form action={decideAction} className="inline">
                            <input type="hidden" name="bookingId" value={row.id} />
                            <input type="hidden" name="decision" value="rejected" />
                            <InlineSubmit tone="danger" pendingLabel="Rejecting…">
                              Reject
                            </InlineSubmit>
                          </form>
                        </>
                      ) : null}
                      {row.status === "approved" ? (
                        <>
                          <form action={decideAction} className="inline">
                            <input type="hidden" name="bookingId" value={row.id} />
                            <input type="hidden" name="decision" value="completed" />
                            <InlineSubmit pendingLabel="Updating…">Mark completed</InlineSubmit>
                          </form>
                          <form action={decideAction} className="inline">
                            <input type="hidden" name="bookingId" value={row.id} />
                            <input type="hidden" name="decision" value="cancelled" />
                            <InlineSubmit tone="danger" pendingLabel="Cancelling…">
                              Cancel
                            </InlineSubmit>
                          </form>
                        </>
                      ) : null}
                      {row.status === "rejected" || row.status === "cancelled" ? (
                        <form action={decideAction} className="inline">
                          <input type="hidden" name="bookingId" value={row.id} />
                          <input type="hidden" name="decision" value="approved" />
                          <InlineSubmit pendingLabel="Restoring…">Reinstate</InlineSubmit>
                        </form>
                      ) : null}
                      {row.status === "completed" ? <span className="text-sm text-text-muted">—</span> : null}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </Card>

      <Modal
        open={booking !== null}
        onClose={() => setBooking(null)}
        title={booking ? `Book ${booking.name}` : "Book facility"}
        description={
          booking
            ? `${booking.propertyName} · ${rateLabel(booking)} · open ${formatHour(booking.openHour)}–${formatHour(booking.closeHour)}`
            : undefined
        }
      >
        {booking ? (
          <form action={createAction} className="grid gap-4">
            <input type="hidden" name="facilityId" value={booking.id} />
            <Field label="Resident">
              <SelectField name="residentId" defaultValue={residents[0]?.id} required>
                {residents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name}
                    {resident.unitCode ? ` — Unit ${resident.unitCode}` : ""}
                  </option>
                ))}
              </SelectField>
            </Field>
            <Field label="Date">
              <TextField name="date" type="date" defaultValue={today} min={today} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start time">
                <SelectField name="startHour" defaultValue={String(booking.openHour)}>
                  {hours.slice(0, -1).map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHour(hour)}
                    </option>
                  ))}
                </SelectField>
              </Field>
              <Field label="End time">
                <SelectField name="endHour" defaultValue={String(Math.min(booking.openHour + 2, booking.closeHour))}>
                  {hours.slice(1).map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHour(hour)}
                    </option>
                  ))}
                </SelectField>
              </Field>
            </div>
            <Field label="Note" hint="Optional">
              <TextAreaField name="note" placeholder="Birthday party setup…" className="min-h-20" />
            </Field>
            {booking.requiresApproval ? (
              <p className="rounded-card bg-status-warning/15 px-4 py-3 text-sm text-text-secondary">
                This facility requires approval — the booking will be created as pending.
              </p>
            ) : null}
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setBooking(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Booking…">Create booking</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={managing !== null}
        onClose={() => setManaging(null)}
        title={managing?.name ?? "Facility"}
        description={managing ? managing.propertyName : undefined}
      >
        {managing ? (
          <form action={facilityAction} className="grid gap-4">
            <input type="hidden" name="facilityId" value={managing.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Capacity">
                <TextField name="capacity" type="number" min="1" defaultValue={managing.capacity} required />
              </Field>
              <Field
                label="Rate"
                hint={managing.rateType === "free" ? "This facility is free to use." : `Charged ${managing.rateType}`}
              >
                <TextField name="rate" type="number" min="0" step="50" defaultValue={managing.rate} required />
              </Field>
              <Field label="Status" className="sm:col-span-2">
                <SelectField name="status" defaultValue={managing.status}>
                  <option value="active">Active</option>
                  <option value="maintenance">Under maintenance</option>
                </SelectField>
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setManaging(null)}>
                Cancel
              </Button>
              <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
