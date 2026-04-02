## 1. Project Setup

- [x] 1.1 Create `package.json` with `@bsv/sdk` as a dependency and a `build-tx` npm script
- [x] 1.2 Run `npm install` to install `@bsv/sdk`

## 2. Transaction Builder Script (`build-tx.js`)

- [x] 2.1 Parse and validate CLI arguments: WIF key, source txid, vout (int), satoshis (int) — exit with usage message if missing
- [x] 2.2 Derive `PrivateKey` and P2PKH address from the WIF argument using `@bsv/sdk`
- [x] 2.3 Construct the transaction input: spend the provided UTXO with a P2PKH unlocking template
- [x] 2.4 Add the `OP_VER` output: locking script `Script.fromASM('OP_VER')`, value 0 satoshis
- [x] 2.5 Compute change amount (input satoshis − 10 sat fee); exit with error if ≤ 0
- [x] 2.6 Add the P2PKH change output back to the derived address
- [x] 2.7 Sign the transaction and print the raw hex to stdout (all other messages to stderr)
- [x] 2.8 Test the script locally with a dummy UTXO to confirm it produces valid hex without errors

## 3. Webpage — HTML Structure

- [x] 3.1 Add an activation transaction status `<section>` to `index.html`, hidden by default (`style="display:none"`)
- [x] 3.2 Add inner elements: status label, status value (`id="tx-status"`), and a small "last check failed" notice (`id="tx-check-error"`, hidden by default)

## 4. Webpage — JavaScript

- [x] 4.1 Add `const ACTIVATION_TXID = '';` config constant near the top of `script.js` (empty = disabled)
- [x] 4.2 Implement `fetchTxStatus(txid)` — GET `https://api.whatsonchain.com/v1/bsv/main/tx/<txid>`; return `'not_broadcast'` (404), `'mempool'` (200, no blockheight), or `{ confirmed: true, blockheight }` (200, blockheight > 0); throw on unexpected errors
- [x] 4.3 Implement `renderTxStatus(status)` — updates `#tx-status` text: "Not yet broadcast" / "In mempool — awaiting confirmation" / "Confirmed in block <N>"
- [x] 4.4 Implement `startTxPolling(txid)` — polls every 30 seconds; stops when confirmed; handles errors by showing `#tx-check-error` and retaining last state
- [x] 4.5 On page load: if `ACTIVATION_TXID` is truthy, show the status section and call `startTxPolling(ACTIVATION_TXID)`

## 5. Webpage — Styling

- [x] 5.1 Style the activation transaction status box in `style.css` — consistent with block-info card style; add distinct colour for each status state (neutral / amber / green)

## 6. Verification

- [ ] 6.1 Set `ACTIVATION_TXID` to a known BSV mainnet txid and verify the status box shows the correct confirmed state
- [ ] 6.2 Set `ACTIVATION_TXID` to a non-existent txid and verify "Not yet broadcast" is shown
- [ ] 6.3 Verify the status box is completely hidden when `ACTIVATION_TXID` is empty
- [ ] 6.4 Run `node build-tx.js` with a real funded UTXO and confirm raw hex is printed; inspect hex with a BSV transaction decoder
