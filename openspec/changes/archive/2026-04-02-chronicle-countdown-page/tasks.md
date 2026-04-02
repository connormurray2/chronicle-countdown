## 1. Project Structure

- [x] 1.1 Create `index.html` with semantic HTML skeleton (head, body, main sections)
- [x] 1.2 Create `style.css` with base styles and layout
- [x] 1.3 Create `script.js` as the entry point for all JavaScript logic

## 2. Block Time Estimator

- [x] 2.1 Implement `fetchChainInfo()` — GET `https://api.whatsonchain.com/v1/bsv/main/chain/info`, return current block height
- [x] 2.2 Implement `fetchRecentHeaders()` — GET `https://api.whatsonchain.com/v1/bsv/main/block/headers/25`, return array of block timestamps
- [x] 2.3 Implement `computeAvgBlockTime(headers)` — compute mean inter-block time in seconds from header timestamps; return 600 if headers unavailable
- [x] 2.4 Implement `estimateActivation(currentHeight, avgBlockTime)` — returns `{ blocksRemaining, estimatedTimestamp, isActive }` for target block 943,816
- [x] 2.5 Implement `startDataRefresh(callback, intervalMs=60000)` — calls `callback` with fresh estimates every 60 seconds and immediately on start

## 3. Countdown Display

- [x] 3.1 Implement `startCountdownTimer(getTargetTimestamp)` — ticks every second, computes `{ days, hours, minutes, seconds }` from remaining ms, calls a render function
- [x] 3.2 Implement `renderCountdown({ days, hours, minutes, seconds })` — updates the countdown DOM elements
- [x] 3.3 Implement `renderBlockInfo({ currentHeight, blocksRemaining, estimatedDateStr })` — updates block height and estimated activation date in the DOM
- [x] 3.4 Implement `renderActivated()` — hides countdown, shows "Chronicle is LIVE!" message
- [x] 3.5 Implement `renderApiNotice(isLive, lastUpdated)` — shows/hides the data unavailability notice and last-updated timestamp

## 4. HTML Structure

- [x] 4.1 Add countdown display section: four labeled boxes for days, hours, minutes, seconds
- [x] 4.2 Add block info section: current block, target block (943,816), blocks remaining, estimated activation datetime
- [x] 4.3 Add Chronicle context section: brief description of what Chronicle is and a link to the official docs
- [x] 4.4 Add API status / last-updated indicator in the footer

## 5. Styling

- [x] 5.1 Style countdown boxes — large, prominent digits with labels
- [x] 5.2 Style block info section — clear hierarchy between current/target/remaining
- [x] 5.3 Style activated state — visually distinct celebration/confirmation message
- [x] 5.4 Ensure readable layout on desktop and mobile (responsive CSS)

## 6. Wiring & Integration

- [x] 6.1 Wire `startDataRefresh` to update the target timestamp used by the countdown timer
- [x] 6.2 On data refresh, check `isActive` and call `renderActivated()` if Chronicle has activated
- [x] 6.3 Handle API errors gracefully — catch fetch errors, fall back to 600s/block, show API notice
- [x] 6.4 On page load, initialize with a static estimate (600s/block × blocks-since-now) before first API call returns

## 7. Testing & Verification

- [ ] 7.1 Open `index.html` locally and verify countdown ticks correctly
- [ ] 7.2 Verify block height and estimated date update after 60 seconds
- [ ] 7.3 Simulate API failure (disable network) and confirm fallback estimate and notice display
- [ ] 7.4 Temporarily set target block to current height − 1 and verify activated state renders
