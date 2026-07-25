export type UnitStatus = "occupied" | "vacant" | "reserved" | "maintenance";
export type UnitType = "Studio" | "1BR" | "2BR" | "3BR";
export type ResidentStatus = "active" | "pending" | "expiring" | "blacklisted" | "moved-out";
export type InvoiceStatus = "paid" | "pending" | "overdue" | "void";
export type AnnouncementStatus = "draft" | "sent";
export type FacilityStatus = "active" | "maintenance";
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled" | "completed";
export type AuditAction = "create" | "update" | "delete" | "login";
export type PaymentMethod = "cash" | "bank-transfer" | "gcash" | "card" | "check";

export type Property = {
  id: string;
  name: string;
  code: string;
};

export type Unit = {
  id: string;
  code: string;
  propertyId: string;
  type: UnitType;
  floor: number;
  rent: number;
  dues: number;
  status: UnitStatus;
  residentId: string | null;
};

export type Resident = {
  id: string;
  name: string;
  email: string;
  phone: string;
  unitId: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  status: ResidentStatus;
  createdAt: string;
};

export type InvoiceLine = {
  label: string;
  amount: number;
};

export type Payment = {
  amount: number;
  method: PaymentMethod;
  reference: string;
  at: string;
};

export type Invoice = {
  id: string;
  number: string;
  residentId: string | null;
  unitId: string;
  propertyId: string;
  /** Billing period as `YYYY-MM`. */
  period: string;
  lines: InvoiceLine[];
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  issuedAt: string;
  payment: Payment | null;
  remindersSent: number;
  lastReminderAt: string | null;
  note: string | null;
};

export type AnnouncementAudience = {
  scope: "all" | "property" | "units";
  propertyId: string | null;
  unitCodes: string[];
};

export type AnnouncementChannels = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  channels: AnnouncementChannels;
  status: AnnouncementStatus;
  createdBy: string;
  createdAt: string;
  sentAt: string | null;
  recipients: number;
  reads: number;
};

export type Facility = {
  id: string;
  name: string;
  propertyId: string;
  capacity: number;
  rateType: "hourly" | "monthly" | "free";
  rate: number;
  status: FacilityStatus;
  openHour: number;
  closeHour: number;
  requiresApproval: boolean;
};

export type Booking = {
  id: string;
  facilityId: string;
  residentId: string;
  /** `YYYY-MM-DD` */
  date: string;
  startHour: number;
  endHour: number;
  status: BookingStatus;
  fee: number;
  note: string | null;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};

export type AuditLog = {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  module: string;
  description: string;
  ip: string;
  success: boolean;
};

export type Settings = {
  orgName: string;
  adminName: string;
  adminEmail: string;
  currency: string;
  /** Day of month invoices fall due. */
  billingDueDay: number;
  gracePeriodDays: number;
  lateFeePercent: number;
  channels: AnnouncementChannels;
};

/** Uniform result shape for every server action, consumed via `useActionState`. */
export type ActionResult = {
  ok: boolean;
  message: string;
  /** Bumped on each submission so effects can react to repeated identical results. */
  at?: number;
};

export type Database = {
  version: number;
  seededAt: string;
  properties: Property[];
  units: Unit[];
  residents: Resident[];
  invoices: Invoice[];
  announcements: Announcement[];
  facilities: Facility[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  settings: Settings;
};
