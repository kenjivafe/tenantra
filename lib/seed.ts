import type {
  Announcement,
  AuditLog,
  Bill,
  Cheque,
  Database,
  ImprovementRequest,
  Location,
  Tenant,
  Unit,
  UnitCategory,
} from "@/lib/types";
import { formatMoney, formatPeriod } from "@/lib/format";

export const DB_VERSION = 2;

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
  "Maricel", "Juan", "Andrea", "Paolo", "Bianca", "Rafael", "Camille", "Nathan", "Isabel", "Diego",
  "Trisha", "Marco", "Angela", "Carlo", "Patricia", "Emilio", "Danica", "Joshua", "Kristine", "Enrique",
  "Lorna", "Vicente", "Beatriz", "Gabriel", "Monica", "Rodrigo", "Elaine", "Miguel", "Sarah", "Alex",
];

const LAST_NAMES = [
  "Samaniego Espiritu", "Dela Cruz", "Santos", "Tan", "Reyes", "Garcia", "Mendoza", "Aquino", "Villanueva",
  "Ramos", "Bautista", "Ocampo", "Domingo", "Navarro", "Salazar", "Cruz", "Torres", "Castillo", "Rivera", "Flores",
];

const BANKS = ["BDO", "BPI", "Metrobank", "Landbank", "UnionBank", "PNB", "Security Bank"];

const RESIDENTIAL_INVENTORY = [
  "One (1) Smart Television",
  "One (1) Inverter Air Conditioner",
  "One (1) Refrigerator",
  "One (1) Bed",
  "One (1) Table and Chair Set",
  "One (1) Washing Machine",
  "One (1) Water Heater",
];

const COMMERCIAL_INVENTORY = [
  "One (1) Roll-up Door",
  "Ceiling Lights and Outlets",
  "One (1) Comfort Room",
  "Mezzanine Storage",
];

const ADMIN = "Admin User";
const ACTORS = [ADMIN, "Property Admin", "Front Desk"];

const OWNERS_BY_LOCATION: Record<string, string> = {
  "loc-tug": "Deanne Keith Tan",
  "loc-pen": "Ramon Villanueva",
  "loc-sam": "Corazon Bautista",
  "loc-qc": "Deanne Keith Tan",
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
  const random = mulberry32(20260726);
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const money = (min: number, max: number, step = 100) => Math.round(between(min, max) / step) * step;

  const locations: Location[] = [
    { id: "loc-tug", name: "Tuguegarao", code: "TUG" },
    { id: "loc-pen", name: "Peñablanca", code: "PEN" },
    { id: "loc-sam", name: "Sampaloc", code: "SAM" },
    { id: "loc-qc", name: "Quezon City", code: "QC" },
  ];

  const unitPlan: Record<string, number> = { "loc-tug": 10, "loc-pen": 6, "loc-sam": 8, "loc-qc": 12 };

  // ---------------------------------------------------------------- units
  const units: Unit[] = [];
  let meterSeq = 4500;

  for (const location of locations) {
    const count = unitPlan[location.id];
    for (let i = 0; i < count; i += 1) {
      const floor = Math.floor(i / 4) + 1;
      const letter = String.fromCharCode(65 + (i % 4));
      const code = `${floor}${letter}`;

      const category: UnitCategory = random() < 0.3 ? "commercial" : "residential";
      const tenancy = category === "commercial" ? (random() < 0.6 ? "long-term" : "short-term") : random() < 0.7 ? "long-term" : "short-term";

      const rent =
        category === "commercial" ? money(18_000, 55_000, 500) : money(8_000, 24_000, 500);

      meterSeq += between(3, 9);
      const electricMeterNo = `${location.code}-E${pad(meterSeq, 5)}`;
      meterSeq += between(3, 9);
      const waterMeterNo = `${location.code}-W${pad(meterSeq, 5)}`;

      const statusRoll = random();
      const status = statusRoll < 0.8 ? "occupied" : statusRoll < 0.92 ? "vacant" : "maintenance";

      units.push({
        id: `unit-${location.code}-${code}`,
        code,
        locationId: location.id,
        category,
        tenancy,
        owner: OWNERS_BY_LOCATION[location.id],
        rent,
        electricMeterNo,
        waterMeterNo,
        depositMonths: 1,
        advanceMonths: 1,
        furnished: category === "residential" && random() < 0.7,
        inventory: category === "residential" ? RESIDENTIAL_INVENTORY : COMMERCIAL_INVENTORY,
        status,
        tenantId: null,
      });
    }
  }

  // -------------------------------------------------------------- tenants
  const tenants: Tenant[] = [];
  const usedNames = new Set<string>();
  let tenantSeq = 0;

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

  for (const unit of units) {
    if (unit.status !== "occupied") continue;

    tenantSeq += 1;
    const name = nextName();
    const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
    const termMonths = unit.tenancy === "long-term" ? pick([12, 12, 24]) : pick([1, 1, 3, 6]);
    const leaseStart = addMonths(now, -between(0, termMonths - 1 > 0 ? termMonths - 1 : 1));
    // Auto-renew anything that would already be expired so the demo has live leases.
    let leaseEnd = addMonths(leaseStart, termMonths);
    if (leaseEnd.getTime() <= now.getTime()) leaseEnd = addMonths(now, between(2, termMonths));

    tenants.push({
      id: `ten-${pad(tenantSeq, 4)}`,
      name,
      email: `${handle}@example.com`,
      phone: `09${between(10, 99)} ${between(100, 999)} ${between(1000, 9999)}`,
      homeAddress: pick([
        "Brgy. Ugac Sur, Tuguegarao City, Cagayan",
        "PH4 B14 L9 Avida Settings Nuvali, Calamba, Laguna",
        "Brgy. Caggay, Tuguegarao City, Cagayan",
        "Brgy. Sampaloc, Manila",
        "Brgy. Commonwealth, Quezon City",
      ]),
      unitId: unit.id,
      lessor: unit.owner,
      contractType: unit.tenancy === "long-term" ? "residential" : "accommodation",
      leaseStart: isoDate(leaseStart),
      leaseEnd: isoDate(leaseEnd),
      termMonths,
      monthlyRent: unit.rent,
      dueDay: 15,
      depositAmount: unit.rent * unit.depositMonths,
      advanceAmount: unit.rent * unit.advanceMonths,
      paymentMode: unit.tenancy === "long-term" ? "pdc" : pick(["gcash", "bank-transfer", "cash"]),
      inventory: unit.inventory,
      status: "current",
      createdAt: addDays(leaseStart, -between(2, 15)).toISOString(),
    });
    unit.tenantId = tenants[tenants.length - 1].id;
  }

  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const today = isoDate(now);

  // ---------------------------------------------------------------- bills
  const periods = recentPeriods(now, 6);
  const bills: Bill[] = [];
  let billSeq = 0;

  for (const period of periods) {
    const isCurrent = period === periods[periods.length - 1];
    for (const tenant of tenants) {
      if (!tenant.unitId || !tenant.leaseStart) continue;
      if (tenant.leaseStart.slice(0, 7) > period) continue;

      const unit = unitById.get(tenant.unitId)!;
      billSeq += 1;
      const electric = unit.status === "occupied" ? money(700, 3_800, 10) : 0;
      const water = money(150, 850, 10);
      const hasOther = random() < 0.2;
      const other = hasOther ? money(300, 1_500, 50) : 0;
      const amount = tenant.monthlyRent + electric + water + other;
      const dueDate = periodDueDate(period, tenant.dueDay);

      const paidChance = isCurrent ? 0.55 : 0.95;
      const isPaid = random() < paidChance;
      const overdue = !isPaid && dueDate < today;
      const paidAt = isPaid ? addDays(new Date(dueDate), between(-6, 3)).toISOString() : null;

      bills.push({
        id: `bill-${pad(billSeq, 5)}`,
        number: `BILL-${period.replace("-", "")}-${pad(billSeq, 4)}`,
        tenantId: tenant.id,
        unitId: unit.id,
        locationId: unit.locationId,
        period,
        rent: tenant.monthlyRent,
        electric,
        water,
        other,
        otherLabel: hasOther ? pick(["Parking", "Association dues", "Repairs share"]) : null,
        amount,
        dueDate,
        issuedAt: new Date(`${period}-01T08:00:00.000Z`).toISOString(),
        status: isPaid ? "paid" : overdue ? "overdue" : "pending",
        payment: paidAt
          ? {
              method: tenant.paymentMode,
              reference: tenant.paymentMode === "pdc" ? `CHK-${between(100000, 999999)}` : `REF-${between(100000, 999999)}`,
              date: paidAt,
              chequeId: null,
            }
          : null,
        note: null,
      });
    }
  }

  // Flag tenants with an overdue bill.
  for (const tenant of tenants) {
    if (bills.some((bill) => bill.tenantId === tenant.id && bill.status === "overdue")) {
      tenant.status = "overdue";
    }
  }

  // ------------------------------------------------------------- cheques (PDC schedule)
  const cheques: Cheque[] = [];
  let chequeSeq = 0;

  for (const tenant of tenants) {
    if (tenant.paymentMode !== "pdc" || !tenant.unitId || !tenant.leaseStart) continue;
    const bank = pick(BANKS);
    const start = new Date(tenant.leaseStart);

    for (let i = 0; i < tenant.termMonths; i += 1) {
      chequeSeq += 1;
      const dueDate = periodDueDate(periodOf(addMonths(start, i)), tenant.dueDay);
      const period = periodOf(addMonths(start, i));
      let status: Cheque["status"];
      if (dueDate < today) status = random() < 0.9 ? "deposited" : "bounced";
      else status = "pending";

      cheques.push({
        id: `chk-${pad(chequeSeq, 5)}`,
        tenantId: tenant.id,
        unitId: tenant.unitId,
        chequeNo: `${between(1000, 9999)}${between(1000, 9999)}`,
        bank,
        amount: tenant.monthlyRent,
        dueDate,
        period,
        status,
        billId: null,
      });
    }
  }

  // ---------------------------------------------------- improvement requests
  const improvementBlueprint: Array<{ title: string; description: string; cost: number; status: ImprovementRequest["status"] }> = [
    {
      title: "Install kitchen exhaust hood",
      description: "Requesting permission to install a wall-mounted exhaust hood above the cooking area for better ventilation. Will be professionally installed and removable upon move-out.",
      cost: 8_500,
      status: "pending",
    },
    {
      title: "Add partition wall for home office",
      description: "Requesting to add a lightweight gypsum partition to create a small home office. No structural changes to the unit.",
      cost: 15_000,
      status: "approved",
    },
    {
      title: "Repaint interior walls",
      description: "Requesting to repaint the living area from white to a warm neutral tone. Will restore to original color at end of lease if required.",
      cost: 6_000,
      status: "rejected",
    },
    {
      title: "Upgrade to grease trap for food stall",
      description: "For the commercial space — requesting installation of a compliant grease trap required by the LGU for food operations.",
      cost: 22_000,
      status: "completed",
    },
    {
      title: "Install water filtration system",
      description: "Requesting to install an under-sink water filtration unit. Plumbing tap-in only, fully reversible.",
      cost: 4_500,
      status: "pending",
    },
  ];

  const occupiedTenants = tenants.filter((tenant) => tenant.unitId);
  const improvements: ImprovementRequest[] = improvementBlueprint.map((blueprint, index) => {
    const tenant = occupiedTenants[(index * 3) % occupiedTenants.length];
    const createdAt = addDays(now, -between(2, 40));
    return {
      id: `imp-${pad(index + 1, 4)}`,
      tenantId: tenant.id,
      unitId: tenant.unitId!,
      title: blueprint.title,
      description: blueprint.description,
      estimatedCost: blueprint.cost,
      status: blueprint.status,
      createdAt: createdAt.toISOString(),
      decidedAt: blueprint.status === "pending" ? null : addDays(createdAt, between(1, 5)).toISOString(),
      ownerResponse:
        blueprint.status === "approved"
          ? "Approved provided all work is professional and reversible at end of lease."
          : blueprint.status === "rejected"
            ? "Not approved at this time due to the strict no-alteration clause. Let's discuss alternatives."
            : blueprint.status === "completed"
              ? "Completed and inspected. Compliant with LGU requirements."
              : null,
    };
  });

  // -------------------------------------------------------- announcements
  const announcements: Announcement[] = [
    {
      id: "ann-001",
      title: "Water Interruption Advisory",
      body: "Please be advised that the local water district will conduct maintenance from 9:00 AM to 3:00 PM. Kindly store water in advance.",
      audience: { scope: "location", locationId: "loc-tug" },
      channels: { email: true, sms: true },
      status: "sent",
      createdBy: ADMIN,
      createdAt: addDays(now, -4).toISOString(),
      sentAt: addDays(now, -4).toISOString(),
      recipients: units.filter((unit) => unit.locationId === "loc-tug" && unit.status === "occupied").length,
      reads: 0,
    },
    {
      id: "ann-002",
      title: "Reminder: Rent Due Every 15th",
      body: "A friendly reminder that rent is due every 15th of the month. A 10% penalty applies to payments delayed by more than one month. Thank you for your prompt settlement.",
      audience: { scope: "all", locationId: null },
      channels: { email: true, sms: false },
      status: "sent",
      createdBy: ADMIN,
      createdAt: addDays(now, -10).toISOString(),
      sentAt: addDays(now, -10).toISOString(),
      recipients: units.filter((unit) => unit.status === "occupied").length,
      reads: 0,
    },
    {
      id: "ann-003",
      title: "Holiday Office Hours",
      body: "The admin office will be closed on the upcoming holiday. For emergencies, please contact the property admin directly.",
      audience: { scope: "all", locationId: null },
      channels: { email: true, sms: false },
      status: "draft",
      createdBy: ADMIN,
      createdAt: addDays(now, -1).toISOString(),
      sentAt: null,
      recipients: 0,
      reads: 0,
    },
  ];

  for (const announcement of announcements) {
    if (announcement.status === "sent") {
      announcement.reads = Math.round(announcement.recipients * (0.8 + random() * 0.18));
    }
  }

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
      success,
    });
  };

  for (const tenant of tenants.slice(0, 12)) {
    const unit = tenant.unitId ? unitById.get(tenant.unitId) : null;
    log(
      new Date(tenant.createdAt),
      pick(ACTORS),
      "create",
      "Tenants",
      unit ? `Onboarded ${tenant.name} to Unit ${unit.code} and generated ${tenant.contractType} contract` : `Onboarded ${tenant.name}`,
    );
  }

  for (const period of periods) {
    const generated = bills.filter((bill) => bill.period === period);
    log(
      new Date(`${period}-01T08:05:00.000Z`),
      ADMIN,
      "create",
      "Billing",
      `Bills generated for ${formatPeriod(period)} — ${generated.length} bills, ${formatMoney(
        generated.reduce((sum, bill) => sum + bill.amount, 0),
      )}`,
    );
  }

  for (const bill of bills.filter((item) => item.payment).slice(-20)) {
    const tenant = tenantById.get(bill.tenantId);
    log(
      new Date(bill.payment!.date),
      pick(ACTORS),
      "update",
      "Billing",
      `Payment ${formatMoney(bill.amount)} recorded for ${bill.number} (${bill.payment!.method}) — ${tenant?.name ?? ""}`,
    );
  }

  for (const cheque of cheques.filter((item) => item.status === "bounced").slice(0, 6)) {
    const tenant = tenantById.get(cheque.tenantId);
    log(
      new Date(cheque.dueDate),
      ADMIN,
      "update",
      "Billing",
      `Cheque ${cheque.chequeNo} (${cheque.bank}) BOUNCED for ${tenant?.name ?? ""} — ${formatMoney(cheque.amount)}`,
      false,
    );
  }

  for (const improvement of improvements) {
    const tenant = tenantById.get(improvement.tenantId);
    log(
      new Date(improvement.createdAt),
      tenant?.name ?? ADMIN,
      "create",
      "Improvements",
      `Improvement request "${improvement.title}" submitted by ${tenant?.name ?? ""}`,
    );
  }

  for (let i = 0; i < 6; i += 1) {
    const success = random() > 0.15;
    log(addDays(now, -between(0, 15)), pick(ACTORS), "login", "System", success ? "User logged in successfully" : "Failed login attempt", success);
  }

  auditLogs.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    version: DB_VERSION,
    seededAt: now.toISOString(),
    locations,
    units,
    tenants,
    bills,
    cheques,
    improvements,
    announcements,
    auditLogs,
    settings: {
      orgName: "SJ Edward Builders — Property Management",
      adminName: ADMIN,
      adminEmail: "admin@tenantra.local",
      currency: "PHP",
      billingDueDay: 15,
      lateFeePercent: 10,
      channels: { email: true, sms: false },
    },
  };
}
