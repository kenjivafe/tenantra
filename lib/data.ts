import { getDb } from "@/lib/store";
import { recentPeriods } from "@/lib/seed";
import type {
  Announcement,
  AuditLog,
  Bill,
  BillStatus,
  Cheque,
  ImprovementRequest,
  Location,
  Settings,
  Tenant,
  Unit,
  UnitStatus,
} from "@/lib/types";

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function currentPeriod() {
  return today().slice(0, 7);
}

/** Pending bills become overdue the moment their due date passes. */
export function effectiveStatus(bill: Bill, asOf = today()): BillStatus {
  if (bill.status === "paid" || bill.status === "void") return bill.status;
  return bill.dueDate < asOf ? "overdue" : "pending";
}

export function getLocations(): Location[] {
  return getDb().locations;
}

export function getSettings(): Settings {
  return getDb().settings;
}

export function getPeriods(count = 6) {
  const db = getDb();
  const known = Array.from(new Set(db.bills.map((bill) => bill.period)));
  const recent = recentPeriods(new Date(), count);
  return Array.from(new Set([...known, ...recent])).sort();
}

function locationName(db: ReturnType<typeof getDb>, id: string) {
  return db.locations.find((location) => location.id === id)?.name ?? "—";
}

// ------------------------------------------------------------------- units

export type UnitRow = {
  id: string;
  code: string;
  locationId: string;
  locationName: string;
  category: Unit["category"];
  tenancy: Unit["tenancy"];
  owner: string;
  rent: number;
  electricMeterNo: string;
  waterMeterNo: string;
  status: UnitStatus;
  tenantId: string | null;
  tenantName: string | null;
  furnished: boolean;
  inventory: string[];
};

export function getUnitRows(): UnitRow[] {
  const db = getDb();
  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant]));

  return db.units
    .map((unit) => ({
      id: unit.id,
      code: unit.code,
      locationId: unit.locationId,
      locationName: locationName(db, unit.locationId),
      category: unit.category,
      tenancy: unit.tenancy,
      owner: unit.owner,
      rent: unit.rent,
      electricMeterNo: unit.electricMeterNo,
      waterMeterNo: unit.waterMeterNo,
      status: unit.status,
      tenantId: unit.tenantId,
      tenantName: unit.tenantId ? (tenants.get(unit.tenantId)?.name ?? null) : null,
      furnished: unit.furnished,
      inventory: unit.inventory,
    }))
    .sort(
      (a, b) =>
        a.locationName.localeCompare(b.locationName) || a.code.localeCompare(b.code),
    );
}

// ----------------------------------------------------------------- tenants

export type TenantRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string | null;
  unitCode: string | null;
  locationName: string | null;
  category: Unit["category"] | null;
  tenancy: Unit["tenancy"] | null;
  contractType: Tenant["contractType"];
  monthlyRent: number;
  leaseEnd: string | null;
  status: Tenant["status"];
  balance: number;
  nextDueDate: string | null;
  nextDueAmount: number;
  currentElectric: number;
  currentWater: number;
};

function tenantBalances(db: ReturnType<typeof getDb>, asOf: string) {
  const balances = new Map<string, number>();
  for (const bill of db.bills) {
    const status = effectiveStatus(bill, asOf);
    if (status === "paid" || status === "void") continue;
    balances.set(bill.tenantId, (balances.get(bill.tenantId) ?? 0) + bill.amount);
  }
  return balances;
}

export function getTenantRows(): TenantRow[] {
  const db = getDb();
  const units = new Map(db.units.map((unit) => [unit.id, unit]));
  const asOf = today();
  const balances = tenantBalances(db, asOf);

  return db.tenants
    .map((tenant) => {
      const unit = tenant.unitId ? units.get(tenant.unitId) : null;
      const bills = db.bills
        .filter((bill) => bill.tenantId === tenant.id && bill.status !== "void")
        .sort((a, b) => (a.period < b.period ? 1 : -1));
      const latest = bills[0];
      const nextDue = bills
        .filter((bill) => effectiveStatus(bill, asOf) !== "paid")
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))[0];

      return {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        unitId: tenant.unitId,
        unitCode: unit?.code ?? null,
        locationName: unit ? locationName(db, unit.locationId) : null,
        category: unit?.category ?? null,
        tenancy: unit?.tenancy ?? null,
        contractType: tenant.contractType,
        monthlyRent: tenant.monthlyRent,
        leaseEnd: tenant.leaseEnd,
        status: tenant.status,
        balance: balances.get(tenant.id) ?? 0,
        nextDueDate: nextDue?.dueDate ?? null,
        nextDueAmount: nextDue?.amount ?? 0,
        currentElectric: latest?.electric ?? 0,
        currentWater: latest?.water ?? 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type TenantProfile = {
  tenant: Tenant;
  unit: Unit | null;
  locationName: string | null;
  bills: Bill[];
  cheques: Cheque[];
  improvements: ImprovementRequest[];
  balance: number;
  totalPaid: number;
  nextDue: { date: string; amount: number; period: string } | null;
  currentBill: Bill | null;
  ledger: Array<{ date: string; particulars: string; method: string | null; amount: number; balance: number }>;
};

export function getTenantProfile(id: string): TenantProfile | null {
  const db = getDb();
  const tenant = db.tenants.find((item) => item.id === id);
  if (!tenant) return null;

  const unit = tenant.unitId ? (db.units.find((item) => item.id === tenant.unitId) ?? null) : null;
  const asOf = today();

  const bills = db.bills
    .filter((bill) => bill.tenantId === id && bill.status !== "void")
    .sort((a, b) => (a.period < b.period ? -1 : 1));

  const cheques = db.cheques
    .filter((cheque) => cheque.tenantId === id)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  const improvements = db.improvements
    .filter((item) => item.tenantId === id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const unpaid = bills.filter((bill) => effectiveStatus(bill, asOf) !== "paid");
  const balance = unpaid.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills
    .filter((bill) => effectiveStatus(bill, asOf) === "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const nextDue = unpaid.sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))[0];
  const currentBill = bills.filter((bill) => bill.period === currentPeriod()).at(-1) ?? bills.at(-1) ?? null;

  // Ledger opens with the move-in advance/deposit, then each bill and its payment.
  const ledger: TenantProfile["ledger"] = [];
  let running = 0;
  if (tenant.leaseStart) {
    running += tenant.advanceAmount + tenant.depositAmount;
    ledger.push({
      date: tenant.leaseStart,
      particulars: "Move-in — Advance + Security Deposit",
      method: tenant.paymentMode,
      amount: tenant.advanceAmount + tenant.depositAmount,
      balance: 0,
    });
    running = 0;
  }
  for (const bill of bills) {
    running += bill.amount;
    ledger.push({ date: bill.issuedAt.slice(0, 10), particulars: `Bill ${bill.number}`, method: null, amount: bill.amount, balance: running });
    if (bill.payment) {
      running -= bill.amount;
      ledger.push({
        date: bill.payment.date.slice(0, 10),
        particulars: `Payment — ${bill.number}`,
        method: bill.payment.method,
        amount: -bill.amount,
        balance: running,
      });
    }
  }

  return {
    tenant,
    unit,
    locationName: unit ? locationName(db, unit.locationId) : null,
    bills: bills.slice().reverse(),
    cheques,
    improvements,
    balance,
    totalPaid,
    nextDue: nextDue ? { date: nextDue.dueDate, amount: nextDue.amount, period: nextDue.period } : null,
    currentBill,
    ledger,
  };
}

// ------------------------------------------------------------------- bills

export type BillRow = {
  id: string;
  number: string;
  tenantId: string;
  tenantName: string;
  unitId: string;
  unitCode: string;
  locationId: string;
  locationName: string;
  period: string;
  rent: number;
  electric: number;
  water: number;
  other: number;
  amount: number;
  dueDate: string;
  status: BillStatus;
  method: string | null;
  paidDate: string | null;
};

export function toBillRows(bills: Bill[]): BillRow[] {
  const db = getDb();
  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));
  const asOf = today();

  return bills.map((bill) => ({
    id: bill.id,
    number: bill.number,
    tenantId: bill.tenantId,
    tenantName: tenants.get(bill.tenantId)?.name ?? "—",
    unitId: bill.unitId,
    unitCode: units.get(bill.unitId)?.code ?? "—",
    locationId: bill.locationId,
    locationName: locationName(db, bill.locationId),
    period: bill.period,
    rent: bill.rent,
    electric: bill.electric,
    water: bill.water,
    other: bill.other,
    amount: bill.amount,
    dueDate: bill.dueDate,
    status: effectiveStatus(bill, asOf),
    method: bill.payment?.method ?? null,
    paidDate: bill.payment?.date ?? null,
  }));
}

export function getBillRows(period?: string): BillRow[] {
  const db = getDb();
  const filtered = period ? db.bills.filter((bill) => bill.period === period) : db.bills;
  return toBillRows(filtered).sort((a, b) => (a.number < b.number ? 1 : -1));
}

// ----------------------------------------------------------------- cheques

export type ChequeRow = {
  id: string;
  tenantId: string;
  tenantName: string;
  unitCode: string;
  chequeNo: string;
  bank: string;
  amount: number;
  dueDate: string;
  period: string;
  status: Cheque["status"];
};

export function getChequeRows(filter?: Cheque["status"]): ChequeRow[] {
  const db = getDb();
  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));

  return db.cheques
    .filter((cheque) => (filter ? cheque.status === filter : true))
    .map((cheque) => ({
      id: cheque.id,
      tenantId: cheque.tenantId,
      tenantName: tenants.get(cheque.tenantId)?.name ?? "—",
      unitCode: units.get(cheque.unitId)?.code ?? "—",
      chequeNo: cheque.chequeNo,
      bank: cheque.bank,
      amount: cheque.amount,
      dueDate: cheque.dueDate,
      period: cheque.period,
      status: cheque.status,
    }))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
}

// ------------------------------------------------------------ improvements

export type ImprovementRow = ImprovementRequest & {
  tenantName: string;
  unitCode: string;
  locationName: string;
};

export function getImprovementRows(): ImprovementRow[] {
  const db = getDb();
  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant]));
  const units = new Map(db.units.map((unit) => [unit.id, unit]));

  return db.improvements
    .map((item) => {
      const unit = units.get(item.unitId);
      return {
        ...item,
        tenantName: tenants.get(item.tenantId)?.name ?? "—",
        unitCode: unit?.code ?? "—",
        locationName: unit ? locationName(db, unit.locationId) : "—",
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// ---------------------------------------------------------- announcements

export type AnnouncementRow = Announcement & { audienceLabel: string };

export function getAnnouncementRows(): AnnouncementRow[] {
  const db = getDb();
  return db.announcements
    .map((announcement) => ({
      ...announcement,
      audienceLabel:
        announcement.audience.scope === "all"
          ? "All tenants"
          : (db.locations.find((location) => location.id === announcement.audience.locationId)?.name ?? "Location"),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// -------------------------------------------------------------- audit log

export function getAuditLogs(limit = 300): AuditLog[] {
  return getDb()
    .auditLogs.slice()
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}

export type AuditStats = { total30d: number; successful: number; failed: number; actors: number };

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

// -------------------------------------------------------------- dashboard

export type PeriodSummary = {
  period: string;
  billed: number;
  collected: number;
  outstanding: number;
  overdue: number;
};

export function summarisePeriod(period: string): PeriodSummary {
  const db = getDb();
  const asOf = today();
  const bills = db.bills.filter((bill) => bill.period === period && bill.status !== "void");

  let billed = 0;
  let collected = 0;
  let overdue = 0;
  for (const bill of bills) {
    billed += bill.amount;
    const status = effectiveStatus(bill, asOf);
    if (status === "paid") collected += bill.amount;
    else if (status === "overdue") overdue += bill.amount;
  }
  return { period, billed, collected, outstanding: billed - collected, overdue };
}

export function getPeriodSeries(count = 6): PeriodSummary[] {
  return getPeriods(count).slice(-count).map(summarisePeriod);
}

export type DashboardMetrics = {
  currentPeriod: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  maintenanceUnits: number;
  occupancyRate: number;
  totalTenants: number;
  overdueTenants: number;
  billed: number;
  collected: number;
  outstanding: number;
  overdueCount: number;
  collectionRate: number;
  bouncedCheques: number;
  pendingImprovements: number;
  upcomingDues: Array<{ id: string; tenantName: string; unitCode: string; dueDate: string; amount: number }>;
  series: PeriodSummary[];
  byLocation: Array<{ name: string; units: number; occupied: number; billed: number; collected: number }>;
};

export function getDashboardMetrics(): DashboardMetrics {
  const db = getDb();
  const asOf = today();
  const period = currentPeriod();
  const summary = summarisePeriod(period);

  const occupied = db.units.filter((unit) => unit.status === "occupied").length;
  const overdueBills = db.bills.filter((bill) => effectiveStatus(bill, asOf) === "overdue");

  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant.name]));
  const units = new Map(db.units.map((unit) => [unit.id, unit.code]));

  const upcomingDues = db.bills
    .filter((bill) => effectiveStatus(bill, asOf) !== "paid")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    .slice(0, 6)
    .map((bill) => ({
      id: bill.id,
      tenantName: tenants.get(bill.tenantId) ?? "—",
      unitCode: units.get(bill.unitId) ?? "—",
      dueDate: bill.dueDate,
      amount: bill.amount,
    }));

  const byLocation = db.locations.map((location) => {
    const locUnits = db.units.filter((unit) => unit.locationId === location.id);
    const locBills = db.bills.filter((bill) => bill.locationId === location.id && bill.period === period && bill.status !== "void");
    return {
      name: location.name,
      units: locUnits.length,
      occupied: locUnits.filter((unit) => unit.status === "occupied").length,
      billed: locBills.reduce((sum, bill) => sum + bill.amount, 0),
      collected: locBills.filter((bill) => effectiveStatus(bill, asOf) === "paid").reduce((sum, bill) => sum + bill.amount, 0),
    };
  });

  return {
    currentPeriod: period,
    totalUnits: db.units.length,
    occupiedUnits: occupied,
    vacantUnits: db.units.filter((unit) => unit.status === "vacant").length,
    maintenanceUnits: db.units.filter((unit) => unit.status === "maintenance").length,
    occupancyRate: db.units.length === 0 ? 0 : (occupied / db.units.length) * 100,
    totalTenants: db.tenants.filter((tenant) => tenant.unitId).length,
    overdueTenants: db.tenants.filter((tenant) => tenant.status === "overdue").length,
    billed: summary.billed,
    collected: summary.collected,
    outstanding: summary.outstanding,
    overdueCount: overdueBills.length,
    collectionRate: summary.billed === 0 ? 0 : (summary.collected / summary.billed) * 100,
    bouncedCheques: db.cheques.filter((cheque) => cheque.status === "bounced").length,
    pendingImprovements: db.improvements.filter((item) => item.status === "pending").length,
    upcomingDues,
    series: getPeriodSeries(6),
    byLocation,
  };
}

// --------------------------------------------------------------- calendar

export type CalendarEvent = {
  date: string;
  kind: "bill" | "cheque" | "lease-start" | "lease-end" | "improvement";
  label: string;
  detail: string;
};

/** All dated events within the given `YYYY-MM` month, for the calendar view. */
export function getCalendarEvents(month: string): CalendarEvent[] {
  const db = getDb();
  const tenants = new Map(db.tenants.map((tenant) => [tenant.id, tenant.name]));
  const units = new Map(db.units.map((unit) => [unit.id, unit.code]));
  const events: CalendarEvent[] = [];
  const inMonth = (iso: string | null) => Boolean(iso && iso.slice(0, 7) === month);

  for (const bill of db.bills) {
    if (bill.status === "void" || !inMonth(bill.dueDate)) continue;
    events.push({
      date: bill.dueDate,
      kind: "bill",
      label: `Rent due — ${units.get(bill.unitId) ?? ""}`,
      detail: `${tenants.get(bill.tenantId) ?? ""} · ${bill.number}`,
    });
  }

  for (const cheque of db.cheques) {
    if (!inMonth(cheque.dueDate)) continue;
    events.push({
      date: cheque.dueDate,
      kind: "cheque",
      label: `PDC to deposit — ${cheque.bank}`,
      detail: `${tenants.get(cheque.tenantId) ?? ""} · Cheque ${cheque.chequeNo} (${cheque.status})`,
    });
  }

  for (const tenant of db.tenants) {
    if (inMonth(tenant.leaseStart)) {
      events.push({ date: tenant.leaseStart!, kind: "lease-start", label: `Lease start — ${tenant.name}`, detail: units.get(tenant.unitId ?? "") ?? "" });
    }
    if (inMonth(tenant.leaseEnd)) {
      events.push({ date: tenant.leaseEnd!, kind: "lease-end", label: `Lease end — ${tenant.name}`, detail: units.get(tenant.unitId ?? "") ?? "" });
    }
  }

  for (const improvement of db.improvements) {
    if (!inMonth(improvement.createdAt.slice(0, 10))) continue;
    events.push({
      date: improvement.createdAt.slice(0, 10),
      kind: "improvement",
      label: `Improvement — ${improvement.title}`,
      detail: `${tenants.get(improvement.tenantId) ?? ""} · ${improvement.status}`,
    });
  }

  return events.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export type { Bill, Cheque, ImprovementRequest, Tenant, Unit };
