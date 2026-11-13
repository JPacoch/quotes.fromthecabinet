# Quotes from the Cabinet

A calm commonplace reading room for [fromthecabinet.com](https://fromthecabinet.com). Each week, a new passage is featured on the primary stage (`/`), with controls to rotate through historical entries, share or copy permalinks, and browse the full searchable library (`/library`).

## Features

- **Singular Quote Stage (`/`):** Displays the current week's quote (or most recent published entry), with **Another thought** to rotate through historical passages, **Copy**, **Share**, and **Library** access.
- **Commonplace Library (`/library`):** Searchable, hairline-separated archive with quick author filters, a frosted **Authors & years** filter popover, URL query sync (`?q=`, `?author=`, `?year=`), and source context popovers.
- **Quote Permalinks (`/quote/[id]`):** Direct canonical pages for sharing individual passages.
- **From the Cabinet v2.0 Design System:** `Geist Variable` and `Geist Mono Variable` typography, light (Oxblood `#881337`) and dark (Rose `#e57389`) themes with zero-FOUC initialization, circular View Transitions theme reveal, and cursor-tracking frosted tooltips.
- **Weekly Supabase Keepalive (`/api/cron/keepalive`):** Scheduled via [vercel.json](vercel.json) (`0 9 * * 1`) to run a lightweight query once a week so a free-tier Supabase project does not auto-pause from inactivity.

## Tech Stack

- **Runtime & Package Manager:** Bun
- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript
- **Fonts:** `@fontsource-variable/geist` & `@fontsource-variable/geist-mono`
- **Database:** Supabase (PostgreSQL via `@supabase/supabase-js`)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed locally
- A Supabase project with a `quotes` table (`id`, `content`, `author`, `source`, `publish_date`, `created_at`)

### Environment Variables

Create a `.env.local` file in the repository root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key
# Optional: protects /api/cron/keepalive when set (Vercel sends Authorization: Bearer <CRON_SECRET>)
CRON_SECRET=your-cron-secret
```

### Installation & Development

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `bun dev` — Start the development server
- `bun run build` — Create an optimized production build
- `bun run start` — Serve the production build
- `bun run lint` — Run ESLint

## API Routes

- `GET /api/quote/today` — Returns today's quote (or the latest quote with `publish_date <= today`)
- `GET /api/quote/random?exclude=<id>` — Returns a random published quote excluding `exclude`
- `GET /api/quotes` — Returns all published quotes (`publish_date <= today`) ordered newest-first
- `GET /api/cron/keepalive` — Performs a lightweight `quotes` count query (`HEAD`) for weekly database keepalive

## License

See [LICENSE](LICENSE) for details.
