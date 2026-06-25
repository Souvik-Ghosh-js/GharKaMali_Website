# GharKaMali — SEO Report

**Domain:** gharkamali.com
**Stack:** Next.js 14 (App Router) + TypeScript
**Scope:** Technical / on-page SEO audit (from codebase) + live-data checklist
**Date:** June 2026

> **What this report covers:** Part A is a code-verified audit of the on-page and
> technical SEO baked into the website. Part B is a checklist for the *off-page /
> live-data* side (rankings, traffic, backlinks) — which lives in external tools
> (Google Search Console, Ahrefs/SEMrush) and must be gathered there, not from code.

---

## Executive Summary

The site has a **solid SEO foundation** — a well-structured root metadata block, a
`title` template, `metadataBase` set, a dynamic sitemap, a correct `robots.ts`, one
`<h1>` per page, and genuinely good local-SEO landing pages (`/[area]`, `/cities/[slug]`).

The **single biggest gap**: ~23 of 31 pages are `'use client'` components, so they
**cannot export page-specific metadata** and all fall back to the generic homepage
title/description. The most commercially important pages — Home, Plans, Book, Shop —
are affected. Fixing this is the highest-ROI SEO work available.

| Severity | Count | Headline issues |
|---|---|---|
| 🔴 Critical | 4 | Per-page metadata missing on key pages · placeholder phone in schema + invoices · no Article schema on blogs · weak per-city local markup |
| 🟠 Moderate | 4 | Raw `<img>` (no optimization) · permissive image domains · no BreadcrumbList · build ignores TS/ESLint |
| 🟢 Strength | 8 | Root metadata · dynamic sitemap · robots · H1s · canonicals · FAQ schema · font preconnect · `metadataBase` |

---

# PART A — On-Page / Technical Audit (code-verified)

## 1. Root Metadata — `src/app/layout.tsx` ✅ Strong

- **Title (default):** `GharKaMali — Expert Plant Care at Home | Starting ₹349`
- **Title template:** `%s | GharKaMali` (page titles auto-append the brand)
- **Description:** *"Expert plant care at your home starting just ₹349. Professional gardeners in Noida & Greater Noida. Book your garden visit today!"*
- **`metadataBase`:** `https://gharkamali.com` ✅ (enables absolute OG/canonical URLs)
- **OpenGraph + Twitter:** present (`summary_large_image`, `en_IN`, logo as OG image)
- **LocalBusiness JSON-LD** present (lines ~70–113)

**Gaps:**
- 🔴 **No site verification tags** (`google-site-verification`, Bing). Needed to claim the site in Search Console (see Part B).
- 🟡 **Google Analytics is a placeholder** — `GA_MEASUREMENT_ID` is never set. Analytics is effectively off. (Meta Pixel `1468638878299435` *is* live.)

---

## 2. Per-Page Metadata — 🔴 CRITICAL GAP

Next.js only lets **server components** export `metadata`/`generateMetadata`. These
key pages are `'use client'`, so they inherit the generic homepage title/description:

| Page | Component | Page-specific metadata? |
|---|---|---|
| Home `/` | client | ❌ falls back to root |
| Plans `/plans` | client | ❌ |
| Book `/book` | client | ❌ |
| Shop `/shop` + `/shop/[slug]` | client | ❌ |
| About `/about` | client | ❌ |
| Contact `/contact` | client | ❌ |
| Careers `/careers` | client | ❌ |
| Green Makeover, Terms, Plantopedia | client | ❌ |

**Pages that DO have proper dynamic metadata (good):** `/blogs/[slug]`, `/cities/[slug]`, `/[area]`, `/near-me`.

**Impact:** Every important commercial page shows the *same* title and description in
Google results → poor click-through, weak keyword targeting, near-duplicate snippets.

**Fix (per page):** Add a sibling `layout.tsx` (a **server** component) for each route
that exports unique `metadata`, while the existing `page.tsx` stays `'use client'`.
Example for `/plans`:

```tsx
// src/app/plans/layout.tsx  (server component — no 'use client')
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Plant Care Subscription Plans — Monthly Garden Visits',
  description: 'Choose a monthly plant-care plan in Noida & Greater Noida. Regular gardener visits, fertilizer, pruning & more from ₹349. Compare plans.',
  alternates: { canonical: 'https://gharkamali.com/plans' },
  openGraph: { title: 'GharKaMali Care Plans', images: ['/logo.png'] },
};
export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

Priority order to fix: **Home → Plans → Book → Shop → About → Careers → Contact.**
(Home is special — it's the root `page.tsx`; give it metadata via the root `layout.tsx`
default, which it already has, but write a sharper homepage-specific description.)

---

## 3. Structured Data (JSON-LD)

| Schema | Location | Dynamic? | Status |
|---|---|---|---|
| LocalBusiness + OfferCatalog | `layout.tsx` | hardcoded | 🟠 placeholder phone, only 2 services |
| FAQPage | `plans/page.tsx` | API + fallback | ✅ good |
| FAQPage | `about/page.tsx` | hardcoded | ✅ ok |
| FAQPage | `book/[[...slug]]/page.tsx` | hardcoded | ✅ (recently de-staled) |

**Gaps:**
- 🔴 **Placeholder phone `+91-9999999999`** in the LocalBusiness schema (`layout.tsx:75`) — Google may surface this in a Knowledge Panel. Also appears in the **order invoice footer** (`shop/orders/[id]/page.tsx:79`). Replace with the real number everywhere.
- 🔴 **No `Article` schema on blog posts** — blogs have OG tags but no Article JSON-LD, so they're not eligible for article rich results. Add `Article` with `headline`, `image`, `datePublished`, `dateModified`, `author`.
- 🟠 **No `BreadcrumbList`** on `/[area]`, `/cities/[slug]`, `/blogs/[slug]`, `/shop/[slug]` — breadcrumbs improve SERP appearance.
- 🟠 **No `Product` schema** on shop product pages (relevant once the shop is re-enabled).
- 🟠 **No per-city `LocalBusiness`** — only the head-office (Noida) entity exists.

---

## 4. Sitemap — `src/app/sitemap.ts` ✅ Strong

Dynamic sitemap at `https://gharkamali.com/sitemap.xml`, revalidated hourly. Includes:
- 13 static routes (home, plans, book, shop, blogs, near-me, green-makeover, etc.) with sensible `priority`/`changeFrequency`
- Dynamic `/[area]` pages (from `fetchAreas()`)
- Dynamic `/shop/[slug]` products, `/cities/[slug]`, `/blogs/[slug]` (fetched from API, try/catch-guarded)

**Gaps:**
- 🟠 Shop **category** pages (`/shop/c/[category]`) are not included.
- ✅ Auth pages correctly excluded.

---

## 5. Robots — `src/app/robots.ts` ✅ Correct

```
allow: '/'
disallow: ['/api/', '/dashboard/', '/login/', '/payment/', '/profile/']
sitemap: 'https://gharkamali.com/sitemap.xml'
```
- ✅ Auth/transactional pages blocked; sitemap referenced; no accidental `noindex` on public pages.
- 🟡 Consider also disallowing `/bookings/`, `/subscriptions/`, `/wallet/`, `/notifications/` (user-only, thin/duplicate for bots).

---

## 6. Headings & Semantics ✅ Good

- Every audited page has **exactly one `<h1>`** (home, plans, about, terms, `/[area]`).
- H1s contain keywords (brand, "garden's future", city names).
- H2s used for major sections.
- 🟡 A few sections use styled `<div>`s instead of semantic `<h2>/<h3>` — minor.

---

## 7. Images & Alt Text — 🟠 Needs work

- Site uses **raw `<img>`**, not `next/image` → no automatic resizing, lazy-loading, or WebP. This hurts Core Web Vitals (LCP) — a ranking factor.
- ~85–90% of images have meaningful `alt` (good dynamic alts on products/blogs).
- 🔴 **Missing alt** on the service-card image at `page.tsx:521`.
- **Fix:** Add the missing alt; progressively migrate `<img>` → `next/image` starting with the homepage hero and product/blog cards.

---

## 8. Canonical & OpenGraph

- ✅ Explicit canonicals on the dynamic pages (`/blogs/[slug]`, `/cities/[slug]`, `/[area]`, `/near-me`).
- 🟡 Client pages have no explicit canonical — Next.js auto-derives from `metadataBase`, which is acceptable, but adding explicit canonicals via the per-page `layout.tsx` (Section 2 fix) is cleaner.

---

## 9. Local SEO (City / Area pages) ✅ Good, with upside

Two complementary systems:
- **`/[area]`** — statically generated for serving areas + dynamic admin cities, `revalidate: 60`, unique template-driven title/description/H1/canonical per city. Content-rich.
- **`/cities/[slug]`** — server `generateMetadata`, city-specific title *"Gardener in {city} | Mali Service in {city}"*, fetched from API.

**Upside:**
- 🔴 Add **per-city `LocalBusiness`/`Service` JSON-LD** with NAP (Name/Address/Phone) for top areas (Noida, Greater Noida, Ghaziabad, Gurgaon, Delhi) — strong local-pack signal.
- 🟡 `/[area]` content is mostly templated; adding a few city-unique sentences reduces near-duplication risk.

---

## 10. Performance / SEO-adjacent

- ✅ Fonts via `<link>` + preconnect (Poppins).
- ✅ `metadataBase` set; analytics/pixel scripts async.
- 🟠 `next.config.js`: `images.remotePatterns` allows **any** HTTPS host (`hostname: '**'`) — tighten to `gkm.gobt.in` + `gharkamali.com`.
- 🟠 `next.config.js`: `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` are **on** — masks errors; fine short-term, technical debt long-term.
- 🟡 Configure the real **GA measurement ID** (currently a placeholder → no analytics data).

---

# PART A — Prioritized Fix List

| # | Priority | Issue | File(s) | Effort |
|---|---|---|---|---|
| 1 | 🔴 P0 | Per-page metadata via sibling `layout.tsx` | Home, Plans, Book, Shop, About, Careers, Contact | M |
| 2 | 🔴 P0 | Replace placeholder phone `+91-9999999999` | `layout.tsx:75`, `shop/orders/[id]/page.tsx:79` | XS |
| 3 | 🔴 P1 | Add `Article` JSON-LD to blog posts | `blogs/[slug]/page.tsx` | S |
| 4 | 🔴 P1 | Per-city `LocalBusiness` JSON-LD (top areas) | `[area]/page.tsx`, `cities/[slug]` | M |
| 5 | 🟠 P1 | Add missing alt; begin `<img>`→`next/image` | `page.tsx:521` + cards | M |
| 6 | 🟠 P2 | `BreadcrumbList` on nested routes | area/city/blog/shop | S |
| 7 | 🟠 P2 | Tighten `images.remotePatterns` | `next.config.js` | XS |
| 8 | 🟡 P2 | Set real GA measurement ID | `layout.tsx` + env | XS |
| 9 | 🟡 P2 | Add shop categories to sitemap | `sitemap.ts` | S |
| 10 | 🟡 P3 | Disallow remaining user pages in robots | `robots.ts` | XS |

---

# PART B — Live-Data / Off-Page Checklist

> These can't be measured from code — gather them in the tools below. This is the
> "is anyone actually finding us" half of SEO.

## 1. Search Console & Indexing (do first)
- [ ] **Verify gharkamali.com in Google Search Console** (add the verification meta tag to `layout.tsx` once you have it). Also Bing Webmaster Tools.
- [ ] **Submit the sitemap** in GSC: `https://gharkamali.com/sitemap.xml`.
- [ ] Check **Pages → Indexed vs Not indexed** — how many of your URLs Google has actually indexed. Investigate "Discovered – not indexed" / "Crawled – not indexed".
- [ ] Check **Page Experience / Core Web Vitals** report (mobile) — LCP/INP/CLS pass rate. (The raw-`<img>` issue above shows up here.)
- [ ] Run a few pages through the **Rich Results Test** and **URL Inspection** to confirm the LocalBusiness/FAQ schema is detected and valid.

## 2. Keyword & Ranking (Ahrefs / SEMrush / GSC Performance)
- [ ] In **GSC → Performance**: export top queries, impressions, clicks, avg position, CTR. Find "high impressions, low CTR" pages → those need better titles/descriptions (ties to Part A #1).
- [ ] Track target keywords and current rank:
  - `gardener in noida`, `mali service near me`, `plant care at home`, `gardener greater noida`, `garden maintenance gurgaon`, `balcony garden service delhi`, `gardener ghaziabad`, brand `gharkamali`.
- [ ] Identify the **gap** between pages you've built (`/[area]`, `/cities/[slug]`) and the keywords they actually rank for.

## 3. Local SEO (critical for a city-services business)
- [ ] **Google Business Profile** — claim/verify it. This often matters *more* than the website for "near me" searches. Ensure NAP matches the site exactly.
- [ ] Consistent **NAP** (Name, Address, Phone) across GBP, website schema, and directories. ⚠️ Right now the site shows the **placeholder phone** — fix everywhere (Part A #2) before building citations.
- [ ] Build local **citations/directories** (JustDial, Sulekha, IndiaMART, Google Maps).
- [ ] Collect **Google reviews** — review count/rating is a strong local ranking + CTR factor.

## 4. Backlinks & Authority
- [ ] Run a backlink audit (Ahrefs/SEMrush free tier or GSC → Links). Note referring domains, anchor text, any toxic links.
- [ ] Outreach targets: local Noida/NCR blogs, gardening/home-services directories, partnerships.

## 5. Content & Competitors
- [ ] Map each target keyword → a page. Where there's no page, the blog (`/blogs`) is the vehicle (e.g. "best indoor plants for Noida apartments", "monsoon plant care").
- [ ] Compare against 2–3 competitors ranking for "gardener noida" — note their content depth, schema, GBP reviews.

## 6. Analytics (so you can measure all the above)
- [ ] Set the real **GA4 measurement ID** (placeholder today) → track organic traffic, conversions (bookings/subscriptions), landing pages.
- [ ] Link **GA4 ↔ Search Console** to see queries → behavior in one place.

---

## How to use this report

1. **Quick wins first** (hours): fix the placeholder phone (#2), missing alt (#5 partial), tighten image domains (#7), set GA ID (#8).
2. **Highest ROI** (a day): per-page metadata via `layout.tsx` (#1) — this directly improves how every commercial page appears in Google.
3. **Local-SEO push** (ongoing): claim Google Business Profile, fix NAP, add per-city schema (#4), collect reviews — this is where a city-services business wins.
4. **Measure**: get Search Console + GA4 live so you can see indexing, queries, and conversions and re-prioritize from real data.

*Part A is verified against the codebase (file:line references throughout). Part B
requires external tools and account access that aren't available from the code.*
