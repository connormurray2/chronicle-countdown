## ADDED Requirements

### Requirement: Fetch current block height from WhatsOnChain
The estimator SHALL fetch the current BSV MainNet block height from `https://api.whatsonchain.com/v1/bsv/main/chain/info` and expose it to the countdown display.

#### Scenario: Successful chain info fetch
- **WHEN** the estimator requests chain info from WhatsOnChain
- **THEN** the current block height is extracted from the `blocks` field of the response

#### Scenario: Chain info fetch fails
- **WHEN** the HTTP request to the chain info endpoint fails or returns a non-200 status
- **THEN** the estimator signals an error and the display falls back to the last known block height (or 0 if none)

### Requirement: Compute average block time from recent headers
The estimator SHALL fetch the most recent 25 block headers from `https://api.whatsonchain.com/v1/bsv/main/block/headers/25` and compute the average inter-block time in seconds from their timestamps.

#### Scenario: Average block time computed from headers
- **WHEN** 25 recent block headers are successfully fetched
- **THEN** the estimator computes the mean time difference between consecutive block timestamps and returns the result in seconds

#### Scenario: Headers fetch fails
- **WHEN** the headers endpoint returns an error
- **THEN** the estimator returns a fallback block time of 600 seconds

### Requirement: Estimate activation timestamp
Given the blocks remaining (943,816 minus current height) and the average block time in seconds, the estimator SHALL compute an estimated activation timestamp as `Date.now() + (blocksRemaining × avgBlockTime × 1000)`.

#### Scenario: Activation timestamp computed
- **WHEN** blocks remaining > 0 and average block time is known
- **THEN** the estimated activation timestamp is returned as a Unix timestamp in milliseconds

#### Scenario: Already activated
- **WHEN** the current block height >= 943,816
- **THEN** the estimator returns blocks remaining = 0 and signals that Chronicle is already active

### Requirement: Periodic refresh
The estimator SHALL re-fetch chain data every 60 seconds and notify the display layer with updated values.

#### Scenario: Data refreshes automatically
- **WHEN** 60 seconds have elapsed since the last successful fetch
- **THEN** the estimator re-fetches both chain info and block headers and updates all derived values

#### Scenario: Refresh does not reset the countdown timer
- **WHEN** a data refresh completes
- **THEN** only the target timestamp is updated; the second-by-second countdown timer continues uninterrupted
