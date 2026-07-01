# Moon Ledger Architecture

## Architectural Style
Moon Ledger is a static, local-first single-page application. It uses no framework, no module bundler, and no backend. The architecture is intentionally simple:

- `index.html` defines all application surfaces and modal containers.
- `css/style.css` contains the full design system and page styling.
- `js/app.js` owns persistence, domain rules, state transitions, rendering, and UI event wiring.

This is a pragmatic architecture for a private finance tool that needs to be easy to run, easy to back up, and easy to reason about in one repository.

The long-term product direction, however, is international rather than local-market-specific. Future architectural changes should preserve the current simplicity while keeping room for localization and multi-currency support.

## Repository Layout
- `index.html`: full page shell, page sections, forms, and modals.
- `css/style.css`: tokens, layout, components, responsive rules.
- `js/app.js`: data model, migration, finance logic, CRUD handlers, rendering, modal orchestration.
- `docs/`: project knowledge base added for future engineering continuity.

## Runtime Layers
Even though all logic sits in one JavaScript file, the runtime naturally separates into layers.

### 1. Persistence Layer
Responsibilities:

- Load arrays from `localStorage`.
- Normalize data through `migrate()`.
- Persist the `DB` object through `persist()`.

Key design effect:
The app behaves like a local embedded database without introducing external infrastructure.

### 2. Domain Layer
Responsibilities:

- Validate business invariants.
- Mutate account balances and credit usage.
- Manage linked entities such as debt-linked receivables and subscription-linked receivables.
- Reverse prior financial effects before editing or deleting transactions.
- Keep future extensions such as multi-currency support implementable without rewriting core ledger concepts.

Important domain helpers include:

- `adjustAccountBalance()`
- `adjustCreditUsed()`
- `reserveSubscriptionCredit()`
- `ensureSubscriptionReceivable()`
- `reverseTransaction()`

### 3. UI State Layer
Responsibilities:

- Track the active page.
- Track which entity is currently being edited.
- Reset and synchronize modal forms.
- Handle floating action button behavior.

This state is stored in top-level mutable variables rather than in components or classes.

### 4. Rendering Layer
Responsibilities:

- Compute dashboard metrics.
- Rebuild list views and select options.
- Reflect current state in all visible pages.

`render()` is the central projection function from the in-memory ledger to the DOM.

## Data Model
### Accounts
An account represents either liquid funds or credit capacity.

- Liquid accounts: `Bank`, `E-Wallet`, `Cash`
- Credit accounts: `Credit Card`

Shared fields:

- `id`
- `name`
- `type`

Liquid-account fields:

- `balance`

Credit-card fields:

- `creditLimit`
- `usedLimit`

### Transactions
Transactions are the event history of the ledger.

Supported types:

- `income`
- `expense`
- `transfer`
- `debt_payment`
- `receivable_payment`

Depending on type, a transaction may carry:

- `accountId`
- `fromId`
- `toId`
- `debtId`
- `receivableId`
- `creditCardId`
- `subscriptionId`
- `memberId`

### Debts
Debts model outstanding liabilities.

- `type`: `regular` or `credit_card`
- `total`
- `remaining`
- `tenor`
- `dueDay`
- `categoryId` and `category`
- optional `creditCardId`
- optional `borrower`
- optional `owner`
- optional `receivableId`
- `paymentHistory`

The debt model is deliberately richer than a simple balance field because it supports payment history and cross-linking into receivables.

### Receivables
Receivables model money owed to the user.

- `type`: `regular` or `subscription_sharing`
- `total`
- `remaining`
- optional `subscriptionId`
- optional `debtId`
- `source`
- `collectionHistory`

### Subscriptions
Subscriptions model recurring obligations and optional cost sharing.

- `name`
- `categoryId` and `category`
- `cycle`: `monthly` or `yearly`
- `renewalDate`
- `totalCost`
- optional `accountId`
- `status`
- `subscriptionCategory`: `personal` or `sharing`
- optional `maxMembers`
- `members`
- optional `receivableId`
- optional `creditCardId`
- `paymentHistory`

### Categories
Categories classify money movement.

- `all`
- `income`
- `expense`

The `all` category type acts as a reusable general-purpose label that can appear across flows.

## Internationalization And Currency Extensibility
### Current implementation
- Text strings are embedded directly in HTML and JavaScript.
- Currency formatting is currently specialized around Rupiah display through a dedicated helper.

### Long-term direction
- English should become the default product language.
- Text should eventually move toward localization-friendly structures rather than hard-coded per-view strings.
- Financial storage and rendering should evolve in a way that can support a primary user currency plus additional currencies.
- Exchange-rate logic is not part of the current architecture and should be treated as future roadmap work.

## Control Flow
The main application flow is:

1. Load raw lists from `localStorage`.
2. Run migration/normalization.
3. Attach UI listeners.
4. Activate the dashboard.
5. Render the full interface.
6. On any mutation, call `save()` to persist and re-render.

This is effectively a write-through architecture: business mutations are applied to in-memory state, then persisted immediately.

## Why This Architecture Works Here
This approach is appropriate for the current product stage because it provides:

- Zero operational overhead.
- Easy inspection and debugging.
- Low barrier for future AI or human contributors.
- Strong determinism because all state lives in one runtime.

## Architectural Constraints
Future contributors should understand the current tradeoffs:

- Business logic and UI logic are tightly coupled inside one file.
- Rendering is full-view string generation, not partial component updates.
- Entity relationships are maintained by convention rather than schema enforcement.
- Data integrity relies on handler ordering and guard clauses.

These constraints are acceptable now, but they increase the importance of preserving invariants when adding features.

## Assumptions
- The single-file JavaScript architecture appears intentional for simplicity rather than accidental neglect.
- The product seems optimized for portability and offline usage over long-term modularity.
- The absence of external dependencies suggests maintainability by non-specialists may be a goal.
- The current Indonesian wording is a temporary development artifact, not evidence of an Indonesia-only product strategy.
