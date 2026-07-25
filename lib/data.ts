import { getDb } from "@/lib/store";
import { recentPeriods } from "@/lib/seed";
import type {
  Announcement,
  AuditLog,
  Booking,
  BookingStatus,
  Facility,
  Invoice,
  InvoiceStatus,
  Property,
  Resident,
  ResidentStatus,
  Settings,
  Unit,
  UnitStatus,
} from "@/lib/types";

export type InvoiceRow = {
  id: string;
  number: string;
  residentName: string;
  residentId: string | null;
  unitCode: string;
  unitId: string;
  propertyId: string;
  propertyName: string;
  period: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  paidAt: string | null;
  paymentMethod: string | null;
  remindersSent: number;
  lines: Invoice["lines"];
};

export type UnitRow = {
  id: string;
  code: string;
  propertyId: string;
  propertyName: string;
  type: Unit["type"];
  floor: number;
  rent: number;
  dues: number;
  status: UnitStatus;
  residentId: string | null;
  residentName: string | null;
};

export type ResidentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string | null;
  unitCode: string | null;
  propertyId: string | null;
  propertyName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  status: ResidentStatus;
  balance: number;
};

export type BookingRow = {
  id: string;
  facilityId: string;
  facilityName: string;
  propertyId: string;
  propertyName: string;
  residentId: string;
  residentName: string;
  unitCode: string | null;
  date: string;
  startHour: number;
  endHour: number;
  status: BookingStatus;
  fee: number;
  note: string | null;
};

export type FacilityRow = Facility & {
  propertyName: string;
  upcomingBookings: number;
  pendingBookings: number;
};

export type AnnouncementRow = Announcement & {
  audienceLabel: string;
};

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function currentPeriod() {
  return today().slice(0, 7);
}

/** Pending invoices become overdue the moment their due date passes. */
export function effectiveStatus(invoice: Invoice, asOf = today()): InvoiceStatus {
  if (invoice.status === "paid" || invoice.status === "void") return invoice.status;
  return invoice.dueDate < asOf ? "overdue" : "pending";
}

export function getProperties(): Property[] {
  return getDb().properties;
}

export function getSettings(): Settings {
  return getDb().settings;
}

export function getPeriods(count = 6) {
  const db = getDb();
  const known = Array.from(new Set(db.invoices.map((invoice) => invoice.period))).sort();
  const recent = recentPeriods(new Date(), count);
  return Array.from(new Set([...known, ...recent])).sort().slice(-Math.max(count, known.length));
}

// ------------------------------------------------------------------ joins

function propertyName(db: ReturnType<typeof getDb>, id: string) {
  return db.properties.find((property) => property.id === id)?.name ?? "—";
}

export function toInvoiceRows(invoices: Invoice[]): InvoiceRow[] {
  const db = getDb();
  const residents = new Map(db.residents.map((resident) => [resident.id, resident]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));
  const asOf = today();

  return invoices.map((invoice) => ({
    id: invoice.id,
    number: invoice.number,
    residentId: invoice.residentId,
    residentName: invoice.residentId ? (residents.get(invoice.residentId)?.name ?? "Unassigned") : "Unassigned",
    unitId: invoice.unitId,
    unitCode: units.get(invoice.unitId)?.code ?? "—",
    propertyId: invoice.propertyId,
    propertyName: propertyName(db, invoice.propertyId),
    period: invoice.period,
    amount: invoice.amount,
    dueDate: invoice.dueDate,
    status: effectiveStatus(invoice, asOf),
    paidAt: invoice.payment?.at ?? null,
    paymentMethod: invoice.payment?.method ?? null,
    remindersSent: invoice.remindersSent,
    lines: invoice.lines,
  }));
}

export function getInvoiceRows(period?: string): InvoiceRow[] {
  const db = getDb();
  const filtered = period ? db.invoices.filter((invoice) => invoice.period === period) : db.invoices;
  return toInvoiceRows(filtered).sort((a, b) => (a.number < b.number ? 1 : -1));
}

export function getUnitRows(): UnitRow[] {
  const db = getDb();
  const residents = new Map(db.residents.map((resident) => [resident.id, resident]));

  return db.units
    .map((unit) => ({
      id: unit.id,
      code: unit.code,
      propertyId: unit.propertyId,
      propertyName: propertyName(db, unit.propertyId),
      type: unit.type,
      floor: unit.floor,
      rent: unit.rent,
      dues: unit.dues,
      status: unit.status,
      residentId: unit.residentId,
      residentName: unit.residentId ? (residents.get(unit.residentId)?.name ?? null) : null,
    }))
    .sort((a, b) => a.propertyName.localeCompare(b.propertyName) || a.floor - b.floor || a.code.localeCompare(b.code));
}

export function getResidentRows(): ResidentRow[] {
  const db = getDb();
  const units = new Map(db.units.map((unit) => [unit.id, unit]));
  const asOf = today();

  const balances = new Map<string, number>();
  for (const invoice of db.invoices) {
    if (!invoice.residentId) continue;
    const status = effectiveStatus(invoice, asOf);
    if (status === "paid" || status === "void") continue;
    balances.set(invoice.residentId, (balances.get(invoice.residentId) ?? 0) + invoice.amount);
  }

  return db.residents
    .map((resident) => {
      const unit = resident.unitId ? units.get(resident.unitId) : null;
      return {
        id: resident.id,
        name: resident.name,
        email: resident.email,
        phone: resident.phone,
        unitId: resident.unitId,
        unitCode: unit?.code ?? null,
        propertyId: unit?.propertyId ?? null,
        propertyName: unit ? propertyName(db, unit.propertyId) : null,
        leaseStart: resident.leaseStart,
        leaseEnd: resident.leaseEnd,
        status: resident.status,
        balance: balances.get(resident.id) ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFacilityRows(): FacilityRow[] {
  const db = getDb();
  const asOf = today();

  return db.facilities.map((facility) => {
    const bookings = db.bookings.filter((booking) => booking.facilityId === facility.id);
    return {
      ...facility,
      propertyName: propertyName(db, facility.propertyId),
      upcomingBookings: bookings.filter((booking) => booking.date >= asOf && booking.status === "approved").length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
    };
  });
}

export function getBookingRows(): BookingRow[] {
  const db = getDb();
  const residents = new Map(db.residents.map((resident) => [resident.id, resident]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));
  const facilities = new Map(db.facilities.map((facility) => [facility.id, facility]));

  return db.bookings
    .map((booking) => {
      const facility = facilities.get(booking.facilityId);
      const resident = residents.get(booking.residentId);
      const unit = resident?.unitId ? units.get(resident.unitId) : null;
      return {
        id: booking.id,
        facilityId: booking.facilityId,
        facilityName: facility?.name ?? "—",
        propertyId: facility?.propertyId ?? "",
        propertyName: facility ? propertyName(db, facility.propertyId) : "—",
        residentId: booking.residentId,
        residentName: resident?.name ?? "—",
        unitCode: unit?.code ?? null,
        date: booking.date,
        startHour: booking.startHour,
        endHour: booking.endHour,
        status: booking.status,
        fee: booking.fee,
        note: booking.note,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.startHour - b.startHour));
}

export function getAnnouncementRows(): AnnouncementRow[] {
  const db = getDb();

  return db.announcements
    .map((announcement) => {
      const { scope, propertyId, unitCodes } = announcement.audience;
      const audienceLabel =
        scope === "all"
          ? "All residents"
          : scope === "property"
            ? (db.properties.find((property) => property.id === propertyId)?.name ?? "Property")
            : `${unitCodes.length} unit${unitCodes.length === 1 ? "" : "s"}`;

      return { ...announcement, audienceLabel };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getAuditLogs(limit = 300): AuditLog[] {
  return getDb()
    .auditLogs.slice()
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}

// ---------------------------------------------------------------- metrics

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export type PeriodSummary = {
  period: string;
  billed: number;
  collected: number;
  outstanding: number;
  overdue: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  collectionRate: number;
};

export function summarisePeriod(period: string): PeriodSummary {
  const db = getDb();
  const asOf = today();
  const invoices = db.invoices.filter((invoice) => invoice.period === period && invoice.status !== "void");

  let billed = 0;
  let collected = 0;
  let overdue = 0;
  let paidCount = 0;
  let overdueCount = 0;

  for (const invoice of invoices) {
    billed += invoice.amount;
    const status = effectiveStatus(invoice, asOf);
    if (status === "paid") {
      collected += invoice.payment?.amount ?? invoice.amount;
      paidCount += 1;
    } else if (status === "overdue") {
      overdue += invoice.amount;
      overdueCount += 1;
    }
  }

  return {
    period,
    billed,
    collected,
    outstanding: billed - collected,
    overdue,
    invoiceCount: invoices.length,
    paidCount,
    overdueCount,
    collectionRate: billed === 0 ? 0 : (collected / billed) * 100,
  };
}

export function getPeriodSeries(count = 6): PeriodSummary[] {
  return getPeriods(count).slice(-count).map(summarisePeriod);
}

export type UnitBreakdown = { status: UnitStatus; label: string; count: number; share: number };

const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  occupied: "Occupied Units",
  vacant: "Vacant Units",
  reserved: "Reserved Units",
  maintenance: "Under Maintenance",
};

export function getUnitBreakdown(): { total: number; items: UnitBreakdown[] } {
  const db = getDb();
  const total = db.units.length;
  const order: UnitStatus[] = ["occupied", "vacant", "reserved", "maintenance"];

  return {
    total,
    items: order.map((status) => {
      const count = db.units.filter((unit) => unit.status === status).length;
      return { status, label: UNIT_STATUS_LABELS[status], count, share: total === 0 ? 0 : count / total };
    }),
  };
}

export function getOccupancySeries(count = 6) {
  const db = getDb();
  const total = db.units.length || 1;

  return getPeriods(count)
    .slice(-count)
    .map((period) => {
      const occupied = new Set(
        db.invoices.filter((invoice) => invoice.period === period).map((invoice) => invoice.unitId),
      ).size;
      return { period, rate: (occupied / total) * 100 };
    });
}

export type DashboardMetrics = {
  currentPeriod: string;
  collected: number;
  collectedDelta: number;
  overdueAmount: number;
  overdueDelta: number;
  overdueCount: number;
  collectionRate: number;
  collectionRateDelta: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  vacantUnits: number;
  maintenanceUnits: number;
  activeLeases: number;
  expiringLeases: number;
  pendingApprovals: number;
  upcomingBookings: number;
  series: PeriodSummary[];
  breakdown: ReturnType<typeof getUnitBreakdown>;
  occupancy: ReturnType<typeof getOccupancySeries>;
};

export function getDashboardMetrics(): DashboardMetrics {
  const db = getDb();
  const asOf = today();
  const series = getPeriodSeries(7);
  const current = series[series.length - 1];
  const previous = series[series.length - 2] ?? current;

  const overdueInvoices = db.invoices.filter((invoice) => effectiveStatus(invoice, asOf) === "overdue");
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const previousOverdue = previous.overdue || 1;

  const units = db.units;
  const occupied = units.filter((unit) => unit.status === "occupied").length;
  const expiring = db.residents.filter((resident) => resident.status === "expiring").length;

  return {
    currentPeriod: current.period,
    collected: current.collected,
    collectedDelta: percentChange(current.collected, previous.collected),
    overdueAmount,
    overdueDelta: percentChange(overdueAmount, previousOverdue),
    overdueCount: overdueInvoices.length,
    collectionRate: current.collectionRate,
    collectionRateDelta: current.collectionRate - previous.collectionRate,
    totalUnits: units.length,
    occupiedUnits: occupied,
    occupancyRate: units.length === 0 ? 0 : (occupied / units.length) * 100,
    vacantUnits: units.filter((unit) => unit.status === "vacant").length,
    maintenanceUnits: units.filter((unit) => unit.status === "maintenance").length,
    activeLeases: db.residents.filter((resident) => resident.status === "active" || resident.status === "expiring")
      .length,
    expiringLeases: expiring,
    pendingApprovals: db.bookings.filter((booking) => booking.status === "pending").length,
    upcomingBookings: db.bookings.filter((booking) => booking.date >= asOf && booking.status === "approved").length,
    series: series.slice(-7),
    breakdown: getUnitBreakdown(),
    occupancy: getOccupancySeries(6),
  };
}

export type AnalyticsData = {
  series: PeriodSummary[];
  occupancy: ReturnType<typeof getOccupancySeries>;
  topOverdue: Array<{ residentName: string; unitCode: string; propertyName: string; amount: number; invoices: number }>;
  facilityUsage: Array<{ name: string; propertyName: string; bookings: number; revenue: number }>;
  announcementEngagement: Array<{ title: string; recipients: number; reads: number; rate: number }>;
  revenueByProperty: Array<{ name: string; billed: number; collected: number; rate: number }>;
  unitMix: Array<{ type: string; count: number; averageRent: number }>;
};

export function getAnalytics(): AnalyticsData {
  const db = getDb();
  const asOf = today();
  const series = getPeriodSeries(6);
  const current = series[series.length - 1];

  const overdueByResident = new Map<string, { amount: number; invoices: number }>();
  for (const invoice of db.invoices) {
    if (effectiveStatus(invoice, asOf) !== "overdue" || !invoice.residentId) continue;
    const entry = overdueByResident.get(invoice.residentId) ?? { amount: 0, invoices: 0 };
    entry.amount += invoice.amount;
    entry.invoices += 1;
    overdueByResident.set(invoice.residentId, entry);
  }

  const residents = new Map(db.residents.map((resident) => [resident.id, resident]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));

  const topOverdue = Array.from(overdueByResident.entries())
    .map(([residentId, entry]) => {
      const resident = residents.get(residentId);
      const unit = resident?.unitId ? units.get(resident.unitId) : null;
      return {
        residentName: resident?.name ?? "Unknown",
        unitCode: unit?.code ?? "—",
        propertyName: unit ? propertyName(db, unit.propertyId) : "—",
        amount: entry.amount,
        invoices: entry.invoices,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const facilityUsage = db.facilities
    .map((facility) => {
      const bookings = db.bookings.filter(
        (booking) => booking.facilityId === facility.id && (booking.status === "approved" || booking.status === "completed"),
      );
      return {
        name: facility.name,
        propertyName: propertyName(db, facility.propertyId),
        bookings: bookings.length,
        revenue: bookings.reduce((sum, booking) => sum + booking.fee, 0),
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 8);

  const announcementEngagement = db.announcements
    .filter((announcement) => announcement.status === "sent")
    .map((announcement) => ({
      title: announcement.title,
      recipients: announcement.recipients,
      reads: announcement.reads,
      rate: announcement.recipients === 0 ? 0 : (announcement.reads / announcement.recipients) * 100,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  const revenueByProperty = db.properties.map((property) => {
    const invoices = db.invoices.filter(
      (invoice) => invoice.propertyId === property.id && invoice.period === current.period && invoice.status !== "void",
    );
    const billed = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const collected = invoices
      .filter((invoice) => effectiveStatus(invoice, asOf) === "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    return { name: property.name, billed, collected, rate: billed === 0 ? 0 : (collected / billed) * 100 };
  });

  const unitMix = ["Studio", "1BR", "2BR", "3BR"].map((type) => {
    const matching = db.units.filter((unit) => unit.type === type);
    return {
      type,
      count: matching.length,
      averageRent: matching.length === 0 ? 0 : matching.reduce((sum, unit) => sum + unit.rent, 0) / matching.length,
    };
  });

  return { series, occupancy: getOccupancySeries(6), topOverdue, facilityUsage, announcementEngagement, revenueByProperty, unitMix };
}

export type AuditStats = {
  total30d: number;
  successful: number;
  failed: number;
  actors: number;
};

export function getAuditStats(): AuditStats {
  const db = getDb();
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const recent = db.auditLogs.filter((entry) => entry.at >= cutoff);

  return {
    total30d: recent.length,
    successful: recent.filter((entry) => entry.success).length,
    failed: recent.filter((entry) => !entry.success).length,
    actors: new Set(db.auditLogs.map((entry) => entry.actor)).size,
  };
}

export type { Booking, Facility, Resident, Unit };
