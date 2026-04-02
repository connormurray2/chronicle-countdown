## Context

Chronicle's activation transaction is a BSV MainNet transaction that contains an `OP_VER` output script — an opcode that becomes valid only after the Chronicle protocol upgrade at block 943,816. Constructing this transaction before activation proves intent and formally locks in the ruleset.

The project already has a static countdown webpage (`index.html` / `script.js`). This change adds two independent things: a one-time Node.js script to build the raw transaction, and a new status section on the webpage.

The BSV SDK to use is `@bsv/sdk` (the official TypeScript/JavaScript SDK). The `@bsv/simple` layer wraps it for wallet abstractions but does not expose raw script construction — `@bsv/sdk` must be used directly.

## Goals / Non-Goals

**Goals:**
- Produce a Node.js script that, given a funded UTXO, outputs a valid raw BSV transaction hex containing an `OP_VER` locking script
- Add a webpage status box that polls WhatsOnChain every 30 seconds for the known activation txid and shows: unconfirmed / in mempool / confirmed
- The txid is a static config constant — it is known after the transaction is generated and set before deploying the updated webpage

**Non-Goals:**
- Broadcasting the transaction from code (user does this manually)
- Key management or wallet integration beyond a single WIF private key input
- Supporting multiple UTXOs or change outputs (one input → one OP_VER output is sufficient)
- Building the transaction in the browser

## Decisions

### 1. Use `@bsv/sdk` directly for transaction construction
**Decision**: Import `Transaction`, `P2PKH`, `Script`, and `PrivateKey` from `@bsv/sdk`. No wrapper libraries.
**Rationale**: `@bsv/simple` does not expose raw script construction or opcode access. `OP_VER` (opcode `0x62`) requires building a locking script manually. `@bsv/sdk` provides `Script.fromASM('OP_VER')` or `new Script([{ op: 0x62 }])` for this purpose.
**Alternative**: bsv (legacy BSV library) — rejected; `@bsv/sdk` is the current official SDK.

### 2. Transaction structure: one P2PKH input, one OP_VER output, one change output
**Decision**: The script takes a WIF private key and UTXO details (txid, vout, satoshis) as CLI arguments. It builds: input (P2PKH unlock from WIF), output 1 (OP_VER locking script, 0 satoshis), output 2 (P2PKH change back to the same address, remainder minus fee).
**Rationale**: Minimal structure that satisfies the requirement. A dust-value OP_VER output plus a change output keeps the transaction valid and fee-covered.
**Fee**: Use a fixed fee of 10 satoshis (extremely low-fee chain) — or compute from 1 sat/byte × estimated size.

### 3. Separate `package.json` for the builder script only
**Decision**: Add `package.json` with `@bsv/sdk` as a dependency. The webpage remains dependency-free.
**Rationale**: The builder is a one-shot development tool. The countdown webpage must remain a static file with no bundler.

### 4. Txid as a config constant in `script.js`
**Decision**: Add `const ACTIVATION_TXID = '<txid>';` near the top of `script.js`. A falsy value (`''` or `null`) disables the status box.
**Rationale**: The txid is known before the page goes live. A config constant is simpler than a URL param and safer than a user-editable field.

### 5. WhatsOnChain `GET /v1/bsv/main/tx/<txid>` for status polling
**Decision**: A 404 response means not yet broadcast; a 200 response with `blockheight` null or 0 means in mempool; a 200 response with `blockheight > 0` means confirmed.
**Rationale**: Same API domain already in use for chain info. No extra CORS configuration needed. Poll every 30 seconds; stop polling once confirmed.

## Risks / Trade-offs

- **`OP_VER` output may be non-standard** → Pre-Chronicle nodes may reject the transaction as non-standard. This is expected and acceptable — the tx is intended to be mined post-activation at block 943,816.
- **WIF key passed as CLI arg** → Shows in shell history. Mitigation: document using an environment variable or piping from a file (`node build-tx.js --wif $(cat key.txt)`).
- **Hardcoded txid** → If the transaction is replaced or re-broadcast with a different txid, the webpage must be manually updated. This is acceptable for a one-off activation event.
- **WoC API rate limiting** → 30-second polling with a single txid lookup is well within free-tier limits.
