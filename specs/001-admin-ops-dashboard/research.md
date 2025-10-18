# Research: Tenantra Admin Ops Dashboard

## Billing & Payments Automation
- **Decision**: Implement billing cycle generation and reconciliation inside `packages/api` using Prisma models and background Turborepo tasks.
- **Rationale**: Keeps domain logic centralized, enables reuse by future mobile app, and aligns with Operational Single Source of Truth.
- **Alternatives Considered**:
  - Dedicated billing microservice (Kafka + NestJS) — rejected for initial scope; added latency and infra overhead.
  - Manual invoice generation — rejected due to accuracy and audit requirements.

## Notifications & Email Delivery
- **Decision**: Use Resend transactional APIs with retry/backoff orchestrated via Next.js Route Handlers and job queue (Vercel Cron + Edge Config).
- **Rationale**: Resend integrates with Vercel deployments, provides delivery status webhooks, and supports future resident communication.
- **Alternatives Considered**:
  - AWS SES — robust but increases operational burden and secrets management for initial scope.
  - Mailgun — similar capabilities but less native Vercel integration.

## Storage Strategy
- **Decision**: Store receipts and documents in Supabase storage buckets with signed URL access, managed via `packages/api` utilities.
- **Rationale**: Supabase pairs naturally with PostgreSQL setup, simplifies RBAC per bucket, and keeps hosting footprint consistent.
- **Alternatives Considered**:
  - AWS S3 — powerful but requires additional IAM setup and cross-region considerations at launch.
  - Local file storage — violates scalability and durability expectations.

## Analytics & Dashboard Visuals
- **Decision**: Use Recharts within `apps/web` fed by aggregated Prisma queries and cached metrics snapshots.
- **Rationale**: Recharts works well with React, supports composable visualizations, and keeps dependencies lean.
- **Alternatives Considered**:
  - D3.js custom charts — more control but higher dev cost.
  - Embedding BI dashboards (Looker Studio) — external dependency and weaker integration with RBAC.

## Authentication & RBAC
- **Decision**: NextAuth.js with credentials provider backed by Prisma `Admin` model and role claims; enforcement via middleware.
- **Rationale**: Fits Next.js App Router, extensible for future SSO, integrates with Prisma, and satisfies Secure Access & Privacy Controls.
- **Alternatives Considered**:
  - Auth0 — managed solution but incurs cost and adds tenant complexity for early stage.
  - Custom JWT service — increases security risk and maintenance burden.

## Turborepo & Package Management
- **Decision**: Use Turborepo with pnpm workspaces to coordinate apps and shared packages (`api`, `db`, `ui`).
- **Rationale**: Provides caching, pipeline orchestration, and modular boundaries needed for future mobile expansion.
- **Alternatives Considered**:
  - Nx — similar benefits but team already comfortable with Turborepo.
  - Separate repositories — hinders shared domain logic and consistency enforcement.
