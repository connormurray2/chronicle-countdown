## ADDED Requirements

### Requirement: Display activation transaction status box
The webpage SHALL display a status box for the Chronicle activation transaction when `ACTIVATION_TXID` is set to a non-empty string. When `ACTIVATION_TXID` is empty or falsy, the box SHALL be hidden entirely.

#### Scenario: Status box visible when txid is configured
- **WHEN** `ACTIVATION_TXID` is set to a non-empty txid string
- **THEN** the activation transaction status box is rendered on the page

#### Scenario: Status box hidden when txid not configured
- **WHEN** `ACTIVATION_TXID` is an empty string or falsy
- **THEN** the activation transaction status section is not rendered

### Requirement: Poll WhatsOnChain for transaction confirmation
The page SHALL poll `https://api.whatsonchain.com/v1/bsv/main/tx/<ACTIVATION_TXID>` every 30 seconds. A 404 response means not yet broadcast; a 200 response with `blockheight` null, 0, or absent means in mempool; a 200 response with `blockheight > 0` means confirmed.

#### Scenario: Transaction not yet broadcast (404)
- **WHEN** WhatsonChain returns 404 for the txid
- **THEN** the status box shows "Not yet broadcast"

#### Scenario: Transaction in mempool
- **WHEN** WhatsonChain returns 200 with a null or missing blockheight
- **THEN** the status box shows "In mempool — awaiting confirmation"

#### Scenario: Transaction confirmed
- **WHEN** WhatsonChain returns 200 with a blockheight > 0
- **THEN** the status box shows "Confirmed in block <blockheight>" and polling stops

### Requirement: Stop polling after confirmation
Once the transaction is confirmed (blockheight > 0), the page SHALL stop polling and display the confirmed state permanently.

#### Scenario: Polling ceases after confirmation
- **WHEN** a poll response returns blockheight > 0
- **THEN** no further polling requests are made for the activation txid

### Requirement: Handle polling errors gracefully
If the WhatsonChain API returns an unexpected error (non-404, non-200), the status box SHALL retain its last known state and show a "check failed" note.

#### Scenario: API error during poll
- **WHEN** the poll request throws a network error or returns an unexpected status
- **THEN** the status box retains the previous state and shows a small "last check failed" indicator
