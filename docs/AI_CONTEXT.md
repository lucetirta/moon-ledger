# Moon Ledger AI Context

## Project Summary
Moon Ledger is a local-first personal finance application for helping a user understand and manage their own finances. It focuses on balances, debts, receivables, subscriptions, and transaction history in a way that stays operational, explicit, and trustworthy.

The long-term product vision is international. Current Indonesian labels and Rupiah-focused behavior reflect the present development environment only. They should not be treated as permanent product direction.

## Current Development Stage
Moon Ledger is currently a working single-page finance application with its core modules already implemented.

Current status:

- current UI version label: `v11.0`
- core product structure is established
- documentation and principles are now established
- future work should build on the current architecture rather than replace it casually

Major modules completed:

- Accounts
- Transactions
- Debts
- Receivables
- Subscriptions
- Dashboard
- Settings

Modules or areas currently being refined:

- subscription member management after creation
- some transaction affordances around credit cards
- demo data seeding workflow
- long-term localization and multi-currency readiness

## Technology Stack
Moon Ledger is built as a static web application using:

- HTML
- CSS
- plain JavaScript
- browser `localStorage` for persistence

There is currently no backend, no framework, and no build pipeline.

## Architecture Summary
Moon Ledger is a single-page application with one main runtime file and a local-first data model.

- `index.html` defines the application shell, pages, and modals.
- `css/style.css` defines the design system and page styling.
- `js/app.js` contains persistence, business logic, state changes, rendering, and UI event wiring.

Data flow summary:

- data loads from `localStorage`
- data is normalized on startup
- business rules mutate an in-memory database
- `save()` persists state and triggers re-rendering

Business logic currently lives primarily in the JavaScript domain helpers and action handlers. UI logic also lives in the same file, mostly through modal flows, page activation, and centralized rendering. This coupling is a current architectural constraint and should be handled carefully.

## Core Modules
### Accounts
Accounts represent the user's liquid money and credit capacity. Liquid accounts track balances, while credit cards track limit and used amount. Accounts are foundational because nearly every other module depends on them for financial state.

### Transactions
Transactions are the activity log for income, expense, transfer, debt payment, and receivable collection. They are central to how financial state changes over time. Editing and deletion are sensitive because transactions affect balances and linked entities.

### Debts
Debts track money the user owes, including regular liabilities and credit-card-related obligations. They support remaining balance tracking, installment-related metadata, and payment history.

### Receivables
Receivables track money owed to the user. They support both regular receivables and subscription-sharing receivables, and they connect incoming money to the user's overall net position.

### Subscriptions
Subscriptions model recurring financial commitments. They can be personal or shared, and shared subscriptions can generate receivables tied to member contributions. This module is where recurring obligations and shared-cost logic meet.

### Dashboard
The Dashboard is a summary surface. It presents net worth, financial overview, recent activity, and attention items. It should summarize domain state, not define independent business logic.

### Settings
Settings contains support functionality such as category management, import/export, data reset, and demo data actions. It is operational infrastructure for the product rather than a primary finance module.

## Core Business Rules
Only the highest-priority rules should be assumed without further reading:

- Financial consistency is more important than UI flexibility.
- Credit cards are not ordinary cash accounts.
- Net worth is summary-driven and should remain derived from core financial state.
- Transactions that affect balances must be handled carefully when edited or deleted.
- Once money movement has started, destructive edits often become restricted to preserve trust.
- Shared subscriptions, receivables, and debt-linked flows are connected entities and should never be changed in isolation without verifying the financial consequences.

For detailed rules, read the finance and business-rules documentation before changing behavior.

## Product Principles
The most important product principles are:

- Moon Ledger is centered on the user's own finances.
- Supporting entities must clarify the user's financial situation, not compete with it.
- Financial logic must remain authoritative and should never be duplicated casually.
- The Dashboard is a summary layer, not a second finance engine.
- Information presentation should come before action clutter.
- Global creation should stay centralized through the FAB where appropriate.
- The product should evolve toward international localization and multi-currency support.
- Simplicity, clarity, trustworthiness, maintainability, and consistency matter more than feature count.

When in doubt, consult [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md) before implementing changes.

## UX Philosophy
Moon Ledger is an information-first product with fast operational workflows.

- users should quickly understand their financial position
- create/edit flows should be efficient but secondary to understanding
- repeated actions should be minimized
- unnecessary scrolling and unnecessary input should be reduced
- the interface should remain calm, dense where useful, and trustworthy

The FAB is the primary global creation entry point. Context-specific actions should remain near the data they affect.

## Current Technical Constraints
The most important current constraints are:

- business logic and UI logic are still largely coupled inside one JavaScript file
- rendering is centralized and imperative
- persistence depends on `localStorage` compatibility
- existing user data should remain backward compatible whenever practical
- current text and currency handling are not yet localization-ready
- the architecture is intentionally simple and should not be rewritten without strong justification

These constraints should shape how changes are introduced.

## Current Known Issues
Keep this section short and high signal:

- subscription member management exists in code but is not fully surfaced in the UI after initial creation
- some transaction UI affordances expose options that business rules later reject
- demo data seeding exists but is not fully integrated into the standard save/render workflow

Read [docs/roadmap.md](docs/roadmap.md) before treating any partially surfaced behavior as fully shipped.

## Development Workflow
Preferred workflow for future AI sessions or developers:

1. Understand the task.
2. Read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md).
3. Read [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md).
4. Read only the relevant detailed documentation for the module being changed.
5. Make the smallest change that solves the real problem.
6. Validate behavior and regression-check existing functionality.
7. Confirm that product and finance principles were preserved.

If the task changes financial behavior, review the detailed finance docs before editing code.

## Documentation Map
Use the documentation hierarchy intentionally:

- Architecture: [docs/architecture.md](docs/architecture.md)
- Business Rules: [docs/business-rules.md](docs/business-rules.md)
- Finance Engine: [docs/finance-engine.md](docs/finance-engine.md)
- UX Principles: [docs/ux-principles.md](docs/ux-principles.md)
- UI Design System: [docs/ui-design-system.md](docs/ui-design-system.md)
- Coding Guidance: [docs/coding-guidelines.md](docs/coding-guidelines.md)
- Product Overview: [docs/project-overview.md](docs/project-overview.md)
- Product Direction: [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md)
- Detailed Product Principles: [docs/product-principles.md](docs/product-principles.md)
- Roadmap: [docs/roadmap.md](docs/roadmap.md)

## Recommended Documentation Hierarchy For Future AI Sessions
Future AI sessions should usually follow this order:

1. Read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md).
2. Read [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md).
3. Read only the detailed documents relevant to the current task.
4. Then begin implementation or analysis.

This keeps context usage efficient while preserving product and engineering consistency.