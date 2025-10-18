# Feature Specification: Tenantra Admin Ops Dashboard

**Feature Branch**: `001-admin-ops-dashboard`  
**Created**: 2025-10-18  
**Status**: Draft  
**Input**: User description: "Tech Stack: Frontend: Next.js 15 (App Router) + TypeScript + TailwindCSS + ShadCN UI. Backend: Next.js API routes (or NestJS later if scalability needed). Database: PostgreSQL + Prisma ORM. Auth: NextAuth.js (Role-based, Admin only for now). Storage: Supabase or AWS S3 (for receipts, documents). Email: Resend (for announcements and payment notifications). Hosting: Vercel (frontend/backend). CI/CD: GitHub Actions. Core Modules (Admin Dashboard): Authentication & Role Management. Admin login only (Resident roles reserved for future mobile app). Unit Management. CRUD for buildings, units, and floors. Assign residents and view unit details. Resident Directory. Manage residents’ profiles and unit assignments. Track active/inactive residents. Billing & Payments. Generate monthly dues per unit. Record payments (manual or via Stripe/PayMongo). Export billing reports. Announcements & Notices. Create announcements and send via email. Pin important notices to dashboard. Facility Management. Track available amenities (pool, gym, parking slots). Manage booking availability and logs. Dashboard & Analytics. Display KPIs (Total Units, Occupancy, Total Collected, Outstanding Balance). Graphs and trends using Recharts. Audit Logs. Track key admin actions (create, edit, delete)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close the monthly dues cycle (Priority: P1)

Administrators schedule monthly dues generation, review calculated charges per unit, send invoices, and reconcile
incoming payments so outstanding balances remain accurate.

**Why this priority**: Cash flow accuracy is critical for property operations and the foundation for analytics and
reporting.

**Independent Test**: Execute a full billing cycle in staging, generate invoices for sample units, record payments,
and verify balances and exported reports without relying on other stories.

**Acceptance Scenarios**:

1. **Given** an authenticated admin and configured billing cycle, **When** the admin generates invoices for the
   current month, **Then** invoices are created for all active units with correct line items and statuses set to
   "Pending".
2. **Given** a pending invoice, **When** a payment is recorded manually or through an import, **Then** the invoice
   status updates to "Paid", the unit balance reflects the payment, and the transaction appears in billing reports.

---

### User Story 2 - Maintain units and resident relationships (Priority: P2)

Administrators manage buildings, floors, and units, assign or remove resident profiles, and view residency history to
support day-to-day condo administration.

**Why this priority**: Accurate unit-resident data underpins billing, communications, analytics, and future mobile
app integration.

**Independent Test**: Create and update sample buildings, units, and residents, then validate that assignments and
status changes display correctly without invoking billing or announcement features.

**Acceptance Scenarios**:

1. **Given** an authenticated admin, **When** they create a new unit and assign an existing resident, **Then** the
   unit record reflects the resident assignment, and the resident profile shows the associated unit and active
   status.
2. **Given** a resident marked inactive, **When** the admin reassigns them to a new unit, **Then** the prior unit’s
   occupancy ends on the selected date and the new assignment appears with an updated start date.

---

### User Story 3 - Broadcast announcements and notices (Priority: P3)

Administrators draft announcements, publish them to the dashboard, and send email notifications with delivery status
tracking for compliance and transparency.

**Why this priority**: Timely communication mitigates operational risk and keeps residents informed during incidents
or planned maintenance.

**Independent Test**: Create an announcement, pin it on the dashboard, trigger an email batch to sample recipients,
and verify delivery status updates without invoking billing or facility modules.

**Acceptance Scenarios**:

1. **Given** an announcement draft, **When** the admin publishes and pins it, **Then** the announcement appears at
   the top of the dashboard with metadata (created by, priority, expiry) and a pin indicator.
2. **Given** a published announcement, **When** the email dispatch completes, **Then** the system records success or
   failure per recipient and displays aggregated delivery status within the communication log.

---

### User Story 4 - Manage amenities and analytics (Priority: P4)

Administrators define facilities, accept bookings with conflict prevention, and monitor KPIs and trends on the
dashboard to guide operational decisions.

**Why this priority**: Facility utilization and real-time KPIs drive satisfaction and strategic planning once billing
and directory foundations exist.

**Independent Test**: Configure facilities, submit bookings that include overlapping time requests, and verify that
conflicts are blocked while KPI widgets update with facility and financial metrics.

**Acceptance Scenarios**:

1. **Given** a facility with defined availability, **When** an admin or delegated staff schedules a booking, **Then**
   the booking is stored, conflicts are prevented, and the facility availability view reflects the new reservation.
2. **Given** recent billing and booking data, **When** the admin opens the dashboard, **Then** KPI tiles (total units,
   occupancy, total collected, outstanding balance) and trend charts display up-to-date values sourced from the data
   warehouse snapshot.

---

### Edge Cases

- Attempting to generate invoices when a unit lacks an assigned resident or active contract.
- Receipt of a payment record that does not match an existing invoice or exceeds the outstanding balance.
- Email provider failure during announcement delivery requiring retry and admin visibility into partial sends.
- Simultaneous booking requests for the same facility time slot from different admins.
- Admin session expiration mid-action, ensuring unsaved edits are handled gracefully and logged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require authenticated admin sessions with role-based access controls before exposing any
  dashboard capability.
- **FR-002**: System MUST allow admins to create, update, archive, and list buildings, floors, and units with
  capacity metadata.
- **FR-003**: System MUST allow admins to create and update resident profiles, assign residents to units, and mark
  residents as active, inactive, or pending move-in.
- **FR-004**: System MUST generate monthly invoices for all active units with configurable line items (base dues,
  adjustments, arrears) and store billing histories.
- **FR-005**: System MUST send billing and announcement emails via the configured provider, capture delivery
  responses, and expose aggregated success/failure metrics per campaign.
- **FR-006**: System MUST record manual payments and import gateway notifications, reconcile invoice balances, and
  support partial and over-payment handling with audit trails.
- **FR-007**: System MUST export billing summaries and payment ledgers in a downloadable format for accounting
  review.
- **FR-008**: System MUST allow admins to draft, schedule, publish, pin, and archive announcements with audience
  targeting (all residents vs. specific buildings or units).
- **FR-009**: System MUST manage facility definitions, availability calendars, and booking workflows with conflict
  detection and cancellation handling.
- **FR-010**: System MUST display real-time KPIs and trend charts sourced from operational data, with refresh windows
  documented for administrators.
- **FR-011**: System MUST maintain an immutable audit log covering create, update, delete, publish, and financial
  actions with timestamp, actor, entity, and before/after snapshots when applicable.
- **FR-012**: System MUST store supporting documents (receipts, lease files) in managed object storage and link them
  to the relevant unit, resident, invoice, or booking records.

### Key Entities *(include if feature involves data)*

- **Building**: Represents a property structure; attributes include name, address, number of floors, and operational
  status.
- **Unit**: Individual rentable space linked to a building and floor; attributes include number, floor, square
  footage, occupancy status, and associated residents.
- **Resident**: Person occupying a unit; attributes include contact details, residency status, and historical
  assignments.
- **Invoice**: Billing record for a unit and period; attributes include amount breakdown, due date, status, and
  linked payments.
- **Payment**: Financial transaction linked to an invoice; attributes include method, reference ID, amount, applied
  date, and reconciliation status.
- **Announcement**: Communication artifact; attributes include title, body, audience scope, publish window, pin
  state, and delivery results.
- **Facility**: Amenity resource (e.g., pool, gym, parking); attributes include capacity, schedule, booking rules,
  and blackout periods.
- **FacilityBooking**: Reservation request with facility, requester, start/end time, status, and conflict metadata.
- **AuditLogEntry**: Immutable record of admin actions; attributes include actor, action type, entity reference,
  timestamp, and contextual notes.

### Assumptions

- Admin-only access remains in scope for this release; resident-facing experiences will be delivered via a future
  mobile app.
- External payment gateways provide webhook notifications within 5 minutes of settlement for reconciliation.
- Object storage and email providers are provisioned and accessible within the Vercel deployment environment.
- Historical data migrated into the system will conform to the defined entity schemas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of active units receive invoices within 5 minutes of initiating the monthly billing run, with zero
  calculation discrepancies in reconciliation reports.
- **SC-002**: 95% of payments are recorded and reconciled within 1 business day of receipt, and outstanding balances
  are accurate to within 0.5% of actual collections.
- **SC-003**: Announcement email deliveries achieve at least 99% successful sends per campaign, and dashboard-pinned
  notices refresh within 60 seconds of publication.
- **SC-004**: Admin dashboard KPI view (totals, occupancy, collections, outstanding balance) loads in under 2 seconds
  p95 for datasets up to 5,000 units.
- **SC-005**: Audit log captures 100% of admin create, update, delete, publish, booking, and financial actions with
  retrievable context within 10 seconds of the event.
