export type UnitCategory = "commercial" | "residential";
/** short-term = month-to-month (accommodation); long-term = annual lease. Both bill monthly. */
export type Tenancy = "short-term" | "long-term";
export type UnitStatus = "occupied" | "vacant" | "maintenance";

export type PaymentMethod = "cash" | "gcash" | "pdc" | "bank-transfer";
export type ChequeStatus = "pending" | "deposited" | "bounced";
export type BillStatus = "paid" | "pending" | "overdue" | "void";
export type TenantStatus = "current" | "overdue" | "ended";
export type ContractType = "residential" | "accommodation";
export type ImprovementStatus = "pending" | "approved" | "rejected" | "completed";
export type AnnouncementStatus = "draft" | "sent";
export type AuditAction = "create" | "update" | "delete" | "login";

export type Location = {
  id: string;
  name: string;
  code: string;
};

export type Unit = {
  id: string;
  code: string;
  locationId: string;
  category: UnitCategory;
  tenancy: Tenancy;
  /** Lessor / property owner shown on the tenant profile and contract. */
  owner: string;
  /** Monthly rent regardless of tenancy (long-term is billed monthly across the year). */
  rent: number;
  electricMeterNo: string;
  waterMeterNo: string;
  depositMonths: number;
  advanceMonths: number;
  furnished: boolean;
  /** Default fixtures/appliances included with the unit. */
  inventory: string[];
  status: UnitStatus;
  tenantId: string | null;
};

export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  homeAddress: string;
  unitId: string | null;
  /** Snapshot of the unit owner at move-in. */
  lessor: string;
  contractType: ContractType;
  leaseStart: string | null;
  leaseEnd: string | null;
  termMonths: number;
  monthlyRent: number;
  /** Day of the month rent falls due. */
  dueDay: number;
  depositAmount: number;
  advanceAmount: number;
  paymentMode: PaymentMethod;
  inventory: string[];
  status: TenantStatus;
  createdAt: string;
};

export type BillLineKind = "rent" | "electric" | "water" | "other";

export type Bill = {
  id: string;
  number: string;
  tenantId: string;
  unitId: string;
  locationId: string;
  /** Billing month as `YYYY-MM`. */
  period: string;
  rent: number;
  electric: number;
  water: number;
  other: number;
  otherLabel: string | null;
  amount: number;
  dueDate: string;
  issuedAt: string;
  status: BillStatus;
  payment: BillPayment | null;
  note: string | null;
};

export type BillPayment = {
  method: PaymentMethod;
  reference: string;
  date: string;
  /** Present when settled by a post-dated cheque. */
  chequeId: string | null;
};

export type Cheque = {
  id: string;
  tenantId: string;
  unitId: string;
  chequeNo: string;
  bank: string;
  amount: number;
  /** Date the cheque is scheduled to be deposited. */
  dueDate: string;
  period: string;
  status: ChequeStatus;
  billId: string | null;
};

export type ImprovementRequest = {
  id: string;
  tenantId: string;
  unitId: string;
  title: string;
  description: string;
  estimatedCost: number;
  status: ImprovementStatus;
  createdAt: string;
  decidedAt: string | null;
  ownerResponse: string | null;
};

export type AnnouncementAudience = {
  scope: "all" | "location";
  locationId: string | null;
};

export type AnnouncementChannels = {
  email: boolean;
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

export type AuditLog = {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  module: string;
  description: string;
  success: boolean;
};

export type Settings = {
  orgName: string;
  adminName: string;
  adminEmail: string;
  currency: string;
  billingDueDay: number;
  lateFeePercent: number;
  channels: AnnouncementChannels;
};

/** Uniform result shape for every server action, consumed via `useActionState`. */
export type ActionResult = {
  ok: boolean;
  message: string;
  /** Bumped on each submission so effects can react to repeated identical results. */
  at?: number;
  /** Optional payload, e.g. a new record id the client can navigate to. */
  id?: string;
};

export type Database = {
  version: number;
  seededAt: string;
  locations: Location[];
  units: Unit[];
  tenants: Tenant[];
  bills: Bill[];
  cheques: Cheque[];
  improvements: ImprovementRequest[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  settings: Settings;
};
