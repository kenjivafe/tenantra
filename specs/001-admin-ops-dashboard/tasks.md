# Tasks: Tenantra Admin Ops Dashboard

**Input**: Design documents from `/specs/001-admin-ops-dashboard/`
**Prerequisites**: plan.md (required), spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include validation tasks per story where necessary; end-to-end and regression coverage called out explicitly.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Align monorepo configuration with Turborepo and pnpm workspace definitions in `turbo.json` and `pnpm-workspace.yaml`
- [ ] T002 Initialize root environment templates and secrets placeholders in `.env.example` and `apps/web/.env.example`
- [ ] T003 Install base dependencies and shared tooling configs in `package.json` and `configs/`

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Configure Prisma schema scaffolding in `packages/db/schema.prisma` with core entities
- [ ] T005 [P] Generate initial Prisma migration and seed scripts in `packages/db/migrations/` and `packages/db/seed.ts`
- [ ] T006 Establish NextAuth.js admin credential provider in `packages/api/auth.ts`
- [ ] T007 Configure Supabase storage utilities for signed URLs in `packages/api/storage.ts`
- [ ] T008 Set up shared logging and audit trail middleware in `packages/api/middleware/audit.ts`
- [ ] T009 Implement base UI shell (layout, sidebar, navigation) in `apps/web/app/(admin)/layout.tsx`
- [ ] T010 Prepare Resend client configuration and environment bindings in `packages/api/notifications/resend.ts`
- [ ] T011 Configure GitHub Actions workflow skeleton for lint/test/build in `.github/workflows/ci.yml`

## Phase 3: User Story 1 - Close the monthly dues cycle (Priority: P1) 🎯 MVP

**Goal**: Automate monthly billing, invoice generation, and payment reconciliation for all active units.

**Independent Test**: Run staging billing cycle (invoice generation → payment recording → export) and confirm balances align with reconciliation report.

### Implementation for User Story 1

- [ ] T012 [US1] Finalize billing domain models and relations in `packages/db/schema.prisma`
- [ ] T013 [US1] Implement invoice repository and billing calculator in `packages/api/billing/invoiceService.ts`
- [ ] T014 [P] [US1] Build invoice generation API route in `apps/web/app/api/billing/generate/route.ts`
- [ ] T015 [P] [US1] Create payment recording API route in `apps/web/app/api/billing/payments/route.ts`
- [ ] T016 [US1] Add billing cycle management pages in `apps/web/app/(admin)/billing/page.tsx`
- [ ] T017 [US1] Implement reconciliation report export in `packages/api/billing/exporter.ts`
- [ ] T018 [US1] Wire audit logging for billing actions in `packages/api/billing/auditHooks.ts`
- [ ] T019 [US1] Configure background job/cron trigger for monthly invoice runs in `packages/api/jobs/billingCron.ts`
- [ ] T020 [US1] Validate billing workflows with integration tests in `apps/web/tests/integration/billing.spec.ts`

## Phase 4: User Story 2 - Maintain units and resident relationships (Priority: P2)

**Goal**: Provide CRUD for buildings, floors, units, and manage resident assignments.

**Independent Test**: Create/update units and assign residents; verify data consistency and historical tracking.

### Implementation for User Story 2

- [ ] T021 [US2] Expand Prisma models for buildings, floors, units, residents, and unit-resident in `packages/db/schema.prisma`
- [ ] T022 [US2] Implement unit and resident repositories in `packages/api/properties/propertyService.ts`
- [ ] T023 [P] [US2] Build admin UI for unit directory in `apps/web/app/(admin)/units/page.tsx`
- [ ] T024 [P] [US2] Build admin UI for resident directory in `apps/web/app/(admin)/residents/page.tsx`
- [ ] T025 [US2] Add unit-resident assignment APIs in `apps/web/app/api/properties/assignments/route.ts`
- [ ] T026 [US2] Implement status transitions and history tracking in `packages/api/properties/historyService.ts`
- [ ] T027 [US2] Extend audit logging coverage for unit/resident events in `packages/api/properties/auditHooks.ts`
- [ ] T028 [US2] Write unit/resident integration tests in `apps/web/tests/integration/properties.spec.ts`

## Phase 5: User Story 3 - Broadcast announcements and notices (Priority: P3)

**Goal**: Enable admins to create announcements, pin notices, and track email delivery.

**Independent Test**: Publish announcement, pin to dashboard, send email batch, and confirm delivery statuses recorded.

### Implementation for User Story 3

- [ ] T029 [US3] Define announcement and delivery models in `packages/db/schema.prisma`
- [ ] T030 [US3] Implement announcements service with pinning logic in `packages/api/communications/announcementService.ts`
- [ ] T031 [P] [US3] Build announcement creation UI in `apps/web/app/(admin)/announcements/page.tsx`
- [ ] T032 [US3] Implement email dispatch workflow with retries in `packages/api/communications/deliveryWorker.ts`
- [ ] T033 [US3] Add delivery status dashboard component in `apps/web/app/(admin)/announcements/components/status.tsx`
- [ ] T034 [US3] Capture delivery metrics and logging in `packages/api/communications/auditHooks.ts`
- [ ] T035 [US3] Create announcement integration tests in `apps/web/tests/integration/announcements.spec.ts`

## Phase 6: User Story 4 - Manage amenities and analytics (Priority: P4)

**Goal**: Manage facilities, bookings, and display KPI dashboard with trend analytics.

**Independent Test**: Configure facility, perform bookings with conflict prevention, and verify KPI dashboards reflect updated metrics.

### Implementation for User Story 4

- [ ] T036 [US4] Add facility and booking models with availability rules in `packages/db/schema.prisma`
- [ ] T037 [US4] Implement facility booking services with conflict checks in `packages/api/facilities/bookingService.ts`
- [ ] T038 [P] [US4] Build facility management UI in `apps/web/app/(admin)/facilities/page.tsx`
- [ ] T039 [US4] Implement dashboard KPI data loader and caching in `packages/api/analytics/kpiService.ts`
- [ ] T040 [P] [US4] Create dashboard KPI UI with Recharts in `apps/web/app/(admin)/dashboard/page.tsx`
- [ ] T041 [US4] Log facility and analytics events in `packages/api/facilities/auditHooks.ts`
- [ ] T042 [US4] Build analytics integration tests in `apps/web/tests/integration/analytics.spec.ts`

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T043 Harden RBAC enforcement middleware and permission guards in `packages/api/middleware/authz.ts`
- [ ] T044 [P] Implement observability instrumentation (structured logs, metrics exporters) across `packages/api`
- [ ] T045 Document operational runbooks and billing reconciliation SOP in `docs/operations/billing.md`
- [ ] T046 [P] Conduct accessibility review for admin UI layouts in `apps/web`
- [ ] T047 Prepare deployment and rollback checklist in `docs/operations/deployment.md`
- [ ] T048 Finalize GitHub Actions release workflow with Vercel deployment steps in `.github/workflows/release.yml`

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) → Foundation for tooling and environments.
- Foundational (Phase 2) → MUST complete before user story work.
- User Stories (Phase 3-6) → Execute in priority order; each story independently verifiable.
- Polish Phase → After selected user stories complete.

### User Story Dependencies

- US1 (P1) → No dependency beyond foundational components.
- US2 (P2) → Depends on foundational data models (Phase 2) but runs parallel after US1 as needed.
- US3 (P3) → Depends on notification foundations and audit middleware; can run after foundational tasks and in parallel with US2 once notification utilities exist.
- US4 (P4) → Depends on foundational analytics scaffolding and may start after US2 repository structures are stable.

### Parallel Opportunities

- [P] tasks flagged in each phase can run concurrently once prerequisites met.
- UI work per story (pages/components) can proceed parallel to API tasks if contracts agreed.
- Testing tasks marked [P] can run once respective implementations are ready.

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup and Foundational phases.
2. Deliver US1 billing workflows end-to-end (T012–T020).
3. Validate with staging billing cycle and reconciliation export.

### Incremental Delivery
1. US1 billing → deploy to admins for financial operations.
2. US2 units/residents → unlock communication targeting and directory accuracy.
3. US3 announcements → enable communications reliability.
4. US4 facilities & analytics → complete dashboard vision.

### Parallel Team Strategy
- Team A: Billing and payments (US1 + Foundational logging).
- Team B: Property management (US2) and facility bookings (US4).
- Team C: Communications (US3) and shared observability/polish tasks.

