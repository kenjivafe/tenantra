import type {
  Announcement,
  AuditLog,
  Booking,
  Database,
  Facility,
  Invoice,
  PaymentMethod,
  Property,
  Resident,
  Unit,
  UnitStatus,
  UnitType,
} from "@/lib/types";
import { formatMoney, formatPeriod } from "@/lib/format";

export const DB_VERSION = 1;

/** Deterministic PRNG so every reseed produces the same demo dataset. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Juan", "Maria", "Alex", "Sarah", "Miguel", "Andrea", "Paolo", "Bianca", "Rafael", "Camille",
  "Nathan", "Isabel", "Diego", "Trisha", "Marco", "Angela", "Carlo", "Patricia", "Emilio", "Danica",
  "Joshua", "Kristine", "Enrique", "Lorna", "Vicente", "Beatriz", "Gabriel", "Monica", "Rodrigo", "Elaine",
];

const LAST_NAMES = [
  "Dela Cruz", "Santos", "Tan", "Lee", "Reyes", "Garcia", "Mendoza", "Aquino", "Villanueva", "Ramos",
  "Bautista", "Ocampo", "Domingo", "Navarro", "Salazar", "Cruz", "Torres", "Castillo", "Rivera", "Flores",
];

const UNIT_TYPES: Array<{ type: UnitType; rent: number; weight: number }> = [
  { type: "Studio", rent: 9_500, weight: 0.24 },
  { type: "1BR", rent: 13_500, weight: 0.34 },
  { type: "2BR", rent: 18_500, weight: 0.28 },
  { type: "3BR", rent: 26_000, weight: 0.14 },
];

const PAYMENT_METHODS: PaymentMethod[] = ["gcash", "bank-transfer", "card", "cash", "check"];

const UNIT_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const ADMIN = "Admin User";
const ACTORS = [ADMIN, "Property Manager", "Front Desk Staff"];
const IPS: Record<string, string> = {
  [ADMIN]: "192.168.1.100",
  "Property Manager": "192.168.1.101",
  "Front Desk Staff": "192.168.1.102",
};

function pad(value: number, size = 3) {
  return String(value).padStart(size, "0");
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function periodOf(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1, 2)}`;
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000);
}

/** The `count` most recent billing periods, oldest first, ending with `now`. */
export function recentPeriods(now: Date, count: number) {
  const periods: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    periods.push(periodOf(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))));
  }
  return periods;
}

export function periodDueDate(period: string, dueDay: number) {
  const [year, month] = period.split("-").map(Number);
  return isoDate(new Date(Date.UTC(year, month - 1, dueDay)));
}

export function createSeedDatabase(now = new Date()): Database {
  const random = mulberry32(20260724);
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  const properties: Property[] = [
    { id: "prop-1", name: "Aurora Tower", code: "T1" },
    { id: "prop-2", name: "Bayview Residences", code: "T2" },
    { id: "prop-3", name: "Crestpark Suites", code: "T3" },
  ];

  const unitCounts: Record<string, { floors: number; perFloor: number; premium: number }> = {
    "prop-1": { floors: 20, perFloor: 8, premium: 1 },
    "prop-2": { floors: 18, perFloor: 8, premium: 1.15 },
    "prop-3": { floors: 15, perFloor: 6, premium: 0.9 },
  };

  // ---------------------------------------------------------------- units
  const units: Unit[] = [];
  for (const property of properties) {
    const plan = unitCounts[property.id];
    for (let floor = 1; floor <= plan.floors; floor += 1) {
      for (let slot = 0; slot < plan.perFloor; slot += 1) {
        const roll = random();
        let acc = 0;
        const spec = UNIT_TYPES.find((candidate) => {
          acc += candidate.weight;
          return roll <= acc;
        })!;

        const statusRoll = random();
        const status: UnitStatus =
          statusRoll < 0.82 ? "occupied" : statusRoll < 0.9 ? "vacant" : statusRoll < 0.96 ? "reserved" : "maintenance";

        const rent = Math.round((spec.rent * plan.premium * (1 + floor / 200)) / 100) * 100;

        units.push({
          id: `unit-${property.code}-${floor}${UNIT_LETTERS[slot]}`,
          code: `${floor}${UNIT_LETTERS[slot]}`,
          propertyId: property.id,
          type: spec.type,
          floor,
          rent,
          dues: Math.round((rent * 0.08) / 50) * 50,
          status,
          residentId: null,
        });
      }
    }
  }

  // ------------------------------------------------------------ residents
  const residents: Resident[] = [];
  const usedNames = new Set<string>();
  let residentSeq = 0;

  const nextName = () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
    const fallback = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)} ${usedNames.size}`;
    usedNames.add(fallback);
    return fallback;
  };

  const makeResident = (unit: Unit | null, status: Resident["status"]): Resident => {
    residentSeq += 1;
    const name = nextName();
    const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
    const leaseStart = unit ? addMonths(now, -between(1, 30)) : null;
    const termMonths = pick([12, 12, 12, 24]);

    return {
      id: `res-${pad(residentSeq, 4)}`,
      name,
      email: `${handle}@example.com`,
      phone: `+63 9${between(10, 99)} ${between(100, 999)} ${between(1000, 9999)}`,
      unitId: unit?.id ?? null,
      leaseStart: leaseStart ? isoDate(leaseStart) : null,
      leaseEnd: leaseStart ? isoDate(addMonths(leaseStart, termMonths)) : null,
      status,
      createdAt: (leaseStart ? addDays(leaseStart, -between(5, 40)) : addMonths(now, -between(1, 20))).toISOString(),
    };
  };

  for (const unit of units) {
    if (unit.status === "occupied") {
      const resident = makeResident(unit, "active");
      // A lease inside its final 30 days is surfaced as expiring.
      if (resident.leaseEnd) {
        const daysLeft = (new Date(resident.leaseEnd).getTime() - now.getTime()) / 86_400_000;
        if (daysLeft < 0) {
          // Auto-renew anything that already lapsed so the demo has no dangling leases.
          resident.leaseEnd = isoDate(addMonths(now, between(2, 18)));
        } else if (daysLeft <= 30) {
          resident.status = "expiring";
        }
      }
      unit.residentId = resident.id;
      residents.push(resident);
    } else if (unit.status === "reserved") {
      const resident = makeResident(unit, "pending");
      resident.leaseStart = isoDate(addDays(now, between(3, 45)));
      resident.leaseEnd = isoDate(addMonths(new Date(resident.leaseStart), 12));
      unit.residentId = resident.id;
      residents.push(resident);
    }
  }

  for (let i = 0; i < 12; i += 1) {
    residents.push(makeResident(null, "blacklisted"));
  }

  const residentById = new Map(residents.map((resident) => [resident.id, resident]));
  const unitById = new Map(units.map((unit) => [unit.id, unit]));

  // ------------------------------------------------------------- invoices
  const periods = recentPeriods(now, 6);
  const invoices: Invoice[] = [];
  let invoiceSeq = 0;
  const today = isoDate(now);

  for (const period of periods) {
    const isCurrent = period === periods[periods.length - 1];
    for (const unit of units) {
      if (unit.status !== "occupied" || !unit.residentId) continue;
      const resident = residentById.get(unit.residentId)!;
      if (resident.leaseStart && resident.leaseStart.slice(0, 7) > period) continue;

      invoiceSeq += 1;
      const dueDate = periodDueDate(period, 5);
      const lines = [
        { label: "Monthly rent", amount: unit.rent },
        { label: "Association dues", amount: unit.dues },
      ];
      if (random() < 0.35) lines.push({ label: "Parking slot", amount: 1_500 });
      if (random() < 0.5) lines.push({ label: "Water & utilities", amount: between(4, 18) * 100 });

      const amount = lines.reduce((sum, line) => sum + line.amount, 0);
      const paidChance = isCurrent ? 0.62 : 0.96;
      const isPaid = random() < paidChance;
      const overdue = !isPaid && dueDate < today;

      const paidAt = isPaid
        ? addDays(new Date(dueDate), between(-9, 4)).toISOString()
        : null;

      invoices.push({
        id: `inv-${pad(invoiceSeq, 5)}`,
        number: `INV-${period.replace("-", "")}-${pad(invoiceSeq, 4)}`,
        residentId: resident.id,
        unitId: unit.id,
        propertyId: unit.propertyId,
        period,
        lines,
        amount,
        dueDate,
        status: isPaid ? "paid" : overdue ? "overdue" : "pending",
        issuedAt: new Date(`${period}-01T08:00:00.000Z`).toISOString(),
        payment: paidAt
          ? {
              amount,
              method: pick(PAYMENT_METHODS),
              reference: `PMT-${between(100000, 999999)}`,
              at: paidAt,
            }
          : null,
        remindersSent: overdue ? between(1, 3) : 0,
        lastReminderAt: overdue ? addDays(new Date(dueDate), between(2, 10)).toISOString() : null,
        note: null,
      });
    }
  }

  // ----------------------------------------------------------- facilities
  const facilityBlueprint: Array<Omit<Facility, "id" | "propertyId">> = [
    { name: "Function Room", capacity: 50, rateType: "hourly", rate: 2_000, status: "active", openHour: 8, closeHour: 22, requiresApproval: true },
    { name: "Swimming Pool", capacity: 30, rateType: "free", rate: 0, status: "active", openHour: 6, closeHour: 20, requiresApproval: false },
    { name: "Gym", capacity: 20, rateType: "monthly", rate: 500, status: "active", openHour: 5, closeHour: 22, requiresApproval: false },
    { name: "Basketball Court", capacity: 10, rateType: "hourly", rate: 300, status: "active", openHour: 7, closeHour: 21, requiresApproval: true },
  ];

  const facilities: Facility[] = [];
  properties.forEach((property, propertyIndex) => {
    facilityBlueprint.forEach((blueprint, index) => {
      facilities.push({
        ...blueprint,
        id: `fac-${propertyIndex + 1}-${index + 1}`,
        propertyId: property.id,
        status: propertyIndex === 2 && blueprint.name === "Swimming Pool" ? "maintenance" : blueprint.status,
      });
    });
  });

  // ------------------------------------------------------------- bookings
  const activeResidents = residents.filter((resident) => resident.status === "active" || resident.status === "expiring");
  const bookings: Booking[] = [];
  for (let i = 0; i < 48; i += 1) {
    const facility = pick(facilities.filter((item) => item.status === "active"));
    const resident = pick(activeResidents);
    const dayOffset = between(-14, 12);
    const date = addDays(now, dayOffset);
    const startHour = between(facility.openHour, facility.closeHour - 2);
    const endHour = Math.min(startHour + between(1, 3), facility.closeHour);
    const hours = endHour - startHour;

    let status: Booking["status"];
    if (dayOffset < 0) {
      status = random() < 0.85 ? "completed" : random() < 0.5 ? "cancelled" : "rejected";
    } else if (facility.requiresApproval) {
      status = random() < 0.45 ? "pending" : random() < 0.85 ? "approved" : "rejected";
    } else {
      status = "approved";
    }

    bookings.push({
      id: `bkg-${pad(i + 1, 4)}`,
      facilityId: facility.id,
      residentId: resident.id,
      date: isoDate(date),
      startHour,
      endHour,
      status,
      fee: facility.rateType === "hourly" ? facility.rate * hours : facility.rateType === "monthly" ? facility.rate : 0,
      note: null,
      createdAt: addDays(date, -between(1, 9)).toISOString(),
      decidedAt: status === "pending" ? null : addDays(date, -between(0, 3)).toISOString(),
      decidedBy: status === "pending" ? null : pick(ACTORS),
    });
  }
  bookings.sort((a, b) => (a.date < b.date ? 1 : -1));

  // -------------------------------------------------------- announcements
  const announcementBlueprint: Array<{
    title: string;
    body: string;
    scope: "all" | "property";
    status: Announcement["status"];
    daysAgo: number;
  }> = [
    {
      title: "Water Interruption Notice",
      body: "Scheduled water line maintenance will take place from 9:00 AM to 3:00 PM. Please store water in advance. We apologise for the inconvenience.",
      scope: "property",
      status: "sent",
      daysAgo: 3,
    },
    {
      title: "Parking Fee Update Effective Next Month",
      body: "Reserved parking slots will be adjusted to ₱1,800 per month starting next billing cycle. Existing slot holders keep their assignments.",
      scope: "all",
      status: "sent",
      daysAgo: 9,
    },
    {
      title: "Elevator Maintenance Schedule",
      body: "Elevator B will be offline for its annual inspection. Please use Elevator A during this period.",
      scope: "property",
      status: "draft",
      daysAgo: 1,
    },
    {
      title: "Community Fun Run",
      body: "Join our community fun run at the podium deck. Registration is free for all residents and one guest.",
      scope: "all",
      status: "sent",
      daysAgo: 16,
    },
    {
      title: "Fire Drill Advisory",
      body: "A building-wide fire drill will be conducted. Alarms will sound for approximately ten minutes.",
      scope: "all",
      status: "sent",
      daysAgo: 24,
    },
    {
      title: "Holiday Billing Cut-off",
      body: "Payment counters will be closed during the holiday. Online payments remain available 24/7.",
      scope: "all",
      status: "draft",
      daysAgo: 0,
    },
  ];

  const announcements: Announcement[] = announcementBlueprint.map((blueprint, index) => {
    const property = blueprint.scope === "property" ? properties[index % properties.length] : null;
    const recipients =
      blueprint.status === "sent"
        ? property
          ? units.filter((unit) => unit.propertyId === property.id && unit.status === "occupied").length
          : units.filter((unit) => unit.status === "occupied").length
        : 0;

    const createdAt = addDays(now, -blueprint.daysAgo);
    return {
      id: `ann-${pad(index + 1, 3)}`,
      title: blueprint.title,
      body: blueprint.body,
      audience: {
        scope: blueprint.scope,
        propertyId: property?.id ?? null,
        unitCodes: [],
      },
      channels: { email: true, push: true, sms: blueprint.title.includes("Water") },
      status: blueprint.status,
      createdBy: ADMIN,
      createdAt: createdAt.toISOString(),
      sentAt: blueprint.status === "sent" ? createdAt.toISOString() : null,
      recipients,
      reads: blueprint.status === "sent" ? Math.round(recipients * (0.9 + random() * 0.09)) : 0,
    };
  });

  // ------------------------------------------------------------ audit log
  const auditLogs: AuditLog[] = [];
  let auditSeq = 0;
  const log = (at: Date, actor: string, action: AuditLog["action"], module: string, description: string, success = true) => {
    auditSeq += 1;
    auditLogs.push({
      id: `log-${pad(auditSeq, 5)}`,
      at: at.toISOString(),
      actor,
      action,
      module,
      description,
      ip: IPS[actor] ?? "192.168.1.100",
      success,
    });
  };

  for (const period of periods) {
    const generated = invoices.filter((invoice) => invoice.period === period);
    log(
      new Date(`${period}-01T08:00:00.000Z`),
      ADMIN,
      "create",
      "Billing",
      `Billing cycle generated for ${formatPeriod(period)} — ${generated.length} invoices, ${formatMoney(
        generated.reduce((sum, invoice) => sum + invoice.amount, 0),
      )}`,
    );
  }

  for (const invoice of invoices.filter((item) => item.payment).slice(-24)) {
    log(
      new Date(invoice.payment!.at),
      pick(ACTORS),
      "update",
      "Billing",
      `Payment ${formatMoney(invoice.payment!.amount)} recorded for ${invoice.number} (${invoice.payment!.method})`,
    );
  }

  for (const announcement of announcements.filter((item) => item.sentAt)) {
    log(
      new Date(announcement.sentAt!),
      announcement.createdBy,
      "create",
      "Announcements",
      `Announcement "${announcement.title}" sent to ${announcement.recipients} residents`,
    );
  }

  for (const booking of bookings.filter((item) => item.decidedAt).slice(0, 14)) {
    const facility = facilities.find((item) => item.id === booking.facilityId)!;
    const resident = residentById.get(booking.residentId)!;
    log(
      new Date(booking.decidedAt!),
      booking.decidedBy ?? ADMIN,
      "update",
      "Facilities",
      `Booking for ${facility.name} by ${resident.name} marked ${booking.status}`,
    );
  }

  for (const resident of residents.slice(0, 10)) {
    const unit = resident.unitId ? unitById.get(resident.unitId) : null;
    log(
      new Date(resident.createdAt),
      pick(ACTORS),
      "create",
      "Residents",
      unit ? `Added resident ${resident.name} to Unit ${unit.code}` : `Added resident ${resident.name}`,
    );
  }

  for (let i = 0; i < 12; i += 1) {
    const actor = pick(ACTORS);
    const success = random() > 0.15;
    log(
      addDays(now, -between(0, 20)),
      actor,
      "login",
      "System",
      success ? "User logged in successfully" : "Failed login attempt — invalid password",
      success,
    );
  }

  auditLogs.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    properties,
    units,
    residents,
    invoices,
    announcements,
    facilities,
    bookings,
    auditLogs,
    settings: {
      orgName: "Tenantra Property Group",
      adminName: ADMIN,
      adminEmail: "admin@tenantra.local",
      currency: "PHP",
      billingDueDay: 5,
      gracePeriodDays: 3,
      lateFeePercent: 2,
      channels: { email: true, push: true, sms: false },
    },
  };
}
