# Quickstart: Tenantra Admin Ops Dashboard

## Prerequisites
- Node.js 18.x (aligns with Next.js 15 support matrix)
- pnpm 9.x (workspace manager)
- PostgreSQL 15 (local or Supabase instance)
- GitHub CLI (optional, for CI/CD secrets management)

## Repository Setup
1. Clone the monorepo and checkout feature branch:
   ```bash
   git clone <repo-url> tenantra
   cd tenantra
   git checkout 001-admin-ops-dashboard
   ```
2. Install dependencies with pnpm (Turborepo-aware):
   ```bash
   pnpm install
   ```
3. Copy environment templates:
   ```bash
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   ```
   Populate secrets for NextAuth, Resend API key, Supabase credentials, and Stripe/PayMongo test keys.

## Database & Prisma
1. Update `packages/db/.env` with `DATABASE_URL` pointing to local or Supabase PostgreSQL instance.
2. Run initial migration and seed:
   ```bash
   pnpm turbo run db:migrate
   pnpm turbo run db:seed
   ```
3. Generate Prisma client shared across packages:
   ```bash
   pnpm --filter packages/db generate
   ```

## Development Servers
- Start the admin dashboard (Next.js App Router):
  ```bash
  pnpm --filter apps/web dev
  ```
  Access at http://localhost:3000 with seeded admin credentials.
- Optionally start Resend webhooks locally using `pnpm --filter packages/api webhook:dev` (tunnels via ngrok or localtunnel).

## Testing Workflow
- Unit & integration tests (Vitest + Testing Library):
  ```bash
  pnpm test
  ```
- End-to-end admin flows (Playwright):
  ```bash
  pnpm e2e
  ```
  Requires seeded data and running dev server.

## Turborepo Pipelines
- Lint and type check all workspaces:
  ```bash
  pnpm lint
  pnpm typecheck
  ```
- Build artifacts for CI validation:
  ```bash
  pnpm build
  ```

## Deployment Notes
- Vercel project should import `apps/web`; configure pnpm + Turborepo build command `pnpm turbo run build --filter=apps/web...`.
- Supabase or Render hosts PostgreSQL; ensure Prisma migrations run via GitHub Actions workflow before Vercel deploy.
- Configure Resend domain and environment variables in Vercel dashboard.
- Schedule billing automation and email retries using Vercel Cron jobs hitting protected API routes.

## Troubleshooting
- If Prisma migrations fail, verify database SSL settings (Supabase may require `?sslmode=require`).
- For email delivery issues, inspect `AnnouncementDelivery` records and Resend logs; retries configurable in `packages/api`.
- Dashboard KPI lag indicates stale cache — inspect background job logs and ensure Turborepo tasks for metric refresh are scheduled.
