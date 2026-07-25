import { FacilitiesBoard } from "@/components/facilities/facilities-board";
import { StatCard } from "@/components/ui/stat-card";
import { getBookingRows, getFacilityRows, getResidentRows, today } from "@/lib/data";
import { formatMoney, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function FacilitiesPage() {
  const facilities = getFacilityRows();
  const bookings = getBookingRows();
  const asOf = today();

  const residents = getResidentRows()
    .filter((resident) => resident.status === "active" || resident.status === "expiring")
    .map((resident) => ({ id: resident.id, name: resident.name, unitCode: resident.unitCode }));

  const upcoming = bookings.filter((booking) => booking.date >= asOf && booking.status === "approved");
  const pending = bookings.filter((booking) => booking.status === "pending");
  const revenue = bookings
    .filter((booking) => booking.status === "approved" || booking.status === "completed")
    .reduce((sum, booking) => sum + booking.fee, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Facilities"
          value={formatNumber(facilities.length)}
          hint={`${facilities.filter((facility) => facility.status === "maintenance").length} under maintenance`}
          badge="All"
        />
        <StatCard
          label="Upcoming Bookings"
          value={formatNumber(upcoming.length)}
          hint="Approved and still ahead"
          badge="Scheduled"
          tone="success"
        />
        <StatCard
          label="Pending Approvals"
          value={formatNumber(pending.length)}
          hint="Require review"
          badge="Review"
          tone={pending.length > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Booking Revenue"
          value={formatMoney(revenue)}
          hint="Approved and completed bookings"
          badge="Fees"
        />
      </section>

      <FacilitiesBoard facilities={facilities} bookings={bookings} residents={residents} today={asOf} />
    </div>
  );
}
