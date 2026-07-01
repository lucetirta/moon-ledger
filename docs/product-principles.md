# Moon Ledger Product Principles

## Product Thesis
Moon Ledger is built around the idea that personal finance feels clearer when obligations, claims, and cash are represented separately and explicitly. The product does not try to hide financial structure behind simplified metaphors.

## Product Vision
Moon Ledger is intended to become a universal personal finance application that can be used internationally.

- It is not intended to remain an Indonesia-only finance product.
- English is expected to become the default product language.
- Localization support is part of the long-term direction.
- Multi-currency support is part of the long-term direction, with exchange-rate handling reserved for future roadmap work.

## Current Product Principles
### 1. Cash is real, credit is conditional
The product distinguishes spendable balance from borrowing capacity. This is why credit cards are tracked through limits and liabilities rather than treated like ordinary cash accounts.

### 2. History matters
Once money has moved, the system becomes more restrictive about edits and deletion. This protects ledger trust.

### 3. Manual entry is acceptable if it stays fast
The app asks the user to enter data manually, but compensates with modal workflows, a global create button, and compact navigation.

### 4. Financial relationships should stay visible
Debt can create receivables. Shared subscriptions can create receivables. Credit-backed subscriptions can reserve card usage. These links are product features because they expose how financial commitments interact.

### 5. Alerts should be practical, not noisy
The dashboard focuses on immediate concerns such as near-due debts and high card utilization rather than broad analytics.

### 6. Private finance should not require infrastructure
The current implementation assumes a user should be able to run the app without authentication, servers, or subscriptions.

### 7. Recurrent spending deserves first-class treatment
Subscriptions are not hidden as ordinary expenses. They are modeled explicitly because recurring commitments behave differently from one-off transactions.

### 8. Shared costs should become collectible claims
The product treats shared subscription costs as structured receivables rather than informal notes.

## Product Tradeoffs
The current design makes several deliberate tradeoffs:

- It favors control over automation.
- It favors integrity over flexible editing.
- It favors portability over collaboration.
- It favors a tight operational core over a broad feature surface.

## Likely Decision Rationale
The architecture and rules suggest these decisions were made to avoid the usual failure modes of lightweight finance tools:

- hidden state drift
- ambiguous credit handling
- recurring costs disappearing into generic expenses
- backup dependence on remote services

## Assumptions
- The intended user is comfortable thinking in balances, debts, and claims rather than only monthly budgets.
- The product appears designed for continuity of use more than for showcase analytics or onboarding-heavy consumer polish.
- The current Indonesian wording exists because the product is still being actively developed by an Indonesian developer, not because the product vision is market-limited to Indonesia.
