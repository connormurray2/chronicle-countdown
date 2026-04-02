## Context

Chronicle is a BSV protocol upgrade that activates at MainNet block height 943,816 (officially targeted for April 7, 2026 at noon UTC). The project is a greenfield static site — no existing codebase. The only external dependency is the WhatsOnChain public API, which provides chain info and block header data without authentication.

Current block height at time of writing: ~943,065 (~751 blocks remaining).

## Goals / Non-Goals

**Goals:**
- Display a live countdown to Chronicle activation (days, hours, minutes, seconds)
- Show current BSV block height vs target block height (943,816)
- Estimate activation datetime dynamically from live block timing data
- Auto-refresh periodically so the page stays current without a manual reload
- Deploy as a zero-dependency static file (open `index.html` in a browser, or host on any static CDN)

**Non-Goals:**
- Server-side rendering or backend API proxying
- User accounts, persistence, or any stateful features
- Build tooling, bundlers, or npm dependencies
- Mobile app or native wrapper
- Notification / push alerts

## Decisions

### 1. Pure static HTML/CSS/JS — no build tooling
**Decision**: Single `index.html` with inline or co-located `script.js` and `style.css`. No npm, no bundler, no framework.
**Rationale**: The site is a single-purpose, short-lived countdown page. A framework would add unnecessary overhead. A static file is trivially deployable to GitHub Pages, Netlify, S3, or just opened locally.
**Alternative considered**: React/Next.js — rejected as overkill for a single-page countdown.

### 2. WhatsOnChain public API for live data
**Decision**: Use `https://api.whatsonchain.com/v1/bsv/main/chain/info` for current block height and `https://api.whatsonchain.com/v1/bsv/main/block/headers/25` for recent block headers to compute average block time.
**Rationale**: Free, no authentication required, CORS-enabled for browser use. Provides the raw data needed to estimate block timing dynamically.
**Alternative considered**: Hardcoded block time (600s) — retained as a fallback but dynamic estimation is more accurate.

### 3. Dynamic block time estimation with static fallback
**Decision**: Compute average block time from the last 25 block headers (median time difference). Fall back to 600 seconds/block if the API is unavailable.
**Rationale**: Recent block times on BSV show high variance (observed range: 33s–2,022s over 9 recent blocks). Using a sample of 25 blocks smooths this out while remaining responsive to real hashrate changes. The fallback ensures the page is always useful even offline or if the API is rate-limited.
**Alternative considered**: Using only the last 10 blocks — too noisy given the high variance; 25 gives better statistical stability.

### 4. Polling interval: 60 seconds
**Decision**: Refresh block data every 60 seconds. The countdown timer ticks every second (client-side JS interval), but the API call happens once per minute.
**Rationale**: BSV average block time is ~10 minutes, so 60-second polling is more than sufficient to keep the estimate fresh without hammering the API.

### 5. Target datetime anchored to block height, not wall clock
**Decision**: The canonical target is block 943,816. The displayed datetime is always computed as `now + (blocksRemaining × avgBlockTime)` — it is an estimate, not a fixed date.
**Rationale**: Block times vary. Showing a dynamically updated estimate is more honest and useful than displaying a static "April 7 at noon" that may drift from reality. The official target date is shown as supplementary context.

## Risks / Trade-offs

- **API unavailability** → Fallback to 600s/block estimate. Page shows a notice that live data is unavailable.
- **CORS changes on WhatsOnChain** → Would break live data; fallback kicks in. Low probability as WoC has maintained CORS support for years.
- **Very fast or slow block times near activation** → Estimate could be off by hours. This is inherent to PoW variance and is expected; the page communicates it as an estimate.
- **Page accuracy after activation** → Once block 943,816 is mined, the countdown should flip to "Chronicle is LIVE!" The JS checks for `blocksRemaining <= 0` and renders an activated state.

## Migration Plan

1. Create `index.html` with all HTML structure, `style.css` for visual design, and `script.js` for data fetching and countdown logic
2. Test locally by opening `index.html` in a browser
3. Deploy to static hosting (GitHub Pages, Netlify, or similar)
4. No rollback needed — static file, no database or server state
