# Moon Ledger Project Overview

## Summary
Moon Ledger is a local-first personal finance web application built as a single-page app with plain HTML, CSS, and JavaScript. The current product focuses on day-to-day money tracking for an individual user who needs to manage cash accounts, credit-card-backed liabilities, receivables, subscriptions, and simple category-based transaction history without relying on a backend service.

The UI currently identifies itself as `v11.0` and emphasizes offline readiness. All primary data is stored in the browser through `localStorage`.

## Current Development Environment
The current implementation reflects the context of active development rather than the intended long-term market:

- Many labels, form messages, and alerts are currently written in Indonesian.
- Monetary formatting currently centers on Indonesian Rupiah.
- The existing wording reflects the current developer environment, not a permanent market or localization decision.

These should be treated as temporary implementation characteristics.

## Long-term Product Vision
Moon Ledger is intended to become an international personal finance application rather than an Indonesia-specific one.

- English is expected to become the primary product language.
- Future versions should support localization for Indonesian, Japanese, Korean, and other languages.
- The product should eventually support a user-selected primary currency and additional currencies.
- Future exchange-rate handling is a roadmap concern, not a current feature.

## Current Product Scope
The implemented product includes these functional areas:

- Dashboard with net worth, financial overview, attention alerts, and recent transactions.
- Accounts management for bank, e-wallet, cash, and credit card accounts.
- Transactions management for income, expense, transfer, debt payment, and receivable collection.
- Debts management, including regular debt and credit-card installment style debt.
- Receivables management, including ordinary receivables and subscription-sharing receivables.
- Subscriptions management for personal and shared recurring services.
- Settings for category management, JSON backup export/import, demo data seeding, and full data deletion.

## Product Positioning
Moon Ledger is currently optimized for:

- Single-user usage on one browser/device.
- Manual entry rather than bank sync or automation.
- Explicit financial control rather than passive analytics.
- Operational clarity over high abstraction.

The long-term vision expands that positioning from a private developer-led finance tool into a universal personal finance product that can be used internationally.

This produces a product that feels closer to a private financial operations console than a consumer budgeting app.

## Key Domain Concepts
The application treats finances as a small ledger with six core collections:

- `accounts`: liquid accounts and credit cards.
- `transactions`: activity records that can still be edited or deleted.
- `debts`: outstanding liabilities with optional installment structure.
- `receivables`: money owed to the user.
- `categories`: labels for income, expense, and general categorization.
- `subscriptions`: recurring services, optionally with cost-sharing members.

The important product choice is that credit cards are modeled as liability capacity, not as cash. That decision drives several business rules documented elsewhere.

## Operating Model
### Persistence
- Data is loaded from `localStorage` during startup.
- A migration pass normalizes persisted objects and backfills defaults.
- A save cycle persists the in-memory database and re-renders the UI.

### Runtime
- The app keeps a single in-memory `DB` object.
- UI state is largely modal/editing state stored in global variables.
- Rendering is imperative and centralized rather than component-driven.

### Deployment
- No build step is required.
- The app can run directly from static files in a browser.
- No server API, authentication, or remote sync exists in the current implementation.

## Language And Currency Strategy
### Current implementation
- The UI contains a mix of English structure and Indonesian operational text.
- Currency display currently uses Rupiah-focused formatting.

### Long-term direction
- English should become the default application language.
- Localization should be treated as a first-class future capability.
- Currency handling should remain architecturally flexible enough to support multi-currency usage in the future.
- Users should eventually be able to select a primary currency, add secondary currencies, and operate across multiple currencies within the same application.

## User Experience Character
The current experience is shaped by a few recurring patterns:

- One main page shell with module-like sections.
- Modal-based create and edit flows.
- Fast entry through a global floating action button.
- Strong visual emphasis on net worth and obligation tracking.
- A dark design system with gold accents and high information contrast.

## What The App Does Not Currently Do
The current implementation does not provide:

- Multi-user collaboration.
- Cloud backup or cross-device sync.
- Authentication or role separation.
- Automatic recurring transaction generation.
- External integrations with banks, cards, or subscription providers.
- True double-entry bookkeeping.

## Assumptions
The following statements are inferred from the implementation and should be treated as assumptions until the product owner confirms them:

- The product is intended to remain lightweight and self-hostable, which likely explains the static-file architecture.
- The app favors safe financial state transitions over free-form editing, which is why many edits and deletions are blocked after money movement has started.
- The current Indonesian text and Rupiah-centric formatting reflect the present development environment, not the intended long-term audience.
- The long-term audience is international, with English as the expected default language and localization as a planned product capability.
