# RateLatch-dashboard

> Next.js frontend for [RateLatch-core](https://github.com/yourusername/ratelatch-core) — real-time analytics, rule management, and account settings for both tenants and platform admins.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-red)
![Recharts](https://img.shields.io/badge/Recharts-2-green)

---

## Features

- 🌙 **Dark mode design** with glassmorphism and animated gradient backgrounds
- 📊 **Live usage charts** — allowed vs. blocked requests over time (auto-refreshes every 30s)
- ⚙️ **Rule management** — create, edit, and delete rate limit rules with an instant modal form
- 🔐 **JWT auth** with cookie-based persistence
- 👤 **Tenant view** — overview, rules, analytics, settings
- 🛡️ **Admin/Owner view** — platform overview, tenant management, billing, system config
- 🔒 **Route protection** via Next.js middleware

---

## Pages

### Tenant Dashboard

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Sign in with email + project key |
| `/register` | Register | Create account, choose plan, reveal project key |
| `/dashboard` | Overview | KPI stats, usage chart, project key display |
| `/dashboard/rules` | Rate Rules | List, create, edit, delete rate limit rules |
| `/dashboard/analytics` | Analytics | Time-range selector, traffic breakdown |
| `/dashboard/settings` | Settings | Account info, token display, logout |

### Owner/Admin Dashboard

| Route | Page | Description |
|---|---|---|
| `/admin` | Platform Overview | System-wide stats and gateway latency |
| `/admin/tenants` | Tenants | List all registered tenants with search/filter |
| `/admin/billing` | Usage and Billing | Per-plan usage aggregation |
| `/admin/config` | System Config | Default plan limits configuration |

---

## Requirements

- Node.js 20+
- **[RateLatch-core](https://github.com/yourusername/ratelatch-core)** running locally via `docker compose up -d`

---

## Setup

### 1. Clone

```bash
git clone https://github.com/yourusername/ratelatch-dashboard.git
cd ratelatch-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost
```

Point this at your deployed **RateLatch-core** backend URL for production.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your `email` and `projectKey` from RateLatch-core.

### 5. Build for production

```bash
npm run build
npm start
```

---

## How Authentication Works

1. **Register** or **Login** via the RateLatch-core Management API — receives a JWT `dashboardToken`.
2. The JWT is stored in a browser cookie (`dashboard_token`) with a 30-day expiry.
3. All API calls attach it as `Authorization: Bearer <token>`.
4. Next.js middleware reads the cookie on every navigation and redirects unauthenticated users to `/login`.
5. The JWT `role` field determines access: `tenant` → `/dashboard`, `owner` → `/admin`.

---

## Tech Stack

| Library | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | App Router, SSR, route middleware |
| [TypeScript](https://typescriptlang.org) | Type safety across all components |
| [TanStack Query v5](https://tanstack.com/query) | Server state, caching, 30s auto-refetch |
| [Recharts](https://recharts.org) | Responsive area charts with gradient fills |
| [js-cookie](https://github.com/js-cookie/js-cookie) | JWT cookie management |

---

## Project Structure

```
ratelatch-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css          # Full design system (dark mode, glass cards, tokens)
│   │   ├── layout.tsx           # Root layout with Inter font and React Query provider
│   │   ├── page.tsx             # Root redirect based on auth state
│   │   ├── login/page.tsx       # Login page
│   │   ├── register/page.tsx    # Registration + one-time key reveal
│   │   ├── dashboard/
│   │   │   ├── layout.tsx       # Tenant sidebar + auth guard
│   │   │   ├── page.tsx         # Overview (KPI cards + chart)
│   │   │   ├── rules/page.tsx   # Rule management table + modal form
│   │   │   ├── analytics/       # Traffic charts with time range selector
│   │   │   └── settings/        # Account info and logout
│   │   └── admin/
│   │       ├── layout.tsx       # Owner sidebar + role guard
│   │       ├── page.tsx         # Platform overview
│   │       ├── tenants/         # Tenant listing
│   │       ├── billing/         # Usage and billing
│   │       └── config/          # System config
│   ├── components/
│   │   ├── Providers.tsx        # React Query provider wrapper
│   │   ├── shared/
│   │   │   ├── Sidebar.tsx      # Sidebar (tenant and owner variants)
│   │   │   ├── StatCard.tsx     # KPI metric card
│   │   │   └── KeyDisplay.tsx   # Copy-to-clipboard key component
│   │   ├── charts/
│   │   │   └── RequestChart.tsx # Area chart (allowed vs blocked)
│   │   └── rules/
│   │       ├── RuleTable.tsx    # Rules table with delete confirmation
│   │       └── RuleForm.tsx     # Create/edit modal with validation
│   ├── lib/
│   │   ├── api.ts               # Typed API client for RateLatch-core
│   │   ├── auth.ts              # JWT decode, cookie utilities
│   │   └── hooks/
│   │       ├── useUsage.ts      # Usage data with 30s polling
│   │       └── useRules.ts      # Rules CRUD with cache invalidation
│   └── middleware.ts            # Route protection proxy
├── .env.local
└── package.json
```

---

## Design System

Custom dark theme in `src/app/globals.css`:

- **Colors** — Navy `#0f172a` background, Indigo `#6366f1` + Cyan `#06b6d4` accents
- **Glass cards** — `backdrop-filter: blur(20px)` with border glow on hover
- **Gradient mesh** — Radial gradient blobs layered in the background
- **Skeleton loaders** — Shimmer animation while data is loading
- **Component classes** — `.glass-card`, `.btn-primary`, `.btn-danger`, `.input`, `.badge`, `.table`

---

## Related

- **[RateLatch-core](https://github.com/yourusername/ratelatch-core)** — Backend gateway, Management API, and infrastructure
