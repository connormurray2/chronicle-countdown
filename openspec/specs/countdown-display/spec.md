## ADDED Requirements

### Requirement: Display countdown to Chronicle activation
The page SHALL display a live countdown showing the time remaining until BSV block height 943,816 is estimated to be reached. The countdown SHALL show days, hours, minutes, and seconds. The displayed time SHALL update every second using a client-side interval timer.

#### Scenario: Countdown visible on page load
- **WHEN** the user opens the page
- **THEN** a countdown timer is displayed showing days, hours, minutes, and seconds remaining

#### Scenario: Countdown ticks every second
- **WHEN** the page is open
- **THEN** the seconds field decrements by one each second and cascades into minutes, hours, and days as appropriate

### Requirement: Display current and target block heights
The page SHALL show the current BSV block height (fetched from the WhatsOnChain API) and the target block height (943,816) with the number of blocks remaining.

#### Scenario: Block heights displayed
- **WHEN** the page has fetched chain data successfully
- **THEN** the current block height, target block height (943,816), and blocks remaining are all visible on the page

#### Scenario: Blocks remaining updates on refresh
- **WHEN** the API data is refreshed (every 60 seconds)
- **THEN** the current block height and blocks remaining values update to reflect the new data

### Requirement: Show estimated activation datetime
The page SHALL display the estimated activation datetime in a human-readable format (e.g., "April 7, 2026 at 12:00 UTC") computed from the current estimate. The page SHALL make clear this is an estimate, not a guaranteed time.

#### Scenario: Estimated datetime shown
- **WHEN** block data is available
- **THEN** the estimated activation date and time is displayed with a label indicating it is an estimate

### Requirement: Display Chronicle activated state
When the current block height meets or exceeds 943,816, the page SHALL replace the countdown with an "activated" message indicating Chronicle is live.

#### Scenario: Countdown replaced after activation
- **WHEN** the current block height is >= 943,816
- **THEN** the countdown is hidden and a "Chronicle is LIVE!" message is displayed

#### Scenario: Activation detected on data refresh
- **WHEN** a periodic data refresh returns a block height >= 943,816
- **THEN** the page immediately transitions to the activated state

### Requirement: Show data unavailability notice
When the API cannot be reached, the page SHALL display a notice indicating live data is unavailable and SHALL fall back to a static 600-second-per-block estimate.

#### Scenario: API unavailable on load
- **WHEN** the WhatsOnChain API returns an error on initial load
- **THEN** a notice is shown that live data is unavailable and the countdown uses the 600s/block fallback estimate

#### Scenario: API unavailable on refresh
- **WHEN** a periodic refresh fails
- **THEN** the page retains the last known data and shows a "data last updated at <time>" indicator

### Requirement: Show activation transaction status section
The page SHALL include a dedicated section for the activation transaction status box, rendered below the block info section. This section is controlled by the `activation-tx-status` capability and SHALL be hidden by default (when no txid is configured).

#### Scenario: Section present in DOM
- **WHEN** the page loads
- **THEN** an activation transaction status container element exists in the DOM

#### Scenario: Section hidden when txid not set
- **WHEN** `ACTIVATION_TXID` is empty
- **THEN** the activation transaction section is not visible to the user
