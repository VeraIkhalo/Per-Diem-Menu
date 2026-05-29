# Menu browser

Next.js app for browsing a multi-location Square sandbox menu. All Square API calls go through server route handlers so the access token never hits the browser.

## Run locally

```bash
cp .env.example .env
```

Add your sandbox token to `.env`, then:

```bash
npm install
npm run dev
```

Open http://localhost:3000

Other scripts: `npm run build`, `npm test`, `npm run seed`

`.env` is gitignored. Don't commit tokens.

## Square setup

1. Create a sandbox app at [developer.squareup.com](https://developer.squareup.com) and copy the sandbox access token into `.env` as `SQUARE_ACCESS_TOKEN`.
2. Run `npm run seed` to create sample locations, categories, and items. It skips if that data is already there.
3. Or add items yourself in the Square dashboard — you want at least 2 locations, a few categories, and some items with location-specific availability if you want to demo that.

For breakfast/happy-hour style filtering, attach `CatalogAvailabilityPeriod` objects to a category via `availability_period_ids`. The app checks those windows in each location's timezone.

Prices come back from Square in cents (`priceMoney.amount`). The UI shows that value directly (e.g. `650¢`).

## Structure

- `src/app/api/` — route handlers
- `src/lib/square/` — Square SDK client, catalog + locations fetching
- `src/lib/location-filter.ts` — location presence on catalog objects
- `src/lib/availability.ts` — category time windows
- `src/components/` — menu UI, search, cart

The catalog is fetched in full on each menu request. Fine for sandbox size; I'd cache it in production.

Location filtering happens in app code because Square's list endpoint doesn't filter by `present_at_location_ids`.

Search and cart run on the client against whatever the server already filtered for location and schedule.

## Errors

Rate limits (429), bad tokens (401), and Square 5xx responses map to JSON errors the UI can show. Items without a price or with a missing id are skipped instead of crashing the whole menu.

## Next steps

- Catalog cache + webhook invalidation
- Modifier lists on the item page
- Server-side cart pricing
- Inventory / out-of-stock from the Inventory API
