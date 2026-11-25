# Quotes from the Cabinet

A calm commonplace reading room for [fromthecabinet.com](https://fromthecabinet.com). Each week, a new passage is featured on the primary stage (`/`), with controls to rotate through historical entries, share or copy permalinks and browse the full searchable library (`/library`).

## Features

- **Singular Quote Stage (`/`):** Displays the current week's quote (or most recent published entry), with **Another thought** to rotate through historical passages, **Copy**, **Share** and **Library** access.
- **Commonplace Library (`/library`):** Searchable, hairline-separated archive with quick author filters, clickable author/source/year filtering, a viewport-clamped **Filters** popover and URL query sync (`?q=`, `?author=`, `?source=`, `?year=`).
- **Quote Permalinks (`/quote/[id]`):** Direct canonical pages for sharing individual passages.
- **From the Cabinet v2.0 Design System:** `Geist Variable` and `Geist Mono Variable` typography, light (Oxblood `#881337`) and dark (Rose `#e57389`) themes with zero-FOUC initialization, circular View Transitions theme reveal and cursor-tracking frosted tooltips.
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

- `bun dev` - Start the development server
- `bun run build` - Create an optimized production build
- `bun run start` - Serve the production build
- `bun run lint` - Run ESLint

## API Routes

- `GET /api/quote/today` - Returns today's quote (or the latest quote with `publish_date <= today`)
- `GET /api/quote/random?exclude=<id>` - Returns a random published quote excluding `exclude`
- `GET /api/quotes` - Returns all published quotes (`publish_date <= today`) ordered newest-first
- `GET /api/cron/keepalive` - Performs a lightweight `quotes` count query (`HEAD`) for weekly database keepalive

## Social Preview (`/og`) & Cache Refresh

Open Graph and Twitter/X preview images (`1200 × 630` PNG) are dynamically generated at `/og` from the same Supabase `quotes` source of truth used by the live pages:

- `GET /og` - Renders the active weekly quote (or a branded fallback if quote data is unavailable) with `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` (`max-age=300` on fallback).
- `GET /og?id=<id>&v=<publish_date>` - Versioned quote preview referenced by `/` and `/quote/[id]`, cached with `public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400`. When a new weekly quote publishes, `/` automatically emits a new `v` parameter so re-scraping crawlers fetch the updated image.
- `GET /og?view=library` - Branded preview for `/library`.

### Platform Caching Limitations

Social platforms cache page metadata and preview images on their own schedules, even when `og:image` changes:

- **Facebook / Meta:** Caches URL metadata until refreshed manually via the [Sharing Debugger](https://developers.facebook.com/tools/debug/) ("Scrape Again").
- **LinkedIn:** Caches previews for up to ~7 days; force a refresh with the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
- **X (Twitter):** Re-fetches cards asynchronously when a URL is newly shared (or when a new query param is shared); older tweets keep the card snapshot captured at share time.

## License

See [LICENSE](LICENSE) for details.
