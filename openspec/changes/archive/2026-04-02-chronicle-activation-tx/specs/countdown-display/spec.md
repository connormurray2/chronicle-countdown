## ADDED Requirements

### Requirement: Show activation transaction status section
The page SHALL include a dedicated section for the activation transaction status box, rendered below the block info section. This section is controlled by the `activation-tx-status` capability and SHALL be hidden by default (when no txid is configured).

#### Scenario: Section present in DOM
- **WHEN** the page loads
- **THEN** an activation transaction status container element exists in the DOM

#### Scenario: Section hidden when txid not set
- **WHEN** `ACTIVATION_TXID` is empty
- **THEN** the activation transaction section is not visible to the user
