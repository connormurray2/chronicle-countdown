## Why

The Chronicle protocol upgrade activates on the BSV Blockchain at block height 943,816 — a significant milestone for the ecosystem. A public countdown page gives the community a clear, real-time view of how close activation is, creating anticipation and awareness around the launch.

## What Changes

- New static webpage (`index.html`) that displays a live countdown to Chronicle activation
- Client-side JavaScript that fetches the current BSV block height from the WhatsOnChain public API and dynamically estimates the remaining time
- Estimated activation time calculated from blocks remaining × dynamic average block time (fetched from recent block headers)
- Visual display of: countdown timer, current block height, target block height (943,816), and estimated activation datetime
- Deployable as a simple static site (no server required)

## Capabilities

### New Capabilities
- `countdown-display`: The core countdown UI — shows time remaining, current block, target block, and estimated activation date/time, updating periodically
- `block-time-estimator`: Fetches current chain info and recent block headers from the WhatsOnChain API to compute average block time and project the activation timestamp

### Modified Capabilities
<!-- none — this is a greenfield project -->

## Impact

- **New files**: `index.html`, `style.css` (optional), inline or separate `script.js`
- **External dependency**: WhatsOnChain public API (`api.whatsonchain.com/v1/bsv/main/`) — no API key required
- **Target block**: 943,816 (Chronicle MainNet activation height)
- **Official estimated activation**: April 7, 2026 at noon UTC (per BSV documentation)
- No backend, build tooling, or package manager required — pure static HTML/CSS/JS
