/**
 * Chronicle Activation Transaction Builder
 *
 * Builds a raw BSV transaction with an OP_VER output, which becomes valid
 * after the Chronicle protocol upgrade activates at block 943,816.
 *
 * Usage:
 *   node build-tx.js <WIF> <source_txid> <vout> <satoshis>
 *
 * Arguments:
 *   WIF          WIF-encoded private key for the funding address
 *   source_txid  TXID of the UTXO to spend (64 hex chars)
 *   vout         Output index of the UTXO to spend (non-negative integer)
 *   satoshis     Value of the UTXO in satoshis (positive integer)
 *
 * Output:
 *   Raw transaction hex is printed to stdout.
 *   All other messages go to stderr.
 *
 * Security note:
 *   Avoid passing WIF directly in the command line (it will appear in shell
 *   history). Prefer reading from a file:
 *     node build-tx.js "$(cat key.wif)" <txid> <vout> <satoshis>
 *
 * Transaction structure:
 *   Input 0:  P2PKH spend of the provided UTXO
 *   Output 0: OP_VER locking script (Chronicle activation), 0 satoshis
 *   Output 1: P2PKH change back to the same address, (satoshis - 10) satoshis
 */

import { Transaction, P2PKH, Script, PrivateKey } from '@bsv/sdk'

const FEE = 20 // satoshis
const ACTIVATION_OUTPUT_SATOSHIS = 5000000 // 0.05 BSV

const USAGE = `
Usage: node build-tx.js <WIF> <source_txid> <vout> <satoshis>

  WIF          WIF-encoded private key for the funding address
  source_txid  TXID of the UTXO to spend
  vout         Output index (integer, e.g. 0)
  satoshis     UTXO value in satoshis (integer, e.g. 10000)

Example:
  node build-tx.js L1... abc123...def 0 10000
`.trim()

// ── Argument parsing & validation ────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.length < 4) {
    process.stderr.write(USAGE + '\n')
    process.exit(1)
}

const [wif, sourceTxid, voutStr, satoshisStr] = args

const vout = parseInt(voutStr, 10)
if (!Number.isInteger(vout) || vout < 0) {
    process.stderr.write(`Error: vout must be a non-negative integer, got: ${voutStr}\n`)
    process.exit(1)
}

const inputSatoshis = parseInt(satoshisStr, 10)
if (!Number.isInteger(inputSatoshis) || inputSatoshis <= 0) {
    process.stderr.write(`Error: satoshis must be a positive integer, got: ${satoshisStr}\n`)
    process.exit(1)
}

const changeSatoshis = inputSatoshis - ACTIVATION_OUTPUT_SATOSHIS - FEE
if (changeSatoshis <= 0) {
    process.stderr.write(
        `Error: Insufficient funds. Input (${inputSatoshis} sat) must cover activation output (${ACTIVATION_OUTPUT_SATOSHIS} sat) + fee (${FEE} sat).\n`
    )
    process.exit(1)
}

// ── Transaction construction ─────────────────────────────────────────────────

try {
    const privKey = PrivateKey.fromWif(wif)
    const address = privKey.toAddress()
    const p2pkh = new P2PKH()

    // P2PKH locking script of the UTXO being spent (derived from the WIF key)
    const sourceLockingScript = p2pkh.lock(address)

    process.stderr.write(`Funding address : ${address}\n`)
    process.stderr.write(`Source UTXO     : ${sourceTxid}:${vout} (${inputSatoshis} sat)\n`)
    process.stderr.write(`Change output   : ${changeSatoshis} sat → ${address}\n`)
    process.stderr.write(`Fee             : ${FEE} sat\n`)
    process.stderr.write(`Building transaction...\n`)

    const tx = new Transaction()

    // Input: spend the provided P2PKH UTXO
    tx.addInput({
        sourceTXID: sourceTxid,
        sourceOutputIndex: vout,
        unlockingScriptTemplate: p2pkh.unlock(privKey, 'all', false, inputSatoshis, sourceLockingScript),
    })

    // Output 0: Chronicle activation locking script
    // OP_2 OP_VERIF OP_TRUE OP_ELSE OP_FALSE OP_ENDIF
    // Spendable by any transaction with version >= 2 (valid post-Chronicle at block 943,816)
    tx.addOutput({
        lockingScript: Script.fromASM('OP_2 OP_VERIF OP_TRUE OP_ELSE OP_FALSE OP_ENDIF'),
        satoshis: ACTIVATION_OUTPUT_SATOSHIS,
    })

    // Output 1: P2PKH change back to the funding address
    tx.addOutput({
        lockingScript: p2pkh.lock(address),
        satoshis: changeSatoshis,
    })

    await tx.sign()

    const hex = tx.toHex()
    process.stderr.write(`Transaction built successfully (${hex.length / 2} bytes)\n`)
    process.stderr.write(`\n--- RAW HEX (also on stdout) ---\n`)
    process.stderr.write(hex + '\n')

    // Print hex to stdout (only output on stdout)
    process.stdout.write(hex + '\n')

} catch (err) {
    process.stderr.write(`Error: ${err.message}\n`)
    process.exit(1)
}
