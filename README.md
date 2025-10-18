# 🏢 Tenantra

**Tenantra** is a modern condominium and apartment management platform.

### 🚀 Structure
- `apps/web` – Admin dashboard (Next.js + ShadCN UI)
- `apps/mobile` – Resident mobile app (future)
- `packages/api` – Shared backend and API logic
- `packages/ui` – Shared UI components
- `packages/config` – Shared configuration and constants

### 🧰 Stack
- Next.js 15 (App Router)
- TypeScript
- ShadCN UI
- Tailwind CSS
- Prisma (ORM)
- PostgreSQL
- NextAuth.js (for auth)
- tRPC or REST endpoints (for mobile API)

### 💻 Getting Started
```bash
git clone https://github.com/yourusername/tenantra.git
cd tenantra
pnpm install
pnpm dev --filter @tenantra/web
