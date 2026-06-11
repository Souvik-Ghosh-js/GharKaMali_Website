# GharKaMali — Customer Website

The customer-facing web app for **GharKaMali** (🌿 *Your Garden, Our Care*) — gardening
services platform. Customers browse plans, book on-demand or subscription garden
visits, shop for plants & products, manage bookings, pay online, and track gardeners.

Built with **Next.js 14 (App Router)**, React 18, and TypeScript.

---

## Tech Stack

| Area | Library |
|------|---------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) + React 18 + TypeScript |
| Data fetching | [@tanstack/react-query](https://tanstack.com/query) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Animation | [framer-motion](https://www.framer.com/motion/), [GSAP](https://gsap.com), [Lenis](https://lenis.darkroom.engineering/) (smooth scroll) |
| Maps | [Leaflet](https://leafletjs.com) + react-leaflet, Google Maps (geocoding/places) |
| 3D | [three.js](https://threejs.org) |
| Payments | Razorpay (checkout) |
| Realtime | socket.io-client |
| Notifications | react-hot-toast |

---

## Prerequisites

- **Node.js 18.17+** (Next.js 14 requires Node 18.17 or newer; Node 20 LTS recommended)
- **npm** (ships with Node) — or pnpm/yarn if you prefer
- A running instance of the **GharKaMali backend API** (see `GharKaMali_Backend`) for live data
- A **Google Maps API key** (Maps JavaScript API + Places API enabled) for the address picker / geocoding

---

## Quick Start (Local Development)

```bash
# 1. Go to the website directory
cd GharKaMali_Website

# 2. Install dependencies
npm install

# 3. Create your env file (see "Environment Variables" below)
cp .env.example .env.local        # then edit .env.local with your values

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000** in your browser. The app hot-reloads on file changes.

> **Note:** Next.js reads `.env.local` first (and it's gitignored). A `.env` file
> also works but `.env.local` is the convention for local secrets.

---

## Environment Variables

All client-exposed variables **must** be prefixed with `NEXT_PUBLIC_`. Copy
`.env.example` to `.env.local` and fill these in:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend API (include `/api`). Falls back to the hosted API if unset. | `http://localhost:3000/api` or `https://gkm.gobt.in/api` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JS + Places key, used by the address picker and geocoding. | `AIza...` |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL — used for SEO metadata, sitemap, and canonical links. Defaults to `https://gharkamali.com`. | `http://localhost:3000` |

> ⚠️ If your backend runs on port 3000, run the website on a different port to
> avoid a clash — e.g. `npm run dev -- -p 3001` — and point
> `NEXT_PUBLIC_API_URL` at the backend's port.

---

## Available Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server with hot reload (http://localhost:3000) |
| `npm run build` | Production build (`.next/`) |
| `npm run start` | Serve the production build (run `build` first) |
| `npx tsc --noEmit` | Type-check the whole project without emitting files |

> The production build is configured to **not fail** on ESLint or TypeScript
> errors (`next.config.js` → `ignoreDuringBuilds` / `ignoreBuildErrors`). Run
> `npx tsc --noEmit` manually to catch type issues before shipping.

---

## Project Structure

```
GharKaMali_Website/
├── public/                 # Static assets (logo.png, images, favicon, bg media)
├── src/
│   ├── app/                # Next.js App Router — one folder per route
│   │   ├── layout.tsx      # Root layout + global SEO metadata
│   │   ├── page.tsx        # Home page
│   │   ├── book/           # Booking flow (plans → plants → schedule → pay)
│   │   ├── shop/           # Plant & product shop + orders
│   │   ├── bookings/       # Customer's bookings list + detail/tracking
│   │   ├── subscriptions/  # Subscription management
│   │   ├── plans/          # Service plans
│   │   ├── wallet/         # Wallet & transactions
│   │   ├── login/          # Phone-based auth
│   │   ├── profile/        # User profile & addresses
│   │   ├── complaints/     # Raise / track complaints
│   │   ├── careers/        # Gardener job applications
│   │   ├── cities/ [area]/ # Location landing pages (SEO)
│   │   ├── about, contact, terms, blogs, plantopedia, near-me, green-makeover …
│   │   ├── sitemap.ts      # Dynamic sitemap
│   │   └── robots.ts       # robots.txt
│   ├── components/         # Shared UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core utilities
│   │   ├── api.ts          # API client (reads NEXT_PUBLIC_API_URL)
│   │   ├── razorpay.ts     # Razorpay checkout helper
│   │   ├── googleMaps.ts   # Maps loader / geocoding
│   │   ├── validators.ts   # Form validation
│   │   └── areas.ts, slug.ts, indianStates.ts …
│   └── store/              # Zustand stores (cart, auth, location, etc.)
├── next.config.js          # Next config (image domains, build flags)
├── tsconfig.json
└── package.json
```

---

## How It Connects to the Backend

- All API calls go through `src/lib/api.ts`, which prefixes every request with
  `NEXT_PUBLIC_API_URL`.
- Auth is **phone-number based** — a JWT from the backend is stored client-side and
  attached to requests.
- **Payments** use Razorpay: the website creates an order via the backend, opens
  Razorpay checkout, and the backend verifies the signature + webhook to confirm.
- For a fully working local setup, run the backend (`GharKaMali_Backend`) and a
  MySQL database first, then point `NEXT_PUBLIC_API_URL` at it.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Map / address picker is blank | Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and enable **Maps JavaScript API** + **Places API** in Google Cloud. |
| API calls fail / CORS errors | Check `NEXT_PUBLIC_API_URL` points to a running backend and the backend allows this origin. |
| Port 3000 already in use | The backend may be on 3000 — run the site on another port: `npm run dev -- -p 3001`. |
| Env changes not picked up | Restart `npm run dev` — Next.js only reads env files at startup. |
| `NEXT_PUBLIC_` var is `undefined` in the browser | Make sure it's prefixed with `NEXT_PUBLIC_` and you restarted the dev server. |

---

## Deployment

```bash
npm install
npm run build
npm run start          # serves the production build on port 3000
```

Set the same environment variables in your hosting platform (Vercel, a Node
server behind PM2, etc.). On Vercel, add them under **Project → Settings →
Environment Variables**. `NEXT_PUBLIC_*` values are baked in at **build time**, so
rebuild after changing them.

---

*Part of the GharKaMali platform: Customer Website · Admin Dashboard · Backend API ·
Customer App (Flutter) · Gardener App (Flutter).*
