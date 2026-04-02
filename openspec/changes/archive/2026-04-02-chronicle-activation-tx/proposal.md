## Why

Chronicle requires an "activation transaction" — a BSV transaction containing an `OP_VER` output — to formally lock in the Chronicle ruleset on MainNet. This transaction must be constructed before block 943,816 and broadcast to the network. The countdown webpage should also show whether the activation transaction has been confirmed, giving the community real-time visibility into readiness.

## What Changes

- New standalone Node.js script (`build-tx.js`) that constructs a raw BSV transaction with a P2PKH input (from a funded address) and an `OP_VER` locking script output, signs it, and prints the raw hex to stdout
- New section on the countdown webpage that displays the activation transaction status (pending broadcast / seen in mempool / confirmed) by polling the WhatsOnChain API for a known txid
- The txid will be known at build time (provided by the user after generating the transaction); it is stored as a config constant in `script.js`

## Capabilities

### New Capabilities
- `activation-tx-builder`: The Node.js script that builds and signs the raw Chronicle activation transaction using `@bsv/sdk`
- `activation-tx-status`: The webpage component that polls WhatsOnChain for confirmation status of the activation transaction txid and renders a status indicator

### Modified Capabilities
- `countdown-display`: Adds an activation transaction status box to the existing countdown page UI

## Impact

- **New file**: `build-tx.js` (run once, offline, to produce the raw tx hex)
- **New file**: `package.json` (minimal, only needed for the builder script — `@bsv/sdk` dependency)
- **Modified files**: `index.html` (new activation tx status section), `script.js` (new polling logic + txid config constant)
- **External dependency**: `@bsv/sdk` (BSV TypeScript SDK) — Node.js only, not bundled into the webpage
- **External API**: WhatsOnChain `GET /v1/bsv/main/tx/<txid>` — same origin as existing API calls
- Existing countdown functionality is unaffected
