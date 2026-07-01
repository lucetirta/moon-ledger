# Moon Ledger Finance Engine

## Purpose
The finance engine in Moon Ledger is the collection of mutation and calculation rules that keep balances, liabilities, receivables, and subscription obligations internally consistent.

It is not a full accounting engine. It is a constrained personal-finance ledger designed around explicit balance mutation and defensive validation.

## Current Development Environment Versus Product Vision
- The current implementation formats values as Rupiah and assumes one working currency in practice.
- This reflects the current development state, not the intended permanent market scope.
- The long-term product vision is an international personal finance application with future multi-currency support.

## Core Financial Model
Moon Ledger splits financial state into four practical buckets:

- Liquid funds: balances in bank, cash, and e-wallet accounts.
- Liabilities: debts and credit card used limits.
- Incoming claims: receivables.
- Recurring obligations: subscriptions.

This separation is central to the product. Credit availability is tracked, but unused credit is not considered wealth.

## Primary Derived Metrics
### Net worth
Current formula:

`netWorth = cash + receivables - debts`

Where:

- `cash` is the sum of all non-credit-card account balances.
- `receivables` is the sum of all receivable `remaining` values.
- `debts` is the sum of all debt `remaining` values.

Implication:
Credit card limits and used limits influence attention reporting and available credit, but they are not directly added to or subtracted from net worth unless represented through debt or payment flows.

Current scope note:
This formula currently assumes a single working currency context. Future multi-currency support would require normalization rules before cross-currency totals can be presented safely.

### Available credit
Current formula:

`availableCredit = totalCreditLimit - totalUsedLimit`

This is shown as a liquidity-adjacent planning metric, not as a balance.

## Mutation Rules
### Liquid account mutation
`adjustAccountBalance(account, delta)`:

- Applies a positive or negative balance delta.
- Rejects the mutation if the account is a credit card.
- Rejects the mutation if the resulting balance would be negative.

This helper is the main guardrail against accidental negative cash positions.

### Credit card mutation
`adjustCreditUsed(card, delta)`:

- Adds or subtracts from `usedLimit`.
- Rejects negative `usedLimit`.
- Rejects values above `creditLimit`.

This models card utilization as bounded obligation capacity.

## Transaction Application Model
### Income
- Adds amount to a liquid account.

### Expense
- Subtracts amount from a liquid account.

### Transfer
- Subtracts from one liquid account.
- Adds to another liquid account.
- Produces no net-worth change.

### Debt payment
- Subtracts from the paying liquid account.
- Reduces debt remaining balance.
- If the debt is card-backed, also reduces card `usedLimit`.

### Receivable payment
- Adds to the receiving liquid account.
- Reduces receivable remaining balance.
- If tied to subscription sharing, also updates member-level payment progress.

## Reversal Engine
Before editing or deleting a transaction, Moon Ledger calls `reverseTransaction(tx)`.

This is one of the most important parts of the finance engine because it restores prior state before a mutation is reapplied.

Supported reversal paths:

- Transfer reversal returns money from destination to source.
- Income reversal removes prior added cash.
- Expense reversal restores prior deducted cash.
- Debt payment reversal restores paying account balance and may restore card usage.
- Receivable payment reversal removes received cash and restores receivable remaining balance.

Design rationale:
This avoids hidden drift when transactions are edited after the fact.

## Debt Engine
Debts track both total obligation and current unpaid amount.

Derived concepts:

- `paid = total - remaining`
- progress percentage = `paid / total`
- monthly installment estimate = `round(total / tenor)` when tenor exists

Due-date behavior:

- Debts may include a `dueDay`.
- The dashboard flags debts due within seven days.
- Debt cards classify status from remaining amount and current day-of-month.

## Receivable Engine
Receivables track both total amount due and current unpaid remainder.

Derived concepts:

- `collected = total - remaining`
- progress percentage = `collected / total`

For subscription-sharing receivables, the engine additionally tracks member-level contributions.

## Subscription Engine
Subscriptions are the most composite financial object in the app.

They combine:

- recurring obligation metadata
- optional member-sharing structure
- optional receivable generation
- optional credit-card utilization reservation

### Shared subscription total
`subscriptionReceivableTotal(sub)` currently resolves to:

- the sum of member share amounts, if present
- otherwise the subscription total cost

### Auto-generated receivable
`ensureSubscriptionReceivable(sub)`:

- creates a receivable when a sharing subscription has members
- links the receivable back to the subscription
- updates total and remaining values when safe to do so

### Credit reservation
`reserveSubscriptionCredit(sub, previousTotal, previousCardId, previousStatus)`:

- reserves card utilization when an active subscription is backed by a credit card
- releases reservation when card backing or active status is removed
- rebalances reservation when cost or backing changes

This is effectively a lightweight commitment engine for recurring card obligations.

## Audit Trail Structures
Moon Ledger stores auxiliary histories in addition to the main transaction list:

- `debt.paymentHistory`
- `receivable.collectionHistory`
- `subscription.paymentHistory`

These histories are useful because they preserve domain-specific context that the generic transaction list alone does not fully express.

## Alert Engine
The dashboard currently raises attention items for:

- credit cards above 80% utilization
- debts with a `dueDay` falling within the next seven days

This keeps the dashboard action-oriented rather than purely descriptive.

## Known Implementation Nuances
- Expense account options may display credit cards even though save validation rejects them.
- Subscription status normalization accepts a `due` value during migration, but the current creation/edit UI exposes only `active`, `paused`, and `canceled`.
- The demo data seed path mutates the in-memory database but does not currently call the normal save/render cycle.
- Currency handling is currently single-currency in practice even though the long-term product direction should remain open to multi-currency support.

These are important for future engineering work because they affect how faithfully the UI reflects the underlying rules.

## Assumptions
- The finance engine is intentionally conservative and avoids inferred automation whenever money balances could become ambiguous.
- The product appears to value explainable state transitions more than feature breadth.
- Exchange-rate handling should be treated as future roadmap work rather than an implied current engine capability.
