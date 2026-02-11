# 🇳🇱 Dutch Olympic Medals Tracker — Milano Cortina 2026

A live tracker for Netherlands' performance at the 2026 Winter Olympics. Shows medal count, full medal tally, and upcoming events with Dutch participants.

![Netherlands Olympic Tracker](https://img.shields.io/badge/🏅_Oranje-Winterspelen_2026-FF6600?style=for-the-badge)

## Features

- **🥇 Live medal tally** — Netherlands' gold, silver, bronze count with overall ranking
- **📊 Full medal table** — All countries, expandable, sorted by gold
- **📅 Dutch event schedule** — Every event with Dutch athletes, grouped by date
- **⏱️ Live countdowns** — Real-time countdown to next Dutch event
- **🔴 Live indicators** — Events currently in progress are highlighted
- **🔄 Auto-refresh** — Medal data refreshes every 60s, schedule every 30s
- **🇳🇱 Dutch language** UI with orange theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Data Fetching | TanStack Query (React Query) |
| Data Source | olympics.com API (client-side) |
| Deployment | Cloudflare Pages (static export) |
| Testing | Jest + React Testing Library |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
npm install
```

### Development

```bash
npm run dev         # Start dev server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run typecheck   # Type check
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build       # Build static export to /out
```

## Deploy to Cloudflare Pages

### Via Wrangler CLI

```bash
# Build the static export
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy out
```

### Via Cloudflare Dashboard

1. Push this project to a GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js version**: `18` or higher
6. Deploy!

## Data Sources

The app fetches live data directly from olympics.com's JSON endpoints (same format used for Paris 2024). The endpoint pattern is:

```
https://olympics.com/OG2026/data/CIS_MedalNOCs~lang=ENG~comp=OG2026.json
```

**Data fetching strategy:**
1. Attempt JSON endpoint (primary)
2. Fall back to HTML parsing if JSON fails
3. Use embedded fallback data if all else fails

**Auto-refresh:**
- Medal data: Every 60 seconds (via TanStack Query)
- Event schedule: Every 30 seconds (client-side computed)

The Dutch event schedule is maintained in `lib/constants.ts` based on the official Milano Cortina 2026 schedule.

## Project Structure

```
├── app/
│   ├── page/
│   │   ├── page.tsx            # Main page component
│   │   └── page.test.tsx       # Page integration tests
│   ├── layout.tsx              # Root layout with QueryProvider
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── MedalOverview/
│   │   ├── MedalOverview.tsx   # Medal rings component
│   │   ├── MedalOverview.test.tsx
│   │   └── index.ts
│   ├── MedalTally/
│   │   ├── MedalTally.tsx      # Expandable medal table
│   │   ├── MedalTally.test.tsx
│   │   └── index.ts
│   ├── QueryProvider.tsx       # TanStack Query provider
│   ├── Header.tsx              # 🇳🇱 branding header
│   ├── NextEventHighlight.tsx  # Countdown to next event
│   ├── EventList.tsx           # Full schedule
│   ├── Footer.tsx              # Credits
│   └── utils.ts                # Date formatting, countdown
├── lib/
│   ├── olympics/
│   │   ├── olympics.ts         # Data fetching + parsing
│   │   ├── olympics.test.ts
│   │   └── index.ts
│   ├── types.ts                # TypeScript interfaces
│   └── constants.ts            # Schedule, config, NOC codes
├── tests/
│   └── setup/
│       ├── test-utils.tsx      # Custom render with QueryClient
│       └── mocks/              # API mocks for testing
└── ...config files
```

## Testing

Tests are colocated with their code for better maintainability:

```bash
npm test              # Run all tests
npm run test:watch    # Run in watch mode
npm run test:coverage # With coverage report
```

**Test locations:**
- `components/ComponentName/ComponentName.test.tsx`
- `app/page/page.test.tsx`
- `lib/olympics/olympics.test.ts`

All tests use Jest + React Testing Library with custom TanStack Query wrappers.

## License

MIT — Built with ❤️ for Oranje 🧡
