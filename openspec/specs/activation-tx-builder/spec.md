## ADDED Requirements

### Requirement: Accept UTXO and key via CLI arguments
The script SHALL accept the following command-line arguments: WIF private key, source txid, source output index (vout), and source output value in satoshis. All four arguments are required; the script SHALL exit with a non-zero code and usage message if any are missing.

#### Scenario: All arguments provided
- **WHEN** the script is run with WIF, source txid, vout, and satoshis arguments
- **THEN** the script proceeds to build and sign the transaction

#### Scenario: Missing argument
- **WHEN** the script is run with fewer than four required arguments
- **THEN** the script prints a usage message to stderr and exits with code 1

### Requirement: Build a transaction with a P2PKH input
The script SHALL construct a BSV transaction with one input spending the provided UTXO using a standard P2PKH unlocking script derived from the WIF private key.

#### Scenario: Input constructed from WIF and UTXO
- **WHEN** valid WIF and UTXO details are provided
- **THEN** the transaction includes one input spending the specified UTXO with a valid P2PKH unlocking script

### Requirement: Include an OP_VER locking script output
The script SHALL add an output to the transaction with a locking script consisting solely of `OP_VER` (opcode `0x62`) and a value of 0 satoshis.

#### Scenario: OP_VER output present in transaction
- **WHEN** the transaction is built
- **THEN** the first output has a locking script of exactly `OP_VER` and a satoshi value of 0

### Requirement: Include a change output
The script SHALL add a P2PKH change output back to the address derived from the WIF key. The change amount SHALL be the input satoshis minus a fixed fee of 10 satoshis.

#### Scenario: Change output calculated correctly
- **WHEN** the input is 1000 satoshis
- **THEN** the change output has a value of 990 satoshis locked to the P2PKH address from the WIF key

#### Scenario: Insufficient funds for fee
- **WHEN** the input satoshis is 10 or fewer
- **THEN** the script exits with an error indicating insufficient funds

### Requirement: Sign and output raw transaction hex
The script SHALL sign the transaction and print the raw serialized transaction hex to stdout. No other output SHALL be written to stdout (informational messages go to stderr).

#### Scenario: Raw hex printed to stdout
- **WHEN** the transaction is successfully built and signed
- **THEN** the raw transaction hex string is the only output on stdout

#### Scenario: Signing error
- **WHEN** signing fails (e.g., invalid WIF)
- **THEN** an error message is printed to stderr and the script exits with a non-zero code
