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
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Data | olympics.com JSON endpoints |
| Deployment | Cloudflare Pages |
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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

## Deploy to Cloudflare Pages

### Option 1: Via Wrangler CLI

```bash
# Install wrangler if needed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run deploy
```

### Option 2: Via Cloudflare Dashboard

1. Push this project to a GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
   - **Node.js version**: `18`
6. Deploy!

### Option 3: Static Export (simplest)

If you don't need server-side rendering:

1. Uncomment `output: 'export'` in `next.config.js`
2. Run `npm run build`
3. Upload the `out/` folder to Cloudflare Pages

## Data Sources

The app attempts to fetch live data from olympics.com's JSON endpoints (same format used for Paris 2024). The endpoint pattern is:

```
https://olympics.com/OG2026/data/CIS_MedalNOCs~lang=ENG~comp=OG2026.json
```

If the live endpoint is unavailable, it falls back to parsing the HTML medals page, and finally to embedded static data.

The Dutch event schedule is maintained in `lib/constants.ts` based on the official Milano Cortina 2026 schedule.

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main page (client-side orchestration)
│   ├── globals.css             # Tailwind + custom styles
│   └── api/
│       ├── medals/route.ts     # Medal tally API (proxies olympics.com)
│       └── schedule/route.ts   # Dutch schedule API
├── components/
│   ├── Header.tsx              # 🇳🇱 branding header
│   ├── MedalOverview.tsx       # Medal rings (G/S/B/Total)
│   ├── MedalTally.tsx          # Expandable country medal table
│   ├── NextEventHighlight.tsx  # Countdown to next Dutch event
│   ├── EventList.tsx           # Full schedule with filters
│   ├── Footer.tsx              # Credits
│   └── utils.ts                # Date formatting, countdown logic
├── lib/
│   ├── olympics.ts             # Data fetching + parsing
│   ├── types.ts                # TypeScript interfaces
│   └── constants.ts            # Dutch schedule, config, NOC codes
└── ...config files
```

## License

MIT — Built with ❤️ for Oranje 🧡
