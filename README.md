# Fleet Board

Frontend take-home for Transjakarta: a live vehicle board against the [MBTA v3 API](https://api-v3.mbta.com/docs/swagger/index.html#/Vehicle/ApiWeb_VehicleController_index). The brief asks for React, Tailwind, hooks, cards, pagination, route/trip filters, and a detail popup.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`. `VITE_MBTA_API_BASE` is the API origin (`https://api-v3.mbta.com`). Set `VITE_MBTA_API_KEY` if you hit HTTP 429.

```bash
npm test
npm run build
```

## Architecture

This is one page. Filter and pagination state live in the URL (`page`, `pageSize`, `routes`, `trips`, `vehicle`) so a refresh and the back button keep working. Server state is TanStack Query on top of `fetch` in `src/lib/mbtaClient.ts`, which reads its base URL from `VITE_MBTA_API_BASE`.

```
URL  →  searchState  →  query keys
                         ├─ GET /vehicles            list, polled every 15s
                         ├─ GET /vehicles/:id        dialog
                         ├─ GET /routes              infinite dropdown
                         └─ GET /trips               infinite dropdown
```

JSON:API does not embed related records on the resource. `include=route,trip,stop` puts them in `included[]`; `src/lib/jsonApi.ts` joins those onto each vehicle so the card can show route color and name without a second request.

Pagination is server-side (`page[limit]`, `page[offset]`). The API has no `meta.total`. `src/lib/pagination.ts` reads `page[offset]` from `links.last`, then corrects the total when the last page is short.

Query is here because of polling, request cancellation, `placeholderData` on page changes, and `useInfiniteQuery` for the dropdowns. The URL is used instead of a client store because the state is shareable. Next.js is not used because this is a single page talking to a public REST API.

## Demo notes

- **Get data:** `fetch` + TanStack Query. List uses `/vehicles` with `include` and filters. Detail uses `/vehicles/:id`. Dropdowns use `useInfiniteQuery` on `/routes` and `/trips`.
- **UI:** React function components, Tailwind, custom accessible dropdown and dialog. Leaflet loads only when the dialog opens.
- **Pagination:** MBTA `page[limit]` / `page[offset]`; range text from `links.last`.
