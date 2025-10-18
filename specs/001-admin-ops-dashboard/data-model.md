# Data Model: Tenantra Admin Ops Dashboard

## Building
- **Primary Key**: `id` (UUID)
- **Attributes**: `name`, `code`, `address`, `floors`, `description`, `status` (`active`, `inactive`, `archived`), `createdAt`, `updatedAt`.
- **Relationships**: One-to-many with `Floor`; one-to-many with `Unit` (through `Floor`).
- **Validation Rules**: `name` unique per organization; `floors` ≥ 1; `status` defaults to `active`.

## Floor
- **Primary Key**: `id` (UUID)
- **Attributes**: `label`, `index`, `buildingId`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Building`; one-to-many with `Unit`.
- **Validation Rules**: `index` non-negative integer; unique (`buildingId`, `index`) pair.

## Unit
- **Primary Key**: `id` (UUID)
- **Attributes**: `unitNumber`, `type` (`residential`, `commercial`), `floorArea`, `bedrooms`, `bathrooms`, `status` (`vacant`, `occupied`, `reserved`, `inactive`), `buildingId`, `floorId`, `notes`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Building` and `Floor`; one-to-many with `UnitResident`; one-to-many with `Invoice`; one-to-many with `FacilityBooking` (usage tracking); attaches to `Document` records.
- **Validation Rules**: `unitNumber` unique within building; `floorArea` > 0; `status` transitions require audit log entry.

## Resident
- **Primary Key**: `id` (UUID)
- **Attributes**: `firstName`, `lastName`, `contactEmail`, `contactPhone`, `residentType` (`owner`, `tenant`, `staff`), `status` (`active`, `inactive`, `pending`), `moveInDate`, `moveOutDate`, `notes`, `createdAt`, `updatedAt`.
- **Relationships**: Many-to-many with `Unit` via `UnitResident`; linked to `Payment` (payer reference); associated documents.
- **Validation Rules**: `contactEmail` unique; `moveOutDate` ≥ `moveInDate`.

## UnitResident
- **Primary Key**: composite (`unitId`, `residentId`, `startDate`).
- **Attributes**: `role` (`primary`, `secondary`, `family`, `staff`), `startDate`, `endDate`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Unit` and `Resident`.
- **Validation Rules**: Overlapping assignments for same resident-unit combination prohibited; `endDate` optional but when present must be ≥ `startDate`.

## Admin
- **Primary Key**: `id` (UUID)
- **Attributes**: `email`, `hashedPassword`, `role` (`super`, `billing`, `communications`, `facilities`), `lastLoginAt`, `status`, `createdAt`, `updatedAt`.
- **Relationships**: Linked to `AuditLogEntry` as actor; may reference `Announcement` author.
- **Validation Rules**: `email` unique; password complexity enforced via NextAuth adapter hooks.

## Invoice
- **Primary Key**: `id` (UUID)
- **Attributes**: `unitId`, `billingPeriodStart`, `billingPeriodEnd`, `dueDate`, `amountDue`, `currency`, `status` (`pending`, `partial`, `paid`, `overdue`, `writtenOff`), `lineItems` (JSON), `notes`, `issuedAt`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Unit`; one-to-many with `Payment`; related to `Document` (invoice PDF); logs actions via `AuditLogEntry`.
- **Validation Rules**: `billingPeriodStart` < `billingPeriodEnd`; `amountDue` ≥ 0; transitions to `paid` require payment coverage.

## Payment
- **Primary Key**: `id` (UUID)
- **Attributes**: `invoiceId`, `source` (`manual`, `stripe`, `paymongo`), `amount`, `currency`, `paidAt`, `referenceCode`, `status` (`received`, `pending`, `failed`, `refunded`), `notes`, `rawPayload` (JSON), `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Invoice`; optionally references `Resident` payer; triggers `AuditLogEntry`.
- **Validation Rules**: `amount` > 0; `currency` matches invoice; when `status` = `refunded`, associated credit memo recorded.

## Announcement
- **Primary Key**: `id` (UUID)
- **Attributes**: `title`, `slug`, `body`, `audience` (`all`, `building`, `unit`, `customList`), `audienceFilters` (JSON), `priority` (`normal`, `critical`), `pinned`, `publishAt`, `expireAt`, `createdByAdminId`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Admin`; one-to-many with `AnnouncementDelivery`.
- **Validation Rules**: `title` ≤ 150 chars; pinned announcements require `priority` ≥ `normal`; `expireAt` optional but ≥ `publishAt`.

## AnnouncementDelivery
- **Primary Key**: `id` (UUID)
- **Attributes**: `announcementId`, `recipientEmail`, `deliveryStatus` (`queued`, `sent`, `failed`), `errorMessage`, `sentAt`, `retryCount`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Announcement`.
- **Validation Rules**: Unique (`announcementId`, `recipientEmail`); retry count capped at 5.

## Facility
- **Primary Key**: `id` (UUID)
- **Attributes**: `name`, `description`, `type` (`pool`, `gym`, `parking`, `functionRoom`, `other`), `capacity`, `availabilityRules` (JSON), `bookingWindowDays`, `requiresApproval`, `status`, `createdAt`, `updatedAt`.
- **Relationships**: One-to-many with `FacilityBooking`.
- **Validation Rules**: `capacity` ≥ 1; availability windows validated against cron-style rules.

## FacilityBooking
- **Primary Key**: `id` (UUID)
- **Attributes**: `facilityId`, `unitId`, `requestedByAdminId`, `startTime`, `endTime`, `status` (`pending`, `approved`, `declined`, `cancelled`, `completed`), `notes`, `createdAt`, `updatedAt`.
- **Relationships**: Belongs to `Facility`; references `Unit`; actor stored in `Admin`.
- **Validation Rules**: `startTime` < `endTime`; conflict detection ensures no overlapping approved bookings; cancellations require reason.

## Document
- **Primary Key**: `id` (UUID)
- **Attributes**: `filename`, `storagePath`, `mimeType`, `sizeBytes`, `category` (`invoice`, `paymentReceipt`, `contract`, `maintenance`, `misc`), `linkedEntityType`, `linkedEntityId`, `uploadedByAdminId`, `createdAt`.
- **Relationships**: Belongs to `Admin`; polymorphic link to `Unit`, `Resident`, `Invoice`, `Facility`, or `Announcement`.
- **Validation Rules**: Max file size 25MB; allowed MIME types limited to PDF, image formats; `linkedEntityId` required.

## AuditLogEntry
- **Primary Key**: `id` (UUID)
- **Attributes**: `actorType` (`admin`), `actorId`, `entityType`, `entityId`, `action` (`create`, `update`, `delete`, `publish`, `generate`, `assign`, `login`), `changes` (JSON diff), `metadata`, `ipAddress`, `userAgent`, `createdAt`.
- **Relationships**: Belongs to `Admin`; references target entities via `entityType`/`entityId`.
- **Validation Rules**: `changes` required for update/delete actions; `ipAddress` stored for all interactive events.
