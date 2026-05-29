# Per Diem Menu Browser (Take-Home)

A multi-location menu browser built with **Next.js** and Square’s **Catalog** and **Locations** APIs. All Square calls run on the server; the browser never sees your access token.

## Quick start

```bash
cp .env.example .env
# Add your Square sandbox access token to .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Square sandbox setup

1. Create a free account at [developer.squareup.com](https://developer.squareup.com).
2. Create a **Sandbox** application and copy the **Sandbox access token**.
3. Paste it into `.env` as `SQUARE_ACCESS_TOKEN`.
4. In the Square Developer Dashboard → **Sandbox test accounts** → open the sandbox seller.
5. Seed catalog data (pick one):
   - **Fastest:** run `npm run seed` in this project (creates categories, items, and a second location).
   - **Dashboard:** Items → Catalog — create **2 locations**, **3–4 categories**, **6–10 items**. Mark at least one item available at only one location (uncheck “all locations” and pick specific locations).
   - **Time-of-day bonus:** On a category, attach **availability periods** (day + start/end local time). Link categories to `AVAILABILITY_PERIOD` objects via `availability_period_ids` (API) or the menu scheduling UI in Dashboard.

### Location-only item (required)

For an item available at a single location:

- Edit the item in Square Dashboard → Locations → choose **Specific locations** (not all).
- Or via API: set `present_at_all_locations: false` and `present_at_location_ids: ["LOCATION_ID"]`.

### Breakfast / happy-hour category (bonus)

Square models time windows with **`CatalogAvailabilityPeriod`** objects referenced from **`CatalogCategory.availability_period_ids`**.

This app:

1. Loads `AVAILABILITY_PERIOD` objects with the catalog.
2. Evaluates windows in the **selected location’s IANA timezone** (`Location.timezone`).
3. Hides items whose categories are all outside the current window.

**Why this approach:** Channel-based menus (`CatalogCategory.channels`) are geared toward Square Online visibility, not guest-facing “is it breakfast right now?” windows. Availability periods map directly to day/time and are documented on `CatalogCategory`. If your sandbox uses Dashboard menu schedules only, mirror them as availability periods or use Square’s test catalog seed that includes them.

## Architecture

```
Browser (React)  →  /api/locations, /api/menu  →  Square SDK (server-only)
```

| Layer | Responsibility |
|--------|----------------|
| `src/lib/square/client.ts` | Singleton Square client from env |
| `src/lib/square/catalog-service.ts` | Paginated catalog fetch, normalization |
| `src/lib/location-filter.ts` | `present_at_*` / `absent_at_*` rules |
| `src/lib/availability.ts` | Category availability windows in local TZ |
| `src/app/api/*` | JSON API, validation, error mapping |
| `src/components/*` | Menu UI, loading / empty / error states |

**Trade-offs**

- **Full catalog pull** on each menu request — simple and correct for sandbox-sized catalogs; would add caching (see “Next week”) for production.
- **Client-side category filter** after server filters location + schedule — keeps API small; search/cart would stay server-aware.
- **Detail page re-fetches catalog** — avoids a separate cache layer for the take-home time box.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (location + availability helpers) |

## What I’d build next (another week)

1. **In-memory catalog cache** (TTL + webhook invalidation) to cut Square round-trips.
2. **Modifiers on detail** — batch-fetch `MODIFIER_LIST` / `MODIFIER` and render choices.
3. **Search** — server endpoint with normalized item index.
4. **Cart + subtotal** — client cart, server price validation against catalog versions.
5. **Inventory API** — `stockLevels` on `searchItems` for out-of-stock badges.
6. **E2E tests** against recorded Square fixtures so CI doesn’t need live tokens.

## Loom checklist (60–90s)

- Location switcher + item that disappears per location  
- Category filter + grouped menu  
- Item detail (price in dollars, image, description)  
- Category outside availability window (hidden items)  
- Error state (optional: bad token)  
- Trade-off: full catalog fetch vs cache  

## Submission

Public GitHub repo + Loom link to doron@tryperdiem.com / saad@tryperdiem.com.
