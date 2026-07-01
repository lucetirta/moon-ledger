# Moon Ledger Business Rules

## Rule Philosophy
Moon Ledger prioritizes ledger integrity over unrestricted CRUD. Once a financial object has participated in money movement, the app often prevents destructive edits or deletion. This is a product choice, not just an implementation detail.

## Current Development Context Versus Product Vision
- Current validation messages and labels often appear in Indonesian because of the present development environment.
- Current money presentation is effectively single-currency and Rupiah-oriented.
- Neither of those facts should be read as permanent business rules for the future product.
- The long-term product vision is international, with English as the default language and localization plus multi-currency support as future capabilities.

## Categories
- Default categories are created when no categories exist.
- Category names must be unique, case-insensitively.
- Categories can be typed as `all`, `income`, or `expense`.
- Categories already used by transactions cannot be deleted.
- Debt creation uses expense-compatible categories.
- Subscription creation uses categories available to `all` flows.

## Accounts
### Supported account types
- `Bank`
- `E-Wallet`
- `Cash`
- `Credit Card`

### Liquid account rules
- Liquid accounts store `balance`.
- Balance cannot become negative through direct edits or transaction application.
- If a liquid account has transaction or debt references, its stored balance becomes effectively locked against manual editing.

### Credit card rules
- Credit cards store `creditLimit` and `usedLimit`.
- `usedLimit` cannot be negative.
- `usedLimit` cannot exceed `creditLimit`.
- Once referenced by transactions or debts, card limit fields are effectively locked from manual adjustment.
- Credit cards are not treated as cash accounts for transfers, debt payments, or receivable collection.

### Deletion rules
- Accounts cannot be deleted if referenced by transactions.
- Credit cards cannot be deleted if linked to debt records.

## Transactions
### General rules
- Amount must be greater than zero.
- Transactions are date-based and default to today.
- Editing a transaction first reverses the prior financial impact, then applies the new version.
- Deleting a transaction also attempts to reverse its financial impact.

### Income
- Income increases a liquid account balance.
- A category is required.
- Current save logic rejects credit-card accounts for income.

### Expense
- Expense decreases a liquid account balance.
- A category is required.
- Current save logic rejects credit-card accounts for expense.

Note:
The transaction form can present credit cards in the expense account selector, but the save handler blocks them. Future contributors should treat the blocking rule as the source of truth because it preserves the app's credit-as-liability model.

### Transfer
- Transfers move money between two distinct liquid accounts.
- Source and destination must differ.
- Credit cards are not valid transfer endpoints.
- Transfers do not affect net worth.

### Debt payment
- Debt payments reduce a debt's `remaining` amount.
- Debt payments also reduce the paying account balance.
- Paying account must be a liquid account.
- Payment cannot exceed debt remaining balance.
- If the debt is a credit-card debt, the linked card's `usedLimit` is reduced.
- Payment history is recorded both on the debt and in the transaction log.

### Receivable collection
- Receivable payments reduce a receivable's `remaining` amount.
- Collected money increases a liquid account balance.
- Receiving account must be a liquid account.
- Payment cannot exceed receivable remaining balance.
- For subscription-sharing receivables, a member selection is required.
- Member-level payment state is updated as money is collected.

## Debts
### Debt types
- `regular`
- `credit_card`

### Creation and editing rules
- Debt name is required.
- Total debt must be greater than zero.
- Category is required.
- Credit-card debt requires a selected credit card.
- Once repayment has started, total debt cannot be changed unless the remaining amount still equals the total.

### Credit-card debt and borrower logic
- A credit-card debt may optionally capture `borrower` and `owner`.
- If owner is `another` and a borrower name exists, the app automatically creates a linked receivable for the borrowed amount.
- If that owner/borrower condition is later removed, the linked receivable is removed.

### Deletion rules
- Debts with payment history cannot be deleted.
- Debts linked to partially collected receivables cannot be deleted.
- Deleting an unpaid credit-card debt releases reserved card usage.

## Receivables
### Receivable types
- `regular`
- `subscription_sharing`

### Creation and editing rules
- Regular receivables require a name.
- Total receivable must be greater than zero.
- Subscription-sharing receivables require a selected subscription.
- For subscription-sharing receivables, total must equal the subscription total cost.
- Once collection has started, total cannot be changed unless remaining still equals total.

### Deletion rules
- Receivables with collection history cannot be deleted.
- Deleting a subscription-sharing receivable clears the subscription link.

## Subscriptions
### Subscription categories
- `personal`
- `sharing`

### Billing cycles
- `monthly`
- `yearly`

### Statuses currently used in UI
- `active`
- `paused`
- `canceled`

### Creation and editing rules
- Name is required.
- Category is required.
- Total cost must be greater than zero.
- Sharing subscriptions require a positive `maxMembers` value.
- Sharing subscriptions may include members during creation.

### Shared subscription rules
- Members have `shareAmount`, payment state, and amount paid.
- A subscription-sharing receivable is auto-created or updated when members exist.
- Member payments flow through receivable collection and optionally into subscription payment history.

### Credit-backed subscription rules
- If a subscription is tied to a credit-card account and is active, the card's `usedLimit` is reserved against the subscription total.
- Updating card, cost, or status attempts to rebalance that reserved amount safely.

## Dashboard Rules
- Net worth is calculated as cash and bank balances plus receivables minus debts.
- Credit limit is not counted as an asset.
- The dashboard surfaces alerts for:
  - credit cards above 80% utilization
  - debts due within the next 7 days
- Recent transactions show the latest five items.

## Data Management Rules
- Export writes the full in-memory database to JSON.
- Import replaces current data after confirmation and then runs migration.
- Delete-all clears all collections.

## Currency Scope Today
- Current financial rules behave as if all values live in one shared working currency.
- There is no current exchange-rate handling, currency-specific account typing, or per-transaction currency metadata.
- Future multi-currency support should extend these rules without weakening existing balance integrity guarantees.

## Assumptions
- The product intentionally treats card spending as debt-driven rather than allowing ordinary expense posting against credit accounts.
- Blocking edits after financial activity begins is an intentional auditability guard, not a temporary constraint.
