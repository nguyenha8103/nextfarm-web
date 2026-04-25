# Nextfarm Web

Next.js frontend for the Nextfarm dashboard.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript strict
- TailwindCSS 4
- TanStack Query, Zustand, ky
- MapLibre GL JS
- Recharts

## Run locally

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and adjust values when connecting to backend services.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
NEXT_PUBLIC_BASE_PATH=
```

`NEXT_PUBLIC_BASE_PATH` is empty for local development. The GitHub Pages workflow sets it to `/nextfarm-web`.
