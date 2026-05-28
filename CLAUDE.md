# CLAUDE.md — waxstat-web-widget

Context for Claude Code sessions working on this repo. Read this first; then `git log -10` for recent changes.

## What this project is

An **embeddable widget** that any third-party site can drop in with one `<script>` tag plus a `<div>`. It renders a "Wax Releases" calendar — paginatable by week — powered by the Waxstat API.

The standard embed snippet:

```html
<script>
  (function () {
    var s = document.createElement('script');
    s.src = 'https://waxstat-web-widget.vercel.app/widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>
<div id="waxstat-releases-widget" data-format="responsive"></div>
```

Once the loader runs, the widget self-initialises. The embedder writes nothing else.

## Architecture (must understand before changing anything)

```
embedder page  ─► widget.js           ─► widget-app.js (the React bundle)
                  (loader, ~2KB)         │
                                         ▼
                                      window.WaxstatWidget.render(container)
                                         │
                                         ▼
                                      fetch(`${widgetBase}/api/*`)
                                         │
                                         ▼
                                      Vercel serverless functions
                                      api/{boxes-search,box-details,scrape-releases}.js
                                         │
                                         ▼
                                      api.waxstat.com (REACT_APP_API_KEY held server-side)
```

Three deliberate choices, each load-bearing:

1. **`widget.js` resolves `widget-app.js` relative to its own `<script src>`.** Means the loader works from any deploy environment — prod, staging, localhost — without a hardcoded URL. See `public/widget.js`.

2. **`widget.js` exposes `window.__WAXSTAT_WIDGET_BASE__`** — the absolute URL of the widget host. The bundle reads this to:
   - Build absolute URLs to its own static assets (`waxstat-logo.svg`) so they resolve against the *widget host*, not the embedder.
   - Build absolute URLs to `/api/*` for the same reason.

   Helper: `src/lib/widgetBase.js` (`getWidgetBase()`, `widgetUrl(path)`, `isOnWidgetHost()`).

3. **All API traffic goes through this host's `/api/*` proxy.** Reasons:
   - The upstream API key stays server-side (never in the embedder's JS).
   - Avoids cross-origin requests to `api.waxstat.com` from arbitrary embedder origins (the upstream has no CORS).
   - Lets us add caching, rate-limiting, response shaping, etc. in one place.

   The bundle never imports `axios` or calls `api.waxstat.com` directly. Don't reintroduce that.

## Build pipeline

`package.json` chains two distinct builds into the top-level `build` script:

```
npm run build  →  build:app      (react-scripts build → build/static/js/main.*.js + index.html)
                  build:widget   (esbuild bundles src/widget-entry.js → build/widget-app.js)
```

- `build:widget` runs `scripts/build-widget.js`, which loads `.env.local` (then `.env`) and inlines all `REACT_APP_*` variables, matching CRA's behaviour. **If you add a `REACT_APP_*` var the bundle needs, the script already picks it up — just add the value to `.env.local` and Vercel project env.**
- The loader (`widget.js`) is a hand-written file in `public/`, copied verbatim by CRA to `build/`. Don't rewrite it as a bundle entry; keep it tiny and dependency-free.
- The bundle entry is `src/widget-entry.js`. It sets `window.WaxstatWidget = { render, init }` and auto-inits on `DOMContentLoaded`. Reads `data-format` off the container.

## Serverless `/api/*` conventions

Every handler in `api/` wraps its `export default` with `withCors` from `api/_cors.js`:

```js
import { withCors } from './_cors.js';
async function handler(req, res) { ... }
export default withCors(handler);
```

`withCors` sets `Access-Control-Allow-Origin: *`, the corresponding `-Methods`/`-Headers`, and short-circuits `OPTIONS` preflight with 204. Every new handler must use it or embedders will see CORS errors.

`api/box-details.js` deliberately **unwraps** the upstream's `{ boxes: [box] }` envelope so callers can read fields like `waxstat-avg` directly. Mirror this normalisation if you add similar endpoints.

## Local development

For widget dev *standalone* (no embedder):

```bash
npm start                    # CRA dev server on :3000, mounts <App />
```

For full embed dev (widget + API + a separate embedder origin):

```bash
npm run build                # produces build/widget.js, build/widget-app.js, etc.
node scripts/serve-local.js  # serves build/ AND mounts api/* handlers on :3141, with CORS
```

Then load the embedder (e.g. `waxstat-130point-demo` on `:3140`) with the env override:

```
NEXT_PUBLIC_WAXSTAT_WIDGET_URL=http://localhost:3141/widget.js
```

`scripts/serve-local.js` loads `.env.local` so the handlers have `REACT_APP_API_KEY` at runtime — same as Vercel.

## Brand-logo fallbacks

When a box's upstream product image (`https://slabstat-production.s3.amazonaws.com/Listings/<slug>.png`) 404s, `ReleaseCard.js` swaps the `<img>` src to a brand-matched fallback so the row never goes blank.

To add another brand, edit `BRAND_FALLBACKS` in `src/components/ReleaseCard.js`:

```js
const BRAND_FALLBACKS = [
  { match: /panini/i, url: 'https://slabstat-production.s3.amazonaws.com/Listings/box-panini-logo-…jpg' },
  // add new lines here
];
```

The matcher tests against `box.name + box.slug + box.id`. The `onError` handler is one-shot — if the fallback itself 404s, we hide the `<img>` and the row collapses to the 📦 emoji. Don't loop.

## Deploy

Vercel project: `waxstat/waxstat-web-widget`, repo `allanscu/waxstat-web-widget`, branch `main`.

Vercel runs `npm run build` (which chains `build:app && build:widget`) and serves `build/` as static + `api/` as serverless functions. **Every push to `main` is a production deploy** that every embedder loads on the next refresh — be deliberate about what you ship.

Env vars on Vercel (Project Settings → Environment Variables): `REACT_APP_API_KEY`, `REACT_APP_API_BASE_URL`, `REACT_APP_WAXSTAT_URL`. They're needed at **both** build time (CRA inlines them into `static/js/main.*.js`; our `build-widget.js` inlines them into `widget-app.js`) and runtime (the serverless handlers read `process.env.REACT_APP_API_KEY`).

## File layout

```
public/
  widget.js           hand-written loader (resolves widget-app.js + sets window.__WAXSTAT_WIDGET_BASE__)
  waxstat-logo.svg    used by the bundle via widgetUrl()
  …                   favicon, manifest, etc.

src/
  index.js            CRA standalone entry (mounts <App /> for npm start)
  App.js              wraps <AdminDashboard /> for the standalone admin page
  widget-entry.js     widget bundle entry — sets window.WaxstatWidget = { render, init }
  lib/
    widgetBase.js     getWidgetBase / widgetUrl / isOnWidgetHost helpers
  components/
    WidgetContainer.js   format → size matrix, wraps ReleasesWidget
    ReleasesWidget.js    week navigation, calls getWeekReleases
    ReleaseCard.js       single row, brand-logo fallback lives here
    PriceChart.js        unused by the embed today (still in tree)
  services/
    waxstatApi.js     all data fetching — always via widgetUrl('api/*')
  styles/
    brandColors.js    palette tokens (teal/onyx/ash)
  pages/
    AdminDashboard.js the standalone admin page (npm start)

api/                  Vercel serverless functions
  _cors.js            withCors wrapper — every handler must use this
  boxes-search.js     proxies /v1/boxes/search/<query>
  box-details.js      proxies /v1/boxes/<slug>, unwraps { boxes:[box] }
  scrape-releases.js  scrapes waxstat.com release-dates page for slugs

scripts/
  build-widget.js     esbuild + REACT_APP_* inlining → build/widget-app.js
  serve-local.js      static + /api/* dev server (mirror of the Vercel deployment)
```

## Open opportunities (not done yet)

- **Edge cache on `/api/*` responses.** Releases data changes ~daily. Adding `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400` to the three handler responses would let Vercel's edge serve 99% of embeds without hitting upstream. Biggest single win for scale.
- **More brand assets in `BRAND_FALLBACKS`.** Topps, Bowman, Upper Deck, Leaf, Fanatics, Pokémon — anything with consistent missing-image symptoms.
- **Per-origin API keys / rate limiting on `/api/*`.** Today all embedders share one upstream key. If abuse becomes a concern, the proxy is the natural place to gate it.
- **Drop unused deps.** `axios`, `recharts`, `cheerio`, `jsdom`, `http-proxy-middleware` are no longer used by the embedded bundle path. Worth auditing before the next version bump.
- **Tree-shake `widget-app.js`.** Currently ~240 KB minified. `PriceChart.js` and `AdminDashboard.js` are unreachable from `widget-entry.js`, so they should be excluded automatically — but worth confirming with a bundle inspector.

## Related repo

The demo embedder lives at `allanscu/waxstat-130point-demo` (deployed at `waxstat-130point-demo.waxstat.com`). It's a Next.js site that mounts the embed snippet above and includes an opt-in (`?debug=1`) network/console overlay for diagnosing embed issues.
