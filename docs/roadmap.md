# Moon Ledger Roadmap

## Purpose
This roadmap separates what is already implemented, what appears partially implemented or in progress, and what would be logical future expansion based on the current product direction.

## Completed Features
### Core application foundation
- Static single-page app architecture.
- Local persistence with `localStorage`.
- Startup migration and data normalization.
- Responsive desktop and mobile navigation.

### Finance modules
- Accounts management for liquid accounts and credit cards.
- Transactions for income, expense, transfer, debt payment, and receivable payment.
- Debt management with category, tenor, due-day, and payment history concepts.
- Receivable management with collection history.
- Subscription management for personal and shared subscriptions.

### Cross-entity finance behaviors
- Credit utilization tracking.
- Debt-payment impact on card utilization.
- Auto-created receivable for certain borrowed credit-card debt scenarios.
- Auto-created receivable for shared subscriptions with members.
- Member-level payment tracking for shared subscriptions.
- Transaction reversal before edit or delete.

### Dashboard and UX
- Net worth hero with expandable breakdown.
- Financial overview cards.
- Need-attention alerts.
- Recent transactions preview.
- Global floating action button for create flows.

### Settings and data management
- Category management.
- JSON export backup.
- JSON import backup.
- Full data deletion.

## In Progress Or Partially Surfaced
These items exist in code or data structures but are not fully surfaced or fully hardened in the current product experience.

### Subscription member management after initial creation
- A dedicated add-member modal and handler exist.
- The current HTML does not expose a visible trigger button for opening that modal.
- Treat this as partially implemented rather than fully shipped.

### Demo data seeding workflow
- A settings action exists and populates in-memory demo data.
- The current handler does not run the normal `save()` and `render()` cycle.
- Treat this as present but not fully operationally finished.

### Subscription status model
- Migration recognizes a `due` status value.
- The current create/edit UI exposes only `active`, `paused`, and `canceled`.
- This suggests a partially evolved status model.

### Transaction account affordances around credit cards
- Expense account options can display credit cards.
- Save validation rejects income and expense posting to credit cards.
- The domain model is clearer than the current form affordance.

## Future Ideas
These are not implemented today. They are reasonable next directions based on the current product shape.

### Internationalization and localization
- Promote English to the default application language.
- Replace development-phase Indonesian UI copy with a localization-ready string strategy.
- Add localization support for Indonesian, Japanese, Korean, and other languages.
- Review layouts for translation length, alternate scripts, and locale-specific formatting.

### Currency capabilities
- Let users choose a primary currency.
- Support additional currencies in the same application.
- Add a future model for multi-currency accounts, balances, and transactions.
- Introduce exchange-rate handling as a separate future finance capability.

### Product depth
- Dedicated credit-card purchase workflow distinct from ordinary debt entry.
- Better recurring-payment handling for subscriptions.
- More detailed analytics and trend views.
- Filtered history views by account, category, debt, receivable, or subscription.

### UX completion
- Fully surfaced subscription member management from subscription cards.
- More explicit guidance when a visible form option is blocked by domain rules.
- Stronger empty states and onboarding for first-time users.

### Data reliability
- Backup schema versioning.
- More explicit import validation and recovery messaging.
- Safer ID generation strategy than timestamp-plus-random.

### Architecture evolution
- Modularization of the monolithic JavaScript file.
- Separation of domain logic from rendering logic.
- Optional automated tests around balance and reversal invariants.

### Platform expansion
- Optional cloud sync.
- Multi-device continuity.
- Packaging as a PWA or installable offline app.

## Assumptions
- Items in the in-progress section are inferred from the current codebase and UI structure, not from an external product plan.
- The future ideas section is intentionally conservative and derived from existing product direction, not from speculative new business lines.
