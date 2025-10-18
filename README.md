# 🏢 Tenantra

**Tenantra** is a modern condominium and apartment management platform.
<img width="1618" height="989" alt="image" src="https://github.com/user-attachments/assets/bc3c4b4e-d086-44f8-8a44-3629e62cf2ee" />

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
